'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  DollarSign, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  LineChart,
  PieChart,
  Filter,
  Download,
  RefreshCcw,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Search,
  Bell,
  Info,
  Zap,
  Shield,
  Database,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Gauge,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  StopCircle,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Layers,
  Grid,
  List,
  Table,
  Card as CardIcon,
  Map,
  Share2,
  Link2,
  Copy,
  ExternalLink,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Send,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  User,
  Building,
  Briefcase,
  Award,
  Medal,
  Trophy,
  Crown,
  Gem,
  Sparkles,
  Flame,
  Zap as ZapIcon,
  Lightning,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Umbrella,
  Rainbow,
  Sunrise,
  Sunset
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  TreeMap,
  Sankey,
  Funnel,
  FunnelChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'

import { useReporting } from '../../hooks/useReporting'
import { useOrchestration } from '../../hooks/useOrchestration'
import { useOptimization } from '../../hooks/useOptimization'
import { useIntelligence } from '../../hooks/useIntelligence'
import { useCollaboration } from '../../hooks/useCollaboration'
import { useScanRules } from '../../hooks/useScanRules'
import { useValidation } from '../../hooks/useValidation'
import { usePatternLibrary } from '../../hooks/usePatternLibrary'

import { 
  ExecutiveDashboardMetrics,
  PerformanceKPIs,
  BusinessValueMetrics,
  ComplianceMetrics,
  ExecutiveInsight,
  ROIAnalysis,
  TrendData,
  ExecutiveAlert,
  StrategicGoal,
  ExecutiveAction,
  DashboardFilter,
  ExportOptions,
  TimeRangeFilter,
  DashboardPreferences,
  ExecutiveSummary,
  ResourceUtilization,
  CostAnalysis,
  RiskAssessment,
  OpportunityAnalysis,
  PerformanceBenchmark,
  InnovationMetrics,
  CustomerImpactMetrics,
  MarketPositionMetrics,
  OperationalEfficiency,
  QualityMetrics,
  SecurityMetrics,
  GovernanceMetrics,
  DataLineageMetrics,
  AutomationMetrics,
  CollaborationMetrics,
  UserAdoptionMetrics,
  TrainingMetrics,
  SupportMetrics,
  MaintenanceMetrics,
  ScalabilityMetrics,
  ReliabilityMetrics,
  AvailabilityMetrics,
  BackupMetrics,
  DisasterRecoveryMetrics,
  AuditMetrics,
  IntegrationMetrics,
  APIMetrics,
  DataQualityMetrics,
  DataGovernanceMetrics,
  DataPrivacyMetrics,
  DataSecurityMetrics,
  DataLifecycleMetrics,
  DataRetentionMetrics,
  DataMigrationMetrics,
  DataArchiveMetrics,
  DataBackupMetrics,
  DataRestoreMetrics
} from '../../types/reporting.types'

interface ExecutiveDashboardProps {
  className?: string
  onMetricsChange?: (metrics: ExecutiveDashboardMetrics) => void
  onExport?: (format: string, data: any) => void
  onDrillDown?: (metric: string, data: any) => void
  onAlertAction?: (alert: ExecutiveAlert, action: ExecutiveAction) => void
  realTimeEnabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  theme?: 'light' | 'dark' | 'auto'
  locale?: string
  timezone?: string
  currency?: string
}

const CHART_COLORS = {
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  gray: '#6b7280',
  accent: '#f97316'
}

const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  className = '',
  onMetricsChange,
  onExport,
  onDrillDown,
  onAlertAction,
  realTimeEnabled = true,
  autoRefresh = true,
  refreshInterval = 30000,
  theme = 'auto',
  locale = 'en-US',
  timezone = 'UTC',
  currency = 'USD'
}) => {
  // State Management
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeFilter>({
    period: 'last-30-days',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    granularity: 'daily'
  })
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilter[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [fullscreenMode, setFullscreenMode] = useState(false)
  const [showAlerts, setShowAlerts] = useState(true)
  const [alertsExpanded, setAlertsExpanded] = useState(false)
  const [kpiExpanded, setKpiExpanded] = useState(true)
  const [chartsExpanded, setChartsExpanded] = useState(true)
  const [summaryExpanded, setSummaryExpanded] = useState(true)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drillDownData, setDrillDownData] = useState<any>(null)
  const [selectedMetric, setSelectedMetric] = useState<string>('')
  const [compareMode, setCompareMode] = useState(false)
  const [comparisonPeriod, setComparisonPeriod] = useState<TimeRangeFilter | null>(null)
  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferences>({
    autoRefresh: true,
    refreshInterval: 30000,
    theme: 'auto',
    defaultTimeRange: 'last-30-days',
    defaultView: 'overview',
    enableNotifications: true,
    enableRealTime: true,
    chartAnimation: true,
    dataLabels: true,
    gridLines: true,
    tooltips: true,
    legend: true,
    colorScheme: 'default',
    fontSize: 'medium',
    compactMode: false,
    pinnedMetrics: [],
    hiddenSections: [],
    customLayout: null
  })

  // Refs
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<{ exportData: (format: string) => void } | null>(null)

  // Custom Hooks
  const {
    executiveDashboard,
    performanceKPIs,
    businessValueMetrics,
    complianceMetrics,
    executiveInsights,
    roiAnalysis,
    trendData,
    executiveAlerts,
    strategicGoals,
    executiveSummary,
    resourceUtilization,
    costAnalysis,
    riskAssessment,
    opportunityAnalysis,
    performanceBenchmarks,
    getExecutiveDashboard,
    getPerformanceKPIs,
    getBusinessValueMetrics,
    getComplianceMetrics,
    getExecutiveInsights,
    getROIAnalysis,
    getTrendData,
    getExecutiveAlerts,
    getStrategicGoals,
    getExecutiveSummary,
    getResourceUtilization,
    getCostAnalysis,
    getRiskAssessment,
    getOpportunityAnalysis,
    getPerformanceBenchmarks,
    exportExecutiveDashboard,
    subscribeToRealTimeMetrics,
    unsubscribeFromRealTimeMetrics,
    isExecutiveDashboardLoading,
    executiveDashboardError
  } = useReporting()

  const {
    orchestrationMetrics,
    getOrchestrationMetrics
  } = useOrchestration()

  const {
    optimizationMetrics,
    getOptimizationMetrics
  } = useOptimization()

  const {
    intelligenceMetrics,
    getIntelligenceMetrics
  } = useIntelligence()

  const {
    collaborationMetrics,
    getCollaborationMetrics
  } = useCollaboration()

  const {
    scanRulesMetrics,
    getScanRulesMetrics
  } = useScanRules()

  const {
    validationMetrics,
    getValidationMetrics
  } = useValidation()

  const {
    patternLibraryMetrics,
    getPatternLibraryMetrics
  } = usePatternLibrary()

  // Computed Values
  const consolidatedMetrics = useMemo<ExecutiveDashboardMetrics>(() => {
    if (!executiveDashboard) return {} as ExecutiveDashboardMetrics

    return {
      ...executiveDashboard,
      orchestration: orchestrationMetrics,
      optimization: optimizationMetrics,
      intelligence: intelligenceMetrics,
      collaboration: collaborationMetrics,
      scanRules: scanRulesMetrics,
      validation: validationMetrics,
      patternLibrary: patternLibraryMetrics,
      lastUpdated: new Date(),
      refreshRate: refreshInterval,
      dataFreshness: 'real-time'
    }
  }, [
    executiveDashboard,
    orchestrationMetrics,
    optimizationMetrics,
    intelligenceMetrics,
    collaborationMetrics,
    scanRulesMetrics,
    validationMetrics,
    patternLibraryMetrics,
    refreshInterval
  ])

  const criticalAlerts = useMemo(() => {
    if (!executiveAlerts) return []
    return executiveAlerts.filter(alert => alert.severity === 'critical')
  }, [executiveAlerts])

  const highPriorityGoals = useMemo(() => {
    if (!strategicGoals) return []
    return strategicGoals.filter(goal => goal.priority === 'high')
  }, [strategicGoals])

  const topRisks = useMemo(() => {
    if (!riskAssessment?.risks) return []
    return riskAssessment.risks
      .sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact))
      .slice(0, 5)
  }, [riskAssessment])

  const topOpportunities = useMemo(() => {
    if (!opportunityAnalysis?.opportunities) return []
    return opportunityAnalysis.opportunities
      .sort((a, b) => (b.value * b.feasibility) - (a.value * a.feasibility))
      .slice(0, 5)
  }, [opportunityAnalysis])

  // Data Loading Functions
  const loadDashboardData = useCallback(async (force = false) => {
    if (isLoading && !force) return
    
    setIsLoading(true)
    try {
      await Promise.all([
        getExecutiveDashboard({
          timeRange: selectedTimeRange,
          filters: dashboardFilters,
          includeComparison: compareMode,
          comparisonPeriod: comparisonPeriod
        }),
        getPerformanceKPIs({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getBusinessValueMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getComplianceMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getExecutiveInsights({
          timeRange: selectedTimeRange,
          filters: dashboardFilters,
          limit: 10
        }),
        getROIAnalysis({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getTrendData({
          timeRange: selectedTimeRange,
          filters: dashboardFilters,
          metrics: ['performance', 'business-value', 'compliance', 'roi']
        }),
        getExecutiveAlerts({
          timeRange: selectedTimeRange,
          filters: dashboardFilters,
          severities: ['critical', 'high', 'medium']
        }),
        getStrategicGoals({
          timeRange: selectedTimeRange,
          filters: dashboardFilters,
          status: 'active'
        }),
        getExecutiveSummary({
          timeRange: selectedTimeRange,  
          filters: dashboardFilters
        }),
        getResourceUtilization({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getCostAnalysis({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getRiskAssessment({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getOpportunityAnalysis({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getPerformanceBenchmarks({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getOrchestrationMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getOptimizationMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getIntelligenceMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getCollaborationMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getScanRulesMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getValidationMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        }),
        getPatternLibraryMetrics({
          timeRange: selectedTimeRange,
          filters: dashboardFilters
        })
      ])

      if (onMetricsChange) {
        onMetricsChange(consolidatedMetrics)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [
    selectedTimeRange,
    dashboardFilters,
    compareMode,
    comparisonPeriod,
    onMetricsChange,
    consolidatedMetrics,
    isLoading
  ])

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true)
    await loadDashboardData(true)
    setIsRefreshing(false)
  }, [loadDashboardData])

  // Event Handlers
  const handleTimeRangeChange = useCallback((newTimeRange: TimeRangeFilter) => {
    setSelectedTimeRange(newTimeRange)
  }, [])

  const handleFilterChange = useCallback((newFilters: DashboardFilter[]) => {
    setDashboardFilters(newFilters)
  }, [])

  const handleExport = useCallback(async (format: string) => {
    if (onExport) {
      await onExport(format, {
        metrics: consolidatedMetrics,
        timeRange: selectedTimeRange,
        filters: dashboardFilters,
        timestamp: new Date()
      })
    } else {
      await exportExecutiveDashboard({
        format,
        data: consolidatedMetrics,
        timeRange: selectedTimeRange,
        filters: dashboardFilters
      })
    }
    setExportDialogOpen(false)
  }, [onExport, consolidatedMetrics, selectedTimeRange, dashboardFilters, exportExecutiveDashboard])

  const handleDrillDown = useCallback((metric: string, data: any) => {
    setSelectedMetric(metric)
    setDrillDownData(data)
    if (onDrillDown) {
      onDrillDown(metric, data)
    }
  }, [onDrillDown])

  const handleAlertAction = useCallback((alert: ExecutiveAlert, actionType: string) => {
    const action: ExecutiveAction = {
      type: actionType as any,
      alertId: alert.id,
      userId: 'current-user',
      timestamp: new Date(),
      context: {
        dashboardSection: activeTab,
        timeRange: selectedTimeRange,
        filters: dashboardFilters
      }
    }

    if (onAlertAction) {
      onAlertAction(alert, action)
    }
  }, [onAlertAction, activeTab, selectedTimeRange, dashboardFilters])

  const handleFullscreenToggle = useCallback(() => {
    setFullscreenMode(!fullscreenMode)
    if (!fullscreenMode) {
      dashboardRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [fullscreenMode])

  const handlePreferencesChange = useCallback((newPreferences: Partial<DashboardPreferences>) => {
    setDashboardPreferences(prev => ({
      ...prev,
      ...newPreferences
    }))
  }, [])

  // Effects
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    if (autoRefresh && dashboardPreferences.autoRefresh) {
      refreshTimeoutRef.current = setInterval(refreshDashboard, dashboardPreferences.refreshInterval)
      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current)
        }
      }
    }
  }, [autoRefresh, dashboardPreferences.autoRefresh, dashboardPreferences.refreshInterval, refreshDashboard])

  useEffect(() => {
    if (realTimeEnabled && dashboardPreferences.enableRealTime) {
      const unsubscribe = subscribeToRealTimeMetrics((updatedMetrics) => {
        // Handle real-time metric updates
        if (onMetricsChange) {
          onMetricsChange(updatedMetrics)
        }
      })

      return () => {
        unsubscribe()
      }
    }
  }, [realTimeEnabled, dashboardPreferences.enableRealTime, subscribeToRealTimeMetrics, onMetricsChange])

  // Render Helper Functions
  const renderKPICard = useCallback((
    title: string, 
    value: string | number, 
    change: number, 
    trend: 'up' | 'down' | 'neutral',
    icon: React.ReactNode,
    description?: string,
    target?: number
  ) => {
    const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
    const trendIcon = trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                     trend === 'down' ? <TrendingDown className="h-4 w-4" /> : 
                     <Activity className="h-4 w-4" />

    return (
      <motion.div
        variants={ANIMATION_VARIANTS.scaleIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            <div className="flex items-center space-x-1 mt-2">
              <span className={`text-xs ${changeColor} flex items-center`}>
                {trendIcon}
                <span className="ml-1">
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
              </span>
              <span className="text-xs text-muted-foreground">from last period</span>
            </div>
            {target && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress to Target</span>
                  <span>{((typeof value === 'number' ? value : parseFloat(value.toString())) / target * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={(typeof value === 'number' ? value : parseFloat(value.toString())) / target * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }, [])

  const renderAlertCard = useCallback((alert: ExecutiveAlert) => {
    const severityColors = {
      critical: 'border-red-500 bg-red-50',
      high: 'border-orange-500 bg-orange-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-blue-500 bg-blue-50'
    }

    const severityIcons = {
      critical: <XCircle className="h-4 w-4 text-red-600" />,
      high: <AlertTriangle className="h-4 w-4 text-orange-600" />,
      medium: <Info className="h-4 w-4 text-yellow-600" />,
      low: <Bell className="h-4 w-4 text-blue-600" />
    }

    return (
      <motion.div
        key={alert.id}
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Card className={`${severityColors[alert.severity]} border-l-4`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {severityIcons[alert.severity]}
                <CardTitle className="text-sm">{alert.title}</CardTitle>
              </div>
              <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: 'short',
                  timeStyle: 'short'
                }).format(new Date(alert.timestamp))}
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAlertAction(alert, 'acknowledge')}
                >
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAlertAction(alert, 'resolve')}
                >
                  Resolve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }, [locale, handleAlertAction])

  const renderTrendChart = useCallback((
    title: string,
    data: any[],
    dataKey: string,
    color: string = CHART_COLORS.primary
  ) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }, [])

  const renderAreaChart = useCallback((
    title: string,
    data: any[],
    dataKeys: string[],
    colors: string[]
  ) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }, [])

  const renderBarChart = useCallback((
    title: string,
    data: any[],
    dataKey: string,
    nameKey: string = 'name',
    color: string = CHART_COLORS.primary
  ) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }, [])

  const renderPieChart = useCallback((
    title: string,
    data: any[],
    dataKey: string,
    nameKey: string = 'name',
    colors: string[] = Object.values(CHART_COLORS)
  ) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <PieChart
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </PieChart>
              <RechartsTooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }, [])

  // Main Render
  return (
    <TooltipProvider>
      <div 
        ref={dashboardRef}
        className={`executive-dashboard ${fullscreenMode ? 'fixed inset-0 z-50 bg-background' : ''} ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
            <p className="text-muted-foreground">
              Advanced Scan Rule Sets - Strategic Overview & Key Performance Indicators
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <Select value={selectedTimeRange.period} onValueChange={(value) => {
              const newTimeRange = { ...selectedTimeRange, period: value as any }
              handleTimeRangeChange(newTimeRange)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-24-hours">Last 24 Hours</SelectItem>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDashboard}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            {/* Export Button */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Dashboard</DialogTitle>
                  <DialogDescription>
                    Choose the format for exporting dashboard data
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Report
                  </Button>
                  <Button onClick={() => handleExport('excel')}>
                    <Table className="h-4 w-4 mr-2" />
                    Excel Spreadsheet
                  </Button>
                  <Button onClick={() => handleExport('csv')}>
                    <Database className="h-4 w-4 mr-2" />
                    CSV Data
                  </Button>
                  <Button onClick={() => handleExport('json')}>
                    <Code className="h-4 w-4 mr-2" />
                    JSON Data
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Settings */}
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Dashboard Settings</SheetTitle>
                  <SheetDescription>
                    Customize your dashboard preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>Auto Refresh</Label>
                    <Switch
                      checked={dashboardPreferences.autoRefresh}
                      onCheckedChange={(checked) => 
                        handlePreferencesChange({ autoRefresh: checked })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Refresh Interval (seconds)</Label>
                    <Slider
                      value={[dashboardPreferences.refreshInterval / 1000]}
                      onValueChange={([value]) => 
                        handlePreferencesChange({ refreshInterval: value * 1000 })
                      }
                      max={300}
                      min={10}
                      step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={dashboardPreferences.theme} 
                      onValueChange={(value) => 
                        handlePreferencesChange({ theme: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Enable Notifications</Label>
                    <Switch
                      checked={dashboardPreferences.enableNotifications}
                      onCheckedChange={(checked) => 
                        handlePreferencesChange({ enableNotifications: checked })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Real-time Updates</Label>
                    <Switch
                      checked={dashboardPreferences.enableRealTime}
                      onCheckedChange={(checked) => 
                        handlePreferencesChange({ enableRealTime: checked })
                      }
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreenToggle}
            >
              {fullscreenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              <span>Loading dashboard data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {executiveDashboardError && (
          <Alert className="m-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription>
              {executiveDashboardError.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {!isLoading && !executiveDashboardError && (
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Critical Alerts */}
              {criticalAlerts.length > 0 && showAlerts && (
                <motion.div
                  variants={ANIMATION_VARIANTS.fadeIn}
                  initial="initial"
                  animate="animate"
                >
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <CardTitle className="text-red-800">Critical Alerts</CardTitle>
                          <Badge variant="destructive">{criticalAlerts.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAlerts(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {criticalAlerts.slice(0, 3).map(alert => renderAlertCard(alert))}
                        {criticalAlerts.length > 3 && (
                          <Button
                            variant="outline"
                            onClick={() => setAlertsExpanded(!alertsExpanded)}
                          >
                            {alertsExpanded ? 'Show Less' : `Show ${criticalAlerts.length - 3} More`}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Executive Summary */}
              {executiveSummary && summaryExpanded && (
                <motion.div
                  variants={ANIMATION_VARIANTS.fadeIn}
                  initial="initial"
                  animate="animate"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Executive Summary</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSummaryExpanded(!summaryExpanded)}
                        >
                          {summaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="text-lg leading-relaxed">{executiveSummary.overview}</p>
                        
                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <h3 className="font-semibold text-green-700">Key Achievements</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {executiveSummary.keyAchievements?.map((achievement, index) => (
                                <li key={index}>{achievement}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-orange-700">Areas for Improvement</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {executiveSummary.areasForImprovement?.map((area, index) => (
                                <li key={index}>{area}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {executiveSummary.strategicRecommendations && (
                          <div className="mt-6">
                            <h3 className="font-semibold text-blue-700">Strategic Recommendations</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {executiveSummary.strategicRecommendations.map((recommendation, index) => (
                                <li key={index}>{recommendation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Key Performance Indicators */}
              {performanceKPIs && kpiExpanded && (
                <motion.div
                  variants={ANIMATION_VARIANTS.fadeIn}
                  initial="initial"
                  animate="animate"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Key Performance Indicators</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setKpiExpanded(!kpiExpanded)}
                        >
                          {kpiExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {renderKPICard(
                          'Rule Execution Success Rate',
                          `${(performanceKPIs.ruleExecutionSuccessRate * 100).toFixed(1)}%`,
                          performanceKPIs.ruleExecutionSuccessRateChange || 0,
                          performanceKPIs.ruleExecutionSuccessRateChange > 0 ? 'up' : 'down',
                          <CheckCircle2 className="h-4 w-4" />,
                          'Successful rule executions vs total executions',
                          95
                        )}

                        {renderKPICard(
                          'Average Processing Time',
                          `${performanceKPIs.averageProcessingTime?.toFixed(0)}ms`,
                          performanceKPIs.averageProcessingTimeChange || 0,
                          performanceKPIs.averageProcessingTimeChange < 0 ? 'up' : 'down',
                          <Clock className="h-4 w-4" />,
                          'Average time to process scan rules'
                        )}

                        {renderKPICard(
                          'Rules Optimized',
                          performanceKPIs.rulesOptimized || 0,
                          performanceKPIs.rulesOptimizedChange || 0,
                          performanceKPIs.rulesOptimizedChange > 0 ? 'up' : 'neutral',
                          <Zap className="h-4 w-4" />,
                          'Rules optimized this period'
                        )}

                        {renderKPICard(
                          'Cost Savings',
                          new Intl.NumberFormat(locale, { 
                            style: 'currency', 
                            currency: currency 
                          }).format(performanceKPIs.costSavings || 0),
                          performanceKPIs.costSavingsChange || 0,
                          performanceKPIs.costSavingsChange > 0 ? 'up' : 'neutral',
                          <DollarSign className="h-4 w-4" />,
                          'Cost savings achieved through optimization'
                        )}

                        {renderKPICard(
                          'Active Users',
                          performanceKPIs.activeUsers || 0,
                          performanceKPIs.activeUsersChange || 0,
                          performanceKPIs.activeUsersChange > 0 ? 'up' : 'down',
                          <Users className="h-4 w-4" />,
                          'Users actively using the system'
                        )}

                        {renderKPICard(
                          'System Uptime',
                          `${(performanceKPIs.systemUptime * 100).toFixed(2)}%`,
                          performanceKPIs.systemUptimeChange || 0,
                          performanceKPIs.systemUptimeChange >= 0 ? 'up' : 'down',
                          <Activity className="h-4 w-4" />,
                          'System availability percentage',
                          99.9
                        )}

                        {renderKPICard(
                          'Compliance Score',
                          `${(performanceKPIs.complianceScore * 100).toFixed(1)}%`,
                          performanceKPIs.complianceScoreChange || 0,
                          performanceKPIs.complianceScoreChange >= 0 ? 'up' : 'down',
                          <Shield className="h-4 w-4" />,
                          'Overall compliance adherence',
                          100
                        )}

                        {renderKPICard(
                          'Data Quality Score',
                          `${(performanceKPIs.dataQualityScore * 100).toFixed(1)}%`,
                          performanceKPIs.dataQualityScoreChange || 0,
                          performanceKPIs.dataQualityScoreChange >= 0 ? 'up' : 'down',
                          <Database className="h-4 w-4" />,
                          'Overall data quality metrics',
                          95
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Main Dashboard Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="business-value">Business Value</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ROI Analysis */}
                    {roiAnalysis && (
                      <Card>
                        <CardHeader>
                          <CardTitle>ROI Analysis</CardTitle>
                          <CardDescription>Return on Investment metrics and projections</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Total ROI</span>
                              <span className="text-2xl font-bold text-green-600">
                                {roiAnalysis.totalROI ? `${(roiAnalysis.totalROI * 100).toFixed(1)}%` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Investment</span>
                              <span className="text-lg font-semibold">
                                {new Intl.NumberFormat(locale, { 
                                  style: 'currency', 
                                  currency: currency 
                                }).format(roiAnalysis.totalInvestment || 0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Savings</span>
                              <span className="text-lg font-semibold text-green-600">
                                {new Intl.NumberFormat(locale, { 
                                  style: 'currency', 
                                  currency: currency 
                                }).format(roiAnalysis.totalSavings || 0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Payback Period</span>
                              <span className="text-lg font-semibold">
                                {roiAnalysis.paybackPeriod ? `${roiAnalysis.paybackPeriod} months` : 'N/A'}
                              </span>
                            </div>
                            <Progress 
                              value={Math.min((roiAnalysis.totalROI || 0) * 100, 100)} 
                              className="h-3"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Resource Utilization */}
                    {resourceUtilization && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Resource Utilization</CardTitle>
                          <CardDescription>System resource usage and efficiency</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">CPU Usage</span>
                                <span className="text-sm">{resourceUtilization.cpu?.usage?.toFixed(1)}%</span>
                              </div>
                              <Progress value={resourceUtilization.cpu?.usage || 0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Memory Usage</span>
                                <span className="text-sm">{resourceUtilization.memory?.usage?.toFixed(1)}%</span>
                              </div>
                              <Progress value={resourceUtilization.memory?.usage || 0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Storage Usage</span>
                                <span className="text-sm">{resourceUtilization.storage?.usage?.toFixed(1)}%</span>
                              </div>
                              <Progress value={resourceUtilization.storage?.usage || 0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Network Usage</span>
                                <span className="text-sm">{resourceUtilization.network?.usage?.toFixed(1)}%</span>
                              </div>
                              <Progress value={resourceUtilization.network?.usage || 0} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Strategic Goals Progress */}
                  {strategicGoals && strategicGoals.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Strategic Goals Progress</CardTitle>
                        <CardDescription>Progress towards key strategic objectives</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {strategicGoals.slice(0, 5).map((goal, index) => (
                            <div key={goal.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{goal.title}</span>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                                    {goal.priority}
                                  </Badge>
                                  <span className="text-sm">{goal.progress?.toFixed(0)}%</span>
                                </div>
                              </div>
                              <Progress value={goal.progress || 0} className="h-2" />
                              <p className="text-xs text-muted-foreground">{goal.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                  {chartsExpanded && trendData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderTrendChart(
                        'Rule Execution Performance',
                        trendData.performance || [],
                        'executionTime',
                        CHART_COLORS.primary
                      )}
                      
                      {renderTrendChart(
                        'System Throughput',
                        trendData.performance || [],
                        'throughput',
                        CHART_COLORS.success
                      )}
                      
                      {renderAreaChart(
                        'Resource Utilization Over Time',
                        trendData.performance || [],
                        ['cpu', 'memory', 'storage', 'network'],
                        [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.warning, CHART_COLORS.info]
                      )}
                      
                      {renderBarChart(
                        'Top Rule Categories by Performance',
                        performanceBenchmarks?.categoryPerformance || [],
                        'averageTime',
                        'category',
                        CHART_COLORS.accent
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Business Value Tab */}
                <TabsContent value="business-value" className="space-y-6">
                  {businessValueMetrics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderPieChart(
                        'Cost Savings Breakdown',
                        [
                          { name: 'Automation', value: businessValueMetrics.automationSavings || 0 },
                          { name: 'Efficiency', value: businessValueMetrics.efficiencySavings || 0 },
                          { name: 'Error Reduction', value: businessValueMetrics.errorReductionSavings || 0 },
                          { name: 'Time Savings', value: businessValueMetrics.timeSavings || 0 }
                        ],
                        'value'
                      )}
                      
                      {renderBarChart(
                        'Business Value by Department',
                        businessValueMetrics.departmentValue || [],
                        'value',
                        'department',
                        CHART_COLORS.success
                      )}
                      
                      {renderTrendChart(
                        'ROI Trend',
                        trendData?.businessValue || [],
                        'roi',
                        CHART_COLORS.success
                      )}
                      
                      {renderAreaChart(
                        'Cumulative Benefits',
                        trendData?.businessValue || [],
                        ['savings', 'revenue', 'efficiency'],
                        [CHART_COLORS.success, CHART_COLORS.primary, CHART_COLORS.secondary]
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Compliance Tab */}
                <TabsContent value="compliance" className="space-y-6">
                  {complianceMetrics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderPieChart(
                        'Compliance Status Distribution',
                        [
                          { name: 'Compliant', value: complianceMetrics.compliantRules || 0 },
                          { name: 'Non-Compliant', value: complianceMetrics.nonCompliantRules || 0 },
                          { name: 'Pending Review', value: complianceMetrics.pendingReview || 0 }
                        ],
                        'value',
                        'name',
                        [CHART_COLORS.success, CHART_COLORS.danger, CHART_COLORS.warning]
                      )}
                      
                      {renderBarChart(
                        'Compliance by Framework',
                        complianceMetrics.frameworkCompliance || [],
                        'score',
                        'framework',
                        CHART_COLORS.info
                      )}
                      
                      {renderTrendChart(
                        'Compliance Score Trend',
                        trendData?.compliance || [],
                        'score',
                        CHART_COLORS.info
                      )}
                      
                      {renderAreaChart(
                        'Compliance Issues Over Time',
                        trendData?.compliance || [],
                        ['critical', 'high', 'medium', 'low'],
                        [CHART_COLORS.danger, CHART_COLORS.warning, CHART_COLORS.accent, CHART_COLORS.gray]
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Risks */}
                    {topRisks.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Risks</CardTitle>
                          <CardDescription>Highest impact risks requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {topRisks.map((risk, index) => (
                              <div key={risk.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{risk.title}</p>
                                  <p className="text-xs text-muted-foreground">{risk.description}</p>
                                </div>
                                <div className="text-right space-y-1">
                                  <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                                    {risk.severity}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    Impact: {(risk.impact * 100).toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Top Opportunities */}
                    {topOpportunities.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Opportunities</CardTitle>
                          <CardDescription>High-value opportunities for improvement</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {topOpportunities.map((opportunity, index) => (
                              <div key={opportunity.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{opportunity.title}</p>
                                  <p className="text-xs text-muted-foreground">{opportunity.description}</p>
                                </div>
                                <div className="text-right space-y-1">
                                  <Badge variant="default">
                                    {opportunity.category}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    Value: {new Intl.NumberFormat(locale, { 
                                      style: 'currency', 
                                      currency: currency 
                                    }).format(opportunity.value || 0)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                  {executiveInsights && executiveInsights.length > 0 && (
                    <div className="grid gap-6">
                      {executiveInsights.map((insight, index) => (
                        <motion.div
                          key={insight.id}
                          variants={ANIMATION_VARIANTS.fadeIn}
                          initial="initial"
                          animate="animate"
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{insight.title}</CardTitle>
                                <Badge variant={insight.category === 'recommendation' ? 'default' : 'secondary'}>
                                  {insight.category}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4">{insight.description}</p>
                              
                              {insight.recommendations && insight.recommendations.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Recommendations:</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    {insight.recommendations.map((rec, recIndex) => (
                                      <li key={recIndex}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {insight.impact && (
                                <div className="mt-4 p-3 rounded-lg bg-muted">
                                  <p className="text-sm">
                                    <span className="font-medium">Potential Impact:</span> {insight.impact}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-muted-foreground">
                                  Generated: {new Intl.DateTimeFormat(locale, {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  }).format(new Date(insight.timestamp))}
                                </span>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Share2 className="h-3 w-3 mr-1" />
                                    Share
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Bookmark className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Last updated: {consolidatedMetrics.lastUpdated ? 
              new Intl.DateTimeFormat(locale, {
                dateStyle: 'short',
                timeStyle: 'medium'
              }).format(new Date(consolidatedMetrics.lastUpdated)) : 'N/A'
            }</span>
            <span>•</span>
            <span>Data freshness: {consolidatedMetrics.dataFreshness || 'Unknown'}</span>
            <span>•</span>
            <span>Refresh rate: {consolidatedMetrics.refreshRate ? `${consolidatedMetrics.refreshRate / 1000}s` : 'Manual'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {realTimeEnabled && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleDrillDown('system-health', consolidatedMetrics)}>
              <Activity className="h-3 w-3 mr-1" />
              System Health
            </Button>
          </div>
        </div>

        {/* Drill Down Dialog */}
        {drillDownData && (
          <Dialog open={!!drillDownData} onOpenChange={() => setDrillDownData(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Detailed Analysis: {selectedMetric}</DialogTitle>
                <DialogDescription>
                  Deep dive into {selectedMetric} metrics and trends
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Drill down content would be rendered here based on the selected metric */}
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(drillDownData, null, 2)}
                </pre>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDrillDownData(null)}>
                  Close
                </Button>
                <Button onClick={() => handleExport('detailed-analysis')}>
                  Export Analysis
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}

export default ExecutiveDashboard