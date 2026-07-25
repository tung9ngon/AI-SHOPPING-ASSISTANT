import api from './client';
import type { NotifyChannel } from '../types';

// Khớp CHÍNH XÁC response GET /api/price-alerts
export interface PriceAlertItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: string | number; // bigint -> string
    image: string | null;
  };
  target_price: string | number;
  status: 'active' | 'triggered' | 'cancelled';
  notify_channel: NotifyChannel;
  created_at: string;
}

export const priceAlertApi = {
  // Trả TẤT CẢ status (kể cả cancelled) -> FE tự lọc.
  list: () => api.get<PriceAlertItem[]>('/price-alerts'),
  create: (data: {
    product_id: string;
    target_price: number;
    notify_channel?: NotifyChannel;
  }) => api.post('/price-alerts', data),
  // Soft delete (BE set status='cancelled').
  remove: (id: string) => api.delete(`/price-alerts/${id}`),
};
