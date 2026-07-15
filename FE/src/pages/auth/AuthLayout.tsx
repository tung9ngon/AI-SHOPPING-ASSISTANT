import { Card, Typography } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

// Khung giao diện chung cho các trang xác thực: căn giữa, có thương hiệu.
export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#e6f0ff 0%,#f5f7fb 100%)',
        padding: 24,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ fontSize: 28, color: '#1677ff', fontWeight: 700 }}>
            <ShoppingOutlined /> AI Shop
          </Link>
          <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
            {title}
          </Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        {children}
      </Card>
    </div>
  );
}
