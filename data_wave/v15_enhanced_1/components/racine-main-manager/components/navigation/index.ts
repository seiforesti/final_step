/**
 * 🧭 NAVIGATION MODULE INDEX - ENTERPRISE NAVIGATION SYSTEM EXPORTS
 * ===================================================================
 * 
 * Central export hub for all navigation-related components, hooks, types,
 * and utilities in the Racine Main Manager navigation system. Provides
 * intelligent, adaptive navigation across the data governance platform.
 * 
 * Architecture:
 * - Global intelligent navigation components
 * - Context-aware navigation utilities
 * - Cross-group navigation orchestration
 * - Real-time navigation updates
 * - Performance-optimized navigation
 * 
 * Components Exported:
 * - AppNavbar: Global intelligent navbar with role-based adaptation
 * - AppSidebar: Adaptive sidebar with cross-group orchestration
 * - ContextualBreadcrumbs: Smart breadcrumb navigation system
 * - GlobalSearchInterface: Unified search across all resources
 * - QuickActionsPanel: Rapid access to common actions
 * - NotificationCenter: Real-time notification management
 * - NavigationAnalytics: Navigation behavior analytics
 * 
 * Integration:
 * - Seamless RBAC integration with role-based visibility
 * - Real-time updates with WebSocket integration
 * - Cross-group state synchronization
 * - Performance monitoring and optimization
 * - Accessibility compliance (WCAG 2.1 AA/AAA)
 */

// ============================================================================
// CORE NAVIGATION COMPONENTS
// ============================================================================

// Global Navigation Bar
export { default as AppNavbar } from './AppNavbar';
export { 
  AppNavbar,
  useNavbarState,
  useNavbarConfiguration,
  useNavbarAnalytics,
  NavbarSearchInterface,
  NavbarNotifications,
  NavbarUserMenu,
  NavbarWorkspaceSelector,
  NavbarQuickActions,
  NavbarSystemStatus
} from './AppNavbar';

// Adaptive Sidebar
export { default as AppSidebar } from './AppSidebar';
export { 
  AppSidebar,
  useSidebarState,
  useSidebarConfiguration,
  useSidebarAnalytics,
  SidebarGroupSection,
  SidebarNavigationItem,
  SidebarQuickAccess,
  SidebarCollapsibleSection,
  SidebarSearchFilter,
  SidebarCustomization
} from './AppSidebar';

// Contextual Breadcrumbs
export { default as ContextualBreadcrumbs } from './ContextualBreadcrumbs';
export { 
  ContextualBreadcrumbs,
  useBreadcrumbsState,
  useBreadcrumbsConfiguration,
  useBreadcrumbsAnalytics,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbDropdown,
  BreadcrumbHistory,
  BreadcrumbCustomization
} from './ContextualBreadcrumbs';

// Global Search Interface
export { default as GlobalSearchInterface } from './GlobalSearchInterface';
export { 
  GlobalSearchInterface,
  useGlobalSearch,
  useSearchConfiguration,
  useSearchAnalytics,
  SearchResultItem,
  SearchFilters,
  SearchSuggestions,
  SearchHistory,
  SearchPreferences,
  AdvancedSearchDialog
} from './GlobalSearchInterface';

// Quick Actions Panel
export { default as QuickActionsPanel } from './QuickActionsPanel';
export { 
  QuickActionsPanel,
  useQuickActions,
  useQuickActionsConfiguration,
  useQuickActionsAnalytics,
  QuickActionItem,
  QuickActionCategory,
  QuickActionShortcut,
  QuickActionCustomization,
  QuickActionHistory
} from './QuickActionsPanel';

// Notification Center
export { default as NotificationCenter } from './NotificationCenter';
export { 
  NotificationCenter,
  useNotifications,
  useNotificationConfiguration,
  useNotificationAnalytics,
  NotificationItem,
  NotificationFilters,
  NotificationPreferences,
  NotificationHistory,
  NotificationRealTimeUpdates,
  NotificationCategories
} from './NotificationCenter';

