/**
 * Advanced ML Model Orchestrator Component - Version 2 (ML-Driven Classification)
 * Enterprise-grade ML model lifecycle management with sophisticated orchestration
 * Comprehensive model training, deployment, and monitoring with advanced workflow automation
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { 
  Brain,
  Cpu,
  Database,
  GitBranch,
  Layers,
  LineChart,
  Monitor,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
  Thermometer,
  Battery,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  MemoryStick,
  Timer,
  Calendar,
  Users,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Share2,
  Bookmark,
  Star,
  Flag,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  Code,
  Terminal,
  Network,
  Workflow,
  FlaskConical,
  Microscope,
  Beaker,
  TestTube2,
  Rocket,
  Package,
  Tags,
  Archive
} from 'lucide-react'

import {
  MLModelConfiguration,
  TrainingJob,
  MLPrediction,
  ModelDeploymentStatus,
  TrainingStatus,
  MLModelType,
  ModelPerformanceMetrics,
  BusinessMetrics,
  BaseComponentProps,
  LoadingState,
  ViewMode,
  FilterParams,
  SortParams,
  PaginationParams
} from '../core/types'

import { useClassificationState } from '../core/hooks/useClassificationState'
import { useRealTimeMonitoring } from '../core/hooks/useRealTimeMonitoring'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// ============================================================================
// ADVANCED TYPES AND INTERFACES
// ============================================================================

interface MLModelOrchestratorProps extends BaseComponentProps {
  onModelSelect?: (model: MLModelConfiguration) => void
  onModelCreate?: (model: MLModelConfiguration) => void
  onModelUpdate?: (model: MLModelConfiguration) => void
  onModelDelete?: (modelId: number) => void
  onTrainingStart?: (job: TrainingJob) => void
  onDeploymentTrigger?: (modelId: number, environment: string) => void
  selectedModelId?: number
  viewMode?: ViewMode
  enableAdvancedFeatures?: boolean
  enableRealTimeMonitoring?: boolean
  enableAutoML?: boolean
  showBusinessMetrics?: boolean
  customActions?: ModelAction[]
}

interface ModelAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  handler: (model: MLModelConfiguration) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  disabled?: (model: MLModelConfiguration) => boolean
  tooltip?: string
  requiresConfirmation?: boolean
}

interface ModelFilters {
  search: string
  modelType: MLModelType[]
  status: ModelDeploymentStatus[]
  environment: string[]
  tags: string[]
  accuracyRange: [number, number]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  customFilters: FilterParams[]
}

interface ModelMetrics {
  totalModels: number
  trainingModels: number
  productionModels: number
  stagedModels: number
  averageAccuracy: number
  totalPredictions: number
  avgResponseTime: number
  costPerPrediction: number
  monthlyGrowth: number
}

interface TrainingConfiguration {
  modelName: string
  description: string
  modelType: MLModelType
  algorithm: string
  hyperparameters: Record<string, any>
  datasetConfig: {
    sourceType: 'database' | 'file' | 'api'
    connectionDetails: Record<string, any>
    preprocessing: {
      validation: boolean
      cleaning: boolean
      featureEngineering: boolean
      scaling: string
    }
  }
  trainingParams: {
    epochs: number
    batchSize: number
    learningRate: number
    validationSplit: number
    earlyStopping: boolean
    patience: number
  }
  deploymentConfig: {
    autoDeployment: boolean
    environment: string
    replicas: number
    resources: {
      cpu: string
      memory: string
      gpu: boolean
    }
  }
  notifications: {
    onComplete: boolean
    onFailure: boolean
    onMilestone: boolean
    channels: string[]
    recipients: string[]
  }
}

interface ModelComparison {
  models: MLModelConfiguration[]
  metrics: {
    accuracy: number[]
    precision: number[]
    recall: number[]
    f1Score: number[]
    latency: number[]
    cost: number[]
  }
  winner: {
    overall: number
    byMetric: Record<string, number>
  }
  recommendations: string[]
}

interface AutoMLConfiguration {
  enabled: boolean
  objective: 'accuracy' | 'speed' | 'cost' | 'balanced'
  maxTrainingTime: number
  maxModels: number
  algorithms: string[]
  hyperparameterSearch: {
    strategy: 'grid' | 'random' | 'bayesian'
    iterations: number
    pruning: boolean
  }
  ensembleSettings: {
    enabled: boolean
    maxModels: number
    blendingStrategy: 'voting' | 'stacking' | 'weighted'
  }
  autoFeatureEngineering: boolean
  autoDataCleaning: boolean
  interpretabilityThreshold: number
}

interface ExperimentTracking {
  experiments: Experiment[]
  activeExperiment: string | null
  comparisonMode: boolean
  selectedExperiments: Set<string>
}

interface Experiment {
  id: string
  name: string
  description: string
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  modelId: number
  configuration: Record<string, any>
  metrics: ModelPerformanceMetrics
  artifacts: ExperimentArtifact[]
  tags: string[]
  notes: string[]
}

interface ExperimentArtifact {
  type: 'model' | 'plot' | 'data' | 'log' | 'config'
  name: string
  path: string
  size: number
  createdAt: string
  metadata: Record<string, any>
}

interface DeploymentPipeline {
  stages: DeploymentStage[]
  currentStage: number
  status: 'idle' | 'running' | 'completed' | 'failed'
  modelId: number
  environment: string
  rollbackPlan: RollbackPlan
  approvals: ApprovalStep[]
}

interface DeploymentStage {
  id: string
  name: string
  description: string
  type: 'validation' | 'testing' | 'deployment' | 'monitoring'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  duration?: number
  logs: string[]
  artifacts: string[]
  gates: QualityGate[]
}

interface QualityGate {
  name: string
  type: 'accuracy' | 'latency' | 'throughput' | 'cost' | 'drift'
  threshold: number
  actual?: number
  status: 'pass' | 'fail' | 'warning' | 'pending'
  critical: boolean
}

interface RollbackPlan {
  enabled: boolean
  triggers: RollbackTrigger[]
  previousVersion: string
  rollbackTime: number
  dataRetention: number
  notifications: string[]
}

interface RollbackTrigger {
  type: 'performance' | 'error_rate' | 'manual' | 'scheduled'
  condition: string
  threshold: number
  timeWindow: number
  action: 'automatic' | 'manual'
}

interface ApprovalStep {
  id: string
  name: string
  required: boolean
  approver: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp?: string
  comments?: string
}

interface ModelInferenceConfig {
  endpoint: string
  authentication: {
    type: 'api_key' | 'oauth' | 'certificate'
    credentials: Record<string, any>
  }
  rateLimiting: {
    requestsPerSecond: number
    burstCapacity: number
    queueSize: number
  }
  caching: {
    enabled: boolean
    ttl: number
    strategy: 'lru' | 'lfu' | 'ttl'
  }
  monitoring: {
    metrics: string[]
    alerts: string[]
    logging: {
      level: 'debug' | 'info' | 'warn' | 'error'
      sampling: number
      retention: number
    }
  }
}

// ============================================================================
// ML MODEL ORCHESTRATOR COMPONENT
// ============================================================================

export const MLModelOrchestrator: React.FC<MLModelOrchestratorProps> = ({
  onModelSelect,
  onModelCreate,
  onModelUpdate,
  onModelDelete,
  onTrainingStart,
  onDeploymentTrigger,
  selectedModelId,
  viewMode = 'table',
  enableAdvancedFeatures = true,
  enableRealTimeMonitoring = true,
  enableAutoML = true,
  showBusinessMetrics = true,
  customActions = [],
  className,
  loading: externalLoading,
  disabled,
  ...props
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [models, setModels] = useState<MLModelConfiguration[]>([])
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([])
  const [selectedModels, setSelectedModels] = useState<Set<number>>(new Set())
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Filter and view state
  const [filters, setFilters] = useState<ModelFilters>({
    search: '',
    modelType: [],
    status: [],
    environment: [],
    tags: [],
    accuracyRange: [0, 100],
    dateRange: { start: null, end: null },
    customFilters: []
  })

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    total: 0
  })

  const [sorting, setSorting] = useState<SortParams[]>([
    { field: 'updated_at', direction: 'desc' }
  ])

  // UI state
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode)
  const [activeTab, setActiveTab] = useState('models')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showComparisonDialog, setShowComparisonDialog] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showTrainingDialog, setShowTrainingDialog] = useState(false)
  const [showDeploymentDialog, setShowDeploymentDialog] = useState(false)
  const [expandedModel, setExpandedModel] = useState<number | null>(null)

  // Training configuration state
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfiguration>({
    modelName: '',
    description: '',
    modelType: MLModelType.RANDOM_FOREST,
    algorithm: 'random_forest',
    hyperparameters: {},
    datasetConfig: {
      sourceType: 'database',
      connectionDetails: {},
      preprocessing: {
        validation: true,
        cleaning: true,
        featureEngineering: false,
        scaling: 'standard'
      }
    },
    trainingParams: {
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      validationSplit: 0.2,
      earlyStopping: true,
      patience: 10
    },
    deploymentConfig: {
      autoDeployment: false,
      environment: 'staging',
      replicas: 1,
      resources: {
        cpu: '1',
        memory: '2Gi',
        gpu: false
      }
    },
    notifications: {
      onComplete: true,
      onFailure: true,
      onMilestone: false,
      channels: ['email'],
      recipients: []
    }
  })

  // AutoML configuration
  const [autoMLConfig, setAutoMLConfig] = useState<AutoMLConfiguration>({
    enabled: false,
    objective: 'accuracy',
    maxTrainingTime: 3600,
    maxModels: 10,
    algorithms: ['random_forest', 'gradient_boosting', 'neural_network'],
    hyperparameterSearch: {
      strategy: 'bayesian',
      iterations: 50,
      pruning: true
    },
    ensembleSettings: {
      enabled: true,
      maxModels: 5,
      blendingStrategy: 'stacking'
    },
    autoFeatureEngineering: true,
    autoDataCleaning: true,
    interpretabilityThreshold: 0.8
  })

  // Experiment tracking
  const [experimentTracking, setExperimentTracking] = useState<ExperimentTracking>({
    experiments: [],
    activeExperiment: null,
    comparisonMode: false,
    selectedExperiments: new Set()
  })

  // Deployment pipeline
  const [deploymentPipeline, setDeploymentPipeline] = useState<DeploymentPipeline | null>(null)

  // Model comparison
  const [modelComparison, setModelComparison] = useState<ModelComparison | null>(null)

  // Metrics state
  const [metrics, setMetrics] = useState<ModelMetrics>({
    totalModels: 0,
    trainingModels: 0,
    productionModels: 0,
    stagedModels: 0,
    averageAccuracy: 0,
    totalPredictions: 0,
    avgResponseTime: 0,
    costPerPrediction: 0,
    monthlyGrowth: 0
  })

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const intervalsRef = useRef<NodeJS.Timeout[]>([])

  // Hooks
  const { state: classificationState, useMLIntelligence } = useClassificationState()
  const { 
    models: stateModels, 
    trainingJobs: stateTrainingJobs, 
    metrics: stateMetrics,
    addModel,
    updateModel,
    deployModel,
    monitorTraining
  } = useMLIntelligence()

  const { isConnected, lastUpdate } = useRealTimeMonitoring(enableRealTimeMonitoring)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isLoading = loadingState === 'loading' || externalLoading
  const hasSelection = selectedModels.size > 0
  const isAllSelected = models.length > 0 && selectedModels.size === models.length
  const isPartiallySelected = hasSelection && !isAllSelected

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          model.name.toLowerCase().includes(searchLower) ||
          model.description.toLowerCase().includes(searchLower) ||
          model.model_type.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filters.modelType.length > 0 && !filters.modelType.includes(model.model_type)) {
        return false
      }

      if (filters.status.length > 0 && !filters.status.includes(model.status)) {
        return false
      }

      if (filters.accuracyRange) {
        const accuracy = model.performance_metrics?.accuracy || 0
        if (accuracy < filters.accuracyRange[0] / 100 || accuracy > filters.accuracyRange[1] / 100) {
          return false
        }
      }

      return true
    })
  }, [models, filters])

  const runningTrainingJobs = useMemo(() => {
    return trainingJobs.filter(job => job.status === TrainingStatus.TRAINING)
  }, [trainingJobs])

  const availableAlgorithms = useMemo(() => {
    const algorithmsByType: Record<MLModelType, string[]> = {
      [MLModelType.NAIVE_BAYES]: ['gaussian_nb', 'multinomial_nb', 'bernoulli_nb'],
      [MLModelType.SVM]: ['svc', 'linear_svc', 'nu_svc'],
      [MLModelType.RANDOM_FOREST]: ['random_forest', 'extra_trees'],
      [MLModelType.GRADIENT_BOOSTING]: ['xgboost', 'lightgbm', 'catboost', 'gradient_boosting'],
      [MLModelType.NEURAL_NETWORK]: ['mlp', 'cnn', 'rnn', 'lstm', 'transformer'],
      [MLModelType.TRANSFORMER]: ['bert', 'roberta', 'gpt', 'xlnet'],
      [MLModelType.ENSEMBLE]: ['voting', 'bagging', 'stacking', 'blending']
    }
    return algorithmsByType[trainingConfig.modelType] || []
  }, [trainingConfig.modelType])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleModelSelect = useCallback((model: MLModelConfiguration) => {
    onModelSelect?.(model)
  }, [onModelSelect])

  const handleModelToggleSelection = useCallback((modelId: number) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(modelId)) {
        newSet.delete(modelId)
      } else {
        newSet.add(modelId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedModels(new Set())
    } else {
      setSelectedModels(new Set(filteredModels.map(m => m.id)))
    }
  }, [filteredModels, isAllSelected])

  const handleCreateModel = useCallback(async () => {
    try {
      setLoadingState('loading')
      
      // Create model configuration
      const newModel: Partial<MLModelConfiguration> = {
        name: trainingConfig.modelName,
        description: trainingConfig.description,
        model_type: trainingConfig.modelType,
        algorithm_config: {
          algorithm: trainingConfig.algorithm,
          hyperparameters: trainingConfig.hyperparameters,
          optimization_strategy: 'bayesian',
          cross_validation: {
            folds: 5,
            strategy: 'k_fold'
          },
          early_stopping: {
            enabled: trainingConfig.trainingParams.earlyStopping,
            patience: trainingConfig.trainingParams.patience,
            min_delta: 0.001,
            monitor_metric: 'accuracy'
          }
        },
        training_config: {
          dataset_config: trainingConfig.datasetConfig as any,
          splitting_strategy: {
            train_ratio: 1 - trainingConfig.trainingParams.validationSplit,
            validation_ratio: trainingConfig.trainingParams.validationSplit,
            test_ratio: 0.2,
            stratify: true,
            random_state: 42
          },
          training_parameters: {
            batch_size: trainingConfig.trainingParams.batchSize,
            epochs: trainingConfig.trainingParams.epochs,
            learning_rate: trainingConfig.trainingParams.learningRate,
            regularization: {
              l1_ratio: 0.0,
              l2_ratio: 0.01,
              dropout_rate: 0.1,
              batch_normalization: true
            }
          },
          optimization: {
            optimizer: 'adam',
            loss_function: 'categorical_crossentropy',
            metrics: ['accuracy', 'precision', 'recall'],
            early_stopping: trainingConfig.trainingParams.earlyStopping
          },
          infrastructure: {
            compute_type: trainingConfig.deploymentConfig.resources.gpu ? 'gpu' : 'cpu',
            memory_limit: trainingConfig.deploymentConfig.resources.memory,
            timeout_minutes: 60,
            parallel_workers: 1
          }
        },
        deployment_config: {
          environment: trainingConfig.deploymentConfig.environment as any,
          scaling: {
            min_instances: 1,
            max_instances: trainingConfig.deploymentConfig.replicas,
            auto_scaling: true,
            cpu_threshold: 70,
            memory_threshold: 80
          },
          monitoring: {
            performance_monitoring: true,
            drift_detection: true,
            alert_thresholds: []
          },
          rollback: {
            enabled: true,
            criteria: []
          }
        },
        status: 'training' as any,
        version_history: []
      }

      // Add model to state
      addModel(newModel as MLModelConfiguration)
      onModelCreate?.(newModel as MLModelConfiguration)
      
      // Start training if configured
      if (trainingConfig.notifications.onComplete) {
        onTrainingStart?.({
          model_config_id: newModel.id!,
          job_name: `${trainingConfig.modelName}_training`,
          status: TrainingStatus.INITIALIZING,
          progress: {
            current_epoch: 0,
            total_epochs: trainingConfig.trainingParams.epochs,
            current_batch: 0,
            total_batches: 0,
            elapsed_time: 0,
            estimated_remaining_time: 0,
            current_metrics: {},
            best_metrics: {}
          },
          configuration: newModel.training_config!,
          resource_usage: {
            cpu_usage: 0,
            memory_usage: 0,
            storage_usage: 0,
            network_io: 0,
            execution_time: 0
          },
          logs: [],
          artifacts: []
        } as TrainingJob)
      }

      setShowCreateDialog(false)
      resetTrainingConfig()
      
      setLoadingState('success')
    } catch (err: any) {
      setError(err.message)
      setLoadingState('error')
    }
  }, [trainingConfig, addModel, onModelCreate, onTrainingStart])

  const resetTrainingConfig = useCallback(() => {
    setTrainingConfig({
      modelName: '',
      description: '',
      modelType: MLModelType.RANDOM_FOREST,
      algorithm: 'random_forest',
      hyperparameters: {},
      datasetConfig: {
        sourceType: 'database',
        connectionDetails: {},
        preprocessing: {
          validation: true,
          cleaning: true,
          featureEngineering: false,
          scaling: 'standard'
        }
      },
      trainingParams: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        validationSplit: 0.2,
        earlyStopping: true,
        patience: 10
      },
      deploymentConfig: {
        autoDeployment: false,
        environment: 'staging',
        replicas: 1,
        resources: {
          cpu: '1',
          memory: '2Gi',
          gpu: false
        }
      },
      notifications: {
        onComplete: true,
        onFailure: true,
        onMilestone: false,
        channels: ['email'],
        recipients: []
      }
    })
  }, [])

  const handleModelAction = useCallback(async (action: string, model: MLModelConfiguration) => {
    try {
      setLoadingState('loading')

      switch (action) {
        case 'deploy':
          await deployModel(model.id, 'production')
          onDeploymentTrigger?.(model.id, 'production')
          break

        case 'clone':
          const clonedModel = {
            ...model,
            id: Date.now(),
            name: `${model.name} (Clone)`,
            status: 'training' as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          addModel(clonedModel)
          break

        case 'retrain':
          onTrainingStart?.({
            model_config_id: model.id,
            job_name: `${model.name}_retrain`,
            status: TrainingStatus.INITIALIZING,
            progress: {
              current_epoch: 0,
              total_epochs: 100,
              current_batch: 0,
              total_batches: 0,
              elapsed_time: 0,
              estimated_remaining_time: 0,
              current_metrics: {},
              best_metrics: {}
            },
            configuration: model.training_config!,
            resource_usage: {
              cpu_usage: 0,
              memory_usage: 0,
              storage_usage: 0,
              network_io: 0,
              execution_time: 0
            },
            logs: [],
            artifacts: []
          } as TrainingJob)
          break

        case 'archive':
          updateModel({
            ...model,
            status: 'archived' as any,
            updated_at: new Date().toISOString()
          })
          break

        case 'delete':
          onModelDelete?.(model.id)
          break

        default:
          const customAction = customActions.find(a => a.id === action)
          if (customAction) {
            customAction.handler(model)
          }
      }

      setLoadingState('success')
    } catch (err: any) {
      setError(err.message)
      setLoadingState('error')
    }
  }, [deployModel, addModel, updateModel, onDeploymentTrigger, onTrainingStart, onModelDelete, customActions])

  const handleCompareModels = useCallback(async () => {
    if (selectedModels.size < 2) return

    try {
      setLoadingState('loading')
      
      const modelsToCompare = models.filter(m => selectedModels.has(m.id))
      const comparison: ModelComparison = {
        models: modelsToCompare,
        metrics: {
          accuracy: modelsToCompare.map(m => m.performance_metrics?.accuracy || 0),
          precision: modelsToCompare.map(m => m.performance_metrics?.precision || 0),
          recall: modelsToCompare.map(m => m.performance_metrics?.recall || 0),
          f1Score: modelsToCompare.map(m => m.performance_metrics?.f1_score || 0),
          latency: modelsToCompare.map(m => Math.random() * 100), // Mock data
          cost: modelsToCompare.map(m => Math.random() * 10) // Mock data
        },
        winner: {
          overall: 0,
          byMetric: {
            accuracy: 0,
            precision: 0,
            recall: 0,
            f1Score: 0,
            latency: 0,
            cost: 0
          }
        },
        recommendations: [
          'Model A shows better accuracy but higher latency',
          'Consider ensemble approach for best performance',
          'Model B is more cost-effective for production'
        ]
      }

      // Calculate winners
      Object.keys(comparison.metrics).forEach(metric => {
        const values = comparison.metrics[metric as keyof typeof comparison.metrics]
        const maxIndex = values.indexOf(Math.max(...values))
        comparison.winner.byMetric[metric] = maxIndex
      })

      setModelComparison(comparison)
      setShowComparisonDialog(true)
      setLoadingState('success')
    } catch (err: any) {
      setError(err.message)
      setLoadingState('error')
    }
  }, [selectedModels, models])

  const handleAutoMLTrigger = useCallback(async () => {
    try {
      setLoadingState('loading')
      
      // Create AutoML experiment
      const autoMLExperiment: Experiment = {
        id: `automl_${Date.now()}`,
        name: `AutoML Experiment - ${new Date().toISOString()}`,
        description: `Automated model selection with ${autoMLConfig.objective} optimization`,
        startTime: new Date().toISOString(),
        status: 'running',
        modelId: 0,
        configuration: autoMLConfig,
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1_score: 0,
          auc_roc: 0,
          auc_pr: 0,
          confusion_matrix: [],
          classification_report: {
            classes: [],
            precision_per_class: [],
            recall_per_class: [],
            f1_per_class: [],
            support_per_class: [],
            macro_avg: { precision: 0, recall: 0, f1_score: 0, support: 0 },
            weighted_avg: { precision: 0, recall: 0, f1_score: 0, support: 0 }
          },
          cross_validation_scores: {
            mean_scores: {},
            std_scores: {},
            individual_scores: {}
          }
        },
        artifacts: [],
        tags: ['automl', autoMLConfig.objective],
        notes: []
      }

      setExperimentTracking(prev => ({
        ...prev,
        experiments: [autoMLExperiment, ...prev.experiments],
        activeExperiment: autoMLExperiment.id
      }))

      // Simulate AutoML process
      setTimeout(() => {
        setExperimentTracking(prev => ({
          ...prev,
          experiments: prev.experiments.map(exp => 
            exp.id === autoMLExperiment.id 
              ? { ...exp, status: 'completed', endTime: new Date().toISOString() }
              : exp
          ),
          activeExperiment: null
        }))
      }, 10000)

      setLoadingState('success')
    } catch (err: any) {
      setError(err.message)
      setLoadingState('error')
    }
  }, [autoMLConfig])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load initial data
    setModels(stateModels)
    setTrainingJobs(stateTrainingJobs)
    
    // Update metrics
    const newMetrics: ModelMetrics = {
      totalModels: stateModels.length,
      trainingModels: stateModels.filter(m => m.status === 'training').length,
      productionModels: stateModels.filter(m => m.status === 'production').length,
      stagedModels: stateModels.filter(m => m.status === 'staged').length,
      averageAccuracy: stateModels.reduce((acc, m) => acc + (m.performance_metrics?.accuracy || 0), 0) / (stateModels.length || 1),
      totalPredictions: stateMetrics.totalPredictions,
      avgResponseTime: stateMetrics.averageResponseTime || 0,
      costPerPrediction: stateMetrics.costOptimization || 0,
      monthlyGrowth: 12.5 // Mock data
    }
    setMetrics(newMetrics)
  }, [stateModels, stateTrainingJobs, stateMetrics])

  useEffect(() => {
    // Setup real-time monitoring
    if (enableRealTimeMonitoring && isConnected) {
      const ws = new WebSocket('ws://localhost:8000/ws/ml-monitoring')
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'training_progress':
            setTrainingJobs(prev => prev.map(job => 
              job.id === data.jobId 
                ? { ...job, progress: data.progress }
                : job
            ))
            break
          
          case 'model_deployed':
            setModels(prev => prev.map(model => 
              model.id === data.modelId 
                ? { ...model, status: 'production' as any }
                : model
            ))
            break
          
          case 'performance_alert':
            setError(`Performance alert: ${data.message}`)
            break
        }
      }
      
      wsRef.current = ws
      
      return () => {
        ws.close()
      }
    }
  }, [enableRealTimeMonitoring, isConnected])

  useEffect(() => {
    // Cleanup intervals
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval))
    }
  }, [])

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderModelCard = (model: MLModelConfiguration) => (
    <Card 
      key={model.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selectedModelId === model.id ? 'ring-2 ring-primary' : ''
      } ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && handleModelSelect(model)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={selectedModels.has(model.id)}
              onCheckedChange={() => handleModelToggleSelection(model.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center space-x-2">
              {getModelTypeIcon(model.model_type)}
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>{model.name}</span>
                  {model.status === 'production' && <Star className="w-4 h-4 text-yellow-500" />}
                </CardTitle>
                <CardDescription className="mt-1">
                  {model.description}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {renderModelStatusBadge(model)}
            <ModelActionsMenu 
              model={model} 
              onAction={handleModelAction}
              customActions={customActions}
              disabled={disabled}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {model.performance_metrics?.accuracy ? `${Math.round(model.performance_metrics.accuracy * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {model.performance_metrics?.precision ? `${Math.round(model.performance_metrics.precision * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Precision</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {model.performance_metrics?.recall ? `${Math.round(model.performance_metrics.recall * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Recall</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {model.performance_metrics?.f1_score ? `${Math.round(model.performance_metrics.f1_score * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">F1 Score</div>
          </div>
        </div>

        {/* Model Info */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{model.model_type}</Badge>
          <Badge variant="secondary">{model.algorithm_config.algorithm}</Badge>
          {model.business_metrics && (
            <Badge variant="outline" className="text-green-600">
              ROI: ${model.business_metrics.cost_metrics[0]?.projected_savings || 0}K
            </Badge>
          )}
        </div>

        {/* Training Progress */}
        {model.status === 'training' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Training Progress</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(model.updated_at).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {model.created_by}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {model.status === 'production' && (
              <div className="flex items-center text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>Live</span>
              </div>
            )}
            {enableRealTimeMonitoring && (
              <Tooltip>
                <TooltipTrigger>
                  <Wifi className="w-4 h-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>Real-time monitoring active</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderModelRow = (model: MLModelConfiguration) => (
    <TableRow 
      key={model.id}
      className={`cursor-pointer hover:bg-muted/50 ${
        selectedModelId === model.id ? 'bg-muted' : ''
      } ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && handleModelSelect(model)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selectedModels.has(model.id)}
          onCheckedChange={() => handleModelToggleSelection(model.id)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getModelTypeIcon(model.model_type)}
          <div>
            <div className="font-medium flex items-center space-x-2">
              <span>{model.name}</span>
              {model.status === 'production' && <Star className="w-4 h-4 text-yellow-500" />}
            </div>
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {model.description}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{renderModelStatusBadge(model)}</TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <Badge variant="outline" className="w-fit">{model.model_type}</Badge>
          <span className="text-sm text-muted-foreground">{model.algorithm_config.algorithm}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {model.performance_metrics?.accuracy ? `${Math.round(model.performance_metrics.accuracy * 100)}%` : 'N/A'}
      </TableCell>
      <TableCell className="text-center">
        {model.performance_metrics?.f1_score ? `${Math.round(model.performance_metrics.f1_score * 100)}%` : 'N/A'}
      </TableCell>
      <TableCell>
        {model.status === 'training' ? (
          <div className="space-y-1">
            <Progress value={75} className="h-2" />
            <span className="text-xs text-muted-foreground">Epoch 75/100</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {new Date(model.updated_at).toLocaleDateString()}
          </span>
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <ModelActionsMenu 
          model={model} 
          onAction={handleModelAction}
          customActions={customActions}
          disabled={disabled}
        />
      </TableCell>
    </TableRow>
  )

  const renderModelStatusBadge = (model: MLModelConfiguration) => {
    const statusConfig = {
      training: { variant: 'outline' as const, icon: Clock, label: 'Training' },
      staged: { variant: 'secondary' as const, icon: TestTube2, label: 'Staged' },
      production: { variant: 'default' as const, icon: CheckCircle, label: 'Production' },
      deprecated: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Deprecated' },
      archived: { variant: 'outline' as const, icon: Archive, label: 'Archived' }
    }

    const config = statusConfig[model.status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const getModelTypeIcon = (type: MLModelType) => {
    const iconMap = {
      [MLModelType.NAIVE_BAYES]: <Brain className="w-5 h-5 text-blue-500" />,
      [MLModelType.SVM]: <Target className="w-5 h-5 text-green-500" />,
      [MLModelType.RANDOM_FOREST]: <Layers className="w-5 h-5 text-emerald-500" />,
      [MLModelType.GRADIENT_BOOSTING]: <TrendingUp className="w-5 h-5 text-orange-500" />,
      [MLModelType.NEURAL_NETWORK]: <Network className="w-5 h-5 text-purple-500" />,
      [MLModelType.TRANSFORMER]: <Zap className="w-5 h-5 text-yellow-500" />,
      [MLModelType.ENSEMBLE]: <GitBranch className="w-5 h-5 text-indigo-500" />
    }
    return iconMap[type] || <Brain className="w-5 h-5 text-gray-500" />
  }

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================

  const ModelActionsMenu: React.FC<{
    model: MLModelConfiguration
    onAction: (action: string, model: MLModelConfiguration) => void
    customActions: ModelAction[]
    disabled?: boolean
  }> = ({ model, onAction, customActions, disabled }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {model.status !== 'production' && (
          <DropdownMenuItem onClick={() => onAction('deploy', model)}>
            <Rocket className="w-4 h-4 mr-2" />
            Deploy to Production
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onAction('clone', model)}>
          <Copy className="w-4 h-4 mr-2" />
          Clone Model
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('retrain', model)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retrain
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onAction('archive', model)}>
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </DropdownMenuItem>
        
        {customActions.map(action => (
          <DropdownMenuItem 
            key={action.id}
            onClick={() => onAction(action.id, model)}
            disabled={action.disabled?.(model)}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onAction('delete', model)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`} {...props}>
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
              <Brain className="w-8 h-8 text-primary" />
              <span>ML Model Orchestrator</span>
            </h2>
            <p className="text-muted-foreground">
              Advanced machine learning model lifecycle management with intelligent automation
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {enableRealTimeMonitoring && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-muted">
                    <Activity className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="text-sm">
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Real-time monitoring {isConnected ? 'enabled' : 'disabled'}
                </TooltipContent>
              </Tooltip>
            )}
            
            {enableAutoML && (
              <Button variant="outline" onClick={handleAutoMLTrigger} disabled={isLoading}>
                <FlaskConical className="w-4 h-4 mr-2" />
                AutoML
              </Button>
            )}
            
            <Button variant="outline" onClick={() => setShowCreateDialog(true)} disabled={disabled}>
              <Plus className="w-4 h-4 mr-2" />
              Create Model
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        {showBusinessMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{metrics.totalModels}</div>
                <div className="text-sm text-muted-foreground">Total Models</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.trainingModels}</div>
                <div className="text-sm text-muted-foreground">Training</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.productionModels}</div>
                <div className="text-sm text-muted-foreground">Production</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{metrics.stagedModels}</div>
                <div className="text-sm text-muted-foreground">Staged</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(metrics.averageAccuracy * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Accuracy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{metrics.totalPredictions.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Predictions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.avgResponseTime}ms</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">+{metrics.monthlyGrowth}%</div>
                <div className="text-sm text-muted-foreground">Growth</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="training">Training Jobs</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            {enableAutoML && <TabsTrigger value="automl">AutoML</TabsTrigger>}
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            {/* Filters and Controls */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search models..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Select
                  value={filters.status.length === 1 ? filters.status[0] : ''}
                  onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, status: value ? [value as ModelDeploymentStatus] : [] }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="staged">Staged</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                {hasSelection && (
                  <Button variant="outline" onClick={handleCompareModels}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Compare ({selectedModels.size})
                  </Button>
                )}
              </div>

              <div className="flex items-center border rounded-md">
                <Button
                  variant={currentViewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentViewMode('table')}
                  className="rounded-r-none"
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentViewMode('grid')}
                  className="rounded-l-none"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Models Content */}
            <div className="space-y-4">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}

              {!isLoading && filteredModels.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No models found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first ML model to get started
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Model
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!isLoading && filteredModels.length > 0 && (
                <>
                  {currentViewMode === 'grid' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredModels.map(renderModelCard)}
                    </div>
                  ) : (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={isAllSelected}
                                indeterminate={isPartiallySelected}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center">Accuracy</TableHead>
                            <TableHead className="text-center">F1 Score</TableHead>
                            <TableHead>Progress/Updated</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredModels.map(renderModelRow)}
                        </TableBody>
                      </Table>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Training Jobs Tab */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Training Jobs</CardTitle>
                <CardDescription>
                  Monitor ongoing model training processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {runningTrainingJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active training jobs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {runningTrainingJobs.map(job => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{job.job_name}</h4>
                          <Badge variant="outline">{job.status}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Epoch {job.progress.current_epoch}/{job.progress.total_epochs}</span>
                            <span>{Math.round((job.progress.current_epoch / job.progress.total_epochs) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(job.progress.current_epoch / job.progress.total_epochs) * 100} 
                            className="h-2" 
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Elapsed: {Math.round(job.progress.elapsed_time / 60)}m</span>
                            <span>ETA: {Math.round(job.progress.estimated_remaining_time / 60)}m</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented similarly... */}
        </Tabs>

        {/* Create Model Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New ML Model</DialogTitle>
              <DialogDescription>
                Configure and train a new machine learning model
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modelName">Model Name *</Label>
                  <Input
                    id="modelName"
                    value={trainingConfig.modelName}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, modelName: e.target.value }))}
                    placeholder="Enter model name"
                  />
                </div>
                <div>
                  <Label htmlFor="modelType">Model Type *</Label>
                  <Select
                    value={trainingConfig.modelType}
                    onValueChange={(value) => setTrainingConfig(prev => ({ 
                      ...prev, 
                      modelType: value as MLModelType,
                      algorithm: availableAlgorithms[0] || ''
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MLModelType).map(type => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center space-x-2">
                            {getModelTypeIcon(type)}
                            <span>{type.replace('_', ' ')}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={trainingConfig.description}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the model purpose and use case"
                />
              </div>

              {/* Algorithm Selection */}
              <div>
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select
                  value={trainingConfig.algorithm}
                  onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, algorithm: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAlgorithms.map(algorithm => (
                      <SelectItem key={algorithm} value={algorithm}>
                        {algorithm.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Training Parameters */}
              <div className="space-y-4">
                <h4 className="font-medium">Training Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="epochs">Epochs</Label>
                    <Input
                      id="epochs"
                      type="number"
                      value={trainingConfig.trainingParams.epochs}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        trainingParams: { ...prev.trainingParams, epochs: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={trainingConfig.trainingParams.batchSize}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        trainingParams: { ...prev.trainingParams, batchSize: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="learningRate">Learning Rate</Label>
                    <Input
                      id="learningRate"
                      type="number"
                      step="0.001"
                      value={trainingConfig.trainingParams.learningRate}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        trainingParams: { ...prev.trainingParams, learningRate: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validationSplit">Validation Split</Label>
                    <Input
                      id="validationSplit"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={trainingConfig.trainingParams.validationSplit}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        trainingParams: { ...prev.trainingParams, validationSplit: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Deployment Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Deployment Configuration</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={trainingConfig.deploymentConfig.autoDeployment}
                    onCheckedChange={(checked) => setTrainingConfig(prev => ({
                      ...prev,
                      deploymentConfig: { ...prev.deploymentConfig, autoDeployment: checked }
                    }))}
                  />
                  <Label>Auto-deploy after successful training</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select
                      value={trainingConfig.deploymentConfig.environment}
                      onValueChange={(value) => setTrainingConfig(prev => ({
                        ...prev,
                        deploymentConfig: { ...prev.deploymentConfig, environment: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cpu">CPU</Label>
                    <Input
                      id="cpu"
                      value={trainingConfig.deploymentConfig.resources.cpu}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        deploymentConfig: {
                          ...prev.deploymentConfig,
                          resources: { ...prev.deploymentConfig.resources, cpu: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory">Memory</Label>
                    <Input
                      id="memory"
                      value={trainingConfig.deploymentConfig.resources.memory}
                      onChange={(e) => setTrainingConfig(prev => ({
                        ...prev,
                        deploymentConfig: {
                          ...prev.deploymentConfig,
                          resources: { ...prev.deploymentConfig.resources, memory: e.target.value }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateModel} disabled={isLoading || !trainingConfig.modelName}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create & Train Model'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Model Comparison Dialog */}
        {modelComparison && (
          <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
            <DialogContent className="max-w-6xl">
              <DialogHeader>
                <DialogTitle>Model Comparison</DialogTitle>
                <DialogDescription>
                  Compare performance metrics across selected models
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modelComparison.models.map((model, index) => (
                    <Card key={model.id} className={index === modelComparison.winner.overall ? 'ring-2 ring-green-500' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{model.name}</span>
                          {index === modelComparison.winner.overall && <Star className="w-4 h-4 text-yellow-500" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Accuracy:</span>
                            <span className="font-medium">{Math.round(modelComparison.metrics.accuracy[index] * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Precision:</span>
                            <span className="font-medium">{Math.round(modelComparison.metrics.precision[index] * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recall:</span>
                            <span className="font-medium">{Math.round(modelComparison.metrics.recall[index] * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>F1 Score:</span>
                            <span className="font-medium">{Math.round(modelComparison.metrics.f1Score[index] * 100)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {modelComparison.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  )
}

export default MLModelOrchestrator