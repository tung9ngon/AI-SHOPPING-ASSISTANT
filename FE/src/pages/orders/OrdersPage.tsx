import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Pagination,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import { RightOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { orderApi, type OrderListItem } from '../../api/orders';
import type { OrderStatus } from '../../types';
import {
  formatVND,
  formatDate,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from '../../utils/format';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

const FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã thanh toán', value: 'paid' },
  { label: 'Đang giao', value: 'shipped' },
  { label: 'Đã huỷ', value: 'cancelled' },
];

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderApi
      .list({
        status: status === 'all' ? undefined : status,
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Đơn hàng của tôi
      </Title>

      <Segmented
        options={FILTERS}
        value={status}
        onChange={(v) => {
          setStatus(v as OrderStatus | 'all');
          setPage(1);
        }}
        style={{ marginBottom: 16 }}
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : items.length === 0 ? (
        <Card>
          <Empty description="Chưa có đơn hàng nào">
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Mua sắm ngay
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {items.map((o) => (
              <Link to={`/orders/${o.id}`} key={o.id}>
                <Card hoverable styles={{ body: { padding: 16 } }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <Space wrap>
                        <Text strong>Đơn #{o.id.slice(0, 8).toUpperCase()}</Text>
                        <Tag color={ORDER_STATUS_COLOR[o.status]}>
                          {ORDER_STATUS_LABEL[o.status] ?? o.status}
                        </Tag>
                      </Space>
                      <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                        {formatDate(o.created_at)} · {o.item_count} sản phẩm
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f5222d', fontWeight: 700, fontSize: 16 }}>
                        {formatVND(o.total)}
                      </div>
                    </div>
                    <RightOutlined style={{ color: '#bbb' }} />
                  </div>
                </Card>
              </Link>
            ))}
          </Space>
          {total > PAGE_SIZE && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