// Navigation Analytics
export { default as NavigationAnalytics } from './NavigationAnalytics';
export { 
  NavigationAnalytics,
  useNavigationAnalytics,
  useNavigationMetrics,
  useNavigationReporting,
  NavigationMetricsDisplay,
  NavigationHeatmap,
  NavigationFlowDiagram,
  NavigationPerformanceMetrics,
  NavigationUserBehavior,
  NavigationOptimizationSuggestions
} from './NavigationAnalytics';

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

// Navbar Types
export type { 
  NavbarConfiguration,
  NavbarState,
  NavbarAnalyticsData,
  NavbarMenuItem,
  NavbarNotification,
  NavbarUserProfile,
  NavbarWorkspace,
  NavbarSystemHealth
} from './AppNavbar';

// Sidebar Types
export type { 
  SidebarConfiguration,
  SidebarState,
  SidebarAnalyticsData,
  SidebarGroup,
  SidebarNavigationItem as SidebarNavItem,
  SidebarQuickAccessItem,
  SidebarCustomization as SidebarCustomizationType
} from './AppSidebar';

// Breadcrumbs Types
export type { 
  BreadcrumbsConfiguration,
  BreadcrumbsState,
  BreadcrumbsAnalyticsData,
  BreadcrumbItem as ContextualBreadcrumbItem,
  BreadcrumbHistory as BreadcrumbHistoryType
} from './ContextualBreadcrumbs';

// Global Search Types
export type { 
  GlobalSearchConfiguration,
  GlobalSearchState,
  GlobalSearchAnalyticsData,
  SearchResult,
  SearchFilter,
  SearchSuggestion,
  SearchPreference,
  AdvancedSearchOptions
} from './GlobalSearchInterface';

// Quick Actions Types
export type { 
  QuickActionsConfiguration,
  QuickActionsState,
  QuickActionsAnalyticsData,
  QuickAction,
  QuickActionCategory as QuickActionCategoryType,
  QuickActionShortcut as QuickActionShortcutType
} from './QuickActionsPanel';

// Notification Types
export type { 
  NotificationConfiguration,
  NotificationState,
  NotificationAnalyticsData,
  Notification,
  NotificationFilter,
  NotificationPreference,
  NotificationCategory,
  NotificationRealTimeUpdate
} from './NotificationCenter';

// Navigation Analytics Types
export type { 
  NavigationAnalyticsConfiguration,
  NavigationAnalyticsData,
  NavigationMetrics,
  NavigationHeatmapData,
  NavigationFlowData,
  NavigationPerformanceData,
  NavigationUserBehaviorData,
  NavigationOptimizationSuggestion
} from './NavigationAnalytics';

// ============================================================================
// NAVIGATION UTILITIES
// ============================================================================

/**
 * Creates a complete navigation provider that wraps all navigation functionality
 */
export const createNavigationProvider = (
  children: React.ReactNode,
  config?: {
    navbar?: any;
    sidebar?: any;
    breadcrumbs?: any;
    search?: any;
    quickActions?: any;
    notifications?: any;
    analytics?: any;
  }
) => {
  // Navigation providers would be implemented in individual components
  // This is a placeholder for the provider wrapper pattern
  return children;
};

/**
 * Hook for accessing all navigation functionality
 */
export const useNavigationSystem = () => {
  // This would combine all navigation hooks when they're implemented
  return {
    navbar: null, // useNavbarState(),
    sidebar: null, // useSidebarState(),
    breadcrumbs: null, // useBreadcrumbsState(),
    search: null, // useGlobalSearch(),
    quickActions: null, // useQuickActions(),
    notifications: null, // useNotifications(),
    analytics: null // useNavigationAnalytics()
  };
};

// ============================================================================
// NAVIGATION CONSTANTS
// ============================================================================

/**
 * Default navigation configuration for the enterprise platform
 */
