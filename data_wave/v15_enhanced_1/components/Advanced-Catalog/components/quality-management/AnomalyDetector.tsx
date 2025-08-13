"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, CheckCircle, XCircle, Info, Zap, Eye,
  Search, Filter, Settings, RefreshCw, Download, Upload,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  MoreHorizontal, EyeOff, Clock, Calendar,
  User, Users, Link, ExternalLink, Copy, Share2,
  Database, FileText, Cpu, Server, Cloud, Globe,
  PieChart, LineChart, BarChart3, Layers, GitBranch,
  Lightbulb, Rocket, Compass, Map, Route, Navigation,
  Award, Crown, Medal, Trophy, Badge as BadgeIcon,
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize2, Minimize2,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Plus, Minus, X, Check, Edit, Trash2,
  MessageSquare, Bell, Flag, Bookmark,
  Workflow, Boxes, Combine, Split, Shuffle,
  Hash, Tag, Tags, Sparkles, Brain, Target
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
import { catalogQualityService } from '../../services/catalog-quality.service'
import { useToast } from '@/components/ui/use-toast'

// Types for anomaly detection
interface DataAnomaly {
  id: string
  asset_id: string
  asset_name: string
  anomaly_type: 'statistical' | 'pattern' | 'volume' | 'quality' | 'schema' | 'temporal' | 'behavioral' | 'contextual'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed'
  confidence_score: number
  detected_at: Date
  resolved_at?: Date
  title: string
  description: string
  affected_fields: string[]
  affected_records: number
  total_records: number
  detection_method: 'threshold' | 'isolation_forest' | 'one_class_svm' | 'autoencoder' | 'lstm' | 'statistical_test' | 'rule_based' | 'ensemble'
  baseline_value?: number
  anomaly_value: number
  deviation_percentage: number
  root_cause_analysis?: RootCauseAnalysis
  impact_assessment: ImpactAssessment
  resolution_actions: ResolutionAction[]
  metadata: {
    detection_model: string
    model_version: string
    feature_importance: Record<string, number>
    detection_parameters: Record<string, any>
    data_context: DataContext
    historical_patterns: HistoricalPattern[]
    related_anomalies: string[]
    tags: string[]
    notes: string
  }
}

interface RootCauseAnalysis {
  primary_cause: string
  contributing_factors: string[]
  correlation_analysis: CorrelationAnalysis[]
  temporal_analysis: TemporalAnalysis
  external_factors: ExternalFactor[]
  confidence_level: number
  analysis_timestamp: Date
  recommendations: string[]
}

interface CorrelationAnalysis {
  factor: string
  correlation_coefficient: number
  p_value: number
  significance_level: string
  description: string
}

interface TemporalAnalysis {
  seasonality_detected: boolean
  trend_analysis: TrendAnalysis
  cyclical_patterns: CyclicalPattern[]
  change_points: ChangePoint[]
  forecast_deviation: number
}

interface TrendAnalysis {
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  trend_strength: number
  trend_significance: number
  trend_start_date: Date
}

interface CyclicalPattern {
  pattern_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  cycle_length: number
  amplitude: number
  phase: number
  confidence: number
}

interface ChangePoint {
  timestamp: Date
  change_magnitude: number
  change_type: 'mean_shift' | 'variance_change' | 'trend_change' | 'distribution_change'
  statistical_significance: number
}

interface ExternalFactor {
  factor_name: string
  factor_type: 'system_event' | 'data_source_change' | 'business_event' | 'technical_issue' | 'seasonal_effect'
  impact_score: number
  temporal_correlation: number
  description: string
}

interface ImpactAssessment {
  business_impact: 'low' | 'medium' | 'high' | 'critical'
  affected_systems: string[]
  affected_users: number
  data_quality_impact: number
  downstream_effects: DownstreamEffect[]
  financial_impact?: FinancialImpact
  compliance_risk: ComplianceRisk
  operational_impact: OperationalImpact
}

