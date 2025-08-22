"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Shield,
  RotateCcw,
  ArrowRight,
  Download,
  Filter,
  Calendar,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/usePermissionCheck';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RecoveryAnalyticsData {
  timeSeries: TimeSeriesPoint[];
  failureTypes: FailureTypeData[];
  recoveryStrategies: StrategyData[];
  performanceMetrics: PerformanceMetric[];
  trends: TrendData[];
  anomalies: AnomalyData[];
}

interface TimeSeriesPoint {
  timestamp: string;
  failures: number;
  recoveries: number;
  successRate: number;
  averageTime: number;
}

interface FailureTypeData {
  type: string;
  count: number;
  percentage: number;
  averageRecoveryTime: number;
  successRate: number;
}

interface StrategyData {
  strategy: string;
  usage: number;
  successRate: number;
  averageTime: number;
  efficiency: number;
}

interface PerformanceMetric {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrendData {
  period: string;
  failures: number;
  recoveries: number;
  successRate: number;
  averageTime: number;
}

interface AnomalyData {
  id: string;
  type: 'spike' | 'drop' | 'pattern' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  impact: string;
  recommendations: string[];
}

interface FailureRecoveryAnalyticsProps {
  data?: RecoveryAnalyticsData;
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: string) => void;
  onExportData?: (format: 'json' | 'csv' | 'pdf') => void;
  enableRealTime?: boolean;
  refreshInterval?: number;
}

export const FailureRecoveryAnalytics: React.FC<FailureRecoveryAnalyticsProps> = ({
  data,
  timeRange = '24h',
  onTimeRangeChange,
  onExportData,
  enableRealTime = true,
  refreshInterval = 30000
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(enableRealTime);
  const { toast } = useToast();
  const { hasPermission } = usePermissionCheck();

  const canViewAnalytics = hasPermission({ action: 'read', resource: 'analytics' });
  const canExportData = hasPermission({ action: 'export', resource: 'analytics' });

  // Mock data for demonstration
  const mockData: RecoveryAnalyticsData = useMemo(() => ({
    timeSeries: [
      { timestamp: '00:00', failures: 12, recoveries: 10, successRate: 83.3, averageTime: 45 },
      { timestamp: '04:00', failures: 8, recoveries: 7, successRate: 87.5, averageTime: 38 },
      { timestamp: '08:00', failures: 15, recoveries: 13, successRate: 86.7, averageTime: 52 },
      { timestamp: '12:00', failures: 22, recoveries: 19, successRate: 86.4, averageTime: 48 },
      { timestamp: '16:00', failures: 18, recoveries: 16, successRate: 88.9, averageTime: 41 },
      { timestamp: '20:00', failures: 14, recoveries: 12, successRate: 85.7, averageTime: 44 }
    ],
    failureTypes: [
      { type: 'timeout', count: 45, percentage: 35.7, averageRecoveryTime: 52, successRate: 82.2 },
      { type: 'error', count: 38, percentage: 30.2, averageRecoveryTime: 38, successRate: 89.5 },
      { type: 'resource', count: 25, percentage: 19.8, averageRecoveryTime: 65, successRate: 76.0 },
      { type: 'dependency', count: 12, percentage: 9.5, averageRecoveryTime: 78, successRate: 66.7 },
      { type: 'system', count: 6, percentage: 4.8, averageRecoveryTime: 120, successRate: 50.0 }
    ],
    recoveryStrategies: [
      { strategy: 'Auto Retry', usage: 65, successRate: 88.5, averageTime: 42, efficiency: 92 },
      { strategy: 'Fallback', usage: 20, successRate: 75.0, averageTime: 78, efficiency: 78 },
      { strategy: 'Manual Intervention', usage: 10, successRate: 95.0, averageTime: 180, efficiency: 85 },
      { strategy: 'Escalation', usage: 5, successRate: 60.0, averageTime: 240, efficiency: 70 }
    ],
    performanceMetrics: [
      { metric: 'Overall Success Rate', current: 86.5, previous: 84.2, change: 2.3, trend: 'up' },
      { metric: 'Average Recovery Time', current: 58, previous: 62, change: -4, trend: 'down' },
      { metric: 'Failure Frequency', current: 18.2, previous: 19.8, change: -1.6, trend: 'down' },
      { metric: 'System Uptime', current: 99.2, previous: 98.9, change: 0.3, trend: 'up' }
    ],
    trends: [
      { period: 'Week 1', failures: 125, recoveries: 108, successRate: 86.4, averageTime: 62 },
      { period: 'Week 2', failures: 118, recoveries: 102, successRate: 86.4, averageTime: 59 },
      { period: 'Week 3', failures: 132, recoveries: 115, successRate: 87.1, averageTime: 56 },
      { period: 'Week 4', failures: 126, recoveries: 110, successRate: 87.3, averageTime: 58 }
    ],
    anomalies: [
      {
        id: '1',
        type: 'spike',
        severity: 'high',
        description: 'Unusual spike in timeout failures at 14:00',
        timestamp: '2024-01-15 14:00',
        impact: 'Increased recovery time by 40%',
        recommendations: ['Check network latency', 'Review timeout configurations', 'Monitor resource usage']
      },
      {
        id: '2',
        type: 'pattern',
        severity: 'medium',
        description: 'Recurring resource failures every 6 hours',
        timestamp: '2024-01-15 12:00',
        impact: 'Predictable failure pattern detected',
        recommendations: ['Implement proactive resource scaling', 'Schedule maintenance windows', 'Optimize resource allocation']
      }
    ]
  }), []);

  const analyticsData = data || mockData;

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalFailures = analyticsData.failureTypes.reduce((sum, type) => sum + type.count, 0);
    const totalRecoveries = analyticsData.failureTypes.reduce((sum, type) => sum + (type.count * type.successRate / 100), 0);
    const overallSuccessRate = totalFailures > 0 ? (totalRecoveries / totalFailures) * 100 : 0;
    const averageRecoveryTime = analyticsData.failureTypes.reduce((sum, type) => sum + type.averageRecoveryTime, 0) / analyticsData.failureTypes.length;

    return {
      totalFailures,
      totalRecoveries: Math.round(totalRecoveries),
      overallSuccessRate: Math.round(overallSuccessRate * 10) / 10,
      averageRecoveryTime: Math.round(averageRecoveryTime)
    };
  }, [analyticsData]);

  // Get trend indicator
  const getTrendIndicator = useCallback((trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 text-gray-400">—</div>;
    }
  }, []);

  // Get severity color
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Get anomaly type color
  const getAnomalyTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'spike':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'drop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pattern':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'outlier':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: string) => {
    onTimeRangeChange?.(range);
    toast({
      title: "Time Range Updated",
      description: `Analytics time range changed to ${range}.`,
      variant: "default"
    });
  }, [onTimeRangeChange, toast]);

  // Handle export
  const handleExport = useCallback((format: 'json' | 'csv' | 'pdf') => {
    if (!canExportData) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to export analytics data.",
        variant: "destructive"
      });
      return;
    }

    onExportData?.(format);
    
    toast({
      title: "Data Exported",
      description: `Analytics data exported in ${format.toUpperCase()} format.`,
      variant: "default"
    });
  }, [canExportData, onExportData, toast]);

  // Refresh data
  const refreshData = useCallback(() => {
    setLastRefresh(new Date());
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been refreshed.",
      variant: "default"
    });
  }, [toast]);

  // Toggle auto refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
    toast({
      title: "Auto Refresh Updated",
      description: `Auto refresh has been ${!autoRefresh ? 'enabled' : 'disabled'}.`,
      variant: "default"
    });
  }, [autoRefresh, toast]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  if (!canViewAnalytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to view failure recovery analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Failure Recovery Analytics</h2>
          <p className="text-muted-foreground">
            Analyze failure patterns, recovery performance, and system trends
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="w-4 h-4 mr-1" />
            {showAdvanced ? 'Hide' : 'Show'} Filters
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            {autoRefresh ? <Activity className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
            Auto {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          {canExportData && (
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Time Range</label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Metric Focus</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Metrics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    <SelectItem value="success-rate">Success Rate</SelectItem>
                    <SelectItem value="recovery-time">Recovery Time</SelectItem>
                    <SelectItem value="failure-frequency">Failure Frequency</SelectItem>
                    <SelectItem value="system-uptime">System Uptime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Failures</p>
                <p className="text-2xl font-bold">{summaryStats.totalFailures}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recoveries</p>
                <p className="text-2xl font-bold">{summaryStats.totalRecoveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{summaryStats.overallSuccessRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Recovery Time</p>
                <p className="text-2xl font-bold">{summaryStats.averageRecoveryTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.performanceMetrics.map((metric) => (
              <div key={metric.metric} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{metric.metric}</h4>
                  {getTrendIndicator(metric.trend)}
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{metric.current}</span>
                  <span className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Previous: {metric.previous}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="failure-types">Failure Types</TabsTrigger>
          <TabsTrigger value="strategies">Recovery Strategies</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="failures" stroke="#ef4444" name="Failures" />
                  <Line yAxisId="left" type="monotone" dataKey="recoveries" stroke="#22c55e" name="Recoveries" />
                  <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#3b82f6" name="Success Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Failure Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.failureTypes.slice(0, 3).map((type) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium capitalize">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{type.count}</div>
                        <div className="text-xs text-muted-foreground">{type.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Strategy Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.recoveryStrategies.slice(0, 3).map((strategy) => (
                    <div key={strategy.strategy} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{strategy.strategy}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{strategy.successRate}%</div>
                        <div className="text-xs text-muted-foreground">{strategy.averageTime}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="failures" fill="#ef4444" name="Failures" />
                  <Bar dataKey="recoveries" fill="#22c55e" name="Recoveries" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failure-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failure Type Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Distribution by Type</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={analyticsData.failureTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.failureTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Performance by Type</h4>
                  <div className="space-y-3">
                    {analyticsData.failureTypes.map((type) => (
                      <div key={type.type} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{type.type}</span>
                          <Badge variant="outline">{type.count} failures</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="ml-2 font-medium">{type.successRate}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Time:</span>
                            <span className="ml-2 font-medium">{type.averageRecoveryTime}s</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Strategy Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recoveryStrategies.map((strategy) => (
                  <div key={strategy.strategy} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">{strategy.strategy}</h4>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">Usage: {strategy.usage}%</Badge>
                        <Badge variant="outline">Efficiency: {strategy.efficiency}%</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{strategy.successRate}%</div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{strategy.averageTime}s</div>
                        <div className="text-sm text-muted-foreground">Avg Recovery Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{strategy.efficiency}%</div>
                        <div className="text-sm text-muted-foreground">Efficiency Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.anomalies.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={`border ${getAnomalyTypeColor(anomaly.type)}`}>
                            {anomaly.type}
                          </Badge>
                          <Badge className={`border ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{anomaly.timestamp}</span>
                      </div>
                      
                      <h4 className="font-semibold mb-2">{anomaly.description}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Impact:</strong> {anomaly.impact}
                      </p>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Recommendations:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {anomaly.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p className="text-lg mb-2">No anomalies detected</p>
                  <p className="text-sm">The system is operating within normal parameters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

