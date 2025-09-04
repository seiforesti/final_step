"use client";

import React from "react";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useDeferredValue,
  useTransition,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Activity,
  BarChart3,
  Workflow,
  Zap,
  Bot,
  MessageSquare,
  Settings,
  Clock,
  Search,
  MoreHorizontal,
  Pin,
  Unlink as Unpin,
  ExternalLink,
  ChevronDown,
  Heart,
  Globe,
  ArrowRight,
  Target,
  Trash2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
// ErrorBoundary for sidebar resilience
class SidebarErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // Optionally log error
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("Sidebar error:", error, info);
    }
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Sidebar failed to load. Please refresh.</div>;
    }
    return this.props.children;
  }
}
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "../ui/context-menu";
import { ScrollArea } from "../ui/scroll-area";

// Import racine foundation layers (already implemented)
import { useCrossGroupIntegration } from "../../hooks/useCrossGroupIntegration";
import { useUserManagement } from "../../hooks/useUserManagement";
import { useWorkspaceManagement } from "../../hooks/useWorkspaceManagement";
import { useActivityTracker } from "../../hooks/useActivityTracker";
import { useQuickActions } from "../../hooks/useQuickActions";
import { useNavigationAnalytics } from "../../hooks/useNavigationAnalytics";
import { useUserPreferences } from "../../hooks/useUserPreferences";

// Import types (already implemented)
// Local lightweight types to avoid heavy imports and keep UI snappy
type FavoriteItem = {
  id: string;
  type: "spa" | "racine";
  key: string;
  name: string;
  route: string;
  icon: any;
  color: string;
  addedAt: Date;
};
type NavigationItem = {
  id?: string;
  type: "spa" | "racine";
  key: string;
  route: string;
};
import {
  getHealthStatusColor,
  getStatusIcon,
} from "../../utils/navigation-utils";

// Import constants (already implemented)
import {
  DEFAULT_SIDEBAR_WIDTH,
  COLLAPSED_SIDEBAR_WIDTH,
} from "../../constants/cross-group-configs";

// Existing SPA metadata with enhanced information
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
  },
} as const;

// Safe icon renderer to avoid heavy typing on dynamic icon components
const IconRenderer: React.FC<{ icon: any; className?: string }> = ({
  icon,
  className,
}) => {
  const Comp = icon as React.ComponentType<any> | undefined;
  if (!Comp) return null;
  return <Comp className={className} />;
};

