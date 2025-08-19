"use client"

import { useState, useEffect, Suspense, useCallback, useMemo, createContext, useContext } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  Database,
  Settings,
  Activity,
  TrendingUp,
  Users,
  Shield,
  Cloud,
  Search,
  BarChart3,
  Eye,
  Zap,
  Target,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  HelpCircle,
  User,
  LogOut,
  Monitor,
  Palette,
  Globe,
  Lock,
  Building,
  FileText,
  MessageSquare,
  Star,
  Grid,
  List,
  Layers,
  GitBranch,
  Workflow,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  PanelLeftOpen,
  PanelRightOpen,
  SplitSquareHorizontal,
  Layout,
  Command,
  Cpu,
  HardDrive,
  Network,
  Gauge,
  LineChart,
  PieChart,
  AreaChart,
  TestTube,
  Beaker,
  Microscope,
  Cog,
  Wrench,
  Tool,
  Package,
  Server,
  CircuitBoard,
  Boxes,
  Archive,
  FolderOpen,
  Folder,
  File,
  Code2,
  Terminal,
  Bug,
  Sparkles,
  Rocket,
  Flame,
  Lightbulb,
  Brain,
  Bot,
  Radar,
  Crosshair,
  Focus,
  Scan,
  SearchX,
  ScanLine,
  Binary,
  Hash,
  Type,
  Key,
  ShieldCheck,
  UserCheck,
  Crown,
  Badge as BadgeIcon,
  Award,
  Medal,
  Trophy,
  Flag,
  Bookmark,
  Heart,
  ThumbsUp,
  Smile,
  Frown,
  AlertCircle,
  XCircle,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Route,
  Map,
  MapPin,
  Navigation,
  Compass,
  TreePine,
  Workflow as WorkflowIcon,
} from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Command as CommandComponent,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Import ALL data-sources components (Main Directory)
import { DataSourceList } from "./data-source-list"
import { DataSourceGrid } from "./data-source-grid"
import { DataSourceDetails } from "./data-source-details"
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

// Import ALL data-discovery subdirectory components
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace"
import { DataLineageGraph } from "./data-discovery/data-lineage-graph"
import { SchemaDiscovery } from "./data-discovery/schema-discovery"

// Import remaining components (create them if they don't exist)
const DataSourceComplianceView = React.lazy(() => import("./data-source-compliance-view").catch(() => ({ default: () => <div>Compliance View - Component not found</div> })))
const DataSourceSecurityView = React.lazy(() => import("./data-source-security-view").catch(() => ({ default: () => <div>Security View - Component not found</div> })))
const DataSourcePerformanceView = React.lazy(() => import("./data-source-performance-view").catch(() => ({ default: () => <div>Performance View - Component not found</div> })))
const DataSourceScanResults = React.lazy(() => import("./data-source-scan-results").catch(() => ({ default: () => <div>Scan Results - Component not found</div> })))
const DataSourceTagsManager = React.lazy(() => import("./data-source-tags-manager").catch(() => ({ default: () => <div>Tags Manager - Component not found</div> })))
const DataSourceVersionHistory = React.lazy(() => import("./data-source-version-history").catch(() => ({ default: () => <div>Version History - Component not found</div> })))
const DataSourceBackupRestore = React.lazy(() => import("./data-source-backup-restore").catch(() => ({ default: () => <div>Backup & Restore - Component not found</div> })))
const DataSourceAccessControl = React.lazy(() => import("./data-source-access-control").catch(() => ({ default: () => <div>Access Control - Component not found</div> })))
const DataSourceNotifications = React.lazy(() => import("./data-source-notifications").catch(() => ({ default: () => <div>Notifications - Component not found</div> })))
const DataSourceReports = React.lazy(() => import("./data-source-reports").catch(() => ({ default: () => <div>Reports - Component not found</div> })))
const DataSourceScheduler = React.lazy(() => import("./data-source-scheduler").catch(() => ({ default: () => <div>Scheduler - Component not found</div> })))
const DataSourceIntegrations = React.lazy(() => import("./data-source-integrations").catch(() => ({ default: () => <div>Integrations - Component not found</div> })))
const DataSourceCatalog = React.lazy(() => import("./data-source-catalog").catch(() => ({ default: () => <div>Catalog - Component not found</div> })))

