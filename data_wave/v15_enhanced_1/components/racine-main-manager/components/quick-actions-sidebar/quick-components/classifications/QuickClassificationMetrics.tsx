/**
 * Quick Classification Metrics Component
 * =====================================
 * 
 * Enterprise-grade quick access component for classification metrics and analytics.
 * Provides comprehensive performance insights and optimization recommendations.
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
  Target, 
  Gauge,
  PieChart,
  Timer,
  Zap,
  Tag,
  CheckCircle,
  AlertTriangle,
  Database,
  FileText,
  RefreshCw,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services
import type { 
  ClassificationMetrics,
  ClassificationAnalytics,
  MetricsTrend,
  PerformanceBenchmark
} from '../../../../types/racine-core.types';

import { useClassifications } from '../../../../hooks/useClassifications';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';

interface QuickClassificationMetricsProps {
  isVisible?: boolean;
  onClose?: () => void;
  classificationId?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  className?: string;
}

interface MetricsConfig {
  timeRange: '1h' | '24h' | '7d' | '30d';
  granularity: 'minute' | 'hour' | 'day';
  comparison: 'previous' | 'baseline' | 'benchmark';
}

export const QuickClassificationMetrics: React.FC<QuickClassificationMetricsProps> = ({
  isVisible = true,
  onClose,
  classificationId,
  timeRange = '24h',
  className = ''
}) => {
  // Hooks
  const {
    getClassificationMetrics,
    getClassificationAnalytics,
    getClassificationBenchmarks,
    isLoading,
    error
  } = useClassifications();

  const { currentWorkspace } = useWorkspaceManagement();

  // State
  const [config, setConfig] = useState<MetricsConfig>({
    timeRange,
    granularity: 'hour',
    comparison: 'previous'
  });
  const [metrics, setMetrics] = useState<ClassificationMetrics | null>(null);
  const [analytics, setAnalytics] = useState<ClassificationAnalytics | null>(null);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark | null>(null);
  const [trends, setTrends] = useState<MetricsTrend[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load metrics data
  useEffect(() => {
    if (isVisible) {
      loadMetricsData();
    }
  }, [isVisible, config]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !isVisible) return;

    const interval = setInterval(() => {
      loadMetricsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, isVisible]);

  const loadMetricsData = useCallback(async () => {
    try {
      const [metricsData, analyticsData, benchmarkData] = await Promise.all([
        getClassificationMetrics(classificationId, config),
        getClassificationAnalytics(classificationId, config.timeRange),
        getClassificationBenchmarks(classificationId)
      ]);

      setMetrics(metricsData);
      setAnalytics(analyticsData);
      setBenchmarks(benchmarkData);

      // Calculate trends
      if (analyticsData?.historicalData) {
        const trendsData = calculateTrends(analyticsData.historicalData);
        setTrends(trendsData);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
      toast.error('Failed to load classification metrics');
    }
  }, [classificationId, config, getClassificationMetrics, getClassificationAnalytics, getClassificationBenchmarks]);

  // Calculate trends
  const calculateTrends = useCallback((historicalData: any[]) => {
    const trends: MetricsTrend[] = [
      {
        metric: 'accuracy',
        trend: calculateTrendDirection(historicalData, 'accuracy'),
        change: calculateTrendChange(historicalData, 'accuracy'),
        significance: 'high'
      },
      {
        metric: 'coverage',
        trend: calculateTrendDirection(historicalData, 'coverage'),
        change: calculateTrendChange(historicalData, 'coverage'),
        significance: 'medium'
      },
      {
        metric: 'performance',
        trend: calculateTrendDirection(historicalData, 'responseTime'),
        change: calculateTrendChange(historicalData, 'responseTime'),
        significance: 'medium'
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
  const formatMetric = useCallback((value: number, type: 'percentage' | 'duration' | 'count' | 'score') => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return value > 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
      case 'count':
        return value.toLocaleString();
      case 'score':
        return `${value.toFixed(1)}/100`;
      default:
        return value.toString();
    }
  }, []);

  // Get trend display
  const getTrendDisplay = useCallback((trend: MetricsTrend) => {
    const isPositive = trend.metric === 'performance' 
      ? trend.trend === 'down' // For performance, down is better (lower response time)
      : trend.trend === 'up';   // For accuracy/coverage, up is better

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
      className={`quick-classification-metrics ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-rose-50/50 to-pink-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Classification Metrics
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
              
              {/* Overall Performance Score */}
              {metrics && (
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gauge className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Classification Performance</span>
                  </div>
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(metrics.overallScore).split(' ')[0]}`}>
                    {formatMetric(metrics.overallScore, 'score')}
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
                      <span className="text-xs text-blue-700">Accuracy</span>
                      <Target className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatMetric(metrics.accuracy, 'percentage')}
                    </div>
                    {trends.find(t => t.metric === 'accuracy') && (
                      <div className="flex items-center gap-1 mt-1">
                        {(() => {
                          const trend = trends.find(t => t.metric === 'accuracy')!;
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
                      <span className="text-xs text-green-700">Coverage</span>
                      <PieChart className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatMetric(metrics.coverage, 'percentage')}
                    </div>
                    {trends.find(t => t.metric === 'coverage') && (
                      <div className="flex items-center gap-1 mt-1">
                        {(() => {
                          const trend = trends.find(t => t.metric === 'coverage')!;
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
                      <span className="text-xs text-purple-700">Response Time</span>
                      <Timer className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {formatMetric(metrics.averageResponseTime, 'duration')}
                    </div>
                    {trends.find(t => t.metric === 'performance') && (
                      <div className="flex items-center gap-1 mt-1">
                        {(() => {
                          const trend = trends.find(t => t.metric === 'performance')!;
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

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-orange-700">Assets Classified</span>
                      <Tag className="h-3 w-3 text-orange-600" />
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {formatMetric(metrics.totalClassified, 'count')}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {formatMetric(metrics.classificationRate, 'percentage')} rate
                    </div>
                  </div>
                </div>
              )}

              {/* Benchmark Comparison */}
              {benchmarks && metrics && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Benchmark Comparison
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">vs. Workspace Average</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(100, metrics.overallScore / benchmarks.workspaceAverage * 100)} 
                          className="h-2 w-16" 
                        />
                        <span className={`text-xs font-medium ${
                          metrics.overallScore >= benchmarks.workspaceAverage ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(metrics.overallScore / benchmarks.workspaceAverage * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">vs. Industry Standard</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(100, metrics.overallScore / benchmarks.industryStandard * 100)} 
                          className="h-2 w-16" 
                        />
                        <span className={`text-xs font-medium ${
                          metrics.overallScore >= benchmarks.industryStandard ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(metrics.overallScore / benchmarks.industryStandard * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">vs. Best in Class</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(100, metrics.overallScore / benchmarks.bestInClass * 100)} 
                          className="h-2 w-16" 
                        />
                        <span className={`text-xs font-medium ${
                          metrics.overallScore >= benchmarks.bestInClass ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(metrics.overallScore / benchmarks.bestInClass * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Classification Breakdown */}
              {analytics?.byType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Classification Breakdown
                  </h3>
                  
                  <div className="space-y-2">
                    {Object.entries(analytics.byType).map(([type, data]) => (
                      <div key={type} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {data.count} assets
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Accuracy:</span>
                            <span className="font-medium">{formatMetric(data.accuracy, 'percentage')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <span className="font-medium">{formatMetric(data.avgConfidence, 'percentage')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">False Positives:</span>
                            <span className="font-medium">{data.falsePositives}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coverage:</span>
                            <span className="font-medium">{formatMetric(data.coverage, 'percentage')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Performance Issues */}
              {metrics?.issues && metrics.issues.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Performance Issues
                  </h3>
                  
                  <div className="space-y-2">
                    {metrics.issues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-red-900">
                            {issue.title}
                          </span>
                          <Badge 
                            variant={issue.severity === 'high' ? 'destructive' : 
                                   issue.severity === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-red-700 mb-2">
                          {issue.description}
                        </p>
                        {issue.recommendation && (
                          <div className="text-xs text-blue-600">
                            💡 {issue.recommendation}
                          </div>
                        )}
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
                    <Activity className="h-4 w-4" />
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
                  <p className="text-xs">Select a classification to view analytics</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickClassificationMetrics;