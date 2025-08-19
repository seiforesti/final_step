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
  BarChart3, PieChart, TrendingUp, TrendingDown, Activity, Target, Gauge,
  Search, Filter, SortAsc, SortDesc, RefreshCw, Download, Upload, Settings,
  Zap, Star, Award, Crown, Sparkles, Brain, Eye, Lightbulb, AlertTriangle,
  CheckCircle, XCircle, Info, Clock, Timer, Stopwatch, History, Calendar as CalendarIcon,
  Users, User, Hash, Database, Table, Layers, Grid3X3, FolderOpen, FileText,
  Image, Video, Link, Globe, Map, MapPin, Navigation, Building, Flag,
  ThumbsUp, ThumbsDown, Heart, Share2, Bookmark, Copy, ExternalLink,
  MoreHorizontal, Edit3, Trash2, Plus, Minus, ChevronUp, ChevronDown,
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft, Loader2, RotateCcw,
  Shield, Lock, Unlock, Key, Code, Terminal, Cpu, HardDrive, Server,
  Wifi, Signal, Battery, Power, Volume2, VolumeX, Mic, MicOff,
  Play, Pause, SkipForward, SkipBack, FastForward, Rewind
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, TreemapChart, Treemap, FunnelChart, Funnel, LabelList } from 'recharts';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { collaborationService } from '../../services/collaboration.service';
import { advancedLineageService } from '../../services/advanced-lineage.service';

// Enhanced Type Definitions for Search Results Analyzer
interface SearchResultsAnalyzer {
  id: string;
  name: string;
  description: string;
  version: string;
  configuration: AnalyzerConfiguration;
  analyticsEngines: AnalyticsEngine[];
  scoringModels: ScoringModel[];
  qualityMetrics: QualityMetric[];
  performanceMetrics: PerformanceMetric[];
  insights: AnalyticsInsight[];
  reports: AnalyticsReport[];
  alerts: AnalyticsAlert[];
  benchmarks: AnalyticsBenchmark[];
  createdAt: string;
  updatedAt: string;
}

interface AnalyzerConfiguration {
  enabledAnalytics: AnalyticsType[];
  scoringAlgorithms: ScoringAlgorithm[];
  qualityThresholds: QualityThreshold[];
  performanceTargets: PerformanceTarget[];
  insightGeneration: InsightGenerationConfig;
  realTimeAnalysis: boolean;
  batchProcessing: boolean;
  dataRetention: DataRetentionConfig;
  alerting: AlertingConfig;
  reporting: ReportingConfig;
}

interface AnalyticsEngine {
  id: string;
  name: string;
  type: AnalyticsEngineType;
  version: string;
  capabilities: EngineCapability[];
  configuration: EngineConfiguration;
  performance: EnginePerformance;
  status: EngineStatus;
  lastUpdate: string;
}

interface SearchResultAnalysis {
  id: string;
  sessionId: string;
  queryId: string;
  query: string;
  results: AnalyzedResult[];
  overallMetrics: OverallMetrics;
  relevanceAnalysis: RelevanceAnalysis;
  qualityAnalysis: QualityAnalysis;
  performanceAnalysis: PerformanceAnalysis;
  userBehaviorAnalysis: UserBehaviorAnalysis;
  contentAnalysis: ContentAnalysis;
  temporalAnalysis: TemporalAnalysis;
  spatialAnalysis: SpatialAnalysis;
  semanticAnalysis: SemanticAnalysis;
  insights: ResultInsight[];
  recommendations: AnalyticsRecommendation[];
  timestamp: string;
}

interface AnalyzedResult {
  id: string;
  originalResult: SearchResult;
  scores: ResultScores;
  quality: ResultQuality;
  relevance: RelevanceScore;
  engagement: EngagementMetrics;
  content: ContentMetrics;
  metadata: ResultMetadata;
  classifications: ResultClassification[];
  anomalies: ResultAnomaly[];
  predictions: ResultPrediction[];
  context: ResultContext;
}

