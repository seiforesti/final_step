import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Slider,
  Progress,
  ScrollArea,
  Separator,
  Toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertCircle, BarChart3, Bot, Brain, CheckCircle, ChevronDown, ChevronRight, CircuitBoard, Clock, Cpu, Database, Download, Eye, Filter, GitBranch, LineChart as LucideLineChart, Loader2, MoreHorizontal, Pause, Play, Plus, RefreshCw, Settings, Sliders, Target, TrendingUp, X, Zap, Activity, Maximize2, Minimize2, Search, Info, Flame, Award, Timer, BarChart4, Sparkles, Layers, MapPin, Star, Users, Calendar, FileText, Save, Share2, Copy, ExternalLink, Archive, Trash2, Edit3, History, TrendingDown, AlertTriangle, CheckSquare, RotateCcw, FastForward, StopCircle, Monitor, HelpCircle, Workflow, Binary, Gauge, Rocket, Lightbulb, Lock, Unlock, Code2, BarChart2,  } from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { useClassificationState } from '../core/hooks/useClassificationState';

// Enhanced interfaces for hyperparameter optimization
interface HyperparameterConfig {
  id: string;
  name: string;
  type: 'int' | 'float' | 'categorical' | 'boolean' | 'log_uniform' | 'uniform';
  range?: [number, number];
  choices?: string[] | number[];
  default?: any;
  description: string;
  category: 'model' | 'training' | 'preprocessing' | 'regularization' | 'optimization';
  importance: 'critical' | 'high' | 'medium' | 'low';
  dependencies?: string[];
  conditional?: {
    parameter: string;
    condition: any;
  };
}

interface OptimizationExperiment {
  id: string;
  name: string;
  modelId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  algorithm: 'random_search' | 'grid_search' | 'bayesian' | 'genetic' | 'pso' | 'tpe' | 'hyperband';
  hyperparameters: HyperparameterConfig[];
  trials: OptimizationTrial[];
  bestTrial?: OptimizationTrial;
  metrics: {
    primaryMetric: string;
    direction: 'maximize' | 'minimize';
    targetValue?: number;
    currentBest: number;
    convergenceHistory: Array<{ iteration: number; value: number; timestamp: string }>;
  };
  budget: {
    maxTrials: number;
    maxTime: number;
    maxCost: number;
    currentTrials: number;
    currentTime: number;
    currentCost: number;
  };
  configuration: {
    parallelization: number;
    earlyStoppingRounds: number;
    pruningStrategy: 'none' | 'median' | 'percentile' | 'successive_halving';
    crossValidationFolds: number;
    validationSplit: number;
    randomSeed: number;
  };
  insights: {
    parameterImportance: Record<string, number>;
    correlations: Array<{ param1: string; param2: string; correlation: number }>;
    suggestions: string[];
    nextRecommendations: Array<{ parameter: string; suggestedValue: any; confidence: number }>;
  };
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu?: number;
    storage: number;
  };
}

interface OptimizationTrial {
  id: string;
  experimentId: string;
  trialNumber: number;
  parameters: Record<string, any>;
  metrics: Record<string, number>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'pruned';
  startTime: string;
  endTime?: string;
  duration?: number;
  logs: string[];
  artifacts: string[];
  cost: number;
  notes?: string;
  intermediateResults?: Array<{ epoch: number; metrics: Record<string, number> }>;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  algorithm: OptimizationExperiment['algorithm'];
  configuration: any;
  suitableFor: string[];
  pros: string[];
  cons: string[];
  recommendedBudget: {
    minTrials: number;
    maxTrials: number;
    estimatedTime: number;
  };
}

const HyperparameterOptimizer: React.FC = () => {
  // State management
  const {
    mlModels,
    trainingJobs,
    hyperparameterExperiments,
    selectedModelId,
    loading,
    addNotification,
    fetchMLModels,
    createHyperparameterExperiment,
    updateHyperparameterExperiment,
    deleteHyperparameterExperiment,
    startHyperparameterOptimization,
    pauseHyperparameterOptimization,
    resumeHyperparameterOptimization,
    stopHyperparameterOptimization,
    fetchOptimizationResults,
    setSelectedModel,
  } = useMLIntelligence();

  const { realtimeData } = useClassificationState();

  // Local state
  const [activeTab, setActiveTab] = useState('experiments');
  const [selectedExperiment, setSelectedExperiment] = useState<OptimizationExperiment | null>(null);
  const [selectedTrial, setSelectedTrial] = useState<OptimizationTrial | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTrialDetails, setShowTrialDetails] = useState(false);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const [showParameterConfig, setShowParameterConfig] = useState(false);
  const [experimentFilters, setExperimentFilters] = useState({
    status: 'all',
    algorithm: 'all',
    model: 'all',
    dateRange: '7d'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'performance' | 'progress'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('table');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [optimizationBudget, setOptimizationBudget] = useState({
    maxTrials: 100,
    maxTime: 3600,
    maxCost: 1000
  });

  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Optimization strategies
  const optimizationStrategies: OptimizationStrategy[] = useMemo(() => [
    {
      id: 'bayesian',
      name: 'Bayesian Optimization',
      description: 'Uses Gaussian Process to model the objective function and select promising hyperparameters',
      algorithm: 'bayesian',
      configuration: {
        acquisitionFunction: 'expected_improvement',
        kernel: 'matern52',
        nInitialPoints: 10,
        nCandidates: 1000
      },
      suitableFor: ['Small to medium search spaces', 'Expensive evaluations', 'Continuous parameters'],
      pros: ['Sample efficient', 'Good for expensive functions', 'Principled uncertainty quantification'],
      cons: ['Slower for large dimensions', 'Requires more setup', 'May get stuck in local optima'],
      recommendedBudget: { minTrials: 20, maxTrials: 200, estimatedTime: 2 }
    },
    {
      id: 'random_search',
      name: 'Random Search',
      description: 'Randomly samples hyperparameter combinations from the search space',
      algorithm: 'random_search',
      configuration: {
        randomSeed: 42,
        samplingStrategy: 'uniform'
      },
      suitableFor: ['Large search spaces', 'Quick baseline', 'Unknown parameter importance'],
      pros: ['Simple and robust', 'Parallelizable', 'Good baseline'],
      cons: ['May miss good regions', 'No learning from previous trials', 'Inefficient for small spaces'],
      recommendedBudget: { minTrials: 50, maxTrials: 500, estimatedTime: 1 }
    },
    {
      id: 'tpe',
      name: 'Tree-structured Parzen Estimator',
      description: 'Models good and bad parameter configurations separately using kernel density estimation',
      algorithm: 'tpe',
      configuration: {
        nStartupTrials: 10,
        nEiCandidates: 24,
        gamma: 0.25
      },
      suitableFor: ['Mixed parameter types', 'Medium search spaces', 'Conditional parameters'],
      pros: ['Handles mixed types well', 'Good for conditional spaces', 'Relatively fast'],
      cons: ['Less principled than Bayesian', 'May struggle with high dimensions', 'Sensitive to hyperparameters'],
      recommendedBudget: { minTrials: 30, maxTrials: 300, estimatedTime: 1.5 }
    },
    {
      id: 'hyperband',
      name: 'Hyperband',
      description: 'Uses successive halving to allocate resources efficiently across configurations',
      algorithm: 'hyperband',
      configuration: {
        maxBudget: 100,
        eta: 3,
        minBudget: 1
      },
      suitableFor: ['Resource-aware optimization', 'Large search spaces', 'Iterative algorithms'],
      pros: ['Resource efficient', 'Good for large spaces', 'Principled resource allocation'],
      cons: ['Requires compatible algorithms', 'May discard good slow starters', 'Complex setup'],
      recommendedBudget: { minTrials: 100, maxTrials: 1000, estimatedTime: 0.8 }
    },
    {
      id: 'genetic',
      name: 'Genetic Algorithm',
      description: 'Evolves populations of hyperparameter configurations using genetic operators',
      algorithm: 'genetic',
      configuration: {
        populationSize: 50,
        generations: 20,
        mutationRate: 0.1,
        crossoverRate: 0.8
      },
      suitableFor: ['Discrete parameters', 'Non-smooth objectives', 'Multi-objective optimization'],
      pros: ['Handles discrete well', 'Global search capability', 'Multi-objective support'],
      cons: ['Slower convergence', 'Many hyperparameters', 'Not sample efficient'],
      recommendedBudget: { minTrials: 200, maxTrials: 1000, estimatedTime: 3 }
    }
  ], []);

  // Common hyperparameter configurations
  const commonHyperparameters: Record<string, HyperparameterConfig[]> = useMemo(() => ({
    'neural_network': [
      {
        id: 'learning_rate',
        name: 'Learning Rate',
        type: 'log_uniform',
        range: [1e-5, 1e-1],
        default: 0.001,
        description: 'Step size for gradient descent optimization',
        category: 'optimization',
        importance: 'critical'
      },
      {
        id: 'batch_size',
        name: 'Batch Size',
        type: 'categorical',
        choices: [16, 32, 64, 128, 256, 512],
        default: 32,
        description: 'Number of samples per gradient update',
        category: 'training',
        importance: 'high'
      },
      {
        id: 'hidden_layers',
        name: 'Hidden Layers',
        type: 'int',
        range: [1, 10],
        default: 3,
        description: 'Number of hidden layers in the network',
        category: 'model',
        importance: 'high'
      },
      {
        id: 'hidden_units',
        name: 'Hidden Units',
        type: 'categorical',
        choices: [64, 128, 256, 512, 1024],
        default: 256,
        description: 'Number of units in each hidden layer',
        category: 'model',
        importance: 'high'
      },
      {
        id: 'dropout_rate',
        name: 'Dropout Rate',
        type: 'uniform',
        range: [0.0, 0.8],
        default: 0.2,
        description: 'Fraction of units to drop for regularization',
        category: 'regularization',
        importance: 'medium'
      },
      {
        id: 'optimizer',
        name: 'Optimizer',
        type: 'categorical',
        choices: ['adam', 'sgd', 'rmsprop', 'adamw'],
        default: 'adam',
        description: 'Optimization algorithm to use',
        category: 'optimization',
        importance: 'high'
      }
    ],
    'random_forest': [
      {
        id: 'n_estimators',
        name: 'Number of Trees',
        type: 'int',
        range: [10, 1000],
        default: 100,
        description: 'Number of trees in the forest',
        category: 'model',
        importance: 'critical'
      },
      {
        id: 'max_depth',
        name: 'Max Depth',
        type: 'int',
        range: [3, 20],
        default: 10,
        description: 'Maximum depth of the trees',
        category: 'model',
        importance: 'high'
      },
      {
        id: 'min_samples_split',
        name: 'Min Samples Split',
        type: 'int',
        range: [2, 20],
        default: 2,
        description: 'Minimum samples required to split an internal node',
        category: 'regularization',
        importance: 'medium'
      },
      {
        id: 'min_samples_leaf',
        name: 'Min Samples Leaf',
        type: 'int',
        range: [1, 10],
        default: 1,
        description: 'Minimum samples required to be at a leaf node',
        category: 'regularization',
        importance: 'medium'
      },
      {
        id: 'max_features',
        name: 'Max Features',
        type: 'categorical',
        choices: ['sqrt', 'log2', 'auto', 0.3, 0.5, 0.7, 1.0],
        default: 'sqrt',
        description: 'Number of features to consider when looking for the best split',
        category: 'model',
        importance: 'medium'
      }
    ],
    'gradient_boosting': [
      {
        id: 'n_estimators',
        name: 'Number of Estimators',
        type: 'int',
        range: [50, 500],
        default: 100,
        description: 'Number of boosting stages',
        category: 'model',
        importance: 'critical'
      },
      {
        id: 'learning_rate',
        name: 'Learning Rate',
        type: 'log_uniform',
        range: [0.01, 0.3],
        default: 0.1,
        description: 'Step size shrinkage to prevent overfitting',
        category: 'optimization',
        importance: 'critical'
      },
      {
        id: 'max_depth',
        name: 'Max Depth',
        type: 'int',
        range: [3, 10],
        default: 6,
        description: 'Maximum depth of individual trees',
        category: 'model',
        importance: 'high'
      },
      {
        id: 'subsample',
        name: 'Subsample',
        type: 'uniform',
        range: [0.5, 1.0],
        default: 1.0,
        description: 'Fraction of samples used for fitting individual trees',
        category: 'regularization',
        importance: 'medium'
      }
    ]
  }), []);

  // Effects
  useEffect(() => {
    fetchMLModels();
  }, [fetchMLModels]);

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        if (selectedExperiment) {
          fetchOptimizationResults(selectedExperiment.id);
        }
      }, 10000); // Refresh every 10 seconds

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [autoRefresh, selectedExperiment, fetchOptimizationResults]);

  // Computed values
  const filteredExperiments = useMemo(() => {
    let filtered = hyperparameterExperiments || [];

    if (experimentFilters.status !== 'all') {
      filtered = filtered.filter(exp => exp.status === experimentFilters.status);
    }
    if (experimentFilters.algorithm !== 'all') {
      filtered = filtered.filter(exp => exp.algorithm === experimentFilters.algorithm);
    }
    if (experimentFilters.model !== 'all') {
      filtered = filtered.filter(exp => exp.modelId === experimentFilters.model);
    }
    if (searchQuery) {
      filtered = filtered.filter(exp =>
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.algorithm.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort experiments
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'performance':
          const aPerf = a.bestTrial?.metrics[a.metrics.primaryMetric] || 0;
          const bPerf = b.bestTrial?.metrics[b.metrics.primaryMetric] || 0;
          comparison = aPerf - bPerf;
          break;
        case 'progress':
          const aProgress = (a.budget.currentTrials / a.budget.maxTrials) * 100;
          const bProgress = (b.budget.currentTrials / b.budget.maxTrials) * 100;
          comparison = aProgress - bProgress;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [hyperparameterExperiments, experimentFilters, searchQuery, sortBy, sortOrder]);

  const experimentStats = useMemo(() => {
    const total = hyperparameterExperiments?.length || 0;
    const running = hyperparameterExperiments?.filter(exp => exp.status === 'running').length || 0;
    const completed = hyperparameterExperiments?.filter(exp => exp.status === 'completed').length || 0;
    const failed = hyperparameterExperiments?.filter(exp => exp.status === 'failed').length || 0;

    return { total, running, completed, failed };
  }, [hyperparameterExperiments]);

  const convergenceData = useMemo(() => {
    if (!selectedExperiment?.metrics.convergenceHistory) return [];
    
    return selectedExperiment.metrics.convergenceHistory.map(point => ({
      iteration: point.iteration,
      value: point.value,
      time: new Date(point.timestamp).toLocaleTimeString()
    }));
  }, [selectedExperiment]);

  const parameterImportanceData = useMemo(() => {
    if (!selectedExperiment?.insights.parameterImportance) return [];
    
    return Object.entries(selectedExperiment.insights.parameterImportance)
      .map(([param, importance]) => ({
        parameter: param,
        importance: importance * 100,
        color: importance > 0.7 ? '#ef4444' : importance > 0.4 ? '#f59e0b' : '#10b981'
      }))
      .sort((a, b) => b.importance - a.importance);
  }, [selectedExperiment]);

  const trialDistributionData = useMemo(() => {
    if (!selectedExperiment?.trials) return [];
    
    const statusCounts = selectedExperiment.trials.reduce((acc, trial) => {
      acc[trial.status] = (acc[trial.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: {
        completed: '#10b981',
        running: '#3b82f6',
        failed: '#ef4444',
        pruned: '#f59e0b',
        pending: '#6b7280'
      }[status] || '#6b7280'
    }));
  }, [selectedExperiment]);

  // Event handlers
  const handleCreateExperiment = useCallback(async (experimentData: any) => {
    try {
      await createHyperparameterExperiment(experimentData);
      setShowCreateDialog(false);
      addNotification({
        type: 'success',
        title: 'Experiment Created',
        message: `Hyperparameter optimization experiment "${experimentData.name}" has been created successfully.`,
        category: 'optimization'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create hyperparameter optimization experiment.',
        category: 'optimization'
      });
    }
  }, [createHyperparameterExperiment, addNotification]);

  const handleStartExperiment = useCallback(async (experimentId: string) => {
    try {
      await startHyperparameterOptimization(experimentId);
      addNotification({
        type: 'success',
        title: 'Optimization Started',
        message: 'Hyperparameter optimization has been started.',
        category: 'optimization'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Start Failed',
        message: 'Failed to start hyperparameter optimization.',
        category: 'optimization'
      });
    }
  }, [startHyperparameterOptimization, addNotification]);

  const handlePauseExperiment = useCallback(async (experimentId: string) => {
    try {
      await pauseHyperparameterOptimization(experimentId);
      addNotification({
        type: 'info',
        title: 'Optimization Paused',
        message: 'Hyperparameter optimization has been paused.',
        category: 'optimization'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Pause Failed',
        message: 'Failed to pause hyperparameter optimization.',
        category: 'optimization'
      });
    }
  }, [pauseHyperparameterOptimization, addNotification]);

  const handleStopExperiment = useCallback(async (experimentId: string) => {
    try {
      await stopHyperparameterOptimization(experimentId);
      addNotification({
        type: 'info',
        title: 'Optimization Stopped',
        message: 'Hyperparameter optimization has been stopped.',
        category: 'optimization'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Stop Failed',
        message: 'Failed to stop hyperparameter optimization.',
        category: 'optimization'
      });
    }
  }, [stopHyperparameterOptimization, addNotification]);

  const handleParameterChange = useCallback((parameterId: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [parameterId]: value
    }));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Render experiment creation dialog
  const renderCreateExperimentDialog = () => (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Create Hyperparameter Optimization Experiment
          </DialogTitle>
          <DialogDescription>
            Configure a new hyperparameter optimization experiment for your ML model.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exp-name">Experiment Name</Label>
                  <Input
                    id="exp-name"
                    placeholder="Enter experiment name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="exp-model">Target Model</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {mlModels?.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="exp-description">Description</Label>
                <Textarea
                  id="exp-description"
                  placeholder="Describe the optimization objective and strategy"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Optimization Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Optimization Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optimizationStrategies.map(strategy => (
                  <motion.div
                    key={strategy.id}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{strategy.name}</h4>
                      <Badge variant="outline">{strategy.algorithm}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-green-600">Pros:</span>
                        <ul className="text-xs text-gray-600 ml-2">
                          {strategy.pros.slice(0, 2).map((pro, idx) => (
                            <li key={idx}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Est. Time: {strategy.recommendedBudget.estimatedTime}h</span>
                        <span>Trials: {strategy.recommendedBudget.minTrials}-{strategy.recommendedBudget.maxTrials}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget & Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max-trials">Max Trials</Label>
                  <div className="mt-1">
                    <Input
                      id="max-trials"
                      type="number"
                      value={optimizationBudget.maxTrials}
                      onChange={(e) => setOptimizationBudget(prev => ({
                        ...prev,
                        maxTrials: parseInt(e.target.value)
                      }))}
                    />
                    <Slider
                      value={[optimizationBudget.maxTrials]}
                      onValueChange={([value]) => setOptimizationBudget(prev => ({
                        ...prev,
                        maxTrials: value
                      }))}
                      max={1000}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="max-time">Max Time (hours)</Label>
                  <div className="mt-1">
                    <Input
                      id="max-time"
                      type="number"
                      value={optimizationBudget.maxTime / 3600}
                      onChange={(e) => setOptimizationBudget(prev => ({
                        ...prev,
                        maxTime: parseInt(e.target.value) * 3600
                      }))}
                    />
                    <Slider
                      value={[optimizationBudget.maxTime / 3600]}
                      onValueChange={([value]) => setOptimizationBudget(prev => ({
                        ...prev,
                        maxTime: value * 3600
                      }))}
                      max={72}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="max-cost">Max Cost ($)</Label>
                  <div className="mt-1">
                    <Input
                      id="max-cost"
                      type="number"
                      value={optimizationBudget.maxCost}
                      onChange={(e) => setOptimizationBudget(prev => ({
                        ...prev,
                        maxCost: parseFloat(e.target.value)
                      }))}
                    />
                    <Slider
                      value={[optimizationBudget.maxCost]}
                      onValueChange={([value]) => setOptimizationBudget(prev => ({
                        ...prev,
                        maxCost: value
                      }))}
                      max={10000}
                      min={100}
                      step={100}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleCreateExperiment({})}>
            Create Experiment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render trial details dialog
  const renderTrialDetailsDialog = () => (
    <Dialog open={showTrialDetails} onOpenChange={setShowTrialDetails}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Trial Details - Trial #{selectedTrial?.trialNumber}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the optimization trial.
          </DialogDescription>
        </DialogHeader>

        {selectedTrial && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedTrial.status)}
                      <span className="font-medium">Status</span>
                    </div>
                    <Badge className={`mt-2 ${getStatusColor(selectedTrial.status)}`}>
                      {selectedTrial.status}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Duration</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedTrial.duration ? formatDuration(selectedTrial.duration) : 'N/A'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Cost</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      ${selectedTrial.cost.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Primary Metric</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedExperiment?.metrics.primaryMetric && selectedTrial.metrics[selectedExperiment.metrics.primaryMetric]?.toFixed(4) || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {selectedTrial.intermediateResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Training Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedTrial.intermediateResults}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          {Object.keys(selectedTrial.intermediateResults[0]?.metrics || {}).map((metric, idx) => (
                            <Line
                              key={metric}
                              type="monotone"
                              dataKey={`metrics.${metric}`}
                              stroke={`hsl(${idx * 137.5}, 70%, 50%)`}
                              strokeWidth={2}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hyperparameter Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedTrial.parameters).map(([param, value]) => (
                      <div key={param} className="border rounded-lg p-3">
                        <Label className="font-medium text-sm">{param}</Label>
                        <p className="text-lg font-semibold mt-1">
                          {typeof value === 'number' ? value.toFixed(6) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedTrial.metrics).map(([metric, value]) => (
                      <div key={metric} className="border rounded-lg p-3">
                        <Label className="font-medium text-sm">{metric}</Label>
                        <p className="text-lg font-semibold mt-1">
                          {value.toFixed(6)}
                        </p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${Math.min(100, (value / 1) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Execution Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full rounded border p-4">
                    <div className="space-y-2">
                      {selectedTrial.logs.map((log, idx) => (
                        <div key={idx} className="text-sm font-mono bg-gray-50 p-2 rounded">
                          {log}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTrialDetails(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Sliders className="h-8 w-8 text-white" />
              </div>
              Hyperparameter Optimizer
            </h1>
            <p className="text-muted-foreground mt-2">
              Intelligent hyperparameter optimization with advanced algorithms and real-time monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Experiment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Experiments</p>
                  <p className="text-2xl font-bold">{experimentStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Running</p>
                  <p className="text-2xl font-bold">{experimentStats.running}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{experimentStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{experimentStats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="experiments">Experiments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <BarChart4 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="experiments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search experiments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={experimentFilters.status} onValueChange={(value) => 
                    setExperimentFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={experimentFilters.algorithm} onValueChange={(value) => 
                    setExperimentFilters(prev => ({ ...prev, algorithm: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Algorithms</SelectItem>
                      <SelectItem value="bayesian">Bayesian</SelectItem>
                      <SelectItem value="random_search">Random Search</SelectItem>
                      <SelectItem value="tpe">TPE</SelectItem>
                      <SelectItem value="hyperband">Hyperband</SelectItem>
                      <SelectItem value="genetic">Genetic</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSortBy('name')}>
                        Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('created')}>
                        Created Date
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('performance')}>
                        Performance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('progress')}>
                        Progress
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Experiments List */}
            {viewMode === 'table' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Experiments</CardTitle>
                  <CardDescription>
                    Monitor and manage your hyperparameter optimization experiments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Algorithm</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Best Score</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExperiments.map((experiment) => {
                        const progress = (experiment.budget.currentTrials / experiment.budget.maxTrials) * 100;
                        const model = mlModels?.find(m => m.id === experiment.modelId);
                        
                        return (
                          <TableRow 
                            key={experiment.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => setSelectedExperiment(experiment)}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">{experiment.name}</p>
                                <p className="text-sm text-gray-500">
                                  Created {new Date(experiment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-500" />
                                {model?.name || 'Unknown'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {experiment.algorithm}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(experiment.status)}
                                <Badge className={getStatusColor(experiment.status)}>
                                  {experiment.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{experiment.budget.currentTrials}</span>
                                  <span>{experiment.budget.maxTrials}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-gray-500">
                                  {progress.toFixed(1)}% complete
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <p className="font-semibold">
                                  {experiment.bestTrial?.metrics[experiment.metrics.primaryMetric]?.toFixed(4) || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {experiment.metrics.primaryMetric}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <p className="font-medium">
                                  {formatDuration(experiment.budget.currentTime)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  / {formatDuration(experiment.budget.maxTime)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  {experiment.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => handleStartExperiment(experiment.id)}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Start
                                    </DropdownMenuItem>
                                  )}
                                  {experiment.status === 'running' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handlePauseExperiment(experiment.id)}>
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStopExperiment(experiment.id)}>
                                        <StopCircle className="h-4 w-4 mr-2" />
                                        Stop
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {experiment.status === 'paused' && (
                                    <DropdownMenuItem onClick={() => handleStartExperiment(experiment.id)}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Resume
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Results
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Clone Experiment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiments.map((experiment) => {
                  const progress = (experiment.budget.currentTrials / experiment.budget.maxTrials) * 100;
                  const model = mlModels?.find(m => m.id === experiment.modelId);
                  
                  return (
                    <motion.div
                      key={experiment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedExperiment(experiment)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{experiment.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(experiment.status)}
                              <Badge className={getStatusColor(experiment.status)}>
                                {experiment.status}
                              </Badge>
                            </div>
                          </div>
                          <CardDescription>
                            {model?.name} • {experiment.algorithm}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              {experiment.budget.currentTrials} / {experiment.budget.maxTrials} trials
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium">Best Score</p>
                              <p className="text-lg font-bold">
                                {experiment.bestTrial?.metrics[experiment.metrics.primaryMetric]?.toFixed(4) || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Duration</p>
                              <p className="text-lg font-bold">
                                {formatDuration(experiment.budget.currentTime)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              Created {new Date(experiment.createdAt).toLocaleDateString()}
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
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
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Clone
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Selected Experiment Details */}
            {selectedExperiment && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {selectedExperiment.name} - Detailed View
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedExperiment(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="trials">Trials</TabsTrigger>
                      <TabsTrigger value="convergence">Convergence</TabsTrigger>
                      <TabsTrigger value="importance">Importance</TabsTrigger>
                      <TabsTrigger value="insights">Insights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">Current Progress</span>
                            </div>
                            <div className="space-y-2">
                              <Progress 
                                value={(selectedExperiment.budget.currentTrials / selectedExperiment.budget.maxTrials) * 100} 
                                className="h-3" 
                              />
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>{selectedExperiment.budget.currentTrials} trials</span>
                                <span>{selectedExperiment.budget.maxTrials} max</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="h-4 w-4 text-green-500" />
                              <span className="font-medium">Best Performance</span>
                            </div>
                            <p className="text-2xl font-bold">
                              {selectedExperiment.bestTrial?.metrics[selectedExperiment.metrics.primaryMetric]?.toFixed(4) || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">{selectedExperiment.metrics.primaryMetric}</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">Total Cost</span>
                            </div>
                            <p className="text-2xl font-bold">
                              ${selectedExperiment.budget.currentCost.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              / ${selectedExperiment.budget.maxCost.toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Resource Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">CPU</span>
                              </div>
                              <Progress value={selectedExperiment.resourceUsage.cpu} className="h-2" />
                              <p className="text-xs text-gray-600">{selectedExperiment.resourceUsage.cpu}%</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Memory</span>
                              </div>
                              <Progress value={selectedExperiment.resourceUsage.memory} className="h-2" />
                              <p className="text-xs text-gray-600">{selectedExperiment.resourceUsage.memory}%</p>
                            </div>
                            
                            {selectedExperiment.resourceUsage.gpu && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CircuitBoard className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm font-medium">GPU</span>
                                </div>
                                <Progress value={selectedExperiment.resourceUsage.gpu} className="h-2" />
                                <p className="text-xs text-gray-600">{selectedExperiment.resourceUsage.gpu}%</p>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Archive className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">Storage</span>
                              </div>
                              <Progress value={selectedExperiment.resourceUsage.storage} className="h-2" />
                              <p className="text-xs text-gray-600">{selectedExperiment.resourceUsage.storage}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="trials" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Optimization Trials</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{selectedExperiment.trials.length} trials</Badge>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Trial #</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Primary Metric</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedExperiment.trials.slice(0, 20).map((trial) => (
                            <TableRow 
                              key={trial.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => {
                                setSelectedTrial(trial);
                                setShowTrialDetails(true);
                              }}
                            >
                              <TableCell className="font-medium">#{trial.trialNumber}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(trial.status)}
                                  <Badge className={getStatusColor(trial.status)}>
                                    {trial.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold">
                                {trial.metrics[selectedExperiment.metrics.primaryMetric]?.toFixed(4) || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {trial.duration ? formatDuration(trial.duration) : 'N/A'}
                              </TableCell>
                              <TableCell>${trial.cost.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTrial(trial);
                                    setShowTrialDetails(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="convergence" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Convergence History</CardTitle>
                          <CardDescription>
                            Track how the optimization converges over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={convergenceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="iteration" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#8884d8"
                                  strokeWidth={2}
                                  dot={{ fill: '#8884d8' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="importance" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Parameter Importance</CardTitle>
                          <CardDescription>
                            Understand which hyperparameters have the most impact on performance
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {parameterImportanceData.map((param) => (
                              <div key={param.parameter} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{param.parameter}</span>
                                  <span className="text-sm text-gray-600">
                                    {param.importance.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="h-3 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${param.importance}%`,
                                      backgroundColor: param.color
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">AI Insights</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedExperiment.insights.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm">{suggestion}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Next Recommendations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedExperiment.insights.nextRecommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <p className="font-medium text-sm">{rec.parameter}</p>
                                    <p className="text-xs text-gray-600">
                                      Suggested: {String(rec.suggestedValue)}
                                    </p>
                                  </div>
                                  <Badge variant="outline">
                                    {(rec.confidence * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trial Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trialDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {trialDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Algorithm Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { algorithm: 'Bayesian', avgScore: 0.85, experiments: 12 },
                        { algorithm: 'Random', avgScore: 0.76, experiments: 8 },
                        { algorithm: 'TPE', avgScore: 0.82, experiments: 15 },
                        { algorithm: 'Hyperband', avgScore: 0.79, experiments: 6 },
                        { algorithm: 'Genetic', avgScore: 0.77, experiments: 4 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="algorithm" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="avgScore" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {optimizationStrategies.map((strategy) => (
                <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      {strategy.name}
                    </CardTitle>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-green-600">Advantages:</h4>
                      <ul className="text-sm space-y-1">
                        {strategy.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-orange-600">Limitations:</h4>
                      <ul className="text-sm space-y-1">
                        {strategy.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Recommended Budget</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-medium">Trials</p>
                          <p>{strategy.recommendedBudget.minTrials}-{strategy.recommendedBudget.maxTrials}</p>
                        </div>
                        <div>
                          <p className="font-medium">Time</p>
                          <p>{strategy.recommendedBudget.estimatedTime}h</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => {
                        // Set selected strategy and open create dialog
                        setShowCreateDialog(true);
                      }}
                    >
                      Use This Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {renderCreateExperimentDialog()}
        {renderTrialDetailsDialog()}
      </div>
    </TooltipProvider>
  );
};

export default HyperparameterOptimizer;