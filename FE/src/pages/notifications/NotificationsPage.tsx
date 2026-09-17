import { useEffect, useState } from 'react';
import { App, Button, Empty, Pagination, Result, Skeleton } from 'antd';
import {
  BellOutlined,
  BulbOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  notificationApi,
  type NotificationItem,
  type NotificationType,
} from '../../api/notifications';
import { getErrorMessage } from '../../api/client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatTimeAgo } from '../../utils/format';
import './NotificationsPage.css';

const PAGE_SIZE = 15;

// Icon + tông màu theo loại thông báo (màu đặt trong CSS qua data-type)
const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  order_update: <ShoppingOutlined />,
  price_alert: <BellOutlined />,
  deal: <TagOutlined />,
  recommendation: <BulbOutlined />,
  system: <InfoCircleOutlined />,
};

// Đích điều hướng khi bấm vào một thông báo, dựa trên payload `data` của BE
function targetOf(n: NotificationItem): string | null {
  const d = n.data ?? {};
  if (typeof d.url === 'string') return d.url;
  if (typeof d.order_id === 'string') return `/orders/${d.order_id}`;
  if (typeof d.product_id === 'string') return `/products/${d.product_id}`;
  return null;
}

export default function NotificationsPage() {
  useDocumentTitle('Thông báo');
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // Phân biệt "lỗi tải" vs "chưa có thông báo" — lỗi mạng không hiện như rỗng
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setFetchError(null);
    notificationApi
      .list({ page, limit: PAGE_SIZE })
      .then((res) => {
        if (ignore) return;
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
        setUnread(res.data.unread_count ?? 0);
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
  }, [page, reloadKey]);

  const open = async (n: NotificationItem) => {
    // Đánh dấu đã đọc lạc quan: cập nhật UI ngay, lỗi API không chặn điều hướng
    if (!n.is_read) {
      setItems((list) =>
        list.map((it) => (it.id === n.id ? { ...it, is_read: true } : it)),
      );
      setUnread((u) => Math.max(0, u - 1));
      notificationApi.markRead(n.id).catch(() => {});
    }
    const to = targetOf(n);
    if (to) navigate(to);
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setItems((list) => list.map((it) => ({ ...it, is_read: true })));
      setUnread(0);
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <>
      <div className="account__head">
        <div>
          <h1 className="account__title">Thông báo</h1>
          {!loading && !fetchError && total > 0 && (
            <p className="account__subtitle">
              {unread > 0 ? `${unread} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}
            </p>
          )}
        </div>
        {unread > 0 && (
          <Button icon={<CheckOutlined />} loading={markingAll} onClick={markAll}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : fetchError ? (
        <div className="account__panel">
          <Result
            status="warning"
            title="Không tải được thông báo"
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
          <Empty description="Bạn chưa có thông báo nào" />
        </div>
      ) : (
        <>
          <div className="notis">
            {items.map((n) => {
              const clickable = targetOf(n) !== null || !n.is_read;
              return (
                <button
                  type="button"
                  key={n.id}
                  className="noti"
                  data-unread={!n.is_read}
                  onClick={() => open(n)}
                  disabled={!clickable}
                >
                  <span className="noti__icon" data-type={n.type} aria-hidden="true">
                    {TYPE_ICON[n.type] ?? <InfoCircleOutlined />}
                  </span>
                  <span className="noti__body">
                    <span className="noti__title">
                      {n.title}
                      {!n.is_read && (
                        <>
                          <span className="noti__dot" aria-hidden="true" />
                          <span className="sr-only">(chưa đọc)</span>
                        </>
                      )}
                    </span>
                    {n.body && <span className="noti__text">{n.body}</span>}
                    <span className="noti__time">{formatTimeAgo(n.created_at)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {total > PAGE_SIZE && (
            <div className="notis__pagination">
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
