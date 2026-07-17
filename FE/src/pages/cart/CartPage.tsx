import { useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  InputNumber,
  Popconfirm,
  Row,
  Skeleton,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  PictureOutlined,
  ShoppingOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { getErrorMessage } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/format';

const { Title, Text } = Typography;

export default function CartPage() {
  const { cart, loading, refresh, itemCount } = useCart();
  const { message } = App.useApp();
  const navigate = useNavigate();

  // id của cart_item đang được cập nhật/xoá -> khoá control dòng đó.
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeQty = async (itemId: string, quantity: number) => {
    setBusyId(itemId);
    try {
      await cartApi.updateItem(itemId, quantity);
      await refresh();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await cartApi.removeItem(itemId);
      await refresh();
      message.success('Đã xoá sản phẩm khỏi giỏ');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !cart) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Giỏ hàng của bạn đang trống"
        >
          <Link to="/products">
            <Button type="primary" icon={<ShoppingOutlined />}>
              Tiếp tục mua sắm
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  const subtotal = Number(cart?.subtotal ?? 0);

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Giỏ hàng <Text type="secondary" style={{ fontSize: 16 }}>({itemCount} sản phẩm)</Text>
      </Title>

      <Row gutter={[24, 24]}>
        {/* ===== Danh sách sản phẩm ===== */}
        <Col xs={24} lg={16}>
          <Card styles={{ body: { padding: 0 } }}>
            {items.map((item, idx) => {
              const price = Number(item.product.price);
              const busy = busyId === item.id;
              return (
                <div key={item.id}>
                  {idx > 0 && <Divider style={{ margin: 0 }} />}
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: 16,
                      alignItems: 'center',
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    {/* Ảnh */}
                    <Link to={`/products/${item.product.id}`}>
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#bbb',
                            fontSize: 28,
                          }}
                        >
                          <PictureOutlined />
                        </div>
                      )}
                    </Link>

                    {/* Tên + đơn giá */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/products/${item.product.id}`}
                        style={{ fontWeight: 600, color: 'inherit' }}
                      >
                        {item.product.name}
                      </Link>
                      <div style={{ color: '#888', marginTop: 4 }}>{formatVND(price)}</div>
                    </div>

                    {/* Số lượng */}
                    <InputNumber
                      min={1}
                      precision={0}
                      value={item.quantity}
                      disabled={busy}
                      onChange={(v) => {
                        const q = Math.max(1, Math.floor(v ?? 1));
                        if (q !== item.quantity) changeQty(item.id, q);
                      }}
                      style={{ width: 90 }}
                    />

                    {/* Thành tiền */}
                    <div style={{ width: 120, textAlign: 'right', fontWeight: 700, color: '#f5222d' }}>
                      {formatVND(price * item.quantity)}
                    </div>

                    {/* Xoá */}
                    <Popconfirm
                      title="Xoá sản phẩm này khỏi giỏ?"
                      okText="Xoá"
                      cancelText="Huỷ"
                      onConfirm={() => removeItem(item.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} disabled={busy} />
                    </Popconfirm>
                  </div>
                </div>
              );
            })}
          </Card>

          <div style={{ marginTop: 16 }}>
            <Link to="/products">
              <Button icon={<ShoppingOutlined />}>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </Col>

        {/* ===== Tóm tắt đơn hàng ===== */}
        <Col xs={24} lg={8}>
          <Card title="Tóm tắt đơn hàng">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text>Tạm tính</Text>
              <Text>{formatVND(subtotal)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text>Phí vận chuyển</Text>
              <Text type="secondary">Tính ở bước thanh toán</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mã giảm giá sẽ được áp dụng ở bước thanh toán.
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>
                Tổng cộng
              </Text>
              <Text strong style={{ fontSize: 20, color: '#f5222d' }}>
                {formatVND(subtotal)}
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              block
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/checkout')}
            >
              Tiến hành thanh toán
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
