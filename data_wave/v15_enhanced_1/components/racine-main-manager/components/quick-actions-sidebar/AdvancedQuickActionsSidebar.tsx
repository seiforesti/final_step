"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  X,
  Pin,
  Unlink as Unpin,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  Star,
  Clock,
  Activity,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Bot,
  BarChart3,
  Target,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// **DATABRICKS-INSPIRED DESIGN CONSTANTS**
const SIDEBAR_CONFIG = {
  width: 400,
  minWidth: 320,
  maxWidth: 600,
  animationDuration: 0.3,
} as const;

// **ENHANCED QUICK ACTION CATEGORIES - ENTERPRISE READY**
const QUICK_ACTION_CATEGORIES = [
  {
    id: "data-management",
    name: "Data Management",
    icon: Database,
    color: "bg-blue-500",
    priority: "high",
    actions: [
      {
        id: "create-datasource",
        name: "Create Data Source",
        icon: Database,
        description: "Add new data connection",
        category: "creation",
        usage: 245,
      },
      {
        id: "scan-data",
        name: "Scan Data",
        icon: Scan,
        description: "Run data quality scan",
        category: "analysis",
        usage: 189,
      },
      {
        id: "classify-data",
        name: "Classify Data",
        icon: FileText,
        description: "Auto-classify sensitive data",
        category: "governance",
        usage: 156,
      },
      {
        id: "bulk-import",
        name: "Bulk Import",
        icon: Database,
        description: "Import multiple data sources",
        category: "creation",
        usage: 98,
      },
    ],
  },
  {
    id: "scan-rules",
    name: "Scan Rules",
    icon: Shield,
    color: "bg-purple-500",
    description: "Configure scanning policies",
    actions: [
      { id: "create-rule", name: "Create Rule", icon: Shield, type: "primary" },
      { id: "test-rule", name: "Test Rule", icon: Play, type: "secondary" },
      {
        id: "view-results",
        name: "View Results",
        icon: BarChart3,
        type: "secondary",
      },
      {
        id: "clone-rule",
        name: "Clone Rule",
        icon: MoreHorizontal,
        type: "tertiary",
      },
    ],
  },
  {
    id: "classifications",
    name: "Classifications",
    icon: FileText,
    color: "bg-green-500",
    description: "Apply data classifications",
    actions: [
      {
        id: "create-classification",
        name: "Create Classification",
        icon: FileText,
        type: "primary",
      },
      { id: "apply-tags", name: "Apply Tags", icon: Target, type: "secondary" },
      {
        id: "view-lineage",
        name: "View Lineage",
        icon: Activity,
        type: "secondary",
      },
      {
        id: "export-report",
        name: "Export Report",
        icon: MoreHorizontal,
        type: "tertiary",
      },
    ],
  },
  {
    id: "compliance",
    name: "Compliance",
    icon: BookOpen,
    color: "bg-orange-500",
    description: "Monitor compliance status",
    actions: [
      { id: "run-audit", name: "Run Audit", icon: BookOpen, type: "primary" },
      {
        id: "view-violations",
        name: "View Violations",
        icon: AlertCircle,
        type: "secondary",
      },
      {
        id: "generate-report",
        name: "Generate Report",
        icon: BarChart3,
        type: "secondary",
      },
      {
        id: "schedule-check",
        name: "Schedule Check",
        icon: Clock,
        type: "tertiary",
      },
    ],
  },
  {
    id: "catalog",
    name: "Data Catalog",
    icon: Scan,
    color: "bg-teal-500",
    description: "Browse catalog assets",
    actions: [
      {
        id: "search-assets",
        name: "Search Assets",
        icon: Search,
        type: "primary",
      },
      {
        id: "create-asset",
        name: "Create Asset",
        icon: Scan,
        type: "secondary",
      },
      {
        id: "view-lineage",
        name: "View Lineage",
        icon: Activity,
        type: "secondary",
      },
      {
        id: "export-metadata",
        name: "Export Metadata",
        icon: MoreHorizontal,
        type: "tertiary",
      },
    ],
  },
  {
    id: "workflows",
    name: "Workflows",
    icon: Zap,
    color: "bg-violet-500",
    description: "Manage automation workflows",
    actions: [
      {
        id: "create-workflow",
        name: "Create Workflow",
        icon: Zap,
        type: "primary",
      },
      {
        id: "run-workflow",
        name: "Run Workflow",
        icon: Play,
        type: "secondary",
      },
      {
        id: "view-history",
        name: "View History",
        icon: Clock,
        type: "secondary",
      },
      {
        id: "schedule-job",
        name: "Schedule Job",
        icon: MoreHorizontal,
        type: "tertiary",
      },
    ],
  },
  {
    id: "ai-tools",
    name: "AI Tools",
    icon: Bot,
    color: "bg-pink-500",
    description: "AI-powered assistance",
    actions: [
      { id: "ai-chat", name: "AI Chat", icon: Bot, type: "primary" },
      {
        id: "smart-suggestions",
        name: "Smart Suggestions",
        icon: Star,
        type: "secondary",
      },
      {
        id: "auto-classify",
        name: "Auto Classify",
        icon: Target,
        type: "secondary",
      },
      {
        id: "generate-docs",
        name: "Generate Docs",
        icon: MoreHorizontal,
        type: "tertiary",
      },
    ],
  },
] as const;

