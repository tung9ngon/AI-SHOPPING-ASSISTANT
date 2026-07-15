import api from './client';
import type { AuthUser } from '../types';

export const authApi = {
  sendOtp: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/auth/register', data),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyResetOtp: (email: string, otp: string) =>
    api.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email: string, new_password: string) =>
    api.post('/auth/reset-password', { email, new_password }),

  login: (email: string, password: string) =>
    api.post<{ user: AuthUser }>('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),

  // URL bắt đầu luồng OAuth (điều hướng cả trình duyệt sang backend)
  googleUrl: '/api/auth/google',
  facebookUrl: '/api/auth/facebook',
};
