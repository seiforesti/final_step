"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart,
  Search, Filter, Settings, RefreshCw, Download, Upload,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  MoreHorizontal, Eye, EyeOff, Clock, Calendar,
  User, Users, Link, ExternalLink, Copy, Share2,
  AlertTriangle, CheckCircle, XCircle, Info,
  Database, FileText, Cpu, Server, Cloud, Globe,
  Layers, GitBranch, Network, Workflow, Target,
  Lightbulb, Rocket, Compass, Map, Route, Navigation,
  Award, Crown, Medal, Trophy, Shield, Badge as BadgeIcon,
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize2, Minimize2,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Plus, Minus, X, Check, Edit, Trash2,
  MessageSquare, Bell, Flag, Bookmark,
  Boxes, Combine, Split, Shuffle, Radar,
  Hash, Tag, Tags, Sparkles, Brain, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { catalogAnalyticsService } from '../../services/catalog-analytics.service'
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service'
import { useToast } from '@/components/ui/use-toast'

// Types for usage pattern analysis
interface DataAsset {
  id: string
  name: string
  type: 'dataset' | 'table' | 'column' | 'view' | 'schema' | 'database' | 'model' | 'report' | 'dashboard'
  category: string
  description: string
  owner: string
  created_at: Date
  updated_at: Date
  status: 'active' | 'inactive' | 'deprecated'
  metadata: Record<string, any>
  tags: string[]
  quality_score: number
  usage_frequency: number
  business_value: number
  usage_patterns?: UsagePattern[]
  access_history?: AccessEvent[]
}

interface UsagePattern {
  id: string
  asset_id: string
  pattern_type: 'temporal' | 'user_based' | 'query_based' | 'access_based' | 'performance_based' | 'seasonal'
  pattern_name: string
  description: string
  confidence_score: number
  frequency: number
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'seasonal'
  metrics: UsageMetrics
  detected_at: Date
  last_updated: Date
  metadata: {
    algorithm: string
    parameters: Record<string, any>
    detection_method: 'statistical' | 'ml_clustering' | 'time_series' | 'anomaly_detection'
    significance_level: number
    pattern_strength: number
    seasonal_components?: SeasonalComponent[]
    trend_components?: TrendComponent[]
  }
}

interface UsageMetrics {
  total_accesses: number
  unique_users: number
  avg_session_duration: number
  peak_usage_time: string
  low_usage_time: string
  access_frequency_per_day: number
  data_volume_accessed: number
  query_complexity_score: number
  response_time_avg: number
  error_rate: number
  cost_per_access: number
  business_impact_score: number
}

interface AccessEvent {
  id: string
  asset_id: string
  user_id: string
  user_role: string
  department: string
  access_type: 'read' | 'write' | 'query' | 'download' | 'share' | 'modify'
  access_method: 'api' | 'ui' | 'sql' | 'notebook' | 'report' | 'dashboard'
  timestamp: Date
  duration: number
  data_volume: number
  query_complexity: number
  success: boolean
  error_message?: string
  metadata: {
    ip_address?: string
    user_agent?: string
    session_id?: string
    query_text?: string
    filters_applied?: Record<string, any>
    export_format?: string
    performance_metrics?: PerformanceMetrics
  }
}

interface PerformanceMetrics {
  response_time: number
  cpu_usage: number
  memory_usage: number
  disk_io: number
  network_io: number
  cache_hit_ratio: number
  execution_plan_cost: number
}

interface SeasonalComponent {
  component_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  amplitude: number
  phase: number
  period: number
  strength: number
}

interface TrendComponent {
  trend_type: 'linear' | 'exponential' | 'logarithmic' | 'polynomial'
  slope: number
  acceleration: number
  r_squared: number
  forecast_accuracy: number
}

interface UsageAnalysis {
  id: string
  asset_id: string
  analysis_type: 'trend_analysis' | 'anomaly_detection' | 'user_segmentation' | 'performance_analysis' | 'cost_analysis' | 'predictive_modeling'
  time_period: {
    start_date: Date
    end_date: Date
    granularity: 'hour' | 'day' | 'week' | 'month'
  }
  results: AnalysisResults
  insights: UsageInsight[]
  recommendations: UsageRecommendation[]
  created_at: Date
  analysis_duration: number
  confidence_score: number
}

interface AnalysisResults {
  summary_statistics: {
    total_usage_events: number
    unique_users: number
    peak_concurrent_users: number
    avg_daily_usage: number
    usage_growth_rate: number
    cost_efficiency_score: number
  }
  temporal_patterns: {
    hourly_distribution: number[]
    daily_distribution: number[]
    monthly_distribution: number[]
    seasonal_trends: SeasonalTrend[]
  }
  user_patterns: {
    user_segments: UserSegment[]
    top_users: TopUser[]
    department_usage: DepartmentUsage[]
    access_method_distribution: Record<string, number>
  }
  performance_patterns: {
    response_time_trends: TimeSeries[]
    resource_utilization: ResourceUtilization[]
    bottleneck_analysis: BottleneckAnalysis[]
    optimization_opportunities: OptimizationOpportunity[]
  }
  anomalies: UsageAnomaly[]
  forecasts: UsageForecast[]
}

interface UsageInsight {
  id: string
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'optimization'
  title: string
  description: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  supporting_data: any[]
  actionable: boolean
  estimated_value: number
  time_to_value: string
}

interface UsageRecommendation {
  id: string
  type: 'performance_optimization' | 'cost_reduction' | 'user_experience' | 'capacity_planning' | 'data_governance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  rationale: string
  expected_impact: {
    performance_improvement: number
    cost_savings: number
    user_satisfaction_increase: number
    efficiency_gain: number
  }
  implementation_effort: 'low' | 'medium' | 'high'
  implementation_steps: string[]
  success_metrics: string[]
  estimated_timeline: string
  risks: string[]
  dependencies: string[]
}

interface UserSegment {
  segment_id: string
  segment_name: string
  user_count: number
  characteristics: Record<string, any>
  usage_patterns: string[]
  value_score: number
}

interface TopUser {
  user_id: string
  user_name: string
  department: string
  total_accesses: number
  data_volume: number
  value_contribution: number
}

interface DepartmentUsage {
  department: string
  user_count: number
  total_usage: number
  avg_usage_per_user: number
  cost_allocation: number
}

interface TimeSeries {
  timestamp: Date
  value: number
  metadata?: Record<string, any>
}

