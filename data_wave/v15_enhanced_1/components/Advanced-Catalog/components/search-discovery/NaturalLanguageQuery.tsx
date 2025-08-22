'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  MessageSquare, Bot, Brain, Sparkles, Zap, Target, Eye, Lightbulb, Search,
  Send, Mic, MicOff, Volume2, VolumeX, Play, Pause, RefreshCw, Loader2,
  Settings, User, Hash, Clock, TrendingUp, BarChart3, PieChart, Activity,
  FileText, Image, Video, Link, Download, Upload, Calendar as CalendarIcon,
  CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, Copy, Share2, Flag, Bookmark, Star, Heart,
  ThumbsUp, ThumbsDown, MoreHorizontal, Edit3, Trash2, Plus, Filter,
  Database, Table as TableIcon, Layers, Grid3X3, List, FolderOpen, Globe, Map,
  Users, UserCheck, Building, MapPin, Navigation, Compass, Route,
  Timer, Stopwatch, History, Award, Crown, Shield, Lock, Unlock,
  Key, Code, Terminal, Command, Cpu, HardDrive, Server, Cloud,
  Wifi, Signal, Battery, Power, Gauge, Speedometer, Tachometer
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, TreemapChart, Treemap } from 'recharts';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { collaborationService } from '../../services/collaboration.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { advancedLineageService } from '../../services/advanced-lineage.service';

// Enhanced Type Definitions for Natural Language Query
interface NaturalLanguageQueryInterface {
  id: string;
  name: string;
  description: string;
  version: string;
  configuration: NLQConfiguration;
  models: AIModel[];
  processingPipeline: ProcessingPipeline;
  knowledgeBase: KnowledgeBase;
  performance: NLQPerformance;
  analytics: NLQAnalytics;
  conversationHistory: ConversationHistory[];
  userProfiles: UserProfile[];
  createdAt: string;
  updatedAt: string;
}

interface NLQConfiguration {
  supportedLanguages: string[];
  defaultLanguage: string;
  enabledFeatures: NLQFeature[];
  confidenceThreshold: number;
  maxResponseLength: number;
  contextWindow: number;
  multiTurnEnabled: boolean;
  voiceEnabled: boolean;
  visualResponsesEnabled: boolean;
  realtimeProcessing: boolean;
  caching: CacheConfiguration;
  security: SecurityConfiguration;
}

interface AIModel {
  id: string;
  name: string;
  type: ModelType;
  provider: ModelProvider;
  version: string;
  capabilities: ModelCapability[];
  performance: ModelPerformance;
  configuration: ModelConfiguration;
  status: ModelStatus;
  endpoints: ModelEndpoint[];
  specializations: ModelSpecialization[];
}

interface ProcessingPipeline {
  stages: ProcessingStage[];
  preprocessing: PreprocessingConfig;
  entityExtraction: EntityExtractionConfig;
  intentClassification: IntentClassificationConfig;
  contextAnalysis: ContextAnalysisConfig;
  queryGeneration: QueryGenerationConfig;
  responseGeneration: ResponseGenerationConfig;
  postprocessing: PostprocessingConfig;
}

interface NaturalLanguageQuery {
  id: string;
  originalText: string;
  normalizedText: string;
  language: string;
  confidence: number;
  intent: QueryIntent;
  entities: ExtractedEntity[];
  context: QueryContext;
  clarifications: Clarification[];
  generatedQueries: GeneratedQuery[];
  executionPlan: ExecutionPlan;
  timestamp: string;
  userId: string;
  sessionId: string;
}

interface QueryResponse {
  id: string;
  queryId: string;
  text: string;
  confidence: number;
  responseType: ResponseType;
  data: ResponseData;
  visualizations: Visualization[];
  recommendations: Recommendation[];
  followUpQuestions: FollowUpQuestion[];
  sources: ResponseSource[];
  executionTime: number;
  reasoning: ReasoningExplanation;
  alternatives: AlternativeResponse[];
  metadata: ResponseMetadata;
  timestamp: string;
}

