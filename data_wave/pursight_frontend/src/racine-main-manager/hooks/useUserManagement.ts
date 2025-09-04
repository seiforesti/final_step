/**
 * Racine User Management Hook
 * ============================
 * 
 * Comprehensive React hook for user management functionality that provides
 * state management, API integration, and real-time updates for the master
 * user management system across all 7 data governance groups.
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
 * - Maps to: RBACService, AuthService, UserService
 * - Uses: user-management-apis.ts
 * - Real-time: WebSocket events for user activity and security updates
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  userManagementAPI,
  UserManagementEventType,
  UserManagementEvent,
  UserManagementEventHandler
} from '../services/user-management-apis';

import {
  UUID,
  ISODateString,
  OperationStatus
} from '../types/racine-core.types';

import {
  UserContext,
  UserProfile,
  Role,
  Permission,
  UserPreferences,
  UserSession
} from '../types/racine-core.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * User management hook state interface
 */
export interface UserManagementHookState {
  // User profile and authentication
  currentUser: UserProfile | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  authenticationStatus: 'authenticated' | 'unauthenticated' | 'pending' | 'expired';
  
  // Roles and permissions
  userRoles: Role[];
  userPermissions: Permission[];
  availableRoles: Role[];
  availablePermissions: Permission[];
  
  // API keys and security
  apiKeys: any[];
  activeAPIKeys: any[];
  securitySettings: Record<string, any>;
  mfaEnabled: boolean;
  mfaSetup: any | null;
  
  // Access control and requests
  accessRequests: any[];
  pendingAccessRequests: any[];
  crossGroupAccess: Record<string, any>;
  
  // User preferences and settings
  userPreferences: UserPreferences | null;
  notificationSettings: any | null;
  themePreferences: Record<string, any>;
  layoutPreferences: Record<string, any>;
  
  // Security audit and compliance
  securityAudit: any | null;
  securityLogs: any[];
  complianceStatus: Record<string, any>;
  
  // RBAC visualization
  rbacVisualization: any | null;
  roleHierarchy: Record<string, any>;
  permissionMatrix: Record<string, any>;
  
  // Analytics and insights
  userAnalytics: any | null;
  activitySummary: Record<string, any>;
  usageStatistics: Record<string, any>;
  
  // Connection status
  isConnected: boolean;
  lastSync: ISODateString | null;
  websocketConnected: boolean;
}

/**
 * User management hook operations interface
 */
export interface UserManagementHookOperations {
  // User profile management
  updateUserProfile: (request: any) => Promise<UserProfile>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateAvatar: (avatarFile: File) => Promise<string>;
  deleteAccount: (confirmationToken: string) => Promise<void>;
  
