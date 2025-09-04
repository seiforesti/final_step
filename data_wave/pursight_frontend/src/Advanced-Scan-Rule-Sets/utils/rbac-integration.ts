/**
 * RBAC Integration Utility for Advanced Scan Rule Sets
 * Provides comprehensive role-based access control integration
 * with the Advanced RBAC Data Governance System
 */

import { useCurrentUser } from '../../Advanced_RBAC_Datagovernance_System/hooks/useCurrentUser';
import { usePermissionCheck } from '../../Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';
import { useRBACState } from '../../Advanced_RBAC_Datagovernance_System/hooks/useRBACState';
import type { User } from '../../Advanced_RBAC_Datagovernance_System/types/user.types';
import type { Permission } from '../../Advanced_RBAC_Datagovernance_System/types/permission.types';
import type { Role } from '../../Advanced_RBAC_Datagovernance_System/types/role.types';

// Scan Rule Sets specific permissions
export const SCAN_RULE_PERMISSIONS = {
  // Rule Management
  RULES_VIEW: 'scan_rules.view',
  RULES_CREATE: 'scan_rules.create',
  RULES_EDIT: 'scan_rules.edit',
  RULES_DELETE: 'scan_rules.delete',
  RULES_EXECUTE: 'scan_rules.execute',
  RULES_VALIDATE: 'scan_rules.validate',
  RULES_OPTIMIZE: 'scan_rules.optimize',
  RULES_EXPORT: 'scan_rules.export',
  RULES_IMPORT: 'scan_rules.import',
  
  // Rule Sets Management
  RULE_SETS_VIEW: 'scan_rule_sets.view',
  RULE_SETS_CREATE: 'scan_rule_sets.create',
  RULE_SETS_EDIT: 'scan_rule_sets.edit',
  RULE_SETS_DELETE: 'scan_rule_sets.delete',
  RULE_SETS_DEPLOY: 'scan_rule_sets.deploy',
  RULE_SETS_SCHEDULE: 'scan_rule_sets.schedule',
  
  // Pattern Library
  PATTERNS_VIEW: 'patterns.view',
  PATTERNS_CREATE: 'patterns.create',
  PATTERNS_EDIT: 'patterns.edit',
  PATTERNS_DELETE: 'patterns.delete',
  PATTERNS_SHARE: 'patterns.share',
  
  // AI/Intelligence Features
  AI_ACCESS: 'ai.access',
  AI_TRAIN_MODELS: 'ai.train_models',
  AI_OPTIMIZE: 'ai.optimize',
  AI_EXPLAIN: 'ai.explain',
  
  // Orchestration
  ORCHESTRATION_VIEW: 'orchestration.view',
  ORCHESTRATION_CREATE: 'orchestration.create',
  ORCHESTRATION_EXECUTE: 'orchestration.execute',
  ORCHESTRATION_MONITOR: 'orchestration.monitor',
  ORCHESTRATION_CONTROL: 'orchestration.control',
  
  // Collaboration
  COLLABORATION_VIEW: 'collaboration.view',
  COLLABORATION_COMMENT: 'collaboration.comment',
  COLLABORATION_REVIEW: 'collaboration.review',
  COLLABORATION_APPROVE: 'collaboration.approve',
  COLLABORATION_SHARE: 'collaboration.share',
  
  // Reporting & Analytics
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  REPORTS_EXPORT: 'reports.export',
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_ADVANCED: 'analytics.advanced',
  
  // Administration
  ADMIN_SYSTEM_CONFIG: 'admin.system_config',
  ADMIN_USER_MANAGEMENT: 'admin.user_management',
  ADMIN_AUDIT_LOGS: 'admin.audit_logs',
  ADMIN_BACKUP_RESTORE: 'admin.backup_restore'
} as const;