interface ExtractedEntity {
  id: string;
  text: string;
  type: EntityType;
  category: EntityCategory;
  confidence: number;
  startPosition: number;
  endPosition: number;
  normalizedValue: string;
  attributes: EntityAttribute[];
  relationships: EntityRelationship[];
  contextualInfo: ContextualInfo;
}

interface QueryIntent {
  primary: IntentType;
  secondary: IntentType[];
  confidence: number;
  domain: DomainType;
  complexity: ComplexityLevel;
  urgency: UrgencyLevel;
  scope: ScopeType;
  parameters: IntentParameter[];
}

interface QueryContext {
  conversationHistory: ConversationTurn[];
  userProfile: UserProfile;
  systemContext: SystemContext;
  domainContext: DomainContext;
  temporalContext: TemporalContext;
  spatialContext: SpatialContext;
  businessContext: BusinessContext;
  technicalContext: TechnicalContext;
}

interface ConversationTurn {
  id: string;
  type: TurnType;
  content: string;
  intent: QueryIntent;
  entities: ExtractedEntity[];
  response: QueryResponse;
  timestamp: string;
  satisfaction: number;
  followUp: boolean;
}

interface Visualization {
  id: string;
  type: VisualizationType;
  title: string;
  description: string;
  data: VisualizationData;
  configuration: VisualizationConfig;
  interactivity: InteractivityConfig;
  accessibility: AccessibilityConfig;
  exportOptions: ExportOption[];
}

interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  priority: PriorityLevel;
  relevance: number;
  actions: RecommendedAction[];
  reasoning: string;
  benefits: string[];
  prerequisites: string[];
}

interface ConversationSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  turns: ConversationTurn[];
  context: SessionContext;
  metrics: SessionMetrics;
  satisfaction: number;
  status: SessionStatus;
  tags: string[];
}

// Enums
enum ModelType {
  TRANSFORMER = 'transformer',
  GPT = 'gpt',
  BERT = 'bert',
  T5 = 't5',
  CUSTOM = 'custom',
  ENSEMBLE = 'ensemble',
  RETRIEVAL_AUGMENTED = 'retrieval_augmented',
  MULTIMODAL = 'multimodal'
}

enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  HUGGINGFACE = 'huggingface',
  AWS = 'aws',
  AZURE = 'azure',
  CUSTOM = 'custom'
}

enum EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  LOCATION = 'location',
  DATE = 'date',
  TIME = 'time',
  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  DATASET = 'dataset',
  TABLE = 'table',
  COLUMN = 'column',
  DATABASE = 'database',
  METRIC = 'metric',
  DIMENSION = 'dimension',
  BUSINESS_TERM = 'business_term',
  TECHNICAL_TERM = 'technical_term'
}

enum IntentType {
  SEARCH = 'search',
  FILTER = 'filter',
  AGGREGATE = 'aggregate',
  COMPARE = 'compare',
  ANALYZE = 'analyze',
  EXPLORE = 'explore',
  EXPLAIN = 'explain',
  RECOMMEND = 'recommend',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  NAVIGATE = 'navigate',
  HELP = 'help',
  CLARIFY = 'clarify'
}

enum ResponseType {
  TEXT = 'text',
  DATA = 'data',
  VISUALIZATION = 'visualization',
  MIXED = 'mixed',
  ERROR = 'error',
  CLARIFICATION = 'clarification',
  RECOMMENDATION = 'recommendation',
  EXPLANATION = 'explanation'
}

enum VisualizationType {
  TABLE = 'table',
  CHART = 'chart',
  GRAPH = 'graph',
  MAP = 'map',
  DIAGRAM = 'diagram',
  DASHBOARD = 'dashboard',
  REPORT = 'report',
  INFOGRAPHIC = 'infographic'
}

