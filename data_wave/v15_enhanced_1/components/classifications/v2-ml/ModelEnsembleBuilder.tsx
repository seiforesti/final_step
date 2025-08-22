import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  GitBranch,
  Layers,
  Shuffle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Settings,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Eye,
  EyeOff,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Plus,
  Minus,
  X,
  Edit,
  Trash2,
  Copy,
  Save,
  FileText,
  Code,
  Sparkles,
  Lightbulb,
  Gauge,
  Crosshair,
} from 'lucide-react';
import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { mlApi } from '../core/api/mlApi';
import type {
  MLModel,
  EnsembleStrategy,
  EnsembleConfiguration,
  ModelPerformance,
  EnsembleMetrics,
  ModelComparison,
  OptimizationResult,
  EnsembleValidation,
  CrossValidationResult,
  FeatureImportance,
  ModelExplanation,
  EnsembleExperiment,
  HyperparameterSpace,
  AutoMLConfiguration,
  ModelInterpretation,
  EnsembleVisualization,
} from '../core/types';

// Enhanced ensemble strategy types
interface EnsembleStrategyConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  parameters: EnsembleParameter[];
  complexity: 'Low' | 'Medium' | 'High';
  computationalCost: number;
  interpretability: number;
  performance: number;
  robustness: number;
}

interface EnsembleParameter {
  name: string;
  type: 'number' | 'boolean' | 'select' | 'range';
  defaultValue: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  description: string;
}

interface ModelCandidate {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  trainingTime: number;
  predictionLatency: number;
  memoryUsage: number;
  complexity: number;
  interpretability: number;
  selected: boolean;
  weight?: number;
  hyperparameters: Record<string, any>;
  crossValidationScores: number[];
  featureImportances: FeatureImportance[];
  validationMetrics: Record<string, number>;
}

interface EnsembleExperimentResult {
  id: string;
  strategy: string;
  models: string[];
  performance: ModelPerformance;
  configuration: EnsembleConfiguration;
  validationResults: CrossValidationResult[];
  computationTime: number;
  memoryUsage: number;
  timestamp: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
}

const ENSEMBLE_STRATEGIES: EnsembleStrategyConfig[] = [
  {
    id: 'voting',
    name: 'Voting Classifier',
    description: 'Combines predictions through majority voting or probability averaging',
    icon: <Users className="h-4 w-4" />,
    complexity: 'Low',
    computationalCost: 1,
    interpretability: 8,
    performance: 7,
    robustness: 8,
    parameters: [
      {
        name: 'voting',
        type: 'select',
        defaultValue: 'hard',
        options: ['hard', 'soft'],
        description: 'Voting method: hard (majority) or soft (probability averaging)'
      },
      {
        name: 'weights',
        type: 'boolean',
        defaultValue: false,
        description: 'Use weighted voting based on model performance'
      }
    ]
  },
  {
    id: 'bagging',
    name: 'Bootstrap Aggregating',
    description: 'Trains multiple models on bootstrap samples of the training data',
    icon: <Shuffle className="h-4 w-4" />,
    complexity: 'Medium',
    computationalCost: 6,
    interpretability: 6,
    performance: 8,
    robustness: 9,
    parameters: [
      {
        name: 'n_estimators',
        type: 'range',
        defaultValue: 100,
        min: 10,
        max: 1000,
        step: 10,
        description: 'Number of base estimators'
      },
      {
        name: 'max_samples',
        type: 'range',
        defaultValue: 1.0,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        description: 'Fraction of samples to draw for each base estimator'
      },
      {
        name: 'bootstrap',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to use bootstrap sampling'
      }
    ]
  },
  {
    id: 'boosting',
    name: 'Gradient Boosting',
    description: 'Sequentially builds models, each correcting errors of the previous',
    icon: <TrendingUp className="h-4 w-4" />,
    complexity: 'High',
    computationalCost: 8,
    interpretability: 4,
    performance: 9,
    robustness: 7,
    parameters: [
      {
        name: 'n_estimators',
        type: 'range',
        defaultValue: 100,
        min: 10,
        max: 1000,
        step: 10,
        description: 'Number of boosting stages'
      },
      {
        name: 'learning_rate',
        type: 'range',
        defaultValue: 0.1,
        min: 0.001,
        max: 1.0,
        step: 0.001,
        description: 'Learning rate shrinks contribution of each tree'
      },
      {
        name: 'max_depth',
        type: 'range',
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 1,
        description: 'Maximum depth of individual trees'
      }
    ]
  },
  {
    id: 'stacking',
    name: 'Stacked Generalization',
    description: 'Uses a meta-learner to combine predictions from multiple base models',
    icon: <Layers className="h-4 w-4" />,
    complexity: 'High',
    computationalCost: 9,
    interpretability: 3,
    performance: 9,
    robustness: 8,
    parameters: [
      {
        name: 'cv_folds',
        type: 'range',
        defaultValue: 5,
        min: 2,
        max: 10,
        step: 1,
        description: 'Number of cross-validation folds for meta-features'
      },
      {
        name: 'meta_learner',
        type: 'select',
        defaultValue: 'logistic_regression',
        options: ['logistic_regression', 'random_forest', 'gradient_boosting', 'neural_network'],
        description: 'Algorithm used for the meta-learner'
      },
      {
        name: 'use_probabilities',
        type: 'boolean',
        defaultValue: true,
        description: 'Use class probabilities as meta-features'
      }
    ]
  },
  {
    id: 'blending',
    name: 'Model Blending',
    description: 'Combines models using a holdout validation set for weight optimization',
    icon: <GitBranch className="h-4 w-4" />,
    complexity: 'Medium',
    computationalCost: 5,
    interpretability: 5,
    performance: 8,
    robustness: 7,
    parameters: [
      {
        name: 'holdout_size',
        type: 'range',
        defaultValue: 0.2,
        min: 0.1,
        max: 0.5,
        step: 0.05,
        description: 'Fraction of data used for blending weights optimization'
      },
      {
        name: 'optimization_method',
        type: 'select',
        defaultValue: 'minimize',
        options: ['minimize', 'genetic', 'bayesian'],
        description: 'Method for optimizing blending weights'
      }
    ]
  }
];

const ModelEnsembleBuilder: React.FC = () => {
  // State management
  const {
    models,
    ensembleConfigurations,
    experiments,
    isLoading,
    error,
    createEnsemble,
    trainEnsemble,
    evaluateEnsemble,
    optimizeEnsemble,
    getModelComparison,
    getFeatureImportances,
    explainEnsemble
  } = useMLIntelligence();

  const [selectedStrategy, setSelectedStrategy] = useState<string>('voting');
  const [modelCandidates, setModelCandidates] = useState<ModelCandidate[]>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [ensembleConfig, setEnsembleConfig] = useState<EnsembleConfiguration | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<EnsembleExperimentResult | null>(null);
  const [experiments_local, setExperiments] = useState<EnsembleExperimentResult[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [comparisonData, setComparisonData] = useState<ModelComparison | null>(null);
  const [selectedTab, setSelectedTab] = useState('builder');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    minAccuracy: 0,
    maxLatency: 1000,
    modelTypes: [] as string[],
  });

  // Load initial data
  useEffect(() => {
    loadModelCandidates();
    loadExperiments();
  }, []);

  const loadModelCandidates = useCallback(async () => {
    try {
      const response = await mlApi.getModels();
      const candidates: ModelCandidate[] = response.data.map((model: MLModel) => ({
        id: model.id,
        name: model.name,
        type: model.algorithm_type,
        accuracy: model.performance?.accuracy || 0,
        precision: model.performance?.precision || 0,
        recall: model.performance?.recall || 0,
        f1Score: model.performance?.f1_score || 0,
        auc: model.performance?.auc || 0,
        trainingTime: model.training_time || 0,
        predictionLatency: model.prediction_latency || 0,
        memoryUsage: model.memory_usage || 0,
        complexity: model.complexity_score || 0,
        interpretability: model.interpretability_score || 0,
        selected: false,
        hyperparameters: model.hyperparameters || {},
        crossValidationScores: model.cross_validation_scores || [],
        featureImportances: model.feature_importances || [],
        validationMetrics: model.validation_metrics || {},
      }));
      setModelCandidates(candidates);
    } catch (error) {
      console.error('Error loading model candidates:', error);
    }
  }, []);

  const loadExperiments = useCallback(async () => {
    try {
      const response = await mlApi.getEnsembleExperiments();
      setExperiments(response.data);
    } catch (error) {
      console.error('Error loading experiments:', error);
    }
  }, []);

  // Filter and search functionality
  const filteredCandidates = useMemo(() => {
    return modelCandidates.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAccuracy = model.accuracy >= filterCriteria.minAccuracy;
      const matchesLatency = model.predictionLatency <= filterCriteria.maxLatency;
      const matchesType = filterCriteria.modelTypes.length === 0 || 
                         filterCriteria.modelTypes.includes(model.type);
      
      return matchesSearch && matchesAccuracy && matchesLatency && matchesType;
    });
  }, [modelCandidates, searchQuery, filterCriteria]);

  // Model selection handlers
  const handleModelSelection = useCallback((modelId: string, selected: boolean) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(modelId);
      } else {
        newSet.delete(modelId);
      }
      return newSet;
    });

    setModelCandidates(prev => prev.map(model => 
      model.id === modelId ? { ...model, selected } : model
    ));
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    const visibleModelIds = filteredCandidates.map(model => model.id);
    
    if (selected) {
      setSelectedModels(prev => new Set([...prev, ...visibleModelIds]));
    } else {
      setSelectedModels(prev => {
        const newSet = new Set(prev);
        visibleModelIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }

    setModelCandidates(prev => prev.map(model => ({
      ...model,
      selected: visibleModelIds.includes(model.id) ? selected : model.selected
    })));
  }, [filteredCandidates]);

  // Strategy configuration
  const currentStrategy = useMemo(() => 
    ENSEMBLE_STRATEGIES.find(s => s.id === selectedStrategy),
    [selectedStrategy]
  );

  const [strategyParams, setStrategyParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (currentStrategy) {
      const defaultParams: Record<string, any> = {};
      currentStrategy.parameters.forEach(param => {
        defaultParams[param.name] = param.defaultValue;
      });
      setStrategyParams(defaultParams);
    }
  }, [currentStrategy]);

  // Ensemble building and training
  const handleBuildEnsemble = useCallback(async () => {
    if (selectedModels.size === 0) {
      alert('Please select at least 2 models for ensemble building');
      return;
    }

    const selectedModelData = modelCandidates.filter(model => selectedModels.has(model.id));
    
    const config: EnsembleConfiguration = {
      id: `ensemble_${Date.now()}`,
      name: `${currentStrategy?.name} Ensemble`,
      strategy: selectedStrategy,
      models: Array.from(selectedModels),
      parameters: strategyParams,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const result = await createEnsemble(config);
      setEnsembleConfig(result);
      
      // Start training experiment
      const experiment: EnsembleExperimentResult = {
        id: `exp_${Date.now()}`,
        strategy: selectedStrategy,
        models: Array.from(selectedModels),
        performance: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1_score: 0,
          auc: 0,
          training_time: 0,
          prediction_latency: 0,
          memory_usage: 0
        },
        configuration: config,
        validationResults: [],
        computationTime: 0,
        memoryUsage: 0,
        timestamp: new Date(),
        status: 'running',
        progress: 0
      };

      setActiveExperiment(experiment);
      setExperiments(prev => [experiment, ...prev]);
      
      // Simulate training progress
      simulateTraining(experiment.id);
      
    } catch (error) {
      console.error('Error building ensemble:', error);
    }
  }, [selectedModels, selectedStrategy, strategyParams, modelCandidates, currentStrategy, createEnsemble]);

  const simulateTraining = useCallback(async (experimentId: string) => {
    const updateProgress = (progress: number) => {
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId 
          ? { ...exp, progress, status: progress === 100 ? 'completed' : 'running' }
          : exp
      ));
      
      if (activeExperiment?.id === experimentId) {
        setActiveExperiment(prev => prev ? { ...prev, progress, status: progress === 100 ? 'completed' : 'running' } : null);
      }
    };

    // Simulate training progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(i);
    }

    // Update with final results
    const finalPerformance: ModelPerformance = {
      accuracy: 0.92 + Math.random() * 0.05,
      precision: 0.89 + Math.random() * 0.08,
      recall: 0.87 + Math.random() * 0.1,
      f1_score: 0.88 + Math.random() * 0.09,
      auc: 0.94 + Math.random() * 0.04,
      training_time: 120 + Math.random() * 60,
      prediction_latency: 15 + Math.random() * 10,
      memory_usage: 256 + Math.random() * 128
    };

    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId 
        ? { 
            ...exp, 
            progress: 100, 
            status: 'completed',
            performance: finalPerformance,
            computationTime: finalPerformance.training_time,
            memoryUsage: finalPerformance.memory_usage
          }
        : exp
    ));
  }, [activeExperiment]);

  // Performance comparison
  const handleCompareModels = useCallback(async () => {
    if (selectedModels.size < 2) {
      alert('Please select at least 2 models for comparison');
      return;
    }

    try {
      const comparison = await getModelComparison(Array.from(selectedModels));
      setComparisonData(comparison);
      setSelectedTab('comparison');
    } catch (error) {
      console.error('Error comparing models:', error);
    }
  }, [selectedModels, getModelComparison]);

  // Hyperparameter optimization
  const handleOptimizeEnsemble = useCallback(async () => {
    if (!ensembleConfig) {
      alert('Please build an ensemble first');
      return;
    }

    setOptimizationInProgress(true);
    
    try {
      const result = await optimizeEnsemble(ensembleConfig.id);
      
      // Update ensemble configuration with optimized parameters
      setEnsembleConfig(prev => prev ? {
        ...prev,
        parameters: result.optimal_parameters,
        updated_at: new Date().toISOString()
      } : null);
      
      setStrategyParams(result.optimal_parameters);
      
    } catch (error) {
      console.error('Error optimizing ensemble:', error);
    } finally {
      setOptimizationInProgress(false);
    }
  }, [ensembleConfig, optimizeEnsemble]);

  // Visualization data preparation
  const performanceComparisonData = useMemo(() => {
    const selectedModelData = modelCandidates.filter(model => selectedModels.has(model.id));
    return selectedModelData.map(model => ({
      name: model.name,
      accuracy: model.accuracy,
      precision: model.precision,
      recall: model.recall,
      f1Score: model.f1Score,
      auc: model.auc,
      latency: model.predictionLatency,
    }));
  }, [modelCandidates, selectedModels]);

  const strategyComparisonData = useMemo(() => {
    return ENSEMBLE_STRATEGIES.map(strategy => ({
      name: strategy.name,
      performance: strategy.performance,
      interpretability: strategy.interpretability,
      robustness: strategy.robustness,
      computationalCost: 10 - strategy.computationalCost, // Invert for better visualization
      complexity: strategy.complexity === 'Low' ? 3 : strategy.complexity === 'Medium' ? 6 : 9,
    }));
  }, []);

  const experimentHistoryData = useMemo(() => {
    return experiments_local
      .filter(exp => exp.status === 'completed')
      .slice(0, 10)
      .map(exp => ({
        name: exp.strategy,
        accuracy: exp.performance.accuracy,
        f1Score: exp.performance.f1_score,
        auc: exp.performance.auc,
        trainingTime: exp.computationTime,
        timestamp: exp.timestamp.toISOString().split('T')[0],
      }));
  }, [experiments_local]);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              Model Ensemble Builder
            </h1>
            <p className="text-muted-foreground mt-2">
              Create powerful ensemble models by combining multiple ML algorithms for superior performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvancedOptions ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
            <Button onClick={handleBuildEnsemble} disabled={selectedModels.size < 2}>
              <Zap className="h-4 w-4 mr-2" />
              Build Ensemble
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Model Selection */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          Model Selection
                        </CardTitle>
                        <CardDescription>
                          Choose models to include in your ensemble ({selectedModels.size} selected)
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(true)}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(false)}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search models..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Filter Models</DialogTitle>
                            <DialogDescription>
                              Set criteria to filter available models
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Minimum Accuracy</Label>
                              <Input
                                type="number"
                                min="0"
                                max="1"
                                step="0.01"
                                value={filterCriteria.minAccuracy}
                                onChange={(e) => setFilterCriteria(prev => ({
                                  ...prev,
                                  minAccuracy: parseFloat(e.target.value) || 0
                                }))}
                              />
                            </div>
                            <div>
                              <Label>Maximum Latency (ms)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={filterCriteria.maxLatency}
                                onChange={(e) => setFilterCriteria(prev => ({
                                  ...prev,
                                  maxLatency: parseInt(e.target.value) || 1000
                                }))}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Models Table */}
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Accuracy</TableHead>
                            <TableHead>F1 Score</TableHead>
                            <TableHead>AUC</TableHead>
                            <TableHead>Latency</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCandidates.map((model) => (
                            <TableRow key={model.id}>
                              <TableCell>
                                <Switch
                                  checked={model.selected}
                                  onCheckedChange={(checked) => handleModelSelection(model.id, checked)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{model.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {model.id}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{model.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 text-sm">{(model.accuracy * 100).toFixed(1)}%</div>
                                  <Progress value={model.accuracy * 100} className="w-16 h-2" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 text-sm">{(model.f1Score * 100).toFixed(1)}%</div>
                                  <Progress value={model.f1Score * 100} className="w-16 h-2" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 text-sm">{(model.auc * 100).toFixed(1)}%</div>
                                  <Progress value={model.auc * 100} className="w-16 h-2" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={model.predictionLatency < 50 ? "default" : model.predictionLatency < 100 ? "secondary" : "destructive"}>
                                  {model.predictionLatency}ms
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Details</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <BarChart3 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Performance Metrics</TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Selected Models Summary */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Selected Models
                    </CardTitle>
                    <CardDescription>
                      Overview of selected models for ensemble
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedModels.size === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No models selected</p>
                        <p className="text-sm">Select at least 2 models to build an ensemble</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedModels.size}</div>
                            <div className="text-sm text-muted-foreground">Models</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {(modelCandidates
                                .filter(m => selectedModels.has(m.id))
                                .reduce((sum, m) => sum + m.accuracy, 0) / selectedModels.size * 100
                              ).toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Performance Distribution</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={performanceComparisonData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="accuracy" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={handleCompareModels}
                            disabled={selectedModels.size < 2}
                            className="flex-1"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Compare
                          </Button>
                          <Button 
                            onClick={handleBuildEnsemble}
                            disabled={selectedModels.size < 2}
                            className="flex-1"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Build
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Ensemble Strategy
                  </CardTitle>
                  <CardDescription>
                    Choose the ensemble method that best fits your requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {ENSEMBLE_STRATEGIES.map((strategy) => (
                      <motion.div
                        key={strategy.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            selectedStrategy === strategy.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedStrategy(strategy.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                {strategy.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{strategy.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {strategy.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs">
                                  <Badge variant={
                                    strategy.complexity === 'Low' ? 'default' : 
                                    strategy.complexity === 'Medium' ? 'secondary' : 'destructive'
                                  }>
                                    {strategy.complexity}
                                  </Badge>
                                  <span>Performance: {strategy.performance}/10</span>
                                  <span>Interpretability: {strategy.interpretability}/10</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Configuration */}
              <div className="space-y-6">
                {currentStrategy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {currentStrategy.name} Configuration
                      </CardTitle>
                      <CardDescription>
                        Adjust parameters for the selected ensemble strategy
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentStrategy.parameters.map((param) => (
                        <div key={param.name}>
                          <Label className="text-sm font-medium">{param.name}</Label>
                          <p className="text-xs text-muted-foreground mb-2">{param.description}</p>
                          
                          {param.type === 'boolean' && (
                            <Switch
                              checked={strategyParams[param.name] || false}
                              onCheckedChange={(checked) => 
                                setStrategyParams(prev => ({ ...prev, [param.name]: checked }))
                              }
                            />
                          )}
                          
                          {param.type === 'select' && (
                            <Select
                              value={strategyParams[param.name] || param.defaultValue}
                              onValueChange={(value) => 
                                setStrategyParams(prev => ({ ...prev, [param.name]: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {param.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {param.type === 'range' && (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                value={strategyParams[param.name] || param.defaultValue}
                                onChange={(e) => 
                                  setStrategyParams(prev => ({ 
                                    ...prev, 
                                    [param.name]: parseFloat(e.target.value) || param.defaultValue 
                                  }))
                                }
                              />
                              {param.min !== undefined && param.max !== undefined && (
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{param.min}</span>
                                  <span>{param.max}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {param.type === 'number' && (
                            <Input
                              type="number"
                              value={strategyParams[param.name] || param.defaultValue}
                              onChange={(e) => 
                                setStrategyParams(prev => ({ 
                                  ...prev, 
                                  [param.name]: parseFloat(e.target.value) || param.defaultValue 
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Strategy Comparison Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Strategy Comparison</CardTitle>
                    <CardDescription>
                      Compare different ensemble strategies across key metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={strategyComparisonData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} />
                        <Radar
                          name="Performance"
                          dataKey="performance"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                        />
                        <Radar
                          name="Interpretability"
                          dataKey="interpretability"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare selected models across key performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={performanceComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy" />
                      <Bar dataKey="precision" fill="#10b981" name="Precision" />
                      <Bar dataKey="recall" fill="#f59e0b" name="Recall" />
                      <Bar dataKey="f1Score" fill="#ef4444" name="F1 Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Latency vs Accuracy Scatter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Accuracy vs Latency
                  </CardTitle>
                  <CardDescription>
                    Find the optimal balance between accuracy and prediction speed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart data={performanceComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="latency" name="Latency (ms)" />
                      <YAxis dataKey="accuracy" name="Accuracy" />
                      <RechartsTooltip 
                        formatter={(value, name) => [
                          name === 'accuracy' ? `${(value * 100).toFixed(1)}%` : `${value}ms`,
                          name === 'accuracy' ? 'Accuracy' : 'Latency'
                        ]}
                        labelFormatter={(label) => `Model: ${label}`}
                      />
                      <Scatter dataKey="accuracy" fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Model Comparison</CardTitle>
                <CardDescription>
                  Comprehensive comparison of all selected models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Precision</TableHead>
                      <TableHead>Recall</TableHead>
                      <TableHead>F1 Score</TableHead>
                      <TableHead>AUC</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Memory</TableHead>
                      <TableHead>Complexity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelCandidates
                      .filter(model => selectedModels.has(model.id))
                      .map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>
                            <Badge variant={model.accuracy > 0.9 ? "default" : model.accuracy > 0.8 ? "secondary" : "destructive"}>
                              {(model.accuracy * 100).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{(model.precision * 100).toFixed(1)}%</TableCell>
                          <TableCell>{(model.recall * 100).toFixed(1)}%</TableCell>
                          <TableCell>{(model.f1Score * 100).toFixed(1)}%</TableCell>
                          <TableCell>{(model.auc * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge variant={model.predictionLatency < 50 ? "default" : model.predictionLatency < 100 ? "secondary" : "destructive"}>
                              {model.predictionLatency}ms
                            </Badge>
                          </TableCell>
                          <TableCell>{model.memoryUsage}MB</TableCell>
                          <TableCell>
                            <Progress value={model.complexity * 10} className="w-16" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-6">
            {/* Active Experiment */}
            {activeExperiment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Active Experiment
                  </CardTitle>
                  <CardDescription>
                    Current ensemble training progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{activeExperiment.strategy} Ensemble</h3>
                        <p className="text-sm text-muted-foreground">
                          {activeExperiment.models.length} models • Started {activeExperiment.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant={
                        activeExperiment.status === 'completed' ? 'default' :
                        activeExperiment.status === 'running' ? 'secondary' :
                        activeExperiment.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {activeExperiment.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{activeExperiment.progress}%</span>
                      </div>
                      <Progress value={activeExperiment.progress} />
                    </div>

                    {activeExperiment.status === 'completed' && (
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {(activeExperiment.performance.accuracy * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {(activeExperiment.performance.f1_score * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">F1 Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {activeExperiment.computationTime.toFixed(0)}s
                          </div>
                          <div className="text-xs text-muted-foreground">Training Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {activeExperiment.memoryUsage.toFixed(0)}MB
                          </div>
                          <div className="text-xs text-muted-foreground">Memory</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experiment History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Experiment History
                    </CardTitle>
                    <CardDescription>
                      Track performance across different ensemble configurations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {experiments_local.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No experiments yet</p>
                        <p className="text-sm">Build your first ensemble to see results here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={experimentHistoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" name="Accuracy" />
                            <Line type="monotone" dataKey="f1Score" stroke="#10b981" name="F1 Score" />
                            <Line type="monotone" dataKey="auc" stroke="#f59e0b" name="AUC" />
                          </LineChart>
                        </ResponsiveContainer>

                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Strategy</TableHead>
                                <TableHead>Models</TableHead>
                                <TableHead>Accuracy</TableHead>
                                <TableHead>F1 Score</TableHead>
                                <TableHead>Training Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {experiments_local.slice(0, 10).map((exp) => (
                                <TableRow key={exp.id}>
                                  <TableCell className="font-medium">{exp.strategy}</TableCell>
                                  <TableCell>{exp.models.length}</TableCell>
                                  <TableCell>
                                    {exp.status === 'completed' ? 
                                      `${(exp.performance.accuracy * 100).toFixed(1)}%` : 
                                      '-'
                                    }
                                  </TableCell>
                                  <TableCell>
                                    {exp.status === 'completed' ? 
                                      `${(exp.performance.f1_score * 100).toFixed(1)}%` : 
                                      '-'
                                    }
                                  </TableCell>
                                  <TableCell>{exp.computationTime.toFixed(0)}s</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      exp.status === 'completed' ? 'default' :
                                      exp.status === 'running' ? 'secondary' :
                                      exp.status === 'failed' ? 'destructive' : 'outline'
                                    }>
                                      {exp.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>View Details</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Export Model</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Copy className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Clone Experiment</TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Performance Summary
                    </CardTitle>
                    <CardDescription>
                      Overall ensemble performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {experiments_local.filter(e => e.status === 'completed').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No completed experiments</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const completedExps = experiments_local.filter(e => e.status === 'completed');
                          const avgAccuracy = completedExps.reduce((sum, exp) => sum + exp.performance.accuracy, 0) / completedExps.length;
                          const bestAccuracy = Math.max(...completedExps.map(exp => exp.performance.accuracy));
                          const avgTrainingTime = completedExps.reduce((sum, exp) => sum + exp.computationTime, 0) / completedExps.length;
                          
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {completedExps.length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Completed</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {(bestAccuracy * 100).toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-muted-foreground">Best Accuracy</div>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Average Accuracy</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={avgAccuracy * 100} className="flex-1" />
                                  <span className="text-sm font-medium">{(avgAccuracy * 100).toFixed(1)}%</span>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Training Efficiency</Label>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Avg: {avgTrainingTime.toFixed(0)}s per experiment
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Strategy Performance</h4>
                                <ResponsiveContainer width="100%" height={150}>
                                  <PieChart>
                                    <Pie
                                      data={Object.entries(
                                        completedExps.reduce((acc, exp) => {
                                          acc[exp.strategy] = (acc[exp.strategy] || 0) + 1;
                                          return acc;
                                        }, {} as Record<string, number>)
                                      ).map(([strategy, count]) => ({ name: strategy, value: count }))}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={50}
                                      fill="#3b82f6"
                                    >
                                      {Object.entries(
                                        completedExps.reduce((acc, exp) => {
                                          acc[exp.strategy] = (acc[exp.strategy] || 0) + 1;
                                          return acc;
                                        }, {} as Record<string, number>)
                                      ).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hyperparameter Optimization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Hyperparameter Optimization
                  </CardTitle>
                  <CardDescription>
                    Automatically optimize ensemble parameters for best performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!ensembleConfig ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Build an ensemble first</p>
                      <p className="text-sm">Create an ensemble to enable optimization</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Optimization Objective</Label>
                        <Select defaultValue="accuracy">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accuracy">Accuracy</SelectItem>
                            <SelectItem value="f1_score">F1 Score</SelectItem>
                            <SelectItem value="auc">AUC</SelectItem>
                            <SelectItem value="precision">Precision</SelectItem>
                            <SelectItem value="recall">Recall</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Optimization Method</Label>
                        <Select defaultValue="bayesian">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                            <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                            <SelectItem value="random">Random Search</SelectItem>
                            <SelectItem value="grid">Grid Search</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Max Iterations</Label>
                        <Input type="number" defaultValue="100" min="10" max="1000" />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Early Stopping</Label>
                        <Switch defaultChecked />
                      </div>

                      <Button 
                        onClick={handleOptimizeEnsemble}
                        disabled={optimizationInProgress}
                        className="w-full"
                      >
                        {optimizationInProgress ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Start Optimization
                          </>
                        )}
                      </Button>

                      {optimizationInProgress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>45%</span>
                          </div>
                          <Progress value={45} />
                          <p className="text-xs text-muted-foreground">
                            Iteration 45/100 • Best score: 0.934
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Optimization History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Optimization History
                  </CardTitle>
                  <CardDescription>
                    Track optimization progress and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { iteration: 1, score: 0.85, bestScore: 0.85 },
                      { iteration: 10, score: 0.87, bestScore: 0.87 },
                      { iteration: 20, score: 0.86, bestScore: 0.87 },
                      { iteration: 30, score: 0.89, bestScore: 0.89 },
                      { iteration: 40, score: 0.88, bestScore: 0.89 },
                      { iteration: 50, score: 0.91, bestScore: 0.91 },
                      { iteration: 60, score: 0.90, bestScore: 0.91 },
                      { iteration: 70, score: 0.93, bestScore: 0.93 },
                      { iteration: 80, score: 0.92, bestScore: 0.93 },
                      { iteration: 90, score: 0.94, bestScore: 0.94 },
                      { iteration: 100, score: 0.93, bestScore: 0.94 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="iteration" />
                      <YAxis domain={[0.8, 1]} />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Current Score" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="bestScore" stroke="#10b981" name="Best Score" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crosshair className="h-5 w-5" />
                  Optimization Results
                </CardTitle>
                <CardDescription>
                  Best parameters found during optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Optimized Parameters</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Learning Rate</span>
                        <Badge variant="outline">0.087</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Number of Estimators</span>
                        <Badge variant="outline">247</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Max Depth</span>
                        <Badge variant="outline">7</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subsample</span>
                        <Badge variant="outline">0.83</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Performance Improvement</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Accuracy</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">89.2%</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-sm font-medium text-green-600">94.1%</span>
                          <Badge variant="default" className="text-xs">+4.9%</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">F1 Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">87.5%</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-sm font-medium text-green-600">92.8%</span>
                          <Badge variant="default" className="text-xs">+5.3%</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AUC</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">91.7%</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-sm font-medium text-green-600">96.2%</span>
                          <Badge variant="default" className="text-xs">+4.5%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Importance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Feature Importance
                  </CardTitle>
                  <CardDescription>
                    Most important features across ensemble models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={[
                        { feature: 'Feature_1', importance: 0.23, model1: 0.25, model2: 0.21, model3: 0.24 },
                        { feature: 'Feature_2', importance: 0.19, model1: 0.18, model2: 0.20, model3: 0.19 },
                        { feature: 'Feature_3', importance: 0.15, model1: 0.16, model2: 0.14, model3: 0.15 },
                        { feature: 'Feature_4', importance: 0.12, model1: 0.11, model2: 0.13, model3: 0.12 },
                        { feature: 'Feature_5', importance: 0.10, model1: 0.09, model2: 0.11, model3: 0.10 },
                        { feature: 'Feature_6', importance: 0.08, model1: 0.08, model2: 0.08, model3: 0.08 },
                        { feature: 'Feature_7', importance: 0.07, model1: 0.07, model2: 0.07, model3: 0.07 },
                        { feature: 'Feature_8', importance: 0.06, model1: 0.06, model2: 0.06, model3: 0.05 },
                      ]}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="feature" type="category" width={80} />
                      <RechartsTooltip />
                      <Bar dataKey="importance" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Model Contribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Model Contributions
                  </CardTitle>
                  <CardDescription>
                    How much each model contributes to ensemble predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Random Forest', value: 35, color: '#3b82f6' },
                          { name: 'Gradient Boosting', value: 28, color: '#10b981' },
                          { name: 'SVM', value: 22, color: '#f59e0b' },
                          { name: 'Neural Network', value: 15, color: '#ef4444' },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Random Forest', value: 35, color: '#3b82f6' },
                          { name: 'Gradient Boosting', value: 28, color: '#10b981' },
                          { name: 'SVM', value: 22, color: '#f59e0b' },
                          { name: 'Neural Network', value: 15, color: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Prediction Confidence Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Prediction Confidence Analysis
                </CardTitle>
                <CardDescription>
                  Distribution of prediction confidence across the ensemble
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Confidence Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { range: '0.9-1.0', count: 1240, percentage: 62 },
                        { range: '0.8-0.9', count: 480, percentage: 24 },
                        { range: '0.7-0.8', count: 200, percentage: 10 },
                        { range: '0.6-0.7', count: 60, percentage: 3 },
                        { range: '0.5-0.6', count: 20, percentage: 1 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Confidence Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Average Confidence</span>
                          <span className="text-sm font-medium">91.2%</span>
                        </div>
                        <Progress value={91.2} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">High Confidence (&gt;90%)</span>
                          <span className="text-sm font-medium">62%</span>
                        </div>
                        <Progress value={62} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Medium Confidence (70-90%)</span>
                          <span className="text-sm font-medium">34%</span>
                        </div>
                        <Progress value={34} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Low Confidence (&lt;70%)</span>
                          <span className="text-sm font-medium">4%</span>
                        </div>
                        <Progress value={4} />
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Predictions</span>
                          <span className="font-medium">2,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Unanimous Predictions</span>
                          <span className="font-medium">1,240 (62%)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Disagreement Cases</span>
                          <span className="font-medium">760 (38%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Analysis
                </CardTitle>
                <CardDescription>
                  Analysis of prediction errors and model disagreements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Error Types</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">False Positives</span>
                        <Badge variant="destructive">45</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">False Negatives</span>
                        <Badge variant="destructive">38</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Model Disagreements</span>
                        <Badge variant="secondary">127</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Low Confidence</span>
                        <Badge variant="outline">23</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Error Distribution</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'False Positives', value: 45 },
                            { name: 'False Negatives', value: 38 },
                            { name: 'Disagreements', value: 127 },
                            { name: 'Low Confidence', value: 23 },
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#ef4444"
                        >
                          {[
                            { name: 'False Positives', value: 45 },
                            { name: 'False Negatives', value: 38 },
                            { name: 'Disagreements', value: 127 },
                            { name: 'Low Confidence', value: 23 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Improvement Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Target className="h-4 w-4 mr-2" />
                        Retrain on errors
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Filter className="h-4 w-4 mr-2" />
                        Adjust thresholds
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add more models
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Tune weights
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default ModelEnsembleBuilder;