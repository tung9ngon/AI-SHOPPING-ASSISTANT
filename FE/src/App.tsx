import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Placeholder from './pages/Placeholder';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Bản đồ tuyến (route map). Các màn hình sẽ lần lượt được thay thế
// từ <Placeholder> sang trang thật qua từng bước.
export default function App() {
  return (
    <Routes>
      {/* ===== Khu vực người dùng ===== */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Placeholder name="Trang chủ" />} />
        <Route path="/products" element={<Placeholder name="Danh sách sản phẩm" />} />
        <Route path="/products/:id" element={<Placeholder name="Chi tiết sản phẩm" />} />
        <Route path="/categories/:id" element={<Placeholder name="Danh mục" />} />
        <Route path="/cart" element={<Placeholder name="Giỏ hàng" />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Placeholder name="Thanh toán" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Placeholder name="Đơn hàng của tôi" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <Placeholder name="Chi tiết đơn hàng" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-alerts"
          element={
            <ProtectedRoute>
              <Placeholder name="Theo dõi giá" />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/payos-callback" element={<Placeholder name="Kết quả thanh toán" />} />
      </Route>

      {/* ===== Auth (không dùng layout người dùng) ===== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* ===== Khu vực quản trị (sẽ thêm sau) ===== */}
      <Route path="/admin/*" element={<Placeholder name="Trang quản trị" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
