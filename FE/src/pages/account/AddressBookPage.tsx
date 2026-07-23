import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Empty,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { addressApi } from '../../api/addresses';
import { getErrorMessage } from '../../api/client';
import type { Address } from '../../types';
import AddressFormModal from './AddressFormModal';

const { Title, Text } = Typography;

export default function AddressBookPage() {
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
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Sổ địa chỉ
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Thêm địa chỉ
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : items.length === 0 ? (
        <Card>
          <Empty description="Bạn chưa có địa chỉ nào">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Thêm địa chỉ đầu tiên
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {items.map((a) => (
            <Card key={a.id} styles={{ body: { padding: 16 } }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <EnvironmentOutlined style={{ fontSize: 20, color: '#ff6a00', marginTop: 4 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Space>
                    <Text strong>{a.recipient_name}</Text>
                    <Text type="secondary">|</Text>
                    <Text>{a.recipient_phone}</Text>
                    {a.is_default && <Tag color="orange">Mặc định</Tag>}
                  </Space>
                  <div style={{ color: '#555', marginTop: 4 }}>{a.address}</div>
                </div>
                <Space direction="vertical" align="end">
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(a)}
                    >
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xoá địa chỉ này?"
                      okText="Xoá"
                      cancelText="Huỷ"
                      onConfirm={() => remove(a.id)}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} loading={busyId === a.id}>
                        Xoá
                      </Button>
                    </Popconfirm>
                  </Space>
                  <Button
                    size="small"
                    type="text"
                    icon={a.is_default ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    disabled={a.is_default || busyId === a.id}
                    onClick={() => setDefault(a.id)}
                  >
                    {a.is_default ? 'Đang mặc định' : 'Đặt mặc định'}
                  </Button>
                </Space>
              </div>
            </Card>
          ))}
        </Space>
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
    </div>
  );
}
