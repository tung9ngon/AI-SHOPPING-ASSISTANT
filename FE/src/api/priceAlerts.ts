import api from './client';
import type { NotifyChannel, PriceAlert } from '../types';

export const priceAlertApi = {
  list: () => api.get<PriceAlert[]>('/price-alerts'),
  create: (data: {
    product_id: string;
    target_price: number;
    notify_channel?: NotifyChannel;
  }) => api.post<PriceAlert>('/price-alerts', data),
  remove: (id: string) => api.delete(`/price-alerts/${id}`),
};
