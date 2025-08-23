import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Slider,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Zap, Cpu, Activity, TrendingUp, Settings, Play, Pause, Square, RefreshCw, BarChart3, Target, Award, Server, Cloud, Monitor, Database, Network, Shield, Clock, Users, Layers, Grid, Search, Filter, Plus, Minus, Edit, Trash2, MoreHorizontal, Info, AlertTriangle, CheckCircle, XCircle, Lightbulb, Brain, Eye, Download, Upload, Share2, Copy, Save,  } from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';

// Enhanced workload optimization types
interface WorkloadOptimizerState {
  workloads: AIWorkload[];
  resources: ResourcePool[];
  optimizations: OptimizationStrategy[];
  metrics: WorkloadMetrics;
  performance: PerformanceMetrics;
  scaling: ScalingConfiguration;
  monitoring: MonitoringData;
  alerts: WorkloadAlert[];
  recommendations: OptimizationRecommendation[];
  automation: AutomationRules;
  intelligence: WorkloadIntelligence;
  forecasting: WorkloadForecasting;
  costOptimization: CostOptimization;
  efficiency: EfficiencyMetrics;
  reliability: ReliabilityMetrics;
}

interface AIWorkload {
  id: string;
  name: string;
  type: 'training' | 'inference' | 'preprocessing' | 'analysis' | 'optimization' | 'monitoring';
  status: 'running' | 'pending' | 'completed' | 'failed' | 'paused' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resources: ResourceRequirement;
  performance: WorkloadPerformance;
  scheduling: SchedulingConfig;
  scaling: ScalingPolicy;
  monitoring: WorkloadMonitoring;
  optimization: WorkloadOptimization;
  cost: WorkloadCost;
  sla: ServiceLevelAgreement;
  dependencies: string[];
  constraints: WorkloadConstraint[];
  metadata: WorkloadMetadata;
}

interface ResourcePool {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'memory' | 'storage' | 'network' | 'specialized';
  capacity: ResourceCapacity;
  utilization: ResourceUtilization;
  availability: ResourceAvailability;
  performance: ResourcePerformance;
  cost: ResourceCost;
  location: ResourceLocation;
  configuration: ResourceConfiguration;
  monitoring: ResourceMonitoring;
  optimization: ResourceOptimization;
  scaling: ResourceScaling;
  maintenance: MaintenanceSchedule;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'cost' | 'efficiency' | 'reliability' | 'hybrid';
  algorithm: OptimizationAlgorithm;
  parameters: OptimizationParameters;
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraint[];
  metrics: OptimizationMetrics;
  results: OptimizationResult[];
  effectiveness: number;
  confidence: number;
  applicability: string[];
  tradeoffs: Tradeoff[];
}

const OPTIMIZATION_STRATEGIES = [
  {
    id: 'performance_first',
    name: 'Performance First',
    description: 'Maximize performance with minimal latency and maximum throughput',
    type: 'performance',
    objectives: ['minimize_latency', 'maximize_throughput', 'optimize_response_time'],
    effectiveness: 0.92,
    confidence: 0.88,
    costImpact: 'high',
    complexityLevel: 'medium',
  },
  {
    id: 'cost_efficient',
    name: 'Cost Efficient',
    description: 'Minimize operational costs while maintaining acceptable performance',
    type: 'cost',
    objectives: ['minimize_cost', 'optimize_resource_usage', 'reduce_waste'],
    effectiveness: 0.85,
    confidence: 0.91,
    costImpact: 'low',
    complexityLevel: 'low',
  },
  {
    id: 'balanced_optimization',
    name: 'Balanced Optimization',
    description: 'Optimal balance between performance, cost, and reliability',
    type: 'hybrid',
    objectives: ['balance_performance_cost', 'optimize_efficiency', 'maintain_reliability'],
    effectiveness: 0.89,
    confidence: 0.94,
    costImpact: 'medium',
    complexityLevel: 'medium',
  },
  {
    id: 'green_computing',
    name: 'Green Computing',
    description: 'Minimize environmental impact and energy consumption',
    type: 'efficiency',
    objectives: ['minimize_energy', 'reduce_carbon_footprint', 'optimize_sustainability'],
    effectiveness: 0.78,
    confidence: 0.86,
    costImpact: 'medium',
    complexityLevel: 'high',
  },
  {
    id: 'reliability_focused',
    name: 'Reliability Focused',
    description: 'Maximize system reliability and fault tolerance',
    type: 'reliability',
    objectives: ['maximize_uptime', 'minimize_failures', 'ensure_redundancy'],
    effectiveness: 0.87,
    confidence: 0.92,
    costImpact: 'high',
    complexityLevel: 'high',
  },
];

const RESOURCE_TYPES = [
  { id: 'cpu', name: 'CPU', icon: Cpu, color: '#3B82F6', unit: 'cores' },
  { id: 'gpu', name: 'GPU', icon: Monitor, color: '#10B981', unit: 'units' },
  { id: 'memory', name: 'Memory', icon: Database, color: '#F59E0B', unit: 'GB' },
  { id: 'storage', name: 'Storage', icon: Server, color: '#EF4444', unit: 'TB' },
  { id: 'network', name: 'Network', icon: Network, color: '#8B5CF6', unit: 'Mbps' },
  { id: 'specialized', name: 'Specialized', icon: Brain, color: '#EC4899', unit: 'units' },
];

const WORKLOAD_TYPES = [
  { id: 'training', name: 'Model Training', icon: Brain, description: 'AI model training workloads' },
  { id: 'inference', name: 'Inference', icon: Zap, description: 'Real-time inference workloads' },
  { id: 'preprocessing', name: 'Data Preprocessing', icon: Database, description: 'Data preparation workloads' },
  { id: 'analysis', name: 'Analysis', icon: BarChart3, description: 'Data analysis workloads' },
  { id: 'optimization', name: 'Optimization', icon: Target, description: 'System optimization tasks' },
  { id: 'monitoring', name: 'Monitoring', icon: Eye, description: 'System monitoring workloads' },
];

const PERFORMANCE_METRICS = [
  { id: 'throughput', name: 'Throughput', unit: 'ops/sec', target: 10000, threshold: 5000 },
  { id: 'latency', name: 'Latency', unit: 'ms', target: 100, threshold: 500 },
  { id: 'cpu_utilization', name: 'CPU Utilization', unit: '%', target: 80, threshold: 95 },
  { id: 'memory_utilization', name: 'Memory Utilization', unit: '%', target: 75, threshold: 90 },
  { id: 'gpu_utilization', name: 'GPU Utilization', unit: '%', target: 85, threshold: 95 },
  { id: 'error_rate', name: 'Error Rate', unit: '%', target: 0.1, threshold: 1.0 },
];

const WorkloadOptimizer: React.FC = () => {
  const {
    workloads: classificationWorkloads,
    performance: classificationPerformance,
    optimizeWorkload,
    scaleWorkload,
    monitorWorkload,
  } = useClassificationState();

  const {
    workloadOptimization,
    resourceManagement,
    performanceOptimization,
    intelligentScaling,
    costOptimization,
    reliabilityOptimization,
    monitorWorkloadPerformance,
    predictWorkloadDemand,
    optimizeResourceAllocation,
    autoScaleResources,
  } = useAIIntelligence();

  // Core state
  const [optimizerState, setOptimizerState] = useState<WorkloadOptimizerState>({
    workloads: [],
    resources: [],
    optimizations: [],
    metrics: {} as WorkloadMetrics,
    performance: {} as PerformanceMetrics,
    scaling: {} as ScalingConfiguration,
    monitoring: {} as MonitoringData,
    alerts: [],
    recommendations: [],
    automation: {} as AutomationRules,
    intelligence: {} as WorkloadIntelligence,
    forecasting: {} as WorkloadForecasting,
    costOptimization: {} as CostOptimization,
    efficiency: {} as EfficiencyMetrics,
    reliability: {} as ReliabilityMetrics,
  });

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStrategy, setSelectedStrategy] = useState('balanced_optimization');
  const [selectedWorkload, setSelectedWorkload] = useState<string | null>(null);
  const [optimizationMode, setOptimizationMode] = useState<'manual' | 'automatic' | 'hybrid'>('hybrid');
  
  // Configuration state
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [intelligentScalingEnabled, setIntelligentScalingEnabled] = useState(true);
  const [costOptimizationEnabled, setCostOptimizationEnabled] = useState(true);
  const [performanceOptimizationEnabled, setPerformanceOptimizationEnabled] = useState(true);
  const [reliabilityOptimizationEnabled, setReliabilityOptimizationEnabled] = useState(true);
  const [predictiveScaling, setPredictiveScaling] = useState(true);
  const [resourcePooling, setResourcePooling] = useState(true);
  const [workloadBalancing, setWorkloadBalancing] = useState(true);
  
  // Advanced settings
  const [optimizationInterval, setOptimizationInterval] = useState(300); // seconds
  const [scalingThreshold, setScalingThreshold] = useState(0.8);
  const [costThreshold, setCostThreshold] = useState(1000); // dollars
  const [performanceThreshold, setPerformanceThreshold] = useState(0.9);
  const [reliabilityThreshold, setReliabilityThreshold] = useState(0.99);

  // Load data and initialize
  useEffect(() => {
    loadOptimizerData();
    initializeRealTimeMonitoring();
    initializeAutomation();
  }, []);

  const loadOptimizerData = useCallback(async () => {
    try {
      const [
        workloadsData,
        resourcesData,
        optimizationsData,
        metricsData,
        performanceData,
        alertsData,
        recommendationsData,
        forecastingData,
      ] = await Promise.all([
        aiApi.getAIWorkloads({ includeMetrics: true, includeOptimization: true }),
        aiApi.getResourcePools({ includeUtilization: true, includePerformance: true }),
        aiApi.getOptimizationStrategies({ includeResults: true, includeMetrics: true }),
        aiApi.getWorkloadMetrics({ timeRange: '24h', includeRealTime: true }),
        aiApi.getPerformanceMetrics({ timeRange: '1h', includeOptimization: true }),
        aiApi.getWorkloadAlerts({ status: 'active', includeRecommendations: true }),
        aiApi.getOptimizationRecommendations({ includeIntelligence: true }),
        aiApi.getWorkloadForecasting({ timeHorizon: '7d', includeIntelligence: true }),
      ]);

      setOptimizerState(prev => ({
        ...prev,
        workloads: workloadsData.data,
        resources: resourcesData.data,
        optimizations: optimizationsData.data,
        metrics: metricsData.data,
        performance: performanceData.data,
        alerts: alertsData.data,
        recommendations: recommendationsData.data,
        forecasting: forecastingData.data,
      }));
    } catch (error) {
      console.error('Error loading optimizer data:', error);
    }
  }, []);

  const initializeRealTimeMonitoring = useCallback(async () => {
    if (realTimeMonitoring) {
      try {
        await websocketApi.connect('workload_optimizer');

        websocketApi.subscribe('workload_metrics_updated', (data) => {
          setOptimizerState(prev => ({
            ...prev,
            metrics: { ...prev.metrics, ...data },
          }));
        });

        websocketApi.subscribe('performance_metrics_updated', (data) => {
          setOptimizerState(prev => ({
            ...prev,
            performance: { ...prev.performance, ...data },
          }));
        });

        websocketApi.subscribe('optimization_completed', (data) => {
          setOptimizerState(prev => ({
            ...prev,
            optimizations: prev.optimizations.map(opt =>
              opt.id === data.optimizationId ? { ...opt, ...data.results } : opt
            ),
          }));
        });

        websocketApi.subscribe('scaling_event', (data) => {
          setOptimizerState(prev => ({
            ...prev,
            workloads: prev.workloads.map(workload =>
              workload.id === data.workloadId ? { ...workload, ...data.updates } : workload
            ),
          }));
        });

        websocketApi.subscribe('alert_triggered', (data) => {
          setOptimizerState(prev => ({
            ...prev,
            alerts: [data.alert, ...prev.alerts],
          }));
        });

      } catch (error) {
        console.error('Error initializing real-time monitoring:', error);
      }
    }
  }, [realTimeMonitoring]);

  const initializeAutomation = useCallback(async () => {
    if (autoOptimization) {
      try {
        await aiApi.initializeWorkloadAutomation({
          optimizationInterval,
          scalingThreshold,
          costThreshold,
          performanceThreshold,
          reliabilityThreshold,
          intelligentScaling: intelligentScalingEnabled,
          costOptimization: costOptimizationEnabled,
          performanceOptimization: performanceOptimizationEnabled,
          reliabilityOptimization: reliabilityOptimizationEnabled,
          predictiveScaling,
          resourcePooling,
          workloadBalancing,
        });
      } catch (error) {
        console.error('Error initializing automation:', error);
      }
    }
  }, [autoOptimization, optimizationInterval, scalingThreshold, costThreshold, performanceThreshold, reliabilityThreshold, intelligentScalingEnabled, costOptimizationEnabled, performanceOptimizationEnabled, reliabilityOptimizationEnabled, predictiveScaling, resourcePooling, workloadBalancing]);

  const handleOptimizeWorkload = useCallback(async (workloadId: string) => {
    try {
      const result = await optimizeResourceAllocation({
        workloadId,
        strategy: selectedStrategy,
        objectives: OPTIMIZATION_STRATEGIES.find(s => s.id === selectedStrategy)?.objectives || [],
        constraints: {
          maxCost: costThreshold,
          minPerformance: performanceThreshold,
          minReliability: reliabilityThreshold,
        },
      });

      setOptimizerState(prev => ({
        ...prev,
        workloads: prev.workloads.map(w =>
          w.id === workloadId ? { ...w, optimization: result } : w
        ),
      }));
    } catch (error) {
      console.error('Error optimizing workload:', error);
    }
  }, [selectedStrategy, costThreshold, performanceThreshold, reliabilityThreshold, optimizeResourceAllocation]);

  const handleAutoScale = useCallback(async (workloadId: string, direction: 'up' | 'down') => {
    try {
      const result = await autoScaleResources({
        workloadId,
        direction,
        strategy: selectedStrategy,
        threshold: scalingThreshold,
        predictive: predictiveScaling,
      });

      setOptimizerState(prev => ({
        ...prev,
        workloads: prev.workloads.map(w =>
          w.id === workloadId ? { ...w, scaling: result } : w
        ),
      }));
    } catch (error) {
      console.error('Error auto-scaling workload:', error);
    }
  }, [selectedStrategy, scalingThreshold, predictiveScaling, autoScaleResources]);

  // Utility functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const formatMetricValue = useCallback((value: number, unit: string) => {
    if (unit === '%') return `${Math.round(value)}%`;
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === 'ops/sec') return `${Math.round(value)}/sec`;
    if (unit === 'GB' || unit === 'TB') return `${Math.round(value * 100) / 100}${unit}`;
    return Math.round(value * 100) / 100;
  }, []);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const metrics = optimizerState.metrics;
    return {
      efficiency: metrics.efficiency || 0,
      utilization: metrics.utilization || 0,
      performance: metrics.performance || 0,
      cost: metrics.cost || 0,
      reliability: metrics.reliability || 0,
      sustainability: metrics.sustainability || 0,
    };
  }, [optimizerState.metrics]);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              Workload Optimizer
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered workload optimization with intelligent scaling and resource management
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => handleOptimizeWorkload('all')}>
              <Target className="h-4 w-4 mr-2" />
              Optimize All
            </Button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(overallMetrics.efficiency * 100)}%
              </div>
              <Progress value={overallMetrics.efficiency * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(overallMetrics.utilization * 100)}%
              </div>
              <Progress value={overallMetrics.utilization * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(overallMetrics.performance * 100)}%
              </div>
              <Progress value={overallMetrics.performance * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${Math.round(overallMetrics.cost)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                per hour
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workloads">Workloads</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Real-time workload performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={optimizerState.monitoring?.performanceTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="throughput" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="latency" stroke="#EF4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="utilization" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Resource Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Resource Utilization
                  </CardTitle>
                  <CardDescription>
                    Current resource usage across all pools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={RESOURCE_TYPES.map(type => ({
                      name: type.name,
                      utilization: Math.random() * 100,
                      capacity: 100,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="utilization" fill="#3B82F6" />
                      <Bar dataKey="capacity" fill="#E5E7EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Active Workloads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Workloads
                </CardTitle>
                <CardDescription>
                  Currently running workloads and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizerState.workloads.slice(0, 5).map((workload) => (
                    <div key={workload.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {WORKLOAD_TYPES.find(t => t.id === workload.type)?.icon && 
                            React.createElement(WORKLOAD_TYPES.find(t => t.id === workload.type)!.icon, 
                            { className: "h-6 w-6" })}
                        </div>
                        <div>
                          <h4 className="font-medium">{workload.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {WORKLOAD_TYPES.find(t => t.id === workload.type)?.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(workload.status)}>
                          {workload.status}
                        </Badge>
                        <Badge className={getPriorityColor(workload.priority)}>
                          {workload.priority}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          CPU: {Math.round((workload.performance?.cpuUtilization || 0) * 100)}%
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleOptimizeWorkload(workload.id)}>
                          <Target className="h-3 w-3 mr-1" />
                          Optimize
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workloads Tab */}
          <TabsContent value="workloads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Workload Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage and optimize AI workloads
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTIMIZATION_STRATEGIES.map(strategy => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Workload
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {optimizerState.workloads.map((workload) => (
                <Card key={workload.id} className={selectedWorkload === workload.id ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workload.name}</CardTitle>
                      <Badge className={getStatusColor(workload.status)}>
                        {workload.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {WORKLOAD_TYPES.find(t => t.id === workload.type)?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-sm font-medium">CPU</div>
                        <div className="text-lg font-bold text-blue-600">
                          {Math.round((workload.performance?.cpuUtilization || 0) * 100)}%
                        </div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-sm font-medium">Memory</div>
                        <div className="text-lg font-bold text-green-600">
                          {Math.round((workload.performance?.memoryUtilization || 0) * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Priority:</span>
                        <Badge className={getPriorityColor(workload.priority)}>
                          {workload.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Cost/hour:</span>
                        <span className="font-medium">${Math.round((workload.cost?.hourly || 0) * 100) / 100}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOptimizeWorkload(workload.id)}>
                        <Target className="h-3 w-3 mr-1" />
                        Optimize
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAutoScale(workload.id, 'up')}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAutoScale(workload.id, 'down')}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESOURCE_TYPES.map((resourceType) => (
                <Card key={resourceType.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <resourceType.icon className="h-5 w-5" style={{ color: resourceType.color }} />
                      {resourceType.name}
                    </CardTitle>
                    <CardDescription>
                      Resource pool utilization and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Utilization</span>
                        <span className="font-medium">{Math.round(Math.random() * 100)}%</span>
                      </div>
                      <Progress value={Math.random() * 100} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Capacity</div>
                        <div className="font-medium">{Math.round(Math.random() * 1000)} {resourceType.unit}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Available</div>
                        <div className="font-medium">{Math.round(Math.random() * 500)} {resourceType.unit}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Plus className="h-3 w-3 mr-1" />
                        Scale Up
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimization Strategies
                  </CardTitle>
                  <CardDescription>
                    Available optimization strategies and their effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {OPTIMIZATION_STRATEGIES.map((strategy) => (
                      <div key={strategy.id} className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedStrategy === strategy.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`} onClick={() => setSelectedStrategy(strategy.id)}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{strategy.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="text-green-600 bg-green-100">
                              {Math.round(strategy.effectiveness * 100)}%
                            </Badge>
                            <Badge variant="outline">{strategy.type}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>Confidence: {Math.round(strategy.confidence * 100)}%</span>
                          <span>Cost Impact: {strategy.costImpact}</span>
                          <span>Complexity: {strategy.complexityLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Optimization Settings
                  </CardTitle>
                  <CardDescription>
                    Configure optimization parameters and thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-optimization">Auto Optimization</Label>
                      <Switch
                        id="auto-optimization"
                        checked={autoOptimization}
                        onCheckedChange={setAutoOptimization}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="intelligent-scaling">Intelligent Scaling</Label>
                      <Switch
                        id="intelligent-scaling"
                        checked={intelligentScalingEnabled}
                        onCheckedChange={setIntelligentScalingEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="predictive-scaling">Predictive Scaling</Label>
                      <Switch
                        id="predictive-scaling"
                        checked={predictiveScaling}
                        onCheckedChange={setPredictiveScaling}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Scaling Threshold</Label>
                      <Slider
                        value={[scalingThreshold]}
                        onValueChange={(value) => setScalingThreshold(value[0])}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(scalingThreshold * 100)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Performance Threshold</Label>
                      <Slider
                        value={[performanceThreshold]}
                        onValueChange={(value) => setPerformanceThreshold(value[0])}
                        max={1}
                        min={0}
                        step={0.05}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(performanceThreshold * 100)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cost Threshold ($/hour)</Label>
                      <Slider
                        value={[costThreshold]}
                        onValueChange={(value) => setCostThreshold(value[0])}
                        max={5000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        ${costThreshold}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Real-time performance monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {PERFORMANCE_METRICS.map((metric) => {
                      const currentValue = Math.random() * metric.target * 1.5;
                      const isGood = currentValue <= metric.target;
                      const isCritical = currentValue >= metric.threshold;
                      
                      return (
                        <div key={metric.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <Badge className={
                              isCritical ? 'bg-red-100 text-red-600' :
                              isGood ? 'bg-green-100 text-green-600' :
                              'bg-yellow-100 text-yellow-600'
                            }>
                              {formatMetricValue(currentValue, metric.unit)}
                            </Badge>
                          </div>
                          <Progress 
                            value={Math.min((currentValue / metric.threshold) * 100, 100)} 
                            className="h-2" 
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Target: {formatMetricValue(metric.target, metric.unit)}</span>
                            <span>Threshold: {formatMetricValue(metric.threshold, metric.unit)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts and Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alerts & Recommendations
                  </CardTitle>
                  <CardDescription>
                    Active alerts and optimization recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {optimizerState.alerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <Badge className="bg-red-100 text-red-600">
                              {alert.severity}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-6 text-xs">
                              Resolve
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 text-xs">
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {optimizerState.recommendations.slice(0, 3).map((recommendation, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            <Badge className="bg-blue-100 text-blue-600">
                              Recommendation
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                          <p className="text-xs text-muted-foreground">{recommendation.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-6 text-xs">
                              Apply
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 text-xs">
                              Learn More
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default WorkloadOptimizer;