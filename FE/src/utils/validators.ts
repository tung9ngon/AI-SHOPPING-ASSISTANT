import type { Rule } from 'antd/es/form';

// Số điện thoại: khớp CHÍNH XÁC ràng buộc BE (class-validator @Matches trong
// address.dto.ts & profile.dto.ts) để FE không từ chối số BE chấp nhận và ngược lại.
export const PHONE_PATTERN = /^[0-9+ ]{8,15}$/;

export const phoneRule: Rule = {
  pattern: PHONE_PATTERN,
  message: 'Số điện thoại 8-15 ký tự (chỉ số, +, khoảng trắng)',
};
