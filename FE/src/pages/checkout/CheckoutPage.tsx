import { useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Radio,
  Result,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  QrcodeOutlined,
  TagOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import { orderApi } from '../../api/orders';
import { paymentApi } from '../../api/payments';
import { discountApi, type ValidateDiscountResult } from '../../api/discount';
import { getErrorMessage } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/format';
import type { PaymentMethod } from '../../types';
import PayosQrModal from './PayosQrModal';

const { Title, Text, Paragraph } = Typography;

// Khớp logic phí ship của BE (order.service.ts)
const SHIPPING_FEE = 30_000;
const FREE_SHIPPING_THRESHOLD = 500_000;

export default function CheckoutPage() {
  const { cart, initialized, refresh } = useCart();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [note, setNote] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cod');

  const [codeInput, setCodeInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [discount, setDiscount] = useState<ValidateDiscountResult | null>(null);

  const [placing, setPlacing] = useState(false);
  const [doneOrderId, setDoneOrderId] = useState<string | null>(null);

  // Dữ liệu PayOS sau khi tạo thanh toán
  const [payos, setPayos] = useState<{
    paymentId: string;
    qr: string | null;
    url: string | null;
    amount: number;
  } | null>(null);

  const items = cart?.items ?? [];
  const subtotal = Number(cart?.subtotal ?? 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discountAmount = discount?.is_valid ? discount.discount_amount : 0;
  const total = useMemo(
    () => Math.max(0, subtotal + shipping - discountAmount),
    [subtotal, shipping, discountAmount],
  );

  // Chờ giỏ tải xong (tránh redirect sớm khi cart còn null).
  if (!initialized && !doneOrderId && !payos) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  // Giỏ trống mà chưa đặt xong -> quay về giỏ hàng.
  if (items.length === 0 && !doneOrderId && !payos) {
    return <Navigate to="/cart" replace />;
  }

  const applyDiscount = async () => {
    const code = codeInput.trim();
    if (!code) return;
    setApplying(true);
    try {
      const res = await discountApi.validate(code, subtotal);
      if (res.data.is_valid) {
        setDiscount(res.data);
        message.success(`Áp dụng mã "${res.data.code}" thành công`);
      } else {
        setDiscount(null);
        message.error(res.data.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      // 1) Tạo đơn (BE tự tính lại tiền + xoá giỏ)
      const orderRes = await orderApi.create({
        discount_code: discount?.is_valid ? discount.code : undefined,
        note: note.trim() || undefined,
      });
      const orderId = orderRes.data.id;

      // 2) Tạo giao dịch thanh toán
      const payRes = await paymentApi.create(orderId, method);
      await refresh(); // giỏ đã bị BE xoá

      if (method === 'payos') {
        // Mở modal QR để người dùng quét thanh toán
        setPayos({
          paymentId: payRes.data.id,
          qr: payRes.data.qr_code,
          url: payRes.data.payment_url,
          amount: Number(payRes.data.amount),
        });
      } else {
        // COD: đơn đã đặt, chờ giao & thu tiền
        setDoneOrderId(orderId);
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  // ===== Màn thành công =====
  if (doneOrderId) {
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined />}
        title="Đặt hàng thành công!"
        subTitle={
          method === 'cod'
            ? 'Đơn hàng của bạn đang chờ xử lý. Bạn sẽ thanh toán khi nhận hàng (COD).'
            : 'Thanh toán thành công, cảm ơn bạn đã mua sắm!'
        }
        extra={[
          <Link to={`/orders/${doneOrderId}`} key="detail">
            <Button type="primary">Xem đơn hàng</Button>
          </Link>,
          <Link to="/products" key="shop">
            <Button>Tiếp tục mua sắm</Button>
          </Link>,
        ]}
      />
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Thanh toán
      </Title>

      <Row gutter={[24, 24]}>
        {/* ===== Trái: sản phẩm + phương thức ===== */}
        <Col xs={24} lg={15}>
          <Card title="Sản phẩm" styles={{ body: { padding: 0 } }}>
            {items.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && <Divider style={{ margin: 0 }} />}
                <div style={{ display: 'flex', gap: 12, padding: 14, alignItems: 'center' }}>
                  <img
                    src={item.product.image || undefined}
                    alt=""
                    style={{
                      width: 56,
                      height: 56,
                      objectFit: 'cover',
                      borderRadius: 6,
                      background: '#f5f5f5',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                    <Text type="secondary">
                      {formatVND(Number(item.product.price))} × {item.quantity}
                    </Text>
                  </div>
                  <Text strong>{formatVND(Number(item.product.price) * item.quantity)}</Text>
                </div>
              </div>
            ))}
          </Card>

          <Card title="Ghi chú đơn hàng" style={{ marginTop: 16 }}>
            <Input.TextArea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
            />
          </Card>

          <Card title="Phương thức thanh toán" style={{ marginTop: 16 }}>
            <Radio.Group
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="cod" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, width: '100%' }}>
                  <Space>
                    <DollarOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                    <span>
                      <b>Thanh toán khi nhận hàng (COD)</b>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Trả tiền mặt khi nhận sản phẩm
                      </Text>
                    </span>
                  </Space>
                </Radio>
                <Radio value="payos" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, width: '100%' }}>
                  <Space>
                    <QrcodeOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                    <span>
                      <b>Chuyển khoản / QR qua PayOS</b>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Quét mã QR bằng app ngân hàng
                      </Text>
                    </span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Card>
        </Col>

        {/* ===== Phải: tóm tắt ===== */}
        <Col xs={24} lg={9}>
          <Card title="Tóm tắt đơn hàng">
            {/* Mã giảm giá */}
            <div style={{ marginBottom: 16 }}>
              <Text>Mã giảm giá</Text>
              <Space.Compact style={{ width: '100%', marginTop: 6 }}>
                <Input
                  prefix={<TagOutlined />}
                  placeholder="Nhập mã"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onPressEnter={applyDiscount}
                  disabled={!!discount}
                />
                {discount ? (
                  <Button
                    onClick={() => {
                      setDiscount(null);
                      setCodeInput('');
                    }}
                  >
                    Bỏ
                  </Button>
                ) : (
                  <Button type="primary" loading={applying} onClick={applyDiscount}>
                    Áp dụng
                  </Button>
                )}
              </Space.Compact>
              {discount?.is_valid && (
                <Tag color="green" style={{ marginTop: 8 }}>
                  Đã áp dụng {discount.code}: -{formatVND(discount.discount_amount)}
                </Tag>
              )}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Tạm tính</Text>
              <Text>{formatVND(subtotal)}</Text>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Phí vận chuyển</Text>
              <Text>{shipping === 0 ? 'Miễn phí' : formatVND(shipping)}</Text>
            </Row>
            {discountAmount > 0 && (
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text>Giảm giá</Text>
                <Text style={{ color: '#52c41a' }}>-{formatVND(discountAmount)}</Text>
              </Row>
            )}
            {shipping > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Miễn phí vận chuyển cho đơn từ {formatVND(FREE_SHIPPING_THRESHOLD)}
              </Text>
            )}

            <Divider style={{ margin: '12px 0' }} />
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>
                Tổng cộng
              </Text>
              <Text strong style={{ fontSize: 22, color: '#f5222d' }}>
                {formatVND(total)}
              </Text>
            </Row>

            <Button
              type="primary"
              size="large"
              block
              loading={placing}
              onClick={placeOrder}
            >
              {method === 'payos' ? 'Đặt hàng & thanh toán' : 'Đặt hàng'}
            </Button>
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
              Bằng việc đặt hàng, bạn đồng ý với điều khoản mua bán của cửa hàng.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* ===== Modal QR PayOS ===== */}
      {payos && (
        <PayosQrModal
          open={!!payos}
          paymentId={payos.paymentId}
          qrCode={payos.qr}
          paymentUrl={payos.url}
          amount={payos.amount}
          onSuccess={() => {
            message.success('Thanh toán thành công!');
            navigate('/orders');
          }}
          onClose={() => {
            // Đóng QR: đơn vẫn ở trạng thái chờ thanh toán trong "Đơn hàng của tôi".
            setPayos(null);
            message.info('Bạn có thể thanh toán lại trong mục Đơn hàng của tôi.');
            navigate('/orders');
          }}
        />
      )}
    </div>
  );
}
