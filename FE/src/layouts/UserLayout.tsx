import { Layout, Input, Badge, Dropdown, Avatar, Button, Space } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  BellOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const { Header, Content, Footer } = Layout;

export default function UserLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const onSearch = (value: string) => {
    navigate(`/products?search=${encodeURIComponent(value.trim())}`);
  };

  const userMenu: MenuProps['items'] = isAuthenticated
    ? [
        { key: 'orders', label: <Link to="/orders">Đơn hàng của tôi</Link> },
        { key: 'alerts', label: <Link to="/price-alerts">Theo dõi giá</Link> },
        ...(isAdmin
          ? [{ key: 'admin', label: <Link to="/admin">Trang quản trị</Link> }]
          : []),
        { type: 'divider' as const },
        { key: 'logout', label: 'Đăng xuất', onClick: () => logout() },
      ]
    : [
        { key: 'login', label: <Link to="/login">Đăng nhập</Link> },
        { key: 'register', label: <Link to="/register">Đăng ký</Link> },
      ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: '#001529',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <ShoppingOutlined /> AI Shop
        </Link>

        <Input.Search
          placeholder="Tìm sản phẩm..."
          allowClear
          onSearch={onSearch}
          style={{ maxWidth: 480 }}
        />

        <div style={{ flex: 1 }} />

        <Space size="large">
          <Link to="/products" style={{ color: '#fff' }}>
            Sản phẩm
          </Link>

          {isAuthenticated && (
            <Link to="/price-alerts" style={{ color: '#fff' }}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Link>
          )}

          <Link to="/cart" style={{ color: '#fff' }}>
            <Badge count={itemCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: 20, color: '#fff' }} />
            </Badge>
          </Link>

          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            {isAuthenticated ? (
              <Space style={{ color: '#fff', cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  src={user?.avatar_url || undefined}
                  icon={<UserOutlined />}
                />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.full_name}
                </span>
              </Space>
            ) : (
              <Button type="primary" icon={<UserOutlined />}>
                Tài khoản
              </Button>
            )}
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        AI Shopping Assistant ©{new Date().getFullYear()} — Đồ án
      </Footer>
    </Layout>
  );
}
