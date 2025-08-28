'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity, Clock, Calendar, Users, Database, Network, Zap, Target, Eye, Filter, Search, Download, Upload, RefreshCw, Settings, Share2, MoreHorizontal, X, Plus, Minus, ArrowUp, ArrowDown, AlertTriangle, CheckCircle, XCircle, Info, Lightbulb, Brain, Layers, Route, MapPin, Compass, Navigation, Globe, Shield, Award, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Advanced Chart components
import { 
  LineChart as RechartsLineChart, 
  BarChart as RechartsBarChart, 
  AreaChart, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  Line, 
  Bar, 
  Area, 
  Pie, 
  Cell
} from 'recharts';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types from racine-core.types
import { 
  WorkflowAnalytics as WorkflowAnalyticsType,
  AnalyticsMetric,
  TrendAnalysis,
  PerformanceInsight,
  UsagePattern,
  ExecutionStatistics,
  ResourceUtilization,
  CostTrend,
  QualityMetrics,
  UserBehaviorAnalytics,
  SystemHealthMetrics,
  PredictiveForecast,
  BenchmarkComparison,
  AnalyticsReport,
  DataVisualization
} from '../../types/racine-core.types';

interface WorkflowAnalyticsProps {
  workflowId?: string;
  showRealTimeUpdates?: boolean;
  enableInteractiveCharts?: boolean;
  defaultCategory?: string;
  customMetrics?: string[];
  onInsightGenerated?: (insight: PerformanceInsight) => void;
  className?: string;
}

const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({
  workflowId,
  showRealTimeUpdates = true,
  enableInteractiveCharts = true,
  defaultCategory = 'performance',
  customMetrics = [],
  onInsightGenerated,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    getWorkflowAnalytics,
    getExecutionStatistics,
    getPerformanceMetrics,
    getTrendAnalysis,
    generateAnalyticsReport,
    getWorkflowComparison,
    exportAnalyticsData
  } = useJobWorkflow();
  
  const { 
    getSystemAnalytics,
    getResourceUtilizationTrends,
    getCostAnalytics,
    getCapacityAnalytics,
    getPredictiveForecasts
  } = useRacineOrchestration();
  
  const { 
    getCrossGroupAnalytics,
    getIntegrationMetrics,
    getCollaborationAnalytics,
    getDataFlowAnalytics
  } = useCrossGroupIntegration();
  
  const { getCurrentUser } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    generateInsights,
    predictTrends,
    identifyAnomalies,
    suggestOptimizations,
    analyzePatterns,
    generateRecommendations
  } = useAIAssistant();

  // Core Analytics State
  const [analyticsData, setAnalyticsData] = useState<WorkflowAnalyticsType | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([]);
  const [executionStats, setExecutionStats] = useState<ExecutionStatistics | null>(null);
  const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);
  const [costTrends, setCostTrends] = useState<CostTrend[]>([]);

  // UI State Management
  const [activeTab, setActiveTab] = useState(defaultCategory);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [chartType, setChartType] = useState<string>('line');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(showRealTimeUpdates);

  // Load Analytics Data
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const [
        workflowAnalytics,
        executionStatistics,
        trends,
        insights
      ] = await Promise.all([
        workflowId ? getWorkflowAnalytics(workflowId) : null,
        getExecutionStatistics({ workflowId }),
        getTrendAnalysis({ workflowId }),
        generateInsights(workflowId || '', { category: activeTab })
      ]);

      setAnalyticsData(workflowAnalytics);
      setExecutionStats(executionStatistics);
      setTrendAnalysis(trends);
      setPerformanceInsights(insights);
      setLastUpdated(new Date());

      const loadDuration = Date.now() - startTime;

      trackActivity({
        action: 'analytics_loaded',
        resource_type: 'workflow_analytics',
        resource_id: workflowId || 'global',
        details: {
          category: activeTab,
          time_range: selectedTimeRange,
          load_time: loadDuration,
          insights_generated: insights.length
        }
      });
    } catch (error: any) {
      console.error('❌ Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedTimeRange, workflowId, activeTab,
    getWorkflowAnalytics, getExecutionStatistics, getTrendAnalysis,
    generateInsights, trackActivity
  ]);

  // Render Performance Analytics Dashboard
  const renderPerformanceAnalytics = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Avg Execution Time</p>
                <p className="text-3xl font-bold text-green-900">
                  {executionStats?.average_execution_time 
                    ? `${Math.round(executionStats.average_execution_time)}s`
                    : '—'
                  }
                </p>
              </div>
              <div className="p-3 bg-green-600 rounded-full">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-blue-900">
                  {executionStats?.success_rate 
                    ? `${Math.round(executionStats.success_rate * 100)}%`
                    : '—'
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-600 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Throughput</p>
                <p className="text-3xl font-bold text-orange-900">
                  {executionStats?.throughput 
                    ? `${Math.round(executionStats.throughput)}/h`
                    : '—'
                  }
                </p>
              </div>
              <div className="p-3 bg-orange-600 rounded-full">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Executions</p>
                <p className="text-3xl font-bold text-purple-900">
                  {executionStats?.total_executions 
                    ? executionStats.total_executions.toLocaleString()
                    : '—'
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-600 rounded-full">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Performance Trends</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trendAnalysis.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' && (
                  <RechartsLineChart data={trendAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <ChartTooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="execution_time" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Execution Time (s)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="success_rate" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Success Rate (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Throughput"
                    />
                  </RechartsLineChart>
                )}
                
                {chartType === 'area' && (
                  <AreaChart data={trendAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="execution_time" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Execution Time"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="throughput" 
                      stackId="2" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Throughput"
                    />
                  </AreaChart>
                )}

                {chartType === 'bar' && (
                  <RechartsBarChart data={trendAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar 
                      dataKey="execution_time" 
                      fill="#3b82f6"
                      name="Execution Time (s)"
                    />
                    <Bar 
                      dataKey="throughput" 
                      fill="#10b981"
                      name="Throughput"
                    />
                  </RechartsBarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No performance data available</p>
                <p className="text-sm">Data will appear here once workflows are executed</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-Generated Insights */}
      {performanceInsights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              AI Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceInsights.slice(0, 3).map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-blue-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round((insight.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInsightGenerated?.(insight)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Effects
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Main Render
  return (
    <div className={`flex h-full bg-gradient-to-br from-white to-gray-50 ${className}`}>
      <TooltipProvider>
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Workflow Analytics</h1>
                  <p className="text-sm text-gray-500">Advanced analytics and insights dashboard</p>
                </div>
              </div>
              
              {lastUpdated && (
                <div className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-refresh Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRefreshEnabled}
                  onCheckedChange={setAutoRefreshEnabled}
                />
                <Label className="text-sm">Auto-refresh</Label>
              </div>
              
              {/* Time Range Selector */}
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAnalyticsData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Refresh
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="performance" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger value="usage" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Usage</span>
                </TabsTrigger>
                <TabsTrigger value="cost" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Cost</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>System</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="h-full">
                <TabsContent value="performance" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {renderPerformanceAnalytics()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="usage" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Usage Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Usage patterns and user behavior analytics</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="cost" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Cost Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Cost analysis and budget tracking</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="system" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">System Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-gray-500">
                            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>System health and resource utilization</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default WorkflowAnalytics;