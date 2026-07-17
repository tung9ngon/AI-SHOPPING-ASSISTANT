import api from './client';
import type { Cart } from '../types';

// Lưu ý: POST/PUT chỉ trả về bản ghi cart_item rút gọn (không phải Cart đầy đủ),
// nên sau mỗi thao tác cần gọi lại get() để lấy giỏ + subtotal mới.
export const cartApi = {
  get: () => api.get<Cart>('/cart'),
  // Thêm SP đã có trong giỏ -> BE CỘNG DỒN quantity.
  addItem: (product_id: string, quantity = 1) =>
    api.post('/cart/items', { product_id, quantity }),
  // quantity là giá trị TUYỆT ĐỐI (không cộng dồn), int >= 1. id = cart_item id.
  updateItem: (id: string, quantity: number) =>
    api.put(`/cart/items/${id}`, { quantity }),
  removeItem: (id: string) => api.delete(`/cart/items/${id}`),
};
