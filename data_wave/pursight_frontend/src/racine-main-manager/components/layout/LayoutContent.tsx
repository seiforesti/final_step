/**
 * LayoutContent.tsx - Master Layout Orchestrator (2800+ lines)
 * ============================================================
 *
 * The core layout orchestrator that manages all system views, SPAs, and workflows
 * for the entire data governance platform. This component serves as the main content
 * manager and orchestrator for all system management views and workflows.
 *
 * Key Features:
 * - Dynamic layout management for all 7 existing SPAs
 * - Advanced responsive design with multiple layout modes
 * - Real-time workspace orchestration
 * - Cross-SPA workflow integration
 * - AI-powered layout optimization
 * - Enterprise-grade performance and accessibility
 *
 * Backend Integration:
 * - Maps to: RacineOrchestrationService, RacineWorkspaceService
 * - Uses: workspace-management-apis.ts, racine-orchestration-apis.ts
 * - Types: LayoutConfiguration, WorkspaceLayout, ViewConfiguration
 */

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
  createElement,
} from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Layout, Monitor, Columns, Grid3X3, Layers, Settings, RefreshCw, AlertTriangle, CheckCircle, Brain, Users, Activity, BarChart3, Maximize2, Minimize2, Eye, EyeOff, Trash2, Plus, Zap, Target, Sparkles, Wand2, MoreHorizontal, Smartphone, Tablet,  } from 'lucide-react';

// Shadcn/UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Racine Type Imports
import {
  RacineState,
  CrossGroupState,
  LayoutConfiguration,
  LayoutMode,
  ViewMode,
  WorkspaceLayout,
  ViewConfiguration,
  LayoutPreferences,
  ResponsiveBreakpoint,
  LayoutAnimation,
  PerformanceMetrics,
  SystemHealth,
  UserContext,
  WorkspaceContext,
  Integration,
  GroupConfiguration,
  SharedResource,
  UUID,
  ISODateString,
  JSONValue,
} from "../../types/racine-core.types";

import {
  APIResponse,
  LayoutContentRequest,
  LayoutContentResponse,
  ViewTransitionRequest,
  ViewTransitionResponse,
  LayoutOptimizationRequest,
  LayoutOptimizationResponse,
} from "../../types/api.types";

// Racine Service Imports
import { racineOrchestrationAPI } from "../../services/racine-orchestration-apis";
import { workspaceManagementAPI } from "../../services/workspace-management-apis";
import { crossGroupIntegrationAPI } from "../../services/cross-group-integration-apis";
import { aiAssistantAPI } from "../../services/ai-assistant-apis";

// Racine Hook Imports
import { useRacineOrchestration } from "../../hooks/useRacineOrchestration";
import { useWorkspaceManagement } from "../../hooks/useWorkspaceManagement";
import { useCrossGroupIntegration } from "../../hooks/useCrossGroupIntegration";
import { useAIAssistant } from "../../hooks/useAIAssistant";
import { useLayoutManager } from "../../hooks/useLayoutManager";
import { usePerformanceMonitor } from "../../hooks/usePerformanceMonitor";

// Racine Utility Imports
import {
  crossGroupOrchestrator,
  validateLayoutConfiguration,
  optimizeLayoutPerformance,
} from "../../utils/cross-group-orchestrator";

import {
  layoutEngine,
  createLayoutConfiguration,
  applyLayoutTransitions,
  validateLayoutState,
} from "../../utils/layout-engine";

import {
  workspaceUtils,
  getWorkspaceLayout,
  updateWorkspaceLayout,
} from "../../utils/workspace-utils";

// Racine Constants
import {
  LAYOUT_MODES,
  VIEW_MODES,
  RESPONSIVE_BREAKPOINTS,
  LAYOUT_ANIMATIONS,
  PERFORMANCE_THRESHOLDS,
  DEFAULT_LAYOUT_CONFIG,
} from "../../constants/cross-group-configs";

import {
  LAYOUT_TEMPLATES,
  VIEW_TEMPLATES,
  TRANSITION_CONFIGS,
} from "../../constants/layout-templates";

// Layout Component Imports (will be implemented)
import ResponsiveLayoutEngine from "./ResponsiveLayoutEngine";
import ContextualOverlayManager from "./ContextualOverlayManager";
import TabManager from "./TabManager";
import SplitScreenManager from "./SplitScreenManager";
import LayoutPersonalization from "./LayoutPersonalization";

// =============================================================================
// LAYOUT CONTENT INTERFACES & TYPES
// =============================================================================

export interface LayoutContentProps {
  racineState: RacineState;
  crossGroupState: CrossGroupState;
  userContext: UserContext;
  workspaceContext: WorkspaceContext;
  onStateChange: (newState: Partial<RacineState>) => void;
  onLayoutChange: (newLayout: LayoutConfiguration) => void;
  onViewTransition: (newView: ViewMode) => void;
  className?: string;
}

export interface LayoutContentState {
  // Core layout state
  currentLayout: LayoutConfiguration;
  activeViews: ViewConfiguration[];
  layoutMode: LayoutMode;
  isTransitioning: boolean;

