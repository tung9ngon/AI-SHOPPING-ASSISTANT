import api from './client';
import type { Paginated, Product, ProductSpec } from '../types';

// Shape thật của 1 review từ BE (product.service.findReviews): các field user đã
// được làm phẳng (user_name/avatar_url), KHÁC entity ProductReview.
export interface ReviewListItem {
  id: string;
  user_name: string;
  avatar_url: string | null;
  rating: string | number; // decimal -> string ở runtime
  title: string | null;
  content: string | null;
  created_at: string;
}

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
  price: string | number; // decimal -> string ở runtime
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
    api.get<Paginated<ReviewListItem>>(`/products/${id}/reviews`, { params }),
  createReview: (
    id: string,
    data: { rating: number; title?: string; content?: string },
  ) => api.post(`/products/${id}/reviews`, data),
};