enum RecommendationType {
  DATA_SOURCE = 'data_source',
  ANALYSIS = 'analysis',
  OPTIMIZATION = 'optimization',
  BEST_PRACTICE = 'best_practice',
  WORKFLOW = 'workflow',
  TOOL = 'tool',
  RESOURCE = 'resource',
  COLLABORATION = 'collaboration'
}

enum TurnType {
  USER_QUERY = 'user_query',
  SYSTEM_RESPONSE = 'system_response',
  CLARIFICATION_REQUEST = 'clarification_request',
  CLARIFICATION_RESPONSE = 'clarification_response',
  FOLLOW_UP_QUESTION = 'follow_up_question',
  FEEDBACK = 'feedback'
}

enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  ERROR = 'error'
}

// Additional interfaces
interface NLQFeature {
  name: string;
  enabled: boolean;
  configuration: FeatureConfiguration;
}

interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  expertise: ExpertiseProfile;
  behaviorPattern: BehaviorPattern;
  interactionHistory: InteractionHistory;
}

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  resourceUsage: ResourceUsage;
}

interface ResponseData {
  results: any[];
  metadata: DataMetadata;
  schema: DataSchema;
  statistics: DataStatistics;
  quality: DataQuality;
}

interface FollowUpQuestion {
  id: string;
  text: string;
  category: string;
  relevance: number;
  difficulty: DifficultyLevel;
  suggestedAction: string;
}

interface ReasoningExplanation {
  steps: ReasoningStep[];
  confidence: number;
  assumptions: string[];
  limitations: string[];
  alternatives: string[];
}

interface SessionMetrics {
  totalTurns: number;
  averageResponseTime: number;
  successRate: number;
  clarificationRate: number;
  abandonmentRate: number;
  userSatisfaction: number;
}

