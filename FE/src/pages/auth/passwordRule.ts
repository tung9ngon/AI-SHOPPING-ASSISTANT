import type { Rule } from 'antd/es/form';

// Quy tắc mật khẩu khớp với backend: tối thiểu 8 ký tự, ít nhất 1 chữ hoa và 1 chữ số.
export const passwordRules: Rule[] = [
  { required: true, message: 'Vui lòng nhập mật khẩu' },
  { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
  {
    pattern: /^(?=.*[A-Z])(?=.*\d).+$/,
    message: 'Mật khẩu cần ít nhất 1 chữ hoa và 1 chữ số',
  },
];

export const emailRules: Rule[] = [
  { required: true, message: 'Vui lòng nhập email' },
  { type: 'email', message: 'Email không hợp lệ' },
];
