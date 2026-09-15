import { useEffect, useMemo, useState } from 'react';
import { App, Avatar, Button, Descriptions, Input, Modal, Popconfirm, Select, Spin, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { UserOutlined } from '@ant-design/icons';
import { adminUserApi, type AdminUserDetail, type AdminUserRow } from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { formatDateShort } from '../../utils/format';
import './UserListPage.css';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'locked';
type RoleFilter = 'all' | UserRole;

function roleTag(role: UserRole) {
  return <Tag color={role === 'admin' ? 'gold' : 'default'}>{role === 'admin' ? 'Quản trị' : 'Khách hàng'}</Tag>;
}

function statusTag(isActive: boolean) {
  return <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Đang hoạt động' : 'Đã khoá'}</Tag>;
}

// Modal chi tiết: gọi GET /admin/users/:id để lấy thêm hồ sơ mua sắm.
function UserDetailModal({ userId, open, onClose }: { userId: string | null; open: boolean; onClose: () => void }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !userId) return;
    let ignore = false;
    setLoading(true);
    setError('');
    adminUserApi
      .detail(userId)
      .then((res) => {
        if (!ignore) setDetail(res.data);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [open, userId]);

  return (
    <Modal title="Chi tiết người dùng" open={open} onCancel={onClose} footer={null} width={720} destroyOnClose>
      {loading && (
        <div className="admin-user-modal-loading">
          <Spin />
        </div>
      )}

      {!loading && error && <div className="admin-user-modal-error">{error}</div>}

      {!loading && !error && detail && (
        <>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Họ tên">{detail.full_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{detail.email || '—'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{detail.phone_number || '—'}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{formatDateShort(detail.created_at)}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">{roleTag(detail.role)}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{statusTag(detail.is_active)}</Descriptions.Item>
            <Descriptions.Item label="Mã tài khoản" span={2}>
              {detail.id}
            </Descriptions.Item>
          </Descriptions>

          <div className="admin-user-modal-section">Hồ sơ mua sắm</div>
          {detail.profile ? (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Phân nhóm">{detail.profile.user_segment || '—'}</Descriptions.Item>
              <Descriptions.Item label="Nghề nghiệp">{detail.profile.occupation || '—'}</Descriptions.Item>
              <Descriptions.Item label="Độ tuổi">{detail.profile.age_range || '—'}</Descriptions.Item>
              <Descriptions.Item label="Quan tâm">
                {detail.profile.interests.length ? detail.profile.interests.join(', ') : '—'}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div className="admin-user-modal-empty">Người dùng chưa có hồ sơ mua sắm.</div>
          )}
        </>
      )}
    </Modal>
  );
}

export default function UserListPage() {
  const { message } = App.useApp();
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
      page,
      limit: PAGE_SIZE,
    }),
    [page, roleFilter, search, statusFilter],
  );

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.list(query);
      setItems(res.data.data ?? res.data.items ?? []);
      setTotal(res.data.total ?? 0);
      setLoadError('');
    } catch (err) {
      setItems([]);
      setTotal(0);
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const updateUser = async (record: AdminUserRow, data: { role?: UserRole; is_active?: boolean }, done: string) => {
    setSavingId(record.id);
    try {
      await adminUserApi.update(record.id, data);
      message.success(done);
      loadUsers();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const columns: ColumnsType<AdminUserRow> = [
    {
      title: 'Người dùng',
      dataIndex: 'full_name',
      render: (fullName: string, record) => (
        <div className="admin-user-cell">
          <Avatar src={record.avatar_url || undefined} icon={<UserOutlined />} />
          <div className="admin-user-cell-text">
            <span className="admin-user-name">{fullName}</span>
            <span className="admin-user-email">{record.email || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone_number',
      width: 160,
      render: (phone: string | null) => phone || '—',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: 130,
      render: (role: UserRole) => roleTag(role),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 150,
      render: (isActive: boolean) => statusTag(isActive),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      width: 140,
      render: (value: string) => <span className="admin-user-date">{formatDateShort(value)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 260,
      align: 'right',
      render: (_, record) => {
        // Chặn admin tự hạ quyền / tự khoá chính mình -> tránh mất quyền truy cập.
        const isSelf = record.id === currentUser?.id;
        return (
          <div className="admin-user-actions">
            <Button type="link" onClick={() => setDetailId(record.id)}>
              Chi tiết
            </Button>
            <Popconfirm
              title={record.role === 'admin' ? 'Thu quyền quản trị?' : 'Cấp quyền quản trị?'}
              description={
                record.role === 'admin'
                  ? 'Tài khoản sẽ trở thành khách hàng thường.'
                  : 'Tài khoản sẽ vào được toàn bộ trang quản trị.'
              }
              okText="Đồng ý"
              cancelText="Huỷ"
              disabled={isSelf}
              onConfirm={() =>
                updateUser(
                  record,
                  { role: record.role === 'admin' ? 'user' : 'admin' },
                  record.role === 'admin' ? 'Đã thu quyền quản trị' : 'Đã cấp quyền quản trị',
                )
              }
            >
              <Button type="link" disabled={isSelf} loading={savingId === record.id}>
                {record.role === 'admin' ? 'Thu quyền' : 'Cấp quyền'}
              </Button>
            </Popconfirm>
            <Popconfirm
              title={record.is_active ? 'Khoá tài khoản này?' : 'Mở khoá tài khoản này?'}
              description={
                record.is_active
                  ? 'Người dùng sẽ không đăng nhập được cho tới khi mở khoá.'
                  : 'Người dùng đăng nhập lại được bình thường.'
              }
              okText="Đồng ý"
              cancelText="Huỷ"
              disabled={isSelf}
              onConfirm={() =>
                updateUser(
                  record,
                  { is_active: !record.is_active },
                  record.is_active ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản',
                )
              }
            >
              <Button type="link" danger={record.is_active} disabled={isSelf} loading={savingId === record.id}>
                {record.is_active ? 'Khoá' : 'Mở khoá'}
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
  };

  return (
    <div className="admin-user-page">
      {loadError && <div className="admin-user-note">Không tải được danh sách người dùng: {loadError}</div>}

      <div className="admin-user-toolbar">
        <Input.Search
          allowClear
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="admin-user-search"
        />
        <Select
          value={roleFilter}
          onChange={(value) => {
            setRoleFilter(value);
            setPage(1);
          }}
          className="admin-user-select"
          options={[
            { value: 'all', label: 'Tất cả vai trò' },
            { value: 'user', label: 'Khách hàng' },
            { value: 'admin', label: 'Quản trị' },
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          className="admin-user-select"
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Đang hoạt động' },
            { value: 'locked', label: 'Đã khoá' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        className="admin-user-table"
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          hideOnSinglePage: total <= PAGE_SIZE,
        }}
        onChange={handleTableChange}
      />

      <UserDetailModal userId={detailId} open={!!detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