interface DownstreamEffect {
  system_name: string
  effect_type: 'data_corruption' | 'processing_delay' | 'report_inaccuracy' | 'decision_impact'
  severity: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration: string
  mitigation_status: 'none' | 'partial' | 'complete'
}

interface FinancialImpact {
  estimated_cost: number
  cost_category: 'operational' | 'compliance' | 'reputation' | 'opportunity_cost'
  currency: string
  calculation_method: string
  confidence_level: number
}

interface ComplianceRisk {
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  affected_regulations: string[]
  potential_violations: string[]
  remediation_required: boolean
  reporting_obligations: string[]
}

interface OperationalImpact {
  process_disruption: boolean
  performance_degradation: number
  resource_overhead: number
  user_experience_impact: 'minimal' | 'moderate' | 'significant' | 'severe'
  recovery_time_estimate: string
}

interface ResolutionAction {
  id: string
  action_type: 'investigate' | 'suppress' | 'fix_data' | 'adjust_threshold' | 'escalate' | 'monitor' | 'custom'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: string
  due_date?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completion_notes?: string
  created_at: Date
  updated_at: Date
}

interface DataContext {
  data_source: string
  schema_version: string
  data_lineage: string[]
  processing_pipeline: string
  data_freshness: number
  data_volume_trend: number[]
  quality_metrics: QualityMetrics
  business_context: BusinessContext
}

interface QualityMetrics {
  completeness: number
  accuracy: number
  consistency: number
  validity: number
  uniqueness: number
  timeliness: number
}

interface BusinessContext {
  business_domain: string
  criticality_level: 'low' | 'medium' | 'high' | 'critical'
  usage_patterns: string[]
  stakeholders: string[]
  business_rules: string[]
  sla_requirements: SLARequirement[]
}

interface SLARequirement {
  metric: string
  threshold: number
  operator: 'greater_than' | 'less_than' | 'equals' | 'between'
  unit: string
  penalty_description?: string
}

interface HistoricalPattern {
  pattern_id: string
  pattern_type: string
  frequency: number
  last_occurrence: Date
  typical_duration: number
  resolution_history: ResolutionHistory[]
}

interface ResolutionHistory {
  resolved_at: Date
  resolution_method: string
  resolution_time: number
  effectiveness_score: number
  recurrence_prevented: boolean
}

interface AnomalyDetectionModel {
  id: string
  name: string
  model_type: 'statistical' | 'machine_learning' | 'deep_learning' | 'ensemble' | 'rule_based'
  algorithm: string
  version: string
  status: 'active' | 'inactive' | 'training' | 'deprecated'
  target_assets: string[]
  detection_scope: 'real_time' | 'batch' | 'hybrid'
  sensitivity_level: number
  false_positive_rate: number
  true_positive_rate: number
  model_performance: ModelPerformance
  training_data: TrainingDataInfo
  hyperparameters: Record<string, any>
  feature_engineering: FeatureEngineering
  deployment_config: DeploymentConfig
  created_at: Date
  last_trained: Date
  next_retraining: Date
}

interface ModelPerformance {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  auc_roc: number
  confusion_matrix: number[][]
  performance_history: PerformanceMetric[]
  validation_results: ValidationResult[]
}

interface PerformanceMetric {
  timestamp: Date
  metric_name: string
  metric_value: number
  data_period: string
}

interface ValidationResult {
  validation_date: Date
  validation_type: 'holdout' | 'cross_validation' | 'time_series_split'
  validation_score: number
  validation_details: Record<string, any>
}

interface TrainingDataInfo {
  data_source: string
  training_period: {
    start_date: Date
    end_date: Date
  }
  sample_size: number
  feature_count: number
  anomaly_ratio: number
  data_quality_score: number
  preprocessing_steps: string[]
}

interface FeatureEngineering {
  selected_features: string[]
  engineered_features: EngineeredFeature[]
  feature_selection_method: string
  dimensionality_reduction: DimensionalityReduction
  normalization_method: string
}

interface EngineeredFeature {
  feature_name: string
  feature_type: 'statistical' | 'temporal' | 'categorical' | 'derived'
  calculation_method: string
  importance_score: number
}

interface DimensionalityReduction {
  method: 'pca' | 'ica' | 'lda' | 'tsne' | 'umap' | 'none'
  components: number
  explained_variance_ratio?: number[]
}

interface DeploymentConfig {
  deployment_environment: 'production' | 'staging' | 'development'
  compute_resources: ComputeResources
  scaling_config: ScalingConfig
  monitoring_config: MonitoringConfig
  alerting_config: AlertingConfig
}

interface ComputeResources {
  cpu_cores: number
  memory_gb: number
  gpu_enabled: boolean
  storage_gb: number
  max_concurrent_predictions: number
}

interface ScalingConfig {
  auto_scaling_enabled: boolean
  min_instances: number
  max_instances: number
  scale_up_threshold: number
  scale_down_threshold: number
}

interface MonitoringConfig {
  metrics_collection_enabled: boolean
  performance_monitoring: boolean
  drift_detection_enabled: boolean
  drift_threshold: number
  monitoring_frequency: string
}

interface AlertingConfig {
  alert_channels: string[]
  alert_thresholds: AlertThreshold[]
  escalation_rules: EscalationRule[]
}

interface AlertThreshold {
  metric: string
  threshold_value: number
  comparison_operator: 'greater_than' | 'less_than' | 'equals'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface EscalationRule {
  condition: string
  delay_minutes: number
  escalate_to: string[]
  message_template: string
}

interface AnomalyDetectionConfiguration {
  global_sensitivity: number
  detection_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly'
  minimum_confidence_threshold: number
  auto_resolution_enabled: boolean
  false_positive_learning: boolean
  ensemble_voting_strategy: 'majority' | 'weighted' | 'unanimous'
  notification_settings: NotificationSettings
  retention_policy: RetentionPolicy
  integration_settings: IntegrationSettings
}

interface NotificationSettings {
  email_notifications: boolean
  slack_notifications: boolean
  webhook_notifications: boolean
  sms_notifications: boolean
  notification_thresholds: Record<string, number>
  quiet_hours: QuietHours
}

interface QuietHours {
  enabled: boolean
  start_time: string
  end_time: string
  timezone: string
  exceptions: string[]
}

interface RetentionPolicy {
  anomaly_retention_days: number
  resolved_anomaly_retention_days: number
  false_positive_retention_days: number
  archive_to_cold_storage: boolean
  cold_storage_after_days: number
}

interface IntegrationSettings {
  ticketing_system_integration: boolean
  monitoring_system_integration: boolean
  data_pipeline_integration: boolean
  business_intelligence_integration: boolean
  custom_integrations: CustomIntegration[]
}

interface CustomIntegration {
  name: string
  type: 'webhook' | 'api' | 'message_queue' | 'database'
  endpoint: string
  authentication: Record<string, any>
  payload_template: string
  retry_policy: RetryPolicy
}

interface RetryPolicy {
  max_retries: number
  retry_delay: number
  backoff_strategy: 'linear' | 'exponential'
  retry_conditions: string[]
}

// Main AnomalyDetector Component
export const AnomalyDetector: React.FC = () => {
  // Core state management
  const [anomalies, setAnomalies] = useState<DataAnomaly[]>([])
  const [selectedAnomaly, setSelectedAnomaly] = useState<DataAnomaly | null>(null)
  const [detectionModels, setDetectionModels] = useState<AnomalyDetectionModel[]>([])
  const [detectionConfig, setDetectionConfig] = useState<AnomalyDetectionConfiguration>({
    global_sensitivity: 0.8,
    detection_frequency: 'real_time',
    minimum_confidence_threshold: 0.7,
    auto_resolution_enabled: false,
    false_positive_learning: true,
    ensemble_voting_strategy: 'weighted',
    notification_settings: {
      email_notifications: true,
      slack_notifications: false,
      webhook_notifications: false,
      sms_notifications: false,
      notification_thresholds: {
        low: 0.5,
        medium: 0.7,
        high: 0.85,
        critical: 0.95
      },
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '06:00',
        timezone: 'UTC',
        exceptions: []
      }
    },
    retention_policy: {
      anomaly_retention_days: 90,
      resolved_anomaly_retention_days: 30,
      false_positive_retention_days: 7,
      archive_to_cold_storage: true,
      cold_storage_after_days: 365
    },
    integration_settings: {
      ticketing_system_integration: false,
      monitoring_system_integration: true,
      data_pipeline_integration: true,
      business_intelligence_integration: false,
      custom_integrations: []
    }
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('anomalies')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAnomalies, setSelectedAnomalies] = useState<string[]>([])
  const [filterBy, setFilterBy] = useState<{
    anomaly_types: string[]
    severities: string[]
    statuses: string[]
    detection_methods: string[]
    date_range: {
      start: Date | null
      end: Date | null
    }
    confidence_range: [number, number]
  }>({
    anomaly_types: [],
    severities: [],
    statuses: [],
    detection_methods: [],
    date_range: {
      start: null,
      end: null
    },
    confidence_range: [0.5, 1]
  })

  // Detection and analysis state
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionProgress, setDetectionProgress] = useState(0)
  const [detectionStatus, setDetectionStatus] = useState('')
  const [realTimeDetection, setRealTimeDetection] = useState(false)

  // Dialog and modal states
  const [showAnomalyDetails, setShowAnomalyDetails] = useState(false)
  const [showModelDetails, setShowModelDetails] = useState(false)
  const [showConfiguration, setShowConfiguration] = useState(false)
  const [showRootCauseAnalysis, setShowRootCauseAnalysis] = useState(false)
  const [showResolutionActions, setShowResolutionActions] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Selected items for detailed view
  const [selectedModel, setSelectedModel] = useState<AnomalyDetectionModel | null>(null)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Queries
  const { data: anomaliesData, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['dataAnomalies', filterBy],
    queryFn: () => catalogQualityService.getDataAnomalies(filterBy),
    staleTime: 30000,
    refetchInterval: realTimeDetection ? 10000 : false
  })

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['anomalyDetectionModels'],
    queryFn: () => catalogQualityService.getAnomalyDetectionModels(),
    staleTime: 300000
  })

  const { data: anomalyStats, isLoading: statsLoading } = useQuery({
    queryKey: ['anomalyStatistics'],
    queryFn: () => catalogQualityService.getAnomalyStatistics(),
    staleTime: 60000
  })

  // Mutations
  const runDetectionMutation = useMutation({
    mutationFn: ({ modelIds, assetIds }: { modelIds: string[]; assetIds: string[] }) =>
      catalogQualityService.runAnomalyDetection(modelIds, assetIds),
    onMutate: () => {
      setIsDetecting(true)
      setDetectionProgress(0)
      setDetectionStatus('Initializing anomaly detection...')
    },
    onSuccess: (data) => {
      setIsDetecting(false)
      setDetectionProgress(100)
      queryClient.invalidateQueries({ queryKey: ['dataAnomalies'] })
      queryClient.invalidateQueries({ queryKey: ['anomalyStatistics'] })
      toast({ 
        title: "Detection Complete", 
        description: `Detected ${data.new_anomalies} new anomalies` 
      })
    },
    onError: () => {
      setIsDetecting(false)
      toast({ title: "Detection Failed", description: "Failed to run anomaly detection", variant: "destructive" })
    }
  })

  const updateAnomalyStatusMutation = useMutation({
    mutationFn: ({ anomalyId, status, notes }: { anomalyId: string; status: string; notes?: string }) =>
      catalogQualityService.updateAnomalyStatus(anomalyId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataAnomalies'] })
      toast({ title: "Status Updated", description: "Anomaly status has been updated" })
    }
  })

  const bulkUpdateAnomaliesMutation = useMutation({
    mutationFn: ({ anomalyIds, action, parameters }: { anomalyIds: string[]; action: string; parameters?: any }) =>
      catalogQualityService.bulkUpdateAnomalies(anomalyIds, action, parameters),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dataAnomalies'] })
      toast({ 
        title: "Bulk Action Complete", 
        description: `Updated ${data.updated_count} anomalies` 
      })
    }
  })

  const generateRootCauseAnalysisMutation = useMutation({
    mutationFn: (anomalyId: string) => catalogQualityService.generateRootCauseAnalysis(anomalyId),
    onSuccess: (data) => {
      if (selectedAnomaly) {
        setSelectedAnomaly({
          ...selectedAnomaly,
          root_cause_analysis: data
        })
      }
      toast({ title: "Analysis Complete", description: "Root cause analysis has been generated" })
    }
  })

  const createResolutionActionMutation = useMutation({
    mutationFn: ({ anomalyId, action }: { anomalyId: string; action: Partial<ResolutionAction> }) =>
      catalogQualityService.createResolutionAction(anomalyId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataAnomalies'] })
      toast({ title: "Action Created", description: "Resolution action has been created" })
    }
  })

  // Filtered and processed data
  const filteredAnomalies = useMemo(() => {
    if (!anomalies) return []
    
    return anomalies.filter(anomaly => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          anomaly.title.toLowerCase().includes(query) ||
          anomaly.description.toLowerCase().includes(query) ||
          anomaly.asset_name.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Anomaly type filter
      if (filterBy.anomaly_types.length > 0 && !filterBy.anomaly_types.includes(anomaly.anomaly_type)) {
        return false
      }

      // Severity filter
      if (filterBy.severities.length > 0 && !filterBy.severities.includes(anomaly.severity)) {
        return false
      }

      // Status filter
      if (filterBy.statuses.length > 0 && !filterBy.statuses.includes(anomaly.status)) {
        return false
      }

      // Detection method filter
      if (filterBy.detection_methods.length > 0 && !filterBy.detection_methods.includes(anomaly.detection_method)) {
        return false
      }

      // Date range filter
      if (filterBy.date_range.start && new Date(anomaly.detected_at) < filterBy.date_range.start) {
        return false
      }
      if (filterBy.date_range.end && new Date(anomaly.detected_at) > filterBy.date_range.end) {
        return false
      }

      // Confidence range filter
      if (anomaly.confidence_score < filterBy.confidence_range[0] || 
          anomaly.confidence_score > filterBy.confidence_range[1]) {
        return false
      }

      return true
    })
  }, [anomalies, searchQuery, filterBy])

  // Helper functions
  const getAnomalyTypeColor = (type: string): string => {
    const colorMap = {
      statistical: 'text-blue-600 bg-blue-50',
      pattern: 'text-purple-600 bg-purple-50',
      volume: 'text-green-600 bg-green-50',
      quality: 'text-orange-600 bg-orange-50',
      schema: 'text-red-600 bg-red-50',
      temporal: 'text-indigo-600 bg-indigo-50',
      behavioral: 'text-yellow-600 bg-yellow-50',
      contextual: 'text-pink-600 bg-pink-50'
    }
    return colorMap[type] || 'text-gray-600 bg-gray-50'
  }

  const getSeverityColor = (severity: string): string => {
    const colorMap = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    }
    return colorMap[severity] || 'text-gray-600 bg-gray-50'
  }

  const getStatusIcon = (status: string) => {
    const iconMap = {
      new: AlertTriangle,
      acknowledged: Eye,
      investigating: Search,
      resolved: CheckCircle,
      false_positive: XCircle,
      suppressed: EyeOff
    }
    return iconMap[status] || AlertTriangle
  }

  const getStatusColor = (status: string): string => {
    const colorMap = {
      new: 'text-red-600',
      acknowledged: 'text-blue-600',
      investigating: 'text-orange-600',
      resolved: 'text-green-600',
      false_positive: 'text-gray-600',
      suppressed: 'text-purple-600'
    }
    return colorMap[status] || 'text-gray-600'
  }

  const formatConfidenceScore = (score: number): string => {
    return `${Math.round(score * 100)}%`
  }

  const formatDeviation = (deviation: number): string => {
    const sign = deviation >= 0 ? '+' : ''
    return `${sign}${deviation.toFixed(2)}%`
  }

  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Event handlers
  const handleAnomalySelect = (anomaly: DataAnomaly) => {
    setSelectedAnomaly(anomaly)
  }

  const handleRunDetection = (modelIds?: string[], assetIds?: string[]) => {
    const targetModels = modelIds || detectionModels.filter(m => m.status === 'active').map(m => m.id)
    const targetAssets = assetIds || []
    
    if (targetModels.length === 0) {
      toast({ title: "No Models Selected", description: "Please select detection models to run", variant: "destructive" })
      return
    }

    runDetectionMutation.mutate({ modelIds: targetModels, assetIds: targetAssets })
  }

  const handleUpdateAnomalyStatus = (anomalyId: string, status: string, notes?: string) => {
    updateAnomalyStatusMutation.mutate({ anomalyId, status, notes })
  }

  const handleBulkAction = (action: string, parameters?: any) => {
    if (selectedAnomalies.length === 0) {
      toast({ title: "No Anomalies Selected", description: "Please select anomalies to perform bulk actions", variant: "destructive" })
      return
    }

    bulkUpdateAnomaliesMutation.mutate({ anomalyIds: selectedAnomalies, action, parameters })
  }

  const handleGenerateRootCause = (anomalyId: string) => {
    generateRootCauseAnalysisMutation.mutate(anomalyId)
  }

  const handleCreateResolutionAction = (anomalyId: string, action: Partial<ResolutionAction>) => {
    createResolutionActionMutation.mutate({ anomalyId, action })
  }

  const handleExportAnomalies = (format: 'json' | 'csv' | 'xlsx') => {
    const data = {
      anomalies: filteredAnomalies,
      statistics: anomalyStats,
      exported_at: new Date().toISOString()
    }
    
    const filename = `anomalies.${format}`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
    toast({ title: "Export Complete", description: `Anomalies exported as ${format.toUpperCase()}` })
  }

  // Render functions
  const renderAnomalyCard = (anomaly: DataAnomaly) => {
    const isSelected = selectedAnomaly?.id === anomaly.id
    const isInSelection = selectedAnomalies.includes(anomaly.id)
    const StatusIcon = getStatusIcon(anomaly.status)
    
    return (
      <Card 
        key={anomaly.id}
        className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isInSelection ? 'bg-blue-50' : ''}`}
        onClick={() => handleAnomalySelect(anomaly)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {anomaly.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getAnomalyTypeColor(anomaly.anomaly_type)}>
                    {anomaly.anomaly_type}
                  </Badge>
                  <Badge className={getSeverityColor(anomaly.severity)}>
                    {anomaly.severity}
                  </Badge>
                  <div className={`flex items-center space-x-1 ${getStatusColor(anomaly.status)}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm">{anomaly.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Checkbox
                checked={isInSelection}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAnomalies(prev => [...prev, anomaly.id])
                  } else {
                    setSelectedAnomalies(prev => prev.filter(id => id !== anomaly.id))
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
                  <DropdownMenuItem onClick={() => {
                    setSelectedAnomaly(anomaly)
                    setShowAnomalyDetails(true)
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateRootCause(anomaly.id)}>
                    <Brain className="h-4 w-4 mr-2" />
                    Root Cause Analysis
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleUpdateAnomalyStatus(anomaly.id, 'acknowledged')}>
                    <Check className="h-4 w-4 mr-2" />
                    Acknowledge
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateAnomalyStatus(anomaly.id, 'false_positive')}>
                    <X className="h-4 w-4 mr-2" />
                    Mark False Positive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
            {anomaly.description}
          </p>

          {/* Anomaly Metrics */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Confidence:</span>
                <span className="font-medium">{formatConfidenceScore(anomaly.confidence_score)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deviation:</span>
                <span className={`font-medium ${anomaly.deviation_percentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatDeviation(anomaly.deviation_percentage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Affected:</span>
                <span className="font-medium">{anomaly.affected_records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total:</span>
                <span className="font-medium">{anomaly.total_records.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Asset Information */}
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium">Asset</div>
            <div className="text-sm text-slate-600 truncate">
              {anomaly.asset_name}
            </div>
          </div>

          {/* Affected Fields */}
          {anomaly.affected_fields.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-sm font-medium">Affected Fields</div>
              <div className="flex flex-wrap gap-1">
                {anomaly.affected_fields.slice(0, 3).map((field, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
                {anomaly.affected_fields.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{anomaly.affected_fields.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Detection Time */}
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-slate-500">Detected:</span>
            <span className="font-medium">{getTimeAgo(anomaly.detected_at)}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStatisticsOverview = () => {
    if (!anomalyStats) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Anomalies</p>
                <p className="text-2xl font-bold">{anomalyStats.total_anomalies}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">New Anomalies</p>
                <p className="text-2xl font-bold text-red-600">{anomalyStats.new_anomalies}</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{anomalyStats.resolved_anomalies}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Detection Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(anomalyStats.detection_rate * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Effect hooks
  useEffect(() => {
    if (anomaliesData) {
      setAnomalies(anomaliesData)
    }
  }, [anomaliesData])

  useEffect(() => {
    if (modelsData) {
      setDetectionModels(modelsData)
    }
  }, [modelsData])

  // Simulate detection progress
  useEffect(() => {
    if (isDetecting) {
      const interval = setInterval(() => {
        setDetectionProgress(prev => {
          const newProgress = prev + Math.random() * 12
          if (newProgress >= 90) {
            setDetectionStatus('Analyzing detection results...')
          } else if (newProgress >= 70) {
            setDetectionStatus('Running anomaly detection models...')
          } else if (newProgress >= 40) {
            setDetectionStatus('Processing data features...')
          } else if (newProgress >= 20) {
            setDetectionStatus('Loading data for analysis...')
          }
          return Math.min(newProgress, 95)
        })
      }, 400)

      return () => clearInterval(interval)
    }
  }, [isDetecting])

  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Anomaly Detector
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Advanced anomaly detection and analysis system
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Real-time Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={realTimeDetection}
                onCheckedChange={setRealTimeDetection}
              />
              <Label className="text-sm">Real-time</Label>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anomalies..."
                className="pl-10 w-64"
              />
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
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunDetection()}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Detect
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkActions(true)}
              disabled={selectedAnomalies.length === 0}
            >
              <Workflow className="h-4 w-4 mr-2" />
              Bulk ({selectedAnomalies.length})
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportAnomalies('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAnomalies('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAnomalies('xlsx')}>
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
          {isDetecting && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 border-b border-slate-200 dark:border-slate-700 bg-orange-50 dark:bg-orange-900/20"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Anomaly Detection</span>
                  <span>{Math.round(detectionProgress)}%</span>
                </div>
                <Progress value={detectionProgress} className="h-2" />
                <div className="text-xs text-slate-600">{detectionStatus}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-4" ref={containerRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="anomalies">Anomalies ({filteredAnomalies.length})</TabsTrigger>
              <TabsTrigger value="models">Models ({detectionModels.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="anomalies" className="mt-4">
              {/* Statistics Overview */}
              {renderStatisticsOverview()}

              {/* Bulk Selection Actions */}
              {selectedAnomalies.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedAnomalies.length} anomaly(ies) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => handleBulkAction('acknowledge')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('false_positive')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        False Positive
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedAnomalies([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {anomaliesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-lg font-medium">Loading anomalies...</p>
                  </div>
                </div>
              ) : filteredAnomalies.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No anomalies found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Run anomaly detection to identify data anomalies
                  </p>
                  <Button onClick={() => handleRunDetection()}>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Detection
                  </Button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {filteredAnomalies.map(renderAnomalyCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="models" className="mt-4">
              {modelsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-lg font-medium">Loading models...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {detectionModels.map((model) => (
                    <Card 
                      key={model.id}
                      className="transition-all duration-200 hover:shadow-lg cursor-pointer"
                      onClick={() => {
                        setSelectedModel(model)
                        setShowModelDetails(true)
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          {model.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{model.model_type}</Badge>
                          <Badge variant="secondary">{model.algorithm}</Badge>
                          <Badge className={model.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                            {model.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Accuracy:</span>
                              <span className="font-medium">{Math.round(model.model_performance.accuracy * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Precision:</span>
                              <span className="font-medium">{Math.round(model.model_performance.precision * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Recall:</span>
                              <span className="font-medium">{Math.round(model.model_performance.recall * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">F1 Score:</span>
                              <span className="font-medium">{model.model_performance.f1_score.toFixed(3)}</span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-500">Sensitivity:</span>
                              <span className="font-medium">{Math.round(model.sensitivity_level * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Assets:</span>
                              <span className="font-medium">{model.target_assets.length}</span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-500">
                            Last trained: {new Date(model.last_trained).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="space-y-6">
                {/* Anomaly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Anomaly Detection Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-slate-500">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Anomaly trend visualization will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Anomalies by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {anomalyStats && Object.entries(anomalyStats.type_breakdown || {}).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                            <Badge className={getAnomalyTypeColor(type)}>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Anomalies by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {anomalyStats && Object.entries(anomalyStats.severity_breakdown || {}).map(([severity, count]) => (
                          <div key={severity} className="flex items-center justify-between">
                            <span className="capitalize">{severity}</span>
                            <Badge className={getSeverityColor(severity)}>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Anomaly Details Dialog */}
        <Dialog open={showAnomalyDetails} onOpenChange={setShowAnomalyDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedAnomaly && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{selectedAnomaly.title}</span>
                    <Badge className={getSeverityColor(selectedAnomaly.severity)}>
                      {selectedAnomaly.severity}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Detailed analysis of detected anomaly with {formatConfidenceScore(selectedAnomaly.confidence_score)} confidence
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Anomaly Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Anomaly Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedAnomaly.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Anomaly Type:</span>
                              <Badge className={getAnomalyTypeColor(selectedAnomaly.anomaly_type)}>
                                {selectedAnomaly.anomaly_type}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Detection Method:</span>
                              <span className="font-medium">{selectedAnomaly.detection_method}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Confidence Score:</span>
                              <span className="font-medium">{formatConfidenceScore(selectedAnomaly.confidence_score)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Deviation:</span>
                              <span className={`font-medium ${selectedAnomaly.deviation_percentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatDeviation(selectedAnomaly.deviation_percentage)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Affected Records:</span>
                              <span className="font-medium">{selectedAnomaly.affected_records.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Detected:</span>
                              <span className="font-medium">
                                {new Date(selectedAnomaly.detected_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Impact Assessment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Impact Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Business Impact:</span>
                            <Badge className={getSeverityColor(selectedAnomaly.impact_assessment.business_impact)}>
                              {selectedAnomaly.impact_assessment.business_impact}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Affected Users:</span>
                            <span className="font-medium">{selectedAnomaly.impact_assessment.affected_users}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Quality Impact:</span>
                            <span className="font-medium">{Math.round(selectedAnomaly.impact_assessment.data_quality_impact * 100)}%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Compliance Risk:</span>
                            <Badge className={getSeverityColor(selectedAnomaly.impact_assessment.compliance_risk.risk_level)}>
                              {selectedAnomaly.impact_assessment.compliance_risk.risk_level}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Affected Systems:</span>
                            <span className="font-medium">{selectedAnomaly.impact_assessment.affected_systems.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resolution Actions */}
                  {selectedAnomaly.resolution_actions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Resolution Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedAnomaly.resolution_actions.map((action, index) => (
                            <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{action.title}</div>
                                <Badge variant={action.status === 'completed' ? 'default' : 'secondary'}>
                                  {action.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {action.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Priority: {action.priority}</span>
                                <span>Created: {new Date(action.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateAnomalyStatus(selectedAnomaly.id, 'acknowledged')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleGenerateRootCause(selectedAnomaly.id)}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Root Cause Analysis
                  </Button>
                  <Button onClick={() => setShowAnomalyDetails(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default AnomalyDetector