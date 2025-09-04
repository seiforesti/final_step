// useRBACSystem Hook - Advanced RBAC System Integration and Orchestration
// Integrates with existing Advanced_RBAC_Datagovernance_System SPA for racine-level coordination

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import existing RBAC services
import { userManagementAPI } from '../services/user-management-apis';
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis';

// Import types
import type {
  RBACUser,
  RBACRole,
  RBACPermission,
  RBACGroup,
  RBACResource,
  RBACPolicy,
  RBACCondition,
  RBACAccessRequest,
  RBACAuditLog,
  RBACConfiguration,
  RBACMetrics,
  RBACAnalytics,
  RBACCoordination,
  RacineResponse,
  APIError,
  WorkspaceContext,
  UserPermissions
} from '../types';

// Import utilities
import { rbacUtils } from '../utils/rbac-utils';
import { coordinateServices, validateIntegration, optimizeExecution, handleErrors } from '../utils/cross-group-orchestrator';
import { securityUtils } from '../utils/security-utils';

/**
 * Comprehensive RBAC system state interface
 */
export interface RBACSystemState {
  // Core RBAC entities
  users: RBACUser[];
  roles: RBACRole[];
  permissions: RBACPermission[];
  groups: RBACGroup[];
  resources: RBACResource[];
  policies: RBACPolicy[];
  conditions: RBACCondition[];
  
  // Access management
  accessRequests: RBACAccessRequest[];
  pendingApprovals: RBACAccessRequest[];
  activeAccessSessions: any[];
  
  // Audit and compliance
  auditLogs: RBACAuditLog[];
  complianceStatus: {
    overallScore: number;
    violations: any[];
    recommendations: string[];
  };
  
  // System metrics
  metrics: RBACMetrics | null;
  analytics: RBACAnalytics | null;
  
  // Cross-group coordination
  coordination: {
    crossGroupPolicies: RBACPolicy[];
    workspaceAccessControl: Record<string, RBACConfiguration>;
    collaborativeAccess: any[];
  };
  
  // Current user context
  currentUser: RBACUser | null;
  currentPermissions: RBACPermission[];
  currentRoles: RBACRole[];
  
  // Loading and error states
  isLoading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * RBAC system management methods interface
 */
export interface RBACSystemMethods {
  // User management
  createUser: (user: Partial<RBACUser>) => Promise<RBACUser>;
  updateUser: (id: string, updates: Partial<RBACUser>) => Promise<RBACUser>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => Promise<RBACUser>;
  
  // Role management
  createRole: (role: Partial<RBACRole>) => Promise<RBACRole>;
  updateRole: (id: string, updates: Partial<RBACRole>) => Promise<RBACRole>;
  deleteRole: (id: string) => Promise<void>;
  assignRoleToUser: (userId: string, roleId: string) => Promise<void>;
  revokeRoleFromUser: (userId: string, roleId: string) => Promise<void>;
  
  // Permission management
  createPermission: (permission: Partial<RBACPermission>) => Promise<RBACPermission>;
  updatePermission: (id: string, updates: Partial<RBACPermission>) => Promise<RBACPermission>;
  deletePermission: (id: string) => Promise<void>;
  assignPermissionToRole: (roleId: string, permissionId: string) => Promise<void>;
  
  // Group management
  createGroup: (group: Partial<RBACGroup>) => Promise<RBACGroup>;
  updateGroup: (id: string, updates: Partial<RBACGroup>) => Promise<RBACGroup>;
  deleteGroup: (id: string) => Promise<void>;
  addUserToGroup: (groupId: string, userId: string) => Promise<void>;
  removeUserFromGroup: (groupId: string, userId: string) => Promise<void>;
  
  // Policy management
  createPolicy: (policy: Partial<RBACPolicy>) => Promise<RBACPolicy>;
  updatePolicy: (id: string, updates: Partial<RBACPolicy>) => Promise<RBACPolicy>;
  deletePolicy: (id: string) => Promise<void>;
  evaluatePolicy: (policyId: string, context: any) => Promise<boolean>;
  
  // Access control
  checkPermission: (userId: string, resource: string, action: string) => Promise<boolean>;
  requestAccess: (request: Partial<RBACAccessRequest>) => Promise<RBACAccessRequest>;
  approveAccessRequest: (requestId: string) => Promise<void>;
  denyAccessRequest: (requestId: string, reason: string) => Promise<void>;
  
  // Cross-group coordination
  coordinateCrossGroupAccess: (coordination: RBACCoordination) => Promise<void>;
  getWorkspaceAccessControl: (workspaceId: string) => Promise<RBACConfiguration>;
  updateWorkspaceAccessControl: (workspaceId: string, config: RBACConfiguration) => Promise<void>;
  
  // Audit and compliance
  getAuditLogs: (filters?: any) => Promise<RBACAuditLog[]>;
  generateComplianceReport: (options?: any) => Promise<Blob>;
  validateCompliance: () => Promise<any>;
  
  // Analytics and insights
  getRBACAnalytics: (period?: string) => Promise<RBACAnalytics>;
  getUserAccessPatterns: (userId: string) => Promise<any>;
  getPermissionUsageAnalytics: () => Promise<any>;
  
  // Utility methods
  refreshRBACSystem: () => Promise<void>;
  exportRBACConfiguration: () => Promise<Blob>;
  importRBACConfiguration: (config: any) => Promise<void>;
}

/**
 * Hook options interface
 */
export interface UseRBACSystemOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  workspaceId?: string;
  enableAudit?: boolean;
  enableAnalytics?: boolean;
  enableCoordination?: boolean;
}

/**
 * Main hook return interface
 */
export interface UseRBACSystemReturn extends RBACSystemState, RBACSystemMethods {
  // Query states
  isRefreshing: boolean;
  lastUpdated: Date | null;
  
  // Advanced features
  compliance: {
    score: number;
    violations: any[];
    recommendations: string[];
    generateReport: () => Promise<Blob>;
  };
  
  // Analytics
  analytics: {
    userActivityTrends: any[];
    permissionUsageMetrics: any[];
    accessPatterns: any[];
    generateInsights: () => Promise<RBACAnalytics>;
  };
  
  // Integration status
  integrationStatus: {
    existingSPAConnected: boolean;
    crossGroupEnabled: boolean;
    workspaceIntegrated: boolean;
    auditEnabled: boolean;
  };
  
  // Permission utilities
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  canAccess: (resource: string) => boolean;
}

/**
 * Advanced RBAC System Hook with racine-level orchestration
 */
