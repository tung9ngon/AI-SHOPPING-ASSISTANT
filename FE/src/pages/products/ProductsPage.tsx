import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  InputNumber,
  Menu,
  Pagination,
  Row,
  Select,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import { ClearOutlined, FilterOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { categoryApi } from '../../api/categories';
import { productApi, type ProductListItem, type ProductQuery } from '../../api/products';
import type { Category } from '../../types';
import ProductCard from '../../components/ProductCard';

const { Title, Text } = Typography;

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'rating_desc', label: 'Đánh giá cao' },
];

export default function ProductsPage() {
  // URL là "nguồn sự thật" của bộ lọc -> share link giữ nguyên bộ lọc,
  // và ô tìm kiếm trên header (điều hướng /products?search=...) hoạt động ngay.
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo<ProductQuery>(() => {
    const num = (k: string) => {
      const v = searchParams.get(k);
      return v != null && v !== '' ? Number(v) : undefined;
    };
    return {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      brand: searchParams.get('brand') || undefined,
      minPrice: num('minPrice'),
      maxPrice: num('maxPrice'),
      sort: (searchParams.get('sort') as ProductQuery['sort']) || 'newest',
      page: num('page') ?? 1,
      limit: PAGE_SIZE,
    };
  }, [searchParams]);

  // Cập nhật URL; đổi bộ lọc thì quay về trang 1.
  const updateParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, String(v));
    }
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  };

  // ---- Dữ liệu ----
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Bộ lọc giá nhập cục bộ, chỉ áp dụng khi bấm nút.
  const [minPrice, setMinPrice] = useState<number | null>(query.minPrice ?? null);
  const [maxPrice, setMaxPrice] = useState<number | null>(query.maxPrice ?? null);

  useEffect(() => {
    // Dữ liệu cho sidebar: danh mục + thương hiệu (tải 1 lần).
    categoryApi.list().then((res) => setCategories(res.data));
    productApi.brands().then((res) => setBrands(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi
      .list(query)
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .finally(() => setLoading(false));
    // Đồng bộ lại ô nhập giá khi URL đổi (vd bấm "Xoá bộ lọc").
    setMinPrice(query.minPrice ?? null);
    setMaxPrice(query.maxPrice ?? null);
  }, [query]);

  const hasFilter =
    query.search || query.categoryId || query.brand || query.minPrice != null || query.maxPrice != null;

  return (
    <Row gutter={[24, 24]}>
      {/* ===== Sidebar bộ lọc ===== */}
      <Col xs={24} md={7} lg={6} xl={5}>
        <Card
          title={
            <>
              <FilterOutlined /> Bộ lọc
            </>
          }
          extra={
            hasFilter && (
              <Button
                type="link"
                size="small"
                icon={<ClearOutlined />}
                onClick={() =>
                  updateParams({
                    search: undefined,
                    categoryId: undefined,
                    brand: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                  })
                }
              >
                Xoá
              </Button>
            )
          }
        >
          <Text strong>Danh mục</Text>
          <Menu
            mode="inline"
            style={{ border: 'none', marginBottom: 16 }}
            selectedKeys={query.categoryId ? [query.categoryId] : ['all']}
            onClick={({ key }) =>
              updateParams({ categoryId: key === 'all' ? undefined : key })
            }
            items={[
              { key: 'all', label: 'Tất cả' },
              ...categories.map((c) => ({ key: c.id, label: c.name })),
            ]}
          />

          <Text strong>Thương hiệu</Text>
          <Select
            allowClear
            placeholder="Chọn thương hiệu"
            style={{ width: '100%', margin: '8px 0 16px' }}
            value={query.brand}
            onChange={(v) => updateParams({ brand: v })}
            options={brands.map((b) => ({ value: b, label: b }))}
          />

          <Text strong>Khoảng giá (₫)</Text>
          <Space style={{ margin: '8px 0' }}>
            <InputNumber
              placeholder="Từ"
              min={0}
              value={minPrice}
              onChange={setMinPrice}
              style={{ width: 100 }}
            />
            <span>—</span>
            <InputNumber
              placeholder="Đến"
              min={0}
              value={maxPrice}
              onChange={setMaxPrice}
              style={{ width: 100 }}
            />
          </Space>
          <Button
            block
            onClick={() =>
              updateParams({
                minPrice: minPrice ?? undefined,
                maxPrice: maxPrice ?? undefined,
              })
            }
          >
            Áp dụng giá
          </Button>
        </Card>
      </Col>

      {/* ===== Danh sách ===== */}
      <Col xs={24} md={17} lg={18} xl={19}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {query.search ? (
              <>
                Kết quả cho “{query.search}” <Text type="secondary">({total})</Text>
              </>
            ) : (
              <>
                Sản phẩm <Text type="secondary">({total})</Text>
              </>
            )}
          </Title>
          <Select
            value={query.sort}
            style={{ width: 160 }}
            onChange={(v) => updateParams({ sort: v })}
            options={SORT_OPTIONS}
          />
        </div>

        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Col key={i} xs={12} sm={12} md={12} lg={8} xl={6}>
                <Card>
                  <Skeleton active />
                </Card>
              </Col>
            ))}
          </Row>
        ) : items.length === 0 ? (
          <Empty description="Không tìm thấy sản phẩm phù hợp" style={{ marginTop: 60 }} />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {items.map((p) => (
                <Col key={p.id} xs={12} sm={12} md={12} lg={8} xl={6}>
                  <ProductCard product={p} />
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={query.page}
                pageSize={PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                onChange={(page) => updateParams({ page })}
              />
            </div>
          </>
        )}
      </Col>
    </Row>
  );
}
