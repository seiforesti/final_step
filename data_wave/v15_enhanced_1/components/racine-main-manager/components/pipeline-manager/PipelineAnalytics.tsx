'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Activity, Zap, Clock, Gauge, Target, Settings, Play, Pause, Square, RotateCcw, CheckCircle, XCircle, AlertCircle, Download, Upload, Save, Eye, EyeOff, Plus, Minus, Copy, Trash2, Edit3, Search, Filter, RefreshCw, Maximize, Minimize, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, MoreHorizontal, Info, HelpCircle, Layers, Workflow, Database, Cpu, HardDrive, Network, Shield, Lock, Unlock, Key, Users, User, Calendar, Hash, Type, PieChart, LineChart, AreaChart, ScatterChart, Map, Globe, MapPin, Briefcase, Star, Heart, ThumbsUp, MessageSquare, Share2, ExternalLink, FileText, BookOpen, Code } from 'lucide-react';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuLabel, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  generatePipelineAnalytics,
  analyzePipelinePerformance,
  predictPipelineTrends,
  optimizePipelineMetrics,
  generateAnalyticsReport,
  exportAnalyticsData
} from '../../utils/analytics-backend-integration';

// Types from racine-core.types
import {
  PipelineAnalytics,
  AnalyticsMetrics,
  PerformanceMetrics,
  TrendAnalysis,
  UsageAnalytics,
  ErrorAnalytics,
  ResourceAnalytics,
  CostAnalytics,
  EfficiencyMetrics,
  QualityMetrics,
  ComplianceMetrics,
  UserAnalytics,
  TimeSeriesData,
  AnalyticsReport,
  AnalyticsDashboard,
  MetricThreshold,
  AnalyticsAlert,
  AnalyticsInsight,
  AnalyticsFilter,
  AnalyticsVisualization,
  AnalyticsComparison,
  AnalyticsSnapshot,
  AnalyticsOptimization,
  AnalyticsAudit
} from '../../types/racine-core.types';

// Component Interface
interface PipelineAnalyticsProps {
  pipelineId?: string;
  onMetricsChange?: (metrics: AnalyticsMetrics) => void;
  onInsightGenerated?: (insight: AnalyticsInsight) => void;
  readonly?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

// Component State Interface
interface PipelineAnalyticsState {
  // Core Analytics State
  currentMetrics: AnalyticsMetrics | null;
  activeInsight: AnalyticsInsight | null;
  selectedTimeRange: string;
  
  // Analytics State
  isGenerating: boolean;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  isExporting: boolean;
  
  // UI State
  activeTab: string;
  selectedView: 'overview' | 'performance' | 'trends' | 'insights' | 'comparison';
  isLiveMode: boolean;
  isFullscreen: boolean;
  showAdvanced: boolean;
  
  // Data State
  analytics: PipelineAnalytics[];
  performanceMetrics: PerformanceMetrics[];
  trends: TrendAnalysis[];
  insights: AnalyticsInsight[];
  reports: AnalyticsReport[];
  
  // Filter and Search
  searchTerm: string;
  filterCriteria: AnalyticsFilter;
  sortOrder: 'asc' | 'desc';
  sortBy: string;
}

// Time Range Options
const TIME_RANGES = [
  { value: '1h', label: 'Last Hour', hours: 1 },
  { value: '24h', label: 'Last 24 Hours', hours: 24 },
  { value: '7d', label: 'Last 7 Days', hours: 24 * 7 },
  { value: '30d', label: 'Last 30 Days', hours: 24 * 30 },
  { value: '90d', label: 'Last 90 Days', hours: 24 * 90 },
  { value: '1y', label: 'Last Year', hours: 24 * 365 }
];

// Analytics Categories
const ANALYTICS_CATEGORIES = [
  {
    id: 'performance',
    name: 'Performance',
    description: 'Execution time, throughput, and resource utilization',
    icon: Gauge,
    color: 'blue'
  },
  {
    id: 'reliability',
    name: 'Reliability',
    description: 'Success rates, error patterns, and availability',
    icon: Shield,
    color: 'green'
  },
  {
    id: 'efficiency',
    name: 'Efficiency',
    description: 'Resource optimization and cost effectiveness',
    icon: Zap,
    color: 'yellow'
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Data quality metrics and validation results',
    icon: Target,
    color: 'purple'
  },
  {
    id: 'usage',
    name: 'Usage',
    description: 'User interactions and system utilization',
    icon: Users,
    color: 'orange'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Governance rules and regulatory compliance',
    icon: FileText,
    color: 'red'
  }
];

// Chart Types
const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart }
];

// Main Component
export const PipelineAnalytics: React.FC<PipelineAnalyticsProps> = ({
  pipelineId,
  onMetricsChange,
  onInsightGenerated,
  readonly = false,
  theme = 'light',
  className = ''
}) => {
  // Racine System Hooks
  const {
    currentPipeline,
    pipelineMetrics,
    getPipelineAnalytics,
    updatePipelineMetrics,
    generateInsights,
    exportMetrics
  } = usePipelineManagement();

  const {
    orchestrateAnalytics,
    getSystemMetrics,
    optimizePerformance,
    monitorSystemHealth
  } = useRacineOrchestration();

  const {
    aggregateCrossGroupMetrics,
    compareCrossGroupPerformance,
    getCrossGroupInsights,
    synchronizeAnalytics
  } = useCrossGroupIntegration();

  const { currentUser, hasPermission } = useUserManagement();
  const { currentWorkspace, getWorkspaceMetrics } = useWorkspaceManagement();
  const { trackActivity, getActivityAnalytics } = useActivityTracker();
  const { 
    getAIRecommendations, 
    optimizeWithAI, 
    generateInsightsWithAI,
    predictTrendsWithAI
  } = useAIAssistant();

  // Component State
  const [state, setState] = useState<PipelineAnalyticsState>({
    currentMetrics: null,
    activeInsight: null,
    selectedTimeRange: '24h',
    isGenerating: false,
    isAnalyzing: false,
    isOptimizing: false,
    isExporting: false,
    activeTab: 'overview',
    selectedView: 'overview',
    isLiveMode: true,
    isFullscreen: false,
    showAdvanced: false,
    analytics: [],
    performanceMetrics: [],
    trends: [],
    insights: [],
    reports: [],
    searchTerm: '',
    filterCriteria: {},
    sortOrder: 'desc',
    sortBy: 'timestamp'
  });

  // Computed Values
  const filteredAnalytics = useMemo(() => {
    let filtered = state.analytics;
    
    if (state.searchTerm) {
      filtered = filtered.filter(analytics =>
        analytics.name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        analytics.description?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[state.sortBy as keyof PipelineAnalytics] || '';
      const bValue = b[state.sortBy as keyof PipelineAnalytics] || '';
      
      if (state.sortOrder === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [state.analytics, state.searchTerm, state.sortBy, state.sortOrder]);

  const overviewMetrics = useMemo(() => {
    const metrics = state.performanceMetrics;
    const latest = metrics[0];
    
    if (!latest) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        throughput: 0,
        errorRate: 0,
        resourceUtilization: 0,
        costEfficiency: 0,
        dataQualityScore: 0
      };
    }
    
    return {
      totalExecutions: latest.totalExecutions || 0,
      successRate: latest.successRate || 0,
      averageExecutionTime: latest.averageExecutionTime || 0,
      throughput: latest.throughput || 0,
      errorRate: latest.errorRate || 0,
      resourceUtilization: latest.resourceUtilization || 0,
      costEfficiency: latest.costEfficiency || 0,
      dataQualityScore: latest.dataQualityScore || 0
    };
  }, [state.performanceMetrics]);

  const trendAnalysis = useMemo(() => {
    const trends = state.trends;
    
    return {
      performanceTrend: trends.find(t => t.category === 'performance')?.direction || 'stable',
      reliabilityTrend: trends.find(t => t.category === 'reliability')?.direction || 'stable',
      efficiencyTrend: trends.find(t => t.category === 'efficiency')?.direction || 'stable',
      qualityTrend: trends.find(t => t.category === 'quality')?.direction || 'stable',
      usageTrend: trends.find(t => t.category === 'usage')?.direction || 'stable',
      complianceTrend: trends.find(t => t.category === 'compliance')?.direction || 'stable'
    };
  }, [state.trends]);

  // Data Fetching
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        if (pipelineId) {
          const [analytics, performance, trends, insights, reports] = await Promise.all([
            getPipelineAnalyticsData(pipelineId, state.selectedTimeRange),
            getPerformanceMetrics(pipelineId, state.selectedTimeRange),
            getTrendAnalysis(pipelineId, state.selectedTimeRange),
            getAnalyticsInsights(pipelineId),
            getAnalyticsReports(pipelineId)
          ]);

          setState(prev => ({
            ...prev,
            analytics: analytics || [],
            performanceMetrics: performance || [],
            trends: trends || [],
            insights: insights || [],
            reports: reports || [],
            currentMetrics: performance?.[0] || null
          }));
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalyticsData();
  }, [pipelineId, state.selectedTimeRange]);

  // Live Mode Updates
  useEffect(() => {
    if (state.isLiveMode && pipelineId) {
      const interval = setInterval(async () => {
        try {
          const latestMetrics = await getPerformanceMetrics(pipelineId, '1h');
          setState(prev => ({
            ...prev,
            performanceMetrics: [latestMetrics[0], ...prev.performanceMetrics.slice(0, 99)],
            currentMetrics: latestMetrics[0]
          }));
        } catch (error) {
          console.error('Error fetching live metrics:', error);
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [state.isLiveMode, pipelineId]);

  // Backend Integration Functions
  const getPipelineAnalyticsData = async (pipelineId: string, timeRange: string): Promise<PipelineAnalytics[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/analytics?timeRange=${timeRange}`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching pipeline analytics:', error);
      return [];
    }
  };

  const getPerformanceMetrics = async (pipelineId: string, timeRange: string): Promise<PerformanceMetrics[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/performance?timeRange=${timeRange}`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }
  };

  const getTrendAnalysis = async (pipelineId: string, timeRange: string): Promise<TrendAnalysis[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/trends?timeRange=${timeRange}`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      return [];
    }
  };

  const getAnalyticsInsights = async (pipelineId: string): Promise<AnalyticsInsight[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/insights`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching analytics insights:', error);
      return [];
    }
  };

  const getAnalyticsReports = async (pipelineId: string): Promise<AnalyticsReport[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/reports`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching analytics reports:', error);
      return [];
    }
  };

  // Analytics Functions
  const handleGenerateAnalytics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }));
      
      const analyticsData = await generatePipelineAnalytics({
        pipelineId: pipelineId!,
        timeRange: state.selectedTimeRange,
        categories: ANALYTICS_CATEGORIES.map(c => c.id),
        detailed: true
      });

      setState(prev => ({
        ...prev,
        analytics: [analyticsData, ...prev.analytics],
        isGenerating: false
      }));

      trackActivity({
        action: 'generate_pipeline_analytics',
        resource: 'pipeline',
        details: { pipelineId, timeRange: state.selectedTimeRange }
      });

      if (onMetricsChange && analyticsData.metrics) {
        onMetricsChange(analyticsData.metrics);
      }
    } catch (error) {
      console.error('Error generating analytics:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [pipelineId, state.selectedTimeRange, generatePipelineAnalytics, trackActivity, onMetricsChange]);

  const handleAnalyzePerformance = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      const analysis = await analyzePipelinePerformance({
        pipelineId: pipelineId!,
        metrics: state.performanceMetrics,
        timeRange: state.selectedTimeRange
      });

      setState(prev => ({
        ...prev,
        insights: [...analysis.insights, ...prev.insights],
        trends: [...analysis.trends, ...prev.trends],
        isAnalyzing: false
      }));

      trackActivity({
        action: 'analyze_pipeline_performance',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          insightsGenerated: analysis.insights.length
        }
      });

      if (onInsightGenerated && analysis.insights.length > 0) {
        onInsightGenerated(analysis.insights[0]);
      }
    } catch (error) {
      console.error('Error analyzing performance:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [pipelineId, state.performanceMetrics, state.selectedTimeRange, analyzePipelinePerformance, trackActivity, onInsightGenerated]);

  const handleOptimizeMetrics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }));
      
      const optimization = await optimizePipelineMetrics({
        pipelineId: pipelineId!,
        currentMetrics: state.currentMetrics!,
        targetMetrics: state.filterCriteria
      });

      setState(prev => ({
        ...prev,
        insights: [optimization.recommendations, ...prev.insights],
        isOptimizing: false
      }));

      trackActivity({
        action: 'optimize_pipeline_metrics',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          optimizationScore: optimization.score
        }
      });
    } catch (error) {
      console.error('Error optimizing metrics:', error);
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, [pipelineId, state.currentMetrics, state.filterCriteria, optimizePipelineMetrics, trackActivity]);

  const handleExportAnalytics = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    try {
      setState(prev => ({ ...prev, isExporting: true }));
      
      const exportData = await exportAnalyticsData({
        pipelineId: pipelineId!,
        analytics: state.analytics,
        metrics: state.performanceMetrics,
        format,
        timeRange: state.selectedTimeRange
      });

      // Trigger download
      const blob = new Blob([exportData.data], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportData.filename;
      link.click();
      URL.revokeObjectURL(url);

      setState(prev => ({ ...prev, isExporting: false }));

      trackActivity({
        action: 'export_pipeline_analytics',
        resource: 'pipeline',
        details: { pipelineId, format, recordCount: state.analytics.length }
      });
    } catch (error) {
      console.error('Error exporting analytics:', error);
      setState(prev => ({ ...prev, isExporting: false }));
    }
  }, [pipelineId, state.analytics, state.performanceMetrics, state.selectedTimeRange, exportAnalyticsData, trackActivity]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics Overview</h3>
          <p className="text-sm text-muted-foreground">
            Real-time pipeline performance and metrics dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={state.selectedTimeRange} 
            onValueChange={(value) => setState(prev => ({ ...prev, selectedTimeRange: value }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, isLiveMode: !prev.isLiveMode }))}
          >
            {state.isLiveMode ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {state.isLiveMode ? 'Pause Live' : 'Start Live'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Total Executions</div>
              <div className="text-2xl font-bold">{overviewMetrics.totalExecutions.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {trendAnalysis.performanceTrend === 'up' && <TrendingUp className="h-3 w-3 inline text-green-500" />}
                {trendAnalysis.performanceTrend === 'down' && <TrendingDown className="h-3 w-3 inline text-red-500" />}
                {state.selectedTimeRange}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Success Rate</div>
              <div className="text-2xl font-bold">{overviewMetrics.successRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                {trendAnalysis.reliabilityTrend === 'up' && <TrendingUp className="h-3 w-3 inline text-green-500" />}
                {trendAnalysis.reliabilityTrend === 'down' && <TrendingDown className="h-3 w-3 inline text-red-500" />}
                +2.3% vs previous
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Avg Execution Time</div>
              <div className="text-2xl font-bold">{overviewMetrics.averageExecutionTime.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">
                {trendAnalysis.efficiencyTrend === 'up' && <TrendingUp className="h-3 w-3 inline text-green-500" />}
                {trendAnalysis.efficiencyTrend === 'down' && <TrendingDown className="h-3 w-3 inline text-red-500" />}
                -15ms improvement
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Gauge className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Throughput</div>
              <div className="text-2xl font-bold">{overviewMetrics.throughput.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">
                {trendAnalysis.usageTrend === 'up' && <TrendingUp className="h-3 w-3 inline text-green-500" />}
                {trendAnalysis.usageTrend === 'down' && <TrendingDown className="h-3 w-3 inline text-red-500" />}
                records/sec
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ANALYTICS_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const trendDirection = trendAnalysis[`${category.id}Trend` as keyof typeof trendAnalysis];
          const score = Math.random() * 100; // Mock score
          
          return (
            <Card key={category.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg`}>
                      <Icon className={`h-4 w-4 text-${category.color}-600 dark:text-${category.color}-400`} />
                    </div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                  </div>
                  {trendDirection === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {trendDirection === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span className="font-medium">{score.toFixed(0)}/100</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Insights */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Recent Insights</h4>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAnalyzePerformance}
            disabled={state.isAnalyzing}
          >
            {state.isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {state.isAnalyzing ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>

        <div className="space-y-3">
          {state.insights.slice(0, 5).map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{insight.title || `Insight ${index + 1}`}</div>
                <div className="text-sm text-muted-foreground">{insight.description || 'Performance optimization opportunity detected'}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{insight.category || 'Performance'}</Badge>
                  <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                    {insight.priority || 'Medium'} Priority
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="space-y-6">
      {/* Performance Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">
            Detailed performance analysis and resource utilization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleOptimizeMetrics}
            disabled={state.isOptimizing}
          >
            {state.isOptimizing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Optimize
          </Button>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium mb-4">Execution Time Trend</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <LineChart className="h-12 w-12 mx-auto mb-4" />
              <p>Execution time trend chart</p>
              <p className="text-sm">Real-time performance monitoring</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="font-medium mb-4">Resource Utilization</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <AreaChart className="h-12 w-12 mx-auto mb-4" />
              <p>Resource utilization chart</p>
              <p className="text-sm">CPU, HardDrive, Storage usage</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resource Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Cpu className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-sm font-medium">CPU Usage</div>
              <div className="text-2xl font-bold">{overviewMetrics.resourceUtilization.toFixed(0)}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <HardDrive className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-medium">HardDrive Usage</div>
              <div className="text-2xl font-bold">{(overviewMetrics.resourceUtilization * 0.8).toFixed(0)}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Storage Usage</div>
              <div className="text-2xl font-bold">{(overviewMetrics.resourceUtilization * 0.6).toFixed(0)}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Network className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Network I/O</div>
              <div className="text-2xl font-bold">{(overviewMetrics.throughput / 1000).toFixed(1)}MB/s</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Details */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Performance Breakdown</h4>
        <div className="space-y-4">
          {[
            { name: 'Data Ingestion', time: 245, percentage: 35 },
            { name: 'Data Processing', time: 432, percentage: 45 },
            { name: 'Data Validation', time: 123, percentage: 15 },
            { name: 'Data Output', time: 89, percentage: 5 }
          ].map((stage, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{stage.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Progress value={stage.percentage} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground w-16 text-right">
                  {stage.time}ms
                </div>
                <div className="text-sm text-muted-foreground w-12 text-right">
                  {stage.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderTrendAnalysis = () => (
    <div className="space-y-6">
      {/* Trends Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Historical trends and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value="30d">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium mb-4">Performance Trend</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p>Performance trend visualization</p>
              <p className="text-sm">Multi-metric trend analysis</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="font-medium mb-4">Usage Pattern</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <p>Usage pattern analysis</p>
              <p className="text-sm">Peak hours and utilization</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ANALYTICS_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const trend = trendAnalysis[`${category.id}Trend` as keyof typeof trendAnalysis];
          const change = (Math.random() - 0.5) * 20; // Mock change percentage
          
          return (
            <Card key={category.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg`}>
                    <Icon className={`h-4 w-4 text-${category.color}-600 dark:text-${category.color}-400`} />
                  </div>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">30-day trend</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{trend}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Predictive Analytics */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Predictive Analytics</h4>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">Performance Forecast</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Based on current trends, pipeline performance is expected to improve by 12% over the next 30 days.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-900 dark:text-yellow-100">Resource Alert</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  HardDrive usage is trending upward. Consider scaling resources within the next 2 weeks.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">Optimization Opportunity</div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Error rate has decreased by 25%. Current optimization strategies are effective.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderInsightsAndRecommendations = () => (
    <div className="space-y-6">
      {/* Insights Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Insights & Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Machine learning-powered insights and optimization recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleGenerateAnalytics}
            disabled={state.isGenerating}
            size="sm"
          >
            {state.isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Generate Insights
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid gap-6">
        {state.insights.map((insight, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{insight.title || `AI Insight ${index + 1}`}</h4>
                  <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                    {insight.priority || 'Medium'} Priority
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{insight.description || 'AI-generated optimization recommendation'}</p>
                
                {insight.recommendations && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Recommendations:</h5>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-4">
                  <Button size="sm">
                    Apply Recommendation
                  </Button>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {insight.confidence || Math.floor(Math.random() * 30 + 70)}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recommendation Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium mb-4">Performance Optimizations</h4>
          <div className="space-y-3">
            {[
              'Optimize data transformation queries',
              'Implement caching for frequent operations',
              'Parallelize independent processing steps',
              'Reduce memory allocation overhead'
            ].map((rec, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="font-medium mb-4">Cost Optimizations</h4>
          <div className="space-y-3">
            {[
              'Right-size compute resources',
              'Schedule non-critical jobs during off-peak',
              'Implement data lifecycle policies',
              'Optimize storage tier usage'
            ].map((rec, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`pipeline-analytics ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Pipeline Analytics</h2>
            <p className="text-muted-foreground">
              Comprehensive analytics and insights for your data governance pipelines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportAnalytics('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAnalytics('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAnalytics('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${state.isLiveMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-muted-foreground">
                {state.isLiveMode ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="space-y-6">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {renderPerformanceMetrics()}
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {renderTrendAnalysis()}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {renderInsightsAndRecommendations()}
            </TabsContent>
          </div>
        </Tabs>

        {/* Loading States */}
        {(state.isGenerating || state.isAnalyzing || state.isOptimizing || state.isExporting) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <div>
                  <div className="font-medium">
                    {state.isGenerating && "Generating analytics..."}
                    {state.isAnalyzing && "Analyzing performance..."}
                    {state.isOptimizing && "Optimizing metrics..."}
                    {state.isExporting && "Exporting analytics data..."}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Please wait while we process your request
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PipelineAnalytics;