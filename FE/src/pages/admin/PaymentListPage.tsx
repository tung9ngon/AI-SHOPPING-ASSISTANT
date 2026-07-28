import { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Descriptions,
  Modal,
  Popconfirm,
  Select,
  Skeleton,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import { adminPaymentApi } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { PaymentMethod, PaymentStatus } from '../../types';
import { formatDate, formatVND, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL } from '../../utils/format';
import './PaymentListPage.css';

const PAGE_SIZE = 6;

interface AdminPaymentRow {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number | string;
  status: PaymentStatus;
  paid_at: string | null;
}

interface AdminPaymentDetail extends AdminPaymentRow {
  transaction_id?: string | null;
  currency?: string;
  gateway_response?: Record<string, unknown> | null;
}

const SAMPLE_PAYMENTS: AdminPaymentRow[] = [
  {
    id: 'PAY-0001',
    order_id: 'A1B2C3D4',
    method: 'payos',
    amount: 64980000,
    status: 'success',
    paid_at: '2026-07-24T10:26:00',
  },
  {
    id: 'PAY-0002',
    order_id: 'E5F6G7H8',
    method: 'cod',
    amount: 7990000,
    status: 'pending',
    paid_at: '2026-07-24T09:12:00',
  },
  {
    id: 'PAY-0003',
    order_id: 'I9J0K1L2',
    method: 'payos',
    amount: 41500000,
    status: 'success',
    paid_at: '2026-07-23T16:48:00',
  },
  {
    id: 'PAY-0004',
    order_id: 'M3N4O5P6',
    method: 'cod',
    amount: 2490000,
    status: 'failed',
    paid_at: '2026-07-23T11:05:00',
  },
  {
    id: 'PAY-0005',
    order_id: 'Q7R8S9T0',
    method: 'cod',
    amount: 34980000,
    status: 'pending',
    paid_at: '2026-07-22T14:32:00',
  },
  {
    id: 'PAY-0006',
    order_id: 'U1V2W3X4',
    method: 'payos',
    amount: 16990000,
    status: 'refunded',
    paid_at: '2026-07-21T08:20:00',
  },
];

function shortOrderId(id: string) {
  return `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

function normalizePayment(raw: unknown): AdminPaymentRow {
  const item = raw as Partial<AdminPaymentRow> & {
    created_at?: string;
  };
  return {
    id: item.id ?? '',
    order_id: item.order_id ?? '',
    method: item.method ?? 'cod',
    amount: item.amount ?? 0,
    status: item.status ?? 'pending',
    paid_at: item.paid_at ?? item.created_at ?? null,
  };
}

function methodTag(method: PaymentMethod) {
  return <Tag color={method === 'payos' ? 'blue' : 'green'}>{method === 'payos' ? 'PayOS' : 'COD'}</Tag>;
}

function statusTag(status: PaymentStatus) {
  const fallbackLabel: Record<PaymentStatus, string> = {
    pending: 'Chờ thanh toán',
    success: 'Thành công',
    failed: 'Đã huỷ',
    refunded: 'Đã hoàn tiền',
  };

  return (
    <Tag color={PAYMENT_STATUS_COLOR[status]}>
      {status === 'failed' ? fallbackLabel.failed : PAYMENT_STATUS_LABEL[status] ?? fallbackLabel[status]}
    </Tag>
  );
}

function PaymentDetailModal({
  paymentId,
  sample,
  open,
  onClose,
}: {
  paymentId: string | null;
  sample: AdminPaymentRow | null;
  open: boolean;
  onClose: () => void;
}) {
  const { message } = App.useApp();
  const [detail, setDetail] = useState<AdminPaymentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const sampleMode = !!sample?.id.startsWith('PAY-');

  useEffect(() => {
    if (!open || !paymentId || sampleMode) return;
    let ignore = false;
    setLoading(true);
    adminPaymentApi
      .detail(paymentId)
      .then((res) => {
        if (!ignore) setDetail(res.data as unknown as AdminPaymentDetail);
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
  }, [message, open, paymentId, sampleMode]);

  const payment: AdminPaymentDetail | null =
    sampleMode && sample ? { ...sample, transaction_id: null, currency: 'VND' } : detail;

  return (
    <Modal
      open={open}
      title={paymentId ? `Chi tiết giao dịch ${paymentId}` : 'Chi tiết giao dịch'}
      onCancel={onClose}
      footer={null}
      width={680}
      destroyOnClose
    >
      {loading && !sampleMode ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : payment ? (
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Mã GD">{payment.id}</Descriptions.Item>
          <Descriptions.Item label="Đơn liên kết">{shortOrderId(payment.order_id)}</Descriptions.Item>
          <Descriptions.Item label="Phương thức">{methodTag(payment.method)}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{statusTag(payment.status)}</Descriptions.Item>
          <Descriptions.Item label="Số tiền">{formatVND(payment.amount)}</Descriptions.Item>
          <Descriptions.Item label="Ngày">{formatDate(payment.paid_at)}</Descriptions.Item>
          <Descriptions.Item label="Mã giao dịch" span={2}>
            {payment.transaction_id ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </Modal>
  );
}

export default function PaymentListPage() {
  const { message } = App.useApp();
  const [items, setItems] = useState<AdminPaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState<PaymentMethod | 'all'>('all');
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState('');
  const [fallbackReason, setFallbackReason] = useState('');
  const [detailPayment, setDetailPayment] = useState<AdminPaymentRow | null>(null);

  const isSampleMode = !!fallbackReason;

  const query = useMemo(
    () => ({
      method: method === 'all' ? undefined : method,
      status: status === 'all' ? undefined : status,
      page,
      limit: PAGE_SIZE,
    }),
    [method, page, status],
  );

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await adminPaymentApi.list(query);
      const rows = (res.data.items ?? res.data.data ?? []).map(normalizePayment);
      setItems(rows);
      setTotal(res.data.total ?? rows.length);
      setFallbackReason('');
    } catch (err) {
      const reason = getErrorMessage(err);
      const filtered = SAMPLE_PAYMENTS.filter((payment) => {
        const matchesMethod = query.method ? payment.method === query.method : true;
        const matchesStatus = query.status ? payment.status === query.status : true;
        return matchesMethod && matchesStatus;
      });
      setItems(filtered);
      setTotal(filtered.length);
      setFallbackReason(reason);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const confirmCod = async (payment: AdminPaymentRow) => {
    setConfirmingId(payment.id);
    try {
      await adminPaymentApi.confirmCod(payment.id);
      message.success('Đã xác nhận COD đã thu');
      loadPayments();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setConfirmingId('');
    }
  };

  const columns: ColumnsType<AdminPaymentRow> = [
    {
      title: 'Mã GD',
      dataIndex: 'id',
      width: 170,
      render: (id: string) => <strong>{id.startsWith('PAY-') ? id : id.slice(0, 8).toUpperCase()}</strong>,
    },
    {
      title: 'Đơn liên kết',
      dataIndex: 'order_id',
      width: 190,
      render: (id: string) => shortOrderId(id),
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      width: 180,
      render: methodTag,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      width: 220,
      render: (value: number | string) => <span className="admin-payment-money">{formatVND(value)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 220,
      render: statusTag,
    },
    {
      title: 'Ngày',
      dataIndex: 'paid_at',
      width: 230,
      render: (value: string | null) => <span className="admin-payment-date">{formatDate(value)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 220,
      align: 'right',
      render: (_, record) => (
        <div className="admin-payment-actions">
          {record.method === 'cod' && record.status === 'pending' && (
            <Popconfirm
              title="Xác nhận đã thu COD?"
              okText="Xác nhận"
              cancelText="Huỷ"
              disabled={isSampleMode}
              onConfirm={() => confirmCod(record)}
            >
              <Button
                type="link"
                disabled={isSampleMode}
                loading={confirmingId === record.id}
                className="admin-payment-confirm"
              >
                Xác nhận đã thu
              </Button>
            </Popconfirm>
          )}
          <Button type="link" icon={<EyeOutlined />} onClick={() => setDetailPayment(record)}>
            Xem
          </Button>
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
  };

  return (
    <div className="admin-payment-page">
      {fallbackReason && (
        <div className="admin-payment-note">Đang hiển thị dữ liệu mẫu: {fallbackReason}</div>
      )}

      <div className="admin-payment-toolbar">
        <Select
          value={method}
          onChange={(value) => {
            setMethod(value);
            setPage(1);
          }}
          className="admin-payment-filter"
          options={[
            { value: 'all', label: 'Tất cả phương thức' },
            { value: 'payos', label: 'PayOS' },
            { value: 'cod', label: 'COD' },
          ]}
        />
        <Select
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          className="admin-payment-filter"
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'success', label: 'Thành công' },
            { value: 'pending', label: 'Chờ thanh toán' },
            { value: 'failed', label: 'Đã huỷ' },
            { value: 'refunded', label: 'Đã hoàn tiền' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        className="admin-payment-table"
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          hideOnSinglePage: total <= PAGE_SIZE,
        }}
        onChange={handleTableChange}
      />

      <PaymentDetailModal
        paymentId={detailPayment?.id ?? null}
        sample={detailPayment}
        open={!!detailPayment}
        onClose={() => setDetailPayment(null)}
      />
    </div>
  );
}
