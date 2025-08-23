import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Play, Pause, Square, RotateCcw, RefreshCw, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Zap, Database, Server, Cpu, HardDrive, Network, Bell, BellOff, Filter, Search, Download, Settings, MoreHorizontal, ArrowUp, ArrowDown, Target, Shield, Users, Globe, Calendar, Info, Maximize, Minimize, ExternalLink } from 'lucide-react';

// Hooks and Services
import { useOrchestration } from '../../hooks/useOrchestration';
import { useReporting } from '../../hooks/useReporting';
import { orchestrationAPI } from '../../services/orchestration-apis';

// Types
import {
  ExecutionStatus,
  ExecutionMetrics,
  ExecutionEvent,
  MonitoringAlert,
  PerformanceMetrics,
  ResourceUsage,
  ExecutionLog,
  MonitoringConfiguration,
  AlertConfiguration,
  ExecutionSession,
  MonitoringDashboard,
  RealTimeMetrics,
  ExecutionStatistics,
  SystemHealth
} from '../../types/orchestration.types';

// Constants
import { EXECUTION_STATUS_COLORS, ALERT_SEVERITY_LEVELS, MONITORING_REFRESH_INTERVALS } from '../../constants/ui-constants';

interface ExecutionMonitorProps {
  workspaceId?: string;
  sessionId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showDetailedMetrics?: boolean;
  enableAlerts?: boolean;
  onExecutionSelect?: (execution: ExecutionSession) => void;
  onAlertTriggered?: (alert: MonitoringAlert) => void;
}

