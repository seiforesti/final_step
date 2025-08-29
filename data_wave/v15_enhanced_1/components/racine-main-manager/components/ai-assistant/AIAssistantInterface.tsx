'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mic, MicOff, Send, Sparkles, Brain, Zap, Settings, Maximize2, Minimize2, X, Plus, FileText, Database, Shield, BarChart3, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Search, Filter, Download, Upload, Share, Bookmark, History, Lightbulb, Target, Workflow, Bot, User, Loader2, ChevronUp, ChevronDown, Play, Pause, Volume2, VolumeX, RefreshCw, HelpCircle, Star, ThumbsUp, ThumbsDown, Copy, ExternalLink, Globe, Lock, Unlock, Eye, EyeOff, Calendar, Tag, Link, Archive, Trash2, Edit3, Save, Undo, Redo, Code, Terminal, Activity, PieChart, BarChart, LineChart, Map, Layers, Grid, List, Table, Layout, Sidebar, Monitor, Smartphone, Tablet, Laptop, Server, Cloud, Wifi, WifiOff, Battery, BatteryLow, Power, PowerOff, Cpu, HardDrive, Network, Gauge, Radar, Sliders, Command, Boxes, GitBranch, Rocket, Beaker, FlaskConical, Microscope, TestTube, Atom, Dna, CircuitBoard, Router, Satellite, Antenna, Radio, Signal, Bluetooth, Cast, MonitorSpeaker, Headphones, Gamepad2, Joystick, MousePointer, Keyboard, Printer, Webcam, Camera, Video, Film, Image, Palette, Brush, Pen, Pencil, Eraser, Ruler, Compass, Calculator, Binary, Hash, Percent, DollarSign, Euro, Bitcoin, CreditCard, Wallet, ShoppingCart, ShoppingBag, Package, Truck, Plane, Ship, Car, Bike, Bus, Train, Fuel, MapPin, Navigation, Compass as CompassIcon, Route, TrafficCone, Construction, Building, Home, Store, Factory, Warehouse, School, Church, Hotel, Theater, Mountain, Trees, Flower, Sun, Moon, Star as StarIcon, Cloud as CloudIcon, CloudRain, CloudSnow, CloudLightning, Umbrella, Thermometer, Wind, Waves, Flame, Snowflake, Droplets, Zap as ZapIcon } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useCollaboration } from '../../hooks/useCollaboration';

// Types
import { 
  AIAssistantState,
  AIConversation,

  AIRecommendation,
  AIContext,
  AICapability,
  AIPersonality,
  AIKnowledgeBase,
  AILearningData,
  ContextAwareResponse,
  ProactiveInsight,
  AutomationSuggestion,
  WorkflowRecommendation
} from '../../types/ai-assistant.types';

import {
  SPAContext,
  SystemHealth,
  CrossGroupWorkflow,
  UserPermissions,
  WorkspaceContext,
  ActivityContext,
  StepType,
  BackoffStrategy,
  ConditionType,
  OperationStatus
} from '../../types/racine-core.types';

import { WorkflowPriority, OptimizationScope } from '../../types/api.types';

import { AIMessage } from '../../types/ai-assistant.types';

// Utilities
import {
  formatAIResponse,
  parseNaturalLanguage,
  generateProactiveInsights,
  analyzeUserIntent,
  optimizeAIPerformance
} from '../../utils/ai-assistant-utils';

import {
  validateCrossGroupOperation,
  coordinateWorkflowExecution,
  monitorSystemPerformance
} from '../../utils/cross-group-orchestrator';

// Constants
import {
  AI_ASSISTANT_CONFIG,
  AI_CAPABILITIES,
  AI_PERSONALITIES,
  CONVERSATION_SETTINGS,
  PROACTIVE_INSIGHTS_CONFIG
} from '../../constants/ai-assistant-constants';

interface AIAssistantInterfaceProps {
  className?: string;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  initialContext?: Partial<AIContext>;
  customCapabilities?: AICapability[];
  onRecommendationExecute?: (recommendation: AIRecommendation) => void;
  onWorkflowCreate?: (workflow: CrossGroupWorkflow) => void;
  
  // Additional props for advanced functionality
  mode?: 'full-interface' | 'basic-interface' | 'chat-only' | 'assistant-only';
  enableNaturalLanguageQueries?: boolean;
  enableContextAwareness?: boolean;
  enableProactiveGuidance?: boolean;
  enableWorkflowAutomation?: boolean;
  enableAnomalyDetection?: boolean;
  enablePredictiveAnalytics?: boolean;
  enableCrossGroupInsights?: boolean;
  enableSmartRecommendations?: boolean;
  enableConversationHistory?: boolean;
  enableNotifications?: boolean;
  showSystemContext?: boolean;
  showRecommendations?: boolean;
  showInsights?: boolean;
  showQuickActions?: boolean;
  showConversationHistory?: boolean;
}

