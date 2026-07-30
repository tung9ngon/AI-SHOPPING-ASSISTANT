import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentApi } from '../../api/payments';
import { PAYOS_PENDING_PAYMENT_KEY } from './PayosQrModal';

// PayOS redirect về đây (returnUrl/cancelUrl = /payment/payos-callback) kèm query:
// ?code=00&id=...&cancel=false&status=PAID&orderCode=...
// Query string này do PayOS tự thêm (không phải BE) và HOÀN TOÀN CÓ THỂ BỊ GIẢ MẠO
// bằng cách gõ tay URL. Vì vậy KHÔNG BAO GIỜ tin query string để khẳng định thành công.
// Nguồn sự thật duy nhất là GET /payments/:id/status (BE). Payment id được lưu trước
// khi mở link PayOS (xem PayosQrModal) — dùng localStorage để bền qua việc PayOS mở
// tab mới rồi redirect về. Không xác minh được với BE -> coi như CHƯA hoàn tất (an toàn).
export default function PayosCallbackPage() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const cancel = params.get('cancel');

  const [verifying, setVerifying] = useState(false);
  // null = chưa/không xác minh được với BE, true/false = kết quả thật từ BE
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const paymentId = localStorage.getItem(PAYOS_PENDING_PAYMENT_KEY);
    if (!paymentId) return;
    localStorage.removeItem(PAYOS_PENDING_PAYMENT_KEY);

    // Người dùng bấm huỷ trên cổng PayOS: không cần xác minh, hiện luôn "đã huỷ".
    if (cancel === 'true' || status === 'CANCELLED') return;

    // Redirect từ PayOS thường về TRƯỚC khi webhook cập nhật BE, nên nếu hỏi status
    // một lần thường thấy 'pending'. Poll vài lần (tối đa ~20s) để bắt được lúc BE
    // xác nhận 'success'/'failed'. Nguồn sự thật vẫn là GET /payments/:id/status.
    const POLL_INTERVAL_MS = 2000;
    const MAX_ATTEMPTS = 10;
    let attempts = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    setVerifying(true);

    const poll = async () => {
      attempts += 1;
      try {
        const res = await paymentApi.status(paymentId);
        if (cancelled) return;
        const s = res.data.status;
        if (s === 'success') {
          setVerifiedSuccess(true);
          setVerifying(false);
          return;
        }
        if (s === 'failed' || s === 'refunded') {
          setVerifiedSuccess(false);
          setVerifying(false);
          return;
        }
      } catch {
        // Lỗi tạm thời khi hỏi trạng thái -> thử lại ở lần poll kế tiếp.
      }
      if (cancelled) return;
      if (attempts >= MAX_ATTEMPTS) {
        // Hết số lần thử mà vẫn pending: coi như chưa xác minh được (an toàn).
        setVerifiedSuccess((prev) => (prev === true ? true : null));
        setVerifying(false);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [cancel, status]);

  if (verifying) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Đang xác nhận thanh toán..." />
      </div>
    );
  }

  // CHỈ hiện thành công khi BE xác nhận thật (verifiedSuccess === true).
  // Query string không bao giờ được dùng để suy ra thành công.
  const isSuccess = verifiedSuccess === true;
  const isCancelled =
    !isSuccess && (cancel === 'true' || status === 'CANCELLED');

  if (isSuccess) {
    return (
      <Result
        status="success"
        title="Thanh toán thành công!"
        subTitle="Cảm ơn bạn đã mua sắm. Đơn hàng đã được thanh toán."
        extra={[
          <Link to="/orders" key="orders">
            <Button type="primary">Xem đơn hàng của tôi</Button>
          </Link>,
          <Link to="/products" key="shop">
            <Button>Tiếp tục mua sắm</Button>
          </Link>,
        ]}
      />
    );
  }

  return (
    <Result
      status={isCancelled ? 'warning' : 'info'}
      title={isCancelled ? 'Đã huỷ thanh toán' : 'Thanh toán chưa hoàn tất'}
      subTitle={
        isCancelled
          ? 'Bạn đã huỷ giao dịch. Đơn hàng vẫn ở trạng thái chờ thanh toán trong mục Đơn hàng của tôi.'
          : 'Nếu bạn đã thanh toán, trạng thái sẽ được cập nhật trong giây lát.'
      }
      extra={
        <Link to="/orders">
          <Button type="primary">Về Đơn hàng của tôi</Button>
        </Link>
      }
    />
  );
}