interface ResourceUtilization {
  resource_type: 'cpu' | 'memory' | 'storage' | 'network'
  utilization_percentage: number
  peak_utilization: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface BottleneckAnalysis {
  bottleneck_type: 'compute' | 'io' | 'network' | 'concurrency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  impact_on_performance: number
  affected_operations: string[]
  resolution_suggestions: string[]
}

interface OptimizationOpportunity {
  opportunity_type: 'indexing' | 'caching' | 'partitioning' | 'compression' | 'archiving'
  potential_improvement: number
  implementation_complexity: 'low' | 'medium' | 'high'
  estimated_cost_savings: number
}

interface UsageAnomaly {
  id: string
  anomaly_type: 'spike' | 'drop' | 'pattern_change' | 'performance_degradation' | 'unusual_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  detected_at: Date
  description: string
  affected_metrics: string[]
  root_cause_analysis: string
  resolution_status: 'open' | 'investigating' | 'resolved' | 'false_positive'
}

interface UsageForecast {
  forecast_type: 'usage_volume' | 'user_growth' | 'cost_projection' | 'performance_demand'
  time_horizon: '1_week' | '1_month' | '3_months' | '6_months' | '1_year'
  predictions: ForecastPrediction[]
  confidence_intervals: ConfidenceInterval[]
  model_accuracy: number
  assumptions: string[]
}

interface ForecastPrediction {
  date: Date
  predicted_value: number
  lower_bound: number
  upper_bound: number
}

interface ConfidenceInterval {
  confidence_level: number
  lower_bound: number
  upper_bound: number
}

interface SeasonalTrend {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  strength: number
  peak_periods: string[]
  low_periods: string[]
}

interface AnalysisConfiguration {
  time_period: {
    start_date: Date
    end_date: Date
    granularity: 'hour' | 'day' | 'week' | 'month'
  }
  analysis_types: string[]
  user_filters: {
    departments: string[]
    roles: string[]
    exclude_system_users: boolean
  }
  asset_filters: {
    asset_types: string[]
    categories: string[]
    min_quality_score: number
  }
  anomaly_detection: {
    sensitivity: number
    methods: string[]
    exclude_known_events: boolean
  }
  forecasting: {
    enable_forecasting: boolean
    forecast_horizon: string
    confidence_level: number
    seasonal_adjustment: boolean
  }
  performance_analysis: {
    include_performance_metrics: boolean
    bottleneck_detection: boolean
    optimization_suggestions: boolean
  }
}

// Main UsagePatternAnalyzer Component
export const UsagePatternAnalyzer: React.FC = () => {
  // Core state management
  const [assets, setAssets] = useState<DataAsset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null)
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([])
  const [usageAnalyses, setUsageAnalyses] = useState<UsageAnalysis[]>([])
  const [accessEvents, setAccessEvents] = useState<AccessEvent[]>([])
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfiguration>({
    time_period: {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end_date: new Date(),
      granularity: 'day'
    },
    analysis_types: ['trend_analysis', 'anomaly_detection', 'performance_analysis'],
    user_filters: {
      departments: [],
      roles: [],
      exclude_system_users: true
    },
    asset_filters: {
      asset_types: [],
      categories: [],
      min_quality_score: 0.5
    },
    anomaly_detection: {
      sensitivity: 0.8,
      methods: ['statistical', 'ml_clustering'],
      exclude_known_events: true
    },
    forecasting: {
      enable_forecasting: true,
      forecast_horizon: '3_months',
      confidence_level: 0.95,
      seasonal_adjustment: true
    },
    performance_analysis: {
      include_performance_metrics: true,
      bottleneck_detection: true,
      optimization_suggestions: true
    }
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'heatmap'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [filterBy, setFilterBy] = useState<{
    pattern_types: string[]
    confidence_range: [number, number]
    asset_types: string[]
    departments: string[]
    time_range: string
  }>({
    pattern_types: [],
    confidence_range: [0.7, 1],
    asset_types: [],
    departments: [],
    time_range: '30d'
  })

  // Analysis and processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [realTimeMode, setRealTimeMode] = useState(false)

  // Dialog and modal states
  const [showPatternDetails, setShowPatternDetails] = useState(false)
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false)
  const [showConfiguration, setShowConfiguration] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showAnomalies, setShowAnomalies] = useState(false)
  const [showForecasts, setShowForecasts] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Selected items for detailed view
  const [selectedPattern, setSelectedPattern] = useState<UsagePattern | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<UsageAnalysis | null>(null)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Queries
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['usageAssets', filterBy],
    queryFn: () => catalogAnalyticsService.getAssetsWithUsageData(filterBy),
    staleTime: 60000
  })

  const { data: patternsData, isLoading: patternsLoading } = useQuery({
    queryKey: ['usagePatterns', selectedAsset?.id],
    queryFn: () => selectedAsset ? catalogAnalyticsService.getUsagePatterns(selectedAsset.id) : [],
    enabled: !!selectedAsset,
    staleTime: 30000
  })

  const { data: analysesData, isLoading: analysesLoading } = useQuery({
    queryKey: ['usageAnalyses', analysisConfig],
    queryFn: () => catalogAnalyticsService.getUsageAnalyses(analysisConfig),
    staleTime: 120000
  })

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['accessEvents', selectedAsset?.id, analysisConfig.time_period],
    queryFn: () => selectedAsset ? catalogAnalyticsService.getAccessEvents(selectedAsset.id, analysisConfig.time_period) : [],
    enabled: !!selectedAsset,
    staleTime: 60000
  })

  // Mutations
  const runUsageAnalysisMutation = useMutation({
    mutationFn: ({ assetIds, config }: { assetIds: string[]; config: AnalysisConfiguration }) =>
      catalogAnalyticsService.runUsageAnalysis(assetIds, config),
    onMutate: () => {
      setIsAnalyzing(true)
      setAnalysisProgress(0)
      setAnalysisStatus('Initializing usage pattern analysis...')
    },
    onSuccess: (data) => {
      setIsAnalyzing(false)
      setAnalysisProgress(100)
      queryClient.invalidateQueries({ queryKey: ['usageAnalyses'] })
      queryClient.invalidateQueries({ queryKey: ['usagePatterns'] })
      toast({ 
        title: "Analysis Complete", 
        description: `Analyzed usage patterns for ${data.assets_processed} assets` 
      })
    },
    onError: () => {
      setIsAnalyzing(false)
      toast({ title: "Analysis Failed", description: "Failed to complete usage pattern analysis", variant: "destructive" })
    }
  })

  const optimizePerformanceMutation = useMutation({
    mutationFn: (assetId: string) => catalogAnalyticsService.optimizeAssetPerformance(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usageAnalyses'] })
      toast({ title: "Optimization Started", description: "Performance optimization has been initiated" })
    }
  })

  const implementRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) => catalogAnalyticsService.implementRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usageAnalyses'] })
      toast({ title: "Recommendation Implemented", description: "Recommendation has been successfully implemented" })
    }
  })

  // Filtered and processed data
  const filteredAssets = useMemo(() => {
    if (!assets) return []
    
    return assets.filter(asset => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          asset.name.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.owner.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Asset type filter
      if (filterBy.asset_types.length > 0 && !filterBy.asset_types.includes(asset.type)) {
        return false
      }

      return true
    })
  }, [assets, searchQuery, filterBy])

  const filteredPatterns = useMemo(() => {
    if (!usagePatterns) return []
    
    return usagePatterns.filter(pattern => {
      // Pattern type filter
      if (filterBy.pattern_types.length > 0 && !filterBy.pattern_types.includes(pattern.pattern_type)) {
        return false
      }

      // Confidence range filter
      if (pattern.confidence_score < filterBy.confidence_range[0] || 
          pattern.confidence_score > filterBy.confidence_range[1]) {
        return false
      }

      return true
    })
  }, [usagePatterns, filterBy])

  // Helper functions
  const getPatternColor = (type: string): string => {
    const colorMap = {
      temporal: 'text-blue-600 bg-blue-50',
      user_based: 'text-green-600 bg-green-50',
      query_based: 'text-purple-600 bg-purple-50',
      access_based: 'text-orange-600 bg-orange-50',
      performance_based: 'text-red-600 bg-red-50',
      seasonal: 'text-indigo-600 bg-indigo-50'
    }
    return colorMap[type] || 'text-gray-600 bg-gray-50'
  }

  const getPatternIcon = (type: string) => {
    const iconMap = {
      temporal: Clock,
      user_based: Users,
      query_based: Search,
      access_based: Activity,
      performance_based: Zap,
      seasonal: Calendar
    }
    return iconMap[type] || Activity
  }

  const getTrendIcon = (trend: string) => {
    const iconMap = {
      increasing: TrendingUp,
      decreasing: TrendingDown,
      stable: Activity,
      volatile: BarChart3,
      seasonal: Calendar
    }
    return iconMap[trend] || Activity
  }

  const getTrendColor = (trend: string): string => {
    const colorMap = {
      increasing: 'text-green-600',
      decreasing: 'text-red-600',
      stable: 'text-blue-600',
      volatile: 'text-orange-600',
      seasonal: 'text-purple-600'
    }
    return colorMap[trend] || 'text-gray-600'
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  // Event handlers
  const handleAssetSelect = (asset: DataAsset) => {
    setSelectedAsset(asset)
  }

  const handleRunAnalysis = (assetIds?: string[]) => {
    const targetAssets = assetIds || (selectedAsset ? [selectedAsset.id] : selectedAssets)
    if (targetAssets.length === 0) {
      toast({ title: "No Assets Selected", description: "Please select assets to analyze", variant: "destructive" })
      return
    }

    runUsageAnalysisMutation.mutate({ assetIds: targetAssets, config: analysisConfig })
  }

  const handleOptimizePerformance = (assetId: string) => {
    optimizePerformanceMutation.mutate(assetId)
  }

  const handleImplementRecommendation = (recommendationId: string) => {
    implementRecommendationMutation.mutate(recommendationId)
  }

  const handleConfigurationUpdate = (newConfig: Partial<AnalysisConfiguration>) => {
    setAnalysisConfig(prev => ({ ...prev, ...newConfig }))
  }

  const handleExportResults = (format: 'json' | 'csv' | 'xlsx') => {
    const data = {
      patterns: filteredPatterns,
      analyses: usageAnalyses,
      configuration: analysisConfig,
      exported_at: new Date().toISOString()
    }
    
    const filename = `usage-analysis.${format}`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
    toast({ title: "Export Complete", description: `Results exported as ${format.toUpperCase()}` })
  }

  // Render functions
  const renderAssetCard = (asset: DataAsset) => {
    const isSelected = selectedAsset?.id === asset.id
    const isInSelection = selectedAssets.includes(asset.id)
    
    return (
      <Card 
        key={asset.id}
        className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isInSelection ? 'bg-blue-50' : ''}`}
        onClick={() => handleAssetSelect(asset)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {asset.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{asset.type}</Badge>
                  <Badge variant="secondary">{asset.category}</Badge>
                  <div className="text-sm text-slate-500">
                    {asset.usage_patterns?.length || 0} patterns
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Checkbox
                checked={isInSelection}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAssets(prev => [...prev, asset.id])
                  } else {
                    setSelectedAssets(prev => prev.filter(id => id !== asset.id))
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleRunAnalysis([asset.id])}>
                    <Activity className="h-4 w-4 mr-2" />
                    Analyze Usage
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOptimizePerformance(asset.id)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize Performance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {asset.description}
          </p>

          {/* Usage Metrics */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Usage:</span>
                <span className="font-medium">{Math.round(asset.usage_frequency * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quality:</span>
                <span className="font-medium">{Math.round(asset.quality_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Value:</span>
                <span className="font-medium">{Math.round(asset.business_value * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner:</span>
                <span className="font-medium truncate">{asset.owner}</span>
              </div>
            </div>
          </div>

          {/* Usage Patterns Preview */}
          {asset.usage_patterns && asset.usage_patterns.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-sm font-medium">Top Patterns</div>
              <div className="space-y-1">
                {asset.usage_patterns.slice(0, 3).map((pattern, index) => {
                  const TrendIcon = getTrendIcon(pattern.trend)
                  return (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <TrendIcon className={`h-3 w-3 ${getTrendColor(pattern.trend)}`} />
                        <span className="truncate">{pattern.pattern_name}</span>
                      </div>
                      <Badge className={getPatternColor(pattern.pattern_type)} variant="outline">
                        {Math.round(pattern.confidence_score * 100)}%
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderPatternCard = (pattern: UsagePattern) => {
    const Icon = getPatternIcon(pattern.pattern_type)
    const TrendIcon = getTrendIcon(pattern.trend)
    
    return (
      <Card 
        key={pattern.id}
        className="transition-all duration-200 hover:shadow-lg cursor-pointer"
        onClick={() => {
          setSelectedPattern(pattern)
          setShowPatternDetails(true)
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {pattern.pattern_name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getPatternColor(pattern.pattern_type)}>
                    {pattern.pattern_type.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-4 w-4 ${getTrendColor(pattern.trend)}`} />
                    <span className={`text-sm ${getTrendColor(pattern.trend)}`}>
                      {pattern.trend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold">
                {Math.round(pattern.confidence_score * 100)}%
              </div>
              <div className="text-xs text-slate-500">confidence</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {pattern.description}
          </p>

          {/* Pattern Metrics */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Frequency:</span>
                <span className="font-medium">{formatNumber(pattern.frequency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Strength:</span>
                <span className="font-medium">{Math.round(pattern.metadata.pattern_strength * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Users:</span>
                <span className="font-medium">{formatNumber(pattern.metrics.unique_users)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Accesses:</span>
                <span className="font-medium">{formatNumber(pattern.metrics.total_accesses)}</span>
              </div>
            </div>
          </div>

          {/* Detection Method */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Brain className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">{pattern.metadata.detection_method}</span>
            </div>
            <div className="text-xs text-slate-500">
              {new Date(pattern.detected_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderAnalysisCard = (analysis: UsageAnalysis) => {
    const getAnalysisIcon = (type: string) => {
      const iconMap = {
        trend_analysis: TrendingUp,
        anomaly_detection: AlertTriangle,
        user_segmentation: Users,
        performance_analysis: Zap,
        cost_analysis: Target,
        predictive_modeling: Brain
      }
      return iconMap[type] || BarChart3
    }

    const Icon = getAnalysisIcon(analysis.analysis_type)
    
    return (
      <Card 
        key={analysis.id}
        className="transition-all duration-200 hover:shadow-lg cursor-pointer"
        onClick={() => {
          setSelectedAnalysis(analysis)
          setShowAnalysisDetails(true)
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {analysis.analysis_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">
                    {analysis.time_period.granularity}
                  </Badge>
                  <div className="text-sm text-slate-500">
                    {Math.round(analysis.confidence_score * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {/* Analysis Summary */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded">
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(analysis.results.summary_statistics.total_usage_events)}
                </div>
                <div className="text-xs text-slate-500">Total Events</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded">
                <div className="text-lg font-bold text-green-600">
                  {formatNumber(analysis.results.summary_statistics.unique_users)}
                </div>
                <div className="text-xs text-slate-500">Unique Users</div>
              </div>
            </div>

            {/* Insights Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{analysis.insights.length} Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{analysis.recommendations.length} Recommendations</span>
              </div>
            </div>

            {/* Time Period */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Period:</span>
              <span className="font-medium">
                {new Date(analysis.time_period.start_date).toLocaleDateString()} - {new Date(analysis.time_period.end_date).toLocaleDateString()}
              </span>
            </div>

            {/* Analysis Duration */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Duration:</span>
              <span className="font-medium">{formatDuration(analysis.analysis_duration)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Effect hooks
  useEffect(() => {
    if (assetsData) {
      setAssets(assetsData)
    }
  }, [assetsData])

  useEffect(() => {
    if (patternsData) {
      setUsagePatterns(patternsData)
    }
  }, [patternsData])

  useEffect(() => {
    if (analysesData) {
      setUsageAnalyses(analysesData)
    }
  }, [analysesData])

  useEffect(() => {
    if (eventsData) {
      setAccessEvents(eventsData)
    }
  }, [eventsData])

  // Simulate analysis progress
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          const newProgress = prev + Math.random() * 8
          if (newProgress >= 90) {
            setAnalysisStatus('Generating insights and recommendations...')
          } else if (newProgress >= 70) {
            setAnalysisStatus('Detecting anomalies and patterns...')
          } else if (newProgress >= 40) {
            setAnalysisStatus('Analyzing user behavior...')
          } else if (newProgress >= 20) {
            setAnalysisStatus('Processing access events...')
          }
          return Math.min(newProgress, 95)
        })
      }, 600)

      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Usage Pattern Analyzer
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Advanced usage analytics and pattern discovery
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-10 w-64"
              />
            </div>

            {/* Real-time Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={realTimeMode}
                onCheckedChange={setRealTimeMode}
              />
              <Label className="text-sm">Real-time</Label>
            </div>

            {/* View Mode */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {viewMode}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('timeline')}>
                  Timeline View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('heatmap')}>
                  Heatmap View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunAnalysis()}
              disabled={isAnalyzing || selectedAssets.length === 0}
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Analyze ({selectedAssets.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecommendations(true)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Recommendations
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportResults('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportResults('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportResults('xlsx')}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfiguration(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Usage Pattern Analysis</span>
                  <span>{Math.round(analysisProgress)}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
                <div className="text-xs text-slate-600">{analysisStatus}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4" ref={containerRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Assets ({filteredAssets.length})</TabsTrigger>
              <TabsTrigger value="patterns">Patterns ({filteredPatterns.length})</TabsTrigger>
              <TabsTrigger value="analyses">Analyses ({usageAnalyses.length})</TabsTrigger>
              <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {/* Bulk Selection Actions */}
              {selectedAssets.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedAssets.length} asset(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => handleRunAnalysis()}
                        disabled={isAnalyzing}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Analyze Usage
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedAssets([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {assetsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading assets...</p>
                  </div>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {filteredAssets.map(renderAssetCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="patterns" className="mt-4">
              {patternsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading patterns...</p>
                  </div>
                </div>
              ) : filteredPatterns.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No usage patterns found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Select assets and run usage analysis to discover patterns
                  </p>
                  <Button onClick={() => setActiveTab('overview')}>
                    <Activity className="h-4 w-4 mr-2" />
                    Select Assets
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPatterns.map(renderPatternCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analyses" className="mt-4">
              {analysesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading analyses...</p>
                  </div>
                </div>
              ) : usageAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No analyses available
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Run usage analysis to generate detailed insights
                  </p>
                  <Button onClick={() => setActiveTab('overview')}>
                    <Activity className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {usageAnalyses.map(renderAnalysisCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Insights Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <span>Key Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usageAnalyses.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No insights available. Run analysis to generate insights.</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {usageAnalyses.flatMap(analysis => analysis.insights).slice(0, 10).map((insight, index) => (
                            <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant={insight.impact_level === 'critical' ? 'destructive' : 'default'}>
                                  {insight.impact_level}
                                </Badge>
                                <span className="text-sm text-slate-500">
                                  {Math.round(insight.confidence * 100)}% confidence
                                </span>
                              </div>
                              <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{insight.description}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span>Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usageAnalyses.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No recommendations available. Run analysis to generate recommendations.</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {usageAnalyses.flatMap(analysis => analysis.recommendations).slice(0, 10).map((recommendation, index) => (
                            <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant={recommendation.priority === 'critical' ? 'destructive' : 'default'}>
                                  {recommendation.priority}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleImplementRecommendation(recommendation.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Implement
                                </Button>
                              </div>
                              <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{recommendation.description}</p>
                              <div className="text-xs text-slate-500">
                                Effort: {recommendation.implementation_effort} • Timeline: {recommendation.estimated_timeline}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Configuration Dialog */}
        <Dialog open={showConfiguration} onOpenChange={setShowConfiguration}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Usage Analysis Configuration</DialogTitle>
              <DialogDescription>
                Configure analysis parameters and settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Time Period Configuration */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Time Period</Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={analysisConfig.time_period.start_date.toISOString().split('T')[0]}
                      onChange={(e) => 
                        handleConfigurationUpdate({
                          time_period: {
                            ...analysisConfig.time_period,
                            start_date: new Date(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={analysisConfig.time_period.end_date.toISOString().split('T')[0]}
                      onChange={(e) => 
                        handleConfigurationUpdate({
                          time_period: {
                            ...analysisConfig.time_period,
                            end_date: new Date(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Granularity</Label>
                  <Select 
                    value={analysisConfig.time_period.granularity} 
                    onValueChange={(value: any) => 
                      handleConfigurationUpdate({
                        time_period: {
                          ...analysisConfig.time_period,
                          granularity: value
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Analysis Types */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Analysis Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['trend_analysis', 'anomaly_detection', 'user_segmentation', 'performance_analysis', 'cost_analysis', 'predictive_modeling'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={analysisConfig.analysis_types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleConfigurationUpdate({
                              analysis_types: [...analysisConfig.analysis_types, type]
                            })
                          } else {
                            handleConfigurationUpdate({
                              analysis_types: analysisConfig.analysis_types.filter(t => t !== type)
                            })
                          }
                        }}
                      />
                      <Label className="text-sm capitalize">{type.replace('_', ' ')}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly Detection Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Anomaly Detection</Label>
                
                <div className="space-y-2">
                  <Label className="text-xs">
                    Sensitivity: {Math.round(analysisConfig.anomaly_detection.sensitivity * 100)}%
                  </Label>
                  <Slider
                    value={[analysisConfig.anomaly_detection.sensitivity]}
                    onValueChange={([value]) => 
                      handleConfigurationUpdate({
                        anomaly_detection: {
                          ...analysisConfig.anomaly_detection,
                          sensitivity: value
                        }
                      })
                    }
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Exclude Known Events</Label>
                  <Switch
                    checked={analysisConfig.anomaly_detection.exclude_known_events}
                    onCheckedChange={(checked) => 
                      handleConfigurationUpdate({
                        anomaly_detection: {
                          ...analysisConfig.anomaly_detection,
                          exclude_known_events: checked
                        }
                      })
                    }
                  />
                </div>
              </div>

              {/* Forecasting Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Forecasting</Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable Forecasting</Label>
                  <Switch
                    checked={analysisConfig.forecasting.enable_forecasting}
                    onCheckedChange={(checked) => 
                      handleConfigurationUpdate({
                        forecasting: {
                          ...analysisConfig.forecasting,
                          enable_forecasting: checked
                        }
                      })
                    }
                  />
                </div>

                {analysisConfig.forecasting.enable_forecasting && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Forecast Horizon</Label>
                      <Select 
                        value={analysisConfig.forecasting.forecast_horizon} 
                        onValueChange={(value) => 
                          handleConfigurationUpdate({
                            forecasting: {
                              ...analysisConfig.forecasting,
                              forecast_horizon: value
                            }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1_week">1 Week</SelectItem>
                          <SelectItem value="1_month">1 Month</SelectItem>
                          <SelectItem value="3_months">3 Months</SelectItem>
                          <SelectItem value="6_months">6 Months</SelectItem>
                          <SelectItem value="1_year">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Seasonal Adjustment</Label>
                      <Switch
                        checked={analysisConfig.forecasting.seasonal_adjustment}
                        onCheckedChange={(checked) => 
                          handleConfigurationUpdate({
                            forecasting: {
                              ...analysisConfig.forecasting,
                              seasonal_adjustment: checked
                            }
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConfiguration(false)}>
                Cancel
              </Button>
              <Button>
                Apply Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pattern Details Dialog */}
        <Dialog open={showPatternDetails} onOpenChange={setShowPatternDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedPattern && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    {React.createElement(getPatternIcon(selectedPattern.pattern_type), { className: "h-5 w-5" })}
                    <span>{selectedPattern.pattern_name}</span>
                    <Badge className={getPatternColor(selectedPattern.pattern_type)}>
                      {selectedPattern.pattern_type.replace('_', ' ')}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Detailed analysis of usage pattern with {Math.round(selectedPattern.confidence_score * 100)}% confidence
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Pattern Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pattern Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedPattern.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Confidence Score:</span>
                              <span className="font-medium">{Math.round(selectedPattern.confidence_score * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Frequency:</span>
                              <span className="font-medium">{formatNumber(selectedPattern.frequency)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Trend:</span>
                              <div className="flex items-center space-x-1">
                                {React.createElement(getTrendIcon(selectedPattern.trend), { 
                                  className: `h-4 w-4 ${getTrendColor(selectedPattern.trend)}` 
                                })}
                                <span className={`font-medium ${getTrendColor(selectedPattern.trend)}`}>
                                  {selectedPattern.trend}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Pattern Strength:</span>
                              <span className="font-medium">{Math.round(selectedPattern.metadata.pattern_strength * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Detection Method:</span>
                              <span className="font-medium">{selectedPattern.metadata.detection_method}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Detected:</span>
                              <span className="font-medium">
                                {new Date(selectedPattern.detected_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Usage Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Usage Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="text-lg font-bold text-blue-600">
                            {formatNumber(selectedPattern.metrics.total_accesses)}
                          </div>
                          <div className="text-xs text-slate-500">Total Accesses</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="text-lg font-bold text-green-600">
                            {formatNumber(selectedPattern.metrics.unique_users)}
                          </div>
                          <div className="text-xs text-slate-500">Unique Users</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="text-lg font-bold text-purple-600">
                            {formatDuration(selectedPattern.metrics.avg_session_duration)}
                          </div>
                          <div className="text-xs text-slate-500">Avg Session</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="text-lg font-bold text-orange-600">
                            {Math.round(selectedPattern.metrics.business_impact_score * 100)}%
                          </div>
                          <div className="text-xs text-slate-500">Business Impact</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Seasonal Components */}
                  {selectedPattern.metadata.seasonal_components && selectedPattern.metadata.seasonal_components.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Seasonal Components</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedPattern.metadata.seasonal_components.map((component, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded">
                              <div>
                                <div className="font-medium capitalize">{component.component_type}</div>
                                <div className="text-sm text-slate-500">Period: {component.period} • Phase: {component.phase.toFixed(2)}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{Math.round(component.strength * 100)}%</div>
                                <div className="text-xs text-slate-500">Strength</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default UsagePatternAnalyzer