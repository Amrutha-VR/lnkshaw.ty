/**
 * AuthContext
 * Global authentication state using React Context + JWT
 * Handles login, logout, token refresh, and persisted sessions
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to check session
  const [accessToken, setAccessToken] = useState(null);

  // ─── Check if user is already logged in on mount ─────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('linksnap_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
        } catch {
          // Token invalid or expired → try refresh
          await attemptRefresh();
        }
      } else {
        await attemptRefresh();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ─── Try to get a new access token via refresh cookie ────────────────────
  const attemptRefresh = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh');
      const token = res.data.data.accessToken;
      setTokenAndHeader(token);
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.data.user);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, []);

  const setTokenAndHeader = (token) => {
    setAccessToken(token);
    localStorage.setItem('linksnap_access_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('linksnap_access_token');
    delete api.defaults.headers.common['Authorization'];
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken: token, user: userData } = res.data.data;
    setTokenAndHeader(token);
    setUser(userData);
    return userData;
  };

  // ─── Signup ───────────────────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    const { accessToken: token, user: userData } = res.data.data;
    setTokenAndHeader(token);
    setUser(userData);
    return userData;
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
  };

  // ─── Handle OAuth token from URL hash ────────────────────────────────────
  const handleOAuthCallback = useCallback(async (token) => {
    setTokenAndHeader(token);
    const res = await api.get('/auth/me');
    setUser(res.data.data.user);
  }, []);

  // ─── Axios interceptor: auto-refresh on 401 ──────────────────────────────
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          error.response?.data?.code === 'TOKEN_EXPIRED' &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          const refreshed = await attemptRefresh();
          if (refreshed) {
            originalRequest.headers['Authorization'] = api.defaults.headers.common['Authorization'];
            return api(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [attemptRefresh]);

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    handleOAuthCallback,
    refreshUser: async () => {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
