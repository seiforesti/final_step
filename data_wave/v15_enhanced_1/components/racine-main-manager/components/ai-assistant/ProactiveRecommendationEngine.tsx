'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Brain, Zap, Target, TrendingUp, TrendingDown, ArrowRight, Activity, CheckCircle, XCircle, AlertTriangle, Info, Clock, Calendar, Users, Database, Shield, Search, Filter, Settings, RefreshCw, Download, Upload, Save, Play, Pause, Square, ThumbsUp, ThumbsDown, Star, Bookmark, Flag, Bell, BellOff, Eye, EyeOff, Edit, Copy, Trash2, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, BarChart3, LineChart, PieChart, Gauge, Workflow, GitBranch, Layers, Route, MapPin, Compass, Navigation, Globe, Wifi, WifiOff } from 'lucide-react';

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
  RecommendationEngine,
  AIRecommendation,
  RecommendationType,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationSource,
  RecommendationContext,
  RecommendationMetrics,
  UserBehaviorPattern,
  SystemAnalysis,
  PerformanceOptimization,
  SecurityRecommendation,
  ComplianceRecommendation,
  DataQualityRecommendation,
  WorkflowOptimization,
  CostOptimization,
  RecommendationFeedback,
  LearningModel,
  PredictiveInsight,
  RecommendationHistory,
  PersonalizationProfile
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  generateRecommendations,
  analyzeUserBehavior,
  optimizeSystemPerformance,
  predictTrends,
  calculateRecommendationScore,
  filterRecommendationsByPermissions,
  personalizeRecommendations,
  trackRecommendationEffectiveness,
  updateLearningModel,
  validateRecommendation
} from '../../utils/ai-assistant-utils';

// Constants
import {
  RECOMMENDATION_TYPES,
  RECOMMENDATION_CATEGORIES,
  RECOMMENDATION_PRIORITIES,
  LEARNING_ALGORITHMS,
  PERSONALIZATION_FACTORS,
  FEEDBACK_TYPES
} from '../../constants/ai-assistant-constants';

interface ProactiveRecommendationEngineProps {
  className?: string;
  enableRealTimeRecommendations?: boolean;
  maxRecommendations?: number;
  onRecommendationExecute?: (recommendation: AIRecommendation) => void;
  onRecommendationFeedback?: (feedback: RecommendationFeedback) => void;
  enablePersonalization?: boolean;
  autoRefreshInterval?: number;
}

interface RecommendationsPanelProps {
  recommendations: AIRecommendation[];
  selectedRecommendation: string | null;
  onRecommendationSelect: (recommendationId: string) => void;
  onRecommendationExecute: (recommendationId: string) => void;
  onRecommendationDismiss: (recommendationId: string) => void;
  onRecommendationFeedback: (recommendationId: string, feedback: RecommendationFeedback) => void;
}

interface RecommendationDetailsProps {
  recommendation: AIRecommendation;
  onExecute: () => void;
  onDismiss: () => void;
  onFeedback: (feedback: RecommendationFeedback) => void;
}

interface RecommendationFiltersProps {
  categories: RecommendationCategory[];
  selectedCategories: RecommendationCategory[];
  onCategoryToggle: (category: RecommendationCategory) => void;
  priorities: RecommendationPriority[];
  selectedPriorities: RecommendationPriority[];
  onPriorityToggle: (priority: RecommendationPriority) => void;
  sources: RecommendationSource[];
  selectedSources: RecommendationSource[];
  onSourceToggle: (source: RecommendationSource) => void;
}

interface PersonalizationDashboardProps {
  profile: PersonalizationProfile;
  onProfileUpdate: (updates: Partial<PersonalizationProfile>) => void;
  learningModels: LearningModel[];
  onModelTrain: (modelId: string) => void;
}

interface RecommendationAnalyticsProps {
  metrics: RecommendationMetrics;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onAnalyticsRefresh: () => void;
}

