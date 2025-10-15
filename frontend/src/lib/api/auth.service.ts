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
};