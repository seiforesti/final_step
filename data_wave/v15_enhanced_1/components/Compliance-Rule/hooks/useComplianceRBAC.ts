// Compliance-specific RBAC hook
// Integrates with the main RBAC system for compliance-specific permissions and operations

import { useCallback, useMemo, useEffect, useState } from 'react'
import { useCurrentUser } from '../../Advanced_RBAC_Datagovernance_System/hooks/useCurrentUser'
import { usePermissionCheck } from '../../Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck'
import { ComplianceAPIs } from '../services/enterprise-apis'

export interface CompliancePermissions {
  canViewDashboard: boolean
  canViewRequirements: boolean
  canCreateRequirements: boolean
  canEditRequirements: boolean
  canDeleteRequirements: boolean
  canViewReports: boolean
  canCreateReports: boolean
  canEditReports: boolean
  canDeleteReports: boolean
  canViewWorkflows: boolean
  canCreateWorkflows: boolean
  canEditWorkflows: boolean
  canDeleteWorkflows: boolean
  canViewIntegrations: boolean
  canManageIntegrations: boolean
  canViewAnalytics: boolean
  canViewSettings: boolean
  canManageSettings: boolean
  canViewAuditLogs: boolean
  canExportData: boolean
  canImportData: boolean
  canManageUsers: boolean
  isComplianceAdmin: boolean
  isComplianceAuditor: boolean
  isComplianceAnalyst: boolean
}

export interface ComplianceRBACState {
  permissions: CompliancePermissions
  currentUser: any
  dataSourceAccess: Record<number, boolean>
  frameworkAccess: Record<string, boolean>
  isLoading: boolean
  error: string | null
}

export interface ComplianceRBACMethods {
  checkDataSourceAccess: (dataSourceId: number) => boolean
  checkFrameworkAccess: (framework: string) => boolean
  checkResourceAccess: (resource: string, action: string, resourceId?: string) => boolean
  logComplianceActivity: (action: string, details: any) => Promise<void>
  refreshPermissions: () => Promise<void>
  getPermissionContext: () => Record<string, any>
}

export interface UseComplianceRBACReturn extends ComplianceRBACState, ComplianceRBACMethods {}