const NaturalLanguageQuery: React.FC = () => {
  // State Management
  const [nlqInterface, setNlqInterface] = useState<NaturalLanguageQueryInterface | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [entityHighlights, setEntityHighlights] = useState<ExtractedEntity[]>([]);
  const [intentPredictions, setIntentPredictions] = useState<QueryIntent | null>(null);
  const [contextInfo, setContextInfo] = useState<QueryContext | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analytics, setAnalytics] = useState<NLQAnalytics | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [showEntityHighlights, setShowEntityHighlights] = useState<boolean>(true);
  const [showIntentAnalysis, setShowIntentAnalysis] = useState<boolean>(true);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(true);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState<boolean>(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.7);
  const [responseDetailLevel, setResponseDetailLevel] = useState<'brief' | 'detailed' | 'comprehensive'>('detailed');
  const [visualizationPreferences, setVisualizationPreferences] = useState<VisualizationType[]>([]);

  // Form State
  const [querySettings, setQuerySettings] = useState({
    language: 'en',
    domain: 'data_catalog',
    context: 'general',
    preferredResponseFormat: 'mixed',
    includeExplanations: true,
    includeRecommendations: true,
    includeVisualizations: true
  });

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<any>(null);

  // Load NLQ interface data
  const loadNLQData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load NLQ interface configuration and data
      const [
        interfaceData,
        sessionData,
        historyData,
        analyticsData,
        recommendationsData
      ] = await Promise.all([
        intelligentDiscoveryService.getNLQInterface(),
        intelligentDiscoveryService.getCurrentSession(),
        intelligentDiscoveryService.getConversationHistory(),
        intelligentDiscoveryService.getNLQAnalytics(),
        intelligentDiscoveryService.getNLQRecommendations()
      ]);

      setNlqInterface(interfaceData);
      setCurrentSession(sessionData);
      setConversationHistory(historyData);
      setAnalytics(analyticsData);
      setRecommendations(recommendationsData);

    } catch (error) {
      console.error('Error loading NLQ data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    // Polling for updates
    const interval = setInterval(loadNLQData, 30000);

    // WebSocket for real-time NLQ updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/nlq');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'query_processed':
          setQueryResponse(data.response);
          setIsProcessing(false);
          break;
        case 'entities_extracted':
          setEntityHighlights(data.entities);
          break;
        case 'intent_predicted':
          setIntentPredictions(data.intent);
          break;
        case 'suggestions_updated':
          setSuggestions(data.suggestions);
          break;
        case 'conversation_updated':
          setConversationHistory(prev => [...prev, data.turn]);
          break;
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [loadNLQData]);

  // Initialize component
  useEffect(() => {
    loadNLQData();
    const cleanup = setupRealTimeUpdates();
    setupSpeechRecognition();
    setupSpeechSynthesis();
    return cleanup;
  }, [loadNLQData, setupRealTimeUpdates]);

  // Setup speech recognition
  const setupSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = querySettings.language;
      
      speechRecognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setCurrentQuery(finalTranscript);
          processQuery(finalTranscript);
        }
      };
      
      speechRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [querySettings.language]);

  // Setup speech synthesis
  const setupSpeechSynthesis = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Process natural language query
  const processQuery = useCallback(async (query: string, options?: any) => {
    try {
      setIsProcessing(true);
      
      // Analyze query for entities and intent
      const [entitiesResponse, intentResponse] = await Promise.all([
        intelligentDiscoveryService.extractEntities(query),
        intelligentDiscoveryService.classifyIntent(query)
      ]);
      
      setEntityHighlights(entitiesResponse);
      setIntentPredictions(intentResponse);
      
      // Process the full query
      const queryRequest = {
        text: query,
        language: querySettings.language,
        domain: querySettings.domain,
        context: contextInfo,
        sessionId: currentSession?.id,
        preferences: {
          responseFormat: querySettings.preferredResponseFormat,
          includeExplanations: querySettings.includeExplanations,
          includeRecommendations: querySettings.includeRecommendations,
          includeVisualizations: querySettings.includeVisualizations,
          detailLevel: responseDetailLevel,
          confidenceThreshold
        },
        ...options
      };
      
      const response = await intelligentDiscoveryService.processNaturalLanguageQuery(queryRequest);
      
      setQueryResponse(response);
      
      // Add to conversation history
      const turn: ConversationTurn = {
        id: `turn_${Date.now()}`,
        type: TurnType.USER_QUERY,
        content: query,
        intent: intentResponse,
        entities: entitiesResponse,
        response: response,
        timestamp: new Date().toISOString(),
        satisfaction: 0,
        followUp: false
      };
      
      setConversationHistory(prev => [...prev, turn]);
      
      // Speak response if voice is enabled
      if (voiceEnabled && response.text) {
        speakText(response.text);
      }
      
      // Update suggestions
      if (response.followUpQuestions) {
        setSuggestions(response.followUpQuestions.map(q => q.text));
      }
      
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [querySettings, contextInfo, currentSession, responseDetailLevel, confidenceThreshold, voiceEnabled]);

  // Handle voice input
  const toggleVoiceInput = useCallback(() => {
    if (!speechRecognitionRef.current) return;
    
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      speechRecognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // Speak text
  const speakText = useCallback((text: string) => {
    if (!speechSynthesisRef.current) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = querySettings.language;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesisRef.current.speak(utterance);
  }, [querySettings.language]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Clear conversation
  const clearConversation = useCallback(async () => {
    try {
      await intelligentDiscoveryService.clearConversation(currentSession?.id);
      setConversationHistory([]);
      setQueryResponse(null);
      setCurrentQuery('');
      setEntityHighlights([]);
      setIntentPredictions(null);
      setSuggestions([]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }, [currentSession]);

  // Export conversation
  const exportConversation = useCallback(async () => {
    try {
      const exportData = {
        session: currentSession,
        conversation: conversationHistory,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${currentSession?.id || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting conversation:', error);
    }
  }, [currentSession, conversationHistory]);

  // Handle quick suggestions
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setCurrentQuery(suggestion);
    processQuery(suggestion);
  }, [processQuery]);

  // Format entity highlights
  const formatTextWithHighlights = useCallback((text: string, entities: ExtractedEntity[]) => {
    if (!entities.length) return text;
    
    let highlightedText = text;
    entities.sort((a, b) => a.startPosition - b.startPosition);
    
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      const before = highlightedText.substring(0, entity.startPosition);
      const entityText = highlightedText.substring(entity.startPosition, entity.endPosition);
      const after = highlightedText.substring(entity.endPosition);
      
      highlightedText = before + 
        `<span class="bg-blue-100 text-blue-800 px-1 rounded" title="${entity.type}: ${entity.confidence}">` +
        entityText + 
        '</span>' + 
        after;
    }
    
    return highlightedText;
  }, []);

  // Utility functions
  const getIntentColor = (intent: IntentType) => {
    switch (intent) {
      case IntentType.SEARCH: return 'bg-blue-100 text-blue-800';
      case IntentType.ANALYZE: return 'bg-purple-100 text-purple-800';
      case IntentType.COMPARE: return 'bg-green-100 text-green-800';
      case IntentType.EXPLAIN: return 'bg-yellow-100 text-yellow-800';
      case IntentType.RECOMMEND: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading natural language query interface...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span>Natural Language Query</span>
          </h1>
          <p className="text-muted-foreground">
            Ask questions in natural language and get intelligent responses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={voiceEnabled ? 'default' : 'outline'}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
            Voice
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={exportConversation}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={clearConversation}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-12 gap-6">
        {/* Chat Interface */}
        <div className="col-span-8 space-y-4">
          {/* Conversation History */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Conversation</span>
                {currentSession && (
                  <Badge variant="outline">{currentSession.turns.length} turns</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80" ref={chatContainerRef}>
                <div className="space-y-4">
                  {conversationHistory.map((turn, index) => (
                    <div key={turn.id} className="space-y-2">
                      {/* User Query */}
                      <div className="flex justify-end">
                        <div className="max-w-3xl bg-blue-500 text-white p-3 rounded-lg">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: showEntityHighlights 
                                ? formatTextWithHighlights(turn.content, turn.entities)
                                : turn.content 
                            }} 
                          />
                          <div className="text-xs opacity-75 mt-1">
                            {formatTimestamp(turn.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      {/* System Response */}
                      {turn.response && (
                        <div className="flex justify-start">
                          <div className="max-w-3xl bg-gray-100 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Bot className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">AI Assistant</span>
                              <Badge variant="outline" className="text-xs">
                                {(turn.response.confidence * 100).toFixed(0)}% confident
                              </Badge>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              {turn.response.text}
                            </div>
                            
                            {/* Visualizations */}
                            {turn.response.visualizations.length > 0 && (
                              <div className="mt-3">
                                {turn.response.visualizations.map((viz, vizIndex) => (
                                  <div key={vizIndex} className="mb-4">
                                    <h4 className="font-medium mb-2">{viz.title}</h4>
                                    {viz.type === VisualizationType.TABLE && (
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              {Object.keys(viz.data.rows[0] || {}).map((key) => (
                                                <TableHead key={key}>{key}</TableHead>
                                              ))}
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {viz.data.rows.slice(0, 5).map((row: any, rowIndex: number) => (
                                              <TableRow key={rowIndex}>
                                                {Object.values(row).map((value: any, cellIndex: number) => (
                                                  <TableCell key={cellIndex}>{value}</TableCell>
                                                ))}
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    )}
                                    {viz.type === VisualizationType.CHART && (
                                      <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={viz.data.series}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="name" />
                                          <YAxis />
                                          <RechartsTooltip />
                                          <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Follow-up Questions */}
                            {turn.response.followUpQuestions.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-medium mb-2">Suggested follow-up questions:</div>
                                <div className="space-y-1">
                                  {turn.response.followUpQuestions.slice(0, 3).map((question, qIndex) => (
                                    <Button
                                      key={qIndex}
                                      variant="ghost"
                                      size="sm"
                                      className="text-left justify-start h-auto p-2"
                                      onClick={() => handleSuggestionClick(question.text)}
                                    >
                                      <Lightbulb className="h-3 w-3 mr-2" />
                                      {question.text}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground mt-2">
                              {formatTimestamp(turn.response.timestamp)} • 
                              {turn.response.executionTime}ms
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Processing Indicator */}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Query Input */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Ask me anything about your data..."
                      value={currentQuery}
                      onChange={(e) => setCurrentQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (currentQuery.trim()) {
                            processQuery(currentQuery);
                            setCurrentQuery('');
                          }
                        }
                      }}
                      rows={3}
                      disabled={isProcessing}
                    />
                    
                    {/* Entity Highlights Preview */}
                    {showEntityHighlights && entityHighlights.length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span>Detected entities: </span>
                        {entityHighlights.map((entity, index) => (
                          <Badge key={index} variant="outline" className="mr-1">
                            {entity.text} ({entity.type})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => {
                        if (currentQuery.trim()) {
                          processQuery(currentQuery);
                          setCurrentQuery('');
                        }
                      }}
                      disabled={isProcessing || !currentQuery.trim()}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant={isListening ? 'default' : 'outline'}
                      onClick={toggleVoiceInput}
                      disabled={!speechRecognitionRef.current}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Quick Suggestions */}
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 6).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-left"
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="col-span-4 space-y-4">
          {/* Intent Analysis */}
          {showIntentAnalysis && intentPredictions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Intent Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Primary Intent</span>
                    <Badge className={getIntentColor(intentPredictions.primary)}>
                      {intentPredictions.primary}
                    </Badge>
                  </div>
                  <Progress value={intentPredictions.confidence * 100} className="h-2" />
                  <div className={`text-xs text-right ${getConfidenceColor(intentPredictions.confidence)}`}>
                    {(intentPredictions.confidence * 100).toFixed(1)}% confidence
                  </div>
                </div>
                
                {intentPredictions.secondary.length > 0 && (
                  <div>
                    <div className="text-sm mb-2">Secondary Intents</div>
                    <div className="space-y-1">
                      {intentPredictions.secondary.slice(0, 3).map((intent, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {intent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Domain:</span>
                    <div className="font-medium">{intentPredictions.domain}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Complexity:</span>
                    <div className="font-medium">{intentPredictions.complexity}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Response Detail Level</Label>
                <Select
                  value={responseDetailLevel}
                  onValueChange={(value) => setResponseDetailLevel(value as any)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Confidence Threshold</Label>
                <div className="px-3 py-2">
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={(values) => setConfidenceThreshold(values[0])}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                  <div className="text-xs text-center mt-1">
                    {(confidenceThreshold * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Entity Highlights</Label>
                  <Switch
                    checked={showEntityHighlights}
                    onCheckedChange={setShowEntityHighlights}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Intent Analysis</Label>
                  <Switch
                    checked={showIntentAnalysis}
                    onCheckedChange={setShowIntentAnalysis}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Auto Suggestions</Label>
                  <Switch
                    checked={autoSuggestEnabled}
                    onCheckedChange={setAutoSuggestEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {showRecommendations && recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{rec.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {(rec.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      {rec.actions.length > 0 && (
                        <Button size="sm" variant="outline" className="w-full">
                          {rec.actions[0].label}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("Show me the most popular datasets")}
                >
                  <Database className="h-3 w-3 mr-1" />
                  Popular Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("What are data quality issues?")}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Quality Issues
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("Explain data lineage")}
                >
                  <Layers className="h-3 w-3 mr-1" />
                  Lineage Help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("Find similar tables")}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Find Similar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageQuery;