import { useState, type ReactNode } from 'react';
import {
  Layout,
  Input,
  Badge,
  Dropdown,
  Avatar,
  Button,
  Space,
  Drawer,
  Menu,
  Grid,
  Divider,
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  BellOutlined,
  ShoppingOutlined,
  MenuOutlined,
  HomeOutlined,
  ShopOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ChatWidget from '../components/ChatWidget/ChatWidget';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

// Link trong footer — hover chuyển sang cam.
function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        lineHeight: 2,
        transition: 'color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#f26d21')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
    >
      {children}
    </Link>
  );
}

export default function UserLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // md = true khi viewport >= 768px (desktop/tablet)
  const isMobile = !screens.md;

  const onSearch = (value: string) => {
    navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    setDrawerOpen(false);
  };

  const userMenu: MenuProps['items'] = isAuthenticated
    ? [
      { key: 'profile', label: <Link to="/account/profile">Tài khoản của tôi</Link> },
      { key: 'orders', label: <Link to="/orders">Đơn hàng của tôi</Link> },
      { key: 'addresses', label: <Link to="/account/addresses">Sổ địa chỉ</Link> },
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

  // Menu items cho Drawer mobile
  const drawerNavItems: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/" onClick={() => setDrawerOpen(false)}>Trang chủ</Link>,
    },
    {
      key: 'products',
      icon: <ShopOutlined />,
      label: <Link to="/products" onClick={() => setDrawerOpen(false)}>Sản phẩm</Link>,
    },
    ...(isAuthenticated
      ? [
          {
            key: 'alerts',
            icon: <BellOutlined />,
            label: <Link to="/price-alerts" onClick={() => setDrawerOpen(false)}>Theo dõi giá</Link>,
          },
          {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to="/account/profile" onClick={() => setDrawerOpen(false)}>Tài khoản</Link>,
          },
          {
            key: 'orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/orders" onClick={() => setDrawerOpen(false)}>Đơn hàng</Link>,
          },
          ...(isAdmin
            ? [{
                key: 'admin',
                icon: <ShoppingOutlined />,
                label: <Link to="/admin" onClick={() => setDrawerOpen(false)}>Trang quản trị</Link>,
              }]
            : []),
        ]
      : [
          {
            key: 'login',
            icon: <LoginOutlined />,
            label: <Link to="/login" onClick={() => setDrawerOpen(false)}>Đăng nhập</Link>,
          },
          {
            key: 'register',
            icon: <UserAddOutlined />,
            label: <Link to="/register" onClick={() => setDrawerOpen(false)}>Đăng ký</Link>,
          },
        ]),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 12 : 24,
          background: 'linear-gradient(135deg, #f26d21 0%, #e8530e 100%)',
          boxShadow: '0 2px 12px rgba(242, 109, 33, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: isMobile ? '0 12px' : undefined,
        }}
      >
        {/* Hamburger chỉ hiện trên mobile */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
            style={{ padding: 4 }}
          />
        )}

        <Link
          to="/"
          style={{
            color: '#fff',
            fontSize: isMobile ? 16 : 20,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <ShoppingOutlined /> AI Shop
        </Link>

        {/* Search bar — ẩn trên mobile (chuyển vào Drawer) */}
        {!isMobile && (
          <Input.Search
            placeholder="Tìm sản phẩm..."
            allowClear
            onSearch={onSearch}
            style={{ flex: 1, maxWidth: 480, minWidth: 0 }}
          />
        )}

        {!isMobile && <div style={{ flex: 1 }} />}

        <Space size={isMobile ? 'middle' : 'large'} style={{ flexShrink: 0 }}>
          {/* Link "Sản phẩm" — ẩn trên mobile */}
          {!isMobile && (
            <Link to="/products" style={{ color: '#fff', whiteSpace: 'nowrap' }}>
              Sản phẩm
            </Link>
          )}

          {/* Bell icon — ẩn trên mobile */}
          {!isMobile && isAuthenticated && (
            <Link to="/price-alerts" style={{ color: '#fff' }}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Link>
          )}

          {/* Giỏ hàng — luôn hiện */}
          <Link to="/cart" style={{ color: '#fff' }}>
            <Badge count={itemCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: 20, color: '#fff' }} />
            </Badge>
          </Link>

          {/* Avatar / Tài khoản — luôn hiện */}
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            {isAuthenticated ? (
              <Space style={{ color: '#fff', cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  src={user?.avatar_url || undefined}
                  icon={<UserOutlined />}
                />
                {/* Ẩn tên trên mobile để tiết kiệm chỗ */}
                {!isMobile && (
                  <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.full_name}
                  </span>
                )}
              </Space>
            ) : (
              <Button
                icon={<UserOutlined />}
                style={{
                  background: '#fff',
                  color: '#e8530e',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {isMobile ? '' : 'Tài khoản'}
              </Button>
            )}
          </Dropdown>
        </Space>
      </Header>

      {/* ===== Drawer mobile (hamburger menu) ===== */}
      <Drawer
        title={
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            style={{ color: '#001529', fontWeight: 700, fontSize: 18 }}
          >
            <ShoppingOutlined /> AI Shop
          </Link>
        }
        placement="left"
        width={280}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {/* Ô tìm kiếm trong drawer */}
        <div style={{ padding: '16px 16px 8px' }}>
          <Input.Search
            placeholder="Tìm sản phẩm..."
            allowClear
            onSearch={onSearch}
          />
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Menu
          mode="inline"
          style={{ border: 'none' }}
          items={drawerNavItems}
          onClick={() => setDrawerOpen(false)}
        />
        {isAuthenticated && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ padding: '8px 16px' }}>
              <Button
                block
                danger
                onClick={() => {
                  logout();
                  setDrawerOpen(false);
                }}
              >
                Đăng xuất
              </Button>
            </div>
          </>
        )}
      </Drawer>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.65)', padding: 0 }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '40px 24px 24px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr 1fr 1fr',
              gap: 32,
              textAlign: 'left',
            }}
          >
            {/* Cột thương hiệu */}
            <div>
              <div
                style={{
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                <ShoppingOutlined /> AI Shop
              </div>
              <p style={{ lineHeight: 1.7, margin: 0, fontSize: 13 }}>
                Trợ lý mua sắm đồ điện tử thông minh — laptop, điện thoại, thiết bị
                thông minh chính hãng, giá tốt, kèm AI gợi ý &amp; theo dõi giá.
              </p>
            </div>

            {/* Cột liên kết */}
            <div>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>
                Khám phá
              </div>
              <FooterLink to="/">Trang chủ</FooterLink>
              <FooterLink to="/products">Sản phẩm</FooterLink>
              <FooterLink to="/cart">Giỏ hàng</FooterLink>
              <FooterLink to="/price-alerts">Theo dõi giá</FooterLink>
            </div>

            {/* Cột tài khoản */}
            <div>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>
                Tài khoản
              </div>
              <FooterLink to="/account/profile">Thông tin cá nhân</FooterLink>
              <FooterLink to="/orders">Đơn hàng của tôi</FooterLink>
              <FooterLink to="/account/addresses">Sổ địa chỉ</FooterLink>
            </div>

            {/* Cột hỗ trợ */}
            <div>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>
                Hỗ trợ
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.9 }}>
                Hotline: <span style={{ color: '#f26d21', fontWeight: 600 }}>1900 1234</span>
                <br />
                Email: support@aishop.vn
                <br />
                Giờ làm việc: 8:00 – 22:00
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              marginTop: 32,
              paddingTop: 20,
              textAlign: 'center',
              fontSize: 13,
            }}
          >
            AI Shopping Assistant ©{new Date().getFullYear()} — Đồ án
          </div>
        </div>
      </Footer>

      {/* Trợ lý AI nổi ở góc màn hình (mọi trang user) */}
      <ChatWidget />
    </Layout>
  );
}
