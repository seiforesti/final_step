'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';

import { BarChart3, LineChart as LineChartIcon, TrendingUp, TrendingDown, Activity, Users, Search, Clock, Target, Zap, Brain, Sparkles, AlertCircle, CheckCircle, Info, Eye, RefreshCw, Download, Upload, Filter, Calendar, Globe, Database, FileText, Hash, Layers, Network, Settings, Sliders, MoreVertical, ArrowUp, ArrowDown, ArrowRight, Plus, Minus, X, Star, ThumbsUp, ThumbsDown, Heart, Share, Bookmark, Edit, Trash2, Copy, ExternalLink, Maximize, Minimize, Play, Pause, FastForward, Rewind, Volume2, VolumeX, Lightbulb, Bot, Cpu, Gauge, Map, Compass, Route, Navigation, MapPin, Timer, Stopwatch, Calendar as CalendarIcon, History, Archive, FolderOpen, Tag, Flag, Award, Medal, Trophy, Percent, DollarSign, TrendingUp as TrendingUpIcon, BarChart as BarChartIcon, ChevronUp, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

// Hook imports
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { semanticSearchService } from '../../services/semantic-search.service';

// Type imports
import {
  SearchHistoryItem,
  SearchRequest,
  SearchResponse,
  SearchFilter,
  IntelligentDataAsset
} from '../../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface SearchAnalyticsProps {
  timeRange?: 'LAST_HOUR' | 'LAST_DAY' | 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_QUARTER' | 'LAST_YEAR';
  onInsightGenerated?: (insight: SearchInsight) => void;
  onOptimizationSuggestion?: (suggestion: OptimizationSuggestion) => void;
  onError?: (error: Error) => void;
}

interface SearchAnalyticsState {
  timeRange: 'LAST_HOUR' | 'LAST_DAY' | 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_QUARTER' | 'LAST_YEAR';
  selectedMetrics: string[];
  activeTab: string;
  viewMode: 'OVERVIEW' | 'DETAILED' | 'COMPARATIVE';
  refreshInterval: number;
  autoRefresh: boolean;
  showTrends: boolean;
  showBenchmarks: boolean;
  enableRealTime: boolean;
  selectedDimensions: string[];
  alertsEnabled: boolean;
  showPredictions: boolean;
}

interface SearchMetrics {
  totalSearches: number;
  uniqueUsers: number;
  avgResponseTime: number;
  successRate: number;
  popularQueries: PopularQuery[];
  performanceTrends: PerformanceTrend[];
  userEngagement: UserEngagement;
  searchPatterns: SearchPattern[];
  errorAnalysis: ErrorAnalysis;
  optimizationOpportunities: OptimizationOpportunity[];
}

interface PopularQuery {
  query: string;
  count: number;
  avgResponseTime: number;
  successRate: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  users: number;
  categories: string[];
  lastUsed: Date;
}

interface PerformanceTrend {
  timestamp: Date;
  totalSearches: number;
  avgResponseTime: number;
  successRate: number;
  uniqueUsers: number;
  errorRate: number;
  cacheHitRate: number;
}

interface UserEngagement {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  avgSessionDuration: number;
  avgSearchesPerSession: number;
  bounceRate: number;
  retentionRate: number;
  satisfactionScore: number;
  userJourney: UserJourneyStep[];
}

interface UserJourneyStep {
  step: string;
  users: number;
  dropoffRate: number;
  avgTimeSpent: number;
  conversionRate: number;
}

interface SearchPattern {
  id: string;
  type: 'TEMPORAL' | 'BEHAVIORAL' | 'SEMANTIC' | 'GEOGRAPHIC' | 'DEVICE';
  description: string;
  frequency: number;
  strength: number;
  examples: string[];
  insights: string[];
  recommendations: string[];
}

interface ErrorAnalysis {
  totalErrors: number;
  errorRate: number;
  errorTypes: ErrorType[];
  criticalErrors: CriticalError[];
  errorTrends: ErrorTrend[];
  resolutionSuggestions: string[];
}

interface ErrorType {
  type: string;
  count: number;
  percentage: number;
  avgImpact: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  examples: string[];
}

