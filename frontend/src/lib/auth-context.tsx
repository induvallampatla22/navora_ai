"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from './types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  isLoading: true,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    api.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getMe();
      if (userData && userData.id) {
        setUser(userData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch {
      // If token is invalid or expired
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Ignore parse error
          }
        }
        // Verify with backend
        try {
          const freshUser = await api.getMe();
          if (freshUser && freshUser.id) {
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch {
          // If server rejects token, clean up
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (response: AuthResponse) => {
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshUser,
        isLoading,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
