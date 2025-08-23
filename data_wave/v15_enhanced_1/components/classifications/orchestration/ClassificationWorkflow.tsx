import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';
import { Workflow, Route, Network, Zap, Brain, Target, Award, Clock, Users, Database, Monitor, Cpu, AlertTriangle, CheckCircle, XCircle, Info, Settings, Search, Filter, Download, Upload, RefreshCw, Play, Pause, Square, MoreVertical, Eye, Edit, Trash2, Plus, Minus, ArrowUp, ArrowDown, ArrowRight, Calendar, Globe, Shield, Lock, Unlock, Star, Heart, Bookmark, Share, MessageSquare, Bell, Mail, Phone, Video, Mic, Camera, Image, File, Folder, Archive, Tag, Flag, Map, Navigation, Compass, Layers, Grid, List, Table, Kanban, Timeline, Chart, Activity, TrendingUp, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';

// Import custom hooks and utilities
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';

// TypeScript Interfaces for Classification Workflow
interface WorkflowOrchestratorState {
  isLoading: boolean;
  error: string | null;
  workflows: ClassificationWorkflow[];
  executions: WorkflowExecution[];
  routing: IntelligentRouting;
  coordination: CrossVersionCoordination;
  templates: WorkflowTemplate[];
  metrics: WorkflowMetrics;
  performance: WorkflowPerformance;
  analytics: WorkflowAnalytics;
  monitoring: WorkflowMonitoring;
  optimization: WorkflowOptimization;
  governance: WorkflowGovernance;
  compliance: WorkflowCompliance;
  security: WorkflowSecurity;
  collaboration: WorkflowCollaboration;
  notifications: WorkflowNotifications;
  automation: WorkflowAutomation;
  integration: WorkflowIntegration;
  customization: WorkflowCustomization;
  realTimeMode: boolean;
  autoOptimization: boolean;
  selectedWorkflow: string | null;
  selectedExecution: string | null;
  filterCriteria: WorkflowFilter;
  viewMode: WorkflowViewMode;
  sortOrder: WorkflowSortOrder;
}

interface ClassificationWorkflow {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  category: WorkflowCategory;
  version: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  stages: WorkflowStage[];
  dependencies: WorkflowDependency[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  routing: WorkflowRouting;
  scheduling: WorkflowScheduling;
  retryPolicy: WorkflowRetryPolicy;
  timeout: WorkflowTimeout;
  resources: WorkflowResources;
  configuration: WorkflowConfiguration;
  metadata: WorkflowMetadata;
  permissions: WorkflowPermissions;
  audit: WorkflowAudit;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
  annotations: { [key: string]: string };
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  type: StageType;
  order: number;
  status: StageStatus;
  duration: number;
  startTime?: Date;
  endTime?: Date;
  inputs: StageInput[];
  outputs: StageOutput[];
  parameters: StageParameters;
  validation: StageValidation;
  transformation: StageTransformation;
  classification: StageClassification;
  processing: StageProcessing;
  quality: StageQuality;
  monitoring: StageMonitoring;
  error: StageError | null;
  metrics: StageMetrics;
  logs: StageLog[];
  artifacts: StageArtifact[];
  checkpoints: StageCheckpoint[];
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  name: string;
  status: ExecutionStatus;
  priority: ExecutionPriority;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: ExecutionProgress;
  currentStage: string;
  completedStages: string[];
  failedStages: string[];
  skippedStages: string[];
  context: ExecutionContext;
  inputs: ExecutionInput[];
  outputs: ExecutionOutput[];
  results: ExecutionResults;
  metrics: ExecutionMetrics;
  performance: ExecutionPerformance;
  quality: ExecutionQuality;
  cost: ExecutionCost;
  resources: ExecutionResources;
  logs: ExecutionLog[];
  events: ExecutionEvent[];
  errors: ExecutionError[];
  warnings: ExecutionWarning[];
  notifications: ExecutionNotification[];
  audit: ExecutionAudit;
  retry: ExecutionRetry;
  recovery: ExecutionRecovery;
}

interface IntelligentRouting {
  enabled: boolean;
  algorithm: RoutingAlgorithm;
  strategies: RoutingStrategy[];
  rules: RoutingRule[];
  conditions: RoutingCondition[];
  weights: RoutingWeight[];
  priorities: RoutingPriority[];
  constraints: RoutingConstraint[];
  optimization: RoutingOptimization;
  loadBalancing: RoutingLoadBalancing;
  failover: RoutingFailover;
  circuit: RoutingCircuitBreaker;
  adaptive: RoutingAdaptive;
  learning: RoutingLearning;
  analytics: RoutingAnalytics;
  monitoring: RoutingMonitoring;
  testing: RoutingTesting;
  simulation: RoutingSimulation;
}

interface CrossVersionCoordination {
  enabled: boolean;
  versions: VersionInfo[];
  compatibility: VersionCompatibility;
  migration: VersionMigration;
  synchronization: VersionSynchronization;
  conflicts: VersionConflict[];
  resolution: ConflictResolution;
  governance: VersionGovernance;
  policies: VersionPolicy[];
  controls: VersionControl;
  tracking: VersionTracking;
  analytics: VersionAnalytics;
  monitoring: VersionMonitoring;
  automation: VersionAutomation;
  validation: VersionValidation;
  testing: VersionTesting;
  deployment: VersionDeployment;
  rollback: VersionRollback;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  version: string;
  stages: TemplateStage[];
  parameters: TemplateParameter[];
  configuration: TemplateConfiguration;
  validation: TemplateValidation;
  documentation: TemplateDocumentation;
  examples: TemplateExample[];
  best_practices: TemplateBestPractice[];
  tags: string[];
  created: Date;
  updated: Date;
  usage: TemplateUsage;
  rating: TemplateRating;
  feedback: TemplateFeedback[];
}

interface WorkflowMetrics {
  total: number;
  active: number;
  completed: number;
  failed: number;
  pending: number;
  success_rate: number;
  average_duration: number;
  throughput: number;
  error_rate: number;
  performance_score: number;
  quality_score: number;
  efficiency_score: number;
  cost_score: number;
  satisfaction_score: number;
  trends: MetricTrend[];
  benchmarks: MetricBenchmark[];
  forecasts: MetricForecast[];
  alerts: MetricAlert[];
}

// Additional type definitions
type WorkflowType = 'manual' | 'ml' | 'ai' | 'hybrid' | 'custom';
type WorkflowCategory = 'classification' | 'processing' | 'analysis' | 'optimization' | 'governance';
type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'archived';
type WorkflowPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
type StageType = 'input' | 'processing' | 'classification' | 'validation' | 'output' | 'notification';
type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'retrying';
type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
type ExecutionPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
type RoutingAlgorithm = 'round_robin' | 'weighted' | 'least_connections' | 'response_time' | 'adaptive';
type WorkflowViewMode = 'list' | 'grid' | 'timeline' | 'kanban' | 'graph';
type WorkflowSortOrder = 'name' | 'created' | 'updated' | 'priority' | 'status' | 'duration';

// Constants
const WORKFLOW_TYPES = [
  { value: 'manual', label: 'Manual & Rule-Based', icon: Settings },
  { value: 'ml', label: 'ML-Driven', icon: Brain },
  { value: 'ai', label: 'AI-Intelligent', icon: Zap },
  { value: 'hybrid', label: 'Hybrid Approach', icon: Network },
  { value: 'custom', label: 'Custom Workflow', icon: Edit }
] as const;

const STAGE_TYPES = [
  { value: 'input', label: 'Data Input', icon: Upload },
  { value: 'processing', label: 'Processing', icon: Cpu },
  { value: 'classification', label: 'Classification', icon: Tag },
  { value: 'validation', label: 'Validation', icon: CheckCircle },
  { value: 'output', label: 'Output', icon: ArrowDownTrayIcon },
  { value: 'notification', label: 'Notification', icon: Bell }
] as const;

const ROUTING_ALGORITHMS = [
  { value: 'round_robin', label: 'Round Robin', description: 'Distribute requests evenly' },
  { value: 'weighted', label: 'Weighted', description: 'Route based on weights' },
  { value: 'least_connections', label: 'Least Connections', description: 'Route to least busy' },
  { value: 'response_time', label: 'Response Time', description: 'Route to fastest' },
  { value: 'adaptive', label: 'Adaptive', description: 'AI-powered routing' }
] as const;

const WORKFLOW_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
  archived: 'bg-purple-100 text-purple-800'
} as const;

const EXECUTION_STATUS_COLORS = {
  queued: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-orange-100 text-orange-800',
  timeout: 'bg-yellow-100 text-yellow-800'
} as const;

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
] as const;

// Mock data generators
const generateWorkflowMetrics = () => ({
  total: 156,
  active: 23,
  completed: 98,
  failed: 12,
  pending: 23,
  success_rate: 89.1,
  average_duration: 245.7,
  throughput: 1.2,
  error_rate: 7.7,
  performance_score: 92.3,
  quality_score: 88.9,
  efficiency_score: 91.5,
  cost_score: 85.2,
  satisfaction_score: 94.1,
  trends: [],
  benchmarks: [],
  forecasts: [],
  alerts: []
});

const generatePerformanceTrends = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      executions: Math.floor(10 + Math.random() * 20),
      success_rate: 85 + Math.random() * 10,
      avg_duration: 200 + Math.random() * 100,
      throughput: 0.8 + Math.random() * 0.8
    });
  }
  return data;
};

const generateWorkflowDistribution = () => [
  { name: 'Manual & Rule-Based', value: 45, color: CHART_COLORS[0] },
  { name: 'ML-Driven', value: 32, color: CHART_COLORS[1] },
  { name: 'AI-Intelligent', value: 18, color: CHART_COLORS[2] },
  { name: 'Hybrid', value: 5, color: CHART_COLORS[3] }
];

const generateRecentExecutions = (): WorkflowExecution[] => [
  {
    id: 'exec-001',
    workflowId: 'wf-001',
    name: 'Document Classification Pipeline',
    status: 'running',
    priority: 'high',
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    progress: { completed: 65, total: 100, percentage: 65 },
    currentStage: 'classification',
    completedStages: ['input', 'processing'],
    failedStages: [],
    skippedStages: [],
    context: {} as ExecutionContext,
    inputs: [],
    outputs: [],
    results: {} as ExecutionResults,
    metrics: {} as ExecutionMetrics,
    performance: {} as ExecutionPerformance,
    quality: {} as ExecutionQuality,
    cost: {} as ExecutionCost,
    resources: {} as ExecutionResources,
    logs: [],
    events: [],
    errors: [],
    warnings: [],
    notifications: [],
    audit: {} as ExecutionAudit,
    retry: {} as ExecutionRetry,
    recovery: {} as ExecutionRecovery
  },
  {
    id: 'exec-002',
    workflowId: 'wf-002',
    name: 'Image Analysis Workflow',
    status: 'completed',
    priority: 'medium',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 30 * 60 * 1000),
    duration: 90 * 60 * 1000,
    progress: { completed: 100, total: 100, percentage: 100 },
    currentStage: 'output',
    completedStages: ['input', 'processing', 'classification', 'validation', 'output'],
    failedStages: [],
    skippedStages: [],
    context: {} as ExecutionContext,
    inputs: [],
    outputs: [],
    results: {} as ExecutionResults,
    metrics: {} as ExecutionMetrics,
    performance: {} as ExecutionPerformance,
    quality: {} as ExecutionQuality,
    cost: {} as ExecutionCost,
    resources: {} as ExecutionResources,
    logs: [],
    events: [],
    errors: [],
    warnings: [],
    notifications: [],
    audit: {} as ExecutionAudit,
    retry: {} as ExecutionRetry,
    recovery: {} as ExecutionRecovery
  },
  {
    id: 'exec-003',
    workflowId: 'wf-003',
    name: 'Sentiment Analysis Pipeline',
    status: 'failed',
    priority: 'low',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    duration: 30 * 60 * 1000,
    progress: { completed: 40, total: 100, percentage: 40 },
    currentStage: 'processing',
    completedStages: ['input'],
    failedStages: ['processing'],
    skippedStages: ['classification', 'validation', 'output'],
    context: {} as ExecutionContext,
    inputs: [],
    outputs: [],
    results: {} as ExecutionResults,
    metrics: {} as ExecutionMetrics,
    performance: {} as ExecutionPerformance,
    quality: {} as ExecutionQuality,
    cost: {} as ExecutionCost,
    resources: {} as ExecutionResources,
    logs: [],
    events: [],
    errors: [],
    warnings: [],
    notifications: [],
    audit: {} as ExecutionAudit,
    retry: {} as ExecutionRetry,
    recovery: {} as ExecutionRecovery
  }
];

const generateActiveWorkflows = (): ClassificationWorkflow[] => [
  {
    id: 'wf-001',
    name: 'Document Classification Pipeline',
    description: 'Automated document classification using ML models',
    type: 'ml',
    category: 'classification',
    version: '1.2.0',
    status: 'active',
    priority: 'high',
    stages: [],
    dependencies: [],
    triggers: [],
    conditions: [],
    actions: [],
    routing: {} as WorkflowRouting,
    scheduling: {} as WorkflowScheduling,
    retryPolicy: {} as WorkflowRetryPolicy,
    timeout: {} as WorkflowTimeout,
    resources: {} as WorkflowResources,
    configuration: {} as WorkflowConfiguration,
    metadata: {} as WorkflowMetadata,
    permissions: {} as WorkflowPermissions,
    audit: {} as WorkflowAudit,
    created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['document', 'classification', 'ml'],
    labels: { environment: 'production', team: 'data-science' },
    annotations: { description: 'High-priority document processing workflow' }
  },
  {
    id: 'wf-002',
    name: 'Image Analysis Workflow',
    description: 'AI-powered image classification and analysis',
    type: 'ai',
    category: 'analysis',
    version: '2.1.0',
    status: 'active',
    priority: 'medium',
    stages: [],
    dependencies: [],
    triggers: [],
    conditions: [],
    actions: [],
    routing: {} as WorkflowRouting,
    scheduling: {} as WorkflowScheduling,
    retryPolicy: {} as WorkflowRetryPolicy,
    timeout: {} as WorkflowTimeout,
    resources: {} as WorkflowResources,
    configuration: {} as WorkflowConfiguration,
    metadata: {} as WorkflowMetadata,
    permissions: {} as WorkflowPermissions,
    audit: {} as WorkflowAudit,
    created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['image', 'analysis', 'ai'],
    labels: { environment: 'production', team: 'computer-vision' },
    annotations: { description: 'Advanced image processing with AI' }
  }
];

// Main Component
export const ClassificationWorkflow: React.FC = () => {
  // State Management
  const [state, setState] = useState<WorkflowOrchestratorState>({
    isLoading: false,
    error: null,
    workflows: generateActiveWorkflows(),
    executions: generateRecentExecutions(),
    routing: {} as IntelligentRouting,
    coordination: {} as CrossVersionCoordination,
    templates: [],
    metrics: generateWorkflowMetrics(),
    performance: {} as WorkflowPerformance,
    analytics: {} as WorkflowAnalytics,
    monitoring: {} as WorkflowMonitoring,
    optimization: {} as WorkflowOptimization,
    governance: {} as WorkflowGovernance,
    compliance: {} as WorkflowCompliance,
    security: {} as WorkflowSecurity,
    collaboration: {} as WorkflowCollaboration,
    notifications: {} as WorkflowNotifications,
    automation: {} as WorkflowAutomation,
    integration: {} as WorkflowIntegration,
    customization: {} as WorkflowCustomization,
    realTimeMode: true,
    autoOptimization: true,
    selectedWorkflow: null,
    selectedExecution: null,
    filterCriteria: {} as WorkflowFilter,
    viewMode: 'list',
    sortOrder: 'updated'
  });

  // Custom hooks
  const { classifications, updateClassification } = useClassificationState();
  const { aiModels, aiAgents, startIntelligence, stopIntelligence } = useAIIntelligence();

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // Memoized data
  const performanceTrends = useMemo(() => generatePerformanceTrends(), []);
  const workflowDistribution = useMemo(() => generateWorkflowDistribution(), []);

  // Effects
  useEffect(() => {
    if (state.realTimeMode) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, 30000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.realTimeMode]);

  useEffect(() => {
    if (state.realTimeMode) {
      initializeWebSocket();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [state.realTimeMode]);

  // WebSocket initialization
  const initializeWebSocket = useCallback(() => {
    try {
      websocketRef.current = websocketApi.connect('workflow-orchestrator');
      
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Real-time connection failed' }));
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, []);

  // Event Handlers
  const handleRefreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const [workflowsData, executionsData, metricsData] = await Promise.all([
        aiApi.getWorkflows(),
        aiApi.getWorkflowExecutions(),
        aiApi.getWorkflowMetrics()
      ]);

      setState(prev => ({
        ...prev,
        workflows: workflowsData,
        executions: executionsData,
        metrics: metricsData,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false
      }));
    }
  }, []);

  const handleRealTimeUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      workflows: data.workflows || prev.workflows,
      executions: data.executions || prev.executions,
      metrics: { ...prev.metrics, ...data.metrics }
    }));
  }, []);

  const handleExecuteWorkflow = useCallback(async (workflowId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const execution = await aiApi.executeWorkflow(workflowId);
      setState(prev => ({
        ...prev,
        executions: [execution, ...prev.executions],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute workflow',
        isLoading: false
      }));
    }
  }, []);

  const handlePauseWorkflow = useCallback(async (workflowId: string) => {
    try {
      await aiApi.pauseWorkflow(workflowId);
      setState(prev => ({
        ...prev,
        workflows: prev.workflows.map(wf => 
          wf.id === workflowId ? { ...wf, status: 'paused' } : wf
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to pause workflow'
      }));
    }
  }, []);

  const handleResumeWorkflow = useCallback(async (workflowId: string) => {
    try {
      await aiApi.resumeWorkflow(workflowId);
      setState(prev => ({
        ...prev,
        workflows: prev.workflows.map(wf => 
          wf.id === workflowId ? { ...wf, status: 'active' } : wf
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to resume workflow'
      }));
    }
  }, []);

  const handleOptimizeWorkflow = useCallback(async (workflowId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const optimizedWorkflow = await aiApi.optimizeWorkflow(workflowId);
      setState(prev => ({
        ...prev,
        workflows: prev.workflows.map(wf => 
          wf.id === workflowId ? optimizedWorkflow : wf
        ),
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize workflow',
        isLoading: false
      }));
    }
  }, []);

  // Utility functions
  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusIcon = (status: WorkflowStatus | ExecutionStatus) => {
    switch (status) {
      case 'active':
      case 'running':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: WorkflowPriority | ExecutionPriority): string => {
    switch (priority) {
      case 'critical':
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Render functions
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {state.metrics.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.metrics.success_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {state.metrics.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(state.metrics.average_duration * 1000)}</div>
            <p className="text-xs text-muted-foreground">
              {state.metrics.throughput.toFixed(1)} per hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.metrics.performance_score.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {state.metrics.failed} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Trends</span>
          </CardTitle>
          <CardDescription>
            30-day workflow execution metrics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="executions" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} />
                <Area type="monotone" dataKey="success_rate" stackId="2" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Distribution and Recent Executions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Workflow Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workflowDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {workflowDistribution.map((entry, index) => (
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
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Executions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.executions.slice(0, 5).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="font-medium">{execution.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {execution.currentStage} • {formatDuration(Date.now() - execution.startTime.getTime())} ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={EXECUTION_STATUS_COLORS[execution.status]}>
                      {execution.status}
                    </Badge>
                    <span className={getPriorityColor(execution.priority)}>
                      {execution.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderWorkflowsTab = () => (
    <div className="space-y-6">
      {/* Workflow Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              className="w-64"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {WORKFLOW_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-4">
        {state.workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={WORKFLOW_STATUS_COLORS[workflow.status]}>
                    {workflow.status}
                  </Badge>
                  <span className={getPriorityColor(workflow.priority)}>
                    {workflow.priority}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-1 font-medium">{workflow.type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="ml-1 font-medium">{workflow.version}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="ml-1 font-medium">
                      {workflow.updated.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Execute
                  </Button>
                  {workflow.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePauseWorkflow(workflow.id)}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResumeWorkflow(workflow.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOptimizeWorkflow(workflow.id)}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Optimize
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderExecutionsTab = () => (
    <div className="space-y-6">
      {/* Execution Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search executions..."
              className="w-64"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleRefreshData}>
          <Refresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Executions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Priority</th>
                  <th className="text-left p-3">Progress</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Started</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.executions.map((execution) => (
                  <tr key={execution.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{execution.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {execution.currentStage}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(execution.status)}
                        <Badge className={EXECUTION_STATUS_COLORS[execution.status]}>
                          {execution.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={getPriorityColor(execution.priority)}>
                        {execution.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <Progress value={execution.progress.percentage} className="h-2" />
                        <div className="text-sm text-muted-foreground">
                          {execution.progress.completed}/{execution.progress.total}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {execution.duration 
                        ? formatDuration(execution.duration)
                        : formatDuration(Date.now() - execution.startTime.getTime())
                      }
                    </td>
                    <td className="p-3">
                      {execution.startTime.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {execution.status === 'running' && (
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {execution.status === 'failed' && (
                          <Button variant="ghost" size="sm">
                            <Refresh className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRoutingTab = () => (
    <div className="space-y-6">
      {/* Routing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Intelligent Routing Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="routing-enabled">Enable Intelligent Routing</Label>
            <Switch id="routing-enabled" checked={true} />
          </div>
          
          <div>
            <Label htmlFor="routing-algorithm">Routing Algorithm</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                {ROUTING_ALGORITHMS.map((algorithm) => (
                  <SelectItem key={algorithm.value} value={algorithm.value}>
                    <div>
                      <div className="font-medium">{algorithm.label}</div>
                      <div className="text-sm text-muted-foreground">{algorithm.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="load-threshold">Load Threshold (%)</Label>
              <Slider
                id="load-threshold"
                min={0}
                max={100}
                step={5}
                value={[75]}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="response-threshold">Response Time Threshold (ms)</Label>
              <Slider
                id="response-threshold"
                min={100}
                max={5000}
                step={100}
                value={[1000]}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="adaptive-learning">Adaptive Learning</Label>
            <Switch id="adaptive-learning" checked={true} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="circuit-breaker">Circuit Breaker</Label>
            <Switch id="circuit-breaker" checked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Routing Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="throughput" fill={CHART_COLORS[0]} />
                <Bar dataKey="avg_duration" fill={CHART_COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoordinationTab = () => (
    <div className="space-y-6">
      {/* Cross-Version Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Cross-Version Coordination</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">V1: Manual & Rule-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Workflows</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">V2: ML-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Workflows</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">V3: AI-Intelligent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Workflows</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Optimizing</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-coordination">Auto Coordination</Label>
            <Switch id="auto-coordination" checked={state.autoOptimization} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="version-migration">Version Migration</Label>
            <Switch id="version-migration" checked={true} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="conflict-resolution">Conflict Resolution</Label>
            <Switch id="conflict-resolution" checked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">API Gateway</div>
                  <div className="text-sm text-muted-foreground">All endpoints healthy</div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Message Queue</div>
                  <div className="text-sm text-muted-foreground">Processing 1.2k messages/min</div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium">Data Pipeline</div>
                  <div className="text-sm text-muted-foreground">Minor latency detected</div>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Workflow className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Classification Workflow Orchestrator</h1>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${state.realTimeMode ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span>{state.realTimeMode ? 'Live' : 'Static'}</span>
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <Switch
            checked={state.autoOptimization}
            onCheckedChange={(checked) => setState(prev => ({ ...prev, autoOptimization: checked }))}
          />
          <Label>Auto Optimization</Label>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={state.isLoading}
          >
            <Refresh className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{state.error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center space-x-2">
              <Workflow className="h-4 w-4" />
              <span>Workflows</span>
            </TabsTrigger>
            <TabsTrigger value="executions" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Executions</span>
            </TabsTrigger>
            <TabsTrigger value="routing" className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Routing</span>
            </TabsTrigger>
            <TabsTrigger value="coordination" className="flex items-center space-x-2">
              <Network className="h-4 w-4" />
              <span>Coordination</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="overview" className="mt-0">
              {renderOverviewTab()}
            </TabsContent>
            
            <TabsContent value="workflows" className="mt-0">
              {renderWorkflowsTab()}
            </TabsContent>
            
            <TabsContent value="executions" className="mt-0">
              {renderExecutionsTab()}
            </TabsContent>
            
            <TabsContent value="routing" className="mt-0">
              {renderRoutingTab()}
            </TabsContent>
            
            <TabsContent value="coordination" className="mt-0">
              {renderCoordinationTab()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassificationWorkflow;