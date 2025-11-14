'use client';

import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
  };
}
