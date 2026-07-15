import api from './client';
import type { Payment, PaymentMethod } from '../types';

export const paymentApi = {
  create: (order_id: string, method: PaymentMethod) =>
    api.post<Payment>('/payments', { order_id, method }),
  status: (id: string) => api.get<Payment>(`/payments/${id}/status`),
};
