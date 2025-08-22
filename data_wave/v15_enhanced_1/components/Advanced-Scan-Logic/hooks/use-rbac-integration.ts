// ============================================================================
// RBAC INTEGRATION HOOK - ADVANCED SCAN LOGIC GROUP
// Advanced RBAC utility integration for enterprise-grade scan operations
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

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
    const response = await rbacApi.get(`/users/${userId}/effective-permissions`)
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

// Advanced Scan Logic specific permissions
export const SCAN_LOGIC_PERMISSIONS = {
  // Core Scan Operations
  VIEW_SCANS: 'scan.view',
  CREATE_SCANS: 'scan.create', 
  EDIT_SCANS: 'scan.edit',
  DELETE_SCANS: 'scan.delete',
  EXECUTE_SCANS: 'scan.execute',
  CANCEL_SCANS: 'scan.cancel',
  SCHEDULE_SCANS: 'scan.schedule',
  
  // Scan Rules and Logic
  VIEW_SCAN_RULES: 'scan_rules.view',
  CREATE_SCAN_RULES: 'scan_rules.create',
  EDIT_SCAN_RULES: 'scan_rules.edit',
  DELETE_SCAN_RULES: 'scan_rules.delete',
  VALIDATE_SCAN_RULES: 'scan_rules.validate',
  DEPLOY_SCAN_RULES: 'scan_rules.deploy',
  
  // Scan Intelligence
  VIEW_INTELLIGENCE: 'scan_intelligence.view',
  CONFIGURE_INTELLIGENCE: 'scan_intelligence.configure',
  AI_PREDICTIONS: 'scan_intelligence.predictions',
  ANOMALY_DETECTION: 'scan_intelligence.anomalies',
  PATTERN_RECOGNITION: 'scan_intelligence.patterns',
  BEHAVIORAL_ANALYSIS: 'scan_intelligence.behavior',
  
  // Scan Orchestration
  VIEW_ORCHESTRATION: 'scan_orchestration.view',
  MANAGE_ORCHESTRATION: 'scan_orchestration.manage',
  WORKFLOW_CONTROL: 'scan_orchestration.workflows',
  RESOURCE_ALLOCATION: 'scan_orchestration.resources',
  CROSS_SYSTEM_COORDINATION: 'scan_orchestration.cross_system',
  DEPENDENCY_MANAGEMENT: 'scan_orchestration.dependencies',
  
  // Performance and Optimization
  VIEW_PERFORMANCE: 'scan_performance.view',
  MANAGE_PERFORMANCE: 'scan_performance.manage',
  PERFORMANCE_TUNING: 'scan_performance.tuning',
  RESOURCE_OPTIMIZATION: 'scan_performance.optimization',
  CAPACITY_PLANNING: 'scan_performance.capacity',
  AUTO_SCALING: 'scan_performance.auto_scaling',
  
  // Real-time Monitoring
  VIEW_MONITORING: 'scan_monitoring.view',
  CONFIGURE_MONITORING: 'scan_monitoring.configure',
  REAL_TIME_ALERTS: 'scan_monitoring.alerts',
  METRICS_ACCESS: 'scan_monitoring.metrics',
  TELEMETRY_ACCESS: 'scan_monitoring.telemetry',
  DASHBOARD_ACCESS: 'scan_monitoring.dashboards',
  
  // Security and Compliance
  VIEW_SECURITY: 'scan_security.view',
  MANAGE_SECURITY: 'scan_security.manage',
  THREAT_INTELLIGENCE: 'scan_security.threat_intel',
  VULNERABILITY_ASSESSMENT: 'scan_security.vulnerability',
  COMPLIANCE_MONITORING: 'scan_security.compliance',
  AUDIT_ACCESS: 'scan_security.audit',
  ACCESS_CONTROL: 'scan_security.access_control',
  
  // Advanced Analytics
  VIEW_ANALYTICS: 'scan_analytics.view',
  GENERATE_REPORTS: 'scan_analytics.reports',
  BUSINESS_INTELLIGENCE: 'scan_analytics.business_intel',
  TREND_ANALYSIS: 'scan_analytics.trends',
  PREDICTIVE_ANALYTICS: 'scan_analytics.predictions',
  STATISTICAL_ANALYSIS: 'scan_analytics.statistics',
  
  // Workflow Management
  VIEW_WORKFLOWS: 'scan_workflows.view',
  MANAGE_WORKFLOWS: 'scan_workflows.manage',
  APPROVAL_WORKFLOWS: 'scan_workflows.approvals',
  AUTOMATION_CONTROL: 'scan_workflows.automation',
  ESCALATION_MANAGEMENT: 'scan_workflows.escalation',
  
  // System Administration
  SYSTEM_ADMIN: 'scan_system.admin',
  CONFIGURATION_MANAGEMENT: 'scan_system.config',
  USER_MANAGEMENT: 'scan_system.users',
  INTEGRATION_MANAGEMENT: 'scan_system.integrations',
  BACKUP_RESTORE: 'scan_system.backup',
  
  // Advanced Operations
  BULK_OPERATIONS: 'scan.bulk_operations',
  CROSS_TENANT_ACCESS: 'scan.cross_tenant',
  API_ACCESS: 'scan.api_access',
  EXPORT_IMPORT: 'scan.export_import',
  ADVANCED_SEARCH: 'scan.advanced_search',
  WORKSPACE_ADMIN: 'scan.workspace_admin'
} as const