export const DEFAULT_NAVIGATION_CONFIG = {
  // Global Settings
  enableRoleBasedNavigation: true,
  enableRealTimeUpdates: true,
  enableAnalytics: true,
  enableAccessibility: true,
  enableKeyboardNavigation: true,
  enableMobileOptimization: true,
  
  // Navbar Configuration
  navbar: {
    showLogo: true,
    showGlobalSearch: true,
    showNotifications: true,
    showUserMenu: true,
    showWorkspaceSelector: true,
    showQuickActions: true,
    showSystemStatus: true,
    enableCustomization: true,
    theme: 'default',
    position: 'top',
    height: 64
  },
  
  // Sidebar Configuration
  sidebar: {
    defaultWidth: 280,
    minWidth: 200,
    maxWidth: 400,
    enableCollapse: true,
    enableResize: true,
    showGroupSections: true,
    showQuickAccess: true,
    showSearchFilter: true,
    enableCustomization: true,
    theme: 'default',
    position: 'left'
  },
  
  // Breadcrumbs Configuration
  breadcrumbs: {
    maxItems: 6,
    showIcons: true,
    showHome: true,
    enableCollapsing: true,
    enableTooltips: true,
    enableHistory: true,
    theme: 'default'
  },
  
  // Global Search Configuration
  globalSearch: {
    enableFuzzySearch: true,
    enableFilters: true,
    enableSuggestions: true,
    enableHistory: true,
    maxResults: 50,
    debounceDelay: 300,
    theme: 'default'
  },
  
  // Quick Actions Configuration
  quickActions: {
    maxVisible: 8,
    enableShortcuts: true,
    enableCustomization: true,
    enableCategories: true,
    enableHistory: true,
    theme: 'default'
  },
  
  // Notifications Configuration
  notifications: {
    enableRealTime: true,
    enableFilters: true,
    enableCategories: true,
    enableHistory: true,
    maxVisible: 20,
    autoMarkAsRead: false,
    theme: 'default'
  },
  
  // Analytics Configuration
  analytics: {
    enableTracking: true,
    enableHeatmap: true,
    enableFlowDiagram: true,
    enablePerformanceMetrics: true,
    enableUserBehavior: true,
    enableOptimizationSuggestions: true
  }
};

/**
 * Navigation group definitions for the data governance platform
 */
export const NAVIGATION_GROUPS = {
  // Core Groups
  CORE: {
    id: 'core',
    label: 'Core',
    icon: 'home',
    order: 1,
    items: ['dashboard', 'workspace', 'ai-assistant']
  },
  
  // Data Management Groups
  DATA_MANAGEMENT: {
    id: 'data_management',
    label: 'Data Management',
    icon: 'database',
    order: 2,
    items: ['data-sources', 'advanced-catalog']
  },
  
  // Scanning & Classification Groups
  SCANNING: {
    id: 'scanning',
    label: 'Scanning & Classification',
    icon: 'radar',
    order: 3,
    items: ['scan-rule-sets', 'scan-logic', 'classifications']
  },
  
  // Compliance & Governance Groups
  COMPLIANCE: {
    id: 'compliance',
    label: 'Compliance & Governance',
    icon: 'shield',
    order: 4,
    items: ['compliance-rules', 'rbac-system']
  },
  
  // Automation & Workflows Groups
  AUTOMATION: {
    id: 'automation',
    label: 'Automation & Workflows',
    icon: 'workflow',
    order: 5,
    items: ['workflows', 'pipelines']
  },
  
  // Collaboration & Monitoring Groups
  COLLABORATION: {
    id: 'collaboration',
    label: 'Collaboration & Monitoring',
    icon: 'users',
    order: 6,
    items: ['collaboration', 'activity', 'user-management']
  }
};

/**
 * Quick action definitions for rapid access
 */
export const QUICK_ACTIONS = {
  // Creation Actions
  CREATE_WORKSPACE: {
    id: 'create_workspace',
    label: 'Create Workspace',
    icon: 'plus',
    category: 'creation',
    shortcut: ['cmd', 'shift', 'w'],
    permissions: ['workspace.create']
  },
  
  CREATE_WORKFLOW: {
    id: 'create_workflow',
    label: 'Create Workflow',
    icon: 'workflow',
    category: 'creation',
    shortcut: ['cmd', 'shift', 'f'],
    permissions: ['workflows.create']
  },
  
  CREATE_PIPELINE: {
    id: 'create_pipeline',
    label: 'Create Pipeline',
    icon: 'git-branch',
    category: 'creation',
    shortcut: ['cmd', 'shift', 'p'],
    permissions: ['pipelines.create']
  },
  
  // Data Actions
  SCAN_DATA_SOURCE: {
    id: 'scan_data_source',
    label: 'Scan Data Source',
    icon: 'radar',
    category: 'data',
    shortcut: ['cmd', 'shift', 's'],
    permissions: ['scan.execute']
  },
  
  CLASSIFY_DATA: {
    id: 'classify_data',
    label: 'Classify Data',
    icon: 'file-text',
    category: 'data',
    shortcut: ['cmd', 'shift', 'c'],
    permissions: ['classifications.execute']
  },
  
  // System Actions
  GLOBAL_SEARCH: {
    id: 'global_search',
    label: 'Global Search',
    icon: 'search',
    category: 'system',
    shortcut: ['cmd', 'k'],
    permissions: []
  },
  
  SYSTEM_HEALTH: {
    id: 'system_health',
    label: 'System Health',
    icon: 'activity',
    category: 'system',
    shortcut: ['cmd', 'shift', 'h'],
    permissions: ['system.monitor']
  },
  
  USER_SETTINGS: {
    id: 'user_settings',
    label: 'User Settings',
    icon: 'settings',
    category: 'user',
    shortcut: ['cmd', ','],
    permissions: []
  }
};

/**
 * Notification categories and types
 */
export const NOTIFICATION_CATEGORIES = {
  SYSTEM: {
    id: 'system',
    label: 'System',
    icon: 'bell',
    priority: 'high',
    color: 'blue'
  },
  
  SECURITY: {
    id: 'security',
    label: 'Security',
    icon: 'shield',
    priority: 'critical',
    color: 'red'
  },
  
  COMPLIANCE: {
    id: 'compliance',
    label: 'Compliance',
    icon: 'check-circle',
    priority: 'high',
    color: 'green'
  },
  
  WORKFLOW: {
    id: 'workflow',
    label: 'Workflow',
    icon: 'workflow',
    priority: 'medium',
    color: 'orange'
  },
  
  COLLABORATION: {
    id: 'collaboration',
    label: 'Collaboration',
    icon: 'message-circle',
    priority: 'low',
    color: 'purple'
  },
  
  DATA: {
    id: 'data',
    label: 'Data',
    icon: 'database',
    priority: 'medium',
    color: 'cyan'
  }
};

// ============================================================================
// NAVIGATION UTILITIES
// ============================================================================

/**
 * Utility function to filter navigation items based on user permissions
 */
export const filterNavigationByPermissions = (
  items: any[], 
  userPermissions: string[]
): any[] => {
  return items.filter(item => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return item.permissions.some((permission: string) => 
      userPermissions.includes(permission)
    );
  });
};

/**
 * Utility function to get navigation group by route
 */
export const getNavigationGroupByRoute = (route: string): string | null => {
  for (const [groupKey, group] of Object.entries(NAVIGATION_GROUPS)) {
    if (group.items.some(item => route.includes(item))) {
      return group.id;
    }
  }
  return null;
};

/**
 * Utility function to generate navigation breadcrumbs
 */
export const generateNavigationBreadcrumbs = (route: string) => {
  const parts = route.split('/').filter(part => part.length > 0);
  const breadcrumbs = [];
  
  // Add home
  breadcrumbs.push({
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'home',
    isActive: route === '/'
  });
  
  // Add route parts
  for (let i = 0; i < parts.length; i++) {
    const path = '/' + parts.slice(0, i + 1).join('/');
    const part = parts[i];
    
    // Convert kebab-case to title case
    const label = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Get icon for this part
    const icon = getIconForNavigationItem(part);
    
    breadcrumbs.push({
      id: `breadcrumb_${i}`,
      label,
      path,
      icon,
      isActive: i === parts.length - 1
    });
  }
  
  return breadcrumbs;
};

/**
 * Utility function to get icon for navigation item
 */
export const getIconForNavigationItem = (item: string): string => {
  const iconMap: Record<string, string> = {
    'dashboard': 'bar-chart-3',
    'data-sources': 'database',
    'scan-rule-sets': 'radar',
    'classifications': 'file-text',
    'compliance-rules': 'shield',
    'advanced-catalog': 'layers',
    'scan-logic': 'target',
    'rbac-system': 'users',
    'workspace': 'building-2',
    'workflows': 'workflow',
    'pipelines': 'git-branch',
    'ai-assistant': 'bot',
    'activity': 'activity',
    'collaboration': 'message-circle',
    'user-management': 'settings'
  };
  
  return iconMap[item] || 'navigation';
};

/**
 * Utility function to validate navigation access
 */
export const validateNavigationAccess = (
  navigationItem: any,
  userContext: {
    permissions: string[];
    roles: string[];
    workspaces: string[];
  }
): boolean => {
  // Check permissions
  if (navigationItem.permissions && navigationItem.permissions.length > 0) {
    const hasPermission = navigationItem.permissions.some((permission: string) =>
      userContext.permissions.includes(permission)
    );
    if (!hasPermission) return false;
  }
  
  // Check roles
  if (navigationItem.roles && navigationItem.roles.length > 0) {
    const hasRole = navigationItem.roles.some((role: string) =>
      userContext.roles.includes(role)
    );
    if (!hasRole) return false;
  }
  
  // Check workspace access
  if (navigationItem.workspaces && navigationItem.workspaces.length > 0) {
    const hasWorkspaceAccess = navigationItem.workspaces.some((workspace: string) =>
      userContext.workspaces.includes(workspace)
    );
    if (!hasWorkspaceAccess) return false;
  }
  
  return true;
};

/**
 * Utility function to sort navigation items by priority and usage
 */
export const sortNavigationItems = (
  items: any[],
  sortBy: 'priority' | 'usage' | 'alphabetical' | 'recent' = 'priority'
): any[] => {
  switch (sortBy) {
    case 'priority':
      return [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    case 'usage':
      return [...items].sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
    
    case 'alphabetical':
      return [...items].sort((a, b) => a.label.localeCompare(b.label));
    
    case 'recent':
      return [...items].sort((a, b) => {
        const aTime = new Date(a.lastAccessed || 0).getTime();
        const bTime = new Date(b.lastAccessed || 0).getTime();
        return bTime - aTime;
      });
    
    default:
      return items;
  }
};

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

/**
 * Complete navigation configuration for the enterprise platform
 */
export const ENTERPRISE_NAVIGATION_CONFIG = {
  // Core Configuration
  ...DEFAULT_NAVIGATION_CONFIG,
  
  // Navigation Groups
  groups: NAVIGATION_GROUPS,
  
  // Quick Actions
  quickActions: QUICK_ACTIONS,
  
  // Notification Categories
  notificationCategories: NOTIFICATION_CATEGORIES,
  
  // Performance Settings
  performance: {
    enableVirtualization: true,
    enableLazyLoading: true,
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    maxCacheSize: 100
  },
  
  // Accessibility Settings
  accessibility: {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableHighContrast: true,
    enableReducedMotion: true,
    enableFocusIndicators: true
  },
  
  // Security Settings
  security: {
    enablePermissionFiltering: true,
    enableRoleBasedAccess: true,
    enableWorkspaceIsolation: true,
    enableAuditLogging: true
  }
};

// ============================================================================
// NAVIGATION HOOKS
// ============================================================================

/**
 * Comprehensive navigation hook that provides access to all navigation functionality
 */
export const useEnterpriseNavigation = () => {
  const navigation = useNavigationSystem();
  
  return {
    ...navigation,
    
    // Convenience methods
    openGlobalSearch: () => {
      // Would open global search interface
      console.log('Opening global search...');
    },
    
    toggleSidebar: () => {
      // Would toggle sidebar visibility
      console.log('Toggling sidebar...');
    },
    
    openNotifications: () => {
      // Would open notification center
      console.log('Opening notifications...');
    },
    
    openQuickActions: () => {
      // Would open quick actions panel
      console.log('Opening quick actions...');
    },
    
    navigateToGroup: (groupId: string) => {
      // Would navigate to specific group
      console.log(`Navigating to group: ${groupId}`);
    },
    
    // Analytics methods
    trackNavigation: (event: string, metadata?: any) => {
      // Would track navigation events
      console.log(`Tracking navigation: ${event}`, metadata);
    },
    
    getNavigationMetrics: () => {
      // Would return navigation analytics
      return {};
    }
  };
};

/**
 * Hook for group-specific navigation
 */
export const useGroupNavigation = (groupId: string) => {
  const navigation = useEnterpriseNavigation();
  
  const groupConfig = useMemo(() => {
    return NAVIGATION_GROUPS[groupId as keyof typeof NAVIGATION_GROUPS] || null;
  }, [groupId]);
  
  const navigateToItem = useCallback((itemId: string) => {
    if (groupConfig) {
      const path = `/${itemId}`;
      navigation.trackNavigation('group_item_navigation', {
        groupId,
        itemId,
        path
      });
      // Would navigate to the specific item
      console.log(`Navigating to ${path}`);
    }
  }, [groupConfig, groupId, navigation]);
  
  return {
    group: groupConfig,
    navigateToItem,
    ...navigation
  };
};

// ============================================================================
// NAVIGATION PROVIDERS WRAPPER
// ============================================================================

/**
 * Master navigation provider that wraps all navigation functionality
 */
interface MasterNavigationProviderProps {
  children: React.ReactNode;
  config?: Partial<typeof ENTERPRISE_NAVIGATION_CONFIG>;
}

export const MasterNavigationProvider: React.FC<MasterNavigationProviderProps> = ({
  children,
  config = {}
}) => {
  const finalConfig = { ...ENTERPRISE_NAVIGATION_CONFIG, ...config };
  
  return createNavigationProvider(children, {
    navbar: finalConfig.navbar,
    sidebar: finalConfig.sidebar,
    breadcrumbs: finalConfig.breadcrumbs,
    search: finalConfig.globalSearch,
    quickActions: finalConfig.quickActions,
    notifications: finalConfig.notifications,
    analytics: finalConfig.analytics
  });
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Providers
  MasterNavigationProvider,
  
  // Components
  AppNavbar,
  AppSidebar,
  ContextualBreadcrumbs,
  GlobalSearchInterface,
  QuickActionsPanel,
  NotificationCenter,
  NavigationAnalytics,
  
  // Hooks
  useNavigationSystem,
  useEnterpriseNavigation,
  useGroupNavigation,
  
  // Utilities
  createNavigationProvider,
  filterNavigationByPermissions,
  getNavigationGroupByRoute,
  generateNavigationBreadcrumbs,
  getIconForNavigationItem,
  validateNavigationAccess,
  sortNavigationItems,
  
  // Configuration
  ENTERPRISE_NAVIGATION_CONFIG,
  NAVIGATION_GROUPS,
  QUICK_ACTIONS,
  NOTIFICATION_CATEGORIES
};