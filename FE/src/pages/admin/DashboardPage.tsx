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
  type AdminOrderListItem,
  type AdminOverviewStats,
  type AdminRevenueStats,
} from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { OrderStatus } from '../../types';
import { formatDate, formatVND, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../utils/format';
import './DashboardPage.css';

type AdminOrderRow = AdminOrderListItem;

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  tone: 'blue' | 'green' | 'purple' | 'orange';
  icon: ReactNode;
}

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const FALLBACK_REVENUE = [42, 66, 59, 83, 75, 96, 90, 102, 94, 77, 88, 101];

const FALLBACK_OVERVIEW: AdminOverviewStats = {
  total_orders: 1240,
  total_revenue: 2_450_000_000,
  total_products: 18,
  active_products: 18,
  total_users: 8320,
  orders_by_status: [
    { status: 'pending', count: 18 },
    { status: 'paid', count: 42 },
    { status: 'shipped', count: 25 },
    { status: 'cancelled', count: 8 },
    { status: 'simulated_success', count: 7 },
  ],
};

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

function normalizeAdminOrder(item: AdminOrderListItem): AdminOrderRow {
  return {
    id: item.id,
    user_name: item.user_name,
    product_count: item.product_count,
    total: item.total,
    status: item.status,
    created_at: item.created_at,
  };
}

function StatCard({ label, value, subtext, tone, icon }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon admin-stat-icon-${tone}`}>{icon}</div>
      <div>
        <div className="admin-stat-label">{label}</div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-subtext">{subtext}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [revenue, setRevenue] = useState<AdminRevenueStats | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setErrors([]);

      const year = new Date().getFullYear();
      const [overviewRes, revenueRes, ordersRes] = await Promise.allSettled([
        adminStatisticsApi.overview(),
        adminStatisticsApi.revenue({
          groupBy: 'month',
          from: `${year}-01-01`,
          to: `${year}-12-31`,
        }),
        adminOrderApi.list({ page: 1, limit: 5 }),
      ]);

      if (ignore) return;

      const nextErrors: string[] = [];

      if (overviewRes.status === 'fulfilled') {
        setOverview(overviewRes.value.data);
      } else {
        setOverview(null);
        nextErrors.push(`Tổng quan: ${getErrorMessage(overviewRes.reason)}`);
      }

      if (revenueRes.status === 'fulfilled') {
        setRevenue(revenueRes.value.data);
      } else {
        setRevenue(null);
        nextErrors.push(`Doanh thu: ${getErrorMessage(revenueRes.reason)}`);
      }

      if (ordersRes.status === 'fulfilled') {
        setOrders((ordersRes.value.data.items ?? []).map(normalizeAdminOrder));
      } else {
        setOrders([]);
        nextErrors.push(`Đơn mới: ${getErrorMessage(ordersRes.reason)}`);
      }

      setErrors(nextErrors);
      setLoading(false);
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const chartValues = useMemo(() => {
    if (!revenue) return FALLBACK_REVENUE;
    if (!revenue.items.length) return MONTH_LABELS.map(() => 0);

    const byMonth = new Map<number, number>();
    revenue.items.forEach((item) => {
      const month = new Date(item.period).getMonth();
      if (!Number.isNaN(month)) byMonth.set(month, item.revenue);
    });
    return MONTH_LABELS.map((_, index) => byMonth.get(index) ?? 0);
  }, [revenue]);

  const dashboardOverview = overview ?? FALLBACK_OVERVIEW;
  const usingOverviewFallback = !overview;
  const usingRevenueFallback = !revenue;
  const usingOrdersFallback = orders.length === 0 && errors.some((item) => item.startsWith('Đơn mới:'));
  const maxRevenue = Math.max(...chartValues, 0);
  const displayedOrders = orders.length ? orders : FALLBACK_ORDERS;
  const orderTotal = dashboardOverview.orders_by_status.reduce((sum, item) => sum + item.count, 0);

  const statusRows = Object.entries(STATUS_META).map(([status, meta]) => {
    const count = dashboardOverview.orders_by_status.find((item) => item.status === status)?.count ?? 0;
    const percent = orderTotal > 0 ? Math.round((count / orderTotal) * 100) : 0;
    return {
      status,
      ...meta,
      count,
      percent,
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
      render: (value: number | string) => <span className="admin-money">{formatVND(value)}</span>,
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
      {errors.length > 0 && (
        <div className="admin-dashboard-note">
          Một phần dữ liệu đang dùng mẫu: {errors.join(' | ')}
        </div>
      )}

      <div className="admin-stat-grid">
        <StatCard
          label="Tổng đơn hàng"
          value={dashboardOverview.total_orders.toLocaleString('vi-VN')}
          subtext={usingOverviewFallback ? 'Dữ liệu mẫu' : `${orderTotal.toLocaleString('vi-VN')} đơn có trạng thái`}
          tone="blue"
          icon={<ProfileOutlined />}
        />
        <StatCard
          label="Doanh thu"
          value={compactRevenue(dashboardOverview.total_revenue)}
          subtext={usingOverviewFallback ? 'Dữ liệu mẫu' : 'Từ thanh toán thành công'}
          tone="green"
          icon={<DollarOutlined />}
        />
        <StatCard
          label="Số sản phẩm"
          value={dashboardOverview.total_products.toLocaleString('vi-VN')}
          subtext={usingOverviewFallback ? 'Dữ liệu mẫu' : `${dashboardOverview.active_products.toLocaleString('vi-VN')} đang bán`}
          tone="purple"
          icon={<InboxOutlined />}
        />
        <StatCard
          label="Người dùng"
          value={dashboardOverview.total_users.toLocaleString('vi-VN')}
          subtext={usingOverviewFallback ? 'Dữ liệu mẫu' : 'Tổng tài khoản'}
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
                  style={{ height: maxRevenue > 0 ? `${Math.max(18, (value / maxRevenue) * 100)}%` : 0 }}
                  title={formatVND(value)}
                />
                <span>{MONTH_LABELS[index]}</span>
              </div>
            ))}
          </div>
          {usingRevenueFallback && <div className="admin-panel-hint">Biểu đồ đang dùng dữ liệu mẫu.</div>}
        </section>

        <section className="admin-panel admin-status-panel">
          <h2>Đơn theo trạng thái</h2>
          <div className="admin-status-list">
            {statusRows.map((item) => (
              <div className="admin-status-row" key={item.status}>
                <div className="admin-status-label">
                  <span>{item.label}</span>
                  <span>
                    {item.count.toLocaleString('vi-VN')} · {item.percent}%
                  </span>
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
        {usingOrdersFallback && <div className="admin-panel-hint">Bảng đang dùng dữ liệu mẫu.</div>}
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
