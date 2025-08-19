/**
 * Quick Rule Metrics Component
 * ============================
 * 
 * Enterprise-grade quick access component for scan rule metrics and analytics.
 * Provides comprehensive performance insights, trends, and optimization recommendations.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Timer,
  Database,
  Users,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  Gauge,
  PieChart,
  LineChart,
  BarChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services
import type { 
  ScanRule, 
  RulePerformanceMetrics,
  RuleAnalytics,
  MetricsTrend,
  PerformanceBenchmark,
  OptimizationSuggestion
} from '../../../types/racine-core.types';

import { useScanRuleSets } from '../../../hooks/useScanRuleSets';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';

interface QuickRuleMetricsProps {
  isVisible?: boolean;
  onClose?: () => void;
  ruleId?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  className?: string;
}

interface MetricsConfig {
  timeRange: '1h' | '24h' | '7d' | '30d';
  granularity: 'minute' | 'hour' | 'day';
  compareWith?: 'previous' | 'baseline' | 'benchmark';
  includeOptimizations: boolean;
}

export const QuickRuleMetrics: React.FC<QuickRuleMetricsProps> = ({
  isVisible = true,
  onClose,
  ruleId,
  timeRange = '24h',
  className = ''
}) => {
  // Hooks
  const {
    getRuleMetrics,
    getRuleAnalytics,
    getBenchmarks,
    getOptimizationSuggestions,
    isLoading,
    error
  } = useScanRuleSets();

  const { currentWorkspace } = useWorkspaceManagement();

  // State
  const [selectedRule, setSelectedRule] = useState<ScanRule | null>(null);
  const [config, setConfig] = useState<MetricsConfig>({
    timeRange,
    granularity: 'hour',
    compareWith: 'previous',
    includeOptimizations: true
  });
  const [metrics, setMetrics] = useState<RulePerformanceMetrics | null>(null);
  const [analytics, setAnalytics] = useState<RuleAnalytics | null>(null);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [trends, setTrends] = useState<MetricsTrend[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load metrics data
  useEffect(() => {
    if (isVisible && ruleId) {
      loadMetricsData();
    }
  }, [isVisible, ruleId, config]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !isVisible || !ruleId) return;

    const interval = setInterval(() => {
      loadMetricsData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isVisible, ruleId]);

  const loadMetricsData = useCallback(async () => {
    if (!ruleId) return;

    try {
      const [metricsData, analyticsData, benchmarkData, optimizationData] = await Promise.all([
        getRuleMetrics(ruleId, config),
        getRuleAnalytics(ruleId, config.timeRange),
        getBenchmarks(ruleId),
        config.includeOptimizations ? getOptimizationSuggestions(ruleId) : Promise.resolve([])
      ]);

      setMetrics(metricsData);
      setAnalytics(analyticsData);
      setBenchmarks(benchmarkData);
      setOptimizations(optimizationData);

      // Calculate trends
      if (analyticsData?.historicalData) {
        const trendsData = calculateTrends(analyticsData.historicalData);
        setTrends(trendsData);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
      toast.error('Failed to load rule metrics');
    }
  }, [ruleId, config, getRuleMetrics, getRuleAnalytics, getBenchmarks, getOptimizationSuggestions]);

  // Calculate trends from historical data
  const calculateTrends = useCallback((historicalData: any[]) => {
    const trends: MetricsTrend[] = [
      {
        metric: 'executionTime',
        trend: calculateTrendDirection(historicalData, 'executionTime'),
        change: calculateTrendChange(historicalData, 'executionTime'),
        significance: 'medium'
      },
      {
        metric: 'successRate',
        trend: calculateTrendDirection(historicalData, 'successRate'),
        change: calculateTrendChange(historicalData, 'successRate'),
        significance: 'high'
      },
      {
        metric: 'recordsProcessed',
        trend: calculateTrendDirection(historicalData, 'recordsProcessed'),
        change: calculateTrendChange(historicalData, 'recordsProcessed'),
        significance: 'low'
      }
    ];
    return trends;
  }, []);

  const calculateTrendDirection = (data: any[], metric: string): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3).map(d => d[metric]);
    const older = data.slice(-6, -3).map(d => d[metric]);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    return Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down';
  };

  const calculateTrendChange = (data: any[], metric: string): number => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1][metric];
    const previous = data[data.length - 2][metric];
    return ((current - previous) / previous) * 100;
  };

  // Format metric values
  const formatMetric = useCallback((value: number, type: 'percentage' | 'duration' | 'count' | 'rate') => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return value > 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
      case 'count':
        return value.toLocaleString();
      case 'rate':
        return `${value.toFixed(2)}/sec`;
      default:
        return value.toString();
    }
  }, []);

  // Get trend color and icon
  const getTrendDisplay = useCallback((trend: MetricsTrend) => {
    const isPositive = trend.metric === 'successRate' || trend.metric === 'recordsProcessed' 
      ? trend.trend === 'up' 
      : trend.trend === 'down'; // For execution time, down is better

    const color = trend.trend === 'stable' ? 'text-gray-600' : 
                 isPositive ? 'text-green-600' : 'text-red-600';
    
    const Icon = trend.trend === 'up' ? ArrowUp : 
                trend.trend === 'down' ? ArrowDown : Minus;

    return { color, Icon };
  }, []);

  // Get performance score color
  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`quick-rule-metrics ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-amber-50/50 to-orange-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Rule Metrics
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Performance analytics and insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'text-green-600' : 'text-gray-400'}
              >
                <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>

          {/* Time Range Selection */}
          <div className="flex gap-2 mt-4">
            <Select
              value={config.timeRange}
              onValueChange={(value) => setConfig(prev => ({ ...prev, timeRange: value as any }))}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={config.granularity}
              onValueChange={(value) => setConfig(prev => ({ ...prev, granularity: value as any }))}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minute">Minute</SelectItem>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              
              {/* Performance Score */}
              {metrics && (
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gauge className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">Performance Score</span>
                  </div>
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(metrics.overallScore).split(' ')[0]}`}>
                    {metrics.overallScore}/100
                  </div>
                  <Progress value={metrics.overallScore} className="h-2 mb-2" />
                  <p className="text-xs text-gray-600">
                    {metrics.overallScore >= 90 ? 'Excellent performance' :
                     metrics.overallScore >= 70 ? 'Good performance' :
                     metrics.overallScore >= 50 ? 'Fair performance' : 'Needs optimization'}
                  </p>
                </div>
              )}

              {/* Key Metrics Grid */}
              {metrics && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-700">Avg Execution</span>
                      <Timer className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatMetric(metrics.averageExecutionTime, 'duration')}
                    </div>
                    {trends.find(t => t.metric === 'executionTime') && (
                      <div className="flex items-center gap-1 mt-1">
                        {(() => {
                          const trend = trends.find(t => t.metric === 'executionTime')!;
                          const { color, Icon } = getTrendDisplay(trend);
                          return (
                            <>
                              <Icon className={`h-3 w-3 ${color}`} />
                              <span className={`text-xs ${color}`}>
                                {Math.abs(trend.change).toFixed(1)}%
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-700">Success Rate</span>
                      <Target className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatMetric(metrics.successRate, 'percentage')}
                    </div>
                    {trends.find(t => t.metric === 'successRate') && (
                      <div className="flex items-center gap-1 mt-1">
                        {(() => {
                          const trend = trends.find(t => t.metric === 'successRate')!;
                          const { color, Icon } = getTrendDisplay(trend);
                          return (
                            <>
                              <Icon className={`h-3 w-3 ${color}`} />
                              <span className={`text-xs ${color}`}>
                                {Math.abs(trend.change).toFixed(1)}%
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-purple-700">Throughput</span>
                      <Activity className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {formatMetric(metrics.throughput, 'rate')}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {formatMetric(metrics.recordsProcessed, 'count')} records
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-orange-700">Error Rate</span>
                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {formatMetric(metrics.errorRate, 'percentage')}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {metrics.totalErrors} errors
                    </div>
                  </div>
                </div>
              )}

              {/* Benchmark Comparison */}
              {benchmarks && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Benchmark Comparison
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">vs. Workspace Average</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(100, (metrics?.overallScore || 0) / benchmarks.workspaceAverage * 100)} 
                          className="h-2 w-16" 
                        />
                        <span className={`text-xs font-medium ${
                          (metrics?.overallScore || 0) >= benchmarks.workspaceAverage ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {((metrics?.overallScore || 0) / benchmarks.workspaceAverage * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">vs. Industry Standard</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(100, (metrics?.overallScore || 0) / benchmarks.industryStandard * 100)} 
                          className="h-2 w-16" 
                        />
                        <span className={`text-xs font-medium ${
                          (metrics?.overallScore || 0) >= benchmarks.industryStandard ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {((metrics?.overallScore || 0) / benchmarks.industryStandard * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Optimization Suggestions */}
              {optimizations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Optimization Suggestions
                  </h3>
                  
                  <div className="space-y-2">
                    {optimizations.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={suggestion.priority === 'high' ? 'destructive' : 
                                     suggestion.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {suggestion.priority}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">
                              {suggestion.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            {suggestion.expectedImprovement}% faster
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Effort: {suggestion.implementationEffort}
                          </span>
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Resource Usage */}
              {metrics?.resourceUsage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Resource Usage
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">CPU Usage</span>
                        <span className="text-sm font-medium">
                          {metrics.resourceUsage.cpu.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.resourceUsage.cpu} className="h-2" />
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Memory Usage</span>
                        <span className="text-sm font-medium">
                          {metrics.resourceUsage.memory.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.resourceUsage.memory} className="h-2" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule Report
                </Button>
              </div>

              {/* No Data State */}
              {!metrics && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No metrics available</p>
                  <p className="text-xs">Select a rule to view performance data</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickRuleMetrics;