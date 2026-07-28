import { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Descriptions,
  Input,
  Modal,
  Select,
  Skeleton,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { adminOrderApi } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { OrderStatus } from '../../types';
import { formatDate, formatVND, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../utils/format';
import './OrderListPage.css';

const { Text } = Typography;
const PAGE_SIZE = 5;

interface AdminOrderRow {
  id: string;
  user_name: string | null;
  user_email?: string | null;
  product_count: number;
  total: number | string;
  status: OrderStatus;
  created_at: string;
}

interface AdminOrderItem {
  product: {
    id: string;
    name: string;
    price: number | string;
  };
  quantity: number;
}

interface AdminOrderDetail {
  id: string;
  user: {
    full_name: string;
    email: string | null;
    phone_number?: string | null;
  } | null;
  items: AdminOrderItem[];
  subtotal: number | string;
  shipping_fee: number | string;
  discount_amount: number | string;
  total: number | string;
  status: OrderStatus;
  note: string | null;
  payment?: {
    status?: string;
    method?: string;
  } | null;
  created_at: string;
}

const STATUS_OPTIONS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã thanh toán', value: 'paid' },
  { label: 'Đang giao', value: 'shipped' },
  { label: 'Đã huỷ', value: 'cancelled' },
  { label: 'Hoàn tất', value: 'simulated_success' },
];

const SAMPLE_ORDERS: AdminOrderRow[] = [
  {
    id: 'A1B2C3D4',
    user_name: 'Nguyễn Văn A',
    user_email: 'vana@gmail.com',
    product_count: 2,
    total: 64980000,
    status: 'paid',
    created_at: '2026-07-24T10:24:00',
  },
  {
    id: 'E5F6G7H8',
    user_name: 'Trần Thị B',
    user_email: 'tb@gmail.com',
    product_count: 1,
    total: 7990000,
    status: 'pending',
    created_at: '2026-07-24T09:10:00',
  },
  {
    id: 'I9J0K1L2',
    user_name: 'Lê Văn C',
    user_email: 'lvc@gmail.com',
    product_count: 3,
    total: 47280000,
    status: 'shipped',
    created_at: '2026-07-23T16:45:00',
  },
  {
    id: 'M3N4O5P6',
    user_name: 'Phạm Thị D',
    user_email: 'ptd@gmail.com',
    product_count: 1,
    total: 2490000,
    status: 'cancelled',
    created_at: '2026-07-23T11:02:00',
  },
  {
    id: 'Q7R8S9T0',
    user_name: 'Đỗ Văn E',
    user_email: 'dve@gmail.com',
    product_count: 2,
    total: 34480000,
    status: 'paid',
    created_at: '2026-07-22T14:30:00',
  },
];

function shortOrderId(id: string) {
  return `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

function OrderDetailModal({
  orderId,
  open,
  onClose,
  sampleMode,
}: {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  sampleMode: boolean;
}) {
  const { message } = App.useApp();
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !orderId || sampleMode) return;
    let ignore = false;
    setLoading(true);
    adminOrderApi
      .detail(orderId)
      .then((res) => {
        if (!ignore) setDetail(res.data as unknown as AdminOrderDetail);
      })
      .catch((err) => {
        if (!ignore) message.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [message, open, orderId, sampleMode]);

  const sampleDetail = useMemo(
    () => ({
      id: orderId ?? '',
      user: {
        full_name: 'Nguyễn Văn A',
        email: 'vana@gmail.com',
        phone_number: '0901 234 567',
      },
      items: [
        { product: { id: 'p1', name: 'Laptop UltraBook Pro 14 M3', price: 34990000 }, quantity: 1 },
        { product: { id: 'p2', name: 'Chuột không dây MX Master 3S', price: 2490000 }, quantity: 1 },
      ],
      subtotal: 37480000,
      shipping_fee: 0,
      discount_amount: 0,
      total: 37480000,
      status: 'paid' as OrderStatus,
      note: 'Giao giờ hành chính',
      payment: { method: 'payos', status: 'success' },
      created_at: '2026-07-24T10:24:00',
    }) satisfies AdminOrderDetail,
    [orderId],
  );

  const order = sampleMode ? sampleDetail : detail;

  return (
    <Modal
      open={open}
      title={orderId ? `Chi tiết đơn ${shortOrderId(orderId)}` : 'Chi tiết đơn'}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnClose
    >
      {loading && !sampleMode ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : order ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Khách hàng">{order.user?.full_name ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Email">{order.user?.email ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{order.user?.phone_number ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">{formatDate(order.created_at)}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={ORDER_STATUS_COLOR[order.status]}>
                {ORDER_STATUS_LABEL[order.status] ?? order.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">{order.payment?.status ?? '-'}</Descriptions.Item>
          </Descriptions>

          <Table
            rowKey={(item) => item.product.id}
            pagination={false}
            size="small"
            columns={[
              { title: 'Sản phẩm', dataIndex: ['product', 'name'] },
              {
                title: 'SL',
                dataIndex: 'quantity',
                width: 80,
              },
              {
                title: 'Đơn giá',
                dataIndex: ['product', 'price'],
                width: 160,
                render: (value) => formatVND(value),
              },
              {
                title: 'Thành tiền',
                key: 'line_total',
                width: 170,
                render: (_, record) => formatVND(Number(record.product.price) * record.quantity),
              },
            ]}
            dataSource={order.items ?? []}
          />

          <div style={{ marginLeft: 'auto', width: 320, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Tạm tính</Text>
              <Text>{formatVND(order.subtotal)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Phí giao hàng</Text>
              <Text>{formatVND(order.shipping_fee)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Giảm giá</Text>
              <Text>{formatVND(order.discount_amount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <Text strong>Tổng cộng</Text>
              <Text strong>{formatVND(order.total)}</Text>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default function OrderListPage() {
  const { message } = App.useApp();
  const [items, setItems] = useState<AdminOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [fallbackReason, setFallbackReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const isSampleMode = !!fallbackReason;

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit: PAGE_SIZE,
    }),
    [page, search, status],
  );

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminOrderApi.list(query);
      const rows = ((res.data.items ?? res.data.data ?? []) as unknown[]).map((item) => {
        const row = item as Partial<AdminOrderRow> & {
          user_name?: string | null;
          product_count?: number;
          total?: number | string;
          status?: OrderStatus;
          created_at?: string;
        };
        return {
          id: row.id ?? '',
          user_name: row.user_name ?? null,
          user_email: row.user_email ?? null,
          product_count: row.product_count ?? 0,
          total: row.total ?? 0,
          status: row.status ?? 'pending',
          created_at: row.created_at ?? '',
        };
      });
      setItems(rows);
      setTotal(res.data.total ?? rows.length);
      setFallbackReason('');
    } catch (err) {
      const reason = getErrorMessage(err);
      const filtered = SAMPLE_ORDERS.filter((order) => {
        const q = query.search?.toLowerCase();
        const matchesSearch =
          !q ||
          order.id.toLowerCase().includes(q) ||
          order.user_name?.toLowerCase().includes(q) ||
          order.user_email?.toLowerCase().includes(q);
        const matchesStatus = query.status ? order.status === query.status : true;
        return matchesSearch && matchesStatus;
      });
      setItems(filtered);
      setTotal(filtered.length);
      setFallbackReason(reason);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const openDetail = (id: string) => {
    setSelectedOrderId(id);
    setDetailOpen(true);
  };

  const columns: ColumnsType<AdminOrderRow> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      width: 150,
      render: (id: string) => <strong>{shortOrderId(id)}</strong>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="admin-order-name">{record.user_name ?? '-'}</div>
          <div className="admin-order-email">{record.user_email ?? ''}</div>
        </div>
      ),
    },
    {
      title: 'Số SP',
      dataIndex: 'product_count',
      width: 100,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      width: 200,
      render: (value: number | string) => <span className="admin-order-money">{formatVND(value)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 180,
      render: (value: OrderStatus) => (
        <Tag color={ORDER_STATUS_COLOR[value]}>{ORDER_STATUS_LABEL[value] ?? value}</Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      width: 210,
      render: (value: string) => <span className="admin-order-date">{formatDate(value)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => openDetail(record.id)}>
          Xem
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
  };

  return (
    <div className="admin-order-page">
      {fallbackReason && (
        <div className="admin-order-note">Đang hiển thị dữ liệu mẫu: {fallbackReason}</div>
      )}

      <div className="admin-order-toolbar">
        <Input.Search
          allowClear
          placeholder="Tìm theo mã đơn / khách..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="admin-order-search"
        />
        <Select
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          className="admin-order-status"
          options={STATUS_OPTIONS}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        className="admin-order-table"
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          hideOnSinglePage: total <= PAGE_SIZE,
        }}
        onChange={handleTableChange}
      />

      <OrderDetailModal
        orderId={selectedOrderId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        sampleMode={isSampleMode}
      />
    </div>
  );
}
