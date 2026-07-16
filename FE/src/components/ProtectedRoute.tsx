import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

// Chặn route yêu cầu đăng nhập. Nếu chưa đăng nhập -> chuyển tới /login,
// kèm state.from để quay lại đúng trang sau khi đăng nhập.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  // Đang gọi /auth/me để xác thực phiên: chờ để không "nháy" sang /login rồi
  // quay lại khi phiên thực ra vẫn hợp lệ (đặc biệt sau khi đăng nhập OAuth).
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
  return <>{children}</>;
}
