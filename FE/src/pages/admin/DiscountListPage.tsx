import { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adminDiscountApi } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { DiscountCode, DiscountType } from '../../types';
import { formatDateShort, formatVND } from '../../utils/format';
import './DiscountListPage.css';

const PAGE_SIZE = 8;

interface AdminDiscountRow extends DiscountCode {
  status?: 'running' | 'paused';
}

interface DiscountFormValues {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit?: number;
  valid_until?: dayjs.Dayjs;
  is_active: boolean;
}

const SAMPLE_DISCOUNTS: AdminDiscountRow[] = [
  {
    id: 'sample-sale10',
    code: 'SALE10',
    description: 'Giảm 10% toàn bộ',
    discount_type: 'percent',
    discount_value: 10,
    min_order_value: 0,
    max_discount: null,
    usage_limit: 500,
    used_count: 124,
    valid_from: null,
    valid_until: '2026-12-31T00:00:00',
    is_active: true,
    status: 'running',
  },
  {
    id: 'sample-giam50k',
    code: 'GIAM50K',
    description: 'Giảm 50k đơn từ 1tr',
    discount_type: 'fixed_amount',
    discount_value: 50000,
    min_order_value: 1000000,
    max_discount: null,
    usage_limit: 200,
    used_count: 88,
    valid_from: null,
    valid_until: '2026-09-30T00:00:00',
    is_active: true,
    status: 'running',
  },
  {
    id: 'sample-freeship',
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển',
    discount_type: 'free_shipping',
    discount_value: 30000,
    min_order_value: 0,
    max_discount: null,
    usage_limit: 1000,
    used_count: 512,
    valid_from: null,
    valid_until: '2026-08-31T00:00:00',
    is_active: true,
    status: 'running',
  },
  {
    id: 'sample-new2026',
    code: 'NEW2026',
    description: 'Chào 2026 giảm 15%',
    discount_type: 'percent',
    discount_value: 15,
    min_order_value: 0,
    max_discount: null,
    usage_limit: 100,
    used_count: 40,
    valid_from: null,
    valid_until: '2026-03-01T00:00:00',
    is_active: false,
    status: 'paused',
  },
];

function normalizeDiscount(raw: unknown): AdminDiscountRow {
  const item = raw as Partial<AdminDiscountRow>;
  return {
    id: item.id ?? '',
    code: item.code ?? '',
    description: item.description ?? null,
    discount_type: item.discount_type ?? 'percent',
    discount_value: Number(item.discount_value ?? 0),
    min_order_value: Number(item.min_order_value ?? 0),
    max_discount: item.max_discount ?? null,
    usage_limit: item.usage_limit ?? null,
    used_count: item.used_count ?? 0,
    valid_from: item.valid_from ?? null,
    valid_until: item.valid_until ?? null,
    is_active: item.is_active ?? false,
    status: item.status ?? (item.is_active ? 'running' : 'paused'),
  };
}

function discountTypeLabel(type: DiscountType) {
  if (type === 'percent') return '%';
  return 'đ';
}

function discountValueLabel(discount: AdminDiscountRow) {
  if (discount.discount_type === 'percent') return `${discount.discount_value}%`;
  return formatVND(discount.discount_value);
}

function statusLabel(discount: AdminDiscountRow) {
  const running = discount.status === 'running' || (discount.is_active && discount.status !== 'paused');
  return running ? 'Đang chạy' : 'Tạm dừng';
}