interface ResultScores {
  overall: number;
  relevance: number;
  quality: number;
  popularity: number;
  freshness: number;
  authority: number;
  usability: number;
  accessibility: number;
  semantic: number;
  contextual: number;
  personalized: number;
  business: number;
}

interface RelevanceAnalysis {
  overallRelevance: number;
  relevanceDistribution: RelevanceDistribution;
  topRelevantResults: TopResult[];
  irrelevantResults: IrrelevantResult[];
  relevanceFactors: RelevanceFactor[];
  improvementSuggestions: RelevanceImprovement[];
  queryRelevanceMapping: QueryRelevanceMapping;
  contextualRelevance: ContextualRelevance;
}

interface QualityAnalysis {
  overallQuality: number;
  qualityDistribution: QualityDistribution;
  qualityDimensions: QualityDimension[];
  qualityIssues: QualityIssue[];
  qualityTrends: QualityTrend[];
  improvementOpportunities: QualityImprovement[];
  benchmarkComparison: QualityBenchmark[];
}

interface PerformanceAnalysis {
  responseTime: PerformanceMetric;
  throughput: PerformanceMetric;
  accuracy: PerformanceMetric;
  precision: PerformanceMetric;
  recall: PerformanceMetric;
  f1Score: PerformanceMetric;
  latency: LatencyAnalysis;
  scalability: ScalabilityAnalysis;
  resourceUtilization: ResourceAnalysis;
  bottlenecks: PerformanceBottleneck[];
  optimizations: PerformanceOptimization[];
}

interface UserBehaviorAnalysis {
  clickThroughRate: number;
  dwellTime: number;
  bounceRate: number;
  conversionRate: number;
  satisfactionScore: number;
  engagementPatterns: EngagementPattern[];
  userJourney: UserJourneyStep[];
  abandonmentPoints: AbandonmentPoint[];
  preferences: UserPreference[];
  segmentAnalysis: UserSegmentAnalysis[];
}

interface ContentAnalysis {
  contentTypes: ContentTypeAnalysis[];
  topicDistribution: TopicDistribution[];
  languageAnalysis: LanguageAnalysis;
  sentimentAnalysis: SentimentAnalysis;
  readabilityAnalysis: ReadabilityAnalysis;
  diversityAnalysis: DiversityAnalysis;
  freshnessAnalysis: FreshnessAnalysis;
  authorityAnalysis: AuthorityAnalysis;
}

interface ResultInsight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  severity: InsightSeverity;
  confidence: number;
  impact: InsightImpact;
  actionable: boolean;
  recommendations: InsightRecommendation[];
  evidence: InsightEvidence[];
  metadata: InsightMetadata;
  createdAt: string;
}

interface AnalyticsReport {
  id: string;
  name: string;
  type: ReportType;
  scope: ReportScope;
  timeRange: TimeRange;
  metrics: ReportMetric[];
  insights: ReportInsight[];
  visualizations: ReportVisualization[];
  conclusions: ReportConclusion[];
  recommendations: ReportRecommendation[];
  executiveSummary: ExecutiveSummary;
  methodology: ReportMethodology;
  limitations: ReportLimitation[];
  appendices: ReportAppendix[];
  createdAt: string;
  generatedBy: string;
}

// Enums
enum AnalyticsType {
  RELEVANCE = 'relevance',
  QUALITY = 'quality',
  PERFORMANCE = 'performance',
  USER_BEHAVIOR = 'user_behavior',
  CONTENT = 'content',
  SEMANTIC = 'semantic',
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
  PREDICTIVE = 'predictive',
  COMPARATIVE = 'comparative'
}

enum AnalyticsEngineType {
  STATISTICAL = 'statistical',
  MACHINE_LEARNING = 'machine_learning',
  DEEP_LEARNING = 'deep_learning',
  RULE_BASED = 'rule_based',
  HYBRID = 'hybrid',
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  STREAMING = 'streaming'
}

