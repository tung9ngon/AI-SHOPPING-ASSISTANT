import api from './client';

export interface ValidateDiscountResult {
  valid?: boolean;
  code?: string;
  discount_amount: number;
  message?: string;
}

export const discountApi = {
  validate: (code: string, order_value: number) =>
    api.post<ValidateDiscountResult>('/discount-codes/validate', {
      code,
      order_value,
    }),
};
