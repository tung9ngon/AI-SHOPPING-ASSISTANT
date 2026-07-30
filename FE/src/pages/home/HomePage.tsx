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

// Mặt trống đồng Đông Sơn cách điệu: mặt trời 14 tia ở tâm, các vành hoa văn
// và một vành chim Lạc bay — dùng làm hoạ tiết quay ở giữa hero.
function DongSonDrum() {
  const C = 220; // tâm

  // Ngôi sao (mặt trời) nhiều cánh ở tâm.
  const star = (points: number, outerR: number, innerR: number) => {
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (Math.PI / points) * i - Math.PI / 2;
      const x = C + r * Math.cos(a);
      const y = C + r * Math.sin(a);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d + 'Z';
  };

  // Một con chim Lạc cách điệu, hướng bay sang trái (theo chiều kim đồng hồ ngược).
  const bird = (
    <g fill="currentColor">
      <polygon points="-25,-9 -13,-4 -14,-2" /> {/* mỏ */}
      <circle cx="-12" cy="-4" r="2.4" /> {/* đầu */}
      <ellipse cx="0" cy="0" rx="9" ry="3.4" /> {/* thân */}
      <polygon points="-3,-2 5,-18 10,-2" /> {/* cánh */}
      <polygon points="7,-1 19,1 7,2.5" /> {/* đuôi */}
      <path d="M3 3 L7 12 M6 3 L11 11" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </g>
  );

  const birdCount = 16;
  const birdRadius = 150;
  const dotCount = 40;
  const dotRadius = 108;

  return (
    <div className="home-hero__drum" aria-hidden="true">
      <svg viewBox="0 0 440 440">
        {/* Các vành trơn */}
        <circle cx={C} cy={C} r="205" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx={C} cy={C} r="196" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx={C} cy={C} r="130" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx={C} cy={C} r="86" fill="none" stroke="currentColor" strokeWidth="1.5" />

        {/* Vành chim Lạc bay */}
        {Array.from({ length: birdCount }).map((_, i) => (
          <g
            key={`b${i}`}
            transform={`rotate(${(360 / birdCount) * i} ${C} ${C}) translate(${C} ${C - birdRadius})`}
          >
            {bird}
          </g>
        ))}

        {/* Vành chấm tròn */}
        {Array.from({ length: dotCount }).map((_, i) => {
          const a = ((Math.PI * 2) / dotCount) * i;
          return (
            <circle
              key={`d${i}`}
              cx={C + dotRadius * Math.cos(a)}
              cy={C + dotRadius * Math.sin(a)}
              r="2.6"
              fill="currentColor"
            />
          );
        })}

        {/* Vành tia ngắn quanh mặt trời */}
        {Array.from({ length: 28 }).map((_, i) => {
          const a = ((Math.PI * 2) / 28) * i;
          const r1 = 60;
          const r2 = 78;
          return (
            <line
              key={`r${i}`}
              x1={C + r1 * Math.cos(a)}
              y1={C + r1 * Math.sin(a)}
              x2={C + r2 * Math.cos(a)}
              y2={C + r2 * Math.sin(a)}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Mặt trời 14 tia ở tâm */}
        <path d={star(14, 54, 20)} fill="currentColor" />
        <circle cx={C} cy={C} r="12" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      </svg>
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
    let ignore = false;
    Promise.all([
      categoryApi.list(),
      productApi.list({ sort: 'newest', limit: 10 }),
      productApi.list({ sort: 'price_asc', limit: 5 }),
      productApi.brands(),
    ])
      .then(([catRes, newRes, dealRes, brandRes]) => {
        if (ignore) return;
        setCategories(catRes.data);
        setNewest(getItems(newRes.data));
        setDeals(getItems(dealRes.data));
        setBrands(brandRes.data);
      })
      .catch(() => {
        // Lỗi mạng/server: giữ các mảng rỗng, các khu vực sẽ tự ẩn/hiện "Chưa có dữ liệu".
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="home-root">
      {/* ===== Hero banner cam ===== */}
      <section className="home-hero">
        <div className="home-hero__rings" />
        <div className="home-hero__rays" />
        <DongSonDrum />

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
