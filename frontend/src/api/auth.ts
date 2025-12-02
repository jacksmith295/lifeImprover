import { apiClient } from './client';
import type { User } from '../types/index';

interface LoginResponse {
  access_token: string;
}

interface RegisterResponse {
  id: string;
  email: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  register: async (email: string, password: string): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
    });
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  updateProfile: async (email: string): Promise<User> => {
    const { data } = await apiClient.patch<User>('/auth/me', { email });
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/me');
  },
};

