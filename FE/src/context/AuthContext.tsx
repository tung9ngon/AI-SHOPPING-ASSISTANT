import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth';
import { adminCategoryApi } from '../api/admin';
import type { AuthUser, UserRole } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (u: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

// Vì backend không trả role trong /auth/login và cookie là httpOnly (JS không
// decode được JWT), ta "dò" quyền bằng cách gọi thử một endpoint admin nhẹ:
// - 200 -> user là admin
// - 403/lỗi -> user thường
async function probeRole(): Promise<UserRole> {
  try {
    await adminCategoryApi.list({ limit: 1, page: 1 });
    return 'admin';
  } catch {
    return 'user';
  }
}

const STORAGE_KEY = 'auth_user';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Vì backend không có endpoint /auth/me, ta lưu tạm thông tin user (id, email,
  // full_name, role) vào localStorage để khôi phục khi tải lại trang. Phiên đăng
  // nhập thực tế vẫn nằm ở cookie httpOnly do backend quản lý.
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

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    // Dò quyền admin ngay sau khi đăng nhập rồi lưu kèm vào user.
    const role = await probeRole();
    const u: AuthUser = { ...res.data.user, role };
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

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
      setUser,
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  return ctx;
}
