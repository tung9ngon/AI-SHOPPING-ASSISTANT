import api from './client';
import type { Paginated, Product, ProductReview, ProductSpec } from '../types';

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  brand?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
  page?: number;
  limit?: number;
}

// Sản phẩm ở dạng danh sách (backend trả về rút gọn)
export interface ProductListItem {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  rating: string | null;
  primary_image: string | null;
  category_name: string | null;
  tags: string[];
}

export const productApi = {
  list: (params: ProductQuery) =>
    api.get<Paginated<ProductListItem>>('/products', { params }),
  brands: () => api.get<string[]>('/products/brands'),
  detail: (id: string) =>
    api.get<Product & { review_count: number }>(`/products/${id}`),
  specs: (id: string) => api.get<ProductSpec[]>(`/products/${id}/specs`),
  reviews: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<Paginated<ProductReview>>(`/products/${id}/reviews`, { params }),
  createReview: (
    id: string,
    data: { rating: number; title?: string; content?: string },
  ) => api.post(`/products/${id}/reviews`, data),
};
