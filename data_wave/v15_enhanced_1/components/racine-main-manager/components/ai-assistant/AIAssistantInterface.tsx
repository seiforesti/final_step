'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mic, MicOff, Send, Sparkles, Brain, Zap, Settings, Maximize2, Minimize2, X, Plus, FileText, Database, Shield, BarChart3, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Search, Filter, Download, Upload, Share, Bookmark, History, Lightbulb, Target, Workflow, Bot, User, Loader2, ChevronUp, ChevronDown, Play, Pause, Volume2, VolumeX, RefreshCw, HelpCircle, Star, ThumbsUp, ThumbsDown, Copy, ExternalLink, Globe, Lock, Unlock, Eye, EyeOff, Calendar, Tag, Link, Archive, Trash2, Edit3, Save, Undo, Redo, Code, Terminal, Activity, PieChart, BarChart, LineChart, Map, Layers, Grid, List, Table, Card as CardIcon, Layout, Sidebar, Monitor, Smartphone, Tablet, Laptop, Server, Cloud, Wifi, WifiOff, Battery, BatteryLow, Power, PowerOff } from 'lucide-react';

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
  AIMessage,
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
  ActivityContext
} from '../../types/racine-core.types';

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
  conversation: AIConversation;
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
  insights: ProactiveInsight[];
  onInsightDismiss: (insightId: string) => void;
  onInsightExecute: (insight: ProactiveInsight) => void;
  onInsightFeedback: (insightId: string, feedback: 'positive' | 'negative', comment?: string) => void;
}

interface AIAnalyticsDashboardProps {
  analytics: AILearningData;
  onAnalyticsExport: () => void;
  onLearningDataUpdate: (data: Partial<AILearningData>) => void;
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
  personality: AIPersonality;
  onPersonalityChange: (personality: AIPersonality) => void;
  availablePersonalities: AIPersonality[];
}

interface KnowledgeBaseManagerProps {
  knowledgeBase: AIKnowledgeBase;
  onKnowledgeUpdate: (knowledge: Partial<AIKnowledgeBase>) => void;
  onKnowledgeExport: () => void;
  onKnowledgeImport: (file: File) => void;
}

export const AIAssistantInterface: React.FC<AIAssistantInterfaceProps> = ({
  className = "",
  isExpanded = false,
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
    optimizePerformance,
    isLoading,
    error
  } = useAIAssistant(initialContext);

  const {
    systemHealth,
    globalMetrics,
    crossGroupWorkflows,
    orchestrateWorkflow,
    monitorSystem,
    optimizeSystem
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    coordinateNavigation,
    executeUnifiedSearch,
    orchestrateExistingSPAs
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    userWorkspaces,
    userAnalytics
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceContext,
    workspaceAnalytics
  } = useWorkspaceManagement();

  const {
    recentActivities,
    activityAnalytics,
    trackActivity
  } = useActivityTracker();

  const {
    activeCollaborations,
    collaborationInsights
  } = useCollaboration();

  // State
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'automation' | 'analytics' | 'settings'>('chat');
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
    recentActivities: recentActivities.slice(0, 10),
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
        return conversation.messages.filter(msg => msg.type === 'ai' && msg.recommendations?.length > 0);
      case 'automations':
        return conversation.messages.filter(msg => msg.type === 'ai' && msg.automationSuggestions?.length > 0);
      case 'insights':
        return conversation.messages.filter(msg => msg.type === 'ai' && msg.insights?.length > 0);
      default:
        return conversation.messages;
    }
  }, [conversation?.messages, conversationFilter]);

  const activeInsights = useMemo(() => {
    return insights.filter(insight => !insight.dismissed && insight.relevanceScore > 0.7);
  }, [insights]);

  const priorityRecommendations = useMemo(() => {
    return conversation?.messages
      ?.flatMap(msg => msg.recommendations || [])
      .filter(rec => rec.priority === 'high' && !rec.executed)
      .slice(0, 5) || [];
  }, [conversation?.messages]);

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  useEffect(() => {
    if (autoInsightsEnabled && proactiveMode) {
      const interval = setInterval(() => {
        generateInsights(currentContext);
      }, AI_ASSISTANT_CONFIG.PROACTIVE_INSIGHTS_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [autoInsightsEnabled, proactiveMode, currentContext, generateInsights]);

  useEffect(() => {
    if (learningMode) {
      analyzeUserBehavior(currentContext);
    }
  }, [currentContext, learningMode, analyzeUserBehavior]);

  // Handlers
  const handleMessageSend = useCallback(async (message: string) => {
    if (!message.trim()) return;

    try {
      await sendMessage(message, currentContext);
      trackActivity({
        type: 'ai_interaction',
        details: {
          messageLength: message.length,
          context: activeSPAContext?.activeSPA,
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
        steps: workflow.steps,
        spas: workflow.involvedSPAs,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        status: 'draft'
      };

      await orchestrateWorkflow(crossGroupWorkflow);
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
      const intent = await analyzeUserIntent(command, currentContext);
      
      switch (intent.type) {
        case 'message':
          await handleMessageSend(command);
          break;
        case 'navigation':
          await coordinateNavigation(intent.target);
          break;
        case 'search':
          await executeUnifiedSearch(intent.query);
          break;
        case 'automation':
          // Handle automation command
          break;
        default:
          await handleMessageSend(command);
      }
    } catch (error) {
      console.error('Failed to process voice command:', error);
    }
  }, [currentContext, handleMessageSend, coordinateNavigation, executeUnifiedSearch]);

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
      const updatedCapabilities = capabilities.map(cap => 
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
      await optimizePerformance();
      await optimizeSystem();
    } catch (error) {
      console.error('Failed to optimize performance:', error);
    }
  }, [optimizePerformance, optimizeSystem]);

  // Render Methods
  const renderConversationThread = () => (
    <ConversationThread
      conversation={conversation}
      onMessageSend={handleMessageSend}
      onRecommendationExecute={handleRecommendationExecute}
      isLoading={isLoading}
    />
  );

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
    <AIAnalyticsDashboard
      analytics={analytics}
      onAnalyticsExport={() => {
        // Handle analytics export
      }}
      onLearningDataUpdate={(data) => {
        // Handle learning data update
      }}
    />
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
        capabilities={capabilities}
        onCapabilityToggle={handleCapabilityToggle}
        onCapabilityConfig={(capabilityId, config) => {
          // Handle capability configuration
        }}
      />

      <AIPersonalityConfig
        personality={personality}
        onPersonalityChange={handlePersonalityChange}
        availablePersonalities={AI_PERSONALITIES}
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
        className={`bg-background border rounded-lg shadow-lg ${className}`}
        initial={false}
        animate={{
          width: isMaximized ? '100vw' : isExpanded ? '800px' : '400px',
          height: isMaximized ? '100vh' : isExpanded ? '600px' : '400px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  rotate: isLoading ? 360 : 0,
                  scale: aiState?.status === 'active' ? 1.1 : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: isLoading ? Infinity : 0 },
                  scale: { duration: 0.3 }
                }}
              >
                <Brain className={`h-6 w-6 ${aiState?.status === 'active' ? 'text-blue-500' : 'text-muted-foreground'}`} />
              </motion.div>
              <div>
                <h2 className="font-semibold text-lg">AI Assistant</h2>
                <p className="text-xs text-muted-foreground">
                  {personality?.name || 'Intelligent Data Governance Assistant'}
                </p>
              </div>
            </div>
            
            <Badge variant={aiState?.status === 'active' ? 'default' : 'secondary'}>
              {aiState?.status || 'Ready'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {isVoiceEnabled && (
              <Button
                variant={isListening ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsListening(!isListening)}
                className="gap-2"
              >
                {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExpanded ? 'Minimize' : 'Expand'}
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1">
            <div className="border-b px-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                  {activeInsights.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {activeInsights.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0">
              {renderConversationThread()}
            </TabsContent>

            <TabsContent value="insights" className="flex-1 p-4">
              {renderProactiveInsights()}
            </TabsContent>

            <TabsContent value="automation" className="flex-1 p-4">
              {renderWorkflowAutomation()}
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 p-4">
              {renderAnalyticsDashboard()}
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-4">
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
          {conversation?.messages?.map((message, index) => (
            <motion.div
              key={`${message.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <p className="text-sm">{message.content}</p>
                    
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/20">
                        <p className="text-xs font-medium">Recommendations:</p>
                        {message.recommendations.map((rec) => (
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
                  <capability.icon className="h-4 w-4" />
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
        {insights.map((insight) => (
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
                          Est. time saved: {suggestion.estimatedTimeSaved}
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
            {analytics.learningInsights?.map((insight, index) => (
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
            <div className="font-medium">{knowledgeBase.totalEntries || 0}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Last Updated</Label>
            <div className="font-medium">
              {knowledgeBase.lastUpdated ? new Date(knowledgeBase.lastUpdated).toLocaleDateString() : 'Never'}
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
          <div className="font-medium">{context.activeSPA || 'None'}</div>
        </div>
        
        <div className="p-2 bg-muted/30 rounded">
          <Label className="text-muted-foreground">Workspace</Label>
          <div className="font-medium">{context.workspace?.name || 'Default'}</div>
        </div>
        
        <div className="p-2 bg-muted/30 rounded">
          <Label className="text-muted-foreground">User Role</Label>
          <div className="font-medium">{context.user?.role || 'User'}</div>
        </div>
        
        <div className="p-2 bg-muted/30 rounded">
          <Label className="text-muted-foreground">System Health</Label>
          <div className="font-medium flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              context.systemHealth?.status === 'healthy' ? 'bg-green-500' : 
              context.systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {context.systemHealth?.status || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantInterface;