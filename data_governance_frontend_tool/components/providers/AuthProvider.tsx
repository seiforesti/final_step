'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import type { User, AuthState } from '@/types/auth.types';

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: [],
    roles: [],
  });

  const router = useRouter();

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          
          // Validate token with backend
          try {
            const response = await apiClient.get('/auth/validate');
            if (response.success && response.data) {
              setAuthState({
                user: response.data.user,
                token: storedToken,
                isAuthenticated: true,
                isLoading: false,
                permissions: response.data.permissions || [],
                roles: response.data.roles || [],
              });
              return;
            }
          } catch (error) {
            console.warn('Token validation failed:', error);
            // Clear invalid token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        }

        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { user, token, permissions, roles } = response.data;

        // Store auth data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          permissions: permissions || [],
          roles: roles || [],
        });

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
        roles: [],
      });

      // Redirect to login
      router.push('/auth/login');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      
      if (response.success && response.data) {
        const { token, user, permissions, roles } = response.data;
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        setAuthState(prev => ({
          ...prev,
          user,
          token,
          permissions: permissions || [],
          roles: roles || [],
        }));
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const checkPermission = (permission: string): boolean => {
    return authState.permissions.includes(permission) || authState.permissions.includes('*');
  };

  const checkRole = (role: string): boolean => {
    return authState.roles.some(userRole => userRole.name === role);
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.token) return;

    const interval = setInterval(() => {
      refreshToken().catch(console.error);
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.token]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    checkPermission,
    checkRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}