import { theme, type ThemeConfig } from 'antd';
import { palette, radius, fontBody } from './palette';

const { defaultAlgorithm, darkAlgorithm } = theme;

/**
 * Theme Ant Design dựng từ bảng màu chung.
 *
 * Nguyên tắc: KHÔNG chỉnh style AntD bằng CSS ở từng trang. Mọi tinh chỉnh dùng
 * chung phải nằm ở đây để một chỗ sửa là cả site đổi theo.
 *
 * Lưu ý về colorPrimary: dùng brand-700 (#C2410C) chứ không dùng cam nhận diện
 * #F26D21. Lý do: AntD lấy colorPrimary làm nền nút chính + màu link, mà cam
 * #F26D21 với chữ trắng chỉ đạt 3.01:1 — dưới ngưỡng 4.5:1 của WCAG AA. Cam gốc
 * vẫn được giữ nguyên vai trò nhận diện ở gradient, viền, badge, gạch tiêu đề.
 */

/** Phần dùng chung cho cả chế độ sáng và tối. */
const shared: ThemeConfig['token'] = {
  colorPrimary: palette.brand[700],
  colorInfo: palette.state.info,
  colorSuccess: palette.state.success,
  colorWarning: palette.state.warning,
  colorError: palette.state.danger,

  fontFamily: fontBody,
  fontSize: 15,
  fontSizeHeading1: 34,
  fontSizeHeading2: 28,
  fontSizeHeading3: 22,
  fontSizeHeading4: 18,
  fontSizeHeading5: 16,
  lineHeight: 1.55,

  borderRadius: radius.md,
  borderRadiusLG: radius.lg,
  borderRadiusSM: radius.sm,
  borderRadiusXS: 4,

  // Chiều cao control 40px: đạt ngưỡng vùng chạm tối thiểu trên mobile
  // (44px tính cả khoảng đệm quanh) và cân đối hơn mức 32px mặc định.
  controlHeight: 40,
  controlHeightSM: 32,
  controlHeightLG: 48,

  wireframe: false,
  motionDurationFast: '0.15s',
  motionDurationMid: '0.22s',
  motionDurationSlow: '0.32s',
  motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  motionEaseOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

const sharedComponents: ThemeConfig['components'] = {
  Button: {
    fontWeight: 600,
    primaryShadow: 'none', // bóng cam mặc định làm nút trông "dính"; tự xử lý ở CSS
    defaultShadow: 'none',
    dangerShadow: 'none',
    paddingInline: 20,
    paddingInlineLG: 28,
  },
  Input: { paddingInline: 14, activeShadow: '0 0 0 3px rgba(242, 109, 33, 0.18)' },
  InputNumber: { paddingInline: 12 },
  Select: { optionSelectedFontWeight: 600 },
  Card: { paddingLG: 20 },
  Table: { headerBorderRadius: radius.md, cellPaddingBlock: 14 },
  Modal: { titleFontSize: 18, paddingContentHorizontalLG: 24 },
  Drawer: { paddingLG: 20 },
  Tag: { borderRadiusSM: radius.sm, defaultBg: 'transparent' },
  Menu: { itemBorderRadius: radius.sm, itemMarginInline: 6, activeBarWidth: 0 },
  Tabs: { horizontalItemGutter: 28, titleFontSize: 15 },
  Pagination: { itemActiveBg: palette.brand[700] },
  Steps: { iconSize: 30 },
  Segmented: { itemSelectedBg: palette.ink[0] },
  Tooltip: { borderRadius: radius.sm },
  Badge: { textFontSize: 11, textFontWeight: 700 },
  Rate: { starSize: 16 },
  Message: { contentPadding: '12px 18px' },
  Result: { titleFontSize: 22 },
};

export const lightTheme: ThemeConfig = {
  algorithm: defaultAlgorithm,
  token: {
    ...shared,
    colorLink: palette.brand[700],
    colorLinkHover: palette.brand[800],
    colorLinkActive: palette.brand[900],

    colorText: palette.ink[900],
    colorTextSecondary: palette.ink[600],
    // Typography type="secondary" lấy token này chứ không lấy colorTextSecondary.
    // Mặc định của AntD là ink-500: đạt 4.83:1 trên nền trắng nhưng tụt xuống
    // 4.47:1 khi đặt trên nền tint cam (--color-accent-soft). Hạ một bậc.
    colorTextDescription: palette.ink[600],
    colorTextTertiary: palette.ink[500],
    colorTextQuaternary: palette.ink[400], // chỉ dùng cho viền/icon mờ, không dùng cho chữ
    // Mặc định AntD lấy colorTextQuaternary (#9AA3B2) làm màu placeholder —
    // chỉ đạt 2.54:1, dưới chuẩn AA. Placeholder vẫn là chữ người dùng phải đọc
    // nên nâng lên ink-500 (4.83:1).
    colorTextPlaceholder: palette.ink[500],

    colorBgLayout: palette.ink[50],
    colorBgContainer: palette.ink[0],
    colorBgElevated: palette.ink[0],
    colorBorder: palette.ink[200],
    colorBorderSecondary: palette.ink[100],
    colorFillQuaternary: palette.ink[50],

    boxShadow: '0 2px 4px -2px rgba(16, 24, 40, 0.06), 0 4px 8px -2px rgba(16, 24, 40, 0.10)',
    boxShadowSecondary:
      '0 4px 6px -2px rgba(16, 24, 40, 0.03), 0 12px 16px -4px rgba(16, 24, 40, 0.08)',
    boxShadowTertiary: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)',
  },
  components: {
    ...sharedComponents,
    Layout: {
      bodyBg: 'transparent',
      headerBg: palette.ink[900],
      footerBg: palette.ink[900],
      siderBg: palette.ink[900],
    },
    Table: { ...sharedComponents!.Table, headerBg: palette.ink[50], rowHoverBg: palette.brand[50] },
    Menu: { ...sharedComponents!.Menu, itemSelectedBg: palette.brand[50], itemSelectedColor: palette.brand[700] },
    Select: { ...sharedComponents!.Select, optionSelectedBg: palette.brand[50] },
    Segmented: { ...sharedComponents!.Segmented, itemSelectedBg: palette.ink[0] },
  },
};

