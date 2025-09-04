import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Brain, Zap, Target, TrendingUp, TrendingDown, Settings, Activity, BarChart3, LineChart, PieChart, Cpu, Database, Server, Monitor, Gauge, Scale, Layers, GitBranch, GitCommit, GitMerge, AlertTriangle, CheckCircle, Clock, Calendar, Download, Upload, Save, Eye, EyeOff, RefreshCw, Play, Pause, Square, FastForward, Rewind, SkipForward, SkipBack, Filter, Search, Plus, Minus, Edit, Trash2, Copy, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Maximize, Minimize, Split, Merge, Grid, List, Code, FileText, FolderOpen, Archive, CloudDownload, Wrench, TestTube, Microscope, Beaker } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, ComposedChart, Area, AreaChart, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '@/lib copie/utils';
import { useOptimization } from '../../hooks/useOptimization';
import { optimizationApi } from '../../services/optimization-apis';
import { MLModel, ModelMetrics, TrainingJob, ModelExperiment, ModelRegistry } from '../../types/optimization.types';

interface MLModelManagerProps {
  className?: string;
  onModelDeployment?: (model: MLModel) => void;
  onTrainingComplete?: (job: TrainingJob) => void;
}

interface MLModelDefinition {
  id: string;
  name: string;
  description: string;
  type: 'regression' | 'classification' | 'clustering' | 'neural_network' | 'ensemble' | 'deep_learning';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'lightgbm' | 'custom';
  version: string;
  status: 'draft' | 'training' | 'trained' | 'deployed' | 'deprecated' | 'failed';
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  mse?: number;
  mae?: number;
  r2Score?: number;
  trainingTime: number;
  inferenceTime: number;
  memoryUsage: number;
  dataSize: number;
  features: string[];
  hyperparameters: Record<string, any>;
  metrics: ModelMetrics;
  experiments: ModelExperiment[];
  createdAt: Date;
  updatedAt: Date;
  deployedAt?: Date;
  author: string;
  tags: string[];
}

interface ModelTrainingConfig {
  modelId: string;
  datasetId: string;
  targetFeature: string;
  features: string[];
  trainingParameters: {
    batchSize: number;
    epochs: number;
    learningRate: number;
    validationSplit: number;
    testSplit: number;
    crossValidation: boolean;
    earlyStopPatience: number;
  };
  hyperparameterTuning: {
    enabled: boolean;
    method: 'grid_search' | 'random_search' | 'bayesian' | 'genetic';
    maxTrials: number;
    objective: string;
    parameters: Record<string, any>;
  };
  resourceLimits: {
    maxCpuCores: number;
    maxMemoryGB: number;
    maxGpuCount: number;
    maxTrainingHours: number;
  };
  monitoring: {
    metricsLogging: boolean;
    modelCheckpoints: boolean;
    tensorboardLogging: boolean;
    alertingEnabled: boolean;
  };
}

interface ModelExperimentResult {
  id: string;
  modelId: string;
  experimentName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration: number;
  parameters: Record<string, any>;
  metrics: {
    accuracy: number;
    loss: number;
    valAccuracy: number;
    valLoss: number;
    f1Score?: number;
    precision?: number;
    recall?: number;
    auc?: number;
  };
  artifacts: {
    modelPath: string;
    metricsPath: string;
    logsPath: string;
    checkpointsPath: string;
  };
  notes: string;
  tags: string[];
}

interface ModelDeployment {
  id: string;
  modelId: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'deploying' | 'active' | 'inactive' | 'failed';
  endpoint: string;
  instances: number;
  cpuLimit: string;
  memoryLimit: string;
  autoScaling: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetCpuUtilization: number;
  };
  monitoring: {
    healthCheck: boolean;
    metricsCollection: boolean;
    loggingEnabled: boolean;
    alerting: boolean;
  };
  performance: {
    averageLatency: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  deployedAt: Date;
  lastUpdated: Date;
}

interface AutoMLPipeline {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'failed';
  datasetId: string;
  objective: 'maximize_accuracy' | 'minimize_loss' | 'maximize_f1' | 'minimize_latency' | 'balance_performance_cost';
  constraints: {
    maxTrainingTime: number;
    maxModelSize: number;
    maxInferenceLatency: number;
    budget: number;
  };
  algorithms: string[];
  bestModel?: {
    id: string;
    score: number;
    parameters: Record<string, any>;
  };
  leaderboard: Array<{
    rank: number;
    modelId: string;
    score: number;
    algorithm: string;
    trainingTime: number;
  }>;
  progress: number;
  startTime: Date;
  estimatedEndTime?: Date;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const MLModelManager: React.FC<MLModelManagerProps> = ({
  className,
  onModelDeployment,
  onTrainingComplete
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'models' | 'training' | 'experiments' | 'deployment' | 'automl'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // ML data
  const [models, setModels] = useState<MLModelDefinition[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [experiments, setExperiments] = useState<ModelExperimentResult[]>([]);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [autoMLPipelines, setAutoMLPipelines] = useState<AutoMLPipeline[]>([]);
  
  // Dialog and modal states
  const [showCreateModel, setShowCreateModel] = useState(false);
  const [showTrainingConfig, setShowTrainingConfig] = useState(false);
  const [showExperimentDetails, setShowExperimentDetails] = useState(false);
  const [showDeploymentConfig, setShowDeploymentConfig] = useState(false);
  const [showAutoMLConfig, setShowAutoMLConfig] = useState(false);
  const [selectedModel, setSelectedModel] = useState<MLModelDefinition | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ModelExperimentResult | null>(null);
  
  // Form states
  const [modelForm, setModelForm] = useState({
    name: '',
    description: '',
    type: 'classification' as 'regression' | 'classification' | 'clustering' | 'neural_network' | 'ensemble' | 'deep_learning',
    framework: 'scikit-learn' as 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'lightgbm' | 'custom',
    features: [] as string[],
    tags: [] as string[]
  });

  const [trainingConfig, setTrainingConfig] = useState<ModelTrainingConfig>({
    modelId: '',
    datasetId: '',
    targetFeature: '',
    features: [],
    trainingParameters: {
      batchSize: 32,
      epochs: 100,
      learningRate: 0.001,
      validationSplit: 0.2,
      testSplit: 0.1,
      crossValidation: false,
      earlyStopPatience: 10
    },
    hyperparameterTuning: {
      enabled: false,
      method: 'random_search',
      maxTrials: 50,
      objective: 'accuracy',
      parameters: {}
    },
    resourceLimits: {
      maxCpuCores: 4,
      maxMemoryGB: 8,
      maxGpuCount: 0,
      maxTrainingHours: 24
    },
    monitoring: {
      metricsLogging: true,
      modelCheckpoints: true,
      tensorboardLogging: false,
      alertingEnabled: true
    }
  });

  // Hooks
  const {
    getMLModels,
    createMLModel,
    trainModel,
    deployModel,
    getModelMetrics,
    runAutoML,
    loading: optimizationLoading,
    error: optimizationError
  } = useOptimization();

  // Initialize data
  useEffect(() => {
    loadMLData();
  }, [selectedTimeRange]);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshMLData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Data loading functions
  const loadMLData = useCallback(async () => {
    try {
      setLoading(true);
      const [modelsData, trainingData, deploymentsData, experimentsData, automlData] = await Promise.all([
        getMLModels(),
        optimizationApi.getTrainingJobs(),
        optimizationApi.getModelDeployments(),
        optimizationApi.getModelExperiments(),
        optimizationApi.getAutoMLPipelines()
      ]);
      
      setModels(modelsData);
      setTrainingJobs(trainingData);
      setDeployments(deploymentsData);
      setExperiments(experimentsData);
      setAutoMLPipelines(automlData);
    } catch (error) {
      console.error('Failed to load ML data:', error);
    } finally {
      setLoading(false);
    }
  }, [getMLModels]);

  const refreshMLData = useCallback(async () => {
    await loadMLData();
  }, [loadMLData]);

  // ML operations
  const handleCreateModel = useCallback(async () => {
    try {
      setLoading(true);
      const model = await createMLModel({
        name: modelForm.name,
        description: modelForm.description,
        type: modelForm.type,
        framework: modelForm.framework,
        features: modelForm.features,
        tags: modelForm.tags
      });
      
      setModels(prev => [...prev, model]);
      setShowCreateModel(false);
      setModelForm({
        name: '',
        description: '',
        type: 'classification',
        framework: 'scikit-learn',
        features: [],
        tags: []
      });
    } catch (error) {
      console.error('Failed to create model:', error);
    } finally {
      setLoading(false);
    }
  }, [createMLModel, modelForm]);

  const handleStartTraining = useCallback(async () => {
    try {
      setLoading(true);
      const job = await trainModel(trainingConfig);
      
      setTrainingJobs(prev => [...prev, job]);
      setShowTrainingConfig(false);
      
      if (onTrainingComplete) {
        onTrainingComplete(job);
      }
    } catch (error) {
      console.error('Failed to start training:', error);
    } finally {
      setLoading(false);
    }
  }, [trainModel, trainingConfig, onTrainingComplete]);

  const handleDeployModel = useCallback(async (modelId: string, environment: string) => {
    try {
      setLoading(true);
      const deployment = await deployModel({
        modelId,
        environment,
        autoScaling: true,
        monitoring: true
      });
      
      setDeployments(prev => [...prev, deployment]);
      
      if (onModelDeployment) {
        const model = models.find(m => m.id === modelId);
        if (model) onModelDeployment(model);
      }
    } catch (error) {
      console.error('Failed to deploy model:', error);
    } finally {
      setLoading(false);
    }
  }, [deployModel, models, onModelDeployment]);

  const handleStartAutoML = useCallback(async (pipelineConfig: any) => {
    try {
      setLoading(true);
      const pipeline = await runAutoML(pipelineConfig);
      setAutoMLPipelines(prev => [...prev, pipeline]);
      setShowAutoMLConfig(false);
    } catch (error) {
      console.error('Failed to start AutoML:', error);
    } finally {
      setLoading(false);
    }
  }, [runAutoML]);

  // Calculate derived metrics
  const modelStatistics = useMemo(() => {
    const totalModels = models.length;
    const trainedModels = models.filter(m => m.status === 'trained').length;
    const deployedModels = models.filter(m => m.status === 'deployed').length;
    const trainingModels = models.filter(m => m.status === 'training').length;
    const averageAccuracy = models.length > 0 ? models.reduce((sum, m) => sum + m.accuracy, 0) / models.length : 0;
    
    return {
      totalModels,
      trainedModels,
      deployedModels,
      trainingModels,
      averageAccuracy
    };
  }, [models]);

  const activeTrainingJobs = useMemo(() => {
    return trainingJobs.filter(job => job.status === 'running').length;
  }, [trainingJobs]);

  const activeDeployments = useMemo(() => {
    return deployments.filter(dep => dep.status === 'active').length;
  }, [deployments]);

  // Render functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStatistics.totalModels}</div>
            <p className="text-xs text-muted-foreground">
              {modelStatistics.deployedModels} deployed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStatistics.averageAccuracy.toFixed(1)}%</div>
            <Progress value={modelStatistics.averageAccuracy} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Training</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrainingJobs}</div>
            <p className="text-xs text-muted-foreground">
              Jobs running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeployments}</div>
            <p className="text-xs text-muted-foreground">
              Active endpoints
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Comparison</CardTitle>
          <CardDescription>Accuracy and performance metrics across all models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={models.map(model => ({
                name: model.name,
                accuracy: model.accuracy,
                f1Score: model.f1Score,
                trainingTime: model.trainingTime,
                inferenceTime: model.inferenceTime
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="accuracy" name="Accuracy" unit="%" />
                <YAxis dataKey="f1Score" name="F1 Score" unit="%" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="f1Score" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Models */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Models</CardTitle>
          <CardDescription>Latest trained and deployed models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {models.slice(0, 5).map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "rounded-full p-2",
                    model.type === 'classification' && "bg-blue-100 text-blue-600",
                    model.type === 'regression' && "bg-green-100 text-green-600",
                    model.type === 'clustering' && "bg-purple-100 text-purple-600",
                    model.type === 'neural_network' && "bg-orange-100 text-orange-600"
                  )}>
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {model.framework} • {model.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{model.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <Badge variant={
                    model.status === 'deployed' ? 'default' :
                    model.status === 'trained' ? 'secondary' :
                    model.status === 'training' ? 'outline' : 'destructive'
                  }>
                    {model.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateModel(true)}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create New Model
            </CardTitle>
            <CardDescription>Define and configure a new ML model</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTrainingConfig(true)}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Start Training
            </CardTitle>
            <CardDescription>Train a model with your dataset</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAutoMLConfig(true)}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              AutoML Pipeline
            </CardTitle>
            <CardDescription>Automated model selection and tuning</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderModels = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">ML Models</h3>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all machine learning models
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshMLData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModel(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Model
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card key={model.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    model.type === 'classification' && "bg-blue-100 text-blue-600",
                    model.type === 'regression' && "bg-green-100 text-green-600",
                    model.type === 'clustering' && "bg-purple-100 text-purple-600",
                    model.type === 'neural_network' && "bg-orange-100 text-orange-600",
                    model.type === 'ensemble' && "bg-yellow-100 text-yellow-600",
                    model.type === 'deep_learning' && "bg-red-100 text-red-600"
                  )}>
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {model.framework} • v{model.version}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={
                  model.status === 'deployed' ? 'default' :
                  model.status === 'trained' ? 'secondary' :
                  model.status === 'training' ? 'outline' : 'destructive'
                }>
                  {model.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{model.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Accuracy</Label>
                    <div className="text-sm font-medium">{model.accuracy.toFixed(2)}%</div>
                    <Progress value={model.accuracy} className="h-1 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">F1 Score</Label>
                    <div className="text-sm font-medium">{model.f1Score.toFixed(2)}%</div>
                    <Progress value={model.f1Score} className="h-1 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Training Time</Label>
                    <div className="text-sm font-medium">{model.trainingTime.toFixed(1)}h</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inference</Label>
                    <div className="text-sm font-medium">{model.inferenceTime.toFixed(0)}ms</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Features ({model.features.length})</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {model.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {model.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{model.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeployModel(model.id, 'production')}
                    disabled={model.status !== 'trained' || loading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Deploy
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedModel(model);
                      setShowTrainingConfig(true);
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Training Jobs</h3>
          <p className="text-sm text-muted-foreground">
            Monitor and manage model training processes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshMLData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowTrainingConfig(true)}>
            <Play className="h-4 w-4 mr-2" />
            Start Training
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Training Jobs</CardTitle>
          <CardDescription>Currently running and recent training jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Current Metrics</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.modelName}</div>
                      <div className="text-xs text-muted-foreground">{job.algorithm}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      job.status === 'running' ? 'default' :
                      job.status === 'completed' ? 'secondary' :
                      job.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{job.progress?.toFixed(1)}%</div>
                      <Progress value={job.progress || 0} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {job.duration ? `${(job.duration / 3600).toFixed(1)}h` : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Acc: {job.currentMetrics?.accuracy?.toFixed(2) || '-'}%</div>
                      <div>Loss: {job.currentMetrics?.loss?.toFixed(3) || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      {job.status === 'running' && (
                        <Button size="sm" variant="outline">
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderExperiments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Model Experiments</h3>
          <p className="text-sm text-muted-foreground">
            Track and compare model experiments and results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshMLData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <TestTube className="h-4 w-4 mr-2" />
            New Experiment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {experiments.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{experiment.experimentName}</CardTitle>
                  <CardDescription>Model: {experiment.modelId}</CardDescription>
                </div>
                <Badge variant={
                  experiment.status === 'completed' ? 'default' :
                  experiment.status === 'running' ? 'secondary' :
                  experiment.status === 'failed' ? 'destructive' : 'outline'
                }>
                  {experiment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Accuracy</Label>
                    <div className="text-lg font-bold">{experiment.metrics.accuracy.toFixed(2)}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Loss</Label>
                    <div className="text-lg font-bold">{experiment.metrics.loss.toFixed(4)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Val Accuracy</Label>
                    <div className="text-sm font-medium">{experiment.metrics.valAccuracy.toFixed(2)}%</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Val Loss</Label>
                    <div className="text-sm font-medium">{experiment.metrics.valLoss.toFixed(4)}</div>
                  </div>
                </div>
                
                {experiment.metrics.f1Score && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">F1 Score</Label>
                      <div className="text-sm font-medium">{experiment.metrics.f1Score.toFixed(3)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Precision</Label>
                      <div className="text-sm font-medium">{experiment.metrics.precision?.toFixed(3)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Recall</Label>
                      <div className="text-sm font-medium">{experiment.metrics.recall?.toFixed(3)}</div>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Duration</Label>
                  <div className="text-sm text-muted-foreground">
                    {experiment.duration ? `${(experiment.duration / 3600).toFixed(1)} hours` : 'In progress...'}
                  </div>
                </div>
                
                {experiment.notes && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Notes</Label>
                    <p className="text-sm text-muted-foreground">{experiment.notes}</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedExperiment(experiment);
                      setShowExperimentDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ML Model Manager</h2>
          <p className="text-muted-foreground">
            Comprehensive machine learning model lifecycle management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshMLData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="automl">AutoML</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="models" className="space-y-6">
          {renderModels()}
        </TabsContent>
        
        <TabsContent value="training" className="space-y-6">
          {renderTraining()}
        </TabsContent>
        
        <TabsContent value="experiments" className="space-y-6">
          {renderExperiments()}
        </TabsContent>
        
        <TabsContent value="deployment" className="space-y-6">
          {/* Deployment management */}
          <div>Model Deployment Management (Implementation continues...)</div>
        </TabsContent>
        
        <TabsContent value="automl" className="space-y-6">
          {/* AutoML pipelines */}
          <div>AutoML Pipeline Management (Implementation continues...)</div>
        </TabsContent>
      </Tabs>

      {/* Create Model Dialog */}
      <Dialog open={showCreateModel} onOpenChange={setShowCreateModel}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New ML Model</DialogTitle>
            <DialogDescription>
              Define a new machine learning model with its configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={modelForm.name}
                  onChange={(e) => setModelForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter model name"
                />
              </div>
              <div>
                <Label htmlFor="model-type">Model Type</Label>
                <Select value={modelForm.type} onValueChange={(value) => setModelForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="clustering">Clustering</SelectItem>
                    <SelectItem value="neural_network">Neural Network</SelectItem>
                    <SelectItem value="ensemble">Ensemble</SelectItem>
                    <SelectItem value="deep_learning">Deep Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={modelForm.description}
                onChange={(e) => setModelForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the model purpose and approach"
              />
            </div>
            
            <div>
              <Label htmlFor="framework">Framework</Label>
              <Select value={modelForm.framework} onValueChange={(value) => setModelForm(prev => ({ ...prev, framework: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tensorflow">TensorFlow</SelectItem>
                  <SelectItem value="pytorch">PyTorch</SelectItem>
                  <SelectItem value="scikit-learn">Scikit-learn</SelectItem>
                  <SelectItem value="xgboost">XGBoost</SelectItem>
                  <SelectItem value="lightgbm">LightGBM</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateModel(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModel} disabled={loading}>
              Create Model
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Configuration Dialog */}
      <Dialog open={showTrainingConfig} onOpenChange={setShowTrainingConfig}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configure Model Training</DialogTitle>
            <DialogDescription>
              Set up training parameters and resource requirements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Batch Size</Label>
                <Input
                  type="number"
                  value={trainingConfig.trainingParameters.batchSize}
                  onChange={(e) => setTrainingConfig(prev => ({
                    ...prev,
                    trainingParameters: {
                      ...prev.trainingParameters,
                      batchSize: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Epochs</Label>
                <Input
                  type="number"
                  value={trainingConfig.trainingParameters.epochs}
                  onChange={(e) => setTrainingConfig(prev => ({
                    ...prev,
                    trainingParameters: {
                      ...prev.trainingParameters,
                      epochs: parseInt(e.target.value)
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Learning Rate</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={trainingConfig.trainingParameters.learningRate}
                  onChange={(e) => setTrainingConfig(prev => ({
                    ...prev,
                    trainingParameters: {
                      ...prev.trainingParameters,
                      learningRate: parseFloat(e.target.value)
                    }
                  }))}
                />
              </div>
              <div>
                <Label>Validation Split</Label>
                <Slider
                  value={[trainingConfig.trainingParameters.validationSplit * 100]}
                  onValueChange={([value]) => setTrainingConfig(prev => ({
                    ...prev,
                    trainingParameters: {
                      ...prev.trainingParameters,
                      validationSplit: value / 100
                    }
                  }))}
                  max={50}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {(trainingConfig.trainingParameters.validationSplit * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-3">Hyperparameter Tuning</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={trainingConfig.hyperparameterTuning.enabled}
                    onCheckedChange={(checked) => setTrainingConfig(prev => ({
                      ...prev,
                      hyperparameterTuning: {
                        ...prev.hyperparameterTuning,
                        enabled: checked
                      }
                    }))}
                  />
                  <Label>Enable Hyperparameter Tuning</Label>
                </div>
                
                {trainingConfig.hyperparameterTuning.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tuning Method</Label>
                      <Select
                        value={trainingConfig.hyperparameterTuning.method}
                        onValueChange={(value) => setTrainingConfig(prev => ({
                          ...prev,
                          hyperparameterTuning: {
                            ...prev.hyperparameterTuning,
                            method: value as any
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid_search">Grid Search</SelectItem>
                          <SelectItem value="random_search">Random Search</SelectItem>
                          <SelectItem value="bayesian">Bayesian Optimization</SelectItem>
                          <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Max Trials</Label>
                      <Input
                        type="number"
                        value={trainingConfig.hyperparameterTuning.maxTrials}
                        onChange={(e) => setTrainingConfig(prev => ({
                          ...prev,
                          hyperparameterTuning: {
                            ...prev.hyperparameterTuning,
                            maxTrials: parseInt(e.target.value)
                          }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowTrainingConfig(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartTraining} disabled={loading}>
              Start Training
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MLModelManager;