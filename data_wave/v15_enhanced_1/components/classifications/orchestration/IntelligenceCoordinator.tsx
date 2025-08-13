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
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey
} from 'recharts';
import {
  Brain, Network, Zap, Target, Award, Clock, Users, Database,
  Monitor, Cpu, AlertTriangle, CheckCircle, XCircle, Info, Settings,
  Search, Filter, Download, Upload, Refresh, Play, Pause, Stop,
  MoreVertical, Eye, Edit, Trash2, Plus, Minus, ArrowUp, ArrowDown,
  ArrowRight, Calendar, Globe, Shield, Lock, Unlock, Star, Heart,
  Bookmark, Share, MessageSquare, Bell, Mail, Phone, Video, Mic,
  Camera, Image, File, Folder, Archive, Tag, Flag, Map, Navigation,
  Compass, Route, Layers, Grid, List, Table, Kanban, Timeline,
  Chart, Activity, TrendingUp, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, GitBranch, Workflow, Bot, Lightbulb
} from 'lucide-react';

// Import custom hooks and utilities
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';

// TypeScript Interfaces for Intelligence Coordinator
interface IntelligenceCoordinatorState {
  isLoading: boolean;
  error: string | null;
  models: IntelligenceModel[];
  agents: IntelligenceAgent[];
  orchestrations: IntelligenceOrchestration[];
  pipelines: IntelligencePipeline[];
  coordination: CoordinationMatrix;
  optimization: IntelligenceOptimization;
  monitoring: IntelligenceMonitoring;
  analytics: IntelligenceAnalytics;
  governance: IntelligenceGovernance;
  security: IntelligenceSecurity;
  collaboration: IntelligenceCollaboration;
  automation: IntelligenceAutomation;
  integration: IntelligenceIntegration;
  performance: IntelligencePerformance;
  quality: IntelligenceQuality;
  compliance: IntelligenceCompliance;
  realTimeMode: boolean;
  autoCoordination: boolean;
  selectedModel: string | null;
  selectedAgent: string | null;
  selectedOrchestration: string | null;
  filterCriteria: IntelligenceFilter;
  viewMode: IntelligenceViewMode;
  sortOrder: IntelligenceSortOrder;
}

interface IntelligenceModel {
  id: string;
  name: string;
  description: string;
  type: ModelType;
  category: ModelCategory;
  version: string;
  status: ModelStatus;
  accuracy: number;
  performance: ModelPerformance;
  capabilities: ModelCapability[];
  dependencies: ModelDependency[];
  resources: ModelResources;
  configuration: ModelConfiguration;
  training: ModelTraining;
  evaluation: ModelEvaluation;
  deployment: ModelDeployment;
  monitoring: ModelMonitoring;
  optimization: ModelOptimization;
  lifecycle: ModelLifecycle;
  metadata: ModelMetadata;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
}

interface IntelligenceAgent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  category: AgentCategory;
  status: AgentStatus;
  capabilities: AgentCapability[];
  models: string[];
  workflows: string[];
  coordination: AgentCoordination;
  communication: AgentCommunication;
  learning: AgentLearning;
  adaptation: AgentAdaptation;
  autonomy: AgentAutonomy;
  collaboration: AgentCollaboration;
  performance: AgentPerformance;
  monitoring: AgentMonitoring;
  security: AgentSecurity;
  governance: AgentGovernance;
  lifecycle: AgentLifecycle;
  metadata: AgentMetadata;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
}

interface IntelligenceOrchestration {
  id: string;
  name: string;
  description: string;
  type: OrchestrationType;
  status: OrchestrationStatus;
  models: OrchestrationModel[];
  agents: OrchestrationAgent[];
  workflows: OrchestrationWorkflow[];
  coordination: OrchestrationCoordination;
  optimization: OrchestrationOptimization;
  monitoring: OrchestrationMonitoring;
  governance: OrchestrationGovernance;
  security: OrchestrationSecurity;
  performance: OrchestrationPerformance;
  quality: OrchestrationQuality;
  compliance: OrchestrationCompliance;
  automation: OrchestrationAutomation;
  integration: OrchestrationIntegration;
  lifecycle: OrchestrationLifecycle;
  metadata: OrchestrationMetadata;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
}

interface IntelligencePipeline {
  id: string;
  name: string;
  description: string;
  type: PipelineType;
  status: PipelineStatus;
  stages: PipelineStage[];
  models: PipelineModel[];
  agents: PipelineAgent[];
  data: PipelineData;
  processing: PipelineProcessing;
  optimization: PipelineOptimization;
  monitoring: PipelineMonitoring;
  quality: PipelineQuality;
  performance: PipelinePerformance;
  security: PipelineSecurity;
  governance: PipelineGovernance;
  compliance: PipelineCompliance;
  automation: PipelineAutomation;
  integration: PipelineIntegration;
  lifecycle: PipelineLifecycle;
  metadata: PipelineMetadata;
  created: Date;
  updated: Date;
  createdBy: string;
  updatedBy: string;
  tags: string[];
  labels: { [key: string]: string };
}

interface CoordinationMatrix {
  models: ModelCoordination[];
  agents: AgentCoordination[];
  workflows: WorkflowCoordination[];
  pipelines: PipelineCoordination[];
  dependencies: CoordinationDependency[];
  conflicts: CoordinationConflict[];
  resolutions: ConflictResolution[];
  optimizations: CoordinationOptimization[];
  synchronization: CoordinationSynchronization;
  communication: CoordinationCommunication;
  governance: CoordinationGovernance;
  monitoring: CoordinationMonitoring;
  analytics: CoordinationAnalytics;
  automation: CoordinationAutomation;
  integration: CoordinationIntegration;
}

interface IntelligenceOptimization {
  enabled: boolean;
  strategies: OptimizationStrategy[];
  algorithms: OptimizationAlgorithm[];
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraint[];
  parameters: OptimizationParameter[];
  results: OptimizationResult[];
  recommendations: OptimizationRecommendation[];
  automation: OptimizationAutomation;
  monitoring: OptimizationMonitoring;
  analytics: OptimizationAnalytics;
  governance: OptimizationGovernance;
  compliance: OptimizationCompliance;
  integration: OptimizationIntegration;
}

// Additional type definitions
type ModelType = 'classification' | 'regression' | 'clustering' | 'nlp' | 'vision' | 'speech' | 'recommendation';
type ModelCategory = 'supervised' | 'unsupervised' | 'reinforcement' | 'transfer' | 'ensemble' | 'hybrid';
type ModelStatus = 'training' | 'ready' | 'deployed' | 'retired' | 'error' | 'maintenance';
type AgentType = 'reactive' | 'deliberative' | 'hybrid' | 'learning' | 'collaborative' | 'autonomous';
type AgentCategory = 'coordinator' | 'executor' | 'monitor' | 'optimizer' | 'validator' | 'communicator';
type AgentStatus = 'active' | 'idle' | 'busy' | 'error' | 'maintenance' | 'offline';
type OrchestrationType = 'sequential' | 'parallel' | 'pipeline' | 'ensemble' | 'hierarchical' | 'adaptive';
type OrchestrationStatus = 'planning' | 'executing' | 'completed' | 'failed' | 'paused' | 'optimizing';
type PipelineType = 'batch' | 'streaming' | 'real-time' | 'hybrid' | 'distributed' | 'federated';
type PipelineStatus = 'running' | 'stopped' | 'error' | 'maintenance' | 'optimizing' | 'scaling';
type IntelligenceViewMode = 'overview' | 'detailed' | 'matrix' | 'graph' | 'timeline' | 'metrics';
type IntelligenceSortOrder = 'name' | 'created' | 'updated' | 'performance' | 'status' | 'priority';

// Constants
const MODEL_TYPES = [
  { value: 'classification', label: 'Classification', icon: Tag },
  { value: 'regression', label: 'Regression', icon: TrendingUp },
  { value: 'clustering', label: 'Clustering', icon: Grid },
  { value: 'nlp', label: 'Natural Language', icon: MessageSquare },
  { value: 'vision', label: 'Computer Vision', icon: Eye },
  { value: 'speech', label: 'Speech Processing', icon: Mic },
  { value: 'recommendation', label: 'Recommendation', icon: Star }
] as const;

const AGENT_TYPES = [
  { value: 'reactive', label: 'Reactive Agent', icon: Zap },
  { value: 'deliberative', label: 'Deliberative Agent', icon: Brain },
  { value: 'hybrid', label: 'Hybrid Agent', icon: Network },
  { value: 'learning', label: 'Learning Agent', icon: Lightbulb },
  { value: 'collaborative', label: 'Collaborative Agent', icon: Users },
  { value: 'autonomous', label: 'Autonomous Agent', icon: Bot }
] as const;

const ORCHESTRATION_TYPES = [
  { value: 'sequential', label: 'Sequential', description: 'Execute models in sequence' },
  { value: 'parallel', label: 'Parallel', description: 'Execute models in parallel' },
  { value: 'pipeline', label: 'Pipeline', description: 'Data flows through stages' },
  { value: 'ensemble', label: 'Ensemble', description: 'Combine multiple models' },
  { value: 'hierarchical', label: 'Hierarchical', description: 'Multi-level orchestration' },
  { value: 'adaptive', label: 'Adaptive', description: 'Dynamic orchestration' }
] as const;

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  ready: 'bg-blue-100 text-blue-800',
  training: 'bg-yellow-100 text-yellow-800',
  deployed: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  maintenance: 'bg-orange-100 text-orange-800',
  retired: 'bg-gray-100 text-gray-800',
  idle: 'bg-gray-100 text-gray-800',
  busy: 'bg-blue-100 text-blue-800',
  offline: 'bg-red-100 text-red-800',
  running: 'bg-green-100 text-green-800',
  stopped: 'bg-red-100 text-red-800',
  planning: 'bg-yellow-100 text-yellow-800',
  executing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  paused: 'bg-yellow-100 text-yellow-800',
  optimizing: 'bg-purple-100 text-purple-800',
  scaling: 'bg-blue-100 text-blue-800'
} as const;

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
] as const;

// Mock data generators
const generateIntelligenceModels = (): IntelligenceModel[] => [
  {
    id: 'model-001',
    name: 'Document Classifier Pro',
    description: 'Advanced document classification model with 95% accuracy',
    type: 'classification',
    category: 'supervised',
    version: '2.1.0',
    status: 'deployed',
    accuracy: 95.2,
    performance: {} as ModelPerformance,
    capabilities: [],
    dependencies: [],
    resources: {} as ModelResources,
    configuration: {} as ModelConfiguration,
    training: {} as ModelTraining,
    evaluation: {} as ModelEvaluation,
    deployment: {} as ModelDeployment,
    monitoring: {} as ModelMonitoring,
    optimization: {} as ModelOptimization,
    lifecycle: {} as ModelLifecycle,
    metadata: {} as ModelMetadata,
    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['classification', 'nlp', 'production'],
    labels: { environment: 'production', team: 'ml-ops' }
  },
  {
    id: 'model-002',
    name: 'Image Recognition Engine',
    description: 'Computer vision model for image classification and analysis',
    type: 'vision',
    category: 'supervised',
    version: '1.8.0',
    status: 'ready',
    accuracy: 92.7,
    performance: {} as ModelPerformance,
    capabilities: [],
    dependencies: [],
    resources: {} as ModelResources,
    configuration: {} as ModelConfiguration,
    training: {} as ModelTraining,
    evaluation: {} as ModelEvaluation,
    deployment: {} as ModelDeployment,
    monitoring: {} as ModelMonitoring,
    optimization: {} as ModelOptimization,
    lifecycle: {} as ModelLifecycle,
    metadata: {} as ModelMetadata,
    created: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 6 * 60 * 60 * 1000),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['vision', 'cnn', 'staging'],
    labels: { environment: 'staging', team: 'computer-vision' }
  },
  {
    id: 'model-003',
    name: 'Sentiment Analyzer',
    description: 'NLP model for sentiment analysis and emotion detection',
    type: 'nlp',
    category: 'supervised',
    version: '3.0.0',
    status: 'training',
    accuracy: 89.4,
    performance: {} as ModelPerformance,
    capabilities: [],
    dependencies: [],
    resources: {} as ModelResources,
    configuration: {} as ModelConfiguration,
    training: {} as ModelTraining,
    evaluation: {} as ModelEvaluation,
    deployment: {} as ModelDeployment,
    monitoring: {} as ModelMonitoring,
    optimization: {} as ModelOptimization,
    lifecycle: {} as ModelLifecycle,
    metadata: {} as ModelMetadata,
    created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['nlp', 'sentiment', 'development'],
    labels: { environment: 'development', team: 'nlp' }
  }
];

const generateIntelligenceAgents = (): IntelligenceAgent[] => [
  {
    id: 'agent-001',
    name: 'Classification Coordinator',
    description: 'Coordinates multiple classification models for optimal results',
    type: 'collaborative',
    category: 'coordinator',
    status: 'active',
    capabilities: [],
    models: ['model-001', 'model-003'],
    workflows: ['workflow-001'],
    coordination: {} as AgentCoordination,
    communication: {} as AgentCommunication,
    learning: {} as AgentLearning,
    adaptation: {} as AgentAdaptation,
    autonomy: {} as AgentAutonomy,
    collaboration: {} as AgentCollaboration,
    performance: {} as AgentPerformance,
    monitoring: {} as AgentMonitoring,
    security: {} as AgentSecurity,
    governance: {} as AgentGovernance,
    lifecycle: {} as AgentLifecycle,
    metadata: {} as AgentMetadata,
    created: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 30 * 60 * 1000),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['coordinator', 'classification'],
    labels: { role: 'coordinator', priority: 'high' }
  },
  {
    id: 'agent-002',
    name: 'Performance Optimizer',
    description: 'Monitors and optimizes model performance across the system',
    type: 'autonomous',
    category: 'optimizer',
    status: 'busy',
    capabilities: [],
    models: ['model-001', 'model-002', 'model-003'],
    workflows: ['workflow-002'],
    coordination: {} as AgentCoordination,
    communication: {} as AgentCommunication,
    learning: {} as AgentLearning,
    adaptation: {} as AgentAdaptation,
    autonomy: {} as AgentAutonomy,
    collaboration: {} as AgentCollaboration,
    performance: {} as AgentPerformance,
    monitoring: {} as AgentMonitoring,
    security: {} as AgentSecurity,
    governance: {} as AgentGovernance,
    lifecycle: {} as AgentLifecycle,
    metadata: {} as AgentMetadata,
    created: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updated: new Date(Date.now() - 15 * 60 * 1000),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['optimizer', 'performance'],
    labels: { role: 'optimizer', priority: 'medium' }
  }
];

const generateCoordinationMetrics = () => ({
  totalModels: 15,
  activeModels: 12,
  totalAgents: 8,
  activeAgents: 6,
  orchestrations: 5,
  pipelines: 3,
  coordinationEfficiency: 94.2,
  systemPerformance: 91.8,
  resourceUtilization: 87.5,
  errorRate: 2.3,
  throughput: 1250,
  latency: 45.7
});

const generatePerformanceData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      hour: hour.getHours(),
      throughput: Math.floor(800 + Math.random() * 600),
      latency: Math.floor(30 + Math.random() * 40),
      accuracy: 90 + Math.random() * 8,
      efficiency: 85 + Math.random() * 12
    });
  }
  return data;
};

const generateModelDistribution = () => [
  { name: 'Classification', value: 35, color: CHART_COLORS[0] },
  { name: 'NLP', value: 25, color: CHART_COLORS[1] },
  { name: 'Vision', value: 20, color: CHART_COLORS[2] },
  { name: 'Regression', value: 12, color: CHART_COLORS[3] },
  { name: 'Other', value: 8, color: CHART_COLORS[4] }
];

const generateCoordinationFlow = () => [
  { source: 'Data Input', target: 'Preprocessing', value: 100 },
  { source: 'Preprocessing', target: 'Model Selection', value: 95 },
  { source: 'Model Selection', target: 'Classification', value: 90 },
  { source: 'Model Selection', target: 'NLP Analysis', value: 85 },
  { source: 'Classification', target: 'Validation', value: 85 },
  { source: 'NLP Analysis', target: 'Validation', value: 80 },
  { source: 'Validation', target: 'Output', value: 82 }
];

// Main Component
export const IntelligenceCoordinator: React.FC = () => {
  // State Management
  const [state, setState] = useState<IntelligenceCoordinatorState>({
    isLoading: false,
    error: null,
    models: generateIntelligenceModels(),
    agents: generateIntelligenceAgents(),
    orchestrations: [],
    pipelines: [],
    coordination: {} as CoordinationMatrix,
    optimization: {} as IntelligenceOptimization,
    monitoring: {} as IntelligenceMonitoring,
    analytics: {} as IntelligenceAnalytics,
    governance: {} as IntelligenceGovernance,
    security: {} as IntelligenceSecurity,
    collaboration: {} as IntelligenceCollaboration,
    automation: {} as IntelligenceAutomation,
    integration: {} as IntelligenceIntegration,
    performance: {} as IntelligencePerformance,
    quality: {} as IntelligenceQuality,
    compliance: {} as IntelligenceCompliance,
    realTimeMode: true,
    autoCoordination: true,
    selectedModel: null,
    selectedAgent: null,
    selectedOrchestration: null,
    filterCriteria: {} as IntelligenceFilter,
    viewMode: 'overview',
    sortOrder: 'updated'
  });

  // Custom hooks
  const { classifications, updateClassification } = useClassificationState();
  const { aiModels, aiAgents, startIntelligence, stopIntelligence } = useAIIntelligence();

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // Memoized data
  const coordinationMetrics = useMemo(() => generateCoordinationMetrics(), []);
  const performanceData = useMemo(() => generatePerformanceData(), []);
  const modelDistribution = useMemo(() => generateModelDistribution(), []);
  const coordinationFlow = useMemo(() => generateCoordinationFlow(), []);

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
      websocketRef.current = websocketApi.connect('intelligence-coordinator');
      
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
      const [modelsData, agentsData, orchestrationsData] = await Promise.all([
        aiApi.getIntelligenceModels(),
        aiApi.getIntelligenceAgents(),
        aiApi.getOrchestrations()
      ]);

      setState(prev => ({
        ...prev,
        models: modelsData,
        agents: agentsData,
        orchestrations: orchestrationsData,
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
      models: data.models || prev.models,
      agents: data.agents || prev.agents,
      orchestrations: data.orchestrations || prev.orchestrations
    }));
  }, []);

  const handleStartModel = useCallback(async (modelId: string) => {
    try {
      await aiApi.startModel(modelId);
      setState(prev => ({
        ...prev,
        models: prev.models.map(model => 
          model.id === modelId ? { ...model, status: 'ready' } : model
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start model'
      }));
    }
  }, []);

  const handleStopModel = useCallback(async (modelId: string) => {
    try {
      await aiApi.stopModel(modelId);
      setState(prev => ({
        ...prev,
        models: prev.models.map(model => 
          model.id === modelId ? { ...model, status: 'retired' } : model
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop model'
      }));
    }
  }, []);

  const handleOptimizeCoordination = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await aiApi.optimizeCoordination();
      // Refresh data after optimization
      await handleRefreshData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize coordination',
        isLoading: false
      }));
    }
  }, [handleRefreshData]);

  const handleCreateOrchestration = useCallback(async (type: OrchestrationType) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const orchestration = await aiApi.createOrchestration({ type });
      setState(prev => ({
        ...prev,
        orchestrations: [...prev.orchestrations, orchestration],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create orchestration',
        isLoading: false
      }));
    }
  }, []);

  // Utility functions
  const getStatusIcon = (status: ModelStatus | AgentStatus | OrchestrationStatus | PipelineStatus) => {
    switch (status) {
      case 'active':
      case 'ready':
      case 'deployed':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'training':
      case 'busy':
      case 'executing':
      case 'optimizing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'error':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'maintenance':
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'retired':
      case 'offline':
      case 'stopped':
        return <Stop className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatAccuracy = (accuracy: number): string => {
    return `${accuracy.toFixed(1)}%`;
  };

  const getTypeIcon = (type: ModelType | AgentType) => {
    const typeIconMap = {
      classification: Tag,
      regression: TrendingUp,
      clustering: Grid,
      nlp: MessageSquare,
      vision: Eye,
      speech: Mic,
      recommendation: Star,
      reactive: Zap,
      deliberative: Brain,
      hybrid: Network,
      learning: Lightbulb,
      collaborative: Users,
      autonomous: Bot
    };
    const IconComponent = typeIconMap[type] || Info;
    return <IconComponent className="h-4 w-4" />;
  };

  // Render functions
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Coordination Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coordinationMetrics.activeModels}</div>
            <p className="text-xs text-muted-foreground">
              of {coordinationMetrics.totalModels} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coordinationMetrics.activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              of {coordinationMetrics.totalAgents} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coordination Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coordinationMetrics.coordinationEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              System performance: {coordinationMetrics.systemPerformance}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coordinationMetrics.throughput.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Latency: {coordinationMetrics.latency}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Real-Time Performance</span>
          </CardTitle>
          <CardDescription>
            24-hour coordination performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="throughput" fill={CHART_COLORS[0]} stroke={CHART_COLORS[0]} fillOpacity={0.3} />
                <Line type="monotone" dataKey="accuracy" stroke={CHART_COLORS[1]} strokeWidth={2} />
                <Bar dataKey="latency" fill={CHART_COLORS[2]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Model Distribution and Coordination Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Model Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modelDistribution.map((entry, index) => (
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
              <GitBranch className="h-5 w-5" />
              <span>Coordination Matrix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{coordinationMetrics.orchestrations}</div>
                  <div className="text-sm text-blue-800">Orchestrations</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{coordinationMetrics.pipelines}</div>
                  <div className="text-sm text-green-800">Pipelines</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{coordinationMetrics.resourceUtilization}%</div>
                  <div className="text-sm text-purple-800">Utilization</div>
                </div>
              </div>
              <div className="text-center">
                <Button onClick={handleOptimizeCoordination} disabled={state.isLoading}>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Coordination
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Model Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              className="w-64"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {MODEL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Deploy Model
        </Button>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.models.map((model) => (
          <Card key={model.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(model.type)}
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                </div>
                <Badge className={STATUS_COLORS[model.status]}>
                  {model.status}
                </Badge>
              </div>
              <CardDescription>{model.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <span className="font-medium">{formatAccuracy(model.accuracy)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="font-medium">{model.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{model.type}</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
                <div className="flex items-center space-x-2">
                  {model.status === 'deployed' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopModel(model.id)}
                    >
                      <Stop className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartModel(model.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Deploy
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Monitor
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

  const renderAgentsTab = () => (
    <div className="space-y-6">
      {/* Agent Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="w-64"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {AGENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 gap-4">
        {state.agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(agent.status)}
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={STATUS_COLORS[agent.status]}>
                    {agent.status}
                  </Badge>
                  {getTypeIcon(agent.type)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium capitalize">{agent.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium capitalize">{agent.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Models</div>
                  <div className="font-medium">{agent.models.length}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Monitor
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderOrchestrationTab = () => (
    <div className="space-y-6">
      {/* Orchestration Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium">Intelligence Orchestration</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select orchestration type" />
            </SelectTrigger>
            <SelectContent>
              {ORCHESTRATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => handleCreateOrchestration('adaptive')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Orchestration
          </Button>
        </div>
      </div>

      {/* Orchestration Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ORCHESTRATION_TYPES.map((type) => (
          <Card key={type.value} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCreateOrchestration(type.value)}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Workflow className="h-5 w-5" />
                <span>{type.label}</span>
              </CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>Best for:</strong>
                  {type.value === 'sequential' && ' Step-by-step processing'}
                  {type.value === 'parallel' && ' High-throughput scenarios'}
                  {type.value === 'pipeline' && ' Data transformation workflows'}
                  {type.value === 'ensemble' && ' Model combination strategies'}
                  {type.value === 'hierarchical' && ' Complex multi-level tasks'}
                  {type.value === 'adaptive' && ' Dynamic optimization needs'}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Orchestrations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Orchestrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Workflow className="h-12 w-12 mx-auto mb-4" />
            <p>No active orchestrations</p>
            <p className="text-sm">Create your first orchestration to coordinate intelligence models</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoordinationTab = () => (
    <div className="space-y-6">
      {/* Coordination Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Coordination Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-coordination">Auto Coordination</Label>
            <Switch
              id="auto-coordination"
              checked={state.autoCoordination}
              onCheckedChange={(checked) => setState(prev => ({ ...prev, autoCoordination: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="real-time-optimization">Real-time Optimization</Label>
            <Switch id="real-time-optimization" checked={true} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="conflict-resolution">Automatic Conflict Resolution</Label>
            <Switch id="conflict-resolution" checked={true} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coordination-threshold">Coordination Threshold (%)</Label>
              <Slider
                id="coordination-threshold"
                min={0}
                max={100}
                step={5}
                value={[85]}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="optimization-interval">Optimization Interval (minutes)</Label>
              <Slider
                id="optimization-interval"
                min={1}
                max={60}
                step={1}
                value={[15]}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordination Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Coordination Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Component</th>
                  <th className="text-center p-3">Models</th>
                  <th className="text-center p-3">Agents</th>
                  <th className="text-center p-3">Workflows</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-right p-3">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">Classification Pipeline</td>
                  <td className="p-3 text-center">3</td>
                  <td className="p-3 text-center">2</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-center">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </td>
                  <td className="p-3 text-right">94.2%</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">NLP Processing</td>
                  <td className="p-3 text-center">2</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-center">2</td>
                  <td className="p-3 text-center">
                    <Badge className="bg-blue-100 text-blue-800">Optimizing</Badge>
                  </td>
                  <td className="p-3 text-right">89.7%</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">Vision Analysis</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-center">
                    <Badge className="bg-yellow-100 text-yellow-800">Training</Badge>
                  </td>
                  <td className="p-3 text-right">76.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { metric: 'CPU', utilization: 75, optimal: 80 },
                { metric: 'Memory', utilization: 68, optimal: 70 },
                { metric: 'GPU', utilization: 82, optimal: 85 },
                { metric: 'Network', utilization: 45, optimal: 60 },
                { metric: 'Storage', utilization: 55, optimal: 65 },
                { metric: 'Bandwidth', utilization: 72, optimal: 75 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current" dataKey="utilization" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
                <Radar name="Optimal" dataKey="optimal" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.1} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
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
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Intelligence Coordinator</h1>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${state.realTimeMode ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span>{state.realTimeMode ? 'Live' : 'Static'}</span>
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <Switch
            checked={state.autoCoordination}
            onCheckedChange={(checked) => setState(prev => ({ ...prev, autoCoordination: checked }))}
          />
          <Label>Auto Coordination</Label>
          
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
            <TabsTrigger value="models" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Models</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>Agents</span>
            </TabsTrigger>
            <TabsTrigger value="orchestration" className="flex items-center space-x-2">
              <Workflow className="h-4 w-4" />
              <span>Orchestration</span>
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
            
            <TabsContent value="models" className="mt-0">
              {renderModelsTab()}
            </TabsContent>
            
            <TabsContent value="agents" className="mt-0">
              {renderAgentsTab()}
            </TabsContent>
            
            <TabsContent value="orchestration" className="mt-0">
              {renderOrchestrationTab()}
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

export default IntelligenceCoordinator;