'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Brain, Zap, Target, Search, Filter, Eye, EyeOff, Settings, RefreshCw, Play, Pause, Square, SkipForward, Volume2, VolumeX, Mic, MicOff, Languages, Code, FileText, Database, Users, Shield, Activity, TrendingUp, BarChart3, Lightbulb, AlertTriangle, CheckCircle, XCircle, Info, Clock, Calendar, Globe, Bookmark, Star, Hash, AtSign, Quote, Type, Layers, GitBranch, Workflow, Link, Unlink, Copy, Download, Upload, Save, FolderOpen, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Cpu, HardDrive, Network, Gauge, Radar, Compass, Map,  } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';

// Types
import { 
  NLPProcessor,
  IntentRecognition,
  EntityExtraction,
  SentimentAnalysis,
  LanguageDetection,
  SemanticAnalysis,
  ContextualUnderstanding,
  QueryProcessing,
  ResponseGeneration,
  ConversationFlow,
  NLPModel,
  LanguageModel,
  ProcessingPipeline,
  NLPMetrics,
  TrainingData,
  ModelConfiguration,
  ProcessingResult,
  IntentClassification,
  EntityType,
  ConfidenceScore,
  ProcessingMode,
  LanguageSupport,
  NLPCapability
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  processNaturalLanguage,
  extractEntities,
  recognizeIntent,
  analyzeSentiment,
  detectLanguage,
  generateResponse,
  buildSemanticModel,
  trainNLPModel,
  optimizeProcessing,
  validateNLPResult
} from '../../utils/ai-assistant-utils';

// Constants
import {
  NLP_MODELS,
  SUPPORTED_LANGUAGES,
  INTENT_CATEGORIES,
  ENTITY_TYPES,
  PROCESSING_MODES,
  NLP_CONFIG
} from '../../constants/ai-assistant-constants';

interface NaturalLanguageProcessorProps {
  className?: string;
  initialQuery?: string;
  onProcessingComplete?: (result: ProcessingResult) => void;
  onIntentRecognized?: (intent: IntentRecognition) => void;
  onEntitiesExtracted?: (entities: EntityExtraction[]) => void;
  mode?: ProcessingMode;
  language?: string;
  enableRealTime?: boolean;
}

interface ProcessingPipelineProps {
  query: string;
  pipeline: ProcessingPipeline;
  onStepComplete: (step: string, result: any) => void;
  onPipelineComplete: (result: ProcessingResult) => void;
}

interface IntentAnalysisProps {
  intents: IntentRecognition[];
  selectedIntent: string | null;
  onIntentSelect: (intentId: string) => void;
  onIntentFeedback: (intentId: string, feedback: 'correct' | 'incorrect') => void;
}

interface EntityExtractionPanelProps {
  entities: EntityExtraction[];
  query: string;
  onEntityHighlight: (entity: EntityExtraction) => void;
  onEntityEdit: (entityId: string, updates: Partial<EntityExtraction>) => void;
}

interface SemanticAnalysisProps {
  semanticResult: SemanticAnalysis;
  onSemanticExploration: (concept: string) => void;
  onRelationshipExplore: (from: string, to: string) => void;
}

interface LanguageModelsPanelProps {
  models: NLPModel[];
  activeModel: string;
  onModelSelect: (modelId: string) => void;
  onModelTrain: (modelId: string, trainingData: TrainingData) => void;
  onModelEvaluate: (modelId: string) => void;
}

interface ProcessingMetricsProps {
  metrics: NLPMetrics;
  realTimeMetrics: boolean;
  onMetricsExport: () => void;
  onMetricsReset: () => void;
}

interface ConversationFlowProps {
  conversationFlow: ConversationFlow;
  onFlowUpdate: (flow: ConversationFlow) => void;
  onFlowOptimize: () => void;
}

interface QueryOptimizationProps {
  originalQuery: string;
  optimizedQueries: string[];
  onQuerySelect: (query: string) => void;
  onQueryOptimize: (query: string) => void;
}

