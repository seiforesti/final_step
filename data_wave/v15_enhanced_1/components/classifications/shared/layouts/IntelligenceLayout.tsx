import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';
import {
  Brain, Bot, Cpu, Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Info, Zap, Target, Network, GitBranch, Layers, Database, Monitor,
  Play, Pause, Stop, RotateCcw, FastForward, Rewind, SkipBack, SkipForward,
  Settings, Eye, Edit, Trash2, Plus, Minus, Download, Upload, Refresh,
  Search, Filter, MoreVertical, Calendar, Clock, Users, Award, Star,
  Lightbulb, Microscope, Telescope, Atom, Fingerprint, QrCode, Barcode,
  ScanLine, Volume2, VolumeX, Maximize, Minimize, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowRight, ArrowLeft,
  CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight, Home,
  Building, Briefcase, Calculator, CreditCard, FileText, Presentation,
  MessageSquare, Mail, Phone, Video, Mic, Camera, Image, File, Folder,
  Archive, Tag, Flag, Map, Navigation, Compass, Route, Grid, List, Table,
  Timeline, Chart, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Package, Server, Cloud, HardDrive, Wifi, Bluetooth, Smartphone, Laptop,
  Desktop, Tablet, Watch, Headphones, Speaker, Gamepad2, Joystick, Rocket,
  Satellite, Radar, Dna, Shield, Lock, Unlock, Bell, Globe, Workflow
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { toast } from 'sonner';

// Import custom hooks and APIs
import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { useRealTimeMonitoring } from '../core/hooks/useRealTimeMonitoring';
import { useWorkflowOrchestration } from '../core/hooks/useWorkflowOrchestration';
import { mlApi } from '../../core/api/mlApi';
import { aiApi } from '../../core/api/aiApi';
import { websocketApi } from '../../core/api/websocketApi';

// Advanced TypeScript interfaces for intelligence layout
interface IntelligenceLayoutProps {
  children: React.ReactNode;
  type: 'ml' | 'ai';
  component: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  modelInfo?: ModelInfo;
  trainingStatus?: TrainingStatus;
  inferenceMetrics?: InferenceMetrics;
  realTimeEnabled?: boolean;
  monitoringEnabled?: boolean;
  autoScalingEnabled?: boolean;
  explainabilityEnabled?: boolean;
  className?: string;
}

interface ModelInfo {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'cv' | 'llm';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'huggingface' | 'openai';
  status: 'training' | 'trained' | 'deployed' | 'failed' | 'stopped';
  accuracy?: number;
  loss?: number;
  f1Score?: number;
  precision?: number;
  recall?: number;
  auc?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

interface TrainingStatus {
  isTraining: boolean;
  currentEpoch?: number;
  totalEpochs?: number;
  progress: number;
  estimatedTimeRemaining?: string;
  currentLoss?: number;
  bestLoss?: number;
  learningRate?: number;
  batchSize?: number;
  trainingAccuracy?: number;
  validationAccuracy?: number;
  gpuUtilization?: number;
  memoryUsage?: number;
  logs: TrainingLog[];
}

interface TrainingLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  metrics?: Record<string, number>;
}

interface InferenceMetrics {
  requestsPerSecond: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
  queueLength: number;
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage?: number;
}

interface AIConversation {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  messages: AIMessage[];
  context: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  reasoning?: string[];
  confidence?: number;
}

interface ExplainabilityData {
  featureImportance: FeatureImportance[];
  shap: ShapValue[];
  lime: LimeExplanation[];
  attentionWeights?: AttentionWeight[];
  saliencyMaps?: SaliencyMap[];
}

interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  type: 'positive' | 'negative';
}

interface ShapValue {
  feature: string;
  shapValue: number;
  baseValue: number;
  contribution: number;
}

interface LimeExplanation {
  feature: string;
  weight: number;
  confidence: number;
}

interface AttentionWeight {
  token: string;
  weight: number;
  position: number;
}

