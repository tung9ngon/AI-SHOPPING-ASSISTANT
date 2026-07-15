import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Chặn route quản trị: yêu cầu đăng nhập và role === 'admin'.
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} replace />;
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
