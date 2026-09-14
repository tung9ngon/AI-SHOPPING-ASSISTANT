import { useEffect, useState } from 'react';
import { App, Button, Empty, Popconfirm, Skeleton, Tag } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { addressApi } from '../../api/addresses';
import { getErrorMessage } from '../../api/client';
import type { Address } from '../../types';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AddressFormModal from './AddressFormModal';
import './AddressBookPage.css';

export default function AddressBookPage() {
  useDocumentTitle('Sổ địa chỉ');
  const { message } = App.useApp();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    addressApi
      .list()
      .then((res) => setItems(res.data ?? []))
      .catch((err) => message.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (a: Address) => {
    setEditing(a);
    setModalOpen(true);
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      await addressApi.remove(id);
      message.success('Đã xoá địa chỉ');
      load();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const setDefault = async (id: string) => {
    setBusyId(id);
    try {
      await addressApi.setDefault(id);
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
          <h1 className="account__title">Sổ địa chỉ</h1>
          <p className="account__subtitle">
            Địa chỉ mặc định sẽ được chọn sẵn khi bạn thanh toán
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Thêm địa chỉ
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : items.length === 0 ? (
        <div className="account__panel">
          <Empty description="Bạn chưa có địa chỉ nào">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Thêm địa chỉ đầu tiên
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="addr__list">
          {items.map((a) => (
            <article className={`addr${a.is_default ? ' addr--default' : ''}`} key={a.id}>
              <div className="addr__top">
                <span className="addr__pin" aria-hidden="true">
                  <EnvironmentOutlined />
                </span>
                <div className="addr__who">
                  <div className="addr__name">
                    {a.recipient_name || 'Người nhận'}
                    {a.phone_number && <span className="addr__phone">{a.phone_number}</span>}
                    {a.is_default && (
                      <Tag color="orange" style={{ marginInlineEnd: 0 }}>
                        Mặc định
                      </Tag>
                    )}
                  </div>
                  <p className="addr__text">{a.full_address}</p>
                </div>
              </div>

              <div className="addr__actions">
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(a)}>
                  Sửa
                </Button>
                <Popconfirm
                  title="Xoá địa chỉ này?"
                  okText="Xoá"
                  cancelText="Huỷ"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => remove(a.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} loading={busyId === a.id}>
                    Xoá
                  </Button>
                </Popconfirm>

                <span className="addr__spacer" />

                {/* Ở địa chỉ mặc định, trước đây hiện một nút bị vô hiệu hoá vĩnh
                    viễn — vừa thừa (đã có thẻ "Mặc định" ở trên) vừa mờ khó đọc.
                    Thay bằng nhãn chữ thường. */}
                {a.is_default ? (
                  <span className="addr__is-default">
                    <StarFilled aria-hidden="true" /> Địa chỉ mặc định
                  </span>
                ) : (
                  <Button
                    size="small"
                    type="text"
                    icon={<StarOutlined />}
                    disabled={busyId === a.id}
                    onClick={() => setDefault(a.id)}
                  >
                    Đặt mặc định
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <AddressFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
      />
    </>
  );
}
