import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  refresh: () => Promise<void>;
  setCart: (c: Cart | null) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setInitialized(true);
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.get();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
      setInitialized(true);
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
    () => ({ cart, itemCount, loading, initialized, refresh, setCart }),
    [cart, itemCount, loading, initialized, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng bên trong <CartProvider>');
  return ctx;
}
