import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** true trong lúc gọi /auth/me khi tải trang (tránh nháy trạng thái) */
  bootstrapping: boolean;
  setUser: (u: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = 'auth_user';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // localStorage chỉ là bộ nhớ đệm (optimistic) để render tức thì khi tải lại,
  // TRÁNH nháy "đăng xuất -> đăng nhập". Nguồn SỰ THẬT là GET /auth/me: khi mount
  // ta gọi /auth/me để xác nhận phiên và lấy thông tin user (kèm role thật) từ cookie.
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  // Khi tải trang: hỏi server "tôi là ai?" qua /auth/me.
  // - 200: set user thật (đồng bộ role, và hydrate cả sau khi đăng nhập OAuth
  //        vì lúc đó localStorage rỗng nhưng cookie đã hợp lệ).
  // - 401/lỗi xác thực: phiên đã chết -> dọn user (sửa trạng thái lệch).
  const [bootstrapping, setBootstrapping] = useState(true);
  useEffect(() => {
    let ignore = false;
    authApi
      .me()
      .then((res) => {
        if (!ignore) setUser(res.data);
      })
      .catch((err) => {
        // Chỉ đăng xuất khi server thực sự nói 401 (không phải lỗi mạng tạm thời).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!ignore && (err as any)?.response?.status === 401) setUser(null);
      })
      .finally(() => {
        if (!ignore) setBootstrapping(false);
      });
    return () => {
      ignore = true;
    };
    // Chỉ chạy 1 lần khi mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password); // set cookie
    // Lấy thông tin đầy đủ (kèm role thật) từ /auth/me thay vì đoán.
    const me = await authApi.me();
    setUser(me.data);
    return me.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  // Đồng bộ giữa các tab (đăng nhập/đăng xuất ở tab khác).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setUserState(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      bootstrapping,
      setUser,
      login,
      logout,
    }),
    [user, bootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  return ctx;
}
