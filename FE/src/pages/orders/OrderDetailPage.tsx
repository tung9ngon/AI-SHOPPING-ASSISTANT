import { useCallback, useEffect, useState } from 'react';
import { App, Breadcrumb, Button, Popconfirm, Result, Skeleton, Tag } from 'antd';
import { HomeOutlined, PictureOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderApi, type OrderDetail } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import {
  formatVND,
  formatDate,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from '../../utils/format';
import type { OrderStatus } from '../../types';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import './OrderDetailPage.css';

// Chỉ huỷ được khi đơn chưa xử lý (khớp CANCELABLE_STATUSES của BE)
const CANCELABLE: OrderStatus[] = ['pending', 'simulated_success'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle(id ? `Đơn #${id.slice(0, 8).toUpperCase()}` : 'Chi tiết đơn hàng');
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    orderApi
      .detail(id)
      .then((res) => setOrder(res.data))
      .catch((err) => {
        // Chỉ coi là "không tìm thấy" khi BE trả 404; lỗi khác (mất mạng, 500)
        // hiển thị màn lỗi có nút thử lại, tránh hiểu nhầm thành đơn không tồn tại.
        if (err?.response?.status === 404) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo({ top: 0 });
  }, [load]);

  const cancelOrder = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await orderApi.cancel(id);
      message.success('Đã huỷ đơn hàng');
      load();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  if (loadError) {
    return (
      <Result
        status="error"
        title="Không tải được đơn hàng"
        subTitle="Có lỗi kết nối hoặc máy chủ. Vui lòng thử lại."
        extra={
          <Button type="primary" onClick={load}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (notFound || !order) {
    return (
      <Result
        status="404"
        title="Không tìm thấy đơn hàng"
        extra={
          <Button type="primary" onClick={() => navigate('/orders')}>
            Về danh sách đơn hàng
          </Button>
        }
      />
    );
  }

  const canCancel = CANCELABLE.includes(order.status);
  const discount = Number(order.discount_amount);
  const shipDiscount = Number(order.shipping_discount_amount ?? 0);
  const shippingFee = Number(order.shipping_fee);

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: <Link to="/orders">Đơn hàng của tôi</Link> },
          { title: `Đơn #${order.id.slice(0, 8).toUpperCase()}` },
        ]}
      />

      <div className="odetail__head">
        <div>
          <div className="odetail__code">
            <h1>Đơn #{order.id.slice(0, 8).toUpperCase()}</h1>
            <Tag color={ORDER_STATUS_COLOR[order.status]} style={{ marginInlineEnd: 0 }}>
              {ORDER_STATUS_LABEL[order.status] ?? order.status}
            </Tag>
          </div>
          <p className="odetail__date">Đặt ngày {formatDate(order.created_at)}</p>
        </div>

        {canCancel && (
          <Popconfirm
            title="Huỷ đơn hàng này?"
            description="Thao tác không thể hoàn tác."
            okText="Huỷ đơn"
            cancelText="Không"
            okButtonProps={{ danger: true }}
            onConfirm={cancelOrder}
          >
            <Button danger loading={cancelling}>
              Huỷ đơn hàng
            </Button>
          </Popconfirm>
        )}
      </div>

      <div className="odetail">
        <div>
          <section className="obox">
            <h2 className="obox__title">Sản phẩm ({order.items.length})</h2>
            {order.items.map((item, idx) => (
              <div className="oitem" key={item.product.id + idx}>
                <span className="oitem__img">
                  {item.product.image ? (
                    <img src={item.product.image} alt="" loading="lazy" />
                  ) : (
                    <PictureOutlined aria-hidden="true" />
                  )}
                </span>

                <div>
                  <Link className="oitem__name" to={`/products/${item.product.id}`}>
                    {item.product.name}
                  </Link>
                  <div className="oitem__unit tabular">
                    {formatVND(Number(item.product.price))} × {item.quantity}
                  </div>
                </div>

                <div className="oitem__total tabular">
                  {formatVND(Number(item.product.price) * item.quantity)}
                </div>
              </div>
            ))}
          </section>

          {(order.shipping_address?.recipient_name || order.shipping_address?.full_address) && (
            <section className="obox">
              <h2 className="obox__title">Người nhận</h2>
              <div className="obox__body oreceiver">
                <b>
                  {order.shipping_address.recipient_name}
                  {order.shipping_address.phone_number
                    ? ` · ${order.shipping_address.phone_number}`
                    : ''}
                </b>
                <span>{order.shipping_address.full_address}</span>
              </div>
            </section>
          )}

          {order.note && (
            <section className="obox">
              <h2 className="obox__title">Ghi chú</h2>
              <div className="obox__body">
                <p className="onote">{order.note}</p>
              </div>
            </section>
          )}
        </div>

        <aside className="obox osummary" aria-label="Tóm tắt thanh toán">
          <h2 className="obox__title">Tóm tắt thanh toán</h2>
          <div className="obox__body">
            <div className="orow">
              <span>Tạm tính</span>
              <span className="tabular">{formatVND(Number(order.subtotal))}</span>
            </div>
            <div className="orow">
              <span>Phí vận chuyển</span>
              <span className="tabular">
                {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
              </span>
            </div>
            {discount > 0 && (
              <div className="orow orow--save">
                <span>Giảm giá</span>
                <span className="tabular">-{formatVND(discount)}</span>
              </div>
            )}
            {shipDiscount > 0 && (
              <div className="orow orow--save">
                <span>Giảm phí vận chuyển</span>
                <span className="tabular">-{formatVND(shipDiscount)}</span>
              </div>
            )}
            <div className="orow orow--total">
              <span>Tổng cộng</span>
              <b className="tabular">{formatVND(Number(order.total))}</b>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
