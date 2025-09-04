// Authentication Service - Maps to backend auth_service.py and oauth_auth.py

import { rbacApiService, ApiResponse } from './rbac-api.service';
import { AUTH_ENDPOINTS } from '../constants/api.constants';
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

export class AuthService {
  // Email authentication
  async loginWithEmail(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return rbacApiService.post<AuthResponse>(AUTH_ENDPOINTS.EMAIL_LOGIN, request);
  }

  async signupWithEmail(request: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    return rbacApiService.post<AuthResponse>(AUTH_ENDPOINTS.EMAIL_SIGNUP, request);
  }

  async verifyEmailCode(request: VerifyCodeRequest): Promise<ApiResponse<AuthResponse>> {
    return rbacApiService.post<AuthResponse>(AUTH_ENDPOINTS.EMAIL_VERIFY, request);
  }

  // OAuth authentication
  async initiateGoogleLogin(): Promise<void> {
    if (typeof window !== 'undefined') {
      const backendBase = (process.env.RACINE_BACKEND_URL || 'http://localhost:3000/proxy').replace(/\/$/, '');
      window.location.href = `${backendBase}${AUTH_ENDPOINTS.GOOGLE_LOGIN}`;
    }
  }

  async initiateMicrosoftLogin(): Promise<void> {
    if (typeof window !== 'undefined') {
      const backendBase = (process.env.RACINE_BACKEND_URL || 'http://localhost:3000/proxy').replace(/\/$/, '');
      window.location.href = `${backendBase}${AUTH_ENDPOINTS.MICROSOFT_LOGIN}`;
    }
  }

