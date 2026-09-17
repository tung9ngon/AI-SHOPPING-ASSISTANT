import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  App,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Empty,
  InputNumber,
  Modal,
  Rate,
  Result,
  Select,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  CustomerServiceOutlined,
  HomeOutlined,
  LeftOutlined,
  PictureOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { productApi, type ProductListItem } from '../../api/products';
import { cartApi } from '../../api/cart';
import { priceAlertApi } from '../../api/priceAlerts';
import { getErrorMessage } from '../../api/client';
import type { NotifyChannel, Product, ProductImage } from '../../types';
import { formatVND } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard';
import ReviewsSection from './ReviewsSection';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import './ProductDetailPage.css';

const { Text, Paragraph } = Typography;

// Cam kết bán hàng — nội dung tĩnh, giống dải cam kết ở trang chủ.
const TRUST = [
  { icon: <SafetyCertificateOutlined />, text: 'Chính hãng, bảo hành toàn quốc' },
  { icon: <ThunderboltOutlined />, text: 'Giao hoả tốc nội thành trong 2 giờ' },
  { icon: <SyncOutlined />, text: 'Đổi trả trong 7 ngày nếu lỗi' },
  { icon: <CustomerServiceOutlined />, text: 'Tư vấn kỹ thuật 24/7' },
];

type ProductDetail = Product & { review_count: number };

