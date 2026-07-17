import { useEffect, useRef, useState } from 'react';
import { Modal, QRCode, Typography, Button, Space, Spin, Tag } from 'antd';
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import { paymentApi } from '../../api/payments';
import { formatVND } from '../../utils/format';

const { Text, Paragraph } = Typography;

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
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [checking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = async (silent = true) => {
    if (!silent) setChecking(true);
    try {
      const res = await paymentApi.status(paymentId);
      if (res.data.status === 'success') {
        setStatus('success');
        if (timer.current) clearInterval(timer.current);
        setTimeout(onSuccess, 900); // cho người dùng thấy trạng thái thành công
      } else if (res.data.status === 'failed') {
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
    setStatus('pending');
    // Poll mỗi 3 giây trong lúc modal mở.
    timer.current = setInterval(() => check(true), 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, paymentId]);

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
                    onClick={() => window.open(paymentUrl, '_blank')}
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
