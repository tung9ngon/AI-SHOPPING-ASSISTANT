import { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
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
import { adminCategoryApi } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { Category } from '../../types';
import { formatDateShort } from '../../utils/format';
import './CategoryListPage.css';

const PAGE_SIZE = 8;

interface CategoryFormValues {
  name: string;
  icon?: string;
  sortOrder?: number;
  isActive: boolean;
}

const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'sample-laptop',
    name: 'Laptop',
    icon: '▥',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-01-12T00:00:00',
  },
  {
    id: 'sample-phone',
    name: 'Điện thoại',
    icon: '▥',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-02-12T00:00:00',
  },
  {
    id: 'sample-tablet',
    name: 'Tablet',
    icon: '▥',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-03-12T00:00:00',
  },
  {
    id: 'sample-watch',
    name: 'Đồng hồ thông minh',
    icon: '▥',
    sortOrder: 4,
    isActive: true,
    createdAt: '2026-04-12T00:00:00',
  },
  {
    id: 'sample-headphone',
    name: 'Tai nghe',
    icon: '▥',
    sortOrder: 5,
    isActive: true,
    createdAt: '2026-05-12T00:00:00',
  },
  {
    id: 'sample-monitor',
    name: 'Màn hình',
    icon: '▥',
    sortOrder: 6,
    isActive: true,
    createdAt: '2026-06-12T00:00:00',
  },
  {
    id: 'sample-camera',
    name: 'Máy ảnh',
    icon: '▥',
    sortOrder: 7,
    isActive: false,
    createdAt: '2026-07-12T00:00:00',
  },
  {
    id: 'sample-accessory',
    name: 'Phụ kiện',
    icon: '▥',
    sortOrder: 8,
    isActive: true,
    createdAt: '2026-08-12T00:00:00',
  },
];

function normalizeCategory(category: Category): Category {
  const raw = category as Category & {
    sort_order?: number;
    is_active?: boolean;
    created_at?: string;
  };

  return {
    ...category,
    sortOrder: category.sortOrder ?? raw.sort_order ?? 0,
    isActive: category.isActive ?? raw.is_active ?? false,
    createdAt: category.createdAt ?? raw.created_at ?? '',
  };
}

function categoryIcon(icon?: string | null) {
  return <span className="admin-category-icon">{icon || '▥'}</span>;
}

export default function CategoryListPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<CategoryFormValues>();
  const [items, setItems] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [fallbackReason, setFallbackReason] = useState('');

  const isSampleMode = !!fallbackReason;

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      isActive:
        activeFilter === 'all'
          ? undefined
          : activeFilter === 'active',
      page,
      limit: PAGE_SIZE,
    }),
    [activeFilter, page, search],
  );

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminCategoryApi.list(query);
      const nextItems = (res.data.items ?? res.data.data ?? []).map(normalizeCategory);
      setItems(nextItems);
      setTotal(res.data.total ?? nextItems.length);
      setFallbackReason('');
    } catch (err) {
      const reason = getErrorMessage(err);
      const filtered = SAMPLE_CATEGORIES.filter((category) => {
        const matchesSearch = !query.search || category.name.toLowerCase().includes(query.search.toLowerCase());
        const matchesStatus = query.isActive === undefined || category.isActive === query.isActive;
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
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const openCreateModal = () => {
    setEditing(null);
    form.setFieldsValue({
      name: '',
      icon: '',
      sortOrder: total + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditing(category);
    form.setFieldsValue({
      name: category.name,
      icon: category.icon ?? '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setModalOpen(true);
  };

  const submitCategory = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await adminCategoryApi.update(editing.id, {
          name: values.name.trim(),
          icon: values.icon?.trim() || '',
          sortOrder: values.sortOrder ?? 0,
          isActive: values.isActive,
        });
        message.success('Đã cập nhật danh mục');
      } else {
        await adminCategoryApi.create({
          name: values.name.trim(),
          icon: values.icon?.trim() || '',
          sortOrder: values.sortOrder ?? 0,
          isActive: values.isActive,
        });
        message.success('Đã thêm danh mục');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category: Category) => {
    try {
      await adminCategoryApi.remove(category.id);
      message.success('Đã ẩn danh mục');
      loadCategories();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      width: 120,
      render: categoryIcon,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (name: string) => <span className="admin-category-name">{name}</span>,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      width: 170,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 210,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Hiển thị' : 'Ẩn'}</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 240,
      render: (value: string) => <span className="admin-category-date">{formatDateShort(value)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <div className="admin-category-actions">
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Ẩn danh mục này?"
            description="Danh mục sẽ chuyển sang trạng thái ẩn."
            okText="Ẩn"
            cancelText="Huỷ"
            disabled={isSampleMode}
            onConfirm={() => removeCategory(record)}
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
    <div className="admin-category-page">
      {fallbackReason && (
        <div className="admin-category-note">Đang hiển thị dữ liệu mẫu: {fallbackReason}</div>
      )}

      <div className="admin-category-toolbar">
        <div className="admin-category-filters">
          <Input.Search
            allowClear
            placeholder="Tìm danh mục..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            className="admin-category-search"
          />
          <Select
            value={activeFilter}
            onChange={(value) => {
              setActiveFilter(value);
              setPage(1);
            }}
            className="admin-category-status"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Hiển thị' },
              { value: 'inactive', label: 'Ẩn' },
            ]}
          />
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm danh mục
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        className="admin-category-table"
        scroll={{ x: 750 }}
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
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
        open={modalOpen}
        okText={editing ? 'Lưu thay đổi' : 'Thêm danh mục'}
        cancelText="Huỷ"
        confirmLoading={saving}
        onOk={submitCategory}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="admin-category-form">
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Laptop" />
          </Form.Item>

          <Form.Item label="Icon" name="icon">
            <Input placeholder="Nhập emoji, ký hiệu hoặc URL icon" />
          </Form.Item>

          <Form.Item
            label="Thứ tự"
            name="sortOrder"
            rules={[{ required: true, message: 'Nhập thứ tự hiển thị' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Hiển thị" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