export const darkTheme: ThemeConfig = {
  algorithm: darkAlgorithm,
  token: {
    ...shared,
    // Trên nền tối, cam đậm ngả nâu bùn và tụt tương phản -> đẩy lên bậc sáng hơn.
    colorPrimary: palette.brand[500],
    colorLink: palette.brand[300],
    colorLinkHover: palette.brand[200],
    colorLinkActive: palette.brand[400],

    colorText: palette.dark.text,
    colorTextSecondary: palette.dark.textMuted,
    colorTextDescription: palette.dark.textMuted,
    colorTextPlaceholder: palette.dark.textPlaceholder,
    colorBgLayout: palette.dark.bg,
    colorBgContainer: palette.dark.surface,
    colorBgElevated: palette.dark.raised,
    colorBorder: palette.dark.border,
    colorBorderSecondary: palette.dark.border,
  },
  components: {
    ...sharedComponents,
    Button: {
      ...sharedComponents!.Button,
      // Chế độ tối dùng cam sáng làm nền nút chính. AntD mặc định đặt chữ TRẮNG
      // lên đó — chỉ đạt 3.01:1. Đổi sang chữ nâu gần đen: 6.36:1.
      primaryColor: palette.dark.onCta,
    },
    Tabs: {
      ...sharedComponents!.Tabs,
      // Tab đang chọn mặc định lấy colorPrimary (#F26D21) — trên nền tối chỉ
      // đạt 4.21:1 ở cỡ chữ 15px. Dùng bậc sáng hơn: 8.36:1.
      itemSelectedColor: palette.brand[300],
      itemHoverColor: palette.brand[200],
      inkBarColor: palette.brand[400],
    },
    Layout: {
      bodyBg: 'transparent',
      headerBg: palette.dark.surface,
      footerBg: palette.dark.surface,
      siderBg: palette.dark.surface,
    },
    Table: {
      ...sharedComponents!.Table,
      headerBg: palette.dark.raised,
      rowHoverBg: 'rgba(242, 109, 33, 0.08)',
    },
    Menu: {
      ...sharedComponents!.Menu,
      itemSelectedBg: 'rgba(242, 109, 33, 0.16)',
      itemSelectedColor: palette.brand[300],
    },
    Select: { ...sharedComponents!.Select, optionSelectedBg: 'rgba(242, 109, 33, 0.16)' },
    Segmented: { ...sharedComponents!.Segmented, itemSelectedBg: palette.dark.raised },
  },
};
