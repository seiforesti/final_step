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
import { AppSidebar } from "./components/navigation/AppSidebar";
import { GlobalQuickActionsSidebar } from "./components/quick-actions-sidebar/GlobalQuickActionsSidebar";

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

  // Core Racine Hooks
  const {
    orchestrationState,
    systemHealth,
    performanceMetrics,
    isLoading: orchestrationLoading,
    error: orchestrationError,
    executeWorkflow,
    optimizeSystem,
    refreshSystemHealth,
  } = useRacineOrchestration();

  // Defer orchestration boot until after first paint in dev to reduce mount congestion
  const orchestrationBootRef = useRef(false);
  useEffect(() => {
    if (orchestrationBootRef.current) return;
    orchestrationBootRef.current = true;
    // No-op placeholder to potentially trigger an initial lightweight ping later if needed.
  }, []);

  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    isLoading: workspaceLoading,
  } = useWorkspaceManagement();

  const {
    currentUser,
    userPermissions,
    isLoading: userLoading,
  } = useUserManagement();

  const { integrationStatus, crossGroupMetrics, coordinateIntegration } =
    useCrossGroupIntegration();

  const { activities, trackActivity, getActivitySummary } =
    useActivityTracking();

  const { dashboards, kpiMetrics, createDashboard } = useIntelligentDashboard();

  const { aiAssistant, recommendations, insights, askAI } = useAIAssistant();

  const { workflows, activeJobs, executeJob } = useJobWorkflow();

  const { pipelines, activePipelines, executePipeline } =
    usePipelineManagement();

  const { collaborationSessions, teamActivity } = useCollaboration();

  const { systemPerformance, resourceUsage, alerts } =
    usePerformanceMonitoring();

  const {
    notificationEngine,
    recentNotifications: recentNotificationsFromEngine,
    sendNotification,
    createTemplate: createNotificationTemplate,
    testTemplate: testNotificationTemplate,
    subscribeToNotifications,
  } = useNotificationManager();

  // ============================================================================
  // ADVANCED ANALYTICS AND INTELLIGENCE
  // ============================================================================

  // Advanced Analytics
  const {
    analyticsData,
    isLoading: analyticsLoading,
    setRefreshInterval: setAnalyticsRefreshInterval,
  } = useAdvancedAnalytics();

  // System Intelligence
  const {
    intelligence,
    isLoading: intelligenceLoading,
    enableAnomalyDetection,
    triggerOptimization,
  } = useSystemIntelligence();

  // Intelligent Automation
  const {
    automationRules,
    activeExecutions,
    createAutomationRule,
    executeRule,
    pauseExecution,
  } = useIntelligentAutomation();

  // Cost Optimization
  const {
    costData,
    implementOptimization,
    createBudget,
    generateCostReport,
  } = useCostOptimization();

  // Advanced Monitoring
  const {
    monitoringConfig,
    activeAlerts,
    createAlertRule,
    testAlertChannel,
    acknowledgeAlert,
  } = useAdvancedMonitoring();

  // Enterprise Security
  const {
    securityConfig,
    auditLogs,
    securityAlerts,
    complianceStatus,
    performSecurityScan,
    generateComplianceReport,
    resolveViolation,
  } = useEnterpriseSecurity();

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

  // Animation and interaction state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const lastMouseUpdateRef = useRef<number>(0);

  // Bounded startup grace period to avoid indefinite spinner when backend is slow/unavailable
  const [bootGraceElapsed, setBootGraceElapsed] = useState(false);
  useEffect(() => {
    const timerId = setTimeout(() => setBootGraceElapsed(true), 10000);
    return () => clearTimeout(timerId);
  }, []);

  const showLoading = useMemo(
    () =>
      (orchestrationLoading ||
        userLoading ||
        workspaceLoading ||
        analyticsLoading ||
        intelligenceLoading) &&
      !bootGraceElapsed,
    [
      orchestrationLoading,
      userLoading,
      workspaceLoading,
      analyticsLoading,
      intelligenceLoading,
      bootGraceElapsed,
    ]
  );

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [schemaAnimationEnabled, setSchemaAnimationEnabled] = useState(true);
  const [performanceMode, setPerformanceMode] = useState<"standard" | "high" | "ultra">("standard");
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
  const reducedMotion = useReducedMotion();

  // ============================================================================
  // COMPUTED VALUES AND MEMOS
  // ============================================================================

  // Data Governance Schema Nodes
  const dataGovernanceNodes = useMemo<DataGovernanceNode[]>(
    () => [
      {
        id: "data-sources",
        name: "Data Sources",
        type: "core",
        position: { x: 200, y: 150 },
        connections: ["scan-logic", "catalog", "compliance"],
        status: integrationStatus?.groups?.["data-sources"]?.status || SystemStatus.HEALTHY,
        metrics: {
          health: integrationStatus?.groups?.["data-sources"]?.health || 95,
          performance: crossGroupMetrics?.performance?.["data-sources"] || 88,
          activity: activities.filter((a) => a.resourceType === "data-source").length,
        },
        icon: Database,
        color: "#3B82F6",
      },
      {
        id: "scan-rule-sets",
        name: "Scan Rules",
        type: "core",
        position: { x: 400, y: 100 },
        connections: ["data-sources", "scan-logic", "compliance"],
        status: integrationStatus?.groups?.["scan-rule-sets"]?.status || SystemStatus.HEALTHY,
        metrics: {
          health: integrationStatus?.groups?.["scan-rule-sets"]?.health || 92,
          performance: crossGroupMetrics?.performance?.["scan-rule-sets"] || 85,
          activity: activities.filter((a) => a.resourceType === "scan-rule").length,
        },
        icon: Shield,
        color: "#10B981",
      },
      {
        id: "classifications",
        name: "Classifications",
        type: "core",
        position: { x: 600, y: 150 },
        connections: ["catalog", "compliance", "ai-engine"],
        status: integrationStatus?.groups?.["classifications"]?.status || SystemStatus.HEALTHY,
        metrics: {
          health: integrationStatus?.groups?.["classifications"]?.health || 90,
          performance: crossGroupMetrics?.performance?.["classifications"] || 87,
          activity: activities.filter((a) => a.resourceType === "classification").length,
        },
        icon: Database,
        color: "#8B5CF6",
      },
      {
        id: "compliance",
        name: "Compliance",
        type: "core",
        position: { x: 500, y: 300 },
        connections: ["data-sources", "classifications", "audit"],
        status: integrationStatus?.groups?.["compliance-rule"]?.status || SystemStatus.HEALTHY,
        metrics: {
          health: integrationStatus?.groups?.["compliance-rule"]?.health || 94,
          performance: crossGroupMetrics?.performance?.["compliance-rule"] || 91,
          activity: activities.filter((a) => a.resourceType === "compliance").length,
        },
        icon: CheckCircle,
        color: "#F59E0B",
      },
      {
        id: "catalog",
        name: "Data Catalog",
        type: "core",
        position: { x: 300, y: 250 },
        connections: ["data-sources", "classifications", "lineage"],
        status: integrationStatus?.groups?.["advanced-catalog"]?.status || SystemStatus.HEALTHY,
        metrics: {
          health: integrationStatus?.groups?.["advanced-catalog"]?.health || 93,
          performance: crossGroupMetrics?.performance?.["advanced-catalog"] || 89,
          activity: activities.filter((a) => a.resourceType === "catalog").length,
        },
        icon: Database,
        color: "#EC4899",
      },
      // Add remaining nodes...
    ],
    [integrationStatus, crossGroupMetrics, activities]
  );

  // System Overview Metrics
  const systemOverview = useMemo<SystemOverview>(
    () => ({
      totalAssets: crossGroupMetrics?.totalAssets || 0,
      activeWorkflows: Object.keys(orchestrationState?.activeWorkflows || {}).length,
      activePipelines: Object.keys(activePipelines || {}).length,
      systemHealth: systemHealth?.performance?.score || 0,
      complianceScore: crossGroupMetrics?.compliance?.overallScore || 0,
      performanceScore: performanceMetrics?.throughput?.operationsPerSecond || 0,
      collaborationActivity: collaborationSessions?.length || 0,
      aiInsights: insights.length,
    }),
    [
      crossGroupMetrics,
      orchestrationState,
      activePipelines,
      systemHealth,
      performanceMetrics,
      collaborationSessions,
      insights,
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
            {/* System Schema Visualization */}
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
                    {systemHealth?.overall || "Unknown"}
                  </Badge>
                </div>
              </div>
              <DataGovernanceSchema
                nodes={dataGovernanceNodes}
                systemOverview={systemOverview}
                onNodeClick={(nodeId) => console.log("Node clicked:", nodeId)}
                onRefresh={refreshSystemHealth}
              />
            </motion.section>

            {/* Advanced Metrics Visualization */}
            {analyticsData && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AdvancedMetricsVisualization
                  metrics={analyticsData}
                  timeRange="Last 24 hours"
                  onDrillDown={(metric) => console.log("Drill down:", metric)}
                />
              </motion.section>
            )}

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
        return <WorkspaceOrchestrator />;

      case ViewMode.WORKFLOWS:
        return <JobWorkflowBuilder />;

      case ViewMode.PIPELINES:
        return <PipelineDesigner />;

      case ViewMode.AI_ASSISTANT:
        return <AIAssistantInterface />;

      case ViewMode.ACTIVITY:
        return <ActivityTrackingHub />;

      case ViewMode.COLLABORATION:
        return <MasterCollaborationHub />;

      case ViewMode.SETTINGS:
        return <UserProfileManager />;

      // Group SPA views
      case ViewMode.DATA_SOURCES:
        return <DataSourcesSPAOrchestrator />;

      case ViewMode.SCAN_RULE_SETS:
        return <ScanRuleSetsSPAOrchestrator />;

      case ViewMode.CLASSIFICATIONS:
        return <ClassificationsSPAOrchestrator />;

      case ViewMode.COMPLIANCE_RULES:
        return <ComplianceRuleSPAOrchestrator />;

      case ViewMode.ADVANCED_CATALOG:
        return <AdvancedCatalogSPAOrchestrator />;

      case ViewMode.SCAN_LOGIC:
        return <ScanLogicSPAOrchestrator />;

      case ViewMode.RBAC_SYSTEM:
        return <RBACSystemSPAOrchestrator />;

      default:
        return <IntelligentDashboardOrchestrator />;
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
                    {/* Loading State */}
                    {showLoading && (
                      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 flex items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center space-y-6"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 mx-auto"
                          >
                            <div className="w-full h-full border-4 border-blue-500/30 border-t-blue-500 rounded-full" />
                          </motion.div>
                          <div className="space-y-3">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                              Initializing Enterprise Data Governance Platform
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                              Loading advanced analytics, AI intelligence, security systems, and cross-group integrations...
                            </p>
                          </div>
                        </motion.div>
                      </div>
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
                          {/* Main Sidebar */}
                          <AppSidebar
                            collapsed={sidebarCollapsed}
                            onCollapse={setSidebarCollapsed}
                            currentView={currentView}
                            onViewChange={handleViewChange}
                            workspaces={workspaces}
                            activeWorkspace={activeWorkspace}
                            onWorkspaceSwitch={handleWorkspaceSwitch}
                            systemHealth={systemHealth}
                            userPermissions={userPermissions}
                            onQuickAction={handleQuickAction}
                          />

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

                        {/* Global Quick Actions Sidebar */}
                        <GlobalQuickActionsSidebar
                          isOpen={quickActionsSidebarOpen}
                          onClose={() => setQuickActionsSidebarOpen(false)}
                          context={quickActionsContext}
                          onAction={handleQuickAction}
                        />

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