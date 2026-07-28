import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cartApi } from '../api/cart';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  /** true sau khi đã thử tải giỏ ÍT NHẤT 1 lần (tránh redirect sớm khi cart còn null) */
  initialized: boolean;
  /** true khi lần fetch gần nhất thất bại (mất mạng, server lỗi) */
  fetchError: boolean;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Giá trị isAuthenticated MỚI NHẤT, để so sánh với giá trị đã đóng trong
  // closure của refresh() tại thời điểm gọi (xem isStale() bên dưới).
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  const refresh = useCallback(async () => {
    // Nếu người dùng đăng xuất (isAuthenticated đổi) trong lúc request này còn
    // đang chạy, kết quả trả về muộn sẽ bị bỏ qua thay vì ghi đè giỏ hàng đã
    // bị dọn về null.
    const isStale = () => isAuthenticatedRef.current !== isAuthenticated;

    if (!isAuthenticated) {
      setCart(null);
      setFetchError(false);
      setInitialized(true);
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.get();
      if (isStale()) return;
      setCart(res.data);
      setFetchError(false);
    } catch {
      if (isStale()) return;
      setCart(null);
      setFetchError(true);
    } finally {
      if (!isStale()) {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const itemCount = useMemo(
    () => cart?.items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0,
    [cart],
  );

  const value = useMemo(
    () => ({ cart, itemCount, loading, initialized, fetchError, refresh }),
    [cart, itemCount, loading, initialized, fetchError, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng bên trong <CartProvider>');
  return ctx;
}

