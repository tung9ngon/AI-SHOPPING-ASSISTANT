import api from './client';
import type { Category, Paginated, Product } from '../types';

export const categoryApi = {
  list: () => api.get<Category[]>('/categories'),
  detail: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<Category & { products: Paginated<Product> }>(`/categories/${id}`, {
      params,
    }),
};
