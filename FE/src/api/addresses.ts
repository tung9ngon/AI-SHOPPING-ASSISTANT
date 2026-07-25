import api from './client';
import type { Address } from '../types';

// ===== Sổ địa chỉ =====
// Khớp BE: src/users/address/address.controller.ts — @Controller('users/me/addresses')
// Tất cả endpoint yêu cầu đăng nhập; BE lấy user từ token (user.sub).

export interface AddressPayload {
  full_address: string;
  recipient_name?: string;
  phone_number?: string;
  is_default?: boolean;
}

export const addressApi = {
  // GET /api/users/me/addresses -> Address[] (mặc định lên đầu)
  list: () => api.get<Address[]>('/users/me/addresses'),
  // POST /api/users/me/addresses -> Address vừa tạo
  create: (data: AddressPayload) => api.post<Address>('/users/me/addresses', data),
  // PUT /api/users/me/addresses/:id -> Address sau cập nhật
  update: (id: string, data: Partial<AddressPayload>) =>
    api.put<Address>(`/users/me/addresses/${id}`, data),
  // DELETE /api/users/me/addresses/:id
  remove: (id: string) => api.delete(`/users/me/addresses/${id}`),
  // PUT /api/users/me/addresses/:id/default -> đặt làm mặc định (bỏ mặc định các địa chỉ khác)
  setDefault: (id: string) => api.put<Address>(`/users/me/addresses/${id}/default`),
};
