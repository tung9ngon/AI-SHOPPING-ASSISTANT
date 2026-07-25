import { useEffect, useState } from 'react';
import {
  App,
  Alert,
  Button,
  Card,
  Empty,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  DeleteOutlined,
  PictureOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { priceAlertApi, type PriceAlertItem } from '../../api/priceAlerts';
import { getErrorMessage } from '../../api/client';
import { formatVND } from '../../utils/format';

const { Title, Text } = Typography;

const CHANNEL_LABEL: Record<string, string> = {
  email: 'Email',
  app: 'Trong ứng dụng',
  sms: 'SMS',
};

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  active: { color: 'blue', label: 'Đang theo dõi' },
  triggered: { color: 'green', label: 'Đã đạt giá' },
};

export default function PriceAlertsPage() {
  const { message } = App.useApp();
  const [items, setItems] = useState<PriceAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    priceAlertApi
      .list()
      .then((res) => {
        // BE trả cả 'cancelled' -> chỉ hiện alert còn hiệu lực.
        setItems((res.data ?? []).filter((a) => a.status !== 'cancelled'));
      })
      .catch((err) => message.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await priceAlertApi.remove(id);
      message.success('Đã huỷ theo dõi giá');
      load();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        <BellOutlined /> Theo dõi giá
      </Title>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Bạn sẽ được thông báo khi giá sản phẩm giảm xuống bằng hoặc thấp hơn mức mong muốn. Tạo theo dõi mới từ trang chi tiết sản phẩm."
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : items.length === 0 ? (
        <Card>
          <Empty description="Bạn chưa theo dõi giá sản phẩm nào">
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Khám phá sản phẩm
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {items.map((a) => {
            const current = Number(a.product.price);
            const target = Number(a.target_price);
            const reached = current <= target;
            const st = STATUS_TAG[a.status] ?? STATUS_TAG.active;
            return (
              <Card key={a.id} styles={{ body: { padding: 16 } }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link to={`/products/${a.product.id}`}>
                    {a.product.image ? (
                      <img
                        src={a.product.image}
                        alt=""
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 8,
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#bbb',
                          fontSize: 24,
                        }}
                      >
                        <PictureOutlined />
                      </div>
                    )}
                  </Link>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Link
                      to={`/products/${a.product.id}`}
                      style={{ fontWeight: 600, color: 'inherit' }}
                    >
                      {a.product.name}
                    </Link>
                    <div style={{ marginTop: 6 }}>
                      <Space size="large" wrap>
                        <span>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Giá hiện tại
                          </Text>
                          <div style={{ fontWeight: 600 }}>{formatVND(current)}</div>
                        </span>
                        <span>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Giá mong muốn
                          </Text>
                          <div style={{ fontWeight: 600, color: '#ff6a00' }}>
                            {formatVND(target)}
                          </div>
                        </span>
                      </Space>
                    </div>
                    <Space size={6} style={{ marginTop: 8 }} wrap>
                      <Tag color={st.color}>{st.label}</Tag>
                      {reached && a.status === 'active' && (
                        <Tag color="green">Đã đạt giá mong muốn 🎉</Tag>
                      )}
                      <Tag>{CHANNEL_LABEL[a.notify_channel] ?? a.notify_channel}</Tag>
                    </Space>
                  </div>

                  <Popconfirm
                    title="Huỷ theo dõi giá này?"
                    okText="Huỷ"
                    cancelText="Không"
                    onConfirm={() => remove(a.id)}
                  >
                    <Button danger icon={<DeleteOutlined />} loading={busyId === a.id}>
                      Huỷ
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            );
          })}
        </Space>
      )}
    </div>
  );
}
