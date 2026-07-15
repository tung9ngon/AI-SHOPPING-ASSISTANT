import api from './client';
import type { Cart } from '../types';

export const cartApi = {
  get: () => api.get<Cart>('/cart'),
  addItem: (product_id: string, quantity = 1) =>
    api.post<Cart>('/cart/items', { product_id, quantity }),
  updateItem: (id: string, quantity: number) =>
    api.put<Cart>(`/cart/items/${id}`, { quantity }),
  removeItem: (id: string) => api.delete(`/cart/items/${id}`),
};
