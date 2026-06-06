"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { setAccessToken } from '@/lib/api/_base';
import { UserPublic } from '@/types';

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
    // Attempt to restore session using the httpOnly refresh cookie
    const restoreSession = async () => {
      try {
        const tokenData = await api.auth.refresh();
        setAccessToken(tokenData.access_token);
        const userData = await api.auth.getMe();
        setUser(userData);
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen for forced logouts triggered by failed token refresh in _base.ts
    const handleForcedLogout = () => performLogout();
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const login = async (token: string) => {
    setAccessToken(token);
    const userData = await api.auth.getMe();
    setUser(userData);
  };

  const performLogout = () => {
    setAccessToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Proceed even if server call fails
    }
    performLogout();
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