const ACTION_TYPE_STYLES = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-muted text-muted-foreground hover:bg-muted/80",
  tertiary: "bg-transparent text-muted-foreground hover:bg-muted/50",
} as const;

interface AdvancedQuickActionsSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  className?: string;
  currentContext?: string;
  position?: "left" | "right";
  enableSearch?: boolean;
  enableFiltering?: boolean;
  maxActionsPerCategory?: number;
  onActionExecute?: (actionId: string, categoryId: string) => void;
  layoutMode?: "overlay" | "push" | "mini";
  enableDragDrop?: boolean;
  enableAnalytics?: boolean;
  autoHide?: boolean;
}

export const AdvancedQuickActionsSidebar: React.FC<
  AdvancedQuickActionsSidebarProps
> = ({
  isOpen,
  onToggle,
  currentContext = "global",
  className,
  position = "right",
  enableSearch = true,
  enableFiltering = true,
  maxActionsPerCategory = 6,
  onActionExecute,
}) => {
  // **MINIMAL STATE MANAGEMENT - PREVENT INFINITE LOOPS**
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    "data-sources": true,
    "scan-rules": false,
    classifications: false,
    compliance: false,
    catalog: false,
    workflows: false,
    "ai-tools": false,
  });
  const [isPinned, setIsPinned] = useState(false);
  const [favoriteActions, setFavoriteActions] = useState<string[]>([]);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [executingActions, setExecutingActions] = useState<Set<string>>(
    new Set()
  );

  // **STABLE REFS - NO RE-CREATION**
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // **FILTERED CATEGORIES - STABLE COMPUTATION**
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return QUICK_ACTION_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return QUICK_ACTION_CATEGORIES.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.actions.some((action) =>
          action.name.toLowerCase().includes(query)
        )
    ).map((category) => ({
      ...category,
      actions: category.actions.filter((action) =>
        action.name.toLowerCase().includes(query)
      ),
    }));
  }, [searchQuery]);

  // **STABLE HANDLERS - PREVENT RE-CREATION**
  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  const handleActionExecute = useCallback(
    async (actionId: string, categoryId: string) => {
      // Prevent double execution
      if (executingActions.has(actionId)) return;

      try {
        // Add to executing set
        setExecutingActions((prev) => new Set(prev).add(actionId));

        // Add to recent actions
        setRecentActions((prev) => [
          actionId,
          ...prev.filter((id) => id !== actionId).slice(0, 9),
        ]);

        // Execute the action
        onActionExecute?.(actionId, categoryId);

        // Simulate action execution
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to execute action ${actionId}:`, error);
      } finally {
        // Remove from executing set
        setExecutingActions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(actionId);
          return newSet;
        });
      }
    },
    [executingActions, onActionExecute]
  );

  const handleToggleFavorite = useCallback((actionId: string) => {
    setFavoriteActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  }, []);

  // **CLEANUP ON UNMOUNT**
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // **RENDER ACTION BUTTON - STABLE COMPONENT**
  const renderActionButton = useCallback(
    (
      action: (typeof QUICK_ACTION_CATEGORIES)[0]["actions"][0],
      categoryId: string
    ) => {
      const isExecuting = executingActions.has(action.id);
      const isFavorite = favoriteActions.includes(action.id);
      const isRecent = recentActions.includes(action.id);

      return (
        <Tooltip key={action.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2 h-9 px-3",
                ACTION_TYPE_STYLES[action.type],
                isExecuting && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleActionExecute(action.id, categoryId)}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <action.icon className="w-4 h-4" />
              )}

              <span className="flex-1 text-left truncate">{action.name}</span>

              <div className="flex items-center gap-1">
                {isFavorite && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                )}
                {isRecent && <Clock className="w-3 h-3 text-blue-500" />}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{action.name}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    [executingActions, favoriteActions, recentActions, handleActionExecute]
  );

  // **RENDER CATEGORY SECTION - STABLE COMPONENT**
  const renderCategorySection = useCallback(
    (category: (typeof QUICK_ACTION_CATEGORIES)[0]) => {
      const isExpanded = expandedCategories[category.id];
      const visibleActions = category.actions.slice(0, maxActionsPerCategory);

      return (
        <Card key={category.id} className="border-0 shadow-none">
          <Collapsible
            open={isExpanded}
            onOpenChange={() => handleCategoryToggle(category.id)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 rounded-lg">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    category.color
                  )}
                >
                  <category.icon className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {category.actions.length}
                  </Badge>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0 pb-3 px-3">
                <div className="space-y-1">
                  {visibleActions.map((action) =>
                    renderActionButton(action, category.id)
                  )}
                </div>

                {category.actions.length > maxActionsPerCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs text-muted-foreground"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    View {category.actions.length - maxActionsPerCategory} more
                    actions
                  </Button>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      );
    },
    [
      expandedCategories,
      maxActionsPerCategory,
      handleCategoryToggle,
      renderActionButton,
    ]
  );

  // **RENDER FAVORITES SECTION**
  const renderFavoritesSection = useCallback(() => {
    if (favoriteActions.length === 0) return null;

    const favoriteActionItems = favoriteActions
      .map((actionId) => {
        for (const category of QUICK_ACTION_CATEGORIES) {
          const action = category.actions.find((a) => a.id === actionId);
          if (action) return { action, categoryId: category.id };
        }
        return null;
      })
      .filter(Boolean);

    if (favoriteActionItems.length === 0) return null;

    return (
      <Card className="border-0 shadow-none">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <h3 className="font-medium text-sm">Favorite Actions</h3>
            <Badge variant="secondary" className="text-xs">
              {favoriteActionItems.length}
            </Badge>
          </div>

          <div className="space-y-1">
            {favoriteActionItems.map(
              (item) => item && renderActionButton(item.action, item.categoryId)
            )}
          </div>
        </div>
      </Card>
    );
  }, [favoriteActions, renderActionButton]);

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <AnimatePresence>
        <motion.div
          ref={sidebarRef}
          initial={{
            x:
              position === "right"
                ? SIDEBAR_CONFIG.width
                : -SIDEBAR_CONFIG.width,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          exit={{
            x:
              position === "right"
                ? SIDEBAR_CONFIG.width
                : -SIDEBAR_CONFIG.width,
            opacity: 0,
          }}
          transition={{
            duration: SIDEBAR_CONFIG.animationDuration,
            ease: "easeInOut",
          }}
          className={cn(
            "fixed top-16 bottom-0 z-50",
            "bg-background/95 backdrop-blur-sm border-l border-border/50",
            "supports-[backdrop-filter]:bg-background/80",
            position === "right" ? "right-0" : "left-0",
            className
          )}
          style={{ width: SIDEBAR_CONFIG.width }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Quick Actions</h2>
              </div>

              <div className="flex items-center gap-1">
                {/* Pin/Unpin */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsPinned(!isPinned)}
                    >
                      {isPinned ? (
                        <Unpin className="w-4 h-4" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPinned ? "Unpin sidebar" : "Pin sidebar"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Close */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={onToggle}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Search */}
            {enableSearch && (
              <div className="p-4 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions..."
                    className="pl-10"
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Favorites Section */}
                {renderFavoritesSection()}

                {/* Categories */}
                {filteredCategories.map(renderCategorySection)}

                {/* Empty State */}
                {filteredCategories.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No actions found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Context: {currentContext}</span>
                <span>{filteredCategories.length} categories</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default AdvancedQuickActionsSidebar;
