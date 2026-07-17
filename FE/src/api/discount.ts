import api from './client';
import type { DiscountType } from '../types';

// Khớp response POST /api/discount-codes/validate
export interface ValidateDiscountResult {
  code: string;
  discount_type?: DiscountType;
  discount_value?: number | string;
  discount_amount: number; // số tiền được giảm (đã tính, làm tròn)
  min_order_value?: number | string | null;
  is_valid: boolean;
  message?: string; // lý do không hợp lệ (nếu có)
}

export const discountApi = {
  validate: (code: string, order_value: number) =>
    api.post<ValidateDiscountResult>('/discount-codes/validate', {
      code,
      order_value,
    }),
};
