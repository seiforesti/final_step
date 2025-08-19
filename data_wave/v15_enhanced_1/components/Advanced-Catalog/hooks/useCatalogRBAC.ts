// ============================================================================
// CATALOG RBAC HOOK - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Integrates catalog operations with the shared RBAC system
// Provides catalog-specific permission checking and access control
// ============================================================================

import { useCallback, useMemo } from 'react';
import { useAuth } from '../../Advanced_RBAC_Datagovernance_System/hooks/useAuth';
import { usePermissionCheck } from '../../Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';
import { useCurrentUser } from '../../Advanced_RBAC_Datagovernance_System/hooks/useCurrentUser';
import { useRBACState } from '../../Advanced_RBAC_Datagovernance_System/hooks/useRBACState';

// Catalog-specific permission definitions
export const CATALOG_PERMISSIONS = {
  // Asset Management
  ASSETS: {
    CREATE: 'catalog:assets:create',
    READ: 'catalog:assets:read',
    UPDATE: 'catalog:assets:update',
    DELETE: 'catalog:assets:delete',
    MANAGE: 'catalog:assets:manage',
    PUBLISH: 'catalog:assets:publish',
    ARCHIVE: 'catalog:assets:archive'
  },
  
  // Discovery Operations
  DISCOVERY: {
    CREATE_JOB: 'catalog:discovery:create_job',
    MANAGE_JOBS: 'catalog:discovery:manage_jobs',
    VIEW_RESULTS: 'catalog:discovery:view_results',
    CONFIGURE: 'catalog:discovery:configure',
    SCHEDULE: 'catalog:discovery:schedule'
  },
  
  // Lineage Management
  LINEAGE: {
    VIEW: 'catalog:lineage:view',
    TRACE: 'catalog:lineage:trace',
    MODIFY: 'catalog:lineage:modify',
    ANALYZE: 'catalog:lineage:analyze',
    EXPORT: 'catalog:lineage:export'
  },
  
  // Quality Management
  QUALITY: {
    VIEW_METRICS: 'catalog:quality:view_metrics',
    CREATE_RULES: 'catalog:quality:create_rules',
    MANAGE_RULES: 'catalog:quality:manage_rules',
    RUN_ASSESSMENTS: 'catalog:quality:run_assessments',
    VIEW_REPORTS: 'catalog:quality:view_reports'
  },
  
  // Collaboration
  COLLABORATION: {
    COMMENT: 'catalog:collaboration:comment',
    SHARE: 'catalog:collaboration:share',
    REVIEW: 'catalog:collaboration:review',
    APPROVE: 'catalog:collaboration:approve',
    MODERATE: 'catalog:collaboration:moderate'
  },
  
  // Business Glossary
  GLOSSARY: {
    VIEW: 'catalog:glossary:view',
    CREATE_TERMS: 'catalog:glossary:create_terms',
    MANAGE_TERMS: 'catalog:glossary:manage_terms',
    ASSIGN_TERMS: 'catalog:glossary:assign_terms',
    APPROVE_TERMS: 'catalog:glossary:approve_terms'
  },
  
  // Analytics & Insights
  ANALYTICS: {
    VIEW_DASHBOARDS: 'catalog:analytics:view_dashboards',
    CREATE_REPORTS: 'catalog:analytics:create_reports',
    EXPORT_DATA: 'catalog:analytics:export_data',
    MANAGE_METRICS: 'catalog:analytics:manage_metrics'
  },
  
  // Search & Discovery
  SEARCH: {
    BASIC: 'catalog:search:basic',
    ADVANCED: 'catalog:search:advanced',
    SEMANTIC: 'catalog:search:semantic',
    AI_POWERED: 'catalog:search:ai_powered',
    SAVE_QUERIES: 'catalog:search:save_queries'
  },
  
  // System Administration
  ADMIN: {
    MANAGE_CATALOG: 'catalog:admin:manage',
    CONFIGURE_SETTINGS: 'catalog:admin:configure',
    VIEW_SYSTEM_METRICS: 'catalog:admin:system_metrics',
    MANAGE_INTEGRATIONS: 'catalog:admin:integrations',
    BACKUP_RESTORE: 'catalog:admin:backup_restore'
  }
} as const;

// Resource types for catalog system
export const CATALOG_RESOURCES = {
  ASSET: 'catalog_asset',
  DISCOVERY_JOB: 'catalog_discovery_job',
  QUALITY_RULE: 'catalog_quality_rule',
  LINEAGE_GRAPH: 'catalog_lineage_graph',
  GLOSSARY_TERM: 'catalog_glossary_term',
  COLLABORATION_SESSION: 'catalog_collaboration_session',
  ANALYTICS_DASHBOARD: 'catalog_analytics_dashboard',
  SEARCH_QUERY: 'catalog_search_query'
} as const;

