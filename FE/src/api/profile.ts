import api from './client';
import type {
  MeAccount,
  UpdateMePayload,
  ShoppingProfile,
  UserPreferences,
  BudgetRange,
} from '../types';

// ===== Hồ sơ người dùng =====
// BE đã có sẵn module profile tại /api/users/me (KHÔNG cần chạm BE).
// Tất cả endpoint yêu cầu đăng nhập; BE lấy user từ cookie httpOnly (user.sub).

export interface UpdateProfilePayload {
  user_segment?: string;
  occupation?: string;
  age_range?: string;
  interests?: string[];
}

export interface UpdatePreferencesPayload {
  preferred_categories?: string[];
  budget_range?: BudgetRange;
  preferred_brands?: string[];
  preferred_attributes?: Record<string, unknown>;
}

export const profileApi = {
  // ---- Thông tin tài khoản ----
  // GET /api/users/me -> { id, full_name, email, phone_number, avatar_url, role, is_active, created_at }
  getMe: () => api.get<MeAccount>('/users/me'),
  // PUT /api/users/me -> { id, full_name, phone_number, avatar_url, updated_at }
  updateMe: (data: UpdateMePayload) => api.put('/users/me', data),

  // ---- Hồ sơ mua sắm ----
  getProfile: () => api.get<ShoppingProfile>('/users/me/profile'),
  updateProfile: (data: UpdateProfilePayload) =>
    api.put<ShoppingProfile>('/users/me/profile', data),

  // ---- Sở thích/tuỳ chọn ----
  getPreferences: () => api.get<UserPreferences>('/users/me/preferences'),
  updatePreferences: (data: UpdatePreferencesPayload) =>
    api.put<UserPreferences>('/users/me/preferences', data),
};
