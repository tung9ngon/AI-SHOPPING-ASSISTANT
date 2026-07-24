import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Popconfirm,
  Result,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import { HomeOutlined, PictureOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderApi, type OrderDetail } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import {
  formatVND,
  formatDate,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from '../../utils/format';
import type { OrderStatus } from '../../types';

const { Title, Text, Paragraph } = Typography;

// Chỉ huỷ được khi đơn chưa xử lý (khớp CANCELABLE_STATUSES của BE)
const CANCELABLE: OrderStatus[] = ['pending', 'simulated_success'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    orderApi
      .detail(id)
      .then((res) => setOrder(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo({ top: 0 });
  }, [load]);

  const cancelOrder = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await orderApi.cancel(id);
      message.success('Đã huỷ đơn hàng');
      load();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  if (notFound || !order) {
    return (
      <Result
        status="404"
        title="Không tìm thấy đơn hàng"
        extra={
          <Button type="primary" onClick={() => navigate('/orders')}>
            Về danh sách đơn hàng
          </Button>
        }
      />
    );
  }

  const canCancel = CANCELABLE.includes(order.status);

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: <Link to="/orders">Đơn hàng của tôi</Link> },
          { title: `Đơn #${order.id.slice(0, 8).toUpperCase()}` },
        ]}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Space wrap>
          <Title level={4} style={{ margin: 0 }}>
            Đơn #{order.id.slice(0, 8).toUpperCase()}
          </Title>
          <Tag color={ORDER_STATUS_COLOR[order.status]}>
            {ORDER_STATUS_LABEL[order.status] ?? order.status}
          </Tag>
        </Space>
        {canCancel && (
          <Popconfirm
            title="Huỷ đơn hàng này?"
            description="Thao tác không thể hoàn tác."
            okText="Huỷ đơn"
            cancelText="Không"
            onConfirm={cancelOrder}
          >
            <Button danger loading={cancelling}>
              Huỷ đơn hàng
            </Button>
          </Popconfirm>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* ===== Sản phẩm ===== */}
        <Col xs={24} lg={15}>
          <Card title="Sản phẩm" styles={{ body: { padding: 0 } }}>
            {order.items.map((item, idx) => (
              <div key={item.product.id + idx}>
                {idx > 0 && <Divider style={{ margin: 0 }} />}
                <div style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt=""
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#bbb',
                        fontSize: 22,
                      }}
                    >
                      <PictureOutlined />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={`/products/${item.product.id}`}
                      style={{ fontWeight: 600, color: 'inherit' }}
                    >
                      {item.product.name}
                    </Link>
                    <div style={{ color: '#888', marginTop: 4 }}>
                      {formatVND(Number(item.product.price))} × {item.quantity}
                    </div>
                  </div>
                  <Text strong>
                    {formatVND(Number(item.product.price) * item.quantity)}
                  </Text>
                </div>
              </div>
            ))}
          </Card>

          {(order.recipient_name || order.shipping_address) && (
            <Card title="Người nhận" style={{ marginTop: 16 }}>
              <Space direction="vertical" size={2}>
                <Text strong>
                  {order.recipient_name} {order.recipient_phone ? `· ${order.recipient_phone}` : ''}
                </Text>
                <Text type="secondary">{order.shipping_address}</Text>
              </Space>
            </Card>
          )}

          {order.note && (
            <Card title="Ghi chú" style={{ marginTop: 16 }}>
              <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                {order.note}
              </Paragraph>
            </Card>
          )}
        </Col>

        {/* ===== Tóm tắt ===== */}
        <Col xs={24} lg={9}>
          <Card title="Tóm tắt thanh toán">
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Tạm tính</Text>
              <Text>{formatVND(Number(order.subtotal))}</Text>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>Phí vận chuyển</Text>
              <Text>
                {Number(order.shipping_fee) === 0
                  ? 'Miễn phí'
                  : formatVND(Number(order.shipping_fee))}
              </Text>
            </Row>
            {Number(order.discount_amount) > 0 && (
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text>Giảm giá</Text>
                <Text style={{ color: '#52c41a' }}>
                  -{formatVND(Number(order.discount_amount))}
                </Text>
              </Row>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <Row justify="space-between" align="middle">
              <Text strong style={{ fontSize: 16 }}>
                Tổng cộng
              </Text>
              <Text strong style={{ fontSize: 20, color: '#f5222d' }}>
                {formatVND(Number(order.total))}
              </Text>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Ngày đặt: {formatDate(order.created_at)}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