// Main RBAC Integration Hook for Advanced Scan Logic
export function useScanLogicRBAC() {
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
    queryKey: ['scan_rbac', 'currentUser'],
    queryFn: rbacApiFunctions.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  })

  // User permissions query
  const { data: userPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['scan_rbac', 'permissions', currentUser?.id],
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
                   currentUser.role === 'admin' ||
                   rbacState.permissions.includes(SCAN_LOGIC_PERMISSIONS.SYSTEM_ADMIN)
    
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
    resourceType: string = 'scan_logic', 
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
          component: 'advanced_scan_logic',
          ...details
        }
      })
    } catch (error) {
      console.error('Failed to log user action:', error)
    }
  }, [currentUser, logActionMutation])

  // Permission-based component renderer
  // Avoid JSX in .ts files: expose boolean predicate instead
  const canRender = useCallback((permission: string) => {
    if (rbacState.loading) return false;
    return hasPermission(permission);
  }, [hasPermission, rbacState.loading])

  // Scan Logic specific permission helpers
  const scanLogicPermissions = useMemo(() => ({
    // Core Scan Operations
    canViewScans: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_SCANS),
    canCreateScans: hasPermission(SCAN_LOGIC_PERMISSIONS.CREATE_SCANS),
    canEditScans: hasPermission(SCAN_LOGIC_PERMISSIONS.EDIT_SCANS),
    canDeleteScans: hasPermission(SCAN_LOGIC_PERMISSIONS.DELETE_SCANS),
    canExecuteScans: hasPermission(SCAN_LOGIC_PERMISSIONS.EXECUTE_SCANS),
    canCancelScans: hasPermission(SCAN_LOGIC_PERMISSIONS.CANCEL_SCANS),
    canScheduleScans: hasPermission(SCAN_LOGIC_PERMISSIONS.SCHEDULE_SCANS),
    
    // Scan Rules and Logic
    canViewScanRules: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_SCAN_RULES),
    canCreateScanRules: hasPermission(SCAN_LOGIC_PERMISSIONS.CREATE_SCAN_RULES),
    canEditScanRules: hasPermission(SCAN_LOGIC_PERMISSIONS.EDIT_SCAN_RULES),
    canDeleteScanRules: hasPermission(SCAN_LOGIC_PERMISSIONS.DELETE_SCAN_RULES),
    canValidateScanRules: hasPermission(SCAN_LOGIC_PERMISSIONS.VALIDATE_SCAN_RULES),
    canDeployScanRules: hasPermission(SCAN_LOGIC_PERMISSIONS.DEPLOY_SCAN_RULES),
    
    // Scan Intelligence
    canViewIntelligence: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_INTELLIGENCE),
    canConfigureIntelligence: hasPermission(SCAN_LOGIC_PERMISSIONS.CONFIGURE_INTELLIGENCE),
    canAccessAIPredictions: hasPermission(SCAN_LOGIC_PERMISSIONS.AI_PREDICTIONS),
    canAccessAnomalyDetection: hasPermission(SCAN_LOGIC_PERMISSIONS.ANOMALY_DETECTION),
    canAccessPatternRecognition: hasPermission(SCAN_LOGIC_PERMISSIONS.PATTERN_RECOGNITION),
    canAccessBehavioralAnalysis: hasPermission(SCAN_LOGIC_PERMISSIONS.BEHAVIORAL_ANALYSIS),
    
    // Scan Orchestration
    canViewOrchestration: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_ORCHESTRATION),
    canManageOrchestration: hasPermission(SCAN_LOGIC_PERMISSIONS.MANAGE_ORCHESTRATION),
    canControlWorkflows: hasPermission(SCAN_LOGIC_PERMISSIONS.WORKFLOW_CONTROL),
    canAllocateResources: hasPermission(SCAN_LOGIC_PERMISSIONS.RESOURCE_ALLOCATION),
    canCrossSystemCoordination: hasPermission(SCAN_LOGIC_PERMISSIONS.CROSS_SYSTEM_COORDINATION),
    canManageDependencies: hasPermission(SCAN_LOGIC_PERMISSIONS.DEPENDENCY_MANAGEMENT),
    
    // Performance and Optimization
    canViewPerformance: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_PERFORMANCE),
    canManagePerformance: hasPermission(SCAN_LOGIC_PERMISSIONS.MANAGE_PERFORMANCE),
    canPerformanceTuning: hasPermission(SCAN_LOGIC_PERMISSIONS.PERFORMANCE_TUNING),
    canResourceOptimization: hasPermission(SCAN_LOGIC_PERMISSIONS.RESOURCE_OPTIMIZATION),
    canCapacityPlanning: hasPermission(SCAN_LOGIC_PERMISSIONS.CAPACITY_PLANNING),
    canAutoScaling: hasPermission(SCAN_LOGIC_PERMISSIONS.AUTO_SCALING),
    
    // Real-time Monitoring
    canViewMonitoring: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_MONITORING),
    canConfigureMonitoring: hasPermission(SCAN_LOGIC_PERMISSIONS.CONFIGURE_MONITORING),
    canAccessRealTimeAlerts: hasPermission(SCAN_LOGIC_PERMISSIONS.REAL_TIME_ALERTS),
    canAccessMetrics: hasPermission(SCAN_LOGIC_PERMISSIONS.METRICS_ACCESS),
    canAccessTelemetry: hasPermission(SCAN_LOGIC_PERMISSIONS.TELEMETRY_ACCESS),
    canAccessDashboards: hasPermission(SCAN_LOGIC_PERMISSIONS.DASHBOARD_ACCESS),
    
    // Security and Compliance
    canViewSecurity: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_SECURITY),
    canManageSecurity: hasPermission(SCAN_LOGIC_PERMISSIONS.MANAGE_SECURITY),
    canAccessThreatIntelligence: hasPermission(SCAN_LOGIC_PERMISSIONS.THREAT_INTELLIGENCE),
    canVulnerabilityAssessment: hasPermission(SCAN_LOGIC_PERMISSIONS.VULNERABILITY_ASSESSMENT),
    canComplianceMonitoring: hasPermission(SCAN_LOGIC_PERMISSIONS.COMPLIANCE_MONITORING),
    canAccessAudit: hasPermission(SCAN_LOGIC_PERMISSIONS.AUDIT_ACCESS),
    canManageAccessControl: hasPermission(SCAN_LOGIC_PERMISSIONS.ACCESS_CONTROL),
    
    // Advanced Analytics
    canViewAnalytics: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_ANALYTICS),
    canGenerateReports: hasPermission(SCAN_LOGIC_PERMISSIONS.GENERATE_REPORTS),
    canBusinessIntelligence: hasPermission(SCAN_LOGIC_PERMISSIONS.BUSINESS_INTELLIGENCE),
    canTrendAnalysis: hasPermission(SCAN_LOGIC_PERMISSIONS.TREND_ANALYSIS),
    canPredictiveAnalytics: hasPermission(SCAN_LOGIC_PERMISSIONS.PREDICTIVE_ANALYTICS),
    canStatisticalAnalysis: hasPermission(SCAN_LOGIC_PERMISSIONS.STATISTICAL_ANALYSIS),
    
    // Workflow Management
    canViewWorkflows: hasPermission(SCAN_LOGIC_PERMISSIONS.VIEW_WORKFLOWS),
    canManageWorkflows: hasPermission(SCAN_LOGIC_PERMISSIONS.MANAGE_WORKFLOWS),
    canApprovalWorkflows: hasPermission(SCAN_LOGIC_PERMISSIONS.APPROVAL_WORKFLOWS),
    canAutomationControl: hasPermission(SCAN_LOGIC_PERMISSIONS.AUTOMATION_CONTROL),
    canEscalationManagement: hasPermission(SCAN_LOGIC_PERMISSIONS.ESCALATION_MANAGEMENT),
    
    // System Administration
    isSystemAdmin: hasPermission(SCAN_LOGIC_PERMISSIONS.SYSTEM_ADMIN),
    canConfigurationManagement: hasPermission(SCAN_LOGIC_PERMISSIONS.CONFIGURATION_MANAGEMENT),
    canUserManagement: hasPermission(SCAN_LOGIC_PERMISSIONS.USER_MANAGEMENT),
    canIntegrationManagement: hasPermission(SCAN_LOGIC_PERMISSIONS.INTEGRATION_MANAGEMENT),
    canBackupRestore: hasPermission(SCAN_LOGIC_PERMISSIONS.BACKUP_RESTORE),
    
    // Advanced Operations
    canBulkOperations: hasPermission(SCAN_LOGIC_PERMISSIONS.BULK_OPERATIONS),
    canCrossTenantAccess: hasPermission(SCAN_LOGIC_PERMISSIONS.CROSS_TENANT_ACCESS),
    canAPIAccess: hasPermission(SCAN_LOGIC_PERMISSIONS.API_ACCESS),
    canExportImport: hasPermission(SCAN_LOGIC_PERMISSIONS.EXPORT_IMPORT),
    canAdvancedSearch: hasPermission(SCAN_LOGIC_PERMISSIONS.ADVANCED_SEARCH),
    isWorkspaceAdmin: hasPermission(SCAN_LOGIC_PERMISSIONS.WORKSPACE_ADMIN)
  }), [hasPermission])

  // Refresh user data
  const refreshUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['scan_rbac', 'currentUser'] })
    if (currentUser?.id) {
      queryClient.invalidateQueries({ queryKey: ['scan_rbac', 'permissions', currentUser.id] })
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
    scanLogicPermissions,
    
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

// Context provider for RBAC data
import { createContext, useContext } from 'react'

const ScanLogicRBACContext = createContext<ReturnType<typeof useScanLogicRBAC> | null>(null)

export function ScanLogicRBACProvider({ children }: { children: React.ReactNode }) {
  const rbacData = useScanLogicRBAC()
  
  return React.createElement(
    ScanLogicRBACContext.Provider,
    { value: rbacData },
    children
  )
}

export function useScanRBAC() {
  const context = useContext(ScanLogicRBACContext)
  if (!context) {
    throw new Error('useScanRBAC must be used within a ScanLogicRBACProvider')
  }
  return context
}

// Export types
export type { User, Role, Permission, Group, Session, RBACState, PermissionCheckOptions }