export function useComplianceRBAC(dataSourceId?: number): UseComplianceRBACReturn {
  const { 
    user: currentUser, 
    permissions: userPermissions, 
    checkPermission, 
    hasRole, 
    isLoading: rbacLoading,
    refresh: refreshUserData
  } = useCurrentUser()
  
  const { canAccess } = usePermissionCheck()
  
  const [dataSourceAccess, setDataSourceAccess] = useState<Record<number, boolean>>({})
  const [frameworkAccess, setFrameworkAccess] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Compute compliance-specific permissions
  const permissions = useMemo((): CompliancePermissions => {
    if (!userPermissions) {
      return {
        canViewDashboard: false,
        canViewRequirements: false,
        canCreateRequirements: false,
        canEditRequirements: false,
        canDeleteRequirements: false,
        canViewReports: false,
        canCreateReports: false,
        canEditReports: false,
        canDeleteReports: false,
        canViewWorkflows: false,
        canCreateWorkflows: false,
        canEditWorkflows: false,
        canDeleteWorkflows: false,
        canViewIntegrations: false,
        canManageIntegrations: false,
        canViewAnalytics: false,
        canViewSettings: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canExportData: false,
        canImportData: false,
        canManageUsers: false,
        isComplianceAdmin: false,
        isComplianceAuditor: false,
        isComplianceAnalyst: false
      }
    }

    return {
      // Dashboard permissions
      canViewDashboard: checkPermission('compliance.dashboard.view'),
      
      // Requirements permissions
      canViewRequirements: checkPermission('compliance.requirements.view'),
      canCreateRequirements: checkPermission('compliance.requirements.create'),
      canEditRequirements: checkPermission('compliance.requirements.edit'),
      canDeleteRequirements: checkPermission('compliance.requirements.delete'),
      
      // Reports permissions
      canViewReports: checkPermission('compliance.reports.view'),
      canCreateReports: checkPermission('compliance.reports.create'),
      canEditReports: checkPermission('compliance.reports.edit'),
      canDeleteReports: checkPermission('compliance.reports.delete'),
      
      // Workflows permissions
      canViewWorkflows: checkPermission('compliance.workflows.view'),
      canCreateWorkflows: checkPermission('compliance.workflows.create'),
      canEditWorkflows: checkPermission('compliance.workflows.edit'),
      canDeleteWorkflows: checkPermission('compliance.workflows.delete'),
      
      // Integrations permissions
      canViewIntegrations: checkPermission('compliance.integrations.view'),
      canManageIntegrations: checkPermission('compliance.integrations.manage'),
      
      // Analytics permissions
      canViewAnalytics: checkPermission('compliance.analytics.view'),
      
      // Settings permissions
      canViewSettings: checkPermission('compliance.settings.view'),
      canManageSettings: checkPermission('compliance.settings.manage'),
      
      // Audit permissions
      canViewAuditLogs: checkPermission('compliance.audit.view'),
      
      // Data permissions
      canExportData: checkPermission('compliance.data.export'),
      canImportData: checkPermission('compliance.data.import'),
      
      // User management
      canManageUsers: checkPermission('compliance.users.manage'),
      
      // Role-based flags
      isComplianceAdmin: hasRole('compliance_admin'),
      isComplianceAuditor: hasRole('compliance_auditor'),
      isComplianceAnalyst: hasRole('compliance_analyst')
    }
  }, [userPermissions, checkPermission, hasRole])

  // Load data source access permissions
  useEffect(() => {
    const loadDataSourceAccess = async () => {
      if (!currentUser || !dataSourceId) return

      try {
        setIsLoading(true)
        const response = await ComplianceAPIs.ComplianceManagement.checkDataSourceAccess({
          user_id: currentUser.id,
          data_source_id: dataSourceId
        })

        if (response.success && response.data) {
          setDataSourceAccess(prev => ({
            ...prev,
            [dataSourceId]: response.data.hasAccess
          }))
        }
      } catch (error) {
        console.error('Failed to check data source access:', error)
        setError(error instanceof Error ? error.message : 'Failed to check access')
      } finally {
        setIsLoading(false)
      }
    }

    loadDataSourceAccess()
  }, [currentUser, dataSourceId])

  // Load framework access permissions
  useEffect(() => {
    const loadFrameworkAccess = async () => {
      if (!currentUser) return

      try {
        const response = await ComplianceAPIs.ComplianceManagement.getFrameworkAccess({
          user_id: currentUser.id
        })

        if (response.success && response.data) {
          const accessMap: Record<string, boolean> = {}
          response.data.forEach((framework: any) => {
            accessMap[framework.name] = framework.hasAccess
          })
          setFrameworkAccess(accessMap)
        }
      } catch (error) {
        console.error('Failed to load framework access:', error)
      }
    }

    loadFrameworkAccess()
  }, [currentUser])

  // Check data source access
  const checkDataSourceAccess = useCallback((dataSourceId: number): boolean => {
    if (permissions.isComplianceAdmin) return true
    return dataSourceAccess[dataSourceId] ?? false
  }, [permissions.isComplianceAdmin, dataSourceAccess])

  // Check framework access
  const checkFrameworkAccess = useCallback((framework: string): boolean => {
    if (permissions.isComplianceAdmin) return true
    return frameworkAccess[framework] ?? false
  }, [permissions.isComplianceAdmin, frameworkAccess])

  // Check resource access with context
  const checkResourceAccess = useCallback((
    resource: string, 
    action: string, 
    resourceId?: string
  ): boolean => {
    const permission = `compliance.${resource}.${action}`
    
    if (resourceId) {
      return canAccess(permission, resource, resourceId)
    }
    
    return checkPermission(permission)
  }, [canAccess, checkPermission])

  // Log compliance activity
  const logComplianceActivity = useCallback(async (
    action: string, 
    details: any
  ): Promise<void> => {
    if (!currentUser) return

    try {
      await ComplianceAPIs.Audit.logActivity({
        user_id: currentUser.id,
        action,
        resource_type: 'compliance',
        resource_id: dataSourceId,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          user_context: {
            id: currentUser.id,
            email: currentUser.email,
            roles: currentUser.roles?.map((r: any) => r.name) || []
          }
        }
      })
    } catch (error) {
      console.error('Failed to log compliance activity:', error)
    }
  }, [currentUser, dataSourceId])

  // Refresh permissions
  const refreshPermissions = useCallback(async (): Promise<void> => {
    try {
      await refreshUserData()
      
      // Refresh data source access if applicable
      if (dataSourceId && currentUser) {
        const response = await ComplianceAPIs.ComplianceManagement.checkDataSourceAccess({
          user_id: currentUser.id,
          data_source_id: dataSourceId
        })

        if (response.success && response.data) {
          setDataSourceAccess(prev => ({
            ...prev,
            [dataSourceId]: response.data.hasAccess
          }))
        }
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh permissions')
    }
  }, [refreshUserData, currentUser, dataSourceId])

  // Get permission context for audit logging
  const getPermissionContext = useCallback((): Record<string, any> => {
    return {
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      permissions: Object.entries(permissions)
        .filter(([, value]) => value === true)
        .map(([key]) => key),
      roles: currentUser?.roles?.map((r: any) => r.name) || [],
      dataSourceAccess: Object.entries(dataSourceAccess)
        .filter(([, hasAccess]) => hasAccess)
        .map(([id]) => parseInt(id)),
      frameworkAccess: Object.entries(frameworkAccess)
        .filter(([, hasAccess]) => hasAccess)
        .map(([name]) => name),
      timestamp: new Date().toISOString()
    }
  }, [currentUser, permissions, dataSourceAccess, frameworkAccess])

  return {
    // State
    permissions,
    currentUser,
    dataSourceAccess,
    frameworkAccess,
    isLoading: rbacLoading || isLoading,
    error,
    
    // Methods
    checkDataSourceAccess,
    checkFrameworkAccess,
    checkResourceAccess,
    logComplianceActivity,
    refreshPermissions,
    getPermissionContext
  }
}

export default useComplianceRBAC