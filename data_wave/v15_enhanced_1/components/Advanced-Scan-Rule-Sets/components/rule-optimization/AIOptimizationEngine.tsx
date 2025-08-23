'use client';

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Brain, Zap, TrendingUp, Target, Settings, Play, Pause, RotateCcw, Download, Upload, AlertTriangle, CheckCircle, XCircle, Clock, BarChart3, Activity, Cpu, Database, Network, HardDrive, Eye, EyeOff, Filter, Search, RefreshCw, Save, Share, FileText, MoreHorizontal, ChevronDown, ChevronRight, Info, Lightbulb, Sparkles, Gauge, Timer, Layers, GitBranch, Users, ShieldCheckIcon, Rocket, Award, LineChart, PieChart, BarChart2,  } from 'lucide-react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar, Area, AreaChart, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useOptimization } from '../../hooks/useOptimization';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useCollaboration } from '../../hooks/useCollaboration';

// Types
interface OptimizationModel {
  id: string;
  name: string;
  type: 'performance' | 'cost' | 'accuracy' | 'compliance' | 'resource';
  status: 'training' | 'ready' | 'optimizing' | 'error';
  accuracy: number;
  lastTrained: Date;
  predictions: number;
  confidence: number;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
  };
}

interface OptimizationJob {
  id: string;
  ruleId: string;
  ruleName: string;
  type: 'auto' | 'manual' | 'scheduled';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  improvements: {
    performance: number;
    cost: number;
    accuracy: number;
  };
  recommendations: OptimizationRecommendation[];
}

interface OptimizationRecommendation {
  id: string;
  type: 'performance' | 'cost' | 'accuracy' | 'resource' | 'pattern';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number;
  effort: number;
  confidence: number;
  estimatedSavings?: number;
  implementation: string;
  tags: string[];
}

interface MLModelConfig {
  algorithm: string;
  hyperparameters: Record<string, any>;
  features: string[];
  trainingData: {
    size: number;
    quality: number;
    coverage: number;
  };
  performance: {
    accuracy: number;
    speed: number;
    memory: number;
  };
}

interface OptimizationMetrics {
  overall: {
    improvementRate: number;
    costReduction: number;
    performanceGain: number;
    accuracyIncrease: number;
  };
  realtime: {
    cpuUsage: number;
    memoryUsage: number;
    throughput: number;
    latency: number;
  };
  historical: Array<{
    timestamp: Date;
    metric: string;
    value: number;
    target: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AIOptimizationEngine: React.FC = () => {
  // Hooks
  const { 
    models,
    jobs,
    recommendations,
    metrics,
    isOptimizing,
    startOptimization,
    stopOptimization,
    applyRecommendation,
    trainModel,
    deployModel,
    getOptimizationHistory,
    exportOptimizationReport,
    scheduleOptimization
  } = useOptimization();

  const {
    analyzeRuleComplexity,
    predictPerformance,
    suggestOptimizations,
    detectAnomalies,
    generateInsights
  } = useIntelligence();

  const { rules, getRuleMetrics } = useScanRules();
  const { notifyTeam } = useCollaboration();

  // State
  const [selectedModel, setSelectedModel] = useState<OptimizationModel | null>(null);
  const [selectedJob, setSelectedJob] = useState<OptimizationJob | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [optimizationConfig, setOptimizationConfig] = useState({
    autoOptimize: true,
    optimizationLevel: 'balanced',
    includeRules: [],
    excludeRules: [],
    constraints: {
      maxCostIncrease: 10,
      minAccuracy: 95,
      maxLatency: 100,
    },
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [modelConfig, setModelConfig] = useState<MLModelConfig>({
    algorithm: 'gradient-boosting',
    hyperparameters: {
      learning_rate: 0.1,
      max_depth: 6,
      n_estimators: 100,
      subsample: 0.8,
    },
    features: ['rule_complexity', 'data_volume', 'pattern_frequency', 'resource_usage'],
    trainingData: {
      size: 10000,
      quality: 0.95,
      coverage: 0.88,
    },
    performance: {
      accuracy: 0.94,
      speed: 150,
      memory: 256,
    },
  });

  // Computed values
  const filteredModels = useMemo(() => {
    return models?.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
      const matchesType = filterType === 'all' || model.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    }) || [];
  }, [models, searchTerm, filterStatus, filterType]);

  const filteredJobs = useMemo(() => {
    return jobs?.filter(job => {
      const matchesSearch = job.ruleName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      const matchesType = filterType === 'all' || job.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    }) || [];
  }, [jobs, searchTerm, filterStatus, filterType]);

  const prioritizedRecommendations = useMemo(() => {
    return recommendations?.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }) || [];
  }, [recommendations]);

  // Effects
  useEffect(() => {
    if (models?.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models]);

  useEffect(() => {
    if (jobs?.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs]);

  // Handlers
  const handleStartOptimization = useCallback(async (ruleIds: string[]) => {
    try {
      await startOptimization({
        ruleIds,
        config: optimizationConfig,
        modelId: selectedModel?.id,
      });
      notifyTeam('optimization_started', {
        ruleCount: ruleIds.length,
        modelName: selectedModel?.name,
      });
    } catch (error) {
      console.error('Failed to start optimization:', error);
    }
  }, [startOptimization, optimizationConfig, selectedModel, notifyTeam]);

  const handleApplyRecommendation = useCallback(async (recommendation: OptimizationRecommendation) => {
    try {
      await applyRecommendation(recommendation.id);
      notifyTeam('recommendation_applied', {
        title: recommendation.title,
        impact: recommendation.impact,
      });
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    }
  }, [applyRecommendation, notifyTeam]);

  const handleTrainModel = useCallback(async () => {
    if (!selectedModel) return;
    
    try {
      await trainModel(selectedModel.id, modelConfig);
      notifyTeam('model_training_started', {
        modelName: selectedModel.name,
        algorithm: modelConfig.algorithm,
      });
    } catch (error) {
      console.error('Failed to train model:', error);
    }
  }, [trainModel, selectedModel, modelConfig, notifyTeam]);

  const handleExportReport = useCallback(async () => {
    try {
      const report = await exportOptimizationReport({
        includeMetrics: true,
        includeRecommendations: true,
        includeHistory: true,
        format: 'pdf',
      });
      
      // ArrowDownTrayIcon report
      const url = URL.createObjectURL(new Blob([report], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimization-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }, [exportOptimizationReport]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'completed':
        return 'text-green-600';
      case 'training':
      case 'running':
      case 'optimizing':
        return 'text-blue-600';
      case 'error':
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
      case 'completed':
        return CheckCircle;
      case 'training':
      case 'running':
      case 'optimizing':
        return Activity;
      case 'error':
      case 'failed':
        return XCircle;
      case 'pending':
        return Clock;
      default:
        return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const chartData = useMemo(() => {
    if (!metrics?.historical) return [];
    return metrics.historical.map(item => ({
      time: item.timestamp.toLocaleTimeString(),
      value: item.value,
      target: item.target,
      metric: item.metric,
    }));
  }, [metrics]);

  const performanceData = useMemo(() => {
    if (!models) return [];
    return models.map(model => ({
      name: model.name,
      accuracy: model.accuracy,
      predictions: model.predictions,
      confidence: model.confidence,
    }));
  }, [models]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AI Optimization Engine
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Advanced machine learning optimization and performance tuning
                  </p>
                </div>
              </div>
              {isOptimizing && (
                <Badge variant="secondary" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Optimizing
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Gauge className="h-4 w-4" />
                <span>
                  {metrics?.overall.improvementRate.toFixed(1)}% improvement rate
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReport}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Actions
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Optimization Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowAdvancedSettings(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleTrainModel}>
                    <Brain className="h-4 w-4 mr-2" />
                    Train Model
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Models
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share Results
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Models</span>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span>Recommendations</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <LineChart className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overall Improvement
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      +{metrics?.overall.improvementRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      vs. baseline performance
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cost Reduction
                    </CardTitle>
                    <Target className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ${metrics?.overall.costReduction.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      monthly savings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Models
                    </CardTitle>
                    <Brain className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {models?.filter(m => m.status === 'ready').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ready for optimization
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Running Jobs
                    </CardTitle>
                    <Activity className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {jobs?.filter(j => j.status === 'running').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      optimization in progress
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Real-time Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>{metrics?.realtime.cpuUsage}%</span>
                        </div>
                        <Progress value={metrics?.realtime.cpuUsage} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Memory</span>
                          <span>{metrics?.realtime.memoryUsage}%</span>
                        </div>
                        <Progress value={metrics?.realtime.memoryUsage} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Throughput</span>
                          <span>{metrics?.realtime.throughput}/s</span>
                        </div>
                        <Progress value={(metrics?.realtime.throughput || 0) / 10} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Latency</span>
                          <span>{metrics?.realtime.latency}ms</span>
                        </div>
                        <Progress value={100 - (metrics?.realtime.latency || 0)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LineChart className="h-5 w-5" />
                      <span>Performance Trends</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent Optimization Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs?.slice(0, 5).map((job) => {
                      const StatusIcon = getStatusIcon(job.status);
                      return (
                        <div key={job.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(job.status)}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{job.ruleName}</h4>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {job.type} optimization • {job.improvements.performance}% performance gain
                            </p>
                            {job.status === 'running' && (
                              <div className="mt-2">
                                <Progress value={job.progress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Models Tab */}
            <TabsContent value="models" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search models..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="optimizing">Optimizing</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleTrainModel}
                  disabled={!selectedModel}
                  className="flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>Train New Model</span>
                </Button>
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model) => {
                  const StatusIcon = getStatusIcon(model.status);
                  return (
                    <Card 
                      key={model.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedModel?.id === model.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(model.status)}`} />
                        </div>
                        <CardDescription>
                          Type: {model.type} • {model.predictions.toLocaleString()} predictions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Accuracy</div>
                            <div className="text-2xl font-bold text-green-600">
                              {(model.accuracy * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Confidence</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {(model.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Precision:</span>
                            <span className="font-medium">{(model.metrics.precision * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recall:</span>
                            <span className="font-medium">{(model.metrics.recall * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>F1 Score:</span>
                            <span className="font-medium">{model.metrics.f1Score.toFixed(3)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>AUC:</span>
                            <span className="font-medium">{model.metrics.auc.toFixed(3)}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Last trained: {model.lastTrained.toLocaleDateString()}</span>
                          <Badge variant="outline">{model.type}</Badge>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          {model.status === 'ready' && (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                deployModel(model.id);
                              }}
                            >
                              <Rocket className="h-3 w-3 mr-1" />
                              Deploy
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Model Performance Chart */}
              {selectedModel && (
                <Card>
                  <CardHeader>
                    <CardTitle>Model Performance Analysis: {selectedModel.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="accuracy" fill="#8884d8" />
                        <Bar dataKey="confidence" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-6">
              {/* Jobs List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Optimization Jobs</CardTitle>
                    <Button
                      onClick={() => handleStartOptimization(rules?.map(r => r.id) || [])}
                      className="flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Optimization</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredJobs.map((job) => {
                      const StatusIcon = getStatusIcon(job.status);
                      return (
                        <div 
                          key={job.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => setSelectedJob(job)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <StatusIcon className={`h-5 w-5 ${getStatusColor(job.status)}`} />
                              <div>
                                <h4 className="font-semibold">{job.ruleName}</h4>
                                <p className="text-sm text-gray-500">
                                  {job.type} optimization • Started {job.startTime.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                              {job.status === 'running' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    stopOptimization(job.id);
                                  }}
                                >
                                  <Pause className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {job.status === 'running' && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} className="h-2" />
                              {job.estimatedCompletion && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ETA: {job.estimatedCompletion.toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium text-green-600">
                                +{job.improvements.performance}%
                              </div>
                              <div className="text-gray-500">Performance</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-blue-600">
                                -{job.improvements.cost}%
                              </div>
                              <div className="text-gray-500">Cost</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-purple-600">
                                +{job.improvements.accuracy}%
                              </div>
                              <div className="text-gray-500">Accuracy</div>
                            </div>
                          </div>

                          {job.recommendations.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-sm text-gray-600 mb-2">
                                {job.recommendations.length} recommendations generated
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {job.recommendations.slice(0, 3).map((rec) => (
                                  <Badge key={rec.id} variant="secondary" className="text-xs">
                                    {rec.type}
                                  </Badge>
                                ))}
                                {job.recommendations.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.recommendations.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {prioritizedRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {recommendation.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                            <Badge variant="outline">
                              {recommendation.type}
                            </Badge>
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Confidence: {(recommendation.confidence * 100).toFixed(1)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription>{recommendation.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Impact</div>
                          <div className="text-lg font-bold text-green-600">
                            +{recommendation.impact}%
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Effort</div>
                          <div className="text-lg font-bold text-blue-600">
                            {recommendation.effort}/10
                          </div>
                        </div>
                      </div>

                      {recommendation.estimatedSavings && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-sm font-medium text-green-800 dark:text-green-200">
                            Estimated Savings
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            ${recommendation.estimatedSavings.toLocaleString()}/month
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Implementation</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {recommendation.implementation}
                        </p>
                      </div>

                      {recommendation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recommendation.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Button
                        onClick={() => handleApplyRecommendation(recommendation)}
                        className="w-full"
                        disabled={recommendation.confidence < 0.7}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Apply Recommendation
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="value" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Model Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Model Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={models?.map(model => ({ name: model.type, value: 1 })) || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {models?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {metrics?.overall.performanceGain.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Performance Gain</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          ${metrics?.overall.costReduction.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Cost Reduction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {metrics?.overall.accuracyIncrease.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Accuracy Increase</div>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart data={chartData}>
                        <CartesianGrid />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Scatter name="Performance" dataKey="value" fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-optimize">Auto Optimization</Label>
                      <Switch
                        id="auto-optimize"
                        checked={optimizationConfig.autoOptimize}
                        onCheckedChange={(checked) =>
                          setOptimizationConfig(prev => ({ ...prev, autoOptimize: checked }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Optimization Level</Label>
                      <Select
                        value={optimizationConfig.optimizationLevel}
                        onValueChange={(value) =>
                          setOptimizationConfig(prev => ({ ...prev, optimizationLevel: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label>Constraints</Label>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Max Cost Increase</span>
                          <span>{optimizationConfig.constraints.maxCostIncrease}%</span>
                        </div>
                        <Slider
                          value={[optimizationConfig.constraints.maxCostIncrease]}
                          onValueChange={([value]) =>
                            setOptimizationConfig(prev => ({
                              ...prev,
                              constraints: { ...prev.constraints, maxCostIncrease: value }
                            }))
                          }
                          max={50}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Min Accuracy</span>
                          <span>{optimizationConfig.constraints.minAccuracy}%</span>
                        </div>
                        <Slider
                          value={[optimizationConfig.constraints.minAccuracy]}
                          onValueChange={([value]) =>
                            setOptimizationConfig(prev => ({
                              ...prev,
                              constraints: { ...prev.constraints, minAccuracy: value }
                            }))
                          }
                          max={100}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Max Latency</span>
                          <span>{optimizationConfig.constraints.maxLatency}ms</span>
                        </div>
                        <Slider
                          value={[optimizationConfig.constraints.maxLatency]}
                          onValueChange={([value]) =>
                            setOptimizationConfig(prev => ({
                              ...prev,
                              constraints: { ...prev.constraints, maxLatency: value }
                            }))
                          }
                          max={1000}
                          step={10}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Model Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Algorithm</Label>
                      <Select
                        value={modelConfig.algorithm}
                        onValueChange={(value) =>
                          setModelConfig(prev => ({ ...prev, algorithm: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gradient-boosting">Gradient Boosting</SelectItem>
                          <SelectItem value="random-forest">Random Forest</SelectItem>
                          <SelectItem value="neural-network">Neural Network</SelectItem>
                          <SelectItem value="svm">Support Vector Machine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label>Hyperparameters</Label>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Learning Rate</span>
                          <span>{modelConfig.hyperparameters.learning_rate}</span>
                        </div>
                        <Slider
                          value={[modelConfig.hyperparameters.learning_rate]}
                          onValueChange={([value]) =>
                            setModelConfig(prev => ({
                              ...prev,
                              hyperparameters: { ...prev.hyperparameters, learning_rate: value }
                            }))
                          }
                          max={1}
                          min={0.01}
                          step={0.01}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Max Depth</span>
                          <span>{modelConfig.hyperparameters.max_depth}</span>
                        </div>
                        <Slider
                          value={[modelConfig.hyperparameters.max_depth]}
                          onValueChange={([value]) =>
                            setModelConfig(prev => ({
                              ...prev,
                              hyperparameters: { ...prev.hyperparameters, max_depth: value }
                            }))
                          }
                          max={20}
                          min={1}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>N Estimators</span>
                          <span>{modelConfig.hyperparameters.n_estimators}</span>
                        </div>
                        <Slider
                          value={[modelConfig.hyperparameters.n_estimators]}
                          onValueChange={([value]) =>
                            setModelConfig(prev => ({
                              ...prev,
                              hyperparameters: { ...prev.hyperparameters, n_estimators: value }
                            }))
                          }
                          max={500}
                          min={10}
                          step={10}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleTrainModel} className="flex-1">
                        <Brain className="h-4 w-4 mr-2" />
                        Train Model
                      </Button>
                      <Button variant="outline" onClick={() => setShowAdvancedSettings(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Save Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Import Config</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export Config</span>
                    </Button>
                    <Button className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save Configuration</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Advanced Settings Dialog */}
        <Dialog open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Advanced Model Configuration</DialogTitle>
              <DialogDescription>
                Configure advanced settings for machine learning models
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <Label>Feature Selection</Label>
                {modelConfig.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span className="text-sm">{feature.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Training Data Size</Label>
                  <Input
                    type="number"
                    value={modelConfig.trainingData.size}
                    onChange={(e) =>
                      setModelConfig(prev => ({
                        ...prev,
                        trainingData: { ...prev.trainingData, size: parseInt(e.target.value) }
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Quality Threshold</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={modelConfig.trainingData.quality}
                    onChange={(e) =>
                      setModelConfig(prev => ({
                        ...prev,
                        trainingData: { ...prev.trainingData, quality: parseFloat(e.target.value) }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAdvancedSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAdvancedSettings(false)}>
                Apply Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};