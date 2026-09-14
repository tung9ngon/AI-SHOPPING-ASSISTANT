/**
 * Bảng màu gốc — bản sao TypeScript của tầng PRIMITIVE trong src/styles/tokens.css.
 *
 * Vì sao phải sao chép: thuật toán sinh màu của Ant Design cần giá trị hex thật ở
 * thời điểm dựng theme, nó không đọc được var(--...) của CSS. Đây là 2 bản của
 * CÙNG một bảng màu — sửa một bên thì phải sửa bên kia.
 */
export const palette = {
  brand: {
    50: '#FFF4ED',
    100: '#FFE6D5',
    200: '#FFC9AA',
    300: '#FDA474',
    400: '#FB7C3C',
    500: '#F26D21', // màu nhận diện — chỉ dùng cho mảng trang trí
    600: '#E8530E',
    700: '#C2410C', // nền hành động — đạt 5.18:1 với chữ trắng
    800: '#9A3412',
    900: '#7C2D12',
  },
  ink: {
    0: '#FFFFFF',
    25: '#FCFCFD',
    50: '#F7F8FA',
    100: '#F1F3F7',
    200: '#E5E8EF',
    300: '#D3D8E2',
    400: '#9AA3B2',
    500: '#6B7280',
    600: '#4B5565',
    700: '#344054',
    800: '#202939',
    900: '#1A1A2E',
    950: '#0F1526',
  },
  state: {
    success: '#0E9F6E',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#2563EB',
  },
  price: '#D0021B',
  /** Bề mặt chế độ tối — bản sao của khối [data-theme='dark'] trong tokens.css */
  dark: {
    bg: '#0E1220',
    surface: '#191F33',
    raised: '#1F2740',
    border: '#2A3350',
    text: '#EEF1F8',
    textMuted: '#AAB4CC',
    textPlaceholder: '#8B96B2',  // 5.53:1 trên `surface`
    /** Chữ đặt trên nút cam sáng của chế độ tối — 6.36:1, chữ trắng chỉ được 3.01:1 */
    onCta: '#1A0C03',
  },
} as const;

export const radius = { sm: 6, md: 10, lg: 14, xl: 20 } as const;

export const fontBody =
  "'Nunito Sans', 'Be Vietnam Pro', 'Segoe UI', system-ui, -apple-system, sans-serif";
export const fontDisplay =
  "'Be Vietnam Pro', 'Segoe UI', system-ui, -apple-system, sans-serif";