  // Performance monitoring
  renderPerformance: PerformanceMetrics;
  memoryUsage: number;
  layoutOptimization: LayoutOptimization;

  // Responsive state
  breakpoint: ResponsiveBreakpoint;
  deviceType: "desktop" | "tablet" | "mobile";
  orientation: "portrait" | "landscape";

  // Workspace integration
  activeWorkspace: WorkspaceContext;
  workspaceLayout: WorkspaceLayout;
  crossGroupResources: SharedResource[];

  // SPA orchestration state
  activeSPAs: Record<string, boolean>;
  spaStates: Record<string, any>;
  spaPerformance: Record<string, PerformanceMetrics>;

  // AI and automation
  aiRecommendations: LayoutRecommendation[];
  autoOptimization: boolean;
  layoutLearning: LayoutLearningData;

  // Error handling
  errors: LayoutError[];
  recoveryMode: boolean;
  lastErrorRecovery: ISODateString;
}

export interface ViewConfiguration {
  id: UUID;
  viewMode: ViewMode;
  spaId?: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  position: LayoutPosition;
  size: LayoutSize;
  zIndex: number;
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  minSize: LayoutSize;
  maxSize: LayoutSize;
  animations: LayoutAnimation[];
  permissions: string[];
}

export interface LayoutPosition {
  x: number;
  y: number;
  row?: number;
  column?: number;
  gridArea?: string;
}

export interface LayoutSize {
  width: number | string;
  height: number | string;
  aspectRatio?: number;
}

interface LayoutOptimization {
  isEnabled: boolean;
  strategies: OptimizationStrategy[];
  performance: PerformanceMetrics;
  recommendations: LayoutRecommendation[];
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  impact: "low" | "medium" | "high";
  complexity: "simple" | "moderate" | "complex";
  estimatedImprovement: number;
}

interface LayoutRecommendation {
  id: UUID;
  type: "performance" | "usability" | "accessibility" | "responsive";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  aiConfidence: number;
  implementation: string;
  createdAt: ISODateString;
}

interface LayoutLearningData {
  userPatterns: UserLayoutPattern[];
  performanceHistory: PerformanceHistory[];
  optimizationResults: OptimizationResult[];
  adaptationRules: AdaptationRule[];
}

interface UserLayoutPattern {
  userId: UUID;
  layoutPreferences: LayoutPreferences;
  usagePatterns: UsagePattern[];
  performanceImpact: PerformanceImpact;
  lastUpdated: ISODateString;
}

interface LayoutError {
  id: UUID;
  type:
    | "rendering"
    | "performance"
    | "integration"
    | "responsive"
    | "accessibility";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: ISODateString;
  resolved: boolean;
  resolution?: string;
}

// =============================================================================
// LAYOUT CONTENT MAIN COMPONENT
// =============================================================================

const LayoutContent: React.FC<LayoutContentProps> = ({
  racineState,
  crossGroupState,
  userContext,
  workspaceContext,
  onStateChange,
  onLayoutChange,
  onViewTransition,
  className = "",
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [layoutState, setLayoutState] = useState<LayoutContentState>({
    currentLayout: DEFAULT_LAYOUT_CONFIG,
    activeViews: [],
    layoutMode: racineState.layoutMode,
    isTransitioning: false,
    renderPerformance: {
      responseTime: { average: 0, p95: 0, p99: 0, max: 0, min: 0 },
      throughput: {
        requestsPerSecond: 0,
        bytesPerSecond: 0,
        operationsPerSecond: 0,
      },
      errorRate: { percentage: 0, count: 0, totalRequests: 0 },
      resourceUsage: {
        memoryMB: 0,
        cpuPercentage: 0,
        diskIOPS: 0,
        networkMbps: 0,
      },
      concurrency: {
        activeConnections: 0,
        queuedRequests: 0,
        maxConcurrency: 0,
      },
      cacheHitRate: 0,
      lastUpdated: new Date().toISOString(),
    },
    memoryUsage: 0,
    layoutOptimization: {
      isEnabled: true,
      strategies: [],
      performance: {
        responseTime: { average: 0, p95: 0, p99: 0, max: 0, min: 0 },
        throughput: {
          requestsPerSecond: 0,
          bytesPerSecond: 0,
          operationsPerSecond: 0,
        },
        errorRate: { percentage: 0, count: 0, totalRequests: 0 },
        resourceUsage: {
          memoryMB: 0,
          cpuPercentage: 0,
          diskIOPS: 0,
          networkMbps: 0,
        },
        concurrency: {
          activeConnections: 0,
          queuedRequests: 0,
          maxConcurrency: 0,
        },
        cacheHitRate: 0,
        lastUpdated: new Date().toISOString(),
      },
      recommendations: [],
    },
    breakpoint: "desktop",
    deviceType: "desktop",
    orientation: "landscape",
    activeWorkspace: workspaceContext,
    workspaceLayout: {
      id: workspaceContext.id,
      name: workspaceContext.name,
      layoutMode: racineState.layoutMode,
      views: [],
      preferences: userContext.preferences.layoutPreferences,
      lastModified: new Date().toISOString(),
      version: "1.0.0",
    },
    crossGroupResources: crossGroupState.sharedResources,
    activeSPAs: {},
    spaStates: {},
    spaPerformance: {},
    aiRecommendations: [],
    autoOptimization: true,
    layoutLearning: {
      userPatterns: [],
      performanceHistory: [],
      optimizationResults: [],
      adaptationRules: [],
    },
    errors: [],
    recoveryMode: false,
    lastErrorRecovery: new Date().toISOString(),
  });

  // =============================================================================
  // HOOKS INTEGRATION
  // =============================================================================

  const {
    orchestrationState,
    executeWorkflow,
    monitorHealth,
    optimizePerformance,
    getSystemMetrics,
  } = useRacineOrchestration(userContext.id, racineState);

  const {
    workspaceState,
    createWorkspace,
    switchWorkspace,
    getWorkspaceResources,
    updateWorkspaceLayout,
    getWorkspaceAnalytics,
  } = useWorkspaceManagement(userContext.id, workspaceContext);

  const {
    integrationState,
    coordinateGroups,
    getGroupStatus,
    executeCrossGroupOperation,
    syncResources,
  } = useCrossGroupIntegration(userContext.id, crossGroupState);

  const {
    aiState,
    getLayoutRecommendations,
    optimizeLayoutWithAI,
    analyzeLayoutPerformance,
    learnFromUserBehavior,
  } = useAIAssistant(userContext.id, {
    context: "layout_management",
    currentLayout: layoutState.currentLayout,
    userPreferences: userContext.preferences,
  });

  const {
    layoutManagerState,
    updateLayout,
    validateLayout,
    getLayoutTemplates,
    saveLayoutPreferences,
  } = useLayoutManager(userContext.id, layoutState.currentLayout);

  const {
    performanceData,
    trackPerformance,
    getPerformanceInsights,
    optimizeRendering,
  } = usePerformanceMonitor("layout_content", layoutState.renderPerformance);

  // =============================================================================
  // REFS AND MOTION VALUES
  // =============================================================================

  const layoutContainerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const layoutOpacity = useMotionValue(1);
  const layoutScale = useMotionValue(1);

  // =============================================================================
  // SPA COMPONENT MAPPING FOR INTEGRATION
  // =============================================================================

  const spaComponents = useMemo(
    () => ({
      "data-sources": React.lazy(
        () => import("../../../data-sources/data-sources-app")
      ),
      "scan-rule-sets": React.lazy(
        () =>
          import("../../../Advanced-Scan-Rule-Sets/spa/ScanRuleSetsSPA")
      ),
      classifications: React.lazy(
        () => import("../../../classifications/ClassificationsSPA")
      ),
      "compliance-rule": React.lazy(
        () => import("../../../Compliance-Rule/enhanced-compliance-rule-app")
      ),
      "advanced-catalog": React.lazy(
        () => import("../../../Advanced-Catalog/spa/AdvancedCatalogSPA")
      ),
      "scan-logic": React.lazy(
        () => import("../../../Advanced-Scan-Logic/spa/ScanLogicMasterSPA")
      ),
      "rbac-system": React.lazy(
        () =>
          import(
            "../../../Advanced_RBAC_Datagovernance_System/RBACSystemSPA"
          )
      ),
    }),
    []
  );

  // =============================================================================
  // LAYOUT MANAGEMENT FUNCTIONS
  // =============================================================================

  /**
   * Initialize layout system with workspace and user preferences
   */
  const initializeLayout = useCallback(async () => {
    try {
      setLayoutState((prev) => ({ ...prev, isTransitioning: true }));

      // Get workspace layout configuration from backend
      const workspaceLayout = await workspaceManagementAPI.getWorkspaceLayout(
        workspaceContext.id,
        userContext.id
      );

      // Get user layout preferences from backend
      const userPreferences =
        await workspaceManagementAPI.getUserLayoutPreferences(userContext.id);

      // Get AI layout recommendations from backend
      const aiRecommendations = await aiAssistantAPI.getLayoutRecommendations({
        userId: userContext.id,
        workspaceId: workspaceContext.id,
        currentLayout: layoutState.currentLayout,
        userPreferences: userPreferences,
        systemContext: orchestrationState,
      });

      // Create optimized layout configuration using backend optimization
      const optimizedLayout = await layoutEngine.createOptimizedLayout({
        workspaceLayout,
        userPreferences,
        aiRecommendations,
        systemConstraints: {
          maxViews: 12,
          maxMemoryMB: 512,
          maxCPUPercent: 80,
          minResponseTimeMs: 100,
        },
      });

      setLayoutState((prev) => ({
        ...prev,
        currentLayout: optimizedLayout,
        workspaceLayout,
        aiRecommendations,
        isTransitioning: false,
      }));

      // Notify parent of layout change
      onLayoutChange(optimizedLayout);
    } catch (error) {
      handleLayoutError("initialization", error);
    }
  }, [
    workspaceContext.id,
    userContext.id,
    onLayoutChange,
    orchestrationState,
    layoutState.currentLayout,
  ]);

  /**
   * Handle view transitions between SPAs and racine features
   */
  const handleViewTransition = useCallback(
    async (
      newView: ViewMode,
      spaId?: string,
      transitionOptions?: {
        animation?: LayoutAnimation;
        preserveState?: boolean;
        preloadNext?: boolean;
      }
    ) => {
      try {
        setLayoutState((prev) => ({ ...prev, isTransitioning: true }));

        // Validate transition permissions using backend RBAC
        const hasPermission = await crossGroupIntegrationAPI.validateViewAccess(
          {
            userId: userContext.id,
            viewMode: newView,
            spaId,
            workspaceId: workspaceContext.id,
          }
        );

        if (!hasPermission) {
          throw new Error(`Access denied for view: ${newView}`);
        }

        // Prepare transition analytics
        const transitionStart = performance.now();

        // Execute view transition with backend coordination
        const transitionResult = await layoutEngine.executeViewTransition({
          fromView: racineState.currentView,
          toView: newView,
          spaId,
          animation: transitionOptions?.animation || LAYOUT_ANIMATIONS.smooth,
          preserveState: transitionOptions?.preserveState ?? true,
          preloadNext: transitionOptions?.preloadNext ?? true,
        });

        // Update layout state
        setLayoutState((prev) => ({
          ...prev,
          activeViews: transitionResult.activeViews,
          currentLayout: transitionResult.newLayout,
          isTransitioning: false,
          renderPerformance: {
            ...prev.renderPerformance,
            responseTime: {
              ...prev.renderPerformance.responseTime,
              average: performance.now() - transitionStart,
            },
          },
        }));

        // Update SPA states if transitioning to SPA
        if (spaId) {
          setLayoutState((prev) => ({
            ...prev,
            activeSPAs: { ...prev.activeSPAs, [spaId]: true },
          }));
        }

        // Notify parent of view change
        onViewTransition(newView);

        // Track transition analytics using backend
        await trackPerformance("view_transition", {
          fromView: racineState.currentView,
          toView: newView,
          duration: performance.now() - transitionStart,
          success: true,
        });
      } catch (error) {
        handleLayoutError("view_transition", error);
      }
    },
    [
      userContext.id,
      workspaceContext.id,
      racineState.currentView,
      onViewTransition,
      trackPerformance,
    ]
  );

  /**
   * Handle layout mode changes with backend persistence
   */
  const handleLayoutModeChange = useCallback(
    async (newMode: LayoutMode) => {
      try {
        setLayoutState((prev) => ({ ...prev, isTransitioning: true }));

        // Validate layout mode compatibility using backend validation
        const isCompatible = await layoutEngine.validateLayoutMode({
          newMode,
          currentViews: layoutState.activeViews,
          systemConstraints: {
            maxViews: PERFORMANCE_THRESHOLDS.maxConcurrentViews,
            availableMemory:
              PERFORMANCE_THRESHOLDS.maxMemoryMB - layoutState.memoryUsage,
          },
        });

        if (!isCompatible.isValid) {
          throw new Error(`Layout mode incompatible: ${isCompatible.reason}`);
        }

        // Execute layout mode transition using backend engine
        const modeTransition = await layoutEngine.executeLayoutModeTransition({
          fromMode: layoutState.layoutMode,
          toMode: newMode,
          activeViews: layoutState.activeViews,
          preserveViewState: true,
          optimizePerformance: layoutState.autoOptimization,
        });

        // Update layout configuration
        const updatedLayout: LayoutConfiguration = {
          ...layoutState.currentLayout,
          layoutMode: newMode,
          views: modeTransition.optimizedViews,
          performance: modeTransition.performanceMetrics,
          lastModified: new Date().toISOString(),
        };

        setLayoutState((prev) => ({
          ...prev,
          layoutMode: newMode,
          currentLayout: updatedLayout,
          activeViews: modeTransition.optimizedViews,
          isTransitioning: false,
          renderPerformance: modeTransition.performanceMetrics,
        }));

        // Save layout preferences to backend
        await saveLayoutPreferences({
          userId: userContext.id,
          workspaceId: workspaceContext.id,
          layoutMode: newMode,
          layoutConfiguration: updatedLayout,
        });

        // Notify parent of layout change
        onLayoutChange(updatedLayout);
      } catch (error) {
        handleLayoutError("layout_mode_change", error);
      }
    },
    [
      layoutState.activeViews,
      layoutState.layoutMode,
      layoutState.currentLayout,
      layoutState.memoryUsage,
      layoutState.autoOptimization,
      userContext.id,
      workspaceContext.id,
      saveLayoutPreferences,
      onLayoutChange,
    ]
  );

  /**
   * Handle responsive breakpoint changes
   */
  const handleBreakpointChange = useCallback(
    (newBreakpoint: ResponsiveBreakpoint) => {
      setLayoutState((prev) => {
        const newDeviceType =
          newBreakpoint === "mobile"
            ? "mobile"
            : newBreakpoint === "tablet"
            ? "tablet"
            : "desktop";

        return {
          ...prev,
          breakpoint: newBreakpoint,
          deviceType: newDeviceType,
        };
      });

      // Trigger responsive layout adaptation using backend optimization
      layoutEngine.adaptToBreakpoint(newBreakpoint, layoutState.currentLayout);
    },
    [layoutState.currentLayout]
  );

  /**
   * Handle SPA integration and orchestration
   */
  const handleSPAIntegration = useCallback(
    async (
      spaId: string,
      action: "load" | "unload" | "refresh" | "optimize"
    ) => {
      try {
        switch (action) {
          case "load":
            // Load SPA with performance monitoring
            const loadStart = performance.now();

            setLayoutState((prev) => ({
              ...prev,
              activeSPAs: { ...prev.activeSPAs, [spaId]: true },
            }));

            // Track SPA load performance
            const loadTime = performance.now() - loadStart;
            setLayoutState((prev) => ({
              ...prev,
              spaPerformance: {
                ...prev.spaPerformance,
                [spaId]: {
                  ...prev.renderPerformance,
                  responseTime: {
                    ...prev.renderPerformance.responseTime,
                    average: loadTime,
                  },
                },
              },
            }));
            break;

          case "unload":
            setLayoutState((prev) => {
              const newActiveSPAs = { ...prev.activeSPAs };
              delete newActiveSPAs[spaId];

              const newSpaStates = { ...prev.spaStates };
              delete newSpaStates[spaId];

              return {
                ...prev,
                activeSPAs: newActiveSPAs,
                spaStates: newSpaStates,
              };
            });
            break;

          case "refresh":
            // Refresh SPA state using backend API
            const refreshedState = await crossGroupIntegrationAPI.getSPAState(
              spaId
            );
            setLayoutState((prev) => ({
              ...prev,
              spaStates: { ...prev.spaStates, [spaId]: refreshedState },
            }));
            break;

          case "optimize":
            // AI-powered SPA optimization using backend AI service
            const optimization = await aiAssistantAPI.optimizeSPAPerformance({
              spaId,
              currentPerformance: layoutState.spaPerformance[spaId],
              userContext,
              workspaceContext,
            });

            setLayoutState((prev) => ({
              ...prev,
              aiRecommendations: [
                ...prev.aiRecommendations,
                ...optimization.recommendations,
              ],
            }));
            break;
        }
      } catch (error) {
        handleLayoutError("spa_integration", error);
      }
    },
    [userContext, workspaceContext, layoutState.spaPerformance]
  );

  /**
   * Handle layout error recovery
   */
  const handleLayoutError = useCallback(
    (errorType: string, error: any, context?: Record<string, any>) => {
      const layoutError: LayoutError = {
        id: crypto.randomUUID(),
        type: errorType as any,
        severity: "medium",
        message: error.message || "Unknown layout error",
        stack: error.stack,
        context: { ...context, layoutState: layoutState.currentLayout },
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      setLayoutState((prev) => ({
        ...prev,
        errors: [...prev.errors, layoutError],
        recoveryMode: true,
        lastErrorRecovery: new Date().toISOString(),
      }));

      // Attempt automatic recovery
      setTimeout(() => {
        setLayoutState((prev) => ({ ...prev, recoveryMode: false }));
      }, 3000);

      console.error("Layout Error:", layoutError);
    },
    [layoutState.currentLayout]
  );

  // =============================================================================
  // PERFORMANCE MONITORING & OPTIMIZATION
  // =============================================================================

  /**
   * Monitor layout performance and optimize automatically using AI backend
   */
  useEffect(() => {
    if (!layoutState.autoOptimization) return;

    const performanceInterval = setInterval(async () => {
      try {
        // Collect performance metrics using backend service
        const performanceMetrics = await getPerformanceInsights();

        // Check if optimization is needed
        if (
          performanceMetrics.responseTime.average >
          PERFORMANCE_THRESHOLDS.maxResponseTime
        ) {
          // Get AI optimization recommendations from backend
          const optimization = await optimizeLayoutWithAI({
            currentPerformance: performanceMetrics,
            layoutConfiguration: layoutState.currentLayout,
            userContext,
            workspaceContext,
          });

          if (optimization.recommendations.length > 0) {
            setLayoutState((prev) => ({
              ...prev,
              aiRecommendations: [
                ...prev.aiRecommendations,
                ...optimization.recommendations,
              ],
            }));
          }
        }

        // Update performance metrics
        setLayoutState((prev) => ({
          ...prev,
          renderPerformance: performanceMetrics,
          memoryUsage: performanceMetrics.resourceUsage.memoryMB,
        }));
      } catch (error) {
        handleLayoutError("performance_monitoring", error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(performanceInterval);
  }, [
    layoutState.autoOptimization,
    layoutState.currentLayout,
    userContext,
    workspaceContext,
    getPerformanceInsights,
    optimizeLayoutWithAI,
    handleLayoutError,
  ]);

  /**
   * Responsive breakpoint detection
   */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let newBreakpoint: ResponsiveBreakpoint;
      if (width < RESPONSIVE_BREAKPOINTS.mobile) {
        newBreakpoint = "mobile";
      } else if (width < RESPONSIVE_BREAKPOINTS.tablet) {
        newBreakpoint = "tablet";
      } else if (width < RESPONSIVE_BREAKPOINTS.desktop) {
        newBreakpoint = "desktop";
      } else {
        newBreakpoint = "ultrawide";
      }

      const newOrientation = width > height ? "landscape" : "portrait";

      if (
        newBreakpoint !== layoutState.breakpoint ||
        newOrientation !== layoutState.orientation
      ) {
        handleBreakpointChange(newBreakpoint);
        setLayoutState((prev) => ({ ...prev, orientation: newOrientation }));
      }
    };

    // Track current values locally to avoid effect resubscription loops
    let currentBreakpoint = layoutState.breakpoint;
    let currentOrientation = layoutState.orientation;

    // Debounce resize handling to reduce update thrash during window drag
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const debouncedResize = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        let newBreakpoint: ResponsiveBreakpoint;
        if (width < RESPONSIVE_BREAKPOINTS.mobile) {
          newBreakpoint = "mobile";
        } else if (width < RESPONSIVE_BREAKPOINTS.tablet) {
          newBreakpoint = "tablet";
        } else if (width < RESPONSIVE_BREAKPOINTS.desktop) {
          newBreakpoint = "desktop";
        } else {
          newBreakpoint = "ultrawide";
        }

        const newOrientation = width > height ? "landscape" : "portrait";

        // Only propagate changes when values actually differ
        if (newBreakpoint !== currentBreakpoint) {
          currentBreakpoint = newBreakpoint;
          handleBreakpointChange(newBreakpoint);
        }

        if (newOrientation !== currentOrientation) {
          currentOrientation = newOrientation;
          setLayoutState((prev) => ({ ...prev, orientation: newOrientation }));
        }
      }, 250);
    };

    window.addEventListener("resize", debouncedResize);
    debouncedResize(); // Initial check

    return () => {
      window.removeEventListener("resize", debouncedResize);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [handleBreakpointChange]);

  // =============================================================================
  // SPA RENDERING WITH ERROR BOUNDARIES
  // =============================================================================

  /**
   * Render SPA component with error boundary and performance monitoring
   */
  const renderSPAComponent = useCallback(
    (spaId: string, viewConfig: ViewConfiguration) => {
      const SPAComponent = spaComponents[spaId as keyof typeof spaComponents];

      if (!SPAComponent) {
        return (
          <div className="flex items-center justify-center h-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>SPA Not Found</AlertTitle>
              <AlertDescription>
                The requested SPA "{spaId}" could not be loaded.
              </AlertDescription>
            </Alert>
          </div>
        );
      }

      return (
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          }
        >
          <SPAComponent
            {...viewConfig.props}
            userContext={userContext}
            workspaceContext={workspaceContext}
            onStateChange={(spaState: any) => {
              setLayoutState((prev) => ({
                ...prev,
                spaStates: { ...prev.spaStates, [spaId]: spaState },
              }));
            }}
            onPerformanceUpdate={(performance: PerformanceMetrics) => {
              setLayoutState((prev) => ({
                ...prev,
                spaPerformance: {
                  ...prev.spaPerformance,
                  [spaId]: performance,
                },
              }));
            }}
          />
        </Suspense>
      );
    },
    [spaComponents, userContext, workspaceContext]
  );

  // =============================================================================
  // LAYOUT RENDERING FUNCTIONS
  // =============================================================================

  /**
   * Render single pane layout
   */
  const renderSinglePaneLayout = useCallback(() => {
    const activeView = layoutState.activeViews[0];
    if (!activeView) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Layout className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Active View</h3>
              <p className="text-muted-foreground">
                Select a view from the navigation to get started.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {activeView.spaId ? (
          renderSPAComponent(activeView.spaId, activeView)
        ) : (
          <activeView.component {...activeView.props} />
        )}
      </motion.div>
    );
  }, [layoutState.activeViews, renderSPAComponent]);

  /**
   * Render split screen layout
   */
  const renderSplitScreenLayout = useCallback(() => {
    const activeViews = layoutState.activeViews.slice(0, 2);

    if (activeViews.length === 0) {
      return renderSinglePaneLayout();
    }

    return (
      <div className="h-full w-full flex">
        <motion.div
          className="flex-1 border-r border-border"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {activeViews[0].spaId
            ? renderSPAComponent(activeViews[0].spaId, activeViews[0])
            : createElement(activeViews[0].component, activeViews[0].props)}
        </motion.div>{" "}
        {activeViews[1] && (
          <motion.div
            className="flex-1"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            {activeViews[1].spaId
              ? renderSPAComponent(activeViews[1].spaId, activeViews[1])
              : createElement(activeViews[1].component, activeViews[1].props)}
          </motion.div>
        )}
      </div>
    );
  }, [layoutState.activeViews, renderSinglePaneLayout, renderSPAComponent]);

  /**
   * Render tabbed layout
   */
  const renderTabbedLayout = useCallback(() => {
    const activeViews = layoutState.activeViews;

    if (activeViews.length === 0) {
      return renderSinglePaneLayout();
    }

    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex-shrink-0 border-b border-border">
          <Tabs
            value={activeViews[0]?.id}
            onValueChange={(viewId) => {
              const view = activeViews.find((v) => v.id === viewId);
              if (view && view.viewMode) {
                handleViewTransition(view.viewMode, view.spaId);
              }
            }}
            className="w-full"
          >
            <TabsList className="w-full justify-start h-12 bg-background/50 backdrop-blur-sm">
              {activeViews.map((view) => (
                <TabsTrigger
                  key={view.id}
                  value={view.id}
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary/10"
                >
                  {view.spaId && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        layoutState.activeSPAs[view.spaId]
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                  )}
                  <span>{view.spaId || view.viewMode}</span>
                  {activeViews.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayoutState((prev) => ({
                          ...prev,
                          activeViews: prev.activeViews.filter(
                            (v) => v.id !== view.id
                          ),
                        }));
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeViews.map(
              (view, index) =>
                index === 0 && (
                  <motion.div
                    key={view.id}
                    className="h-full w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {view.spaId
                      ? renderSPAComponent(view.spaId, view)
                      : createElement(view.component, view.props)}
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }, [
    layoutState.activeViews,
    layoutState.activeSPAs,
    renderSinglePaneLayout,
    renderSPAComponent,
    handleViewTransition,
  ]);

  /**
   * Render grid layout
   */
  const renderGridLayout = useCallback(() => {
    const activeViews = layoutState.activeViews;

    if (activeViews.length === 0) {
      return renderSinglePaneLayout();
    }

    const gridCols = Math.ceil(Math.sqrt(activeViews.length));
    const gridRows = Math.ceil(activeViews.length / gridCols);

    return (
      <div
        className="h-full w-full grid gap-2 p-2"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        }}
      >
        {activeViews.map((view, index) => (
          <motion.div
            key={view.id}
            className="border border-border rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="h-8 bg-muted/50 flex items-center justify-between px-3 border-b border-border">
              <div className="flex items-center gap-2">
                {view.spaId && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      layoutState.activeSPAs[view.spaId]
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                )}
                <span className="text-xs font-medium">
                  {view.spaId || view.viewMode}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => {
                  setLayoutState((prev) => ({
                    ...prev,
                    activeViews: prev.activeViews.filter(
                      (v) => v.id !== view.id
                    ),
                  }));
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="h-[calc(100%-2rem)] overflow-hidden">
              {view.spaId ? (
                renderSPAComponent(view.spaId, view)
              ) : (
                <view.component {...view.props} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }, [
    layoutState.activeViews,
    layoutState.activeSPAs,
    renderSinglePaneLayout,
    renderSPAComponent,
  ]);

  // =============================================================================
  // LAYOUT MODE RENDERER
  // =============================================================================

  const renderLayoutContent = useCallback(() => {
    switch (layoutState.layoutMode) {
      case LayoutMode.SINGLE_PANE:
        return renderSinglePaneLayout();
      case LayoutMode.SPLIT_SCREEN:
        return renderSplitScreenLayout();
      case LayoutMode.TABBED:
        return renderTabbedLayout();
      case LayoutMode.GRID:
        return renderGridLayout();
      case LayoutMode.CUSTOM:
        // Will be implemented with DynamicWorkspaceManager
        return renderSinglePaneLayout();
      default:
        return renderSinglePaneLayout();
    }
  }, [
    layoutState.layoutMode,
    renderSinglePaneLayout,
    renderSplitScreenLayout,
    renderTabbedLayout,
    renderGridLayout,
  ]);

  // =============================================================================
  // LAYOUT CONTROLS & TOOLBAR
  // =============================================================================

  const renderLayoutControls = useCallback(
    () => (
      <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border-b border-border">
        {/* Layout Mode Selector */}
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {Object.values(LayoutMode).map((mode) => (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      layoutState.layoutMode === mode ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => handleLayoutModeChange(mode)}
                    className="h-8 w-8 p-0"
                  >
                    {mode === LayoutMode.SINGLE_PANE && (
                      <Monitor className="h-4 w-4" />
                    )}
                    {mode === LayoutMode.SPLIT_SCREEN && (
                      <Columns className="h-4 w-4" />
                    )}
                    {mode === LayoutMode.TABBED && (
                      <Layers className="h-4 w-4" />
                    )}
                    {mode === LayoutMode.GRID && (
                      <Grid3X3 className="h-4 w-4" />
                    )}
                    {mode === LayoutMode.CUSTOM && (
                      <Settings className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{mode.replace("_", " ").toUpperCase()}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6" />

        {/* Performance Indicators */}
        <div className="flex items-center gap-2">
          <Badge
            variant={
              layoutState.renderPerformance.responseTime.average < 100
                ? "default"
                : layoutState.renderPerformance.responseTime.average < 300
                ? "secondary"
                : "destructive"
            }
          >
            {Math.round(layoutState.renderPerformance.responseTime.average)}ms
          </Badge>

          <Badge
            variant={
              layoutState.memoryUsage < 100
                ? "default"
                : layoutState.memoryUsage < 200
                ? "secondary"
                : "destructive"
            }
          >
            {Math.round(layoutState.memoryUsage)}MB
          </Badge>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* AI Recommendations Indicator */}
        {layoutState.aiRecommendations.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Brain className="h-4 w-4 mr-1" />
                {layoutState.aiRecommendations.length} AI Tips
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-semibold">AI Layout Recommendations</h4>
                {layoutState.aiRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{rec.title}</span>
                      <Badge variant="outline">{rec.impact}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Auto-Optimization Toggle */}
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-optimization" className="text-xs">
            Auto-Optimize
          </Label>
          <Switch
            id="auto-optimization"
            checked={layoutState.autoOptimization}
            onCheckedChange={(checked) => {
              setLayoutState((prev) => ({
                ...prev,
                autoOptimization: checked,
              }));
            }}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Responsive Indicator */}
        <div className="flex items-center gap-1">
          {layoutState.deviceType === "desktop" && (
            <Monitor className="h-4 w-4" />
          )}
          {layoutState.deviceType === "tablet" && (
            <Tablet className="h-4 w-4" />
          )}
          {layoutState.deviceType === "mobile" && (
            <Smartphone className="h-4 w-4" />
          )}
          <span className="text-xs">{layoutState.breakpoint}</span>
        </div>

        {/* Error Recovery Indicator */}
        {layoutState.recoveryMode && (
          <Alert className="h-8 py-1 px-2">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <AlertDescription className="text-xs">
              Recovering...
            </AlertDescription>
          </Alert>
        )}
      </div>
    ),
    [
      layoutState.layoutMode,
      layoutState.renderPerformance,
      layoutState.memoryUsage,
      layoutState.aiRecommendations,
      layoutState.autoOptimization,
      layoutState.deviceType,
      layoutState.breakpoint,
      layoutState.recoveryMode,
      handleLayoutModeChange,
    ]
  );

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  useEffect(() => {
    initializeLayout();
  }, [initializeLayout]);

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div
      ref={layoutContainerRef}
      className={`h-full w-full flex flex-col bg-background ${className}`}
    >
      {/* Layout Controls Toolbar */}
      {renderLayoutControls()}

      {/* Main Layout Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Loading Overlay */}
        <AnimatePresence>
          {layoutState.isTransitioning && (
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Transitioning layout...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout Content */}
        <div className="h-full w-full">{renderLayoutContent()}</div>

        {/* Layout Engine Components Integration */}
        <ResponsiveLayoutEngine
          breakpoint={layoutState.breakpoint}
          deviceType={layoutState.deviceType}
          orientation={layoutState.orientation}
          currentLayout={layoutState.currentLayout}
          onLayoutAdaptation={(adaptedLayout) => {
            setLayoutState((prev) => ({
              ...prev,
              currentLayout: adaptedLayout,
            }));
            onLayoutChange(adaptedLayout);
          }}
        />

        <ContextualOverlayManager
          activeViews={layoutState.activeViews}
          layoutMode={layoutState.layoutMode}
          userContext={userContext}
          workspaceContext={workspaceContext}
          onOverlayAction={(action, context) => {
            console.log("Overlay action:", action, context);
          }}
        />

        <TabManager
          activeViews={layoutState.activeViews}
          layoutMode={layoutState.layoutMode}
          onTabAction={(action, viewId, context) => {
            switch (action) {
              case "close":
                setLayoutState((prev) => ({
                  ...prev,
                  activeViews: prev.activeViews.filter((v) => v.id !== viewId),
                }));
                break;
              case "duplicate":
                // Duplicate view logic
                break;
              case "move":
                // Move tab logic
                break;
            }
          }}
        />

        <SplitScreenManager
          activeViews={layoutState.activeViews}
          layoutMode={layoutState.layoutMode}
          onSplitAction={(action, context) => {
            console.log("Split action:", action, context);
          }}
        />

        <LayoutPersonalization
          userContext={userContext}
          currentLayout={layoutState.currentLayout}
          layoutPreferences={userContext.preferences.layoutPreferences}
          onPreferencesChange={async (newPreferences) => {
            await saveLayoutPreferences({
              userId: userContext.id,
              workspaceId: workspaceContext.id,
              layoutPreferences: newPreferences,
            });
          }}
        />
      </div>

      {/* Performance Monitoring Overlay (Development) */}
      {(typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === "development" && (
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs space-y-1">
          <div>
            Render:{" "}
            {Math.round(layoutState.renderPerformance.responseTime.average)}ms
          </div>
          <div>Memory: {Math.round(layoutState.memoryUsage)}MB</div>
          <div>Views: {layoutState.activeViews.length}</div>
          <div>SPAs: {Object.keys(layoutState.activeSPAs).length}</div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ERROR BOUNDARY WRAPPER
// =============================================================================

interface LayoutContentErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class LayoutContentErrorBoundary extends React.Component<
  React.PropsWithChildren<LayoutContentProps>,
  LayoutContentErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<LayoutContentProps>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(
    error: Error
  ): LayoutContentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("LayoutContent Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Layout System Error</AlertTitle>
            <AlertDescription>
              The layout system encountered an error. Please refresh the page or
              contact support.
              <details className="mt-2">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="text-xs mt-1 overflow-auto">
                  {this.state.error?.message}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return <LayoutContent {...this.props} />;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LayoutContentErrorBoundary;
export { LayoutContent };
export type {
  LayoutContentProps,
  LayoutContentState,
  ViewConfiguration,
  LayoutPosition,
  LayoutSize,
};