interface ConversationThreadProps {
  conversation: any;
  onMessageSend: (message: string) => void;
  onRecommendationExecute: (recommendation: AIRecommendation) => void;
  isLoading: boolean;
}

interface AICapabilitiesPanelProps {
  capabilities: AICapability[];
  onCapabilityToggle: (capabilityId: string, enabled: boolean) => void;
  onCapabilityConfig: (capabilityId: string, config: any) => void;
}

interface ProactiveInsightsPanelProps {
  insights: any[];
  onInsightDismiss: (insightId: string) => void;
  onInsightExecute: (insight: any) => void;
  onInsightFeedback: (insightId: string, feedback: 'positive' | 'negative', comment?: string) => void;
}

interface AIAnalyticsDashboardProps {
  analytics: any;
  onAnalyticsExport: () => void;
  onLearningDataUpdate: (data: any) => void;
}

interface VoiceControlsProps {
  isVoiceEnabled: boolean;
  isListening: boolean;
  onVoiceToggle: () => void;
  onVoiceCommand: (command: string) => void;
  voiceSettings: {
    language: string;
    voice: string;
    speed: number;
    volume: number;
  };
  onVoiceSettingsChange: (settings: any) => void;
}

interface ContextVisualizationProps {
  context: AIContext;
  onContextUpdate: (context: Partial<AIContext>) => void;
  onContextReset: () => void;
}

interface WorkflowAutomationPanelProps {
  automationSuggestions: AutomationSuggestion[];
  workflowRecommendations: WorkflowRecommendation[];
  onAutomationCreate: (automation: AutomationSuggestion) => void;
  onWorkflowCreate: (workflow: WorkflowRecommendation) => void;
}

interface AIPersonalityConfigProps {
  personality: any;
  onPersonalityChange: (personality: any) => void;
  availablePersonalities: any[];
}

interface KnowledgeBaseManagerProps {
  knowledgeBase: AIKnowledgeBase;
  onKnowledgeUpdate: (knowledge: Partial<AIKnowledgeBase>) => void;
  onKnowledgeExport: () => void;
  onKnowledgeImport: (file: File) => void;
}

export const AIAssistantInterface: React.FC<AIAssistantInterfaceProps> = ({
  className = "",
  isExpanded: initialIsExpanded = false,
  onExpandedChange,
  initialContext,
  customCapabilities = [],
  onRecommendationExecute,
  onWorkflowCreate,
  
  // Additional props with defaults
  mode = 'full-interface',
  enableNaturalLanguageQueries = true,
  enableContextAwareness = true,
  enableProactiveGuidance = true,
  enableWorkflowAutomation = true,
  enableAnomalyDetection = true,
  enablePredictiveAnalytics = true,
  enableCrossGroupInsights = true,
  enableSmartRecommendations = true,
  enableConversationHistory = true,
  enableNotifications = true,
  showSystemContext = true,
  showRecommendations = true,
  showInsights = true,
  showQuickActions = true,
  showConversationHistory = true
}) => {
  // Hooks
  const {
    aiState,
    conversation,
    capabilities,
    insights,
    analytics,
    personality,
    knowledgeBase,
    sendMessage,
    executeRecommendation,
    updateCapabilities,
    dismissInsight,
    updatePersonality,
    updateKnowledgeBase,
    resetConversation,
    exportConversation,
    importKnowledgeBase,
    generateProactiveInsights: generateInsights,
    analyzeUserBehavior,
    optimizePerformance: aiOptimizePerformance,
    isLoading,
    error
  } = useAIAssistant('default', { context: 'ai-assistant', currentBreakpoint: 'desktop', deviceType: 'desktop', currentLayout: 'single' });

  const {
    state: orchestrationState,
    executeWorkflow,
    refreshSystemHealth,
    optimizePerformance: optimizeSystem
  } = useRacineOrchestration();

  const systemHealth = orchestrationState.systemHealth;
  const globalMetrics = orchestrationState.currentMetrics;
  const crossGroupWorkflows = orchestrationState.activeWorkflows;
  const orchestrateWorkflow = executeWorkflow;
  const monitorSystem = refreshSystemHealth;

  const {
    state: crossGroupState,
    operations: crossGroupOperations
  } = useCrossGroupIntegration();

  const activeSPAContext = crossGroupState;
  const getAllSPAStatus = crossGroupOperations.getGroupHealth;
  const coordinateNavigation = crossGroupOperations.searchCrossGroups;
  const executeUnifiedSearch = crossGroupOperations.searchCrossGroups;
  const orchestrateExistingSPAs = crossGroupOperations.generateAnalytics;

  const [userState, userOperations] = useUserManagement();
  const currentUser = userState.currentUser;
  const userPermissions = userState.userPermissions;
  const userWorkspaces = userState.userRoles;
  const userAnalytics = userState.userAnalytics;

  const {
    currentWorkspace: activeWorkspace,
    analytics: workspaceAnalytics
  } = useWorkspaceManagement();

  const workspaceContext = activeWorkspace;

  const {
    activities: recentActivities,
    analytics: activityAnalytics,
    logActivity: trackActivity
  } = useActivityTracker();

  const [collaborationState, collaborationOperations] = useCollaboration();
  const activeCollaborations = collaborationState.activeSessions;
  const collaborationInsights = collaborationState.analytics || [];

  // State
  const [isMaximized, setIsMaximized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initialIsExpanded);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'automation' | 'analytics' | 'models' | 'settings'>('chat');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [conversationFilter, setConversationFilter] = useState<'all' | 'recommendations' | 'automations' | 'insights'>('all');
  const [autoInsightsEnabled, setAutoInsightsEnabled] = useState(true);
  const [contextAwarenessLevel, setContextAwarenessLevel] = useState<'basic' | 'advanced' | 'comprehensive'>('advanced');
  const [proactiveMode, setProactiveMode] = useState(true);
  const [learningMode, setLearningMode] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voice: 'neural',
    speed: 1.0,
    volume: 0.8
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceRecognitionRef = useRef<any>(null);

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    recentActivities: (recentActivities || []).slice(0, 10),
    activeCollaborations,
    userPermissions,
    workspaceContext,
    timestamp: new Date(),
    sessionId: crypto.randomUUID(),
    ...initialContext
  }), [currentUser, activeWorkspace, activeSPAContext, systemHealth, recentActivities, activeCollaborations, userPermissions, workspaceContext, initialContext]);

  const filteredMessages = useMemo(() => {
    if (!conversation?.messages) return [];
    
    switch (conversationFilter) {
      case 'recommendations':
        return conversation.messages.filter(msg => msg.role === 'assistant' && msg.actionsSuggested && Object.keys(msg.actionsSuggested).length > 0);
      case 'automations':
        return conversation.messages.filter(msg => msg.role === 'assistant' && msg.actionsSuggested && Object.keys(msg.actionsSuggested).length > 0);
      case 'insights':
        return conversation.messages.filter(msg => msg.role === 'assistant' && msg.intentDetected);
      default:
        return conversation.messages;
    }
  }, [conversation?.messages, conversationFilter]);

  const activeInsights = useMemo(() => {
    return insights.filter(insight => insight.significanceLevel === 'critical' || insight.significanceLevel === 'high');
  }, [insights]);

  const priorityRecommendations = useMemo(() => {
    return conversation?.messages
      ?.filter(msg => msg.role === 'assistant' && msg.confidenceScore && msg.confidenceScore > 0.8)
      .slice(0, 5) || [];
  }, [conversation?.messages]);

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  useEffect(() => {
    if (autoInsightsEnabled && proactiveMode) {
      const interval = setInterval(() => {
        if (currentContext) {
          generateInsights(currentContext);
        }
      }, 30000); // 30 seconds interval

      return () => clearInterval(interval);
    }
  }, [autoInsightsEnabled, proactiveMode, currentContext, generateInsights]);

  useEffect(() => {
    if (learningMode && currentContext) {
      analyzeUserBehavior(currentContext);
    }
  }, [currentContext, learningMode, analyzeUserBehavior]);

  // Handlers
  const handleMessageSend = useCallback(async (message: string) => {
    if (!message.trim()) return;

    try {
      // Create a conversation if none exists
      if (!conversation?.id) {
        // Start a new conversation first
        console.log('No active conversation, message will be queued');
        return;
      }
      
      await sendMessage(conversation.id, {
        message: message,
        context: currentContext
      });
      
      trackActivity({
        type: 'ai_interaction',
        details: {
          messageLength: message.length,
          context: 'ai_assistant',
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage, currentContext, activeSPAContext, trackActivity]);

  const handleRecommendationExecute = useCallback(async (recommendation: AIRecommendation) => {
    try {
      await executeRecommendation(recommendation.id, currentContext);
      onRecommendationExecute?.(recommendation);
      
      trackActivity({
        type: 'ai_recommendation_executed',
        details: {
          recommendationId: recommendation.id,
          category: recommendation.category,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    }
  }, [executeRecommendation, currentContext, onRecommendationExecute, trackActivity]);

  const handleWorkflowCreate = useCallback(async (workflow: WorkflowRecommendation) => {
    try {
      const crossGroupWorkflow: CrossGroupWorkflow = {
        id: crypto.randomUUID(),
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps.map(step => ({
          id: step.id,
          name: step.name,
          description: step.description,
          type: StepType.CUSTOM,
          groupId: 'ai-assistant',
          operation: 'execute',
          parameters: step.parameters,
          inputs: [],
          outputs: [],
          dependencies: step.dependencies,
          timeout: step.timeout || 30000,
          retryPolicy: { enabled: true, maxAttempts: 3, backoffStrategy: BackoffStrategy.EXPONENTIAL, retryableErrors: ['timeout', 'network_error'] },
          condition: { type: ConditionType.ALWAYS, expression: 'true', parameters: {} },
          position: { x: 0, y: 0, width: 100, height: 50 }
        })),
        groups: workflow.involvedSPAs,
        dependencies: [],
        configuration: {},
        lastExecution: new Date().toISOString(),
        executionHistory: [],
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date().toISOString(),
        status: OperationStatus.PENDING
      };

      await orchestrateWorkflow({
        workflowId: crossGroupWorkflow.id,
        parameters: {},
        priority: WorkflowPriority.NORMAL
      });
      onWorkflowCreate?.(crossGroupWorkflow);

      trackActivity({
        type: 'ai_workflow_created',
        details: {
          workflowId: crossGroupWorkflow.id,
          spasInvolved: workflow.involvedSPAs.length,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  }, [orchestrateWorkflow, currentUser, onWorkflowCreate, trackActivity]);

  const handleVoiceToggle = useCallback(() => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isListening) {
      setIsListening(false);
    }
  }, [isVoiceEnabled, isListening]);

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      const intent = await analyzeUserIntent(command);
      
      switch (intent.intent) {
        case 'command':
          await handleMessageSend(command);
          break;
        case 'question':
          await handleMessageSend(command);
          break;
        case 'analysis':
          await handleMessageSend(command);
          break;
        case 'optimization':
          await handleMessageSend(command);
          break;
        case 'help':
          await handleMessageSend(command);
          break;
        default:
          await handleMessageSend(command);
      }
    } catch (error) {
      console.error('Failed to process voice command:', error);
    }
  }, [handleMessageSend]);

  const handleInsightDismiss = useCallback(async (insightId: string) => {
    try {
      await dismissInsight(insightId);
      setSelectedInsights(prev => prev.filter(id => id !== insightId));
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    }
  }, [dismissInsight]);

  const handleCapabilityToggle = useCallback(async (capabilityId: string, enabled: boolean) => {
    try {
      const updatedCapabilities = capabilities.map((cap: AICapability) => 
        cap.id === capabilityId ? { ...cap, enabled } : cap
      );
      await updateCapabilities(updatedCapabilities);
    } catch (error) {
      console.error('Failed to toggle capability:', error);
    }
  }, [capabilities, updateCapabilities]);

  const handlePersonalityChange = useCallback(async (newPersonality: AIPersonality) => {
    try {
      await updatePersonality(newPersonality);
    } catch (error) {
      console.error('Failed to update personality:', error);
    }
  }, [updatePersonality]);

  const handleExportConversation = useCallback(async () => {
    try {
      await exportConversation(conversation?.id || '');
    } catch (error) {
      console.error('Failed to export conversation:', error);
    }
  }, [conversation?.id, exportConversation]);

  const handleOptimizePerformance = useCallback(async () => {
    try {
      // Only call AI optimization, skip system optimization to avoid API errors
      await aiOptimizePerformance();
      
      // Optional: Add a success notification or feedback here
      console.log('AI performance optimization completed successfully');
    } catch (error) {
      console.error('Failed to optimize AI performance:', error);
    }
  }, [aiOptimizePerformance]);

  // Render Methods


  const renderConversationThread = () => {
    if (!conversation) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
            <p className="text-muted-foreground mb-4">
              Begin chatting with your AI assistant to get started.
            </p>
            <Button onClick={() => handleMessageSend("Hello, can you help me?")}>
              Start Chat
            </Button>
          </div>
        </div>
      );
    }

    return (
      <ConversationThread
        conversation={conversation}
        onMessageSend={handleMessageSend}
        onRecommendationExecute={handleRecommendationExecute}
        isLoading={isLoading}
      />
    );
  };

  const renderProactiveInsights = () => (
    <ProactiveInsightsPanel
      insights={activeInsights}
      onInsightDismiss={handleInsightDismiss}
      onInsightExecute={(insight) => {
        // Handle insight execution
      }}
      onInsightFeedback={(insightId, feedback, comment) => {
        // Handle feedback
      }}
    />
  );

  const renderWorkflowAutomation = () => (
    <WorkflowAutomationPanel
      automationSuggestions={[]}
      workflowRecommendations={[]}
      onAutomationCreate={(automation) => {
        // Handle automation creation
      }}
      onWorkflowCreate={handleWorkflowCreate}
    />
  );

  const renderAnalyticsDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Analytics Dashboard</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Response Time</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {analytics?.performance?.responseTime || '1.2'}s
                </p>
              </div>
              <Gauge className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={85} className="h-2" />
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">85% faster than average</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Accuracy</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {analytics?.accuracy || '94.7'}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={94.7} className="h-2" />
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">High confidence responses</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Conversations</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {analytics?.conversations || '1,247'}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-purple-600 dark:text-purple-400">+23% from last week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Success Rate</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {analytics?.successRate || '91.2'}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Progress value={91.2} className="h-2" />
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Task completion rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400">Interactive chart would be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {capabilities?.slice(0, 4).map((capability, index) => (
                <div key={capability.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      capability.enabled ? 'bg-green-500' : 'bg-slate-400'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{capability.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{capability.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {Math.floor(Math.random() * 20) + 80}%
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">efficiency</p>
                  </div>
                </div>
              )) || []}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderModelsPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Models & Capabilities</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and configure AI models and capabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Model
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Active Models
          </CardTitle>
          <CardDescription>
            Select and configure the AI models powering your assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                description: 'Advanced reasoning and analysis',
                status: 'active',
                performance: 95,
                cost: 'High'
              },
              {
                id: 'claude-3-sonnet',
                name: 'Claude 3 Sonnet',
                description: 'Balanced performance and efficiency',
                status: 'standby',
                performance: 88,
                cost: 'Medium'
              },
              {
                id: 'gemini-pro',
                name: 'Gemini Pro',
                description: 'Multimodal capabilities',
                status: 'inactive',
                performance: 82,
                cost: 'Low'
              },
              {
                id: 'custom-model',
                name: 'Custom Enterprise Model',
                description: 'Fine-tuned for your data',
                status: 'training',
                performance: 78,
                cost: 'Variable'
              }
            ].map((model) => (
              <Card key={model.id} className={`border-2 transition-all duration-200 ${
                model.status === 'active' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{model.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{model.description}</p>
                    </div>
                    <Badge 
                      variant={model.status === 'active' ? 'default' : 'secondary'}
                      className={`${
                        model.status === 'active' ? 'bg-green-500 text-white' :
                        model.status === 'standby' ? 'bg-yellow-500 text-white' :
                        model.status === 'training' ? 'bg-blue-500 text-white' :
                        'bg-slate-500 text-white'
                      }`}
                    >
                      {model.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Performance</span>
                      <span className="font-medium">{model.performance}%</span>
                    </div>
                    <Progress value={model.performance} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Cost</span>
                      <span className="font-medium">{model.cost}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant={model.status === 'active' ? 'secondary' : 'default'}
                      className="flex-1"
                    >
                      {model.status === 'active' ? 'Active' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Capabilities Configuration
          </CardTitle>
          <CardDescription>
            Fine-tune AI capabilities and behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities?.map((capability) => (
              <div key={capability.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={capability.enabled} 
                      onCheckedChange={(enabled) => handleCapabilityToggle(capability.id, enabled)}
                    />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">{capability.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{capability.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{capability.category}</Badge>
                </div>
                
                {capability.enabled && (
                  <div className="space-y-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <Label className="text-sm font-medium">Confidence Threshold</Label>
                      <Slider 
                        defaultValue={[75]} 
                        max={100} 
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Priority Level</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )) || []}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsPanel = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Assistant Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Behavior Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="proactive-mode">Proactive Mode</Label>
                <Switch
                  id="proactive-mode"
                  checked={proactiveMode}
                  onCheckedChange={setProactiveMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="learning-mode">Learning Mode</Label>
                <Switch
                  id="learning-mode"
                  checked={learningMode}
                  onCheckedChange={setLearningMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-insights">Auto Insights</Label>
                <Switch
                  id="auto-insights"
                  checked={autoInsightsEnabled}
                  onCheckedChange={setAutoInsightsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Context Awareness</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={contextAwarenessLevel} onValueChange={(value: any) => setContextAwarenessLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <AICapabilitiesPanel
        capabilities={capabilities || []}
        onCapabilityToggle={handleCapabilityToggle}
        onCapabilityConfig={(capabilityId, config) => {
          // Handle capability configuration
        }}
      />

      <AIPersonalityConfig
        personality={personality}
        onPersonalityChange={handlePersonalityChange}
        availablePersonalities={Object.values(AI_PERSONALITIES)}
      />

      <VoiceControls
        isVoiceEnabled={isVoiceEnabled}
        isListening={isListening}
        onVoiceToggle={handleVoiceToggle}
        onVoiceCommand={handleVoiceCommand}
        voiceSettings={voiceSettings}
        onVoiceSettingsChange={setVoiceSettings}
      />

      <KnowledgeBaseManager
        knowledgeBase={knowledgeBase}
        onKnowledgeUpdate={updateKnowledgeBase}
        onKnowledgeExport={() => {
          // Handle knowledge export
        }}
        onKnowledgeImport={importKnowledgeBase}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <motion.div 
        className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl backdrop-blur-sm ${className}`}
        initial={false}
        animate={{
          width: isMaximized ? '100vw' : isExpanded ? '1200px' : '500px',
          height: isMaximized ? '100vh' : isExpanded ? '800px' : '500px'
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Enhanced Header with Databricks Style */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: isLoading ? 360 : 0,
                    scale: aiState?.isTyping ? 1.1 : 1
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: isLoading ? Infinity : 0 },
                    scale: { duration: 0.3 }
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-75 animate-pulse" />
                  <Brain className={`relative h-8 w-8 ${aiState?.isTyping ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'} z-10`} />
                </motion.div>
                {aiState?.isTyping && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-slate-900 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent">
                  AI Data Intelligence
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {personality?.name || 'Enterprise AI Assistant'} • {capabilities?.length || 0} Capabilities Active
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={aiState?.isTyping ? 'default' : 'secondary'}
                className={`px-3 py-1 font-semibold ${aiState?.isTyping ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${aiState?.isTyping ? 'bg-white' : 'bg-slate-500'}`} />
                {aiState?.isTyping ? 'Processing' : 'Ready'}
              </Badge>
              
              {systemHealth && (
                <Badge 
                  variant="outline"
                  className={`px-3 py-1 border-2 ${
                    systemHealth.status === 'healthy' ? 'border-green-500 text-green-700 dark:text-green-400' :
                    systemHealth.status === 'warning' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                    'border-red-500 text-red-700 dark:text-red-400'
                  }`}
                >
                  <Activity className="w-3 h-3 mr-1" />
                  System {systemHealth.status}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Performance Metrics */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {analytics?.performance?.cpu || '45'}%
              </span>
              <HardDrive className="w-4 h-4 text-green-600 ml-2" />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {analytics?.performance?.memory || '2.1'}GB
              </span>
            </div>

            {/* Voice Controls */}
            {isVoiceEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isListening ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsListening(!isListening)}
                    className={`gap-2 transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <Mic className="h-4 w-4 animate-pulse" />
                        <span className="hidden sm:inline">Listening</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="h-4 w-4" />
                        <span className="hidden sm:inline">Voice</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? 'Stop listening' : 'Start voice input'}
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOptimizePerformance}
                    className="hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                  >
                    <Rocket className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Optimize Performance</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportConversation}
                    className="hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Conversation</TooltipContent>
              </Tooltip>
            </div>

            {/* Layout Controls */}
            <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-600 pl-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isExpanded ? 'Compact View' : 'Expanded View'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {isMaximized ? <Monitor className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMaximized ? 'Windowed Mode' : 'Fullscreen Mode'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Enhanced Content with Databricks-style Navigation */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1">
            <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-800/60 dark:to-slate-900/60 px-6">
              <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-medium">Chat</span>
                  {conversation?.messages?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {conversation.messages.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="insights" 
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-medium">Insights</span>
                  {activeInsights.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 animate-pulse">
                      {activeInsights.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="automation" 
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <Workflow className="h-4 w-4" />
                  <span className="font-medium">Automation</span>
                  {crossGroupWorkflows?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {crossGroupWorkflows.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Analytics</span>
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    Live
                  </Badge>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="models" 
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <Brain className="h-4 w-4" />
                  <span className="font-medium">Models</span>
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {capabilities?.filter(c => c.enabled).length || 0}
                  </Badge>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-slate-600 dark:data-[state=active]:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0">
              {renderConversationThread()}
            </TabsContent>

            <TabsContent value="insights" className="flex-1 p-6">
              <ScrollArea className="h-full">
                {renderProactiveInsights()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="automation" className="flex-1 p-6">
              <ScrollArea className="h-full">
                {renderWorkflowAutomation()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 p-6">
              <ScrollArea className="h-full">
                {renderAnalyticsDashboard()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="models" className="flex-1 p-6">
              <ScrollArea className="h-full">
                {renderModelsPanel()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-6">
              <ScrollArea className="h-full">
                {renderSettingsPanel()}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Context Visualization */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t p-4 bg-muted/20"
          >
            <ContextVisualization
              context={currentContext}
              onContextUpdate={(updates) => {
                // Handle context updates
              }}
              onContextReset={() => {
                // Handle context reset
              }}
            />
          </motion.div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>AI Assistant Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};

// Conversation Thread Component
const ConversationThread: React.FC<ConversationThreadProps> = ({
  conversation,
  onMessageSend,
  onRecommendationExecute,
  isLoading
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const message = newMessage;
    setNewMessage('');
    setIsTyping(true);

    try {
      await onMessageSend(message);
    } finally {
      setIsTyping(false);
    }
  }, [newMessage, isLoading, onMessageSend]);

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation?.messages?.map((message: any, index: number) => (
            <motion.div
              key={`${message.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
            >
                              <div className={`max-w-[80%] ${message.isFromUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {message.isFromUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <p className="text-sm">{message.content}</p>
                    
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/20">
                        <p className="text-xs font-medium">Recommendations:</p>
                        {message.recommendations.map((rec: any) => (
                          <Card key={rec.id} className="border-0 bg-background/50">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{rec.title}</p>
                                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onRecommendationExecute(rec)}
                                  disabled={rec.executed}
                                >
                                  {rec.executed ? <CheckCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
          
          {(isLoading || isTyping) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me anything about your data governance system..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

// AI Capabilities Panel Component
const AICapabilitiesPanel: React.FC<AICapabilitiesPanelProps> = ({
  capabilities,
  onCapabilityToggle,
  onCapabilityConfig
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Capabilities
        </CardTitle>
        <CardDescription>
          Configure AI assistant capabilities and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((capability) => (
            <div key={capability.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{capability.name}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {capability.description}
                </p>
              </div>
              <Switch
                checked={capability.enabled}
                onCheckedChange={(enabled) => onCapabilityToggle(capability.id, enabled)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Proactive Insights Panel Component
const ProactiveInsightsPanel: React.FC<ProactiveInsightsPanelProps> = ({
  insights,
  onInsightDismiss,
  onInsightExecute,
  onInsightFeedback
}) => {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Active Insights</h3>
        <p className="text-muted-foreground">
          The AI assistant is analyzing your system. Insights will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Proactive Insights
        </h3>
        <Badge variant="secondary">{insights.length} insights</Badge>
      </div>

      <div className="grid gap-4">
        {insights.map((insight: any) => (
          <Card key={insight.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                  <CardDescription>{insight.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                    {insight.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onInsightDismiss(insight.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Relevance: {Math.round(insight.relevanceScore * 100)}%
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(insight.generatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInsightFeedback(insight.id, 'negative')}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInsightFeedback(insight.id, 'positive')}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onInsightExecute(insight)}
                  >
                    Execute
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Workflow Automation Panel Component
const WorkflowAutomationPanel: React.FC<WorkflowAutomationPanelProps> = ({
  automationSuggestions,
  workflowRecommendations,
  onAutomationCreate,
  onWorkflowCreate
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Workflow className="h-5 w-5" />
          Workflow Automation
        </h3>
        
        <Tabs defaultValue="suggestions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="suggestions">Automation Suggestions</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            {automationSuggestions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                  <h4 className="font-medium mb-2">No Automation Suggestions</h4>
                  <p className="text-muted-foreground text-sm">
                    The AI assistant is analyzing your workflows to identify automation opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              automationSuggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{suggestion.name}</CardTitle>
                    <CardDescription>{suggestion.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{suggestion.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Est. time: {suggestion.estimatedTime}
                        </span>
                      </div>
                      <Button onClick={() => onAutomationCreate(suggestion)}>
                        Create Automation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            {workflowRecommendations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                  <h4 className="font-medium mb-2">No Workflow Recommendations</h4>
                  <p className="text-muted-foreground text-sm">
                    Based on your usage patterns, the AI will suggest optimized workflows.
                  </p>
                </CardContent>
              </Card>
            ) : (
              workflowRecommendations.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {workflow.involvedSPAs.map((spa) => (
                          <Badge key={spa} variant="secondary">{spa}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {workflow.steps.length} steps
                        </span>
                        <Button onClick={() => onWorkflowCreate(workflow)}>
                          Create Workflow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// AI Analytics Dashboard Component
const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({
  analytics,
  onAnalyticsExport,
  onLearningDataUpdate
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          AI Analytics
        </h3>
        <Button variant="outline" onClick={onAnalyticsExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.dailyInteractions || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recommendations Executed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recommendationsExecuted || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.recommendationsExecuted || 0) / (analytics.totalRecommendations || 1) * 100)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((analytics.learningProgress || 0) * 100)}%</div>
            <Progress value={(analytics.learningProgress || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Accuracy Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((analytics.accuracyScore || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Based on user feedback
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Learning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.learningInsights?.map((insight: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm">No learning insights available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Voice Controls Component
const VoiceControls: React.FC<VoiceControlsProps> = ({
  isVoiceEnabled,
  isListening,
  onVoiceToggle,
  onVoiceCommand,
  voiceSettings,
  onVoiceSettingsChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Voice Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="voice-enabled">Enable Voice</Label>
          <Switch
            id="voice-enabled"
            checked={isVoiceEnabled}
            onCheckedChange={onVoiceToggle}
          />
        </div>

        {isVoiceEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Language</Label>
                <Select 
                  value={voiceSettings.language} 
                  onValueChange={(value) => onVoiceSettingsChange({ ...voiceSettings, language: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Voice</Label>
                <Select 
                  value={voiceSettings.voice} 
                  onValueChange={(value) => onVoiceSettingsChange({ ...voiceSettings, voice: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neural">Neural</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="wavenet">WaveNet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Speed: {voiceSettings.speed}x</Label>
              <Slider
                value={[voiceSettings.speed]}
                onValueChange={([value]) => onVoiceSettingsChange({ ...voiceSettings, speed: value })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Volume: {Math.round(voiceSettings.volume * 100)}%</Label>
              <Slider
                value={[voiceSettings.volume]}
                onValueChange={([value]) => onVoiceSettingsChange({ ...voiceSettings, volume: value })}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// AI Personality Config Component
const AIPersonalityConfig: React.FC<AIPersonalityConfigProps> = ({
  personality,
  onPersonalityChange,
  availablePersonalities
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Personality
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select 
          value={personality.id} 
          onValueChange={(value) => {
            const newPersonality = availablePersonalities.find(p => p.id === value);
            if (newPersonality) onPersonalityChange(newPersonality);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availablePersonalities.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} - {p.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <Label className="text-xs">Formality Level</Label>
          <RadioGroup 
            value={personality.traits.formalityLevel} 
            onValueChange={(value) => onPersonalityChange({
              ...personality,
              traits: { ...personality.traits, formalityLevel: value as any }
            })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="casual" id="casual" />
              <Label htmlFor="casual" className="text-xs">Casual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="professional" id="professional" />
              <Label htmlFor="professional" className="text-xs">Professional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="formal" id="formal" />
              <Label htmlFor="formal" className="text-xs">Formal</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Response Length</Label>
          <Select 
            value={personality.traits.responseLength} 
            onValueChange={(value) => onPersonalityChange({
              ...personality,
              traits: { ...personality.traits, responseLength: value as any }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

// Knowledge Base Manager Component
const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  knowledgeBase,
  onKnowledgeUpdate,
  onKnowledgeExport,
  onKnowledgeImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Knowledge Base
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Total Entries</Label>
            <div className="font-medium">{knowledgeBase?.size || 0}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Last Updated</Label>
            <div className="font-medium">
              {knowledgeBase?.lastUpdated ? new Date(knowledgeBase.lastUpdated).toLocaleDateString() : 'Never'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onKnowledgeExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,.md"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onKnowledgeImport(file);
          }}
          style={{ display: 'none' }}
        />
      </CardContent>
    </Card>
  );
};

// Context Visualization Component
const ContextVisualization: React.FC<ContextVisualizationProps> = ({
  context,
  onContextUpdate,
  onContextReset
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Current Context</h4>
        <Button variant="outline" size="sm" onClick={onContextReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-2 bg-muted/30 rounded">
          <Label className="text-muted-foreground">Active SPA</Label>
          <div className="font-medium">AI Assistant</div>
        </div>
        
        <div className="p-2 bg-muted/30 rounded">
          <Label className="text-muted-foreground">Workspace</Label>
                          <div className="font-medium">{context.workspaceId || 'Default'}</div>
        </div>
        
        <div className="p-2 bg-muted/30 rounded">
          <Label className="text-muted-foreground">User Role</Label>
                          <div className="font-medium">User</div>
        </div>
        
        <div className="p-2 bg-muted/30 rounded">
          <Label className="text-muted-foreground">System Health</Label>
          <div className="font-medium flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              context.systemState?.systemHealth?.status === 'healthy' ? 'bg-green-500' : 
              context.systemState?.systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {context.systemState?.systemHealth?.status || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantInterface;
