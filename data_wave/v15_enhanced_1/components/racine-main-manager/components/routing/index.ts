/**
 * 🛣️ ROUTING MODULE INDEX - ENTERPRISE ROUTING SYSTEM EXPORTS
 * ============================================================
 * 
 * Central export hub for all routing-related components, hooks, types,
 * and utilities in the Racine Main Manager routing system. Provides
 * a clean, organized interface for importing routing functionality
 * across the data governance platform.
 * 
 * Architecture:
 * - Centralized routing component exports
 * - Type definitions and interfaces
 * - Custom hooks and utilities
 * - Provider components and contexts
 * - Configuration and constants
 * 
 * Components Exported:
 * - RacineRouter: Core routing controller
 * - RouteGuards: Advanced route protection system
 * - RouteMiddleware: Request/response processing pipeline
 * - DeepLinkManager: Enhanced deep linking system
 * - BreadcrumbManager: Intelligent breadcrumb navigation
 * - QuickNavigationPanel: Enhanced quick navigation system
 * 
 * Integration:
 * - Seamless integration with Next.js App Router
 * - RBAC-aware routing with permission-based access
 * - Cross-group navigation with state preservation
 * - Performance-optimized routing with caching
 * - Analytics and monitoring integration
 */

import React from 'react';
import RacineRouter from './RacineRouter';
import { RacineRouterProvider } from './RacineRouterProvider';
import { RouteGuardsProvider, RouteGuard } from './RouteGuards';
import RouteMiddleware from './RouteMiddleware';
import { RouteMiddlewareProvider } from './RouteMiddleware';
import DeepLinkManagerProvider, { SmartLink } from './DeepLinkManager';
import BreadcrumbManagerProvider, { BreadcrumbNavigation } from './BreadcrumbManager';
import QuickNavigationProvider, { QuickNavigationPanel, QuickNavigationTrigger } from './QuickNavigationPanel';

// ============================================================================
// CORE ROUTING COMPONENTS
// ============================================================================

// Main Router
export { default as RacineRouter } from './RacineRouter';
export { 
  getAvailableRoutes,
  getRouteConfig,
  generateRouteUrl,
  canAccessRoute,
  useRacineRouter
} from './RacineRouter';

// Route Protection System
export { RouteGuard } from './RouteGuards';
export { 
  useRouteGuards,
  withRouteGuards,
  useGuardStatus,
  useSecurityContext,
  useGuardAudit,
  AdminRouteGuard
} from './RouteGuards';
export { RouteGuardsProvider } from './RouteGuards';

// Route Processing Pipeline
export { default as RouteMiddlewareComponent } from './RouteMiddleware';
export { 
  useRouteMiddleware,
  MiddlewareMonitor,
  useMiddlewarePerformance,
  useMiddlewareStatus,
  useMiddlewareAnalytics
} from './RouteMiddleware';
export { RouteMiddlewareProvider } from './RouteMiddleware';

// Deep Linking System
export { default as DeepLinkManagerProvider } from './DeepLinkManager';
export { 
  useDeepLinkManager, 
  SmartLink,
  ShareLinkDialog,
  LinkHistory,
  LinkBuilder,
  useDeepLink,
  useShareableLink,
  useLinkAnalytics,
  useLinkValidation
} from './DeepLinkManager';

// Breadcrumb Navigation
export { default as BreadcrumbManagerProvider } from './BreadcrumbManager';
export { 
  useBreadcrumbManager,
  BreadcrumbNavigation,
  BreadcrumbSettings,
  BreadcrumbAnalytics,
  useBreadcrumb,
  useBreadcrumbNavigation,
  useBreadcrumbAnalytics
} from './BreadcrumbManager';

// Quick Navigation System
export { default as QuickNavigationProvider } from './QuickNavigationPanel';
export { 
  useQuickNavigation,
  QuickNavigationPanel,
  QuickNavigationTrigger,
  QuickNavigationSettings,
  useQuickNavigationShortcuts,
  useQuickNavigationBookmarks,
  useQuickNavigationSearch
} from './QuickNavigationPanel';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Router Types
export type { 
  RouteConfig, 
  RouteMetadata, 
  NavigationState, 
  RouteAnalyticsData,
  RouteConfigurationOptions,
  RouteBreadcrumbItem
} from './RacineRouter';

// Route Guards Types
export type { 
  RouteGuard as RouteGuardType, 
  GuardResult, 
  RouteContext, 
  GuardConfiguration,
  SecurityContext,
  GuardAnalyticsData,
  RouteErrorProps
} from './RouteGuards';

