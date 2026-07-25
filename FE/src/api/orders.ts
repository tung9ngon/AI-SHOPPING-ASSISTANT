import api from './client';
import type { Order, OrderStatus, Paginated } from '../types';

// Item trong danh sách đơn (GET /api/orders) — rút gọn
export interface OrderListItem {
  id: string;
  total: number | string; // bigint -> string ở runtime
  status: OrderStatus;
  created_at: string;
  item_count: number;
}

// Item sản phẩm trong chi tiết đơn
export interface OrderDetailItem {
  product: {
    id: string;
    name: string;
    price: number | string;
    image: string | null;
  };
  quantity: number;
}

// Chi tiết đơn (GET /api/orders/:id)
export interface OrderDetail {
  id: string;
  items: OrderDetailItem[];
  subtotal: number | string;
  shipping_fee: number | string;
  discount_amount: number | string;
  total: number | string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  // Các field người nhận sẽ có khi bạn dựng BE sổ địa chỉ (tuỳ chọn)
  recipient_name?: string | null;
  recipient_phone?: string | null;
  shipping_address?: string | null;
}

export const orderApi = {
  // address_id: id địa chỉ đã chọn từ sổ địa chỉ; BE snapshot thông tin vào đơn.
  create: (data: { address_id?: string; discount_code?: string; note?: string }) =>
    api.post<Order>('/orders', data),
  list: (params?: { status?: OrderStatus; page?: number; limit?: number }) =>
    api.get<Paginated<OrderListItem>>('/orders', { params }),
  detail: (id: string) => api.get<OrderDetail>(`/orders/${id}`),
  cancel: (id: string) =>
    api.put<{ id: string; status: OrderStatus; updated_at: string }>(
      `/orders/${id}/cancel`,
    ),
};
