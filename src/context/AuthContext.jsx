import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));

  const persist = useCallback((at, rt, u) => {
    if (at) localStorage.setItem('accessToken', at);
    if (rt) localStorage.setItem('refreshToken', rt);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    setAccessToken(at);
    setRefreshToken(rt);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const refreshUser = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await api('/auth/me', { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      // Best-effort sync; ignore failures.
    }
  }, [accessToken]);

  const getAuthHeaders = useCallback(() => {
    const at = localStorage.getItem('accessToken');
    return at ? { Authorization: `Bearer ${at}` } : {};
  }, []);

  const value = {
    user,
    accessToken,
    refreshToken,
    persist,
    logout,
    getAuthHeaders,
    refreshUser,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
