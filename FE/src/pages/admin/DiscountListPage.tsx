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
import type { DiscountCode, DiscountType, VoucherCategory } from '../../types';
import { formatDateShort, formatVND } from '../../utils/format';
import './DiscountListPage.css';

const PAGE_SIZE = 8;

export type DiscountStatus = 'running' | 'paused' | 'upcoming' | 'expired';

interface AdminDiscountRow extends DiscountCode {
  status?: DiscountStatus;
}

interface DiscountFormValues {
  code: string;
  description?: string;
  category: VoucherCategory;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit?: number;
  valid_from?: dayjs.Dayjs;
  valid_until?: dayjs.Dayjs;
  is_active: boolean;
}

function getDiscountStatus(discount: {
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  status?: DiscountStatus;
}): DiscountStatus {
  if (!discount.is_active) return 'paused';
  const now = new Date();
  if (discount.valid_from) {
    const fromDate = new Date(discount.valid_from);
    if (!isNaN(fromDate.getTime()) && fromDate > now) {
      return 'upcoming';
    }
  }
  if (discount.valid_until) {
    const untilDate = new Date(discount.valid_until);
    if (!isNaN(untilDate.getTime()) && untilDate < now) {
      return 'expired';
    }
  }
  return 'running';
}

const SAMPLE_DISCOUNTS: AdminDiscountRow[] = [
  {
    id: 'sample-sale10',
    code: 'SALE10',
    description: 'Giảm 10% toàn bộ',
    category: 'order',
    discount_type: 'percent',
    discount_value: 10,
    min_order_value: 0,
    max_discount: 50000,
    usage_limit: 500,
    used_count: 124,
    valid_from: null,
    valid_until: '2026-12-31T00:00:00',
    is_active: true,
    status: 'running',
  },
  {
    id: 'sample-upcoming',
    code: 'UPCOMING2027',
    description: 'Khuyến mãi năm mới 2027',
    category: 'order',
    discount_type: 'percent',
    discount_value: 20,
    min_order_value: 500000,
    max_discount: 100000,
    usage_limit: 100,
    used_count: 0,
    valid_from: '2027-01-01T00:00:00',
    valid_until: '2027-01-10T00:00:00',
    is_active: true,
    status: 'upcoming',
  },
  {
    id: 'sample-giam50k',
    code: 'GIAM50K',
    description: 'Giảm 50k đơn từ 1tr',
    category: 'order',
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
    category: 'free_shipping',
    discount_type: 'fixed_amount',
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
    category: 'order',
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
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rawDiscountType = String(record.discount_type ?? '');
  const isLegacyFreeship = rawDiscountType === 'free_shipping';

  const category: VoucherCategory = isLegacyFreeship
    ? 'free_shipping'
    : ((record.category as VoucherCategory) ?? 'order');

  const discount_type: DiscountType = isLegacyFreeship
    ? 'fixed_amount'
    : rawDiscountType === 'percent'
      ? 'percent'
      : 'fixed_amount';

  const is_active = Boolean(record.is_active);
  const valid_from = record.valid_from ? String(record.valid_from) : null;
  const valid_until = record.valid_until ? String(record.valid_until) : null;

  const calculatedStatus = getDiscountStatus({ is_active, valid_from, valid_until });
  const status = (record.status as DiscountStatus) ?? calculatedStatus;

  return {
    id: String(record.id ?? ''),
    code: String(record.code ?? ''),
    description: record.description ? String(record.description) : null,
    category,
    discount_type,
    discount_value: Number(record.discount_value ?? 0),
    min_order_value: record.min_order_value != null ? Number(record.min_order_value) : null,
    max_discount: record.max_discount != null ? Number(record.max_discount) : null,
    usage_limit: record.usage_limit != null ? Number(record.usage_limit) : null,
    used_count: Number(record.used_count ?? 0),
    valid_from,
    valid_until,
    is_active,
    status,
    created_at: record.created_at ? String(record.created_at) : undefined,
  };
}

function categoryLabel(cat: VoucherCategory) {
  if (cat === 'free_shipping') return 'Freeship';
  return 'Giảm tiền hàng';
}

function discountValueLabel(discount: AdminDiscountRow) {
  if (discount.discount_type === 'percent') {
    const maxStr = discount.max_discount ? ` (Tối đa ${formatVND(discount.max_discount)})` : '';
    return `${discount.discount_value}%${maxStr}`;
  }
  return formatVND(discount.discount_value);
}

export default function DiscountListPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<DiscountFormValues>();
  const [items, setItems] = useState<AdminDiscountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VoucherCategory>('all');
  const [status, setStatus] = useState<'all' | DiscountStatus>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminDiscountRow | null>(null);
  const [fallbackReason, setFallbackReason] = useState('');

  const isSampleMode = !!fallbackReason;

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      status: status === 'all' ? undefined : status,
      page,
      limit: PAGE_SIZE,
    }),
    [page, search, categoryFilter, status],
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
        const matchesCategory = query.category ? discount.category === query.category : true;
        const currentSt = getDiscountStatus(discount);
        const matchesStatus = query.status ? currentSt === query.status : true;
        return matchesSearch && matchesCategory && matchesStatus;
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
      category: 'order',
      discount_type: 'percent',
      discount_value: 0,
      min_order_value: undefined,
      max_discount: undefined,
      usage_limit: undefined,
      valid_from: undefined,
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
      category: discount.category ?? 'order',
      discount_type: discount.discount_type,
      discount_value: Number(discount.discount_value ?? 0),
      min_order_value: discount.min_order_value != null ? Number(discount.min_order_value) : undefined,
      max_discount: discount.max_discount != null ? Number(discount.max_discount) : undefined,
      usage_limit: discount.usage_limit != null ? Number(discount.usage_limit) : undefined,
      valid_from: discount.valid_from ? dayjs(discount.valid_from) : undefined,
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
        description: values.description?.trim() || undefined,
        category: values.category,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        min_order_value: values.min_order_value ?? undefined,
        max_discount: values.max_discount ?? undefined,
        usage_limit: values.usage_limit ?? undefined,
        valid_from: values.valid_from?.toISOString(),
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
          category: values.category,
          discount_type: values.discount_type,
          discount_value: values.discount_value,
          min_order_value: values.min_order_value,
          max_discount: values.max_discount,
          usage_limit: values.usage_limit,
          valid_from: payload.valid_from,
          valid_until: payload.valid_until,
          is_active: values.is_active,
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
      width: 140,
      render: (code: string) => <span>{code}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      render: (value: string | null) => <span className="admin-discount-desc">{value || '-'}</span>,
    },
    {
      title: 'Loại Voucher',
      dataIndex: 'category',
      width: 130,
      render: (cat: VoucherCategory) => (
        <Tag color={cat === 'free_shipping' ? 'cyan' : 'orange'}>{categoryLabel(cat)}</Tag>
      ),
    },
    {
      title: 'Kiểu giảm',
      dataIndex: 'discount_type',
      width: 110,
      render: (type: DiscountType) => (type === 'percent' ? '% Phần trăm' : 'Số tiền cố định'),
    },
    {
      title: 'Giá trị',
      key: 'discount_value',
      width: 160,
      render: (_, record) => <span className="admin-discount-value">{discountValueLabel(record)}</span>,
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'min_order_value',
      width: 130,
      render: (val: number | null) => (val && val > 0 ? formatVND(val) : 'Không yêu cầu'),
    },
    {
      title: 'Đã dùng',
      key: 'usage',
      width: 110,
      render: (_, record) => `${record.used_count ?? 0}/${record.usage_limit ?? '∞'}`,
    },
    {
      title: 'Thời gian áp dụng',
      key: 'valid_period',
      width: 170,
      render: (_, record) => {
        const from = record.valid_from ? formatDateShort(record.valid_from) : null;
        const until = record.valid_until ? formatDateShort(record.valid_until) : null;
        if (!from && !until) return <span className="admin-discount-date">Vô thời hạn</span>;
        if (from && until) return <span className="admin-discount-date">{`${from} - ${until}`}</span>;
        if (from) return <span className="admin-discount-date">{`Từ ${from}`}</span>;
        return <span className="admin-discount-date">{`Đến ${until}`}</span>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const st = getDiscountStatus(record);
        if (st === 'running') return <Tag color="green">Đang chạy</Tag>;
        if (st === 'upcoming') return <Tag color="blue">Chưa bắt đầu</Tag>;
        if (st === 'expired') return <Tag color="red">Hết hạn</Tag>;
        return <Tag color="default">Tạm dừng</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
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
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'Tất cả loại voucher' },
              { value: 'order', label: 'Giảm tiền hàng' },
              { value: 'free_shipping', label: 'Freeship' },
            ]}
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
              { value: 'upcoming', label: 'Chưa bắt đầu' },
              { value: 'paused', label: 'Tạm dừng' },
              { value: 'expired', label: 'Hết hạn' },
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
        scroll={{ x: 1000 }}
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
            label="Mã giảm giá"
            name="code"
            rules={[{ required: true, message: 'Nhập mã giảm giá' }]}
          >
            <Input placeholder="Ví dụ: SALE10" disabled={!!editing} />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input placeholder="Ví dụ: Giảm 10% toàn bộ" />
          </Form.Item>

          <Form.Item
            label="Phạm vi áp dụng"
            name="category"
            rules={[{ required: true, message: 'Chọn loại voucher' }]}
          >
            <Select
              options={[
                { value: 'order', label: 'Giảm tiền hàng (Order)' },
                { value: 'free_shipping', label: 'Miễn phí vận chuyển (Free Shipping)' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị giảm"
            name="discount_type"
            rules={[{ required: true, message: 'Chọn đơn vị giảm' }]}
          >
            <Select
              options={[
                { value: 'percent', label: 'Phần trăm (%)' },
                { value: 'fixed_amount', label: 'Số tiền cố định (đ)' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Giá trị giảm"
            name="discount_value"
            rules={[{ required: true, message: 'Nhập giá trị giảm' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Giá trị (% hoặc số tiền VNĐ)" />
          </Form.Item>

          <Form.Item label="Đơn hàng tối thiểu " name="min_order_value">
            <InputNumber min={0} step={10000} style={{ width: '100%' }} placeholder="Để trống nếu không yêu cầu" />
          </Form.Item>

          <Form.Item label="Giảm tối đa" name="max_discount">
            <InputNumber min={0} step={10000} style={{ width: '100%' }} placeholder="Số tiền giảm tối đa (cho loại phần trăm)" />
          </Form.Item>

          <Form.Item label="Giới hạn số lượt dùng" name="usage_limit">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Để trống nếu không giới hạn" />
          </Form.Item>

          <Form.Item label="Ngày bắt đầu hiệu lực " name="valid_from">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" />
          </Form.Item>

          <Form.Item label="Hạn sử dụng / Ngày kết thúc " name="valid_until">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày kết thúc" />
          </Form.Item>

          <Form.Item label="Đang hoạt động" name="is_active" valuePropName="checked">
            <Switch checkedChildren="Chạy" unCheckedChildren="Dừng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