export const ProactiveRecommendationEngine: React.FC<ProactiveRecommendationEngineProps> = ({
  className = "",
  enableRealTimeRecommendations = true,
  maxRecommendations = 50,
  onRecommendationExecute,
  onRecommendationFeedback,
  enablePersonalization = true,
  autoRefreshInterval = 30000 // 30 seconds
}) => {
  // Hooks
  const {
    recommendationEngine,
    recommendations,
    personalizationProfile,
    learningModels,
    recommendationMetrics,
    generateProactiveRecommendations,
    executeRecommendation,
    submitRecommendationFeedback,
    updatePersonalizationProfile,
    trainRecommendationModel,
    getRecommendationAnalytics,
    isGeneratingRecommendations,
    error
  } = useAIAssistant();

  const {
    systemHealth,
    globalMetrics,
    performanceMetrics
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    crossGroupMetrics,
    spaIntegrationData
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    userBehaviorData,
    userPreferences
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceMetrics,
    workspaceConfiguration
  } = useWorkspaceManagement();

  const {
    trackActivity,
    recentActivities,
    activityPatterns,
    getUserActivityAnalytics
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'personalization' | 'analytics'>('recommendations');
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<RecommendationCategory[]>([]);
  const [filterPriorities, setFilterPriorities] = useState<RecommendationPriority[]>([]);
  const [filterSources, setFilterSources] = useState<RecommendationSource[]>([]);
  const [showDismissed, setShowDismissed] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(enableRealTimeRecommendations);
  const [sortBy, setSortBy] = useState<'priority' | 'score' | 'timestamp' | 'category'>('priority');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'cards'>('cards');
  const [recommendationHistory, setRecommendationHistory] = useState<AIRecommendation[]>([]);
  const [learningProgress, setLearningProgress] = useState<Record<string, number>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshInterval, setRefreshInterval] = useState(autoRefreshInterval);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recommendationCache = useRef<Map<string, AIRecommendation>>(new Map());

  // Computed Values
  const currentContext = useMemo<RecommendationContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    userBehavior: userBehaviorData,
    recentActivities: recentActivities.slice(0, 20),
    spaStatus: getAllSPAStatus(),
    workspaceMetrics,
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [
    currentUser,
    activeWorkspace,
    activeSPAContext,
    systemHealth,
    userBehaviorData,
    recentActivities,
    getAllSPAStatus,
    workspaceMetrics
  ]);

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Apply category filters
    if (filterCategories.length > 0) {
      filtered = filtered.filter(rec => filterCategories.includes(rec.category));
    }

    // Apply priority filters
    if (filterPriorities.length > 0) {
      filtered = filtered.filter(rec => filterPriorities.includes(rec.priority));
    }

    // Apply source filters
    if (filterSources.length > 0) {
      filtered = filtered.filter(rec => filterSources.includes(rec.source));
    }

    // Filter dismissed recommendations
    if (!showDismissed) {
      filtered = filtered.filter(rec => !rec.dismissed);
    }

    // Sort recommendations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'score':
          return b.confidence - a.confidence;
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered.slice(0, maxRecommendations);
  }, [
    recommendations,
    filterCategories,
    filterPriorities,
    filterSources,
    showDismissed,
    sortBy,
    maxRecommendations
  ]);

  const highPriorityRecommendations = useMemo(() => {
    return recommendations.filter(rec => 
      (rec.priority === 'critical' || rec.priority === 'high') && 
      !rec.dismissed
    );
  }, [recommendations]);

  const categoryMetrics = useMemo(() => {
    const metrics: Record<RecommendationCategory, number> = {} as any;
    RECOMMENDATION_CATEGORIES.forEach(category => {
      metrics[category] = recommendations.filter(rec => 
        rec.category === category && !rec.dismissed
      ).length;
    });
    return metrics;
  }, [recommendations]);

  const personalizedRecommendations = useMemo(() => {
    if (!enablePersonalization || !personalizationProfile) {
      return filteredRecommendations;
    }

    return personalizeRecommendations(filteredRecommendations, personalizationProfile);
  }, [filteredRecommendations, enablePersonalization, personalizationProfile]);

  // Effects
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(async () => {
        await refreshRecommendations();
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    // Generate initial recommendations
    generateInitialRecommendations();
  }, [currentContext]);

  useEffect(() => {
    // Update recommendation history
    recommendations.forEach(rec => {
      if (!recommendationHistory.find(h => h.id === rec.id)) {
        setRecommendationHistory(prev => [rec, ...prev.slice(0, 99)]);
        recommendationCache.current.set(rec.id, rec);
      }
    });
  }, [recommendations]);

  // Handlers
  const generateInitialRecommendations = useCallback(async () => {
    try {
      await generateProactiveRecommendations({
        context: currentContext,
        maxRecommendations,
        enablePersonalization,
        includeAllCategories: true,
        realTimeAnalysis: true
      });

      setLastRefresh(new Date());
      
      trackActivity({
        type: 'recommendations_generated',
        details: {
          count: recommendations.length,
          context: currentContext.activeSPA,
          personalized: enablePersonalization
        }
      });
    } catch (error) {
      console.error('Failed to generate initial recommendations:', error);
    }
  }, [
    generateProactiveRecommendations,
    currentContext,
    maxRecommendations,
    enablePersonalization,
    recommendations.length,
    trackActivity
  ]);

  const refreshRecommendations = useCallback(async () => {
    try {
      await generateProactiveRecommendations({
        context: currentContext,
        maxRecommendations,
        enablePersonalization,
        includeAllCategories: true,
        refreshMode: true
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    }
  }, [generateProactiveRecommendations, currentContext, maxRecommendations, enablePersonalization]);

  const handleRecommendationExecute = useCallback(async (recommendationId: string) => {
    try {
      const recommendation = recommendations.find(r => r.id === recommendationId);
      if (!recommendation) return;

      const result = await executeRecommendation(recommendationId, {
        context: currentContext,
        userConfirmation: true,
        trackExecution: true
      });

      if (onRecommendationExecute) {
        onRecommendationExecute(recommendation);
      }

      trackActivity({
        type: 'recommendation_executed',
        details: {
          recommendationId,
          category: recommendation.category,
          priority: recommendation.priority,
          executionResult: result.success
        }
      });

      // Auto-refresh recommendations after execution
      await refreshRecommendations();

    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    }
  }, [
    recommendations,
    executeRecommendation,
    currentContext,
    onRecommendationExecute,
    trackActivity,
    refreshRecommendations
  ]);

  const handleRecommendationFeedback = useCallback(async (
    recommendationId: string, 
    feedback: RecommendationFeedback
  ) => {
    try {
      await submitRecommendationFeedback(recommendationId, {
        ...feedback,
        userId: currentUser?.id || 'anonymous',
        timestamp: new Date(),
        context: currentContext
      });

      if (onRecommendationFeedback) {
        onRecommendationFeedback(feedback);
      }

      trackActivity({
        type: 'recommendation_feedback_submitted',
        details: {
          recommendationId,
          feedbackType: feedback.type,
          rating: feedback.rating,
          useful: feedback.useful
        }
      });

      // Update learning models based on feedback
      if (enablePersonalization) {
        await updateLearningModel(feedback);
      }

    } catch (error) {
      console.error('Failed to submit recommendation feedback:', error);
    }
  }, [
    submitRecommendationFeedback,
    currentUser,
    currentContext,
    onRecommendationFeedback,
    trackActivity,
    enablePersonalization
  ]);

  const handleRecommendationDismiss = useCallback(async (recommendationId: string) => {
    try {
      await submitRecommendationFeedback(recommendationId, {
        type: 'dismissed',
        useful: false,
        rating: 1,
        userId: currentUser?.id || 'anonymous',
        timestamp: new Date(),
        context: currentContext
      });

      trackActivity({
        type: 'recommendation_dismissed',
        details: { recommendationId }
      });
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
    }
  }, [submitRecommendationFeedback, currentUser, currentContext, trackActivity]);

  const handlePersonalizationUpdate = useCallback(async (updates: Partial<PersonalizationProfile>) => {
    try {
      await updatePersonalizationProfile({
        ...personalizationProfile,
        ...updates,
        lastUpdated: new Date()
      });

      // Regenerate recommendations with new personalization
      if (enablePersonalization) {
        await refreshRecommendations();
      }

      trackActivity({
        type: 'personalization_updated',
        details: { updateFields: Object.keys(updates) }
      });
    } catch (error) {
      console.error('Failed to update personalization profile:', error);
    }
  }, [
    updatePersonalizationProfile,
    personalizationProfile,
    enablePersonalization,
    refreshRecommendations,
    trackActivity
  ]);

  const handleModelTraining = useCallback(async (modelId: string) => {
    try {
      setLearningProgress(prev => ({ ...prev, [modelId]: 0 }));

      const trainingProgress = await trainRecommendationModel(modelId, {
        userId: currentUser?.id,
        trainingData: recommendationHistory,
        feedbackData: [], // Would be populated from actual feedback
        onProgress: (progress) => {
          setLearningProgress(prev => ({ ...prev, [modelId]: progress }));
        }
      });

      trackActivity({
        type: 'model_trained',
        details: {
          modelId,
          accuracy: trainingProgress.accuracy,
          trainingTime: trainingProgress.duration
        }
      });

      // Refresh recommendations with improved model
      await refreshRecommendations();

    } catch (error) {
      console.error('Failed to train model:', error);
    } finally {
      setLearningProgress(prev => ({ ...prev, [modelId]: 100 }));
    }
  }, [
    trainRecommendationModel,
    currentUser,
    recommendationHistory,
    trackActivity,
    refreshRecommendations
  ]);

  const handleExportRecommendations = useCallback(() => {
    const exportData = {
      recommendations: filteredRecommendations,
      metrics: recommendationMetrics,
      context: currentContext,
      personalization: personalizationProfile,
      exportTimestamp: new Date(),
      filters: {
        categories: filterCategories,
        priorities: filterPriorities,
        sources: filterSources
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `recommendations-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [
    filteredRecommendations,
    recommendationMetrics,
    currentContext,
    personalizationProfile,
    filterCategories,
    filterPriorities,
    filterSources
  ]);

  // Render Methods
  const renderRecommendationsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{filteredRecommendations.length}</div>
              <p className="text-xs text-muted-foreground">Active Recommendations</p>
            </div>
            <Lightbulb className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{highPriorityRecommendations.length}</div>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((recommendationMetrics?.averageAccuracy || 0) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Accuracy Rate</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {recommendationMetrics?.executionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Execution Rate</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecommendationsPanel = () => (
    <RecommendationsPanel
      recommendations={personalizedRecommendations}
      selectedRecommendation={selectedRecommendation}
      onRecommendationSelect={setSelectedRecommendation}
      onRecommendationExecute={handleRecommendationExecute}
      onRecommendationDismiss={handleRecommendationDismiss}
      onRecommendationFeedback={handleRecommendationFeedback}
    />
  );

  const renderPersonalizationDashboard = () => (
    <PersonalizationDashboard
      profile={personalizationProfile}
      onProfileUpdate={handlePersonalizationUpdate}
      learningModels={learningModels}
      onModelTrain={handleModelTraining}
    />
  );

  const renderAnalytics = () => (
    <RecommendationAnalytics
      metrics={recommendationMetrics}
      timeRange="24h"
      onTimeRangeChange={() => {}}
      onAnalyticsRefresh={async () => {
        // Refresh analytics
      }}
    />
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-500" />
            <div>
              <h2 className="text-xl font-semibold">Proactive Recommendation Engine</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered recommendations for optimal data governance operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label className="text-sm">Auto Refresh</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={enablePersonalization}
                onCheckedChange={() => {}}
                disabled
              />
              <Label className="text-sm">Personalization</Label>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportRecommendations}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button 
              onClick={refreshRecommendations}
              disabled={isGeneratingRecommendations}
              size="sm"
            >
              {isGeneratingRecommendations ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {renderRecommendationsOverview()}

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Sort by:</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="timestamp">Recent</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">View:</Label>
                  <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cards">Cards</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showDismissed}
                    onCheckedChange={setShowDismissed}
                  />
                  <Label className="text-sm">Show Dismissed</Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </Badge>
                {autoRefresh && (
                  <Badge variant="secondary" className="text-xs">
                    Auto-refresh: {refreshInterval / 1000}s
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
              {highPriorityRecommendations.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {highPriorityRecommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personalization
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {renderRecommendationsPanel()}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Predictive Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Predictive insights panel coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalization" className="space-y-4">
            {renderPersonalizationDashboard()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {renderAnalytics()}
          </TabsContent>
        </Tabs>

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
                <AlertTitle>Recommendation Engine Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Recommendations Panel Component
const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  selectedRecommendation,
  onRecommendationSelect,
  onRecommendationExecute,
  onRecommendationDismiss,
  onRecommendationFeedback
}) => {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Recommendations Available</h3>
          <p className="text-muted-foreground text-sm">
            The AI is analyzing your system to generate personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityIcon = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Flag className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-500" />;
      case 'low': return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'data_quality': return <Database className="h-4 w-4" />;
      case 'workflow': return <Workflow className="h-4 w-4" />;
      case 'cost': return <TrendingDown className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card 
          key={recommendation.id} 
          className={`cursor-pointer transition-all duration-200 ${getPriorityColor(recommendation.priority)} ${
            selectedRecommendation === recommendation.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onRecommendationSelect(recommendation.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(recommendation.priority)}
                  {getCategoryIcon(recommendation.category)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base mb-1">{recommendation.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {recommendation.category}
                </Badge>
                <Badge variant={recommendation.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                  {recommendation.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Confidence:</span>
                  <span>{Math.round(recommendation.confidence * 100)}%</span>
                </div>
                <Progress value={recommendation.confidence * 100} className="h-2" />
              </div>

              {recommendation.expectedImpact && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Expected Impact:</Label>
                    <div className="capitalize">{recommendation.expectedImpact}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Source:</Label>
                    <div className="capitalize">{recommendation.source}</div>
                  </div>
                </div>
              )}

              {recommendation.actionItems && recommendation.actionItems.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Action Items:</Label>
                  <div className="space-y-1">
                    {recommendation.actionItems.slice(0, 3).map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {new Date(recommendation.timestamp).toLocaleString()}
                </span>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecommendationExecute(recommendation.id);
                    }}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecommendationFeedback(recommendation.id, {
                        type: 'helpful',
                        useful: true,
                        rating: 5,
                        userId: 'current-user',
                        timestamp: new Date()
                      });
                    }}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecommendationDismiss(recommendation.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Personalization Dashboard Component
const PersonalizationDashboard: React.FC<PersonalizationDashboardProps> = ({
  profile,
  onProfileUpdate,
  learningModels,
  onModelTrain
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personalization Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Recommendations Generated:</Label>
              <div>{profile?.totalRecommendations || 0}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Accuracy Rate:</Label>
              <div>{Math.round((profile?.accuracy || 0) * 100)}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preferred Categories:</Label>
            <div className="flex flex-wrap gap-2">
              {RECOMMENDATION_CATEGORIES.map(category => (
                <Badge 
                  key={category} 
                  variant={profile?.preferredCategories?.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = profile?.preferredCategories || [];
                    const updated = current.includes(category)
                      ? current.filter(c => c !== category)
                      : [...current, category];
                    onProfileUpdate({ preferredCategories: updated });
                  }}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Learning Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{model.name}</h4>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Accuracy: {Math.round((model.accuracy || 0) * 100)}%
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {model.status}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModelTrain(model.id)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Train
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Recommendation Analytics Component
const RecommendationAnalytics: React.FC<RecommendationAnalyticsProps> = ({
  metrics,
  timeRange,
  onTimeRangeChange,
  onAnalyticsRefresh
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recommendation Analytics</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onAnalyticsRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics?.totalRecommendations || 0}</div>
              <p className="text-sm text-muted-foreground">Total Generated</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics?.executedRecommendations || 0}</div>
              <p className="text-sm text-muted-foreground">Executed</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round((metrics?.averageAccuracy || 0) * 100)}%</div>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Math.round((metrics?.userSatisfaction || 0) * 100)}%</div>
              <p className="text-sm text-muted-foreground">User Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProactiveRecommendationEngine;