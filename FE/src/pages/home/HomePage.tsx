import { useEffect, useState } from 'react';
import { Card, Col, Empty, Row, Skeleton } from 'antd';
import {
  ArrowRightOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/categories';
import { productApi, type ProductListItem } from '../../api/products';
import type { Category } from '../../types';
import ProductCard from '../../components/ProductCard';
import './HomePage.css';

// Icon danh mục có thể là emoji ("💻") hoặc URL ảnh -> render tương ứng.
function CategoryIcon({ icon }: { icon: string | null }) {
  if (icon && /^https?:\/\//.test(icon)) {
    return <img src={icon} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />;
  }
  return <span style={{ fontSize: 36 }}>{icon || <AppstoreOutlined />}</span>;
}

// Đồng hồ đếm ngược tới hết ngày (0h) — tạo cảm giác "deal trong ngày".
function DealCountdown() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="home-countdown">
      <span>Kết thúc sau</span>
      <b>{p(t.h)}</b>:<b>{p(t.m)}</b>:<b>{p(t.s)}</b>
    </div>
  );
}

const FEATURES = [
  { icon: <ThunderboltOutlined />, title: 'Giao hàng hoả tốc', desc: 'Nội thành 2 giờ' },
  { icon: <SafetyCertificateOutlined />, title: 'Chính hãng 100%', desc: 'Bảo hành toàn quốc' },
  { icon: <BellOutlined />, title: 'Theo dõi giá', desc: 'Báo khi giảm giá' },
  { icon: <CustomerServiceOutlined />, title: 'Hỗ trợ 24/7', desc: 'Tư vấn tận tâm' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newest, setNewest] = useState<ProductListItem[]>([]);
  const [deals, setDeals] = useState<ProductListItem[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      categoryApi.list(),
      productApi.list({ sort: 'newest', limit: 10 }),
      productApi.list({ sort: 'price_asc', limit: 5 }), // "deal" = giá tốt nhất
      productApi.brands(),
    ])
      .then(([catRes, newRes, dealRes, brandRes]) => {
        setCategories(catRes.data);
        setNewest(newRes.data.items ?? []);
        setDeals(dealRes.data.items ?? []);
        setBrands(brandRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-root">
      {/* ===== Hero công nghệ ===== */}
      <section className="home-hero">
        <div className="home-hero__rings" />
        <div className="home-hero__rays" />
        <div className="home-hero__core" />
        <div className="home-hero__globe" />

        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Trợ lý mua sắm đồ điện tử</p>
          <h1 className="home-hero__title">
            Công nghệ <b>thế hệ mới</b>
          </h1>
          <p className="home-hero__sub">
            Laptop, điện thoại, thiết bị thông minh — chính hãng, giá tốt, kèm trợ lý AI
            gợi ý sản phẩm và theo dõi giảm giá tự động.
          </p>
          <button className="home-hero__cta" onClick={() => navigate('/products')}>
            Khám phá ngay <ArrowRightOutlined />
          </button>

          <div className="home-hero__stats">
            <div className="home-hero__stat">
              <b>10K+</b>
              <span>Sản phẩm công nghệ</span>
            </div>
            <div className="home-hero__stat">
              <b>50K+</b>
              <span>Khách hàng tin dùng</span>
            </div>
            <div className="home-hero__stat">
              <b>4.8★</b>
              <span>Đánh giá trung bình</span>
            </div>
          </div>
        </div>
      </section>

      <div className="home-container">
        {/* ===== Dải cam kết ===== */}
        <div className="home-features">
          {FEATURES.map((f) => (
            <div className="home-feature" key={f.title}>
              {f.icon}
              <div>
                <b>{f.title}</b>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Danh mục ===== */}
        <div className="home-section">
          <div className="home-section__head">
            <h2 className="home-section-title">Danh mục nổi bật</h2>
          </div>
          {loading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : categories.length === 0 ? (
            <Empty description="Chưa có danh mục" />
          ) : (
            <Row gutter={[16, 16]}>
              {categories.map((c) => (
                <Col key={c.id} xs={12} sm={8} md={6} lg={4}>
                  <Link to={`/products?categoryId=${c.id}`}>
                    <Card hoverable className="home-cat-card" styles={{ body: { padding: 18 } }}>
                      <CategoryIcon icon={c.icon} />
                      <div style={{ marginTop: 10, fontWeight: 600 }}>{c.name}</div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* ===== Deal hot hôm nay ===== */}
        {!loading && deals.length > 0 && (
          <div className="home-section">
            <div className="home-deal">
              <div className="home-deal__head">
                <h2 className="home-deal__title">
                  <FireOutlined className="home-deal__fire" style={{ color: '#ff6a00' }} />
                  Deal hot hôm nay
                </h2>
                <DealCountdown />
              </div>
              <Row gutter={[16, 16]}>
                {deals.map((p) => (
                  <Col key={p.id} xs={12} sm={12} md={8} lg={{ flex: '0 0 20%' }} style={{ maxWidth: '20%' }}>
                    <ProductCard product={p} dark />
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        )}

        {/* ===== Sản phẩm mới ===== */}
        <div className="home-section">
          <div className="home-section__head">
            <h2 className="home-section-title">Sản phẩm mới</h2>
            <Link to="/products" className="home-section__link">
              Xem tất cả <ArrowRightOutlined />
            </Link>
          </div>
          {loading ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Col key={i} xs={12} sm={12} md={8} lg={6}>
                  <Card>
                    <Skeleton active />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : newest.length === 0 ? (
            <Empty description="Chưa có sản phẩm" />
          ) : (
            <Row gutter={[16, 16]}>
              {newest.map((p) => (
                <Col key={p.id} xs={12} sm={12} md={8} lg={6}>
                  <ProductCard product={p} dark />
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* ===== Thương hiệu nổi bật ===== */}
        {brands.length > 0 && (
          <div className="home-section" style={{ marginBottom: 0 }}>
            <div className="home-section__head">
              <h2 className="home-section-title">Thương hiệu nổi bật</h2>
            </div>
            <div className="home-brands">
              {brands.map((b) => (
                <Link key={b} to={`/products?brand=${encodeURIComponent(b)}`} className="home-brand">
                  <div className="home-brand__badge">{b.charAt(0).toUpperCase()}</div>
                  <div className="home-brand__name">{b}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