interface SaliencyMap {
  region: string;
  importance: number;
  coordinates: [number, number, number, number];
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

interface ResourceUtilization {
  cpu: number;
  memory: number;
  gpu?: number;
  network: number;
  storage: number;
  timestamp: Date;
}

interface AutoScalingConfig {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  currentInstances: number;
}

export const IntelligenceLayout: React.FC<IntelligenceLayoutProps> = ({
  children,
  type,
  component,
  title,
  description,
  actions,
  sidebar,
  modelInfo,
  trainingStatus,
  inferenceMetrics,
  realTimeEnabled = true,
  monitoringEnabled = true,
  autoScalingEnabled = true,
  explainabilityEnabled = true,
  className
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [monitoringPanelOpen, setMonitoringPanelOpen] = useState(false);
  const [explainabilityPanelOpen, setExplainabilityPanelOpen] = useState(false);
  const [conversationPanelOpen, setConversationPanelOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);
  const [autoScalingConfig, setAutoScalingConfig] = useState<AutoScalingConfig>({
    enabled: false,
    minInstances: 1,
    maxInstances: 10,
    targetCpuUtilization: 70,
    targetMemoryUtilization: 80,
    scaleUpCooldown: 300,
    scaleDownCooldown: 600,
    currentInstances: 1
  });
  const [explainabilityData, setExplainabilityData] = useState<ExplainabilityData | null>(null);
  const [aiConversations, setAiConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Custom hooks
  const {
    models,
    trainingJobs,
    predictions,
    experiments,
    startTraining,
    stopTraining,
    deployModel,
    undeployModel,
    runInference,
    getMetrics,
    optimizeHyperparameters
  } = useMLIntelligence({
    enabled: type === 'ml',
    autoRefresh: true,
    refreshInterval: 5000
  });

  const {
    aiModels,
    conversations,
    knowledgeBase,
    reasoning,
    startConversation,
    sendMessage,
    generateExplanation,
    synthesizeKnowledge,
    optimizeWorkload,
    streamIntelligence
  } = useAIIntelligence({
    enabled: type === 'ai',
    autoRefresh: true,
    refreshInterval: 3000
  });

  const {
    monitoringData,
    systemHealth,
    alerts,
    startMonitoring,
    stopMonitoring
  } = useRealTimeMonitoring({
    enabled: monitoringEnabled,
    interval: 2000,
    metrics: ['cpu', 'memory', 'gpu', 'network', 'latency', 'throughput', 'errors']
  });

  const {
    workflowState,
    currentStep,
    progress,
    executeStep,
    pauseWorkflow,
    resumeWorkflow,
    resetWorkflow
  } = useWorkflowOrchestration({
    enabled: true,
    autoProgress: false,
    stepTimeout: 60000
  });

  // Animation controls
  const headerAnimation = useAnimation();
  const metricsAnimation = useAnimation();
  const panelAnimation = useAnimation();

  // Refs
  const layoutRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<HTMLDivElement>(null);

  // Computed values
  const currentModel = useMemo(() => {
    if (type === 'ml') {
      return models.find(m => m.id === modelInfo?.id) || modelInfo;
    } else {
      return aiModels.find(m => m.id === modelInfo?.id) || modelInfo;
    }
  }, [type, models, aiModels, modelInfo]);

  const isModelActive = useMemo(() => {
    return currentModel?.status === 'training' || currentModel?.status === 'deployed';
  }, [currentModel]);

  const overallHealth = useMemo(() => {
    if (!performanceMetrics.length) return 'unknown';
    const criticalCount = performanceMetrics.filter(m => m.status === 'critical').length;
    const warningCount = performanceMetrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'good';
  }, [performanceMetrics]);

  const currentConversation = useMemo(() => {
    return aiConversations.find(c => c.id === activeConversation);
  }, [aiConversations, activeConversation]);

  // Effects
  useEffect(() => {
    if (realTimeEnabled) {
      websocketApi.connect();
      
      if (type === 'ml') {
        websocketApi.subscribe('ml-metrics', handleMLMetrics);
        websocketApi.subscribe('training-progress', handleTrainingProgress);
        websocketApi.subscribe('inference-metrics', handleInferenceMetrics);
      } else {
        websocketApi.subscribe('ai-conversations', handleAIConversations);
        websocketApi.subscribe('ai-reasoning', handleAIReasoning);
        websocketApi.subscribe('ai-streaming', handleAIStreaming);
      }
      
      websocketApi.subscribe('resource-utilization', handleResourceUtilization);
      websocketApi.subscribe('performance-alerts', handlePerformanceAlerts);
      
      return () => {
        websocketApi.unsubscribe('ml-metrics');
        websocketApi.unsubscribe('training-progress');
        websocketApi.unsubscribe('inference-metrics');
        websocketApi.unsubscribe('ai-conversations');
        websocketApi.unsubscribe('ai-reasoning');
        websocketApi.unsubscribe('ai-streaming');
        websocketApi.unsubscribe('resource-utilization');
        websocketApi.unsubscribe('performance-alerts');
        websocketApi.disconnect();
      };
    }
  }, [realTimeEnabled, type]);

  useEffect(() => {
    if (monitoringEnabled) {
      startMonitoring();
      return () => stopMonitoring();
    }
  }, [monitoringEnabled, startMonitoring, stopMonitoring]);

  useEffect(() => {
    // Animate header based on model status
    if (isModelActive) {
      headerAnimation.start({
        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
        transition: { duration: 0.5 }
      });
    } else {
      headerAnimation.start({
        background: 'linear-gradient(90deg, #6b7280 0%, #4b5563 100%)',
        transition: { duration: 0.5 }
      });
    }
  }, [isModelActive, headerAnimation]);

  useEffect(() => {
    // Auto-scroll streaming content
    if (isStreaming && streamingRef.current) {
      streamingRef.current.scrollTop = streamingRef.current.scrollHeight;
    }
  }, [isStreaming, aiConversations]);

  // Event handlers
  const handleMLMetrics = useCallback((data: any) => {
    setPerformanceMetrics(prev => [...prev.slice(-99), ...data.metrics]);
    
    // Check for critical metrics
    const criticalMetrics = data.metrics.filter((m: PerformanceMetric) => m.status === 'critical');
    if (criticalMetrics.length > 0) {
      toast.error('Critical Performance Alert', {
        description: `${criticalMetrics.length} metrics require immediate attention`
      });
    }
  }, []);

  const handleTrainingProgress = useCallback((data: any) => {
    if (data.status === 'completed') {
      toast.success('Training Completed', {
        description: `Model achieved ${data.accuracy}% accuracy`
      });
    } else if (data.status === 'failed') {
      toast.error('Training Failed', {
        description: data.error || 'Training process encountered an error'
      });
    }
  }, []);

  const handleInferenceMetrics = useCallback((data: any) => {
    // Update inference metrics in real-time
    // This would trigger re-renders of metric displays
  }, []);

  const handleAIConversations = useCallback((data: any) => {
    setAiConversations(prev => {
      const existing = prev.find(c => c.id === data.id);
      if (existing) {
        return prev.map(c => c.id === data.id ? { ...c, ...data } : c);
      } else {
        return [...prev, data];
      }
    });
  }, []);

  const handleAIReasoning = useCallback((data: any) => {
    if (data.type === 'explanation-ready') {
      setExplainabilityData(data.explanation);
      toast.success('Explanation Generated', {
        description: 'AI reasoning explanation is now available'
      });
    }
  }, []);

  const handleAIStreaming = useCallback((data: any) => {
    setIsStreaming(data.streaming);
    
    if (data.message && activeConversation) {
      setAiConversations(prev => prev.map(conv => {
        if (conv.id === activeConversation) {
          const lastMessage = conv.messages[conv.messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            // Append to existing message
            return {
              ...conv,
              messages: [
                ...conv.messages.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + data.message }
              ]
            };
          } else {
            // Add new message
            return {
              ...conv,
              messages: [...conv.messages, {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                confidence: data.confidence
              }]
            };
          }
        }
        return conv;
      }));
    }
  }, [activeConversation]);

  const handleResourceUtilization = useCallback((data: ResourceUtilization) => {
    setResourceUtilization(prev => [...prev.slice(-99), data]);
    
    // Auto-scaling logic
    if (autoScalingEnabled && autoScalingConfig.enabled) {
      const { cpu, memory } = data;
      const { targetCpuUtilization, targetMemoryUtilization, currentInstances, maxInstances, minInstances } = autoScalingConfig;
      
      if ((cpu > targetCpuUtilization || memory > targetMemoryUtilization) && currentInstances < maxInstances) {
        // Scale up
        toast.info('Auto-scaling Up', {
          description: `Scaling from ${currentInstances} to ${currentInstances + 1} instances`
        });
      } else if (cpu < targetCpuUtilization * 0.5 && memory < targetMemoryUtilization * 0.5 && currentInstances > minInstances) {
        // Scale down
        toast.info('Auto-scaling Down', {
          description: `Scaling from ${currentInstances} to ${currentInstances - 1} instances`
        });
      }
    }
  }, [autoScalingEnabled, autoScalingConfig]);

  const handlePerformanceAlerts = useCallback((alert: any) => {
    toast.error('Performance Alert', {
      description: alert.message,
      action: {
        label: 'View Details',
        onClick: () => setMonitoringPanelOpen(true)
      }
    });
  }, []);

  const handleStartTraining = useCallback(async () => {
    try {
      if (type === 'ml' && currentModel) {
        // Use ML API directly for training operations
        const response = await mlApi.startTraining(currentModel.id, 'default-dataset-id', {
          algorithm: 'auto',
          hyperparameters: {},
          features: [],
          validationSplit: 0.2,
          crossValidationFolds: 5,
          earlyStoppingPatience: 10,
          maxTrainingTime: 3600,
          autoHyperparameterTuning: true,
          preprocessing: {
            scaleFeatures: true,
            handleMissingValues: 'mean',
            encodeCategorical: 'onehot',
            featureSelection: true
          }
        });
        
        toast.success('Training Started', {
          description: `Training job ${response.data.id} has been initiated`
        });
      }
    } catch (error) {
      toast.error('Training Failed to Start', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [type, currentModel]);

  const handleStopTraining = useCallback(async () => {
    try {
      if (type === 'ml' && currentModel) {
        // Use ML API directly for stopping training
        await mlApi.stopTraining(currentModel.id);
        toast.success('Training Stopped', {
          description: 'Model training has been stopped'
        });
      }
    } catch (error) {
      toast.error('Failed to Stop Training', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [type, currentModel]);

  const handleDeployModel = useCallback(async () => {
    try {
      if (currentModel) {
        if (type === 'ml') {
          // Use ML API directly for deployment
          const response = await mlApi.deployModel(currentModel.id, 'production', {
            replicas: 2,
            autoScaling: {
              enabled: true,
              minReplicas: 1,
              maxReplicas: 5,
              targetCpuUtilization: 70,
              targetMemoryUtilization: 80
            },
            healthCheck: {
              enabled: true,
              endpoint: '/health',
              interval: 30,
              timeout: 5,
              retries: 3
            },
            monitoring: {
              enabled: true,
              metricsEndpoint: '/metrics',
              alerting: true
            },
            resources: {
              cpu: '1000m',
              memory: '2Gi'
            }
          });
          
          toast.success('Model Deployed', {
            description: `Model deployed to ${response.data.endpoint}`
          });
        }
      }
    } catch (error) {
      toast.error('Deployment Failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [type, currentModel]);

  const handleStartAIConversation = useCallback(async () => {
    try {
      if (type === 'ai') {
        // Use AI API directly for conversation management
        const response = await aiApi.createConversation({
          title: `New Conversation - ${new Date().toLocaleTimeString()}`,
          modelId: currentModel?.id || 'default-ai-model',
          context: {
            domain: 'classification',
            purpose: 'data_governance',
            classification: component,
            entities: [],
            topics: ['data classification', 'governance', 'compliance'],
            sentiment: {
              overall: 'neutral',
              confidence: 0.8,
              scores: { positive: 0.3, negative: 0.2, neutral: 0.5 },
              emotions: []
            },
            intent: {
              primary: 'assistance',
              confidence: 0.9,
              alternatives: [],
              parameters: {}
            },
            knowledgeBase: ['classification_rules', 'compliance_policies'],
            constraints: [],
            preferences: {}
          },
          settings: {
            maxMessages: 100,
            autoSave: true,
            enableReasoning: true,
            enableCitations: true,
            enableMultimodal: false,
            privacyMode: false,
            collaborativeMode: false,
            realTimeTranscription: false
          }
        });
        
        setAiConversations(prev => [...prev, response.data]);
        setActiveConversation(response.data.id);
        setConversationPanelOpen(true);
        
        toast.success('AI Conversation Started', {
          description: 'Ready to assist with intelligent insights'
        });
      }
    } catch (error) {
      toast.error('Failed to Start Conversation', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [type, component, currentModel]);

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      if (type === 'ai' && activeConversation) {
        // Add user message immediately
        const userMessage: AIMessage = {
          id: `msg-${Date.now()}`,
          conversationId: activeConversation,
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        };
        
        setAiConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages: [...conv.messages, userMessage] }
            : conv
        ));
        
        // Send to AI service using streaming
        setIsStreaming(true);
        await aiApi.streamMessage(
          activeConversation, 
          message, 
          (chunk: string) => {
            // Update the last assistant message or create new one
            setAiConversations(prev => prev.map(conv => {
              if (conv.id === activeConversation) {
                const lastMessage = conv.messages[conv.messages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  // Append to existing message
                  return {
                    ...conv,
                    messages: [
                      ...conv.messages.slice(0, -1),
                      { ...lastMessage, content: lastMessage.content + chunk }
                    ]
                  };
                } else {
                  // Create new assistant message
                  return {
                    ...conv,
                    messages: [...conv.messages, {
                      id: `msg-${Date.now()}`,
                      conversationId: activeConversation,
                      role: 'assistant',
                      content: chunk,
                      timestamp: new Date().toISOString()
                    }]
                  };
                }
              }
              return conv;
            }));
          },
          {
            enableReasoning: true,
            enableCitations: true,
            temperature: 0.7,
            maxTokens: 1000
          }
        );
        
        setIsStreaming(false);
      }
    } catch (error) {
      setIsStreaming(false);
      toast.error('Failed to Send Message', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [type, activeConversation]);

  const handleGenerateExplanation = useCallback(async () => {
    try {
      if (currentModel) {
        // Use appropriate API based on model type
        let explanation;
        if (type === 'ml') {
          const response = await mlApi.explainPrediction(currentModel.id, {
            sample_data: 'example_input'
          });
          explanation = response.data;
        } else {
          const response = await aiApi.generateExplanation(currentModel.id, {
            sample_input: 'example_input'
          }, {
            type: 'comprehensive',
            includeVisualization: true,
            maxLength: 1000
          });
          explanation = response.data;
        }
        
        // Transform explanation data to match expected format
        const explainabilityData = {
          featureImportance: explanation.featureImportance || [],
          shap: explanation.shap || [],
          lime: explanation.lime || [],
          attentionWeights: explanation.attentionWeights || [],
          saliencyMaps: explanation.saliencyMaps || []
        };
        
        setExplainabilityData(explainabilityData);
        setExplainabilityPanelOpen(true);
        
        toast.success('Explanation Generated', {
          description: 'Model explanation is now available'
        });
      }
    } catch (error) {
      toast.error('Failed to Generate Explanation', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [currentModel, type]);

  // Render helpers
  const renderModelStatus = () => {
    if (!currentModel) return null;

    const statusColor = {
      'training': 'bg-blue-500',
      'trained': 'bg-green-500',
      'deployed': 'bg-emerald-500',
      'failed': 'bg-red-500',
      'stopped': 'bg-gray-500'
    }[currentModel.status];

    return (
      <div className="flex items-center space-x-3">
        <div className={cn("w-3 h-3 rounded-full", statusColor)} />
        <div>
          <h3 className="font-semibold text-lg">{currentModel.name}</h3>
          <p className="text-sm text-muted-foreground">
            {currentModel.framework} • v{currentModel.version} • {currentModel.status}
          </p>
        </div>
      </div>
    );
  };

  const renderTrainingProgress = () => {
    if (!trainingStatus?.isTraining) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleStopTraining}>
                <Stop className="h-4 w-4" />
                Stop
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Epoch {trainingStatus.currentEpoch || 0} of {trainingStatus.totalEpochs || 0}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(trainingStatus.progress)}%
              </span>
            </div>
            <Progress value={trainingStatus.progress} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Current Loss:</span>
                <span className="ml-2 font-medium">{trainingStatus.currentLoss?.toFixed(4) || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Best Loss:</span>
                <span className="ml-2 font-medium">{trainingStatus.bestLoss?.toFixed(4) || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Learning Rate:</span>
                <span className="ml-2 font-medium">{trainingStatus.learningRate?.toExponential(2) || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">GPU Usage:</span>
                <span className="ml-2 font-medium">{trainingStatus.gpuUtilization || 0}%</span>
              </div>
            </div>
            
            {trainingStatus.estimatedTimeRemaining && (
              <p className="text-sm text-muted-foreground">
                Estimated time remaining: {trainingStatus.estimatedTimeRemaining}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics.length) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {performanceMetrics.slice(0, 8).map(metric => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">
                    {metric.value.toLocaleString()}{metric.unit}
                  </p>
                </div>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  metric.status === 'good' && "bg-green-500",
                  metric.status === 'warning' && "bg-yellow-500",
                  metric.status === 'critical' && "bg-red-500"
                )} />
              </div>
              <div className="flex items-center mt-2">
                {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                {metric.trend === 'stable' && <Activity className="h-4 w-4 text-gray-500" />}
                <span className="text-xs text-muted-foreground ml-1">
                  {metric.trend === 'up' ? 'Increasing' : metric.trend === 'down' ? 'Decreasing' : 'Stable'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderResourceUtilizationChart = () => {
    if (!resourceUtilization.length) return null;

    const chartData = resourceUtilization.slice(-20).map(data => ({
      time: data.timestamp.toLocaleTimeString(),
      CPU: data.cpu,
      Memory: data.memory,
      GPU: data.gpu || 0,
      Network: data.network
    }));

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="CPU" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Memory" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="GPU" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Network" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderInferenceMetrics = () => {
    if (!inferenceMetrics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requests/sec</p>
                <p className="text-2xl font-bold">{inferenceMetrics.requestsPerSecond.toFixed(1)}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{inferenceMetrics.averageLatency.toFixed(0)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{(inferenceMetrics.errorRate * 100).toFixed(2)}%</p>
              </div>
              <AlertTriangle className={cn(
                "h-8 w-8",
                inferenceMetrics.errorRate > 0.05 ? "text-red-500" : "text-yellow-500"
              )} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Queue Length</p>
                <p className="text-2xl font-bold">{inferenceMetrics.queueLength}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAIConversationPanel = () => {
    if (type !== 'ai' || !conversationPanelOpen) return null;

    return (
      <Sheet open={conversationPanelOpen} onOpenChange={setConversationPanelOpen}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>AI Conversation</SheetTitle>
            <SheetDescription>
              Intelligent assistance and insights
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-col h-full mt-6">
            {/* Conversation List */}
            <div className="mb-4">
              <Button
                size="sm"
                onClick={handleStartAIConversation}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
            
            {aiConversations.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm font-medium">Active Conversations</Label>
                <ScrollArea className="h-24 mt-2">
                  {aiConversations.map(conv => (
                    <Button
                      key={conv.id}
                      variant={activeConversation === conv.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start mb-1"
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {conv.title}
                    </Button>
                  ))}
                </ScrollArea>
              </div>
            )}
            
            {/* Messages */}
            {currentConversation && (
              <>
                <ScrollArea className="flex-1 mb-4" ref={streamingRef}>
                  <div className="space-y-3">
                    {currentConversation.messages.map(message => (
                      <div
                        key={message.id}
                        className={cn(
                          "p-3 rounded-lg",
                          message.role === 'user' ? "bg-primary text-primary-foreground ml-4" : "bg-muted mr-4"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            {message.reasoning && (
                              <div className="mt-2 text-xs opacity-75">
                                <details>
                                  <summary>Reasoning</summary>
                                  <ul className="list-disc list-inside mt-1">
                                    {message.reasoning.map((reason, idx) => (
                                      <li key={idx}>{reason}</li>
                                    ))}
                                  </ul>
                                </details>
                              </div>
                            )}
                          </div>
                          {message.confidence && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {Math.round(message.confidence * 100)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs opacity-50 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                    {isStreaming && (
                      <div className="bg-muted mr-4 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse w-2 h-2 bg-primary rounded-full" />
                          <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.2s' }} />
                          <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.4s' }} />
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask anything..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          handleSendMessage(input.value);
                          input.value = '';
                        }
                      }
                    }}
                    disabled={isStreaming}
                  />
                  <Button size="sm" disabled={isStreaming}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  const renderExplainabilityPanel = () => {
    if (!explainabilityPanelOpen || !explainabilityData) return null;

    return (
      <Dialog open={explainabilityPanelOpen} onOpenChange={setExplainabilityPanelOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Model Explainability</DialogTitle>
            <DialogDescription>
              Understand how the model makes predictions
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="features">Feature Importance</TabsTrigger>
              <TabsTrigger value="shap">SHAP Values</TabsTrigger>
              <TabsTrigger value="lime">LIME Explanation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="space-y-4">
              <ScrollArea className="h-64">
                {explainabilityData.featureImportance.map(feature => (
                  <div key={feature.feature} className="flex items-center justify-between p-2 border-b">
                    <span className="text-sm font-medium">{feature.feature}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            feature.type === 'positive' ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.abs(feature.importance) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature.importance.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="shap" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={explainabilityData.shap}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="shapValue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="lime" className="space-y-4">
              <ScrollArea className="h-64">
                {explainabilityData.lime.map(explanation => (
                  <div key={explanation.feature} className="flex items-center justify-between p-2 border-b">
                    <span className="text-sm font-medium">{explanation.feature}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={explanation.weight > 0 ? "default" : "destructive"}>
                        {explanation.weight.toFixed(3)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(explanation.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <TooltipProvider>
      <div ref={layoutRef} className={cn("min-h-screen bg-background", className)}>
        {/* Header */}
        <motion.header
          animate={headerAnimation}
          className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {renderModelStatus()}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Control Buttons */}
              {type === 'ml' && (
                <>
                  {trainingStatus?.isTraining ? (
                    <Button size="sm" variant="outline" onClick={handleStopTraining}>
                      <Stop className="h-4 w-4 mr-2" />
                      Stop Training
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleStartTraining}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Training
                    </Button>
                  )}
                  
                  {currentModel?.status === 'trained' && (
                    <Button size="sm" variant="outline" onClick={handleDeployModel}>
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                  )}
                </>
              )}
              
              {type === 'ai' && (
                <Button size="sm" onClick={handleStartAIConversation}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              )}
              
              {explainabilityEnabled && (
                <Button size="sm" variant="outline" onClick={handleGenerateExplanation}>
                  <Microscope className="h-4 w-4 mr-2" />
                  Explain
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMonitoringPanelOpen(!monitoringPanelOpen)}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Monitoring
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              {actions}
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="px-6 py-2 bg-muted/50 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    overallHealth === 'good' && "bg-green-500",
                    overallHealth === 'warning' && "bg-yellow-500",
                    overallHealth === 'critical' && "bg-red-500",
                    overallHealth === 'unknown' && "bg-gray-500"
                  )} />
                  <span className="text-muted-foreground">
                    System: {overallHealth}
                  </span>
                </div>
                
                {autoScalingEnabled && (
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Instances: {autoScalingConfig.currentInstances}
                    </span>
                  </div>
                )}
                
                {realTimeEnabled && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-muted-foreground">Real-time</span>
                  </div>
                )}
              </div>
              
              <div className="text-muted-foreground">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </motion.header>
        
        {/* Main Content */}
        <main className="px-6 py-6">
          {/* Training Progress */}
          {renderTrainingProgress()}
          
          {/* Performance Metrics */}
          {renderPerformanceMetrics()}
          
          {/* Inference Metrics */}
          {renderInferenceMetrics()}
          
          {/* Resource Utilization Chart */}
          {renderResourceUtilizationChart()}
          
          {/* Main Content Area */}
          <div className="flex gap-6">
            <div className="flex-1">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Loading intelligence...</p>
                    </div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>
            
            {sidebar && (
              <div className="w-80 space-y-4">
                {sidebar}
              </div>
            )}
          </div>
        </main>
        
        {/* AI Conversation Panel */}
        {renderAIConversationPanel()}
        
        {/* Explainability Panel */}
        {renderExplainabilityPanel()}
      </div>
    </TooltipProvider>
  );
};

export default IntelligenceLayout;