import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Result, Button, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Chặn route quản trị: yêu cầu đăng nhập và role === 'admin'.
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, bootstrapping } = useAuth();
  const location = useLocation();

  // Đang gọi /auth/me để xác thực phiên: chờ để không "nháy" sang /login rồi
  // quay lại khi phiên thực ra vẫn hợp lệ (đặc biệt sau khi đăng nhập OAuth,
  // lúc localStorage chưa có user nhưng cookie đã hợp lệ).
  if (bootstrapping) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#888' }}>Đang kiểm tra phiên đăng nhập...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập khu vực quản trị."
        extra={
          <Link to="/">
            <Button type="primary">Về trang chủ</Button>
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}