// Route Middleware Types
export type { 
  RouteMiddleware as RouteMiddlewareType, 
  MiddlewareContext, 
  MiddlewareConfiguration,
  PerformanceMetrics,
  AnalyticsData,
  SecurityMonitoringData,
  AuditLogEntry
} from './RouteMiddleware';

// Deep Link Types
export type { 
  DeepLinkConfig, 
  DeepLinkResult, 
  LinkState, 
  DeepLinkAnalytics, 
  ShareableLink,
  DeepLinkOptions,
  ShareableLinkOptions
} from './DeepLinkManager';

// Breadcrumb Types
export type { 
  BreadcrumbItem,
  BreadcrumbConfig,
  BreadcrumbNavigation as BreadcrumbNavigationType,
  BreadcrumbContext
} from './BreadcrumbManager';

// Quick Navigation Types
export type { 
  NavigationItem, 
  QuickAction, 
  SearchResult, 
  QuickNavigationConfig,
  KeyboardShortcut
} from './QuickNavigationPanel';

// ============================================================================
// ROUTING UTILITIES
// ============================================================================

/**
 * Creates a complete routing provider that wraps all routing functionality
 * @param children - React children to wrap
 * @param config - Optional routing configuration
 */
export const createRoutingProvider = (
  children: React.ReactNode,
  config?: {
    router?: any;
    guards?: any;
    middleware?: any;
    deepLinks?: any;
    breadcrumbs?: any;
    quickNavigation?: any;
  }
) => {
  return React.createElement(
    RacineRouterProvider,
    { ...(config?.router || {}) },
    React.createElement(
      RouteGuardsProvider,
      { ...(config?.guards || {}) },
      React.createElement(
        RouteMiddlewareProvider,
        { ...(config?.middleware || {}) },
        React.createElement(
          DeepLinkManagerProvider,
          { ...(config?.deepLinks || {}) },
          React.createElement(
            BreadcrumbManagerProvider,
            { ...(config?.breadcrumbs || {}) },
            React.createElement(
              QuickNavigationProvider,
              { ...(config?.quickNavigation || {}) },
              children
            )
          )
        )
      )
    )
  );
};

/**
 * Hook for accessing all routing functionality in one place
 */
export const useRacineRouting = () => {
  const router = useRacineRouter();
  const guards = useRouteGuards();
  const middleware = useRouteMiddleware();
  const deepLinks = useDeepLinkManager();
  const breadcrumbs = useBreadcrumbManager();
  const quickNav = useQuickNavigation();

  return {
    router,
    guards,
    middleware,
    deepLinks,
    breadcrumbs,
    quickNav
  };
};

// ============================================================================
// ROUTING CONSTANTS
// ============================================================================

/**
 * Default routing configuration for the enterprise platform
 */
export const DEFAULT_ROUTING_CONFIG = {
  enableGuards: true,
  enableMiddleware: true,
  enableDeepLinks: true,
  enableBreadcrumbs: true,
  enableQuickNavigation: true,
  enableAnalytics: true,
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
  maxCacheSize: 100,
  enableSEO: true,
  enableAccessibility: true
};

/**
 * Route patterns for all data governance groups
 */
export const ROUTE_PATTERNS = {
  // Core Routes
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  
  // Data Governance Groups
  DATA_SOURCES: '/data-sources',
  SCAN_RULE_SETS: '/scan-rule-sets',
  CLASSIFICATIONS: '/classifications',
  COMPLIANCE_RULES: '/compliance-rules',
  ADVANCED_CATALOG: '/advanced-catalog',
  SCAN_LOGIC: '/scan-logic',
  RBAC_SYSTEM: '/rbac-system',
  
  // Racine Core Features
  WORKSPACE: '/workspace',
  WORKFLOWS: '/workflows',
  PIPELINES: '/pipelines',
  AI_ASSISTANT: '/ai-assistant',
  ACTIVITY: '/activity',
  COLLABORATION: '/collaboration',
  USER_MANAGEMENT: '/user-management',
  
  // Dynamic Patterns
  DATA_SOURCE_DETAIL: '/data-sources/:id',
  SCAN_RULE_DETAIL: '/scan-rule-sets/:id',
  CLASSIFICATION_DETAIL: '/classifications/:id',
  COMPLIANCE_RULE_DETAIL: '/compliance-rules/:id',
  CATALOG_ITEM_DETAIL: '/advanced-catalog/:id',
  SCAN_LOGIC_DETAIL: '/scan-logic/:id',
  RBAC_DETAIL: '/rbac-system/:section/:id?',
  WORKSPACE_DETAIL: '/workspace/:workspaceId/:view?/:resourceId?',
  WORKFLOW_DETAIL: '/workflows/:workflowId/:action?',
  PIPELINE_DETAIL: '/pipelines/:pipelineId/:view?',
  AI_CONVERSATION: '/ai-assistant/:conversationId',
  ACTIVITY_DETAIL: '/activity/:activityId/:filter?',
  COLLABORATION_SESSION: '/collaboration/:sessionId/:mode?',
  USER_DETAIL: '/user-management/:section/:userId?'
};

