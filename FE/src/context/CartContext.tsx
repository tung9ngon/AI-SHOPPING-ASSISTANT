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
  refresh: () => Promise<void>;
  setCart: (c: Cart | null) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
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
    () => ({ cart, itemCount, loading, refresh, setCart }),
    [cart, itemCount, loading, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng bên trong <CartProvider>');
  return ctx;
}