export function useRBACSystem(options: UseRBACSystemOptions = {}): UseRBACSystemReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTime = true,
    workspaceId,
    enableAudit = true,
    enableAnalytics = true,
    enableCoordination = true
  } = options;

  const queryClient = useQueryClient();
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  // Current user query
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['rbac', 'currentUser'],
    queryFn: () => userManagementAPI.getCurrentUser(),
    enabled: true
  });

  // Users query
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['rbac', 'users', workspaceId],
    queryFn: () => userManagementAPI.getUsers(workspaceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Roles query
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    refetch: refetchRoles
  } = useQuery({
    queryKey: ['rbac', 'roles', workspaceId],
    queryFn: () => userManagementAPI.getRoles(workspaceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Permissions query
  const {
    data: permissions = [],
    isLoading: isLoadingPermissions,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: ['rbac', 'permissions', workspaceId],
    queryFn: () => userManagementAPI.getPermissions(workspaceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Groups query
  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['rbac', 'groups', workspaceId],
    queryFn: () => userManagementAPI.getGroups(workspaceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Resources query
  const {
    data: resources = [],
    isLoading: isLoadingResources,
    refetch: refetchResources
  } = useQuery({
    queryKey: ['rbac', 'resources', workspaceId],
    queryFn: () => userManagementAPI.getResources(workspaceId),
    enabled: true
  });

  // Policies query
  const {
    data: policies = [],
    isLoading: isLoadingPolicies,
    refetch: refetchPolicies
  } = useQuery({
    queryKey: ['rbac', 'policies', workspaceId],
    queryFn: () => userManagementAPI.getPolicies(workspaceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Access requests query
  const {
    data: accessRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests
  } = useQuery({
    queryKey: ['rbac', 'accessRequests', workspaceId],
    queryFn: () => userManagementAPI.getAccessRequests(workspaceId),
    refetchInterval: autoRefresh ? 10000 : false,
    enabled: true
  });

  // Audit logs query
  const {
    data: auditLogs = [],
    refetch: refetchAuditLogs
  } = useQuery({
    queryKey: ['rbac', 'auditLogs', workspaceId],
    queryFn: () => userManagementAPI.getAuditLogs(workspaceId),
    enabled: enableAudit
  });

  // RBAC metrics query
  const {
    data: metrics,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['rbac', 'metrics', workspaceId],
    queryFn: () => userManagementAPI.getRBACMetrics(workspaceId),
    enabled: enableAnalytics,
    refetchInterval: autoRefresh ? refreshInterval * 2 : false
  });

  // Cross-group coordination query
  const {
    data: crossGroupPolicies = [],
    refetch: refetchCoordination
  } = useQuery({
    queryKey: ['rbac', 'crossGroup', workspaceId],
    queryFn: () => racineOrchestrationAPI.getCrossGroupRBACPolicies(workspaceId),
    enabled: enableCoordination,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // User management mutations
  const createUserMutation = useMutation({
    mutationFn: (user: Partial<RBACUser>) => userManagementAPI.createUser(user, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
    },
    onError: (error: APIError) => setError(error)
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RBACUser> }) =>
      userManagementAPI.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
    },
    onError: (error: APIError) => setError(error)
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userManagementAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
    },
    onError: (error: APIError) => setError(error)
  });

  // Role management mutations
  const createRoleMutation = useMutation({
    mutationFn: (role: Partial<RBACRole>) => userManagementAPI.createRole(role, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userManagementAPI.assignRoleToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
    }
  });

  // Permission management mutations
  const createPermissionMutation = useMutation({
    mutationFn: (permission: Partial<RBACPermission>) =>
      userManagementAPI.createPermission(permission, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions'] });
    }
  });

  // Access request mutations
  const requestAccessMutation = useMutation({
    mutationFn: (request: Partial<RBACAccessRequest>) =>
      userManagementAPI.requestAccess(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'accessRequests'] });
    }
  });

  const approveAccessMutation = useMutation({
    mutationFn: (requestId: string) => userManagementAPI.approveAccessRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'accessRequests'] });
    }
  });

  // Cross-group coordination mutation
  const coordinateCrossGroupMutation = useMutation({
    mutationFn: (coordination: RBACCoordination) =>
      racineOrchestrationAPI.coordinateCrossGroupRBAC(coordination),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'crossGroup'] });
    }
  });

  // Initialize RBAC system integration
  useEffect(() => {
    const initializeRBACSystem = async () => {
      try {
        // Initialize integration with existing RBAC SPA
        await racineOrchestrationAPI.initializeRBACIntegration(workspaceId);
        
        // Set up cross-group coordination if enabled
        if (enableCoordination) {
          await crossGroupOrchestrator.initializeRBACCoordination(workspaceId);
        }
        
        setIsInitialized(true);
      } catch (error) {
        setError(error as APIError);
      }
    };

    initializeRBACSystem();
  }, [workspaceId, enableCoordination]);

  // Real-time updates setup
  useEffect(() => {
    if (!enableRealTime || !isInitialized) return;

    const setupRealTimeUpdates = async () => {
      try {
        // Subscribe to RBAC updates
        const rbacUpdatesSubscription = await userManagementAPI.subscribeToRBACUpdates(
          workspaceId,
          (update) => {
            // Handle real-time updates based on type
            switch (update.type) {
              case 'user_update':
                queryClient.invalidateQueries({ queryKey: ['rbac', 'users'] });
                break;
              case 'role_update':
                queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] });
                break;
              case 'permission_update':
                queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions'] });
                break;
              case 'access_request':
                queryClient.invalidateQueries({ queryKey: ['rbac', 'accessRequests'] });
                break;
            }
          }
        );

        subscriptionsRef.current.set('rbacUpdates', rbacUpdatesSubscription);
      } catch (error) {
        console.error('Failed to setup real-time updates:', error);
      }
    };

    setupRealTimeUpdates();

    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, [enableRealTime, isInitialized, workspaceId, queryClient]);

  // Computed state
  const currentPermissions = currentUser?.permissions || [];
  const currentRoles = currentUser?.roles || [];
  const pendingApprovals = accessRequests.filter(req => req.status === 'pending');
  const conditions: RBACCondition[] = []; // Computed from policies
  const activeAccessSessions: any[] = []; // Real-time session data

  const complianceStatus = {
    overallScore: metrics?.complianceScore || 0,
    violations: metrics?.violations || [],
    recommendations: metrics?.recommendations || []
  };

  const coordination = {
    crossGroupPolicies,
    workspaceAccessControl: rbacUtils.extractWorkspaceConfigs(policies),
    collaborativeAccess: [] // Cross-group access sessions
  };

  const isLoading = isLoadingUser || isLoadingUsers || isLoadingRoles || isLoadingPermissions;

  // Methods implementation
  const createUser = useCallback(async (user: Partial<RBACUser>) => {
    const result = await createUserMutation.mutateAsync(user);
    return result;
  }, [createUserMutation]);

  const updateUser = useCallback(async (id: string, updates: Partial<RBACUser>) => {
    const result = await updateUserMutation.mutateAsync({ id, updates });
    return result;
  }, [updateUserMutation]);

  const deleteUser = useCallback(async (id: string) => {
    await deleteUserMutation.mutateAsync(id);
  }, [deleteUserMutation]);

  const getUserById = useCallback(async (id: string) => {
    return await userManagementAPI.getUserById(id);
  }, []);

  const createRole = useCallback(async (role: Partial<RBACRole>) => {
    const result = await createRoleMutation.mutateAsync(role);
    return result;
  }, [createRoleMutation]);

  const updateRole = useCallback(async (id: string, updates: Partial<RBACRole>) => {
    return await userManagementAPI.updateRole(id, updates);
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    await userManagementAPI.deleteRole(id);
    await refetchRoles();
  }, [refetchRoles]);

  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    await assignRoleMutation.mutateAsync({ userId, roleId });
  }, [assignRoleMutation]);

  const revokeRoleFromUser = useCallback(async (userId: string, roleId: string) => {
    await userManagementAPI.revokeRoleFromUser(userId, roleId);
    await refetchUsers();
  }, [refetchUsers]);

  const createPermission = useCallback(async (permission: Partial<RBACPermission>) => {
    const result = await createPermissionMutation.mutateAsync(permission);
    return result;
  }, [createPermissionMutation]);

  const updatePermission = useCallback(async (id: string, updates: Partial<RBACPermission>) => {
    return await userManagementAPI.updatePermission(id, updates);
  }, []);

  const deletePermission = useCallback(async (id: string) => {
    await userManagementAPI.deletePermission(id);
    await refetchPermissions();
  }, [refetchPermissions]);

  const assignPermissionToRole = useCallback(async (roleId: string, permissionId: string) => {
    await userManagementAPI.assignPermissionToRole(roleId, permissionId);
    await refetchRoles();
  }, [refetchRoles]);

  const createGroup = useCallback(async (group: Partial<RBACGroup>) => {
    return await userManagementAPI.createGroup(group, workspaceId);
  }, [workspaceId]);

  const updateGroup = useCallback(async (id: string, updates: Partial<RBACGroup>) => {
    return await userManagementAPI.updateGroup(id, updates);
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    await userManagementAPI.deleteGroup(id);
    await refetchGroups();
  }, [refetchGroups]);

  const addUserToGroup = useCallback(async (groupId: string, userId: string) => {
    await userManagementAPI.addUserToGroup(groupId, userId);
    await refetchGroups();
  }, [refetchGroups]);

  const removeUserFromGroup = useCallback(async (groupId: string, userId: string) => {
    await userManagementAPI.removeUserFromGroup(groupId, userId);
    await refetchGroups();
  }, [refetchGroups]);

  const createPolicy = useCallback(async (policy: Partial<RBACPolicy>) => {
    return await userManagementAPI.createPolicy(policy, workspaceId);
  }, [workspaceId]);

  const updatePolicy = useCallback(async (id: string, updates: Partial<RBACPolicy>) => {
    return await userManagementAPI.updatePolicy(id, updates);
  }, []);

  const deletePolicy = useCallback(async (id: string) => {
    await userManagementAPI.deletePolicy(id);
    await refetchPolicies();
  }, [refetchPolicies]);

  const evaluatePolicy = useCallback(async (policyId: string, context: any) => {
    return await userManagementAPI.evaluatePolicy(policyId, context);
  }, []);

  const checkPermission = useCallback(async (userId: string, resource: string, action: string) => {
    return await userManagementAPI.checkPermission(userId, resource, action);
  }, []);

  const requestAccess = useCallback(async (request: Partial<RBACAccessRequest>) => {
    const result = await requestAccessMutation.mutateAsync(request);
    return result;
  }, [requestAccessMutation]);

  const approveAccessRequest = useCallback(async (requestId: string) => {
    await approveAccessMutation.mutateAsync(requestId);
  }, [approveAccessMutation]);

  const denyAccessRequest = useCallback(async (requestId: string, reason: string) => {
    await userManagementAPI.denyAccessRequest(requestId, reason);
    await refetchRequests();
  }, [refetchRequests]);

  const coordinateCrossGroupAccess = useCallback(async (coordination: RBACCoordination) => {
    await coordinateCrossGroupMutation.mutateAsync(coordination);
  }, [coordinateCrossGroupMutation]);

  const getWorkspaceAccessControl = useCallback(async (workspaceId: string) => {
    return await userManagementAPI.getWorkspaceAccessControl(workspaceId);
  }, []);

  const updateWorkspaceAccessControl = useCallback(async (workspaceId: string, config: RBACConfiguration) => {
    await userManagementAPI.updateWorkspaceAccessControl(workspaceId, config);
  }, []);

  const getAuditLogs = useCallback(async (filters?: any) => {
    return await userManagementAPI.getAuditLogs(workspaceId, filters);
  }, [workspaceId]);

  const generateComplianceReport = useCallback(async (options?: any) => {
    return await userManagementAPI.generateComplianceReport(workspaceId, options);
  }, [workspaceId]);

  const validateCompliance = useCallback(async () => {
    return await userManagementAPI.validateCompliance(workspaceId);
  }, [workspaceId]);

  const getRBACAnalytics = useCallback(async (period?: string) => {
    return await userManagementAPI.getRBACAnalytics(workspaceId, period);
  }, [workspaceId]);

  const getUserAccessPatterns = useCallback(async (userId: string) => {
    return await userManagementAPI.getUserAccessPatterns(userId);
  }, []);

  const getPermissionUsageAnalytics = useCallback(async () => {
    return await userManagementAPI.getPermissionUsageAnalytics(workspaceId);
  }, [workspaceId]);

  const refreshRBACSystem = useCallback(async () => {
    await Promise.all([
      refetchUser(),
      refetchUsers(),
      refetchRoles(),
      refetchPermissions(),
      refetchGroups(),
      refetchPolicies(),
      refetchRequests(),
      refetchAuditLogs(),
      refetchMetrics()
    ]);
  }, [refetchUser, refetchUsers, refetchRoles, refetchPermissions, refetchGroups, refetchPolicies, refetchRequests, refetchAuditLogs, refetchMetrics]);

  const exportRBACConfiguration = useCallback(async () => {
    return await userManagementAPI.exportRBACConfiguration(workspaceId);
  }, [workspaceId]);

  const importRBACConfiguration = useCallback(async (config: any) => {
    await userManagementAPI.importRBACConfiguration(workspaceId, config);
    await refreshRBACSystem();
  }, [workspaceId, refreshRBACSystem]);

  // Permission utilities
  const hasPermission = useCallback((resource: string, action: string) => {
    return rbacUtils.checkUserPermission(currentPermissions, resource, action);
  }, [currentPermissions]);

  const hasRole = useCallback((roleName: string) => {
    return currentRoles.some(role => role.name === roleName);
  }, [currentRoles]);

  const isAdmin = useCallback(() => {
    return hasRole('admin') || hasRole('super_admin');
  }, [hasRole]);

  const canAccess = useCallback((resource: string) => {
    return rbacUtils.checkResourceAccess(currentPermissions, resource);
  }, [currentPermissions]);

  // Advanced features
  const generateInsights = useCallback(async () => {
    return await getRBACAnalytics('30d');
  }, [getRBACAnalytics]);

  // Integration status
  const integrationStatus = {
    existingSPAConnected: isInitialized,
    crossGroupEnabled: enableCoordination && crossGroupPolicies.length > 0,
    workspaceIntegrated: !!workspaceId && isInitialized,
    auditEnabled: enableAudit && auditLogs.length > 0
  };

  return {
    // State
    users,
    roles,
    permissions,
    groups,
    resources,
    policies,
    conditions,
    accessRequests,
    pendingApprovals,
    activeAccessSessions,
    auditLogs,
    complianceStatus,
    metrics,
    coordination,
    currentUser,
    currentPermissions,
    currentRoles,
    isLoading,
    error: error || userError,
    isInitialized,

    // Query states
    isRefreshing: createUserMutation.isPending || updateUserMutation.isPending,
    lastUpdated: new Date(),

    // Core methods
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    revokeRoleFromUser,
    createPermission,
    updatePermission,
    deletePermission,
    assignPermissionToRole,
    createGroup,
    updateGroup,
    deleteGroup,
    addUserToGroup,
    removeUserFromGroup,
    createPolicy,
    updatePolicy,
    deletePolicy,
    evaluatePolicy,
    checkPermission,
    requestAccess,
    approveAccessRequest,
    denyAccessRequest,
    coordinateCrossGroupAccess,
    getWorkspaceAccessControl,
    updateWorkspaceAccessControl,
    getAuditLogs,
    generateComplianceReport,
    validateCompliance,
    getRBACAnalytics,
    getUserAccessPatterns,
    getPermissionUsageAnalytics,
    refreshRBACSystem,
    exportRBACConfiguration,
    importRBACConfiguration,

    // Advanced features
    compliance: {
      score: complianceStatus.overallScore,
      violations: complianceStatus.violations,
      recommendations: complianceStatus.recommendations,
      generateReport: generateComplianceReport
    },
    analytics: {
      userActivityTrends: metrics?.userActivityTrends || [],
      permissionUsageMetrics: metrics?.permissionUsageMetrics || [],
      accessPatterns: metrics?.accessPatterns || [],
      generateInsights
    },
    integrationStatus,

    // Permission utilities
    hasPermission,
    hasRole,
    isAdmin,
    canAccess
  };
}

export default useRBACSystem;