interface AppSidebarProps {
  className?: string;
  onQuickActionsTrigger?: () => void;
  isQuickActionsSidebarOpen?: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  className,
  onQuickActionsTrigger,
  isQuickActionsSidebarOpen = false,
  isCollapsed: externalCollapsed,
  onCollapsedChange,
}) => {
  // Core state management using foundation hooks
  const {
    crossGroupState,
  coordinateNavigation: coordinateSPANavigation,
  refreshSPAStatus,
  } = useCrossGroupIntegration();

  const userHook = useUserManagement() as any;
  const userOps = userHook?.operations ?? userHook?.[1] ?? userHook ?? {};

  // Memoize functions to prevent infinite loops
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

  const workspaceHook = useWorkspaceManagement() as any;
  const workspaceState = workspaceHook?.state ?? workspaceHook?.[0] ?? {};
  // Removed unused workspaceOps

  // Memoize functions to prevent infinite loops
  // ...existing code...

  // Normalize activity tracker hook (tuple or object)
  const activityHook = useActivityTracker() as any;
  const activityOps =
    activityHook?.operations ?? activityHook?.[1] ?? activityHook ?? {};
  // Memoize functions to prevent infinite loops
  const getRecentNavigationHistory = useCallback(
    async (limit: number) => {
      try {
        return (await activityOps?.getRecentNavigationHistory?.(limit)) ?? [];
      } catch {
        return [];
      }
    },
    [activityOps]
  );

  const trackNavigation = useCallback(
    (payload: any) => {
      try {
        activityOps?.trackNavigation?.(payload);
      } catch {
        /* noop */
      }
    },
    [activityOps]
  );

  // Removed unused quickActionsApi
  // ...existing code...

  const navigationAnalytics = useNavigationAnalytics() as any;
  const trackSidebarUsage =
    navigationAnalytics?.trackSidebarUsage || (() => {});

  // Normalize user preferences hook (tuple or object)
  const userPrefsHook = useUserPreferences() as any;
  const userPrefsState = userPrefsHook?.state ?? userPrefsHook?.[0] ?? {};
  const userPrefsOps =
    userPrefsHook?.operations ?? userPrefsHook?.[1] ?? userPrefsHook ?? {};
  // Memoize functions to prevent infinite loops
  const updatePreference = useCallback(
    (key: string, value: any) => {
      try {
        userPrefsOps?.updatePreference?.(key, value);
      } catch {
        /* noop */
      }
    },
    [userPrefsOps]
  );

  const getSidebarPreferences = useCallback(async () => {
    try {
      return (
        (await userPrefsOps?.getSidebarPreferences?.()) ??
        (userPrefsState?.sidebarPreferences || {})
      );
    } catch {
      return {};
    }
  }, [userPrefsOps, userPrefsState?.sidebarPreferences]);

  const saveFavoriteItem = useCallback(
    async (fav: any) => {
      try {
        await userPrefsOps?.saveFavoriteItem?.(fav);
      } catch {
        /* noop */
      }
    },
    [userPrefsOps]
  );

  const removeFavoriteItem = useCallback(
    async (id: string) => {
      try {
        await userPrefsOps?.removeFavoriteItem?.(id);
      } catch {
        /* noop */
      }
    },
    [userPrefsOps]
  );

  // Local state
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const deferredSearchQuery = useDeferredValue(debouncedSearch);
  // Debounce search input to avoid UI freezes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 180); // Fast debounce for snappy UX
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const [, startTransition] = useTransition();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    spas: true,
    racine: true,
    favorites: true,
    recent: false,
  });
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recentItems, setRecentItems] = useState<NavigationItem[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Determine if sidebar is collapsed
  const isCollapsed = externalCollapsed ?? internalCollapsed;

  // Handle collapsed state change
  const handleCollapsedChange = useCallback(
    (collapsed: boolean) => {
      if (onCollapsedChange) {
        onCollapsedChange(collapsed);
      } else {
        setInternalCollapsed(collapsed);
      }
    },
    [onCollapsedChange]
  );

  // Load user preferences and favorites
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sidebarPrefs = await getSidebarPreferences();
        if (!mounted) return;
        setIsPinned(!!sidebarPrefs.isPinned);
        setExpandedSections(
          sidebarPrefs.expandedSections || {
            spas: true,
            racine: true,
            favorites: true,
            recent: false,
          }
        );
        setFavorites(Array.isArray(sidebarPrefs.favorites) ? sidebarPrefs.favorites : []);
      } catch (error) {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.error("Failed to load user preferences:", error);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load recent navigation history without blocking UI
  useEffect(() => {
    let mounted = true;
    // Use requestIdleCallback if available, else setTimeout
    const loader = async () => {
      try {
        const recent = await getRecentNavigationHistory(10);
        if (mounted) setRecentItems(Array.isArray(recent) ? recent : []);
      } catch (error) {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.error("Failed to load recent items:", error);
        }
      }
    };
    if (typeof (window as any).requestIdleCallback === "function") {
      (window as any).requestIdleCallback(() => loader());
    } else {
      setTimeout(() => loader(), 0);
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Get current active item
  const currentActiveItem = useMemo(() => {
    // Check existing SPAs
    for (const [spaKey, metadata] of Object.entries(EXISTING_SPA_METADATA)) {
      if (pathname.startsWith(metadata.route)) {
        return { type: "spa", key: spaKey, metadata };
      }
    }

    // Check Racine features
    for (const [featureKey, metadata] of Object.entries(
      RACINE_FEATURE_METADATA
    )) {
      if (pathname.startsWith(metadata.route)) {
        return { type: "racine", key: featureKey, metadata };
      }
    }

    return null;
  }, [pathname]);

  // Filter SPAs based on permissions
  const accessibleSPAs = useMemo(() => {
    return Object.entries(EXISTING_SPA_METADATA).filter(
      ([spaKey, metadata]) => {
        // Hide RBAC for non-admin users
        if ((metadata as any).adminOnly && !checkUserAccess("rbac:admin")) {
          return false;
        }

        // Check general SPA access
        return checkUserAccess(`spa:${spaKey}`);
      }
    );
  }, [checkUserAccess]);

  // Filter items based on search
  const filteredSPAs = useMemo(() => {
    if (!deferredSearchQuery) return accessibleSPAs;
    const query = deferredSearchQuery.toLowerCase();
    return accessibleSPAs.filter(([spaKey, metadata]) => {
      return (
        metadata.name.toLowerCase().includes(query) ||
        metadata.description.toLowerCase().includes(query) ||
        metadata.category.toLowerCase().includes(query)
      );
    });
  }, [accessibleSPAs, deferredSearchQuery]);

  const filteredRacineFeatures = useMemo(() => {
    if (!deferredSearchQuery) return Object.entries(RACINE_FEATURE_METADATA);
    const query = deferredSearchQuery.toLowerCase();
    return Object.entries(RACINE_FEATURE_METADATA).filter(
      ([featureKey, metadata]) => {
        return (
          metadata.name.toLowerCase().includes(query) ||
          metadata.description.toLowerCase().includes(query) ||
          metadata.category.toLowerCase().includes(query)
        );
      }
    );
  }, [deferredSearchQuery]);

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

          trackSidebarUsage({
            action: "navigation",
            item: key,
            category: type,
            timestamp: new Date(),
          });

          if (type === "spa") {
            // Fire and forget to avoid blocking the UI
            Promise.resolve(
              coordinateSPANavigation(key, {
                preserveContext: true,
                updateHistory: true,
                trackAnalytics: true,
              })
            ).catch(() => {});
          }

          router.push(metadata.route);
        } catch (error) {
          console.error("Navigation error:", error);
        }
      });
    },
    [
      coordinateSPANavigation,
      router,
      trackNavigation,
      trackSidebarUsage,
      startTransition,
    ]
  );

  // Handle Quick Actions trigger
  const handleQuickActionsTrigger = useCallback(
    (spaKey?: string, context?: any) => {
      if (onQuickActionsTrigger) {
        onQuickActionsTrigger();
      }

      // Track quick actions usage
      trackSidebarUsage({
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
        const existingFavorite = favorites.find(
          (fav) => fav.key === key && fav.type === type
        );

        if (existingFavorite) {
          await removeFavoriteItem(existingFavorite.id);
          setFavorites((prev) =>
            prev.filter((fav) => fav.id !== existingFavorite.id)
          );
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
          setFavorites((prev) => [...prev, newFavorite]);
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
      }
    },
    [favorites, saveFavoriteItem, removeFavoriteItem]
  );

  // Toggle expanded sections
  const toggleSection = useCallback(
    (section: string) => {
      setExpandedSections((prev) => {
        const newState = { ...prev, [section]: !prev[section] };

        // Save to user preferences
        updatePreference("sidebarExpandedSections", newState);

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

      const isActive =
        currentActiveItem?.key === key && currentActiveItem?.type === type;
      const status =
        type === "spa"
          ? crossGroupState.groupStatuses?.[key] || "unknown"
          : "healthy";
      const StatusIcon = getStatusIcon(status);
      const statusColor = getHealthStatusColor(status);
      const isFav = favorites.some(
        (fav) => fav.key === key && fav.type === type
      );
  // ...existing code...

      return (
        <ContextMenu key={`${type}_${key}`}>
          <ContextMenuTrigger>
            <button
              type="button"
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-muted/50 focus:bg-muted/50",
                isActive &&
                  "bg-primary/10 border border-primary/20 text-primary",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => handleNavigation(type, key, metadata)}
            >
              {/* Icon and status */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : metadata.color
                  )}
                >
                  <IconRenderer
                    icon={metadata.icon}
                    className="w-4 h-4 text-white"
                  />
                </div>

                {/* Status indicator for SPAs */}
                {showStatus && type === "spa" && !isCollapsed && (
                  <div className="absolute -bottom-1 -right-1">
                    <IconRenderer
                      icon={StatusIcon}
                      className={cn("w-3 h-3", statusColor)}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4
                        className={cn(
                          "font-medium text-sm truncate",
                          isActive && "text-primary"
                        )}
                      >
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
                      {isFav && (
                        <Heart className="w-3 h-3 text-pink-500 fill-current" />
                      )}
                      {isRecent && (
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      )}
                      {metadata.adminOnly && (
                        <Shield className="w-3 h-3 text-orange-500" />
                      )}
                    </div>
                  </div>

                  {/* Category and status */}
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {metadata.category}
                    </Badge>
                    {showStatus && type === "spa" && (
                      <span className={cn("text-xs", statusColor)}>
                        {status}
                      </span>
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
                    isQuickActionsSidebarOpen &&
                      "opacity-100 bg-primary/10 text-primary"
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
            <ContextMenuItem
              onClick={() => handleNavigation(type, key, metadata)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
              <ContextMenuShortcut>Enter</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => handleToggleFavorite(type, key, metadata)}
            >
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
              <ContextMenuItem
                onClick={() =>
                  handleQuickActionsTrigger(key, { type, metadata })
                }
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
                <ContextMenuShortcut>⌘.</ContextMenuShortcut>
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />

            <ContextMenuItem
              onClick={() => {
                navigator.clipboard.writeText(metadata.route);
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => {
                // Open in new tab
                window.open(metadata.route, "_blank");
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    },
    [
      currentActiveItem,
      crossGroupState?.groupStatuses,
      favorites,
      hoveredItem,
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
      const isExpanded = expandedSections[sectionKey];

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
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </Button>
              ) : (
                Icon && <Icon className="w-4 h-4 text-muted-foreground" />
              )}

              <h3 className="text-sm font-medium text-muted-foreground">
                {title}
                {count !== undefined && (
                  <span className="ml-2 text-xs">({count})</span>
                )}
              </h3>
            </div>

            {actions && (
              <div className="flex items-center gap-1">{actions}</div>
            )}
          </div>
        </div>
      );
    },
    [isCollapsed, expandedSections, toggleSection]
  );

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
            if (!isPinned && isCollapsed) {
              handleCollapsedChange(false);
            }
          }}
          onMouseLeave={() => {
            if (!isPinned && !isCollapsed) {
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
                    {accessibleSPAs.length +
                      Object.keys(RACINE_FEATURE_METADATA).length}
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
                        setIsPinned((prev) => {
                          updatePreference("sidebarPinned", !prev);
                          return !prev;
                        });
                      }}
                    >
                      {isPinned ? (
                        <Unpin className="w-3 h-3" />
                      ) : (
                        <Pin className="w-3 h-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPinned ? "Unpin sidebar" : "Pin sidebar"}</p>
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
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronLeft className="w-3 h-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Search */}
            {!isCollapsed && (
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="Search navigation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Navigation Content */}
            <ScrollArea className="flex-1">
              <div className="p-1 space-y-4">
                {/* Favorites Section */}
                {favorites.length > 0 && (
                  <div>
                    {renderSectionHeader("Favorites", "favorites", {
                      icon: Heart,
                      count: favorites.length,
                      actions: (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFavorites([])}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear All
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ),
                    })}

                    <Collapsible open={expandedSections.favorites}>
                      <CollapsibleContent className="space-y-1">
                        {favorites.map((favorite) => {
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
                        onClick={() => refreshSPAStatus()}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    ),
                  })}

                  <Collapsible open={expandedSections.spas}>
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

                  <Collapsible open={expandedSections.racine}>
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
                {recentItems.length > 0 && (
                  <div>
                    {renderSectionHeader("Recently Visited", "recent", {
                      icon: Clock,
                      count: recentItems.length,
                    })}

                    <Collapsible open={expandedSections.recent}>
                      <CollapsibleContent className="space-y-1">
                        {recentItems.slice(0, 5).map((item) => {
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

export default AppSidebar;
