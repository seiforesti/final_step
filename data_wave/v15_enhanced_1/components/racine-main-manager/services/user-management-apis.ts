/**
 * Racine User Management API Service
 * ===================================
 * 
 * Comprehensive API service for user management functionality that provides
 * complete integration with the backend RBAC and user management services.
 * 
 * Features:
 * - User profile management and authentication
 * - RBAC visualization and access control
 * - API key management and security
 * - User preferences and personalization
 * - Security audit and compliance tracking
 * - Cross-group access management
 * - Notification preferences and settings
 * - Multi-factor authentication support
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/rbac_service.py
 * - Maps to: backend/scripts_automation/app/services/auth_service.py
 * - Routes: backend/scripts_automation/app/api/routes/auth.py
 * - Routes: backend/scripts_automation/app/api/routes/rbac/
 */

import {
  APIResponse,
  UserProfileResponse,
  UpdateUserProfileRequest,
  AuthenticationResponse,
  APIKeyResponse,
  CreateAPIKeyRequest,
  RoleResponse,
  PermissionResponse,
  SecurityAuditResponse,
  UserPreferencesResponse,
  UpdateUserPreferencesRequest,
  NotificationSettingsResponse,
  UpdateNotificationSettingsRequest,
  AccessRequestResponse,
  CreateAccessRequestRequest,
  SecurityLogResponse,
  MFASetupResponse,
  UUID,
  ISODateString,
  OperationStatus,
  PaginationRequest,
  FilterRequest
} from '../types/api.types';

import {
  RBACVisualization,
  SecurityAuditTrail,
  UserAnalytics
} from '../types/racine-core.types';

/**
 * Configuration for the user management API service
 */
interface UserManagementAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableWebSocket: boolean;
  websocketURL?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: UserManagementAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableWebSocket: true,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
};

/**
 * WebSocket event types for real-time user management updates
 */
export enum UserManagementEventType {
  USER_PROFILE_UPDATED = 'user_profile_updated',
  AUTHENTICATION_STATUS_CHANGED = 'authentication_status_changed',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REVOKED = 'role_revoked',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  MFA_STATUS_CHANGED = 'mfa_status_changed',
  ACCESS_REQUEST_CREATED = 'access_request_created',
  ACCESS_REQUEST_APPROVED = 'access_request_approved',
  ACCESS_REQUEST_DENIED = 'access_request_denied',
  SECURITY_ALERT = 'security_alert',
  PREFERENCES_UPDATED = 'preferences_updated',
  CONNECTION_STATUS_CHANGED = 'connection_status_changed'
}

/**
 * WebSocket event data structure
 */
export interface UserManagementEvent {
  type: UserManagementEventType;
  data: any;
  timestamp: ISODateString;
  userId?: UUID;
}

/**
 * Event handler type
 */
export type UserManagementEventHandler = (event: UserManagementEvent) => void;

/**
 * User Management API Service Class
 */
