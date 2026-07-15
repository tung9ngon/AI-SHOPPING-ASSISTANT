// Định dạng tiền VND
export function formatVND(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toLocaleString('vi-VN') + '₫';
}

// Định dạng ngày giờ
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  return d.toLocaleString('vi-VN');
}

// Nhãn tiếng Việt cho trạng thái đơn hàng
export const ORDER_STATUS_LABEL: Record<string, string> = {
  simulated_success: 'Hoàn tất (mô phỏng)',
  cancelled: 'Đã huỷ',
  pending: 'Chờ xử lý',
  paid: 'Đã thanh toán',
  shipped: 'Đang giao',
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  simulated_success: 'green',
  cancelled: 'red',
  pending: 'gold',
  paid: 'blue',
  shipped: 'cyan',
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ thanh toán',
  success: 'Thành công',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
};

export const PAYMENT_STATUS_COLOR: Record<string, string> = {
  pending: 'gold',
  success: 'green',
  failed: 'red',
  refunded: 'purple',
};