/**
 * Permission requirements for each route pattern
 */
export const ROUTE_PERMISSIONS = {
  [ROUTE_PATTERNS.DASHBOARD]: ['dashboard.read'],
  [ROUTE_PATTERNS.DATA_SOURCES]: ['data_sources.read'],
  [ROUTE_PATTERNS.SCAN_RULE_SETS]: ['scan_rules.read'],
  [ROUTE_PATTERNS.CLASSIFICATIONS]: ['classifications.read'],
  [ROUTE_PATTERNS.COMPLIANCE_RULES]: ['compliance.read'],
  [ROUTE_PATTERNS.ADVANCED_CATALOG]: ['catalog.read'],
  [ROUTE_PATTERNS.SCAN_LOGIC]: ['scan_logic.read'],
  [ROUTE_PATTERNS.RBAC_SYSTEM]: ['rbac.read'],
  [ROUTE_PATTERNS.WORKSPACE]: ['workspace.read'],
  [ROUTE_PATTERNS.WORKFLOWS]: ['workflows.read'],
  [ROUTE_PATTERNS.PIPELINES]: ['pipelines.read'],
  [ROUTE_PATTERNS.AI_ASSISTANT]: ['ai_assistant.read'],
  [ROUTE_PATTERNS.ACTIVITY]: ['activity.read'],
  [ROUTE_PATTERNS.COLLABORATION]: ['collaboration.read'],
  [ROUTE_PATTERNS.USER_MANAGEMENT]: ['users.read']
};

/**
 * Route metadata for SEO and navigation
 */
export const ROUTE_METADATA = {
  [ROUTE_PATTERNS.DASHBOARD]: {
    title: 'Dashboard - Enterprise Data Governance',
    description: 'Real-time analytics and insights dashboard for data governance',
    keywords: ['dashboard', 'analytics', 'data governance', 'metrics']
  },
  [ROUTE_PATTERNS.DATA_SOURCES]: {
    title: 'Data Sources - Enterprise Data Governance',
    description: 'Manage and configure enterprise data sources with advanced governance',
    keywords: ['data sources', 'data management', 'enterprise data']
  },
  [ROUTE_PATTERNS.SCAN_RULE_SETS]: {
    title: 'Scan Rule Sets - Enterprise Data Governance',
    description: 'Advanced scan rule configuration and automated data discovery',
    keywords: ['scan rules', 'data discovery', 'automation']
  },
  [ROUTE_PATTERNS.CLASSIFICATIONS]: {
    title: 'Classifications - Enterprise Data Governance',
    description: 'Intelligent data classification and AI-powered labeling',
    keywords: ['data classification', 'AI labeling', 'data categorization']
  },
  [ROUTE_PATTERNS.COMPLIANCE_RULES]: {
    title: 'Compliance Rules - Enterprise Data Governance',
    description: 'Enterprise compliance management and regulatory controls',
    keywords: ['compliance', 'regulatory', 'governance', 'audit']
  },
  [ROUTE_PATTERNS.ADVANCED_CATALOG]: {
    title: 'Advanced Catalog - Enterprise Data Governance',
    description: 'Intelligent data catalog with AI-powered insights and lineage',
    keywords: ['data catalog', 'metadata', 'data lineage', 'discovery']
  },
  [ROUTE_PATTERNS.SCAN_LOGIC]: {
    title: 'Advanced Scan Logic - Enterprise Data Governance',
    description: 'Intelligent scanning orchestration and automation management',
    keywords: ['scan logic', 'orchestration', 'automation']
  },
  [ROUTE_PATTERNS.RBAC_SYSTEM]: {
    title: 'RBAC System - Enterprise Data Governance',
    description: 'Role-based access control and comprehensive user management',
    keywords: ['RBAC', 'access control', 'user management', 'security']
  },
  [ROUTE_PATTERNS.WORKSPACE]: {
    title: 'Workspace - Enterprise Data Governance',
    description: 'Collaborative workspace management and team orchestration',
    keywords: ['workspace', 'collaboration', 'team management']
  },
  [ROUTE_PATTERNS.WORKFLOWS]: {
    title: 'Job Workflows - Enterprise Data Governance',
    description: 'Advanced workflow builder and job orchestration system',
    keywords: ['workflows', 'job automation', 'orchestration']
  },
  [ROUTE_PATTERNS.PIPELINES]: {
    title: 'Data Pipelines - Enterprise Data Governance',
    description: 'Advanced pipeline designer and data processing management',
    keywords: ['data pipelines', 'ETL', 'data processing']
  },
  [ROUTE_PATTERNS.AI_ASSISTANT]: {
    title: 'AI Assistant - Enterprise Data Governance',
    description: 'Intelligent AI-powered assistance and automated insights',
    keywords: ['AI assistant', 'artificial intelligence', 'automation']
  },
  [ROUTE_PATTERNS.ACTIVITY]: {
    title: 'Activity Tracker - Enterprise Data Governance',
    description: 'Comprehensive activity monitoring and audit trail system',
    keywords: ['activity tracking', 'audit trails', 'monitoring']
  },
  [ROUTE_PATTERNS.COLLABORATION]: {
    title: 'Team Collaboration - Enterprise Data Governance',
    description: 'Real-time team collaboration and communication platform',
    keywords: ['team collaboration', 'communication', 'teamwork']
  },
  [ROUTE_PATTERNS.USER_MANAGEMENT]: {
    title: 'User Management - Enterprise Data Governance',
    description: 'User profiles, settings, and account management system',
    keywords: ['user management', 'profiles', 'account settings']
  }
};