// Role definitions for scan rule sets
export const SCAN_RULE_ROLES = {
  VIEWER: 'scan_rules_viewer',
  ANALYST: 'scan_rules_analyst', 
  DESIGNER: 'scan_rules_designer',
  ORCHESTRATOR: 'scan_rules_orchestrator',
  ADMIN: 'scan_rules_admin',
  SUPER_ADMIN: 'scan_rules_super_admin'
} as const;

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  BASIC_ACCESS: [
    SCAN_RULE_PERMISSIONS.RULES_VIEW,
    SCAN_RULE_PERMISSIONS.RULE_SETS_VIEW,
    SCAN_RULE_PERMISSIONS.PATTERNS_VIEW,
    SCAN_RULE_PERMISSIONS.REPORTS_VIEW
  ],
  ANALYST_ACCESS: [
    ...PERMISSION_GROUPS.BASIC_ACCESS,
    SCAN_RULE_PERMISSIONS.AI_ACCESS,
    SCAN_RULE_PERMISSIONS.ANALYTICS_VIEW,
    SCAN_RULE_PERMISSIONS.ORCHESTRATION_VIEW,
    SCAN_RULE_PERMISSIONS.COLLABORATION_VIEW
  ],
  DESIGNER_ACCESS: [
    ...PERMISSION_GROUPS.ANALYST_ACCESS,
    SCAN_RULE_PERMISSIONS.RULES_CREATE,
    SCAN_RULE_PERMISSIONS.RULES_EDIT,
    SCAN_RULE_PERMISSIONS.RULES_VALIDATE,
    SCAN_RULE_PERMISSIONS.PATTERNS_CREATE,
    SCAN_RULE_PERMISSIONS.PATTERNS_EDIT,
    SCAN_RULE_PERMISSIONS.COLLABORATION_COMMENT,
    SCAN_RULE_PERMISSIONS.COLLABORATION_SHARE
  ],
  ORCHESTRATOR_ACCESS: [
    ...PERMISSION_GROUPS.DESIGNER_ACCESS,
    SCAN_RULE_PERMISSIONS.RULES_EXECUTE,
    SCAN_RULE_PERMISSIONS.RULES_OPTIMIZE,
    SCAN_RULE_PERMISSIONS.RULE_SETS_DEPLOY,
    SCAN_RULE_PERMISSIONS.RULE_SETS_SCHEDULE,
    SCAN_RULE_PERMISSIONS.ORCHESTRATION_CREATE,
    SCAN_RULE_PERMISSIONS.ORCHESTRATION_EXECUTE,
    SCAN_RULE_PERMISSIONS.ORCHESTRATION_MONITOR,
    SCAN_RULE_PERMISSIONS.AI_OPTIMIZE,
    SCAN_RULE_PERMISSIONS.COLLABORATION_REVIEW
  ],
  ADMIN_ACCESS: [
    ...PERMISSION_GROUPS.ORCHESTRATOR_ACCESS,
    SCAN_RULE_PERMISSIONS.RULES_DELETE,
    SCAN_RULE_PERMISSIONS.RULE_SETS_DELETE,
    SCAN_RULE_PERMISSIONS.PATTERNS_DELETE,
    SCAN_RULE_PERMISSIONS.AI_TRAIN_MODELS,
    SCAN_RULE_PERMISSIONS.ORCHESTRATION_CONTROL,
    SCAN_RULE_PERMISSIONS.COLLABORATION_APPROVE,
    SCAN_RULE_PERMISSIONS.REPORTS_CREATE,
    SCAN_RULE_PERMISSIONS.REPORTS_EXPORT,
    SCAN_RULE_PERMISSIONS.ANALYTICS_ADVANCED
  ],
  SUPER_ADMIN_ACCESS: [
    ...PERMISSION_GROUPS.ADMIN_ACCESS,
    SCAN_RULE_PERMISSIONS.ADMIN_SYSTEM_CONFIG,
    SCAN_RULE_PERMISSIONS.ADMIN_USER_MANAGEMENT,
    SCAN_RULE_PERMISSIONS.ADMIN_AUDIT_LOGS,
    SCAN_RULE_PERMISSIONS.ADMIN_BACKUP_RESTORE
  ]
};

