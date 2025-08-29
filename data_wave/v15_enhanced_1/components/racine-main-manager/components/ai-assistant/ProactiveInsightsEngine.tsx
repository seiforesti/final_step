'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Brain, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, XCircle, Eye, EyeOff, Settings, RefreshCw, Play, Pause, Square, BarChart3, LineChart, PieChart, Activity, Clock, Calendar, Users, Database, Shield, Workflow, Zap, Target, Search, Filter, Download, Upload, Save, FolderOpen, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Star, Bookmark, Flag, Bell, BellOff, Volume2, VolumeX, Mail, MessageSquare, PhoneCall, Smartphone, Monitor, Gauge, Thermometer, Battery, Wifi, WifiOff, Globe, MapPin, Compass, Navigation, Map, Route, Layers, GitBranch } from 'lucide-react';

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
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Types
import { 
  ProactiveInsight,
  InsightCategory,
  InsightPriority,
  InsightAction,
  PatternAnalysis,
  PredictiveModel,
  AnomalyDetection,
  TrendAnalysis,
  RecommendationEngine,
  PerformanceMetrics,
  BehaviorPattern,
  SystemPattern,
  DataPattern,
  InsightEngine,
  LearningModel,
  FeedbackLoop,
  InsightHistory,
  NotificationPreference,
  AlertConfiguration,
  ThresholdConfiguration,
  ModelConfiguration
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  analyzePatterns,
  detectAnomalies,
  generateInsights,
  calculateTrends,
  buildPredictiveModel,
  processUserBehavior,
  optimizeRecommendations,
  validateInsights,
  prioritizeInsights,
  formatInsightData
} from '../../utils/ai-assistant-utils';

// Constants
import {
  INSIGHT_CATEGORIES,
  INSIGHT_PRIORITIES,
  PATTERN_TYPES,
  ANOMALY_THRESHOLDS,
  LEARNING_CONFIG,
  NOTIFICATION_CHANNELS
} from '../../constants/ai-assistant-constants';

interface ProactiveInsightsEngineProps {
  className?: string;
  autoAnalysis?: boolean;
  analysisInterval?: number;
  onInsightGenerated?: (insight: ProactiveInsight) => void;
  onAnomalyDetected?: (anomaly: AnomalyDetection) => void;
  onRecommendationCreated?: (recommendation: InsightAction) => void;
  enableNotifications?: boolean;
}

interface InsightsPanelProps {
  insights: ProactiveInsight[];
  selectedInsight: string | null;
  onInsightSelect: (insightId: string) => void;
  onInsightAction: (insightId: string, action: string) => void;
  onInsightDismiss: (insightId: string) => void;
}

interface PatternAnalysisProps {
  patterns: PatternAnalysis[];
  selectedPattern: string | null;
  onPatternSelect: (patternId: string) => void;
  onPatternExplore: (patternId: string) => void;
}

interface AnomalyDetectionPanelProps {
  anomalies: AnomalyDetection[];
  onAnomalyInvestigate: (anomalyId: string) => void;
  onAnomalyResolve: (anomalyId: string) => void;
}

