'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, TrendingDown, Target, Activity, BarChart3, LineChart, PieChart, DollarSign, Clock, Cpu, HardDrive, Network, Database, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Play, Pause, Settings, Download, Upload, Save, Eye, EyeOff, Filter, Search, MoreHorizontal, X, Plus, Minus, Edit3, Lightbulb, Layers, Route, MapPin, Compass, Navigation, Microscope, Gauge, Thermometer, Volume2, Wifi, Battery, Power } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';

// Advanced Chart components
import { 
  LineChart as RechartsLineChart, 
  BarChart as RechartsBarChart, 
  AreaChart, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  Line, 
  Bar, 
  Area, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types from racine-core.types
import { 
  WorkflowOptimization,
  PerformanceMetrics,
  CostAnalysis,
  ResourceOptimization,
  AIRecommendation,
  PredictiveAnalytics,
  WorkflowBottleneck,
  OptimizationGoal,
  MLModelPrediction,
  CostOptimizationStrategy,
  PerformanceBenchmark,
  ResourceAllocation,
  WorkflowStep,
  ExecutionPattern,
  OptimizationHistory
} from '../../types/racine-core.types';

// AI Optimization Categories with Advanced Metrics
const OPTIMIZATION_CATEGORIES = {
  PERFORMANCE: {
    id: 'performance',
    name: 'Performance Optimization',
    icon: Zap,
    color: '#10b981',
    gradient: 'from-emerald-400 to-emerald-600',
    description: 'Optimize execution speed, throughput, and response times',
    metrics: ['execution_time', 'throughput', 'latency', 'queue_time', 'processing_speed'],
    typical_improvement: '25-40%',
    complexity: 'medium',
    ai_models: ['regression', 'time_series', 'clustering']
  },
  COST: {
    id: 'cost',
    name: 'Cost Optimization',
    icon: DollarSign,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600',
    description: 'Reduce operational costs and resource consumption',
    metrics: ['compute_cost', 'storage_cost', 'network_cost', 'total_cost', 'cost_per_execution'],
    typical_improvement: '15-35%',
    complexity: 'high',
    ai_models: ['linear_programming', 'optimization', 'forecasting']
  },
  RESOURCE: {
    id: 'resource',
    name: 'Resource Optimization',
    icon: Cpu,
    color: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600',
    description: 'Optimize CPU, memory, storage, and network usage',
    metrics: ['cpu_utilization', 'memory_usage', 'storage_io', 'network_bandwidth', 'resource_efficiency'],
    typical_improvement: '20-50%',
    complexity: 'high',
    ai_models: ['reinforcement_learning', 'neural_network', 'genetic_algorithm']
  },
  RELIABILITY: {
    id: 'reliability',
    name: 'Reliability Optimization',
    icon: Shield,
    color: '#ef4444',
    gradient: 'from-red-400 to-red-600',
    description: 'Improve success rates, reduce failures, and enhance stability',
    metrics: ['success_rate', 'failure_rate', 'mtbf', 'recovery_time', 'availability'],
    typical_improvement: '10-25%',
    complexity: 'medium',
    ai_models: ['anomaly_detection', 'classification', 'survival_analysis']
  },
  SCALABILITY: {
    id: 'scalability',
    name: 'Scalability Optimization',
    icon: TrendingUp,
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-violet-600',
    description: 'Optimize for variable workloads and horizontal scaling',
    metrics: ['scalability_factor', 'load_capacity', 'elasticity', 'auto_scaling_efficiency'],
    typical_improvement: '30-60%',
    complexity: 'high',
    ai_models: ['predictive_scaling', 'load_forecasting', 'capacity_planning']
  },
  QUALITY: {
    id: 'quality',
    name: 'Quality Optimization',
    icon: Target,
    color: '#06b6d4',
    gradient: 'from-cyan-400 to-cyan-600',
    description: 'Improve data quality, accuracy, and completeness',
    metrics: ['data_quality_score', 'accuracy', 'completeness', 'consistency', 'validity'],
    typical_improvement: '15-30%',
    complexity: 'medium',
    ai_models: ['quality_scoring', 'data_profiling', 'anomaly_detection']
  }
};

// ML Model Types for Optimization
const ML_MODEL_TYPES = {
  REGRESSION: {
    name: 'Linear Regression',
    description: 'Predict continuous values like execution time and cost',
    use_cases: ['performance_prediction', 'cost_forecasting', 'resource_estimation'],
    accuracy_range: '85-95%',
    training_time: 'Fast',
    interpretability: 'High'
  },
  NEURAL_NETWORK: {
    name: 'Neural Network',
    description: 'Deep learning for complex pattern recognition',
    use_cases: ['complex_optimization', 'multi_objective', 'pattern_recognition'],
    accuracy_range: '90-98%',
    training_time: 'Slow',
    interpretability: 'Low'
  },
  REINFORCEMENT_LEARNING: {
    name: 'Reinforcement Learning',
    description: 'Learn optimal policies through trial and error',
    use_cases: ['resource_allocation', 'scheduling', 'adaptive_optimization'],
    accuracy_range: '80-95%',
    training_time: 'Very Slow',
    interpretability: 'Medium'
  },
  TIME_SERIES: {
    name: 'Time Series Analysis',
    description: 'Analyze temporal patterns and trends',
    use_cases: ['trend_analysis', 'seasonal_patterns', 'forecasting'],
    accuracy_range: '85-92%',
    training_time: 'Medium',
    interpretability: 'High'
  },
  CLUSTERING: {
    name: 'Clustering',
    description: 'Group similar workflows and patterns',
    use_cases: ['workflow_classification', 'pattern_discovery', 'anomaly_detection'],
    accuracy_range: '75-90%',
    training_time: 'Fast',
    interpretability: 'Medium'
  },
  GENETIC_ALGORITHM: {
    name: 'Genetic Algorithm',
    description: 'Evolutionary optimization for complex problems',
    use_cases: ['multi_objective_optimization', 'parameter_tuning', 'configuration_optimization'],
    accuracy_range: '80-95%',
    training_time: 'Medium',
    interpretability: 'Low'
  }
};

// Optimization Goals with Priority Levels
const OPTIMIZATION_GOALS = {
  MINIMIZE_COST: {
    id: 'minimize_cost',
    name: 'Minimize Cost',
    description: 'Reduce operational and resource costs',
    priority: 'high',
    metrics: ['total_cost', 'cost_per_execution', 'resource_cost'],
    target_improvement: 20
  },
  MAXIMIZE_PERFORMANCE: {
    id: 'maximize_performance',
    name: 'Maximize Performance',
    description: 'Improve execution speed and throughput',
    priority: 'high',
    metrics: ['execution_time', 'throughput', 'response_time'],
    target_improvement: 30
  },
  OPTIMIZE_RESOURCE_USAGE: {
    id: 'optimize_resource_usage',
    name: 'Optimize Resource Usage',
    description: 'Efficient utilization of compute resources',
    priority: 'medium',
    metrics: ['cpu_utilization', 'memory_efficiency', 'storage_optimization'],
    target_improvement: 25
  },
  IMPROVE_RELIABILITY: {
    id: 'improve_reliability',
    name: 'Improve Reliability',
    description: 'Increase success rates and reduce failures',
    priority: 'high',
    metrics: ['success_rate', 'error_rate', 'availability'],
    target_improvement: 15
  },
  ENHANCE_SCALABILITY: {
    id: 'enhance_scalability',
    name: 'Enhance Scalability',
    description: 'Better handling of variable workloads',
    priority: 'medium',
    metrics: ['scalability_factor', 'load_capacity', 'elasticity'],
    target_improvement: 40
  }
};

interface AIWorkflowOptimizerProps {
  workflowId?: string;
  onOptimizationApplied?: (optimization: WorkflowOptimization) => void;
  onRecommendationAccepted?: (recommendation: AIRecommendation) => void;
  showAdvancedAnalytics?: boolean;
  enableAutoOptimization?: boolean;
  className?: string;
}

const AIWorkflowOptimizer: React.FC<AIWorkflowOptimizerProps> = ({
  workflowId,
  onOptimizationApplied,
  onRecommendationAccepted,
  showAdvancedAnalytics = true,
  enableAutoOptimization = false,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    analyzeWorkflowPerformance,
    optimizeWorkflow,
    getOptimizationHistory,
    applyOptimization,
    validateOptimization,
    getPerformanceBenchmarks,
    generateOptimizationReport
  } = useJobWorkflow();
  
  const { 
    getSystemResourceMetrics,
    getCostAnalysis,
    getResourceOptimization,
    predictResourceNeeds,
    getCapacityPlanning
  } = useRacineOrchestration();
  
  const { 
    getCrossGroupPerformance,
    analyzeCrossGroupBottlenecks,
    getWorkflowDependencies,
    optimizeCrossGroupExecution
  } = useCrossGroupIntegration();
  
  const { getCurrentUser } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    generateAIRecommendations,
    predictWorkflowPerformance,
    analyzeWorkflowPatterns,
    optimizeWithML,
    detectPerformanceAnomalies,
    suggestResourceOptimization,
    generateCostOptimizationPlan,
    predictOptimizationImpact
  } = useAIAssistant();

  // Core Optimization State
  const [currentAnalysis, setCurrentAnalysis] = useState<PerformanceMetrics | null>(null);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<AIRecommendation[]>([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState<WorkflowOptimization[]>([]);
  const [performanceBenchmarks, setPerformanceBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceAllocation | null>(null);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistory[]>([]);
  const [bottlenecks, setBottlenecks] = useState<WorkflowBottleneck[]>([]);

  // ML Model State
  const [selectedModel, setSelectedModel] = useState<string>('NEURAL_NETWORK');
  const [modelTrainingStatus, setModelTrainingStatus] = useState<'idle' | 'training' | 'completed' | 'failed'>('idle');
  const [modelAccuracy, setModelAccuracy] = useState<number>(0);
  const [modelPredictions, setModelPredictions] = useState<MLModelPrediction[]>([]);
  const [optimizationGoals, setOptimizationGoals] = useState<string[]>(['MINIMIZE_COST', 'MAXIMIZE_PERFORMANCE']);

  // UI State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('performance');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(enableAutoOptimization);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [optimizationThreshold, setOptimizationThreshold] = useState([10]); // Minimum improvement percentage

  // Analysis and Processing State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTrainingModel, setIsTrainingModel] = useState(false);
  const [isApplyingOptimization, setIsApplyingOptimization] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  // Performance State
  const [analysisTime, setAnalysisTime] = useState(0);
  const [optimizationImpact, setOptimizationImpact] = useState<any>(null);

  // Comprehensive Workflow Analysis
  const analyzeWorkflow = useCallback(async () => {
    if (!workflowId) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    const startTime = Date.now();

    try {
      // Phase 1: Basic Performance Analysis (20%)
      setAnalysisProgress(20);
      const [performanceMetrics, systemMetrics] = await Promise.all([
        analyzeWorkflowPerformance(workflowId),
        getSystemResourceMetrics(workflowId)
      ]);

      // Phase 2: Cost and Resource Analysis (40%)
      setAnalysisProgress(40);
      const [costData, resourceOptimization] = await Promise.all([
        getCostAnalysis(workflowId),
        getResourceOptimization(workflowId)
      ]);

      // Phase 3: Cross-Group Analysis (60%)
      setAnalysisProgress(60);
      const [crossGroupPerf, bottleneckAnalysis] = await Promise.all([
        getCrossGroupPerformance(workflowId),
        analyzeCrossGroupBottlenecks(workflowId)
      ]);

      // Phase 4: AI-Powered Analysis (80%)
      setAnalysisProgress(80);
      const [aiRecommendations, patternAnalysis, anomalies] = await Promise.all([
        generateAIRecommendations(workflowId, {
          categories: [selectedCategory],
          goals: optimizationGoals,
          threshold: optimizationThreshold[0]
        }),
        analyzeWorkflowPatterns(workflowId),
        detectPerformanceAnomalies(workflowId)
      ]);

      // Phase 5: Predictive Analytics (100%)
      setAnalysisProgress(100);
      const [predictions, benchmarks] = await Promise.all([
        predictWorkflowPerformance(workflowId),
        getPerformanceBenchmarks(workflowId)
      ]);

      // Combine and enhance analysis results
      const enhancedAnalysis: PerformanceMetrics = {
        ...performanceMetrics,
        system_metrics: systemMetrics,
        cross_group_performance: crossGroupPerf,
        pattern_analysis: patternAnalysis,
        anomalies: anomalies,
        ai_insights: {
          performance_score: patternAnalysis.performance_score || performanceMetrics.overall_score || 0,
          optimization_potential: patternAnalysis.optimization_potential || performanceMetrics.improvement_potential || 0,
          complexity_rating: patternAnalysis.complexity_rating || patternAnalysis.complexity || 'medium',
          recommendations_confidence: patternAnalysis.confidence_score || aiRecommendations[0]?.confidence * 100 || 0
        }
      };

      setCurrentAnalysis(enhancedAnalysis);
      setCostAnalysis(costData);
      setResourceMetrics(resourceOptimization);
      setOptimizationRecommendations(aiRecommendations);
      setBottlenecks(bottleneckAnalysis);
      setPredictiveAnalytics(predictions);
      setPerformanceBenchmarks(benchmarks);
      setLastAnalyzed(new Date());

      const analysisDuration = Date.now() - startTime;
      setAnalysisTime(analysisDuration);

      // Track analysis activity
      trackActivity({
        action: 'workflow_analyzed',
        resource_type: 'ai_workflow_optimizer',
        resource_id: workflowId,
        details: {
          analysis_time: analysisDuration,
          recommendations_count: aiRecommendations.length,
          bottlenecks_found: bottleneckAnalysis.length,
          performance_score: enhancedAnalysis.ai_insights?.performance_score,
          optimization_potential: enhancedAnalysis.ai_insights?.optimization_potential,
          categories_analyzed: [selectedCategory],
          goals: optimizationGoals
        }
      });
    } catch (error: any) {
      console.error('❌ Workflow analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [
    workflowId, selectedCategory, optimizationGoals, optimizationThreshold,
    analyzeWorkflowPerformance, getSystemResourceMetrics, getCostAnalysis,
    getResourceOptimization, getCrossGroupPerformance, analyzeCrossGroupBottlenecks,
    generateAIRecommendations, analyzeWorkflowPatterns, detectPerformanceAnomalies,
    predictWorkflowPerformance, getPerformanceBenchmarks, trackActivity
  ]);

  // Apply AI-Generated Optimization
  const applyAIOptimization = useCallback(async (recommendation: AIRecommendation) => {
    if (!workflowId) return;

    setIsApplyingOptimization(true);

    try {
      // Validate optimization before applying
      const validation = await validateOptimization(workflowId, recommendation);
      if (!validation.is_safe) {
        throw new Error(`Optimization validation failed: ${validation.risks?.join(', ')}`);
      }

      // Predict impact before applying
      const impactPrediction = await predictOptimizationImpact(workflowId, recommendation);

      // Apply the optimization
      const appliedOptimization = await applyOptimization(workflowId, {
        ...recommendation,
        applied_at: new Date().toISOString(),
        applied_by: getCurrentUser()?.id || '',
        validation_results: validation,
        predicted_impact: impactPrediction,
        auto_applied: autoOptimizationEnabled
      });

      setAppliedOptimizations(prev => [...prev, appliedOptimization]);
      setOptimizationImpact(impactPrediction);

      // Track successful optimization
      trackActivity({
        action: 'optimization_applied',
        resource_type: 'ai_workflow_optimizer',
        resource_id: workflowId,
        details: {
          optimization_type: recommendation.type,
          category: recommendation.category,
          predicted_improvement: recommendation.estimated_improvement,
          confidence: recommendation.confidence,
          validation_score: validation.safety_score,
          auto_applied: autoOptimizationEnabled
        }
      });

      onOptimizationApplied?.(appliedOptimization);
      onRecommendationAccepted?.(recommendation);

      // Re-analyze to see the impact
      setTimeout(() => analyzeWorkflow(), 2000);
    } catch (error: any) {
      console.error('❌ Optimization application failed:', error);
    } finally {
      setIsApplyingOptimization(false);
    }
  }, [
    workflowId, validateOptimization, predictOptimizationImpact, applyOptimization,
    getCurrentUser, autoOptimizationEnabled, trackActivity, onOptimizationApplied,
    onRecommendationAccepted, analyzeWorkflow
  ]);

  // Train ML Model for Optimization
  const trainOptimizationModel = useCallback(async () => {
    if (!workflowId) return;

    setIsTrainingModel(true);
    setModelTrainingStatus('training');

    try {
      const trainingResult = await optimizeWithML(workflowId, {
        model_type: selectedModel,
        optimization_goals: optimizationGoals,
        training_data_range: selectedTimeRange,
        validation_split: 0.2,
        hyperparameters: {
          learning_rate: 0.001,
          epochs: 100,
          batch_size: 32
        }
      });

      setModelAccuracy(trainingResult.accuracy);
      setModelPredictions(trainingResult.predictions);
      setModelTrainingStatus('completed');

      // Track model training
      trackActivity({
        action: 'ml_model_trained',
        resource_type: 'ai_workflow_optimizer',
        resource_id: workflowId,
        details: {
          model_type: selectedModel,
          accuracy: trainingResult.accuracy,
          training_time: trainingResult.training_time,
          goals: optimizationGoals,
          data_range: selectedTimeRange
        }
      });
    } catch (error: any) {
      console.error('❌ Model training failed:', error);
      setModelTrainingStatus('failed');
    } finally {
      setIsTrainingModel(false);
    }
  }, [
    workflowId, selectedModel, optimizationGoals, selectedTimeRange,
    optimizeWithML, trackActivity
  ]);

  // Render Performance Overview Dashboard
  const renderPerformanceOverview = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Performance Score</p>
                <p className="text-3xl font-bold text-blue-900">
                  {currentAnalysis?.ai_insights?.performance_score 
                    ? Math.round(currentAnalysis.ai_insights.performance_score)
                    : '—'
                  }
                </p>
                <p className="text-blue-700 text-xs">AI-calculated overall score</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-full">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Optimization Potential</p>
                <p className="text-3xl font-bold text-green-900">
                  {currentAnalysis?.ai_insights?.optimization_potential 
                    ? Math.round(currentAnalysis.ai_insights.optimization_potential)
                    : '—'
                  }%
                </p>
                <p className="text-green-700 text-xs">Estimated improvement</p>
              </div>
              <div className="p-3 bg-green-600 rounded-full">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Cost Savings</p>
                <p className="text-3xl font-bold text-orange-900">
                  ${costAnalysis?.potential_savings 
                    ? Math.round(costAnalysis.potential_savings)
                    : '—'
                  }
                </p>
                <p className="text-orange-700 text-xs">Monthly estimated</p>
              </div>
              <div className="p-3 bg-orange-600 rounded-full">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Active Optimizations</p>
                <p className="text-3xl font-bold text-purple-900">
                  {appliedOptimizations.length}
                </p>
                <p className="text-purple-700 text-xs">Currently applied</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-full">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Performance Trends</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeRange} onValueChange={(value: any) => setSelectedTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {performanceBenchmarks.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={performanceBenchmarks}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <ChartTooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="performance_score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Performance Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="execution_time" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Execution Time (s)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resource_efficiency" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Resource Efficiency %"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No performance data available</p>
                <p className="text-sm">Run analysis to see performance trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {resourceMetrics ? (
              <div className="space-y-4">
                {Object.entries({
                  CPU: { value: resourceMetrics.cpu_utilization || 0, color: '#3b82f6', icon: Cpu },
                  Memory: { value: resourceMetrics.memory_usage || 0, color: '#10b981', icon: HardDrive },
                  Storage: { value: resourceMetrics.storage_usage || 0, color: '#f59e0b', icon: HardDrive },
                  Network: { value: resourceMetrics.network_usage || 0, color: '#8b5cf6', icon: Network }
                }).map(([resource, data]) => (
                  <div key={resource} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <data.icon className="h-4 w-4" style={{ color: data.color }} />
                        <span className="font-medium">{resource}</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(data.value)}%</span>
                    </div>
                    <Progress 
                      value={data.value} 
                      className="h-2"
                      style={{ 
                        backgroundColor: `${data.color}20`,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resource metrics available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {costAnalysis ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Compute', value: costAnalysis.compute_cost || 0, fill: '#3b82f6' },
                        { name: 'Storage', value: costAnalysis.storage_cost || 0, fill: '#10b981' },
                        { name: 'Network', value: costAnalysis.network_cost || 0, fill: '#f59e0b' },
                        { name: 'Other', value: costAnalysis.other_cost || 0, fill: '#8b5cf6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <ChartTooltip 
                      formatter={(value: any) => [`$${value}`, 'Cost']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cost data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render AI Recommendations Panel
  const renderAIRecommendations = () => (
    <div className="space-y-6">
      {/* Recommendations Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">AI Optimization Recommendations</h3>
          <p className="text-gray-600">
            {optimizationRecommendations.length} recommendations based on ML analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={trainOptimizationModel}
            disabled={isTrainingModel}
          >
            {isTrainingModel ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Brain className="h-4 w-4 mr-1" />
            )}
            {isTrainingModel ? 'Training...' : 'Train Model'}
          </Button>
          <Button
            onClick={analyzeWorkflow}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Zap className="h-4 w-4 mr-1" />
            )}
            Analyze
          </Button>
        </div>
      </div>

      {/* Model Status */}
      {modelTrainingStatus !== 'idle' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  modelTrainingStatus === 'completed' ? 'bg-green-600' :
                  modelTrainingStatus === 'training' ? 'bg-blue-600' :
                  modelTrainingStatus === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                }`}>
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">
                    ML Model: {ML_MODEL_TYPES[selectedModel as keyof typeof ML_MODEL_TYPES]?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Status: {modelTrainingStatus} 
                    {modelAccuracy > 0 && ` • Accuracy: ${Math.round(modelAccuracy * 100)}%`}
                  </p>
                </div>
              </div>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ML_MODEL_TYPES).map(([key, model]) => (
                    <SelectItem key={key} value={key}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {optimizationRecommendations.length > 0 ? (
          optimizationRecommendations.map((recommendation, index) => {
            const category = OPTIMIZATION_CATEGORIES[recommendation.category?.toUpperCase() as keyof typeof OPTIMIZATION_CATEGORIES];
            
            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {category && (
                          <div 
                            className="p-3 rounded-lg shadow-sm"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <category.icon 
                              className="h-6 w-6" 
                              style={{ color: category.color }}
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-semibold">{recommendation.title}</h4>
                          <p className="text-gray-600">{recommendation.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {recommendation.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                +{recommendation.estimated_improvement}% improvement
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="h-3 w-3 text-blue-600" />
                              <span className="text-sm text-blue-600">
                                {Math.round((recommendation.confidence || 0) * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Preview optimization logic
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          onClick={() => applyAIOptimization(recommendation)}
                          disabled={isApplyingOptimization}
                        >
                          {isApplyingOptimization ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Recommendation Details */}
                    <div className="space-y-4">
                      {/* Impact Prediction */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {recommendation.estimated_improvement}%
                          </div>
                          <div className="text-sm text-green-700">Performance Gain</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            ${Math.round((recommendation.cost_impact || 0) * 100) / 100}
                          </div>
                          <div className="text-sm text-blue-700">Cost Impact</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {recommendation.implementation_effort || 'Low'}
                          </div>
                          <div className="text-sm text-orange-700">Implementation</div>
                        </div>
                      </div>
                      
                      {/* Implementation Steps */}
                      {recommendation.implementation_steps && (
                        <div>
                          <h5 className="font-medium mb-2">Implementation Steps:</h5>
                          <div className="space-y-2">
                            {recommendation.implementation_steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-start space-x-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                  {stepIndex + 1}
                                </div>
                                <span className="text-sm text-gray-700">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Risks and Considerations */}
                      {recommendation.risks && recommendation.risks.length > 0 && (
                        <Alert className="border-yellow-200 bg-yellow-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Considerations</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                              {recommendation.risks.map((risk, riskIndex) => (
                                <li key={riskIndex} className="text-sm">{risk}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Recommendations Available</h3>
              <p className="text-gray-500 mb-4">
                Run workflow analysis to generate AI-powered optimization recommendations
              </p>
              <Button onClick={analyzeWorkflow} disabled={isAnalyzing}>
                <Zap className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // Effects
  useEffect(() => {
    if (workflowId) {
      analyzeWorkflow();
    }
  }, [workflowId, analyzeWorkflow]);

  // Auto-optimization effect
  useEffect(() => {
    if (autoOptimizationEnabled && optimizationRecommendations.length > 0) {
      // Auto-apply high-confidence, low-risk recommendations
      const autoApplicable = optimizationRecommendations.filter(rec => 
        (rec.confidence || 0) > 0.8 && 
        rec.implementation_effort === 'low' &&
        (!rec.risks || rec.risks.length === 0)
      );
      
      if (autoApplicable.length > 0) {
        console.log(`🤖 Auto-applying ${autoApplicable.length} optimizations`);
        autoApplicable.forEach(rec => applyAIOptimization(rec));
      }
    }
  }, [autoOptimizationEnabled, optimizationRecommendations, applyAIOptimization]);

  // Main Render
  return (
    <div className={`flex h-full bg-gradient-to-br from-white to-gray-50 ${className}`}>
      <TooltipProvider>
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Brain className="h-8 w-8 text-blue-600" />
                  {currentAnalysis?.ai_insights?.performance_score && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {Math.round(currentAnalysis.ai_insights.performance_score / 10)}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Workflow Optimizer</h1>
                  <p className="text-sm text-gray-500">ML-powered performance optimization and cost reduction</p>
                </div>
              </div>
              
              {lastAnalyzed && (
                <div className="text-xs text-gray-500">
                  Last analyzed: {lastAnalyzed.toLocaleString()} 
                  {analysisTime > 0 && ` (${analysisTime}ms)`}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-optimization Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoOptimizationEnabled}
                  onCheckedChange={setAutoOptimizationEnabled}
                />
                <Label className="text-sm">Auto-optimize</Label>
              </div>
              
              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <div className="w-32">
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                  <span className="text-sm text-gray-600">{analysisProgress}%</span>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeWorkflow}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Activity className="h-4 w-4 mr-1" />
                  )}
                  Analyze
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                >
                  {showAdvancedMetrics ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  Advanced
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => generateOptimizationReport(workflowId || '')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <Settings className="h-4 w-4 mr-2" />
                      Optimization Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main Content with Advanced Tabs */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>AI Recommendations</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Predictive Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="h-full">
                <TabsContent value="overview" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {renderPerformanceOverview()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="recommendations" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {renderAIRecommendations()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="analytics" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Predictive Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Advanced predictive analytics dashboard</p>
                            <p className="text-sm">ML models for performance forecasting and capacity planning</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="history" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Optimization History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Historical optimization data and trends</p>
                            <p className="text-sm">Track the impact of applied optimizations over time</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default AIWorkflowOptimizer;
