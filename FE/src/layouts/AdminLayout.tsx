import { Avatar, Button, Layout, Menu, Tag } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  GiftOutlined,
  HomeOutlined,
  ProfileOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin', icon: <AppstoreOutlined />, label: <Link to="/admin">Tổng quan</Link> },
  {
    key: '/admin/categories',
    icon: <BarChartOutlined />,
    label: <Link to="/admin/categories">Danh mục</Link>,
  },
  {
    key: '/admin/products',
    icon: <ShoppingOutlined />,
    label: <Link to="/admin/products">Sản phẩm</Link>,
  },
  {
    key: '/admin/orders',
    icon: <ProfileOutlined />,
    label: <Link to="/admin/orders">Đơn hàng</Link>,
  },
  {
    key: '/admin/discounts',
    icon: <GiftOutlined />,
    label: <Link to="/admin/discounts">Mã giảm giá</Link>,
  },
  {
    key: '/admin/payments',
    icon: <CreditCardOutlined />,
    label: <Link to="/admin/payments">Thanh toán</Link>,
  },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Tổng quan',
  '/admin/categories': 'Quản lý danh mục',
  '/admin/products': 'Quản lý sản phẩm',
  '/admin/orders': 'Quản lý đơn hàng',
  '/admin/discounts': 'Quản lý mã giảm giá',
  '/admin/payments': 'Quản lý thanh toán',
};

function selectedMenuKey(pathname: string) {
  const matched = [...menuItems]
    .map((item) => item.key)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(`${key}/`));
  return matched ?? '/admin';
}

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const activeKey = selectedMenuKey(location.pathname);

  return (
    <Layout className="admin-shell">
      <Sider width={240} className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <Logo white height={34} />
          <Tag className="admin-brand-tag" bordered={false}>
            Admin
          </Tag>
        </Link>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenuKey(location.pathname)]}
          items={menuItems}
          className="admin-menu"
        />
      </Sider>

      <Layout className="admin-main">
        <Header className="admin-header">
          <h1>{pageTitles[activeKey] ?? 'Quản trị'}</h1>
          <div className="admin-header-actions">
            <Link to="/">
              <Button icon={<HomeOutlined />}>Về trang bán hàng</Button>
            </Link>
            <Avatar className="admin-avatar" src={user?.avatar_url || undefined}>
              {(user?.full_name || 'A').charAt(0).toUpperCase()}
            </Avatar>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
