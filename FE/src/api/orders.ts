import api from './client';
import type { Order, OrderStatus, Paginated } from '../types';

export const orderApi = {
  create: (data: { discount_code?: string; note?: string }) =>
    api.post<Order>('/orders', data),
  list: (params?: { status?: OrderStatus; page?: number; limit?: number }) =>
    api.get<Paginated<Order>>('/orders', { params }),
  detail: (id: string) => api.get<Order>(`/orders/${id}`),
  cancel: (id: string) => api.put<Order>(`/orders/${id}/cancel`),
};