// Ảnh primary đứng đầu, sau đó theo sort_order (BE không sort sẵn).
function sortImages(images: ProductImage[] = []): ProductImage[] {
  return [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const { isAuthenticated } = useAuth();
  const { refresh: refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // tăng để thử tải lại
  const [related, setRelated] = useState<ProductListItem[]>([]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // Dải "Sản phẩm tương tự" cuộn ngang; hai nút mũi tên đẩy ~80% bề rộng khung
  const relatedTrackRef = useRef<HTMLDivElement>(null);
  const scrollRelated = (dir: -1 | 1) => {
    const el = relatedTrackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  // Modal theo dõi giá
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertPrice, setAlertPrice] = useState<number | null>(null);
  // Mặc định 'email' vì BE hiện chỉ gửi thông báo thật qua email
  const [alertChannel, setAlertChannel] = useState<NotifyChannel>('email');
  const [alertSaving, setAlertSaving] = useState(false);

  useDocumentTitle(product?.name);

  useEffect(() => {
    if (!id) return;
    // Cờ ignore: huỷ kết quả của fetch cũ khi id đổi (tránh race condition
    // dữ liệu sản phẩm cũ đè lên sản phẩm mới khi điều hướng nhanh).
    let ignore = false;
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    setActiveImg(0);
    setQty(1);
    setRelated([]);
    setAlertOpen(false);
    productApi
      .detail(id)
      .then((res) => {
        if (ignore) return;
        setProduct(res.data);
        setAlertPrice(Number(res.data.price));
        // Sản phẩm cùng danh mục (loại trừ chính nó) — lấy nhiều hơn 4 vì danh
        // sách giờ cuộn ngang được, không còn bị bó trong một hàng lưới.
        if (res.data.category_id) {
          productApi
            .list({ categoryId: res.data.category_id, limit: 12 })
            .then((r) => {
              if (ignore) return;
              setRelated((r.data.items ?? []).filter((p) => p.id !== id).slice(0, 10));
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (ignore) return;
        // Chỉ coi là "không tìm thấy" khi BE trả 404; lỗi khác (mất mạng, 500)
        // hiển thị màn lỗi có nút thử lại.
        if (err?.response?.status === 404) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    window.scrollTo({ top: 0 });
    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  const images = useMemo(() => sortImages(product?.images), [product]);

  // Yêu cầu đăng nhập trước khi thao tác; quay lại đúng trang này sau khi login.
  const requireLogin = useCallback((): boolean => {
    if (isAuthenticated) return true;
    message.info('Vui lòng đăng nhập để tiếp tục');
    navigate('/login', { state: { from: location } });
    return false;
  }, [isAuthenticated, message, navigate, location]);

  const addToCart = async () => {
    if (!id || !requireLogin()) return;
    setAdding(true);
    try {
      await cartApi.addItem(id, qty);
      await refreshCart();
      message.success('Đã thêm vào giỏ hàng');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const openAlert = () => {
    if (!requireLogin()) return;
    setAlertOpen(true);
  };

  const createAlert = async () => {
    if (!id || alertPrice == null) return;
    setAlertSaving(true);
    try {
      await priceAlertApi.create({
        product_id: id,
        target_price: alertPrice,
        notify_channel: alertChannel,
      });
      message.success('Đã tạo cảnh báo giá — bạn sẽ được thông báo khi giá giảm tới mức mong muốn');
      setAlertOpen(false);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setAlertSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pdetail">
        <div className="pgallery">
          <div className="pgallery__main">
            <Skeleton.Image active style={{ width: '100%', height: 320 }} />
          </div>
        </div>
        <div>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <Result
        status="error"
        title="Không tải được sản phẩm"
        subTitle="Có lỗi kết nối hoặc máy chủ. Vui lòng thử lại."
        extra={
          <Button type="primary" onClick={() => setReloadKey((k) => k + 1)}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (notFound || !product) {
    return (
      <Result
        status="404"
        title="Không tìm thấy sản phẩm"
        subTitle="Sản phẩm không tồn tại hoặc đã ngừng kinh doanh."
        extra={
          <Link to="/products">
            <Button type="primary">Xem sản phẩm khác</Button>
          </Link>
        }
      />
    );
  }

  const ratingNum = product.rating != null ? Number(product.rating) : null;

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          ...(product.category
            ? [{ title: <Link to={`/products?categoryId=${product.category.id}`}>{product.category.name}</Link> }]
            : [{ title: <Link to="/products">Sản phẩm</Link> }]),
          { title: product.name },
        ]}
      />

      <div className="pdetail">
        {/* ===== Thư viện ảnh ===== */}
        <div className="pgallery">
          <div className="pgallery__main">
            {images.length > 0 ? (
              <img src={images[activeImg]?.image_url} alt={product.name} />
            ) : (
              <span className="pgallery__noimg" aria-hidden="true">
                <PictureOutlined />
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="pgallery__thumbs">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  className="pthumb"
                  aria-current={i === activeImg}
                  aria-label={`Xem ảnh ${i + 1} trên ${images.length}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img.image_url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== Thông tin & mua hàng ===== */}
        <div className="pinfo">
          <h1 className="pinfo__title">{product.name}</h1>

          <div className="pinfo__meta">
            {ratingNum != null ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Rate disabled allowHalf value={ratingNum} style={{ fontSize: 15 }} />
                <Text strong>{ratingNum.toFixed(1)}</Text>
              </span>
            ) : (
              <span>Chưa có đánh giá</span>
            )}
            <span className="pinfo__meta-sep" aria-hidden="true">|</span>
            <span>{product.review_count} lượt đánh giá</span>
            {product.brand && (
              <>
                <span className="pinfo__meta-sep" aria-hidden="true">|</span>
                <span>
                  Thương hiệu:{' '}
                  <Link to={`/products?brand=${encodeURIComponent(product.brand)}`}>
                    {product.brand}
                  </Link>
                </span>
              </>
            )}
          </div>

          {(product.category || (product.tags?.length ?? 0) > 0) && (
            <Space size={[8, 8]} wrap style={{ marginBottom: 20 }}>
              {product.category && (
                <Link to={`/products?categoryId=${product.category.id}`}>
                  <Tag>{product.category.name}</Tag>
                </Link>
              )}
              {product.tags?.map((t) => (
                <Tag key={t.id} color="orange">
                  {t.name}
                </Tag>
              ))}
            </Space>
          )}

          <div className="pprice">
            <div className="pprice__value tabular">{formatVND(product.price)}</div>
            <p className="pprice__note">Đã bao gồm VAT · Chưa tính phí vận chuyển</p>
          </div>

          <div className="pbuy">
            <span className="pbuy__qty">
              <label htmlFor="buy-qty">Số lượng</label>
              <InputNumber
                id="buy-qty"
                min={1}
                precision={0}
                value={qty}
                onChange={(v) => setQty(Math.max(1, Math.floor(v ?? 1)))}
                style={{ width: 96 }}
              />
            </span>
            <Button
              className="pbuy__main"
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              loading={adding}
              onClick={addToCart}
            >
              Thêm vào giỏ hàng
            </Button>
            <Button size="large" icon={<BellOutlined />} onClick={openAlert}>
              Theo dõi giá
            </Button>
          </div>

          <div className="ptrust">
            {TRUST.map((t) => (
              <div className="ptrust__item" key={t.text}>
                <span aria-hidden="true">{t.icon}</span>
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Tabs: Mô tả / Thông số / Đánh giá ===== */}
      <Card className="psection">
        <Tabs
          defaultActiveKey="desc"
          items={[
            {
              key: 'desc',
              label: 'Mô tả',
              children: product.description ? (
                <p className="pdesc">{product.description}</p>
              ) : (
                <Empty description="Chưa có mô tả" />
              ),
            },
            {
              key: 'specs',
              label: 'Thông số kỹ thuật',
              children:
                product.specs && product.specs.length > 0 ? (
                  <Descriptions bordered column={1} size="middle" style={{ maxWidth: 640 }}>
                    {product.specs.map((s) => (
                      <Descriptions.Item key={s.id} label={s.spec_key}>
                        {s.spec_value}
                        {s.spec_unit ? ` ${s.spec_unit}` : ''}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : (
                  <Empty description="Chưa có thông số" />
                ),
            },
            {
              key: 'reviews',
              label: `Đánh giá (${product.review_count})`,
              children: (
                <ReviewsSection
                  productId={product.id}
                  onReviewAdded={() =>
                    setProduct((p) => (p ? { ...p, review_count: p.review_count + 1 } : p))
                  }
                />
              ),
            },
          ]}
        />
      </Card>

      {/* ===== Sản phẩm tương tự — dải cuộn ngang =====
          Kéo/vuốt được trên mọi thiết bị; desktop có thêm hai nút mũi tên vì
          kéo ngang bằng chuột không tự nhiên. */}
      {related.length > 0 && (
        <section className="psection prelated" aria-labelledby="sec-related">
          <div className="prelated__head">
            <h2 id="sec-related" className="section-title">
              Sản phẩm tương tự
            </h2>
            {related.length > 3 && (
              <div className="prelated__nav">
                <button
                  type="button"
                  className="prelated__arrow"
                  aria-label="Cuộn danh sách về trước"
                  onClick={() => scrollRelated(-1)}
                >
                  <LeftOutlined aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="prelated__arrow"
                  aria-label="Cuộn danh sách tiếp"
                  onClick={() => scrollRelated(1)}
                >
                  <RightOutlined aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          <div className="prelated__track" ref={relatedTrackRef} tabIndex={-1}>
            {related.map((p) => (
              <div className="prelated__item" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Modal theo dõi giá ===== */}
      <Modal
        title={
          <>
            <BellOutlined style={{ color: 'var(--color-accent)' }} /> Theo dõi giá — {product.name}
          </>
        }
        open={alertOpen}
        onCancel={() => setAlertOpen(false)}
        onOk={createAlert}
        okText="Tạo cảnh báo"
        cancelText="Huỷ"
        confirmLoading={alertSaving}
        okButtonProps={{ disabled: alertPrice == null }}
      >
        <Paragraph type="secondary">
          Giá hiện tại: <Text strong>{formatVND(product.price)}</Text>. Bạn sẽ được thông báo
          khi giá giảm xuống bằng hoặc thấp hơn mức mong muốn.
        </Paragraph>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text>Mức giá mong muốn (₫)</Text>
            <InputNumber
              style={{ width: '100%', marginTop: 6 }}
              min={0}
              value={alertPrice}
              onChange={(v) => setAlertPrice(v == null || Number.isNaN(v) ? null : v)}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              // Ô trống phải ra null (không phải 0) để nút OK tự khoá,
              // tránh tạo nhầm cảnh báo 0₫ khi user xoá trắng ô giá.
              parser={(v) => {
                const raw = (v ?? '').replace(/,/g, '').trim();
                return raw === '' ? NaN : Number(raw);
              }}
            />
            {alertPrice != null && alertPrice >= Number(product.price) && (
              <Text type="warning" style={{ fontSize: 12 }}>
                Mức giá này bằng/cao hơn giá hiện tại — cảnh báo sẽ được kích hoạt ngay lập tức.
              </Text>
            )}
          </div>
          <div>
            <Text>Kênh thông báo</Text>
            <Select
              style={{ width: '100%', marginTop: 6 }}
              value={alertChannel}
              onChange={setAlertChannel}
              options={[
                { value: 'email', label: 'Email (khuyên dùng — nhận thư khi giá giảm)' },
                { value: 'app', label: 'Trong ứng dụng (chỉ ghi nhận trạng thái)' },
                { value: 'sms', label: 'SMS (chưa hỗ trợ)', disabled: true },
              ]}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
