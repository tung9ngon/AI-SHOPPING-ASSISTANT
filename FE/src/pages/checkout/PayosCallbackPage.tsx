import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentApi } from '../../api/payments';
import { PAYOS_PENDING_PAYMENT_KEY } from './PayosQrModal';

// PayOS redirect về đây (returnUrl/cancelUrl = /payment/payos-callback) kèm query:
// ?code=00&id=...&cancel=false&status=PAID&orderCode=...
// Query string này do PayOS tự thêm (không phải BE), nên có thể bị giả mạo bằng
// cách gõ tay URL. Nếu có payment id đã lưu trước khi mở link PayOS
// (xem PayosQrModal), gọi lại GET /payments/:id/status để xác nhận thật với BE
// thay vì tin thẳng query string.
export default function PayosCallbackPage() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const status = params.get('status');
  const cancel = params.get('cancel');

  const [verifying, setVerifying] = useState(false);
  // null = không xác minh được với BE (không có id đã lưu, hoặc gọi lỗi) -> dùng tạm query string
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const paymentId = sessionStorage.getItem(PAYOS_PENDING_PAYMENT_KEY);
    if (!paymentId) return;
    sessionStorage.removeItem(PAYOS_PENDING_PAYMENT_KEY);
    setVerifying(true);
    paymentApi
      .status(paymentId)
      .then((res) => setVerifiedSuccess(res.data.status === 'success'))
      .catch(() => setVerifiedSuccess(null))
      .finally(() => setVerifying(false));
  }, []);

  if (verifying) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Đang xác nhận thanh toán..." />
      </div>
    );
  }

  const isSuccess = verifiedSuccess ?? (code === '00' && status === 'PAID');
  const isCancelled = cancel === 'true' || status === 'CANCELLED';

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