/**
 * Hook for RBAC integration in Scan Rule Sets
 */
export function useScanRuleRBAC() {
  const { user, checkPermission, checkPermissions } = useCurrentUser();
  const { rbacState } = useRBACState();

  // Permission checking functions
  const hasPermission = (permission: string, resourceId?: string) => {
    return checkPermission(permission, 'scan_rules', resourceId);
  };

  const hasAnyPermission = (permissions: string[], resourceId?: string) => {
    return permissions.some(permission => hasPermission(permission, resourceId));
  };

  const hasAllPermissions = (permissions: string[], resourceId?: string) => {
    return permissions.every(permission => hasPermission(permission, resourceId));
  };

  // Role checking functions
  const hasRole = (role: string) => {
    return user?.roles?.some(userRole => userRole.name === role) || false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => hasRole(role));
  };

  // Resource-specific permission checks
  const canViewRules = (ruleId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULES_VIEW, ruleId);
  const canCreateRules = () => hasPermission(SCAN_RULE_PERMISSIONS.RULES_CREATE);
  const canEditRules = (ruleId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULES_EDIT, ruleId);
  const canDeleteRules = (ruleId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULES_DELETE, ruleId);
  const canExecuteRules = (ruleId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULES_EXECUTE, ruleId);
  const canOptimizeRules = (ruleId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULES_OPTIMIZE, ruleId);

  const canViewRuleSets = (ruleSetId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULE_SETS_VIEW, ruleSetId);
  const canCreateRuleSets = () => hasPermission(SCAN_RULE_PERMISSIONS.RULE_SETS_CREATE);
  const canEditRuleSets = (ruleSetId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULE_SETS_EDIT, ruleSetId);
  const canDeleteRuleSets = (ruleSetId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULE_SETS_DELETE, ruleSetId);
  const canDeployRuleSets = (ruleSetId?: string) => hasPermission(SCAN_RULE_PERMISSIONS.RULE_SETS_DEPLOY, ruleSetId);

  const canAccessAI = () => hasPermission(SCAN_RULE_PERMISSIONS.AI_ACCESS);
  const canTrainModels = () => hasPermission(SCAN_RULE_PERMISSIONS.AI_TRAIN_MODELS);
  const canUseAIOptimization = () => hasPermission(SCAN_RULE_PERMISSIONS.AI_OPTIMIZE);

  const canViewOrchestration = () => hasPermission(SCAN_RULE_PERMISSIONS.ORCHESTRATION_VIEW);
  const canCreateOrchestration = () => hasPermission(SCAN_RULE_PERMISSIONS.ORCHESTRATION_CREATE);
  const canExecuteOrchestration = () => hasPermission(SCAN_RULE_PERMISSIONS.ORCHESTRATION_EXECUTE);
  const canControlOrchestration = () => hasPermission(SCAN_RULE_PERMISSIONS.ORCHESTRATION_CONTROL);

  const canViewReports = () => hasPermission(SCAN_RULE_PERMISSIONS.REPORTS_VIEW);
  const canCreateReports = () => hasPermission(SCAN_RULE_PERMISSIONS.REPORTS_CREATE);
  const canExportReports = () => hasPermission(SCAN_RULE_PERMISSIONS.REPORTS_EXPORT);
  const canViewAnalytics = () => hasPermission(SCAN_RULE_PERMISSIONS.ANALYTICS_VIEW);
  const canViewAdvancedAnalytics = () => hasPermission(SCAN_RULE_PERMISSIONS.ANALYTICS_ADVANCED);

  const canCollaborate = () => hasPermission(SCAN_RULE_PERMISSIONS.COLLABORATION_VIEW);
  const canComment = () => hasPermission(SCAN_RULE_PERMISSIONS.COLLABORATION_COMMENT);
  const canReview = () => hasPermission(SCAN_RULE_PERMISSIONS.COLLABORATION_REVIEW);
  const canApprove = () => hasPermission(SCAN_RULE_PERMISSIONS.COLLABORATION_APPROVE);

  const isAdmin = () => hasRole(SCAN_RULE_ROLES.ADMIN) || hasRole(SCAN_RULE_ROLES.SUPER_ADMIN);
  const isSuperAdmin = () => hasRole(SCAN_RULE_ROLES.SUPER_ADMIN);

  // Get user context for audit trails
  const getUserContext = () => ({
    userId: user?.id,
    username: user?.username,
    email: user?.email,
    roles: user?.roles?.map(r => r.name) || [],
    permissions: user?.permissions || [],
    organizationId: user?.organizationId,
    tenantId: user?.tenantId
  });

  // Check if user can perform bulk operations
  const canPerformBulkOperations = () => {
    return hasAnyPermission([
      SCAN_RULE_PERMISSIONS.RULES_DELETE,
      SCAN_RULE_PERMISSIONS.RULES_EXECUTE,
      SCAN_RULE_PERMISSIONS.RULE_SETS_DELETE,
      SCAN_RULE_PERMISSIONS.RULE_SETS_DEPLOY
    ]);
  };

  // Check access level for features
  const getAccessLevel = () => {
    if (isSuperAdmin()) return 'super_admin';
    if (isAdmin()) return 'admin';
    if (canCreateOrchestration()) return 'orchestrator';
    if (canCreateRules()) return 'designer';
    if (canViewAnalytics()) return 'analyst';
    return 'viewer';
  };

  // Filter components based on permissions
  const getAccessibleComponents = () => {
    const components = [];
    
    // Always accessible
    if (canViewRules()) components.push('dashboard');
    
    // Rule Designer components
    if (canCreateRules() || canEditRules()) {
      components.push('rule-designer', 'pattern-library', 'template-library');
    }
    
    // Intelligence components
    if (canAccessAI()) {
      components.push('ai-enhancement', 'pattern-detector', 'semantic-analyzer');
    }
    
    // Orchestration components
    if (canViewOrchestration()) {
      components.push('orchestration-center', 'workflow-designer', 'execution-monitor');
    }
    
    // Optimization components
    if (canOptimizeRules()) {
      components.push('optimization-engine', 'performance-analytics', 'tuning-assistant');
    }
    
    // Collaboration components
    if (canCollaborate()) {
      components.push('collaboration-hub', 'commenting-system');
    }
    
    if (canReview()) {
      components.push('review-workflow', 'approval-workflow');
    }
    
    // Reporting components
    if (canViewReports()) {
      components.push('performance-reports', 'compliance-reporting');
    }
    
    if (canViewAdvancedAnalytics()) {
      components.push('enterprise-reporting', 'roi-calculator', 'trend-analysis');
    }
    
    // Admin components
    if (isAdmin()) {
      components.push('system-config', 'user-management', 'audit-logs');
    }
    
    return components;
  };

  // Get navigation items based on permissions
  const getAccessibleNavigation = () => {
    const navigation = [];
    
    if (canViewRules()) {
      navigation.push({
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'BarChart3',
        path: '/dashboard'
      });
    }
    
    if (canCreateRules() || canEditRules()) {
      navigation.push({
        id: 'rule-designer',
        label: 'Rule Designer',
        icon: 'Code2',
        path: '/rule-designer',
        children: [
          { id: 'intelligent-designer', label: 'Intelligent Designer', path: '/rule-designer/intelligent' },
          { id: 'advanced-editor', label: 'Advanced Editor', path: '/rule-designer/editor' },
          { id: 'pattern-library', label: 'Pattern Library', path: '/rule-designer/patterns' },
          { id: 'template-library', label: 'Template Library', path: '/rule-designer/templates' },
          { id: 'validation-engine', label: 'Validation Engine', path: '/rule-designer/validation' },
          { id: 'testing-framework', label: 'Testing Framework', path: '/rule-designer/testing' },
          { id: 'version-control', label: 'Version Control', path: '/rule-designer/versions' }
        ]
      });
    }
    
    if (canAccessAI()) {
      navigation.push({
        id: 'intelligence',
        label: 'AI Intelligence',
        icon: 'Brain',
        path: '/intelligence',
        children: [
          { id: 'pattern-detector', label: 'Pattern Detector', path: '/intelligence/patterns' },
          { id: 'semantic-analyzer', label: 'Semantic Analyzer', path: '/intelligence/semantic' },
          { id: 'impact-analyzer', label: 'Impact Analyzer', path: '/intelligence/impact' },
          { id: 'anomaly-detector', label: 'Anomaly Detector', path: '/intelligence/anomaly' },
          { id: 'predictive-analyzer', label: 'Predictive Analyzer', path: '/intelligence/predictive' },
          { id: 'contextual-assistant', label: 'Contextual Assistant', path: '/intelligence/assistant' },
          { id: 'business-mapper', label: 'Business Mapper', path: '/intelligence/business' },
          { id: 'compliance-integrator', label: 'Compliance Integrator', path: '/intelligence/compliance' }
        ]
      });
    }
    
    if (canViewOrchestration()) {
      navigation.push({
        id: 'orchestration',
        label: 'Orchestration',
        icon: 'GitBranch',
        path: '/orchestration',
        children: [
          { id: 'orchestration-center', label: 'Orchestration Center', path: '/orchestration/center' },
          { id: 'workflow-designer', label: 'Workflow Designer', path: '/orchestration/workflow' },
          { id: 'resource-allocation', label: 'Resource Allocation', path: '/orchestration/resources' },
          { id: 'execution-monitor', label: 'Execution Monitor', path: '/orchestration/monitor' },
          { id: 'dependency-resolver', label: 'Dependency Resolver', path: '/orchestration/dependencies' },
          { id: 'scheduling-engine', label: 'Scheduling Engine', path: '/orchestration/scheduling' },
          { id: 'failure-recovery', label: 'Failure Recovery', path: '/orchestration/recovery' },
          { id: 'load-balancer', label: 'Load Balancer', path: '/orchestration/load-balancer' }
        ]
      });
    }
    
    if (canOptimizeRules()) {
      navigation.push({
        id: 'optimization',
        label: 'Optimization',
        icon: 'Zap',
        path: '/optimization',
        children: [
          { id: 'ai-optimization', label: 'AI Optimization Engine', path: '/optimization/ai' },
          { id: 'performance-analytics', label: 'Performance Analytics', path: '/optimization/performance' },
          { id: 'benchmarking', label: 'Benchmarking Dashboard', path: '/optimization/benchmarking' },
          { id: 'recommendations', label: 'Optimization Recommendations', path: '/optimization/recommendations' },
          { id: 'resource-optimizer', label: 'Resource Optimizer', path: '/optimization/resources' },
          { id: 'cost-analyzer', label: 'Cost Analyzer', path: '/optimization/costs' },
          { id: 'tuning-assistant', label: 'Tuning Assistant', path: '/optimization/tuning' },
          { id: 'ml-model-manager', label: 'ML Model Manager', path: '/optimization/models' }
        ]
      });
    }
    
    if (canCollaborate()) {
      navigation.push({
        id: 'collaboration',
        label: 'Collaboration',
        icon: 'Users',
        path: '/collaboration',
        children: [
          { id: 'team-hub', label: 'Team Collaboration Hub', path: '/collaboration/team' },
          { id: 'review-workflow', label: 'Rule Review Workflow', path: '/collaboration/review' },
          { id: 'commenting-system', label: 'Commenting System', path: '/collaboration/comments' },
          { id: 'approval-workflow', label: 'Approval Workflow', path: '/collaboration/approval' },
          { id: 'knowledge-sharing', label: 'Knowledge Sharing', path: '/collaboration/knowledge' },
          { id: 'expert-consultation', label: 'Expert Consultation', path: '/collaboration/experts' }
        ]
      });
    }
    
    if (canViewReports()) {
      navigation.push({
        id: 'reporting',
        label: 'Reporting',
        icon: 'FileText',
        path: '/reporting',
        children: [
          { id: 'performance-reports', label: 'Performance Reports', path: '/reporting/performance' },
          { id: 'compliance-reporting', label: 'Compliance Reporting', path: '/reporting/compliance' },
          { id: 'usage-analytics', label: 'Usage Analytics', path: '/reporting/usage' },
          { id: 'trend-analysis', label: 'Trend Analysis', path: '/reporting/trends' },
          { id: 'roi-calculator', label: 'ROI Calculator', path: '/reporting/roi' },
          { id: 'enterprise-reporting', label: 'Enterprise Reporting', path: '/reporting/enterprise' }
        ]
      });
    }
    
    return navigation;
  };

  // Audit logging for user actions
  const logUserAction = async (action: string, details: any) => {
    try {
      const auditData = {
        userId: user?.id,
        username: user?.username,
        action,
        resource: 'scan_rules',
        details,
        timestamp: new Date().toISOString(),
        sessionId: rbacState?.sessionId,
        ipAddress: rbacState?.ipAddress
      };

      await fetch(`${(typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/v1'}/audit/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(auditData)
      });
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  };

  // Get filtered data based on permissions
  const filterDataByPermissions = <T extends { id: string; createdBy?: string; organizationId?: string }>(
    data: T[],
    permission: string
  ): T[] => {
    return data.filter(item => {
      // Check if user has global permission
      if (hasPermission(permission)) return true;
      
      // Check if user has permission for their own items
      if (item.createdBy === user?.id && hasPermission(`${permission}_own`)) return true;
      
      // Check if user has permission for organization items
      if (item.organizationId === user?.organizationId && hasPermission(`${permission}_org`)) return true;
      
      return false;
    });
  };

  // Resource access control
  const getResourceAccessLevel = (resourceId: string, resourceType: 'rule' | 'rule_set' | 'pattern') => {
    const basePermission = resourceType === 'rule' ? 'scan_rules' : 
                          resourceType === 'rule_set' ? 'scan_rule_sets' : 'patterns';
    
    if (hasPermission(`${basePermission}.admin`, resourceId)) return 'admin';
    if (hasPermission(`${basePermission}.edit`, resourceId)) return 'edit';
    if (hasPermission(`${basePermission}.view`, resourceId)) return 'view';
    return 'none';
  };

  return {
    // User context
    user,
    rbacState,
    getUserContext,
    getAccessLevel,
    
    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    
    // Specific permission checks
    canViewRules,
    canCreateRules,
    canEditRules,
    canDeleteRules,
    canExecuteRules,
    canOptimizeRules,
    canViewRuleSets,
    canCreateRuleSets,
    canEditRuleSets,
    canDeleteRuleSets,
    canDeployRuleSets,
    canAccessAI,
    canTrainModels,
    canUseAIOptimization,
    canViewOrchestration,
    canCreateOrchestration,
    canExecuteOrchestration,
    canControlOrchestration,
    canViewReports,
    canCreateReports,
    canExportReports,
    canViewAnalytics,
    canViewAdvancedAnalytics,
    canCollaborate,
    canComment,
    canReview,
    canApprove,
    isAdmin,
    isSuperAdmin,
    
    // Utility functions
    logUserAction,
    filterDataByPermissions,
    getResourceAccessLevel,
    getAccessibleComponents,
    getAccessibleNavigation,
    
    // Permission constants
    PERMISSIONS: SCAN_RULE_PERMISSIONS,
    ROLES: SCAN_RULE_ROLES,
    PERMISSION_GROUPS
  };
}