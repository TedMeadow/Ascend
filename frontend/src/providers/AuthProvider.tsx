"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { UserPublic } from '@/types'; // <-- Чистый импорт!

interface AuthContextType {
  user: UserPublic | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await api.auth.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to authenticate with token", error);
          // Если токен невалидный, чистим его
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoading(false);
    };
    checkUserStatus();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('accessToken', token);
    const userData = await api.auth.getMe();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    // Можно добавить редирект на страницу логина
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};