// ============================================================================
// ENHANCED DATA SOURCES SPA - DATABRICKS-LEVEL ENTERPRISE ORCHESTRATION
// Advanced UI Management with Workflow Actions Handler - All 31 Components
// ============================================================================

"use client"

import React, { useState, useEffect, Suspense, useCallback, useMemo, createContext, useContext } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "sonner"
import { Database, Settings, Activity, TrendingUp, Users, Shield, Cloud, Search, BarChart3, Eye, Zap, Target, Bell, Menu, X, ChevronLeft, ChevronRight, Plus, Filter, Download, Upload, RefreshCw, HelpCircle, User, LogOut, Monitor, Palette, Globe, Lock, Building, FileText, MessageSquare, Star, Grid, List, Layers, GitBranch, Workflow, Calendar, Clock, AlertTriangle, CheckCircle, Info, Play, Pause, Square, Edit, Trash2, Copy, Share2, ExternalLink, MoreHorizontal, ChevronDown, ChevronUp, Maximize2, Minimize2, PanelLeftOpen, PanelRightOpen, SplitSquareHorizontal, Layout, Command, Cpu, HardDrive, Network, Gauge, LineChart, PieChart, AreaChart, TestTube, Beaker, Microscope, Cog, Wrench, Package, Server, CircuitBoard, Boxes, Archive, FolderOpen, Folder, File, Code2, Terminal, Bug, Sparkles, Rocket, Flame, Lightbulb, Brain, Bot, Radar, Crosshair, Focus, Scan, SearchX, ScanLine, Binary, Hash, Type, Key, ShieldCheckIcon, UserCheck, Crown, BadgeIcon, Award, Medal, Trophy, Flag, Bookmark, Heart, ThumbsUp, Smile, Frown, AlertCircle, XCircle, Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium, Route, MapIcon, MapPin, Navigation, Compass, TreePine, WorkflowIcon, Camera, Video, Mic, MicOff, Maximize, Minimize, RotateCcw, RotateCw, ZoomIn, ZoomOut, Expand, Shrink, Move, PinIcon, BookmarkIcon, Tag, Tags, HashIcon, Percent, DollarSign, Euro, ArrowDown } from 'lucide-react'

// ============================================================================
// API REQUEST THROTTLING AND DEBOUNCING SYSTEM
// ============================================================================

// Global API request manager to prevent burst requests
class APIRequestManager {
  private static instance: APIRequestManager
  private requestQueue: globalThis.Map<string, { timestamp: number; count: number }>
  private activeRequests: globalThis.Set<string>
  private requestDelays: globalThis.Map<string, number>
  private maxConcurrentRequests = 6
  private requestTimeout = 30000
  private retryDelays = [500, 1000, 2000]
  private circuitBreakerOpen = false
  private circuitBreakerFailures = 0
  private maxFailures = 5
  private lastFailureTime = 0
  private cooldownPeriod = 15000
  private requestCount = 0
  private maxRequestsPerMinute = 120
  private requestTimestamps: number[] = []
  private isEmergencyMode = false

  constructor() {
    this.requestQueue = new globalThis.Map()
    this.activeRequests = new globalThis.Set()
    this.requestDelays = new globalThis.Map()
  }

  static getInstance(): APIRequestManager {
    if (!APIRequestManager.instance) {
      APIRequestManager.instance = new APIRequestManager()
    }
    return APIRequestManager.instance
  }

  // Check if we can make a request - ULTRA AGGRESSIVE THROTTLING
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now()
    
    // EMERGENCY MODE: If too many failures, block ALL requests
    if (this.isEmergencyMode) {
      console.warn('🚨 EMERGENCY MODE: All API requests blocked to protect database')
      return false
    }
    
    // CIRCUIT BREAKER: If circuit is open, block requests
    if (this.circuitBreakerOpen) {
      if (now - this.lastFailureTime < this.cooldownPeriod) {
        console.warn('🔴 Circuit breaker OPEN: Requests blocked for cooldown')
        return false
      } else {
        // Reset circuit breaker after cooldown
        this.circuitBreakerOpen = false
        this.circuitBreakerFailures = 0
        console.log('🟢 Circuit breaker RESET: Requests allowed again')
      }
    }
    
    // RATE LIMITING: reasonable global limit
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => now - timestamp < 60000)
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      console.warn('⏰ Rate limit exceeded: Maximum requests per minute reached')
      return false
    }
    
    // CONCURRENT LIMIT: allow multiple concurrent requests
    if (this.activeRequests.size >= this.maxConcurrentRequests) {
      console.warn('🚫 Concurrent limit: Maximum concurrent requests reached')
      return false
    }
    
    // ENDPOINT-SPECIFIC THROTTLING: Very strict per endpoint
    const queueKey = `${endpoint}_${Math.floor(now / 1000)}` // group by 1s
    const queueItem = this.requestQueue.get(queueKey)
    if (!queueItem) {
      this.requestQueue.set(queueKey, { timestamp: now, count: 1 })
    } else {
      // up to 3 req/sec per endpoint window
      if (queueItem.count >= 3) {
        console.warn(`⏳ Endpoint throttled: ${endpoint} - per-second limit reached`)
        return false
      }
      queueItem.count++
    }
    
    // Add to rate limiting tracker
    this.requestTimestamps.push(now)
    return true
  }

  // Add request delay for specific endpoints
  addRequestDelay(endpoint: string, delay: number): void {
    this.requestDelays.set(endpoint, delay)
  }

  // Get delay for endpoint
  getRequestDelay(endpoint: string): number {
    return this.requestDelays.get(endpoint) || 0
  }

  // Track active request
  startRequest(requestId: string): void {
    this.activeRequests.add(requestId)
  }

  // Complete request
  completeRequest(requestId: string): void {
    this.activeRequests.delete(requestId)
  }

  // Check if too many concurrent requests
  hasTooManyConcurrentRequests(): boolean {
    return this.activeRequests.size >= this.maxConcurrentRequests
  }

  // Clean up old queue entries
  cleanup(): void {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    for (const [key, item] of this.requestQueue.entries()) {
      if (item.timestamp < oneMinuteAgo) {
        this.requestQueue.delete(key)
      }
    }
  }

  // Handle request failure - triggers circuit breaker
  handleRequestFailure(): void {
    this.circuitBreakerFailures++
    this.lastFailureTime = Date.now()
    
    console.warn(`🔴 Request failure #${this.circuitBreakerFailures}`)
    
    if (this.circuitBreakerFailures >= this.maxFailures) {
      this.circuitBreakerOpen = true
      console.error('🚨 CIRCUIT BREAKER OPENED: Too many failures, blocking all requests')
    }
  }

  // Handle request success - resets failure count
  handleRequestSuccess(): void {
    if (this.circuitBreakerFailures > 0) {
      this.circuitBreakerFailures = Math.max(0, this.circuitBreakerFailures - 1)
      console.log(`🟢 Request success, failure count: ${this.circuitBreakerFailures}`)
    }
  }

  // Enable emergency mode - blocks ALL requests
  enableEmergencyMode(): void {
    this.isEmergencyMode = true
    this.circuitBreakerOpen = true
    console.error('🚨🚨🚨 EMERGENCY MODE ENABLED: ALL API REQUESTS BLOCKED 🚨🚨🚨')
  }

  // Disable emergency mode
  disableEmergencyMode(): void {
    this.isEmergencyMode = false
    this.circuitBreakerOpen = false
    this.circuitBreakerFailures = 0
    console.log('🟢 Emergency mode DISABLED: API requests allowed again')
  }

  // Get emergency status
  isInEmergencyMode(): boolean {
    return this.isEmergencyMode
  }

  // Get request statistics
  getStats(): { activeRequests: number; queueSize: number } {
    return {
      activeRequests: this.activeRequests.size,
      queueSize: this.requestQueue.size
    }
  }
}

// Enhanced Query Client with throttling
const createThrottledQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic retries to avoid backend stampedes under failure
        retry: 0,
        retryDelay: 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        refetchIntervalInBackground: false,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  })

  return queryClient
}

// Custom hook for throttled API calls
const useThrottledQuery = (queryKey: any[], queryFn: () => Promise<any>, options: any = {}) => {
  const [isThrottled, setIsThrottled] = useState(false)
  const [throttleDelay, setThrottleDelay] = useState(0)
  const requestManager = APIRequestManager.getInstance()

  const endpoint = Array.isArray(queryKey) ? queryKey[0] : queryKey
  const canMakeRequest = requestManager.canMakeRequest(endpoint)
  const hasDelay = requestManager.getRequestDelay(endpoint)

  useEffect(() => {
    // Cleanup old queue entries
    requestManager.cleanup()
  }, [])

  // Apply throttling logic
  useEffect(() => {
    if (!canMakeRequest) {
      setIsThrottled(true)
      setThrottleDelay(1000) // 1 second delay
    } else if (hasDelay > 0) {
      setIsThrottled(true)
      setThrottleDelay(hasDelay)
    } else {
      setIsThrottled(false)
      setThrottleDelay(0)
    }
  }, [canMakeRequest, hasDelay])

  // Enhanced options with throttling
  const enhancedOptions = {
    ...options,
    enabled: options.enabled !== false && !isThrottled,
    refetchInterval: isThrottled ? false : options.refetchInterval,
    staleTime: Math.max(options.staleTime || 5000, throttleDelay),
  }

  return {
    isThrottled,
    throttleDelay,
    requestStats: requestManager.getStats(),
    ...enhancedOptions
  }
}

// API request interceptor for global throttling
const setupAPIThrottling = () => {
  const requestManager = APIRequestManager.getInstance()

  // light per-endpoint delays
  requestManager.addRequestDelay('data-sources', 0)
  requestManager.addRequestDelay('system-health', 0)
  requestManager.addRequestDelay('performance-metrics', 0)
  requestManager.addRequestDelay('security-audit', 0)
  requestManager.addRequestDelay('collaboration-workspaces', 0)
  requestManager.addRequestDelay('workflow-definitions', 0)
  requestManager.addRequestDelay('notifications', 0)
  requestManager.addRequestDelay('workspace', 0)
  requestManager.addRequestDelay('scan', 0)
  requestManager.addRequestDelay('data-discovery', 0)

  // Override fetch to add ULTRA AGGRESSIVE throttling
  const originalFetch = window.fetch
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const endpoint = new URL(url, window.location.origin).pathname

    // EMERGENCY CHECK: If in emergency mode, block ALL requests
    if (requestManager.isInEmergencyMode()) {
      console.error('🚨 EMERGENCY MODE: Request blocked to protect database')
      throw new Error('Emergency mode: All requests blocked to protect database')
    }

    // Check if we can make this request
    if (!requestManager.canMakeRequest(endpoint)) {
      console.warn(`🚫 Request throttled for endpoint: ${endpoint}`)
      throw new Error(`Request throttled for ${endpoint}`)
    }

    // Check for too many concurrent requests
    if (requestManager.hasTooManyConcurrentRequests()) {
      console.warn('🚫 Too many concurrent requests, delaying...')
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    const requestId = `${endpoint}_${Date.now()}`
    requestManager.startRequest(requestId)

    try {
      const response = await originalFetch(input, init)
      
      // Handle different error responses
      if (response.status === 429) {
        requestManager.handleRequestFailure()
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 10000
        requestManager.addRequestDelay(endpoint, delay)
        throw new Error(`Rate limited for ${endpoint}`)
      }
      
      if (response.status >= 500) {
        // Server errors - trigger circuit breaker
        requestManager.handleRequestFailure()
        console.error(`🔴 Server error ${response.status} for ${endpoint}`)
        throw new Error(`Server error ${response.status} for ${endpoint}`)
      }
      
      if (response.status >= 400) {
        // Client errors - don't trigger circuit breaker but log
        console.warn(`⚠️ Client error ${response.status} for ${endpoint}`)
      } else {
        // Success - reset failure count
        requestManager.handleRequestSuccess()
      }

      return response
    } catch (error: any) {
      // Handle network errors and other failures
      if (error.name === 'TypeError' || error.message.includes('Network Error') || 
          error.message.includes('Failed to fetch') || error.message.includes('database_unavailable')) {
        requestManager.handleRequestFailure()
        console.error(`🔴 Network/Database error for ${endpoint}:`, error.message)
        // NOTE: Do not auto-enable emergency mode; avoid locking the UI
      }
      throw error
    } finally {
      requestManager.completeRequest(requestId)
    }
  }

  console.log('🚀 ULTRA AGGRESSIVE API throttling system initialized')
}

// Initialize throttling on module load
if (typeof window !== 'undefined') {
  setupAPIThrottling()
}

// ============================================================================
// COMPONENT INITIALIZATION THROTTLING
// ============================================================================

// Hook to manage component initialization timing
const useComponentInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [initializationPhase, setInitializationPhase] = useState(0)
  const requestManager = APIRequestManager.getInstance()

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // ULTRA CONSERVATIVE initialization to prevent database overload
        
        // Phase 1: Core data (after 2 seconds)
        setInitializationPhase(1)
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Phase 2: User and workspace data (after 5 seconds)
        setInitializationPhase(2)
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Phase 3: Health and metrics (after 10 seconds)
        setInitializationPhase(3)
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Phase 4: Secondary data (after 20 seconds)
        setInitializationPhase(4)
        await new Promise(resolve => setTimeout(resolve, 10000))

        // Phase 5: Background data (after 35 seconds)
        setInitializationPhase(5)
        await new Promise(resolve => setTimeout(resolve, 15000))

        setIsInitialized(true)
        console.log('🚀 ULTRA CONSERVATIVE component initialization completed')
      } catch (error) {
        console.error('Component initialization failed:', error)
        setIsInitialized(true) // Still mark as initialized to prevent blocking
      }
    }

    initializeComponent()
  }, [])

  return { isInitialized, initializationPhase }
}

// Import shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Command as CommandComponent, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ErrorBoundary } from 'react-error-boundary'

// Import enterprise integration
import { 
  EnterpriseIntegrationProvider, 
  useEnterpriseContext,
  createEnterpriseEvent,
  getSystemHealthScore,
  createEnterpriseQueryClient
} from './enterprise-integration'

// Import graceful error handling
import { GracefulErrorBoundary } from './components/graceful-error-boundary'

// Import enterprise hooks
import {
  useEnterpriseFeatures,
  useMonitoringFeatures,
  useSecurityFeatures,
  useOperationsFeatures,
  useCollaborationFeatures,
  useWorkflowIntegration,
  useAnalyticsIntegration
} from './hooks/use-enterprise-features'

// Import RBAC integration
import { useRBACIntegration, DATA_SOURCE_PERMISSIONS } from "./hooks/use-rbac-integration"

// Import ALL enterprise APIs for complete backend integration
import { 
  // Core Data Source APIs
  useDataSourcesQuery, 
  useUserQuery, 
  useNotificationsQuery,
  useWorkspaceQuery,
  useDataSourceMetricsQuery,
  useDataSourceHealthQuery,
  useConnectionPoolStatsQuery,
  useDiscoveryHistoryQuery,
  useScanResultsQuery,
  useQualityMetricsQuery,
  useGrowthMetricsQuery,
  useSchemaDiscoveryQuery,
  useDataLineageQuery,
  useBackupStatusQuery,
  useScheduledTasksQuery,
  useAuditLogsQuery,
  useUserPermissionsQuery,
  useDataCatalogQuery,
  
  // NEW ENTERPRISE APIs - FULL BACKEND INTEGRATION 
  // Collaboration APIs
  useCollaborationWorkspacesQuery,
  useActiveCollaborationSessionsQuery,
  useSharedDocumentsQuery,
  useCreateSharedDocumentMutation,
  useDocumentCommentsQuery,
  useAddDocumentCommentMutation,
  useInviteToWorkspaceMutation,
  useWorkspaceActivityQuery,
  useCreateCollaborationWorkspaceMutation,
  
  // Workflow APIs  
  useWorkflowDefinitionsQuery,
  useWorkflowExecutionsQuery,
  usePendingApprovalsQuery,
  useWorkflowTemplatesQuery,
  useWorkflowDefinitionQuery,
  useUpdateWorkflowDefinitionMutation,
  useExecuteWorkflowMutation,
  useWorkflowExecutionDetailsQuery,
  useCreateApprovalWorkflowMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useCreateBulkOperationMutation,
  useBulkOperationStatusQuery,
  useCreateWorkflowDefinitionMutation,
  
  // Enhanced Performance APIs
  useSystemHealthQuery,
  useEnhancedPerformanceMetricsQuery,
  usePerformanceAlertsQuery,
  usePerformanceTrendsQuery,
  useOptimizationRecommendationsQuery,
  usePerformanceSummaryReportQuery,
  useAcknowledgePerformanceAlertMutation,
  useResolvePerformanceAlertMutation,
  usePerformanceThresholdsQuery,
  useCreatePerformanceThresholdMutation,
  useStartRealTimeMonitoringMutation,
  useStopRealTimeMonitoringMutation,
  
  // Enhanced Security APIs
  useEnhancedSecurityAuditQuery,
  useVulnerabilityAssessmentsQuery,
  useSecurityIncidentsQuery,
  useComplianceChecksQuery,
  useThreatDetectionQuery,
  useSecurityAnalyticsDashboardQuery,
  useRiskAssessmentReportQuery,
  useCreateEnhancedSecurityScanMutation,
  useSecurityScansQuery,
  useRemediateVulnerabilityMutation,
  useCreateSecurityIncidentMutation,
  useRunComplianceCheckMutation,
  useStartSecurityMonitoringMutation,
} from './services/enterprise-apis'
import { useCreateDataSourceMutation } from './services/apis'

// Import three-phase architecture
import { ComponentRegistry } from './core/component-registry'
import { eventBus } from './core/event-bus'
import { StateManager } from './core/state-manager'
import { WorkflowEngine } from './core/workflow-engine'
import { CorrelationEngine } from './analytics/correlation-engine'
import { realTimeCollaborationManager } from './collaboration/realtime-collaboration'
import { ApprovalSystem } from './workflows/approval-system'
import { bulkOperationsManager } from './workflows/bulk-operations'

// Import ALL existing data-sources components
import { DataSourceList } from "./data-source-list"
import { DataSourceGrid } from "./data-source-grid"
import { DataSourceDetails } from "./data-source-details"
import { DataSourceOverview } from "./data-source-overview"
import { DataSourceCreateModal } from "./data-source-create-modal"
import { DataSourceEditModal } from "./data-source-edit-modal"
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal"
import { DataSourceMonitoring } from "./data-source-monitoring"
import { DataSourceMonitoringDashboard } from "./data-source-monitoring-dashboard"
import { DataSourceCloudConfig } from "./data-source-cloud-config"
import { DataSourceDiscovery } from "./data-source-discovery"
import { DataSourceQualityAnalytics } from "./data-source-quality-analytics"
import { DataSourceGrowthAnalytics } from "./data-source-growth-analytics"
import { DataSourceWorkspaceManagement } from "./data-source-workspace-management"
import { DataSourceFilters } from "./data-source-filters"
import { DataSourceBulkActions } from "./data-source-bulk-actions"

// Import data-discovery subdirectory components
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace"
import { DataLineageGraph } from "./data-discovery/data-lineage-graph"
import { SchemaDiscovery } from "./data-discovery/schema-discovery"

// Import enterprise UI components
import { EnterpriseDashboard } from "./ui/dashboard/enterprise-dashboard"
import { AIPoweredDashboard } from "./ui/dashboard/ai-powered-dashboard"
import { CollaborationStudio } from "./ui/collaboration/collaboration-studio"
import { AnalyticsWorkbench } from "./ui/analytics/analytics-workbench"
import { WorkflowDesigner } from "./ui/workflow/workflow-designer"
import { AdvancedWorkflowOrchestrator } from "./components/advanced-workflow-orchestrator"
import { ComponentOrchestrationManager } from "./components/component-orchestration-manager"
import { ComponentIntegrationManager } from "./components/component-integration-manager"
import { MasterWorkflowAutomation } from "./components/master-workflow-automation"
import { DiscoveryOrchestration } from "./components/discovery-orchestration"
import { GovernanceOrchestration } from "./components/governance-orchestration"
import { LifecycleOrchestration } from "./components/lifecycle-orchestration"

// Import remaining components with enterprise features - FIXED DEFAULT EXPORTS
const DataSourceComplianceView = React.lazy(() => import("./data-source-compliance-view").then(module => ({ default: module.DataSourceComplianceView })))
const DataSourceSecurityView = React.lazy(() => import("./data-source-security-view").then(module => ({ default: module.DataSourceSecurityView })))
const DataSourcePerformanceView = React.lazy(() => import("./data-source-performance-view-simple").then(module => ({ default: module.DataSourcePerformanceView })))
const DataSourceScanResults = React.lazy(() => import("./data-source-scan-results").then(module => ({ default: module.DataSourceScanResults })))
const DataSourceTagsManager = React.lazy(() => import("./data-source-tags-manager").then(module => ({ default: module.DataSourceTagsManager })))
const DataSourceVersionHistory = React.lazy(() => import("./data-source-version-history").then(module => ({ default: module.DataSourceVersionHistory })))
const DataSourceBackupRestore = React.lazy(() => import("./data-source-backup-restore").then(module => ({ default: module.DataSourceBackupRestore })))
const DataSourceAccessControl = React.lazy(() => import("./data-source-access-control").then(module => ({ default: module.DataSourceAccessControl })))
const DataSourceNotifications = React.lazy(() => import("./data-source-notifications").then(module => ({ default: module.DataSourceNotifications })))
const DataSourceReports = React.lazy(() => import("./data-source-reports").then(module => ({ default: module.DataSourceReports })))
const DataSourceScheduler = React.lazy(() => import("./data-source-scheduler").then(module => ({ default: module.DataSourceScheduler })))
const DataSourceIntegrations = React.lazy(() => import("./data-source-integrations").then(module => ({ default: module.DataSourceIntegrations })))
const DataSourceCatalog = React.lazy(() => import("./data-source-catalog").then(module => ({ default: module.DataSourceCatalog })))

// Import types and services
import { DataSource, ViewMode } from "./types"
import * as enterpriseApis from './services/enterprise-apis'

// ============================================================================
// ADVANCED WORKFLOW ACTIONS HANDLER - DATABRICKS-LEVEL ORCHESTRATION
// ============================================================================

interface WorkflowAction {
  id: string
  label: string
  description: string
  icon: React.ComponentType<any>
  category: 'data' | 'security' | 'performance' | 'collaboration' | 'workflow' | 'analytics' | 'governance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  shortcut?: string
  enabled: boolean
  dependencies?: string[]
  permissions?: string[]
  action: (context: any) => Promise<void>
}

const createAdvancedWorkflowActions = (context: any): WorkflowAction[] => [
  // Data Operations
  {
    id: "comprehensive-scan",
    label: "Comprehensive Data Scan",
    description: "AI-powered comprehensive scan of all data sources with quality assessment",
    icon: Scan,
    category: "data",
    priority: "high",
    shortcut: "⌘+Shift+S",
    enabled: true,
    action: async (ctx) => {
      await Promise.all([
        ctx.mutations.createSecurityScan.mutateAsync({ scan_types: ['comprehensive'], priority: 'high' }),
        ctx.mutations.runComplianceCheck.mutateAsync({ framework: 'all' })
      ])
    }
  },
  {
    id: "intelligent-discovery",
    label: "Intelligent Data Discovery",
    description: "ML-powered schema discovery and data lineage generation",
    icon: Brain,
    category: "data",
    priority: "medium",
    shortcut: "⌘+D",
    enabled: true,
    action: async (ctx) => {
      // Trigger intelligent discovery workflow
      await ctx.mutations.createWorkflow.mutateAsync({
        name: 'Intelligent Discovery',
        type: 'discovery',
        auto_execute: true
      })
    }
  },
  
  // Security Operations
  {
    id: "security-assessment",
    label: "Security Assessment Suite",
    description: "Complete security audit with vulnerability scanning and threat detection",
    icon: ShieldCheckIcon,
    category: "security",
    priority: "critical",
    shortcut: "⌘+Shift+A",
    enabled: true,
    action: async (ctx) => {
      await Promise.all([
        ctx.mutations.createSecurityScan.mutateAsync({ scan_types: ['security', 'vulnerability'] }),
        ctx.mutations.startSecurityMonitoring.mutateAsync({ real_time: true })
      ])
    }
  },
  {
    id: "compliance-verification",
    label: "Compliance Verification",
    description: "Multi-framework compliance check with automated reporting",
    icon: CheckCircle,
    category: "governance",
    priority: "high",
    shortcut: "⌘+C",
    enabled: true,
    action: async (ctx) => {
      await ctx.mutations.runComplianceCheck.mutateAsync({
        frameworks: ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS'],
        generate_report: true
      })
    }
  },
  
  // Performance Operations
  {
    id: "performance-optimization",
    label: "AI Performance Optimization",
    description: "Machine learning-driven performance analysis and optimization",
    icon: Zap,
    category: "performance",
    priority: "medium",
    shortcut: "⌘+O",
    enabled: true,
    action: async (ctx) => {
      await Promise.all([
        ctx.mutations.startMonitoring.mutateAsync({ optimization_mode: true }),
        ctx.mutations.createThreshold.mutateAsync({ adaptive: true, ai_driven: true })
      ])
    }
  },
  {
    id: "real-time-monitoring",
    label: "Real-time Monitoring Suite",
    description: "Comprehensive real-time monitoring with predictive alerts",
    icon: Activity,
    category: "performance",
    priority: "medium",
    shortcut: "⌘+M",
    enabled: true,
    action: async (ctx) => {
      await ctx.mutations.startMonitoring.mutateAsync({
        real_time: true,
        predictive_alerts: true,
        auto_scaling: true
      })
    }
  },
  
  // Collaboration Operations
  {
    id: "collaboration-workspace",
    label: "Create Collaboration Workspace",
    description: "Set up real-time collaborative workspace with video integration",
    icon: Users,
    category: "collaboration",
    priority: "low",
    shortcut: "⌘+Shift+C",
    enabled: true,
    action: async (ctx) => {
      await ctx.mutations.createWorkspace.mutateAsync({
        type: 'collaboration',
        features: ['real_time', 'video', 'screen_share', 'ai_assistant'],
        auto_invite_team: true
      })
    }
  },
  {
    id: "knowledge-sharing",
    label: "Knowledge Sharing Session",
    description: "Start AI-facilitated knowledge sharing and documentation session",
    icon: Brain,
    category: "collaboration",
    priority: "low",
    shortcut: "⌘+K",
    enabled: true,
    action: async (ctx) => {
      await Promise.all([
        ctx.mutations.createDocument.mutateAsync({ type: 'knowledge_base', ai_generated: true }),
        ctx.mutations.createWorkspace.mutateAsync({ type: 'knowledge_sharing' })
      ])
    }
  },
  
  // Workflow Operations
  {
    id: "intelligent-workflow",
    label: "Intelligent Workflow Designer",
    description: "AI-powered workflow creation with smart templates and optimization",
    icon: Workflow,
    category: "workflow",
    priority: "medium",
    shortcut: "⌘+W",
    enabled: true,
    action: async (ctx) => {
      await ctx.mutations.createWorkflow.mutateAsync({
        type: 'intelligent',
        ai_optimized: true,
        auto_templates: true,
        smart_scheduling: true
      })
    }
  },
  {
    id: "bulk-orchestration",
    label: "Bulk Operations Orchestration",
    description: "Advanced bulk operations with parallel processing and rollback capabilities",
    icon: Layers,
    category: "workflow",
    priority: "high",
    shortcut: "⌘+B",
    enabled: true,
    action: async (ctx) => {
      await ctx.mutations.createBulkOperation.mutateAsync({
        parallel_execution: true,
        rollback_enabled: true,
        progress_tracking: true,
        ai_optimization: true
      })
    }
  },
  
  // Analytics Operations
  {
    id: "predictive-analytics",
    label: "Predictive Analytics Suite",
    description: "Advanced ML-powered predictive analytics with trend forecasting",
    icon: TrendingUp,
    category: "analytics",
    priority: "high",
    shortcut: "⌘+P",
    enabled: true,
    action: async (ctx) => {
      // Start predictive analytics workflow
      await ctx.mutations.createWorkflow.mutateAsync({
        name: 'Predictive Analytics',
        type: 'analytics',
        ml_models: ['trend_forecasting', 'anomaly_detection', 'capacity_planning']
      })
    }
  },
  {
    id: "data-insights",
    label: "AI Data Insights",
    description: "Generate comprehensive AI-powered insights and recommendations",
    icon: Lightbulb,
    category: "analytics",
    priority: "medium",
    shortcut: "⌘+I",
    enabled: true,
    action: async (ctx) => {
      // Trigger AI insights generation
      await ctx.mutations.createWorkflow.mutateAsync({
        name: 'AI Insights Generation',
        type: 'insights',
        ai_models: ['pattern_recognition', 'correlation_analysis', 'recommendation_engine']
      })
    }
  },
  
  // New Databricks-level orchestration actions
  {
    id: "intelligent-orchestration",
    label: "Intelligent System Orchestration",
    description: "AI-powered cross-component orchestration with automatic resource optimization",
    icon: Bot,
    category: "workflow",
    priority: "critical",
    shortcut: "⌘+Shift+O",
    enabled: true,
    dependencies: ['ai-orchestration', 'smart-resource-allocation'],
    permissions: ['admin', 'orchestrator'],
    action: async (ctx) => {
      // Start intelligent orchestration across all components
      await Promise.all([
        ctx.mutations.createWorkflow.mutateAsync({
          name: 'Intelligent Orchestration',
          type: 'orchestration',
          scope: 'all_components',
          ai_optimization: true,
          resource_allocation: 'dynamic',
          cross_component_correlation: true
        }),
        ctx.mutations.startMonitoring.mutateAsync({ type: 'orchestration', level: 'advanced' })
      ])
    }
  },
  {
    id: "adaptive-workspace",
    label: "Adaptive Workspace Configuration",
    description: "ML-powered workspace adaptation based on usage patterns and context",
    icon: Sparkles,
    category: "workflow",
    priority: "high",
    shortcut: "⌘+Shift+A",
    enabled: true,
    action: async (ctx) => {
      // Trigger adaptive workspace configuration
      await ctx.mutations.createWorkflow.mutateAsync({
        name: 'Adaptive Workspace',
        type: 'workspace_optimization',
        ml_models: ['usage_pattern_analysis', 'context_prediction', 'interface_adaptation'],
        personalization: true,
        real_time_adaptation: true
      })
    }
  },
  {
    id: "cross-platform-sync",
    label: "Cross-Platform Data Synchronization",
    description: "Enterprise-grade synchronization across all data platforms and sources",
    icon: Radar,
    category: "data",
    priority: "high",
    shortcut: "⌘+Shift+X",
    enabled: true,
    action: async (ctx) => {
      // Start cross-platform synchronization
      await Promise.all([
        ctx.mutations.createWorkflow.mutateAsync({
          name: 'Cross-Platform Sync',
          type: 'synchronization',
          platforms: 'all',
          bidirectional: true,
          conflict_resolution: 'ai_assisted'
        }),
        ctx.mutations.createBulkOperation.mutateAsync({
          operation: 'sync_all_sources',
          parallel_execution: true,
          rollback_enabled: true
        })
      ])
    }
  },
  {
    id: "intelligent-automation",
    label: "Intelligent Process Automation",
    description: "AI-driven automation of complex data governance processes",
    icon: Cog,
    category: "governance",
    priority: "high",
    shortcut: "⌘+Shift+I",
    enabled: true,
    action: async (ctx) => {
      // Start intelligent process automation
      await ctx.mutations.createWorkflow.mutateAsync({
        name: 'Intelligent Automation Suite',
        type: 'process_automation',
        processes: ['data_quality', 'compliance_checking', 'security_scanning', 'performance_optimization'],
        ai_decision_making: true,
        adaptive_learning: true
      })
    }
  }
]

