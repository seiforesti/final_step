"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, useDeferredValue, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Database, Shield, FileText, BookOpen, Scan, Users,
  Activity, BarChart3, Workflow, Zap, Bot, MessageSquare, Settings, Clock, Search,
  MoreHorizontal, Pin, Unlink as Unpin, ExternalLink, ChevronDown, Heart, Globe,
  ArrowRight, Target, Trash2, Copy, RefreshCw, AlertCircle, CheckCircle, XCircle,
  Loader2, Star, History, TrendingUp, ShieldCheck, Cpu, Network, HardDrive
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuShortcut } from "../ui/context-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";

// Import foundation hooks with error boundaries
import { useCrossGroupIntegration } from "../../hooks/useCrossGroupIntegration";
import { useUserManagement } from "../../hooks/useUserManagement";
import { useWorkspaceManagement } from "../../hooks/useWorkspaceManagement";
import { useActivityTracker } from "../../hooks/useActivityTracker";
import { useQuickActions } from "../../hooks/useQuickActions";
import { useNavigationAnalytics } from "../../hooks/useNavigationAnalytics";
import { useUserPreferences } from "../../hooks/useUserPreferences";

// Import utilities
import { getHealthStatusColor, getStatusIcon } from "../../utils/navigation-utils";
import { DEFAULT_SIDEBAR_WIDTH, COLLAPSED_SIDEBAR_WIDTH } from "../../constants/cross-group-configs";

// Error Boundary Component
class SidebarErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Sidebar Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm text-red-600">Sidebar failed to load</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Types
interface FavoriteItem {
  id: string;
  type: "spa" | "racine";
  key: string;
  name: string;
  route: string;
  icon: any;
  color: string;
  addedAt: Date;
}

interface NavigationItem {
  id?: string;
  type: "spa" | "racine";
  key: string;
  route: string;
}

interface SidebarState {
  collapsed: boolean;
  searchQuery: string;
  expandedSections: Record<string, boolean>;
  favorites: FavoriteItem[];
  recentItems: NavigationItem[];
  isPinned: boolean;
  loading: boolean;
  error: string | null;
  healthStatus: Record<string, string>;
  performanceMetrics: {
    renderTime: number;
    memoryUsage: number;
    apiLatency: number;
  };
}

