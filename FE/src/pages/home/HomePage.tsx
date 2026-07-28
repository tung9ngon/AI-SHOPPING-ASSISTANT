import { useEffect, useState } from 'react';
import { Col, Empty, Row, Skeleton, Card } from 'antd';
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
import { getItems, type Category } from '../../types';
import ProductCard from '../../components/ProductCard';
import ScrollReveal from '../../components/ScrollReveal';
import './HomePage.css';

// Icon danh mục: emoji hoặc URL ảnh.
function CategoryIcon({ icon }: { icon: string | null }) {
  if (icon && /^https?:\/\//.test(icon)) {
    return <img src={icon} alt="" />;
  }
  return <span>{icon || <AppstoreOutlined />}</span>;
}

// Đồng hồ đếm ngược tới hết ngày.
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
    const id = setInterval(() => setT(calc), 1000);
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
      productApi.list({ sort: 'price_asc', limit: 5 }),
      productApi.brands(),
    ])
      .then(([catRes, newRes, dealRes, brandRes]) => {
        setCategories(catRes.data);
        setNewest(getItems(newRes.data));
        setDeals(getItems(dealRes.data));
        setBrands(brandRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-root">
      {/* ===== Hero banner cam ===== */}
      <section className="home-hero">
        <div className="home-hero__rings" />
        <div className="home-hero__rays" />

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
              <span>Sản phẩm</span>
            </div>
            <div className="home-hero__stat">
              <b>50K+</b>
              <span>Khách hàng</span>
            </div>
            <div className="home-hero__stat">
              <b>4.8★</b>
              <span>Đánh giá</span>
            </div>
          </div>
        </div>
      </section>

      <div className="home-container brand-bg">
        {/* ===== Dải cam kết ===== */}
        <ScrollReveal>
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
        </ScrollReveal>

        {/* ===== Danh mục — icon tròn cuộn ngang ===== */}
        <ScrollReveal>
          <div className="home-section">
            <div className="home-section__head">
              <h2 className="home-section-title">Danh mục nổi bật</h2>
            </div>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : categories.length === 0 ? (
              <Empty description="Chưa có danh mục" />
            ) : (
              <div className="home-categories-scroll">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/products?categoryId=${c.id}`}
                    className="home-cat-item"
                  >
                    <div className="home-cat-icon">
                      <CategoryIcon icon={c.icon} />
                    </div>
                    <div className="home-cat-name">{c.name}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ===== Deal hot hôm nay ===== */}
        {!loading && deals.length > 0 && (
          <ScrollReveal>
            <div className="home-section">
              <div className="home-deal brand-bg brand-bg--soft">
                <div className="home-deal__head">
                  <h2 className="home-deal__title">
                    <FireOutlined className="home-deal__fire" />
                    Deal hot hôm nay
                  </h2>
                  <DealCountdown />
                </div>
                <Row gutter={[16, 16]}>
                  {deals.map((p, i) => (
                    <Col key={p.id} xs={12} sm={8} md={8} lg={6}>
                      <ScrollReveal delay={i * 80}>
                        <ProductCard product={p} />
                      </ScrollReveal>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ===== Sản phẩm mới ===== */}
        <ScrollReveal>
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
                {newest.map((p, i) => (
                  <Col key={p.id} xs={12} sm={12} md={8} lg={6}>
                    <ScrollReveal delay={i * 60}>
                      <ProductCard product={p} />
                    </ScrollReveal>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </ScrollReveal>

        {/* ===== Thương hiệu nổi bật ===== */}
        {brands.length > 0 && (
          <ScrollReveal>
            <div className="home-section" style={{ marginBottom: 0 }}>
              <div className="home-section__head">
                <h2 className="home-section-title">Thương hiệu nổi bật</h2>
              </div>
              <div className="home-brands">
                {brands.map((b, i) => (
                  <ScrollReveal key={b} delay={i * 50}>
                    <Link to={`/products?brand=${encodeURIComponent(b)}`} className="home-brand">
                      <div className="home-brand__badge">{b.charAt(0).toUpperCase()}</div>
                      <div className="home-brand__name">{b}</div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
