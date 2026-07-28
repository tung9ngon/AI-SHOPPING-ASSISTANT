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
import { PlusOutlined, StarFilled } from '@ant-design/icons';
import { adminCategoryApi, adminProductApi } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import type { Category } from '../../types';
import { formatVND } from '../../utils/format';
import './ProductListPage.css';

const PAGE_SIZE = 18;

interface AdminProductRow {
  id: string;
  name: string;
  category_id?: string | null;
  category?: string | { id: string; name: string } | null;
  brand: string | null;
  price: number;
  rating: string | number | null;
  is_active: boolean;
  description?: string | null;
  thumbnail?: string | null;
}

interface ProductFormValues {
  name: string;
  brand?: string;
  category_id?: string;
  price: number;
  description?: string;
  is_active: boolean;
}

const SAMPLE_PRODUCTS: AdminProductRow[] = [
  ['Laptop UltraBook Pro 14 M3', 'Apple', 'Laptop', 34990000, 4.9, '#2b1b6f'],
  ['Điện thoại Galaxy S25 Ultra', 'Samsung', 'Điện thoại', 29990000, 4.8, '#155e75'],
  ['Laptop Gaming ROG Strix G16', 'Asus', 'Laptop', 41500000, 4.7, '#312e81'],
  ['Điện thoại iPhone 16 Pro', 'Apple', 'Điện thoại', 27990000, 4.9, '#0e7490'],
  ['Tai nghe WH-1000XM5', 'Sony', 'Tai nghe', 7990000, 4.8, '#23805f'],
  ['Đồng hồ Watch Series 10', 'Apple', 'Đồng hồ thông minh', 10990000, 4.7, '#8a4536'],
  ['Màn hình UltraSharp 27 4K', 'Dell', 'Màn hình', 12490000, 4.6, '#1f4b7a'],
  ['Điện thoại Redmi Note 14 Pro', 'Xiaomi', 'Điện thoại', 8490000, 4.5, '#155e75'],
  ['Chuột không dây MX Master 3S', 'Logitech', 'Phụ kiện', 2490000, 4.9, '#444444'],
  ['Tablet Galaxy Tab S10', 'Samsung', 'Tablet', 18990000, 4.6, '#5b2b82'],
  ['Laptop XPS 13 Plus', 'Dell', 'Laptop', 31990000, 4.5, '#312e81'],
  ['Tai nghe AirPods Pro 3', 'Apple', 'Tai nghe', 6490000, 4.8, '#23805f'],
  ['Máy ảnh Alpha A7 IV', 'Sony', 'Máy ảnh', 54990000, 4.9, '#7a2f68'],
  ['Màn hình Gaming 27 240Hz', 'LG', 'Màn hình', 9990000, 4.7, '#1f4b7a'],
  ['Bàn phím cơ MX Keys', 'Logitech', 'Phụ kiện', 3290000, 4.6, '#444444'],
  ['Đồng hồ Galaxy Watch 7', 'Samsung', 'Đồng hồ thông minh', 7490000, 4.5, '#8a4536'],
  ['Điện thoại Galaxy A55', 'Samsung', 'Điện thoại', 9990000, 4.4, '#155e75'],
  ['Tablet iPad Air M2', 'Apple', 'Tablet', 16990000, 4.8, '#5b2b82'],
].map(([name, brand, category, price, rating, color], index) => ({
  id: `sample-product-${index}`,
  name: String(name),
  brand: String(brand),
  category: String(category),
  price: Number(price),
  rating: Number(rating),
  is_active: true,
  thumbnail: String(color),
}));

function productCategoryName(product: AdminProductRow) {
  if (!product.category) return '-';
  if (typeof product.category === 'string') return product.category;
  return product.category.name;
}

function productThumb(product: AdminProductRow) {
  const source = product.thumbnail;
  if (source?.startsWith('http')) {
    return <img src={source} alt={product.name} className="admin-product-thumb-img" />;
  }

  return (
    <span
      className="admin-product-thumb-fallback"
      style={{ background: source || '#2b1b6f' }}
      aria-label={product.name}
    >
      ẢNH
    </span>
  );
}

function normalizeProduct(raw: unknown): AdminProductRow {
  const item = raw as AdminProductRow & {
    isActive?: boolean;
    category_name?: string;
    image?: string | null;
  };

  return {
    ...item,
    category: item.category ?? item.category_name ?? null,
    price: Number(item.price ?? 0),
    rating: item.rating ?? null,
    is_active: item.is_active ?? item.isActive ?? false,
    thumbnail: item.thumbnail ?? item.image ?? null,
  };
}

