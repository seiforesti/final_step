// ============================================================================
// RBAC INTEGRATION HOOK - CLASSIFICATIONS GROUP
// Advanced RBAC utility integration for Classifications management
// Enterprise-grade permission management for classification workflows
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Types based on RBAC architecture
interface User {
  id: number
  email: string
  username?: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  mfaEnabled: boolean
  role: string
  roles: Role[]
  groups: Group[]
  sessions: Session[]
  department?: string
  region?: string
}

interface Role {
  id: number
  name: string
  description?: string
  permissions: Permission[]
  inheritedRoles?: Role[]
}

interface Permission {
  id: number
  name: string
  resource: string
  action: string
  conditions?: any
}

interface Group {
  id: number
  name: string
  description?: string
  members: User[]
}

interface Session {
  id: string
  userId: number
  token: string
  expiresAt: string
  isActive: boolean
}

interface RBACState {
  currentUser: User | null
  permissions: string[]
  roles: Role[]
  groups: Group[]
  loading: boolean
  error: string | null
}

interface PermissionCheckOptions {
  resource?: string
  action?: string
  conditions?: any
  strictMode?: boolean
}

// API Configuration
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || 'http://localhost:3000/proxy'

const rbacApi = axios.create({
  baseURL: `${API_BASE_URL}/rbac`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Add auth interceptor
rbacApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || 
                sessionStorage.getItem('session_token') ||
                document.cookie.split('; ')
                  .find(row => row.startsWith('session_token='))
                  ?.split('=')[1]
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// RBAC API functions
const rbacApiFunctions = {
  // Authentication
  getCurrentUser: async (): Promise<User> => {
    const response = await rbacApi.get('/me')
    return response.data
  },

  // User management
  getUsers: async (): Promise<User[]> => {
    const response = await rbacApi.get('/users')
    return response.data
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await rbacApi.get(`/users/${id}`)
    return response.data
  },

  // Role management
  getUserRoles: async (userId: number): Promise<Role[]> => {
    const response = await rbacApi.get(`/users/${userId}/roles`)
    return response.data
  },

  getRoles: async (): Promise<Role[]> => {
    const response = await rbacApi.get('/roles')
    return response.data
  },

  // Permission management
  getUserPermissions: async (userId: number): Promise<Permission[]> => {
    const response = await rbacApi.get(`/users/${userId}/permissions`)
    return response.data
  },

  getUserEffectivePermissions: async (userId: number): Promise<any[]> => {
    const response = await rbacApi.get(`/user/permissions`)
    return response.data
  },

  checkUserPermission: async (userId: number, permission: string, options?: PermissionCheckOptions): Promise<boolean> => {
    const response = await rbacApi.post(`/users/${userId}/check-permission`, {
      permission,
      ...options
    })
    return response.data.hasPermission
  },

  // Audit logging
  logAction: async (action: string, resourceType: string, resourceId?: number, details?: any): Promise<void> => {
    await rbacApi.post('/audit/log', {
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      timestamp: new Date().toISOString()
    })
  },

  getAuditLogs: async (filters?: any): Promise<any[]> => {
    const response = await rbacApi.get('/audit/logs', { params: filters })
    return response.data
  }
}

// Classifications specific permissions
export const CLASSIFICATION_PERMISSIONS = {
  // Framework Management
  FRAMEWORKS: {
    VIEW: 'classification.frameworks.view',
    CREATE: 'classification.frameworks.create',
    EDIT: 'classification.frameworks.edit',
    DELETE: 'classification.frameworks.delete',
    MANAGE: 'classification.frameworks.manage',
    ACTIVATE: 'classification.frameworks.activate',
    DEACTIVATE: 'classification.frameworks.deactivate',
    EXPORT: 'classification.frameworks.export',
    IMPORT: 'classification.frameworks.import',
    DUPLICATE: 'classification.frameworks.duplicate'
  },
  
  // Rule Management
  RULES: {
    VIEW: 'classification.rules.view',
    CREATE: 'classification.rules.create',
    EDIT: 'classification.rules.edit',
    DELETE: 'classification.rules.delete',
    MANAGE: 'classification.rules.manage',
    TEST: 'classification.rules.test',
    DEPLOY: 'classification.rules.deploy',
    VALIDATE: 'classification.rules.validate',
    BULK_OPERATIONS: 'classification.rules.bulk_operations'
  },
  
  // Policy Management
  POLICIES: {
    VIEW: 'classification.policies.view',
    CREATE: 'classification.policies.create',
    EDIT: 'classification.policies.edit',
    DELETE: 'classification.policies.delete',
    MANAGE: 'classification.policies.manage',
    APPROVE: 'classification.policies.approve',
    ENFORCE: 'classification.policies.enforce'
  },
  
  // ML Operations
  ML: {
    VIEW_MODELS: 'classification.ml.view_models',
    CREATE_MODELS: 'classification.ml.create_models',
    TRAIN_MODELS: 'classification.ml.train_models',
    DEPLOY_MODELS: 'classification.ml.deploy_models',
    MANAGE_EXPERIMENTS: 'classification.ml.manage_experiments',
    VIEW_ANALYTICS: 'classification.ml.view_analytics',
    OPTIMIZE_HYPERPARAMETERS: 'classification.ml.optimize_hyperparameters',
    FEATURE_ENGINEERING: 'classification.ml.feature_engineering',
    MONITOR_DRIFT: 'classification.ml.monitor_drift',
    MANAGE_ENSEMBLES: 'classification.ml.manage_ensembles'
  },
  
  // AI Operations
  AI: {
    VIEW_INTELLIGENCE: 'classification.ai.view_intelligence',
    MANAGE_AGENTS: 'classification.ai.manage_agents',
    CREATE_CONVERSATIONS: 'classification.ai.create_conversations',
    VIEW_REASONING: 'classification.ai.view_reasoning',
    MANAGE_KNOWLEDGE: 'classification.ai.manage_knowledge',
    AUTO_TAGGING: 'classification.ai.auto_tagging',
    WORKLOAD_OPTIMIZATION: 'classification.ai.workload_optimization',
    REAL_TIME_STREAMING: 'classification.ai.real_time_streaming'
  },
  
  // Orchestration & Workflows
  WORKFLOWS: {
    VIEW: 'classification.workflows.view',
    CREATE: 'classification.workflows.create',
    EXECUTE: 'classification.workflows.execute',
    MANAGE: 'classification.workflows.manage',
    MONITOR: 'classification.workflows.monitor',
    COORDINATE: 'classification.workflows.coordinate'
  },
  
  // Audit & Compliance
  AUDIT: {
    VIEW: 'classification.audit.view',
    EXPORT: 'classification.audit.export',
    MANAGE: 'classification.audit.manage',
    COMPLIANCE_REPORTS: 'classification.audit.compliance_reports'
  },
  
  // Business Intelligence
  BUSINESS_INTELLIGENCE: {
    VIEW: 'classification.bi.view',
    CREATE_DASHBOARDS: 'classification.bi.create_dashboards',
    MANAGE_METRICS: 'classification.bi.manage_metrics',
    EXPORT_REPORTS: 'classification.bi.export_reports'
  },
  
  // Bulk Operations
  BULK: {
    OPERATIONS: 'classification.bulk.operations',
    IMPORT: 'classification.bulk.import',
    EXPORT: 'classification.bulk.export',
    DELETE: 'classification.bulk.delete'
  },
  
  // Administration
  ADMIN: {
    SYSTEM_CONFIG: 'classification.admin.system_config',
    USER_MANAGEMENT: 'classification.admin.user_management',
    PERFORMANCE_TUNING: 'classification.admin.performance_tuning',
    MAINTENANCE: 'classification.admin.maintenance'
  }
} as const

// Main Classifications RBAC Integration Hook
export function useClassificationsRBAC() {
  const queryClient = useQueryClient()
  const [rbacState, setRBACState] = useState<RBACState>({
    currentUser: null,
    permissions: [],
    roles: [],
    groups: [],
    loading: true,
    error: null
  })

  // Current user query
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['rbac', 'currentUser'],
    queryFn: rbacApiFunctions.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  })

  // User permissions query
  const { data: userPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['rbac', 'permissions', currentUser?.id],
    queryFn: () => currentUser ? rbacApiFunctions.getUserEffectivePermissions(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000
  })

  // Update RBAC state when data changes
  useEffect(() => {
    setRBACState(prev => ({
      ...prev,
      currentUser: currentUser || null,
      permissions: userPermissions?.map(p => p.action) || [],
      loading: userLoading || permissionsLoading,
      error: userError ? String(userError) : null
    }))
  }, [currentUser, userPermissions, userLoading, permissionsLoading, userError])

  // Permission checking function
  const hasPermission = useCallback((permission: string, options?: PermissionCheckOptions): boolean => {
    if (!currentUser || rbacState.loading) return false
    
    // Check if user has the specific permission
    const hasDirectPermission = rbacState.permissions.includes(permission)
    
    // Check admin override
    const isAdmin = rbacState.permissions.includes('admin.*') || 
                   currentUser.role === 'admin'
    
    if (options?.strictMode && !hasDirectPermission) {
      return false
    }
    
    return hasDirectPermission || isAdmin
  }, [currentUser, rbacState.permissions, rbacState.loading])

  // Role checking function
  const hasRole = useCallback((roleName: string): boolean => {
    if (!currentUser) return false
    return currentUser.roles.some(role => role.name === roleName) || 
           currentUser.role === roleName
  }, [currentUser])

  // Resource access checking
  const canAccess = useCallback((resource: string, action: string, resourceId?: number): boolean => {
    const permission = `${resource}.${action}`
    return hasPermission(permission, { resource, action })
  }, [hasPermission])

  // Audit logging mutation
  const logActionMutation = useMutation({
    mutationFn: ({ action, resourceType, resourceId, details }: {
      action: string
      resourceType: string
      resourceId?: number
      details?: any
    }) => rbacApiFunctions.logAction(action, resourceType, resourceId, details),
    onError: (error) => {
      console.error('Failed to log RBAC action:', error)
    }
  })

  // Log user action with audit trail
  const logUserAction = useCallback(async (
    action: string, 
    resourceType: string = 'classification', 
    resourceId?: number, 
    details?: any
  ) => {
    if (!currentUser) return
    
    try {
      await logActionMutation.mutateAsync({
        action,
        resourceType,
        resourceId,
        details: {
          userId: currentUser.id,
          username: currentUser.username || currentUser.email,
          timestamp: new Date().toISOString(),
          ...details
        }
      })
    } catch (error) {
      console.error('Failed to log user action:', error)
    }
  }, [currentUser, logActionMutation])

  // Permission-based component renderer
  // To keep this file as .ts (no JSX), expose a renderer function returning a boolean
  const canRender = useCallback((permission: string) => {
    if (rbacState.loading) return false
    return hasPermission(permission)
  }, [hasPermission, rbacState.loading])

  // Classifications specific permission helpers
  const classificationPermissions = useMemo(() => ({
    // Framework permissions
    canViewFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.VIEW),
    canCreateFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.CREATE),
    canEditFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.EDIT),
    canDeleteFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.DELETE),
    canManageFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.MANAGE),
    canActivateFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.ACTIVATE),
    canDeactivateFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.DEACTIVATE),
    canExportFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.EXPORT),
    canImportFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.IMPORT),
    canDuplicateFrameworks: hasPermission(CLASSIFICATION_PERMISSIONS.FRAMEWORKS.DUPLICATE),

    // Rule permissions
    canViewRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.VIEW),
    canCreateRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.CREATE),
    canEditRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.EDIT),
    canDeleteRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.DELETE),
    canManageRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.MANAGE),
    canTestRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.TEST),
    canDeployRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.DEPLOY),
    canValidateRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.VALIDATE),
    canBulkOperateRules: hasPermission(CLASSIFICATION_PERMISSIONS.RULES.BULK_OPERATIONS),

    // Policy permissions
    canViewPolicies: hasPermission(CLASSIFICATION_PERMISSIONS.POLICIES.VIEW),
    canCreatePolicies: hasPermission(CLASSIFICATION_PERMISSIONS.POLICIES.CREATE),
    canEditPolicies: hasPermission(CLASSIFICATION_PERMISSIONS.POLICIES.EDIT),
    canDeletePolicies: hasPermission(CLASSIFICATION_PERMISSIONS.POLICIES.DELETE),
    canManagePolicies: hasPermission(CLASSIFICATION_PERMISSIONS.POLICIES.MANAGE),
    canApprovePolicies: hasPermission(CLASSIFICATION_PERMISSIONS.POLICIES.APPROVE),
    canEnforcePolicies: hasPermission(CLASSIFICATION_PERMISSIONS.POLICIES.ENFORCE),

    // ML permissions
    canViewMLModels: hasPermission(CLASSIFICATION_PERMISSIONS.ML.VIEW_MODELS),
    canCreateMLModels: hasPermission(CLASSIFICATION_PERMISSIONS.ML.CREATE_MODELS),
    canTrainMLModels: hasPermission(CLASSIFICATION_PERMISSIONS.ML.TRAIN_MODELS),
    canDeployMLModels: hasPermission(CLASSIFICATION_PERMISSIONS.ML.DEPLOY_MODELS),
    canManageMLExperiments: hasPermission(CLASSIFICATION_PERMISSIONS.ML.MANAGE_EXPERIMENTS),
    canViewMLAnalytics: hasPermission(CLASSIFICATION_PERMISSIONS.ML.VIEW_ANALYTICS),
    canOptimizeHyperparameters: hasPermission(CLASSIFICATION_PERMISSIONS.ML.OPTIMIZE_HYPERPARAMETERS),
    canFeatureEngineering: hasPermission(CLASSIFICATION_PERMISSIONS.ML.FEATURE_ENGINEERING),
    canMonitorDrift: hasPermission(CLASSIFICATION_PERMISSIONS.ML.MONITOR_DRIFT),
    canManageEnsembles: hasPermission(CLASSIFICATION_PERMISSIONS.ML.MANAGE_ENSEMBLES),

    // AI permissions
    canViewAIIntelligence: hasPermission(CLASSIFICATION_PERMISSIONS.AI.VIEW_INTELLIGENCE),
    canManageAIAgents: hasPermission(CLASSIFICATION_PERMISSIONS.AI.MANAGE_AGENTS),
    canCreateConversations: hasPermission(CLASSIFICATION_PERMISSIONS.AI.CREATE_CONVERSATIONS),
    canViewReasoning: hasPermission(CLASSIFICATION_PERMISSIONS.AI.VIEW_REASONING),
    canManageKnowledge: hasPermission(CLASSIFICATION_PERMISSIONS.AI.MANAGE_KNOWLEDGE),
    canAutoTagging: hasPermission(CLASSIFICATION_PERMISSIONS.AI.AUTO_TAGGING),
    canWorkloadOptimization: hasPermission(CLASSIFICATION_PERMISSIONS.AI.WORKLOAD_OPTIMIZATION),
    canRealTimeStreaming: hasPermission(CLASSIFICATION_PERMISSIONS.AI.REAL_TIME_STREAMING),

    // Workflow permissions
    canViewWorkflows: hasPermission(CLASSIFICATION_PERMISSIONS.WORKFLOWS.VIEW),
    canCreateWorkflows: hasPermission(CLASSIFICATION_PERMISSIONS.WORKFLOWS.CREATE),
    canExecuteWorkflows: hasPermission(CLASSIFICATION_PERMISSIONS.WORKFLOWS.EXECUTE),
    canManageWorkflows: hasPermission(CLASSIFICATION_PERMISSIONS.WORKFLOWS.MANAGE),
    canMonitorWorkflows: hasPermission(CLASSIFICATION_PERMISSIONS.WORKFLOWS.MONITOR),
    canCoordinateWorkflows: hasPermission(CLASSIFICATION_PERMISSIONS.WORKFLOWS.COORDINATE),

    // Audit permissions
    canViewAudit: hasPermission(CLASSIFICATION_PERMISSIONS.AUDIT.VIEW),
    canExportAudit: hasPermission(CLASSIFICATION_PERMISSIONS.AUDIT.EXPORT),
    canManageAudit: hasPermission(CLASSIFICATION_PERMISSIONS.AUDIT.MANAGE),
    canViewComplianceReports: hasPermission(CLASSIFICATION_PERMISSIONS.AUDIT.COMPLIANCE_REPORTS),

    // Business Intelligence permissions
    canViewBI: hasPermission(CLASSIFICATION_PERMISSIONS.BUSINESS_INTELLIGENCE.VIEW),
    canCreateDashboards: hasPermission(CLASSIFICATION_PERMISSIONS.BUSINESS_INTELLIGENCE.CREATE_DASHBOARDS),
    canManageMetrics: hasPermission(CLASSIFICATION_PERMISSIONS.BUSINESS_INTELLIGENCE.MANAGE_METRICS),
    canExportReports: hasPermission(CLASSIFICATION_PERMISSIONS.BUSINESS_INTELLIGENCE.EXPORT_REPORTS),

    // Bulk operations
    canBulkOperations: hasPermission(CLASSIFICATION_PERMISSIONS.BULK.OPERATIONS),
    canBulkImport: hasPermission(CLASSIFICATION_PERMISSIONS.BULK.IMPORT),
    canBulkExport: hasPermission(CLASSIFICATION_PERMISSIONS.BULK.EXPORT),
    canBulkDelete: hasPermission(CLASSIFICATION_PERMISSIONS.BULK.DELETE),

    // Admin permissions
    canSystemConfig: hasPermission(CLASSIFICATION_PERMISSIONS.ADMIN.SYSTEM_CONFIG),
    canUserManagement: hasPermission(CLASSIFICATION_PERMISSIONS.ADMIN.USER_MANAGEMENT),
    canPerformanceTuning: hasPermission(CLASSIFICATION_PERMISSIONS.ADMIN.PERFORMANCE_TUNING),
    canMaintenance: hasPermission(CLASSIFICATION_PERMISSIONS.ADMIN.MAINTENANCE)
  }), [hasPermission])

  // Refresh user data
  const refreshUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rbac', 'currentUser'] })
    if (currentUser?.id) {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions', currentUser.id] })
    }
  }, [queryClient, currentUser?.id])

  return {
    // State
    ...rbacState,
    
    // User data
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading: rbacState.loading,
    
    // Permission checking
    hasPermission,
    hasRole,
    canAccess,
    classificationPermissions,
    
    // Audit logging
    logUserAction,
    
    // Components
    canRender,
    
    // Actions
    refreshUser,
    
    // API functions (for advanced usage)
    api: rbacApiFunctions
  }
}

// Context provider for Classifications RBAC data
import { createContext, useContext } from 'react'

const ClassificationsRBACContext = createContext<ReturnType<typeof useClassificationsRBAC> | null>(null)

export function ClassificationsRBACProvider({ children }: { children: React.ReactNode }) {
  const rbacData = useClassificationsRBAC()
  
  return (
    <ClassificationsRBACContext.Provider value={rbacData}>
      {children}
    </ClassificationsRBACContext.Provider>
  )
}

export function useClassificationsRBACContext() {
  const context = useContext(ClassificationsRBACContext)
  if (!context) {
    throw new Error('useClassificationsRBACContext must be used within a ClassificationsRBACProvider')
  }
  return context
}

// CLASSIFICATION_PERMISSIONS is already exported above

// Export types
export type { User, Role, Permission, Group, Session, RBACState, PermissionCheckOptions }