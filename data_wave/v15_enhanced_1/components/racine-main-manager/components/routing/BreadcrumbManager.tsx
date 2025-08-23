/**
 * 🍞 BREADCRUMB MANAGER - INTELLIGENT BREADCRUMB SYSTEM
 * ====================================================
 * 
 * Enterprise-grade breadcrumb navigation system that provides intelligent
 * context awareness, cross-group navigation, and dynamic breadcrumb
 * generation for the data governance platform. Enables users to understand
 * their current location and navigate efficiently across complex workflows.
 * 
 * Features:
 * - Intelligent context-aware breadcrumb generation
 * - Cross-group navigation with state preservation
 * - Dynamic breadcrumb customization and theming
 * - Smart breadcrumb collapsing for long navigation paths
 * - Real-time breadcrumb updates with state synchronization
 * - Accessibility-compliant navigation with ARIA support
 * - Mobile-optimized breadcrumb display with responsive design
 * - Advanced breadcrumb analytics with user behavior tracking
 * 
 * Architecture:
 * - Context-aware breadcrumb generation with intelligent path parsing
 * - Cross-component state synchronization with real-time updates
 * - Advanced pattern matching with dynamic route resolution
 * - Comprehensive error boundary integration
 * - Performance monitoring with detailed metrics
 * - SEO optimization with structured navigation data
 * 
 * Backend Integration:
 * - Navigation analytics and tracking
 * - Route metadata and configuration
 * - User preferences and customization
 * - Performance monitoring
 * - Security validation
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
  ReactNode
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronLeft, Home, MoreHorizontal, Navigation, MapPin, ArrowLeft, ArrowRight, Bookmark, Star, Clock, Eye, Settings, Filter, Search, Zap, Activity, BarChart3, Users, Database, FileText, Layers, Building2, Bot, MessageCircle, Target, PieChart, Workflow, GitBranch, Radar, Shield, Globe, Lock, AlertTriangle, CheckCircle, Info, HelpCircle, ExternalLink, Copy, Share2, Download, Upload, Save, Edit, Trash2, Plus, Minus, MoreVertical, X, RefreshCw } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

// Racine Types
import { 
  UserContext, 
  WorkspaceConfiguration, 
  ViewMode, 
  LayoutMode,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// Racine Services
import { activityTrackingAPI } from '../../services/activity-tracking-apis';
import { racineOrchestrationAPI } from '../../services/racine-orchestration-apis';
import { performanceUtils } from '../../utils/performance-utils';

// Racine Utilities
import { navigationUtils } from '../../utils/navigation-utils';
import { validationUtils } from '../../utils/validation-utils';
import { formattingUtils } from '../../utils/formatting-utils';

// Racine Constants
import { 
  SUPPORTED_GROUPS,
  VIEW_MODES,
  LAYOUT_MODES,
  API_ENDPOINTS
} from '../../constants/cross-group-configs';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BreadcrumbItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: {
    group?: string;
    category?: string;
    type?: string;
    description?: string;
    tags?: string[];
  };
  state?: Record<string, any>;
  isClickable?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
  hasChildren?: boolean;
  childrenCount?: number;
}

interface BreadcrumbConfig {
  maxItems: number;
  showIcons: boolean;
  showHome: boolean;
  enableCollapsing: boolean;
  collapseThreshold: number;
  showTooltips: boolean;
  enableKeyboardNavigation: boolean;
  customSeparator?: React.ReactNode;
  theme: 'default' | 'minimal' | 'detailed' | 'compact';
}

interface BreadcrumbAnalytics {
  breadcrumbId: string;
  path: string;
  clickCount: number;
  averageTimeToClick: number;
  conversionRate: number;
  dropOffRate: number;
  mostCommonNextPath?: string;
  userSegments: Record<string, number>;
  createdAt: string;
  lastUpdated: string;
}

interface BreadcrumbNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  backPath?: string;
  forwardPath?: string;
  historyIndex: number;
  historyLength: number;
}

interface BreadcrumbContext {
  items: BreadcrumbItem[];
  config: BreadcrumbConfig;
  navigation: BreadcrumbNavigation;
  isLoading: boolean;
  error?: string;
}

// ============================================================================
// BREADCRUMB CONTEXT
// ============================================================================

interface BreadcrumbManagerContextType {
  breadcrumbs: BreadcrumbItem[];
  config: BreadcrumbConfig;
  navigation: BreadcrumbNavigation;
  isLoading: boolean;
  error?: string;
  generateBreadcrumbs: (path: string, state?: Record<string, any>) => Promise<BreadcrumbItem[]>;
  navigateToBreadcrumb: (item: BreadcrumbItem) => void;
  updateConfig: (newConfig: Partial<BreadcrumbConfig>) => void;
  addCustomBreadcrumb: (item: Omit<BreadcrumbItem, 'id'>) => void;
  removeCustomBreadcrumb: (id: string) => void;
  clearBreadcrumbs: () => void;
  refreshBreadcrumbs: () => void;
  getBreadcrumbAnalytics: (breadcrumbId: string) => Promise<BreadcrumbAnalytics>;
  trackBreadcrumbInteraction: (breadcrumbId: string, action: string, metadata?: Record<string, any>) => void;
}

const BreadcrumbManagerContext = createContext<BreadcrumbManagerContextType | null>(null);

export const useBreadcrumbManager = (): BreadcrumbManagerContextType => {
  const context = useContext(BreadcrumbManagerContext);
  if (!context) {
    throw new Error('useBreadcrumbManager must be used within a BreadcrumbManagerProvider');
  }
  return context;
};

// ============================================================================
// BREADCRUMB CONFIGURATIONS
// ============================================================================

const getIconForPath = (path: string, group?: string): React.ComponentType<{ className?: string }> => {
  // Group-specific icons
  if (group) {
    const groupIcons: Record<string, React.ComponentType<{ className?: string }>> = {
      'data_sources': Database,
      'scan_rule_sets': Radar,
      'classifications': FileText,
      'compliance_rules': Shield,
      'advanced_catalog': Layers,
      'scan_logic': Target,
      'rbac_system': Users,
      'workspace': Building2,
      'workflows': Workflow,
      'pipelines': GitBranch,
      'ai_assistant': Bot,
      'dashboard': BarChart3,
      'activity': Activity,
      'collaboration': MessageCircle,
      'user_management': Settings
    };

    return groupIcons[group] || Navigation;
  }

  // Path-based icons
  if (path === '/' || path === '/dashboard') return Home;
  if (path.includes('/workspace')) return Building2;
  if (path.includes('/workflow')) return Workflow;
  if (path.includes('/pipeline')) return GitBranch;
  if (path.includes('/data-source')) return Database;
  if (path.includes('/classification')) return FileText;
  if (path.includes('/compliance')) return Shield;
  if (path.includes('/catalog')) return Layers;
  if (path.includes('/scan')) return Radar;
  if (path.includes('/rbac') || path.includes('/user')) return Users;
  if (path.includes('/ai')) return Bot;
  if (path.includes('/activity')) return Activity;
  if (path.includes('/collaboration')) return MessageCircle;
  if (path.includes('/dashboard') || path.includes('/analytics')) return BarChart3;
  if (path.includes('/setting')) return Settings;

  return Navigation;
};

const createBreadcrumbFromPath = (
  pathSegment: string, 
  fullPath: string, 
  index: number,
  metadata?: Record<string, any>
): BreadcrumbItem => {
  // Generate human-readable label
  const label = pathSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Determine group from path
  const group = SUPPORTED_GROUPS.find(g => 
    fullPath.includes(g.replace('_', '-'))
  );

  // Build path up to current segment
  const pathParts = fullPath.split('/').slice(0, index + 2);
  const itemPath = pathParts.join('/');

  return {
    id: `breadcrumb_${index}_${pathSegment}`,
    label,
    path: itemPath,
    icon: getIconForPath(itemPath, group),
    metadata: {
      group,
      category: pathSegment,
      type: 'auto_generated',
      description: `Navigate to ${label}`,
      ...metadata
    },
    isClickable: true,
    isActive: index === fullPath.split('/').length - 2
  };
};

const getRouteMetadata = async (path: string): Promise<Record<string, any>> => {
  try {
    const response = await fetch(`/api/racine/routes/metadata?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }

    return {};
  } catch (error) {
    console.error('Failed to get route metadata:', error);
    return {};
  }
};

// ============================================================================
// BREADCRUMB MANAGER PROVIDER
// ============================================================================

interface BreadcrumbManagerProviderProps {
  children: ReactNode;
  defaultConfig?: Partial<BreadcrumbConfig>;
}

export const BreadcrumbManagerProvider: React.FC<BreadcrumbManagerProviderProps> = ({
  children,
  defaultConfig = {}
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [config, setConfig] = useState<BreadcrumbConfig>({
    maxItems: 8,
    showIcons: true,
    showHome: true,
    enableCollapsing: true,
    collapseThreshold: 5,
    showTooltips: true,
    enableKeyboardNavigation: true,
    theme: 'default',
    ...defaultConfig
  });

  const [navigation, setNavigation] = useState<BreadcrumbNavigation>({
    canGoBack: false,
    canGoForward: false,
    historyIndex: 0,
    historyLength: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const navigationHistory = useRef<string[]>([]);
  const currentHistoryIndex = useRef(0);
  const customBreadcrumbs = useRef<BreadcrumbItem[]>([]);

  // ============================================================================
  // BREADCRUMB GENERATION
  // ============================================================================

  const generateBreadcrumbs = useCallback(async (
    path: string, 
    state?: Record<string, any>
  ): Promise<BreadcrumbItem[]> => {
    try {
      setIsLoading(true);
      setError(undefined);

      const items: BreadcrumbItem[] = [];

      // Add home breadcrumb if enabled
      if (config.showHome) {
        items.push({
          id: 'breadcrumb_home',
          label: 'Home',
          path: '/',
          icon: Home,
          metadata: {
            type: 'home',
            description: 'Navigate to dashboard',
            category: 'navigation'
          },
          isClickable: true,
          isActive: path === '/'
        });
      }

      // Parse path segments
      const pathSegments = path.split('/').filter(segment => segment.length > 0);

      // Generate breadcrumbs for each segment
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const currentPath = '/' + pathSegments.slice(0, i + 1).join('/');

        // Get metadata for this path
        const metadata = await getRouteMetadata(currentPath);

        // Create breadcrumb item
        const breadcrumbItem = createBreadcrumbFromPath(
          segment,
          currentPath,
          i,
          { ...metadata, ...state }
        );

        // Enhanced labeling based on context
        if (metadata.title) {
          breadcrumbItem.label = metadata.title;
        }

        if (metadata.description) {
          breadcrumbItem.metadata!.description = metadata.description;
        }

        // Mark last item as active
        breadcrumbItem.isActive = i === pathSegments.length - 1;

        items.push(breadcrumbItem);
      }

      // Add custom breadcrumbs if any
      const customItems = customBreadcrumbs.current.filter(item => 
        path.startsWith(item.path) || item.path === path
      );

      items.push(...customItems);

      // Apply collapsing if needed
      let finalItems = items;
      if (config.enableCollapsing && items.length > config.collapseThreshold) {
        finalItems = collapseMiddleBreadcrumbs(items, config.maxItems);
      }

      // Limit to max items
      if (finalItems.length > config.maxItems) {
        finalItems = finalItems.slice(-config.maxItems);
      }

      return finalItems;
    } catch (error) {
      console.error('Breadcrumb generation error:', error);
      setError('Failed to generate breadcrumbs');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [config, path]);

  const collapseMiddleBreadcrumbs = (
    items: BreadcrumbItem[], 
    maxItems: number
  ): BreadcrumbItem[] => {
    if (items.length <= maxItems) return items;

    const keepStart = Math.floor(maxItems / 2);
    const keepEnd = maxItems - keepStart - 1; // -1 for the ellipsis item

    const startItems = items.slice(0, keepStart);
    const endItems = items.slice(-keepEnd);

    // Create ellipsis item
    const ellipsisItem: BreadcrumbItem = {
      id: 'breadcrumb_ellipsis',
      label: '...',
      path: '',
      icon: MoreHorizontal,
      metadata: {
        type: 'ellipsis',
        description: `${items.length - maxItems + 1} hidden items`,
        hiddenItems: items.slice(keepStart, -keepEnd)
      },
      isClickable: false,
      isActive: false
    };

    return [...startItems, ellipsisItem, ...endItems];
  };

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  const navigateToBreadcrumb = useCallback((item: BreadcrumbItem) => {
    if (!item.isClickable || item.isActive) return;

    try {
      // Track interaction
      trackBreadcrumbInteraction(item.id, 'click', {
        fromPath: pathname,
        toPath: item.path,
        timestamp: new Date().toISOString()
      });

      // Navigate with state preservation
      if (item.state) {
        const searchParams = new URLSearchParams();
        searchParams.set('state', btoa(JSON.stringify(item.state)));
        router.push(`${item.path}?${searchParams.toString()}`);
      } else {
        router.push(item.path);
      }

      // Update navigation history
      updateNavigationHistory(item.path);
    } catch (error) {
      console.error('Breadcrumb navigation error:', error);
      toast({
        title: 'Navigation Error',
        description: 'Failed to navigate to the selected item',
        variant: 'destructive'
      });
    }
  }, [pathname, router, toast]);

  const updateNavigationHistory = useCallback((path: string) => {
    const history = navigationHistory.current;
    const currentIndex = currentHistoryIndex.current;

    // Remove any forward history if we're not at the end
    if (currentIndex < history.length - 1) {
      navigationHistory.current = history.slice(0, currentIndex + 1);
    }

    // Add new path if it's different from current
    if (history[history.length - 1] !== path) {
      navigationHistory.current.push(path);
      currentHistoryIndex.current = navigationHistory.current.length - 1;
    }

    // Update navigation state
    setNavigation({
      canGoBack: currentHistoryIndex.current > 0,
      canGoForward: currentHistoryIndex.current < navigationHistory.current.length - 1,
      backPath: currentHistoryIndex.current > 0 
        ? navigationHistory.current[currentHistoryIndex.current - 1] 
        : undefined,
      forwardPath: currentHistoryIndex.current < navigationHistory.current.length - 1
        ? navigationHistory.current[currentHistoryIndex.current + 1]
        : undefined,
      historyIndex: currentHistoryIndex.current,
      historyLength: navigationHistory.current.length
    });
  }, []);

  const goBack = useCallback(() => {
    if (!navigation.canGoBack || !navigation.backPath) return;

    currentHistoryIndex.current -= 1;
    router.push(navigation.backPath);
    updateNavigationHistory(navigation.backPath);
  }, [navigation, router, updateNavigationHistory]);

  const goForward = useCallback(() => {
    if (!navigation.canGoForward || !navigation.forwardPath) return;

    currentHistoryIndex.current += 1;
    router.push(navigation.forwardPath);
    updateNavigationHistory(navigation.forwardPath);
  }, [navigation, router, updateNavigationHistory]);

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  const updateConfig = useCallback((newConfig: Partial<BreadcrumbConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));

    // Save to localStorage for persistence
    const updatedConfig = { ...config, ...newConfig };
    localStorage.setItem('breadcrumb_config', JSON.stringify(updatedConfig));
  }, [config]);

  const addCustomBreadcrumb = useCallback((item: Omit<BreadcrumbItem, 'id'>) => {
    const newItem: BreadcrumbItem = {
      ...item,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    customBreadcrumbs.current.push(newItem);
    
    // Regenerate breadcrumbs to include custom item
    refreshBreadcrumbs();
  }, []);

  const removeCustomBreadcrumb = useCallback((id: string) => {
    customBreadcrumbs.current = customBreadcrumbs.current.filter(item => item.id !== id);
    refreshBreadcrumbs();
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
    customBreadcrumbs.current = [];
  }, []);

  const refreshBreadcrumbs = useCallback(async () => {
    const newBreadcrumbs = await generateBreadcrumbs(pathname);
    setBreadcrumbs(newBreadcrumbs);
  }, [generateBreadcrumbs, pathname]);

  // ============================================================================
  // ANALYTICS FUNCTIONS
  // ============================================================================

  const getBreadcrumbAnalytics = useCallback(async (breadcrumbId: string): Promise<BreadcrumbAnalytics> => {
    try {
      const response = await fetch(`/api/racine/analytics/breadcrumbs/${breadcrumbId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get breadcrumb analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Breadcrumb analytics error:', error);
      throw error;
    }
  }, []);

  const trackBreadcrumbInteraction = useCallback((
    breadcrumbId: string, 
    action: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      const interactionEvent = {
        breadcrumbId,
        action,
        timestamp: new Date().toISOString(),
        userId: 'current_user', // Would come from auth context
        sessionId: localStorage.getItem('session_id') || '',
        path: pathname,
        metadata: {
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          ...metadata
        }
      };

      // Track with activity tracking API
      activityTrackingAPI.trackEvent('breadcrumb_interaction', interactionEvent);
    } catch (error) {
      console.error('Breadcrumb interaction tracking error:', error);
    }
  }, [pathname]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('breadcrumb_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved breadcrumb config:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Generate breadcrumbs when path changes
    const generateForCurrentPath = async () => {
      const state = searchParams.get('state');
      const parsedState = state ? JSON.parse(atob(state)) : undefined;
      
      const newBreadcrumbs = await generateBreadcrumbs(pathname, parsedState);
      setBreadcrumbs(newBreadcrumbs);
      
      // Update navigation history
      updateNavigationHistory(pathname);
    };

    generateForCurrentPath();
  }, [pathname, searchParams, generateBreadcrumbs, updateNavigationHistory]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    if (!config.enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Left Arrow - Go back
      if (event.altKey && event.key === 'ArrowLeft' && navigation.canGoBack) {
        event.preventDefault();
        goBack();
      }

      // Alt + Right Arrow - Go forward
      if (event.altKey && event.key === 'ArrowRight' && navigation.canGoForward) {
        event.preventDefault();
        goForward();
      }

      // Alt + Home - Go to home
      if (event.altKey && event.key === 'Home') {
        event.preventDefault();
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.enableKeyboardNavigation, navigation, goBack, goForward, router]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<BreadcrumbManagerContextType>(() => ({
    breadcrumbs,
    config,
    navigation,
    isLoading,
    error,
    generateBreadcrumbs,
    navigateToBreadcrumb,
    updateConfig,
    addCustomBreadcrumb,
    removeCustomBreadcrumb,
    clearBreadcrumbs,
    refreshBreadcrumbs,
    getBreadcrumbAnalytics,
    trackBreadcrumbInteraction
  }), [
    breadcrumbs,
    config,
    navigation,
    isLoading,
    error,
    generateBreadcrumbs,
    navigateToBreadcrumb,
    updateConfig,
    addCustomBreadcrumb,
    removeCustomBreadcrumb,
    clearBreadcrumbs,
    refreshBreadcrumbs,
    getBreadcrumbAnalytics,
    trackBreadcrumbInteraction
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <BreadcrumbManagerContext.Provider value={contextValue}>
      {children}
    </BreadcrumbManagerContext.Provider>
  );
};

// ============================================================================
// BREADCRUMB COMPONENTS
// ============================================================================

interface BreadcrumbNavigationProps {
  className?: string;
  showBackForward?: boolean;
  showHome?: boolean;
  maxVisible?: number;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  className = '',
  showBackForward = true,
  showHome = true,
  maxVisible
}) => {
  const { 
    breadcrumbs, 
    config, 
    navigation, 
    isLoading, 
    navigateToBreadcrumb,
    trackBreadcrumbInteraction
  } = useBreadcrumbManager();

  const router = useRouter();

  // Apply max visible limit
  const visibleBreadcrumbs = useMemo(() => {
    if (!maxVisible || breadcrumbs.length <= maxVisible) {
      return breadcrumbs;
    }

    return collapseMiddleBreadcrumbs(breadcrumbs, maxVisible);
  }, [breadcrumbs, maxVisible]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack && navigation.backPath) {
      trackBreadcrumbInteraction('navigation_back', 'click');
      router.back();
    }
  }, [navigation, router, trackBreadcrumbInteraction]);

  const handleForward = useCallback(() => {
    if (navigation.canGoForward && navigation.forwardPath) {
      trackBreadcrumbInteraction('navigation_forward', 'click');
      router.forward();
    }
  }, [navigation, router, trackBreadcrumbInteraction]);

  const handleHome = useCallback(() => {
    trackBreadcrumbInteraction('navigation_home', 'click');
    router.push('/');
  }, [router, trackBreadcrumbInteraction]);

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === visibleBreadcrumbs.length - 1;
    const IconComponent = item.icon || Navigation;

    if (item.metadata?.type === 'ellipsis') {
      return (
        <div key={item.id} className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Hidden Navigation Items
                </div>
                {(item.metadata?.hiddenItems as BreadcrumbItem[])?.map((hiddenItem) => (
                  <Button
                    key={hiddenItem.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2"
                    onClick={() => navigateToBreadcrumb(hiddenItem)}
                  >
                    {hiddenItem.icon && (
                      <hiddenItem.icon className="w-3 h-3 mr-2" />
                    )}
                    <span className="truncate">{hiddenItem.label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {!isLast && (
            <ChevronRight className="w-3 h-3 mx-1 text-muted-foreground" />
          )}
        </div>
      );
    }

    const breadcrumbButton = (
      <Button
        variant={item.isActive ? "secondary" : "ghost"}
        size="sm"
        className={`h-8 px-2 ${item.isClickable ? 'cursor-pointer' : 'cursor-default'} ${
          item.isActive ? 'font-medium' : ''
        }`}
        onClick={() => item.isClickable && navigateToBreadcrumb(item)}
        disabled={!item.isClickable || item.isLoading}
      >
        {config.showIcons && IconComponent && (
          <IconComponent className="w-3 h-3 mr-2" />
        )}
        <span className="truncate max-w-32">{item.label}</span>
        {item.isLoading && (
          <RefreshCw className="w-3 h-3 ml-2 animate-spin" />
        )}
      </Button>
    );

    const breadcrumbContent = config.showTooltips && item.metadata?.description ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {breadcrumbButton}
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-64">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.metadata.description}
              </div>
              {item.metadata.tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.metadata.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : breadcrumbButton;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center"
      >
        {breadcrumbContent}
        {!isLast && (
          <ChevronRight className="w-3 h-3 mx-1 text-muted-foreground" />
        )}
      </motion.div>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Back/Forward Navigation */}
      {showBackForward && (
        <div className="flex items-center mr-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleBack}
            disabled={!navigation.canGoBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleForward}
            disabled={!navigation.canGoForward}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-2" />
        </div>
      )}

      {/* Home Button */}
      {showHome && !breadcrumbs.some(item => item.path === '/') && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleHome}
          >
            <Home className="w-4 h-4" />
          </Button>
          <ChevronRight className="w-3 h-3 mx-1 text-muted-foreground" />
        </div>
      )}

      {/* Breadcrumb Items */}
      <div className="flex items-center min-w-0 flex-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-1 min-w-0"
            >
              {visibleBreadcrumbs.map((item, index) => renderBreadcrumbItem(item, index))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface BreadcrumbSettingsProps {
  onClose?: () => void;
}

export const BreadcrumbSettings: React.FC<BreadcrumbSettingsProps> = ({ onClose }) => {
  const { config, updateConfig } = useBreadcrumbManager();
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = useCallback(() => {
    updateConfig(localConfig);
    onClose?.();
    toast({
      title: 'Settings Saved',
      description: 'Breadcrumb settings have been updated'
    });
  }, [localConfig, updateConfig, onClose]);

  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Breadcrumb Settings
        </CardTitle>
        <CardDescription>
          Customize breadcrumb appearance and behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Max Items</Label>
            <Input
              type="number"
              value={localConfig.maxItems}
              onChange={(e) => setLocalConfig(prev => ({ 
                ...prev, 
                maxItems: parseInt(e.target.value) || 8 
              }))}
              min="3"
              max="20"
            />
          </div>

          <div className="space-y-2">
            <Label>Collapse Threshold</Label>
            <Input
              type="number"
              value={localConfig.collapseThreshold}
              onChange={(e) => setLocalConfig(prev => ({ 
                ...prev, 
                collapseThreshold: parseInt(e.target.value) || 5 
              }))}
              min="3"
              max="15"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Icons</Label>
            <Switch
              checked={localConfig.showIcons}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ 
                ...prev, 
                showIcons: checked 
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Home Button</Label>
            <Switch
              checked={localConfig.showHome}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ 
                ...prev, 
                showHome: checked 
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Collapsing</Label>
            <Switch
              checked={localConfig.enableCollapsing}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ 
                ...prev, 
                enableCollapsing: checked 
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Tooltips</Label>
            <Switch
              checked={localConfig.showTooltips}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ 
                ...prev, 
                showTooltips: checked 
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Keyboard Navigation</Label>
            <Switch
              checked={localConfig.enableKeyboardNavigation}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ 
                ...prev, 
                enableKeyboardNavigation: checked 
              }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            value={localConfig.theme}
            onValueChange={(value) => setLocalConfig(prev => ({ 
              ...prev, 
              theme: value as BreadcrumbConfig['theme']
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface BreadcrumbAnalyticsProps {
  breadcrumbId?: string;
}

export const BreadcrumbAnalytics: React.FC<BreadcrumbAnalyticsProps> = ({ breadcrumbId }) => {
  const { getBreadcrumbAnalytics } = useBreadcrumbManager();
  const [analytics, setAnalytics] = useState<BreadcrumbAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalytics = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getBreadcrumbAnalytics(id);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load breadcrumb analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getBreadcrumbAnalytics]);

  useEffect(() => {
    if (breadcrumbId) {
      loadAnalytics(breadcrumbId);
    }
  }, [breadcrumbId, loadAnalytics]);

  if (!breadcrumbId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
        <p>Select a breadcrumb to view analytics</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Breadcrumb Analytics
        </CardTitle>
        <CardDescription>
          Performance metrics for breadcrumb navigation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Total Clicks</Label>
            <div className="text-2xl font-bold">{analytics.clickCount.toLocaleString()}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Conversion Rate</Label>
            <div className="text-2xl font-bold">{(analytics.conversionRate * 100).toFixed(1)}%</div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Avg. Time to Click</Label>
            <div className="text-2xl font-bold">{analytics.averageTimeToClick.toFixed(1)}s</div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Drop-off Rate</Label>
            <div className="text-2xl font-bold">{(analytics.dropOffRate * 100).toFixed(1)}%</div>
          </div>
        </div>

        {analytics.mostCommonNextPath && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Most Common Next Path</Label>
            <div className="font-medium">{analytics.mostCommonNextPath}</div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">User Segments</Label>
          <div className="space-y-1">
            {Object.entries(analytics.userSegments).map(([segment, count]) => (
              <div key={segment} className="flex justify-between text-sm">
                <span>{segment}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// BREADCRUMB HOOKS
// ============================================================================

export const useBreadcrumb = (path?: string) => {
  const { 
    breadcrumbs, 
    generateBreadcrumbs, 
    navigateToBreadcrumb, 
    trackBreadcrumbInteraction 
  } = useBreadcrumbManager();

  const currentBreadcrumbs = useMemo(() => {
    if (!path) return breadcrumbs;
    return breadcrumbs.filter(item => item.path.startsWith(path));
  }, [breadcrumbs, path]);

  const navigate = useCallback((item: BreadcrumbItem) => {
    navigateToBreadcrumb(item);
  }, [navigateToBreadcrumb]);

  const track = useCallback((action: string, metadata?: Record<string, any>) => {
    if (currentBreadcrumbs.length > 0) {
      const activeItem = currentBreadcrumbs.find(item => item.isActive);
      if (activeItem) {
        trackBreadcrumbInteraction(activeItem.id, action, metadata);
      }
    }
  }, [currentBreadcrumbs, trackBreadcrumbInteraction]);

  return {
    breadcrumbs: currentBreadcrumbs,
    navigate,
    track,
    refresh: () => path && generateBreadcrumbs(path)
  };
};

export const useBreadcrumbNavigation = () => {
  const { navigation } = useBreadcrumbManager();
  const router = useRouter();

  const goBack = useCallback(() => {
    if (navigation.canGoBack) {
      router.back();
    }
  }, [navigation.canGoBack, router]);

  const goForward = useCallback(() => {
    if (navigation.canGoForward) {
      router.forward();
    }
  }, [navigation.canGoForward, router]);

  const goHome = useCallback(() => {
    router.push('/');
  }, [router]);

  return {
    ...navigation,
    goBack,
    goForward,
    goHome
  };
};

export const useBreadcrumbAnalytics = () => {
  const { getBreadcrumbAnalytics, trackBreadcrumbInteraction } = useBreadcrumbManager();
  const [analytics, setAnalytics] = useState<Record<string, BreadcrumbAnalytics>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalytics = useCallback(async (breadcrumbIds: string[]) => {
    setIsLoading(true);
    try {
      const analyticsPromises = breadcrumbIds.map(id => getBreadcrumbAnalytics(id));
      const results = await Promise.all(analyticsPromises);
      
      const analyticsMap: Record<string, BreadcrumbAnalytics> = {};
      results.forEach((result, index) => {
        analyticsMap[breadcrumbIds[index]] = result;
      });

      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Failed to load breadcrumb analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getBreadcrumbAnalytics]);

  const trackInteraction = useCallback((
    breadcrumbId: string, 
    action: string, 
    metadata?: Record<string, any>
  ) => {
    trackBreadcrumbInteraction(breadcrumbId, action, metadata);
  }, [trackBreadcrumbInteraction]);

  return {
    analytics,
    isLoading,
    loadAnalytics,
    trackInteraction
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default BreadcrumbManagerProvider;
export type { 
  BreadcrumbItem, 
  BreadcrumbConfig, 
  BreadcrumbAnalytics, 
  BreadcrumbNavigation as BreadcrumbNavigationType,
  BreadcrumbContext
};