  // OAuth popup handling
  async handleOAuthPopup(provider: 'google' | 'microsoft'): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      const backendBase = (process.env.RACINE_BACKEND_URL || 'http://localhost:3000/proxy').replace(/\/$/, '');
      const popup = window.open(
        `${backendBase}${provider === 'google' ? AUTH_ENDPOINTS.GOOGLE_LOGIN : AUTH_ENDPOINTS.MICROSOFT_LOGIN}`,
        'oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // On close, try to validate session as a fallback (cookie may have been set via proxy)
          this.checkAuthStatus()
            .then(({ isAuthenticated, user }) => {
              if (isAuthenticated) {
                resolve({ message: 'OAuth success', user } as unknown as AuthResponse);
              } else {
                reject(new Error('OAuth popup was closed'));
              }
            })
            .catch(() => reject(new Error('OAuth popup was closed')));
        }
      }, 1000);

      // Listen for OAuth success message
      const messageHandler = (event: MessageEvent) => {
        try {
          const backendBase = (process.env.RACINE_BACKEND_URL || 'http://localhost:3000/proxy').replace(/\/$/, '');
          const backendOrigin = new URL(backendBase).origin;
          const allowedOrigins = new Set([window.location.origin, backendOrigin]);
          if (!allowedOrigins.has(event.origin)) return;
        } catch {
          if (event.origin !== window.location.origin) return;
        }
        
        if (event.data.type === 'oauth_success') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          resolve(event.data.user);
        } else if (event.data.type === 'oauth_error') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageHandler);

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        popup?.close();
        window.removeEventListener('message', messageHandler);
        // On timeout, attempt session validation before failing
        this.checkAuthStatus()
          .then(({ isAuthenticated, user }) => {
            if (isAuthenticated) {
              resolve({ message: 'OAuth success', user } as unknown as AuthResponse);
            } else {
              reject(new Error('OAuth timeout'));
            }
          })
          .catch(() => reject(new Error('OAuth timeout')));
      }, 5 * 60 * 1000);
    });
  }

  // MFA authentication
  async verifyMFA(request: MFAVerifyRequest): Promise<ApiResponse<AuthResponse>> {
    return rbacApiService.post<AuthResponse>(AUTH_ENDPOINTS.MFA_VERIFY, request);
  }

  async setupMFA(userId: number): Promise<ApiResponse<MFASetupResponse>> {
    return rbacApiService.post<MFASetupResponse>(`/rbac/users/${userId}/setup-mfa`);
  }

  async enableMFA(userId: number, verificationCode: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>(`/rbac/users/${userId}/enable-mfa`, {
      verification_code: verificationCode
    });
  }

  async disableMFA(userId: number, verificationCode: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>(`/rbac/users/${userId}/disable-mfa`, {
      verification_code: verificationCode
    });
  }

  // Registration with invite
  async registerWithInvite(request: RegisterWithInviteRequest): Promise<ApiResponse<AuthResponse>> {
    const queryString = rbacApiService.buildQueryString({
      email: request.email,
      invite_token: request.invite_token
    });
    return rbacApiService.post<AuthResponse>(`${AUTH_ENDPOINTS.REGISTER_WITH_INVITE}${queryString}`);
  }

  // Session management
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return rbacApiService.get<User>('/rbac/me');
  }

  async refreshSession(): Promise<ApiResponse<AuthResponse>> {
    return rbacApiService.post<AuthResponse>('/auth/refresh');
  }

  async logout(): Promise<void> {
    try {
      await rbacApiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Token management
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      rbacApiService.setDefaultHeader('Authorization', `Bearer ${token}`);
    }
  }

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || 
             sessionStorage.getItem('auth_token') ||
             this.getCookieValue('session_token');
    }
    return null;
  }

  private getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      
      // Clear session cookie
      document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      rbacApiService.removeDefaultHeader('Authorization');
    }
  }

  // User profile management
  async updateProfile(userId: number, profileData: Partial<User>): Promise<ApiResponse<User>> {
    return rbacApiService.patch<User>(`/rbac/users/${userId}`, profileData);
  }

  async uploadProfilePicture(userId: number, file: File): Promise<ApiResponse<{ profile_picture_url: string }>> {
    return rbacApiService.upload<{ profile_picture_url: string }>(`/rbac/users/${userId}/upload-avatar`, file);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>(`/rbac/users/${userId}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return rbacApiService.post<{ message: string }>('/auth/request-password-reset', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>('/auth/reset-password', {
      token,
      new_password: newPassword
    });
  }

  // Email verification
  async resendVerificationCode(email: string): Promise<ApiResponse<{ message: string }>> {
    return rbacApiService.post<{ message: string }>('/auth/resend-verification', { email });
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>('/auth/verify-email', { token });
  }

  // Session validation
  async validateSession(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Authentication state helpers
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    const token = this.getAuthToken();
    if (!token) {
      return { isAuthenticated: false };
    }

    try {
      const response = await this.getCurrentUser();
      return { 
        isAuthenticated: true, 
        user: response.data 
      };
    } catch {
      this.clearAuthData();
      return { isAuthenticated: false };
    }
  }

  // OAuth helpers
  async exchangeOAuthCode(provider: 'google' | 'microsoft', code: string, state: string): Promise<ApiResponse<AuthResponse>> {
    const endpoint = provider === 'google' ? AUTH_ENDPOINTS.GOOGLE_CALLBACK : AUTH_ENDPOINTS.MICROSOFT_CALLBACK;
    const queryString = rbacApiService.buildQueryString({ code, state });
    return rbacApiService.get<AuthResponse>(`${endpoint}${queryString}`);
  }

  // User preferences
  async updateUserPreferences(userId: number, preferences: Record<string, any>): Promise<ApiResponse<User>> {
    return rbacApiService.patch<User>(`/rbac/users/${userId}/preferences`, preferences);
  }

  async getUserPreferences(userId: number): Promise<ApiResponse<Record<string, any>>> {
    return rbacApiService.get<Record<string, any>>(`/rbac/users/${userId}/preferences`);
  }

  // Security settings
  async getSecuritySettings(userId: number): Promise<ApiResponse<{
    mfa_enabled: boolean;
    last_password_change: string;
    active_sessions: number;
    login_history: Array<{
      timestamp: string;
      ip_address: string;
      user_agent: string;
      success: boolean;
    }>;
  }>> {
    return rbacApiService.get(`/rbac/users/${userId}/security`);
  }

  async revokeAllSessions(userId: number): Promise<ApiResponse<{ revoked_count: number }>> {
    return rbacApiService.post<{ revoked_count: number }>(`/rbac/users/${userId}/revoke-sessions`);
  }

  async revokeSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.delete<{ success: boolean }>(`/auth/sessions/${sessionId}`);
  }

  // Account management
  async deleteAccount(userId: number, password: string): Promise<ApiResponse<{ success: boolean }>> {
    return rbacApiService.post<{ success: boolean }>(`/rbac/users/${userId}/delete-account`, {
      password
    });
  }

  async exportUserData(userId: number): Promise<void> {
    await rbacApiService.download(`/rbac/users/${userId}/export-data`, 'user-data.json');
  }
}

// Create singleton instance
export const authService = new AuthService();