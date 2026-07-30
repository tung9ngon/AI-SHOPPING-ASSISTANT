import api from './client';
import type { DiscountType, VoucherCategory } from '../types';

export type { VoucherCategory, DiscountType };

// Khớp response POST /api/discount-codes/validate
export interface ValidateDiscountResult {
  code: string;
  category?: VoucherCategory;
  discount_type?: DiscountType;
  discount_value?: number | string;
  discount_amount: number; // số tiền được giảm (đã tính, làm tròn)
  min_order_value?: number | string | null;
  max_discount?: number | string | null; // trần giảm với mã percent
  is_valid: boolean;
  message?: string; // lý do không hợp lệ (nếu có)
}

// Khớp mỗi item trong GET /api/discount-codes & /api/discount-codes/freeship
export interface Voucher {
  code: string;
  description: string | null;
  category: VoucherCategory;
  discount_type: DiscountType;
  discount_value: number | string;
  min_order_value: number | string | null;
  max_discount: number | string | null;
  valid_until: string | null;
}

export interface VoucherListResult {
  items: Voucher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListVoucherParams {
  order_value?: number; // nếu truyền, BE chỉ trả mã đủ điều kiện
  page?: number;
  limit?: number;
}

export const discountApi = {
  // Kiểm tra & tính tiền giảm cho 1 mã (shipping_fee cần cho mã free_shipping)
  validate: (code: string, order_value: number, shipping_fee?: number) =>
    api.post<ValidateDiscountResult>('/discount-codes/validate', {
      code,
      order_value,
      ...(shipping_fee !== undefined ? { shipping_fee } : {}),
    }),

  // Danh sách voucher giảm tiền hàng (category = order)
  list: (params?: ListVoucherParams) =>
    api.get<VoucherListResult>('/discount-codes', { params }),

  // Danh sách voucher miễn phí vận chuyển (category = free_shipping)
  listFreeship: (params?: ListVoucherParams) =>
    api.get<VoucherListResult>('/discount-codes/freeship', { params }),
};

// ===== Helpers tính toán phía FE =====

// Số tiền voucher được giảm, khớp logic order.service.ts của BE.
export function calcVoucherAmount(
  v: Voucher,
  subtotal: number,
  shippingFee: number,
): number {
  const value = Number(v.discount_value);
  const isFreeship = v.category === 'free_shipping';
  const targetBase = isFreeship ? shippingFee : subtotal;

  let amt = 0;
  if (v.discount_type === 'percent') {
    amt = (targetBase * value) / 100;
    if (v.max_discount != null) {
      amt = Math.min(amt, Number(v.max_discount));
    }
  } else {
    // fixed_amount
    amt = value;
  }

  return Math.round(Math.min(amt, targetBase));
}

// Đơn hiện tại đã đủ điều kiện dùng voucher chưa
export function isVoucherEligible(v: Voucher, subtotal: number): boolean {
  const min = v.min_order_value == null ? 0 : Number(v.min_order_value);
  return subtotal >= min;
}