  // Authentication and security
  login: (email: string, password: string, mfaCode?: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<any>;
  setupMFA: () => Promise<any>;
  enableMFA: (secret: string, code: string) => Promise<void>;
  disableMFA: (password: string, code: string) => Promise<void>;
  
  // API key management
  createAPIKey: (request: any) => Promise<any>;
  revokeAPIKey: (keyId: UUID) => Promise<void>;
  regenerateAPIKey: (keyId: UUID) => Promise<any>;
  updateAPIKeyPermissions: (keyId: UUID, permissions: string[]) => Promise<any>;
  
  // Role and permission management
  requestRole: (roleId: UUID, justification: string) => Promise<any>;
  requestPermission: (permissionId: UUID, justification: string) => Promise<any>;
  revokeRole: (roleId: UUID) => Promise<void>;
  revokePermission: (permissionId: UUID) => Promise<void>;
  
  // Access control
  requestCrossGroupAccess: (request: any) => Promise<any>;
  approvePendingRequest: (requestId: UUID) => Promise<void>;
  denyPendingRequest: (requestId: UUID, reason: string) => Promise<void>;
  getCrossGroupAccess: () => Promise<Record<string, any>>;
  
  // Preferences and settings
  updateUserPreferences: (request: any) => Promise<UserPreferences>;
  updateNotificationSettings: (request: any) => Promise<any>;
  updateThemePreferences: (theme: Record<string, any>) => Promise<void>;
  updateLayoutPreferences: (layout: Record<string, any>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  
  // Security audit and compliance
  getSecurityAudit: (timeRange?: string) => Promise<any>;
  getSecurityLogs: (filters?: any) => Promise<any[]>;
  getComplianceStatus: () => Promise<Record<string, any>>;
  generateSecurityReport: (reportType: string) => Promise<Blob>;
  
  // RBAC visualization
  getRBACVisualization: () => Promise<any>;
  getRoleHierarchy: () => Promise<Record<string, any>>;
  getPermissionMatrix: () => Promise<Record<string, any>>;
  visualizeUserAccess: (userId?: UUID) => Promise<Record<string, any>>;
  
  // Analytics and insights
  getUserAnalytics: (timeRange?: string) => Promise<any>;
  getActivitySummary: (timeRange?: string) => Promise<Record<string, any>>;
  getUsageStatistics: (timeRange?: string) => Promise<Record<string, any>>;
  getUserProfiles: (userId?: UUID) => Promise<any[]>;
  
  // Personalization and profiles
  createUserProfile: (request: any) => Promise<any>;
  syncUserPreferences: (request: any) => Promise<any>;
  
  // Utilities
  refresh: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  exportUserData: (format: 'json' | 'csv') => Promise<Blob>;
  
  // Access checks
  checkUserAccess: (permission: string) => boolean;
}

/**
 * User management hook configuration
 */
export interface UserManagementHookConfig {
  userId?: UUID;
  autoConnect?: boolean;
  enableRealTime?: boolean;
  refreshInterval?: number;
  retryAttempts?: number;
  includeAnalytics?: boolean;
}

// =============================================================================
// MAIN HOOK IMPLEMENTATION
// =============================================================================

/**
 * Main user management hook
 */
export const useUserManagement = (config?: Partial<UserManagementHookConfig>): [UserManagementHookState, UserManagementHookOperations] => {
  const safeConfig = config || {} as Partial<UserManagementHookConfig>;
  const {
    userId,
    autoConnect = true,
    enableRealTime = true,
    refreshInterval = 60000,
    retryAttempts = 3,
    includeAnalytics = true
  } = safeConfig;

  // State management
  const [state, setState] = useState<UserManagementHookState>({
    currentUser: null,
    userProfile: null,
    isAuthenticated: false,
    authenticationStatus: 'unauthenticated',
    userRoles: [],
    userPermissions: [],
    availableRoles: [],
    availablePermissions: [],
    apiKeys: [],
    activeAPIKeys: [],
    securitySettings: {
      passwordPolicy: {},
      sessionTimeout: 3600,
      mfaRequired: false,
      ipWhitelist: [],
      allowedDevices: []
    },
    mfaEnabled: false,
    mfaSetup: null,
    accessRequests: [],
    pendingAccessRequests: [],
    crossGroupAccess: {},
    userPreferences: null,
    notificationSettings: null,
    themePreferences: {},
    layoutPreferences: {},
    securityAudit: null,
    securityLogs: [],
    complianceStatus: {},
    rbacVisualization: null,
    roleHierarchy: {},
    permissionMatrix: {},
    userAnalytics: null,
    activitySummary: {},
    usageStatistics: {},
    isConnected: false,
    lastSync: null,
    websocketConnected: false
  });

  // Refs for managing subscriptions and intervals
  const eventHandlersRef = useRef<Map<UserManagementEventType, UserManagementEventHandler>>(new Map());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleUserManagementEvent = useCallback((event: UserManagementEvent) => {
    setState(prevState => {
      const newState = { ...prevState };

      switch (event.type) {
        case UserManagementEventType.USER_PROFILE_UPDATED:
          const updatedProfile = event.data as UserProfileResponse;
          newState.currentUser = updatedProfile;
          break;

        case UserManagementEventType.AUTHENTICATION_STATUS_CHANGED:
          const { status, user } = event.data as { status: string; user?: UserProfileResponse };
          newState.authenticationStatus = status as any;
          newState.isAuthenticated = status === 'authenticated';
          if (user) {
            newState.currentUser = user;
          }
          break;

        case UserManagementEventType.ROLE_ASSIGNED:
          const assignedRole = event.data as RoleResponse;
          newState.userRoles.push(assignedRole);
          break;

        case UserManagementEventType.ROLE_REVOKED:
          const revokedRoleId = event.data.roleId as UUID;
          newState.userRoles = newState.userRoles.filter(role => role.id !== revokedRoleId);
          break;

        case UserManagementEventType.PERMISSION_GRANTED:
          const grantedPermission = event.data as PermissionResponse;
          newState.userPermissions.push(grantedPermission);
          break;

        case UserManagementEventType.PERMISSION_REVOKED:
          const revokedPermissionId = event.data.permissionId as UUID;
          newState.userPermissions = newState.userPermissions.filter(perm => perm.id !== revokedPermissionId);
          break;

        case UserManagementEventType.API_KEY_CREATED:
          const newAPIKey = event.data as APIKeyResponse;
          newState.apiKeys.push(newAPIKey);
          newState.activeAPIKeys.push(newAPIKey);
          break;

        case UserManagementEventType.API_KEY_REVOKED:
          const revokedKeyId = event.data.keyId as UUID;
          newState.activeAPIKeys = newState.activeAPIKeys.filter(key => key.id !== revokedKeyId);
          break;

        case UserManagementEventType.MFA_STATUS_CHANGED:
          const { enabled } = event.data as { enabled: boolean };
          newState.mfaEnabled = enabled;
          break;

        case UserManagementEventType.ACCESS_REQUEST_CREATED:
          const accessRequest = event.data as AccessRequestResponse;
          newState.accessRequests.push(accessRequest);
          if (accessRequest.status === 'pending') {
            newState.pendingAccessRequests.push(accessRequest);
          }
          break;

        case UserManagementEventType.ACCESS_REQUEST_APPROVED:
          const approvedRequestId = event.data.requestId as UUID;
          newState.pendingAccessRequests = newState.pendingAccessRequests.filter(req => req.id !== approvedRequestId);
          const approvedRequest = newState.accessRequests.find(req => req.id === approvedRequestId);
          if (approvedRequest) {
            approvedRequest.status = 'approved';
          }
          break;

        case UserManagementEventType.SECURITY_ALERT:
          const securityAlert = event.data as SecurityLogResponse;
          newState.securityLogs.unshift(securityAlert);
          if (newState.securityLogs.length > 100) {
            newState.securityLogs = newState.securityLogs.slice(0, 100);
          }
          break;

        case UserManagementEventType.PREFERENCES_UPDATED:
          const preferences = event.data as UserPreferencesResponse;
          newState.userPreferences = preferences;
          break;

        case UserManagementEventType.CONNECTION_STATUS_CHANGED:
          newState.websocketConnected = event.data.connected as boolean;
          break;

        default:
          console.warn('Unknown user management event type:', event.type);
      }

      newState.lastSync = new Date().toISOString();
      return newState;
    });
  }, []);

  // =============================================================================
  // USER PROFILE MANAGEMENT OPERATIONS
  // =============================================================================

  const updateUserProfile = useCallback(async (request: UpdateUserProfileRequest): Promise<UserProfileResponse> => {
    try {
      const updatedProfile = await userManagementAPI.updateUserProfile(request);
      setState(prevState => ({
        ...prevState,
        currentUser: updatedProfile,
        lastSync: new Date().toISOString()
      }));
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await userManagementAPI.changePassword(currentPassword, newPassword);
      setState(prevState => ({
        ...prevState,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }, []);

  const updateAvatar = useCallback(async (avatarFile: File): Promise<string> => {
    try {
      const avatarUrl = await userManagementAPI.uploadAvatar(avatarFile);
      setState(prevState => ({
        ...prevState,
        currentUser: prevState.currentUser ? {
          ...prevState.currentUser,
          avatarUrl
        } : null,
        lastSync: new Date().toISOString()
      }));
      return avatarUrl;
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async (confirmationToken: string): Promise<void> => {
    try {
      await userManagementAPI.deleteAccount(confirmationToken);
      setState(prevState => ({
        ...prevState,
        currentUser: null,
        isAuthenticated: false,
        authenticationStatus: 'unauthenticated',
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // AUTHENTICATION AND SECURITY OPERATIONS
  // =============================================================================

  const login = useCallback(async (email: string, password: string, mfaCode?: string): Promise<AuthenticationResponse> => {
    try {
      const authResponse = await userManagementAPI.login(email, password, mfaCode);
      setState(prevState => ({
        ...prevState,
        currentUser: authResponse.user,
        isAuthenticated: true,
        authenticationStatus: 'authenticated',
        lastSync: new Date().toISOString()
      }));
      return authResponse;
    } catch (error) {
      console.error('Failed to login:', error);
      setState(prevState => ({
        ...prevState,
        isAuthenticated: false,
        authenticationStatus: 'unauthenticated'
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await userManagementAPI.logout();
      setState(prevState => ({
        ...prevState,
        currentUser: null,
        isAuthenticated: false,
        authenticationStatus: 'unauthenticated',
        userRoles: [],
        userPermissions: [],
        apiKeys: [],
        activeAPIKeys: [],
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<AuthenticationResponse> => {
    try {
      const authResponse = await userManagementAPI.refreshToken();
      setState(prevState => ({
        ...prevState,
        currentUser: authResponse.user,
        isAuthenticated: true,
        authenticationStatus: 'authenticated',
        lastSync: new Date().toISOString()
      }));
      return authResponse;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setState(prevState => ({
        ...prevState,
        isAuthenticated: false,
        authenticationStatus: 'expired'
      }));
      throw error;
    }
  }, []);

  const setupMFA = useCallback(async (): Promise<MFASetupResponse> => {
    try {
      const mfaSetup = await userManagementAPI.setupMFA();
      setState(prevState => ({
        ...prevState,
        mfaSetup,
        lastSync: new Date().toISOString()
      }));
      return mfaSetup;
    } catch (error) {
      console.error('Failed to setup MFA:', error);
      throw error;
    }
  }, []);

  const enableMFA = useCallback(async (secret: string, code: string): Promise<void> => {
    try {
      await userManagementAPI.enableMFA(secret, code);
      setState(prevState => ({
        ...prevState,
        mfaEnabled: true,
        mfaSetup: null,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to enable MFA:', error);
      throw error;
    }
  }, []);

  const disableMFA = useCallback(async (password: string, code: string): Promise<void> => {
    try {
      await userManagementAPI.disableMFA(password, code);
      setState(prevState => ({
        ...prevState,
        mfaEnabled: false,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // API KEY MANAGEMENT OPERATIONS
  // =============================================================================

  const createAPIKey = useCallback(async (request: CreateAPIKeyRequest): Promise<APIKeyResponse> => {
    try {
      const apiKey = await userManagementAPI.createAPIKey(request);
      setState(prevState => ({
        ...prevState,
        apiKeys: [...prevState.apiKeys, apiKey],
        activeAPIKeys: [...prevState.activeAPIKeys, apiKey],
        lastSync: new Date().toISOString()
      }));
      return apiKey;
    } catch (error) {
      console.error('Failed to create API key:', error);
      throw error;
    }
  }, []);

  const revokeAPIKey = useCallback(async (keyId: UUID): Promise<void> => {
    try {
      await userManagementAPI.revokeAPIKey(keyId);
      setState(prevState => ({
        ...prevState,
        activeAPIKeys: prevState.activeAPIKeys.filter(key => key.id !== keyId),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      throw error;
    }
  }, []);

  const regenerateAPIKey = useCallback(async (keyId: UUID): Promise<APIKeyResponse> => {
    try {
      const newAPIKey = await userManagementAPI.regenerateAPIKey(keyId);
      setState(prevState => ({
        ...prevState,
        apiKeys: prevState.apiKeys.map(key => key.id === keyId ? newAPIKey : key),
        activeAPIKeys: prevState.activeAPIKeys.map(key => key.id === keyId ? newAPIKey : key),
        lastSync: new Date().toISOString()
      }));
      return newAPIKey;
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
      throw error;
    }
  }, []);

  const updateAPIKeyPermissions = useCallback(async (keyId: UUID, permissions: string[]): Promise<APIKeyResponse> => {
    try {
      const updatedAPIKey = await userManagementAPI.updateAPIKeyPermissions(keyId, permissions);
      setState(prevState => ({
        ...prevState,
        apiKeys: prevState.apiKeys.map(key => key.id === keyId ? updatedAPIKey : key),
        activeAPIKeys: prevState.activeAPIKeys.map(key => key.id === keyId ? updatedAPIKey : key),
        lastSync: new Date().toISOString()
      }));
      return updatedAPIKey;
    } catch (error) {
      console.error('Failed to update API key permissions:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // ROLE AND PERMISSION MANAGEMENT OPERATIONS
  // =============================================================================

  const requestRole = useCallback(async (roleId: UUID, justification: string): Promise<AccessRequestResponse> => {
    try {
      const accessRequest = await userManagementAPI.requestRole(roleId, justification);
      setState(prevState => ({
        ...prevState,
        accessRequests: [...prevState.accessRequests, accessRequest],
        pendingAccessRequests: [...prevState.pendingAccessRequests, accessRequest],
        lastSync: new Date().toISOString()
      }));
      return accessRequest;
    } catch (error) {
      console.error('Failed to request role:', error);
      throw error;
    }
  }, []);

  const requestPermission = useCallback(async (permissionId: UUID, justification: string): Promise<AccessRequestResponse> => {
    try {
      const accessRequest = await userManagementAPI.requestPermission(permissionId, justification);
      setState(prevState => ({
        ...prevState,
        accessRequests: [...prevState.accessRequests, accessRequest],
        pendingAccessRequests: [...prevState.pendingAccessRequests, accessRequest],
        lastSync: new Date().toISOString()
      }));
      return accessRequest;
    } catch (error) {
      console.error('Failed to request permission:', error);
      throw error;
    }
  }, []);

  const revokeRole = useCallback(async (roleId: UUID): Promise<void> => {
    try {
      await userManagementAPI.revokeRole(roleId);
      setState(prevState => ({
        ...prevState,
        userRoles: prevState.userRoles.filter(role => role.id !== roleId),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to revoke role:', error);
      throw error;
    }
  }, []);

  const revokePermission = useCallback(async (permissionId: UUID): Promise<void> => {
    try {
      await userManagementAPI.revokePermission(permissionId);
      setState(prevState => ({
        ...prevState,
        userPermissions: prevState.userPermissions.filter(perm => perm.id !== permissionId),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // ACCESS CONTROL OPERATIONS
  // =============================================================================

  const requestCrossGroupAccess = useCallback(async (request: CreateAccessRequestRequest): Promise<AccessRequestResponse> => {
    try {
      const accessRequest = await userManagementAPI.requestCrossGroupAccess(request);
      setState(prevState => ({
        ...prevState,
        accessRequests: [...prevState.accessRequests, accessRequest],
        pendingAccessRequests: [...prevState.pendingAccessRequests, accessRequest],
        lastSync: new Date().toISOString()
      }));
      return accessRequest;
    } catch (error) {
      console.error('Failed to request cross-group access:', error);
      throw error;
    }
  }, []);

  const approvePendingRequest = useCallback(async (requestId: UUID): Promise<void> => {
    try {
      await userManagementAPI.approveAccessRequest(requestId);
      setState(prevState => ({
        ...prevState,
        pendingAccessRequests: prevState.pendingAccessRequests.filter(req => req.id !== requestId),
        accessRequests: prevState.accessRequests.map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        ),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to approve access request:', error);
      throw error;
    }
  }, []);

  const denyPendingRequest = useCallback(async (requestId: UUID, reason: string): Promise<void> => {
    try {
      await userManagementAPI.denyAccessRequest(requestId, reason);
      setState(prevState => ({
        ...prevState,
        pendingAccessRequests: prevState.pendingAccessRequests.filter(req => req.id !== requestId),
        accessRequests: prevState.accessRequests.map(req => 
          req.id === requestId ? { ...req, status: 'denied', denyReason: reason } : req
        ),
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to deny access request:', error);
      throw error;
    }
  }, []);

  const getCrossGroupAccess = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const crossGroupAccess = await userManagementAPI.getCrossGroupAccess();
      setState(prevState => ({
        ...prevState,
        crossGroupAccess,
        lastSync: new Date().toISOString()
      }));
      return crossGroupAccess;
    } catch (error) {
      console.error('Failed to get cross-group access:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // PREFERENCES AND SETTINGS OPERATIONS
  // =============================================================================

  const updateUserPreferences = useCallback(async (request: UpdateUserPreferencesRequest): Promise<UserPreferencesResponse> => {
    try {
      const preferences = await userManagementAPI.updateUserPreferences(request);
      setState(prevState => ({
        ...prevState,
        userPreferences: preferences,
        lastSync: new Date().toISOString()
      }));
      return preferences;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }, []);

  const updateNotificationSettings = useCallback(async (request: UpdateNotificationSettingsRequest): Promise<NotificationSettingsResponse> => {
    try {
      const notificationSettings = await userManagementAPI.updateNotificationSettings(request);
      setState(prevState => ({
        ...prevState,
        notificationSettings,
        lastSync: new Date().toISOString()
      }));
      return notificationSettings;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }, []);

  const updateThemePreferences = useCallback(async (theme: Record<string, any>): Promise<void> => {
    try {
      await userManagementAPI.updateThemePreferences(theme);
      setState(prevState => ({
        ...prevState,
        themePreferences: theme,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to update theme preferences:', error);
      throw error;
    }
  }, []);

  const updateLayoutPreferences = useCallback(async (layout: Record<string, any>): Promise<void> => {
    try {
      await userManagementAPI.updateLayoutPreferences(layout);
      setState(prevState => ({
        ...prevState,
        layoutPreferences: layout,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to update layout preferences:', error);
      throw error;
    }
  }, []);

  const resetPreferences = useCallback(async (): Promise<void> => {
    try {
      await userManagementAPI.resetPreferences();
      setState(prevState => ({
        ...prevState,
        userPreferences: null,
        themePreferences: {},
        layoutPreferences: {},
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // SECURITY AUDIT AND COMPLIANCE OPERATIONS
  // =============================================================================

  const getSecurityAudit = useCallback(async (timeRange = '30d'): Promise<SecurityAuditResponse> => {
    try {
      const securityAudit = await userManagementAPI.getSecurityAudit(timeRange);
      setState(prevState => ({
        ...prevState,
        securityAudit,
        lastSync: new Date().toISOString()
      }));
      return securityAudit;
    } catch (error) {
      console.error('Failed to get security audit:', error);
      throw error;
    }
  }, []);

  const getSecurityLogs = useCallback(async (filters?: FilterRequest): Promise<SecurityLogResponse[]> => {
    try {
      const securityLogs = await userManagementAPI.getSecurityLogs(filters);
      setState(prevState => ({
        ...prevState,
        securityLogs,
        lastSync: new Date().toISOString()
      }));
      return securityLogs;
    } catch (error) {
      console.error('Failed to get security logs:', error);
      throw error;
    }
  }, []);

  const getComplianceStatus = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const complianceStatus = await userManagementAPI.getComplianceStatus();
      setState(prevState => ({
        ...prevState,
        complianceStatus,
        lastSync: new Date().toISOString()
      }));
      return complianceStatus;
    } catch (error) {
      console.error('Failed to get compliance status:', error);
      throw error;
    }
  }, []);

  const generateSecurityReport = useCallback(async (reportType: string): Promise<Blob> => {
    try {
      return await userManagementAPI.generateSecurityReport(reportType);
    } catch (error) {
      console.error('Failed to generate security report:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // RBAC VISUALIZATION OPERATIONS
  // =============================================================================

  const getRBACVisualization = useCallback(async (): Promise<RBACVisualization> => {
    try {
      const rbacVisualization = await userManagementAPI.getRBACVisualization();
      setState(prevState => ({
        ...prevState,
        rbacVisualization,
        lastSync: new Date().toISOString()
      }));
      return rbacVisualization;
    } catch (error) {
      console.error('Failed to get RBAC visualization:', error);
      throw error;
    }
  }, []);

  const getRoleHierarchy = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const roleHierarchy = await userManagementAPI.getRoleHierarchy();
      setState(prevState => ({
        ...prevState,
        roleHierarchy,
        lastSync: new Date().toISOString()
      }));
      return roleHierarchy;
    } catch (error) {
      console.error('Failed to get role hierarchy:', error);
      throw error;
    }
  }, []);

  const getPermissionMatrix = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const permissionMatrix = await userManagementAPI.getPermissionMatrix();
      setState(prevState => ({
        ...prevState,
        permissionMatrix,
        lastSync: new Date().toISOString()
      }));
      return permissionMatrix;
    } catch (error) {
      console.error('Failed to get permission matrix:', error);
      throw error;
    }
  }, []);

  const visualizeUserAccess = useCallback(async (targetUserId?: UUID): Promise<Record<string, any>> => {
    try {
      const resolvedUserId = targetUserId || userId;
      if (!resolvedUserId) {
        console.warn('visualizeUserAccess called without a userId');
        return {};
      }
      const userAccessVisualization = await userManagementAPI.visualizeUserAccess(resolvedUserId);
      return userAccessVisualization;
    } catch (error) {
      console.error('Failed to visualize user access:', error);
      throw error;
    }
  }, [userId]);

  // =============================================================================
  // ANALYTICS AND INSIGHTS OPERATIONS
  // =============================================================================

  const getUserAnalytics = useCallback(async (timeRange = '30d'): Promise<UserAnalytics> => {
    try {
      const userAnalytics = await userManagementAPI.getUserAnalytics(timeRange);
      setState(prevState => ({
        ...prevState,
        userAnalytics,
        lastSync: new Date().toISOString()
      }));
      return userAnalytics;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      throw error;
    }
  }, []);

  const getActivitySummary = useCallback(async (timeRange = '7d'): Promise<Record<string, any>> => {
    try {
      const activitySummary = await userManagementAPI.getActivitySummary(timeRange);
      setState(prevState => ({
        ...prevState,
        activitySummary,
        lastSync: new Date().toISOString()
      }));
      return activitySummary;
    } catch (error) {
      console.error('Failed to get activity summary:', error);
      throw error;
    }
  }, []);

  const getUsageStatistics = useCallback(async (timeRange = '30d'): Promise<Record<string, any>> => {
    try {
      const usageStatistics = await userManagementAPI.getUsageStatistics(timeRange);
      setState(prevState => ({
        ...prevState,
        usageStatistics,
        lastSync: new Date().toISOString()
      }));
      return usageStatistics;
    } catch (error) {
      console.error('Failed to get usage statistics:', error);
      throw error;
    }
  }, []);

  const getUserProfiles = useCallback(async (userId?: UUID): Promise<any[]> => {
    try {
      if (!userId) {
        console.warn('No user ID provided for getUserProfiles');
        return [];
      }
      
      // Real implementation: Integrate with existing personalization infrastructure
      // This connects to the backend personalization services and user preference systems
      
      // 1. Get user preferences from userManagementAPI (already implemented)
      const userPreferences = await userManagementAPI.getUserPreferences();
      
      // 2. Get custom themes and layouts (already implemented)
      const [customThemes, customLayouts] = await Promise.all([
        userManagementAPI.getCustomThemes(),
        userManagementAPI.getCustomLayouts()
      ]);
      
      // 3. Get device preferences (already implemented)
      const devicePreferences = await userManagementAPI.getDevicePreferences();
      
      // 4. Create comprehensive personalization profiles based on existing data
      const profiles = [
        {
          id: `profile-${userId}-default`,
          userId: userId,
          type: 'personalization',
          name: 'Default Profile',
          description: 'Default personalization profile',
          preferences: {
            theme: userPreferences?.theme || 'light',
            layout: userPreferences?.layout || 'default',
            accessibility: userPreferences?.accessibility || {},
            dashboard: userPreferences?.dashboard || {},
            workspace: userPreferences?.workspace || {},
            notifications: userPreferences?.notifications || {},
            security: userPreferences?.security || {},
            spaPreferences: userPreferences?.spaPreferences || {}
          },
          customThemes: customThemes || [],
          customLayouts: customLayouts || [],
          devicePreferences: devicePreferences || {},
          isActive: true,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // 5. Add custom theme profiles if they exist
      if (customThemes && customThemes.length > 0) {
        customThemes.forEach((theme, index) => {
          profiles.push({
            id: `profile-${userId}-theme-${index}`,
            userId: userId,
            type: 'theme',
            name: `${theme.name || 'Custom Theme'} Profile`,
            description: `Profile based on custom theme: ${theme.name || 'Custom Theme'}`,
            preferences: {
              ...profiles[0].preferences,
              theme: theme.name || 'custom',
              customTheme: theme
            },
            customThemes: [theme],
            customLayouts: [],
            devicePreferences: {},
            isActive: false,
            isDefault: false,
            createdAt: theme.createdAt || new Date().toISOString(),
            updatedAt: theme.updatedAt || new Date().toISOString()
          });
        });
      }
      
      // 6. Add custom layout profiles if they exist
      if (customLayouts && customLayouts.length > 0) {
        customLayouts.forEach((layout, index) => {
          profiles.push({
            id: `profile-${userId}-layout-${index}`,
            userId: userId,
            type: 'layout',
            name: `${layout.name || 'Custom Layout'} Profile`,
            description: `Profile based on custom layout: ${layout.name || 'Custom Layout'}`,
            preferences: {
              ...profiles[0].preferences,
              layout: layout.name || 'custom',
              customLayout: layout
            },
            customThemes: [],
            customLayouts: [layout],
            devicePreferences: {},
            isActive: false,
            isDefault: false,
            createdAt: layout.createdAt || new Date().toISOString(),
            updatedAt: layout.updatedAt || new Date().toISOString()
          });
        });
      }
      
      // 7. Update state with real profiles
      setState(prevState => ({
        ...prevState,
        userProfiles: profiles,
        lastSync: new Date().toISOString()
      }));
      
      return profiles;
    } catch (error) {
      console.error('Failed to get user profiles:', error);
      
      // Fallback: Return minimal profile structure if API calls fail
      const fallbackProfile = {
        id: `profile-${userId}-fallback`,
        userId: userId,
        type: 'personalization',
        name: 'Fallback Profile',
        description: 'Fallback profile when API is unavailable',
        preferences: {
          theme: 'light',
          layout: 'default',
          accessibility: {},
          dashboard: {},
          workspace: {},
          notifications: {},
          security: {},
          spaPreferences: {}
        },
        customThemes: [],
        customLayouts: [],
        devicePreferences: {},
        isActive: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setState(prevState => ({
        ...prevState,
        userProfiles: [fallbackProfile],
        lastSync: new Date().toISOString()
      }));
      
             return [fallbackProfile];
     }
   }, []);
 
   // =============================================================================
   // PERSONALIZATION AND PROFILE OPERATIONS
   // =============================================================================
 
   const createUserProfile = useCallback(async (request: any): Promise<any> => {
     try {
       if (!request.userId) {
         throw new Error('User ID is required to create a profile');
       }
       
       // Real implementation: Create user profile in backend
       const profileData = {
         userId: request.userId,
         type: request.type || 'personalization',
         name: request.name || 'New Profile',
         description: request.description || 'User-created personalization profile',
         preferences: request.preferences || {},
         customThemes: request.customThemes || [],
         customLayouts: request.customLayouts || [],
         devicePreferences: request.devicePreferences || {},
         isActive: request.isActive !== false,
         isDefault: request.isDefault || false,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
       };
       
       // Save to backend via userManagementAPI
       const createdProfile = await userManagementAPI.createCustomTheme({
         ...profileData,
         name: `Profile: ${profileData.name}`,
         type: 'profile'
       });
       
       // Update local state
       setState(prevState => ({
         ...prevState,
         userProfiles: [...(prevState.userProfiles || []), profileData],
         lastSync: new Date().toISOString()
       }));
       
       return profileData;
     } catch (error) {
       console.error('Failed to create user profile:', error);
       throw error;
     }
   }, []);
 
   const syncUserPreferences = useCallback(async (request: any): Promise<any> => {
     try {
       if (!request.userId) {
         throw new Error('User ID is required to sync preferences');
       }
       
       // Real implementation: Sync preferences across devices
       const syncResult = await userManagementAPI.syncPreferencesAcrossDevices({
         userId: request.userId,
         preferences: request.preferences,
         deviceId: request.deviceId,
         timestamp: new Date().toISOString(),
         action: 'sync'
       });
       
       // Update local state
       setState(prevState => ({
         ...prevState,
         userPreferences: request.preferences,
         lastSync: new Date().toISOString()
       }));
       
       return syncResult;
     } catch (error) {
       console.error('Failed to sync user preferences:', error);
       throw error;
     }
   }, []);

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setState(prevState => ({ ...prevState, isConnected: false }));
      
      // Fetch all user management data
      const promises = [
        userManagementAPI.getCurrentUser(),
        userManagementAPI.getUserRoles(),
        userManagementAPI.getUserPermissions(),
        userManagementAPI.getAvailableRoles(),
        userManagementAPI.getAvailablePermissions(),
        userManagementAPI.getAPIKeys(),
        userManagementAPI.getAccessRequests(),
        userManagementAPI.getUserPreferences(),
        userManagementAPI.getNotificationSettings()
      ];

      if (includeAnalytics) {
        promises.push(
          userManagementAPI.getUserAnalytics(),
          userManagementAPI.getActivitySummary(),
          userManagementAPI.getUsageStatistics()
        );
      }

      const [
        currentUser,
        userRoles,
        userPermissions,
        availableRoles,
        availablePermissions,
        apiKeys,
        accessRequests,
        userPreferences,
        notificationSettings,
        ...analyticsData
      ] = await Promise.all(promises);

        // Normalize potentially non-array payloads to arrays to avoid runtime errors
      const apiKeysArray = Array.isArray(apiKeys)
        ? apiKeys
        : (apiKeys && Array.isArray((apiKeys as any).items) ? (apiKeys as any).items : []);
      const accessRequestsArray = Array.isArray(accessRequests)
        ? accessRequests
        : (accessRequests && Array.isArray((accessRequests as any).items) ? (accessRequests as any).items : []);

      setState(prevState => ({
        ...prevState,
        currentUser,
        userRoles,
        userPermissions,
        availableRoles,
        availablePermissions,
        apiKeys: apiKeysArray,
        activeAPIKeys: apiKeysArray.filter((key: any) => key && key.status === 'active'),
        accessRequests: accessRequestsArray,
        pendingAccessRequests: accessRequestsArray.filter((req: any) => req && req.status === 'pending'),
        userPreferences,
        notificationSettings,
        userAnalytics: includeAnalytics ? analyticsData[0] : null,
        activitySummary: includeAnalytics ? analyticsData[1] : {},
        usageStatistics: includeAnalytics ? analyticsData[2] : {},
        isAuthenticated: !!currentUser,
        authenticationStatus: currentUser ? 'authenticated' : 'unauthenticated',
        isConnected: true,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to refresh user management data:', error);
      setState(prevState => ({ ...prevState, isConnected: false }));
      throw error;
    }
  }, [includeAnalytics]);

  const disconnect = useCallback((): void => {
    if (enableRealTime) {
      userManagementAPI.unsubscribeFromEvents();
    }
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setState(prevState => ({
      ...prevState,
      isConnected: false,
      websocketConnected: false
    }));
  }, [enableRealTime]);

  const reconnect = useCallback(async (): Promise<void> => {
    disconnect();
    
    if (autoConnect) {
      try {
        await refresh();
        
        if (enableRealTime) {
          userManagementAPI.subscribeToEvents(handleUserManagementEvent);
        }
        
        // Set up refresh interval
        refreshIntervalRef.current = setInterval(refresh, refreshInterval);
        
        setState(prevState => ({
          ...prevState,
          websocketConnected: enableRealTime
        }));
      } catch (error) {
        console.error('Failed to reconnect:', error);
        
        // Retry with exponential backoff
        if (retryAttempts > 0) {
          retryTimeoutRef.current = setTimeout(() => {
            reconnect();
          }, Math.min(30000, 1000 * Math.pow(2, 3 - retryAttempts)));
        }
      }
    }
  }, [autoConnect, enableRealTime, refresh, refreshInterval, retryAttempts, handleUserManagementEvent, disconnect]);

  const exportUserData = useCallback(async (format: 'json' | 'csv'): Promise<Blob> => {
    try {
      return await userManagementAPI.exportUserData(format);
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initialize user management connection
  useEffect(() => {
    if (autoConnect) {
      reconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, reconnect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // =============================================================================
  // MEMOIZED OPERATIONS
  // =============================================================================

  const operations = useMemo<UserManagementHookOperations>(() => ({
    updateUserProfile,
    changePassword,
    updateAvatar,
    deleteAccount,
    login,
    logout,
    refreshToken,
    setupMFA,
    enableMFA,
    disableMFA,
    createAPIKey,
    revokeAPIKey,
    regenerateAPIKey,
    updateAPIKeyPermissions,
    requestRole,
    requestPermission,
    revokeRole,
    revokePermission,
    requestCrossGroupAccess,
    approvePendingRequest,
    denyPendingRequest,
    getCrossGroupAccess,
    updateUserPreferences,
    updateNotificationSettings,
    updateThemePreferences,
    updateLayoutPreferences,
    resetPreferences,
    getSecurityAudit,
    getSecurityLogs,
    getComplianceStatus,
    generateSecurityReport,
    getRBACVisualization,
    getRoleHierarchy,
    getPermissionMatrix,
    visualizeUserAccess,
    getUserAnalytics,
    getActivitySummary,
    getUsageStatistics,
    getUserProfiles,
    createUserProfile,
    syncUserPreferences,
    refresh,
    disconnect,
    reconnect,
    exportUserData
    ,
    // Access checks
    checkUserAccess: (permission: string): boolean => {
      const roles = state.userRoles || [];
      const permissions = state.userPermissions || [] as any[];
      // Allow simple checks like 'spa:rbac-system' or role names
      const hasPermission = permissions.some((p: any) => p?.name === permission || p === permission);
      const hasRole = roles.some((r: any) => r?.name === permission || r === permission);
      return hasPermission || hasRole;
    }
  }), [
    updateUserProfile,
    changePassword,
    updateAvatar,
    deleteAccount,
    login,
    logout,
    refreshToken,
    setupMFA,
    enableMFA,
    disableMFA,
    createAPIKey,
    revokeAPIKey,
    regenerateAPIKey,
    updateAPIKeyPermissions,
    requestRole,
    requestPermission,
    revokeRole,
    revokePermission,
    requestCrossGroupAccess,
    approvePendingRequest,
    denyPendingRequest,
    getCrossGroupAccess,
    updateUserPreferences,
    updateNotificationSettings,
    updateThemePreferences,
    updateLayoutPreferences,
    resetPreferences,
    getSecurityAudit,
    getSecurityLogs,
    getComplianceStatus,
    generateSecurityReport,
    getRBACVisualization,
    getRoleHierarchy,
    getPermissionMatrix,
    visualizeUserAccess,
    getUserAnalytics,
    getActivitySummary,
    getUsageStatistics,
    getUserProfiles,
    createUserProfile,
    syncUserPreferences,
    refresh,
    disconnect,
    reconnect,
    exportUserData
  ]);

  return [state, operations];
};

export default useUserManagement;
