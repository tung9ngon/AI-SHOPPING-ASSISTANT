import api from './client';
import type { Order, OrderStatus, Paginated } from '../types';

export const orderApi = {
  // address_id: id địa chỉ đã chọn từ sổ địa chỉ; BE snapshot thông tin vào đơn.
  create: (data: { address_id?: string; discount_code?: string; note?: string }) =>
    api.post<Order>('/orders', data),
  list: (params?: { status?: OrderStatus; page?: number; limit?: number }) =>
    api.get<Paginated<Order>>('/orders', { params }),
  detail: (id: string) => api.get<Order>(`/orders/${id}`),
  cancel: (id: string) => api.put<Order>(`/orders/${id}/cancel`),
};