interface TrendAnalysisProps {
  trends: TrendAnalysis[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onTrendExplore: (trendId: string) => void;
}

interface RecommendationsPanelProps {
  recommendations: InsightAction[];
  onRecommendationExecute: (recommendationId: string) => void;
  onRecommendationSchedule: (recommendationId: string, scheduleTime: Date) => void;
  onRecommendationCustomize: (recommendationId: string) => void;
}

interface LearningModelsPanelProps {
  models: LearningModel[];
  activeModel: string;
  onModelSelect: (modelId: string) => void;
  onModelTrain: (modelId: string) => void;
  onModelEvaluate: (modelId: string) => void;
}

interface InsightConfigurationProps {
  alertConfig: AlertConfiguration;
  thresholds: ThresholdConfiguration;
  onConfigUpdate: (config: Partial<AlertConfiguration>) => void;
  onThresholdUpdate: (thresholds: Partial<ThresholdConfiguration>) => void;
}

export const ProactiveInsightsEngine: React.FC<ProactiveInsightsEngineProps> = ({
  className = "",
  autoAnalysis = true,
  analysisInterval = 30000, // 30 seconds
  onInsightGenerated,
  onAnomalyDetected,
  onRecommendationCreated,
  enableNotifications = true
}) => {
  // Hooks
  const {
    insightsEngine,
    proactiveInsights,
    patterns,
    anomalies,
    trends,
    recommendations,
    learningModels,
    generateProactiveInsights,
    analyzeSystemPatterns,
    detectSystemAnomalies,
    updateInsightConfiguration,
    trainLearningModel,
    isAnalyzing,
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
    crossGroupMetrics
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    userBehaviorMetrics
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceMetrics
  } = useWorkspaceManagement();

  const {
    trackActivity,
    recentActivities,
    activityPatterns
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'insights' | 'patterns' | 'anomalies' | 'trends' | 'recommendations' | 'models' | 'config'>('insights');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(autoAnalysis);
  const [notificationsEnabled, setNotificationsEnabled] = useState(enableNotifications);
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'standard' | 'comprehensive'>('standard');
  const [timeRange, setTimeRange] = useState('24h');
  const [filterCategory, setFilterCategory] = useState<InsightCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<InsightPriority | 'all'>('all');
  const [showDismissed, setShowDismissed] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [insightHistory, setInsightHistory] = useState<ProactiveInsight[]>([]);
  const [alertConfiguration, setAlertConfiguration] = useState<AlertConfiguration>({
    enableEmailAlerts: true,
    enablePushNotifications: true,
    enableSlackIntegration: false,
    criticalThreshold: 0.8,
    warningThreshold: 0.6,
    infoThreshold: 0.4,
    quietHours: { start: '22:00', end: '08:00' },
    maxDailyAlerts: 50
  });

  // Refs
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const insightCounterRef = useRef(0);

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [currentUser, activeWorkspace, activeSPAContext, systemHealth]);

  const filteredInsights = useMemo(() => {
    let filtered = proactiveInsights;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(insight => insight.category === filterCategory);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === filterPriority);
    }

    if (!showDismissed) {
      filtered = filtered.filter(insight => !insight.dismissed);
    }

    return filtered.sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [proactiveInsights, filterCategory, filterPriority, showDismissed]);

  const criticalInsights = useMemo(() => {
    return proactiveInsights.filter(insight => 
      insight.priority === 'critical' && !insight.dismissed
    );
  }, [proactiveInsights]);

  const pendingRecommendations = useMemo(() => {
    return recommendations.filter(rec => rec.status === 'pending');
  }, [recommendations]);

