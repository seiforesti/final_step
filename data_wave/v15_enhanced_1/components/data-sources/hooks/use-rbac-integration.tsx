// ============================================================================
// RBAC INTEGRATION HOOK - DATA SOURCES GROUP
// Advanced RBAC utility integration based on RBAC_Advanced_powerful_architecture_data_governance_system.md
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy'

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
    // Use full URL since this endpoint is under /auth, not /rbac
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('session_token') || document.cookie.split('; ').find(row => row.startsWith('session_token='))?.split('=')[1] || ''}`
      },
      timeout: 10000
    })
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
    const response = await rbacApi.get(`/user/roles`)
    return response.data
  },

  getRoles: async (): Promise<Role[]> => {
    const response = await rbacApi.get('/roles')
    return response.data
  },

  // Permission management
  getUserPermissions: async (userId: number): Promise<Permission[]> => {
    const response = await rbacApi.get(`/user/permissions`)
    return response.data
  },

  getUserEffectivePermissions: async (userId: number): Promise<any[]> => {
    const response = await rbacApi.get(`/user/permissions`)
    return response.data
  },

  checkUserPermission: async (userId: number, permission: string, options?: PermissionCheckOptions): Promise<boolean> => {
    // Use the effective permissions endpoint to check if user has permission
    const response = await rbacApi.get(`/user/permissions`)
    const permissions = response.data.permissions || []
    return permissions.includes(permission)
  },

  // Audit logging
  logAction: async (action: string, resourceType: string, resourceId?: number, details?: any): Promise<void> => {
    await rbacApi.post('/audit-logs', {
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      timestamp: new Date().toISOString()
    })
  },

  getAuditLogs: async (filters?: any): Promise<any[]> => {
    const response = await rbacApi.get('/audit-logs', { params: filters })
    return response.data
  }
}

// Data Sources specific permissions - Updated to match backend permissions
export const DATA_SOURCE_PERMISSIONS = {
  VIEW: 'data_source:read',
  CREATE: 'data_source:write', 
  EDIT: 'data_source:write',
  DELETE: 'data_source:delete',
  TEST_CONNECTION: 'data_source:write',
  MANAGE_BACKUP: 'data_source:write',
  VIEW_SECURITY: 'security:read',
  MANAGE_SECURITY: 'security:write',
  VIEW_PERFORMANCE: 'performance:read',
  MANAGE_PERFORMANCE: 'performance:write',
  VIEW_COMPLIANCE: 'compliance:read',
  MANAGE_COMPLIANCE: 'compliance:write',
  VIEW_REPORTS: 'report:read',
  GENERATE_REPORTS: 'report:write',
  MANAGE_TAGS: 'data_source:write',
  VIEW_AUDIT: 'audit:read',
  MANAGE_INTEGRATIONS: 'integrations:write',
  EXECUTE_SCANS: 'scan:write',
  VIEW_DISCOVERY: 'discovery:read',
  MANAGE_DISCOVERY: 'discovery:write',
  VIEW_LINEAGE: 'lineage:read',
  BULK_OPERATIONS: 'data_source:write',
  WORKSPACE_ADMIN: 'workspace:admin'
} as const

// Main RBAC Integration Hook
export function useRBACIntegration() {
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
    
    // Check admin override - support both old and new admin permission formats
    const isAdmin = rbacState.permissions.includes('admin.*') || 
                   rbacState.permissions.includes('admin:read') ||
                   rbacState.permissions.includes('admin:write') ||
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
    resourceType: string = 'datasource', 
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
  const PermissionGuard = useCallback(({ 
    permission, 
    fallback = null, 
    children 
  }: { 
    permission: string
    fallback?: React.ReactNode
    children: React.ReactNode 
  }) => {
    if (rbacState.loading) {
      return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
    }
    
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
  }, [hasPermission, rbacState.loading])

  // Data source specific permission helpers
  const dataSourcePermissions = useMemo(() => ({
    canView: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW),
    canCreate: hasPermission(DATA_SOURCE_PERMISSIONS.CREATE),
    canEdit: hasPermission(DATA_SOURCE_PERMISSIONS.EDIT),
    canDelete: hasPermission(DATA_SOURCE_PERMISSIONS.DELETE),
    canTestConnection: hasPermission(DATA_SOURCE_PERMISSIONS.TEST_CONNECTION),
    canManageBackup: hasPermission(DATA_SOURCE_PERMISSIONS.MANAGE_BACKUP),
    canViewSecurity: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_SECURITY),
    canManageSecurity: hasPermission(DATA_SOURCE_PERMISSIONS.MANAGE_SECURITY),
    canViewPerformance: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_PERFORMANCE),
    canManagePerformance: hasPermission(DATA_SOURCE_PERMISSIONS.MANAGE_PERFORMANCE),
    canViewCompliance: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_COMPLIANCE),
    canManageCompliance: hasPermission(DATA_SOURCE_PERMISSIONS.MANAGE_COMPLIANCE),
    canViewReports: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_REPORTS),
    canGenerateReports: hasPermission(DATA_SOURCE_PERMISSIONS.GENERATE_REPORTS),
    canManageTags: hasPermission(DATA_SOURCE_PERMISSIONS.MANAGE_TAGS),
    canViewAudit: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_AUDIT),
    canManageIntegrations: hasPermission(DATA_SOURCE_PERMISSIONS.MANAGE_INTEGRATIONS),
    canExecuteScans: hasPermission(DATA_SOURCE_PERMISSIONS.EXECUTE_SCANS),
    canViewDiscovery: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_DISCOVERY),
    canManageDiscovery: hasPermission(DATA_SOURCE_PERMISSIONS.MANAGE_DISCOVERY),
    canViewLineage: hasPermission(DATA_SOURCE_PERMISSIONS.VIEW_LINEAGE),
    canBulkOperations: hasPermission(DATA_SOURCE_PERMISSIONS.BULK_OPERATIONS),
    isWorkspaceAdmin: hasPermission(DATA_SOURCE_PERMISSIONS.WORKSPACE_ADMIN)
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
    dataSourcePermissions,
    
    // Audit logging
    logUserAction,
    
    // Components
    PermissionGuard,
    
    // Actions
    refreshUser,
    
    // API functions (for advanced usage)
    api: rbacApiFunctions
  }
}

// Context provider for RBAC data
import { createContext, useContext } from 'react'

const RBACContext = createContext<ReturnType<typeof useRBACIntegration> | null>(null)

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const rbacData = useRBACIntegration()
  
  return (
    <RBACContext.Provider value={rbacData}>
      {children}
    </RBACContext.Provider>
  )
}

export function useRBAC() {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider')
  }
  return context
}
// DATA_SOURCE_PERMISSIONS already exported above

// Export types
export type { User, Role, Permission, Group, Session, RBACState, PermissionCheckOptions }