interface CriticalError {
  id: string;
  type: string;
  message: string;
  frequency: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedUsers: number;
  firstOccurred: Date;
  lastOccurred: Date;
  suggestedFix: string;
}

interface ErrorTrend {
  timestamp: Date;
  totalErrors: number;
  errorRate: number;
  criticalErrors: number;
  resolvedErrors: number;
}

interface OptimizationOpportunity {
  id: string;
  category: 'PERFORMANCE' | 'RELEVANCE' | 'USABILITY' | 'INFRASTRUCTURE';
  title: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  potentialImprovement: string;
  implementationSteps: string[];
  metrics: OptimizationMetric[];
  priority: number;
}

interface OptimizationMetric {
  name: string;
  currentValue: number;
  projectedValue: number;
  improvement: number;
  unit: string;
}

interface SearchInsight {
  id: string;
  type: 'PERFORMANCE' | 'USAGE' | 'BEHAVIOR' | 'TREND' | 'ANOMALY';
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  confidence: number;
  affectedArea: string;
  recommendation: string;
  data: any;
  createdAt: Date;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: number;
  effort: number;
  roi: number;
  steps: string[];
}

interface BenchmarkData {
  metric: string;
  currentValue: number;
  industryAverage: number;
  bestInClass: number;
  percentile: number;
  status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE' | 'POOR';
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockSearchMetrics = (): SearchMetrics => {
  const now = new Date();
  const popularQueries: PopularQuery[] = Array.from({ length: 10 }, (_, i) => ({
    query: `popular query ${i + 1}`,
    count: Math.floor(Math.random() * 1000) + 100,
    avgResponseTime: Math.random() * 2 + 0.5,
    successRate: 90 + Math.random() * 10,
    trend: (['UP', 'DOWN', 'STABLE'] as const)[i % 3],
    users: Math.floor(Math.random() * 100) + 20,
    categories: ['analytics', 'reports', 'data quality'][i % 3] ? [['analytics', 'reports', 'data quality'][i % 3]] : [],
    lastUsed: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  }));

  const performanceTrends: PerformanceTrend[] = Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
    totalSearches: Math.floor(Math.random() * 500) + 200,
    avgResponseTime: Math.random() * 3 + 0.5,
    successRate: 85 + Math.random() * 15,
    uniqueUsers: Math.floor(Math.random() * 100) + 50,
    errorRate: Math.random() * 5,
    cacheHitRate: 70 + Math.random() * 30
  }));

  return {
    totalSearches: 15420,
    uniqueUsers: 1250,
    avgResponseTime: 1.2,
    successRate: 94.5,
    popularQueries,
    performanceTrends,
    userEngagement: {
      totalUsers: 1250,
      activeUsers: 890,
      newUsers: 120,
      returningUsers: 770,
      avgSessionDuration: 8.5,
      avgSearchesPerSession: 3.2,
      bounceRate: 25.5,
      retentionRate: 78.5,
      satisfactionScore: 4.2,
      userJourney: [
        { step: 'Landing', users: 1250, dropoffRate: 8, avgTimeSpent: 15, conversionRate: 92 },
        { step: 'Search', users: 1150, dropoffRate: 12, avgTimeSpent: 45, conversionRate: 88 },
        { step: 'Results', users: 1012, dropoffRate: 15, avgTimeSpent: 120, conversionRate: 85 },
        { step: 'Details', users: 860, dropoffRate: 18, avgTimeSpent: 180, conversionRate: 82 },
        { step: 'Action', users: 705, dropoffRate: 0, avgTimeSpent: 60, conversionRate: 100 }
      ]
    },
    searchPatterns: [
      {
        id: 'pattern_1',
        type: 'TEMPORAL',
        description: 'Peak search activity during business hours (9 AM - 5 PM)',
        frequency: 85,
        strength: 0.8,
        examples: ['Morning analytics reports', 'Afternoon data quality checks'],
        insights: ['Users primarily search during work hours', 'Low weekend activity'],
        recommendations: ['Optimize performance during peak hours', 'Schedule maintenance during off-hours']
      },
      {
        id: 'pattern_2',
        type: 'BEHAVIORAL',
        description: 'Users typically perform 3-5 related searches in sequence',
        frequency: 65,
        strength: 0.7,
        examples: ['Customer data → Customer analytics → Customer reports'],
        insights: ['Sequential search behavior indicates exploration patterns'],
        recommendations: ['Implement related search suggestions', 'Improve search refinement features']
      }
    ],
    errorAnalysis: {
      totalErrors: 142,
      errorRate: 2.8,
      errorTypes: [
        { type: 'Timeout', count: 45, percentage: 31.7, avgImpact: 3.2, trend: 'DOWN', examples: ['Long-running queries', 'Complex filters'] },
        { type: 'Invalid Query', count: 38, percentage: 26.8, avgImpact: 2.1, trend: 'STABLE', examples: ['Syntax errors', 'Unknown fields'] },
        { type: 'Permission Denied', count: 32, percentage: 22.5, avgImpact: 2.8, trend: 'UP', examples: ['Restricted data access', 'Unauthorized queries'] },
        { type: 'System Error', count: 27, percentage: 19.0, avgImpact: 4.1, trend: 'DOWN', examples: ['Database connection', 'Service unavailable'] }
      ],
      criticalErrors: [
        {
          id: 'error_1',
          type: 'System Error',
          message: 'Database connection timeout',
          frequency: 15,
          impact: 'HIGH',
          affectedUsers: 120,
          firstOccurred: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          lastOccurred: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          suggestedFix: 'Increase connection pool size and timeout settings'
        }
      ],
      errorTrends: Array.from({ length: 7 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000),
        totalErrors: Math.floor(Math.random() * 50) + 10,
        errorRate: Math.random() * 5 + 1,
        criticalErrors: Math.floor(Math.random() * 5),
        resolvedErrors: Math.floor(Math.random() * 20) + 5
      })),
      resolutionSuggestions: [
        'Implement query optimization for complex searches',
        'Add input validation for search queries',
        'Improve error handling and user feedback',
        'Monitor and alert on critical system errors'
      ]
    },
    optimizationOpportunities: [
      {
        id: 'opt_1',
        category: 'PERFORMANCE',
        title: 'Implement Search Result Caching',
        description: 'Cache frequently accessed search results to improve response times',
        impact: 'HIGH',
        effort: 'MEDIUM',
        potentialImprovement: '40% faster response times for cached queries',
        implementationSteps: [
          'Analyze query patterns to identify cacheable results',
          'Implement Redis-based caching layer',
          'Add cache invalidation logic',
          'Monitor cache hit rates and performance'
        ],
        metrics: [
          { name: 'Average Response Time', currentValue: 1.2, projectedValue: 0.7, improvement: 41.7, unit: 'seconds' },
          { name: 'Cache Hit Rate', currentValue: 0, projectedValue: 65, improvement: 65, unit: '%' }
        ],
        priority: 1
      },
      {
        id: 'opt_2',
        category: 'RELEVANCE',
        title: 'Enhance Search Ranking Algorithm',
        description: 'Improve search result relevance using machine learning',
        impact: 'HIGH',
        effort: 'HIGH',
        potentialImprovement: '25% improvement in result relevance',
        implementationSteps: [
          'Collect user interaction data',
          'Train ranking model on historical data',
          'A/B test new ranking algorithm',
          'Deploy and monitor performance'
        ],
        metrics: [
          { name: 'Click-through Rate', currentValue: 45, projectedValue: 60, improvement: 33.3, unit: '%' },
          { name: 'User Satisfaction', currentValue: 4.2, projectedValue: 4.7, improvement: 11.9, unit: '/5' }
        ],
        priority: 2
      }
    ]
  };
};

