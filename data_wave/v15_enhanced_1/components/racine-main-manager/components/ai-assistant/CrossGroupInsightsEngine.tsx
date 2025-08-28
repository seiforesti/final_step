'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity, Brain, Eye, Layers, GitBranch, Network, Zap, Target, Gauge, Compass, Globe, Search, Filter, Settings, RefreshCw, Download, Upload, Save, Share, Bookmark, Star, Flag, AlertTriangle, CheckCircle, XCircle, Info, Clock, Calendar, Timer, Users, Database, Shield, Edit, Copy, Trash2, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, ArrowRight, ArrowUpRight, ArrowDownRight, Maximize, Minimize, ExternalLink, LinkIcon, Hash, Tag, Workflow, Route, MapPin, Crosshair, Focus, Scan, Radar, Microscope,  } from 'lucide-react';

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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';

// Types
import { 
  CrossGroupInsights,
  InsightType,
  InsightCategory,
  InsightSeverity,
  SPACorrelation,
  CrossGroupPattern,
  InsightMetrics,
  TrendAnalysis,
  AnomalyDetection,
  PerformanceInsight,
  SecurityInsight,
  ComplianceInsight,
  DataQualityInsight,
  UserBehaviorInsight,
  SystemHealthInsight,
  PredictiveInsight,
  StrategicRecommendation,
  InsightVisualization,
  CrossGroupDependency,
  InsightHistory,
  InsightAlert
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext,
  SPAStatus
} from '../../types/racine-core.types';

// Utilities
import {
  analyzeCrossGroupPatterns,
  detectCrossGroupAnomalies,
  generateStrategicInsights,
  calculateSPACorrelations,
  identifyPerformanceBottlenecks,
  assessSecurityRisks,
  evaluateComplianceStatus,
  analyzeDataQualityTrends,
  predictSystemBehavior,
  generateActionableRecommendations,
  visualizeInsights,
  exportInsightsReport
} from '../../utils/ai-assistant-utils';

// Constants
import {
  INSIGHT_TYPES,
  INSIGHT_CATEGORIES,
  INSIGHT_SEVERITIES,
  SPA_GROUPS,
  CORRELATION_THRESHOLDS,
  TREND_INDICATORS
} from '../../constants/ai-assistant-constants';

interface CrossGroupInsightsEngineProps {
  className?: string;
  enableRealTimeAnalysis?: boolean;
  analysisDepth?: 'surface' | 'deep' | 'comprehensive';
  onInsightGenerated?: (insight: CrossGroupInsights) => void;
  onStrategicRecommendation?: (recommendation: StrategicRecommendation) => void;
  autoRefreshInterval?: number;
}

interface InsightsDashboardProps {
  insights: CrossGroupInsights[];
  selectedInsight: string | null;
  onInsightSelect: (insightId: string) => void;
  onInsightDismiss: (insightId: string) => void;
  onInsightBookmark: (insightId: string) => void;
}

interface CorrelationMatrixProps {
  correlations: SPACorrelation[];
  onCorrelationExplore: (spa1: string, spa2: string) => void;
  showWeakCorrelations: boolean;
  onSettingsChange: (setting: string, value: any) => void;
}

