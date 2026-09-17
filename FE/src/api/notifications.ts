import api from './client';

// ===== Thông báo in-app =====
// Khớp BE: src/users/notification/notification.controller.ts
// — @Controller('users/me/notifications'), yêu cầu đăng nhập.

export type NotificationType =
  | 'price_alert'
  | 'deal'
  | 'recommendation'
  | 'order_update'
  | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  // Dữ liệu điều hướng: order_id, product_id, url...
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationList {
  items: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unread_count: number;
}

export const notificationApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<NotificationList>('/users/me/notifications', { params }),
  unreadCount: () =>
    api.get<{ count: number }>('/users/me/notifications/unread-count'),
  markRead: (id: string) =>
    api.put<{ id: string; is_read: true }>(`/users/me/notifications/${id}/read`),
  markAllRead: () =>
    api.put<{ message: string }>('/users/me/notifications/read-all'),
};
