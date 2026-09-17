import { useEffect, useState } from 'react';
import { App, Button, Checkbox, Empty, InputNumber, Popconfirm, Result, Skeleton } from 'antd';
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

  // Các cart_item được TICK CHỌN để thanh toán. null = chưa khởi tạo (giỏ chưa
  // tải xong) — lần đầu có dữ liệu thì mặc định chọn tất cả; các lần refresh
  // sau chỉ loại những id không còn trong giỏ, giữ nguyên lựa chọn của user.
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    const ids = (cart?.items ?? []).map((it) => it.id);
    setSelectedIds((prev) => {
      if (!cart) return prev;
      if (prev === null) return new Set(ids);
      return new Set(ids.filter((id) => prev.has(id)));
    });
  }, [cart]);

  const toggleItem = (itemId: string, checked: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev ?? []);
      if (checked) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
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

  // Chỉ tính tiền những sản phẩm được tick chọn
  const selectedItems = items.filter((it) => selectedIds?.has(it.id));
  const selectedCount = selectedItems.reduce((sum, it) => sum + it.quantity, 0);
  const selectedSubtotal = selectedItems.reduce(
    (sum, it) => sum + Number(it.product.price) * it.quantity,
    0,
  );
  const allChecked = items.length > 0 && selectedItems.length === items.length;

  return (
    <>
      <h1 className="cart__head">
        Giỏ hàng <span>({itemCount} sản phẩm)</span>
      </h1>

      <div className="cart">
        <div>
          <div className="cart__list">
            {/* Hàng chọn tất cả — trạng thái lửng (indeterminate) khi chọn một phần */}
            <div className="cart__selectall">
              <Checkbox
                checked={allChecked}
                indeterminate={selectedItems.length > 0 && !allChecked}
                onChange={(e) =>
                  setSelectedIds(
                    e.target.checked ? new Set(items.map((it) => it.id)) : new Set(),
                  )
                }
              >
                Chọn tất cả ({items.length} sản phẩm)
              </Checkbox>
            </div>
            {items.map((item) => {
              const price = Number(item.product.price);
              const busy = busyId === item.id;
              return (
                <div className="citem" key={item.id} data-busy={busy}>
                  <div className="citem__check">
                    <Checkbox
                      checked={selectedIds?.has(item.id) ?? false}
                      onChange={(e) => toggleItem(item.id, e.target.checked)}
                      aria-label={`Chọn ${item.product.name} để thanh toán`}
                    />
                  </div>
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
            <span>Tạm tính ({selectedCount} sản phẩm đã chọn)</span>
            <span className="tabular">{formatVND(selectedSubtotal)}</span>
          </div>
          <div className="crow">
            <span>Phí vận chuyển</span>
            <span>Tính ở bước thanh toán</span>
          </div>

          <p className="csummary__note">Mã giảm giá sẽ được áp dụng ở bước thanh toán.</p>

          <div className="crow crow--total">
            <span>Tổng cộng</span>
            <b className="tabular">{formatVND(selectedSubtotal)}</b>
          </div>

          <Button
            type="primary"
            size="large"
            block
            icon={<ArrowRightOutlined />}
            disabled={selectedItems.length === 0}
            onClick={() =>
              // Mang danh sách đã tick sang trang thanh toán qua state điều hướng
              navigate('/checkout', {
                state: { itemIds: selectedItems.map((it) => it.id) },
              })
            }
          >
            {selectedItems.length === 0
              ? 'Chọn sản phẩm để thanh toán'
              : `Thanh toán (${selectedItems.length} sản phẩm)`}
          </Button>
        </aside>
      </div>
    </>
  );
}
