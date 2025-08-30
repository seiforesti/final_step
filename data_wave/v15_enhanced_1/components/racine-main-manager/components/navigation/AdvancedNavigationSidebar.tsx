"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Pin,
  Unlink as Unpin,
  ExternalLink,
  ChevronDown,
  Heart,
  Globe,
  ArrowRight,
  Target,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";

// **DATABRICKS-INSPIRED DESIGN CONSTANTS**
const SIDEBAR_WIDTHS = {
  expanded: 280,
  collapsed: 64,
  mini: 48,
} as const;

const ANIMATION_CONFIG = {
  duration: 0.2,
  ease: "easeInOut",
} as const;

// **STABLE METADATA - NO DYNAMIC GENERATION**
const NAVIGATION_ITEMS = [
  {
    id: "data-sources",
    name: "Data Sources",
    icon: Database,
    route: "/app?view=data_sources",  
    color: "bg-blue-500",
    category: "Data Management",
    status: "active",
  },
  {
    id: "scan-rule-sets",
    name: "Scan Rule Sets",
    icon: Shield,
    route: "/app?view=scan_rule_sets",
    color: "bg-purple-500",
    category: "Security",
    status: "active",
  },
  {
    id: "classifications",
    name: "Classifications",
    icon: FileText,
    route: "/app?view=classifications",
    color: "bg-green-500",
    category: "Governance",
    status: "active",
  },
  {
    id: "compliance-rule",
    name: "Compliance Rules",
    icon: BookOpen,
    route: "/app?view=compliance_rules",
    color: "bg-orange-500",
    category: "Compliance",
    status: "active",
  },
  {
    id: "advanced-catalog",
    name: "Advanced Catalog",
    icon: Scan,
    route: "/app?view=advanced_catalog",
    color: "bg-teal-500",
    category: "Data Management",
    status: "active",
  },
  {
    id: "scan-logic",
    name: "Scan Logic",
    icon: Activity,
    route: "/app?view=scan_logic",
    color: "bg-indigo-500",
    category: "Processing",
    status: "active",
  },
  {
    id: "rbac-system",
    name: "RBAC System",
    icon: Users,
    route: "/app?view=rbac_system",
    color: "bg-red-500",
    category: "Security",
    status: "active",
    adminOnly: true,
  },
];

const RACINE_FEATURES = [
  {
    id: "dashboard",
    name: "Global Dashboard",
    icon: BarChart3,
    route: "/app?view=dashboard",
    color: "bg-cyan-500",
    category: "Analytics",
  },
  {
    id: "workspace",
    name: "Workspace Manager",
    icon: Globe,
    route: "/app?view=workspace",
    color: "bg-emerald-500",
    category: "Management",
  },
  {
    id: "workflows",
    name: "Job Workflows",
    icon: Workflow,
    route: "/app?view=workflows",
    color: "bg-violet-500",
    category: "Automation",
  },
  {
    id: "pipelines",
    name: "Pipeline Manager",
    icon: Zap,
    route: "/app?view=pipelines",
    color: "bg-yellow-500",
    category: "Processing",
  },
  {
    id: "ai",
    name: "AI Assistant",
    icon: Bot,
    route: "/app?view=ai_assistant",
    color: "bg-pink-500",
    category: "AI & ML",
  },
  {
    id: "activity",
    name: "Activity Tracker",
    icon: Clock,
    route: "/app?view=activity",
    color: "bg-slate-500",
    category: "Monitoring",
  },
  {
    id: "analytics",
    name: "Intelligent Dashboard",
    icon: Target,
    route: "/app?view=analytics",
    color: "bg-lime-500",
    category: "Analytics",
  },
  {
    id: "collaboration",
    name: "Collaboration Hub",
    icon: MessageSquare,
    route: "/app?view=collaboration",
    color: "bg-amber-500",
    category: "Collaboration",
  },
  {
    id: "settings",
    name: "User Settings",
    icon: Settings,
    route: "/app?view=settings",
    color: "bg-gray-500",
    category: "Settings",
  },
];

