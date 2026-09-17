import { useEffect, useMemo, useState } from 'react';
import {
  App,
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Empty,
  Grid,
  InputNumber,
  Menu,
  Pagination,
  Row,
  Select,
  Skeleton,
} from 'antd';
import {
  ArrowLeftOutlined,
  ClearOutlined,
  CloseOutlined,
  FilterOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { categoryApi } from '../../api/categories';
import { productApi, type ProductListItem, type ProductQuery } from '../../api/products';
import { getErrorMessage } from '../../api/client';
import type { Category } from '../../types';
import ProductCard from '../../components/ProductCard';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatVND } from '../../utils/format';
import './ProductsPage.css';

const { useBreakpoint } = Grid;

const PAGE_SIZE = 12;
const CARD_COLS = { xs: 12, sm: 12, md: 8, lg: 8, xl: 6 };

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
];

export default function ProductsPage() {
  useDocumentTitle('Sản phẩm');
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isNarrow = !screens.lg;
  const navigate = useNavigate();

  // Quay lại trang trước nếu người dùng đến từ trong site (react-router đánh
  // idx > 0 vào history.state); vào thẳng bằng link ngoài thì về trang chủ.
  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/');
  };

  // URL là "nguồn sự thật" của bộ lọc -> chia sẻ link giữ nguyên bộ lọc,
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

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Bộ lọc giá nhập cục bộ, chỉ áp dụng khi bấm nút.
  const [minPrice, setMinPrice] = useState<number | null>(query.minPrice ?? null);
  const [maxPrice, setMaxPrice] = useState<number | null>(query.maxPrice ?? null);

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data)).catch(() => setCategories([]));
    productApi.brands().then((res) => setBrands(res.data)).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    // Cờ ignore: bỏ qua kết quả trả về muộn khi user đổi bộ lọc nhanh
    // (tránh lưới hiện nhầm kết quả của bộ lọc trước).
    let ignore = false;
    setLoading(true);
    productApi
      .list(query)
      .then((res) => {
        if (ignore) return;
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch((err) => {
        if (ignore) return;
        setItems([]);
        setTotal(0);
        message.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    // Đồng bộ lại ô nhập giá khi URL đổi (vd bấm "Xoá bộ lọc").
    setMinPrice(query.minPrice ?? null);
    setMaxPrice(query.maxPrice ?? null);
    return () => {
      ignore = true;
    };
  }, [query, message]);

  const clearAll = () =>
    updateParams({
      search: undefined,
      categoryId: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });

  // Danh sách điều kiện đang áp dụng, để hiện thành chip gỡ được từng cái.
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (query.search) {
    activeChips.push({
      key: 'search',
      label: `Từ khoá: ${query.search}`,
      clear: () => updateParams({ search: undefined }),
    });
  }
  if (query.categoryId) {
    const cat = categories.find((c) => c.id === query.categoryId);
    activeChips.push({
      key: 'cat',
      label: `Danh mục: ${cat?.name ?? query.categoryId}`,
      clear: () => updateParams({ categoryId: undefined }),
    });
  }
  if (query.brand) {
    activeChips.push({
      key: 'brand',
      label: `Thương hiệu: ${query.brand}`,
      clear: () => updateParams({ brand: undefined }),
    });
  }
  if (query.minPrice != null || query.maxPrice != null) {
    const from = query.minPrice != null ? formatVND(query.minPrice) : '0₫';
    const to = query.maxPrice != null ? formatVND(query.maxPrice) : 'không giới hạn';
    activeChips.push({
      key: 'price',
      label: `Giá: ${from} – ${to}`,
      clear: () => updateParams({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  const filterPanel = (
    <div className="pfilter">
      <div className="pfilter__head">
        <span className="pfilter__title">
          <FilterOutlined aria-hidden="true" /> Bộ lọc
        </span>
        {activeChips.length > 0 && (
          <Button type="link" size="small" icon={<ClearOutlined />} onClick={clearAll}>
            Xoá hết
          </Button>
        )}
      </div>

      <div className="pfilter__group">
        <span className="pfilter__label">Danh mục</span>
        <Menu
          mode="inline"
          style={{ border: 'none', background: 'transparent' }}
          selectedKeys={query.categoryId ? [query.categoryId] : ['all']}
          onClick={({ key }) => {
            updateParams({ categoryId: key === 'all' ? undefined : key });
            setFilterOpen(false);
          }}
          items={[
            { key: 'all', label: 'Tất cả' },
            ...categories.map((c) => ({ key: c.id, label: c.name })),
          ]}
        />
      </div>

      <div className="pfilter__group">
        <label className="pfilter__label" htmlFor="filter-brand">
          Thương hiệu
        </label>
        <Select
          id="filter-brand"
          allowClear
          placeholder="Tất cả thương hiệu"
          style={{ width: '100%' }}
          value={query.brand}
          onChange={(v) => updateParams({ brand: v })}
          options={brands.map((b) => ({ value: b, label: b }))}
        />
      </div>

      <div className="pfilter__group">
        <span className="pfilter__label">Khoảng giá (₫)</span>
        <div className="pfilter__range">
          <InputNumber
            placeholder="Từ"
            min={0}
            step={1_000_000}
            value={minPrice}
            onChange={setMinPrice}
            style={{ flex: 1, minWidth: 0 }}
            aria-label="Giá thấp nhất"
          />
          <span aria-hidden="true">—</span>
          <InputNumber
            placeholder="Đến"
            min={0}
            step={1_000_000}
            value={maxPrice}
            onChange={setMaxPrice}
            style={{ flex: 1, minWidth: 0 }}
            aria-label="Giá cao nhất"
          />
        </div>
        <Button
          block
          onClick={() => {
            updateParams({ minPrice: minPrice ?? undefined, maxPrice: maxPrice ?? undefined });
            setFilterOpen(false);
          }}
        >
          Áp dụng khoảng giá
        </Button>
      </div>
    </div>
  );

  const currentCategory = query.categoryId
    ? categories.find((c) => c.id === query.categoryId)
    : null;

  return (
    <div>
      {/* Nút quay lại + breadcrumb: trước đây muốn thoát trang này chỉ còn
          cách bấm logo trên header — bổ sung đường lui rõ ràng. */}
      <div className="pback">
        <button
          type="button"
          className="pback__btn"
          onClick={goBack}
          aria-label="Quay lại trang trước"
        >
          <ArrowLeftOutlined aria-hidden="true" />
        </button>
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/">
                  <HomeOutlined /> Trang chủ
                </Link>
              ),
            },
            currentCategory
              ? { title: <Link to="/products">Sản phẩm</Link> }
              : { title: 'Sản phẩm' },
            ...(currentCategory ? [{ title: currentCategory.name }] : []),
          ]}
        />
      </div>

      <div className="plist">
      {filterPanel}

      <div>
        <div className="ptoolbar">
          <h1 className="ptoolbar__title">
            {query.search ? `Kết quả cho “${query.search}”` : 'Sản phẩm'}{' '}
            <span className="ptoolbar__count">({total})</span>
          </h1>

          <div className="ptoolbar__actions">
            {isNarrow && (
              <Button
                className="pfilter-trigger"
                icon={<FilterOutlined />}
                onClick={() => setFilterOpen(true)}
              >
                Bộ lọc{activeChips.length > 0 ? ` (${activeChips.length})` : ''}
              </Button>
            )}
            <Select
              value={query.sort}
              style={{ width: 190 }}
              onChange={(v) => updateParams({ sort: v })}
              options={SORT_OPTIONS}
              aria-label="Sắp xếp theo"
            />
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="pchips">
            {activeChips.map((c) => (
              <span className="pchip" key={c.key}>
                {c.label}
                <button type="button" onClick={c.clear} aria-label={`Bỏ điều kiện ${c.label}`}>
                  <CloseOutlined aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Col key={i} {...CARD_COLS}>
                {/* Khung xương đúng hình dạng thẻ thật để lưới không nhảy khi tải xong */}
                <div className="pcard" style={{ padding: 16 }}>
                  <Skeleton.Image active style={{ width: '100%', height: 130 }} />
                  <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
                </div>
              </Col>
            ))}
          </Row>
        ) : items.length === 0 ? (
          <Empty
            style={{ marginTop: 64 }}
            description={
              activeChips.length > 0
                ? 'Không có sản phẩm nào khớp với bộ lọc hiện tại'
                : 'Chưa có sản phẩm nào'
            }
          >
            {activeChips.length > 0 && (
              <Button type="primary" onClick={clearAll}>
                Xoá bộ lọc
              </Button>
            )}
          </Empty>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {items.map((p) => (
                <Col key={p.id} {...CARD_COLS}>
                  <ProductCard product={p} />
                </Col>
              ))}
            </Row>
            {total > PAGE_SIZE && (
              <div className="ppagination">
                <Pagination
                  current={query.page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  showSizeChanger={false}
                  onChange={(page) => {
                    updateParams({ page });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      </div>

      <Drawer
        title="Bộ lọc sản phẩm"
        placement="left"
        width={300}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        {filterPanel}
      </Drawer>
    </div>
  );
}
