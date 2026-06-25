'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch, clearTokens, getAccessToken, setTokens } from './api';
import { syncToServer } from './store';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  googleLogin: (idToken: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(!!getAccessToken());
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    setIsAuthenticated(true);
    await syncToServer();
    return null;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      );
      if (!res.success) return res.message;
      setTokens(res.data.accessToken, res.data.refreshToken);
      await handleAuthSuccess();
      return null;
    },
    [handleAuthSuccess],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      );
      if (!res.success) return res.message;
      setTokens(res.data.accessToken, res.data.refreshToken);
      await handleAuthSuccess();
      return null;
    },
    [handleAuthSuccess],
  );

  const googleLogin = useCallback(
    async (idToken: string) => {
      const res = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/google',
        {
          method: 'POST',
          body: JSON.stringify({ idToken }),
        },
      );
      if (!res.success) return res.message;
      setTokens(res.data.accessToken, res.data.refreshToken);
      await handleAuthSuccess();
      return null;
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      login,
      register,
      googleLogin,
      logout,
    }),
    [isAuthenticated, isLoading, login, register, googleLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