class UserManagementAPI {
  private config: UserManagementAPIConfig;
  private websocket: WebSocket | null = null;
  private eventHandlers: Map<UserManagementEventType, UserManagementEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: Partial<UserManagementAPIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // =============================================================================
  // AUTHENTICATION UTILITIES
  // =============================================================================

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // =============================================================================
  // HTTP REQUEST UTILITIES
  // =============================================================================

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      return await this.makeRequest<T>(endpoint, options);
    } catch (error) {
      if (retryCount < this.config.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * Math.pow(2, retryCount)));
        return this.makeRequestWithRetry<T>(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  // =============================================================================
  // USER PROFILE MANAGEMENT
  // =============================================================================

  async getCurrentUser(): Promise<UserProfileResponse> {
    return this.makeRequestWithRetry<UserProfileResponse>('/api/auth/profile');
  }

  async updateUserProfile(request: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    return this.makeRequestWithRetry<UserProfileResponse>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.makeRequestWithRetry<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
  }

  async uploadAvatar(avatarFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await fetch(`${this.config.baseURL}/api/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    const result = await response.json();
    return result.avatar_url;
  }

  async deleteAccount(confirmationToken: string): Promise<void> {
    await this.makeRequestWithRetry<void>('/api/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({
        confirmation_token: confirmationToken
      })
    });
  }

  // =============================================================================
  // AUTHENTICATION AND SECURITY
  // =============================================================================

  async login(email: string, password: string, mfaCode?: string): Promise<AuthenticationResponse> {
    const response = await this.makeRequestWithRetry<AuthenticationResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        mfa_code: mfaCode
      })
    });

    // Store the token
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequestWithRetry<void>('/api/auth/logout', {
        method: 'POST'
      });
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('auth_token');
    }
  }

  async refreshToken(): Promise<AuthenticationResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequestWithRetry<AuthenticationResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    // Update stored tokens
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }

    return response;
  }

  async setupMFA(): Promise<MFASetupResponse> {
    return this.makeRequestWithRetry<MFASetupResponse>('/api/auth/mfa/setup', {
      method: 'POST'
    });
  }

  async enableMFA(secret: string, code: string): Promise<void> {
    await this.makeRequestWithRetry<void>('/api/auth/mfa/enable', {
      method: 'POST',
      body: JSON.stringify({
        secret,
        code
      })
    });
  }

  async disableMFA(password: string, code: string): Promise<void> {
    await this.makeRequestWithRetry<void>('/api/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({
        password,
        code
      })
    });
  }

  // =============================================================================
  // API KEY MANAGEMENT
  // =============================================================================

  async getAPIKeys(): Promise<APIKeyResponse[]> {
    return this.makeRequestWithRetry<APIKeyResponse[]>('/api/auth/api-keys');
  }

  async createAPIKey(request: CreateAPIKeyRequest): Promise<APIKeyResponse> {
    return this.makeRequestWithRetry<APIKeyResponse>('/api/auth/api-keys', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async revokeAPIKey(keyId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/api/auth/api-keys/${keyId}`, {
      method: 'DELETE'
    });
  }

  async regenerateAPIKey(keyId: UUID): Promise<APIKeyResponse> {
    return this.makeRequestWithRetry<APIKeyResponse>(`/api/auth/api-keys/${keyId}/regenerate`, {
      method: 'POST'
    });
  }

  async updateAPIKeyPermissions(keyId: UUID, permissions: string[]): Promise<APIKeyResponse> {
    return this.makeRequestWithRetry<APIKeyResponse>(`/api/auth/api-keys/${keyId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({
        permissions
      })
    });
  }

  // =============================================================================
  // ROLE AND PERMISSION MANAGEMENT
  // =============================================================================

  async getUserRoles(): Promise<RoleResponse[]> {
    return this.makeRequestWithRetry<RoleResponse[]>('/api/rbac/user/roles');
  }

  async getUserPermissions(): Promise<PermissionResponse[]> {
    return this.makeRequestWithRetry<PermissionResponse[]>('/api/rbac/user/permissions');
  }

  async getAvailableRoles(): Promise<RoleResponse[]> {
    return this.makeRequestWithRetry<RoleResponse[]>('/api/rbac/roles');
  }

  async getAvailablePermissions(): Promise<PermissionResponse[]> {
    return this.makeRequestWithRetry<PermissionResponse[]>('/api/rbac/permissions');
  }

  async requestRole(roleId: UUID, justification: string): Promise<AccessRequestResponse> {
    return this.makeRequestWithRetry<AccessRequestResponse>('/api/rbac/access-requests', {
      method: 'POST',
      body: JSON.stringify({
        type: 'role',
        resource_id: roleId,
        justification
      })
    });
  }

  async requestPermission(permissionId: UUID, justification: string): Promise<AccessRequestResponse> {
    return this.makeRequestWithRetry<AccessRequestResponse>('/api/rbac/access-requests', {
      method: 'POST',
      body: JSON.stringify({
        type: 'permission',
        resource_id: permissionId,
        justification
      })
    });
  }

  async revokeRole(roleId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/api/rbac/user/roles/${roleId}`, {
      method: 'DELETE'
    });
  }

  async revokePermission(permissionId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/api/rbac/user/permissions/${permissionId}`, {
      method: 'DELETE'
    });
  }

  // =============================================================================
  // ACCESS CONTROL
  // =============================================================================

  async getAccessRequests(): Promise<AccessRequestResponse[]> {
    return this.makeRequestWithRetry<AccessRequestResponse[]>('/api/rbac/access-requests');
  }

  async requestCrossGroupAccess(request: CreateAccessRequestRequest): Promise<AccessRequestResponse> {
    return this.makeRequestWithRetry<AccessRequestResponse>('/api/rbac/cross-group-access', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async approveAccessRequest(requestId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/api/rbac/access-requests/${requestId}/approve`, {
      method: 'POST'
    });
  }

  async denyAccessRequest(requestId: UUID, reason: string): Promise<void> {
    await this.makeRequestWithRetry<void>(`/api/rbac/access-requests/${requestId}/deny`, {
      method: 'POST',
      body: JSON.stringify({
        reason
      })
    });
  }

  async getCrossGroupAccess(): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>('/api/rbac/cross-group-access');
  }

  // =============================================================================
  // PREFERENCES AND SETTINGS
  // =============================================================================

  async getUserPreferences(): Promise<UserPreferencesResponse> {
    return this.makeRequestWithRetry<UserPreferencesResponse>('/api/auth/preferences');
  }

  async updateUserPreferences(request: UpdateUserPreferencesRequest): Promise<UserPreferencesResponse> {
    return this.makeRequestWithRetry<UserPreferencesResponse>('/api/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  async getNotificationSettings(): Promise<NotificationSettingsResponse> {
    return this.makeRequestWithRetry<NotificationSettingsResponse>('/api/auth/notifications');
  }

  async updateNotificationSettings(request: UpdateNotificationSettingsRequest): Promise<NotificationSettingsResponse> {
    return this.makeRequestWithRetry<NotificationSettingsResponse>('/api/auth/notifications', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  async updateThemePreferences(theme: Record<string, any>): Promise<void> {
    await this.makeRequestWithRetry<void>('/api/auth/preferences/theme', {
      method: 'PUT',
      body: JSON.stringify(theme)
    });
  }

  async updateLayoutPreferences(layout: Record<string, any>): Promise<void> {
    await this.makeRequestWithRetry<void>('/api/auth/preferences/layout', {
      method: 'PUT',
      body: JSON.stringify(layout)
    });
  }

  async resetPreferences(): Promise<void> {
    await this.makeRequestWithRetry<void>('/api/auth/preferences/reset', {
      method: 'POST'
    });
  }

  // =============================================================================
  // SECURITY AUDIT AND COMPLIANCE
  // =============================================================================

  async getSecurityAudit(timeRange = '30d'): Promise<SecurityAuditResponse> {
    return this.makeRequestWithRetry<SecurityAuditResponse>(`/api/auth/security/audit?time_range=${timeRange}`);
  }

  async getSecurityLogs(filters?: FilterRequest): Promise<SecurityLogResponse[]> {
    const queryParams = filters ? new URLSearchParams(filters as any).toString() : '';
    return this.makeRequestWithRetry<SecurityLogResponse[]>(`/api/auth/security/logs?${queryParams}`);
  }

  async getComplianceStatus(): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>('/api/auth/compliance/status');
  }

  async generateSecurityReport(reportType: string): Promise<Blob> {
    const response = await fetch(`${this.config.baseURL}/api/auth/security/reports/${reportType}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to generate security report');
    }

    return response.blob();
  }

  // =============================================================================
  // RBAC VISUALIZATION
  // =============================================================================

  async getRBACVisualization(): Promise<RBACVisualization> {
    return this.makeRequestWithRetry<RBACVisualization>('/api/rbac/visualization');
  }

  async getRoleHierarchy(): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>('/api/rbac/hierarchy');
  }

  async getPermissionMatrix(): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>('/api/rbac/permission-matrix');
  }

  async visualizeUserAccess(userId?: UUID): Promise<Record<string, any>> {
    const endpoint = userId ? `/api/rbac/user-access/${userId}` : '/api/rbac/user-access';
    return this.makeRequestWithRetry<Record<string, any>>(endpoint);
  }

  // =============================================================================
  // ANALYTICS AND INSIGHTS
  // =============================================================================

  async getUserAnalytics(timeRange = '30d'): Promise<UserAnalytics> {
    return this.makeRequestWithRetry<UserAnalytics>(`/api/auth/analytics?time_range=${timeRange}`);
  }

  async getActivitySummary(timeRange = '7d'): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>(`/api/auth/activity/summary?time_range=${timeRange}`);
  }

  async getUsageStatistics(timeRange = '30d'): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>(`/api/auth/usage/statistics?time_range=${timeRange}`);
  }

  // =============================================================================
  // UTILITIES
  // =============================================================================

  async exportUserData(format: 'json' | 'csv'): Promise<Blob> {
    const response = await fetch(`${this.config.baseURL}/api/auth/export?format=${format}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to export user data');
    }

    return response.blob();
  }

  // =============================================================================
  // WEBSOCKET MANAGEMENT
  // =============================================================================

  subscribeToEvents(handler: UserManagementEventHandler): void {
    if (!this.config.enableWebSocket) {
      console.warn('WebSocket is disabled');
      return;
    }

    this.connectWebSocket();
    
    // Add handler for all event types
    Object.values(UserManagementEventType).forEach(eventType => {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, []);
      }
      this.eventHandlers.get(eventType)!.push(handler);
    });
  }

  unsubscribeFromEvents(handler?: UserManagementEventHandler): void {
    if (handler) {
      // Remove specific handler
      this.eventHandlers.forEach((handlers, eventType) => {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      });
    } else {
      // Remove all handlers
      this.eventHandlers.clear();
    }

    // Close WebSocket if no handlers remain
    if (this.eventHandlers.size === 0 && this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private connectWebSocket(): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = this.getAuthToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    try {
      const wsUrl = `${this.config.websocketURL}/user-management?token=${encodeURIComponent(token)}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('User management WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const userManagementEvent: UserManagementEvent = JSON.parse(event.data);
          this.handleWebSocketEvent(userManagementEvent);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = (event) => {
        console.log('User management WebSocket disconnected:', event.code, event.reason);
        this.websocket = null;
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connectWebSocket();
          }, Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts)));
        }
      };

      this.websocket.onerror = (error) => {
        console.error('User management WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  private handleWebSocketEvent(event: UserManagementEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }
}

// Export singleton instance
export const userManagementAPI = new UserManagementAPI();

// Export types and classes
export { UserManagementAPI };
export type { UserManagementAPIConfig, UserManagementEvent, UserManagementEventHandler };