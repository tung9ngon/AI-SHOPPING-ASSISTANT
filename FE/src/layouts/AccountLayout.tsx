import { Avatar, Button, Popconfirm } from 'antd';
import {
  BellOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  ProfileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AccountLayout.css';

const NAV = [
  { to: '/account/profile', icon: <UserOutlined />, label: 'Thông tin tài khoản' },
  { to: '/orders', icon: <ProfileOutlined />, label: 'Đơn hàng của tôi' },
  { to: '/account/addresses', icon: <EnvironmentOutlined />, label: 'Sổ địa chỉ' },
  { to: '/price-alerts', icon: <BellOutlined />, label: 'Theo dõi giá' },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="account">
      <aside className="account__side">
        <div className="account__card account__card--me">
          <div className="account__me">
            <Avatar size={48} src={user?.avatar_url || undefined} icon={<UserOutlined />} />
            <div className="account__me-text">
              <div className="account__me-name">{user?.full_name}</div>
              <div className="account__me-mail">{user?.email || '—'}</div>
            </div>
          </div>
        </div>

        <nav className="account__card account__nav" aria-label="Điều hướng khu tài khoản">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              // Không truyền `end`: NavLink khớp cả tuyến con, nhờ vậy mục
              // "Đơn hàng của tôi" vẫn sáng khi đang xem /orders/:id.
              // NavLink tự gắn aria-current="page" — CSS bắt theo thuộc tính đó.
              className="account__link"
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="account__logout">
            <Popconfirm
              title="Đăng xuất khỏi tài khoản?"
              okText="Đăng xuất"
              cancelText="Ở lại"
              okButtonProps={{ danger: true }}
              onConfirm={() => logout()}
            >
              <Button type="text" danger block icon={<LogoutOutlined />} style={{ justifyContent: 'flex-start' }}>
                Đăng xuất
              </Button>
            </Popconfirm>
          </div>
        </nav>
      </aside>

      <div>
        <Outlet />
      </div>
    </div>
  );
}
