/**
 * 🎯 NAVIGATION GROUP MANAGER - ENTERPRISE NAVIGATION ORCHESTRATOR
 * ================================================================
 * 
 * Advanced navigation group management system that provides intelligent,
 * context-aware navigation organization for the entire data governance platform.
 * This component surpasses traditional navigation systems with enterprise-grade
 * intelligence and flexibility.
 * 
 * Features:
 * - Intelligent navigation group organization
 * - Dynamic menu generation based on user context
 * - Advanced search and filtering within navigation
 * - Smart grouping and categorization
 * - Contextual quick actions and shortcuts
 * - Navigation analytics and optimization
 * - Personalized navigation preferences
 * - Cross-group workflow navigation
 * - Mobile-optimized navigation patterns
 * - Accessibility-compliant navigation
 * 
 * Architecture:
 * - Modular navigation group system
 * - RBAC-integrated navigation permissions
 * - Performance-optimized navigation rendering
 * - Real-time navigation synchronization
 * - Advanced navigation state management
 * - Cross-SPA navigation coordination
 * 
 * Backend Integration:
 * - Navigation analytics and tracking
 * - User navigation preferences
 * - Group-based permission management
 * - Navigation performance monitoring
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
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, ChevronUp, Search, Filter, SortAsc, Star, StarOff, Pin, PinOff as Unpin, MoreHorizontal, Plus, Minus, Settings, Eye, EyeOff, ArrowRight, ExternalLink, Copy, Share2, Bookmark, History, Clock, Activity, Zap, Target, Grid3X3, List, Layers, Folder, FolderOpen, Tag, Hash, Globe, Users, User, Building2, Workflow, Database, Shield, Bot, BarChart3, MessageCircle, Bell, AlertTriangle, CheckCircle, Info, HelpCircle, X, GitBranch, TrendingUp, PieChart, Radar } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut
} from '@/components/ui/context-menu';

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
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useUserPreferences } from '../hooks/optimized/useOptimizedUserPreferences';
import { useNavigationAnalytics } from '../hooks/optimized/useOptimizedNavigationAnalytics';

// Router Integration
import { useRacineRouter } from '../routing/RacineRouter';

// Utilities
import { cn } from '../../utils/ui-utils';
import { formatDuration } from '../../utils/formatting-utils';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface NavigationGroupManagerProps {
  userPermissions: any[];
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  workspaceId?: string;
  collapsed?: boolean;
  showCategories?: boolean;
  showSearch?: boolean;
  showFavorites?: boolean;
  showRecent?: boolean;
  maxRecentItems?: number;
  enableAnalytics?: boolean;
  enablePersonalization?: boolean;
}

interface NavigationGroup {
  id: string;
  title: string;
  description: string;
  icon: ComponentType;
  category: NavigationCategory;
  items: NavigationItem[];
  isCollapsed?: boolean;
  isPinned?: boolean;
  isFavorite?: boolean;
  order: number;
  permissions: string[];
  metadata?: Record<string, any>;
}

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: ComponentType;
  view: ViewMode;
  path: string;
  badge?: NavigationBadge;
  isActive?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  lastVisited?: ISODateString;
  visitCount?: number;
  permissions: string[];
  keywords: string[];
  metadata?: Record<string, any>;
}

interface NavigationBadge {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  count?: number;
  pulse?: boolean;
}

interface NavigationPreferences {
  favoriteItems: string[];
  pinnedGroups: string[];
  collapsedGroups: string[];
  customOrder: string[];
  showCategories: boolean;
  showBadges: boolean;
  compactMode: boolean;
  groupBy: 'category' | 'frequency' | 'alphabetical' | 'custom';
  theme: 'default' | 'minimal' | 'detailed';
}

interface NavigationAnalytics {
  itemId: string;
  visitCount: number;
  averageDuration: number;
  lastVisited: ISODateString;
  clickThroughRate: number;
  userInteractions: number;
}

enum NavigationCategory {
  CORE_GOVERNANCE = 'core_governance',
  RACINE_FEATURES = 'racine_features',
  ANALYTICS = 'analytics',
  ADMINISTRATION = 'administration',
  COLLABORATION = 'collaboration',
  SYSTEM = 'system'
}

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const NAVIGATION_GROUPS: NavigationGroup[] = [
  // Core Data Governance Group
  {
    id: 'core-governance',
    title: 'Data Governance',
    description: 'Core data governance and compliance tools',
    icon: Shield,
    category: NavigationCategory.CORE_GOVERNANCE,
    order: 1,
    permissions: ['governance.view'],
    items: [
      {
        id: 'data-sources',
        title: 'Data Sources',
        description: 'Manage and monitor data connections',
        icon: Database,
        view: ViewMode.DATA_SOURCES,
        path: '/data-sources',
        permissions: ['data_sources.view'],
        keywords: ['data', 'sources', 'connections', 'databases']
      },
      {
        id: 'scan-rule-sets',
        title: 'Scan Rule Sets',
        description: 'Configure intelligent scanning rules',
        icon: Search,
        view: ViewMode.SCAN_RULE_SETS,
        path: '/scan-rule-sets',
        permissions: ['scan_rules.view'],
        keywords: ['scan', 'rules', 'discovery', 'patterns']
      },
      {
        id: 'classifications',
        title: 'Classifications',
        description: 'Manage data classification schemes',
        icon: Tag,
        view: ViewMode.CLASSIFICATIONS,
        path: '/classifications',
        permissions: ['classifications.view'],
        keywords: ['classification', 'sensitivity', 'labels']
      },
      {
        id: 'compliance-rules',
        title: 'Compliance Rules',
        description: 'Define compliance policies',
        icon: Shield,
        view: ViewMode.COMPLIANCE_RULES,
        path: '/compliance-rules',
        permissions: ['compliance.view'],
        keywords: ['compliance', 'rules', 'policies']
      },
      {
        id: 'advanced-catalog',
        title: 'Data Catalog',
        description: 'Explore comprehensive data catalog',
        icon: Layers,
        view: ViewMode.ADVANCED_CATALOG,
        path: '/advanced-catalog',
        permissions: ['catalog.view'],
        keywords: ['catalog', 'metadata', 'lineage']
      },
      {
        id: 'scan-logic',
        title: 'Scan Logic',
        description: 'Configure scanning algorithms',
        icon: Zap,
        view: ViewMode.SCAN_LOGIC,
        path: '/scan-logic',
        permissions: ['scan_logic.view'],
        keywords: ['scan', 'logic', 'algorithms']
      }
    ]
  },

  // Racine Features Group
  {
    id: 'racine-features',
    title: 'Racine Platform',
    description: 'Advanced platform features and tools',
    icon: Layers,
    category: NavigationCategory.RACINE_FEATURES,
    order: 2,
    permissions: ['racine.view'],
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Enterprise governance overview',
        icon: BarChart3,
        view: ViewMode.DASHBOARD,
        path: '/',
        permissions: ['dashboard.view'],
        keywords: ['dashboard', 'overview', 'metrics']
      },
      {
        id: 'workspace',
        title: 'Workspace',
        description: 'Collaborative workspace',
        icon: Building2,
        view: ViewMode.WORKSPACE,
        path: '/workspace',
        permissions: ['workspace.view'],
        keywords: ['workspace', 'collaboration', 'teams']
      },
      {
        id: 'workflows',
        title: 'Workflows',
        description: 'Intelligent workflow management',
        icon: Workflow,
        view: ViewMode.WORKFLOWS,
        path: '/workflows',
        permissions: ['workflows.view'],
        keywords: ['workflows', 'automation', 'processes']
      },
      {
        id: 'pipelines',
        title: 'Data Pipelines',
        description: 'Advanced pipeline designer',
        icon: GitBranch,
        view: ViewMode.PIPELINES,
        path: '/pipelines',
        permissions: ['pipelines.view'],
        keywords: ['pipelines', 'etl', 'data flow']
      },
      {
        id: 'ai-assistant',
        title: 'AI Assistant',
        description: 'Intelligent AI-powered assistant',
        icon: Bot,
        view: ViewMode.AI_ASSISTANT,
        path: '/ai-assistant',
        permissions: ['ai.view'],
        keywords: ['ai', 'assistant', 'intelligence']
      }
    ]
  },

  // Analytics Group
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Advanced analytics and business intelligence',
    icon: BarChart3,
    category: NavigationCategory.ANALYTICS,
    order: 3,
    permissions: ['analytics.view'],
    items: [
      {
        id: 'analytics',
        title: 'Analytics',
        description: 'Business intelligence dashboard',
        icon: TrendingUp,
        view: ViewMode.ANALYTICS,
        path: '/analytics',
        permissions: ['analytics.view'],
        keywords: ['analytics', 'business intelligence', 'reports']
      },
      {
        id: 'monitoring',
        title: 'System Monitoring',
        description: 'Real-time system monitoring',
        icon: Activity,
        view: ViewMode.MONITORING,
        path: '/monitoring',
        permissions: ['monitoring.view'],
        keywords: ['monitoring', 'health', 'performance']
      },
      {
        id: 'reports',
        title: 'Reports',
        description: 'Generate comprehensive reports',
        icon: PieChart,
        view: ViewMode.REPORTS,
        path: '/reports',
        permissions: ['reports.view'],
        keywords: ['reports', 'documentation', 'export']
      }
    ]
  },

  // Collaboration Group
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Team collaboration and communication',
    icon: MessageCircle,
    category: NavigationCategory.COLLABORATION,
    order: 4,
    permissions: ['collaboration.view'],
    items: [
      {
        id: 'collaboration',
        title: 'Team Collaboration',
        description: 'Collaborate with team members',
        icon: Users,
        view: ViewMode.COLLABORATION,
        path: '/collaboration',
        permissions: ['collaboration.view'],
        keywords: ['collaboration', 'teams', 'communication']
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Manage system notifications',
        icon: Bell,
        view: ViewMode.NOTIFICATIONS,
        path: '/notifications',
        permissions: ['notifications.view'],
        keywords: ['notifications', 'alerts', 'messages']
      }
    ]
  },

  // Administration Group
  {
    id: 'administration',
    title: 'Administration',
    description: 'System administration and management',
    icon: Settings,
    category: NavigationCategory.ADMINISTRATION,
    order: 5,
    permissions: ['admin.view'],
    items: [
      {
        id: 'rbac-system',
        title: 'RBAC System',
        description: 'Manage roles and permissions',
        icon: Users,
        view: ViewMode.RBAC_SYSTEM,
        path: '/rbac-system',
        permissions: ['rbac.view'],
        keywords: ['rbac', 'roles', 'permissions', 'access']
      },
      {
        id: 'cost-optimization',
        title: 'Cost Optimization',
        description: 'Optimize costs and resources',
        icon: Target,
        view: ViewMode.COST_OPTIMIZATION,
        path: '/cost-optimization',
        permissions: ['cost.view'],
        keywords: ['cost', 'optimization', 'budget']
      }
    ]
  },

  // System Group
  {
    id: 'system',
    title: 'System Tools',
    description: 'System utilities and advanced tools',
    icon: Settings,
    category: NavigationCategory.SYSTEM,
    order: 6,
    permissions: ['system.view'],
    items: [
      {
        id: 'streaming',
        title: 'Real-time Streaming',
        description: 'Real-time data streaming',
        icon: Radar,
        view: ViewMode.STREAMING,
        path: '/streaming',
        permissions: ['streaming.view'],
        keywords: ['streaming', 'real-time', 'events']
      },
      {
        id: 'search',
        title: 'Global Search',
        description: 'Search across all assets',
        icon: Search,
        view: ViewMode.SEARCH,
        path: '/search',
        permissions: ['search.view'],
        keywords: ['search', 'discovery', 'find']
      }
    ]
  }
];

// ============================================================================
// NAVIGATION CONTEXT
// ============================================================================

interface NavigationGroupContextValue {
  groups: NavigationGroup[];
  preferences: NavigationPreferences;
  searchQuery: string;
  filteredGroups: NavigationGroup[];
  favoriteItems: NavigationItem[];
  recentItems: NavigationItem[];
  analytics: NavigationAnalytics[];
  updatePreferences: (prefs: Partial<NavigationPreferences>) => void;
  toggleFavorite: (itemId: string) => void;
  togglePinned: (groupId: string) => void;
  toggleCollapsed: (groupId: string) => void;
  setSearchQuery: (query: string) => void;
  trackItemClick: (itemId: string) => void;
  getItemAnalytics: (itemId: string) => NavigationAnalytics | null;
}

const NavigationGroupContext = createContext<NavigationGroupContextValue | null>(null);

export const useNavigationGroup = () => {
  const context = useContext(NavigationGroupContext);
  if (!context) {
    throw new Error('useNavigationGroup must be used within NavigationGroupManager');
  }
  return context;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NavigationGroupManager: React.FC<NavigationGroupManagerProps> = ({
  userPermissions,
  currentView,
  onViewChange,
  workspaceId,
  collapsed = false,
  showCategories = true,
  showSearch = true,
  showFavorites = true,
  showRecent = true,
  maxRecentItems = 10,
  enableAnalytics = true,
  enablePersonalization = true
}) => {
  // ============================================================================
  // HOOKS AND STATE
  // ============================================================================

  const router = useRouter();
  const pathname = usePathname();

  const { currentUser, updateUserPreferences } = useUserManagement();
  const { activeWorkspace } = useWorkspaceManagement();
  const { trackNavigation } = useCrossGroupIntegration();
  const { trackNavigationEvent } = useNavigationAnalytics();
  const { preferences: userPrefs, updatePreferences: updateUserPrefs } = useUserPreferences();
  const { navigateTo, canNavigateTo } = useRacineRouter();

  // Navigation State
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState<NavigationPreferences>({
    favoriteItems: [],
    pinnedGroups: [],
    collapsedGroups: [],
    customOrder: [],
    showCategories: true,
    showBadges: true,
    compactMode: false,
    groupBy: 'category',
    theme: 'default'
  });
  const [analytics, setAnalytics] = useState<NavigationAnalytics[]>([]);
  const [recentItems, setRecentItems] = useState<NavigationItem[]>([]);

  // Animation controls
  const groupAnimation = useAnimation();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Filter groups based on permissions
  const availableGroups = useMemo(() => {
    return NAVIGATION_GROUPS.filter(group => {
      const hasGroupPermission = group.permissions.every(permission =>
        userPermissions.some(userPerm => userPerm.name === permission)
      );

      if (!hasGroupPermission) return false;

      // Filter items within the group
      const availableItems = group.items.filter(item =>
        item.permissions.every(permission =>
          userPermissions.some(userPerm => userPerm.name === permission)
        )
      );

      return availableItems.length > 0;
    }).map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.permissions.every(permission =>
          userPermissions.some(userPerm => userPerm.name === permission)
        )
      )
    }));
  }, [userPermissions]);

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return availableGroups;

    const query = searchQuery.toLowerCase();
    return availableGroups.filter(group => {
      // Check group title/description
      const groupMatches = group.title.toLowerCase().includes(query) ||
                           group.description.toLowerCase().includes(query);

      // Check items within group
      const itemMatches = group.items.some(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );

      return groupMatches || itemMatches;
    }).map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }));
  }, [availableGroups, searchQuery]);

  // Get favorite items
  const favoriteItems = useMemo(() => {
    const allItems = availableGroups.flatMap(group => group.items);
    return allItems.filter(item => preferences.favoriteItems.includes(item.id));
  }, [availableGroups, preferences.favoriteItems]);

  // Sort groups based on preferences
  const sortedGroups = useMemo(() => {
    const groups = [...filteredGroups];

    switch (preferences.groupBy) {
      case 'alphabetical':
        return groups.sort((a, b) => a.title.localeCompare(b.title));
      
      case 'frequency':
        return groups.sort((a, b) => {
          const aFreq = a.items.reduce((sum, item) => 
            sum + (analytics.find(a => a.itemId === item.id)?.visitCount || 0), 0);
          const bFreq = b.items.reduce((sum, item) => 
            sum + (analytics.find(a => a.itemId === item.id)?.visitCount || 0), 0);
          return bFreq - aFreq;
        });
      
      case 'custom':
        return groups.sort((a, b) => {
          const aIndex = preferences.customOrder.indexOf(a.id);
          const bIndex = preferences.customOrder.indexOf(b.id);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      
      default: // category
        return groups.sort((a, b) => a.order - b.order);
    }
  }, [filteredGroups, preferences.groupBy, preferences.customOrder, analytics]);

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  const handleItemClick = useCallback(async (item: NavigationItem) => {
    try {
      // Track click event
      if (enableAnalytics) {
        trackItemClick(item.id);
        await trackNavigationEvent({
          action: 'navigation_item_click',
          itemId: item.id,
          view: item.view,
          timestamp: new Date().toISOString()
        });
      }

      // Add to recent items
      if (showRecent) {
        setRecentItems(prev => {
          const filtered = prev.filter(recent => recent.id !== item.id);
          return [{ ...item, lastVisited: new Date().toISOString() }, ...filtered.slice(0, maxRecentItems - 1)];
        });
      }

      // Navigate using router
      await navigateTo(item.view);

    } catch (error) {
      console.error('Navigation item click failed:', error);
    }
  }, [enableAnalytics, showRecent, maxRecentItems, navigateTo, trackNavigationEvent]);

  const toggleFavorite = useCallback((itemId: string) => {
    setPreferences(prev => {
      const isFavorite = prev.favoriteItems.includes(itemId);
      const newFavorites = isFavorite
        ? prev.favoriteItems.filter(id => id !== itemId)
        : [...prev.favoriteItems, itemId];

      const newPrefs = { ...prev, favoriteItems: newFavorites };

      // Persist to backend if personalization is enabled
      if (enablePersonalization) {
        updateUserPrefs({ navigationPreferences: newPrefs });
      }

      return newPrefs;
    });
  }, [enablePersonalization, updateUserPrefs]);

  const togglePinned = useCallback((groupId: string) => {
    setPreferences(prev => {
      const isPinned = prev.pinnedGroups.includes(groupId);
      const newPinned = isPinned
        ? prev.pinnedGroups.filter(id => id !== groupId)
        : [...prev.pinnedGroups, groupId];

      return { ...prev, pinnedGroups: newPinned };
    });
  }, []);

  const toggleCollapsed = useCallback((groupId: string) => {
    setPreferences(prev => {
      const isCollapsed = prev.collapsedGroups.includes(groupId);
      const newCollapsed = isCollapsed
        ? prev.collapsedGroups.filter(id => id !== groupId)
        : [...prev.collapsedGroups, groupId];

      return { ...prev, collapsedGroups: newCollapsed };
    });
  }, []);

  const trackItemClick = useCallback((itemId: string) => {
    setAnalytics(prev => {
      const existing = prev.find(a => a.itemId === itemId);
      if (existing) {
        return prev.map(a => a.itemId === itemId ? {
          ...a,
          visitCount: a.visitCount + 1,
          lastVisited: new Date().toISOString(),
          userInteractions: a.userInteractions + 1
        } : a);
      } else {
        return [...prev, {
          itemId,
          visitCount: 1,
          averageDuration: 0,
          lastVisited: new Date().toISOString(),
          clickThroughRate: 0,
          userInteractions: 1
        }];
      }
    });
  }, []);

  const getItemAnalytics = useCallback((itemId: string) => {
    return analytics.find(a => a.itemId === itemId) || null;
  }, [analytics]);

  const updatePreferences = useCallback((prefs: Partial<NavigationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderFavorites = () => {
    if (!showFavorites || favoriteItems.length === 0) return null;

    return (
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">Favorites</span>
        </div>
        <div className="space-y-1">
          {favoriteItems.slice(0, 5).map(item => (
            <Button
              key={item.id}
              variant={item.view === currentView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleItemClick(item)}
              className="w-full justify-start h-8"
            >
              <item.icon className="w-4 h-4 mr-2" />
              <span className="truncate">{item.title}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderRecentItems = () => {
    if (!showRecent || recentItems.length === 0) return null;

    return (
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Recent</span>
        </div>
        <div className="space-y-1">
          {recentItems.slice(0, 5).map(item => (
            <Button
              key={item.id}
              variant={item.view === currentView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleItemClick(item)}
              className="w-full justify-start h-8"
            >
              <item.icon className="w-4 h-4 mr-2" />
              <span className="truncate">{item.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {item.lastVisited && formatDuration(
                  Date.now() - new Date(item.lastVisited).getTime()
                )}
              </span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderNavigationItem = (item: NavigationItem, groupId: string) => {
    const isActive = item.view === currentView;
    const isFavorite = preferences.favoriteItems.includes(item.id);
    const canAccess = canNavigateTo(item.view);
    const itemAnalytics = getItemAnalytics(item.id);

    if (!canAccess) return null;

    return (
      <ContextMenu key={item.id}>
        <ContextMenuTrigger>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full justify-start h-10 mb-1",
                isActive && "bg-primary/10 text-primary",
                !collapsed && "px-3",
                collapsed && "px-2"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4",
                !collapsed && "mr-3",
                isActive && "text-primary"
              )} />
              
              {!collapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="truncate">{item.title}</div>
                    {preferences.theme === 'detailed' && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isFavorite && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                    
                    {item.badge && (
                      <Badge 
                        variant={item.badge.variant}
                        className={cn(
                          "text-xs h-5",
                          item.badge.pulse && "animate-pulse"
                        )}
                      >
                        {item.badge.count ? item.badge.count : item.badge.text}
                      </Badge>
                    )}

                    {enableAnalytics && itemAnalytics && itemAnalytics.visitCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {itemAnalytics.visitCount}
                      </span>
                    )}
                  </div>
                </>
              )}
            </Button>
          </motion.div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleItemClick(item)}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Navigate to {item.title}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => toggleFavorite(item.id)}>
            {isFavorite ? (
              <>
                <StarOff className="w-4 h-4 mr-2" />
                Remove from Favorites
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Add to Favorites
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(item.path)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </ContextMenuItem>
          <ContextMenuItem onClick={() => window.open(item.path, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderNavigationGroup = (group: NavigationGroup) => {
    const isCollapsed = preferences.collapsedGroups.includes(group.id);
    const isPinned = preferences.pinnedGroups.includes(group.id);
    const hasItems = group.items.length > 0;

    if (!hasItems) return null;

    return (
      <Collapsible
        key={group.id}
        open={!isCollapsed}
        onOpenChange={() => toggleCollapsed(group.id)}
      >
        <div className={cn(
          "mb-2",
          isPinned && "order-first"
        )}>
          {/* Group Header */}
          <ContextMenu>
            <ContextMenuTrigger>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-between h-8 px-3 mb-1",
                    collapsed && "px-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="w-4 h-4" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{group.title}</span>
                    )}
                  </div>
                  
                  {!collapsed && (
                    <div className="flex items-center gap-1">
                      {isPinned && <Pin className="w-3 h-3" />}
                      <ChevronDown className={cn(
                        "w-3 h-3 transition-transform",
                        isCollapsed && "rotate-180"
                      )} />
                    </div>
                  )}
                </Button>
              </CollapsibleTrigger>
            </ContextMenuTrigger>

            <ContextMenuContent>
              <ContextMenuItem onClick={() => togglePinned(group.id)}>
                {isPinned ? (
                  <>
                    <Unpin className="w-4 h-4 mr-2" />
                    Unpin Group
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 mr-2" />
                    Pin Group
                  </>
                )}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => toggleCollapsed(group.id)}>
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Expand Group
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Collapse Group
                  </>
                )}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {/* Group Items */}
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-2 space-y-1"
            >
              {group.items.map(item => renderNavigationItem(item, group.id))}
            </motion.div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  const renderNavigationControls = () => {
    if (collapsed) return null;

    return (
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">Navigation</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Navigation Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs">Group By</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={preferences.groupBy}
                onValueChange={(value) => updatePreferences({ 
                  groupBy: value as NavigationPreferences['groupBy'] 
                })}
              >
                <DropdownMenuRadioItem value="category">Category</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="frequency">Frequency</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="alphabetical">Alphabetical</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="custom">Custom Order</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem
                checked={preferences.showCategories}
                onCheckedChange={(checked) => updatePreferences({ showCategories: checked })}
              >
                Show Categories
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={preferences.showBadges}
                onCheckedChange={(checked) => updatePreferences({ showBadges: checked })}
              >
                Show Badges
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={preferences.compactMode}
                onCheckedChange={(checked) => updatePreferences({ compactMode: checked })}
              >
                Compact Mode
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load user navigation preferences
  useEffect(() => {
    if (enablePersonalization && userPrefs?.navigationPreferences) {
      setPreferences(userPrefs.navigationPreferences);
    }
  }, [enablePersonalization, userPrefs]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<NavigationGroupContextValue>(() => ({
    groups: sortedGroups,
    preferences,
    searchQuery,
    filteredGroups,
    favoriteItems,
    recentItems,
    analytics,
    updatePreferences,
    toggleFavorite,
    togglePinned,
    toggleCollapsed,
    setSearchQuery,
    trackItemClick,
    getItemAnalytics
  }), [
    sortedGroups,
    preferences,
    searchQuery,
    filteredGroups,
    favoriteItems,
    recentItems,
    analytics,
    updatePreferences,
    toggleFavorite,
    togglePinned,
    toggleCollapsed,
    trackItemClick,
    getItemAnalytics
  ]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <NavigationGroupContext.Provider value={contextValue}>
      <div className={cn(
        "h-full bg-card border-r flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Navigation Controls */}
        {renderNavigationControls()}

        {/* Search Bar */}
        {renderSearchBar()}

        {/* Favorites Section */}
        {renderFavorites()}

        {/* Recent Items Section */}
        {renderRecentItems()}

        {/* Navigation Groups */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            <AnimatePresence>
              {sortedGroups.map(group => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderNavigationGroup(group)}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* No Results Message */}
            {searchQuery && filteredGroups.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No navigation items found for "{searchQuery}"
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Navigation Footer */}
        {!collapsed && (
          <div className="p-3 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Groups:</span>
                <span>{sortedGroups.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Favorites:</span>
                <span>{favoriteItems.length}</span>
              </div>
              {enableAnalytics && (
                <div className="flex justify-between">
                  <span>Total Visits:</span>
                  <span>{analytics.reduce((sum, a) => sum + a.visitCount, 0)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </NavigationGroupContext.Provider>
  );
};

// ============================================================================
// NAVIGATION UTILITIES
// ============================================================================

// Get navigation item by ID
export const getNavigationItem = (itemId: string): NavigationItem | null => {
  for (const group of NAVIGATION_GROUPS) {
    const item = group.items.find(item => item.id === itemId);
    if (item) return item;
  }
  return null;
};

// Get navigation group by ID
export const getNavigationGroup = (groupId: string): NavigationGroup | null => {
  return NAVIGATION_GROUPS.find(group => group.id === groupId) || null;
};

// Get all navigation items for a user
export const getAvailableNavigationItems = (userPermissions: any[]): NavigationItem[] => {
  const items: NavigationItem[] = [];
  
  for (const group of NAVIGATION_GROUPS) {
    const hasGroupPermission = group.permissions.every(permission =>
      userPermissions.some(userPerm => userPerm.name === permission)
    );

    if (hasGroupPermission) {
      const availableItems = group.items.filter(item =>
        item.permissions.every(permission =>
          userPermissions.some(userPerm => userPerm.name === permission)
        )
      );
      items.push(...availableItems);
    }
  }

  return items;
};

// Search navigation items
export const searchNavigationItems = (
  query: string, 
  userPermissions: any[]
): NavigationItem[] => {
  const availableItems = getAvailableNavigationItems(userPermissions);
  const searchTerm = query.toLowerCase();

  return availableItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
  );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default NavigationGroupManager;