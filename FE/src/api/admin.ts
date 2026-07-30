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
  // Toàn bộ brand duy nhất trong hệ thống, dùng cho dropdown lọc (không phụ thuộc trang hiện tại)
  listBrands: () => api.get<string[]>('/admin/products/brands'),
  create: (data: {
    name: string;
    category_id?: string;
    brand?: string;
    price: number;
    stock_quantity?: number;
    description?: string;
    is_active?: boolean;
  }) => api.post<Product>('/admin/products', data),
  update: (
    id: string,
    data: Partial<{ name: string; category_id: string; brand: string; price: number; stock_quantity: number; description: string; is_active: boolean }>,
  ) => api.put<Product>(`/admin/products/${id}`, data),
  remove: (id: string) => api.delete(`/admin/products/${id}`),

  // payload phải có "file" (upload từ máy) HOẶC "image_url" (dán URL có sẵn)
  addImage: (
    id: string,
    payload: { file?: File; image_url?: string; is_primary?: boolean; sort_order?: number },
  ) => {
    const formData = new FormData();
    if (payload.file) formData.append('file', payload.file);
    if (payload.image_url) formData.append('image_url', payload.image_url);
    if (payload.is_primary !== undefined) {
      formData.append('is_primary', String(payload.is_primary));
    }
    if (payload.sort_order !== undefined) {
      formData.append('sort_order', String(payload.sort_order));
    }
    return api.post<{ id: string; image_url: string; is_primary: boolean; sort_order: number }>(
      `/admin/products/${id}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
  updateImage: (
    id: string,
    imageId: string,
    payload: { file?: File; is_primary?: boolean; sort_order?: number },
  ) => {
    const formData = new FormData();
    if (payload.file) formData.append('file', payload.file);
    if (payload.is_primary !== undefined) {
      formData.append('is_primary', String(payload.is_primary));
    }
    if (payload.sort_order !== undefined) {
      formData.append('sort_order', String(payload.sort_order));
    }
    return api.put<{ id: string; image_url: string; is_primary: boolean; sort_order: number }>(
      `/admin/products/${id}/images/${imageId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
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
export interface AdminOrderListItem {
  id: string;
  user_name: string | null;
  product_count: number;
  total: number | string;
  status: OrderStatus;
  created_at: string;
}

export const adminOrderApi = {
  list: (params?: {
    search?: string;
    status?: OrderStatus;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => api.get<Paginated<AdminOrderListItem>>('/admin/orders', { params }),
  detail: (id: string) => api.get<Order>(`/admin/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    api.put<Order>(`/admin/orders/${id}/status`, { status }),
};

// ===== Admin: Discount codes =====
export const adminDiscountApi = {
  list: (params?: {
    search?: string;
    category?: 'order' | 'free_shipping';
    isActive?: boolean;
    status?: 'running' | 'paused' | 'upcoming' | 'expired';
    page?: number;
    limit?: number;
  }) => api.get<Paginated<DiscountCode>>('/admin/discount-codes', { params }),
  create: (data: {
    code: string;
    description?: string;
    category?: 'order' | 'free_shipping';
    discount_type: 'percent' | 'fixed_amount';
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
    usage_limit?: number;
    valid_from?: string;
    valid_until?: string;
    is_active?: boolean;
  }) => api.post<DiscountCode>('/admin/discount-codes', data),
  update: (
    id: string,
    data: Partial<{
      category: 'order' | 'free_shipping';
      discount_type: 'percent' | 'fixed_amount';
      discount_value: number;
      min_order_value: number;
      max_discount: number;
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

// ===== Admin: Statistics =====
export interface AdminOverviewStats {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  active_products: number;
  total_users: number;
  orders_by_status: { status: OrderStatus; count: number }[];
}

export interface AdminRevenueStats {
  group_by: 'month' | 'week';
  items: { period: string; revenue: number; order_count: number }[];
}

export const adminStatisticsApi = {
  overview: (params?: { from?: string; to?: string }) =>
    api.get<AdminOverviewStats>('/admin/statistics/overview', { params }),
  revenue: (params?: { groupBy?: 'month' | 'week'; from?: string; to?: string }) =>
    api.get<AdminRevenueStats>('/admin/statistics/revenue', { params }),
};