// SPA Metadata with enhanced information
const EXISTING_SPA_METADATA = {
  "data-sources": {
    name: "Data Sources",
    icon: Database,
    description: "Manage and monitor data source connections",
    shortDescription: "Data connections & monitoring",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    category: "Data Management",
    route: "/v15_enhanced_1/components/data-sources",
    keywords: ["database", "connection", "source", "data"],
    estimatedComplexity: "high",
    lastUpdated: new Date("2024-01-15"),
    status: "stable",
    team: "Data Platform",
    healthEndpoint: "/api/health/data-sources",
    performanceMetrics: true,
  },
  "scan-rule-sets": {
    name: "Scan Rule Sets",
    icon: Shield,
    description: "Configure and manage advanced scanning rules",
    shortDescription: "Scanning rules & policies",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    category: "Security & Compliance",
    route: "/v15_enhanced_1/components/Advanced-Scan-Rule-Sets",
    keywords: ["scan", "rules", "security", "policy"],
    estimatedComplexity: "high",
    lastUpdated: new Date("2024-01-14"),
    status: "stable",
    team: "Security",
    healthEndpoint: "/api/health/scan-rules",
    performanceMetrics: true,
  },
  classifications: {
    name: "Classifications",
    icon: FileText,
    description: "Data classification and intelligent tagging",
    shortDescription: "Data classification & tagging",
    color: "bg-green-500",
    textColor: "text-green-600",
    category: "Data Governance",
    route: "/v15_enhanced_1/components/classifications",
    keywords: ["classification", "tags", "metadata", "labels"],
    estimatedComplexity: "medium",
    lastUpdated: new Date("2024-01-13"),
    status: "stable",
    team: "Governance",
    healthEndpoint: "/api/health/classifications",
    performanceMetrics: true,
  },
  "compliance-rule": {
    name: "Compliance Rules",
    icon: BookOpen,
    description: "Compliance policies and audit management",
    shortDescription: "Compliance & audit rules",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    category: "Security & Compliance",
    route: "/v15_enhanced_1/components/Compliance-Rule",
    keywords: ["compliance", "audit", "policy", "regulation"],
    estimatedComplexity: "high",
    lastUpdated: new Date("2024-01-12"),
    status: "stable",
    team: "Compliance",
    healthEndpoint: "/api/health/compliance",
    performanceMetrics: true,
  },
  "advanced-catalog": {
    name: "Advanced Catalog",
    icon: Scan,
    description: "Data catalog and metadata management",
    shortDescription: "Data catalog & metadata",
    color: "bg-teal-500",
    textColor: "text-teal-600",
    category: "Data Management",
    route: "/v15_enhanced_1/components/Advanced-Catalog",
    keywords: ["catalog", "metadata", "discovery", "lineage"],
    estimatedComplexity: "high",
    lastUpdated: new Date("2024-01-11"),
    status: "stable",
    team: "Data Platform",
    healthEndpoint: "/api/health/catalog",
    performanceMetrics: true,
  },
  "scan-logic": {
    name: "Scan Logic",
    icon: Activity,
    description: "Advanced scanning and processing logic",
    shortDescription: "Scan orchestration & logic",
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    category: "Processing",
    route: "/v15_enhanced_1/components/Advanced-Scan-Logic",
    keywords: ["scan", "logic", "processing", "orchestration"],
    estimatedComplexity: "high",
    lastUpdated: new Date("2024-01-10"),
    status: "stable",
    team: "Engineering",
    healthEndpoint: "/api/health/scan-logic",
    performanceMetrics: true,
  },
  "rbac-system": {
    name: "RBAC System",
    icon: Users,
    description: "Role-based access control management",
    shortDescription: "User & permission management",
    color: "bg-red-500",
    textColor: "text-red-600",
    category: "Security & Compliance",
    route: "/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System",
    keywords: ["rbac", "users", "roles", "permissions"],
    estimatedComplexity: "high",
    lastUpdated: new Date("2024-01-09"),
    status: "stable",
    team: "Security",
    adminOnly: true,
    healthEndpoint: "/api/health/rbac",
    performanceMetrics: true,
  },
} as const;

// Racine feature metadata
const RACINE_FEATURE_METADATA = {
  dashboard: {
    name: "Global Dashboard",
    icon: BarChart3,
    description: "Cross-SPA analytics and insights",
    shortDescription: "Global insights & KPIs",
    color: "bg-cyan-500",
    textColor: "text-cyan-600",
    category: "Analytics",
    route: "/racine/dashboard",
    keywords: ["dashboard", "analytics", "kpi", "metrics"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/dashboard",
    performanceMetrics: true,
  },
  workspace: {
    name: "Workspace Manager",
    icon: Globe,
    description: "Multi-workspace orchestration",
    shortDescription: "Workspace management",
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    category: "Management",
    route: "/racine/workspace",
    keywords: ["workspace", "project", "team", "collaboration"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/workspace",
    performanceMetrics: true,
  },
  workflows: {
    name: "Job Workflows",
    icon: Workflow,
    description: "Databricks-style workflow builder",
    shortDescription: "Workflow automation",
    color: "bg-violet-500",
    textColor: "text-violet-600",
    category: "Automation",
    route: "/racine/job-workflow-space",
    keywords: ["workflow", "automation", "jobs", "pipeline"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/workflows",
    performanceMetrics: true,
  },
  pipelines: {
    name: "Pipeline Manager",
    icon: Zap,
    description: "Advanced pipeline management",
    shortDescription: "Data pipelines",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    category: "Processing",
    route: "/racine/pipeline-manager",
    keywords: ["pipeline", "etl", "processing", "data"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/pipelines",
    performanceMetrics: true,
  },
  ai: {
    name: "AI Assistant",
    icon: Bot,
    description: "Context-aware AI assistance",
    shortDescription: "AI-powered help",
    color: "bg-pink-500",
    textColor: "text-pink-600",
    category: "AI & ML",
    route: "/racine/ai-assistant",
    keywords: ["ai", "assistant", "help", "automation"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/ai",
    performanceMetrics: true,
  },
  activity: {
    name: "Activity Tracker",
    icon: Clock,
    description: "Historic activities and audit trails",
    shortDescription: "Activity monitoring",
    color: "bg-slate-500",
    textColor: "text-slate-600",
    category: "Monitoring",
    route: "/racine/activity-tracker",
    keywords: ["activity", "audit", "history", "tracking"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/activity",
    performanceMetrics: true,
  },
  analytics: {
    name: "Intelligent Dashboard",
    icon: Target,
    description: "Custom dashboard builder",
    shortDescription: "Custom dashboards",
    color: "bg-lime-500",
    textColor: "text-lime-600",
    category: "Analytics",
    route: "/racine/intelligent-dashboard",
    keywords: ["dashboard", "custom", "widgets", "reports"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/analytics",
    performanceMetrics: true,
  },
  collaboration: {
    name: "Collaboration Hub",
    icon: MessageSquare,
    description: "Team collaboration center",
    shortDescription: "Team collaboration",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    category: "Collaboration",
    route: "/racine/collaboration",
    keywords: ["collaboration", "team", "chat", "sharing"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/collaboration",
    performanceMetrics: true,
  },
  settings: {
    name: "User Settings",
    icon: Settings,
    description: "Profile and preferences management",
    shortDescription: "User preferences",
    color: "bg-gray-500",
    textColor: "text-gray-600",
    category: "Settings",
    route: "/racine/user-management",
    keywords: ["settings", "profile", "preferences", "user"],
    isRacineFeature: true,
    healthEndpoint: "/api/health/settings",
    performanceMetrics: true,
  },
} as const;

// Safe icon renderer
const IconRenderer: React.FC<{ icon: any; className?: string }> = ({ icon, className }) => {
  const Comp = icon as React.ComponentType<any> | undefined;
  if (!Comp) return null;
  return <Comp className={className} />;
};

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    apiLatency: 0,
  });

  const measureRender = useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, []);

  const measureApiCall = useCallback(async (apiCall: () => Promise<any>) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const latency = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, apiLatency: latency }));
      return result;
    } catch (error) {
      const latency = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, apiLatency: latency }));
      throw error;
    }
  }, []);

  return { metrics, measureRender, measureApiCall };
};