  const recentAnomalies = useMemo(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return anomalies.filter(anomaly => 
      new Date(anomaly.detectedAt) > oneHourAgo && 
      anomaly.status === 'active'
    );
  }, [anomalies]);

  // Effects
  useEffect(() => {
    if (autoAnalysisEnabled && realTimeUpdates) {
      analysisIntervalRef.current = setInterval(async () => {
        await performAnalysis();
      }, analysisInterval);
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [autoAnalysisEnabled, realTimeUpdates, analysisInterval]);

  useEffect(() => {
    // Track insight generation
    proactiveInsights.forEach(insight => {
      if (insight.id && !insightHistory.find(h => h.id === insight.id)) {
        setInsightHistory(prev => [insight, ...prev.slice(0, 99)]);
        
        if (onInsightGenerated) {
          onInsightGenerated(insight);
        }

        // Send notifications for critical insights
        if (insight.priority === 'critical' && notificationsEnabled) {
          sendInsightNotification(insight);
        }
      }
    });
  }, [proactiveInsights, onInsightGenerated, notificationsEnabled]);

  useEffect(() => {
    // Track anomaly detection
    anomalies.forEach(anomaly => {
      if (anomaly.severity === 'high' && onAnomalyDetected) {
        onAnomalyDetected(anomaly);
      }
    });
  }, [anomalies, onAnomalyDetected]);

  useEffect(() => {
    // Track recommendation creation
    recommendations.forEach(recommendation => {
      if (recommendation.status === 'pending' && onRecommendationCreated) {
        onRecommendationCreated(recommendation);
      }
    });
  }, [recommendations, onRecommendationCreated]);

  // Handlers
  const performAnalysis = useCallback(async () => {
    try {
      await Promise.all([
        generateProactiveInsights({
          context: currentContext,
          depth: analysisDepth,
          includePredictions: true
        }),
        analyzeSystemPatterns({
          timeRange,
          includeUserBehavior: true,
          includeCrossGroup: true
        }),
        detectSystemAnomalies({
          sensitivity: alertConfiguration.criticalThreshold,
          realTime: true
        })
      ]);

      trackActivity({
        type: 'proactive_analysis_completed',
        details: {
          insightCount: proactiveInsights.length,
          anomalyCount: recentAnomalies.length,
          analysisDepth
        }
      });
    } catch (error) {
      console.error('Failed to perform proactive analysis:', error);
    }
  }, [
    generateProactiveInsights,
    analyzeSystemPatterns,
    detectSystemAnomalies,
    currentContext,
    analysisDepth,
    timeRange,
    alertConfiguration,
    proactiveInsights.length,
    recentAnomalies.length,
    trackActivity
  ]);

  const handleInsightAction = useCallback(async (insightId: string, action: string) => {
    try {
      const insight = proactiveInsights.find(i => i.id === insightId);
      if (!insight) return;

      switch (action) {
        case 'execute':
          if (insight.recommendedActions && insight.recommendedActions.length > 0) {
            // Execute the first recommended action
            await executeInsightAction(insight.recommendedActions[0]);
          }
          break;
        case 'schedule':
          // Schedule the insight for later execution
          break;
        case 'investigate':
          // Open detailed investigation view
          break;
        case 'share':
          // Share insight with team
          break;
      }

      trackActivity({
        type: 'insight_action_taken',
        details: {
          insightId,
          action,
          category: insight.category,
          priority: insight.priority
        }
      });
    } catch (error) {
      console.error('Failed to execute insight action:', error);
    }
  }, [proactiveInsights, trackActivity]);

  const handleInsightDismiss = useCallback(async (insightId: string) => {
    try {
      // Mark insight as dismissed
      // This would typically update the backend state
      
      trackActivity({
        type: 'insight_dismissed',
        details: { insightId }
      });
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    }
  }, [trackActivity]);

  const executeInsightAction = useCallback(async (action: InsightAction) => {
    try {
      // Execute the specific action based on its type
      switch (action.type) {
        case 'optimize_query':
          // Optimize database query
          break;
        case 'scale_resources':
          // Scale system resources
          break;
        case 'update_permissions':
          // Update user permissions
          break;
        case 'clean_data':
          // Clean data inconsistencies
          break;
        case 'backup_data':
          // Trigger data backup
          break;
      }
    } catch (error) {
      console.error('Failed to execute insight action:', error);
    }
  }, []);

  const sendInsightNotification = useCallback(async (insight: ProactiveInsight) => {
    if (!notificationsEnabled) return;

    try {
      // Check quiet hours
      const now = new Date();
      const quietStart = alertConfiguration.quietHours.start;
      const quietEnd = alertConfiguration.quietHours.end;
      
      // Simple quiet hours check (would be more sophisticated in production)
      const currentHour = now.getHours();
      const isQuietTime = currentHour >= 22 || currentHour <= 8;
      
      if (isQuietTime && insight.priority !== 'critical') {
        return; // Skip non-critical notifications during quiet hours
      }

      // Send notification based on configuration
      if (alertConfiguration.enablePushNotifications) {
        // Send push notification
      }
      
      if (alertConfiguration.enableEmailAlerts) {
        // Send email alert
      }
      
      if (alertConfiguration.enableSlackIntegration) {
        // Send Slack message
      }
    } catch (error) {
      console.error('Failed to send insight notification:', error);
    }
  }, [notificationsEnabled, alertConfiguration]);

  const handleManualAnalysis = useCallback(() => {
    performAnalysis();
  }, [performAnalysis]);

  const handleExportInsights = useCallback(() => {
    const exportData = {
      insights: filteredInsights,
      patterns,
      anomalies: recentAnomalies,
      trends,
      metadata: {
        exportedAt: new Date(),
        timeRange,
        filters: { category: filterCategory, priority: filterPriority },
        context: currentContext
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `proactive-insights-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [filteredInsights, patterns, recentAnomalies, trends, timeRange, filterCategory, filterPriority, currentContext]);

  // Render Methods
  const renderInsightsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{filteredInsights.length}</div>
              <p className="text-xs text-muted-foreground">Total Insights</p>
            </div>
            <Lightbulb className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{criticalInsights.length}</div>
              <p className="text-xs text-muted-foreground">Critical Issues</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{pendingRecommendations.length}</div>
              <p className="text-xs text-muted-foreground">Recommendations</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{recentAnomalies.length}</div>
              <p className="text-xs text-muted-foreground">Recent Anomalies</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsPanel = () => (
    <InsightsPanel
      insights={filteredInsights}
      selectedInsight={selectedInsight}
      onInsightSelect={setSelectedInsight}
      onInsightAction={handleInsightAction}
      onInsightDismiss={handleInsightDismiss}
    />
  );

  const renderPatternsPanel = () => (
    <PatternAnalysisPanel
      patterns={patterns}
      selectedPattern={selectedPattern}
      onPatternSelect={setSelectedPattern}
      onPatternExplore={(patternId) => {
        // Handle pattern exploration
      }}
    />
  );

  const renderAnomaliesPanel = () => (
    <AnomalyDetectionPanel
      anomalies={anomalies}
      onAnomalyInvestigate={(anomalyId) => {
        // Handle anomaly investigation
      }}
      onAnomalyResolve={(anomalyId) => {
        // Handle anomaly resolution
      }}
    />
  );

  const renderTrendsPanel = () => (
    <TrendAnalysisPanel
      trends={trends}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      onTrendExplore={(trendId) => {
        // Handle trend exploration
      }}
    />
  );

  const renderRecommendationsPanel = () => (
    <RecommendationsPanel
      recommendations={recommendations}
      onRecommendationExecute={(recommendationId) => {
        // Handle recommendation execution
      }}
      onRecommendationSchedule={(recommendationId, scheduleTime) => {
        // Handle recommendation scheduling
      }}
      onRecommendationCustomize={(recommendationId) => {
        // Handle recommendation customization
      }}
    />
  );

  const renderLearningModelsPanel = () => (
    <LearningModelsPanel
      models={learningModels}
      activeModel={insightsEngine?.activeModel || ''}
      onModelSelect={(modelId) => {
        // Handle model selection
      }}
      onModelTrain={(modelId) => {
        trainLearningModel(modelId);
      }}
      onModelEvaluate={(modelId) => {
        // Handle model evaluation
      }}
    />
  );

  const renderConfigurationPanel = () => (
    <InsightConfiguration
      alertConfig={alertConfiguration}
      thresholds={{
        criticalThreshold: alertConfiguration.criticalThreshold,
        warningThreshold: alertConfiguration.warningThreshold,
        infoThreshold: alertConfiguration.infoThreshold
      }}
      onConfigUpdate={(config) => {
        setAlertConfiguration(prev => ({ ...prev, ...config }));
        updateInsightConfiguration(config);
      }}
      onThresholdUpdate={(thresholds) => {
        setAlertConfiguration(prev => ({ ...prev, ...thresholds }));
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
              <h2 className="text-xl font-semibold">Proactive Insights Engine</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered pattern analysis and predictive recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoAnalysisEnabled}
                onCheckedChange={setAutoAnalysisEnabled}
              />
              <Label className="text-sm">Auto Analysis</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <Label className="text-sm">Notifications</Label>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportInsights}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button 
              onClick={handleManualAnalysis}
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Analyze Now
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {renderInsightsOverview()}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Category:</Label>
                  <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {INSIGHT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Priority:</Label>
                  <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {INSIGHT_PRIORITIES.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Time Range:</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showDismissed}
                  onCheckedChange={setShowDismissed}
                />
                <Label className="text-sm">Show Dismissed</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
              {criticalInsights.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {criticalInsights.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Anomalies
              {recentAnomalies.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {recentAnomalies.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendations
              {pendingRecommendations.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingRecommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {renderInsightsPanel()}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            {renderPatternsPanel()}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            {renderAnomaliesPanel()}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {renderTrendsPanel()}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {renderRecommendationsPanel()}
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            {renderLearningModelsPanel()}
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            {renderConfigurationPanel()}
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
                <AlertTitle>Insights Engine Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Insights Panel Component
const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  selectedInsight,
  onInsightSelect,
  onInsightAction,
  onInsightDismiss
}) => {
  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Insights Available</h3>
          <p className="text-muted-foreground text-sm">
            Run analysis to generate proactive insights and recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityIcon = (priority: InsightPriority) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Flag className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-500" />;
      case 'low': return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: InsightPriority) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card 
          key={insight.id} 
          className={`cursor-pointer transition-all duration-200 ${getPriorityColor(insight.priority)} ${
            selectedInsight === insight.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onInsightSelect(insight.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getPriorityIcon(insight.priority)}
                <div className="flex-1">
                  <CardTitle className="text-base mb-1">{insight.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {insight.category}
                </Badge>
                <Badge variant={insight.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                  {insight.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {insight.metrics && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(insight.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {insight.confidence && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Confidence:</span>
                    <span>{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <Progress value={insight.confidence * 100} className="h-2" />
                </div>
              )}

              {insight.recommendedActions && insight.recommendedActions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Recommended Actions:</Label>
                  <div className="space-y-1">
                    {insight.recommendedActions.slice(0, 3).map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{action.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {new Date(insight.timestamp).toLocaleString()}
                </span>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsightAction(insight.id, 'execute');
                    }}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsightAction(insight.id, 'investigate');
                    }}
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsightDismiss(insight.id);
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

// Pattern Analysis Panel Component
const PatternAnalysisPanel: React.FC<PatternAnalysisProps> = ({
  patterns,
  selectedPattern,
  onPatternSelect,
  onPatternExplore
}) => {
  return (
    <div className="space-y-4">
      {patterns.map((pattern) => (
        <Card 
          key={pattern.id}
          className={`cursor-pointer transition-colors ${
            selectedPattern === pattern.id ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => onPatternSelect(pattern.id)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{pattern.name}</CardTitle>
              <Badge variant="outline">{pattern.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <Label className="text-muted-foreground">Frequency:</Label>
                <div>{pattern.frequency}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Confidence:</Label>
                <div>{Math.round(pattern.confidence * 100)}%</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Detected: {new Date(pattern.detectedAt).toLocaleString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPatternExplore(pattern.id);
                }}
              >
                <Search className="h-3 w-3 mr-1" />
                Explore
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Anomaly Detection Panel Component
const AnomalyDetectionPanel: React.FC<AnomalyDetectionPanelProps> = ({
  anomalies,
  onAnomalyInvestigate,
  onAnomalyResolve
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {anomalies.map((anomaly) => (
        <Card key={anomaly.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{anomaly.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(anomaly.severity)}>
                  {anomaly.severity}
                </Badge>
                <Badge variant="outline">{anomaly.type}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{anomaly.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <Label className="text-muted-foreground">Score:</Label>
                <div>{anomaly.score.toFixed(3)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Status:</Label>
                <div className="capitalize">{anomaly.status}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Detected: {new Date(anomaly.detectedAt).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAnomalyInvestigate(anomaly.id)}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Investigate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAnomalyResolve(anomaly.id)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Trend Analysis Panel Component
const TrendAnalysisPanel: React.FC<TrendAnalysisProps> = ({
  trends,
  timeRange,
  onTimeRangeChange,
  onTrendExplore
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Trend Analysis</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend) => (
              <div key={trend.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{trend.metric}</h4>
                  <div className="flex items-center gap-2">
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {trend.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Period: {trend.timeframe}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTrendExplore(trend.id)}
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Recommendations Panel Component
const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  onRecommendationExecute,
  onRecommendationSchedule,
  onRecommendationCustomize
}) => {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
                {recommendation.priority}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <Label className="text-muted-foreground">Impact:</Label>
                <div className="capitalize">{recommendation.impact}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Effort:</Label>
                <div className="capitalize">{recommendation.effort}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Created: {new Date(recommendation.createdAt).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRecommendationCustomize(recommendation.id)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRecommendationSchedule(recommendation.id, new Date())}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRecommendationExecute(recommendation.id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Execute
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Learning Models Panel Component
const LearningModelsPanel: React.FC<LearningModelsPanelProps> = ({
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
          className={activeModel === model.id ? 'border-primary bg-primary/5' : ''}
        >
          <CardHeader>
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
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <Label className="text-muted-foreground">Accuracy:</Label>
                <div>{Math.round((model.accuracy || 0) * 100)}%</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Training:</Label>
                <div>{model.lastTrained ? new Date(model.lastTrained).toLocaleDateString() : 'Never'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModelSelect(model.id)}
                disabled={activeModel === model.id}
              >
                <Target className="h-3 w-3 mr-1" />
                {activeModel === model.id ? 'Active' : 'Select'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModelTrain(model.id)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Train
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModelEvaluate(model.id)}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Evaluate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Insight Configuration Component
const InsightConfiguration: React.FC<InsightConfigurationProps> = ({
  alertConfig,
  thresholds,
  onConfigUpdate,
  onThresholdUpdate
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alert Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Email Alerts</Label>
              <Switch
                checked={alertConfig.enableEmailAlerts}
                onCheckedChange={(checked) => onConfigUpdate({ enableEmailAlerts: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Push Notifications</Label>
              <Switch
                checked={alertConfig.enablePushNotifications}
                onCheckedChange={(checked) => onConfigUpdate({ enablePushNotifications: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Slack Integration</Label>
              <Switch
                checked={alertConfig.enableSlackIntegration}
                onCheckedChange={(checked) => onConfigUpdate({ enableSlackIntegration: checked })}
              />
            </div>

            <div>
              <Label className="text-sm">Max Daily Alerts</Label>
              <Input
                type="number"
                value={alertConfig.maxDailyAlerts}
                onChange={(e) => onConfigUpdate({ maxDailyAlerts: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Threshold Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Critical Threshold</Label>
            <Slider
              value={[thresholds.criticalThreshold]}
              onValueChange={([value]) => onThresholdUpdate({ criticalThreshold: value })}
              min={0.1}
              max={1}
              step={0.05}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(thresholds.criticalThreshold * 100)}%
            </div>
          </div>

          <div>
            <Label className="text-sm">Warning Threshold</Label>
            <Slider
              value={[thresholds.warningThreshold]}
              onValueChange={([value]) => onThresholdUpdate({ warningThreshold: value })}
              min={0.1}
              max={1}
              step={0.05}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(thresholds.warningThreshold * 100)}%
            </div>
          </div>

          <div>
            <Label className="text-sm">Info Threshold</Label>
            <Slider
              value={[thresholds.infoThreshold]}
              onValueChange={([value]) => onThresholdUpdate({ infoThreshold: value })}
              min={0.1}
              max={1}
              step={0.05}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(thresholds.infoThreshold * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProactiveInsightsEngine;
