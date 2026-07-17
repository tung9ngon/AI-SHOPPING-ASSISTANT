import api from './client';
import type { PaymentMethod, PaymentStatus } from '../types';

// Kết quả POST /api/payments (khớp CHÍNH XÁC service)
export interface CreatePaymentResult {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number | string;
  currency: string;
  status: PaymentStatus;
  payment_url: string | null; // link cổng PayOS (redirect) — null với COD
  qr_code: string | null; // chuỗi VietQR để render QR — null với COD
}

// Kết quả GET /api/payments/:id/status
export interface PaymentStatusResult {
  id: string;
  status: PaymentStatus;
  paid_at: string | null;
  transaction_id: string | null;
}

export const paymentApi = {
  create: (order_id: string, method: PaymentMethod) =>
    api.post<CreatePaymentResult>('/payments', { order_id, method }),
  status: (id: string) => api.get<PaymentStatusResult>(`/payments/${id}/status`),
};