// Types and services - FULL BACKEND INTEGRATION (NO MOCK DATA)
import { DataSource, ViewMode, PanelLayout, WorkspaceContext as WorkspaceContextType } from "./types"
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
  
  // NEW ENTERPRISE APIs - REAL BACKEND INTEGRATION 
  // Collaboration APIs
  useCollaborationWorkspacesQuery,
  useActiveCollaborationSessionsQuery,
  // Workflow APIs  
  useWorkflowDefinitionsQuery,
  useWorkflowExecutionsQuery,
  usePendingApprovalsQuery,
  useWorkflowTemplatesQuery,
  // Enhanced Performance APIs
  useSystemHealthQuery,
  useEnhancedPerformanceMetricsQuery,
  usePerformanceAlertsQuery,
  usePerformanceTrendsQuery,
  useOptimizationRecommendationsQuery,
  usePerformanceSummaryReportQuery,
  // Enhanced Security APIs
  useEnhancedSecurityAuditQuery,
  useVulnerabilityAssessmentsQuery,
  useSecurityIncidentsQuery,
  useComplianceChecksQuery,
  useThreatDetectionQuery,
  useSecurityAnalyticsDashboardQuery,
  useRiskAssessmentReportQuery,
} from "./services/enterprise-apis"

// Create a new QueryClient instance with comprehensive error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Query error:', error)
        // Global error handling for API failures
      }
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        console.error('Mutation error:', error)
        // Global error handling for mutation failures
      }
    },
  },
})

// Advanced workspace context for cross-component communication
const WorkspaceContext = createContext<WorkspaceContextType>({
  selectedDataSource: null,
  setSelectedDataSource: () => {},
  activeView: "overview",
  setActiveView: () => {},
  layout: "standard",
  setLayout: () => {},
  panels: [],
  setPanels: () => {},
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  selectedItems: [],
  setSelectedItems: () => {},
  filters: {},
  setFilters: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  viewMode: "grid",
  setViewMode: () => {},
  expandedPanels: new Set(),
  togglePanel: () => {},
  quickActions: [],
  addQuickAction: () => {},
  removeQuickAction: () => {},
})

