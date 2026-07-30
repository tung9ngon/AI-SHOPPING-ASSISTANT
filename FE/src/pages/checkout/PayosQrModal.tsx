import { useEffect, useRef, useState } from 'react';
import { Modal, QRCode, Typography, Button, Space, Spin, Tag } from 'antd';
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import { paymentApi } from '../../api/payments';
import { formatVND } from '../../utils/format';

const { Text, Paragraph } = Typography;

// Key localStorage: lưu payment id trước khi mở link PayOS ngoài trang, để
// /payment/payos-callback đọc lại và gọi GET /payments/:id/status xác nhận thật
// (query string PayOS trả về có thể bị giả mạo). Dùng localStorage thay vì
// sessionStorage vì PayOS mở link ở TAB MỚI rồi redirect về — sessionStorage
// không chia sẻ giữa các tab, còn localStorage thì có.
export const PAYOS_PENDING_PAYMENT_KEY = 'payos_pending_payment_id';

const POLL_INTERVAL_MS = 3000;
const SUCCESS_DELAY_MS = 900; // cho người dùng thấy trạng thái thành công trước khi đóng modal
const MAX_POLL_MS = 15 * 60 * 1000; // dừng poll sau 5 phút để không hỏi trạng thái vô hạn

// Hiển thị mã QR PayOS (VietQR) + tự động kiểm tra trạng thái thanh toán (poll).
// Khi webhook PayOS xác nhận thành công, GET /payments/:id/status trả 'success'.
export default function PayosQrModal({
  open,
  paymentId,
  qrCode,
  paymentUrl,
  amount,
  onSuccess,
  onClose,
}: {
  open: boolean;
  paymentId: string;
  qrCode: string | null;
  paymentUrl: string | null;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'expired'>('pending');
  const [checking, setChecking] = useState(false);
  // Tăng để khởi động lại phiên poll (nút "Tiếp tục chờ" sau khi hết hạn).
  const [pollSession, setPollSession] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Chốt kết quả: đảm bảo onSuccess chỉ chạy ĐÚNG MỘT LẦN dù poll tự động và nút
  // "Kiểm tra ngay" cùng trả 'success' gần như đồng thời (state async không kịp phản ánh).
  const settled = useRef(false);

  const check = async (silent = true) => {
    if (settled.current) return;
    if (!silent) setChecking(true);
    try {
      const res = await paymentApi.status(paymentId);
      if (settled.current) return;
      if (res.data.status === 'success') {
        settled.current = true;
        setStatus('success');
        if (timer.current) clearInterval(timer.current);
        if (successTimeout.current) clearTimeout(successTimeout.current);
        successTimeout.current = setTimeout(onSuccess, SUCCESS_DELAY_MS);
      } else if (res.data.status === 'failed') {
        settled.current = true;
        setStatus('failed');
        if (timer.current) clearInterval(timer.current);
      }
    } catch {
      /* bỏ qua lỗi tạm thời khi poll */
    } finally {
      if (!silent) setChecking(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    settled.current = false;
    setStatus('pending');
    // Poll trong lúc modal mở.
    timer.current = setInterval(() => check(true), POLL_INTERVAL_MS);
    // Sau MAX_POLL_MS mà chưa có kết quả -> dừng poll, coi như QR hết hạn (tránh
    // hỏi trạng thái vô hạn khi người dùng bỏ dở). Có thể bấm "Tiếp tục chờ" để poll lại.
    expireTimeout.current = setTimeout(() => {
      if (settled.current) return;
      if (timer.current) clearInterval(timer.current);
      setStatus('expired');
    }, MAX_POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (successTimeout.current) clearTimeout(successTimeout.current);
      if (expireTimeout.current) clearTimeout(expireTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, paymentId, pollSession]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Thanh toán qua PayOS"
      maskClosable={false}
      width={420}
    >
      <div style={{ textAlign: 'center' }}>
        {status === 'success' ? (
          <div style={{ padding: '24px 0' }}>
            <Tag color="green" style={{ fontSize: 16, padding: '6px 16px' }}>
              ✓ Thanh toán thành công
            </Tag>
          </div>
        ) : status === 'failed' ? (
          <div style={{ padding: '24px 0' }}>
            <Tag color="red" style={{ fontSize: 16, padding: '6px 16px' }}>
              ✗ Thanh toán thất bại
            </Tag>
          </div>
        ) : status === 'expired' ? (
          <div style={{ padding: '24px 0' }}>
            <Tag color="orange" style={{ fontSize: 16, padding: '6px 16px' }}>
              ⌛ Đã dừng kiểm tra tự động
            </Tag>
            <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 16 }}>
              Nếu bạn đã thanh toán, trạng thái vẫn được cập nhật trong mục Đơn hàng của
              tôi. Bạn cũng có thể tiếp tục chờ hoặc kiểm tra lại.
            </Paragraph>
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => setPollSession((n) => n + 1)}
              >
                Tiếp tục chờ
              </Button>
              <Button onClick={onClose}>Đóng</Button>
            </Space>
          </div>
        ) : (
          <>
            <Paragraph type="secondary" style={{ marginBottom: 12 }}>
              Quét mã QR bằng ứng dụng ngân hàng để thanh toán
            </Paragraph>
            {qrCode ? (
              <QRCode value={qrCode} size={220} style={{ margin: '0 auto' }} />
            ) : (
              <Text type="warning">Không lấy được mã QR, vui lòng dùng nút mở trang PayOS.</Text>
            )}
            <div style={{ margin: '16px 0' }}>
              <Text>Số tiền: </Text>
              <Text strong style={{ fontSize: 18, color: '#f5222d' }}>
                {formatVND(amount)}
              </Text>
            </div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Spin size="small" /> <Text type="secondary">Đang chờ thanh toán...</Text>
              </div>
              <Space>
                {paymentUrl && (
                  <Button
                    icon={<ExportOutlined />}
                    onClick={() => {
                      // Lưu lại để trang callback xác nhận thật với BE sau khi PayOS redirect về.
                      localStorage.setItem(PAYOS_PENDING_PAYMENT_KEY, paymentId);
                      window.open(paymentUrl, '_blank');
                    }}
                  >
                    Mở trang PayOS
                  </Button>
                )}
                <Button
                  icon={<ReloadOutlined />}
                  loading={checking}
                  onClick={() => check(false)}
                >
                  Kiểm tra ngay
                </Button>
              </Space>
            </Space>
          </>
        )}
      </div>
    </Modal>
  );
}
