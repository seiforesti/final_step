'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, Eye, Search, Target, Workflow, BarChart3, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle, Users, Database, Settings, Activity, Layers, RefreshCw, Filter, ArrowRight, ChevronDown, ChevronUp, Play, Pause, MoreHorizontal, X, Plus, Minus, Star, Bookmark, Share, Download, Upload, Copy, ExternalLink, Globe, Lock, Unlock, Shield, FileText, Code, Terminal, Monitor, Smartphone, Tablet, Server, Cloud, MapPin, Navigation, Compass, Route, Map, Radar, Microscope, Cpu, HardDrive, Wifi, WifiOff, Battery, Power, Gauge, Thermometer, Volume2, Mic, Camera, Speaker, Headphones } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useCollaboration } from '../../hooks/useCollaboration';

// Types
import { 
  AIContext,
  ContextualResponse,
  ContextualRecommendation,
  ContextAnalysis,
  UserBehaviorPattern,
  WorkspaceContext,
  SPAContext,
  EnvironmentalContext,
  TemporalContext,
  CollaborativeContext,
  SemanticContext
} from '../../types/ai-assistant.types';

import {
  SystemHealth,
  CrossGroupWorkflow,
  UserPermissions,
  ActivityContext,
  PerformanceMetrics
} from '../../types/racine-core.types';

// Utilities
import {
  analyzeContextualPatterns,
  generateContextualRecommendations,
  calculateContextRelevance,
  predictUserIntent,
  adaptToUserBehavior,
  optimizeContextualResponse
} from '../../utils/ai-assistant-utils';

import {
  validateCrossGroupOperation,
  coordinateWorkflowExecution,
  monitorSystemPerformance
} from '../../utils/cross-group-orchestrator';

// Constants
import {
  CONTEXT_ANALYSIS_CONFIG,
  CONTEXTUAL_PATTERNS,
  BEHAVIORAL_MODELS,
  ADAPTATION_THRESHOLDS
} from '../../constants/ai-assistant-constants';

interface ContextAwareAssistantProps {
  className?: string;
  initialContext?: Partial<AIContext>;
  onContextChange?: (context: AIContext) => void;
  onRecommendationGenerated?: (recommendation: ContextualRecommendation) => void;
  onBehaviorPatternDetected?: (pattern: UserBehaviorPattern) => void;
  onAdaptationTriggered?: (adaptation: any) => void;
}

interface ContextAnalysisProps {
  context: AIContext;
  analysis: ContextAnalysis;
  onAnalysisUpdate: (analysis: ContextAnalysis) => void;
}

interface BehaviorPatternAnalysisProps {
  patterns: UserBehaviorPattern[];
  onPatternSelect: (pattern: UserBehaviorPattern) => void;
  onPatternDisable: (patternId: string) => void;
}

interface ContextualRecommendationsProps {
  recommendations: ContextualRecommendation[];
  onRecommendationExecute: (recommendation: ContextualRecommendation) => void;
  onRecommendationDismiss: (recommendationId: string) => void;
  onRecommendationFeedback: (recommendationId: string, feedback: 'positive' | 'negative') => void;
}

interface AdaptiveIntelligenceProps {
  adaptationLevel: number;
  learningProgress: number;
  onAdaptationLevelChange: (level: number) => void;
  onLearningReset: () => void;
}

interface ContextVisualizationProps {
  context: AIContext;
  contextLayers: string[];
  activeLayer: string;
  onLayerChange: (layer: string) => void;
}

interface EnvironmentalAwarenessProps {
  environmentalContext: EnvironmentalContext;
  onEnvironmentChange: (context: Partial<EnvironmentalContext>) => void;
}

interface TemporalAwarenessProps {
  temporalContext: TemporalContext;
  onTemporalUpdate: (context: Partial<TemporalContext>) => void;
}

interface CollaborativeAwarenessProps {
  collaborativeContext: CollaborativeContext;
  onCollaborationUpdate: (context: Partial<CollaborativeContext>) => void;
}

interface SemanticAwarenessProps {
  semanticContext: SemanticContext;
  onSemanticUpdate: (context: Partial<SemanticContext>) => void;
}

