import { Button, Result } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';

// PayOS redirect về đây (returnUrl/cancelUrl = /payment/payos-callback) kèm query:
// ?code=00&id=...&cancel=false&status=PAID&orderCode=...
// Trạng thái thật đã được webhook cập nhật ở BE; trang này chỉ hiển thị kết quả.
export default function PayosCallbackPage() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const status = params.get('status');
  const cancel = params.get('cancel');

  const isSuccess = code === '00' && status === 'PAID';
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
