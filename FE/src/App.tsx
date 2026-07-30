import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import UserLayout from './layouts/UserLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/home/HomePage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import LoginPage from './pages/auth/LoginPage';

// Tách bundle theo tuyến (code-splitting): các trang ít vào hơn / nặng hơn được tải
// theo yêu cầu để giảm kích thước bundle khởi động cho người dùng thường. Trang chủ,
// danh sách/chi tiết sản phẩm và đăng nhập tải sẵn vì là điểm vào chính.
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const PayosCallbackPage = lazy(() => import('./pages/checkout/PayosCallbackPage'));
const AddressBookPage = lazy(() => import('./pages/account/AddressBookPage'));
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/orders/OrderDetailPage'));
const PriceAlertsPage = lazy(() => import('./pages/pricealerts/PriceAlertsPage'));

// Cụm quản trị: tách hẳn khỏi bundle người dùng — khách mua hàng không bao giờ tải.
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const CategoryListPage = lazy(() => import('./pages/admin/CategoryListPage'));
const ProductListPage = lazy(() => import('./pages/admin/ProductListPage'));
const OrderListPage = lazy(() => import('./pages/admin/OrderListPage'));
const DiscountListPage = lazy(() => import('./pages/admin/DiscountListPage'));
const PaymentListPage = lazy(() => import('./pages/admin/PaymentListPage'));

function PageFallback() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <Spin size="large" />
    </div>
  );
}

// Bản đồ tuyến (route map).
export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}
