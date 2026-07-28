import { Rate, Tag } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ProductListItem } from '../api/products';
import { formatVND } from '../utils/format';

// Thẻ sản phẩm kiểu FPT Shop: card trắng, hover lift, nút "Xem chi tiết" trượt lên.
export default function ProductCard({
  product,
}: {
  product: ProductListItem;
  dark?: boolean; // giữ prop để không phá chỗ gọi cũ, nhưng không dùng nữa
}) {
  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        {/* Ảnh sản phẩm */}
        <div className="product-card__image-wrap">
          {product.primary_image ? (
            <img alt={product.name} src={product.primary_image} />
          ) : (
            <div className="product-card__noimg">
              <PictureOutlined />
            </div>
          )}
          {/* Nút xem chi tiết — trượt lên khi hover */}
          <div className="product-card__quick-view">
            <button type="button">Xem chi tiết</button>
          </div>
        </div>

        {/* Nội dung */}
        <div className="product-card__body">
          <div className="product-card__name">{product.name}</div>

          <div className="product-card__tags">
            {product.brand && <Tag color="orange">{product.brand}</Tag>}
            {product.category_name && <Tag>{product.category_name}</Tag>}
          </div>

          <div className="product-card__rating">
            {product.rating != null ? (
              <>
                <Rate
                  disabled
                  allowHalf
                  value={Number(product.rating)}
                  style={{ fontSize: 12 }}
                />
                <span className="product-card__rating-text">
                  {Number(product.rating).toFixed(1)}
                </span>
              </>
            ) : (
              <span className="product-card__rating-text">Chưa có đánh giá</span>
            )}
          </div>

          <div className="product-card__price">{formatVND(product.price)}</div>
        </div>
      </div>
    </Link>
  );
}