// ============================================================================
// ROUTING UTILITIES
// ============================================================================

/**
 * Utility function to validate route permissions
 */
export const validateRoutePermissions = (
  route: string, 
  userPermissions: string[]
): boolean => {
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  if (!requiredPermissions) return true;
  
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};

/**
 * Utility function to get route metadata
 */
export const getRouteMetadata = (route: string) => {
  return ROUTE_METADATA[route] || {
    title: 'Enterprise Data Governance',
    description: 'Advanced data governance platform',
    keywords: ['data governance', 'enterprise']
  };
};

/**
 * Utility function to match dynamic routes
 */
export const matchDynamicRoute = (
  pattern: string, 
  path: string
): Record<string, string> | null => {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) return null;
  
  const params: Record<string, string> = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    
    if (patternPart.startsWith(':')) {
      const paramName = patternPart.substring(1).replace('?', '');
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  
  return params;
};

/**
 * Utility function to generate breadcrumb items from route
 */
export const generateRouteBreadcrumbs = (route: string) => {
  const parts = route.split('/').filter(part => part.length > 0);
  const breadcrumbs = [];
  
  // Add home
  breadcrumbs.push({
    label: 'Home',
    path: '/',
    isActive: route === '/'
  });
  
  // Add route parts
  for (let i = 0; i < parts.length; i++) {
    const path = '/' + parts.slice(0, i + 1).join('/');
    const label = parts[i]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      path,
      isActive: i === parts.length - 1
    });
  }
  
  return breadcrumbs;
};

// ============================================================================
// ROUTING CONFIGURATION
// ============================================================================

/**
 * Complete routing configuration for the enterprise platform
 */
export const ENTERPRISE_ROUTING_CONFIG = {
  // Core Configuration
  ...DEFAULT_ROUTING_CONFIG,
  
  // Route Patterns
  patterns: ROUTE_PATTERNS,
  
  // Permissions
  permissions: ROUTE_PERMISSIONS,
  
  // Metadata
  metadata: ROUTE_METADATA,
  
  // Guard Configuration
  guards: {
    enableAuthentication: true,
    enableAuthorization: true,
    enableMFA: true,
    enableRateLimit: true,
    enableSecurityContext: true,
    enableWorkspaceAccess: true,
    enableFeatureFlags: true,
    enableMaintenanceMode: true
  },
  
  // Middleware Configuration
  middleware: {
    enablePerformanceMonitoring: true,
    enableAnalytics: true,
    enableSecurityMonitoring: true,
    enableAuditLogging: true,
    enableCaching: true,
    enableRateLimit: true,
    enableRequestValidation: true,
    enableCrossGroupCoordination: true,
    enableResponseCompression: true,
    enableErrorHandling: true
  },
  
  // Deep Link Configuration
  deepLinks: {
    enableAnalytics: true,
    enableSEO: true,
    enableCaching: true,
    cacheTimeout: 300000
  },
  
  // Breadcrumb Configuration
  breadcrumbs: {
    maxItems: 8,
    showIcons: true,
    showHome: true,
    enableCollapsing: true,
    collapseThreshold: 5,
    showTooltips: true,
    enableKeyboardNavigation: true,
    theme: 'default'
  },
  
  // Quick Navigation Configuration
  quickNavigation: {
    maxResults: 20,
    enableKeyboardShortcuts: true,
    enableFuzzySearch: true,
    enableBookmarks: true,
    enableRecents: true,
    enableSuggestions: true,
    debounceDelay: 200,
    theme: 'default'
  }
};

