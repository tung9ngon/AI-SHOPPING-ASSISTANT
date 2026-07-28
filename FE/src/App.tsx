import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
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
import ProfilePage from './pages/account/ProfilePage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import PriceAlertsPage from './pages/pricealerts/PriceAlertsPage';
import DashboardPage from './pages/admin/DashboardPage';
import CategoryListPage from './pages/admin/CategoryListPage';
import ProductListPage from './pages/admin/ProductListPage';
import OrderListPage from './pages/admin/OrderListPage';
import DiscountListPage from './pages/admin/DiscountListPage';
import PaymentListPage from './pages/admin/PaymentListPage';

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
          path="/account/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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

      {/* ===== Khu vực quản trị ===== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="categories" element={<CategoryListPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="discounts" element={<DiscountListPage />} />
        <Route path="payments" element={<PaymentListPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