// COMPREHENSIVE navigation structure with ALL components
const navigationStructure = {
  core: {
    label: "Core Management",
    icon: Database,
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: Eye,
        component: "overview",
        description: "Comprehensive data sources overview",
        shortcut: "⌘+1",
      },
      {
        id: "grid",
        label: "Grid View", 
        icon: Grid,
        component: "grid",
        description: "Visual grid layout of data sources",
        shortcut: "⌘+2",
      },
      {
        id: "list", 
        label: "List View",
        icon: List,
        component: "list", 
        description: "Detailed list view with filters",
        shortcut: "⌘+3",
      },
      {
        id: "details",
        label: "Details",
        icon: FileText,
        component: "details",
        description: "In-depth data source analysis",
        shortcut: "⌘+4",
      },
    ]
  },
  monitoring: {
    label: "Monitoring & Analytics",
    icon: Activity,
    items: [
      {
        id: "monitoring",
        label: "Real-time Monitoring",
        icon: Monitor,
        component: "monitoring",
        description: "Live health and performance metrics",
        shortcut: "⌘+M",
      },
      {
        id: "dashboard",
        label: "Monitoring Dashboard",
        icon: BarChart3,
        component: "dashboard",
        description: "Comprehensive monitoring dashboards",
        shortcut: "⌘+D",
      },
      {
        id: "performance",
        label: "Performance Analytics",
        icon: Zap,
        component: "performance",
        description: "Performance insights and optimization",
        shortcut: "⌘+P",
      },
      {
        id: "quality",
        label: "Quality Analytics",
        icon: Shield,
        component: "quality",
        description: "Data quality metrics and scoring",
        shortcut: "⌘+Q",
      },
      {
        id: "growth",
        label: "Growth Analytics",
        icon: TrendingUp,
        component: "growth",
        description: "Growth patterns and predictions",
        shortcut: "⌘+G",
      },
    ]
  },
  discovery: {
    label: "Discovery & Governance",
    icon: Search,
    items: [
      {
        id: "discovery",
        label: "Data Discovery",
        icon: Scan,
        component: "discovery",
        description: "Automated data asset discovery",
        shortcut: "⌘+F",
      },
      {
        id: "discovery-workspace",
        label: "Discovery Workspace",
        icon: FolderOpen,
        component: "discovery-workspace",
        description: "Interactive discovery workspace",
        shortcut: "⌘+W",
      },
      {
        id: "schema-discovery",
        label: "Schema Discovery",
        icon: TreePine,
        component: "schema-discovery",
        description: "Automated schema discovery and mapping",
        shortcut: "⌘+H",
      },
      {
        id: "data-lineage",
        label: "Data Lineage",
        icon: WorkflowIcon,
        component: "data-lineage",
        description: "Data lineage visualization and tracking",
        shortcut: "⌘+L",
      },
      {
        id: "scan-results",
        label: "Scan Results",
        icon: ScanLine,
        component: "scan-results",
        description: "Detailed scan results and findings",
        shortcut: "⌘+S",
      },
      {
        id: "compliance",
        label: "Compliance",
        icon: ShieldCheck,
        component: "compliance",
        description: "Compliance monitoring and reporting",
        shortcut: "⌘+C",
      },
      {
        id: "security",
        label: "Security",
        icon: Lock,
        component: "security",
        description: "Security assessment and controls",
        shortcut: "⌘+E",
      },
    ]
  },
  management: {
    label: "Configuration & Management",
    icon: Settings,
    items: [
      {
        id: "cloud-config",
        label: "Cloud Configuration",
        icon: Cloud,
        component: "cloud-config",
        description: "Multi-cloud provider settings",
        shortcut: "⌘+K",
      },
      {
        id: "access-control",
        label: "Access Control",
        icon: UserCheck,
        component: "access-control",
        description: "User permissions and roles",
        shortcut: "⌘+A",
      },
      {
        id: "tags",
        label: "Tags Manager",
        icon: Hash,
        component: "tags",
        description: "Organize with tags and labels",
        shortcut: "⌘+T",
      },
      {
        id: "scheduler",
        label: "Task Scheduler",
        icon: Calendar,
        component: "scheduler",
        description: "Automated tasks and scheduling",
        shortcut: "⌘+J",
      },
    ]
  },
  collaboration: {
    label: "Collaboration & Sharing",
    icon: Users,
    items: [
      {
        id: "workspaces",
        label: "Workspaces",
        icon: Building,
        component: "workspaces",
        description: "Team collaboration spaces",
        shortcut: "⌘+U",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        component: "notifications",
        description: "Alerts and notification center",
        shortcut: "⌘+N",
      },
      {
        id: "reports",
        label: "Reports",
        icon: FileText,
        component: "reports",
        description: "Generated reports and exports",
        shortcut: "⌘+R",
      },
      {
        id: "version-history",
        label: "Version History",
        icon: GitBranch,
        component: "version-history",
        description: "Configuration change history",
        shortcut: "⌘+V",
      },
    ]
  },
  operations: {
    label: "Operations & Maintenance",
    icon: Tool,
    items: [
      {
        id: "backup-restore",
        label: "Backup & Restore",
        icon: Archive,
        component: "backup-restore",
        description: "Data backup and recovery",
        shortcut: "⌘+B",
      },
      {
        id: "bulk-actions",
        label: "Bulk Operations",
        icon: Layers,
        component: "bulk-actions",
        description: "Mass operations on data sources",
        shortcut: "⌘+Y",
      },
    ]
  }
}

// Advanced layout configurations
const layoutConfigurations = {
  standard: { 
    name: "Standard", 
    icon: Layout, 
    panels: [{ id: "main", size: 100 }] 
  },
  split: { 
    name: "Split View", 
    icon: SplitSquareHorizontal, 
    panels: [{ id: "main", size: 70 }, { id: "secondary", size: 30 }] 
  },
  dashboard: { 
    name: "Dashboard", 
    icon: BarChart3, 
    panels: [{ id: "overview", size: 40 }, { id: "details", size: 35 }, { id: "metrics", size: 25 }] 
  },
  analysis: { 
    name: "Analysis", 
    icon: LineChart, 
    panels: [{ id: "data", size: 50 }, { id: "analytics", size: 30 }, { id: "insights", size: 20 }] 
  }
}