// Create union type for navigation items
type NavigationItem = typeof NAVIGATION_ITEMS[0] | typeof RACINE_FEATURES[0];

// **STATUS ICONS - STABLE MAPPING**
const STATUS_ICONS = {
  active: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  unknown: AlertCircle,
} as const;

const STATUS_COLORS = {
  active: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  unknown: "text-gray-500",
} as const;

interface AdvancedNavigationSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onToggleCollapse?: () => void;
  onQuickActionsTrigger?: () => void;
  onNavigate?: (route: string) => void;
  onViewChange?: (view: string) => void; // Add direct view change prop
  className?: string;
}

export const AdvancedNavigationSidebar: React.FC<
  AdvancedNavigationSidebarProps
> = ({
  className,
  onQuickActionsTrigger,
  collapsed: externalCollapsed,
  onCollapsedChange,
  onToggleCollapse,
  onNavigate,
  onViewChange,
}) => {
  // **MINIMAL STATE MANAGEMENT - PREVENT INFINITE LOOPS**
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    spas: true,
    racine: true,
    favorites: false,
  });
  const [isPinned, setIsPinned] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState<
    Array<{ id: string; name: string; route: string; timestamp: string }>
  >([]);
  const [recentNavigation, setRecentNavigation] = useState<
    Array<{ id: string; name: string; route: string; timestamp: number }>
  >([]);
  const [workspaceInfo, setWorkspaceInfo] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [spaStatuses, setSpaStatuses] = useState<
    Record<string, "active" | "warning" | "error" | "unknown">
  >({});

  // **STABLE REFS - NO RE-CREATION**
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const statusUpdateRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const pathname = usePathname();

  // **STABLE COMPUTED VALUES**
  const isCollapsed = externalCollapsed ?? internalCollapsed;
  const currentWidth = isCollapsed
    ? SIDEBAR_WIDTHS.collapsed
    : SIDEBAR_WIDTHS.expanded;

  // **MEMOIZED ACTIVE ITEM - STABLE REFERENCE**
  const activeItem = useMemo(() => {
    const allItems = [...NAVIGATION_ITEMS, ...RACINE_FEATURES];
    return allItems.find((item) => pathname.startsWith(item.route));
  }, [pathname]);

  // **FILTERED ITEMS - STABLE COMPUTATION**
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return NAVIGATION_ITEMS;

    const query = searchQuery.toLowerCase();
    return NAVIGATION_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredRacineFeatures = useMemo(() => {
    if (!searchQuery.trim()) return RACINE_FEATURES;

    const query = searchQuery.toLowerCase();
    return RACINE_FEATURES.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // **STABLE HANDLERS - PREVENT RE-CREATION**
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

  const handleToggleCollapse = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  }, [onToggleCollapse]);

  const handleTogglePin = useCallback(() => {
    setIsPinned((prev) => !prev);
  }, []);

  const handleToggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));

      // Persist to localStorage
      try {
        const updated = {
          ...expandedSections,
          [section]: !expandedSections[section],
        };
        localStorage.setItem(
          "sidebar-expanded-sections",
          JSON.stringify(updated)
        );
      } catch (error) {
        console.warn("Failed to persist expanded sections:", error);
      }
    },
    [expandedSections]
  );

  const handleQuickActionsTrigger = useCallback(
    (itemId?: string) => {
      onQuickActionsTrigger?.();
    },
    [onQuickActionsTrigger]
  );

  const handleToggleFavorite = useCallback((itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleNavigate = useCallback(
    (route: string) => {
      // Add to recent navigation
      const newItem = {
        id: route,
        name: route.split("/").pop() || route,
        route,
        timestamp: Date.now(),
      };

      setRecentNavigation((prev) => {
        const filtered = prev.filter((item) => item.route !== route);
        const updated = [newItem, ...filtered].slice(0, 10);

        // Persist to localStorage
        try {
          localStorage.setItem(
            "sidebar-recent-navigation",
            JSON.stringify(updated)
          );
        } catch (error) {
          console.warn("Failed to persist recent navigation:", error);
        }

        return updated;
      });

      // Extract view parameter from route for ViewMode-based routing
      try {
        const url = new URL(route, window.location.origin);
        const viewParam = url.searchParams.get('view');
        
        if (viewParam) {
          // For ViewMode-based routing, update the URL and trigger view change
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('view', viewParam);
          
          // Update URL without full navigation
          window.history.pushState({}, '', newUrl.toString());
          
          console.log('[Navigation] onViewChange prop available:', !!onViewChange);
          console.log('[Navigation] onViewChange prop type:', typeof onViewChange);
          
          // Use direct prop communication if available (more reliable than custom events)
          if (onViewChange) {
            console.log('[Navigation] Using direct onViewChange prop:', viewParam);
            try {
              onViewChange(viewParam);
              console.log('[Navigation] onViewChange called successfully');
            } catch (error) {
              console.error('[Navigation] Error calling onViewChange:', error);
            }
          } else {
            // Fallback to custom event
            console.log('[Navigation] Dispatching view change event:', viewParam);
            const customEvent = new CustomEvent('racine-view-change', {
              detail: { view: viewParam }
            });
            console.log('[Navigation] Event created:', customEvent);
            window.dispatchEvent(customEvent);
            console.log('[Navigation] Event dispatched');
          }
          
          // Log successful navigation
          console.log('[Navigation] Navigation completed successfully for view:', viewParam);
        } else {
          // Fallback to direct navigation
          router.push(route);
        }
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback to direct navigation
        router.push(route);
      }

      // Navigate using onNavigate prop if provided
      onNavigate?.(route);
    },
    [onNavigate, router]
  );

  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  }, []);

  // **ENTERPRISE FEATURES - STATUS MONITORING & RECENT ACTIVITY**
  useEffect(() => {
    // Simulate SPA status monitoring with enterprise-grade health checks
    const updateStatuses = () => {
      setSpaStatuses({
        "data-sources": Math.random() > 0.8 ? "warning" : "active",
        "scan-rule-sets": "active",
        classifications: "active",
        "compliance-rule": Math.random() > 0.9 ? "error" : "active",
        "advanced-catalog": "active",
        "scan-logic": "active",
        "rbac-system": "active",
      });
    };

    updateStatuses();
    statusUpdateRef.current = setInterval(updateStatuses, 30000); // 30s updates

    // Load persisted data with error handling
    const loadPersistedData = () => {
      try {
        // Load recent items
        const savedRecent = localStorage.getItem("sidebar-recent-navigation");
        if (savedRecent) {
          setRecentNavigation(JSON.parse(savedRecent));
        }

        // Load favorites
        const savedFavorites = localStorage.getItem("racine-favorites");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }

        // Load expanded sections state
        const savedSections = localStorage.getItem("sidebar-expanded-sections");
        if (savedSections) {
          setExpandedSections(JSON.parse(savedSections));
        }
      } catch (error) {
        console.warn("Failed to load persisted navigation data:", error);
      }
    };

    loadPersistedData();
    setWorkspaceInfo({ name: "Default Workspace", id: "default" });

    return () => {
      if (statusUpdateRef.current) {
        clearInterval(statusUpdateRef.current);
      }
    };
  }, []);

  // **CLEANUP ON UNMOUNT**
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (statusUpdateRef.current) {
        clearInterval(statusUpdateRef.current);
      }
    };
  }, []);

  // **ENTERPRISE HANDLERS**
  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem("racine-favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem("racine-favorites");
  }, []);

  // **RENDER NAVIGATION ITEM - STABLE COMPONENT**
  const renderNavigationItem = useCallback(
    (
      item: NavigationItem,
      type: "spa" | "racine"
    ) => {
      const isActive = activeItem?.id === item.id;
      const isFavorite = favorites.includes(item.id);
      const status = spaStatuses[item.id] || "unknown";
      const StatusIcon =
        STATUS_ICONS[status as keyof typeof STATUS_ICONS] ||
        STATUS_ICONS.unknown;
      const statusColor =
        STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
        STATUS_COLORS.unknown;

      return (
        <div
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
          onClick={() => handleNavigate(item.route)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNavigate(item.route);
            }
          }}
          role="button"
          tabIndex={0}
        >
          {/* Icon and Status */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isActive ? "bg-primary text-primary-foreground" : item.color
              )}
            >
              <item.icon className="w-4 h-4 text-white" />
            </div>

            {/* Status Indicator */}
            {type === "spa" && !isCollapsed && (
              <div className="absolute -bottom-1 -right-1">
                <StatusIcon className={cn("w-3 h-3", statusColor)} />
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
                    {item.name}
                  </h4>
                </div>

                {/* Badges and Actions */}
                <div className="flex items-center gap-1 ml-2">
                  {isFavorite && (
                    <Heart className="w-3 h-3 text-pink-500 fill-current" />
                  )}
                  {(item as any).adminOnly && (
                    <Badge variant="outline" className="text-xs">
                      Admin
                    </Badge>
                  )}

                  {/* Quick Actions Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickActionsTrigger(item.id);
                    }}
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Category Badge */}
              <div className="flex items-center justify-between mt-1">
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </div>
          )}
        </div>
      );
    },
    [
      activeItem,
      favorites,
      isCollapsed,
      handleNavigate,
      handleQuickActionsTrigger,
      spaStatuses,
    ]
  );

  // **RENDER SECTION HEADER - STABLE COMPONENT**
  const renderSectionHeader = useCallback(
    (title: string, sectionKey: string, count?: number) => {
      const isExpanded =
        expandedSections[sectionKey as keyof typeof expandedSections];

      if (isCollapsed) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-3 py-2 flex justify-center">
                <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
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
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() =>
                  handleToggleSection(
                    sectionKey as keyof typeof expandedSections
                  )
                }
              >
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </Button>

              <h3 className="text-sm font-medium text-muted-foreground">
                {title}
                {count !== undefined && (
                  <span className="ml-2 text-xs">({count})</span>
                )}
              </h3>
            </div>
          </div>
        </div>
      );
    },
    [isCollapsed, expandedSections, handleToggleSection]
  );

  return (
    <TooltipProvider>
      <motion.aside
        ref={sidebarRef}
        initial={{ width: currentWidth }}
        animate={{ width: currentWidth }}
        transition={ANIMATION_CONFIG}
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
                  {NAVIGATION_ITEMS.length + RACINE_FEATURES.length}
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
                    onClick={() => setIsPinned(!isPinned)}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search navigation..."
                  className="pl-10 h-8"
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation Content */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {/* SPAs Section */}
              {renderSectionHeader("Data SPAs", "spas", filteredItems.length)}
              {expandedSections.spas && (
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <div key={item.id}>
                      {renderNavigationItem(item, "spa")}
                    </div>
                  ))}
                </div>
              )}

              {/* Racine Features Section */}
              {renderSectionHeader(
                "Racine Features",
                "racine",
                filteredRacineFeatures.length
              )}
              {expandedSections.racine && (
                <div className="space-y-1">
                  {filteredRacineFeatures.map((item) => (
                    <div key={item.id}>
                      {renderNavigationItem(item, "racine")}
                    </div>
                  ))}
                </div>
              )}

              {/* Favorites Section */}
              {favorites.length > 0 && (
                <>
                  {renderSectionHeader(
                    "Favorites",
                    "favorites",
                    favorites.length
                  )}
                  {expandedSections.favorites && (
                    <div className="space-y-1">
                      {favorites.map((favoriteId) => {
                        const item = [
                          ...NAVIGATION_ITEMS,
                          ...RACINE_FEATURES,
                        ].find((i) => i.id === favoriteId) as NavigationItem | undefined;
                        if (!item) return null;
                        const type = NAVIGATION_ITEMS.some(
                          (i) => i.id === favoriteId
                        )
                          ? "spa"
                          : "racine";
                        return (
                          <div key={favoriteId}>
                            {renderNavigationItem(item, type)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default AdvancedNavigationSidebar;