const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  workspaceId,
  sessionId,
  autoRefresh = true,
  refreshInterval = 5000,
  showDetailedMetrics = true,
  enableAlerts = true,
  onExecutionSelect,
  onAlertTriggered
}) => {
  // Hooks
  const {
    executions,
    activeExecutions,
    executionMetrics,
    isLoading,
    error,
    getExecutionDetails,
    stopExecution,
    pauseExecution,
    resumeExecution,
    restartExecution,
    getExecutionLogs,
    monitorExecution
  } = useOrchestration();

  const {
    generateReport,
    exportData
  } = useReporting();

  // State Management
  const [selectedExecution, setSelectedExecution] = useState<ExecutionSession | null>(null);
  const [monitoringConfig, setMonitoringConfig] = useState<MonitoringConfiguration>({
    autoRefresh: true,
    refreshInterval: 5000,
    alertsEnabled: true,
    detailedLogging: true,
    performanceTracking: true,
    resourceMonitoring: true
  });
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    totalExecutions: 0,
    activeExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    throughput: 0,
    errorRate: 0,
    systemLoad: 0
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    cpu: { usage: 45, status: 'normal' },
    memory: { usage: 68, status: 'normal' },
    network: { latency: 12, status: 'normal' },
    storage: { usage: 34, status: 'normal' }
  });
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    status: 'all',
    timeRange: '1h',
    ruleType: 'all',
    severity: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [alertsVisible, setAlertsVisible] = useState(true);
  const [logsVisible, setLogsVisible] = useState(true);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const metricsUpdateRef = useRef<NodeJS.Timeout>();

  // Real-time data updates
  useEffect(() => {
    if (autoRefresh && monitoringConfig.autoRefresh) {
      refreshIntervalRef.current = setInterval(async () => {
        try {
          await updateMetrics();
          await updateExecutions();
          await checkForAlerts();
        } catch (error) {
          console.error('Failed to update monitoring data:', error);
        }
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, monitoringConfig.autoRefresh]);

  // Update metrics
  const updateMetrics = useCallback(async () => {
    try {
      const metrics = await orchestrationAPI.getExecutionMetrics();
      const health = await orchestrationAPI.getSystemHealth();
      
      setRealTimeMetrics(metrics);
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }, []);

  // Update executions
  const updateExecutions = useCallback(async () => {
    try {
      const logs = await orchestrationAPI.getExecutionLogs({
        sessionId,
        limit: 100,
        status: filterOptions.status !== 'all' ? filterOptions.status : undefined
      });
      setExecutionLogs(logs);
    } catch (error) {
      console.error('Failed to update executions:', error);
    }
  }, [sessionId, filterOptions.status]);

  // Check for alerts
  const checkForAlerts = useCallback(async () => {
    if (!enableAlerts || !monitoringConfig.alertsEnabled) return;

    try {
      const newAlerts = await orchestrationAPI.getActiveAlerts();
      setAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id));
        
        // Trigger alert callbacks for new alerts
        uniqueNewAlerts.forEach(alert => {
          if (onAlertTriggered) {
            onAlertTriggered(alert);
          }
        });

        return [...prev, ...uniqueNewAlerts].slice(-50); // Keep last 50 alerts
      });
    } catch (error) {
      console.error('Failed to check alerts:', error);
    }
  }, [enableAlerts, monitoringConfig.alertsEnabled, onAlertTriggered]);

  // Filter executions
  const filteredExecutions = useMemo(() => {
    return executionLogs.filter(execution => {
      const matchesSearch = searchTerm === '' || 
        execution.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        execution.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterOptions.status === 'all' || 
        execution.status === filterOptions.status;

      const matchesTimeRange = (() => {
        const now = new Date();
        const executionTime = new Date(execution.startTime);
        const diffHours = (now.getTime() - executionTime.getTime()) / (1000 * 60 * 60);

        switch (filterOptions.timeRange) {
          case '1h': return diffHours <= 1;
          case '6h': return diffHours <= 6;
          case '24h': return diffHours <= 24;
          case '7d': return diffHours <= 24 * 7;
          default: return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesTimeRange;
    });
  }, [executionLogs, searchTerm, filterOptions]);

  // Calculate execution statistics
  const executionStats = useMemo(() => {
    const total = filteredExecutions.length;
    const successful = filteredExecutions.filter(e => e.status === 'completed').length;
    const failed = filteredExecutions.filter(e => e.status === 'failed').length;
    const running = filteredExecutions.filter(e => e.status === 'running').length;
    const pending = filteredExecutions.filter(e => e.status === 'pending').length;

    const avgDuration = filteredExecutions
      .filter(e => e.endTime && e.startTime)
      .reduce((acc, e) => {
        const duration = new Date(e.endTime!).getTime() - new Date(e.startTime).getTime();
        return acc + duration;
      }, 0) / Math.max(successful + failed, 1);

    return {
      total,
      successful,
      failed,
      running,
      pending,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageDuration: avgDuration
    };
  }, [filteredExecutions]);

  // Handle execution actions
  const handleExecutionAction = useCallback(async (
    executionId: string, 
    action: 'stop' | 'pause' | 'resume' | 'restart'
  ) => {
    try {
      switch (action) {
        case 'stop':
          await stopExecution(executionId);
          break;
        case 'pause':
          await pauseExecution(executionId);
          break;
        case 'resume':
          await resumeExecution(executionId);
          break;
        case 'restart':
          await restartExecution(executionId);
          break;
      }
      await updateExecutions();
    } catch (error) {
      console.error(`Failed to ${action} execution:`, error);
    }
  }, [stopExecution, pauseExecution, resumeExecution, restartExecution, updateExecutions]);

  // Handle execution selection
  const handleExecutionSelect = useCallback((execution: ExecutionLog) => {
    const executionSession: ExecutionSession = {
      id: execution.id,
      ruleName: execution.ruleName,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.duration,
      metrics: execution.metrics,
      logs: execution.logs || []
    };
    
    setSelectedExecution(executionSession);
    if (onExecutionSelect) {
      onExecutionSelect(executionSession);
    }
  }, [onExecutionSelect]);

  // Export monitoring data
  const handleExportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const data = {
        executions: filteredExecutions,
        metrics: realTimeMetrics,
        alerts: alerts,
        systemHealth: systemHealth,
        exportTime: new Date().toISOString()
      };

      await exportData(data, `execution-monitor-${Date.now()}`, format);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }, [filteredExecutions, realTimeMetrics, alerts, systemHealth, exportData]);

  // Render status badge
  const renderStatusBadge = (status: ExecutionStatus) => {
    const config = EXECUTION_STATUS_COLORS[status] || { color: 'gray', label: 'Unknown' };
    return (
      <Badge variant={config.color as any} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  // Render metric card
  const renderMetricCard = (
    title: string,
    value: number | string,
    icon: React.ComponentType<{ className?: string }>,
    trend?: 'up' | 'down' | 'stable',
    trendValue?: number
  ) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600">{title}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                 trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                {trendValue > 0 ? '+' : ''}{trendValue}%
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            {React.createElement(icon, { className: 'w-6 h-6 text-blue-600' })}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render system health indicator
  const renderSystemHealthIndicator = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Status</span>
            <Badge variant={systemHealth.overall === 'healthy' ? 'success' : 
                           systemHealth.overall === 'warning' ? 'warning' : 'destructive'}>
              {systemHealth.overall}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span className="text-sm">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{systemHealth.cpu.usage}%</span>
                <Progress value={systemHealth.cpu.usage} className="w-16" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm">HardDrive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{systemHealth.memory.usage}%</span>
                <Progress value={systemHealth.memory.usage} className="w-16" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span className="text-sm">Network</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{systemHealth.network.latency}ms</span>
                <Badge variant={systemHealth.network.status === 'normal' ? 'success' : 'warning'} className="text-xs">
                  {systemHealth.network.status}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-sm">Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{systemHealth.storage.usage}%</span>
                <Progress value={systemHealth.storage.usage} className="w-16" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render alerts panel
  const renderAlertsPanel = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Active Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAlertsVisible(!alertsVisible)}
          >
            {alertsVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {alertsVisible && (
        <CardContent>
          <ScrollArea className="h-48">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                    <AlertDescription className="text-xs">
                      {alert.description}
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Execution Monitor
          </h2>
          <p className="text-gray-600">Real-time monitoring and analytics for rule executions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonitoringConfig(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                >
                  {monitoringConfig.autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {monitoringConfig.autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm" onClick={updateMetrics}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Select value={filterOptions.timeRange} onValueChange={(value) => 
            setFilterOptions(prev => ({ ...prev, timeRange: value }))
          }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={() => handleExportData('csv')}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          'Total Executions',
          realTimeMetrics.totalExecutions,
          Target,
          'up',
          12
        )}
        {renderMetricCard(
          'Active Executions',
          realTimeMetrics.activeExecutions,
          Activity,
          'stable'
        )}
        {renderMetricCard(
          'Success Rate',
          `${executionStats.successRate.toFixed(1)}%`,
          CheckCircle,
          'up',
          5.2
        )}
        {renderMetricCard(
          'Avg Duration',
          `${(executionStats.averageDuration / 1000).toFixed(1)}s`,
          Clock,
          'down',
          -8.3
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Successful</span>
                        </div>
                        <span className="font-medium">{executionStats.successful}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Failed</span>
                        </div>
                        <span className="font-medium">{executionStats.failed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Running</span>
                        </div>
                        <span className="font-medium">{executionStats.running}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Pending</span>
                        </div>
                        <span className="font-medium">{executionStats.pending}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Throughput</span>
                          <span>{realTimeMetrics.throughput} exec/min</span>
                        </div>
                        <Progress value={realTimeMetrics.throughput} max={100} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Error Rate</span>
                          <span>{realTimeMetrics.errorRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={realTimeMetrics.errorRate} max={10} className="bg-red-100" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>System Load</span>
                          <span>{realTimeMetrics.systemLoad}%</span>
                        </div>
                        <Progress value={realTimeMetrics.systemLoad} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="executions" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <Input
                        placeholder="Search executions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    
                    <Select value={filterOptions.status} onValueChange={(value) =>
                      setFilterOptions(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Executions Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExecutions.map((execution) => (
                        <TableRow 
                          key={execution.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleExecutionSelect(execution)}
                        >
                          <TableCell className="font-medium">
                            {execution.ruleName}
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(execution.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(execution.startTime).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {execution.duration ? `${(execution.duration / 1000).toFixed(1)}s` : '-'}
                          </TableCell>
                          <TableCell>
                            <Progress value={execution.progress || 0} className="w-20" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {execution.status === 'running' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExecutionAction(execution.id, 'pause');
                                    }}
                                  >
                                    <Pause className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExecutionAction(execution.id, 'stop');
                                    }}
                                  >
                                    <Square className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {execution.status === 'paused' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExecutionAction(execution.id, 'resume');
                                  }}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                              {(execution.status === 'failed' || execution.status === 'completed') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExecutionAction(execution.id, 'restart');
                                  }}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSystemHealthIndicator()}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Execution Threads</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">12/16</span>
                          <Progress value={75} className="w-20" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">HardDrive Pool</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">2.1/4.0 GB</span>
                          <Progress value={52.5} className="w-20" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Queue Size</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">142</span>
                          <Badge variant="outline">Normal</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Execution Logs</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogsVisible(!logsVisible)}
                    >
                      {logsVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {logsVisible && (
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2 font-mono text-sm">
                        {executionLogs.map((log) => (
                          <div key={log.id} className="p-2 bg-gray-50 rounded border-l-4 border-blue-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{log.ruleName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(log.startTime).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {log.logs && log.logs.length > 0 ? log.logs.join('\n') : 'No detailed logs available'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {renderAlertsPanel()}

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <Switch
                  id="auto-refresh"
                  checked={monitoringConfig.autoRefresh}
                  onCheckedChange={(checked) =>
                    setMonitoringConfig(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="alerts-enabled">Alerts Enabled</Label>
                <Switch
                  id="alerts-enabled"
                  checked={monitoringConfig.alertsEnabled}
                  onCheckedChange={(checked) =>
                    setMonitoringConfig(prev => ({ ...prev, alertsEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="detailed-logging">Detailed Logging</Label>
                <Switch
                  id="detailed-logging"
                  checked={monitoringConfig.detailedLogging}
                  onCheckedChange={(checked) =>
                    setMonitoringConfig(prev => ({ ...prev, detailedLogging: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="refresh-interval">Refresh Interval</Label>
                <Select
                  value={monitoringConfig.refreshInterval.toString()}
                  onValueChange={(value) =>
                    setMonitoringConfig(prev => ({ ...prev, refreshInterval: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1 second</SelectItem>
                    <SelectItem value="5000">5 seconds</SelectItem>
                    <SelectItem value="10000">10 seconds</SelectItem>
                    <SelectItem value="30000">30 seconds</SelectItem>
                    <SelectItem value="60000">1 minute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Execution Details Modal */}
      {selectedExecution && (
        <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Execution Details: {selectedExecution.ruleName}
              </DialogTitle>
              <DialogDescription>
                Detailed information and logs for execution {selectedExecution.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {renderStatusBadge(selectedExecution.status)}
                  </div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <div className="mt-1 font-mono">
                    {selectedExecution.duration 
                      ? `${(selectedExecution.duration / 1000).toFixed(2)}s`
                      : 'In progress...'}
                  </div>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <div className="mt-1 font-mono">
                    {new Date(selectedExecution.startTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label>End Time</Label>
                  <div className="mt-1 font-mono">
                    {selectedExecution.endTime 
                      ? new Date(selectedExecution.endTime).toLocaleString()
                      : 'Not finished'}
                  </div>
                </div>
              </div>

              {selectedExecution.metrics && (
                <div>
                  <Label>Metrics</Label>
                  <Card className="mt-1">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Records Processed</div>
                          <div className="font-medium">{selectedExecution.metrics.recordsProcessed || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Matches Found</div>
                          <div className="font-medium">{selectedExecution.metrics.matchesFound || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Errors</div>
                          <div className="font-medium">{selectedExecution.metrics.errors || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div>
                <Label>Execution Logs</Label>
                <Card className="mt-1">
                  <CardContent className="p-0">
                    <ScrollArea className="h-64">
                      <div className="p-4 font-mono text-sm space-y-1">
                        {selectedExecution.logs && selectedExecution.logs.length > 0 ? (
                          selectedExecution.logs.map((log, index) => (
                            <div key={index} className="text-gray-800">
                              {log}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No detailed logs available</div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExecutionMonitor;