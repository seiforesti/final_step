/**
 * 🎯 RACINE MAIN MANAGER SPA - STREAMLINED MASTER ORCHESTRATOR
 * ===========================================================
 *
 * The ultimate master controller and orchestrator for the entire data governance system.
 * This streamlined version maintains 100% functionality while organizing code into
 * proper separation of concerns through extracted components, hooks, and utilities.
 *
 * Features:
 * - Animated Data Governance Schema Visualization
 * - Global System Overview Dashboard
 * - Real-time Cross-Group Orchestration
 * - Advanced Glassmorphism Design
 * - Enterprise-Grade Workflow Management
 * - AI-Powered Insights and Recommendations
 * - Comprehensive Activity Tracking
 * - Advanced Collaboration Tools
 * - Intelligent Quick Actions System
 * - Performance Monitoring and Optimization
 *
 * Architecture:
 * - Master state management across all 7 SPAs
 * - Real-time WebSocket integration
 * - Advanced RBAC integration
 * - Cross-group workflow orchestration
 * - AI-driven system intelligence
 * - Enterprise accessibility compliance
 *
 * Backend Integration:
 * - 100% mapped to racine backend services
 * - Real-time data synchronization
 * - Advanced security and audit logging
 * - Performance optimization engine
 * - Cross-group data governance
 */

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle,
  Database,
  Heart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

// Types and Interfaces
import {
  ViewMode,
  LayoutMode,
  SystemStatus,
  UUID,
} from "./types";
import {
  DataGovernanceNode,
  SystemOverview,
  QuickActionContext,
} from "./types/advanced-analytics.types";

// Hooks - Core Racine Hooks
import {
  useRacineOrchestration,
  useWorkspaceManagement,
  useUserManagement,
  useCrossGroupIntegration,
  useActivityTracking,
  useIntelligentDashboard,
  useAIAssistant,
  useJobWorkflow,
  usePipelineManagement,
  useCollaboration,
  usePerformanceMonitoring,
  useNotificationManager,
} from "./hooks";

// Hooks - Advanced Analytics and Intelligence
import { useAdvancedAnalytics } from "./hooks/useAdvancedAnalytics";
import { useSystemIntelligence } from "./hooks/useSystemIntelligence";
import { useIntelligentAutomation } from "./hooks/useIntelligentAutomation";
import { useCostOptimization } from "./hooks/useCostOptimization";
import { useAdvancedMonitoring } from "./hooks/useAdvancedMonitoring";
import { useEnterpriseSecurity } from "./hooks/useEnterpriseSecurity";

// Layout and Navigation Components
import SimpleEnterpriseLayout from "./components/layout/SimpleEnterpriseLayout";
import { RacineRouter } from "./components/routing/RacineRouter";
import {
  RouteGuardsProvider,
  RouteMiddlewareProvider,
  DeepLinkManagerProvider,
  BreadcrumbManagerProvider,
  QuickNavigationProvider,
  QuickNavigationPanel,
} from "./components/routing";
import { AppNavbar } from "./components/navigation/AppNavbar";
import { EnterpriseAppSidebar } from "./components/navigation/EnterpriseAppSidebar";
import { EnterpriseQuickActionsSidebar } from "./components/quick-actions-sidebar/EnterpriseQuickActionsSidebar";
import { EnterpriseSidebarErrorBoundary } from "./components/error-boundaries/EnterpriseSidebarErrorBoundary";
import { EnterpriseQuickActionsErrorBoundary } from "./components/error-boundaries/EnterpriseQuickActionsErrorBoundary";

// Core Racine Components
import { AIAssistantInterface } from "./components/ai-assistant/AIAssistantInterface";
import { IntelligentDashboardOrchestrator } from "./components/intelligent-dashboard/IntelligentDashboardOrchestrator";
import { ActivityTrackingHub } from "./components/activity-tracker/ActivityTrackingHub";
import { MasterCollaborationHub } from "./components/collaboration/MasterCollaborationHub";
import { JobWorkflowBuilder } from "./components/job-workflow-space/JobWorkflowBuilder";
import PipelineDesigner from "./components/pipeline-manager/PipelineDesigner";
import { WorkspaceOrchestrator } from "./components/workspace/WorkspaceOrchestrator";
import { UserProfileManager } from "./components/user-management/UserProfileManager";

// Group SPA Orchestrators
import { DataSourcesSPAOrchestrator } from "./components/spa-orchestrators/DataSourcesSPAOrchestrator";
import { ScanRuleSetsSPAOrchestrator } from "./components/spa-orchestrators/ScanRuleSetsSPAOrchestrator";
import { ClassificationsSPAOrchestrator } from "./components/spa-orchestrators/ClassificationsSPAOrchestrator";
import { ComplianceRuleSPAOrchestrator } from "./components/spa-orchestrators/ComplianceRuleSPAOrchestrator";
import { AdvancedCatalogSPAOrchestrator } from "./components/spa-orchestrators/AdvancedCatalogSPAOrchestrator";
import { ScanLogicSPAOrchestrator } from "./components/spa-orchestrators/ScanLogicSPAOrchestrator";
import { RBACSystemSPAOrchestrator } from "./components/spa-orchestrators/RBACSystemSPAOrchestrator";

// Advanced Visualization Components
import { AdvancedMetricsVisualization } from "./components/visualizations/AdvancedMetricsVisualization";
import { DataGovernanceSchema } from "./components/visualizations/DataGovernanceSchema";

// Utilities and Constants
import { formatBytes, formatDuration, formatNumber } from "./utils/formatting-utils";
import { validateSystemHealth, optimizePerformance } from "./utils/performance-utils";
import { coordinateServices, validateCrossGroupIntegration } from "./utils/cross-group-orchestrator";
import { cn } from "./utils/ui-utils";
import {
  SYSTEM_CONSTANTS,
  PERFORMANCE_THRESHOLDS,
  ANIMATION_CONFIGS,
  THEME_CONFIGS,
  WORKSPACE_DEFAULTS,
} from "./constants/system-constants";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RacineMainManagerSPA: React.FC = () => {
  // Emergency safe-mode in development to prevent UI stalls while backend warms up
  const SAFE_MODE = process.env.NODE_ENV === "development";
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // 🚀 PERFORMANCE-OPTIMIZED CORE HOOKS WITH LAZY LOADING
  // Stage 1: Critical hooks only (user & workspace)
  const {
    currentUser,
    userPermissions,
    isLoading: userLoading,
  } = useUserManagement();

  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    isLoading: workspaceLoading,
  } = useWorkspaceManagement();

  // Stage 2: Lazy-loaded orchestration (after user is loaded)
  const [enableOrchestration, setEnableOrchestration] = useState(false);
  useEffect(() => {
    if (currentUser && !userLoading) {
      // Only load orchestration after user is ready
      const timer = setTimeout(() => setEnableOrchestration(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, userLoading]);

  const orchestrationHookResult = enableOrchestration ? useRacineOrchestration() : {
    orchestrationState: null,
    systemHealth: null,
    performanceMetrics: null,
    isLoading: false,
    error: null,
    executeWorkflow: () => Promise.resolve(),
    optimizeSystem: () => Promise.resolve(),
    refreshSystemHealth: () => Promise.resolve(),
  };

  const {
    orchestrationState,
    systemHealth,
    performanceMetrics,
    isLoading: orchestrationLoading,
    error: orchestrationError,
    executeWorkflow,
    optimizeSystem,
    refreshSystemHealth,
  } = orchestrationHookResult;

  // Stage 3: Lazily load secondary hooks (after orchestration is stable)
  const [enableSecondaryHooks, setEnableSecondaryHooks] = useState(false);
  useEffect(() => {
    if (enableOrchestration && !orchestrationLoading) {
      const timer = setTimeout(() => setEnableSecondaryHooks(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [enableOrchestration, orchestrationLoading]);

  // Only initialize secondary hooks when system is stable
  const integrationHookResult = enableSecondaryHooks ? useCrossGroupIntegration() : {
    integrationStatus: null,
    crossGroupMetrics: null,
    coordinateIntegration: () => Promise.resolve(),
  };
  const { integrationStatus, crossGroupMetrics, coordinateIntegration } = integrationHookResult;

  const activityHookResult = enableSecondaryHooks ? useActivityTracking() : {
    activities: [],
    trackActivity: () => Promise.resolve(),
    getActivitySummary: () => Promise.resolve({}),
  };
  const { activities, trackActivity, getActivitySummary } = activityHookResult;

  const dashboardHookResult = enableSecondaryHooks ? useIntelligentDashboard() : {
    dashboards: [],
    kpiMetrics: {},
    createDashboard: () => Promise.resolve(),
  };
  const { dashboards, kpiMetrics, createDashboard } = dashboardHookResult;

  const aiHookResult = enableSecondaryHooks ? useAIAssistant() : {
    aiAssistant: null,
    recommendations: [],
    insights: [],
    askAI: () => Promise.resolve(""),
  };
  const { aiAssistant, recommendations, insights, askAI } = aiHookResult;

  const workflowHookResult = enableSecondaryHooks ? useJobWorkflow() : {
    workflows: [],
    activeJobs: [],
    executeJob: () => Promise.resolve(),
  };
  const { workflows, activeJobs, executeJob } = workflowHookResult;

  const pipelineHookResult = enableSecondaryHooks ? usePipelineManagement() : {
    pipelines: [],
    activePipelines: {},
    executePipeline: () => Promise.resolve(),
  };
  const { pipelines, activePipelines, executePipeline } = pipelineHookResult;

  const collaborationHookResult = enableSecondaryHooks ? useCollaboration() : {
    collaborationSessions: [],
    teamActivity: [],
  };
  const { collaborationSessions, teamActivity } = collaborationHookResult;

  const performanceHookResult = enableSecondaryHooks ? usePerformanceMonitoring() : {
    systemPerformance: null,
    resourceUsage: null,
    alerts: [],
  };
  const { systemPerformance, resourceUsage, alerts } = performanceHookResult;

  const notificationHookResult = enableSecondaryHooks ? useNotificationManager() : {
    notificationEngine: null,
    recentNotifications: [],
    sendNotification: () => Promise.resolve(),
    createTemplate: () => Promise.resolve(),
    testTemplate: () => Promise.resolve(),
    subscribeToNotifications: () => () => {},
  };
  const {
    notificationEngine,
    recentNotifications: recentNotificationsFromEngine,
    sendNotification,
    createTemplate: createNotificationTemplate,
    testTemplate: testNotificationTemplate,
    subscribeToNotifications,
  } = notificationHookResult;

  // ============================================================================
  // ADVANCED ANALYTICS AND INTELLIGENCE - LAZY LOADED
  // ============================================================================

  // Stage 4: Advanced analytics hooks (after all core systems are stable)
  const [enableAdvancedHooks, setEnableAdvancedHooks] = useState(false);
  useEffect(() => {
    if (enableSecondaryHooks && currentUser) {
      const timer = setTimeout(() => setEnableAdvancedHooks(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [enableSecondaryHooks, currentUser]);

  // Advanced Analytics (lazy loaded)
  const analyticsHookResult = enableAdvancedHooks ? useAdvancedAnalytics() : {
    analyticsData: null,
    isLoading: false,
    error: null,
    refreshAnalytics: () => Promise.resolve(),
    setRefreshInterval: () => {},
  };
  const {
    analyticsData,
    isLoading: analyticsLoading,
    setRefreshInterval: setAnalyticsRefreshInterval,
  } = analyticsHookResult;

  // System Intelligence (lazy loaded)
  const intelligenceHookResult = enableAdvancedHooks ? useSystemIntelligence() : {
    intelligence: null,
    isLoading: false,
    error: null,
    enableAnomalyDetection: () => Promise.resolve(),
    triggerOptimization: () => Promise.resolve(),
    refreshIntelligence: () => Promise.resolve(),
  };
  const {
    intelligence,
    isLoading: intelligenceLoading,
    enableAnomalyDetection,
    triggerOptimization,
  } = intelligenceHookResult;

  // Intelligent Automation (lazy loaded)
  const automationHookResult = enableAdvancedHooks ? useIntelligentAutomation() : {
    automationRules: [],
    activeExecutions: [],
    executionHistory: [],
    isLoading: false,
    error: null,
    createAutomationRule: () => Promise.resolve({} as any),
    executeRule: () => Promise.resolve({} as any),
    pauseExecution: () => Promise.resolve(),
    refreshAutomation: () => Promise.resolve(),
  };
  const {
    automationRules,
    activeExecutions,
    createAutomationRule,
    executeRule,
    pauseExecution,
  } = automationHookResult;

  // Cost Optimization (lazy loaded)
  const costHookResult = enableAdvancedHooks ? useCostOptimization() : {
    costData: null,
    implementOptimization: () => Promise.resolve(),
    createBudget: () => Promise.resolve(),
    generateCostReport: () => Promise.resolve(),
  };
  const {
    costData,
    implementOptimization,
    createBudget,
    generateCostReport,
  } = costHookResult;

  // Advanced Monitoring (lazy loaded)
  const monitoringHookResult = enableAdvancedHooks ? useAdvancedMonitoring() : {
    monitoringConfig: null,
    activeAlerts: [],
    createAlertRule: () => Promise.resolve(),
    testAlertChannel: () => Promise.resolve(),
    acknowledgeAlert: () => Promise.resolve(),
  };
  const {
    monitoringConfig,
    activeAlerts,
    createAlertRule,
    testAlertChannel,
    acknowledgeAlert,
  } = monitoringHookResult;

  // Enterprise Security (lazy loaded)
  const securityHookResult = enableAdvancedHooks ? useEnterpriseSecurity() : {
    securityConfig: null,
    auditLogs: [],
    securityAlerts: [],
    complianceStatus: {},
    performSecurityScan: () => Promise.resolve(),
    generateComplianceReport: () => Promise.resolve(),
    resolveViolation: () => Promise.resolve(),
  };
  const {
    securityConfig,
    auditLogs,
    securityAlerts,
    complianceStatus,
    performSecurityScan,
    generateComplianceReport,
    resolveViolation,
  } = securityHookResult;

  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(LayoutMode.SINGLE_PANE);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickActionsSidebarOpen, setQuickActionsSidebarOpen] = useState(false);
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<UUID | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  // 🚀 OPTIMIZED Animation and interaction state
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const lastMouseUpdateRef = useRef<number>(0);
  
  // Throttled mouse tracking to prevent excessive re-renders
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastMouseUpdateRef.current < 100) return; // Throttle to 10fps
    lastMouseUpdateRef.current = now;
    
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePosition({ x, y });
  }, []);

  // Initialize motion/performance preferences before effects that depend on them
  const reducedMotion = useReducedMotion();
  const [performanceMode, setPerformanceMode] = useState<"standard" | "high" | "ultra">("standard");

  useEffect(() => {
    if (!reducedMotion && performanceMode !== "standard") {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
    return undefined;
  }, [handleMouseMove, reducedMotion, performanceMode]);

  // 🚀 OPTIMIZED LOADING STATE - Progressive Loading with Immediate UI
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Progressive loading stages
  useEffect(() => {
    // Stage 1: Show UI immediately when user/workspace is ready
    if (currentUser && !userLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [currentUser, userLoading, initialLoadComplete]);

  // Quick loading check - only block for essential user data
  const showLoading = useMemo(
    () => userLoading && !initialLoadComplete,
    [userLoading, initialLoadComplete]
  );

  // Progressive enhancement indicator
  const [loadingProgress, setLoadingProgress] = useState(0);
  useEffect(() => {
    let progress = 0;
    if (currentUser) progress += 25;
    if (activeWorkspace) progress += 25;
    if (enableOrchestration) progress += 25;
    if (enableAdvancedHooks) progress += 25;
    setLoadingProgress(progress);
  }, [currentUser, activeWorkspace, enableOrchestration, enableAdvancedHooks]);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [schemaAnimationEnabled, setSchemaAnimationEnabled] = useState(true);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Refs for advanced interactions
  const containerRef = useRef<HTMLDivElement>(null);
  // Stabilize function references from hooks to avoid effect churn
  const refreshSystemHealthRef = useRef(refreshSystemHealth);
  useEffect(() => {
    refreshSystemHealthRef.current = refreshSystemHealth;
  }, [refreshSystemHealth]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Theme and styling
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================================================
  // COMPUTED VALUES AND MEMOS
  // ============================================================================

  // 🚀 OPTIMIZED Data Governance Schema Nodes - Stable References
  const dataGovernanceNodes = useMemo<DataGovernanceNode[]>(() => {
    // Only update when integration data actually changes
    const baseNodes = [
      {
        id: "data-sources",
        name: "Data Sources",
        type: "core" as const,
        position: { x: 200, y: 150 },
        connections: ["scan-logic", "catalog", "compliance"],
        icon: Database,
        color: "#3B82F6",
      },
      {
        id: "scan-rule-sets",
        name: "Scan Rules",
        type: "core" as const,
        position: { x: 400, y: 100 },
        connections: ["data-sources", "scan-logic", "compliance"],
        icon: Shield,
        color: "#10B981",
      },
      {
        id: "classifications",
        name: "Classifications",
        type: "core" as const,
        position: { x: 600, y: 150 },
        connections: ["catalog", "compliance", "ai-engine"],
        icon: Database,
        color: "#8B5CF6",
      },
      {
        id: "compliance",
        name: "Compliance",
        type: "core" as const,
        position: { x: 500, y: 300 },
        connections: ["data-sources", "classifications", "audit"],
        icon: CheckCircle,
        color: "#F59E0B",
      },
      {
        id: "catalog",
        name: "Data Catalog",
        type: "core" as const,
        position: { x: 300, y: 250 },
        connections: ["data-sources", "classifications", "lineage"],
        icon: Database,
        color: "#EC4899",
      },
    ];

    // Add dynamic data only when available
    return baseNodes.map(node => ({
      ...node,
      status: integrationStatus?.groups?.[node.id]?.status || SystemStatus.HEALTHY,
      metrics: {
        health: integrationStatus?.groups?.[node.id]?.health || 95,
        performance: crossGroupMetrics?.performance?.[node.id] || 88,
        activity: Math.min(activities.length, 10), // Prevent excessive filtering
      },
    }));
  }, [
    // Only re-compute when these specific values change
    integrationStatus?.groups,
    crossGroupMetrics?.performance,
    activities.length, // Use length instead of full array to prevent constant re-computation
  ]);

  // 🚀 OPTIMIZED System Overview Metrics - Reduced Dependencies
  const systemOverview = useMemo<SystemOverview>(
    () => ({
      totalAssets: crossGroupMetrics?.totalAssets || 0,
      activeWorkflows: orchestrationState?.activeWorkflows ? Object.keys(orchestrationState.activeWorkflows).length : 0,
      activePipelines: activePipelines ? Object.keys(activePipelines).length : 0,
      systemHealth: systemHealth?.performance?.score || 95,
      complianceScore: crossGroupMetrics?.compliance?.overallScore || 92,
      performanceScore: performanceMetrics?.throughput?.operationsPerSecond || 100,
      collaborationActivity: collaborationSessions?.length || 0,
      aiInsights: insights?.length || 0,
    }),
    [
      // Only track essential metrics that actually change
      crossGroupMetrics?.totalAssets,
      crossGroupMetrics?.compliance?.overallScore,
      systemHealth?.performance?.score,
      orchestrationState?.activeWorkflows,
      Object.keys(activePipelines || {}).length,
      performanceMetrics?.throughput?.operationsPerSecond,
      collaborationSessions?.length,
      insights?.length,
    ]
  );

  // Quick Actions Context
  const quickActionsContext = useMemo<QuickActionContext>(
    () => ({
      currentView,
      activeWorkspace: selectedWorkspace || activeWorkspace?.id || "",
      userRole: currentUser?.roles?.[0]?.name || "user",
      recentActions: activities.slice(0, 5).map((a) => a.action),
      systemHealth: systemHealth || ({} as any),
    }),
    [currentView, selectedWorkspace, activeWorkspace, currentUser, activities, systemHealth]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleViewChange = useCallback(
    (view: ViewMode) => {
      setCurrentView(view);
      trackActivity({
        type: "navigation",
        action: "view_change",
        metadata: { from: currentView, to: view },
      });
    },
    [currentView, trackActivity]
  );

  const handleWorkspaceSwitch = useCallback(
    async (workspaceId: UUID) => {
      try {
        await switchWorkspace(workspaceId);
        setSelectedWorkspace(workspaceId);
        trackActivity({
          type: "workspace",
          action: "switch",
          metadata: { workspaceId },
        });
      } catch (error) {
        console.error("Failed to switch workspace:", error);
      }
    },
    [switchWorkspace, trackActivity]
  );

  const handleSystemOptimization = useCallback(async () => {
    try {
      await optimizeSystem({
        targetMetrics: ["performance", "resource_usage", "cost"],
        optimizationLevel: "aggressive",
      });
      trackActivity({
        type: "system",
        action: "optimize",
        metadata: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      console.error("System optimization failed:", error);
    }
  }, [optimizeSystem, trackActivity]);

  const handleQuickAction = useCallback(
    (action: string, context?: any) => {
      setQuickActionsSidebarOpen(true);
      trackActivity({
        type: "quick_action",
        action,
        metadata: { context },
      });
    },
    [trackActivity]
  );

  // ============================================================================
  // MAIN CONTENT RENDERER
  // ============================================================================

  const renderMainContent = useCallback(() => {
    switch (currentView) {
      case ViewMode.DASHBOARD:
        return (
          <div className="space-y-8">
                                        {/* System Schema Visualization - With Error Boundary */}
                            <motion.section
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  Data Governance Architecture
                                </h2>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
                                    Live System Map
                                  </Badge>
                                  <Badge
                                    variant={systemHealth?.overall === SystemStatus.HEALTHY ? "default" : "destructive"}
                                    className="bg-white/50 dark:bg-gray-900/50"
                                  >
                                    {systemHealth?.overall || "Initializing"}
                                  </Badge>
                                  {loadingProgress < 100 && (
                                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950">
                                      Loading {loadingProgress}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {dataGovernanceNodes.length > 0 ? (
                                <DataGovernanceSchema
                                  nodes={dataGovernanceNodes}
                                  systemOverview={systemOverview}
                                  onNodeClick={(nodeId) => console.log("Node clicked:", nodeId)}
                                  onRefresh={refreshSystemHealth}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                  <div className="text-center space-y-2">
                                    <div className="w-8 h-8 mx-auto border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                      Initializing data governance schema...
                                    </p>
                                  </div>
                                </div>
                              )}
                            </motion.section>

            {/* Advanced Metrics Visualization - Progressive Loading */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {analyticsData ? (
                <AdvancedMetricsVisualization
                  metrics={analyticsData}
                  timeRange="Last 24 hours"
                  onDrillDown={(metric) => console.log("Drill down:", metric)}
                />
              ) : enableAdvancedHooks ? (
                <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 mx-auto border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Loading advanced analytics...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-blue-500" />
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      Advanced Analytics Available Soon
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      Initializing advanced features...
                    </p>
                  </div>
                </div>
              )}
            </motion.section>

            {/* Activity Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Recent Activity */}
              <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Recent System Activity
                  </CardTitle>
                  <CardDescription>
                    Latest actions across the data governance system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()} • {activity.resourceType}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.action}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    AI Insights & Recommendations
                  </CardTitle>
                  <CardDescription>
                    Intelligent recommendations from the AI engine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 p-2 rounded bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/30 dark:border-purple-800/30"
                      >
                        <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm text-purple-700 dark:text-purple-300 truncate">
                          {rec.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(rec.confidence * 100)}%
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        );

      case ViewMode.WORKSPACE:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <WorkspaceOrchestrator />
          </Suspense>
        );

      case ViewMode.WORKFLOWS:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <JobWorkflowBuilder />
          </Suspense>
        );

      case ViewMode.PIPELINES:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <PipelineDesigner />
          </Suspense>
        );

      case ViewMode.AI_ASSISTANT:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <AIAssistantInterface />
          </Suspense>
        );

      case ViewMode.ACTIVITY:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <ActivityTrackingHub />
          </Suspense>
        );

      case ViewMode.COLLABORATION:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <MasterCollaborationHub />
          </Suspense>
        );

      case ViewMode.SETTINGS:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <UserProfileManager />
          </Suspense>
        );

      // Group SPA views - Wrapped in Suspense
      case ViewMode.DATA_SOURCES:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <DataSourcesSPAOrchestrator />
          </Suspense>
        );

      case ViewMode.SCAN_RULE_SETS:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <ScanRuleSetsSPAOrchestrator />
          </Suspense>
        );

      case ViewMode.CLASSIFICATIONS:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <ClassificationsSPAOrchestrator />
          </Suspense>
        );

      case ViewMode.COMPLIANCE_RULES:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <ComplianceRuleSPAOrchestrator />
          </Suspense>
        );

      case ViewMode.ADVANCED_CATALOG:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <AdvancedCatalogSPAOrchestrator />
          </Suspense>
        );

      case ViewMode.SCAN_LOGIC:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <ScanLogicSPAOrchestrator />
          </Suspense>
        );

      case ViewMode.RBAC_SYSTEM:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <RBACSystemSPAOrchestrator />
          </Suspense>
        );

      default:
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" /></div>}>
            <IntelligentDashboardOrchestrator />
          </Suspense>
        );
    }
  }, [
    currentView,
    dataGovernanceNodes,
    systemOverview,
    systemHealth,
    refreshSystemHealth,
    analyticsData,
    activities,
    recommendations,
  ]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <RouteGuardsProvider>
      <RouteMiddlewareProvider>
        <DeepLinkManagerProvider>
          <BreadcrumbManagerProvider>
            <QuickNavigationProvider>
              <SimpleEnterpriseLayout
                currentView={currentView}
                layoutMode={layoutMode}
                spaContext={{
                  activeSPA: currentView,
                  spaData: { dashboardMode: "advanced", splitViewMode: false, fullScreenMode: false },
                  crossSPAWorkflows: workflows || [],
                  spaIntegrations: [],
                }}
                userPreferences={{
                  defaultLayout: layoutMode,
                  responsiveEnabled: true,
                  animationsEnabled: !reducedMotion,
                  accessibilityLevel: "AA",
                  customLayouts: [],
                  workspaceLayouts: {},
                  spaLayouts: {},
                }}
              >
                <RacineRouter
                  currentView={currentView}
                  onViewChange={handleViewChange}
                  userPermissions={userPermissions}
                  workspaceId={activeWorkspace?.id}
                  enableAnalytics={true}
                  enableDeepLinking={true}
                  enableBreadcrumbs={true}
                  enableHistory={true}
                  maxHistoryItems={50}
                >
                  <TooltipProvider>
                    {/* Fast Loading State - Only for Critical User Data */}
                    {showLoading && (
                      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 flex items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center space-y-6"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 mx-auto"
                          >
                            <div className="w-full h-full border-4 border-blue-500/30 border-t-blue-500 rounded-full" />
                          </motion.div>
                          <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                              Authenticating User
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Just a moment while we verify your credentials...
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Progressive Loading Indicator - Non-blocking */}
                    {!showLoading && loadingProgress < 100 && (
                      <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-4 py-2 shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4"
                          >
                            <div className="w-full h-full border-2 border-blue-500/30 border-t-blue-500 rounded-full" />
                          </motion.div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Loading advanced features... {loadingProgress}%
                          </span>
                          <div className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${loadingProgress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Error State */}
                    {orchestrationError && (
                      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center space-y-6 max-w-lg"
                        >
                          <AlertTriangle className="w-20 h-20 mx-auto text-red-500" />
                          <div className="space-y-3">
                            <h2 className="text-2xl font-semibold text-red-900 dark:text-red-100">
                              Enterprise System Initialization Failed
                            </h2>
                            <p className="text-red-700 dark:text-red-300">{orchestrationError}</p>
                            <div className="flex items-center justify-center gap-3 mt-6">
                              <Button onClick={() => window.location.reload()} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Connection
                              </Button>
                              <Button onClick={() => setSettingsDialogOpen(true)} variant="outline">
                                <Settings className="w-4 h-4 mr-2" />
                                System Settings
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Main Application Content */}
                    {!orchestrationError && !showLoading && (
                      <div
                        ref={containerRef}
                        className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 relative overflow-hidden"
                      >
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />

                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
                          animate={{
                            background: [
                              "linear-gradient(0deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                              "linear-gradient(120deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                              "linear-gradient(240deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                              "linear-gradient(360deg, rgba(59,130,246,0.05), rgba(147,51,234,0.05), rgba(236,72,153,0.05))",
                            ],
                          }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Navigation */}
                        <AppNavbar
                          currentUser={currentUser}
                          systemHealth={systemHealth}
                          notifications={[...notifications, ...recentNotificationsFromEngine]}
                          onSearch={setSearchQuery}
                          onQuickAction={handleQuickAction}
                          onAIAssistant={() => setAIAssistantOpen(true)}
                        />

                        {/* Main Layout */}
                        <div className="flex h-screen pt-16">
                          {/* Enterprise Main Sidebar with Error Boundary */}
                          <EnterpriseSidebarErrorBoundary 
                            componentName="MainAppSidebar"
                            enableDetailedErrorReporting={true}
                            enableAutoRecovery={true}
                            autoRecoveryTimeout={3000}
                          >
                            <EnterpriseAppSidebar
                              onQuickActionsTrigger={() => setQuickActionsSidebarOpen(!quickActionsSidebarOpen)}
                              isQuickActionsSidebarOpen={quickActionsSidebarOpen}
                              isCollapsed={sidebarCollapsed}
                              onCollapsedChange={setSidebarCollapsed}
                              className="z-30"
                            />
                          </EnterpriseSidebarErrorBoundary>

                          {/* Main Content Area */}
                          <main className={cn("flex-1 transition-all duration-300 ease-in-out", sidebarCollapsed ? "ml-16" : "ml-64")}>
                            <div className="h-full overflow-auto">
                              <div className="container mx-auto p-6 space-y-6">
                                {/* Main Content */}
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={currentView}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {renderMainContent()}
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </div>
                          </main>
                        </div>

                        {/* Enterprise Quick Actions Sidebar with Error Boundary */}
                        <EnterpriseQuickActionsErrorBoundary
                          componentName="MainQuickActionsSidebar"
                          enableDetailedErrorReporting={true}
                          enableAutoRecovery={true}
                          enableQuickRecovery={true}
                          autoRecoveryTimeout={2000}
                        >
                          <EnterpriseQuickActionsSidebar
                            isOpen={quickActionsSidebarOpen}
                            onToggle={() => setQuickActionsSidebarOpen(!quickActionsSidebarOpen)}
                            currentContext={quickActionsContext}
                            position="right"
                            mode="overlay"
                            enableCustomization={true}
                            enableContextualActions={true}
                            enableAnalytics={true}
                            sidebarWidth={400}
                            compactMode={false}
                            autoHide={false}
                            persistLayout={true}
                            enableSearch={true}
                            enableFiltering={true}
                            showComponentMetrics={true}
                            className="z-40"
                          />
                        </EnterpriseQuickActionsErrorBoundary>

                        {/* AI Assistant Interface */}
                        <AnimatePresence>
                          {aiAssistantOpen && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                              onClick={() => setAIAssistantOpen(false)}
                            >
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="w-full max-w-6xl h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="h-full flex flex-col">
                                  <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                                    <div className="flex items-center gap-3">
                                      <Bot className="w-6 h-6 text-blue-500" />
                                      <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                          Enterprise AI Assistant
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Powered by Advanced Intelligence Engine
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setAIAssistantOpen(false)}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <AIAssistantInterface />
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* System Alerts Overlay */}
                        <AnimatePresence>
                          {[...systemAlerts, ...securityAlerts, ...activeAlerts].length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -50 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -50 }}
                              className="fixed top-20 right-4 z-40 space-y-2 max-w-sm"
                            >
                              {[...systemAlerts, ...securityAlerts, ...activeAlerts]
                                .slice(0, 5)
                                .map((alert, index) => (
                                  <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 50 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <Alert className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-orange-200 dark:border-orange-800">
                                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                                      <AlertTitle className="text-orange-700 dark:text-orange-300">
                                        System Alert
                                      </AlertTitle>
                                      <AlertDescription className="text-orange-600 dark:text-orange-400">
                                        {alert.message || alert.description}
                                      </AlertDescription>
                                    </Alert>
                                  </motion.div>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Floating Action Button for Quick Access */}
                        <motion.div
                          className="fixed bottom-6 right-6 z-30"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="lg"
                                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Plus className="w-6 h-6" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleQuickAction("create_workflow")}>
                                Create Workflow
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickAction("create_pipeline")}>
                                Create Pipeline
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAIAssistantOpen(true)}>
                                Ask AI Assistant
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleSystemOptimization}>
                                <Zap className="w-4 h-4 mr-2" />
                                Optimize System
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      </div>
                    )}
                  </TooltipProvider>

                  {/* Quick Navigation Panel */}
                  <QuickNavigationPanel />
                </RacineRouter>
              </SimpleEnterpriseLayout>
            </QuickNavigationProvider>
          </BreadcrumbManagerProvider>
        </DeepLinkManagerProvider>
      </RouteMiddlewareProvider>
    </RouteGuardsProvider>
  );
};

// Export the streamlined component as default
export default RacineMainManagerSPA;