// Health monitoring hook
const useHealthMonitor = () => {
  const [healthStatus, setHealthStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async (endpoint: string, key: string) => {
    try {
      setLoading(true);
      const response = await fetch(endpoint, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(prev => ({ ...prev, [key]: data.status || 'healthy' }));
      } else {
        setHealthStatus(prev => ({ ...prev, [key]: 'unhealthy' }));
      }
    } catch (error) {
      setHealthStatus(prev => ({ ...prev, [key]: 'error' }));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllHealth = useCallback(async () => {
    const healthChecks = [
      ...Object.entries(EXISTING_SPA_METADATA).map(([key, metadata]) => 
        checkHealth(metadata.healthEndpoint, key)
      ),
      ...Object.entries(RACINE_FEATURE_METADATA).map(([key, metadata]) => 
        checkHealth(metadata.healthEndpoint, key)
      )
    ];
    
    await Promise.allSettled(healthChecks);
  }, [checkHealth]);

  return { healthStatus, loading, checkHealth, refreshAllHealth };
};

interface AdvancedAppSidebarProps {
  className?: string;
  onQuickActionsTrigger?: () => void;
  isQuickActionsSidebarOpen?: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const AdvancedAppSidebar: React.FC<AdvancedAppSidebarProps> = ({
  className,
  onQuickActionsTrigger,
  isQuickActionsSidebarOpen = false,
  isCollapsed: externalCollapsed,
  onCollapsedChange,
}) => {
  const startTime = useRef(performance.now());
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const statusUpdateRef = useRef<NodeJS.Timeout>();
  
  // Performance monitoring
  const { metrics, measureRender, measureApiCall } = usePerformanceMonitor();
  
  // Health monitoring with batched updates
  const { healthStatus, loading: healthLoading, refreshAllHealth } = useHealthMonitor();

  // Debounced search state
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Core state management
  const [state, setState] = useState<SidebarState>({
    collapsed: false,
    searchQuery: "",
    expandedSections: {
      spas: true,
      racine: true,
      favorites: true,
      recent: false,
    },
    favorites: [],
    recentItems: [],
    isPinned: false,
    loading: false,
    error: null,
    healthStatus: {},
    performanceMetrics: {
      renderTime: 0,
      memoryUsage: 0,
      apiLatency: 0,
    },
  });

  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  // Determine if sidebar is collapsed
  const isCollapsed = externalCollapsed ?? state.collapsed;

  // Foundation hooks with error handling
  const crossGroupHook = useCrossGroupIntegration();
  const crossGroupState = crossGroupHook?.state || {};
  const coordinateNavigation = crossGroupHook?.navigateToSPA || (() => {});

  const userHook = useUserManagement();
  const userState = userHook?.[0] || {};
  const userOps = userHook?.[1] || {};

  const workspaceHook = useWorkspaceManagement();
  const workspaceState = workspaceHook || {};

  const activityHook = useActivityTracker();
  const activityOps = activityHook || {};

  const navigationAnalytics = useNavigationAnalytics();
  const trackSidebarUsage = navigationAnalytics?.trackNavigation || (() => {});

  const userPrefsHook = useUserPreferences();
  const userPrefsState = userPrefsHook || {};
  const userPrefsOps = userPrefsHook || {};

  // Memoized functions to prevent infinite loops
  const checkUserAccess = useCallback(
    (permission: string) => {
      try {
        return userOps?.checkUserAccess?.(permission) ?? true;
      } catch {
        return true;
      }
    },
    [userOps]
  );

  const getRecentNavigationHistory = useCallback(
    async (limit: number) => {
      try {
        return await measureApiCall(() => activityOps?.loadActivities?.({ page: 1, pageSize: limit })) || [];
      } catch {
        return [];
      }
    },
    [activityOps, measureApiCall]
  );

  const trackNavigation = useCallback(
    (payload: any) => {
      try {
        activityOps?.logActivity?.(payload);
      } catch {
        /* noop */
      }
    },
    [activityOps]
  );

  const updatePreference = useCallback(
    (key: string, value: any) => {
      try {
        // Store in localStorage as fallback
        const currentPrefs = JSON.parse(localStorage.getItem('sidebarPreferences') || '{}');
        currentPrefs[key] = value;
        localStorage.setItem('sidebarPreferences', JSON.stringify(currentPrefs));
      } catch {
        /* noop */
      }
    },
    []
  );

  const getSidebarPreferences = useCallback(async () => {
    try {
      // Try to get from localStorage as fallback
      const storedPrefs = localStorage.getItem('sidebarPreferences');
      return storedPrefs ? JSON.parse(storedPrefs) : {};
    } catch {
      return {};
    }
  }, []);

  const saveFavoriteItem = useCallback(
    async (fav: any) => {
      try {
        const currentPrefs = JSON.parse(localStorage.getItem('sidebarPreferences') || '{}');
        if (!currentPrefs.favorites) currentPrefs.favorites = [];
        currentPrefs.favorites.push(fav);
        localStorage.setItem('sidebarPreferences', JSON.stringify(currentPrefs));
      } catch {
        /* noop */
      }
    },
    []
  );

  const removeFavoriteItem = useCallback(
    async (id: string) => {
      try {
        const currentPrefs = JSON.parse(localStorage.getItem('sidebarPreferences') || '{}');
        if (currentPrefs.favorites) {
          currentPrefs.favorites = currentPrefs.favorites.filter((f: any) => f.id !== id);
          localStorage.setItem('sidebarPreferences', JSON.stringify(currentPrefs));
        }
      } catch {
        /* noop */
      }
    },
    []
  );

  // Handle collapsed state change
  const handleCollapsedChange = useCallback(
    (collapsed: boolean) => {
      if (onCollapsedChange) {
        onCollapsedChange(collapsed);
      } else {
        setState(prev => ({ ...prev, collapsed }));
      }
    },
    [onCollapsedChange]
  );

  // Load user preferences and favorites
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const sidebarPrefs = await getSidebarPreferences();
        if (!mounted) return;
        
        setState(prev => ({
          ...prev,
          isPinned: !!sidebarPrefs.isPinned,
          expandedSections: sidebarPrefs.expandedSections || {
            spas: true,
            racine: true,
            favorites: true,
            recent: false,
          },
          favorites: Array.isArray(sidebarPrefs.favorites) ? sidebarPrefs.favorites : [],
          loading: false,
        }));
      } catch (error) {
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            error: "Failed to load preferences",
            loading: false 
          }));
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getSidebarPreferences]);

  // Load recent navigation history
  useEffect(() => {
    let mounted = true;
    const loader = async () => {
      try {
        const recent = await getRecentNavigationHistory(10);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            recentItems: Array.isArray(recent) ? recent : [] 
          }));
        }
      } catch (error) {
        console.error("Failed to load recent items:", error);
      }
    };
    
    // Use requestIdleCallback for better performance
    if (typeof (window as any).requestIdleCallback === "function") {
      (window as any).requestIdleCallback(() => loader());
    } else {
      setTimeout(() => loader(), 0);
    }
    
    return () => {
      mounted = false;
    };
  }, [getRecentNavigationHistory]);

  // Health check on mount
  useEffect(() => {
    refreshAllHealth();
  }, [refreshAllHealth]);

  // Get current active item
  const currentActiveItem = useMemo(() => {
    // Check existing SPAs
    for (const [spaKey, metadata] of Object.entries(EXISTING_SPA_METADATA)) {
      if (pathname.startsWith(metadata.route)) {
        return { type: "spa", key: spaKey, metadata };
      }
    }

    // Check Racine features
    for (const [featureKey, metadata] of Object.entries(RACINE_FEATURE_METADATA)) {
      if (pathname.startsWith(metadata.route)) {
        return { type: "racine", key: featureKey, metadata };
      }
    }

    return null;
  }, [pathname]);

  // Filter SPAs based on permissions
  const accessibleSPAs = useMemo(() => {
    return Object.entries(EXISTING_SPA_METADATA).filter(([spaKey, metadata]) => {
      if ((metadata as any).adminOnly && !checkUserAccess("rbac:admin")) {
        return false;
      }
      return checkUserAccess(`spa:${spaKey}`);
    });
  }, [checkUserAccess]);

  // Filter items based on search
  const filteredSPAs = useMemo(() => {
    if (!state.searchQuery) return accessibleSPAs;
    const query = state.searchQuery.toLowerCase();
    return accessibleSPAs.filter(([spaKey, metadata]) => {
      return (
        metadata.name.toLowerCase().includes(query) ||
        metadata.description.toLowerCase().includes(query) ||
        metadata.category.toLowerCase().includes(query)
      );
    });
  }, [accessibleSPAs, state.searchQuery]);

  const filteredRacineFeatures = useMemo(() => {
    if (!state.searchQuery) return Object.entries(RACINE_FEATURE_METADATA);
    const query = state.searchQuery.toLowerCase();
    return Object.entries(RACINE_FEATURE_METADATA).filter(([featureKey, metadata]) => {
      return (
        metadata.name.toLowerCase().includes(query) ||
        metadata.description.toLowerCase().includes(query) ||
        metadata.category.toLowerCase().includes(query)
      );
    });
  }, [state.searchQuery]);

  // Handle navigation
  const handleNavigation = useCallback(
    (type: "spa" | "racine", key: string, metadata: any) => {
      startTransition(() => {
        try {
          trackNavigation({
            type,
            key,
            destination: metadata.route,
            source: "sidebar",
            timestamp: new Date(),
          });

          trackSidebarUsage("navigation", {
            action: "navigation",
            item: key,
            category: type,
            timestamp: new Date(),
          });

          if (type === "spa") {
            Promise.resolve(
              coordinateNavigation(key)
            ).catch(() => {});
          }

          router.push(metadata.route);
        } catch (error) {
          console.error("Navigation error:", error);
        }
      });
    },
    [coordinateNavigation, router, trackNavigation, trackSidebarUsage, startTransition]
  );

  // Handle Quick Actions trigger
  const handleQuickActionsTrigger = useCallback(
    (spaKey?: string, context?: any) => {
      if (onQuickActionsTrigger) {
        onQuickActionsTrigger();
      }

      trackSidebarUsage("quick_actions_trigger", {
        action: "quick_actions_trigger",
        item: spaKey || "general",
        context,
        timestamp: new Date(),
      });
    },
    [onQuickActionsTrigger, trackSidebarUsage]
  );

  // Handle favorites
  const handleToggleFavorite = useCallback(
    async (type: "spa" | "racine", key: string, metadata: any) => {
      try {
        const existingFavorite = state.favorites.find(
          (fav) => fav.key === key && fav.type === type
        );

        if (existingFavorite) {
          await removeFavoriteItem(existingFavorite.id);
          setState(prev => ({
            ...prev,
            favorites: prev.favorites.filter((fav) => fav.id !== existingFavorite.id)
          }));
        } else {
          const newFavorite: FavoriteItem = {
            id: `${type}_${key}_${Date.now()}`,
            type,
            key,
            name: metadata.name,
            route: metadata.route,
            icon: metadata.icon,
            color: metadata.color,
            addedAt: new Date(),
          };

          await saveFavoriteItem(newFavorite);
          setState(prev => ({ ...prev, favorites: [...prev.favorites, newFavorite] }));
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
      }
    },
    [state.favorites, saveFavoriteItem, removeFavoriteItem]
  );

  // Toggle expanded sections
  const toggleSection = useCallback(
    (section: string) => {
      setState(prev => {
        const newState = { ...prev, expandedSections: { ...prev.expandedSections, [section]: !prev.expandedSections[section] } };
        updatePreference("sidebarExpandedSections", newState.expandedSections);
        return newState;
      });
    },
    [updatePreference]
  );

  // Render sidebar item
  const renderSidebarItem = useCallback(
    (
      type: "spa" | "racine",
      key: string,
      metadata: any,
      options: {
        showStatus?: boolean;
        showQuickActions?: boolean;
        showDescription?: boolean;
        isFavorite?: boolean;
        isRecent?: boolean;
      } = {}
    ) => {
      const {
        showStatus = true,
        showQuickActions = true,
        showDescription = false,
        isFavorite = false,
        isRecent = false,
      } = options;

      const isActive = currentActiveItem?.key === key && currentActiveItem?.type === type;
      const status = type === "spa" ? healthStatus[key] || "unknown" : "healthy";
      const StatusIcon = getStatusIcon(status);
      const statusColor = getHealthStatusColor(status);
      const isFav = state.favorites.some((fav) => fav.key === key && fav.type === type);

      return (
        <ContextMenu key={`${type}_${key}`}>
          <ContextMenuTrigger>
            <button
              type="button"
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-muted/50 focus:bg-muted/50",
                isActive && "bg-primary/10 border border-primary/20 text-primary",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => handleNavigation(type, key, metadata)}
            >
              {/* Icon and status */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isActive ? "bg-primary text-primary-foreground" : metadata.color
                  )}
                >
                  <IconRenderer icon={metadata.icon} className="w-4 h-4 text-white" />
                </div>

                {/* Status indicator for SPAs */}
                {showStatus && type === "spa" && !isCollapsed && (
                  <div className="absolute -bottom-1 -right-1">
                    <IconRenderer icon={StatusIcon} className={cn("w-3 h-3", statusColor)} />
                  </div>
                )}
              </div>

              {/* Content */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("font-medium text-sm truncate", isActive && "text-primary")}>
                        {metadata.name}
                      </h4>
                      {showDescription && (
                        <p className="text-xs text-muted-foreground truncate">
                          {metadata.shortDescription}
                        </p>
                      )}
                    </div>

                    {/* Badges and indicators */}
                    <div className="flex items-center gap-1 ml-2">
                      {isFav && <Heart className="w-3 h-3 text-pink-500 fill-current" />}
                      {isRecent && <Clock className="w-3 h-3 text-muted-foreground" />}
                      {metadata.adminOnly && <Shield className="w-3 h-3 text-orange-500" />}
                    </div>
                  </div>

                  {/* Category and status */}
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {metadata.category}
                    </Badge>
                    {showStatus && type === "spa" && (
                      <span className={cn("text-xs", statusColor)}>{status}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Quick actions trigger */}
              {showQuickActions && !isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    isQuickActionsSidebarOpen && "opacity-100 bg-primary/10 text-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickActionsTrigger(key, { type, metadata });
                  }}
                >
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </button>
          </ContextMenuTrigger>

          {/* Context menu */}
          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleNavigation(type, key, metadata)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
              <ContextMenuShortcut>Enter</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuItem onClick={() => handleToggleFavorite(type, key, metadata)}>
              {isFav ? (
                <>
                  <Heart className="w-4 h-4 mr-2 fill-current" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Favorites
                </>
              )}
            </ContextMenuItem>

            {showQuickActions && (
              <ContextMenuItem onClick={() => handleQuickActionsTrigger(key, { type, metadata })}>
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
                <ContextMenuShortcut>⌘.</ContextMenuShortcut>
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />

            <ContextMenuItem onClick={() => navigator.clipboard.writeText(metadata.route)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </ContextMenuItem>

            <ContextMenuItem onClick={() => window.open(metadata.route, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    },
    [
      currentActiveItem,
      healthStatus,
      state.favorites,
      isCollapsed,
      isQuickActionsSidebarOpen,
      handleNavigation,
      handleQuickActionsTrigger,
      handleToggleFavorite,
    ]
  );

  // Render section header
  const renderSectionHeader = useCallback(
    (
      title: string,
      sectionKey: string,
      options: {
        icon?: React.ComponentType<any>;
        count?: number;
        collapsible?: boolean;
        actions?: React.ReactNode;
      } = {}
    ) => {
      const { icon: Icon, count, collapsible = true, actions } = options;
      const isExpanded = state.expandedSections[sectionKey];

      if (isCollapsed && collapsible) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-3 py-2 flex justify-center">
                {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        );
      }

      return (
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {collapsible ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleSection(sectionKey)}
                >
                  <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                </Button>
              ) : (
                Icon && <Icon className="w-4 h-4 text-muted-foreground" />
              )}

              <h3 className="text-sm font-medium text-muted-foreground">
                {title}
                {count !== undefined && <span className="ml-2 text-xs">({count})</span>}
              </h3>
            </div>

            {actions && <div className="flex items-center gap-1">{actions}</div>}
          </div>
        </div>
      );
    },
    [isCollapsed, state.expandedSections, toggleSection]
  );

  // Measure render time
  useEffect(() => {
    measureRender(startTime.current);
  }, [measureRender]);

  return (
    <SidebarErrorBoundary>
      <TooltipProvider>
        <motion.aside
          ref={sidebarRef}
          initial={{ x: -280, opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
            width: isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : DEFAULT_SIDEBAR_WIDTH,
          }}
          className={cn(
            "fixed left-0 top-16 bottom-0 z-40",
            "bg-background/95 backdrop-blur-sm border-r border-border/50",
            "supports-[backdrop-filter]:bg-background/80",
            className
          )}
          onMouseEnter={() => {
            if (!state.isPinned && isCollapsed) {
              handleCollapsedChange(false);
            }
          }}
          onMouseLeave={() => {
            if (!state.isPinned && !isCollapsed) {
              handleCollapsedChange(true);
            }
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">Navigation</h2>
                  <Badge variant="outline" className="text-xs">
                    {accessibleSPAs.length + Object.keys(RACINE_FEATURE_METADATA).length}
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-1">
                {/* Pin/Unpin */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setState(prev => {
                          const newPinned = !prev.isPinned;
                          updatePreference("sidebarPinned", newPinned);
                          return { ...prev, isPinned: newPinned };
                        });
                      }}
                    >
                      {state.isPinned ? <Unpin className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{state.isPinned ? "Unpin sidebar" : "Pin sidebar"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Collapse/Expand */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCollapsedChange(!isCollapsed)}
                    >
                      {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Error Display */}
            {state.error && (
              <Alert className="mx-3 mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {/* Search */}
            {!isCollapsed && (
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="Search navigation..."
                    value={state.searchQuery}
                    onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Loading State */}
            {state.loading && (
              <div className="p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}

            {/* Navigation Content */}
            <ScrollArea className="flex-1">
              <div className="p-1 space-y-4">
                {/* Favorites Section */}
                {state.favorites.length > 0 && (
                  <div>
                    {renderSectionHeader("Favorites", "favorites", {
                      icon: Heart,
                      count: state.favorites.length,
                      actions: (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, favorites: [] }))}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear All
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ),
                    })}

                    <Collapsible open={state.expandedSections.favorites}>
                      <CollapsibleContent className="space-y-1">
                        {state.favorites.map((favorite) => {
                          const metadata =
                            favorite.type === "spa"
                              ? EXISTING_SPA_METADATA[
                                  favorite.key as keyof typeof EXISTING_SPA_METADATA
                                ]
                              : RACINE_FEATURE_METADATA[
                                  favorite.key as keyof typeof RACINE_FEATURE_METADATA
                                ];

                          if (!metadata) return null;

                          return renderSidebarItem(
                            favorite.type,
                            favorite.key,
                            metadata,
                            { isFavorite: true }
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Data Governance SPAs Section */}
                <div>
                  {renderSectionHeader("Data Governance SPAs", "spas", {
                    icon: Database,
                    count: filteredSPAs.length,
                    actions: (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => refreshAllHealth()}
                        disabled={healthLoading}
                      >
                        <RefreshCw className={cn("w-3 h-3", healthLoading && "animate-spin")} />
                      </Button>
                    ),
                  })}

                  <Collapsible open={state.expandedSections.spas}>
                    <CollapsibleContent className="space-y-1">
                      {filteredSPAs.map(([spaKey, metadata]) =>
                        renderSidebarItem("spa", spaKey, metadata, {
                          showStatus: true,
                          showQuickActions: true,
                          showDescription: !isCollapsed,
                        })
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Racine Features Section */}
                <div>
                  {renderSectionHeader("Racine Features", "racine", {
                    icon: Workflow,
                    count: filteredRacineFeatures.length,
                  })}

                  <Collapsible open={state.expandedSections.racine}>
                    <CollapsibleContent className="space-y-1">
                      {filteredRacineFeatures.map(([featureKey, metadata]) =>
                        renderSidebarItem("racine", featureKey, metadata, {
                          showStatus: false,
                          showQuickActions: true,
                          showDescription: !isCollapsed,
                        })
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Recent Activity Section */}
                {state.recentItems.length > 0 && (
                  <div>
                    {renderSectionHeader("Recently Visited", "recent", {
                      icon: Clock,
                      count: state.recentItems.length,
                    })}

                    <Collapsible open={state.expandedSections.recent}>
                      <CollapsibleContent className="space-y-1">
                        {state.recentItems.slice(0, 5).map((item) => {
                          const metadata =
                            item.type === "spa"
                              ? EXISTING_SPA_METADATA[
                                  item.key as keyof typeof EXISTING_SPA_METADATA
                                ]
                              : RACINE_FEATURE_METADATA[
                                  item.key as keyof typeof RACINE_FEATURE_METADATA
                                ];

                          if (!metadata) return null;

                          return renderSidebarItem(
                            item.type,
                            item.key,
                            metadata,
                            {
                              isRecent: true,
                              showQuickActions: false,
                              showDescription: false,
                            }
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Performance Metrics (Debug) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-3 border-t border-border/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Render Time:</span>
                        <span className={cn(
                          metrics.renderTime > 100 ? "text-red-500" : 
                          metrics.renderTime > 50 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {metrics.renderTime.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>API Latency:</span>
                        <span className={cn(
                          metrics.apiLatency > 1000 ? "text-red-500" : 
                          metrics.apiLatency > 500 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {metrics.apiLatency.toFixed(2)}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((metrics.renderTime / 100) * 100, 100)} 
                        className="h-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-border/50">
              {!isCollapsed && (
                <div className="space-y-2">
                  {/* Workspace Info */}
                  {workspaceState?.currentWorkspace && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">
                        {workspaceState?.currentWorkspace?.name}
                      </span>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{filteredSPAs.length} SPAs</span>
                    <span>{filteredRacineFeatures.length} Features</span>
                  </div>

                  {/* Health Summary */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Health:</span>
                    <div className="flex items-center gap-1">
                      {Object.values(healthStatus).map((status, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            status === 'healthy' ? "bg-green-500" :
                            status === 'warning' ? "bg-yellow-500" :
                            status === 'error' ? "bg-red-500" : "bg-gray-500"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Global Quick Actions Trigger */}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full mt-2 justify-start",
                  isCollapsed && "px-2",
                  isQuickActionsSidebarOpen &&
                    "bg-primary/10 text-primary border-primary/30"
                )}
                onClick={() => handleQuickActionsTrigger()}
              >
                <Zap className="w-3 h-3" />
                {!isCollapsed && <span className="ml-2">Quick Actions</span>}
              </Button>
            </div>
          </div>
        </motion.aside>
      </TooltipProvider>
    </SidebarErrorBoundary>
  );
};

export default AdvancedAppSidebar;