// Catalog-specific role definitions
export const CATALOG_ROLES = {
  DATA_STEWARD: 'catalog_data_steward',
  DATA_ANALYST: 'catalog_data_analyst',
  DATA_ENGINEER: 'catalog_data_engineer',
  CATALOG_ADMIN: 'catalog_admin',
  BUSINESS_USER: 'catalog_business_user',
  QUALITY_MANAGER: 'catalog_quality_manager',
  LINEAGE_ANALYST: 'catalog_lineage_analyst',
  DISCOVERY_OPERATOR: 'catalog_discovery_operator'
} as const;

export interface CatalogPermissionContext {
  assetId?: string;
  assetType?: string;
  ownerId?: string;
  department?: string;
  classification?: string;
  sensitivity?: string;
  businessCriticality?: string;
}

export interface CatalogRBACHook {
  // Authentication State
  isAuthenticated: boolean;
  currentUser: any;
  userRoles: string[];
  userPermissions: string[];
  
  // Asset Permissions
  canCreateAsset: (context?: CatalogPermissionContext) => boolean;
  canReadAsset: (assetId: string, context?: CatalogPermissionContext) => boolean;
  canUpdateAsset: (assetId: string, context?: CatalogPermissionContext) => boolean;
  canDeleteAsset: (assetId: string, context?: CatalogPermissionContext) => boolean;
  canManageAsset: (assetId: string, context?: CatalogPermissionContext) => boolean;
  
  // Discovery Permissions
  canCreateDiscoveryJob: () => boolean;
  canManageDiscoveryJobs: () => boolean;
  canViewDiscoveryResults: () => boolean;
  canConfigureDiscovery: () => boolean;
  canScheduleDiscovery: () => boolean;
  
  // Lineage Permissions
  canViewLineage: (assetId?: string) => boolean;
  canTraceLineage: (assetId?: string) => boolean;
  canModifyLineage: (assetId?: string) => boolean;
  canAnalyzeLineage: () => boolean;
  canExportLineage: () => boolean;
  
  // Quality Permissions
  canViewQualityMetrics: (assetId?: string) => boolean;
  canCreateQualityRules: () => boolean;
  canManageQualityRules: () => boolean;
  canRunQualityAssessments: () => boolean;
  canViewQualityReports: () => boolean;
  
  // Collaboration Permissions
  canComment: (assetId?: string) => boolean;
  canShare: (assetId?: string) => boolean;
  canReview: (assetId?: string) => boolean;
  canApprove: (assetId?: string) => boolean;
  canModerate: () => boolean;
  
  // Glossary Permissions
  canViewGlossary: () => boolean;
  canCreateGlossaryTerms: () => boolean;
  canManageGlossaryTerms: () => boolean;
  canAssignGlossaryTerms: () => boolean;
  canApproveGlossaryTerms: () => boolean;
  
  // Analytics Permissions
  canViewAnalyticsDashboards: () => boolean;
  canCreateAnalyticsReports: () => boolean;
  canExportAnalyticsData: () => boolean;
  canManageAnalyticsMetrics: () => boolean;
  
  // Search Permissions
  canPerformBasicSearch: () => boolean;
  canPerformAdvancedSearch: () => boolean;
  canPerformSemanticSearch: () => boolean;
  canPerformAISearch: () => boolean;
  canSaveSearchQueries: () => boolean;
  
  // Administrative Permissions
  canManageCatalog: () => boolean;
  canConfigureCatalogSettings: () => boolean;
  canViewSystemMetrics: () => boolean;
  canManageIntegrations: () => boolean;
  canPerformBackupRestore: () => boolean;
  
  // Utility Methods
  hasAnyAssetPermission: (assetId: string, permissions: string[]) => boolean;
  hasAllAssetPermissions: (assetId: string, permissions: string[]) => boolean;
  checkContextualPermission: (permission: string, context: CatalogPermissionContext) => Promise<boolean>;
  isAssetOwner: (assetId: string, userId?: string) => boolean;
  canAccessBasedOnClassification: (classification: string) => boolean;
  canAccessBasedOnSensitivity: (sensitivity: string) => boolean;
}

