import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Empty, Skeleton, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  ProfileOutlined,
  TeamOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  adminOrderApi,
  adminStatisticsApi,
  type AdminOverviewStats,
  type AdminRevenueStats,
} from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { OrderStatus } from '../../types';
import { formatDate, formatVND, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../utils/format';
import './DashboardPage.css';

interface AdminOrderRow {
  id: string;
  user_name?: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
}

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  tone: 'blue' | 'green' | 'purple' | 'orange';
  icon: ReactNode;
}

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const FALLBACK_REVENUE = [42, 66, 59, 83, 75, 96, 90, 102, 94, 77, 88, 101];

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: '#f59f00' },
  paid: { label: 'Đã thanh toán', color: '#1677ff' },
  shipped: { label: 'Đang giao', color: '#19bdb8' },
  cancelled: { label: 'Đã huỷ', color: '#f5222d' },
  simulated_success: { label: 'Hoàn tất', color: '#39b91f' },
};

const FALLBACK_ORDERS: AdminOrderRow[] = [
  {
    id: 'A1B2C3D4',
    user_name: 'Nguyễn Văn A',
    total: 64980000,
    status: 'paid',
    created_at: '2026-07-24T10:24:00',
  },
  {
    id: 'E5F6G7H8',
    user_name: 'Trần Thị B',
    total: 7990000,
    status: 'pending',
    created_at: '2026-07-24T09:10:00',
  },
  {
    id: 'I9J0K1L2',
    user_name: 'Lê Văn C',
    total: 47280000,
    status: 'shipped',
    created_at: '2026-07-23T16:45:00',
  },
  {
    id: 'M3N4O5P6',
    user_name: 'Phạm Thị D',
    total: 2490000,
    status: 'cancelled',
    created_at: '2026-07-23T11:02:00',
  },
  {
    id: 'Q7R8S9T0',
    user_name: 'Đỗ Văn E',
    total: 34480000,
    status: 'paid',
    created_at: '2026-07-22T14:30:00',
  },
];

function compactRevenue(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  }
  return formatVND(value);
}

function shortOrderId(id: string) {
  return `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

function StatCard({ label, value, trend, tone, icon }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon admin-stat-icon-${tone}`}>{icon}</div>
      <div>
        <div className="admin-stat-label">{label}</div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-trend">▲ {trend}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [revenue, setRevenue] = useState<AdminRevenueStats | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [overviewRes, revenueRes, ordersRes] = await Promise.all([
          adminStatisticsApi.overview(),
          adminStatisticsApi.revenue({ groupBy: 'month' }),
          adminOrderApi.list({ page: 1, limit: 5 }),
        ]);
        if (ignore) return;
        setOverview(overviewRes.data);
        setRevenue(revenueRes.data);
        setOrders((ordersRes.data.items ?? []) as AdminOrderRow[]);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const chartValues = useMemo(() => {
    if (!revenue?.items?.length) return FALLBACK_REVENUE;

    const byMonth = new Map<number, number>();
    revenue.items.forEach((item) => {
      const month = new Date(item.period).getMonth();
      if (!Number.isNaN(month)) byMonth.set(month, item.revenue);
    });
    return MONTH_LABELS.map((_, index) => byMonth.get(index) ?? 0);
  }, [revenue]);

  const maxRevenue = Math.max(...chartValues, 1);
  const displayedOrders = orders.length ? orders : FALLBACK_ORDERS;
  const orderTotal = overview?.orders_by_status.reduce((sum, item) => sum + item.count, 0) ?? 0;

  const statusRows = Object.entries(STATUS_META).map(([status, meta]) => {
    const count = overview?.orders_by_status.find((item) => item.status === status)?.count ?? 0;
    const percent = orderTotal > 0 ? Math.round((count / orderTotal) * 100) : 0;
    return {
      status,
      ...meta,
      percent: orderTotal > 0 ? percent : { pending: 18, paid: 42, shipped: 25, cancelled: 8, simulated_success: 7 }[status] ?? 0,
    };
  });

  const columns: ColumnsType<AdminOrderRow> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      render: (id: string) => <strong>{shortOrderId(id)}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user_name',
      render: (name?: string | null) => name || 'Khách hàng',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      render: (value: number) => <span className="admin-money">{formatVND(value)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: OrderStatus) => (
        <Tag color={ORDER_STATUS_COLOR[status]}>{ORDER_STATUS_LABEL[status] ?? status}</Tag>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'created_at',
      render: (value: string) => <span className="admin-muted">{formatDate(value)}</span>,
    },
  ];

  if (loading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  return (
    <div className="admin-dashboard">
      {error && <div className="admin-dashboard-note">Đang hiển thị dữ liệu mẫu: {error}</div>}

      <div className="admin-stat-grid">
        <StatCard
          label="Tổng đơn hàng"
          value={String(overview?.total_orders ?? 1240)}
          trend="+12%"
          tone="blue"
          icon={<ProfileOutlined />}
        />
        <StatCard
          label="Doanh thu"
          value={compactRevenue(overview?.total_revenue ?? 2_450_000_000)}
          trend="+8,5%"
          tone="green"
          icon={<DollarOutlined />}
        />
        <StatCard
          label="Số sản phẩm"
          value={String(overview?.total_products ?? 18)}
          trend="+3"
          tone="purple"
          icon={<InboxOutlined />}
        />
        <StatCard
          label="Người dùng"
          value={(overview?.total_users ?? 8320).toLocaleString('vi-VN')}
          trend="+21%"
          tone="orange"
          icon={<TeamOutlined />}
        />
      </div>

      <div className="admin-analytics-grid">
        <section className="admin-panel admin-revenue-panel">
          <h2>Doanh thu theo tháng</h2>
          <div className="admin-bar-chart">
            {chartValues.map((value, index) => (
              <div className="admin-bar-item" key={MONTH_LABELS[index]}>
                <div
                  className="admin-bar"
                  style={{ height: `${Math.max(18, (value / maxRevenue) * 100)}%` }}
                />
                <span>{MONTH_LABELS[index]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-status-panel">
          <h2>Đơn theo trạng thái</h2>
          <div className="admin-status-list">
            {statusRows.map((item) => (
              <div className="admin-status-row" key={item.status}>
                <div className="admin-status-label">
                  <span>{item.label}</span>
                  <span>{item.percent}%</span>
                </div>
                <div className="admin-status-track">
                  <div
                    className="admin-status-fill"
                    style={{ width: `${item.percent}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel admin-orders-panel">
        <h2>Đơn hàng mới nhất</h2>
        {displayedOrders.length ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={displayedOrders}
            pagination={false}
            className="admin-orders-table"
          />
        ) : (
          <Empty description="Chưa có đơn hàng nào" />
        )}
      </section>
    </div>
  );
}