enum ScoringAlgorithm {
  TF_IDF = 'tf_idf',
  BM25 = 'bm25',
  COSINE_SIMILARITY = 'cosine_similarity',
  JACCARD = 'jaccard',
  LEVENSHTEIN = 'levenshtein',
  SEMANTIC_SIMILARITY = 'semantic_similarity',
  LEARNING_TO_RANK = 'learning_to_rank',
  NEURAL_RANKING = 'neural_ranking'
}

enum InsightType {
  ANOMALY = 'anomaly',
  TREND = 'trend',
  PATTERN = 'pattern',
  OPPORTUNITY = 'opportunity',
  RISK = 'risk',
  OPTIMIZATION = 'optimization',
  BENCHMARK = 'benchmark',
  PREDICTION = 'prediction'
}

enum InsightSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum ReportType {
  EXECUTIVE = 'executive',
  DETAILED = 'detailed',
  TECHNICAL = 'technical',
  COMPARATIVE = 'comparative',
  TREND = 'trend',
  ANOMALY = 'anomaly',
  PERFORMANCE = 'performance',
  QUALITY = 'quality'
}

// Additional interfaces
interface OverallMetrics {
  totalResults: number;
  averageRelevance: number;
  averageQuality: number;
  responseTime: number;
  userSatisfaction: number;
  clickThroughRate: number;
  conversionRate: number;
  bounceRate: number;
}

interface QualityMetric {
  name: string;
  value: number;
  threshold: number;
  status: MetricStatus;
  trend: TrendDirection;
  impact: ImpactLevel;
}

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  baseline: number;
  trend: TrendDirection;
  unit: string;
  timestamp: string;
}

interface AnalyticsInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  impact: number;
  actionable: boolean;
  recommendations: string[];
  metadata: any;
}

interface AnalyticsRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  priority: PriorityLevel;
  effort: EffortLevel;
  impact: ImpactLevel;
  timeline: string;
  dependencies: string[];
  risks: string[];
  benefits: string[];
}

