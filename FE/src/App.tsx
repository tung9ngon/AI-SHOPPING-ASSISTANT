import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Placeholder from './pages/Placeholder';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import HomePage from './pages/home/HomePage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import PayosCallbackPage from './pages/checkout/PayosCallbackPage';
import AddressBookPage from './pages/account/AddressBookPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import PriceAlertsPage from './pages/pricealerts/PriceAlertsPage';

// Bản đồ tuyến (route map). Các màn hình sẽ lần lượt được thay thế
// từ <Placeholder> sang trang thật qua từng bước.
export default function App() {
  return (
    <Routes>
      {/* ===== Khu vực người dùng ===== */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        {/* Danh mục dùng chung trang sản phẩm với filter /products?categoryId=... */}
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-alerts"
          element={
            <ProtectedRoute>
              <PriceAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/addresses"
          element={
            <ProtectedRoute>
              <AddressBookPage />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/payos-callback" element={<PayosCallbackPage />} />
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
