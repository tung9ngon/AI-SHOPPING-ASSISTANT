import axios from 'axios';

// Axios instance dùng chung cho toàn app.
// - baseURL '/api': đi qua proxy của Vite (xem vite.config.ts) sang backend :8000.
// - withCredentials: bắt buộc để gửi/nhận cookie httpOnly (access_token / refresh_token).
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Chuẩn hoá message lỗi từ backend để hiển thị cho người dùng.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error?.response?.data;
    let message = 'Đã có lỗi xảy ra, vui lòng thử lại.';
    if (data?.message) {
      message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } else if (error?.message) {
      message = error.message;
    }
    error.displayMessage = message;
    return Promise.reject(error);
  },
);

export default api;

// Helper: rút gọn message lỗi để dùng nhanh trong component.
export function getErrorMessage(error: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (error as any)?.displayMessage ?? 'Đã có lỗi xảy ra, vui lòng thử lại.';
}
