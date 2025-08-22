"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { ANALYTICS_METRICS, TIME_PERIODS } from '../../constants/workflow-analytics';
import { formatMetricValue, calculateTrend } from '../../utils/workflow-analytics';

interface WorkflowMetricsPanelProps {
  workflowId?: string;
  timePeriod?: string;
  onTimePeriodChange?: (period: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface MetricData {
  name: string;
  value: number;
  previousValue?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  status: 'good' | 'warning' | 'critical';
  unit?: string;
  description?: string;
}

export const WorkflowMetricsPanel: React.FC<WorkflowMetricsPanelProps> = ({
  workflowId,
  timePeriod = TIME_PERIODS.LAST_DAY,
  onTimePeriodChange,
  onRefresh,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    ANALYTICS_METRICS.EXECUTION_TIME,
    ANALYTICS_METRICS.SUCCESS_RATE,
    ANALYTICS_METRICS.THROUGHPUT,
    ANALYTICS_METRICS.ERROR_COUNT
  ]);

  // Mock data - in real implementation this would come from API
  const mockMetrics: MetricData[] = useMemo(() => [
    {
      name: ANALYTICS_METRICS.EXECUTION_TIME,
      value: 1250,
      previousValue: 1100,
      trend: 'increasing',
      status: 'warning',
      unit: 'ms',
      description: 'Average execution time for workflow steps'
    },
    {
      name: ANALYTICS_METRICS.SUCCESS_RATE,
      value: 0.94,
      previousValue: 0.96,
      trend: 'decreasing',
      status: 'warning',
      unit: '%',
      description: 'Percentage of successful workflow executions'
    },
    {
      name: ANALYTICS_METRICS.THROUGHPUT,
      value: 1250,
      previousValue: 1180,
      trend: 'increasing',
      status: 'good',
      unit: 'executions/hour',
      description: 'Number of workflows processed per hour'
    },
    {
      name: ANALYTICS_METRICS.ERROR_COUNT,
      value: 45,
      previousValue: 52,
      trend: 'decreasing',
      status: 'good',
      unit: 'errors',
      description: 'Total number of errors encountered'
    },
    {
      name: ANALYTICS_METRICS.CPU_USAGE,
      value: 0.78,
      previousValue: 0.72,
      trend: 'increasing',
      status: 'warning',
      unit: '%',
      description: 'Average CPU utilization during execution'
    },
    {
      name: ANALYTICS_METRICS.MEMORY_USAGE,
      value: 0.65,
      previousValue: 0.68,
      trend: 'decreasing',
      status: 'good',
      unit: '%',
      description: 'Average memory utilization during execution'
    }
  ], []);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    }
  }, [onRefresh]);

  const handleTimePeriodChange = useCallback((period: string) => {
    if (onTimePeriodChange) {
      onTimePeriodChange(period);
    }
  }, [onTimePeriodChange]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  }, []);

  const calculateChange = useCallback((current: number, previous?: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, []);

  const filteredMetrics = useMemo(() => 
    mockMetrics.filter(metric => selectedMetrics.includes(metric.name)),
    [mockMetrics, selectedMetrics]
  );

  const performanceMetrics = useMemo(() => 
    filteredMetrics.filter(metric => 
      [ANALYTICS_METRICS.EXECUTION_TIME, ANALYTICS_METRICS.SUCCESS_RATE, ANALYTICS_METRICS.THROUGHPUT].includes(metric.name as any)
    ),
    [filteredMetrics]
  );

  const resourceMetrics = useMemo(() => 
    filteredMetrics.filter(metric => 
      [ANALYTICS_METRICS.CPU_USAGE, ANALYTICS_METRICS.MEMORY_USAGE, ANALYTICS_METRICS.ERROR_COUNT].includes(metric.name as any)
    ),
    [filteredMetrics]
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Workflow Metrics</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TIME_PERIODS.LAST_5_MINUTES}>Last 5m</SelectItem>
                <SelectItem value={TIME_PERIODS.LAST_15_MINUTES}>Last 15m</SelectItem>
                <SelectItem value={TIME_PERIODS.LAST_HOUR}>Last Hour</SelectItem>
                <SelectItem value={TIME_PERIODS.LAST_DAY}>Last Day</SelectItem>
                <SelectItem value={TIME_PERIODS.LAST_WEEK}>Last Week</SelectItem>
                <SelectItem value={TIME_PERIODS.LAST_MONTH}>Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric) => {
                const change = calculateChange(metric.value, metric.previousValue);
                const changeColor = change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
                
                return (
                  <Card key={metric.name} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600 capitalize">
                        {metric.name.replace(/_/g, ' ')}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend)}
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-2xl font-bold">
                        {formatMetricValue(metric.value, metric.name)}
                      </div>
                      {metric.previousValue && (
                        <div className={`text-sm ${changeColor}`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}% from previous period
                        </div>
                      )}
                    </div>
                    
                    {metric.description && (
                      <p className="text-xs text-gray-500">{metric.description}</p>
                    )}
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Status</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(metric.status)}`}
                        >
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resourceMetrics.map((metric) => {
                const change = calculateChange(metric.value, metric.previousValue);
                const changeColor = change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
                
                return (
                  <Card key={metric.name} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600 capitalize">
                        {metric.name.replace(/_/g, ' ')}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend)}
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-2xl font-bold">
                        {formatMetricValue(metric.value, metric.name)}
                      </div>
                      {metric.previousValue && (
                        <div className={`text-sm ${changeColor}`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}% from previous period
                        </div>
                      )}
                    </div>
                    
                    {metric.description && (
                      <p className="text-xs text-gray-500">{metric.description}</p>
                    )}
                    
                    {/* Progress bar for percentage-based metrics */}
                    {metric.name === ANALYTICS_METRICS.CPU_USAGE || metric.name === ANALYTICS_METRICS.MEMORY_USAGE ? (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Utilization</span>
                          <span>{formatMetricValue(metric.value, metric.name)}</span>
                        </div>
                        <Progress value={metric.value * 100} className="h-2" />
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Status</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(metric.status)}`}
                          >
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Summary section */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {performanceMetrics.filter(m => m.status === 'good').length}
              </div>
              <div className="text-xs text-gray-500">Good</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {performanceMetrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-xs text-gray-500">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {performanceMetrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {performanceMetrics.length}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