export const ContextAwareAssistant: React.FC<ContextAwareAssistantProps> = ({
  className = "",
  initialContext,
  onContextChange,
  onRecommendationGenerated,
  onBehaviorPatternDetected,
  onAdaptationTriggered
}) => {
  // Hooks
  const {
    aiState,
    contextAnalysis,
    behaviorPatterns,
    contextualRecommendations,
    adaptationLevel,
    learningProgress,
    analyzeContext,
    generateContextualRecommendations: generateRecommendations,
    detectBehaviorPatterns,
    adaptToContext,
    updateContextAnalysis,
    isAnalyzing,
    error
  } = useAIAssistant(initialContext);

  const {
    systemHealth,
    globalMetrics,
    performanceMetrics,
    monitorSystem
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    getSPAInteractions,
    getCrossGroupMetrics
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    userAnalytics,
    getUserBehaviorAnalytics
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceContext,
    workspaceAnalytics,
    getWorkspaceUsagePatterns
  } = useWorkspaceManagement();

  const {
    recentActivities,
    activityAnalytics,
    getUserActivityPatterns,
    getActivityCorrelations
  } = useActivityTracker();

  const {
    activeCollaborations,
    collaborationInsights,
    getCollaborationPatterns
  } = useCollaboration();

  // State
  const [activeTab, setActiveTab] = useState<'analysis' | 'patterns' | 'recommendations' | 'adaptation' | 'visualization'>('analysis');
  const [contextLayers, setContextLayers] = useState<string[]>(['user', 'workspace', 'spa', 'system', 'temporal', 'collaborative']);
  const [activeLayer, setActiveLayer] = useState<string>('user');
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [adaptationEnabled, setAdaptationEnabled] = useState(true);
  const [contextDepth, setContextDepth] = useState<'basic' | 'intermediate' | 'advanced' | 'comprehensive'>('advanced');
  const [analysisFrequency, setAnalysisFrequency] = useState(5000); // milliseconds
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [contextFilters, setContextFilters] = useState<{
    timeRange: string;
    spas: string[];
    users: string[];
    workspaces: string[];
  }>({
    timeRange: '24h',
    spas: [],
    users: [],
    workspaces: []
  });

  // Refs
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const contextHistoryRef = useRef<AIContext[]>([]);

  // Computed Values
  const currentContext = useMemo<AIContext>(() => {
    const baseContext: AIContext = {
      user: currentUser,
      workspace: activeWorkspace,
      activeSPA: activeSPAContext?.activeSPA || null,
      systemHealth,
      recentActivities: recentActivities.slice(0, 20),
      activeCollaborations,
      userPermissions,
      workspaceContext,
      timestamp: new Date(),
      sessionId: crypto.randomUUID(),
      ...initialContext
    };

    // Add environmental context
    const environmentalContext: EnvironmentalContext = {
      systemLoad: performanceMetrics?.cpuUsage || 0,
      memoryUsage: performanceMetrics?.memoryUsage || 0,
      networkLatency: performanceMetrics?.networkLatency || 0,
      activeConnections: globalMetrics?.activeConnections || 0,
      concurrentUsers: globalMetrics?.concurrentUsers || 0,
      systemVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      deployment: process.env.NODE_ENV || 'development'
    };

    // Add temporal context
    const temporalContext: TemporalContext = {
      currentTime: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      workingHours: {
        start: 9,
        end: 17,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      sessionDuration: Date.now() - (aiState?.sessionStartTime || Date.now()),
      lastActivity: recentActivities[0]?.timestamp || new Date(),
      activityFrequency: activityAnalytics?.hourlyActivity || {}
    };

    // Add collaborative context
    const collaborativeContext: CollaborativeContext = {
      activeCollaborators: activeCollaborations.map(c => c.participants).flat(),
      sharedWorkspaces: userAnalytics?.sharedWorkspaces || [],
      teamDynamics: collaborationInsights?.teamDynamics || {},
      communicationPatterns: collaborationInsights?.communicationPatterns || {},
      expertiseNetwork: collaborationInsights?.expertiseNetwork || {}
    };

    // Add semantic context
    const semanticContext: SemanticContext = {
      domainKnowledge: contextAnalysis?.domainKnowledge || {},
      conceptRelationships: contextAnalysis?.conceptRelationships || {},
      ontologyMappings: contextAnalysis?.ontologyMappings || {},
      semanticSimilarity: contextAnalysis?.semanticSimilarity || {},
      knowledgeGraph: contextAnalysis?.knowledgeGraph || {}
    };

    return {
      ...baseContext,
      environmental: environmentalContext,
      temporal: temporalContext,
      collaborative: collaborativeContext,
      semantic: semanticContext
    };
  }, [
    currentUser, 
    activeWorkspace, 
    activeSPAContext, 
    systemHealth, 
    recentActivities, 
    activeCollaborations, 
    userPermissions, 
    workspaceContext, 
    performanceMetrics, 
    globalMetrics, 
    activityAnalytics, 
    collaborationInsights, 
    contextAnalysis, 
    aiState?.sessionStartTime, 
    initialContext
  ]);

  const contextRelevanceScore = useMemo(() => {
    return calculateContextRelevance(currentContext, contextAnalysis);
  }, [currentContext, contextAnalysis]);

  const activeRecommendations = useMemo(() => {
    return contextualRecommendations.filter(rec => 
      rec.relevanceScore > 0.7 && 
      !rec.dismissed && 
      !rec.executed
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [contextualRecommendations]);

  const significantPatterns = useMemo(() => {
    return behaviorPatterns.filter(pattern => 
      pattern.confidence > 0.8 && 
      pattern.frequency > 5
    ).sort((a, b) => b.significance - a.significance);
  }, [behaviorPatterns]);

  // Effects
  useEffect(() => {
    if (onContextChange) {
      onContextChange(currentContext);
    }
  }, [currentContext, onContextChange]);

  useEffect(() => {
    if (autoAnalysisEnabled) {
      analysisIntervalRef.current = setInterval(async () => {
        try {
          await analyzeContext(currentContext);
          await detectBehaviorPatterns(currentContext);
          
          if (adaptationEnabled) {
            const adaptations = await adaptToContext(currentContext);
            if (adaptations && onAdaptationTriggered) {
              onAdaptationTriggered(adaptations);
            }
          }
        } catch (error) {
          console.error('Context analysis error:', error);
        }
      }, analysisFrequency);

      return () => {
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
      };
    }
  }, [autoAnalysisEnabled, analysisFrequency, adaptationEnabled, currentContext, analyzeContext, detectBehaviorPatterns, adaptToContext, onAdaptationTriggered]);

  useEffect(() => {
    // Store context history for temporal analysis
    contextHistoryRef.current = [
      currentContext,
      ...contextHistoryRef.current.slice(0, 99) // Keep last 100 contexts
    ];
  }, [currentContext]);

  useEffect(() => {
    // Generate contextual recommendations when context changes significantly
    const shouldGenerateRecommendations = 
      contextRelevanceScore > 0.8 || 
      significantPatterns.length > 0;

    if (shouldGenerateRecommendations) {
      generateRecommendations(currentContext).then(recommendations => {
        recommendations.forEach(rec => {
          if (onRecommendationGenerated) {
            onRecommendationGenerated(rec);
          }
        });
      });
    }
  }, [contextRelevanceScore, significantPatterns.length, currentContext, generateRecommendations, onRecommendationGenerated]);

  useEffect(() => {
    // Notify about new behavior patterns
    significantPatterns.forEach(pattern => {
      if (onBehaviorPatternDetected && !selectedPatterns.includes(pattern.id)) {
        onBehaviorPatternDetected(pattern);
      }
    });
  }, [significantPatterns, selectedPatterns, onBehaviorPatternDetected]);

  // Handlers
  const handleContextAnalysis = useCallback(async () => {
    try {
      await analyzeContext(currentContext);
      await detectBehaviorPatterns(currentContext);
    } catch (error) {
      console.error('Manual context analysis failed:', error);
    }
  }, [analyzeContext, detectBehaviorPatterns, currentContext]);

  const handlePatternSelect = useCallback((pattern: UserBehaviorPattern) => {
    setSelectedPatterns(prev => {
      if (prev.includes(pattern.id)) {
        return prev.filter(id => id !== pattern.id);
      } else {
        return [...prev, pattern.id];
      }
    });
  }, []);

  const handlePatternDisable = useCallback(async (patternId: string) => {
    try {
      // Implementation for disabling specific patterns
      setSelectedPatterns(prev => prev.filter(id => id !== patternId));
    } catch (error) {
      console.error('Failed to disable pattern:', error);
    }
  }, []);

  const handleRecommendationExecute = useCallback(async (recommendation: ContextualRecommendation) => {
    try {
      // Implementation for executing contextual recommendations
      console.log('Executing recommendation:', recommendation);
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    }
  }, []);

  const handleRecommendationDismiss = useCallback(async (recommendationId: string) => {
    try {
      // Implementation for dismissing recommendations
      console.log('Dismissing recommendation:', recommendationId);
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
    }
  }, []);

  const handleRecommendationFeedback = useCallback(async (recommendationId: string, feedback: 'positive' | 'negative') => {
    try {
      // Implementation for recommendation feedback
      console.log('Recommendation feedback:', recommendationId, feedback);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }, []);

  const handleAdaptationLevelChange = useCallback(async (level: number) => {
    try {
      // Implementation for changing adaptation level
      console.log('Changing adaptation level:', level);
    } catch (error) {
      console.error('Failed to change adaptation level:', error);
    }
  }, []);

  const handleLearningReset = useCallback(async () => {
    try {
      // Implementation for resetting learning
      console.log('Resetting learning');
    } catch (error) {
      console.error('Failed to reset learning:', error);
    }
  }, []);

  // Render Methods
  const renderContextAnalysis = () => (
    <ContextAnalysis
      context={currentContext}
      analysis={contextAnalysis}
      onAnalysisUpdate={updateContextAnalysis}
    />
  );

  const renderBehaviorPatterns = () => (
    <BehaviorPatternAnalysis
      patterns={significantPatterns}
      onPatternSelect={handlePatternSelect}
      onPatternDisable={handlePatternDisable}
    />
  );

  const renderRecommendations = () => (
    <ContextualRecommendations
      recommendations={activeRecommendations}
      onRecommendationExecute={handleRecommendationExecute}
      onRecommendationDismiss={handleRecommendationDismiss}
      onRecommendationFeedback={handleRecommendationFeedback}
    />
  );

  const renderAdaptiveIntelligence = () => (
    <AdaptiveIntelligence
      adaptationLevel={adaptationLevel}
      learningProgress={learningProgress}
      onAdaptationLevelChange={handleAdaptationLevelChange}
      onLearningReset={handleLearningReset}
    />
  );

  const renderContextVisualization = () => (
    <ContextVisualization
      context={currentContext}
      contextLayers={contextLayers}
      activeLayer={activeLayer}
      onLayerChange={setActiveLayer}
    />
  );

  return (
    <TooltipProvider>
      <motion.div 
        className={`bg-background border rounded-lg shadow-lg ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: isAnalyzing ? 360 : 0,
                scale: contextRelevanceScore > 0.8 ? 1.1 : 1
              }}
              transition={{ 
                rotate: { duration: 2, repeat: isAnalyzing ? Infinity : 0 },
                scale: { duration: 0.3 }
              }}
            >
              <Eye className={`h-6 w-6 ${contextRelevanceScore > 0.8 ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </motion.div>
            <div>
              <h2 className="font-semibold text-lg">Context-Aware Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Advanced contextual intelligence and adaptation
              </p>
            </div>
            
            <Badge variant={contextRelevanceScore > 0.8 ? 'default' : 'secondary'}>
              Relevance: {Math.round(contextRelevanceScore * 100)}%
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContextAnalysis}
                  disabled={isAnalyzing}
                >
                  <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Analyze Current Context
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2">
              <Label htmlFor="auto-analysis" className="text-xs">Auto</Label>
              <Switch
                id="auto-analysis"
                checked={autoAnalysisEnabled}
                onCheckedChange={setAutoAnalysisEnabled}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <div className="border-b px-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Patterns
                  {significantPatterns.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {significantPatterns.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommendations
                  {activeRecommendations.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {activeRecommendations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="adaptation" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Adaptation
                </TabsTrigger>
                <TabsTrigger value="visualization" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Visualization
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4">
              <TabsContent value="analysis" className="mt-0">
                {renderContextAnalysis()}
              </TabsContent>

              <TabsContent value="patterns" className="mt-0">
                {renderBehaviorPatterns()}
              </TabsContent>

              <TabsContent value="recommendations" className="mt-0">
                {renderRecommendations()}
              </TabsContent>

              <TabsContent value="adaptation" className="mt-0">
                {renderAdaptiveIntelligence()}
              </TabsContent>

              <TabsContent value="visualization" className="mt-0">
                {renderContextVisualization()}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Settings Panel */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-xs">Context Depth</Label>
                <Select value={contextDepth} onValueChange={(value: any) => setContextDepth(value)}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Analysis Frequency</Label>
                <Select 
                  value={analysisFrequency.toString()} 
                  onValueChange={(value) => setAnalysisFrequency(parseInt(value))}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1s</SelectItem>
                    <SelectItem value="5000">5s</SelectItem>
                    <SelectItem value="10000">10s</SelectItem>
                    <SelectItem value="30000">30s</SelectItem>
                    <SelectItem value="60000">1m</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="adaptation" className="text-xs">Adaptation</Label>
                <Switch
                  id="adaptation"
                  checked={adaptationEnabled}
                  onCheckedChange={setAdaptationEnabled}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Learning Progress: {Math.round(learningProgress * 100)}%</span>
              <Progress value={learningProgress * 100} className="w-20" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t"
            >
              <Alert variant="destructive" className="rounded-none border-0">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Context Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};

// Context Analysis Component
const ContextAnalysis: React.FC<ContextAnalysisProps> = ({
  context,
  analysis,
  onAnalysisUpdate
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Role:</span>
                <Badge variant="outline">{context.user?.role || 'Unknown'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Experience:</span>
                <span>{analysis?.userExperienceLevel || 'Beginner'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Activity Level:</span>
                <Progress value={(analysis?.userActivityLevel || 0) * 100} className="w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Workspace Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Name:</span>
                <span className="truncate">{context.workspace?.name || 'Default'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Complexity:</span>
                <Badge variant="outline">{analysis?.workspaceComplexity || 'Medium'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Usage:</span>
                <Progress value={(analysis?.workspaceUsage || 0) * 100} className="w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              SPA Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active:</span>
                <Badge variant="outline">{context.activeSPA || 'None'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Integration:</span>
                <Progress value={(analysis?.spaIntegrationLevel || 0) * 100} className="w-16" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Utilization:</span>
                <Progress value={(analysis?.spaUtilization || 0) * 100} className="w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Health:</span>
                <div className={`w-2 h-2 rounded-full ${
                  context.systemHealth?.status === 'healthy' ? 'bg-green-500' : 
                  context.systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="flex justify-between text-sm">
                <span>Load:</span>
                <Progress value={(context.environmental?.systemLoad || 0) * 100} className="w-16" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Performance:</span>
                <Progress value={(analysis?.systemPerformance || 0) * 100} className="w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Context Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis?.insights?.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {insight.category}
                    </Badge>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm">No context insights available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnvironmentalAwareness
          environmentalContext={context.environmental || {}}
          onEnvironmentChange={(updates) => {
            // Handle environmental context updates
          }}
        />

        <TemporalAwareness
          temporalContext={context.temporal || {}}
          onTemporalUpdate={(updates) => {
            // Handle temporal context updates
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CollaborativeAwareness
          collaborativeContext={context.collaborative || {}}
          onCollaborationUpdate={(updates) => {
            // Handle collaborative context updates
          }}
        />

        <SemanticAwareness
          semanticContext={context.semantic || {}}
          onSemanticUpdate={(updates) => {
            // Handle semantic context updates
          }}
        />
      </div>
    </div>
  );
};

// Behavior Pattern Analysis Component
const BehaviorPatternAnalysis: React.FC<BehaviorPatternAnalysisProps> = ({
  patterns,
  onPatternSelect,
  onPatternDisable
}) => {
  if (patterns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Significant Patterns Detected</h3>
        <p className="text-muted-foreground">
          The assistant is analyzing your behavior. Patterns will appear here when detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Behavior Patterns
        </h3>
        <Badge variant="secondary">{patterns.length} patterns</Badge>
      </div>

      <div className="grid gap-4">
        {patterns.map((pattern) => (
          <Card key={pattern.id} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{pattern.name}</CardTitle>
                  <CardDescription>{pattern.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={pattern.type === 'positive' ? 'default' : pattern.type === 'negative' ? 'destructive' : 'secondary'}>
                    {pattern.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPatternDisable(pattern.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Confidence</Label>
                  <div className="font-medium">{Math.round(pattern.confidence * 100)}%</div>
                  <Progress value={pattern.confidence * 100} className="h-1 mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Frequency</Label>
                  <div className="font-medium">{pattern.frequency}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Significance</Label>
                  <div className="font-medium">{Math.round(pattern.significance * 100)}%</div>
                  <Progress value={pattern.significance * 100} className="h-1 mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <div className="font-medium">{pattern.duration}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Detected: {new Date(pattern.detectedAt).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPatternSelect(pattern)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Contextual Recommendations Component
const ContextualRecommendations: React.FC<ContextualRecommendationsProps> = ({
  recommendations,
  onRecommendationExecute,
  onRecommendationDismiss,
  onRecommendationFeedback
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Active Recommendations</h3>
        <p className="text-muted-foreground">
          Based on your context, recommendations will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Contextual Recommendations
        </h3>
        <Badge variant="secondary">{recommendations.length} recommendations</Badge>
      </div>

      <div className="grid gap-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{recommendation.title}</CardTitle>
                  <CardDescription>{recommendation.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'default' : 'secondary'}>
                    {recommendation.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRecommendationDismiss(recommendation.id)}
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
                    Relevance: {Math.round(recommendation.relevanceScore * 100)}%
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(recommendation.generatedAt).toLocaleDateString()}
                  </div>
                  <Badge variant="outline">{recommendation.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRecommendationFeedback(recommendation.id, 'negative')}
                  >
                    👎
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRecommendationFeedback(recommendation.id, 'positive')}
                  >
                    👍
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onRecommendationExecute(recommendation)}
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

// Adaptive Intelligence Component
const AdaptiveIntelligence: React.FC<AdaptiveIntelligenceProps> = ({
  adaptationLevel,
  learningProgress,
  onAdaptationLevelChange,
  onLearningReset
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5" />
          Adaptive Intelligence
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adaptation Level</CardTitle>
              <CardDescription>
                Controls how aggressively the AI adapts to your behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
                <Slider
                  value={[adaptationLevel]}
                  onValueChange={([value]) => onAdaptationLevelChange(value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  Level: {Math.round(adaptationLevel * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Progress</CardTitle>
              <CardDescription>
                Shows how much the AI has learned about your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Progress value={learningProgress * 100} className="w-full" />
                <div className="text-center text-sm text-muted-foreground">
                  {Math.round(learningProgress * 100)}% Complete
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLearningReset}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adaptation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Placeholder for adaptation history */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Zap className="h-4 w-4 mt-0.5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Interface Layout Adapted</p>
                <p className="text-xs text-muted-foreground">
                  Adjusted sidebar positioning based on usage patterns
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  2 hours ago
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Zap className="h-4 w-4 mt-0.5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Response Style Refined</p>
                <p className="text-xs text-muted-foreground">
                  Adopted more technical language based on user expertise
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  1 day ago
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Context Visualization Component
const ContextVisualization: React.FC<ContextVisualizationProps> = ({
  context,
  contextLayers,
  activeLayer,
  onLayerChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5" />
          Context Visualization
        </h3>

        <div className="flex flex-wrap gap-2 mb-6">
          {contextLayers.map((layer) => (
            <Button
              key={layer}
              variant={activeLayer === layer ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLayerChange(layer)}
              className="capitalize"
            >
              {layer}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base capitalize">{activeLayer} Context Layer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeLayer === 'user' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">User ID</Label>
                    <div className="font-medium truncate">{context.user?.id || 'Unknown'}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <div className="font-medium">{context.user?.role || 'User'}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Session Duration</Label>
                    <div className="font-medium">
                      {Math.round((context.temporal?.sessionDuration || 0) / 60000)}m
                    </div>
                  </div>
                </div>
              )}

              {activeLayer === 'workspace' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <div className="font-medium truncate">{context.workspace?.name || 'Default'}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <div className="font-medium">{context.workspace?.type || 'Standard'}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Members</Label>
                    <div className="font-medium">{context.collaborative?.activeCollaborators?.length || 0}</div>
                  </div>
                </div>
              )}

              {activeLayer === 'spa' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Active SPA</Label>
                    <div className="font-medium">{context.activeSPA || 'None'}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Recent Activities</Label>
                    <div className="font-medium">{context.recentActivities?.length || 0}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Collaborations</Label>
                    <div className="font-medium">{context.activeCollaborations?.length || 0}</div>
                  </div>
                </div>
              )}

              {activeLayer === 'system' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Health</Label>
                    <div className="font-medium flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        context.systemHealth?.status === 'healthy' ? 'bg-green-500' : 
                        context.systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      {context.systemHealth?.status || 'Unknown'}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">System Load</Label>
                    <div className="font-medium">{Math.round((context.environmental?.systemLoad || 0) * 100)}%</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">HardDrive Usage</Label>
                    <div className="font-medium">{Math.round((context.environmental?.memoryUsage || 0) * 100)}%</div>
                  </div>
                </div>
              )}

              {activeLayer === 'temporal' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Current Time</Label>
                    <div className="font-medium">{context.temporal?.currentTime?.toLocaleTimeString() || 'Unknown'}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Timezone</Label>
                    <div className="font-medium">{context.temporal?.timezone || 'Unknown'}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Last Activity</Label>
                    <div className="font-medium">
                      {context.temporal?.lastActivity ? new Date(context.temporal.lastActivity).toLocaleTimeString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              )}

              {activeLayer === 'collaborative' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Active Collaborators</Label>
                    <div className="font-medium">{context.collaborative?.activeCollaborators?.length || 0}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Shared Workspaces</Label>
                    <div className="font-medium">{context.collaborative?.sharedWorkspaces?.length || 0}</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Team Dynamics</Label>
                    <div className="font-medium">
                      {Object.keys(context.collaborative?.teamDynamics || {}).length} metrics
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Environmental Awareness Component
const EnvironmentalAwareness: React.FC<EnvironmentalAwarenessProps> = ({
  environmentalContext,
  onEnvironmentChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Environmental Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">System Load</span>
            <div className="flex items-center gap-2">
              <Progress value={(environmentalContext.systemLoad || 0) * 100} className="w-20" />
              <span className="text-sm">{Math.round((environmentalContext.systemLoad || 0) * 100)}%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">HardDrive Usage</span>
            <div className="flex items-center gap-2">
              <Progress value={(environmentalContext.memoryUsage || 0) * 100} className="w-20" />
              <span className="text-sm">{Math.round((environmentalContext.memoryUsage || 0) * 100)}%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Connections</span>
            <span className="text-sm font-medium">{environmentalContext.activeConnections || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Concurrent Users</span>
            <span className="text-sm font-medium">{environmentalContext.concurrentUsers || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Temporal Awareness Component
const TemporalAwareness: React.FC<TemporalAwarenessProps> = ({
  temporalContext,
  onTemporalUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Temporal Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Current Time</span>
            <span className="text-sm font-medium">
              {temporalContext.currentTime?.toLocaleTimeString() || 'Unknown'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Timezone</span>
            <span className="text-sm font-medium">{temporalContext.timezone || 'Unknown'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Session Duration</span>
            <span className="text-sm font-medium">
              {Math.round((temporalContext.sessionDuration || 0) / 60000)}m
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Working Hours</span>
            <span className="text-sm font-medium">
              {temporalContext.workingHours?.start || 9}:00 - {temporalContext.workingHours?.end || 17}:00
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Collaborative Awareness Component
const CollaborativeAwareness: React.FC<CollaborativeAwarenessProps> = ({
  collaborativeContext,
  onCollaborationUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Collaborative Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Collaborators</span>
            <span className="text-sm font-medium">{collaborativeContext.activeCollaborators?.length || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Shared Workspaces</span>
            <span className="text-sm font-medium">{collaborativeContext.sharedWorkspaces?.length || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Team Dynamics</span>
            <span className="text-sm font-medium">
              {Object.keys(collaborativeContext.teamDynamics || {}).length} metrics
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Communication Patterns</span>
            <span className="text-sm font-medium">
              {Object.keys(collaborativeContext.communicationPatterns || {}).length} patterns
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Semantic Awareness Component
const SemanticAwareness: React.FC<SemanticAwarenessProps> = ({
  semanticContext,
  onSemanticUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Semantic Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Domain Knowledge</span>
            <span className="text-sm font-medium">
              {Object.keys(semanticContext.domainKnowledge || {}).length} domains
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Concept Relationships</span>
            <span className="text-sm font-medium">
              {Object.keys(semanticContext.conceptRelationships || {}).length} concepts
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Ontology Mappings</span>
            <span className="text-sm font-medium">
              {Object.keys(semanticContext.ontologyMappings || {}).length} mappings
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Knowledge Graph</span>
            <span className="text-sm font-medium">
              {Object.keys(semanticContext.knowledgeGraph || {}).length} nodes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContextAwareAssistant;