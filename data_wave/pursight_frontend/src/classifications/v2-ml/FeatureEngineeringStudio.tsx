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
import { AlertTriangle, Activity, BarChart3, Brain, CheckCircle, ChevronDown, ChevronRight, Clock, Database, Download, Eye, Filter, GitBranch, LineChart as LucideLineChart, Loader2, MoreHorizontal, Pause, Play, Plus, RefreshCw, Settings, Sliders, Target, TrendingUp, X, Zap, Code2, FlaskConical, Layers, Search, Calendar, Archive, Trash2, Edit3, Copy, ExternalLink, Wand2, Sparkles, Binary, Calculator, Workflow, Gauge, Timer, Users, Star, Award, Lightbulb, BarChart4, FileText, Save, Share2, Upload, FolderOpen, Maximize2, Minimize2, RotateCcw, FastForward, StopCircle, Monitor, HelpCircle, Lock, Unlock, Cpu, MemoryStick, HardDrive, Network, Wifi, Signal, Smartphone, Globe, MapPin, Compass, Crosshair, Focus, Scan,  } from 'lucide-react';
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
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useClassificationsRBAC } from '../core/hooks/useClassificationsRBAC';
import { mlApi } from '../core/api/mlApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Enhanced interfaces for feature engineering
interface Feature {
  id: string;
  name: string;
  type: 'numerical' | 'categorical' | 'text' | 'datetime' | 'boolean' | 'mixed';
  dataType: string;
  source: 'raw' | 'engineered' | 'synthetic';
  status: 'active' | 'deprecated' | 'experimental' | 'archived';
  statistics: {
    missing_values: number;
    unique_values: number;
    mean?: number;
    median?: number;
    std?: number;
    min?: number;
    max?: number;
    distribution?: Array<{ value: any; count: number }>;
    correlation_with_target?: number;
    importance_score?: number;
    quality_score: number;
  };
  transformations: FeatureTransformation[];
  dependencies: string[];
  businessContext: {
    description: string;
    business_value: 'high' | 'medium' | 'low';
    stakeholder: string;
    use_cases: string[];
  };
  metadata: {
    created_at: string;
    updated_at: string;
    created_by: string;
    version: string;
    tags: string[];
  };
  validation: {
    rules: ValidationRule[];
    last_validated: string;
    validation_status: 'passed' | 'failed' | 'warning';
    issues: string[];
  };
}

interface FeatureTransformation {
  id: string;
  type: 'encoding' | 'scaling' | 'aggregation' | 'extraction' | 'selection' | 'generation';
  method: string;
  parameters: Record<string, any>;
  input_features: string[];
  output_features: string[];
  description: string;
  performance_impact: {
    execution_time: number;
    memory_usage: number;
    improvement_score: number;
  };
  code: string;
  validation_results?: {
    before_stats: any;
    after_stats: any;
    improvement_metrics: Record<string, number>;
  };
}

interface ValidationRule {
  id: string;
  name: string;
  type: 'range' | 'format' | 'distribution' | 'correlation' | 'custom';
  condition: string;
  threshold: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  auto_fix: boolean;
}

interface FeatureEngineering {
  id: string;
  name: string;
  dataset_id: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';
  features: Feature[];
  transformations: FeatureTransformation[];
  pipeline: {
    steps: Array<{
      id: string;
      name: string;
      type: string;
      configuration: any;
      status: 'pending' | 'running' | 'completed' | 'failed';
      execution_time?: number;
      output_features?: string[];
    }>;
    execution_order: string[];
    parallel_execution: boolean;
  };
  performance: {
    total_features: number;
    engineered_features: number;
    execution_time: number;
    memory_usage: number;
    quality_improvement: number;
    model_performance_impact: number;
  };
  auto_generation: {
    enabled: boolean;
    strategy: 'basic' | 'advanced' | 'ai_powered';
    target_features: number;
    constraints: {
      max_complexity: number;
      max_execution_time: number;
      interpretability_threshold: number;
    };
    generated_features: Array<{
      name: string;
      formula: string;
      importance: number;
      interpretability: number;
    }>;
  };
  insights: {
    feature_importance: Array<{ feature: string; importance: number }>;
    correlations: Array<{ feature1: string; feature2: string; correlation: number }>;
    recommendations: string[];
    quality_issues: Array<{ feature: string; issue: string; severity: string }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface DataQuality {
  overall_score: number;
  completeness: number;
  consistency: number;
  validity: number;
  accuracy: number;
  uniqueness: number;
  timeliness: number;
  issues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    count: number;
    affected_features: string[];
    suggestions: string[];
  }>;
  trends: Array<{
    metric: string;
    values: Array<{ timestamp: string; value: number }>;
    trend: 'improving' | 'degrading' | 'stable';
  }>;
}

const FeatureEngineeringStudio: React.FC = () => {
  // State management
  const {
    mlModels,
    datasets,
    featureEngineering,
    selectedModelId,
    loading,
    addNotification,
    fetchMLModels,
    fetchDatasets,
    createFeatureEngineering,
    updateFeatureEngineering,
    deleteFeatureEngineering,
    runFeatureEngineering,
    pauseFeatureEngineering,
    generateAutoFeatures,
    validateFeatures,
    exportFeatures,
    setSelectedModel,
  } = useMLIntelligence();

  const { realtimeData } = useClassificationState();

  // Local state
  const [activeTab, setActiveTab] = useState('studio');
  const [selectedEngineering, setSelectedEngineering] = useState<FeatureEngineering | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showTransformDialog, setShowTransformDialog] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [engineeringFilters, setEngineeringFilters] = useState({
    status: 'all',
    dataset: 'all',
    type: 'all',
    quality: 'all'
  });
  const [featureFilters, setFeatureFilters] = useState({
    type: 'all',
    source: 'all',
    status: 'all',
    quality: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'quality' | 'importance'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'pipeline'>('table');
  const [autoGeneration, setAutoGeneration] = useState(false);
  const [realTimeValidation, setRealTimeValidation] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [pipelineMode, setPipelineMode] = useState<'visual' | 'code'>('visual');
  const [executionMode, setExecutionMode] = useState<'sequential' | 'parallel'>('parallel');

  // Refs
  const codeEditorRef = useRef<any>(null);
  const pipelineCanvasRef = useRef<HTMLDivElement>(null);

  // RBAC Integration
  const rbac = useClassificationsRBAC();
  const queryClient = useQueryClient();

  // Real backend data fetching with RBAC integration
  const { data: featureEngineeringData, isLoading: featureEngineeringLoading, error: featureEngineeringError } = useQuery({
    queryKey: ['feature-engineering', 'list'],
    queryFn: async () => {
      const response = await mlApi.getAllFeatureEngineering();
      return response.data;
    },
    enabled: rbac.classificationPermissions.canFeatureEngineering,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for real-time updates
  });

  const { data: dataQualityData, isLoading: dataQualityLoading } = useQuery({
    queryKey: ['data-quality', selectedDataset],
    queryFn: async () => {
      if (!selectedDataset) return null;
      const response = await mlApi.assessDataQuality(selectedDataset, {
        quality_config: {
          dimensions: ['completeness', 'consistency', 'validity', 'accuracy', 'uniqueness', 'timeliness'],
          automated_fixes: false,
          detailed_analysis: true
        }
      });
      return response.data;
    },
    enabled: !!selectedDataset && rbac.classificationPermissions.canFeatureEngineering,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Use real data or fallback to empty arrays
  const featureEngineeringProjects = useMemo(() => 
    featureEngineeringData?.projects || [], 
    [featureEngineeringData]
  );

  // Fallback data structure for when no backend data is available
  const fallbackFeatureEngineering: FeatureEngineering[] = useMemo(() => [
    {
      id: 'fe_1',
      name: 'Customer Behavior Feature Engineering',
      dataset_id: 'dataset_1',
      status: 'completed',
      features: [
        {
          id: 'feature_1',
          name: 'customer_lifetime_value',
          type: 'numerical',
          dataType: 'float64',
          source: 'engineered',
          status: 'active',
          statistics: {
            missing_values: 5,
            unique_values: 1247,
            mean: 2847.56,
            median: 1950.00,
            std: 1456.78,
            min: 0,
            max: 15000,
            correlation_with_target: 0.73,
            importance_score: 0.85,
            quality_score: 0.92
          },
          transformations: [],
          dependencies: ['total_purchases', 'avg_order_value', 'customer_tenure'],
          businessContext: {
            description: 'Predicted lifetime value of customer based on historical behavior',
            business_value: 'high',
            stakeholder: 'Marketing Team',
            use_cases: ['customer segmentation', 'retention campaigns', 'pricing optimization']
          },
          metadata: {
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T14:30:00Z',
            created_by: 'data.scientist@company.com',
            version: '1.2',
            tags: ['customer', 'value', 'prediction']
          },
          validation: {
            rules: [],
            last_validated: '2024-01-20T14:30:00Z',
            validation_status: 'passed',
            issues: []
          }
        }
      ],
      transformations: [],
      pipeline: {
        steps: [
          {
            id: 'step_1',
            name: 'Data Cleaning',
            type: 'preprocessing',
            configuration: { remove_outliers: true, fill_missing: 'median' },
            status: 'completed',
            execution_time: 45,
            output_features: ['clean_age', 'clean_income']
          },
          {
            id: 'step_2',
            name: 'Feature Generation',
            type: 'generation',
            configuration: { method: 'automated', max_features: 50 },
            status: 'completed',
            execution_time: 120,
            output_features: ['customer_lifetime_value', 'churn_probability']
          }
        ],
        execution_order: ['step_1', 'step_2'],
        parallel_execution: false
      },
      performance: {
        total_features: 25,
        engineered_features: 12,
        execution_time: 165,
        memory_usage: 2.4,
        quality_improvement: 0.15,
        model_performance_impact: 0.08
      },
      auto_generation: {
        enabled: true,
        strategy: 'ai_powered',
        target_features: 20,
        constraints: {
          max_complexity: 3,
          max_execution_time: 300,
          interpretability_threshold: 0.7
        },
        generated_features: [
          {
            name: 'interaction_age_income',
            formula: 'age * log(income + 1)',
            importance: 0.67,
            interpretability: 0.85
          }
        ]
      },
      insights: {
        feature_importance: [
          { feature: 'customer_lifetime_value', importance: 0.85 },
          { feature: 'churn_probability', importance: 0.72 },
          { feature: 'interaction_age_income', importance: 0.67 }
        ],
        correlations: [
          { feature1: 'age', feature2: 'income', correlation: 0.23 },
          { feature1: 'tenure', feature2: 'lifetime_value', correlation: 0.68 }
        ],
        recommendations: [
          'Consider adding polynomial features for non-linear relationships',
          'Explore time-based aggregations for temporal patterns',
          'Investigate domain-specific transformations'
        ],
        quality_issues: [
          {
            feature: 'age',
            issue: 'High number of outliers detected',
            severity: 'medium'
          }
        ]
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    }
  ], []);

  // Use real data quality from backend or fallback
  const dataQuality = useMemo(() => 
    dataQualityData?.quality_assessment || {
      overall_score: 0,
      completeness: 0,
      consistency: 0,
      validity: 0,
      accuracy: 0,
      uniqueness: 0,
      timeliness: 0,
      issues: [],
      trends: []
    }, 
    [dataQualityData]
  );

  // Effects
  useEffect(() => {
    fetchMLModels();
    fetchDatasets();
  }, [fetchMLModels, fetchDatasets]);

  // Computed values using real backend data
  const filteredEngineering = useMemo(() => {
    const dataToFilter = featureEngineering.length > 0 ? featureEngineering : fallbackFeatureEngineering;
    let filtered = dataToFilter;

    if (engineeringFilters.status !== 'all') {
      filtered = filtered.filter(fe => fe.status === engineeringFilters.status);
    }
    if (engineeringFilters.dataset !== 'all') {
      filtered = filtered.filter(fe => fe.dataset_id === engineeringFilters.dataset);
    }
    if (searchQuery) {
      filtered = filtered.filter(fe =>
        fe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fe.features.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'quality':
          const aQuality = a.performance.quality_improvement;
          const bQuality = b.performance.quality_improvement;
          comparison = aQuality - bQuality;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [featureEngineering, fallbackFeatureEngineering, engineeringFilters, searchQuery, sortBy, sortOrder]);

  const filteredFeatures = useMemo(() => {
    if (!selectedEngineering) return [];
    
    let filtered = selectedEngineering.features;

    if (featureFilters.type !== 'all') {
      filtered = filtered.filter(f => f.type === featureFilters.type);
    }
    if (featureFilters.source !== 'all') {
      filtered = filtered.filter(f => f.source === featureFilters.source);
    }
    if (featureFilters.status !== 'all') {
      filtered = filtered.filter(f => f.status === featureFilters.status);
    }

    return filtered;
  }, [selectedEngineering, featureFilters]);

  const featureStats = useMemo(() => {
    if (!selectedEngineering) return null;

    const features = selectedEngineering.features;
    const total = features.length;
    const engineered = features.filter(f => f.source === 'engineered').length;
    const synthetic = features.filter(f => f.source === 'synthetic').length;
    const avgQuality = features.reduce((sum, f) => sum + f.statistics.quality_score, 0) / total;

    return { total, engineered, synthetic, avgQuality };
  }, [selectedEngineering]);

  // Event handlers
  const handleCreateEngineering = useCallback(async (engineeringData: any) => {
    try {
      await createFeatureEngineering(engineeringData);
      setShowCreateDialog(false);
      addNotification({
        type: 'success',
        title: 'Feature Engineering Created',
        message: `Feature engineering project "${engineeringData.name}" has been created successfully.`,
        category: 'feature_engineering'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create feature engineering project.',
        category: 'feature_engineering'
      });
    }
  }, [createFeatureEngineering, addNotification]);

  const handleRunEngineering = useCallback(async (engineeringId: string) => {
    try {
      await runFeatureEngineering(engineeringId);
      addNotification({
        type: 'success',
        title: 'Feature Engineering Started',
        message: 'Feature engineering pipeline has been started.',
        category: 'feature_engineering'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Execution Failed',
        message: 'Failed to start feature engineering pipeline.',
        category: 'feature_engineering'
      });
    }
  }, [runFeatureEngineering, addNotification]);

  const handleGenerateFeatures = useCallback(async () => {
    try {
      await generateAutoFeatures(selectedEngineering?.id || '', {
        strategy: 'ai_powered',
        target_features: 20,
        constraints: {
          max_complexity: 3,
          interpretability_threshold: 0.7
        }
      });
      addNotification({
        type: 'success',
        title: 'Auto-Generation Started',
        message: 'AI-powered feature generation has been initiated.',
        category: 'feature_engineering'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to start automatic feature generation.',
        category: 'feature_engineering'
      });
    }
  }, [selectedEngineering, generateAutoFeatures, addNotification]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
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
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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

  // Render create engineering dialog
  const renderCreateEngineeringDialog = () => (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Create Feature Engineering Project
          </DialogTitle>
          <DialogDescription>
            Set up a new feature engineering project to transform and enhance your data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dataset-select">Source Dataset</Label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets?.map(dataset => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.records?.toLocaleString()} records)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe the feature engineering objectives"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="execution-mode">Execution Mode</Label>
                  <Select value={executionMode} onValueChange={(value: any) => setExecutionMode(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pipeline-mode">Pipeline Mode</Label>
                  <Select value={pipelineMode} onValueChange={(value: any) => setPipelineMode(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual Designer</SelectItem>
                      <SelectItem value="code">Code-First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-generation">Enable Auto-Generation</Label>
                    <p className="text-sm text-gray-600">Automatically generate new features using AI</p>
                  </div>
                  <Switch
                    id="auto-generation"
                    checked={autoGeneration}
                    onCheckedChange={setAutoGeneration}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="real-time-validation">Real-time Validation</Label>
                    <p className="text-sm text-gray-600">Validate features as they are created</p>
                  </div>
                  <Switch
                    id="real-time-validation"
                    checked={realTimeValidation}
                    onCheckedChange={setRealTimeValidation}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Generation Settings */}
          {autoGeneration && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Generation Strategy</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="outline" size="sm">Basic</Button>
                    <Button variant="outline" size="sm">Advanced</Button>
                    <Button variant="default" size="sm">AI-Powered</Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Max Features</Label>
                    <Input type="number" defaultValue="20" className="mt-1" />
                  </div>
                  <div>
                    <Label>Max Complexity</Label>
                    <Input type="number" defaultValue="3" className="mt-1" />
                  </div>
                  <div>
                    <Label>Interpretability (0-1)</Label>
                    <Input type="number" step="0.1" defaultValue="0.7" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleCreateEngineering({})}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render feature details dialog
  const renderFeatureDialog = () => (
    <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Binary className="h-5 w-5" />
            Feature Details - {selectedFeature?.name}
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis and configuration for this feature.
          </DialogDescription>
        </DialogHeader>

        {selectedFeature && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="transformations">Transformations</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Type</span>
                    </div>
                    <Badge className="mt-2" variant="outline">
                      {selectedFeature.type}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Source</span>
                    </div>
                    <Badge className="mt-2" variant="outline">
                      {selectedFeature.source}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Quality Score</span>
                    </div>
                    <p className={`text-lg font-semibold mt-1 ${getQualityColor(selectedFeature.statistics.quality_score)}`}>
                      {(selectedFeature.statistics.quality_score * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Importance</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedFeature.statistics.importance_score?.toFixed(3) || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Basic Properties</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Data Type:</span>
                          <span className="font-medium">{selectedFeature.dataType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unique Values:</span>
                          <span className="font-medium">{selectedFeature.statistics.unique_values?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Missing Values:</span>
                          <span className="font-medium">{selectedFeature.statistics.missing_values}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{selectedFeature.metadata.version}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Dependencies</h4>
                      <div className="space-y-2">
                        {selectedFeature.dependencies.length > 0 ? (
                          selectedFeature.dependencies.map(dep => (
                            <Badge key={dep} variant="outline">{dep}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">No dependencies</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeature.metadata.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Descriptive Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedFeature.type === 'numerical' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>Mean:</span>
                            <span className="font-medium">{selectedFeature.statistics.mean?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Median:</span>
                            <span className="font-medium">{selectedFeature.statistics.median?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Std Dev:</span>
                            <span className="font-medium">{selectedFeature.statistics.std?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Range:</span>
                            <span className="font-medium">
                              {selectedFeature.statistics.min?.toFixed(2)} - {selectedFeature.statistics.max?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { range: '0-25%', count: 150 },
                          { range: '25-50%', count: 300 },
                          { range: '50-75%', count: 250 },
                          { range: '75-100%', count: 200 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Completeness</span>
                        <span className="text-sm">
                          {((1 - selectedFeature.statistics.missing_values / 1000) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(1 - selectedFeature.statistics.missing_values / 1000) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Uniqueness</span>
                        <span className="text-sm">
                          {((selectedFeature.statistics.unique_values || 0) / 1000 * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(selectedFeature.statistics.unique_values || 0) / 1000 * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Quality</span>
                        <span className="text-sm">{(selectedFeature.statistics.quality_score * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={selectedFeature.statistics.quality_score * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transformations" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Applied Transformations</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transformation
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedFeature.transformations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedFeature.transformations.map((transform, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{transform.method}</h4>
                            <Badge variant="outline">{transform.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{transform.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Execution: {transform.performance_impact.execution_time}ms</span>
                            <span>Memory: {transform.performance_impact.memory_usage}MB</span>
                            <span>Improvement: +{(transform.performance_impact.improvement_score * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No transformations applied yet</p>
                      <Button variant="outline" className="mt-2">
                        Suggest Transformations
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Validation Rules</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${selectedFeature.validation.validation_status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedFeature.validation.validation_status}
                      </Badge>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedFeature.validation.rules.length > 0 ? (
                    <div className="space-y-3">
                      {selectedFeature.validation.rules.map((rule, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant="outline">{rule.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rule.message}</p>
                          <div className="text-xs text-gray-500">
                            Condition: {rule.condition} | Threshold: {rule.threshold}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No validation rules configured</p>
                      <Button variant="outline" className="mt-2">
                        Add Default Rules
                      </Button>
                    </div>
                  )}

                  {selectedFeature.validation.issues.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">Validation Issues</h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {selectedFeature.validation.issues.map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedFeature.businessContext.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Business Value</Label>
                      <Badge className={`mt-1 ${
                        selectedFeature.businessContext.business_value === 'high' ? 'bg-green-100 text-green-800' :
                        selectedFeature.businessContext.business_value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedFeature.businessContext.business_value}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stakeholder</Label>
                      <p className="text-sm text-gray-700 mt-1">{selectedFeature.businessContext.stakeholder}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Use Cases</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedFeature.businessContext.use_cases.map((useCase, idx) => (
                        <Badge key={idx} variant="secondary">{useCase}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
            Close
          </Button>
          <Button>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Feature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // RBAC Permission Check
  if (!rbac.classificationPermissions.canFeatureEngineering) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to access Feature Engineering.</p>
          <p className="text-sm text-gray-500 mt-2">Contact your administrator to request access.</p>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <FlaskConical className="h-8 w-8 text-white" />
              </div>
              Feature Engineering Studio
            </h1>
            <p className="text-muted-foreground mt-2">
              Advanced feature engineering and data transformation workspace with AI-powered insights
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={realTimeValidation}
                onCheckedChange={setRealTimeValidation}
                id="real-time-validation"
              />
              <Label htmlFor="real-time-validation" className="text-sm">Real-time validation</Label>
            </div>
            
            <rbac.PermissionGuard permission={rbac.classificationPermissions.canFeatureEngineering}>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </rbac.PermissionGuard>
          </div>
        </div>

        {/* Data Quality Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Data Quality Overview
              </CardTitle>
              <Badge className={`${dataQuality.overall_score >= 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {(dataQuality.overall_score * 100).toFixed(1)}% Quality Score
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              {[
                { label: 'Completeness', value: dataQuality.completeness, icon: CheckCircle },
                { label: 'Consistency', value: dataQuality.consistency, icon: Target },
                { label: 'Validity', value: dataQuality.validity, icon: Shield },
                { label: 'Accuracy', value: dataQuality.accuracy, icon: Crosshair },
                { label: 'Uniqueness', value: dataQuality.uniqueness, icon: Star },
                { label: 'Timeliness', value: dataQuality.timeliness, icon: Clock }
              ].map((metric, idx) => (
                <div key={idx} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <metric.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                  <p className="text-lg font-bold text-blue-600">{(metric.value * 100).toFixed(0)}%</p>
                  <Progress value={metric.value * 100} className="h-1 mt-1" />
                </div>
              ))}
            </div>

            {dataQuality.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Quality Issues</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataQuality.issues.map((issue, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{issue.type}</span>
                        <Badge className={`${
                          issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{issue.count} issues in {issue.affected_features.length} features</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="studio">Studio</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
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
                <Button
                  variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('pipeline')}
                >
                  <Workflow className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="studio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feature Engineering Workspace */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5" />
                      Feature Engineering Workspace
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Select value="python">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="sql">SQL</SelectItem>
                            <SelectItem value="scala">Scala</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Execute
                        </Button>
                      </div>

                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                        <div className="space-y-2">
                          <div># Feature Engineering Code</div>
                          <div>import pandas as pd</div>
                          <div>import numpy as np</div>
                          <div>from sklearn.preprocessing import StandardScaler</div>
                          <div></div>
                          <div># Load dataset</div>
                          <div>df = pd.read_csv('customer_data.csv')</div>
                          <div></div>
                          <div># Generate interaction features</div>
                          <div>df['age_income_interaction'] = df['age'] * np.log(df['income'] + 1)</div>
                          <div></div>
                          <div># Create time-based features</div>
                          <div>df['days_since_last_purchase'] = (pd.Timestamp.now() - df['last_purchase_date']).dt.days</div>
                          <div></div>
                          <div># Categorical encoding</div>
                          <div>df = pd.get_dummies(df, columns=['category', 'region'])</div>
                          <div></div>
                          <div># Feature scaling</div>
                          <div>scaler = StandardScaler()</div>
                          <div>numerical_cols = ['age', 'income', 'age_income_interaction']</div>
                          <div>df[numerical_cols] = scaler.fit_transform(df[numerical_cols])</div>
                          <div></div>
                          <div className="text-yellow-400"># Output: 45 features generated successfully</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI-Powered Feature Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Generation Strategy</Label>
                          <Select defaultValue="ai_powered">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic Combinations</SelectItem>
                              <SelectItem value="advanced">Advanced Transformations</SelectItem>
                              <SelectItem value="ai_powered">AI-Powered Discovery</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Target Features</Label>
                          <Input type="number" defaultValue="20" className="mt-1" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Interpretability Threshold</Label>
                        <Slider defaultValue={[70]} max={100} min={0} step={5} />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Less Interpretable</span>
                          <span>More Interpretable</span>
                        </div>
                      </div>

                      <Button onClick={handleGenerateFeatures} className="w-full">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Features
                      </Button>

                      {selectedEngineering?.auto_generation.generated_features && (
                        <div className="mt-4 space-y-2">
                          <h5 className="font-medium">Generated Features Preview</h5>
                          {selectedEngineering.auto_generation.generated_features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">{feature.name}</span>
                                <Badge variant="outline">
                                  Importance: {(feature.importance * 100).toFixed(0)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 font-mono">{feature.formula}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Statistics & Tools */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {featureStats && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{featureStats.total}</p>
                            <p className="text-sm text-gray-600">Total Features</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{featureStats.engineered}</p>
                            <p className="text-sm text-gray-600">Engineered</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Average Quality</span>
                            <span className="text-sm">{(featureStats.avgQuality * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={featureStats.avgQuality * 100} className="h-2" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Dataset
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Features
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Create Branch
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Project
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feature Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      'Time-based aggregations',
                      'Interaction features',
                      'Polynomial features',
                      'Text embeddings',
                      'Category encodings'
                    ].map((template, idx) => (
                      <Button key={idx} variant="ghost" className="w-full justify-start text-sm">
                        <Binary className="h-3 w-3 mr-2" />
                        {template}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={engineeringFilters.status} onValueChange={(value) => 
                    setEngineeringFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={engineeringFilters.dataset} onValueChange={(value) => 
                    setEngineeringFilters(prev => ({ ...prev, dataset: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Datasets</SelectItem>
                      {datasets?.map(dataset => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Projects Table */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Engineering Projects</CardTitle>
                <CardDescription>
                  Manage and monitor your feature engineering workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEngineering.map((project) => {
                      const dataset = datasets?.find(d => d.id === project.dataset_id);
                      
                      return (
                        <TableRow 
                          key={project.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedEngineering(project)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{project.name}</p>
                              <p className="text-sm text-gray-500">
                                Created {new Date(project.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-blue-500" />
                              {dataset?.name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(project.status)}
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-semibold">{project.performance.total_features}</p>
                              <p className="text-xs text-gray-500">
                                {project.performance.engineered_features} engineered
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className={`font-semibold ${getQualityColor(project.performance.quality_improvement)}`}>
                                +{(project.performance.quality_improvement * 100).toFixed(1)}%
                              </p>
                              <Progress 
                                value={(project.performance.quality_improvement + 1) * 50} 
                                className="h-1 mt-1" 
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium">
                                {formatDuration(project.performance.execution_time)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {project.performance.memory_usage.toFixed(1)} GB
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
                                {project.status === 'draft' && (
                                  <DropdownMenuItem onClick={() => handleRunEngineering(project.id)}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Run Pipeline
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Clone Project
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Features
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
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {selectedEngineering ? (
              <>
                {/* Feature Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search features..."
                          className="pl-10"
                        />
                      </div>

                      <Select value={featureFilters.type} onValueChange={(value) => 
                        setFeatureFilters(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="numerical">Numerical</SelectItem>
                          <SelectItem value="categorical">Categorical</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="datetime">DateTime</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={featureFilters.source} onValueChange={(value) => 
                        setFeatureFilters(prev => ({ ...prev, source: value }))
                      }>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="raw">Raw</SelectItem>
                          <SelectItem value="engineered">Engineered</SelectItem>
                          <SelectItem value="synthetic">Synthetic</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFeatures.map((feature) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          setSelectedFeature(feature);
                          setShowFeatureDialog(true);
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{feature.type}</Badge>
                              <Badge className={`${
                                feature.source === 'engineered' ? 'bg-purple-100 text-purple-800' :
                                feature.source === 'synthetic' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {feature.source}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Quality Score</span>
                              <span className={getQualityColor(feature.statistics.quality_score)}>
                                {(feature.statistics.quality_score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={feature.statistics.quality_score * 100} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium">Missing Values</p>
                              <p className="text-red-600">{feature.statistics.missing_values}</p>
                            </div>
                            <div>
                              <p className="font-medium">Unique Values</p>
                              <p className="text-blue-600">{feature.statistics.unique_values?.toLocaleString()}</p>
                            </div>
                          </div>

                          {feature.statistics.importance_score && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Importance</span>
                                <span>{(feature.statistics.importance_score * 100).toFixed(1)}%</span>
                              </div>
                              <Progress value={feature.statistics.importance_score * 100} className="h-2" />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <div className="flex items-center gap-1">
                              {feature.metadata.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FlaskConical className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Selected</h3>
                  <p className="text-gray-600 mb-4">
                    Select a feature engineering project from the Projects tab to view its features.
                  </p>
                  <Button onClick={() => setActiveTab('projects')}>
                    View Projects
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {selectedEngineering && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feature Importance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={selectedEngineering.insights.feature_importance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="importance" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feature Correlations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedEngineering.insights.correlations.map((corr, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{corr.feature1} ↔ {corr.feature2}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              Math.abs(corr.correlation) > 0.7 ? 'text-red-600' :
                              Math.abs(corr.correlation) > 0.4 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {corr.correlation.toFixed(3)}
                            </span>
                            <Progress 
                              value={Math.abs(corr.correlation) * 100} 
                              className="h-2 w-20" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedEngineering.insights.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Quality Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedEngineering.insights.quality_issues.map((issue, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-4 w-4 ${
                              issue.severity === 'high' ? 'text-red-500' :
                              issue.severity === 'medium' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`} />
                            <div>
                              <p className="font-medium text-sm">{issue.feature}</p>
                              <p className="text-xs text-gray-600">{issue.issue}</p>
                            </div>
                          </div>
                          <Badge className={`${
                            issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {issue.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {renderCreateEngineeringDialog()}
        {renderFeatureDialog()}
      </div>
    </TooltipProvider>
  );
};

export default FeatureEngineeringStudio;