export function useCatalogRBAC(): CatalogRBACHook {
  const { isAuthenticated } = useAuth();
  const { user, permissions, roles, groups } = useCurrentUser();
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    canRead,
    canWrite,
    canDelete,
    canManage,
    hasRole,
    checkWithCondition
  } = usePermissionCheck();
  const { rbacState } = useRBACState();

  // Asset permission helpers
  const canCreateAsset = useCallback((context?: CatalogPermissionContext) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ASSETS.CREATE });
  }, [hasPermission]);

  const canReadAsset = useCallback((assetId: string, context?: CatalogPermissionContext) => {
    return canRead(CATALOG_RESOURCES.ASSET, assetId);
  }, [canRead]);

  const canUpdateAsset = useCallback((assetId: string, context?: CatalogPermissionContext) => {
    return canWrite(CATALOG_RESOURCES.ASSET, assetId);
  }, [canWrite]);

  const canDeleteAsset = useCallback((assetId: string, context?: CatalogPermissionContext) => {
    return canDelete(CATALOG_RESOURCES.ASSET, assetId);
  }, [canDelete]);

  const canManageAsset = useCallback((assetId: string, context?: CatalogPermissionContext) => {
    return canManage(CATALOG_RESOURCES.ASSET, assetId);
  }, [canManage]);

  // Discovery permission helpers
  const canCreateDiscoveryJob = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.DISCOVERY.CREATE_JOB });
  }, [hasPermission]);

  const canManageDiscoveryJobs = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.DISCOVERY.MANAGE_JOBS });
  }, [hasPermission]);

  const canViewDiscoveryResults = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.DISCOVERY.VIEW_RESULTS });
  }, [hasPermission]);

  const canConfigureDiscovery = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.DISCOVERY.CONFIGURE });
  }, [hasPermission]);

  const canScheduleDiscovery = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.DISCOVERY.SCHEDULE });
  }, [hasPermission]);

  // Lineage permission helpers
  const canViewLineage = useCallback((assetId?: string) => {
    if (assetId) {
      return canRead(CATALOG_RESOURCES.LINEAGE_GRAPH, assetId);
    }
    return hasPermission({ action: CATALOG_PERMISSIONS.LINEAGE.VIEW });
  }, [hasPermission, canRead]);

  const canTraceLineage = useCallback((assetId?: string) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.LINEAGE.TRACE });
  }, [hasPermission]);

  const canModifyLineage = useCallback((assetId?: string) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.LINEAGE.MODIFY });
  }, [hasPermission]);

  const canAnalyzeLineage = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.LINEAGE.ANALYZE });
  }, [hasPermission]);

  const canExportLineage = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.LINEAGE.EXPORT });
  }, [hasPermission]);

  // Quality permission helpers
  const canViewQualityMetrics = useCallback((assetId?: string) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.QUALITY.VIEW_METRICS });
  }, [hasPermission]);

  const canCreateQualityRules = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.QUALITY.CREATE_RULES });
  }, [hasPermission]);

  const canManageQualityRules = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.QUALITY.MANAGE_RULES });
  }, [hasPermission]);

  const canRunQualityAssessments = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.QUALITY.RUN_ASSESSMENTS });
  }, [hasPermission]);

  const canViewQualityReports = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.QUALITY.VIEW_REPORTS });
  }, [hasPermission]);

  // Collaboration permission helpers
  const canComment = useCallback((assetId?: string) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.COLLABORATION.COMMENT });
  }, [hasPermission]);

  const canShare = useCallback((assetId?: string) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.COLLABORATION.SHARE });
  }, [hasPermission]);

  const canReview = useCallback((assetId?: string) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.COLLABORATION.REVIEW });
  }, [hasPermission]);

  const canApprove = useCallback((assetId?: string) => {
    return hasPermission({ action: CATALOG_PERMISSIONS.COLLABORATION.APPROVE });
  }, [hasPermission]);

  const canModerate = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.COLLABORATION.MODERATE });
  }, [hasPermission]);

  // Glossary permission helpers
  const canViewGlossary = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.GLOSSARY.VIEW });
  }, [hasPermission]);

  const canCreateGlossaryTerms = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.GLOSSARY.CREATE_TERMS });
  }, [hasPermission]);

  const canManageGlossaryTerms = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.GLOSSARY.MANAGE_TERMS });
  }, [hasPermission]);

  const canAssignGlossaryTerms = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.GLOSSARY.ASSIGN_TERMS });
  }, [hasPermission]);

  const canApproveGlossaryTerms = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.GLOSSARY.APPROVE_TERMS });
  }, [hasPermission]);

  // Analytics permission helpers
  const canViewAnalyticsDashboards = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ANALYTICS.VIEW_DASHBOARDS });
  }, [hasPermission]);

  const canCreateAnalyticsReports = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ANALYTICS.CREATE_REPORTS });
  }, [hasPermission]);

  const canExportAnalyticsData = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ANALYTICS.EXPORT_DATA });
  }, [hasPermission]);

  const canManageAnalyticsMetrics = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ANALYTICS.MANAGE_METRICS });
  }, [hasPermission]);

  // Search permission helpers
  const canPerformBasicSearch = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.SEARCH.BASIC });
  }, [hasPermission]);

  const canPerformAdvancedSearch = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.SEARCH.ADVANCED });
  }, [hasPermission]);

  const canPerformSemanticSearch = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.SEARCH.SEMANTIC });
  }, [hasPermission]);

  const canPerformAISearch = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.SEARCH.AI_POWERED });
  }, [hasPermission]);

  const canSaveSearchQueries = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.SEARCH.SAVE_QUERIES });
  }, [hasPermission]);

  // Administrative permission helpers
  const canManageCatalog = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ADMIN.MANAGE_CATALOG });
  }, [hasPermission]);

  const canConfigureCatalogSettings = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ADMIN.CONFIGURE_SETTINGS });
  }, [hasPermission]);

  const canViewSystemMetrics = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ADMIN.VIEW_SYSTEM_METRICS });
  }, [hasPermission]);

  const canManageIntegrations = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ADMIN.MANAGE_INTEGRATIONS });
  }, [hasPermission]);

  const canPerformBackupRestore = useCallback(() => {
    return hasPermission({ action: CATALOG_PERMISSIONS.ADMIN.BACKUP_RESTORE });
  }, [hasPermission]);

  // Utility methods
  const hasAnyAssetPermission = useCallback((assetId: string, permissions: string[]) => {
    return hasAnyPermission(permissions.map(permission => ({
      action: permission,
      resource: CATALOG_RESOURCES.ASSET,
      resourceId: assetId
    })));
  }, [hasAnyPermission]);

  const hasAllAssetPermissions = useCallback((assetId: string, permissions: string[]) => {
    return hasAllPermissions(permissions.map(permission => ({
      action: permission,
      resource: CATALOG_RESOURCES.ASSET,
      resourceId: assetId
    })));
  }, [hasAllPermissions]);

  const checkContextualPermission = useCallback(async (permission: string, context: CatalogPermissionContext) => {
    return await checkWithCondition(
      { action: permission },
      context
    );
  }, [checkWithCondition]);

  const isAssetOwner = useCallback((assetId: string, userId?: string) => {
    const targetUserId = userId || user?.id;
    return targetUserId ? hasPermission({
      action: CATALOG_PERMISSIONS.ASSETS.MANAGE,
      resource: CATALOG_RESOURCES.ASSET,
      resourceId: assetId,
      condition: { owner_id: targetUserId }
    }) : false;
  }, [hasPermission, user]);

  const canAccessBasedOnClassification = useCallback((classification: string) => {
    return hasPermission({
      action: CATALOG_PERMISSIONS.ASSETS.READ,
      condition: { classification }
    });
  }, [hasPermission]);

  const canAccessBasedOnSensitivity = useCallback((sensitivity: string) => {
    return hasPermission({
      action: CATALOG_PERMISSIONS.ASSETS.READ,
      condition: { sensitivity }
    });
  }, [hasPermission]);

  const currentUser = useMemo(() => user, [user]);
  const userRoles = useMemo(() => roles || [], [roles]);
  const userPermissions = useMemo(() => permissions || [], [permissions]);

  return {
    // Authentication State
    isAuthenticated,
    currentUser,
    userRoles,
    userPermissions,
    
    // Asset Permissions
    canCreateAsset,
    canReadAsset,
    canUpdateAsset,
    canDeleteAsset,
    canManageAsset,
    
    // Discovery Permissions
    canCreateDiscoveryJob,
    canManageDiscoveryJobs,
    canViewDiscoveryResults,
    canConfigureDiscovery,
    canScheduleDiscovery,
    
    // Lineage Permissions
    canViewLineage,
    canTraceLineage,
    canModifyLineage,
    canAnalyzeLineage,
    canExportLineage,
    
    // Quality Permissions
    canViewQualityMetrics,
    canCreateQualityRules,
    canManageQualityRules,
    canRunQualityAssessments,
    canViewQualityReports,
    
    // Collaboration Permissions
    canComment,
    canShare,
    canReview,
    canApprove,
    canModerate,
    
    // Glossary Permissions
    canViewGlossary,
    canCreateGlossaryTerms,
    canManageGlossaryTerms,
    canAssignGlossaryTerms,
    canApproveGlossaryTerms,
    
    // Analytics Permissions
    canViewAnalyticsDashboards,
    canCreateAnalyticsReports,
    canExportAnalyticsData,
    canManageAnalyticsMetrics,
    
    // Search Permissions
    canPerformBasicSearch,
    canPerformAdvancedSearch,
    canPerformSemanticSearch,
    canPerformAISearch,
    canSaveSearchQueries,
    
    // Administrative Permissions
    canManageCatalog,
    canConfigureCatalogSettings,
    canViewSystemMetrics,
    canManageIntegrations,
    canPerformBackupRestore,
    
    // Utility Methods
    hasAnyAssetPermission,
    hasAllAssetPermissions,
    checkContextualPermission,
    isAssetOwner,
    canAccessBasedOnClassification,
    canAccessBasedOnSensitivity
  };
}