interface DataSourcesAppProps {
  className?: string
}

// Advanced hook for cross-component communication
function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceContext.Provider")
  }
  return context
}

function DataSourcesAppContent({ className }: DataSourcesAppProps) {
  // Core state management
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [activeView, setActiveView] = useState("overview")
  const [layout, setLayout] = useState<keyof typeof layoutConfigurations>("standard")
  const [panels, setPanels] = useState([{ id: "main", size: 100, component: "overview" }])
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [expandedPanels, setExpandedPanels] = useState(new Set<string>())
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  
  // Advanced features
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState({})
  const [notifications, setNotifications] = useState<any[]>([])
  const [quickActions, setQuickActions] = useState<any[]>([])
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "connecting">("online")
  
  // Modal states
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    test: false,
    bulk: false,
    settings: false,
    help: false,
  })

  // COMPREHENSIVE Data fetching with full backend integration - NO MOCK DATA
  const { data: dataSources, isLoading: dataSourcesLoading, error: dataSourcesError, refetch: refetchDataSources } = useDataSourcesQuery({
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  })
  const { data: user, isLoading: userLoading } = useUserQuery()
  const { data: userNotifications } = useNotificationsQuery()
  const { data: workspace } = useWorkspaceQuery()
  const { data: metrics } = useDataSourceMetricsQuery(selectedDataSource?.id)
  
  // Core data source backend integrations
  const { data: dataSourceHealth } = useDataSourceHealthQuery(selectedDataSource?.id)
  const { data: connectionPoolStats } = useConnectionPoolStatsQuery(selectedDataSource?.id)
  const { data: discoveryHistory } = useDiscoveryHistoryQuery(selectedDataSource?.id)
  const { data: scanResults } = useScanResultsQuery(selectedDataSource?.id)
  const { data: qualityMetrics } = useQualityMetricsQuery(selectedDataSource?.id)
  const { data: growthMetrics } = useGrowthMetricsQuery(selectedDataSource?.id)
  const { data: schemaDiscoveryData } = useSchemaDiscoveryQuery(selectedDataSource?.id)
  const { data: dataLineage } = useDataLineageQuery(selectedDataSource?.id)
  const { data: backupStatus } = useBackupStatusQuery(selectedDataSource?.id)
  const { data: scheduledTasks } = useScheduledTasksQuery()
  const { data: auditLogs } = useAuditLogsQuery()
  const { data: userPermissions } = useUserPermissionsQuery()
  const { data: dataCatalog } = useDataCatalogQuery()

  // =====================================================================================
  // NEW ENTERPRISE APIs - REAL BACKEND INTEGRATION (NO MOCK DATA)
  // =====================================================================================
  
  // COLLABORATION APIs
  const { data: collaborationWorkspaces } = useCollaborationWorkspacesQuery()
  const { data: activeCollaborationSessions } = useActiveCollaborationSessionsQuery()
  
  // WORKFLOW APIs
  const { data: workflowDefinitions } = useWorkflowDefinitionsQuery()
  const { data: workflowExecutions } = useWorkflowExecutionsQuery({ days: 7 })
  const { data: pendingApprovals } = usePendingApprovalsQuery()
  const { data: workflowTemplates } = useWorkflowTemplatesQuery()
  
  // ENHANCED PERFORMANCE APIs
  const { data: systemHealth } = useSystemHealthQuery(true) // Enhanced with detailed metrics
  const { data: enhancedPerformanceMetrics } = useEnhancedPerformanceMetricsQuery(
    selectedDataSource?.id || 0,
    { time_range: '24h', metric_types: ['cpu', 'memory', 'io', 'network'] }
  )
  const { data: performanceAlerts } = usePerformanceAlertsQuery({ severity: 'all', days: 7 })
  const { data: performanceTrends } = usePerformanceTrendsQuery(selectedDataSource?.id, '30d')
  const { data: optimizationRecommendations } = useOptimizationRecommendationsQuery(selectedDataSource?.id)
  const { data: performanceSummaryReport } = usePerformanceSummaryReportQuery({ time_range: '7d' })
  
  // ENHANCED SECURITY APIs
  const { data: enhancedSecurityAudit } = useEnhancedSecurityAuditQuery(
    selectedDataSource?.id || 0,
    { include_vulnerabilities: true, include_compliance: true }
  )
  const { data: vulnerabilityAssessments } = useVulnerabilityAssessmentsQuery({ severity: 'all' })
  const { data: securityIncidents } = useSecurityIncidentsQuery({ days: 30 })
  const { data: complianceChecks } = useComplianceChecksQuery()
  const { data: threatDetection } = useThreatDetectionQuery({ days: 7 })
  const { data: securityAnalyticsDashboard } = useSecurityAnalyticsDashboardQuery('7d')
  const { data: riskAssessmentReport } = useRiskAssessmentReportQuery()

  // Advanced effects
  useEffect(() => {
    if (dataSources && dataSources.length > 0 && !selectedDataSource) {
      setSelectedDataSource(dataSources[0])
    }
  }, [dataSources, selectedDataSource])

  // Connection status monitoring
  useEffect(() => {
    const checkConnectionStatus = () => {
      if (navigator.onLine) {
        setConnectionStatus("online")
      } else {
        setConnectionStatus("offline")
      }
    }

    window.addEventListener('online', checkConnectionStatus)
    window.addEventListener('offline', checkConnectionStatus)
    
    return () => {
      window.removeEventListener('online', checkConnectionStatus)
      window.removeEventListener('offline', checkConnectionStatus)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case "k":
            event.preventDefault()
            setCommandPaletteOpen(true)
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
          case "4":
            event.preventDefault()
            setActiveView("details")
            break
          case "m":
            event.preventDefault()
            setActiveView("monitoring")
            break
          case "d":
            event.preventDefault()
            setActiveView("dashboard")
            break
          case "f":
            event.preventDefault()
            setActiveView("discovery")
            break
          case "w":
            event.preventDefault()
            setActiveView("discovery-workspace")
            break
          case "h":
            event.preventDefault()
            setActiveView("schema-discovery")
            break
          case "l":
            event.preventDefault()
            setActiveView("data-lineage")
            break
          case "r":
            event.preventDefault()
            refetchDataSources()
            break
          // Add more shortcuts
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [refetchDataSources])

  // Workspace context value
  const workspaceContextValue = useMemo(() => ({
    selectedDataSource,
    setSelectedDataSource,
    activeView,
    setActiveView,
    layout,
    setLayout,
    panels,
    setPanels,
    notifications,
    addNotification: (notification: any) => setNotifications(prev => [...prev, notification]),
    removeNotification: (id: string) => setNotifications(prev => prev.filter(n => n.id !== id)),
    selectedItems,
    setSelectedItems,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    expandedPanels,
    togglePanel: (id: string) => {
      setExpandedPanels(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    },
    quickActions,
    addQuickAction: (action: any) => setQuickActions(prev => [...prev, action]),
    removeQuickAction: (id: string) => setQuickActions(prev => prev.filter(a => a.id !== id)),
  }), [
    selectedDataSource, activeView, layout, panels, notifications, selectedItems,
    filters, searchQuery, viewMode, expandedPanels, quickActions
  ])

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "text-green-500"
      case "error": return "text-red-500"
      case "warning": return "text-yellow-500"
      default: return "text-gray-500"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "connected": return "default"
      case "error": return "destructive"
      case "warning": return "secondary"
      default: return "outline"
    }
  }

  const openModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: true }))
  }

  const closeModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }))
  }

  // COMPREHENSIVE Component renderer with ALL components and full backend data
  const renderComponent = (componentId: string, panelId?: string) => {
    const commonProps = {
      dataSource: selectedDataSource,
      dataSources,
      onSelectDataSource: setSelectedDataSource,
      viewMode,
      onViewModeChange: setViewMode,
      selectedItems,
      onSelectionChange: setSelectedItems,
      filters,
      onFiltersChange: setFilters,
      
      // Backend data props
      health: dataSourceHealth,
      connectionPoolStats,
      discoveryHistory,
      scanResults,
      qualityMetrics,
      growthMetrics,
      schemaDiscoveryData,
      dataLineage,
      complianceStatus,
      securityAudit,
      performanceData,
      backupStatus,
      scheduledTasks,
      auditLogs,
      userPermissions,
      workspaceActivity,
      dataCatalog,
      metrics,
      workspace,
      user,
    }

    try {
      switch (componentId) {
        case "overview":
          return (
            <div className="space-y-6">
              <DataSourceDetails {...commonProps} />
              {selectedDataSource && <DataSourceMonitoringDashboard {...commonProps} />}
            </div>
          )
        case "grid":
          return <DataSourceGrid {...commonProps} />
        case "list":
          return <DataSourceList {...commonProps} />
        case "details":
          return selectedDataSource ? <DataSourceDetails {...commonProps} /> : <div>Select a data source</div>
        case "monitoring":
          return selectedDataSource ? <DataSourceMonitoring {...commonProps} /> : <div>Select a data source</div>
        case "dashboard":
          return <DataSourceMonitoringDashboard {...commonProps} />
        case "performance":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourcePerformanceView {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "quality":
          return selectedDataSource ? <DataSourceQualityAnalytics {...commonProps} /> : <div>Select a data source</div>
        case "growth":
          return selectedDataSource ? <DataSourceGrowthAnalytics {...commonProps} /> : <div>Select a data source</div>
        case "discovery":
          return selectedDataSource ? <DataSourceDiscovery {...commonProps} /> : <div>Select a data source</div>
        
        // NEW: Data Discovery Components
        case "discovery-workspace":
          return selectedDataSource ? <DataDiscoveryWorkspace {...commonProps} /> : <div>Select a data source</div>
        case "schema-discovery":
          return selectedDataSource ? <SchemaDiscovery {...commonProps} /> : <div>Select a data source</div>
        case "data-lineage":
          return selectedDataSource ? <DataLineageGraph {...commonProps} /> : <div>Select a data source</div>
        
        case "scan-results":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceScanResults {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "compliance":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceComplianceView {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "security":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceSecurityView {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "cloud-config":
          return selectedDataSource ? <DataSourceCloudConfig {...commonProps} /> : <div>Select a data source</div>
        case "access-control":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceAccessControl {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "tags":
          return (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceTagsManager {...commonProps} />
            </Suspense>
          )
        case "scheduler":
          return (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceScheduler {...commonProps} />
            </Suspense>
          )
        case "workspaces":
          return selectedDataSource ? <DataSourceWorkspaceManagement {...commonProps} /> : <div>Select a data source</div>
        case "notifications":
          return (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceNotifications {...commonProps} />
            </Suspense>
          )
        case "reports":
          return (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceReports {...commonProps} />
            </Suspense>
          )
        case "version-history":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceVersionHistory {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "backup-restore":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceBackupRestore {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "integrations":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceIntegrations {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "catalog":
          return selectedDataSource ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DataSourceCatalog {...commonProps} />
            </Suspense>
          ) : <div>Select a data source</div>
        case "bulk-actions":
          return <DataSourceBulkActions {...commonProps} />
        default:
          return <div>Component not found: {componentId}</div>
      }
    } catch (error) {
      console.error(`Error rendering component ${componentId}:`, error)
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load component: {componentId}
            <br />
            <small>{error instanceof Error ? error.message : "Unknown error"}</small>
          </AlertDescription>
        </Alert>
      )
    }
  }

  // Advanced sidebar component
  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "" : "border-r"}`}>
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {workspace && (
                  <Badge variant="outline" className="text-xs">
                    {workspace.name}
                  </Badge>
                )}
                {/* Connection Status Indicator */}
                <div className="flex items-center gap-1">
                  {connectionStatus === "online" ? (
                    <Signal className="h-3 w-3 text-green-500" />
                  ) : connectionStatus === "offline" ? (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  ) : (
                    <SignalMedium className="h-3 w-3 text-yellow-500 animate-pulse" />
                  )}
                  <span className="text-xs text-muted-foreground">{connectionStatus}</span>
                </div>
              </div>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openModal("settings")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Actions */}
      {(!sidebarCollapsed || mobile) && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => openModal("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCommandPaletteOpen(true)}>
              <Command className="h-4 w-4 mr-2" />
              Commands
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(navigationStructure).map(([categoryKey, category]) => (
            <Collapsible key={categoryKey} defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {(!sidebarCollapsed || mobile) && (
                    <span className="font-medium text-sm">{category.label}</span>
                  )}
                </div>
                {(!sidebarCollapsed || mobile) && <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-6">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <TooltipProvider key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start text-sm ${sidebarCollapsed && !mobile ? "px-2" : ""}`}
                            onClick={() => {
                              setActiveView(item.id)
                              if (mobile) setMobileMenuOpen(false)
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            {(!sidebarCollapsed || mobile) && (
                              <span className="ml-2 truncate">{item.label}</span>
                            )}
                            {(!sidebarCollapsed || mobile) && item.shortcut && (
                              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                                {item.shortcut}
                              </kbd>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.description}</p>
                          {item.shortcut && <p className="text-xs text-muted-foreground">{item.shortcut}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Data Sources List */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            {(!sidebarCollapsed || mobile) && (
              <h3 className="font-medium text-sm">Data Sources</h3>
            )}
            <Button variant="ghost" size="sm" onClick={() => openModal("create")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {dataSourcesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : dataSourcesError ? (
              <div className="p-2 text-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Failed to load</p>
                <Button variant="ghost" size="sm" onClick={() => refetchDataSources()}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              dataSources?.map((dataSource) => (
                <HoverCard key={dataSource.id}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant={selectedDataSource?.id === dataSource.id ? "secondary" : "ghost"}
                      className={`w-full justify-start ${sidebarCollapsed && !mobile ? "px-2" : ""}`}
                      onClick={() => {
                        setSelectedDataSource(dataSource)
                        if (mobile) setMobileMenuOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Database className="h-4 w-4 flex-shrink-0" />
                        {(!sidebarCollapsed || mobile) && (
                          <div className="flex-1 min-w-0 text-left">
                            <p className="truncate font-medium">{dataSource.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge
                                variant={getStatusBadgeVariant(dataSource.status)}
                                className="text-xs"
                              >
                                {dataSource.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {dataSource.type}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{dataSource.name}</h4>
                      <p className="text-sm text-muted-foreground">{dataSource.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Type: {dataSource.type}</div>
                        <div>Status: {dataSource.status}</div>
                        <div>Host: {dataSource.host}</div>
                        <div>Port: {dataSource.port}</div>
                      </div>
                      {metrics && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground">Health Score</div>
                          <Progress value={metrics.health_score} className="h-2" />
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* System Health */}
      {systemHealth && (!sidebarCollapsed || mobile) && (
        <div className="p-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>System Health</span>
              <Badge variant={systemHealth.status === "healthy" ? "default" : "destructive"}>
                {systemHealth.status}
              </Badge>
            </div>
            <Progress value={systemHealth.score} className="h-1" />
            <div className="text-xs text-muted-foreground">
              {dataSources?.length || 0} sources • {userNotifications?.length || 0} alerts
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      {!mobile && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )

  // Command Palette Component
  const CommandPalette = () => (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <CommandComponent>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(navigationStructure).map(([categoryKey, category]) => (
              <CommandGroup key={categoryKey} heading={category.label}>
                {category.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      setActiveView(item.id)
                      setCommandPaletteOpen(false)
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.shortcut && (
                      <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => { openModal("create"); setCommandPaletteOpen(false) }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Data Source
              </CommandItem>
              <CommandItem onSelect={() => { openModal("bulk"); setCommandPaletteOpen(false) }}>
                <Layers className="mr-2 h-4 w-4" />
                Bulk Actions
              </CommandItem>
              <CommandItem onSelect={() => { refetchDataSources(); setCommandPaletteOpen(false) }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandComponent>
      </DialogContent>
    </Dialog>
  )

  return (
    <WorkspaceContext.Provider value={workspaceContextValue}>
      <TooltipProvider>
        <div className={`flex h-screen bg-background ${className}`}>
          {/* Desktop Sidebar */}
          <div className={`hidden md:flex flex-col ${sidebarCollapsed ? "w-16" : "w-80"} transition-all duration-300`}>
            <Sidebar />
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center px-4 gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>

                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search data sources, metrics, or insights... (⌘K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={() => setCommandPaletteOpen(true)}
                      className="pl-10 cursor-pointer"
                      readOnly
                    />
                  </div>
                </div>

                {/* Layout Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {React.createElement(layoutConfigurations[layout].icon, { className: "h-4 w-4 mr-2" })}
                      {layoutConfigurations[layout].name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Layout</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={layout} onValueChange={(value) => setLayout(value as keyof typeof layoutConfigurations)}>
                      {Object.entries(layoutConfigurations).map(([key, config]) => (
                        <DropdownMenuRadioItem key={key} value={key}>
                          <config.icon className="h-4 w-4 mr-2" />
                          {config.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => refetchDataSources()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-4 w-4" />
                        {userNotifications && userNotifications.length > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                            {userNotifications.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <Separator />
                      {userNotifications && userNotifications.length > 0 ? (
                        userNotifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="flex-col items-start">
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground">{notification.message}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No new notifications
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal("help")}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help
                        <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openModal("settings")}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                        <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Breadcrumb & Quick Actions */}
              {selectedDataSource && (
                <div className="px-4 py-2 border-t bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>Data Sources</span>
                      <ChevronRight className="h-3 w-3 mx-1" />
                      <span className="font-medium text-foreground">{selectedDataSource.name}</span>
                      <ChevronRight className="h-3 w-3 mx-1" />
                      <span className="font-medium text-foreground">
                        {Object.values(navigationStructure)
                          .flatMap(cat => cat.items)
                          .find(item => item.id === activeView)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedItems.length > 0 && (
                        <Badge variant="secondary">
                          {selectedItems.length} selected
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openModal("bulk")}>
                        <Layers className="h-4 w-4 mr-2" />
                        Bulk Actions
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </header>

            {/* Main Content Area with Advanced Layout */}
            <main className="flex-1 overflow-hidden">
              {layout === "standard" ? (
                <div className="h-full p-6 overflow-auto">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      </div>
                    }
                  >
                    {dataSourcesError ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Data Sources</AlertTitle>
                        <AlertDescription>
                          Failed to load data sources. Please try again.
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchDataSources()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      renderComponent(activeView)
                    )}
                  </Suspense>
                </div>
              ) : (
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {layoutConfigurations[layout].panels.map((panel, index) => (
                    <React.Fragment key={panel.id}>
                      <ResizablePanel defaultSize={panel.size} minSize={20}>
                        <div className="h-full p-6 overflow-auto">
                          <Suspense fallback={<Skeleton className="h-full w-full" />}>
                            {renderComponent(panels[index]?.component || activeView, panel.id)}
                          </Suspense>
                        </div>
                      </ResizablePanel>
                      {index < layoutConfigurations[layout].panels.length - 1 && <ResizableHandle />}
                    </React.Fragment>
                  ))}
                </ResizablePanelGroup>
              )}
            </main>
          </div>

          {/* Command Palette */}
          <CommandPalette />

          {/* Modals */}
          <DataSourceCreateModal
            open={modals.create}
            onClose={() => closeModal("create")}
            onSuccess={() => closeModal("create")}
          />

          {selectedDataSource && (
            <DataSourceEditModal
              open={modals.edit}
              onClose={() => closeModal("edit")}
              dataSource={selectedDataSource}
              onSuccess={() => closeModal("edit")}
            />
          )}

          {selectedDataSource && (
            <DataSourceConnectionTestModal
              open={modals.test}
              onClose={() => closeModal("test")}
              dataSourceId={selectedDataSource.id}
              onTestConnection={() => {}}
            />
          )}

          <DataSourceBulkActions
            open={modals.bulk}
            onClose={() => closeModal("bulk")}
            selectedItems={selectedItems}
            dataSources={dataSources}
            onSuccess={() => {
              closeModal("bulk")
              setSelectedItems([])
            }}
          />

          {/* Advanced Filters Sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="hidden">Filters</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-96">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Fine-tune your data source view with advanced filtering options
                </SheetDescription>
              </SheetHeader>
              <DataSourceFilters
                filters={filters}
                onFiltersChange={setFilters}
                dataSources={dataSources}
              />
            </SheetContent>
          </Sheet>
        </div>
      </TooltipProvider>
    </WorkspaceContext.Provider>
  )
}

export function DataSourcesApp(props: DataSourcesAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataSourcesAppContent {...props} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// Export the workspace context for use in child components
export { WorkspaceContext, useWorkspaceContext }