export default function ProductListPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ProductFormValues>();
  const [items, setItems] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [fallbackReason, setFallbackReason] = useState('');

  const isSampleMode = !!fallbackReason;

  const sampleBrands = useMemo(
    () => Array.from(new Set(SAMPLE_PRODUCTS.map((product) => product.brand).filter(Boolean))) as string[],
    [],
  );

  const brandOptions = useMemo(() => {
    const fromItems = items.map((product) => product.brand).filter(Boolean) as string[];
    return Array.from(new Set([...sampleBrands, ...fromItems])).map((value) => ({
      value,
      label: value,
    }));
  }, [items, sampleBrands]);

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      categoryId,
      brand,
      page,
      limit: PAGE_SIZE,
      sort: 'newest',
    }),
    [brand, categoryId, page, search],
  );

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await adminProductApi.list(query);
      const rows = (res.data.items ?? res.data.data ?? []).map(normalizeProduct);
      setItems(rows);
      setTotal(res.data.total ?? rows.length);
      setFallbackReason('');
    } catch (err) {
      const reason = getErrorMessage(err);
      const categoryName = categories.find((category) => category.id === categoryId)?.name;
      const filtered = SAMPLE_PRODUCTS.filter((product) => {
        const matchesSearch = !query.search || product.name.toLowerCase().includes(query.search.toLowerCase());
        const matchesCategory = !categoryName || productCategoryName(product) === categoryName;
        const matchesBrand = !brand || product.brand === brand;
        return matchesSearch && matchesCategory && matchesBrand;
      });
      setItems(filtered);
      setTotal(filtered.length);
      setFallbackReason(reason);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminCategoryApi
      .list({ limit: 100 })
      .then((res) => setCategories((res.data.items ?? res.data.data ?? []) as Category[]))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categories]);

  const openCreateModal = () => {
    setEditing(null);
    form.setFieldsValue({
      name: '',
      brand: '',
      category_id: undefined,
      price: 0,
      description: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (product: AdminProductRow) => {
    setEditing(product);
    const productCategory =
      typeof product.category === 'object' && product.category ? product.category.id : product.category_id ?? undefined;
    form.setFieldsValue({
      name: product.name,
      brand: product.brand ?? '',
      category_id: productCategory,
      price: Number(product.price ?? 0),
      description: product.description ?? '',
      is_active: product.is_active,
    });
    setModalOpen(true);
  };

  const submitProduct = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await adminProductApi.update(editing.id, {
          name: values.name.trim(),
          price: values.price,
          description: values.description?.trim() || '',
          is_active: values.is_active,
        });
        message.success('Đã cập nhật sản phẩm');
      } else {
        await adminProductApi.create({
          name: values.name.trim(),
          category_id: values.category_id,
          brand: values.brand?.trim() || '',
          price: values.price,
          description: values.description?.trim() || '',
          is_active: values.is_active,
        });
        message.success('Đã thêm sản phẩm');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product: AdminProductRow) => {
    try {
      await adminProductApi.remove(product.id);
      message.success('Đã ẩn sản phẩm');
      loadProducts();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const columns: ColumnsType<AdminProductRow> = [
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      width: 100,
      render: (_, record) => productThumb(record),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (name: string) => <span className="admin-product-name">{name}</span>,
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand',
      width: 190,
      render: (value: string | null) => value || '-',
    },
    {
      title: 'Danh mục',
      key: 'category',
      width: 210,
      render: (_, record) => <span className="admin-product-category">{productCategoryName(record)}</span>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      width: 190,
      render: (value: number) => <span className="admin-product-price">{formatVND(value)}</span>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      width: 130,
      render: (value: string | number | null) => (
        <span className="admin-product-rating">
          <StarFilled /> {value ?? '-'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 170,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Đang bán' : 'Ngừng bán'}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <div className="admin-product-actions">
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Ẩn sản phẩm này?"
            description="Sản phẩm sẽ chuyển sang trạng thái ngừng bán."
            okText="Ẩn"
            cancelText="Huỷ"
            disabled={isSampleMode}
            onConfirm={() => removeProduct(record)}
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
    <div className="admin-product-page">
      {fallbackReason && (
        <div className="admin-product-note">Đang hiển thị dữ liệu mẫu: {fallbackReason}</div>
      )}

      <div className="admin-product-toolbar">
        <div className="admin-product-filters">
          <Input.Search
            allowClear
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            className="admin-product-search"
          />
          <Select
            allowClear
            placeholder="Tất cả danh mục"
            value={categoryId}
            onChange={(value) => {
              setCategoryId(value);
              setPage(1);
            }}
            className="admin-product-select"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          />
          <Select
            allowClear
            placeholder="Tất cả thương hiệu"
            value={brand}
            onChange={(value) => {
              setBrand(value);
              setPage(1);
            }}
            className="admin-product-select"
            options={brandOptions}
          />
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm sản phẩm
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        className="admin-product-table"
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
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={modalOpen}
        okText={editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
        cancelText="Huỷ"
        confirmLoading={saving}
        onOk={submitProduct}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="admin-product-form">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
          >
            <Input placeholder="Ví dụ: Laptop UltraBook Pro 14 M3" />
          </Form.Item>

          <Form.Item label="Thương hiệu" name="brand">
            <Input placeholder="Ví dụ: Apple" disabled={!!editing} />
          </Form.Item>

          <Form.Item label="Danh mục" name="category_id">
            <Select
              allowClear
              placeholder="Chọn danh mục"
              disabled={!!editing}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: 'Nhập giá sản phẩm' }]}
          >
            <InputNumber min={0} step={10000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về sản phẩm" />
          </Form.Item>

          <Form.Item label="Đang bán" name="is_active" valuePropName="checked">
            <Switch checkedChildren="Bán" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