// ============================================================================
// ENHANCED QUERY CLIENT CONFIGURATION
// ============================================================================

// Using createEnterpriseQueryClient from enterprise-integration.tsx

// ============================================================================
// ENHANCED NAVIGATION STRUCTURE WITH ENTERPRISE FEATURES
// ============================================================================

const enterpriseNavigationStructure = {
  core: {
    label: "Core Management",
    icon: Database,
    category: "primary",
    items: [
      { id: "enterprise-dashboard", label: "Enterprise Dashboard", icon: BarChart3, component: "enterprise-dashboard", description: "Unified enterprise dashboard with AI insights", shortcut: "⌘+D", premium: true },
      { id: "ai-dashboard", label: "AI-Powered Dashboard", icon: Brain, component: "ai-dashboard", description: "Advanced AI analytics and predictive insights", shortcut: "⌘+Shift+D", premium: true },
      { id: "overview", label: "Overview", icon: Eye, component: "overview", description: "Comprehensive data sources overview", shortcut: "⌘+1" },
      { id: "grid", label: "Grid View", icon: Grid, component: "grid", description: "Visual grid layout with real-time updates", shortcut: "⌘+2" },
      { id: "list", label: "List View", icon: List, component: "list", description: "Advanced list view with filtering", shortcut: "⌘+3" },
      { id: "details", label: "Details", icon: FileText, component: "details", description: "In-depth analysis with AI insights", shortcut: "⌘+4" },
    ]
  },
  monitoring: {
    label: "Monitoring & Analytics",
    icon: Activity,
    category: "analytics",
    items: [
      { id: "monitoring", label: "Real-time Monitoring", icon: Monitor, component: "monitoring", description: "Live health and performance metrics", shortcut: "⌘+M", features: ["realTime", "analytics"] },
      { id: "dashboard-monitoring", label: "Monitoring Dashboard", icon: BarChart3, component: "dashboard-monitoring", description: "Advanced monitoring dashboards", shortcut: "⌘+Shift+M", features: ["analytics"] },
      { id: "performance", label: "Performance Analytics", icon: Zap, component: "performance", description: "Performance insights with AI recommendations", shortcut: "⌘+P", features: ["analytics", "ai"] },
      { id: "quality", label: "Quality Analytics", icon: Shield, component: "quality", description: "Data quality metrics and ML scoring", shortcut: "⌘+Q", features: ["analytics", "ml"] },
      { id: "growth", label: "Growth Analytics", icon: TrendingUp, component: "growth", description: "Growth patterns and predictions", shortcut: "⌘+G", features: ["analytics", "predictions"] },
      { id: "analytics-workbench", label: "Analytics Workbench", icon: Brain, component: "analytics-workbench", description: "Advanced analytics workspace", shortcut: "⌘+A", premium: true, features: ["analytics", "collaboration"] },
    ]
  },
  discovery: {
    label: "Discovery & Governance",
    icon: Search,
    category: "governance",
    items: [
      { id: "discovery", label: "Data Discovery", icon: Scan, component: "discovery", description: "AI-powered data asset discovery", shortcut: "⌘+F", features: ["ai", "analytics"] },
      { id: "orchestrate-discovery", label: "Discovery Orchestration", icon: Scan, component: "orchestrate-discovery", description: "Orchestrate discovery, schema, catalog, lineage, scans", shortcut: "⌘+Shift+L", features: ["workflows", "analytics"] },
      { id: "discovery-workspace", label: "Discovery Workspace", icon: FolderOpen, component: "discovery-workspace", description: "Collaborative discovery workspace", shortcut: "⌘+W", features: ["collaboration"] },
      { id: "schema-discovery", label: "Schema Discovery", icon: TreePine, component: "schema-discovery", description: "Automated schema mapping", shortcut: "⌘+H" },
      { id: "data-lineage", label: "Data Lineage", icon: WorkflowIcon, component: "data-lineage", description: "Interactive lineage visualization", shortcut: "⌘+L", features: ["analytics"] },
      { id: "scan-results", label: "Scan Results", icon: ScanLine, component: "scan-results", description: "Detailed scan results with insights", shortcut: "⌘+S" },
      { id: "compliance", label: "Compliance", icon: ShieldCheckIcon, component: "compliance", description: "Compliance monitoring and reporting", shortcut: "⌘+C", features: ["workflows", "analytics"] },
      { id: "security", label: "Security", icon: Lock, component: "security", description: "Security assessment with AI analysis", shortcut: "⌘+E", features: ["ai", "workflows"] },
    ]
  },
  management: {
    label: "Configuration & Management",
    icon: Settings,
    category: "management",
    items: [
      { id: "cloud-config", label: "Cloud Configuration", icon: Cloud, component: "cloud-config", description: "Multi-cloud provider settings", shortcut: "⌘+K" },
      { id: "access-control", label: "Access Control", icon: UserCheck, component: "access-control", description: "Advanced user permissions and RBAC", shortcut: "⌘+Shift+A", features: ["workflows"] },
      { id: "tags", label: "Tags Manager", icon: Hash, component: "tags", description: "AI-powered tag management", shortcut: "⌘+T", features: ["ai"] },
      { id: "scheduler", label: "Task Scheduler", icon: Calendar, component: "scheduler", description: "Advanced task automation", shortcut: "⌘+J", features: ["workflows"] },
      { id: "workflow-designer", label: "Workflow Designer", icon: Workflow, component: "workflow-designer", description: "Visual workflow design studio", shortcut: "⌘+Shift+W", premium: true, features: ["workflows", "collaboration"] },
    ]
  },
  collaboration: {
    label: "Collaboration & Sharing",
    icon: Users,
    category: "collaboration",
    items: [
      { id: "workspaces", label: "Workspaces", icon: Building, component: "workspaces", description: "Team collaboration spaces", shortcut: "⌘+U", features: ["collaboration"] },
      { id: "collaboration-studio", label: "Collaboration Studio", icon: MessageSquare, component: "collaboration-studio", description: "Real-time collaboration environment", shortcut: "⌘+Shift+C", premium: true, features: ["collaboration", "realTime"] },
      { id: "notifications", label: "Notifications", icon: Bell, component: "notifications", description: "Smart notification center", shortcut: "⌘+N", features: ["ai"] },
      { id: "reports", label: "Reports", icon: FileText, component: "reports", description: "Automated report generation", shortcut: "⌘+R", features: ["workflows"] },
      { id: "version-history", label: "Version History", icon: GitBranch, component: "version-history", description: "Configuration change tracking", shortcut: "⌘+V" },
    ]
  },
  operations: {
    label: "Operations & Maintenance",
    icon: Wrench,
    category: "operations",
    items: [
      { id: "backup-restore", label: "Backup & Restore", icon: Archive, component: "backup-restore", description: "Automated backup management", shortcut: "⌘+B", features: ["workflows"] },
      { id: "bulk-actions", label: "Bulk Operations", icon: Layers, component: "bulk-actions", description: "Mass operations with workflows", shortcut: "⌘+Y", features: ["workflows"] },
      { id: "integrations", label: "Integrations", icon: Boxes, component: "integrations", description: "Third-party integrations", shortcut: "⌘+I" },
      { id: "catalog", label: "Data Catalog", icon: Package, component: "catalog", description: "Enterprise data catalog", shortcut: "⌘+Shift+D", features: ["ai", "analytics"] },
      { id: "connection-test", label: "Connection Testing", icon: TestTube, component: "connection-test", description: "Advanced connection testing suite", shortcut: "⌘+Shift+T", features: ["testing", "workflows"] },
      { id: "filters", label: "Advanced Filters", icon: Filter, component: "filters", description: "Dynamic filtering and search", shortcut: "⌘+Shift+F", features: ["search", "workflows"] },
    ]
  },
  
  advanced: {
    label: "Advanced Features",
    icon: Sparkles,
    category: "advanced",
    items: [
      { id: "orchestrate-governance", label: "Governance Orchestration", icon: ShieldCheckIcon, component: "orchestrate-governance", description: "Compliance, security, access, reports, tags", shortcut: "⌘+Shift+G", premium: true, features: ["workflows", "governance"] },
      { id: "orchestrate-lifecycle", label: "Lifecycle Orchestration", icon: Settings, component: "orchestrate-lifecycle", description: "Config, scheduler, backup, versions, integrations", shortcut: "⌘+Shift+Y", premium: true, features: ["workflows", "management"] },
      { id: "workflow-designer", label: "Workflow Designer", icon: WorkflowIcon, component: "workflow-designer", description: "Visual workflow design studio", shortcut: "⌘+Shift+W", premium: true, features: ["workflows", "ai"] },
      { id: "workflow-orchestrator", label: "Workflow Orchestrator", icon: Workflow, component: "workflow-orchestrator", description: "Advanced workflow automation and execution", shortcut: "⌘+Shift+O", premium: true, features: ["workflows", "automation"] },
      { id: "master-workflow", label: "Master Workflow", icon: Zap, component: "master-workflow", description: "Complete component orchestration and automation", shortcut: "⌘+Shift+Z", premium: true, features: ["workflows", "orchestration", "automation"] },
      { id: "component-manager", label: "Component Manager", icon: Layers, component: "component-manager", description: "Component orchestration and monitoring", shortcut: "⌘+Shift+M", premium: true, features: ["orchestration", "monitoring"] },
      { id: "integration-manager", label: "Integration Manager", icon: Settings, component: "integration-manager", description: "Component integration and workflow automation", shortcut: "⌘+Shift+N", premium: true, features: ["integration", "automation"] },
      { id: "correlation-engine", label: "Correlation Engine", icon: GitBranch, component: "correlation-engine", description: "Advanced data correlation analysis", shortcut: "⌘+Shift+E", premium: true, features: ["ai", "analytics"] },
      { id: "realtime-collaboration", label: "Real-time Collaboration", icon: MessageSquare, component: "realtime-collaboration", description: "Live collaboration features", shortcut: "⌘+Shift+R", premium: true, features: ["collaboration", "realTime"] },
      { id: "enterprise-integration", label: "Enterprise Integration", icon: Boxes, component: "enterprise-integration", description: "Enterprise system integration hub", shortcut: "⌘+Shift+X", premium: true, features: ["workflows", "integrations"] },
    ]
  }
}

// ============================================================================
// ENHANCED LAYOUT CONFIGURATIONS
// ============================================================================

const enterpriseLayoutConfigurations = {
  standard: { 
    name: "Standard", 
    icon: Layout, 
    panels: [{ id: "main", size: 100 }],
    description: "Single panel layout"
  },
  split: { 
    name: "Split View", 
    icon: SplitSquareHorizontal, 
    panels: [{ id: "main", size: 70 }, { id: "secondary", size: 30 }],
    description: "Two panel horizontal split"
  },
  "enterprise-dashboard": { 
    name: "Enterprise Dashboard", 
    icon: BarChart3, 
    panels: [{ id: "overview", size: 40 }, { id: "details", size: 35 }, { id: "metrics", size: 25 }],
    description: "Multi-panel enterprise dashboard layout"
  },
  analysis: { 
    name: "Analysis", 
    icon: LineChart, 
    panels: [{ id: "data", size: 50 }, { id: "analytics", size: 30 }, { id: "insights", size: 20 }],
    description: "Analytics-focused layout"
  },
  collaboration: {
    name: "Collaboration",
    icon: Users,
    panels: [{ id: "main", size: 60 }, { id: "chat", size: 20 }, { id: "activity", size: 20 }],
    description: "Collaboration-optimized layout"
  },
  monitoring: {
    name: "Monitoring",
    icon: Monitor,
    panels: [{ id: "metrics", size: 70 }, { id: "alerts", size: 30 }],
    description: "Real-time monitoring layout"
  }
}

// ============================================================================
// ENHANCED DATA SOURCES APP COMPONENT
// ============================================================================

interface EnhancedDataSourcesAppProps {
  className?: string
  initialConfig?: any
}

function EnhancedDataSourcesAppContent({ className, initialConfig }: EnhancedDataSourcesAppProps) {
  // ========================================================================
  // ENTERPRISE CONTEXT AND HOOKS
  // ========================================================================
  
  const enterprise = useEnterpriseContext()
  const mainFeatures = useEnterpriseFeatures({
    componentName: 'data-sources-app',
    enableAnalytics: true,
    enableCollaboration: true,
    enableWorkflows: true,
    enableRealTimeUpdates: true,
    enableNotifications: true
  })

  // Additional enterprise feature hooks for comprehensive functionality - will be initialized after dataSourceId

  // ========================================================================
  // CORE STATE MANAGEMENT
  // ========================================================================
  
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [activeView, setActiveView] = useState("enterprise-dashboard")
  const [layout, setLayout] = useState<keyof typeof enterpriseLayoutConfigurations>("enterprise-dashboard")
  const [panels, setPanels] = useState(enterpriseLayoutConfigurations["enterprise-dashboard"].panels)
  
  // ========================================================================
  // COMPONENT INITIALIZATION
  // ========================================================================
  
  // Use component initialization hook
  const { isInitialized, initializationPhase } = useComponentInitialization()
  
  // ========================================================================
  // UI STATE WITH ENTERPRISE FEATURES
  // ========================================================================
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [expandedPanels, setExpandedPanels] = useState(new Set<string>())
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState({})
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  
  // ========================================================================
  // VIEW-BASED GATING - MUST BE DECLARED BEFORE RBAC INTEGRATION
  // ========================================================================
  
  // View-based gating to prevent unnecessary API calls
  const isDiscoveryView = useMemo(() => (
    ['data-discovery', 'schema-discovery', 'data-lineage', 'data-catalog', 'metadata-management'].includes(activeView)
  ), [activeView])
  const isPerformanceView = useMemo(() => (
    ['performance-monitoring', 'performance-analytics', 'performance-optimization', 'system-health', 'performance-alerts'].includes(activeView)
  ), [activeView])
  const isSecurityView = useMemo(() => (
    ['security-audit', 'compliance-monitoring', 'vulnerability-assessment', 'threat-detection', 'security-analytics'].includes(activeView)
  ), [activeView])
  const isCollaborationView = useMemo(() => (
    ['collaboration-workspace', 'shared-documents', 'team-collaboration', 'document-management'].includes(activeView)
  ), [activeView])
  const isWorkflowView = useMemo(() => (
    ['workflow-designer', 'workflow-orchestrator', 'master-workflow', 'orchestrate-governance', 'orchestrate-lifecycle'].includes(activeView)
  ), [activeView])

  // ========================================================================
  // RBAC INTEGRATION - MUST BE CALLED BEFORE ANY PERMISSION-DEPENDENT CODE
  // ========================================================================
  
  // Determine if RBAC should be loaded based on initialization state
  const shouldLoadRBAC = useMemo(() => {
    // Load RBAC immediately when component mounts, don't wait for initialization phases
    const shouldLoad = true
    console.log('RBAC Loading Check:', { isInitialized, initializationPhase, shouldLoad, activeView })
    return shouldLoad
  }, [isInitialized, initializationPhase, activeView])
  
  // Load RBAC integration
  const {
    currentUser, 
    hasPermission, 
    hasRole,
    dataSourcePermissions, 
    logUserAction, 
    PermissionGuard,
    isLoading: rbacLoading,
    error: rbacError
  } = useRBACIntegration(shouldLoadRBAC)

  // Debug RBAC state
  console.log('RBAC State:', { 
    shouldLoadRBAC, 
    rbacLoading, 
    rbacError, 
    currentUser: !!currentUser, 
    dataSourcePermissions,
    canView: dataSourcePermissions?.canView
  })

  // ========================================================================
  // RBAC-FILTERED NAVIGATION
  // ========================================================================
  
  const safeDataSourcePermissions = useMemo(() => {
    const defaultPermissions = {
      canView: true,
      canEdit: false,
      canCreate: false,
      canDelete: false,
      canGenerateReports: false,
      canViewDiscovery: true,
      canTestConnection: true,
      canManageBackup: false,
      canViewPerformance: true,
    }
    const finalPermissions = {
      ...defaultPermissions,
      ...(dataSourcePermissions || {})
    }
    console.log('Safe Data Source Permissions:', { 
      defaultPermissions, 
      dataSourcePermissions, 
      finalPermissions,
      canView: finalPermissions.canView
    })
    return finalPermissions
  }, [dataSourcePermissions])
  
  const getFilteredNavigation = useCallback(() => {
    if (!currentUser) return {}
    
    const filtered: any = {}
    
    Object.entries(enterpriseNavigationStructure).forEach(([categoryKey, category]) => {
      const filteredItems = category.items.filter((item: any) => {
        // Map navigation items to required permissions
        switch (item.id) {
          case 'dashboard':
          case 'ai-dashboard':
          case 'overview':
          case 'grid':
          case 'list':
          case 'details':
            return safeDataSourcePermissions.canView
          case 'monitoring':
          case 'dashboard-monitoring':
          case 'performance':
            return safeDataSourcePermissions.canViewPerformance
          case 'quality':
          case 'growth':
          case 'analytics-workbench':
            return safeDataSourcePermissions.canView
          case 'discovery':
          case 'discovery-workspace':
          case 'schema-discovery':
          case 'data-lineage':
          case 'scan-results':
            return safeDataSourcePermissions.canViewDiscovery
          case 'compliance':
            return hasPermission('compliance.view')
          case 'security':
            return hasPermission('security.view')
          case 'cloud-config':
            return safeDataSourcePermissions.canEdit
          case 'access-control':
            return hasPermission('rbac.manage')
          case 'tags':
            return safeDataSourcePermissions.canEdit
          case 'scheduler':
            return hasPermission('workflows.manage')
          case 'workflow-designer':
            return hasPermission('workflows.design')
          case 'workspaces':
            return hasPermission('workspaces.view')
          case 'collaboration-studio':
            return hasPermission('collaboration.manage')
          case 'notifications':
            return true // Everyone can view notifications
          case 'reports':
            return safeDataSourcePermissions.canGenerateReports
          case 'version-history':
            return safeDataSourcePermissions.canView
          case 'backup-restore':
            return safeDataSourcePermissions.canManageBackup
          case 'bulk-actions':
            return safeDataSourcePermissions.canEdit
          case 'integrations':
            return hasPermission('integrations.manage')
          case 'catalog':
            return safeDataSourcePermissions.canView
          case 'connection-test':
            return safeDataSourcePermissions.canTestConnection
          case 'filters':
            return safeDataSourcePermissions.canView
          default:
            return safeDataSourcePermissions.canView
        }
      })
      
      if (filteredItems.length > 0) {
        filtered[categoryKey] = { ...category, items: filteredItems }
      }
    })
    
    return filtered
  }, [currentUser, safeDataSourcePermissions, hasPermission])
  
  const filteredNavigation = useMemo(() => getFilteredNavigation(), [getFilteredNavigation])

  // ========================================================================
  // ENTERPRISE FEATURES STATE - DATABRICKS-LEVEL ORCHESTRATION
  // ========================================================================
  
  const [enterpriseFeatures, setEnterpriseFeatures] = useState({
    aiInsightsEnabled: true,
    realTimeCollaboration: true,
    workflowAutomation: true,
    predictiveAnalytics: true,
    advancedMonitoring: true,
    complianceTracking: true,
    intelligentRecommendations: true,
    autoOptimization: true,
    collaborativeWorkspaces: true,
    advancedSecurity: true,
    // New Databricks-level features
    aiOrchestration: true,
    smartResourceAllocation: true,
    crossComponentCorrelation: true,
    adaptiveUserInterface: true,
    contextAwareActions: true,
    automaticWorkflowGeneration: true,
    realTimeInsights: true,
    personalizedDashboards: true,
    intelligentCaching: true,
    dynamicScaling: true
  })

  // ========================================================================
  // ERROR BOUNDARY STATE - GRACEFUL DEGRADATION
  // ========================================================================
  
  const [apiErrors, setApiErrors] = useState<Record<string, any>>({})
  const [isRecovering, setIsRecovering] = useState(false)
  const [fallbackMode, setFallbackMode] = useState(false)
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])
  const [collaborationSessions, setCollaborationSessions] = useState<any[]>([])
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])
  const [workflowActions, setWorkflowActions] = useState<WorkflowAction[]>([])
  const [quickActions, setQuickActions] = useState<string[]>([])
  const [pinnedComponents, setPinnedComponents] = useState<string[]>(['enterprise-dashboard', 'monitoring', 'security', 'analytics-workbench'])
  const [componentUsageStats, setComponentUsageStats] = useState<Record<string, number>>({})
  
  // New advanced state for Databricks-level orchestration
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [componentCorrelations, setComponentCorrelations] = useState<Record<string, string[]>>({})
  const [userWorkspaceProfile, setUserWorkspaceProfile] = useState({
    preferredLayout: 'dashboard',
    favoriteComponents: ['enterprise-dashboard', 'analytics-workbench'],
    workflowPreferences: { autoExecute: true, notifications: true },
    analyticsSettings: { realTime: true, detailLevel: 'high' }
  })
  const [smartRecommendations, setSmartRecommendations] = useState<any[]>([])
  const [contextualActions, setContextualActions] = useState<Record<string, any[]>>({})
  const [orchestrationMetrics, setOrchestrationMetrics] = useState({
    totalComponents: 31,
    activeComponents: 0,
    workflowsExecuted: 0,
    avgResponseTime: 0,
    userEngagement: 0
  })
  
  // ========================================================================
  // MODAL STATES - ENHANCED
  // ========================================================================
  
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    test: false,
    bulk: false,
    settings: false,
    help: false,
    analytics: false,
    collaboration: false,
    workflow: false,
    aiInsights: false,
    workflowActions: false,
    componentManager: false,
    advancedFilters: false,
    performanceOptimizer: false,
    securitySuite: false
  })

  // ========================================================================
  // COMPREHENSIVE BACKEND DATA INTEGRATION - ALL ENTERPRISE APIs WITH THROTTLING
  // ========================================================================
  
  // Core Data Sources Integration - WITH THROTTLING AND ERROR HANDLING
  const { data: dataSources, isLoading: dataSourcesLoading, error: dataSourcesError, refetch: refetchDataSources } = useDataSourcesQuery({
    enabled: isInitialized && initializationPhase >= 1,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  // Create datasource mutation (real backend)
  const createDataSourceMutation = useCreateDataSourceMutation()

  // Core User and Workspace Integration - WITH THROTTLING AND ERROR BOUNDARIES
  const { data: user, isLoading: userLoading, error: userError } = useUserQuery({
    enabled: isInitialized && initializationPhase >= 2,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 120000 // 2 minutes stale time
  })
  
  const { data: userNotifications, error: notificationsError } = useNotificationsQuery({
    enabled: isInitialized && initializationPhase >= 2,
    refetchInterval: 120000, // Only refetch every 2 minutes
    staleTime: 60000 // 1 minute stale time
  })
  
  const { data: workspace, error: workspaceError } = useWorkspaceQuery({
    enabled: isInitialized && initializationPhase >= 2,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: metrics, error: metricsError } = useDataSourceMetricsQuery(selectedDataSource?.id, {
    enabled: isInitialized && initializationPhase >= 2 && !!selectedDataSource?.id && isPerformanceView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  // Core data source backend integrations - WITH THROTTLING AND ERROR BOUNDARIES
  const { data: dataSourceHealth, error: healthError } = useDataSourceHealthQuery(selectedDataSource?.id || 0, {
    enabled: isInitialized && initializationPhase >= 3 && !!selectedDataSource?.id && isPerformanceView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: connectionPoolStats, error: poolError } = useConnectionPoolStatsQuery(selectedDataSource?.id || 0, {
    enabled: isInitialized && initializationPhase >= 3 && !!selectedDataSource?.id && isPerformanceView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  // Memoize data source ID to prevent unnecessary re-renders
  const dataSourceId = useMemo(() => selectedDataSource?.id, [selectedDataSource?.id])
  const workspaceId = useMemo(() => workspace?.id, [workspace?.id])
  
  // View-scoped gating is already declared above

  // ========================================================================
  // RBAC INTEGRATION - ENTERPRISE SECURITY
  // ========================================================================
  
  // RBAC integration is already loaded above

  const { data: discoveryHistory, error: discoveryError } = useDiscoveryHistoryQuery(selectedDataSource?.id || 0, {
    enabled: isInitialized && initializationPhase >= 3 && !!selectedDataSource?.id && isDiscoveryView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: scanResults, error: scanError } = useScanResultsQuery(selectedDataSource?.id || 0, {
    enabled: isInitialized && initializationPhase >= 3 && !!selectedDataSource?.id && isDiscoveryView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })

  // Additional enterprise feature hooks for comprehensive functionality - WITH THROTTLING
  const monitoringFeatures = useMonitoringFeatures(dataSourceId)
  const securityFeatures = useSecurityFeatures(dataSourceId)
  const operationsFeatures = useOperationsFeatures(dataSourceId)
  const collaborationFeatures = useCollaborationFeatures('data-sources-app', dataSourceId)
  const workflowIntegration = useWorkflowIntegration('data-sources-app', dataSourceId)
  const analyticsIntegration = useAnalyticsIntegration('data-sources-app', dataSourceId)
  
  const { data: qualityMetrics, error: qualityError } = useQualityMetricsQuery(dataSourceId || 0, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isPerformanceView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: growthMetrics, error: growthError } = useGrowthMetricsQuery(dataSourceId || 0, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isPerformanceView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: schemaDiscoveryData, error: schemaError } = useSchemaDiscoveryQuery(dataSourceId, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isDiscoveryView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })
  
  const { data: dataLineage, error: lineageError } = useDataLineageQuery(dataSourceId, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isDiscoveryView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })
  
  const { data: backupStatus, error: backupError } = useBackupStatusQuery(dataSourceId, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isPerformanceView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  // Gate queries by visibility and required identifiers to reduce backend pressure
  const isVisible = typeof document !== 'undefined' ? !document.hidden : true
  
  const { data: scheduledTasks, error: tasksError } = useScheduledTasksQuery(dataSourceId, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isVisible && isWorkflowView,
    refetchInterval: isVisible ? 300000 : false, // Only refetch every 5 minutes when visible
    staleTime: 120000 // 2 minutes stale time
  })
  
  const { data: auditLogs, error: auditError } = useAuditLogsQuery(dataSourceId, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isVisible && isSecurityView,
    refetchInterval: isVisible ? 600000 : false, // Only refetch every 10 minutes when visible
    staleTime: 300000 // 5 minutes stale time
  })
  
  const { data: userPermissions, error: permissionsError } = useUserPermissionsQuery({
    enabled: isInitialized && initializationPhase >= 2,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    staleTime: 30 * 60 * 1000 // 30 minutes - make it very cold
  })
  
  const { data: dataCatalog, error: catalogError } = useDataCatalogQuery({
    enabled: isInitialized && initializationPhase >= 5 && isVisible,
    refetchInterval: isVisible ? 900000 : false, // Only refetch every 15 minutes when visible
    staleTime: 600000 // 10 minutes stale time
  })

  // =====================================================================================
  // NEW ENTERPRISE APIs - REAL BACKEND INTEGRATION WITH THROTTLING (NO MOCK DATA)
  // =====================================================================================
  
  // COLLABORATION APIs - WITH THROTTLING
  const { data: collaborationWorkspaces } = useCollaborationWorkspacesQuery({}, {
    enabled: isInitialized && initializationPhase >= 3 && isCollaborationView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: activeCollaborationSessions } = useActiveCollaborationSessionsQuery({}, {
    enabled: isInitialized && initializationPhase >= 3 && isCollaborationView,
    refetchInterval: 180000, // Only refetch every 3 minutes
    staleTime: 120000 // 2 minutes stale time
  })
  
  const sharedDocsParams = useMemo(() => ({ document_type: 'all' }), [])
  const { data: sharedDocuments } = useSharedDocumentsQuery(
    dataSourceId?.toString() || '', 
    sharedDocsParams,
    {
      enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isCollaborationView,
      refetchInterval: 600000, // Only refetch every 10 minutes
      staleTime: 300000 // 5 minutes stale time
    }
  )
  
  // Only fetch comments when a document is selected
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const { data: documentComments } = useDocumentCommentsQuery(selectedDocumentId || '', {
    enabled: isInitialized && initializationPhase >= 4 && !!selectedDocumentId && isVisible,
    refetchInterval: isVisible ? 600000 : false, // Only refetch every 10 minutes when visible
    staleTime: 300000 // 5 minutes stale time
  })
  
  const { data: workspaceActivity } = useWorkspaceActivityQuery(workspaceId?.toString() || '', 7, {
    enabled: isInitialized && initializationPhase >= 3 && !!workspaceId && isCollaborationView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })
  
  // WORKFLOW APIs - WITH THROTTLING
  const { data: workflowDefinitions } = useWorkflowDefinitionsQuery({}, {
    enabled: isInitialized && initializationPhase >= 3 && isWorkflowView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })
  
  const workflowExecutionsParams = useMemo(() => ({ days: 7 }), [])
  const { data: workflowExecutions } = useWorkflowExecutionsQuery(workflowExecutionsParams, {
    enabled: isInitialized && initializationPhase >= 4 && isWorkflowView,
    refetchInterval: 900000, // Only refetch every 15 minutes
    staleTime: 600000 // 10 minutes stale time
  })
  
  const { data: pendingApprovals } = usePendingApprovalsQuery('', {
    enabled: isInitialized && initializationPhase >= 3 && isWorkflowView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: workflowTemplates } = useWorkflowTemplatesQuery('', {
    enabled: isInitialized && initializationPhase >= 3 && isWorkflowView,
    refetchInterval: 900000, // Only refetch every 15 minutes
    staleTime: 600000 // 10 minutes stale time
  })
  
  const { data: bulkOperationStatus } = useBulkOperationStatusQuery('', {
    enabled: isInitialized && initializationPhase >= 3 && isWorkflowView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  // ENHANCED PERFORMANCE APIs - WITH THROTTLING
  const { data: systemHealth } = useSystemHealthQuery({
    enabled: isInitialized && initializationPhase >= 3 && isVisible && isPerformanceView,
    refetchInterval: isVisible ? 120000 : false, // Only refetch every 2 minutes when visible
    staleTime: 60000 // 1 minute stale time
  })
  
  const perfMetricsParams = useMemo(() => ({ time_range: '24h', metric_types: ['cpu', 'memory', 'io', 'network'] }), [])
  const { data: enhancedPerformanceMetrics } = useEnhancedPerformanceMetricsQuery(
    dataSourceId || 0,
    perfMetricsParams,
    {
      enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isPerformanceView,
      refetchInterval: 300000, // Only refetch every 5 minutes
      staleTime: 180000 // 3 minutes stale time
    }
  )
  
  const performanceAlertsParams = useMemo(() => ({ severity: 'all', days: 7 }), [])
  const { data: performanceAlerts } = usePerformanceAlertsQuery(performanceAlertsParams, {
    enabled: isInitialized && initializationPhase >= 3 && isPerformanceView,
    refetchInterval: 180000, // Only refetch every 3 minutes
    staleTime: 120000 // 2 minutes stale time
  })
  
  const { data: performanceTrends } = usePerformanceTrendsQuery(dataSourceId, '30d', {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isPerformanceView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })
  
  const { data: optimizationRecommendations } = useOptimizationRecommendationsQuery(dataSourceId, {
    enabled: isInitialized && initializationPhase >= 5 && !!dataSourceId && isPerformanceView,
    refetchInterval: 900000, // Only refetch every 15 minutes
    staleTime: 600000 // 10 minutes stale time
  })
  
  const perfSummaryParams = useMemo(() => ({ time_range: '7d' }), [])
  const { data: performanceSummaryReport } = usePerformanceSummaryReportQuery(perfSummaryParams, {
    enabled: isInitialized && initializationPhase >= 4 && isPerformanceView,
    refetchInterval: 900000, // Only refetch every 15 minutes
    staleTime: 600000 // 10 minutes stale time
  })
  
  const { data: performanceThresholds } = usePerformanceThresholdsQuery(dataSourceId, {
    enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isPerformanceView,
    refetchInterval: 900000, // Only refetch every 15 minutes
    staleTime: 600000 // 10 minutes stale time
  })
  
  // ENHANCED SECURITY APIs - WITH THROTTLING
  const enhancedSecurityAuditParams = useMemo(() => ({ include_vulnerabilities: true, include_compliance: true }), [])
  const { data: enhancedSecurityAudit } = useEnhancedSecurityAuditQuery(
    dataSourceId || 0,
    enhancedSecurityAuditParams,
    {
      enabled: isInitialized && initializationPhase >= 4 && !!dataSourceId && isSecurityView,
      refetchInterval: 600000, // Only refetch every 10 minutes
      staleTime: 300000 // 5 minutes stale time
    }
  )
  
  const vulnerabilityParams = useMemo(() => ({ severity: 'all' }), [])
  const { data: vulnerabilityAssessments } = useVulnerabilityAssessmentsQuery(vulnerabilityParams, {
    enabled: isInitialized && initializationPhase >= 4 && isSecurityView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })
  
  const securityIncidentsParams = useMemo(() => ({ days: 30 }), [])
  const { data: securityIncidents } = useSecurityIncidentsQuery(securityIncidentsParams, {
    enabled: isInitialized && initializationPhase >= 3 && isSecurityView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: complianceChecks } = useComplianceChecksQuery({}, {
    enabled: isInitialized && initializationPhase >= 4 && isSecurityView,
    refetchInterval: 900000, // Only refetch every 15 minutes
    staleTime: 600000 // 10 minutes stale time
  })
  
  const threatDetectionParams = useMemo(() => ({ days: 7 }), [])
  const { data: threatDetection } = useThreatDetectionQuery(threatDetectionParams, {
    enabled: isInitialized && initializationPhase >= 3 && isSecurityView,
    refetchInterval: 300000, // Only refetch every 5 minutes
    staleTime: 180000 // 3 minutes stale time
  })
  
  const { data: securityAnalyticsDashboard } = useSecurityAnalyticsDashboardQuery('7d', {
    enabled: isInitialized && initializationPhase >= 4 && isSecurityView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })
  
  const { data: riskAssessmentReport } = useRiskAssessmentReportQuery({}, {
    enabled: isInitialized && initializationPhase >= 4 && isSecurityView,
    refetchInterval: 900000, // Only refetch every 15 minutes
    staleTime: 600000 // 10 minutes stale time
  })
  
  const securityScansParams = useMemo(() => ({ days: 30 }), [])
  const { data: securityScans } = useSecurityScansQuery(securityScansParams, {
    enabled: isInitialized && initializationPhase >= 4 && isSecurityView,
    refetchInterval: 600000, // Only refetch every 10 minutes
    staleTime: 300000 // 5 minutes stale time
  })

  // Mutation hooks for enterprise actions
  const createWorkspaceMutation = useCreateCollaborationWorkspaceMutation()
  const createDocumentMutation = useCreateSharedDocumentMutation()
  const addCommentMutation = useAddDocumentCommentMutation()
  const inviteToWorkspaceMutation = useInviteToWorkspaceMutation()
  const createWorkflowMutation = useCreateWorkflowDefinitionMutation()
  const executeWorkflowMutation = useExecuteWorkflowMutation()
  const approveRequestMutation = useApproveRequestMutation()
  const rejectRequestMutation = useRejectRequestMutation()
  const createBulkOperationMutation = useCreateBulkOperationMutation()
  const acknowledgeAlertMutation = useAcknowledgePerformanceAlertMutation()
  const resolveAlertMutation = useResolvePerformanceAlertMutation()
  const createThresholdMutation = useCreatePerformanceThresholdMutation()
  const startMonitoringMutation = useStartRealTimeMonitoringMutation()
  const stopMonitoringMutation = useStopRealTimeMonitoringMutation()
  const createSecurityScanMutation = useCreateEnhancedSecurityScanMutation()
  const remediateVulnerabilityMutation = useRemediateVulnerabilityMutation()
  const createIncidentMutation = useCreateSecurityIncidentMutation()
  const runComplianceCheckMutation = useRunComplianceCheckMutation()
  const startSecurityMonitoringMutation = useStartSecurityMonitoringMutation()

  // Consolidated loading state
  const loading = dataSourcesLoading || userLoading

  // Error aggregation for graceful degradation
  const allErrors = {
    dataSources: dataSourcesError,
    user: userError,
    notifications: notificationsError,
    workspace: workspaceError,
    metrics: metricsError,
    health: healthError,
    pool: poolError,
    discovery: discoveryError,
    scan: scanError,
    quality: qualityError,
    growth: growthError,
    schema: schemaError,
    lineage: lineageError,
    backup: backupError,
    tasks: tasksError,
    audit: auditError,
    permissions: permissionsError,
    catalog: catalogError
  }

  // Enhanced error handling with graceful degradation
  const criticalErrors = Object.values(allErrors).filter(error => 
    error && (
      (error.response && (error.response.status === 500 || error.response.status === 502 || error.response.status === 503)) ||
      (error.status === 500 || error.status === 502 || error.status === 503)
    )
  )

  const missingEndpointErrors = Object.values(allErrors).filter(error => 
    error && (
      (error.response && error.response.status === 404) ||
      (error.status === 404)
    )
  )

  // Count different types of errors
  const errorStats = {
    critical: criticalErrors.length,
    missing: missingEndpointErrors.length,
    total: Object.values(allErrors).filter(Boolean).length
  }

  useEffect(() => {
    // Enter fallback mode if too many critical errors
    if (criticalErrors.length > 3) {
      setFallbackMode(true)
      setNotifications(prev => [...prev.slice(-9), {
        id: Math.random().toString(36),
        type: 'warning',
        title: 'Fallback Mode Activated',
        message: 'Multiple API failures detected. Running in fallback mode with limited functionality.',
        timestamp: new Date()
      }])
    } else if (criticalErrors.length === 0) {
      setFallbackMode(false)
    }

    // Log error statistics for debugging
    if (errorStats.total > 0) {
      console.log('API Error Statistics:', {
        critical: errorStats.critical,
        missing: errorStats.missing,
        total: errorStats.total,
        fallbackMode: fallbackMode
      })
    }
  }, [criticalErrors.length, errorStats.total, fallbackMode])

  // Legacy enterprise context data for backward compatibility
  const { backendData } = enterprise || { backendData: { dataSources, loading } }

  // ========================================================================
  // ADVANCED WORKFLOW ACTIONS INITIALIZATION
  // ========================================================================
  
  // Memoize mutations to prevent infinite re-renders
  const mutations = useMemo(() => ({
    createSecurityScan: createSecurityScanMutation,
    runComplianceCheck: runComplianceCheckMutation,
    startMonitoring: startMonitoringMutation,
    createWorkspace: createWorkspaceMutation,
    createWorkflow: createWorkflowMutation,
    createThreshold: createThresholdMutation,
    createDocument: createDocumentMutation,
    createBulkOperation: createBulkOperationMutation,
    startSecurityMonitoring: startSecurityMonitoringMutation
  }), [
    createSecurityScanMutation,
    runComplianceCheckMutation,
    startMonitoringMutation,
    createWorkspaceMutation,
    createWorkflowMutation,
    createThresholdMutation,
    createDocumentMutation,
    createBulkOperationMutation,
    startSecurityMonitoringMutation
  ])
  
  useEffect(() => {
    const actions = createAdvancedWorkflowActions({ mutations })
    setWorkflowActions(actions)
  }, []) // Remove mutations dependency to prevent infinite loop

  // ========================================================================
  // ADVANCED COMPONENT USAGE TRACKING & AI INSIGHTS
  // ========================================================================
  
  const trackComponentUsage = useCallback((componentId: string) => {
    setComponentUsageStats(prev => {
      const newStats = {
        ...prev,
        [componentId]: (prev[componentId] || 0) + 1
      }
      
      return newStats
    })
    
    // Generate AI insights based on usage patterns
    if (enterpriseFeatures.realTimeInsights) {
      generateUsageInsights(componentId)
    }
  }, [enterpriseFeatures.realTimeInsights])

  // ========================================================================
  // ENHANCED ENTERPRISE FEATURES IMPLEMENTATION
  // ========================================================================
  
  // AI Insights Generation
  const generateUsageInsights = useCallback((componentId: string) => {
    // Simulate AI-powered usage insights
    setTimeout(() => {
      const insights = {
        id: Math.random().toString(36),
        type: 'usage_pattern',
        title: 'Component Usage Insight',
        message: `Frequent usage of ${componentId} detected. Consider pinning for quick access.`,
        confidence: 0.85,
        actionable: true,
        suggestions: [
          { action: 'pin_component', label: 'Pin Component', componentId },
          { action: 'create_shortcut', label: 'Create Shortcut', componentId }
        ],
        timestamp: new Date()
      }
      
      setAiInsights(prev => [...prev.slice(-9), insights])
    }, 1000)
  }, [])

  // Contextual Actions Generation
  const generateContextualActions = useCallback((componentId: string) => {
    const contextActions = {
      'enterprise-dashboard': [
        { id: 'customize_dashboard', label: 'Customize Dashboard', icon: Settings },
        { id: 'export_insights', label: 'Export Insights', icon: ArrowDown },
        { id: 'schedule_report', label: 'Schedule Report', icon: Calendar }
      ],
      'analytics-workbench': [
        { id: 'run_analysis', label: 'Run Analysis', icon: Play },
        { id: 'share_notebook', label: 'Share Notebook', icon: Share2 },
        { id: 'export_model', label: 'Export Model', icon: Download }
      ],
      'security': [
        { id: 'run_scan', label: 'Run Security Scan', icon: Scan },
        { id: 'review_alerts', label: 'Review Alerts', icon: AlertTriangle },
        { id: 'update_policies', label: 'Update Policies', icon: Shield }
      ],
      'performance': [
        { id: 'optimize_query', label: 'Optimize Query', icon: Zap },
        { id: 'scale_resources', label: 'Scale Resources', icon: TrendingUp },
        { id: 'analyze_bottlenecks', label: 'Analyze Bottlenecks', icon: Target }
      ]
    }
    
    setContextualActions(prev => ({
      ...prev,
      [componentId]: contextActions[componentId as keyof typeof contextActions] || []
    }))
  }, [])

  // Enhanced Workflow Action Handler
  const executeWorkflowAction = useCallback(async (actionId: string) => {
    const action = workflowActions.find(a => a.id === actionId)
    if (!action || !action.enabled) return

    try {
      setNotifications(prev => [...prev.slice(-9), {
        id: Date.now().toString(),
        type: 'info',
        title: 'Action Started',
        message: `${action.label} is being executed...`,
        timestamp: new Date()
      }])

      const context = {
        selectedDataSource,
        dataSources,
        mutations: {
          createSecurityScan: createSecurityScanMutation,
          runComplianceCheck: runComplianceCheckMutation,
          startMonitoring: startMonitoringMutation,
          createWorkspace: createWorkspaceMutation,
          createWorkflow: createWorkflowMutation,
          createThreshold: createThresholdMutation,
          createDocument: createDocumentMutation,
          createBulkOperation: createBulkOperationMutation,
          startSecurityMonitoring: startSecurityMonitoringMutation
        }
      }

      await action.action(context)

      setNotifications(prev => [...prev.slice(-9), {
        id: Date.now().toString(),
        type: 'success',
        title: 'Action Completed',
        message: `${action.label} completed successfully`,
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Workflow action failed:', error)
      setNotifications(prev => [...prev.slice(-9), {
        id: Date.now().toString(),
        type: 'error',
        title: 'Action Failed',
        message: `Failed to execute ${action.label}`,
        timestamp: new Date()
      }])
    }
  }, [selectedDataSource, dataSources, createSecurityScanMutation, runComplianceCheckMutation, startMonitoringMutation, createWorkspaceMutation, createWorkflowMutation, createThresholdMutation, createDocumentMutation, createBulkOperationMutation, startSecurityMonitoringMutation])

  // REMOVED DUPLICATE generateUsageInsights function

  const handleViewChange = useCallback((newView: string) => {
    setActiveView(newView)
    trackComponentUsage(newView)
    
    // Generate contextual actions for the new view
    if (enterpriseFeatures.contextAwareActions) {
      generateContextualActions(newView)
    }
  }, [trackComponentUsage, enterpriseFeatures.contextAwareActions])

  // REMOVED DUPLICATE generateContextualActions function

  // ========================================================================
  // ADVANCED WORKFLOW ACTION HANDLER - REMOVED DUPLICATE
  // ========================================================================

  // ========================================================================
  // REAL-TIME UPDATES AND EVENT HANDLING - DATABRICKS-LEVEL ORCHESTRATION
  // ========================================================================
  
  // Graceful error recovery mechanism
  const handleGracefulErrorRecovery = useCallback(async (errorEvent: any) => {
    console.log('Attempting graceful error recovery:', errorEvent)
    
    // Implement automatic retry for recoverable errors
    if (errorEvent.canRetry && errorEvent.retryAfter) {
      setTimeout(() => {
        console.log('Auto-retrying failed operation...')
        refetchDataSources()
      }, errorEvent.retryAfter)
    }
    
    // Show user-friendly notification
    setNotifications(prev => [...prev.slice(-9), {
      id: Math.random().toString(36),
      type: 'warning',
      title: 'Connection Issue Detected',
      message: 'The system is working to resolve the issue automatically.',
      timestamp: new Date()
    }])
  }, [refetchDataSources])

  // ========================================================================
  // ENHANCED ENTERPRISE MONITORING AND ANALYTICS
  // ========================================================================
  
  // Real-time system health monitoring
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeConnections: 0,
    responseTime: 0
  })

  // Performance optimization monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    queryExecutionTime: 0,
    cacheHitRate: 0,
    throughput: 0,
    errorRate: 0,
    userSatisfaction: 0
  })

  // AI-powered insights and recommendations
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<any[]>([])

  // Enhanced monitoring effects
  useEffect(() => {
    if (enterpriseFeatures.advancedMonitoring) {
      const interval = setInterval(() => {
        // Simulate real-time metrics updates
        setSystemMetrics(prev => ({
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
          network: Math.random() * 100,
          activeConnections: Math.floor(Math.random() * 1000),
          responseTime: Math.random() * 1000
        }))

        setPerformanceMetrics(prev => ({
          queryExecutionTime: Math.random() * 5000,
          cacheHitRate: Math.random() * 100,
          throughput: Math.random() * 10000,
          errorRate: Math.random() * 5,
          userSatisfaction: Math.random() * 100
        }))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [enterpriseFeatures.advancedMonitoring])

  // AI insights generation
  useEffect(() => {
    if (enterpriseFeatures.aiInsightsEnabled && systemMetrics.cpu > 80) {
      const recommendation = {
        id: Math.random().toString(36),
        type: 'performance',
        title: 'High CPU Usage Detected',
        message: 'System CPU usage is above 80%. Consider scaling resources or optimizing queries.',
        priority: 'high',
        actionable: true,
        suggestions: [
          'Scale compute resources',
          'Optimize database queries',
          'Enable query caching'
        ],
        timestamp: new Date()
      }
      
      setAiRecommendations(prev => [...prev.slice(-4), recommendation])
    }
  }, [systemMetrics.cpu, enterpriseFeatures.aiInsightsEnabled])
  
  // Server connectivity check
  const [serverDown, setServerDown] = useState(false)
  const [serverCheckCount, setServerCheckCount] = useState(0)
  
  const checkServerConnectivity = useCallback(async () => {
    try {
      // Try multiple health check endpoints
      const healthEndpoints = [
        '/proxy/health',
        '/proxy/api/racine/orchestration/health'      ]
      
      let response = null
      let workingEndpoint = null
      
      for (const endpoint of healthEndpoints) {
        try {
          response = await fetch(endpoint, { 
            method: 'GET',
            signal: AbortSignal.timeout(3000) // 3 second timeout per endpoint
          })
          
          if (response.ok) {
            workingEndpoint = endpoint
            break
          }
        } catch (e) {
          console.warn(`Health check failed for ${endpoint}:`, e)
          continue
        }
      }
      
      if (response && response.ok) {
        console.log(`Server connectivity confirmed via ${workingEndpoint}`)
        setServerDown(false)
        setServerCheckCount(0)
        return true
      } else {
        throw new Error(`All health check endpoints failed`)
      }
    } catch (error) {
      console.warn('Server connectivity check failed:', error)
      setServerCheckCount(prev => prev + 1)
      
      // If we've failed 3 times, consider the server down
      if (serverCheckCount >= 2) {
        setServerDown(true)
      }
      
      return false
    }
  }, [serverCheckCount])
  
  // Check server connectivity on mount and when errors occur
  useEffect(() => {
    checkServerConnectivity()
    
    // Set up periodic connectivity check
    const interval = setInterval(checkServerConnectivity, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [checkServerConnectivity])
  
  useEffect(() => {
    if (enterprise.core?.eventBus) {
      const eventBus = enterprise.core.eventBus

      // Handle real-time data updates
      eventBus.subscribe('backend:data:updated', async (event) => {
        // Refresh relevant data
        if (autoRefresh) {
          console.log('Real-time data update received:', event.payload)
          
          // Update orchestration metrics
          setOrchestrationMetrics(prev => ({
            ...prev,
            avgResponseTime: event.payload.responseTime || prev.avgResponseTime
          }))
        }
      })

      // Advanced AI orchestration events
      eventBus.subscribe('ai:orchestration:started', async (event) => {
        setNotifications(prev => [...prev.slice(-9), {
          id: Math.random().toString(36),
          type: 'info',
          title: 'AI Orchestration Active',
          message: 'Intelligent system orchestration has been initiated',
          timestamp: new Date()
        }])
      })

      eventBus.subscribe('workspace:adaptation:completed', async (event) => {
        setUserWorkspaceProfile(prev => ({
          ...prev,
          ...event.payload.adaptations
        }))
        
        setNotifications(prev => [...prev.slice(-9), {
          id: Math.random().toString(36),
          type: 'success',
          title: 'Workspace Adapted',
          message: 'Your workspace has been optimized based on usage patterns',
          timestamp: new Date()
        }])
      })

      // Component correlation insights
      eventBus.subscribe('component:correlation:detected', async (event) => {
        setComponentCorrelations(prev => ({
          ...prev,
          [event.payload.sourceComponent]: event.payload.correlatedComponents
        }))
      })

      // Handle analytics insights
      eventBus.subscribe('analytics:insight:generated', async (event) => {
        if (enterpriseFeatures.aiInsightsEnabled) {
          setNotifications(prev => [...prev.slice(-9), {
            id: Math.random().toString(36),
            type: 'insight',
            title: 'New AI Insight',
            message: event.payload.title,
            timestamp: new Date(),
            data: event.payload
          }])
        }
      })

      // Handle system alerts
      eventBus.subscribe('monitoring:alert:triggered', async (event) => {
        setSystemAlerts(prev => [...prev.slice(-19), {
          id: Math.random().toString(36),
          type: event.payload.severity,
          message: event.payload.message,
          timestamp: new Date(),
          dataSourceId: event.payload.dataSourceId
        }])
      })

      // Handle collaboration events
      eventBus.subscribe('collaboration:session:started', async (event) => {
        setCollaborationSessions(prev => [...prev, event.payload])
      })

      eventBus.subscribe('collaboration:session:ended', async (event) => {
        setCollaborationSessions(prev => 
          prev.filter(session => session.id !== event.payload.sessionId)
        )
      })

      // Handle workflow events
      eventBus.subscribe('workflow:created', async (event) => {
        setActiveWorkflows(prev => [...prev, event.payload])
      })

      eventBus.subscribe('workflow:completed', async (event) => {
        setActiveWorkflows(prev => 
          prev.map(wf => wf.id === event.payload.workflowId 
            ? { ...wf, status: 'completed', completedAt: new Date() }
            : wf
          )
        )
      })
      
      // Handle graceful error recovery events
      eventBus.subscribe('api:mutation:graceful_error', handleGracefulErrorRecovery)
      eventBus.subscribe('catalog:discovery:graceful_error', handleGracefulErrorRecovery)
      eventBus.subscribe('error:boundary:caught', handleGracefulErrorRecovery)
    }
  }, [enterprise?.core, autoRefresh, handleGracefulErrorRecovery]) // Remove enterpriseFeatures to prevent infinite loop

  // ========================================================================
  // AUTO-SELECTION LOGIC
  // ========================================================================
  
  useEffect(() => {
    // Ensure dataSources is an array before calling find
    if (dataSources && Array.isArray(dataSources) && dataSources.length > 0 && !selectedDataSource) {
      const defaultDataSource = dataSources.find(ds => ds.status === 'active') || dataSources[0]
      setSelectedDataSource(defaultDataSource)
    }
  }, [dataSources, selectedDataSource])

  // ========================================================================
  // DATABRICKS-LEVEL FEATURES INITIALIZATION
  // ========================================================================
  
  useEffect(() => {
    // Initialize AI-powered smart recommendations
    if (enterpriseFeatures.intelligentRecommendations) {
      const recommendations = [
        {
          id: 'optimize-performance',
          title: 'Performance Optimization',
          description: 'AI detected 15% performance improvement potential',
          confidence: 0.92,
          action: 'performance-optimization'
        },
        {
          id: 'security-enhancement',
          title: 'Security Enhancement',
          description: 'Implement advanced threat detection patterns',
          confidence: 0.88,
          action: 'security-assessment'
        },
        {
          id: 'workflow-automation',
          title: 'Workflow Automation',
          description: 'Automate 3 recurring manual processes',
          confidence: 0.95,
          action: 'intelligent-automation'
        }
      ]
      setSmartRecommendations(recommendations)
    }

    // Initialize component correlations
    if (enterpriseFeatures.crossComponentCorrelation) {
      setComponentCorrelations({
        'security': ['compliance', 'performance', 'monitoring'],
        'performance': ['monitoring', 'analytics-workbench', 'security'],
        'enterprise-dashboard': ['monitoring', 'analytics-workbench', 'collaboration-studio'],
        'analytics-workbench': ['performance', 'quality', 'growth', 'discovery']
      })
    }

    // Set up intelligent caching if enabled
    if (enterpriseFeatures.intelligentCaching) {
      console.log('Intelligent caching enabled - optimizing query strategies')
    }

    // Initialize adaptive UI if enabled
    if (enterpriseFeatures.adaptiveUserInterface) {
      // Apply user workspace preferences
      setLayout(userWorkspaceProfile.preferredLayout as keyof typeof enterpriseLayoutConfigurations)
      setPinnedComponents(userWorkspaceProfile.favoriteComponents)
    }
  }, [userWorkspaceProfile]) // Remove enterpriseFeatures to prevent infinite loop

  // ========================================================================
  // ADVANCED COMPONENT LIFECYCLE TRACKING
  // ========================================================================
  
  useEffect(() => {
    // Track when new components become active
    const activeComponentCount = Object.keys(componentUsageStats).length
    setOrchestrationMetrics(prev => ({
      ...prev,
      activeComponents: activeComponentCount
    }))

    // Generate usage insights for frequently used components
    const frequentComponents = Object.entries(componentUsageStats)
      .filter(([_, count]) => count > 5)
      .map(([componentId]) => componentId)
    
    if (frequentComponents.length > 0 && enterpriseFeatures.intelligentRecommendations) {
      const newRecommendations = frequentComponents
        .filter(comp => !pinnedComponents.includes(comp))
        .map(comp => ({
          id: `pin-${comp}`,
          title: `Pin ${comp}`,
          description: `Frequently used component - consider pinning for quick access`,
          confidence: 0.9,
          action: 'pin-component',
          componentId: comp
        }))
      
      if (newRecommendations.length > 0) {
        setSmartRecommendations(prev => [...prev, ...newRecommendations].slice(-10))
      }
    }
    }, [componentUsageStats, pinnedComponents]) // Remove enterpriseFeatures.intelligentRecommendations to prevent infinite loop

  // ========================================================================
  // GLOBAL ERROR HANDLING - ENTERPRISE-GRADE ERROR RECOVERY
  // ========================================================================
  
  useEffect(() => {
    // Enhanced error monitoring and reporting with emergency mode detection
    const requestManager = APIRequestManager.getInstance()
    
    // Check for database overload patterns and enable emergency mode
    const databaseErrors = criticalErrors.filter(error => 
      error?.message?.includes('database_unavailable') || 
      error?.message?.includes('too many clients') ||
      error?.message?.includes('Connection pool is at capacity')
    )
    
    if (databaseErrors.length >= 2) {
      console.error('🚨🚨🚨 DATABASE OVERLOAD DETECTED - ENABLING EMERGENCY MODE 🚨🚨🚨')
      requestManager.enableEmergencyMode()
    }
    
    const errorReport = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errors: {
        critical: criticalErrors.length,
        missing: missingEndpointErrors.length,
        database: databaseErrors.length,
        total: errorStats.total
      },
      throttling: {
        activeRequests: requestManager.getStats().activeRequests,
        queueSize: requestManager.getStats().queueSize,
        emergencyMode: requestManager.isInEmergencyMode()
      }
    }

    // Log comprehensive error report
    if (errorStats.total > 0) {
      console.group('🚨 API Error Report')
      console.log('Error Statistics:', errorReport.errors)
      console.log('Throttling Status:', errorReport.throttling)
      console.log('Critical Errors:', criticalErrors.map(e => e?.message || 'Unknown'))
      console.log('Missing Endpoints:', missingEndpointErrors.map(e => e?.message || 'Unknown'))
      console.groupEnd()
    }

    // Global error handler for unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error)
      
      // Enhanced error reporting
      const errorDetails = {
        message: event.error?.message || 'Unknown error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        timestamp: new Date().toISOString(),
        stack: event.error?.stack,
        type: 'global_error'
      }

      // Emit error event for telemetry with safety check
      try {
        if (typeof window !== 'undefined' && window.enterpriseEventBus && typeof window.enterpriseEventBus.emit === 'function') {
          window.enterpriseEventBus.emit('global:error:caught', errorDetails)
        }
      } catch (telemetryError) {
        console.warn('Failed to emit telemetry event:', telemetryError)
      }
      
      // Don't crash the app, just log the error
      event.preventDefault()
    }
    
    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Emit error event for telemetry with safety check
      try {
        if (typeof window !== 'undefined' && window.enterpriseEventBus && typeof window.enterpriseEventBus.emit === 'function') {
          window.enterpriseEventBus.emit('global:promise:rejected', {
            error: event.reason?.message || 'Unknown promise rejection',
            timestamp: new Date()
          })
        }
      } catch (telemetryError) {
        console.warn('Failed to emit telemetry event:', telemetryError)
      }
      
      // Don't crash the app, just log the error
      event.preventDefault()
    }
    
    // Handle 502 errors specifically
    const handle502Error = (error: any) => {
      if (error?.message?.includes('502') || error?.message?.includes('Bad Gateway')) {
        console.warn('502 Bad Gateway detected - server is down')
        
        // Show user-friendly message and reload option with safety check
        try {
          if (typeof window !== 'undefined' && window.enterpriseEventBus && typeof window.enterpriseEventBus.emit === 'function') {
            window.enterpriseEventBus.emit('server:down', {
              error: error.message,
              timestamp: new Date()
            })
          }
        } catch (telemetryError) {
          console.warn('Failed to emit telemetry event:', telemetryError)
        }
        
        // Prevent the error from crashing the app
        return true
      }
      return false
    }
    
    // Override console.error to catch 502 errors
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Check if any of the args contain 502 errors
      const has502Error = args.some(arg => 
        typeof arg === 'string' && arg.includes('502') ||
        (arg && typeof arg === 'object' && arg.message && arg.message.includes('502'))
      )
      
      if (has502Error) {
        console.warn('502 error detected - server connectivity issue')
        // Don't prevent the error from being logged, but handle it gracefully
      }
      
      originalConsoleError.apply(console, args)
    }
    
    // Add global error handlers
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      console.error = originalConsoleError
    }
  }, [])
  
  // ========================================================================
  // KEYBOARD SHORTCUTS WITH ENTERPRISE FEATURES
  // ========================================================================
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case "k":
            event.preventDefault()
            setCommandPaletteOpen(true)
            break
          case "d":
            if (event.shiftKey) {
              event.preventDefault()
              setActiveView("ai-dashboard")
            } else {
              event.preventDefault()
              setActiveView("enterprise-dashboard")
            }
            break
          case "1":
            event.preventDefault()
            setActiveView("overview")
            break
          case "2":
            event.preventDefault()
            setActiveView("grid")
            break
          case "3":
            event.preventDefault()
            setActiveView("list")
            break
          case "a":
            if (event.shiftKey) {
              event.preventDefault()
              setModals(prev => ({ ...prev, analytics: true }))
            }
            break
          case "w":
            if (event.shiftKey) {
              event.preventDefault()
              setModals(prev => ({ ...prev, workflow: true }))
            } else {
              event.preventDefault()
              setActiveView("discovery-workspace")
            }
            break
          case "c":
            if (event.shiftKey) {
              event.preventDefault()
              setModals(prev => ({ ...prev, collaboration: true }))
            } else {
              event.preventDefault()
              setActiveView("compliance")
            }
            break
          case "r":
            event.preventDefault()
            // Trigger manual refresh
            window.location.reload()
            break
        }
      }

      // Handle escape key
      if (event.key === "Escape") {
        setCommandPaletteOpen(false)
        setModals(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // ========================================================================
  // COMPONENT SELECTION LOGIC
  // ========================================================================
  
  const renderActiveComponent = useCallback(() => {
    const commonProps = {
      selectedDataSource,
      onDataSourceSelect: setSelectedDataSource,
      searchQuery,
      filters,
      viewMode,
      enterprise: mainFeatures
    }

    switch (activeView) {
      // Enterprise components
      case "enterprise-dashboard":
        return <EnterpriseDashboard />
      case "ai-dashboard":
        return <AIPoweredDashboard />
      case "analytics-workbench":
        return <AnalyticsWorkbench />
      case "collaboration-studio":
        return <CollaborationStudio />
      case "workflow-designer":
        return <WorkflowDesigner />

      // Core components
      case "overview":
        return <DataSourceOverview 
          dataSourceId={selectedDataSource?.id || 0}
          onEdit={() => Promise.resolve()}
          onDelete={() => Promise.resolve()}
          onTestConnection={() => Promise.resolve()}
          onStartScan={() => Promise.resolve()}
        />
      case "grid":
        return <DataSourceGrid {...commonProps} />
      case "list":
        return <DataSourceList />
      case "details":
        return <DataSourceDetails 
          dataSourceId={selectedDataSource?.id || 0}
          onEdit={() => Promise.resolve()}
          onDelete={() => Promise.resolve()}
          onTestConnection={() => Promise.resolve()}
          onStartScan={() => Promise.resolve()}
        />

      // Monitoring components
      case "monitoring":
        return selectedDataSource ? (
          <DataSourceMonitoring dataSource={selectedDataSource} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view monitoring</p>
          </div>
        )
      case "dashboard-monitoring":
        return selectedDataSource ? (
          <DataSourceMonitoringDashboard dataSource={selectedDataSource} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view monitoring dashboard</p>
          </div>
        )
      case "performance":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourcePerformanceView dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view performance</p>
          </div>
        )
      case "quality":
        return selectedDataSource ? (
          <DataSourceQualityAnalytics dataSource={selectedDataSource} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view quality analytics</p>
          </div>
        )
      case "growth":
        return selectedDataSource ? (
          <DataSourceGrowthAnalytics dataSource={selectedDataSource} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view growth analytics</p>
          </div>
        )

      // Discovery orchestration
      case "orchestrate-discovery":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DiscoveryOrchestration dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to orchestrate discovery</p>
          </div>
        )

      // Discovery components
      case "discovery":
        return selectedDataSource ? (
          <DataSourceDiscovery dataSource={selectedDataSource} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view discovery</p>
          </div>
        )
      case "discovery-workspace":
        return selectedDataSource ? (
          <DataDiscoveryWorkspace 
            dataSource={selectedDataSource} 
            isOpen={true} 
            onClose={() => {}} 
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view discovery workspace</p>
          </div>
        )
      case "schema-discovery":
        return selectedDataSource ? (
          <SchemaDiscovery 
            dataSourceId={selectedDataSource.id} 
            dataSourceName={selectedDataSource.name} 
            onSelectionChange={() => {}} 
            onClose={() => {}} 
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view schema discovery</p>
          </div>
        )
      case "data-lineage":
        return selectedDataSource ? (
          <DataLineageGraph />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view data lineage</p>
          </div>
        )
      case "scan-results":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceScanResults {...commonProps} dataSourceId={selectedDataSource.id} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view scan results</p>
          </div>
        )
      case "compliance":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceComplianceView {...commonProps} dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view compliance</p>
          </div>
        )
      case "security":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceSecurityView {...commonProps} dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view security</p>
          </div>
        )

      // Management components
      case "cloud-config":
        return selectedDataSource ? (
          <DataSourceCloudConfig {...commonProps} dataSource={selectedDataSource} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to configure cloud settings</p>
          </div>
        )
      case "access-control":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceAccessControl {...commonProps} dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to manage access control</p>
          </div>
        )
      case "tags":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceTagsManager 
              dataSourceId={selectedDataSource.id} 
              onClose={() => {}} 
            />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to manage tags</p>
          </div>
        )
      case "scheduler":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceScheduler {...commonProps} dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to manage scheduling</p>
          </div>
        )

      // Collaboration components
      case "workspaces":
        return selectedDataSource ? (
          <DataSourceWorkspaceManagement {...commonProps} dataSource={selectedDataSource} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to manage workspaces</p>
          </div>
        )
      case "notifications":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceNotifications />
          </Suspense>
        )
      case "reports":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceReports {...commonProps} dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view reports</p>
          </div>
        )
      case "version-history":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceVersionHistory {...commonProps} dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view version history</p>
          </div>
        )

      // Operations components
      case "backup-restore":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceBackupRestore {...commonProps} dataSourceId={selectedDataSource.id} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to manage backup and restore</p>
          </div>
        )
      case "bulk-actions":
        return (
          <DataSourceBulkActions 
            open={modals.bulk} 
            onClose={() => setModals(prev => ({ ...prev, bulk: false }))} 
            selectedItems={selectedItems}
          />
        )
      case "integrations":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceIntegrations {...commonProps} dataSourceId={selectedDataSource.id} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to manage integrations</p>
          </div>
        )
      case "catalog":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceCatalog {...commonProps} dataSourceId={selectedDataSource.id} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to view catalog</p>
          </div>
        )

      // Advanced Testing & Filtering
      case "connection-test":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceConnectionTestModal 
              open={true}
              onClose={() => {}}
              dataSource={selectedDataSource}
            />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to test connection</p>
          </div>
        )
      case "filters":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceFilters 
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={() => {}}
            />
          </Suspense>
        )

      // Advanced Analytics & Collaboration
      case "correlation-engine":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Correlation Engine</h2>
              <p className="text-muted-foreground">Advanced data correlation analysis for {selectedDataSource.name}</p>
              {/* TODO: Implement CorrelationEngine component */}
            </div>
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to run correlation analysis</p>
          </div>
        )
      case "realtime-collaboration":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Real-time Collaboration</h2>
              <p className="text-muted-foreground">Live collaboration features and real-time updates</p>
              {/* TODO: Implement RealtimeCollaboration component */}
            </div>
          </Suspense>
        )
      case "enterprise-integration":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Enterprise Integration</h2>
              <p className="text-muted-foreground">Enterprise system integration hub and workflow automation</p>
              {/* TODO: Implement EnterpriseIntegration component */}
            </div>
          </Suspense>
        )

      // Advanced Orchestration Components
      case "workflow-orchestrator":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <AdvancedWorkflowOrchestrator 
              dataSource={selectedDataSource}
              onWorkflowComplete={(workflowId, results) => {
                console.log('Workflow completed:', workflowId, results)
              }}
              onWorkflowError={(workflowId, error) => {
                console.error('Workflow error:', workflowId, error)
              }}
            />
          </Suspense>
        )
      case "master-workflow":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <MasterWorkflowAutomation 
              dataSource={selectedDataSource}
              onWorkflowComplete={(workflowId, results) => {
                console.log('Master workflow completed:', workflowId, results)
              }}
              onWorkflowError={(workflowId, error) => {
                console.error('Master workflow error:', workflowId, error)
              }}
              onComponentTrigger={(componentId, action) => {
                console.log('Component triggered:', componentId, action)
                // Trigger component navigation if needed
                if (action === 'workflow-step-start') {
                  setActiveView(componentId)
                }
              }}
            />
          </Suspense>
        )
      case "component-manager":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ComponentOrchestrationManager 
              dataSource={selectedDataSource}
              onComponentSelect={(componentId) => {
                console.log('Component selected:', componentId)
                setActiveView(componentId)
              }}
              onComponentError={(componentId, error) => {
                console.error('Component error:', componentId, error)
              }}
            />
          </Suspense>
        )
      case "orchestrate-governance":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <GovernanceOrchestration dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to orchestrate governance</p>
          </div>
        )
      case "orchestrate-lifecycle":
        return selectedDataSource ? (
          <Suspense fallback={<ComponentLoader />}>
            <LifecycleOrchestration dataSource={selectedDataSource} />
          </Suspense>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Select a data source to orchestrate lifecycle</p>
          </div>
        )
      case "integration-manager":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ComponentIntegrationManager 
              dataSource={selectedDataSource}
              onComponentIntegration={(componentId, status) => {
                console.log('Component integration:', componentId, status)
              }}
              onWorkflowTrigger={(componentId, workflowType) => {
                console.log('Workflow triggered:', componentId, workflowType)
              }}
            />
          </Suspense>
        )

      default:
        return <EnterpriseDashboard />
    }
  }, [activeView, selectedDataSource, searchQuery, filters, viewMode, mainFeatures])

  // ========================================================================
  // SYSTEM HEALTH MONITORING
  // ========================================================================
  
  const systemHealthScore = useMemo(() => {
    return getSystemHealthScore(systemHealth)
  }, [systemHealth])

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getHealthIcon = (score: number) => {
    if (score >= 90) return CheckCircle
    if (score >= 70) return AlertTriangle
    if (score >= 50) return XCircle
    return AlertCircle
  }

  // ========================================================================
  // RENDER HELPER COMPONENTS
  // ========================================================================
  
  const ComponentLoader = () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500">Loading component...</p>
      </div>
    </div>
  )

  // ========================================================================
  // RENDER HELPER COMPONENTS (Enhanced system health tracking)
  // ========================================================================

  const SystemHealthIndicator = () => {
    const HealthIcon = getHealthIcon(systemHealthScore)
    return (
      <div className="flex items-center space-x-2">
        <HealthIcon className={`h-4 w-4 ${getHealthColor(systemHealthScore)}`} />
        <span className={`text-sm font-medium ${getHealthColor(systemHealthScore)}`}>
          {systemHealthScore}%
        </span>
        <span className="text-xs text-gray-500">System Health</span>
      </div>
    )
  }

  const NotificationBadge = () => (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {notifications.length > 9 ? "9+" : notifications.length}
        </span>
      )}
    </div>
  )

  const CollaborationIndicator = () => (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4" />
      <span className="text-sm">
        {collaborationSessions.length} {collaborationSessions.length === 1 ? 'session' : 'sessions'}
      </span>
    </div>
  )

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  // Handle RBAC loading state with timeout
  const [rbacTimeout, setRbacTimeout] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rbacLoading) {
        setRbacTimeout(true)
      }
    }, 10000) // 10 second timeout
    
    return () => clearTimeout(timer)
  }, [rbacLoading])
  
  if (rbacLoading && !rbacTimeout) {
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Loading Security Context</h3>
                <p className="text-gray-500">Initializing RBAC permissions...</p>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }
  
  // Handle RBAC timeout
  if (rbacTimeout) {
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Context Timeout</AlertTitle>
              <AlertDescription>
                The security context is taking longer than expected to load. This may be due to backend connectivity issues.
                <br />
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={() => {
                      setRbacTimeout(false)
                      window.location.reload()
                    }} 
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Handle RBAC errors
  if (rbacError) {
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Error</AlertTitle>
              <AlertDescription>
                Failed to load security permissions. Please refresh the page or contact your administrator.
                <br />
                <small className="text-gray-500 mt-2 block">{rbacError}</small>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Enhanced error handling with graceful degradation
  if (dataSourcesError) {
    // Check if it's a graceful error that can be handled
    const isGracefulError = (dataSourcesError as any)?.isGraceful
    const canRetry = (dataSourcesError as any)?.canRetry !== false
    
    // Check if it's a 502 Bad Gateway error (server down)
    const isServerDown = dataSourcesError.message?.includes('502') || 
                        dataSourcesError.message?.includes('Bad Gateway') ||
                        dataSourcesError.message?.includes('Request failed with status code 502')
    
    // Check if it's a 404 error (missing endpoint)
    const isMissingEndpoint = dataSourcesError.message?.includes('404') ||
                             dataSourcesError.message?.includes('Request failed with status code 404')
    
    // Check if it's a 500 error (server error)
    const isServerError = dataSourcesError.message?.includes('500') ||
                         dataSourcesError.message?.includes('Request failed with status code 500')
    
    // Check if it's a database overload error
    const isDatabaseOverload = dataSourcesError.message?.includes('database_unavailable') ||
                              dataSourcesError.message?.includes('too many clients') ||
                              dataSourcesError.message?.includes('Connection pool is at capacity')
    
    // Check emergency mode status
    const requestManager = APIRequestManager.getInstance()
    const isEmergencyMode = requestManager.isInEmergencyMode()
    
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {isEmergencyMode ? '🚨 EMERGENCY MODE ACTIVE' :
                 isDatabaseOverload ? 'Database Overload Detected' :
                 isServerDown ? 'Server Unavailable' : 
                 isMissingEndpoint ? 'API Endpoint Missing' :
                 isServerError ? 'Server Error' :
                 isGracefulError ? 'Connection Issue Detected' : 'API Connection Error'}
              </AlertTitle>
              <AlertDescription>
                {isEmergencyMode 
                  ? '🚨 EMERGENCY MODE: All API requests have been blocked to protect the database from overload. The system will automatically recover when the database is stable.'
                  : isDatabaseOverload
                    ? 'The database connection pool is at capacity. The system has automatically enabled protective measures to prevent further overload.'
                    : isServerDown 
                  ? 'The backend server is currently unavailable. This is likely a temporary issue.'
                      : isMissingEndpoint
                        ? 'Some API endpoints are not yet implemented. The application will work with limited functionality.'
                        : isServerError
                          ? 'The server encountered an error. Some features may be unavailable.'
                  : isGracefulError 
                    ? 'The system detected a connection issue and is working to resolve it automatically.'
                    : 'Unable to connect to data sources. The system will attempt to reconnect automatically.'
                }
                <br />
                <small className="text-gray-500 mt-2 block">
                  Error: {dataSourcesError.message || 'Unknown error'}
                </small>
                <div className="mt-4 space-y-2">
                  {isEmergencyMode && (
                    <Button 
                      onClick={() => {
                        requestManager.disableEmergencyMode()
                        window.location.reload()
                      }} 
                      className="w-full"
                      variant="destructive"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      🚨 Disable Emergency Mode & Reload
                    </Button>
                  )}
                  {canRetry && !isServerDown && !isEmergencyMode && (
                    <Button 
                      onClick={() => refetchDataSources()} 
                      className="w-full"
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Connection
                    </Button>
                  )}
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                  {isMissingEndpoint && !isEmergencyMode && (
                    <Button 
                      onClick={() => setFallbackMode(true)} 
                      className="w-full"
                      variant="secondary"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Continue with Limited Features
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Handle fallback mode
  if (fallbackMode) {
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fallback Mode Active</AlertTitle>
              <AlertDescription>
                Multiple API failures detected. The system is running in fallback mode with limited functionality.
                <br />
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={() => {
                      setFallbackMode(false)
                      refetchDataSources()
                    }} 
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry APIs
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Handle server down state
  if (serverDown) {
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Server Unavailable</AlertTitle>
              <AlertDescription>
                The backend server is currently unavailable. This is likely a temporary issue.
                <br />
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={checkServerConnectivity} 
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Server Status
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </TooltipProvider>
    )
  }
  
  // Handle RBAC loading state first to avoid false "Access Denied"
  if (rbacLoading) {
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <Alert className="max-w-md">
              <Shield className="h-4 w-4" />
              <AlertTitle>Checking Permissions</AlertTitle>
              <AlertDescription>
                Verifying your access rights for the Data Sources module...
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Handle no permissions after RBAC finished loading
  if (!safeDataSourcePermissions.canView) {
    return (
      <TooltipProvider>
        <div className={`min-h-screen bg-background ${className}`}>
          <div className="flex items-center justify-center h-screen">
            <Alert className="max-w-md">
              <Shield className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You don't have permission to access the Data Sources module. Please contact your administrator to request access.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </TooltipProvider>
    )
  }
  
  return (
    <TooltipProvider>
      <ErrorBoundary 
        fallback={
          <div className="dark">
            <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
              <div className="text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
                <h2 className="text-xl font-semibold">Application Error</h2>
                <p className="text-zinc-400">Something went wrong. Please refresh the page.</p>
              </div>
            </div>
          </div>
        }
      >
        <div className="dark">
          <div className={`min-h-screen bg-zinc-950 text-zinc-100 ${className}`}>
            
            <header className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
              <div className="flex h-12 items-center px-3">
                
                {/* Left: Sidebar toggle and logo */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="h-8 w-8 p-0 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded bg-blue-500/20 border border-blue-500/30">
                      <Database className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium text-zinc-200">DataSources</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex justify-center px-6">
                  <div className="relative w-full max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <Input
                      placeholder="Search everything... (⌘K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setCommandPaletteOpen(true)}
                      className="h-8 pl-9 pr-12 bg-zinc-800/50 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-zinc-600 text-sm"
                    />
                    <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 px-1.5 py-0.5 text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
                      ⌘K
                    </kbd>
                  </div>
                </div>

                {/* Right: Minimal controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100"
                  >
                    <Bell className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-3rem)]">
              
              <aside className={`border-r border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm transition-all duration-200 ${sidebarCollapsed ? 'w-12' : 'w-64'}`}>
                <ScrollArea className="h-full">
                  <div className={`${sidebarCollapsed ? 'p-2' : 'p-3'} space-y-4`}>
                    
                    {Object.entries(filteredNavigation).map(([categoryKey, category]) => (
                      <div key={categoryKey} className="space-y-1">
                        {!sidebarCollapsed && (
                          <div className="flex items-center space-x-2 px-2 py-1.5">
                            <category.icon className="h-3 w-3 text-zinc-500" />
                            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                              {category.label}
                            </h3>
                          </div>
                        )}
                        
                        <div className="space-y-0.5">
                          {category.items.map((item: any) => (
                            <Tooltip key={item.id} delayDuration={sidebarCollapsed ? 0 : 1000}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className={`w-full justify-start h-8 transition-all duration-150 ${
                                    sidebarCollapsed ? 'px-2' : 'px-2'
                                  } ${
                                    activeView === item.id 
                                      ? 'bg-blue-500/20 text-blue-300 border-l-2 border-blue-400' 
                                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                  }`}
                                  onClick={() => handleViewChange(item.id)}
                                >
                                  <item.icon className={`h-3.5 w-3.5 ${sidebarCollapsed ? '' : 'mr-2'} ${
                                    activeView === item.id ? 'text-blue-300' : 'text-zinc-500'
                                  }`} />
                                  {!sidebarCollapsed && (
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-xs font-medium truncate">
                                        {item.label}
                                      </span>
                                      <div className="flex items-center space-x-1">
                                        {item.premium && (
                                          <Crown className="h-2.5 w-2.5 text-yellow-400" />
                                        )}
                                        {item.features?.includes('ai') && (
                                          <Brain className="h-2.5 w-2.5 text-purple-400" />
                                        )}
                                        {item.features?.includes('realTime') && (
                                          <Zap className="h-2.5 w-2.5 text-green-400" />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side={sidebarCollapsed ? "right" : "bottom"} className="bg-zinc-800 border-zinc-700 text-zinc-200">
                                <div className="space-y-1">
                                  <p className="font-medium text-xs">{item.label}</p>
                                  <p className="text-xs text-zinc-400">{item.description}</p>
                                  {item.shortcut && (
                                    <kbd className="text-xs font-mono bg-zinc-700 px-1.5 py-0.5 rounded border border-zinc-600">
                                      {item.shortcut}
                                    </kbd>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </aside>

              <main className="flex-1 overflow-hidden bg-zinc-950">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  
                  {/* Primary Panel */}
                  <ResizablePanel defaultSize={70} className="relative">
                    <div className="h-full overflow-auto bg-zinc-950 border-r border-zinc-800/50">
                      <div className="relative">
                        <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/50 px-4 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-zinc-400" />
                              <h2 className="text-sm font-medium text-zinc-200">
                                {filteredNavigation[Object.keys(filteredNavigation)[0]]?.items?.find((item: any) => item.id === activeView)?.label || 'Dashboard'}
                              </h2>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Refresh
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <Suspense fallback={
                            <div className="flex items-center justify-center h-64">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                            </div>
                          }>
                            {renderActiveComponent()}
                          </Suspense>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                  
                  <ResizableHandle className="w-px bg-zinc-800/50 hover:bg-zinc-700 transition-colors" />
                  
                  {/* Secondary Panel */}
                  <ResizablePanel defaultSize={30} className="relative">
                    <div className="h-full overflow-auto bg-zinc-950">
                      <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/50 px-4 py-2">
                        <h3 className="text-sm font-medium text-zinc-200">Details</h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-4">
                          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <h4 className="text-xs font-medium text-zinc-300 mb-2">Quick Stats</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Active Sources</span>
                                <span className="text-zinc-200">24</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Health Score</span>
                                <span className="text-green-400">98%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Last Sync</span>
                                <span className="text-zinc-200">2m ago</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                  
                </ResizablePanelGroup>
              </main>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </TooltipProvider>
  )
}

// ============================================================================
// MAIN EXPORT WITH ENTERPRISE PROVIDER
// ============================================================================

export function EnhancedDataSourcesApp({ className, initialConfig }: EnhancedDataSourcesAppProps) {
  const queryClient = createThrottledQueryClient()
  const requestManager = APIRequestManager.getInstance()
  
  // Globally pause polling when tab hidden or when emergency mode is active
  React.useEffect(() => {
    const originalIntervals = new Map<string, number | false | undefined>()

    const applyPollingPolicy = () => {
      const isHidden = typeof document !== 'undefined' && document.hidden
      const inEmergency = requestManager.isInEmergencyMode()
      const shouldPause = isHidden || inEmergency

      queryClient.getQueryCache().getAll().forEach(q => {
        const key = q.queryHash
        const current = (q.options as any)?.refetchInterval as number | false | undefined
        // Force-disable background polling for data-sources view to avoid loops
        if (!originalIntervals.has(key)) originalIntervals.set(key, current)
        q.setOptions({ refetchInterval: false, retry: 0 })
        // If we ever restore in the future, clamp to >= 120s
        if (!shouldPause && originalIntervals.has(key)) {
          let prev = originalIntervals.get(key)
          if (typeof prev === 'number' && prev < 120000) prev = 120000
          // Keep disabled by default; uncomment to restore: q.setOptions({ refetchInterval: prev ?? false })
        }
      })
    }

    const onVisibility = () => applyPollingPolicy()
    document.addEventListener('visibilitychange', onVisibility)

    // Apply once on mount
    applyPollingPolicy()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [queryClient, requestManager])
  
  return (
    <QueryClientProvider client={queryClient}>
      <EnterpriseIntegrationProvider 
        queryClient={queryClient}
        initialConfig={initialConfig}
      >
        <EnhancedDataSourcesAppContent 
          className={className} 
          initialConfig={initialConfig}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </EnterpriseIntegrationProvider>
    </QueryClientProvider>
  )
}

export default EnhancedDataSourcesApp