export const NaturalLanguageProcessor: React.FC<NaturalLanguageProcessorProps> = ({
  className = "",
  initialQuery = "",
  onProcessingComplete,
  onIntentRecognized,
  onEntitiesExtracted,
  mode = 'comprehensive',
  language = 'auto',
  enableRealTime = true
}) => {
  // Hooks
  const {
    nlpProcessor,
    models,
    processingMetrics,
    conversationFlow,
    processQuery,
    trainModel,
    evaluateModel,
    optimizeQuery,
    updateProcessingPipeline,
    resetMetrics,
    isProcessing,
    error
  } = useAIAssistant();

  const {
    systemHealth,
    globalMetrics
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions
  } = useUserManagement();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  const {
    trackActivity
  } = useActivityTracker();

  // State
  const [query, setQuery] = useState(initialQuery);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [intents, setIntents] = useState<IntentRecognition[]>([]);
  const [entities, setEntities] = useState<EntityExtraction[]>([]);
  const [semanticAnalysis, setSemanticAnalysis] = useState<SemanticAnalysis | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'processing' | 'intents' | 'entities' | 'semantic' | 'models' | 'metrics'>('processing');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>(mode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [realTimeProcessing, setRealTimeProcessing] = useState(enableRealTime);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [highlightedEntity, setHighlightedEntity] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [processingHistory, setProcessingHistory] = useState<ProcessingResult[]>([]);
  const [optimizedQueries, setOptimizedQueries] = useState<string[]>([]);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);

  // Refs
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryInputRef = useRef<HTMLTextAreaElement>(null);

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [currentUser, activeWorkspace, activeSPAContext, systemHealth]);

  const availableModels = useMemo(() => {
    return models.filter(model => 
      model.capabilities.includes('nlp') && 
      model.status === 'ready'
    );
  }, [models]);

  const processingPipeline = useMemo<ProcessingPipeline>(() => ({
    id: crypto.randomUUID(),
    name: 'Standard NLP Pipeline',
    steps: [
      { name: 'language_detection', enabled: selectedLanguage === 'auto' },
      { name: 'preprocessing', enabled: true },
      { name: 'tokenization', enabled: true },
      { name: 'entity_extraction', enabled: true },
      { name: 'intent_recognition', enabled: true },
      { name: 'sentiment_analysis', enabled: processingMode === 'comprehensive' },
      { name: 'semantic_analysis', enabled: processingMode !== 'basic' },
      { name: 'context_understanding', enabled: true },
      { name: 'response_generation', enabled: true }
    ],
    configuration: {
      mode: processingMode,
      language: selectedLanguage,
      confidenceThreshold,
      realTime: realTimeProcessing
    }
  }), [processingMode, selectedLanguage, confidenceThreshold, realTimeProcessing]);

  const highConfidenceIntents = useMemo(() => {
    return intents.filter(intent => intent.confidence >= confidenceThreshold);
  }, [intents, confidenceThreshold]);

  const criticalEntities = useMemo(() => {
    return entities.filter(entity => 
      entity.importance === 'high' && 
      entity.confidence >= confidenceThreshold
    );
  }, [entities, confidenceThreshold]);

  // Effects
  useEffect(() => {
    if (realTimeProcessing && query.trim().length > 3) {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      processingTimeoutRef.current = setTimeout(() => {
        handleQueryProcessing(query);
      }, 500);
    }

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [query, realTimeProcessing]);

  useEffect(() => {
    if (processingResult) {
      setProcessingHistory(prev => [processingResult, ...prev.slice(0, 9)]);
      
      if (onProcessingComplete) {
        onProcessingComplete(processingResult);
      }
    }
  }, [processingResult, onProcessingComplete]);

  useEffect(() => {
    if (intents.length > 0 && onIntentRecognized) {
      intents.forEach(intent => {
        if (intent.confidence >= confidenceThreshold) {
          onIntentRecognized(intent);
        }
      });
    }
  }, [intents, onIntentRecognized, confidenceThreshold]);

  useEffect(() => {
    if (entities.length > 0 && onEntitiesExtracted) {
      onEntitiesExtracted(entities);
    }
  }, [entities, onEntitiesExtracted]);

  // Handlers
  const handleQueryProcessing = useCallback(async (inputQuery: string) => {
    if (!inputQuery.trim()) return;

    try {
      const result = await processQuery(inputQuery, {
        pipeline: processingPipeline,
        context: currentContext,
        mode: processingMode
      });

      setProcessingResult(result);
      setIntents(result.intents || []);
      setEntities(result.entities || []);
      setSemanticAnalysis(result.semanticAnalysis || null);

      if (result.intents && result.intents.length > 0) {
        setSelectedIntent(result.intents[0].id);
      }

      trackActivity({
        type: 'nlp_query_processed',
        details: {
          queryLength: inputQuery.length,
          intentCount: result.intents?.length || 0,
          entityCount: result.entities?.length || 0,
          processingTime: result.processingTime
        }
      });
    } catch (error) {
      console.error('Failed to process query:', error);
    }
  }, [processQuery, processingPipeline, currentContext, processingMode, trackActivity]);

  const handleManualProcessing = useCallback(() => {
    if (query.trim()) {
      handleQueryProcessing(query);
    }
  }, [query, handleQueryProcessing]);

  const handleQueryOptimization = useCallback(async () => {
    if (!query.trim()) return;

    try {
      const optimized = await optimizeQuery(query, {
        context: currentContext,
        preserveIntent: true,
        enhanceClarity: true
      });

      setOptimizedQueries(optimized);
    } catch (error) {
      console.error('Failed to optimize query:', error);
    }
  }, [query, optimizeQuery, currentContext]);

  const handleVoiceInput = useCallback(() => {
    if (!isVoiceInput) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage === 'auto' ? 'en-US' : selectedLanguage;

        recognition.onstart = () => {
          setIsVoiceInput(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsVoiceInput(false);
        };

        recognition.onerror = () => {
          setIsVoiceInput(false);
        };

        recognition.onend = () => {
          setIsVoiceInput(false);
        };

        recognition.start();
        setVoiceRecognition(recognition);
      }
    } else {
      // Square voice recognition
      if (voiceRecognition) {
        voiceRecognition.stop();
      }
      setIsVoiceInput(false);
    }
  }, [isVoiceInput, voiceRecognition, selectedLanguage]);

  const handleIntentFeedback = useCallback(async (intentId: string, feedback: 'correct' | 'incorrect') => {
    try {
      // Submit feedback for model improvement
      trackActivity({
        type: 'nlp_intent_feedback',
        details: {
          intentId,
          feedback,
          query: query.substring(0, 100)
        }
      });
    } catch (error) {
      console.error('Failed to submit intent feedback:', error);
    }
  }, [query, trackActivity]);

  const handleEntityEdit = useCallback((entityId: string, updates: Partial<EntityExtraction>) => {
    setEntities(prev => prev.map(entity => 
      entity.id === entityId ? { ...entity, ...updates } : entity
    ));
  }, []);

  const handleModelTrain = useCallback(async (modelId: string, trainingData: TrainingData) => {
    try {
      await trainModel(modelId, trainingData);
      
      trackActivity({
        type: 'nlp_model_trained',
        details: {
          modelId,
          trainingDataSize: trainingData.examples.length
        }
      });
    } catch (error) {
      console.error('Failed to train model:', error);
    }
  }, [trainModel, trackActivity]);

  const handleExportResults = useCallback(() => {
    if (!processingResult) return;

    const exportData = {
      query,
      result: processingResult,
      timestamp: new Date(),
      context: currentContext
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nlp-result-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [processingResult, query, currentContext]);

  // Render Methods
  const renderQueryInput = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Natural Language Query
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceInput}
              className={isVoiceInput ? 'bg-red-100 border-red-300' : ''}
            >
              {isVoiceInput ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleQueryOptimization}
              disabled={!query.trim()}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={queryInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your natural language query here..."
            rows={4}
            className="resize-none"
          />
          
          {isVoiceInput && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Mode:</Label>
              <Select value={processingMode} onValueChange={(value: ProcessingMode) => setProcessingMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Language:</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={realTimeProcessing}
                onCheckedChange={setRealTimeProcessing}
              />
              <Label className="text-sm">Real-time</Label>
            </div>
          </div>

          <Button 
            onClick={handleManualProcessing}
            disabled={!query.trim() || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Process
              </>
            )}
          </Button>
        </div>

        {optimizedQueries.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Optimized Queries:</Label>
            <div className="space-y-1">
              {optimizedQueries.map((optimizedQuery, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <span className="flex-1 text-sm">{optimizedQuery}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery(optimizedQuery)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderProcessingPipeline = () => (
    <ProcessingPipelineComponent
      query={query}
      pipeline={processingPipeline}
      onStepComplete={(step, result) => {
        // Handle individual step completion
      }}
      onPipelineComplete={(result) => {
        setProcessingResult(result);
      }}
    />
  );

  const renderIntentAnalysis = () => (
    <IntentAnalysis
      intents={intents}
      selectedIntent={selectedIntent}
      onIntentSelect={setSelectedIntent}
      onIntentFeedback={handleIntentFeedback}
    />
  );

  const renderEntityExtraction = () => (
    <EntityExtractionPanel
      entities={entities}
      query={query}
      onEntityHighlight={setHighlightedEntity}
      onEntityEdit={handleEntityEdit}
    />
  );

  const renderSemanticAnalysis = () => semanticAnalysis && (
    <SemanticAnalysisComponent
      semanticResult={semanticAnalysis}
      onSemanticExploration={(concept) => {
        // Handle semantic exploration
      }}
      onRelationshipExplore={(from, to) => {
        // Handle relationship exploration
      }}
    />
  );

  const renderLanguageModels = () => (
    <LanguageModelsPanel
      models={availableModels}
      activeModel={nlpProcessor?.activeModel || ''}
      onModelSelect={(modelId) => {
        // Handle model selection
      }}
      onModelTrain={handleModelTrain}
      onModelEvaluate={(modelId) => {
        // Handle model evaluation
      }}
    />
  );

  const renderProcessingMetrics = () => (
    <ProcessingMetrics
      metrics={processingMetrics}
      realTimeMetrics={realTimeProcessing}
      onMetricsExport={() => {
        // Handle metrics export
      }}
      onMetricsReset={resetMetrics}
    />
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Natural Language Processor</h2>
              <p className="text-sm text-muted-foreground">
                Advanced NLP processing with intent recognition and entity extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {processingResult && (
              <Button variant="outline" size="sm" onClick={handleExportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Query Input */}
        {renderQueryInput()}

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Advanced Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Confidence Threshold</Label>
                      <Slider
                        value={[confidenceThreshold]}
                        onValueChange={([value]) => setConfidenceThreshold(value)}
                        min={0.1}
                        max={1}
                        step={0.05}
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round(confidenceThreshold * 100)}%
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Processing Pipeline</Label>
                      <Select value={processingPipeline.name} onValueChange={() => {}}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard NLP Pipeline">Standard Pipeline</SelectItem>
                          <SelectItem value="Fast Pipeline">Fast Pipeline</SelectItem>
                          <SelectItem value="Comprehensive Pipeline">Comprehensive Pipeline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Model Configuration</Label>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Active: {nlpProcessor?.activeModel || 'Default'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Results */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Processing
            </TabsTrigger>
            <TabsTrigger value="intents" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Intents
              {highConfidenceIntents.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {highConfidenceIntents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="entities" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Entities
              {criticalEntities.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {criticalEntities.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="semantic" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Semantic
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="processing" className="space-y-4">
            {renderProcessingPipeline()}
          </TabsContent>

          <TabsContent value="intents" className="space-y-4">
            {renderIntentAnalysis()}
          </TabsContent>

          <TabsContent value="entities" className="space-y-4">
            {renderEntityExtraction()}
          </TabsContent>

          <TabsContent value="semantic" className="space-y-4">
            {renderSemanticAnalysis()}
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            {renderLanguageModels()}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {renderProcessingMetrics()}
          </TabsContent>
        </Tabs>

        {/* Processing History */}
        {processingHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Processing History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {processingHistory.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                      <span className="truncate flex-1">{result.query.substring(0, 50)}...</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {result.processingTime}ms
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setQuery(result.query);
                            setProcessingResult(result);
                          }}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>NLP Processing Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Processing Pipeline Component
const ProcessingPipelineComponent: React.FC<ProcessingPipelineProps> = ({
  query,
  pipeline,
  onStepComplete,
  onPipelineComplete
}) => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepResults, setStepResults] = useState<Map<string, any>>(new Map());

  const getStepIcon = (stepName: string) => {
    const icons: Record<string, any> = {
      language_detection: Languages,
      preprocessing: Settings,
      tokenization: Type,
      entity_extraction: Hash,
      intent_recognition: Target,
      sentiment_analysis: Activity,
      semantic_analysis: GitBranch,
      context_understanding: Brain,
      response_generation: MessageSquare
    };
    return icons[stepName] || Settings;
  };

  const getStepStatus = (stepName: string) => {
    if (currentStep === stepName) return 'processing';
    if (completedSteps.has(stepName)) return 'completed';
    return 'pending';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Processing Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pipeline.steps.filter(step => step.enabled).map((step, index) => {
            const StepIcon = getStepIcon(step.name);
            const status = getStepStatus(step.name);
            
            return (
              <div key={step.name} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  status === 'completed' ? 'bg-green-100 text-green-600' :
                  status === 'processing' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <StepIcon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium capitalize">
                    {step.name.replace('_', ' ')}
                  </h4>
                  {stepResults.get(step.name) && (
                    <p className="text-sm text-muted-foreground">
                      {JSON.stringify(stepResults.get(step.name)).substring(0, 100)}...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {status === 'processing' && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {status === 'pending' && (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Intent Analysis Component
const IntentAnalysis: React.FC<IntentAnalysisProps> = ({
  intents,
  selectedIntent,
  onIntentSelect,
  onIntentFeedback
}) => {
  if (intents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Intents Detected</h3>
          <p className="text-muted-foreground text-sm">
            Process a query to see recognized intents and their confidence scores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {intents.map((intent) => (
        <Card 
          key={intent.id} 
          className={`cursor-pointer transition-colors ${
            selectedIntent === intent.id ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => onIntentSelect(intent.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{intent.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={intent.confidence >= 0.8 ? 'default' : intent.confidence >= 0.6 ? 'secondary' : 'outline'}>
                  {Math.round(intent.confidence * 100)}%
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIntentFeedback(intent.id, 'correct');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIntentFeedback(intent.id, 'incorrect');
                    }}
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">{intent.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confidence:</span>
                <span>{Math.round(intent.confidence * 100)}%</span>
              </div>
              <Progress value={intent.confidence * 100} className="h-2" />
              
              {intent.parameters && Object.keys(intent.parameters).length > 0 && (
                <div className="mt-3">
                  <Label className="text-sm font-medium">Parameters:</Label>
                  <div className="mt-1 space-y-1">
                    {Object.entries(intent.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Entity Extraction Panel Component
const EntityExtractionPanel: React.FC<EntityExtractionPanelProps> = ({
  entities,
  query,
  onEntityHighlight,
  onEntityEdit
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  if (entities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Hash className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Entities Extracted</h3>
          <p className="text-muted-foreground text-sm">
            Process a query to identify and extract named entities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Query with highlighted entities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Query with Highlighted Entities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm leading-relaxed">
            {query} {/* TODO: Implement entity highlighting */}
          </div>
        </CardContent>
      </Card>

      {/* Entity list */}
      <div className="grid gap-4">
        {entities.map((entity) => (
          <Card 
            key={entity.id}
            className={`cursor-pointer transition-colors ${
              selectedEntity === entity.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedEntity(entity.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{entity.type}</Badge>
                  <CardTitle className="text-base">{entity.value}</CardTitle>
                </div>
                <Badge variant={entity.confidence >= 0.8 ? 'default' : 'secondary'}>
                  {Math.round(entity.confidence * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Position:</Label>
                  <div>{entity.startIndex} - {entity.endIndex}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Importance:</Label>
                  <div className="capitalize">{entity.importance}</div>
                </div>
              </div>
              
              {entity.metadata && Object.keys(entity.metadata).length > 0 && (
                <div className="mt-3">
                  <Label className="text-sm font-medium">Metadata:</Label>
                  <div className="mt-1 space-y-1">
                    {Object.entries(entity.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Semantic Analysis Component
const SemanticAnalysisComponent: React.FC<SemanticAnalysisProps> = ({
  semanticResult,
  onSemanticExploration,
  onRelationshipExplore
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Semantic Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Concepts</Label>
              <div className="mt-2 space-y-1">
                {semanticResult.concepts?.map((concept, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="mr-1 mb-1 cursor-pointer hover:bg-primary/10"
                    onClick={() => onSemanticExploration(concept)}
                  >
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-medium">Topics</Label>
              <div className="mt-2 space-y-1">
                {semanticResult.topics?.map((topic, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{topic.name}</span>
                    <Badge variant="secondary">{Math.round(topic.score * 100)}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {semanticResult.relationships && semanticResult.relationships.length > 0 && (
            <div>
              <Label className="font-medium">Relationships</Label>
              <div className="mt-2 space-y-2">
                {semanticResult.relationships.map((rel, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50"
                    onClick={() => onRelationshipExplore(rel.from, rel.to)}
                  >
                    <span className="font-medium">{rel.from}</span>
                                         <ChevronRight className="h-3 w-3 text-muted-foreground" />
                     <span>{rel.type}</span>
                     <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{rel.to}</span>
                    <Badge variant="outline" className="ml-auto">
                      {Math.round(rel.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Language Models Panel Component
const LanguageModelsPanel: React.FC<LanguageModelsPanelProps> = ({
  models,
  activeModel,
  onModelSelect,
  onModelTrain,
  onModelEvaluate
}) => {
  return (
    <div className="space-y-4">
      {models.map((model) => (
        <Card 
          key={model.id}
          className={`cursor-pointer transition-colors ${
            activeModel === model.id ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => onModelSelect(model.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{model.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={model.status === 'ready' ? 'default' : 'secondary'}>
                  {model.status}
                </Badge>
                {activeModel === model.id && (
                  <Badge variant="outline">Active</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-muted-foreground">{model.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Version:</Label>
                <div>{model.version}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Accuracy:</Label>
                <div>{Math.round((model.metrics?.accuracy || 0) * 100)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onModelEvaluate(model.id);
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Evaluate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // onModelTrain would need training data
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retrain
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Processing Metrics Component
const ProcessingMetrics: React.FC<ProcessingMetricsProps> = ({
  metrics,
  realTimeMetrics,
  onMetricsExport,
  onMetricsReset
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Processing Metrics</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onMetricsExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onMetricsReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{metrics.totalQueries || 0}</div>
            <p className="text-xs text-muted-foreground">Total Queries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{metrics.averageProcessingTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">Avg Processing Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{Math.round((metrics.intentAccuracy || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Intent Accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{Math.round((metrics.entityPrecision || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Entity Precision</p>
          </CardContent>
        </Card>
      </div>

      {realTimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Real-time Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">CPU Usage</span>
                <div className="flex items-center gap-2">
                  <Progress value={(metrics.systemMetrics?.cpuUsage || 0) * 100} className="w-20" />
                  <span className="text-sm">{Math.round((metrics.systemMetrics?.cpuUsage || 0) * 100)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">HardDrive Usage</span>
                <div className="flex items-center gap-2">
                  <Progress value={(metrics.systemMetrics?.memoryUsage || 0) * 100} className="w-20" />
                  <span className="text-sm">{Math.round((metrics.systemMetrics?.memoryUsage || 0) * 100)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Queue Length</span>
                <span className="text-sm font-medium">{metrics.systemMetrics?.queueLength || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NaturalLanguageProcessor;