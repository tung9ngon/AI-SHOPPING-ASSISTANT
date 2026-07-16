import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  InputNumber,
  Modal,
  Rate,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  HomeOutlined,
  PictureOutlined,
  ShoppingCartOutlined,
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

const { Title, Text, Paragraph } = Typography;

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

  // Modal theo dõi giá
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertPrice, setAlertPrice] = useState<number | null>(null);
  // Mặc định 'email' vì BE hiện chỉ gửi thông báo thật qua email
  const [alertChannel, setAlertChannel] = useState<NotifyChannel>('email');
  const [alertSaving, setAlertSaving] = useState(false);

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
        // Sản phẩm cùng danh mục (loại trừ chính nó)
        if (res.data.category_id) {
          productApi
            .list({ categoryId: res.data.category_id, limit: 5 })
            .then((r) => {
              if (ignore) return;
              setRelated((r.data.items ?? []).filter((p) => p.id !== id).slice(0, 4));
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
      <Row gutter={[32, 32]}>
        <Col xs={24} md={10}>
          <Card>
            <Skeleton.Image active style={{ width: '100%', height: 360 }} />
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Col>
      </Row>
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
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          ...(product.category
            ? [{ title: <Link to={`/products?categoryId=${product.category.id}`}>{product.category.name}</Link> }]
            : [{ title: <Link to="/products">Sản phẩm</Link> }]),
          { title: product.name },
        ]}
      />

      <Row gutter={[32, 32]}>
        {/* ===== Gallery ===== */}
        <Col xs={24} md={10}>
          <Card styles={{ body: { padding: 12 } }}>
            {images.length > 0 ? (
              <>
                <img
                  src={images[activeImg]?.image_url}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: 360,
                    objectFit: 'contain',
                    background: '#fafafa',
                    borderRadius: 8,
                  }}
                />
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt=""
                        onClick={() => setActiveImg(i)}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: 'cover',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: i === activeImg ? '2px solid #ff6a00' : '2px solid #eee',
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  height: 360,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5',
                  borderRadius: 8,
                  color: '#bbb',
                  fontSize: 56,
                }}
              >
                <PictureOutlined />
              </div>
            )}
          </Card>
        </Col>

        {/* ===== Thông tin ===== */}
        <Col xs={24} md={14}>
          <Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
            {product.name}
          </Title>

          <Space size={[8, 8]} wrap style={{ marginBottom: 12 }}>
            {product.brand && <Tag color="blue">{product.brand}</Tag>}
            {product.category && <Tag>{product.category.name}</Tag>}
            {product.tags?.map((t) => (
              <Tag key={t.id} color="orange">
                {t.name}
              </Tag>
            ))}
          </Space>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            {ratingNum != null ? (
              <>
                <Rate disabled allowHalf value={ratingNum} style={{ fontSize: 16 }} />
                <Text strong>{ratingNum.toFixed(1)}</Text>
              </>
            ) : (
              <Text type="secondary">Chưa có đánh giá</Text>
            )}
            <Text type="secondary">· {product.review_count} lượt đánh giá</Text>
          </div>

          <div
            style={{
              background: '#fff7f0',
              border: '1px solid #ffe2c9',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 30, fontWeight: 800, color: '#f5222d' }}>
              {formatVND(product.price)}
            </Text>
          </div>

          <Space size="middle" wrap>
            <Space>
              <Text>Số lượng:</Text>
              <InputNumber
                min={1}
                precision={0}
                value={qty}
                onChange={(v) => setQty(Math.max(1, Math.floor(v ?? 1)))}
              />
            </Space>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              loading={adding}
              onClick={addToCart}
            >
              Thêm vào giỏ
            </Button>
            <Button size="large" icon={<BellOutlined />} onClick={openAlert}>
              Theo dõi giá
            </Button>
          </Space>
        </Col>
      </Row>

      {/* ===== Tabs: Mô tả / Thông số / Đánh giá ===== */}
      <Card style={{ marginTop: 32 }}>
        <Tabs
          defaultActiveKey="desc"
          items={[
            {
              key: 'desc',
              label: 'Mô tả',
              children: product.description ? (
                <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 15 }}>
                  {product.description}
                </Paragraph>
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

      {/* ===== Sản phẩm tương tự ===== */}
      {related.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <Title level={4}>Sản phẩm tương tự</Title>
          <Row gutter={[16, 16]}>
            {related.map((p) => (
              <Col key={p.id} xs={12} sm={12} md={8} lg={6}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* ===== Modal theo dõi giá ===== */}
      <Modal
        title={
          <>
            <BellOutlined style={{ color: '#ff6a00' }} /> Theo dõi giá — {product.name}
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
              onChange={setAlertPrice}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              // Ô trống phải ra null (không phải 0) để nút OK tự khoá,
              // tránh tạo nhầm cảnh báo 0₫ khi user xoá trắng ô giá.
              parser={(v) => {
                const raw = (v ?? '').replace(/,/g, '').trim();
                return raw === '' ? ('' as unknown as number) : Number(raw);
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
