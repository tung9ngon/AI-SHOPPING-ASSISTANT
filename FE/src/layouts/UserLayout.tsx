import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Grid,
  Input,
  Menu,
  Tooltip,
} from 'antd';
import {
  BellOutlined,
  HomeOutlined,
  LoginOutlined,
  MenuOutlined,
  MoonOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SunOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import ChatWidget from '../components/ChatWidget/ChatWidget';
import Logo from '../components/Logo';
import './UserLayout.css';

const { useBreakpoint } = Grid;

export default function UserLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { mode, toggle } = useTheme();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = !screens.md;

  const onSearch = (value: string) => {
    const q = value.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setDrawerOpen(false);
  };

  const accountMenu: MenuProps['items'] = isAuthenticated
    ? [
        { key: 'profile', label: <Link to="/account/profile">Tài khoản của tôi</Link> },
        { key: 'orders', label: <Link to="/orders">Đơn hàng của tôi</Link> },
        { key: 'addresses', label: <Link to="/account/addresses">Sổ địa chỉ</Link> },
        { key: 'alerts', label: <Link to="/price-alerts">Theo dõi giá</Link> },
        ...(isAdmin ? [{ key: 'admin', label: <Link to="/admin">Trang quản trị</Link> }] : []),
        { type: 'divider' as const },
        { key: 'logout', danger: true, label: 'Đăng xuất', onClick: () => logout() },
      ]
    : [
        { key: 'login', label: <Link to="/login">Đăng nhập</Link> },
        { key: 'register', label: <Link to="/register">Đăng ký</Link> },
      ];

  const closeDrawer = () => setDrawerOpen(false);

  const drawerNav: MenuProps['items'] = [
    { key: 'home', icon: <HomeOutlined />, label: <Link to="/" onClick={closeDrawer}>Trang chủ</Link> },
    { key: 'products', icon: <ShopOutlined />, label: <Link to="/products" onClick={closeDrawer}>Sản phẩm</Link> },
    ...(isAuthenticated
      ? [
          { key: 'alerts', icon: <BellOutlined />, label: <Link to="/price-alerts" onClick={closeDrawer}>Theo dõi giá</Link> },
          { key: 'profile', icon: <UserOutlined />, label: <Link to="/account/profile" onClick={closeDrawer}>Tài khoản</Link> },
          { key: 'orders', icon: <ShoppingCartOutlined />, label: <Link to="/orders" onClick={closeDrawer}>Đơn hàng</Link> },
          ...(isAdmin
            ? [{ key: 'admin', icon: <ShoppingOutlined />, label: <Link to="/admin" onClick={closeDrawer}>Trang quản trị</Link> }]
            : []),
        ]
      : [
          { key: 'login', icon: <LoginOutlined />, label: <Link to="/login" onClick={closeDrawer}>Đăng nhập</Link> },
          { key: 'register', icon: <UserAddOutlined />, label: <Link to="/register" onClick={closeDrawer}>Đăng ký</Link> },
        ]),
  ];

  const themeLabel = mode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';

  return (
    <div className="ulayout">
      {/* Phím Tab đầu tiên: cho người dùng bàn phím nhảy thẳng vào nội dung,
          không phải đi hết thanh điều hướng ở mọi trang. */}
      <a className="skip-link" href="#main">
        Bỏ qua, tới nội dung chính
      </a>

      {!isMobile && (
        <div className="utility-bar">
          <div className="container utility-bar__inner">
            <span>Chính hãng 100% · Giao hoả tốc nội thành 2 giờ</span>
            <div className="utility-bar__group">
              <span>
                Hỗ trợ <span className="utility-bar__hotline">1900 1234</span>
              </span>
              <Link to="/orders">Tra cứu đơn hàng</Link>
            </div>
          </div>
        </div>
      )}

      <header className="uheader">
        <div className="container uheader__inner">
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: 'var(--color-on-navy)', fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
              aria-label="Mở menu điều hướng"
            />
          )}

          <Link to="/" className="uheader__logo" aria-label="NexTech — về trang chủ">
            <Logo white height={isMobile ? 30 : 38} />
          </Link>

          {!isMobile && (
            <div className="uheader__search">
              <Input.Search
                placeholder="Bạn cần tìm sản phẩm gì?"
                allowClear
                enterButton
                size="large"
                onSearch={onSearch}
                aria-label="Tìm kiếm sản phẩm"
              />
            </div>
          )}

          <nav className="uheader__nav" aria-label="Điều hướng chính">
            {!isMobile && (
              <Link to="/products" className="uheader__link">
                Sản phẩm
              </Link>
            )}

            <Tooltip title={themeLabel}>
              <button
                type="button"
                className="uheader__link uheader__link--icon"
                onClick={toggle}
                aria-label={themeLabel}
              >
                {mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              </button>
            </Tooltip>

            {!isMobile && isAuthenticated && (
              <Link to="/price-alerts" className="uheader__link uheader__link--icon" aria-label="Theo dõi giá">
                <BellOutlined />
              </Link>
            )}

            <Link
              to="/cart"
              className="uheader__link uheader__link--icon"
              aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}
            >
              <Badge count={itemCount} size="small" overflowCount={99}>
                <ShoppingCartOutlined style={{ fontSize: 20, color: 'var(--color-on-navy)' }} />
              </Badge>
            </Link>

            <Dropdown menu={{ items: accountMenu }} placement="bottomRight" trigger={['click']}>
              {isAuthenticated ? (
                <button type="button" className="uheader__account" aria-label="Menu tài khoản">
                  <Avatar size={30} src={user?.avatar_url || undefined} icon={<UserOutlined />} />
                  {!isMobile && <span className="uheader__account-name">{user?.full_name}</span>}
                </button>
              ) : (
                <Button className="uheader__cta" icon={<UserOutlined />} size={isMobile ? 'middle' : 'large'}>
                  {isMobile ? '' : 'Tài khoản'}
                </Button>
              )}
            </Dropdown>
          </nav>
        </div>

        {/* Trên mobile ô tìm kiếm nằm thành hàng riêng thay vì bị giấu trong drawer */}
        {isMobile && (
          <div className="container uheader__mobile-search">
            <Input.Search
              placeholder="Bạn cần tìm sản phẩm gì?"
              allowClear
              enterButton
              onSearch={onSearch}
              aria-label="Tìm kiếm sản phẩm"
            />
          </div>
        )}
      </header>

      <Drawer
        title={
          <Link to="/" onClick={closeDrawer} aria-label="NexTech — về trang chủ">
            <Logo height={30} />
          </Link>
        }
        placement="left"
        width={288}
        open={drawerOpen}
        onClose={closeDrawer}
        styles={{ body: { padding: 0 } }}
      >
        <Menu mode="inline" style={{ border: 'none' }} items={drawerNav} onClick={closeDrawer} />
        {isAuthenticated && (
          <>
            <Divider style={{ margin: 0 }} />
            <div className="udrawer__foot">
              <Button block danger onClick={() => { logout(); closeDrawer(); }}>
                Đăng xuất
              </Button>
            </div>
          </>
        )}
      </Drawer>

      <main id="main" className="ucontent">
        <Outlet />
      </main>

      <footer className="ufooter">
        <div className="container">
          <div className="ufooter__inner">
            <div className="ufooter__about">
              <Logo white height={42} />
              <p>
                Trợ lý mua sắm đồ điện tử thông minh — laptop, điện thoại, thiết bị thông
                minh chính hãng, giá tốt, kèm AI gợi ý và theo dõi giá tự động.
              </p>
            </div>

            <div>
              <h2 className="ufooter__heading">Khám phá</h2>
              <Link className="ufooter__link" to="/">Trang chủ</Link>
              <Link className="ufooter__link" to="/products">Sản phẩm</Link>
              <Link className="ufooter__link" to="/cart">Giỏ hàng</Link>
              <Link className="ufooter__link" to="/price-alerts">Theo dõi giá</Link>
            </div>

            <div>
              <h2 className="ufooter__heading">Tài khoản</h2>
              <Link className="ufooter__link" to="/account/profile">Thông tin cá nhân</Link>
              <Link className="ufooter__link" to="/orders">Đơn hàng của tôi</Link>
              <Link className="ufooter__link" to="/account/addresses">Sổ địa chỉ</Link>
            </div>

            <div>
              <h2 className="ufooter__heading">Hỗ trợ</h2>
              <div className="ufooter__contact">
                Hotline: <b>1900 1234</b>
                <br />
                Email: support@nextech.vn
                <br />
                Giờ làm việc: 8:00 – 22:00
              </div>
            </div>
          </div>

          <div className="ufooter__bottom">
            <span>NexTech ©{new Date().getFullYear()} — Trợ lý mua sắm đồ điện tử thông minh</span>
            <span>Chính hãng · Bảo hành toàn quốc</span>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
