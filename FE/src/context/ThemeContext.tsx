import { palette } from '../theme/palette';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Mode = 'light' | 'dark';

const STORAGE_KEY = 'nextech_theme';

type ThemeCtx = {
  /** Chế độ người dùng đã chọn. */
  mode: Mode;
  /** Chế độ đang thực sự hiển thị — bằng `mode`, trừ khi có màn hình ép sáng. */
  effectiveMode: Mode;
  toggle: () => void;
  /** Khoá tạm về chế độ sáng; trả về hàm gỡ khoá. Xem useLockLightTheme. */
  lockLight: () => () => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

function readInitialMode(): Mode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* localStorage bị chặn (chế độ riêng tư) — rơi về lựa chọn của hệ điều hành */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(readInitialMode);
  // Đếm số màn hình đang yêu cầu ép sáng (hiện chỉ có khu quản trị).
  const [lightLocks, setLightLocks] = useState(0);

  const effectiveMode: Mode = lightLocks > 0 ? 'light' : mode;

  // Gắn lên <html> để CSS đọc qua [data-theme='dark'] trong tokens.css.
  useEffect(() => {
    document.documentElement.dataset.theme = effectiveMode;
  }, [effectiveMode]);

  // Đồng bộ màu thanh trạng thái trình duyệt trên mobile.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        'content',
        effectiveMode === 'dark' ? palette.dark.bg : palette.ink[900],
      );
    }
  }, [effectiveMode]);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next: Mode = m === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* không lưu được thì vẫn đổi trong phiên hiện tại */
      }
      return next;
    });
  }, []);

  const lockLight = useCallback(() => {
    setLightLocks((n) => n + 1);
    return () => setLightLocks((n) => Math.max(0, n - 1));
  }, []);

  const value = useMemo(
    () => ({ mode, effectiveMode, toggle, lockLight }),
    [mode, effectiveMode, toggle, lockLight],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme phải nằm trong <ThemeProvider>');
  return ctx;
}

/**
 * Ép giao diện về chế độ sáng trong lúc màn hình hiện tại còn hiển thị.
 *
 * Dùng cho khu quản trị: các file CSS ở đó viết màu cứng (khoảng 130 khai báo
 * nền/chữ dạng hex) nên chưa chạy được nền tối. Ép sáng ở đó là cách xử lý
 * trung thực hơn là để bảng dữ liệu hiện chữ tối trên nền tối.
 */
export function useLockLightTheme() {
  const { lockLight } = useTheme();
  useEffect(() => lockLight(), [lockLight]);
}
