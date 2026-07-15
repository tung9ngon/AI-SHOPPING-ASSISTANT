import api from './client';
import type {
  Category,
  DiscountCode,
  Order,
  OrderStatus,
  Paginated,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Product,
} from '../types';

// ===== Admin: Categories =====
export const adminCategoryApi = {
  list: (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => api.get<Paginated<Category>>('/admin/categories', { params }),
  detail: (id: string) => api.get<Category>(`/admin/categories/${id}`),
  create: (data: {
    name: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) => api.post<Category>('/admin/categories', data),
  update: (
    id: string,
    data: Partial<{ name: string; icon: string; sortOrder: number; isActive: boolean }>,
  ) => api.patch<Category>(`/admin/categories/${id}`, data),
  remove: (id: string) => api.delete(`/admin/categories/${id}`),
  hardRemove: (id: string) => api.delete(`/admin/categories/${id}/hard`),
};

// ===== Admin: Products =====
export const adminProductApi = {
  list: (params?: {
    search?: string;
    categoryId?: string;
    brand?: string;
    isActive?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) => api.get<Paginated<Product>>('/admin/products', { params }),
  create: (data: {
    name: string;
    category_id?: string;
    brand?: string;
    price: number;
    description?: string;
    is_active?: boolean;
  }) => api.post<Product>('/admin/products', data),
  update: (
    id: string,
    data: Partial<{ name: string; price: number; description: string; is_active: boolean }>,
  ) => api.put<Product>(`/admin/products/${id}`, data),
  remove: (id: string) => api.delete(`/admin/products/${id}`),

  addImage: (
    id: string,
    data: { image_url: string; is_primary?: boolean; sort_order?: number },
  ) => api.post(`/admin/products/${id}/images`, data),
  removeImage: (id: string, imageId: string) =>
    api.delete(`/admin/products/${id}/images/${imageId}`),

  addSpec: (
    id: string,
    data: { spec_key: string; spec_value: string; spec_unit?: string },
  ) => api.post(`/admin/products/${id}/specs`, data),
  updateSpec: (
    id: string,
    specId: string,
    data: Partial<{ spec_key: string; spec_value: string; spec_unit: string }>,
  ) => api.put(`/admin/products/${id}/specs/${specId}`, data),
  removeSpec: (id: string, specId: string) =>
    api.delete(`/admin/products/${id}/specs/${specId}`),

  addTag: (id: string, tag: string) =>
    api.post(`/admin/products/${id}/tags`, { tag }),
  removeTag: (id: string, tagId: string) =>
    api.delete(`/admin/products/${id}/tags/${tagId}`),
};

// ===== Admin: Orders =====
export const adminOrderApi = {
  list: (params?: {
    search?: string;
    status?: OrderStatus;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => api.get<Paginated<Order>>('/admin/orders', { params }),
  detail: (id: string) => api.get<Order>(`/admin/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    api.put<Order>(`/admin/orders/${id}/status`, { status }),
};

// ===== Admin: Discount codes =====
export const adminDiscountApi = {
  list: (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => api.get<Paginated<DiscountCode>>('/admin/discount-codes', { params }),
  create: (data: {
    code: string;
    description?: string;
    discount_type: 'percent' | 'fixed_amount';
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
    usage_limit?: number;
    valid_until?: string;
  }) => api.post<DiscountCode>('/admin/discount-codes', data),
  update: (
    id: string,
    data: Partial<{
      discount_value: number;
      description: string;
      usage_limit: number;
      valid_from: string;
      valid_until: string;
      is_active: boolean;
    }>,
  ) => api.put<DiscountCode>(`/admin/discount-codes/${id}`, data),
  remove: (id: string) => api.delete(`/admin/discount-codes/${id}`),
};

// ===== Admin: Payments =====
export const adminPaymentApi = {
  list: (params?: {
    method?: PaymentMethod;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }) => api.get<Paginated<Payment>>('/admin/payments', { params }),
  detail: (id: string) => api.get<Payment>(`/admin/payments/${id}`),
  confirmCod: (id: string) =>
    api.post<Payment>(`/admin/payments/${id}/confirm-cod`, {}),
};
