import { useEffect, useState } from 'react';
import { App, Button, Empty, Pagination, Result, Segmented, Skeleton, Tag } from 'antd';
import { RightOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { orderApi, type OrderListItem } from '../../api/orders';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../api/client';
import type { OrderStatus } from '../../types';
import {
  formatVND,
  formatDate,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from '../../utils/format';
import './OrdersPage.css';

const PAGE_SIZE = 10;

const FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã thanh toán', value: 'paid' },
  { label: 'Đang giao', value: 'shipped' },
  { label: 'Đã huỷ', value: 'cancelled' },
];

export default function OrdersPage() {
  useDocumentTitle('Đơn hàng của tôi');
  const { message } = App.useApp();
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // Phân biệt "lỗi tải" vs "thật sự chưa có đơn": lỗi mạng không được hiện như rỗng.
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setFetchError(null);
    orderApi
      .list({ status: status === 'all' ? undefined : status, page, limit: PAGE_SIZE })
      .then((res) => {
        if (ignore) return;
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch((err) => {
        if (ignore) return;
        setItems([]);
        setTotal(0);
        setFetchError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [status, page, reloadKey, message]);

  return (
    <>
      <div className="account__head">
        <div>
          <h1 className="account__title">Đơn hàng của tôi</h1>
          {!loading && !fetchError && total > 0 && (
            <p className="account__subtitle">{total} đơn hàng</p>
          )}
        </div>
      </div>

      <div className="orders__filters">
        <Segmented
          options={FILTERS}
          value={status}
          onChange={(v) => {
            setStatus(v as OrderStatus | 'all');
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : fetchError ? (
        <div className="account__panel">
          <Result
            status="warning"
            title="Không tải được đơn hàng"
            subTitle={fetchError}
            extra={
              <Button type="primary" onClick={() => setReloadKey((k) => k + 1)}>
                Thử lại
              </Button>
            }
          />
        </div>
      ) : items.length === 0 ? (
        <div className="account__panel">
          <Empty
            description={
              status === 'all'
                ? 'Bạn chưa có đơn hàng nào'
                : `Không có đơn hàng ở trạng thái “${FILTERS.find((f) => f.value === status)?.label}”`
            }
          >
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Mua sắm ngay
              </Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <>
          <div className="orders__list">
            {items.map((o) => {
              // Gọi đơn theo tên sản phẩm thay vì mã ngẫu nhiên — nhìn phát
              // biết ngay đơn này mua gì; mã đơn lui xuống dòng meta.
              const name = o.first_product_name
                ? o.item_count > 1
                  ? `${o.first_product_name} và ${o.item_count - 1} sản phẩm khác`
                  : o.first_product_name
                : `#${o.id.slice(0, 8).toUpperCase()}`;
              return (
                <Link className="ocard" to={`/orders/${o.id}`} key={o.id}>
                  <span className="ocard__thumb" aria-hidden="true">
                    {o.first_product_image ? (
                      <img src={o.first_product_image} alt="" loading="lazy" />
                    ) : (
                      <ShoppingOutlined />
                    )}
                  </span>

                  <div className="ocard__main">
                    <div className="ocard__id">
                      <span className="ocard__name">Đơn hàng: {name}</span>
                      <Tag color={ORDER_STATUS_COLOR[o.status]} style={{ marginInlineEnd: 0 }}>
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </Tag>
                    </div>
                    <div className="ocard__meta">
                      <span className="ocard__code">#{o.id.slice(0, 8).toUpperCase()}</span>
                      {' · '}
                      {formatDate(o.created_at)} · {o.item_count} sản phẩm
                    </div>
                  </div>

                  <div className="ocard__total tabular">{formatVND(o.total)}</div>

                  <RightOutlined className="ocard__chev" aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          {total > PAGE_SIZE && (
            <div className="orders__pagination">
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                onChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