export default function DiscountListPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<DiscountFormValues>();
  const [items, setItems] = useState<AdminDiscountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'running' | 'paused'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminDiscountRow | null>(null);
  const [fallbackReason, setFallbackReason] = useState('');

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

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const res = await adminDiscountApi.list(query);
      const rows = (res.data.items ?? res.data.data ?? []).map(normalizeDiscount);
      setItems(rows);
      setTotal(res.data.total ?? rows.length);
      setFallbackReason('');
    } catch (err) {
      const reason = getErrorMessage(err);
      const filtered = SAMPLE_DISCOUNTS.filter((discount) => {
        const q = query.search?.toLowerCase();
        const matchesSearch =
          !q ||
          discount.code.toLowerCase().includes(q) ||
          discount.description?.toLowerCase().includes(q);
        const matchesStatus = query.status ? discount.status === query.status : true;
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
    loadDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const openCreateModal = () => {
    setEditing(null);
    form.setFieldsValue({
      code: '',
      description: '',
      discount_type: 'percent',
      discount_value: 0,
      min_order_value: 0,
      max_discount: undefined,
      usage_limit: undefined,
      valid_until: undefined,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (discount: AdminDiscountRow) => {
    setEditing(discount);
    form.setFieldsValue({
      code: discount.code,
      description: discount.description ?? '',
      discount_type: discount.discount_type,
      discount_value: Number(discount.discount_value ?? 0),
      min_order_value: Number(discount.min_order_value ?? 0),
      max_discount: discount.max_discount ?? undefined,
      usage_limit: discount.usage_limit ?? undefined,
      valid_until: discount.valid_until ? dayjs(discount.valid_until) : undefined,
      is_active: discount.is_active,
    });
    setModalOpen(true);
  };

  const submitDiscount = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        description: values.description?.trim() || '',
        discount_value: values.discount_value,
        usage_limit: values.usage_limit,
        valid_until: values.valid_until?.toISOString(),
        is_active: values.is_active,
      };

      if (editing) {
        await adminDiscountApi.update(editing.id, payload);
        message.success('Đã cập nhật mã giảm giá');
      } else {
        await adminDiscountApi.create({
          code: values.code.trim().toUpperCase(),
          description: payload.description,
          discount_type: values.discount_type,
          discount_value: values.discount_value,
          min_order_value: values.min_order_value,
          max_discount: values.max_discount,
          usage_limit: values.usage_limit,
          valid_until: payload.valid_until,
        });
        message.success('Đã thêm mã giảm giá');
      }
      setModalOpen(false);
      loadDiscounts();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeDiscount = async (discount: AdminDiscountRow) => {
    try {
      await adminDiscountApi.remove(discount.id);
      message.success('Đã vô hiệu hoá mã giảm giá');
      loadDiscounts();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const columns: ColumnsType<AdminDiscountRow> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 190,
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      render: (value: string | null) => <span className="admin-discount-desc">{value || '-'}</span>,
    },
    {
      title: 'Loại',
      dataIndex: 'discount_type',
      width: 110,
      render: (type: DiscountType) => discountTypeLabel(type),
    },
    {
      title: 'Giá trị',
      key: 'discount_value',
      width: 170,
      render: (_, record) => <span className="admin-discount-value">{discountValueLabel(record)}</span>,
    },
    {
      title: 'Đã dùng',
      key: 'usage',
      width: 170,
      render: (_, record) => `${record.used_count ?? 0}/${record.usage_limit ?? '∞'}`,
    },
    {
      title: 'HSD',
      dataIndex: 'valid_until',
      width: 190,
      render: (value: string | null) => <span className="admin-discount-date">{formatDateShort(value)}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 170,
      render: (_, record) => {
        const running = statusLabel(record) === 'Đang chạy';
        return <Tag color={running ? 'green' : 'default'}>{statusLabel(record)}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <div className="admin-discount-actions">
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Vô hiệu hoá mã này?"
            description="Mã sẽ chuyển sang trạng thái tạm dừng."
            okText="Vô hiệu hoá"
            cancelText="Huỷ"
            disabled={isSampleMode}
            onConfirm={() => removeDiscount(record)}
          >
            <Button type="link" danger disabled={isSampleMode}>
              Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
  };

  return (
    <div className="admin-discount-page">
      {fallbackReason && (
        <div className="admin-discount-note">Đang hiển thị dữ liệu mẫu: {fallbackReason}</div>
      )}

      <div className="admin-discount-toolbar">
        <div className="admin-discount-filters">
          <Input.Search
            allowClear
            placeholder="Tìm mã..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            className="admin-discount-search"
          />
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            className="admin-discount-status"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'running', label: 'Đang chạy' },
              { value: 'paused', label: 'Tạm dừng' },
            ]}
          />
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm mã
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        className="admin-discount-table"
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          hideOnSinglePage: total <= PAGE_SIZE,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
        open={modalOpen}
        okText={editing ? 'Lưu thay đổi' : 'Thêm mã'}
        cancelText="Huỷ"
        confirmLoading={saving}
        onOk={submitDiscount}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="admin-discount-form">
          <Form.Item
            label="Mã"
            name="code"
            rules={[{ required: true, message: 'Nhập mã giảm giá' }]}
          >
            <Input placeholder="Ví dụ: SALE10" disabled={!!editing} />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input placeholder="Ví dụ: Giảm 10% toàn bộ" />
          </Form.Item>

          <Form.Item
            label="Loại"
            name="discount_type"
            rules={[{ required: true, message: 'Chọn loại giảm giá' }]}
          >
            <Select
              disabled={!!editing}
              options={[
                { value: 'percent', label: 'Phần trăm (%)' },
                { value: 'fixed_amount', label: 'Số tiền (đ)' },
                { value: 'free_shipping', label: 'Miễn phí vận chuyển' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Giá trị"
            name="discount_value"
            rules={[{ required: true, message: 'Nhập giá trị giảm' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Đơn tối thiểu" name="min_order_value">
            <InputNumber min={0} step={10000} style={{ width: '100%' }} disabled={!!editing} />
          </Form.Item>

          <Form.Item label="Giảm tối đa" name="max_discount">
            <InputNumber min={0} step={10000} style={{ width: '100%' }} disabled={!!editing} />
          </Form.Item>

          <Form.Item label="Giới hạn lượt dùng" name="usage_limit">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Hạn sử dụng" name="valid_until">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Đang chạy" name="is_active" valuePropName="checked">
            <Switch checkedChildren="Chạy" unCheckedChildren="Dừng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
