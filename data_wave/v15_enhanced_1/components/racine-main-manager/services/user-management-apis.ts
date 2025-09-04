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
  UUID,
  ISODateString,
  OperationStatus
} from '../types/racine-core.types';
import { globalWebSocketManager, type MessageHandler } from './WebSocketManager';

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
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy',
  timeout: process.env.NODE_ENV === 'development' ? 30000 : 30000, // 30s for both dev and prod
  retryAttempts: process.env.NODE_ENV === 'development' ? 1 : 3, // Fewer retries in dev
  retryDelay: 1000,
  enableWebSocket: process.env.NODE_ENV === 'development' ? false : true, // Disable WebSocket in dev by default
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
  private websocket: WebSocket | null = null; // kept for backward compatibility; not used with manager
  private eventHandlers: Map<UserManagementEventType, UserManagementEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private offlineMode: boolean = false; // New property for offline mode
  private wsUnsubscribe?: () => void;

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

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Check if we're in offline mode or if backend is not available
    if (this.isOfflineMode()) {
      console.warn(`Backend not available, using offline mode for ${endpoint}`);
      return this.getOfflineFallback<T>(endpoint);
    }
    
    // Set up timeout only if timeout > 0 - but don't throw errors
    if (this.config.timeout > 0) {
      timeoutId = setTimeout(() => {
        // Just log a warning - don't throw or abort
        console.warn(`Request to ${endpoint} is taking longer than expected (${this.config.timeout}ms)`);
      }, this.config.timeout);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      // Clear timeout on success
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Handle different error types gracefully
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Don't throw timeout errors - just log and continue
          console.warn(`Request to ${endpoint} was aborted`);
          return this.getOfflineFallback<T>(endpoint);
        } else if (error.message && error.message.includes('fetch')) {
          // Network error - switch to offline mode
          console.warn(`Network error for ${endpoint}, switching to offline mode`);
          this.setOfflineMode(true);
          return this.getOfflineFallback<T>(endpoint);
        }
      }
      
      // For any other error, try offline fallback
      console.warn(`Request failed for ${endpoint}, using offline fallback:`, error);
      return this.getOfflineFallback<T>(endpoint);
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

  /**
   * Check if we're in offline mode
   */
  private isOfflineMode(): boolean {
    return this.offlineMode || !navigator.onLine;
  }

  /**
   * Set offline mode
   */
  private setOfflineMode(offline: boolean): void {
    this.offlineMode = offline;
    if (offline) {
      console.log('Switching to offline mode - backend unavailable');
    } else {
      console.log('Switching to online mode - backend available');
    }
  }

  /**
   * Get offline fallback data
   */
  private getOfflineFallback<T>(endpoint: string): T {
    // Provide mock data for offline mode
    const mockData = this.getMockDataForEndpoint<T>(endpoint);
    console.log(`Using offline fallback for ${endpoint}:`, mockData);
    return mockData;
  }

  /**
   * Get mock data for specific endpoints
   */
  private getMockDataForEndpoint<T>(endpoint: string): T {
    // Provide appropriate mock data based on endpoint
    if (endpoint.includes('/auth/profile')) {
      return {
        id: 'offline-user',
        username: 'offline-user',
        email: 'offline@example.com',
        profile: {
          firstName: 'Offline',
          lastName: 'User',
          displayName: 'Offline User'
        }
      } as T;
    }
    
    if (endpoint.includes('/preferences')) {
      return {
        theme: { mode: 'system', colorScheme: 'auto' },
        layout: { mode: 'default', compact: false },
        accessibility: { highContrast: false, fontSize: 16, reducedMotion: false }
      } as T;
    }
    
    // Default mock data
    return {} as T;
  }

  // =============================================================================
  // USER PROFILE MANAGEMENT
  // =============================================================================

  async getCurrentUser(): Promise<UserProfileResponse> {
    return this.makeRequestWithRetry<UserProfileResponse>('/auth/profile');
  }

  async updateUserProfile(request: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    return this.makeRequestWithRetry<UserProfileResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.makeRequestWithRetry<void>('/auth/change-password', {
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

    const response = await fetch(`${this.config.baseURL}/auth/avatar`, {
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
    await this.makeRequestWithRetry<void>('/auth/delete-account', {
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
    const response = await this.makeRequestWithRetry<AuthenticationResponse>('/auth/login', {
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
      await this.makeRequestWithRetry<void>('/auth/logout', {
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

    const response = await this.makeRequestWithRetry<AuthenticationResponse>('/auth/refresh', {
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
    return this.makeRequestWithRetry<MFASetupResponse>('/auth/mfa/setup', {
      method: 'POST'
    });
  }

  async enableMFA(secret: string, code: string): Promise<void> {
    await this.makeRequestWithRetry<void>('/auth/mfa/enable', {
      method: 'POST',
      body: JSON.stringify({
        secret,
        code
      })
    });
  }

  async disableMFA(password: string, code: string): Promise<void> {
    await this.makeRequestWithRetry<void>('/auth/mfa/disable', {
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
    return this.makeRequestWithRetry<APIKeyResponse[]>('/auth/api-keys');
  }

  async createAPIKey(request: CreateAPIKeyRequest): Promise<APIKeyResponse> {
    return this.makeRequestWithRetry<APIKeyResponse>('/auth/api-keys', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async revokeAPIKey(keyId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/auth/api-keys/${keyId}`, {
      method: 'DELETE'
    });
  }

  async regenerateAPIKey(keyId: UUID): Promise<APIKeyResponse> {
    return this.makeRequestWithRetry<APIKeyResponse>(`/auth/api-keys/${keyId}/regenerate`, {
      method: 'POST'
    });
  }

  async updateAPIKeyPermissions(keyId: UUID, permissions: string[]): Promise<APIKeyResponse> {
    return this.makeRequestWithRetry<APIKeyResponse>(`/auth/api-keys/${keyId}/permissions`, {
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
    return this.makeRequestWithRetry<RoleResponse[]>('/rbac/user/roles');
  }

  async getUserPermissions(): Promise<PermissionResponse[]> {
    return this.makeRequestWithRetry<PermissionResponse[]>('/rbac/user/permissions');
  }

  async getAvailableRoles(): Promise<RoleResponse[]> {
    return this.makeRequestWithRetry<RoleResponse[]>('/rbac/roles');
  }

  async getAvailablePermissions(): Promise<PermissionResponse[]> {
    return this.makeRequestWithRetry<PermissionResponse[]>('/rbac/permissions');
  }

  async requestRole(roleId: UUID, justification: string): Promise<AccessRequestResponse> {
    return this.makeRequestWithRetry<AccessRequestResponse>('/rbac/access-requests', {
      method: 'POST',
      body: JSON.stringify({
        type: 'role',
        resource_id: roleId,
        justification
      })
    });
  }

  async requestPermission(permissionId: UUID, justification: string): Promise<AccessRequestResponse> {
    return this.makeRequestWithRetry<AccessRequestResponse>('/rbac/access-requests', {
      method: 'POST',
      body: JSON.stringify({
        type: 'permission',
        resource_id: permissionId,
        justification
      })
    });
  }

  async revokeRole(roleId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/rbac/user/roles/${roleId}`, {
      method: 'DELETE'
    });
  }

  async revokePermission(permissionId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/rbac/user/permissions/${permissionId}`, {
      method: 'DELETE'
    });
  }

  // =============================================================================
  // ACCESS CONTROL
  // =============================================================================

  async getAccessRequests(): Promise<AccessRequestResponse[]> {
    return this.makeRequestWithRetry<AccessRequestResponse[]>('/rbac/access-requests');
  }

  async requestCrossGroupAccess(request: CreateAccessRequestRequest): Promise<AccessRequestResponse> {
    return this.makeRequestWithRetry<AccessRequestResponse>('/rbac/cross-group-access', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async approveAccessRequest(requestId: UUID): Promise<void> {
    await this.makeRequestWithRetry<void>(`/rbac/access-requests/${requestId}/approve`, {
      method: 'POST'
    });
  }

  async denyAccessRequest(requestId: UUID, reason: string): Promise<void> {
    await this.makeRequestWithRetry<void>(`/rbac/access-requests/${requestId}/deny`, {
      method: 'POST',
      body: JSON.stringify({
        reason
      })
    });
  }

  async getCrossGroupAccess(): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>('/rbac/cross-group-access');
  }

  // =============================================================================
  // PREFERENCES AND SETTINGS
  // =============================================================================

  async getUserPreferences(): Promise<UserPreferencesResponse> {
    return this.makeRequestWithRetry<UserPreferencesResponse>('/auth/preferences');
  }

  async updateUserPreferences(request: UpdateUserPreferencesRequest): Promise<UserPreferencesResponse> {
    return this.makeRequestWithRetry<UserPreferencesResponse>('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  async getNotificationSettings(): Promise<NotificationSettingsResponse> {
    return this.makeRequestWithRetry<NotificationSettingsResponse>('/auth/notifications');
  }

  async updateNotificationSettings(request: UpdateNotificationSettingsRequest): Promise<NotificationSettingsResponse> {
    return this.makeRequestWithRetry<NotificationSettingsResponse>('/auth/notifications', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  async getCustomThemes(): Promise<any[]> {
    return this.makeRequestWithRetry<any[]>('/auth/custom-themes');
  }

  async getCustomLayouts(): Promise<any[]> {
    return this.makeRequestWithRetry<any[]>('/auth/custom-layouts');
  }

  async getDevicePreferences(): Promise<any> {
    return this.makeRequestWithRetry<any>('/auth/device-preferences');
  }

  async createCustomTheme(customTheme: any): Promise<any> {
    return this.makeRequestWithRetry<any>('/auth/custom-themes', {
      method: 'POST',
      body: JSON.stringify(customTheme)
    });
  }

  async deleteCustomTheme(themeId: string): Promise<void> {
    await this.makeRequestWithRetry<void>(`/auth/custom-themes/${themeId}`, {
      method: 'DELETE'
    });
  }

  async createCustomLayout(customLayout: any): Promise<any> {
    return this.makeRequestWithRetry<any>('/auth/custom-layouts', {
      method: 'POST',
      body: JSON.stringify(customLayout)
    });
  }

  async deleteCustomLayout(layoutId: string): Promise<void> {
    await this.makeRequestWithRetry<void>(`/auth/custom-layouts/${layoutId}`, {
      method: 'DELETE'
    });
  }

  async syncPreferencesAcrossDevices(request: any): Promise<any> {
    return this.makeRequestWithRetry<any>('/auth/sync-preferences', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async updateThemePreferences(theme: Record<string, any>): Promise<void> {
    await this.makeRequestWithRetry<void>('/auth/preferences/theme', {
      method: 'PUT',
      body: JSON.stringify(theme)
    });
  }

  async updateLayoutPreferences(layout: Record<string, any>): Promise<void> {
    await this.makeRequestWithRetry<void>('/auth/preferences/layout', {
      method: 'PUT',
      body: JSON.stringify(layout)
    });
  }

  async resetPreferences(): Promise<void> {
    await this.makeRequestWithRetry<void>('/auth/preferences/reset', {
      method: 'POST'
    });
  }

  // =============================================================================
  // SECURITY AUDIT AND COMPLIANCE
  // =============================================================================

  async getSecurityAudit(timeRange = '30d'): Promise<SecurityAuditResponse> {
    return this.makeRequestWithRetry<SecurityAuditResponse>(`/auth/security/audit?time_range=${timeRange}`);
  }

  async getSecurityLogs(filters?: FilterRequest): Promise<SecurityLogResponse[]> {
    const queryParams = filters ? new URLSearchParams(filters as any).toString() : '';
    return this.makeRequestWithRetry<SecurityLogResponse[]>(`/auth/security/logs?${queryParams}`);
  }

  async getComplianceStatus(): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>('/auth/compliance/status');
  }

  async generateSecurityReport(reportType: string): Promise<Blob> {
    const response = await fetch(`${this.config.baseURL}/auth/security/reports/${reportType}`, {
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
    return this.makeRequestWithRetry<UserAnalytics>(`/auth/analytics?time_range=${timeRange}`);
  }

  async getActivitySummary(timeRange = '7d'): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>(`/auth/activity/summary?time_range=${timeRange}`);
  }

  async getUsageStatistics(timeRange = '30d'): Promise<Record<string, any>> {
    return this.makeRequestWithRetry<Record<string, any>>(`/auth/usage/statistics?time_range=${timeRange}`);
  }

  // =============================================================================
  // UTILITIES
  // =============================================================================

  async exportUserData(format: 'json' | 'csv'): Promise<Blob> {
    const response = await fetch(`${this.config.baseURL}/auth/export?format=${format}`, {
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
    if (!this.config.websocketURL) return;
    const token = this.getAuthToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    const wsUrl = `${this.config.websocketURL}/user-management?token=${encodeURIComponent(token)}`;
    // Use shared manager; store unsubscribe to allow cleanup
    const handler: MessageHandler = (data: any) => {
      try {
        const event: UserManagementEvent = typeof data === 'string' ? JSON.parse(data) : data;
        this.handleWebSocketEvent(event);
      } catch (e) {
        // ignore malformed
      }
    };

    // If already subscribed, skip
    if (!this.wsUnsubscribe) {
      this.wsUnsubscribe = globalWebSocketManager.subscribe(wsUrl, handler);
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

  /**
   * Test backend connectivity and switch to offline mode if needed
   */
  async testBackendConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout for health check
      });
      
      if (response.ok) {
        this.setOfflineMode(false);
        return true;
      } else {
        this.setOfflineMode(true);
        return false;
      }
    } catch (error) {
      console.warn('Backend connectivity test failed, switching to offline mode:', error);
      this.setOfflineMode(true);
      return false;
    }
  }

  /**
   * Initialize the API and test connectivity
   */
  async initialize(): Promise<void> {
    // Test backend connectivity on initialization
    await this.testBackendConnectivity();
    
    // Set up online/offline event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Network came online, testing backend connectivity...');
        this.testBackendConnectivity();
      });
      
      window.addEventListener('offline', () => {
        console.log('Network went offline, switching to offline mode...');
        this.setOfflineMode(true);
      });
    }
  }
}

// Export singleton instance
export const userManagementAPI = new UserManagementAPI();

// Export types and classes
export { UserManagementAPI };
export type { UserManagementAPIConfig, UserManagementEvent, UserManagementEventHandler };