interface TrendAnalysisProps {
  trends: TrendAnalysis[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onTrendDrilldown: (trendId: string) => void;
}

interface PredictiveAnalyticsProps {
  predictions: PredictiveInsight[];
  confidenceThreshold: number;
  onConfidenceThresholdChange: (threshold: number) => void;
  onPredictionExplore: (predictionId: string) => void;
}

export const CrossGroupInsightsEngine: React.FC<CrossGroupInsightsEngineProps> = ({
  className = "",
  enableRealTimeAnalysis = true,
  analysisDepth = 'deep',
  onInsightGenerated,
  onStrategicRecommendation,
  autoRefreshInterval = 60000 // 1 minute
}) => {
  // Hooks
  const {
    crossGroupInsights,
    spaCorrelations,
    crossGroupPatterns,
    trendAnalysis,
    predictiveInsights,
    strategicRecommendations,
    insightMetrics,
    generateCrossGroupInsights,
    analyzeSPACorrelations,
    detectPatterns,
    performTrendAnalysis,
    generatePredictions,
    createStrategicRecommendations,
    exportInsights,
    isAnalyzing,
    error
  } = useAIAssistant();

  const {
    systemHealth,
    globalMetrics,
    performanceMetrics,
    getSystemAnalysis
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    crossGroupMetrics,
    spaIntegrationData,
    getCrossGroupAnalytics
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
    getActivityAnalytics
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'correlations' | 'trends' | 'predictions' | 'recommendations'>('overview');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [insightFilter, setInsightFilter] = useState<InsightCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<InsightSeverity | 'all'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [showWeakCorrelations, setShowWeakCorrelations] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.7);
  const [autoRefresh, setAutoRefresh] = useState(enableRealTimeAnalysis);
  const [analysisConfig, setAnalysisConfig] = useState({
    depth: analysisDepth,
    includeHistorical: true,
    includePredictive: true,
    includeAnomalies: true
  });
  const [visualizationMode, setVisualizationMode] = useState<'charts' | 'network' | 'heatmap'>('charts');
  const [insightHistory, setInsightHistory] = useState<CrossGroupInsights[]>([]);
  const [bookmarkedInsights, setBookmarkedInsights] = useState<string[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date>(new Date());

  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const analysisCache = useRef<Map<string, any>>(new Map());

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    recentActivities: recentActivities.slice(0, 20),
    userPermissions,
    workspaceContext: {
      id: activeWorkspace?.id || '',
      configuration: workspaceConfiguration,
      metrics: workspaceMetrics
    },
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [
    currentUser,
    activeWorkspace,
    activeSPAContext,
    systemHealth,
    recentActivities,
    userPermissions,
    workspaceConfiguration,
    workspaceMetrics
  ]);

  const filteredInsights = useMemo(() => {
    let filtered = crossGroupInsights;

    if (insightFilter !== 'all') {
      filtered = filtered.filter(insight => insight.category === insightFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(insight => insight.severity === severityFilter);
    }

    // Sort by severity and timestamp
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return filtered;
  }, [crossGroupInsights, insightFilter, severityFilter]);

  const criticalInsights = useMemo(() => {
    return crossGroupInsights.filter(insight => 
      insight.severity === 'critical' || insight.severity === 'high'
    );
  }, [crossGroupInsights]);

  const insightCategories = useMemo(() => {
    const categories: Record<InsightCategory, number> = {} as any;
    INSIGHT_CATEGORIES.forEach(category => {
      categories[category] = crossGroupInsights.filter(insight => 
        insight.category === category
      ).length;
    });
    return categories;
  }, [crossGroupInsights]);

  const strongCorrelations = useMemo(() => {
    return spaCorrelations.filter(correlation => 
      Math.abs(correlation.coefficient) >= CORRELATION_THRESHOLDS.strong
    );
  }, [spaCorrelations]);

  // Effects
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        performComprehensiveAnalysis();
      }, autoRefreshInterval);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, autoRefreshInterval]);

  useEffect(() => {
    // Perform initial analysis
    performComprehensiveAnalysis();
  }, [currentContext, analysisConfig]);

  useEffect(() => {
    // Update insight history
    crossGroupInsights.forEach(insight => {
      if (!insightHistory.find(h => h.id === insight.id)) {
        setInsightHistory(prev => [insight, ...prev.slice(0, 99)]);
      }
    });
  }, [crossGroupInsights]);

  // Handlers
  const performComprehensiveAnalysis = useCallback(async () => {
    try {
      // Generate cross-group insights
      await generateCrossGroupInsights({
        context: currentContext,
        depth: analysisConfig.depth,
        includeHistorical: analysisConfig.includeHistorical,
        includePredictive: analysisConfig.includePredictive,
        timeRange,
        spaStatuses: getAllSPAStatus(),
        systemMetrics: globalMetrics,
        userBehavior: userBehaviorData
      });

      // Analyze SPA correlations
      await analyzeSPACorrelations({
        timeRange,
        includePerformance: true,
        includeUsage: true,
        includeErrors: true
      });

      // Detect patterns
      await detectPatterns({
        context: currentContext,
        analysisDepth: analysisConfig.depth,
        includeAnomalies: analysisConfig.includeAnomalies
      });

      // Perform trend analysis
      await performTrendAnalysis({
        timeRange,
        metrics: ['performance', 'usage', 'errors', 'compliance'],
        includeForecasting: true
      });

      // Generate predictions
      if (analysisConfig.includePredictive) {
        await generatePredictions({
          context: currentContext,
          forecastHorizon: '7d',
          confidenceLevel: confidenceThreshold,
          includeRecommendations: true
        });
      }

      // Create strategic recommendations
      await createStrategicRecommendations({
        insights: crossGroupInsights,
        correlations: spaCorrelations,
        patterns: crossGroupPatterns,
        context: currentContext
      });

      setLastAnalysis(new Date());

      trackActivity({
        type: 'cross_group_analysis_completed',
        details: {
          analysisDepth: analysisConfig.depth,
          insightsGenerated: crossGroupInsights.length,
          correlationsFound: spaCorrelations.length,
          timeRange
        }
      });

    } catch (error) {
      console.error('Failed to perform comprehensive analysis:', error);
    }
  }, [
    generateCrossGroupInsights,
    analyzeSPACorrelations,
    detectPatterns,
    performTrendAnalysis,
    generatePredictions,
    createStrategicRecommendations,
    currentContext,
    analysisConfig,
    timeRange,
    getAllSPAStatus,
    globalMetrics,
    userBehaviorData,
    confidenceThreshold,
    crossGroupInsights.length,
    spaCorrelations.length,
    crossGroupPatterns,
    trackActivity
  ]);

  const handleInsightSelect = useCallback((insightId: string) => {
    setSelectedInsight(insightId);
    
    const insight = crossGroupInsights.find(i => i.id === insightId);
    if (insight && onInsightGenerated) {
      onInsightGenerated(insight);
    }

    trackActivity({
      type: 'insight_selected',
      details: { insightId }
    });
  }, [crossGroupInsights, onInsightGenerated, trackActivity]);

  const handleInsightBookmark = useCallback((insightId: string) => {
    setBookmarkedInsights(prev => 
      prev.includes(insightId) 
        ? prev.filter(id => id !== insightId)
        : [...prev, insightId]
    );

    trackActivity({
      type: 'insight_bookmarked',
      details: { insightId }
    });
  }, [trackActivity]);

  const handleCorrelationExplore = useCallback((spa1: string, spa2: string) => {
    // Navigate to detailed correlation analysis
    trackActivity({
      type: 'correlation_explored',
      details: { spa1, spa2 }
    });
  }, [trackActivity]);

  const handleExportInsights = useCallback(async () => {
    try {
      const exportData = await exportInsights({
        insights: filteredInsights,
        correlations: spaCorrelations,
        trends: trendAnalysis,
        predictions: predictiveInsights,
        recommendations: strategicRecommendations,
        format: 'comprehensive',
        includeVisualizations: true
      });

      // ArrowDownTrayIcon the export
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cross-group-insights-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      trackActivity({
        type: 'insights_exported',
        details: {
          insightCount: filteredInsights.length,
          format: 'json'
        }
      });

    } catch (error) {
      console.error('Failed to export insights:', error);
    }
  }, [
    exportInsights,
    filteredInsights,
    spaCorrelations,
    trendAnalysis,
    predictiveInsights,
    strategicRecommendations,
    trackActivity
  ]);

  // Render Methods
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{filteredInsights.length}</div>
                <p className="text-xs text-muted-foreground">Active Insights</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
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
                <div className="text-2xl font-bold">{strongCorrelations.length}</div>
                <p className="text-xs text-muted-foreground">Strong Correlations</p>
              </div>
              <Network className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{strategicRecommendations.length}</div>
                <p className="text-xs text-muted-foreground">Recommendations</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Insights Alert */}
      {criticalInsights.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Insights Detected</AlertTitle>
          <AlertDescription>
            {criticalInsights.length} critical insights require immediate attention across your data governance SPAs.
          </AlertDescription>
        </Alert>
      )}

      {/* Insight Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Insight Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(insightCategories).map(([category, count]) => (
              <div key={category} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-semibold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {category.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Insights */}
      <InsightsDashboard
        insights={filteredInsights.slice(0, 10)}
        selectedInsight={selectedInsight}
        onInsightSelect={handleInsightSelect}
        onInsightDismiss={(insightId) => {
          // Handle insight dismiss
        }}
        onInsightBookmark={handleInsightBookmark}
      />
    </div>
  );

  const renderCorrelations = () => (
    <CorrelationMatrix
      correlations={spaCorrelations}
      onCorrelationExplore={handleCorrelationExplore}
      showWeakCorrelations={showWeakCorrelations}
      onSettingsChange={(setting, value) => {
        if (setting === 'showWeakCorrelations') {
          setShowWeakCorrelations(value);
        }
      }}
    />
  );

  const renderTrends = () => (
    <TrendAnalysis
      trends={trendAnalysis}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      onTrendDrilldown={(trendId) => {
        // Handle trend drilldown
      }}
    />
  );

  const renderPredictions = () => (
    <PredictiveAnalytics
      predictions={predictiveInsights}
      confidenceThreshold={confidenceThreshold}
      onConfidenceThresholdChange={setConfidenceThreshold}
      onPredictionExplore={(predictionId) => {
        // Handle prediction exploration
      }}
    />
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      {strategicRecommendations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Strategic Recommendations</h3>
            <p className="text-muted-foreground text-sm">
              Strategic recommendations will appear here based on your cross-group analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {strategicRecommendations.map((recommendation) => (
            <Card key={recommendation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{recommendation.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
                        {recommendation.priority}
                      </Badge>
                      <Badge variant="outline">
                        {recommendation.category}
                      </Badge>
                    </div>

                    {recommendation.actions && recommendation.actions.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Recommended Actions:</Label>
                        {recommendation.actions.slice(0, 3).map((action, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <ArrowRight className="h-3 w-3 text-blue-500" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onStrategicRecommendation) {
                          onStrategicRecommendation(recommendation);
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Cross-Group Insights Engine</h2>
              <p className="text-sm text-muted-foreground">
                Advanced analysis and insights across all data governance SPAs
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

            <Select value={analysisConfig.depth} onValueChange={(value: any) => 
              setAnalysisConfig(prev => ({ ...prev, depth: value }))
            }>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="surface">Surface</SelectItem>
                <SelectItem value="deep">Deep</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleExportInsights}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button 
              onClick={performComprehensiveAnalysis}
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
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Category:</Label>
                  <Select value={insightFilter} onValueChange={(value: any) => setInsightFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {INSIGHT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Severity:</Label>
                  <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Time Range:</Label>
                  <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1h</SelectItem>
                      <SelectItem value="24h">24h</SelectItem>
                      <SelectItem value="7d">7d</SelectItem>
                      <SelectItem value="30d">30d</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Badge variant="outline" className="text-xs">
                Last analysis: {lastAnalysis.toLocaleTimeString()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="correlations" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
                              <Search className="h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="correlations" className="space-y-4">
            {renderCorrelations()}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {renderTrends()}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            {renderPredictions()}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {renderRecommendations()}
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
                <AlertTitle>Cross-Group Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Insights Dashboard Component
const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  insights,
  selectedInsight,
  onInsightSelect,
  onInsightDismiss,
  onInsightBookmark
}) => {
  const getSeverityIcon = (severity: InsightSeverity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Flag className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-500" />;
      case 'low': return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: InsightSeverity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: InsightCategory) => {
    switch (category) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'data_quality': return <Database className="h-4 w-4" />;
      case 'user_behavior': return <Users className="h-4 w-4" />;
      case 'system_health': return <Activity className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Insights Available</h3>
          <p className="text-muted-foreground text-sm">
            Run analysis to generate cross-group insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`cursor-pointer transition-all duration-200 p-3 rounded-lg border ${getSeverityColor(insight.severity)} ${
              selectedInsight === insight.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onInsightSelect(insight.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(insight.severity)}
                  {getCategoryIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  
                  {insight.affectedSPAs && insight.affectedSPAs.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Label className="text-xs text-muted-foreground">Affects:</Label>
                      {insight.affectedSPAs.map((spa, index) => (
                        <Badge key={spa} variant="outline" className="text-xs">
                          {spa}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {insight.confidence && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Confidence:</span>
                        <span>{Math.round(insight.confidence * 100)}%</span>
                      </div>
                      <Progress value={insight.confidence * 100} className="h-1" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInsightBookmark(insight.id);
                  }}
                >
                  <Bookmark className="h-3 w-3" />
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
        ))}
      </CardContent>
    </Card>
  );
};

// Correlation Matrix Component
const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  correlations,
  onCorrelationExplore,
  showWeakCorrelations,
  onSettingsChange
}) => {
  const filteredCorrelations = correlations.filter(correlation => 
    showWeakCorrelations || Math.abs(correlation.coefficient) >= CORRELATION_THRESHOLDS.medium
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>SPA Correlation Matrix</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={showWeakCorrelations}
                onCheckedChange={(checked) => onSettingsChange('showWeakCorrelations', checked)}
              />
              <Label className="text-sm">Show Weak Correlations</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCorrelations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Correlations Found</h3>
              <p className="text-sm">
                No significant correlations detected between SPAs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCorrelations.map((correlation) => (
                <div 
                  key={`${correlation.spa1}-${correlation.spa2}`}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => onCorrelationExplore(correlation.spa1, correlation.spa2)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{correlation.spa1}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{correlation.spa2}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{correlation.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={Math.abs(correlation.coefficient) >= CORRELATION_THRESHOLDS.strong ? 'default' : 'secondary'}
                    >
                      {correlation.coefficient > 0 ? '+' : ''}{(correlation.coefficient * 100).toFixed(1)}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {correlation.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Trend Analysis Component
const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  trends,
  timeRange,
  onTimeRangeChange,
  onTrendDrilldown
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trend Analysis</CardTitle>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {trends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Trends Detected</h3>
              <p className="text-sm">
                No significant trends found in the selected time range.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trends.map((trend) => (
                <div 
                  key={trend.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => onTrendDrilldown(trend.id)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{trend.title}</h4>
                    <p className="text-sm text-muted-foreground">{trend.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-gray-500" />
                    )}
                    <Badge variant="outline">
                      {trend.strength}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Predictive Analytics Component
const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  predictions,
  confidenceThreshold,
  onConfidenceThresholdChange,
  onPredictionExplore
}) => {
  const filteredPredictions = predictions.filter(prediction => 
    prediction.confidence >= confidenceThreshold
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Predictive Analytics</CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Min Confidence:</Label>
              <div className="w-32">
                <Slider
                  value={[confidenceThreshold * 100]}
                  onValueChange={(value) => onConfidenceThresholdChange(value[0] / 100)}
                  max={100}
                  step={5}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(confidenceThreshold * 100)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPredictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No High-Confidence Predictions</h3>
              <p className="text-sm">
                Lower the confidence threshold to see more predictions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPredictions.map((prediction) => (
                <div 
                  key={prediction.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => onPredictionExplore(prediction.id)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{prediction.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{prediction.description}</p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Confidence:</span>
                        <span>{Math.round(prediction.confidence * 100)}%</span>
                      </div>
                      <Progress value={prediction.confidence * 100} className="h-1" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={prediction.impact === 'high' ? 'destructive' : 'secondary'}>
                      {prediction.impact}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {prediction.timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossGroupInsightsEngine;