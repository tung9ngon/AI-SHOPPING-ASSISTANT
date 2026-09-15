import { useState } from 'react';
import { App, Rate } from 'antd';
import { PictureOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { ProductListItem } from '../api/products';
import { cartApi } from '../api/cart';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatVND } from '../utils/format';
import './ProductCard.css';

/**
 * Thẻ sản phẩm dùng chung cho trang chủ, danh sách và kết quả tìm kiếm.
 *
 * Về cấu trúc liên kết: cả thẻ bấm được, nhưng phần bấm được là một thẻ <a> phủ
 * toàn khối chứ không phải bọc <a> quanh mọi thứ. Lý do: nút "Thêm vào giỏ" nằm
 * bên trong, mà lồng <button> trong <a> là HTML không hợp lệ và khiến trình đọc
 * màn hình đọc nhầm. Cách này cũng cho phép người dùng bôi đen chọn tên sản phẩm.
 */
export default function ProductCard({ product }: { product: ProductListItem }) {
  const { message } = App.useApp();
  const { isAuthenticated } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const rating = product.rating != null ? Number(product.rating) : null;

  const addToCart = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`);
      return;
    }
    setAdding(true);
    try {
      await cartApi.addItem(product.id, 1);
      await refresh();
      message.success('Đã thêm vào giỏ hàng');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="pcard">
      <Link
        to={`/products/${product.id}`}
        className="pcard__link"
        aria-label={`Xem chi tiết ${product.name}`}
      />

      <div className="pcard__media">
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name} loading="lazy" decoding="async" />
        ) : (
          <div className="pcard__noimg" aria-hidden="true">
            <PictureOutlined />
          </div>
        )}

        <button
          type="button"
          className="pcard__quick"
          onClick={addToCart}
          disabled={adding}
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
        >
          <ShoppingCartOutlined aria-hidden="true" />
          {adding ? 'Đang thêm…' : 'Thêm vào giỏ'}
        </button>
      </div>

      <div className="pcard__body">
        {product.brand && <div className="pcard__brand">{product.brand}</div>}

        <h3 className="pcard__name">{product.name}</h3>

        <div className="pcard__rating">
          {rating != null ? (
            <>
              <Rate disabled allowHalf value={rating} style={{ fontSize: 13 }} />
              <span>{rating.toFixed(1)}</span>
            </>
          ) : (
            <span>Chưa có đánh giá</span>
          )}
        </div>

        <div className="pcard__price tabular">{formatVND(product.price)}</div>
      </div>
    </article>
  );
}
