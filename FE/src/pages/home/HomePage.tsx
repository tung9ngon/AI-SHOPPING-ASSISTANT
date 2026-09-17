import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Col, Empty, Row, Skeleton } from 'antd';
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  DownOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  TagOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/categories';
import { productApi, type ProductListItem } from '../../api/products';
import { getItems, type Category } from '../../types';
import ProductCard from '../../components/ProductCard';
import ScrollReveal from '../../components/ScrollReveal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import './HomePage.css';

// Icon danh mục: backend trả về emoji hoặc URL ảnh.
function CategoryIcon({ icon }: { icon: string | null }) {
  if (icon && /^https?:\/\//.test(icon)) {
    return <img src={icon} alt="" loading="lazy" />;
  }
  return <span aria-hidden="true">{icon || <AppstoreOutlined />}</span>;
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

  // Một con chim Lạc cách điệu, hướng bay sang trái.
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
    <div className="hero__drum" aria-hidden="true">
      <svg viewBox="0 0 440 440">
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
          return (
            <line
              key={`r${i}`}
              x1={C + 60 * Math.cos(a)}
              y1={C + 60 * Math.sin(a)}
              x2={C + 78 * Math.cos(a)}
              y2={C + 78 * Math.sin(a)}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Mặt trời 14 tia ở tâm */}
        <path d={star(14, 54, 20)} fill="currentColor" />
        <circle cx={C} cy={C} r="12" fill="none" stroke="var(--ink-900)" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

const COMMITMENTS = [
  { icon: <ThunderboltOutlined />, title: 'Giao hàng hoả tốc', desc: 'Nội thành trong 2 giờ' },
  { icon: <SafetyCertificateOutlined />, title: 'Chính hãng 100%', desc: 'Bảo hành toàn quốc' },
  { icon: <BellOutlined />, title: 'Theo dõi giá', desc: 'Báo ngay khi giảm' },
  { icon: <CustomerServiceOutlined />, title: 'Hỗ trợ 24/7', desc: 'Tư vấn tận tâm' },
];

const CARD_COLS = { xs: 12, sm: 12, md: 8, lg: 6, xl: 6 };

// "Sản phẩm mới" chỉ hiện ~3 hàng (12 thẻ ở lưới 4 cột desktop) rồi thu gọn
// sau nút "Xem thêm" — trang chủ không bị một danh sách dài đẩy các khối
// phía dưới (thương hiệu, trợ lý AI) ra khỏi tầm mắt.
const NEW_COLLAPSED_COUNT = 12;
const NEW_FETCH_LIMIT = 24;

export default function HomePage() {
  useDocumentTitle('Trang chủ');

  const [categories, setCategories] = useState<Category[]>([]);
  const [newest, setNewest] = useState<ProductListItem[]>([]);
  const [showAllNew, setShowAllNew] = useState(false);
  const [bestPrice, setBestPrice] = useState<ProductListItem[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Phân biệt lỗi mạng với "shop chưa có dữ liệu" — tránh hiện "Chưa có sản phẩm" giả khi mất mạng.
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);
    Promise.all([
      categoryApi.list(),
      productApi.list({ sort: 'newest', limit: NEW_FETCH_LIMIT }),
      productApi.list({ sort: 'price_asc', limit: 4 }),
      productApi.brands(),
    ])
      .then(([catRes, newRes, cheapRes, brandRes]) => {
        if (ignore) return;
        setCategories(catRes.data);
        setNewest(getItems(newRes.data));
        setBestPrice(getItems(cheapRes.data));
        setBrands(brandRes.data);
      })
      .catch(() => {
        if (ignore) return;
        setError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="hero full-bleed" aria-labelledby="hero-title">
        <div className="hero__rings" aria-hidden="true" />
        <div className="hero__rays" aria-hidden="true" />
        <DongSonDrum />

        <div className="hero__content">
          <p className="hero__eyebrow">Trợ lý mua sắm đồ điện tử</p>
          <h1 id="hero-title" className="hero__title">
            Công nghệ <em>thế hệ mới</em>
          </h1>
          <p className="hero__sub">
            Laptop, điện thoại, thiết bị thông minh — chính hãng, giá tốt, kèm trợ lý AI
            gợi ý sản phẩm và theo dõi giảm giá tự động.
          </p>

          <div className="hero__actions">
            <button type="button" className="hero__cta" onClick={() => navigate('/products')}>
              Khám phá ngay <ArrowRightOutlined aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hero__cta hero__cta--ghost"
              onClick={() => navigate('/price-alerts')}
            >
              <BellOutlined aria-hidden="true" /> Theo dõi giá
            </button>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <b>10K+</b>
              <span>Sản phẩm</span>
            </div>
            <div className="hero__stat">
              <b>50K+</b>
              <span>Khách hàng</span>
            </div>
            <div className="hero__stat">
              <b>4.8★</b>
              <span>Đánh giá</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 24 }}
          message="Không tải được dữ liệu trang chủ"
          description="Có thể do mất kết nối tới máy chủ. Vui lòng thử lại."
          action={
            <Button size="small" danger onClick={reload}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* ===== Cam kết ===== */}
      <ScrollReveal>
        <div className={error ? 'commitments' : 'commitments commitments--overlap'}>
          {COMMITMENTS.map((c) => (
            <div className="commitment" key={c.title}>
              <span className="commitment__icon" aria-hidden="true">
                {c.icon}
              </span>
              <div>
                <b>{c.title}</b>
                <span>{c.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ===== Danh mục ===== */}
      <ScrollReveal>
        <section className="hsection" aria-labelledby="sec-cat">
          <div className="hsection__head">
            <h2 id="sec-cat" className="section-title">
              Danh mục nổi bật
            </h2>
          </div>
          {loading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : categories.length === 0 ? (
            <Empty description="Chưa có danh mục" />
          ) : (
            <div className="cats">
              {categories.map((c) => (
                <Link key={c.id} to={`/products?categoryId=${c.id}`} className="cat">
                  <span className="cat__icon">
                    <CategoryIcon icon={c.icon} />
                  </span>
                  <span className="cat__name">{c.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* ===== Giá tốt =====
          Dữ liệu là 4 sản phẩm có giá thấp nhất (sort=price_asc). Backend chưa
          có khái niệm khuyến mãi/giá gốc, nên phần này gọi đúng tên là "giá tốt"
          thay vì "deal hot" kèm đồng hồ đếm ngược như bản cũ — đếm ngược đó
          không gắn với chương trình khuyến mãi có thật nào. */}
      {!loading && bestPrice.length > 0 && (
        <ScrollReveal>
          <section className="hsection" aria-labelledby="sec-best">
            <div className="bestprice">
              <div className="hsection__head">
                <div>
                  <h2 id="sec-best" className="bestprice__title">
                    <TagOutlined className="bestprice__fire" aria-hidden="true" />
                    Giá tốt hôm nay
                  </h2>
                  <p className="hsection__sub">Những sản phẩm đang có mức giá thấp nhất tại NexTech</p>
                </div>
                <Link to="/products?sort=price_asc" className="hsection__link">
                  Xem tất cả <ArrowRightOutlined aria-hidden="true" />
                </Link>
              </div>
              <Row gutter={[16, 16]}>
                {bestPrice.map((p, i) => (
                  <Col key={p.id} {...CARD_COLS}>
                    <ScrollReveal delay={i * 60}>
                      <ProductCard product={p} />
                    </ScrollReveal>
                  </Col>
                ))}
              </Row>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ===== Sản phẩm mới ===== */}
      <ScrollReveal>
        <section className="hsection" aria-labelledby="sec-new">
          <div className="hsection__head">
            <h2 id="sec-new" className="section-title">
              Sản phẩm mới
            </h2>
            <Link to="/products" className="hsection__link">
              Xem tất cả <ArrowRightOutlined aria-hidden="true" />
            </Link>
          </div>
          {loading ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Col key={i} {...CARD_COLS}>
                  {/* Khung xương giữ đúng tỉ lệ thẻ thật để nội dung không nhảy
                      khi tải xong (giữ CLS thấp). */}
                  <div className="pcard" style={{ padding: 16 }}>
                    <Skeleton.Image active style={{ width: '100%', height: 130 }} />
                    <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
                  </div>
                </Col>
              ))}
            </Row>
          ) : newest.length === 0 ? (
            <Empty description="Chưa có sản phẩm" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {(showAllNew ? newest : newest.slice(0, NEW_COLLAPSED_COUNT)).map((p, i) => (
                  <Col key={p.id} {...CARD_COLS}>
                    <ScrollReveal delay={(i % NEW_COLLAPSED_COUNT) * 50}>
                      <ProductCard product={p} />
                    </ScrollReveal>
                  </Col>
                ))}
              </Row>
              {newest.length > NEW_COLLAPSED_COUNT && (
                <div className="hsection__more">
                  {!showAllNew ? (
                    <button
                      type="button"
                      className="hsection__more-btn"
                      onClick={() => setShowAllNew(true)}
                    >
                      Xem thêm {newest.length - NEW_COLLAPSED_COUNT} sản phẩm
                      <DownOutlined aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hsection__more-btn"
                      onClick={() => navigate('/products')}
                    >
                      Xem tất cả sản phẩm <ArrowRightOutlined aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </ScrollReveal>

      {/* ===== Trợ lý AI ===== */}
      <ScrollReveal>
        <section className="hsection aiband" aria-labelledby="sec-ai">
          <span className="aiband__icon" aria-hidden="true">
            <RobotOutlined />
          </span>
          <div>
            <h2 id="sec-ai">Chưa biết chọn gì? Hỏi trợ lý AI</h2>
            <p>
              Mô tả nhu cầu và ngân sách bằng lời thường — trợ lý sẽ lọc giúp bạn những
              sản phẩm phù hợp nhất, so sánh cấu hình và theo dõi giá khi bạn cần.
            </p>
          </div>
          <button
            type="button"
            className="hero__cta"
            onClick={() => navigate('/products')}
          >
            Bắt đầu tìm <ArrowRightOutlined aria-hidden="true" />
          </button>
        </section>
      </ScrollReveal>

      {/* ===== Thương hiệu ===== */}
      {brands.length > 0 && (
        <ScrollReveal>
          <section className="hsection" style={{ marginBottom: 0 }} aria-labelledby="sec-brand">
            <div className="hsection__head">
              <div>
                <h2 id="sec-brand" className="section-title">
                  Thương hiệu nổi bật
                </h2>
                <p className="hsection__sub">
                  Hàng chính hãng từ các thương hiệu được tin dùng nhất
                </p>
              </div>
            </div>
            <div className="brands">
              {brands.map((b, i) => (
                <Link key={b} to={`/products?brand=${encodeURIComponent(b)}`} className="brand">
                  {/* Chữ cái đầu phóng to làm hoạ tiết nền — thuần trang trí */}
                  <span className="brand__mark" aria-hidden="true">
                    {b.charAt(0).toUpperCase()}
                  </span>
                  <span
                    className="brand__badge"
                    data-tone={i % 3}
                    aria-hidden="true"
                  >
                    {b.charAt(0).toUpperCase()}
                  </span>
                  <span className="brand__body">
                    <span className="brand__name">{b}</span>
                    <span className="brand__hint">
                      Xem sản phẩm <ArrowRightOutlined aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}
    </>
  );
}