const generateMockBenchmarks = (): BenchmarkData[] => {
  return [
    { metric: 'Average Response Time', currentValue: 1.2, industryAverage: 1.8, bestInClass: 0.8, percentile: 75, status: 'GOOD' },
    { metric: 'Success Rate', currentValue: 94.5, industryAverage: 92.0, bestInClass: 98.5, percentile: 60, status: 'GOOD' },
    { metric: 'User Satisfaction', currentValue: 4.2, industryAverage: 3.8, bestInClass: 4.6, percentile: 70, status: 'GOOD' },
    { metric: 'Cache Hit Rate', currentValue: 65, industryAverage: 70, bestInClass: 85, percentile: 40, status: 'AVERAGE' },
    { metric: 'Error Rate', currentValue: 2.8, industryAverage: 4.2, bestInClass: 1.5, percentile: 80, status: 'GOOD' }
  ];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  timeRange = 'LAST_WEEK',
  onInsightGenerated,
  onOptimizationSuggestion,
  onError
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const discoveryHook = useCatalogDiscovery({
    enableRealTimeUpdates: true,
    autoRefreshInterval: 30000
  });

  const analyticsHook = useCatalogAnalytics({
    timeRange,
    enableRealTimeUpdates: true
  });

  // Local State
  const [state, setState] = useState<SearchAnalyticsState>({
    timeRange,
    selectedMetrics: ['totalSearches', 'avgResponseTime', 'successRate', 'uniqueUsers'],
    activeTab: 'overview',
    viewMode: 'OVERVIEW',
    refreshInterval: 30,
    autoRefresh: true,
    showTrends: true,
    showBenchmarks: true,
    enableRealTime: true,
    selectedDimensions: ['time', 'query', 'user'],
    alertsEnabled: true,
    showPredictions: false
  });

  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);
  const [isOptimizationDialogOpen, setIsOptimizationDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<SearchInsight | null>(null);
  const [selectedOptimization, setSelectedOptimization] = useState<OptimizationOpportunity | null>(null);

  // Mock data (in production, this would come from the hooks)
  const [mockMetrics] = useState(() => generateMockSearchMetrics());
  const [mockBenchmarks] = useState(() => generateMockBenchmarks());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const timeRangeLabel = useMemo(() => {
    const labels = {
      'LAST_HOUR': 'Last Hour',
      'LAST_DAY': 'Last 24 Hours',
      'LAST_WEEK': 'Last 7 Days',
      'LAST_MONTH': 'Last 30 Days',
      'LAST_QUARTER': 'Last 3 Months',
      'LAST_YEAR': 'Last 12 Months'
    };
    return labels[state.timeRange];
  }, [state.timeRange]);

  const overallHealth = useMemo(() => {
    const { successRate, avgResponseTime, errorAnalysis } = mockMetrics;
    const healthScore = (successRate + (100 - errorAnalysis.errorRate * 10) + (avgResponseTime < 2 ? 90 : 70)) / 3;
    
    if (healthScore >= 90) return { status: 'EXCELLENT', score: healthScore, color: 'text-green-600' };
    if (healthScore >= 80) return { status: 'GOOD', score: healthScore, color: 'text-blue-600' };
    if (healthScore >= 70) return { status: 'AVERAGE', score: healthScore, color: 'text-yellow-600' };
    if (healthScore >= 60) return { status: 'POOR', score: healthScore, color: 'text-orange-600' };
    return { status: 'CRITICAL', score: healthScore, color: 'text-red-600' };
  }, [mockMetrics]);

  const keyInsights = useMemo(() => {
    const insights: SearchInsight[] = [
      {
        id: 'insight_1',
        type: 'PERFORMANCE',
        title: 'Response Time Improvement',
        description: 'Average response time has improved by 15% compared to last week',
        severity: 'INFO',
        confidence: 85,
        affectedArea: 'Search Performance',
        recommendation: 'Continue monitoring and consider implementing caching for further improvements',
        data: { improvement: 15, metric: 'response_time' },
        createdAt: new Date()
      },
      {
        id: 'insight_2',
        type: 'USAGE',
        title: 'Peak Usage Pattern Detected',
        description: 'Search volume peaks at 10 AM and 2 PM, indicating lunch break patterns',
        severity: 'INFO',
        confidence: 92,
        affectedArea: 'User Behavior',
        recommendation: 'Optimize infrastructure scaling to handle peak loads efficiently',
        data: { peaks: ['10:00', '14:00'] },
        createdAt: new Date()
      },
      {
        id: 'insight_3',
        type: 'ANOMALY',
        title: 'Unusual Error Spike',
        description: 'Permission denied errors increased by 40% in the last 2 days',
        severity: 'WARNING',
        confidence: 78,
        affectedArea: 'Error Management',
        recommendation: 'Review access permissions and user role assignments',
        data: { increase: 40, errorType: 'permission_denied' },
        createdAt: new Date()
      }
    ];
    return insights;
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (state.autoRefresh && state.enableRealTime) {
      intervalRef.current = setInterval(() => {
        console.log('Refreshing analytics data...');
      }, state.refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.autoRefresh, state.enableRealTime, state.refreshInterval]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStateChange = useCallback((updates: Partial<SearchAnalyticsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleTimeRangeChange = useCallback((timeRange: SearchAnalyticsState['timeRange']) => {
    setState(prev => ({ ...prev, timeRange }));
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
  }, []);

  const handleExportData = useCallback(() => {
    console.log('Exporting analytics data...');
  }, []);

  const handleInsightClick = useCallback((insight: SearchInsight) => {
    setSelectedInsight(insight);
    setIsInsightDialogOpen(true);
    onInsightGenerated?.(insight);
  }, [onInsightGenerated]);

  const handleOptimizationClick = useCallback((optimization: OptimizationOpportunity) => {
    setSelectedOptimization(optimization);
    setIsOptimizationDialogOpen(true);
    
    const suggestion: OptimizationSuggestion = {
      id: optimization.id,
      title: optimization.title,
      description: optimization.description,
      category: optimization.category,
      impact: optimization.impact === 'HIGH' ? 80 : optimization.impact === 'MEDIUM' ? 60 : 40,
      effort: optimization.effort === 'HIGH' ? 80 : optimization.effort === 'MEDIUM' ? 60 : 40,
      roi: 75,
      steps: optimization.implementationSteps
    };
    
    onOptimizationSuggestion?.(suggestion);
  }, [onOptimizationSuggestion]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total Searches</CardTitle>
          <Search className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{mockMetrics.totalSearches.toLocaleString()}</div>
          <div className="flex items-center space-x-1 mt-1">
            <ArrowUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">+12% from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Response Time</CardTitle>
          <Clock className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{mockMetrics.avgResponseTime}s</div>
          <div className="flex items-center space-x-1 mt-1">
            <ArrowDown className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">-8% faster</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Success Rate</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{mockMetrics.successRate}%</div>
          <Progress value={mockMetrics.successRate} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Active Users</CardTitle>
          <Users className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{mockMetrics.uniqueUsers.toLocaleString()}</div>
          <div className="flex items-center space-x-1 mt-1">
            <ArrowUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">+5% new users</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Search performance metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={mockMetrics.performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
              <Bar yAxisId="left" dataKey="totalSearches" fill="#8884d8" name="Total Searches" />
              <Line yAxisId="right" type="monotone" dataKey="avgResponseTime" stroke="#82ca9d" strokeWidth={2} name="Avg Response Time (s)" />
              <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#ffc658" strokeWidth={2} name="Success Rate (%)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockMetrics.performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="avgResponseTime" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockMetrics.performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="errorRate" stroke="#ff7300" strokeWidth={2} />
                <Line type="monotone" dataKey="cacheHitRate" stroke="#00ff00" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Popular Search Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Avg Response</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMetrics.popularQueries.slice(0, 10).map((query, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{query.query}</TableCell>
                  <TableCell>{query.count.toLocaleString()}</TableCell>
                  <TableCell>{query.avgResponseTime.toFixed(2)}s</TableCell>
                  <TableCell>
                    <Progress value={query.successRate} className="w-16" />
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      query.trend === 'UP' ? 'default' :
                      query.trend === 'DOWN' ? 'destructive' :
                      'secondary'
                    }>
                      {query.trend === 'UP' ? <ArrowUp className="h-3 w-3 mr-1" /> :
                       query.trend === 'DOWN' ? <ArrowDown className="h-3 w-3 mr-1" /> :
                       <Minus className="h-3 w-3 mr-1" />}
                      {query.trend}
                    </Badge>
                  </TableCell>
                  <TableCell>{query.users}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Journey Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.userEngagement.userJourney.map((step, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium">{step.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{step.users} users</span>
                      <span className="text-sm text-gray-500">{step.conversionRate}%</span>
                    </div>
                    <Progress value={step.conversionRate} />
                  </div>
                  <div className="w-16 text-sm text-gray-500">
                    {step.dropoffRate > 0 && `-${step.dropoffRate}%`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{mockMetrics.userEngagement.avgSessionDuration}</div>
                <div className="text-sm text-gray-600">Avg Session (min)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{mockMetrics.userEngagement.avgSearchesPerSession}</div>
                <div className="text-sm text-gray-600">Searches/Session</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{mockMetrics.userEngagement.bounceRate}%</div>
                <div className="text-sm text-gray-600">Bounce Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{mockMetrics.userEngagement.retentionRate}%</div>
                <div className="text-sm text-gray-600">Retention Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyInsights.map((insight) => (
                <div 
                  key={insight.id} 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleInsightClick(insight)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        insight.severity === 'CRITICAL' ? 'destructive' :
                        insight.severity === 'WARNING' ? 'secondary' :
                        'default'
                      }>
                        {insight.type}
                      </Badge>
                      <span className="font-medium">{insight.title}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {insight.confidence}% confidence
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <p className="text-sm text-blue-600">{insight.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold ${overallHealth.color}`}>
                {Math.round(overallHealth.score)}%
              </div>
              <div className="text-sm text-gray-600">{overallHealth.status}</div>
              <Progress value={overallHealth.score} className="mt-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span className="font-medium">Good</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Reliability</span>
                <span className="font-medium">Excellent</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>User Experience</span>
                <span className="font-medium">Good</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockMetrics.searchPatterns.map((pattern) => (
              <div key={pattern.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{pattern.type}</Badge>
                  <div className="text-sm text-gray-500">
                    Strength: {Math.round(pattern.strength * 100)}%
                  </div>
                </div>
                <h4 className="font-medium mb-2">{pattern.description}</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Examples:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.examples.map((example, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{example}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recommendations:</p>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {pattern.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Optimization Opportunities</CardTitle>
          <CardDescription>AI-identified improvements ranked by impact and effort</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMetrics.optimizationOpportunities.map((opportunity) => (
              <div 
                key={opportunity.id}
                className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOptimizationClick(opportunity)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{opportunity.category}</Badge>
                    <h3 className="font-semibold">{opportunity.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      opportunity.impact === 'HIGH' ? 'default' :
                      opportunity.impact === 'MEDIUM' ? 'secondary' :
                      'outline'
                    }>
                      {opportunity.impact} Impact
                    </Badge>
                    <Badge variant={
                      opportunity.effort === 'LOW' ? 'default' :
                      opportunity.effort === 'MEDIUM' ? 'secondary' :
                      'destructive'
                    }>
                      {opportunity.effort} Effort
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{opportunity.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Expected Improvements:</h4>
                    <div className="space-y-2">
                      {opportunity.metrics.map((metric, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{metric.name}</span>
                          <span className="text-green-600">
                            +{metric.improvement.toFixed(1)}{metric.unit === '%' ? '%' : ` ${metric.unit}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Potential Improvement:</h4>
                    <p className="text-sm text-gray-600">{opportunity.potentialImprovement}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Priority: #{opportunity.priority}
                  </span>
                  <Button size="sm" variant="outline">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBenchmarks.map((benchmark, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{benchmark.metric}</h4>
                  <Badge variant={
                    benchmark.status === 'EXCELLENT' ? 'default' :
                    benchmark.status === 'GOOD' ? 'secondary' :
                    benchmark.status === 'AVERAGE' ? 'outline' :
                    'destructive'
                  }>
                    {benchmark.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Current</p>
                    <p className="font-semibold">{benchmark.currentValue}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Industry Avg</p>
                    <p className="font-semibold">{benchmark.industryAverage}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Best in Class</p>
                    <p className="font-semibold">{benchmark.bestInClass}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Percentile</p>
                    <p className="font-semibold">{benchmark.percentile}th</p>
                  </div>
                </div>
                <Progress value={benchmark.percentile} className="mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive search performance analytics and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={state.timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LAST_HOUR">Last Hour</SelectItem>
                <SelectItem value="LAST_DAY">Last 24 Hours</SelectItem>
                <SelectItem value="LAST_WEEK">Last 7 Days</SelectItem>
                <SelectItem value="LAST_MONTH">Last 30 Days</SelectItem>
                <SelectItem value="LAST_QUARTER">Last 3 Months</SelectItem>
                <SelectItem value="LAST_YEAR">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={state.autoRefresh}
                    onCheckedChange={(checked) => handleStateChange({ autoRefresh: checked })}
                  />
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="real-time"
                    checked={state.enableRealTime}
                    onCheckedChange={(checked) => handleStateChange({ enableRealTime: checked })}
                  />
                  <Label htmlFor="real-time">Real-time Updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-trends"
                    checked={state.showTrends}
                    onCheckedChange={(checked) => handleStateChange({ showTrends: checked })}
                  />
                  <Label htmlFor="show-trends">Show Trends</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-benchmarks"
                    checked={state.showBenchmarks}
                    onCheckedChange={(checked) => handleStateChange({ showBenchmarks: checked })}
                  />
                  <Label htmlFor="show-benchmarks">Show Benchmarks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="alerts-enabled"
                    checked={state.alertsEnabled}
                    onCheckedChange={(checked) => handleStateChange({ alertsEnabled: checked })}
                  />
                  <Label htmlFor="alerts-enabled">Enable Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-predictions"
                    checked={state.showPredictions}
                    onCheckedChange={(checked) => handleStateChange({ showPredictions: checked })}
                  />
                  <Label htmlFor="show-predictions">Show Predictions</Label>
                </div>
              </div>

              <div>
                <Label>Refresh Interval (seconds)</Label>
                <Slider
                  value={[state.refreshInterval]}
                  onValueChange={([value]) => handleStateChange({ refreshInterval: value })}
                  max={300}
                  min={10}
                  step={10}
                  className="mt-2"
                />
                <div className="text-sm text-gray-500 mt-1">{state.refreshInterval}s</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        {renderOverviewCards()}

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Volume Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockMetrics.performanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="totalSearches" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockMetrics.errorAnalysis.errorTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type} ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {mockMetrics.errorAnalysis.errorTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            {renderPerformanceTab()}
          </TabsContent>

          <TabsContent value="usage">
            {renderUsageTab()}
          </TabsContent>

          <TabsContent value="insights">
            {renderInsightsTab()}
          </TabsContent>

          <TabsContent value="optimization">
            {renderOptimizationTab()}
          </TabsContent>
        </Tabs>

        {/* Insight Detail Dialog */}
        <Dialog open={isInsightDialogOpen} onOpenChange={setIsInsightDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedInsight?.title}</DialogTitle>
              <DialogDescription>
                {selectedInsight?.type} insight with {selectedInsight?.confidence}% confidence
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedInsight?.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Affected Area</h4>
                <Badge variant="outline">{selectedInsight?.affectedArea}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommendation</h4>
                <p className="text-blue-600">{selectedInsight?.recommendation}</p>
              </div>
              {selectedInsight?.data && (
                <div>
                  <h4 className="font-medium mb-2">Data</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedInsight.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInsightDialogOpen(false)}>
                Close
              </Button>
              <Button>Take Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Optimization Detail Dialog */}
        <Dialog open={isOptimizationDialogOpen} onOpenChange={setIsOptimizationDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedOptimization?.title}</DialogTitle>
              <DialogDescription>
                {selectedOptimization?.category} optimization with {selectedOptimization?.impact} impact
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedOptimization?.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Expected Improvements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOptimization?.metrics.map((metric, idx) => (
                    <div key={idx} className="p-3 border rounded">
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-gray-600">
                        {metric.currentValue} → {metric.projectedValue} {metric.unit}
                      </div>
                      <div className="text-green-600 font-medium">
                        +{metric.improvement.toFixed(1)}% improvement
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Implementation Steps</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {selectedOptimization?.implementationSteps.map((step, idx) => (
                    <li key={idx} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOptimizationDialogOpen(false)}>
                Close
              </Button>
              <Button>Start Implementation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default SearchAnalytics;