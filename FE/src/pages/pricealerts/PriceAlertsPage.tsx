import { useEffect, useState } from 'react';
import { App, Alert, Button, Empty, Popconfirm, Skeleton, Tag } from 'antd';
import {
  DeleteOutlined,
  PictureOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { priceAlertApi, type PriceAlertItem } from '../../api/priceAlerts';
import { getErrorMessage } from '../../api/client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatVND } from '../../utils/format';
import './PriceAlertsPage.css';

const CHANNEL_LABEL: Record<string, string> = {
  email: 'Báo qua email',
  app: 'Báo trong ứng dụng',
  sms: 'Báo qua SMS',
};

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  active: { color: 'blue', label: 'Đang theo dõi' },
  triggered: { color: 'green', label: 'Đã đạt giá' },
};

export default function PriceAlertsPage() {
  useDocumentTitle('Theo dõi giá');
  const { message } = App.useApp();
  const [items, setItems] = useState<PriceAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    priceAlertApi
      .list()
      .then((res) => {
        // BE trả cả 'cancelled' -> chỉ hiện alert còn hiệu lực.
        setItems((res.data ?? []).filter((a) => a.status !== 'cancelled'));
      })
      .catch((err) => message.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await priceAlertApi.remove(id);
      message.success('Đã huỷ theo dõi giá');
      load();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="account__head">
        <div>
          <h1 className="account__title">Theo dõi giá</h1>
          <p className="account__subtitle">
            {items.length > 0
              ? `${items.length} sản phẩm đang được theo dõi`
              : 'Nhận thông báo khi sản phẩm giảm tới mức bạn mong muốn'}
          </p>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message="Tạo theo dõi mới bằng nút “Theo dõi giá” ở trang chi tiết sản phẩm."
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : items.length === 0 ? (
        <div className="account__panel">
          <Empty description="Bạn chưa theo dõi giá sản phẩm nào">
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Khám phá sản phẩm
              </Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="alerts__list">
          {items.map((a) => {
            const current = Number(a.product.price);
            const target = Number(a.target_price);
            const reached = current <= target;
            // Khoảng còn phải giảm — suy ra trực tiếp từ 2 con số trên, không ước lượng.
            const gap = current - target;
            const st = STATUS_TAG[a.status] ?? STATUS_TAG.active;

            return (
              <article className={`alert${reached ? ' alert--reached' : ''}`} key={a.id}>
                <Link className="alert__img" to={`/products/${a.product.id}`}>
                  {a.product.image ? (
                    <img src={a.product.image} alt="" loading="lazy" />
                  ) : (
                    <PictureOutlined aria-hidden="true" />
                  )}
                </Link>

                <div>
                  <Link className="alert__name" to={`/products/${a.product.id}`}>
                    {a.product.name}
                  </Link>

                  <div className="alert__prices">
                    <div className="alert__price">
                      <small>Giá hiện tại</small>
                      <b>{formatVND(current)}</b>
                    </div>
                    <div className="alert__price alert__price--target">
                      <small>Giá mong muốn</small>
                      <b>{formatVND(target)}</b>
                    </div>
                  </div>

                  <p className={`alert__gap${reached ? ' alert__gap--reached' : ''}`}>
                    {reached
                      ? 'Đã đạt mức giá bạn mong muốn — có thể mua ngay'
                      : <>Cần giảm thêm <b>{formatVND(gap)}</b> nữa để đạt mức mong muốn</>}
                  </p>

                  <div className="alert__tags">
                    <Tag color={st.color} style={{ marginInlineEnd: 0 }}>
                      {st.label}
                    </Tag>
                    <Tag style={{ marginInlineEnd: 0 }}>
                      {CHANNEL_LABEL[a.notify_channel] ?? a.notify_channel}
                    </Tag>
                  </div>
                </div>

                <div className="alert__action">
                  <Popconfirm
                    title="Huỷ theo dõi giá này?"
                    okText="Huỷ theo dõi"
                    cancelText="Không"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(a.id)}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={busyId === a.id}
                      aria-label={`Huỷ theo dõi giá ${a.product.name}`}
                    >
                      Huỷ
                    </Button>
                  </Popconfirm>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
