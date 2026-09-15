import { useState } from 'react';
import { App, Button, Empty, InputNumber, Popconfirm, Result, Skeleton } from 'antd';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  PictureOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { getErrorMessage } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatVND } from '../../utils/format';
import './CartPage.css';

export default function CartPage() {
  useDocumentTitle('Giỏ hàng');
  const { cart, loading, refresh, itemCount, fetchError } = useCart();
  const { message } = App.useApp();
  const navigate = useNavigate();

  // id của cart_item đang được cập nhật/xoá -> khoá control dòng đó.
  const [busyId, setBusyId] = useState<string | null>(null);
  // Giá trị số lượng đang gõ dở (chưa gửi API) cho từng dòng — chỉ commit khi
  // rời khỏi ô (onBlur), tránh bắn PUT ở từng ký tự khi gõ số nhiều chữ số.
  const [qtyDraft, setQtyDraft] = useState<Record<string, number>>({});

  const clearDraft = (itemId: string) =>
    setQtyDraft((d) => {
      const next = { ...d };
      delete next[itemId];
      return next;
    });

  const changeQty = async (itemId: string, quantity: number) => {
    setBusyId(itemId);
    try {
      await cartApi.updateItem(itemId, quantity);
      await refresh();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
      clearDraft(itemId);
    }
  };

  const commitQty = (itemId: string, currentQuantity: number) => {
    const draft = qtyDraft[itemId];
    if (draft != null && draft !== currentQuantity) changeQty(itemId, draft);
    else clearDraft(itemId);
  };

  const removeItem = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await cartApi.removeItem(itemId);
      await refresh();
      message.success('Đã xoá sản phẩm khỏi giỏ');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !cart) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  // Phân biệt "giỏ trống" (thật sự 0 sản phẩm) vs "lỗi tải giỏ" (mất mạng, server 500)
  if (fetchError && !cart) {
    return (
      <Result
        status="error"
        title="Không tải được giỏ hàng"
        subTitle="Có lỗi kết nối hoặc máy chủ. Vui lòng thử lại."
        extra={
          <Button type="primary" onClick={() => refresh()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="cart__empty">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Giỏ hàng của bạn đang trống">
          <Link to="/products">
            <Button type="primary" size="large" icon={<ShoppingOutlined />}>
              Tiếp tục mua sắm
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  const subtotal = Number(cart?.subtotal ?? 0);

  return (
    <>
      <h1 className="cart__head">
        Giỏ hàng <span>({itemCount} sản phẩm)</span>
      </h1>

      <div className="cart">
        <div>
          <div className="cart__list">
            {items.map((item) => {
              const price = Number(item.product.price);
              const busy = busyId === item.id;
              return (
                <div className="citem" key={item.id} data-busy={busy}>
                  <Link className="citem__img" to={`/products/${item.product.id}`}>
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} loading="lazy" />
                    ) : (
                      <PictureOutlined aria-hidden="true" />
                    )}
                  </Link>

                  <div className="citem__name">
                    <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                    <div className="citem__unit tabular">{formatVND(price)} / sản phẩm</div>
                  </div>

                  <div className="citem__qty">
                    {/* Gõ tự do, chỉ gửi API khi rời ô (blur) hoặc nhấn Enter */}
                    <InputNumber
                      min={1}
                      precision={0}
                      value={qtyDraft[item.id] ?? item.quantity}
                      disabled={busy}
                      onChange={(v) =>
                        setQtyDraft((d) => ({ ...d, [item.id]: Math.max(1, Math.floor(v ?? 1)) }))
                      }
                      onBlur={() => commitQty(item.id, item.quantity)}
                      onPressEnter={() => commitQty(item.id, item.quantity)}
                      style={{ width: 92 }}
                      aria-label={`Số lượng ${item.product.name}`}
                    />
                  </div>

                  <div className="citem__total tabular">{formatVND(price * item.quantity)}</div>

                  <div className="citem__del">
                    <Popconfirm
                      title="Xoá sản phẩm này khỏi giỏ?"
                      okText="Xoá"
                      cancelText="Huỷ"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => removeItem(item.id)}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={busy}
                        aria-label={`Xoá ${item.product.name} khỏi giỏ`}
                      />
                    </Popconfirm>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <Link to="/products">
              <Button icon={<ShoppingOutlined />}>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </div>

        <aside className="csummary" aria-label="Tóm tắt đơn hàng">
          <h2 className="csummary__title">Tóm tắt đơn hàng</h2>

          <div className="crow">
            <span>Tạm tính ({itemCount} sản phẩm)</span>
            <span className="tabular">{formatVND(subtotal)}</span>
          </div>
          <div className="crow">
            <span>Phí vận chuyển</span>
            <span>Tính ở bước thanh toán</span>
          </div>

          <p className="csummary__note">Mã giảm giá sẽ được áp dụng ở bước thanh toán.</p>

          <div className="crow crow--total">
            <span>Tổng cộng</span>
            <b className="tabular">{formatVND(subtotal)}</b>
          </div>

          <Button
            type="primary"
            size="large"
            block
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/checkout')}
          >
            Tiến hành thanh toán
          </Button>
        </aside>
      </div>
    </>
  );
}
