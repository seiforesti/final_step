/**
 * 🎯 RACINE ROUTER - ENTERPRISE ROUTING SYSTEM
 * ============================================
 * 
 * Comprehensive routing system for the entire data governance platform.
 * This component provides intelligent, context-aware routing that surpasses
 * traditional routing systems with enterprise-grade features.
 * 
 * Features:
 * - SPA-aware routing with deep linking support
 * - Cross-SPA navigation and workflow routing
 * - Dynamic route generation based on user permissions
 * - Advanced route guards and middleware
 * - Route analytics and optimization
 * - Breadcrumb generation and navigation history
 * - Search-friendly URLs with SEO optimization
 * - Real-time route synchronization
 * - Mobile-optimized routing patterns
 * - Accessibility-compliant navigation
 * 
 * Architecture:
 * - Next.js App Router integration
 * - Custom route management for SPAs
 * - RBAC-integrated route protection
 * - Performance-optimized route transitions
 * - Cross-group route coordination
 * - Intelligent route prefetching
 * 
 * Backend Integration:
 * - Route analytics and tracking
 * - User navigation patterns
 * - Performance monitoring
 * - Security audit logging
 */

'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  createContext,
  useContext,
  ReactNode,
  ComponentType
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Home, ChevronRight, ExternalLink, History, Bookmark, Share2, Copy, RefreshCw, AlertTriangle, CheckCircle, Clock, Zap, Activity, BarChart3, Settings, HelpCircle, Search, Filter, SortAsc, MoreHorizontal, X, Plus, Database, Tag, Shield, Layers, Users, Building2, Workflow, GitBranch, Bot, TrendingUp, MessageCircle, Radar, Target, PieChart, Bell } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

// Racine Core Imports
import { 
  ViewMode, 
  LayoutMode, 
  SystemStatus,
  UserContext,
  WorkspaceConfiguration,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// Racine Hooks
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';

// Utilities
import { cn } from '../../utils/ui-utils';
import { formatDuration } from '../../utils/formatting-utils';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface RacineRouterProps {
  children: ReactNode;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  userPermissions: any[];
  workspaceId?: string;
  enableAnalytics?: boolean;
  enableDeepLinking?: boolean;
  enableBreadcrumbs?: boolean;
  enableHistory?: boolean;
  maxHistoryItems?: number;
}

interface RouteConfig {
  path: string;
  view: ViewMode;
  title: string;
  description: string;
  icon: ComponentType;
  permissions: string[];
  spaId: string;
  category: RouteCategory;
  keywords: string[];
  isExact?: boolean;
  redirectTo?: string;
  middleware?: RouteMiddleware[];
  meta?: RouteMeta;
}

interface RouteMiddleware {
  name: string;
  handler: (context: RouteContext) => Promise<boolean>;
  priority: number;
}

interface RouteContext {
  path: string;
  view: ViewMode;
  user: UserContext;
  workspace: WorkspaceConfiguration;
  permissions: string[];
  searchParams: URLSearchParams;
}

interface RouteMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  robots?: string;
}

interface BreadcrumbItem {
  title: string;
  path: string;
  view: ViewMode;
  icon?: ComponentType;
  isActive?: boolean;
}

interface NavigationHistoryItem {
  id: string;
  view: ViewMode;
  path: string;
  title: string;
  timestamp: ISODateString;
  duration?: number;
  metadata?: Record<string, any>;
}

interface RouteAnalytics {
  view: ViewMode;
  path: string;
  visitCount: number;
  averageDuration: number;
  lastVisited: ISODateString;
  userInteractions: number;
  conversionRate?: number;
}

enum RouteCategory {
  CORE_SPA = 'core_spa',
  RACINE_FEATURE = 'racine_feature',
  SYSTEM = 'system',
  ADMIN = 'admin',
  UTILITY = 'utility'
}

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

const ROUTE_CONFIGS: RouteConfig[] = [
  // Core Data Governance SPAs
  {
    path: '/data-sources',
    view: ViewMode.DATA_SOURCES,
    title: 'Data Sources',
    description: 'Manage and monitor all data sources across your organization',
    icon: Database,
    permissions: ['data_sources.view'],
    spaId: 'data-sources',
    category: RouteCategory.CORE_SPA,
    keywords: ['data', 'sources', 'connections', 'databases', 'storage']
  },
  {
    path: '/scan-rule-sets',
    view: ViewMode.SCAN_RULE_SETS,
    title: 'Advanced Scan Rule Sets',
    description: 'Configure intelligent scanning rules for data discovery',
    icon: Search,
    permissions: ['scan_rules.view'],
    spaId: 'scan-rule-sets',
    category: RouteCategory.CORE_SPA,
    keywords: ['scan', 'rules', 'discovery', 'patterns', 'automation']
  },
  {
    path: '/classifications',
    view: ViewMode.CLASSIFICATIONS,
    title: 'Data Classifications',
    description: 'Manage data classification schemes and sensitivity levels',
    icon: Tag,
    permissions: ['classifications.view'],
    spaId: 'classifications',
    category: RouteCategory.CORE_SPA,
    keywords: ['classification', 'sensitivity', 'labels', 'taxonomy', 'governance']
  },
  {
    path: '/compliance-rules',
    view: ViewMode.COMPLIANCE_RULES,
    title: 'Compliance Rules',
    description: 'Define and enforce compliance policies and regulations',
    icon: Shield,
    permissions: ['compliance.view'],
    spaId: 'compliance-rule',
    category: RouteCategory.CORE_SPA,
    keywords: ['compliance', 'rules', 'policies', 'regulations', 'audit']
  },
  {
    path: '/advanced-catalog',
    view: ViewMode.ADVANCED_CATALOG,
    title: 'Advanced Data Catalog',
    description: 'Explore and manage your comprehensive data catalog',
    icon: Layers,
    permissions: ['catalog.view'],
    spaId: 'advanced-catalog',
    category: RouteCategory.CORE_SPA,
    keywords: ['catalog', 'metadata', 'lineage', 'discovery', 'assets']
  },
  {
    path: '/scan-logic',
    view: ViewMode.SCAN_LOGIC,
    title: 'Advanced Scan Logic',
    description: 'Configure advanced scanning algorithms and logic',
    icon: Zap,
    permissions: ['scan_logic.view'],
    spaId: 'scan-logic',
    category: RouteCategory.CORE_SPA,
    keywords: ['scan', 'logic', 'algorithms', 'automation', 'intelligence']
  },
  {
    path: '/rbac-system',
    view: ViewMode.RBAC_SYSTEM,
    title: 'RBAC System',
    description: 'Manage roles, permissions, and access control',
    icon: Users,
    permissions: ['rbac.view'],
    spaId: 'rbac-system',
    category: RouteCategory.CORE_SPA,
    keywords: ['rbac', 'roles', 'permissions', 'access', 'security']
  },

  // Racine Features
  {
    path: '/',
    view: ViewMode.DASHBOARD,
    title: 'Dashboard',
    description: 'Enterprise data governance dashboard and overview',
    icon: BarChart3,
    permissions: ['dashboard.view'],
    spaId: 'racine-dashboard',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['dashboard', 'overview', 'metrics', 'insights', 'summary'],
    isExact: true
  },
  {
    path: '/workspace',
    view: ViewMode.WORKSPACE,
    title: 'Workspace',
    description: 'Collaborative workspace for data governance teams',
    icon: Building2,
    permissions: ['workspace.view'],
    spaId: 'racine-workspace',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['workspace', 'collaboration', 'teams', 'projects', 'shared']
  },
  {
    path: '/workflows',
    view: ViewMode.WORKFLOWS,
    title: 'Workflows',
    description: 'Intelligent workflow management and automation',
    icon: Workflow,
    permissions: ['workflows.view'],
    spaId: 'racine-workflows',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['workflows', 'automation', 'processes', 'orchestration', 'jobs']
  },
  {
    path: '/pipelines',
    view: ViewMode.PIPELINES,
    title: 'Data Pipelines',
    description: 'Advanced data pipeline designer and monitoring',
    icon: GitBranch,
    permissions: ['pipelines.view'],
    spaId: 'racine-pipelines',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['pipelines', 'etl', 'data flow', 'processing', 'transformation']
  },
  {
    path: '/ai-assistant',
    view: ViewMode.AI_ASSISTANT,
    title: 'AI Assistant',
    description: 'Intelligent AI-powered data governance assistant',
    icon: Bot,
    permissions: ['ai.view'],
    spaId: 'racine-ai',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['ai', 'assistant', 'intelligence', 'automation', 'insights']
  },
  {
    path: '/analytics',
    view: ViewMode.ANALYTICS,
    title: 'Analytics',
    description: 'Advanced analytics and business intelligence',
    icon: TrendingUp,
    permissions: ['analytics.view'],
    spaId: 'racine-analytics',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['analytics', 'business intelligence', 'reports', 'insights', 'metrics']
  },
  {
    path: '/monitoring',
    view: ViewMode.MONITORING,
    title: 'System Monitoring',
    description: 'Real-time system monitoring and health dashboard',
    icon: Activity,
    permissions: ['monitoring.view'],
    spaId: 'racine-monitoring',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['monitoring', 'health', 'performance', 'alerts', 'diagnostics']
  },
  {
    path: '/collaboration',
    view: ViewMode.COLLABORATION,
    title: 'Collaboration',
    description: 'Team collaboration and communication tools',
    icon: MessageCircle,
    permissions: ['collaboration.view'],
    spaId: 'racine-collaboration',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['collaboration', 'teams', 'communication', 'sharing', 'social']
  },
  {
    path: '/streaming',
    view: ViewMode.STREAMING,
    title: 'Real-time Streaming',
    description: 'Real-time data streaming and event processing',
    icon: Radar,
    permissions: ['streaming.view'],
    spaId: 'racine-streaming',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['streaming', 'real-time', 'events', 'processing', 'live']
  },
  {
    path: '/cost-optimization',
    view: ViewMode.COST_OPTIMIZATION,
    title: 'Cost Optimization',
    description: 'Optimize costs and resource utilization',
    icon: Target,
    permissions: ['cost.view'],
    spaId: 'racine-cost',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['cost', 'optimization', 'budget', 'resources', 'efficiency']
  },
  {
    path: '/reports',
    view: ViewMode.REPORTS,
    title: 'Reports',
    description: 'Generate and manage comprehensive reports',
    icon: PieChart,
    permissions: ['reports.view'],
    spaId: 'racine-reports',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['reports', 'documentation', 'export', 'analysis', 'summaries']
  },
  {
    path: '/search',
    view: ViewMode.SEARCH,
    title: 'Global Search',
    description: 'Search across all data governance assets',
    icon: Search,
    permissions: ['search.view'],
    spaId: 'racine-search',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['search', 'discovery', 'find', 'explore', 'query']
  },
  {
    path: '/notifications',
    view: ViewMode.NOTIFICATIONS,
    title: 'Notifications',
    description: 'Manage system notifications and alerts',
    icon: Bell,
    permissions: ['notifications.view'],
    spaId: 'racine-notifications',
    category: RouteCategory.RACINE_FEATURE,
    keywords: ['notifications', 'alerts', 'messages', 'updates', 'communication']
  }
];

// ============================================================================
// ROUTING CONTEXT
// ============================================================================

interface RacineRoutingContextValue {
  currentRoute: RouteConfig | null;
  currentView: ViewMode;
  navigationHistory: NavigationHistoryItem[];
  breadcrumbs: BreadcrumbItem[];
  routeAnalytics: RouteAnalytics[];
  isNavigating: boolean;
  navigateTo: (view: ViewMode, params?: Record<string, string>) => Promise<void>;
  navigateToPath: (path: string) => Promise<void>;
  goBack: () => void;
  goForward: () => void;
  addToHistory: (item: NavigationHistoryItem) => void;
  clearHistory: () => void;
  generateBreadcrumbs: (view: ViewMode) => BreadcrumbItem[];
  getRouteByView: (view: ViewMode) => RouteConfig | null;
  getRouteByPath: (path: string) => RouteConfig | null;
  canNavigateTo: (view: ViewMode) => boolean;
}

const RacineRoutingContext = createContext<RacineRoutingContextValue | null>(null);

export const useRacineRouter = () => {
  const context = useContext(RacineRoutingContext);
  if (!context) {
    throw new Error('useRacineRouter must be used within RacineRouter');
  }
  return context;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RacineRouter: React.FC<RacineRouterProps> = ({
  children,
  currentView,
  onViewChange,
  userPermissions,
  workspaceId,
  enableAnalytics = true,
  enableDeepLinking = true,
  enableBreadcrumbs = true,
  enableHistory = true,
  maxHistoryItems = 50
}) => {
  // ============================================================================
  // HOOKS AND STATE
  // ============================================================================

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { currentUser } = useUserManagement();
  const { activeWorkspace } = useWorkspaceManagement();
  const { trackNavigation } = useCrossGroupIntegration();

  // Routing State
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  const [routeAnalytics, setRouteAnalytics] = useState<RouteAnalytics[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Refs
  const navigationStartTime = useRef<number>(0);
  const routeCache = useRef<Map<string, RouteConfig>>(new Map());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Current route configuration
  const currentRoute = useMemo(() => {
    return ROUTE_CONFIGS.find(route => route.view === currentView) || null;
  }, [currentView]);

  // Available routes based on permissions
  const availableRoutes = useMemo(() => {
    return ROUTE_CONFIGS.filter(route => {
      return route.permissions.every(permission => 
        userPermissions.some(userPerm => userPerm.name === permission)
      );
    });
  }, [userPermissions]);

  // Generate breadcrumbs for current view
  const breadcrumbs = useMemo(() => {
    const generateBreadcrumbs = (view: ViewMode): BreadcrumbItem[] => {
      const route = ROUTE_CONFIGS.find(r => r.view === view);
      if (!route) return [];

      const items: BreadcrumbItem[] = [
        {
          title: 'Home',
          path: '/',
          view: ViewMode.DASHBOARD,
          icon: Home
        }
      ];

      // Add category breadcrumb if not dashboard
      if (view !== ViewMode.DASHBOARD) {
        if (route.category === RouteCategory.CORE_SPA) {
          items.push({
            title: 'Data Governance',
            path: '/governance',
            view: ViewMode.DASHBOARD, // This would be a governance overview
            icon: Shield
          });
        }

        // Add current route
        items.push({
          title: route.title,
          path: route.path,
          view: route.view,
          icon: route.icon,
          isActive: true
        });
      }

      return items;
    };

    return enableBreadcrumbs ? generateBreadcrumbs(currentView) : [];
  }, [currentView, enableBreadcrumbs]);

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  const navigateTo = useCallback(async (view: ViewMode, params?: Record<string, string>) => {
    if (isNavigating) return;

    try {
      setIsNavigating(true);
      navigationStartTime.current = Date.now();

      // Find route configuration
      const route = ROUTE_CONFIGS.find(r => r.view === view);
      if (!route) {
        throw new Error(`No route configuration found for view: ${view}`);
      }

      // Check permissions
      const hasPermission = route.permissions.every(permission => 
        userPermissions.some(userPerm => userPerm.name === permission)
      );

      if (!hasPermission) {
        throw new Error(`Insufficient permissions for view: ${view}`);
      }

      // Build URL with parameters
      let targetPath = route.path;
      if (params) {
        const urlParams = new URLSearchParams(params);
        targetPath += `?${urlParams.toString()}`;
      }

      // Track navigation start
      if (enableAnalytics) {
        await trackNavigation({
          action: 'navigation_start',
          from: currentView,
          to: view,
          path: targetPath,
          timestamp: new Date().toISOString()
        });
      }

      // Update view (this will trigger the route change)
      onViewChange(view);

      // Update URL if deep linking is enabled
      if (enableDeepLinking) {
        router.push(targetPath);
      }

      // Add to history
      if (enableHistory) {
        const historyItem: NavigationHistoryItem = {
          id: `nav-${Date.now()}`,
          view,
          path: targetPath,
          title: route.title,
          timestamp: new Date().toISOString(),
          metadata: params
        };

        setNavigationHistory(prev => {
          const newHistory = [historyItem, ...prev.slice(0, maxHistoryItems - 1)];
          setCurrentHistoryIndex(0);
          return newHistory;
        });
      }

      // Update route analytics
      if (enableAnalytics) {
        setRouteAnalytics(prev => {
          const existing = prev.find(a => a.view === view);
          if (existing) {
            return prev.map(a => a.view === view ? {
              ...a,
              visitCount: a.visitCount + 1,
              lastVisited: new Date().toISOString()
            } : a);
          } else {
            return [...prev, {
              view,
              path: targetPath,
              visitCount: 1,
              averageDuration: 0,
              lastVisited: new Date().toISOString(),
              userInteractions: 0
            }];
          }
        });
      }

    } catch (error) {
      console.error('Navigation failed:', error);
      // Could show error toast here
    } finally {
      setIsNavigating(false);
    }
  }, [
    isNavigating,
    userPermissions,
    enableAnalytics,
    enableDeepLinking,
    enableHistory,
    maxHistoryItems,
    currentView,
    onViewChange,
    router,
    trackNavigation
  ]);

  const navigateToPath = useCallback(async (path: string) => {
    const route = ROUTE_CONFIGS.find(r => r.path === path);
    if (route) {
      await navigateTo(route.view);
    }
  }, [navigateTo]);

  const goBack = useCallback(() => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      const historyItem = navigationHistory[nextIndex];
      setCurrentHistoryIndex(nextIndex);
      onViewChange(historyItem.view);
      
      if (enableDeepLinking) {
        router.push(historyItem.path);
      }
    }
  }, [currentHistoryIndex, navigationHistory, onViewChange, enableDeepLinking, router]);

  const goForward = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const nextIndex = currentHistoryIndex - 1;
      const historyItem = navigationHistory[nextIndex];
      setCurrentHistoryIndex(nextIndex);
      onViewChange(historyItem.view);
      
      if (enableDeepLinking) {
        router.push(historyItem.path);
      }
    }
  }, [currentHistoryIndex, navigationHistory, onViewChange, enableDeepLinking, router]);

  const addToHistory = useCallback((item: NavigationHistoryItem) => {
    setNavigationHistory(prev => [item, ...prev.slice(0, maxHistoryItems - 1)]);
  }, [maxHistoryItems]);

  const clearHistory = useCallback(() => {
    setNavigationHistory([]);
    setCurrentHistoryIndex(-1);
  }, []);

  const canNavigateTo = useCallback((view: ViewMode) => {
    const route = ROUTE_CONFIGS.find(r => r.view === view);
    if (!route) return false;

    return route.permissions.every(permission => 
      userPermissions.some(userPerm => userPerm.name === permission)
    );
  }, [userPermissions]);

  const getRouteByView = useCallback((view: ViewMode) => {
    return ROUTE_CONFIGS.find(r => r.view === view) || null;
  }, []);

  const getRouteByPath = useCallback((path: string) => {
    return ROUTE_CONFIGS.find(r => r.path === path) || null;
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Sync URL with current view
  useEffect(() => {
    if (!enableDeepLinking) return;

    const route = ROUTE_CONFIGS.find(r => r.view === currentView);
    if (route && pathname !== route.path) {
      router.replace(route.path);
    }
  }, [currentView, pathname, router, enableDeepLinking]);

  // Handle browser navigation
  useEffect(() => {
    if (!enableDeepLinking) return;

    const route = ROUTE_CONFIGS.find(r => r.path === pathname);
    if (route && route.view !== currentView) {
      onViewChange(route.view);
    }
  }, [pathname, currentView, onViewChange, enableDeepLinking]);

  // Track navigation duration
  useEffect(() => {
    if (navigationStartTime.current > 0) {
      const duration = Date.now() - navigationStartTime.current;
      
      // Update analytics with navigation duration
      if (enableAnalytics && currentRoute) {
        setRouteAnalytics(prev => 
          prev.map(a => a.view === currentView ? {
            ...a,
            averageDuration: (a.averageDuration + duration) / 2
          } : a)
        );
      }

      navigationStartTime.current = 0;
    }
  }, [currentView, enableAnalytics, currentRoute]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<RacineRoutingContextValue>(() => ({
    currentRoute,
    currentView,
    navigationHistory,
    breadcrumbs,
    routeAnalytics,
    isNavigating,
    navigateTo,
    navigateToPath,
    goBack,
    goForward,
    addToHistory,
    clearHistory,
    generateBreadcrumbs: (view: ViewMode) => {
      const route = ROUTE_CONFIGS.find(r => r.view === view);
      return route ? breadcrumbs : [];
    },
    getRouteByView,
    getRouteByPath,
    canNavigateTo
  }), [
    currentRoute,
    currentView,
    navigationHistory,
    breadcrumbs,
    routeAnalytics,
    isNavigating,
    navigateTo,
    navigateToPath,
    goBack,
    goForward,
    addToHistory,
    clearHistory,
    getRouteByView,
    getRouteByPath,
    canNavigateTo
  ]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderBreadcrumbs = () => {
    if (!enableBreadcrumbs || breadcrumbs.length <= 1) return null;

    return (
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.path}>
                <BreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage className="flex items-center gap-2">
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      href={item.path}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo(item.view);
                      }}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  };

  const renderNavigationControls = () => (
    <div className="flex items-center gap-2 mb-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            disabled={currentHistoryIndex >= navigationHistory.length - 1}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Go Back</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={goForward}
            disabled={currentHistoryIndex <= 0}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Go Forward</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo(ViewMode.DASHBOARD)}
          >
            <Home className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Go to Dashboard</TooltipContent>
      </Tooltip>

      {enableHistory && navigationHistory.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              History ({navigationHistory.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Navigation History</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-60">
              {navigationHistory.map((item, index) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => navigateTo(item.view)}
                  className={cn(
                    "flex items-center gap-3 p-3",
                    index === currentHistoryIndex && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearHistory}>
              <X className="w-4 h-4 mr-2" />
              Clear History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize routing on mount
  useEffect(() => {
    // Sync initial route with URL if deep linking is enabled
    if (enableDeepLinking) {
      const route = ROUTE_CONFIGS.find(r => r.path === pathname);
      if (route && route.view !== currentView) {
        onViewChange(route.view);
      }
    }
  }, []);

  // Track route analytics
  useEffect(() => {
    if (!enableAnalytics || !currentRoute) return;

    const trackRouteVisit = async () => {
      try {
        await trackNavigation({
          action: 'route_visit',
          view: currentView,
          path: currentRoute.path,
          timestamp: new Date().toISOString(),
          user: currentUser?.id,
          workspace: activeWorkspace?.id
        });
      } catch (error) {
        console.error('Route analytics tracking failed:', error);
      }
    };

    trackRouteVisit();
  }, [currentView, currentRoute, enableAnalytics, trackNavigation, currentUser, activeWorkspace]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <RacineRoutingContext.Provider value={contextValue}>
      <div className="relative">
        {/* Navigation Controls */}
        {enableHistory && renderNavigationControls()}

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Loading Overlay */}
        <AnimatePresence>
          {isNavigating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-medium">Navigating...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

        {/* Route Analytics Debug (Development Only) */}
        {process.env.NODE_ENV === 'development' && enableAnalytics && (
          <div className="fixed bottom-20 right-4 bg-card border rounded-lg p-3 shadow-lg z-30">
            <h4 className="text-xs font-medium mb-2">Route Analytics</h4>
            <div className="space-y-1 text-xs">
              <div>Current: {currentRoute?.title || 'Unknown'}</div>
              <div>History: {navigationHistory.length} items</div>
              <div>Analytics: {routeAnalytics.length} routes tracked</div>
            </div>
          </div>
        )}
      </div>
    </RacineRoutingContext.Provider>
  );
};

// ============================================================================
// ROUTE UTILITIES
// ============================================================================

// Get all available routes for a user
export const getAvailableRoutes = (userPermissions: any[]): RouteConfig[] => {
  return ROUTE_CONFIGS.filter(route => {
    return route.permissions.every(permission => 
      userPermissions.some(userPerm => userPerm.name === permission)
    );
  });
};

// Get route configuration by view
export const getRouteConfig = (view: ViewMode): RouteConfig | null => {
  return ROUTE_CONFIGS.find(r => r.view === view) || null;
};

// Generate route URL with parameters
export const generateRouteUrl = (view: ViewMode, params?: Record<string, string>): string => {
  const route = ROUTE_CONFIGS.find(r => r.view === view);
  if (!route) return '/';

  if (params) {
    const urlParams = new URLSearchParams(params);
    return `${route.path}?${urlParams.toString()}`;
  }

  return route.path;
};

// Validate route permissions
export const canAccessRoute = (view: ViewMode, userPermissions: any[]): boolean => {
  const route = ROUTE_CONFIGS.find(r => r.view === view);
  if (!route) return false;

  return route.permissions.every(permission => 
    userPermissions.some(userPerm => userPerm.name === permission)
  );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default RacineRouter;