const SearchResultsAnalyzer: React.FC = () => {
  // State Management
  const [analyzer, setAnalyzer] = useState<SearchResultsAnalyzer | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<SearchResultAnalysis | null>(null);
  const [analyses, setAnalyses] = useState<SearchResultAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [activeMetric, setActiveMetric] = useState<string>('relevance');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AnalyticsRecommendation[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [benchmarks, setBenchmarks] = useState<AnalyticsBenchmark[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'comparative'>('summary');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'scatter'>('line');
  const [showInsights, setShowInsights] = useState<boolean>(true);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(true);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState<boolean>(false);

  // Form State
  const [analysisConfig, setAnalysisConfig] = useState({
    enabledAnalytics: [AnalyticsType.RELEVANCE, AnalyticsType.QUALITY, AnalyticsType.PERFORMANCE],
    scoringAlgorithm: ScoringAlgorithm.BM25,
    qualityThreshold: 0.7,
    performanceTarget: 1000,
    insightGeneration: true,
    realTimeAnalysis: true,
    alerting: true
  });

  // Refs
  const refreshTimerRef = useRef<NodeJS.Timeout>();

  // Load analyzer data
  const loadAnalyzerData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load analyzer configuration and data
      const [
        analyzerData,
        analysesData,
        insightsData,
        recommendationsData,
        reportsData,
        alertsData,
        benchmarksData,
        trendsData
      ] = await Promise.all([
        intelligentDiscoveryService.getSearchResultsAnalyzer(),
        intelligentDiscoveryService.getSearchAnalyses(timeRange),
        intelligentDiscoveryService.getAnalyticsInsights(),
        intelligentDiscoveryService.getAnalyticsRecommendations(),
        intelligentDiscoveryService.getAnalyticsReports(),
        intelligentDiscoveryService.getAnalyticsAlerts(),
        intelligentDiscoveryService.getAnalyticsBenchmarks(),
        intelligentDiscoveryService.getAnalyticsTrends(timeRange)
      ]);

      setAnalyzer(analyzerData);
      setAnalyses(analysesData);
      setInsights(insightsData);
      setRecommendations(recommendationsData);
      setReports(reportsData);
      setAlerts(alertsData);
      setBenchmarks(benchmarksData);
      setTrends(trendsData);

      if (analysesData.length > 0) {
        setCurrentAnalysis(analysesData[0]);
        setSelectedAnalysis(analysesData[0].id);
      }

    } catch (error) {
      console.error('Error loading analyzer data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  // Setup real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    // Auto-refresh timer
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(loadAnalyzerData, refreshInterval * 1000);
    }

    // WebSocket for real-time analytics updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/analytics');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'analysis_completed':
          setAnalyses(prev => [data.analysis, ...prev]);
          if (!currentAnalysis) {
            setCurrentAnalysis(data.analysis);
          }
          break;
        case 'insight_generated':
          setInsights(prev => [data.insight, ...prev]);
          break;
        case 'alert_triggered':
          setAlerts(prev => [data.alert, ...prev]);
          break;
        case 'metrics_updated':
          // Update current analysis metrics
          if (currentAnalysis && data.analysisId === currentAnalysis.id) {
            setCurrentAnalysis(prev => prev ? { ...prev, overallMetrics: data.metrics } : null);
          }
          break;
      }
    };

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      ws.close();
    };
  }, [autoRefresh, refreshInterval, loadAnalyzerData, currentAnalysis]);

  // Initialize component
  useEffect(() => {
    loadAnalyzerData();
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [loadAnalyzerData, setupRealTimeUpdates]);

  // Trigger new analysis
  const triggerAnalysis = useCallback(async (queryId?: string, sessionId?: string) => {
    try {
      setIsAnalyzing(true);
      
      const analysisRequest = {
        queryId,
        sessionId,
        configuration: analysisConfig,
        scope: 'comprehensive',
        realTime: analysisConfig.realTimeAnalysis
      };
      
      const analysis = await intelligentDiscoveryService.analyzeSearchResults(analysisRequest);
      setCurrentAnalysis(analysis);
      setAnalyses(prev => [analysis, ...prev]);
      
    } catch (error) {
      console.error('Error triggering analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisConfig]);

  // Generate report
  const generateReport = useCallback(async (reportType: ReportType, scope: ReportScope) => {
    try {
      const reportRequest = {
        type: reportType,
        scope,
        timeRange,
        analysisIds: selectedAnalysis ? [selectedAnalysis] : analyses.map(a => a.id),
        includeInsights: true,
        includeRecommendations: true,
        format: 'comprehensive'
      };
      
      const report = await intelligentDiscoveryService.generateAnalyticsReport(reportRequest);
      setReports(prev => [report, ...prev]);
      
      // Download report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report_${report.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }, [timeRange, selectedAnalysis, analyses]);

  // Export analytics data
  const exportAnalytics = useCallback(async () => {
    try {
      const exportData = {
        analyzer,
        analyses: analyses.slice(0, 100), // Limit to last 100 analyses
        insights: insights.slice(0, 50),
        recommendations: recommendations.slice(0, 50),
        trends,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search_analytics_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  }, [analyzer, analyses, insights, recommendations, trends]);

  // Utility functions
  const getMetricColor = (value: number, threshold: number) => {
    if (value >= threshold * 1.2) return 'text-green-600';
    if (value >= threshold) return 'text-blue-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightSeverityColor = (severity: InsightSeverity) => {
    switch (severity) {
      case InsightSeverity.CRITICAL: return 'bg-red-100 text-red-800';
      case InsightSeverity.HIGH: return 'bg-orange-100 text-orange-800';
      case InsightSeverity.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case InsightSeverity.LOW: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading search results analyzer...</span>
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
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <span>Search Results Analyzer</span>
          </h1>
          <p className="text-muted-foreground">
            Deep analytics and insights for search results quality and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => triggerAnalysis()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Analyze
          </Button>
          <Button
            variant="outline"
            onClick={() => generateReport(ReportType.EXECUTIVE, 'comprehensive')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Report
          </Button>
          <Button
            variant="outline"
            onClick={exportAnalytics}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <Label className="text-sm">Time Range</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Analysis</Label>
                <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select analysis" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyses.map((analysis) => (
                      <SelectItem key={analysis.id} value={analysis.id}>
                        {analysis.query} - {new Date(analysis.timestamp).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">View Mode</Label>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comparative">Comparative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={showAdvancedMetrics}
                onCheckedChange={setShowAdvancedMetrics}
              />
              <Label className="text-sm">Advanced Metrics</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="relevance">Relevance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {currentAnalysis && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Results</p>
                        <p className="text-2xl font-bold">{currentAnalysis.overallMetrics.totalResults.toLocaleString()}</p>
                      </div>
                      <Search className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Relevance</p>
                        <p className="text-2xl font-bold">{formatPercentage(currentAnalysis.overallMetrics.averageRelevance)}</p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Quality</p>
                        <p className="text-2xl font-bold">{formatPercentage(currentAnalysis.overallMetrics.averageQuality)}</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                        <p className="text-2xl font-bold">{formatDuration(currentAnalysis.overallMetrics.responseTime)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Relevance Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Relevance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={currentAnalysis.relevanceAnalysis.relevanceDistribution.buckets}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Quality Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="quality" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="relevance" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Results Analysis Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Results Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Result</TableHead>
                        <TableHead>Relevance Score</TableHead>
                        <TableHead>Quality Score</TableHead>
                        <TableHead>Overall Score</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAnalysis.results.slice(0, 10).map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <div className="font-medium truncate max-w-xs">
                              {result.originalResult.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.originalResult.type}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={result.scores.relevance * 100} className="w-16" />
                              <span className="text-sm">{formatPercentage(result.scores.relevance)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={result.scores.quality * 100} className="w-16" />
                              <span className="text-sm">{formatPercentage(result.scores.quality)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={result.scores.overall * 100} className="w-16" />
                              <span className="text-sm font-medium">{formatPercentage(result.scores.overall)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              CTR: {formatPercentage(result.engagement.clickThroughRate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Target className="h-4 w-4 mr-2" />
                                  Analyze
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Flag className="h-4 w-4 mr-2" />
                                  Flag Issue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Relevance Tab */}
        <TabsContent value="relevance" className="space-y-6">
          {currentAnalysis?.relevanceAnalysis && (
            <>
              {/* Relevance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatPercentage(currentAnalysis.relevanceAnalysis.overallRelevance)}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Relevance</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {currentAnalysis.relevanceAnalysis.topRelevantResults.length}
                      </div>
                      <div className="text-sm text-muted-foreground">High Relevance Results</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {currentAnalysis.relevanceAnalysis.irrelevantResults.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Low Relevance Results</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Relevance Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>Relevance Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAnalysis.relevanceAnalysis.relevanceFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{factor.name}</div>
                          <div className="text-sm text-muted-foreground">{factor.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={factor.weight * 100} className="w-24" />
                          <span className="text-sm font-medium">{formatPercentage(factor.weight)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Improvement Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Relevance Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.relevanceAnalysis.improvementSuggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>{suggestion.title}</AlertTitle>
                        <AlertDescription className="mt-2">
                          {suggestion.description}
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="outline">Impact: {suggestion.expectedImprovement}</Badge>
                            <Badge variant="outline">Effort: {suggestion.implementationEffort}</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          {currentAnalysis?.qualityAnalysis && (
            <>
              {/* Quality Overview */}
              <div className="grid grid-cols-4 gap-4">
                {currentAnalysis.qualityAnalysis.qualityDimensions.map((dimension, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatPercentage(dimension.score)}</div>
                        <div className="text-sm text-muted-foreground">{dimension.name}</div>
                        <Progress value={dimension.score * 100} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quality Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.qualityAnalysis.qualityIssues.map((issue, index) => (
                      <Alert key={index} className={issue.severity === 'critical' ? 'border-red-200' : 'border-yellow-200'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="flex items-center space-x-2">
                          <span>{issue.title}</span>
                          <Badge className={getInsightSeverityColor(issue.severity as InsightSeverity)}>
                            {issue.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription className="mt-2">
                          {issue.description}
                          <div className="mt-2">
                            <strong>Impact:</strong> {issue.impact}
                          </div>
                          <div className="mt-1">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={currentAnalysis.qualityAnalysis.qualityTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="overallQuality" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="relevance" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="freshness" stackId="3" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {currentAnalysis?.performanceAnalysis && (
            <>
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                        <p className="text-xl font-bold">{formatDuration(currentAnalysis.performanceAnalysis.responseTime.current)}</p>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(currentAnalysis.performanceAnalysis.responseTime.trend)}
                          <span className="text-xs text-muted-foreground ml-1">vs target</span>
                        </div>
                      </div>
                      <Timer className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                        <p className="text-xl font-bold">{currentAnalysis.performanceAnalysis.throughput.current.toFixed(1)}</p>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(currentAnalysis.performanceAnalysis.throughput.trend)}
                          <span className="text-xs text-muted-foreground ml-1">req/sec</span>
                        </div>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                        <p className="text-xl font-bold">{formatPercentage(currentAnalysis.performanceAnalysis.accuracy.current)}</p>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(currentAnalysis.performanceAnalysis.accuracy.trend)}
                          <span className="text-xs text-muted-foreground ml-1">precision</span>
                        </div>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">F1 Score</p>
                        <p className="text-xl font-bold">{formatPercentage(currentAnalysis.performanceAnalysis.f1Score.current)}</p>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(currentAnalysis.performanceAnalysis.f1Score.trend)}
                          <span className="text-xs text-muted-foreground ml-1">balance</span>
                        </div>
                      </div>
                      <Award className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Bottlenecks */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Bottlenecks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAnalysis.performanceAnalysis.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{bottleneck.component}</div>
                          <div className="text-sm text-muted-foreground">{bottleneck.description}</div>
                          <div className="text-xs text-red-600 mt-1">
                            Impact: {bottleneck.impactPercentage}% performance reduction
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDuration(bottleneck.latency)}</div>
                          <Badge className={getInsightSeverityColor(bottleneck.severity as InsightSeverity)}>
                            {bottleneck.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Optimizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.performanceAnalysis.optimizations.map((optimization, index) => (
                      <Alert key={index}>
                        <Zap className="h-4 w-4" />
                        <AlertTitle>{optimization.title}</AlertTitle>
                        <AlertDescription className="mt-2">
                          {optimization.description}
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="outline">Expected Improvement: {optimization.expectedImprovement}</Badge>
                            <Badge variant="outline">Effort: {optimization.implementationEffort}</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Insights Overview */}
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(insights.reduce((acc, insight) => {
              acc[insight.type] = (acc[insight.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)).map(([type, count]) => (
              <Card key={type}>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{type.replace('_', ' ')}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Insights List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Analytics Insights</span>
                <Badge variant="outline">{insights.length} insights</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.slice(0, 20).map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge className={getInsightSeverityColor(insight.severity)}>
                            {insight.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Confidence: {formatPercentage(insight.confidence)}</span>
                          <span>Impact: {insight.impact}/10</span>
                          <span>{insight.actionable ? 'Actionable' : 'Informational'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {insight.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Recommendations:</div>
                        <div className="space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <div key={recIndex} className="text-sm text-muted-foreground flex items-center">
                              <ArrowRight className="h-3 w-3 mr-2" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={() => generateReport(ReportType.EXECUTIVE, 'summary')}
                  className="h-20"
                >
                  <div className="text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Executive Summary</div>
                  </div>
                </Button>
                <Button
                  onClick={() => generateReport(ReportType.DETAILED, 'comprehensive')}
                  className="h-20"
                  variant="outline"
                >
                  <div className="text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Detailed Analysis</div>
                  </div>
                </Button>
                <Button
                  onClick={() => generateReport(ReportType.PERFORMANCE, 'technical')}
                  className="h-20"
                  variant="outline"
                >
                  <div className="text-center">
                    <Gauge className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Performance Report</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{report.scope}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts Panel */}
      {showAlerts && alerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Active Alerts</span>
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className="border-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchResultsAnalyzer;