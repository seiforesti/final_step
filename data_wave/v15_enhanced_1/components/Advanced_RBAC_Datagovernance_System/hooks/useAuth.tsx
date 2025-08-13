// useAuth Hook - Maps to backend auth_service.py
// Provides comprehensive authentication state management and operations

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { AuthService } from '../services/auth.service';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  VerifyCodeRequest,
  MFAVerifyRequest,
  RegisterWithInviteRequest,
  MFASetupResponse,
  OAuthUserInfo
} from '../types/auth.types';
import type { User } from '../types/user.types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  sessionToken: string | null;
  mfaRequired: boolean;
  mfaSetupRequired: boolean;
  lastActivity: Date | null;
  sessionExpiry: Date | null;
  permissions: string[];
  roles: string[];
}

export interface AuthMethods {
  // Email Authentication
  loginWithEmail: (credentials: LoginRequest) => Promise<AuthResponse>;
  signupWithEmail: (userData: SignupRequest) => Promise<AuthResponse>;
  verifyEmailCode: (verification: VerifyCodeRequest) => Promise<AuthResponse>;
  
  // OAuth Authentication
  initiateGoogleLogin: () => Promise<void>;
  initiateMicrosoftLogin: () => Promise<void>;
  handleOAuthCallback: (code: string, state: string, provider: 'google' | 'microsoft') => Promise<AuthResponse>;
  
  // MFA Operations
  setupMFA: () => Promise<MFASetupResponse>;
  verifyMFA: (verification: MFAVerifyRequest) => Promise<AuthResponse>;
  disableMFA: (currentPassword: string) => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  
  // Session Management
  refreshSession: () => Promise<AuthResponse>;
  logout: () => Promise<void>;
  logoutAllSessions: () => Promise<void>;
  updateLastActivity: () => void;
  checkSessionExpiry: () => boolean;
  extendSession: () => Promise<void>;
  
  // Profile Management
  updateProfile: (updates: Partial<User>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  // Registration & Invites
  registerWithInvite: (invitation: RegisterWithInviteRequest) => Promise<AuthResponse>;
  validateInviteToken: (token: string) => Promise<{ valid: boolean; userInfo?: any }>;
  
  // Utility Methods
  clearAuthState: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export interface AuthContextType extends AuthState, AuthMethods {}

const AuthContext = createContext<AuthContextType | null>(null);

const authService = new AuthService();
const SESSION_STORAGE_KEY = 'rbac_auth_state';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthState(): AuthState & AuthMethods {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    sessionToken: null,
    mfaRequired: false,
    mfaSetupRequired: false,
    lastActivity: null,
    sessionExpiry: null,
    permissions: [],
    roles: []
  });

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuthState();
  }, []);

  // Periodic session validation
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(() => {
        if (checkSessionExpiry()) {
          handleSessionExpiry();
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.sessionExpiry]);

  // Activity tracking
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(() => {
        updateLastActivity();
      }, ACTIVITY_UPDATE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated]);

  const initializeAuthState = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Load from storage
      const storedState = loadAuthStateFromStorage();
      if (storedState && storedState.sessionToken) {
        // Validate stored session
        try {
          const response = await authService.validateSession(storedState.sessionToken);
          if (response.data.valid) {
            setState(prev => ({
              ...prev,
              ...storedState,
              user: response.data.user,
              permissions: response.data.permissions || [],
              roles: response.data.roles || [],
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true
            }));
            return;
          }
        } catch (error) {
          console.warn('Stored session validation failed:', error);
        }
      }
      
      // Clear invalid state
      clearAuthState();
      setState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: true
      }));
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: true
      }));
    }
  }, []);

  const updateAuthState = useCallback((authResponse: AuthResponse) => {
    const newState: Partial<AuthState> = {
      user: authResponse.user,
      isAuthenticated: true,
      sessionToken: authResponse.sessionToken,
      mfaRequired: authResponse.requiresMFA || false,
      mfaSetupRequired: authResponse.requiresMFASetup || false,
      lastActivity: new Date(),
      sessionExpiry: authResponse.expiresAt ? new Date(authResponse.expiresAt) : null,
      permissions: authResponse.permissions || [],
      roles: authResponse.roles || [],
      isLoading: false
    };

    setState(prev => ({ ...prev, ...newState }));
    saveAuthStateToStorage(newState);
  }, []);

  // === Email Authentication ===

  const loginWithEmail = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.loginWithEmail(credentials);
      if (response.data.requiresMFA) {
        setState(prev => ({ 
          ...prev, 
          mfaRequired: true, 
          sessionToken: response.data.tempToken,
          isLoading: false 
        }));
      } else {
        updateAuthState(response.data);
      }
      return response.data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [updateAuthState]);

  const signupWithEmail = useCallback(async (userData: SignupRequest): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.signupWithEmail(userData);
      updateAuthState(response.data);
      return response.data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [updateAuthState]);

  const verifyEmailCode = useCallback(async (verification: VerifyCodeRequest): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.verifyEmailCode(verification);
      updateAuthState(response.data);
      return response.data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [updateAuthState]);

  // === OAuth Authentication ===

  const initiateGoogleLogin = useCallback(async (): Promise<void> => {
    await authService.initiateGoogleLogin();
  }, []);

  const initiateMicrosoftLogin = useCallback(async (): Promise<void> => {
    await authService.initiateMicrosoftLogin();
  }, []);

  const handleOAuthCallback = useCallback(async (
    code: string, 
    state: string, 
    provider: 'google' | 'microsoft'
  ): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.handleOAuthCallback(code, state, provider);
      updateAuthState(response.data);
      return response.data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [updateAuthState]);

  // === MFA Operations ===

  const setupMFA = useCallback(async (): Promise<MFASetupResponse> => {
    const response = await authService.setupMFA();
    setState(prev => ({ ...prev, mfaSetupRequired: true }));
    return response.data;
  }, []);

  const verifyMFA = useCallback(async (verification: MFAVerifyRequest): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.verifyMFA(verification);
      updateAuthState(response.data);
      return response.data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [updateAuthState]);

  const disableMFA = useCallback(async (currentPassword: string): Promise<void> => {
    await authService.disableMFA(currentPassword);
    setState(prev => ({ 
      ...prev, 
      user: prev.user ? { ...prev.user, mfaEnabled: false } : null,
      mfaSetupRequired: false
    }));
  }, []);

  const generateBackupCodes = useCallback(async (): Promise<string[]> => {
    const response = await authService.generateBackupCodes();
    return response.data.codes;
  }, []);

  // === Session Management ===

  const refreshSession = useCallback(async (): Promise<AuthResponse> => {
    if (!state.sessionToken) {
      throw new Error('No active session to refresh');
    }
    
    try {
      const response = await authService.refreshSession(state.sessionToken);
      updateAuthState(response.data);
      return response.data;
    } catch (error) {
      clearAuthState();
      throw error;
    }
  }, [state.sessionToken, updateAuthState]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (state.sessionToken) {
        await authService.logout(state.sessionToken);
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      clearAuthState();
    }
  }, [state.sessionToken]);

  const logoutAllSessions = useCallback(async (): Promise<void> => {
    try {
      if (state.sessionToken) {
        await authService.logoutAllSessions(state.sessionToken);
      }
    } catch (error) {
      console.warn('Logout all sessions failed:', error);
    } finally {
      clearAuthState();
    }
  }, [state.sessionToken]);

  const updateLastActivity = useCallback((): void => {
    const now = new Date();
    setState(prev => ({ ...prev, lastActivity: now }));
    
    // Update in storage
    const currentState = loadAuthStateFromStorage();
    if (currentState) {
      saveAuthStateToStorage({ ...currentState, lastActivity: now });
    }
  }, []);

  const checkSessionExpiry = useCallback((): boolean => {
    if (!state.sessionExpiry) return false;
    return new Date() >= state.sessionExpiry;
  }, [state.sessionExpiry]);

  const extendSession = useCallback(async (): Promise<void> => {
    if (!state.sessionToken) return;
    
    try {
      const response = await authService.extendSession(state.sessionToken);
      setState(prev => ({
        ...prev,
        sessionExpiry: new Date(response.data.expiresAt)
      }));
    } catch (error) {
      console.warn('Session extension failed:', error);
    }
  }, [state.sessionToken]);

  // === Profile Management ===

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<User> => {
    const response = await authService.updateProfile(updates);
    setState(prev => ({
      ...prev,
      user: response.data
    }));
    return response.data;
  }, []);

  const changePassword = useCallback(async (
    currentPassword: string, 
    newPassword: string
  ): Promise<void> => {
    await authService.changePassword(currentPassword, newPassword);
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    await authService.requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    await authService.resetPassword(token, newPassword);
  }, []);

  // === Registration & Invites ===

  const registerWithInvite = useCallback(async (
    invitation: RegisterWithInviteRequest
  ): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.registerWithInvite(invitation);
      updateAuthState(response.data);
      return response.data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [updateAuthState]);

  const validateInviteToken = useCallback(async (
    token: string
  ): Promise<{ valid: boolean; userInfo?: any }> => {
    const response = await authService.validateInviteToken(token);
    return response.data;
  }, []);

  // === Utility Methods ===

  const clearAuthState = useCallback((): void => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      sessionToken: null,
      mfaRequired: false,
      mfaSetupRequired: false,
      lastActivity: null,
      sessionExpiry: null,
      permissions: [],
      roles: []
    });
    clearAuthStateFromStorage();
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  const hasRole = useCallback((role: string): boolean => {
    return state.roles.includes(role);
  }, [state.roles]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => state.permissions.includes(permission));
  }, [state.permissions]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => state.permissions.includes(permission));
  }, [state.permissions]);

  // === Storage Helpers ===

  const saveAuthStateToStorage = useCallback((authState: Partial<AuthState>): void => {
    try {
      const storageData = {
        user: authState.user,
        sessionToken: authState.sessionToken,
        sessionExpiry: authState.sessionExpiry,
        permissions: authState.permissions,
        roles: authState.roles,
        lastActivity: authState.lastActivity
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.warn('Failed to save auth state to storage:', error);
    }
  }, []);

  const loadAuthStateFromStorage = useCallback((): Partial<AuthState> | null => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastActivity: parsed.lastActivity ? new Date(parsed.lastActivity) : null,
          sessionExpiry: parsed.sessionExpiry ? new Date(parsed.sessionExpiry) : null
        };
      }
    } catch (error) {
      console.warn('Failed to load auth state from storage:', error);
    }
    return null;
  }, []);

  const clearAuthStateFromStorage = useCallback((): void => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear auth state from storage:', error);
    }
  }, []);

  const handleSessionExpiry = useCallback((): void => {
    console.warn('Session expired, logging out');
    clearAuthState();
  }, [clearAuthState]);

  return {
    ...state,
    // Email Authentication
    loginWithEmail,
    signupWithEmail,
    verifyEmailCode,
    
    // OAuth Authentication
    initiateGoogleLogin,
    initiateMicrosoftLogin,
    handleOAuthCallback,
    
    // MFA Operations
    setupMFA,
    verifyMFA,
    disableMFA,
    generateBackupCodes,
    
    // Session Management
    refreshSession,
    logout,
    logoutAllSessions,
    updateLastActivity,
    checkSessionExpiry,
    extendSession,
    
    // Profile Management
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    
    // Registration & Invites
    registerWithInvite,
    validateInviteToken,
    
    // Utility Methods
    clearAuthState,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  };
}

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export default useAuth;