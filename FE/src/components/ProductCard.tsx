import { Card, Rate, Tag, Typography } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../api/products';
import { formatVND } from '../utils/format';

const { Text } = Typography;

// Thẻ sản phẩm dùng chung cho Trang chủ / Danh sách sản phẩm.
// `dark`: biến thể nền tối cho trang chủ (không ảnh hưởng trang /products sáng).
export default function ProductCard({
  product,
  dark = false,
}: {
  product: ProductListItem;
  dark?: boolean;
}) {
  return (
    <Link to={`/products/${product.id}`}>
      <Card
        hoverable
        className={dark ? 'product-card--dark' : undefined}
        styles={{ body: { padding: 12 } }}
        cover={
          product.primary_image ? (
            <img
              alt={product.name}
              src={product.primary_image}
              style={{ height: 180, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="product-card__noimg"
              style={{
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                color: '#bbb',
                fontSize: 40,
              }}
            >
              <PictureOutlined />
            </div>
          )
        }
      >
        <Text
          strong
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 44,
          }}
        >
          {product.name}
        </Text>

        <div style={{ margin: '8px 0', minHeight: 22 }}>
          {product.brand && <Tag color="blue">{product.brand}</Tag>}
          {product.category_name && <Tag>{product.category_name}</Tag>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 20 }}>
          {product.rating != null ? (
            <>
              <Rate
                disabled
                allowHalf
                value={Number(product.rating)}
                style={{ fontSize: 12 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {Number(product.rating).toFixed(1)}
              </Text>
            </>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chưa có đánh giá
            </Text>
          )}
        </div>

        <div style={{ marginTop: 8, color: '#f5222d', fontWeight: 700, fontSize: 16 }}>
          {formatVND(product.price)}
        </div>
      </Card>
    </Link>
  );
}