// ============================================================================
// ROUTING HOOKS
// ============================================================================

/**
 * Comprehensive routing hook that provides access to all routing functionality
 */
export const useEnterpriseRouting = () => {
  const routing = useRacineRouting();
  
  return {
    ...routing,
    
    // Convenience methods
    navigate: routing.router.navigate,
    goBack: routing.router.goBack,
    goForward: routing.router.goForward,
    refresh: routing.router.refresh,
    
    // Quick navigation
    openQuickNav: routing.quickNav.openPanel,
    closeQuickNav: routing.quickNav.closePanel,
    
    // Breadcrumb navigation
    navigateToBreadcrumb: routing.breadcrumbs.navigateToBreadcrumb,
    
    // Deep linking
    generateDeepLink: routing.deepLinks.generateDeepLink,
    parseDeepLink: routing.deepLinks.parseDeepLink,
    
    // Security
    executeGuards: routing.guards.executeGuards,
    checkPermissions: routing.guards.checkPermissions,
    
    // Performance
    getPerformanceMetrics: routing.middleware.getPerformanceMetrics,
    getAnalytics: routing.middleware.getAnalytics
  };
};

/**
 * Hook for route-specific functionality
 */
export const useRouteSpecific = (routePattern: string) => {
  const routing = useEnterpriseRouting();
  
  const routeConfig = useMemo(() => ({
    pattern: routePattern,
    permissions: ROUTE_PERMISSIONS[routePattern] || [],
    metadata: ROUTE_METADATA[routePattern] || {}
  }), [routePattern]);
  
  const hasAccess = useCallback((userPermissions: string[]) => {
    return validateRoutePermissions(routePattern, userPermissions);
  }, [routePattern]);
  
  const navigate = useCallback((params?: Record<string, string>) => {
    let path = routePattern;
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
      });
    }
    
    routing.navigate(path);
  }, [routePattern, routing.navigate]);
  
  return {
    config: routeConfig,
    hasAccess,
    navigate,
    ...routing
  };
};

// ============================================================================
// ROUTING PROVIDERS WRAPPER
// ============================================================================

// RacineRouterProvider is now imported from './RacineRouterProvider'

/**
 * Master routing provider that wraps all routing functionality
 */
interface MasterRoutingProviderProps {
  children: React.ReactNode;
  config?: Partial<typeof ENTERPRISE_ROUTING_CONFIG>;
}

export const MasterRoutingProvider: React.FC<MasterRoutingProviderProps> = ({
  children,
  config = {}
}) => {
  const finalConfig = { ...ENTERPRISE_ROUTING_CONFIG, ...config };
  
  return createRoutingProvider(children, {
    router: finalConfig,
    guards: finalConfig.guards,
    middleware: finalConfig.middleware,
    deepLinks: finalConfig.deepLinks,
    breadcrumbs: finalConfig.breadcrumbs,
    quickNavigation: finalConfig.quickNavigation
  });
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Providers
  MasterRoutingProvider,
  RacineRouterProvider,
  RouteGuardsProvider,
  RouteMiddlewareProvider,
  DeepLinkManagerProvider,
  BreadcrumbManagerProvider,
  QuickNavigationProvider,
  
  // Components
  RacineRouter,
  RouteGuard,
  RouteMiddleware,
  SmartLink,
  BreadcrumbNavigation,
  QuickNavigationPanel,
  QuickNavigationTrigger,
  
  // Hooks
  useRacineRouting,
  useEnterpriseRouting,
  useRouteSpecific,
  
  // Utilities
  createRoutingProvider,
  validateRoutePermissions,
  getRouteMetadata,
  matchDynamicRoute,
  generateRouteBreadcrumbs,
  
  // Configuration
  ENTERPRISE_ROUTING_CONFIG,
  ROUTE_PATTERNS,
  ROUTE_PERMISSIONS,
  ROUTE_METADATA
};