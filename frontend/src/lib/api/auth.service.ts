import { Layout } from 'react-grid-layout';
import { http } from './_base';
import { Token, UserCreate, UserPublic } from '@/types';

export const authService = {
  login: (formData: FormData): Promise<Token> => {
    return http.request<Token>('/auth/token', {
      method: 'POST',
      body: formData,
    });
  },

  register: (data: UserCreate): Promise<UserPublic> => {
    return http.request<UserPublic>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: (): Promise<UserPublic> => {
    return http.request<UserPublic>('/user/me');
  },

  refresh: (): Promise<Token> => {
    return http.request<Token>('/auth/refresh', { method: 'POST' });
  },

  logout: (): Promise<void> => {
    return http.request<void>('/auth/logout', { method: 'POST' });
  },

  saveDashboardLayout: (layout: Layout[]): Promise<UserPublic> => {
    return http.request<UserPublic>('/user/me/dashboard-layout', {
      method: 'PATCH',
      body: JSON.stringify({ layout }),
    });
  },
};