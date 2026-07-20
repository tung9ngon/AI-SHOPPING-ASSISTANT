import api from './client';
import type { Address } from '../types';

// ===== Sổ địa chỉ (Hướng A - bảng addresses riêng) =====
// LƯU Ý: BE do bạn tự dựng, cần khớp contract dưới đây (xem ADDRESS_API_CONTRACT.md).
// Tất cả endpoint yêu cầu đăng nhập; BE lấy user từ token (user.sub).

export interface AddressPayload {
  recipient_name: string;
  recipient_phone: string;
  address: string;
  is_default?: boolean;
}

export const addressApi = {
  // GET /api/addresses -> Address[] (của user hiện tại, mặc định lên đầu)
  list: () => api.get<Address[]>('/addresses'),
  // POST /api/addresses -> Address vừa tạo
  create: (data: AddressPayload) => api.post<Address>('/addresses', data),
  // PUT /api/addresses/:id -> Address sau cập nhật
  update: (id: string, data: Partial<AddressPayload>) =>
    api.put<Address>(`/addresses/${id}`, data),
  // DELETE /api/addresses/:id
  remove: (id: string) => api.delete(`/addresses/${id}`),
  // PATCH /api/addresses/:id/default -> đặt làm mặc định (bỏ mặc định các địa chỉ khác)
  setDefault: (id: string) => api.patch<Address>(`/addresses/${id}/default`),
};
