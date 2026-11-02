import { apiClient } from './api';
import { ApiResponse, IAuthResponse, IUser } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
  role?: string;
  selectedRole?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<IAuthResponse> {
    const response = await apiClient.post<ApiResponse<IAuthResponse>>('/auth/login', payload);
    return response.data.data!;
  },

  async register(payload: RegisterPayload): Promise<IAuthResponse> {
    const response = await apiClient.post<ApiResponse<IAuthResponse>>('/auth/register', payload);
    return response.data.data!;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse>('/auth/logout');
    } finally {
      localStorage.removeItem('vyntra_access_token');
      localStorage.removeItem('vyntra_refresh_token');
      localStorage.removeItem('vyntra_user');
      localStorage.removeItem('vyntra_customer_id');
    }
  },

  async getMe(): Promise<IUser> {
    const response = await apiClient.get<ApiResponse<IUser>>('/auth/me');
    return response.data.data!;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<IUser> {
    const response = await apiClient.patch<ApiResponse<IUser>>('/auth/me', payload);
    return response.data.data!;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; resetToken?: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data.data || { message: response.data.message };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload);
    return response.data.data || { message: response.data.message };
  },
};

