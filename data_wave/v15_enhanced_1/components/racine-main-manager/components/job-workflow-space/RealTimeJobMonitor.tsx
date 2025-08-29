'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Play, Pause, Square, RotateCcw, Clock, Zap, TrendingUp, BarChart3, PieChart, LineChart, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, Filter, Search, Download, RefreshCw, Settings, Monitor, Server, Cpu, HardDrive, Network, Database, Users, Shield, Brain, Layers, Route, Target, MoreHorizontal, X, Bell, BellOff, Maximize2, Minimize2, Volume2, VolumeX, Wifi, WifiOff, FileText } from 'lucide-react';

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
import { LineChart, BarChart, AreaChart, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, Line, Bar, Area, Pie, Cell } from 'recharts';

// Racine System Imports
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types from racine-core.types
import { 
  JobExecution,
  ExecutionStatus,
  ExecutionMetrics,
  PerformanceMetrics,
  ResourceUsage,
  ExecutionLog,
  AlertConfig,
  MonitoringDashboard,
  ExecutionTimeline,
  SystemHealth,
  CrossSPAMetrics,
  AIInsights,
  ExecutionAlert,
  WorkflowStep,
  ExecutionContext,
  MetricThreshold,
  NotificationConfig
} from '../../types/racine-core.types';

// Execution Status Configuration
const EXECUTION_STATUS_CONFIG = {
  pending: { color: '#6b7280', bgColor: '#f9fafb', icon: Clock, label: 'Pending' },
  queued: { color: '#3b82f6', bgColor: '#dbeafe', icon: Clock, label: 'Queued' },
  initializing: { color: '#8b5cf6', bgColor: '#ede9fe', icon: RefreshCw, label: 'Initializing' },
  running: { color: '#10b981', bgColor: '#d1fae5', icon: Play, label: 'Running' },
  paused: { color: '#f59e0b', bgColor: '#fef3c7', icon: Pause, label: 'Paused' },
  completed: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle, label: 'Completed' },
  failed: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle, label: 'Failed' },
  cancelled: { color: '#6b7280', bgColor: '#f3f4f6', icon: Square, label: 'Cancelled' },
  timeout: { color: '#f59e0b', bgColor: '#fef3c7', icon: AlertTriangle, label: 'Timeout' },
  retrying: { color: '#8b5cf6', bgColor: '#ede9fe', icon: RotateCcw, label: 'Retrying' }
};

// Resource monitoring colors
const RESOURCE_COLORS = {
  CPU: '#3b82f6',
  MEMORY: '#10b981', 
  STORAGE: '#f59e0b',
  NETWORK: '#8b5cf6',
  DATABASE: '#ef4444'
};

interface RealTimeJobMonitorProps {
  workflowId?: string;
  executionId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showAdvancedMetrics?: boolean;
  showCrossSPAMetrics?: boolean;
  alertsEnabled?: boolean;
  className?: string;
}

const RealTimeJobMonitor: React.FC<RealTimeJobMonitorProps> = ({
  workflowId,
  executionId,
  autoRefresh = true,
  refreshInterval = 2000,
  showAdvancedMetrics = true,
  showCrossSPAMetrics = true,
  alertsEnabled = true,
  className = ''
}) => {
  // Hooks for Backend Integration
  const { 
    getExecutionStatus,
    getExecutionMetrics,
    getExecutionLogs,
    pauseExecution,
    resumeExecution,
    cancelExecution,
    restartExecution,
    getPerformanceProfile,
    getExecutionSteps,
    updateExecutionPriority
  } = useJobWorkflow();
  
  const { 
    getSystemHealth,
    getResourceUsage,
    getExecutionTimeline,
    getCrossSPAMetrics,
    getSystemAlerts,
    acknowledgeAlert
  } = useRacineOrchestration();
  
  const { 
    getWorkflowExecutionStatus,
    getCrossGroupPerformance,
    getResourceAvailability,
    getSPAHealthStatus
  } = useCrossGroupIntegration();
  
  const { getCurrentUser } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    analyzeExecutionPerformance,
    detectExecutionAnomalies,
    getOptimizationRecommendations,
    predictExecutionTime,
    suggestResourceOptimization
  } = useAIAssistant();

  // Core State Management
  const [currentExecution, setCurrentExecution] = useState<JobExecution | null>(null);
  const [executionMetrics, setExecutionMetrics] = useState<ExecutionMetrics | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [crossSPAMetrics, setCrossSPAMetrics] = useState<CrossSPAMetrics | null>(null);
  const [executionTimeline, setExecutionTimeline] = useState<ExecutionTimeline[]>([]);
  const [executionSteps, setExecutionSteps] = useState<WorkflowStep[]>([]);
  const [alerts, setAlerts] = useState<ExecutionAlert[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);

  // UI State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [logFilter, setLogFilter] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['cpu', 'memory', 'throughput']);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Monitoring State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);

  // Performance State
  const [isLoading, setIsLoading] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const metricsChartRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket Connection Management
  const connectWebSocket = useCallback(() => {
    if (!executionId || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/execution/${executionId}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected for execution monitoring');
        setConnectionStatus('connected');
        setIsMonitoring(true);
        setReconnectAttempts(0);
        
        // Send initial subscription
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['execution_status', 'performance_metrics', 'logs', 'alerts', 'system_health']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const timestamp = new Date();
          
          switch (data.type) {
            case 'execution_status':
              setCurrentExecution(prev => ({ ...prev, ...data.payload }));
              break;
              
            case 'execution_metrics':
              setExecutionMetrics(data.payload);
              break;
              
            case 'performance_update':
              setPerformanceHistory(prev => {
                const newHistory = [...prev, { ...data.payload, timestamp: timestamp.toISOString() }];
                return newHistory.slice(-100); // Keep last 100 points
              });
              break;
              
            case 'resource_usage':
              setResourceUsage(data.payload);
              break;
              
            case 'execution_log':
              setExecutionLogs(prev => {
                const newLogs = [...prev, data.payload];
                return newLogs.slice(-1000); // Keep last 1000 logs
              });
              break;
              
            case 'system_health':
              setSystemHealth(data.payload);
              break;
              
            case 'cross_spa_metrics':
              setCrossSPAMetrics(data.payload);
              break;
              
            case 'execution_timeline':
              setExecutionTimeline(prev => [...prev, data.payload]);
              break;
              
            case 'execution_alert':
              const newAlert = data.payload;
              setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
              
              // Play sound for critical alerts
              if (soundEnabled && newAlert.severity === 'critical' && audioRef.current) {
                audioRef.current.play().catch(console.error);
              }
              break;
              
            case 'ai_insights':
              setAIInsights(data.payload);
              break;
              
            case 'execution_steps':
              setExecutionSteps(data.payload);
              break;
          }
          
          setLastUpdate(timestamp);
          setUpdateCount(prev => prev + 1);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        setIsMonitoring(false);
        
        // Attempt reconnection if not manually closed and within retry limit
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts && isRealTimeMode) {
          setReconnectAttempts(prev => prev + 1);
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Attempting reconnection ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  }, [executionId, isRealTimeMode, reconnectAttempts, maxReconnectAttempts, soundEnabled]);

  // Load Initial Data
  const loadExecutionData = useCallback(async () => {
    if (!executionId) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Parallel data loading for better performance
      const [
        execution,
        metrics,
        logs,
        health,
        timeline,
        steps,
        systemAlerts,
        crossMetrics,
        resources
      ] = await Promise.all([
        getExecutionStatus(executionId),
        getExecutionMetrics(executionId),
        getExecutionLogs(executionId, { limit: 200, level: logLevel }),
        getSystemHealth(),
        getExecutionTimeline(executionId),
        getExecutionSteps(executionId),
        getSystemAlerts({ execution_id: executionId }),
        showCrossSPAMetrics ? getCrossSPAMetrics(executionId) : null,
        getResourceUsage()
      ]);

      // Update state
      setCurrentExecution(execution);
      setExecutionMetrics(metrics);
      setExecutionLogs(logs);
      setSystemHealth(health);
      setExecutionTimeline(timeline);
      setExecutionSteps(steps);
      setAlerts(systemAlerts);
      if (crossMetrics) setCrossSPAMetrics(crossMetrics);
      setResourceUsage(resources);

      // Load AI insights
      const insights = await analyzeExecutionPerformance(executionId);
      setAIInsights(insights);

      // Track performance
      const loadTime = Date.now() - startTime;
      setAverageResponseTime(prev => prev === 0 ? loadTime : (prev + loadTime) / 2);

      // Track activity
      trackActivity({
        action: 'execution_data_loaded',
        resource_type: 'job_execution',
        resource_id: executionId,
        details: {
          load_time: loadTime,
          data_points: logs.length,
          timeline_events: timeline.length
        }
      });

    } catch (error) {
      console.error('❌ Failed to load execution data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    executionId, logLevel, showCrossSPAMetrics, getExecutionStatus, getExecutionMetrics,
    getExecutionLogs, getSystemHealth, getExecutionTimeline, getExecutionSteps,
    getSystemAlerts, getCrossSPAMetrics, getResourceUsage, analyzeExecutionPerformance,
    trackActivity
  ]);

  // Execution Control Actions
  const handlePauseExecution = useCallback(async () => {
    if (!executionId) return;
    
    try {
      await pauseExecution(executionId);
      trackActivity({
        action: 'execution_paused',
        resource_type: 'job_execution',
        resource_id: executionId,
        details: { paused_by: getCurrentUser()?.id }
      });
    } catch (error) {
      console.error('❌ Failed to pause execution:', error);
    }
  }, [executionId, pauseExecution, trackActivity, getCurrentUser]);

  const handleResumeExecution = useCallback(async () => {
    if (!executionId) return;
    
    try {
      await resumeExecution(executionId);
      trackActivity({
        action: 'execution_resumed',
        resource_type: 'job_execution',
        resource_id: executionId,
        details: { resumed_by: getCurrentUser()?.id }
      });
    } catch (error) {
      console.error('❌ Failed to resume execution:', error);
    }
  }, [executionId, resumeExecution, trackActivity, getCurrentUser]);

  const handleCancelExecution = useCallback(async () => {
    if (!executionId) return;
    
    try {
      await cancelExecution(executionId);
      trackActivity({
        action: 'execution_cancelled',
        resource_type: 'job_execution',
        resource_id: executionId,
        details: { cancelled_by: getCurrentUser()?.id }
      });
    } catch (error) {
      console.error('❌ Failed to cancel execution:', error);
    }
  }, [executionId, cancelExecution, trackActivity, getCurrentUser]);

  const handleRestartExecution = useCallback(async () => {
    if (!executionId) return;
    
    try {
      await restartExecution(executionId);
      trackActivity({
        action: 'execution_restarted',
        resource_type: 'job_execution',
        resource_id: executionId,
        details: { restarted_by: getCurrentUser()?.id }
      });
    } catch (error) {
      console.error('❌ Failed to restart execution:', error);
    }
  }, [executionId, restartExecution, trackActivity, getCurrentUser]);

  // Overview Panel with Advanced Metrics
  const renderOverviewPanel = () => {
    const statusConfig = currentExecution ? 
      EXECUTION_STATUS_CONFIG[currentExecution.status as keyof typeof EXECUTION_STATUS_CONFIG] : 
      EXECUTION_STATUS_CONFIG.pending;

    return (
      <div className="space-y-6">
        {/* Execution Status Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center space-x-3">
                <div className="relative">
                  <div 
                    className="p-3 rounded-xl shadow-lg"
                    style={{ backgroundColor: statusConfig.bgColor }}
                  >
                    <statusConfig.icon 
                      className="h-8 w-8" 
                      style={{ color: statusConfig.color }}
                    />
                  </div>
                  {isRealTimeMode && connectionStatus === 'connected' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold capitalize">{statusConfig.label}</h2>
                  <p className="text-sm text-gray-500 font-normal">
                    {currentExecution?.started_at ? 
                      `Started: ${new Date(currentExecution.started_at).toLocaleString()}` :
                      'Waiting to start'
                    }
                  </p>
                </div>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                {/* Execution Controls */}
                {currentExecution?.status === 'running' && (
                  <>
                    <Button onClick={handlePauseExecution} variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                    <Button onClick={handleCancelExecution} variant="destructive" size="sm">
                      <Square className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                
                {currentExecution?.status === 'paused' && (
                  <Button onClick={handleResumeExecution} variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                
                {['failed', 'cancelled', 'completed'].includes(currentExecution?.status || '') && (
                  <Button onClick={handleRestartExecution} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restart
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {currentExecution ? (
              <div className="space-y-6">
                {/* Progress Bar */}
                {currentExecution.progress !== undefined && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Overall Progress</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {Math.round(currentExecution.progress)}%
                        </span>
                        {currentExecution.estimated_completion && (
                          <span className="text-xs text-gray-500">
                            ETA: {new Date(currentExecution.estimated_completion).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={currentExecution.progress} className="h-3" />
                    {currentExecution.current_step && (
                      <p className="text-sm text-gray-600">
                        Current: {currentExecution.current_step}
                      </p>
                    )}
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {currentExecution.completed_steps || 0}
                      </div>
                      <div className="text-sm text-blue-700 font-medium">Completed Steps</div>
                      <div className="text-xs text-blue-500">
                        of {currentExecution.total_steps || 0}
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {currentExecution.duration ? 
                          `${Math.floor(currentExecution.duration / 60)}:${String(currentExecution.duration % 60).padStart(2, '0')}` : 
                          '0:00'
                        }
                      </div>
                      <div className="text-sm text-green-700 font-medium">Duration</div>
                      <div className="text-xs text-green-500">mm:ss</div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {currentExecution.parallel_workers || 1}
                      </div>
                      <div className="text-sm text-orange-700 font-medium">Workers</div>
                      <div className="text-xs text-orange-500">parallel</div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {executionMetrics?.throughput || 0}
                      </div>
                      <div className="text-sm text-purple-700 font-medium">Throughput</div>
                      <div className="text-xs text-purple-500">ops/sec</div>
                    </div>
                  </Card>
                </div>

                {/* Execution Steps Timeline */}
                {executionSteps.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Execution Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {executionSteps.map((step, index) => {
                          const isActive = currentExecution.current_step === step.name;
                          const isCompleted = step.status === 'completed';
                          const isFailed = step.status === 'failed';
                          
                          return (
                            <motion.div
                              key={step.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                isActive ? 'border-blue-500 bg-blue-50' :
                                isCompleted ? 'border-green-200 bg-green-50' :
                                isFailed ? 'border-red-200 bg-red-50' :
                                'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : isFailed ? (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                ) : isActive ? (
                                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                                ) : (
                                  <div className="w-3 h-3 bg-gray-300 rounded-full" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">{step.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {step.operation}
                                    </Badge>
                                    {step.duration && (
                                      <span className="text-xs text-gray-500">
                                        {step.duration}s
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {step.progress !== undefined && step.progress > 0 && (
                                  <Progress value={step.progress} className="mt-2 h-1" />
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No Execution Data</h3>
                <p className="text-gray-400">Start monitoring an execution to see real-time data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics Chart */}
        {performanceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">Last 5 min</SelectItem>
                      <SelectItem value="15m">Last 15 min</SelectItem>
                      <SelectItem value="1h">Last hour</SelectItem>
                      <SelectItem value="6h">Last 6 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceHistory.slice(-50)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
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
                    <Area 
                      type="monotone" 
                      dataKey="cpu_usage" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="CPU %"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memory_usage" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="HardDrive %"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="throughput" 
                      stackId="2" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.6}
                      name="Throughput"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Health Dashboard */}
        {systemHealth && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(RESOURCE_COLORS).map(([resource, color]) => {
                  const value = systemHealth[resource.toLowerCase() as keyof SystemHealth] as number || 0;
                  const isHealthy = value < 80;
                  
                  return (
                    <div key={resource} className="text-center">
                      <div className="relative mb-3">
                        <div 
                          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: `${color}20`,
                            border: `2px solid ${isHealthy ? color : '#ef4444'}`
                          }}
                        >
                          <span 
                            className="text-lg font-bold"
                            style={{ color: isHealthy ? color : '#ef4444' }}
                          >
                            {Math.round(value)}%
                          </span>
                        </div>
                        {!isHealthy && (
                          <AlertTriangle className="absolute -top-1 -right-1 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm">{resource}</h4>
                      <Progress value={value} className="mt-2 h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights Panel */}
        {aiInsights && (
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-lg flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {aiInsights.anomalies && aiInsights.anomalies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Anomalies Detected ({aiInsights.anomalies.length})
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.anomalies.slice(0, 3).map((anomaly, index) => (
                        <Alert key={index} className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="font-medium">{anomaly.type}</div>
                            <div className="text-sm mt-1">{anomaly.description}</div>
                            {anomaly.severity && (
                              <Badge variant="destructive" className="mt-2">
                                {anomaly.severity}
                              </Badge>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
                
                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-1" />
                      Optimization Recommendations ({aiInsights.recommendations.length})
                    </h4>
                    <div className="space-y-3">
                      {aiInsights.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-blue-900">{rec.title}</h5>
                              <p className="text-sm text-blue-700 mt-1">{rec.description}</p>
                              {rec.estimated_improvement && (
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-blue-600">
                                    +{rec.estimated_improvement}% improvement
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline" className="ml-3">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {aiInsights.predictions && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      Predictions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aiInsights.predictions.completion_time && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-700">Estimated Completion</div>
                          <div className="font-medium text-green-900">
                            {new Date(aiInsights.predictions.completion_time).toLocaleString()}
                          </div>
                        </div>
                      )}
                      {aiInsights.predictions.resource_peak && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="text-sm text-orange-700">Resource Peak</div>
                          <div className="font-medium text-orange-900">
                            {aiInsights.predictions.resource_peak}% at {
                              new Date(aiInsights.predictions.peak_time || Date.now()).toLocaleTimeString()
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Effects
  useEffect(() => {
    loadExecutionData();
  }, [loadExecutionData]);

  useEffect(() => {
    if (isRealTimeMode && executionId) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket, isRealTimeMode, executionId]);

  useEffect(() => {
    // Auto-scroll logs to bottom in real-time mode
    if (logsEndRef.current && isRealTimeMode && executionLogs.length > 0) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLogs, isRealTimeMode]);

  // Auto-refresh fallback when WebSocket is not available
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefresh && !isRealTimeMode && executionId && connectionStatus !== 'connected') {
      intervalId = setInterval(() => {
        loadExecutionData();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, isRealTimeMode, executionId, connectionStatus, refreshInterval, loadExecutionData]);

  // Initialize audio for alerts
  useEffect(() => {
    audioRef.current = new Audio('/sounds/alert.mp3'); // Assuming alert sound file
    audioRef.current.volume = 0.5;
  }, []);

  // Main Render
  return (
    <div className={`flex h-full bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <TooltipProvider>
        <div className="flex-1 flex flex-col">
          {/* Advanced Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Monitor className="h-8 w-8 text-blue-600" />
                  {connectionStatus === 'connected' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Real-Time Job Monitor</h1>
                  <p className="text-sm text-gray-500">Advanced execution monitoring & analytics</p>
                </div>
              </div>
              
              {executionId && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {executionId}
                  </Badge>
                  {workflowId && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      Workflow: {workflowId}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                  connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {connectionStatus === 'connected' ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                  <span className="capitalize">{connectionStatus}</span>
                  {lastUpdate && connectionStatus === 'connected' && (
                    <span className="text-xs opacity-75">
                      {updateCount} updates
                    </span>
                  )}
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <Switch
                    checked={isRealTimeMode}
                    onCheckedChange={setIsRealTimeMode}
                    size="sm"
                  />
                  <Label className="text-sm">Real-time</Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                    size="sm"
                  />
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-gray-600" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadExecutionData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Refresh
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setShowAdvancedView(!showAdvancedView)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {showAdvancedView ? 'Hide' : 'Show'} Advanced View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAlertsExpanded(!alertsExpanded)}>
                      <Bell className="h-4 w-4 mr-2" />
                      {alertsExpanded ? 'Hide' : 'Show'} Alerts Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      // Export monitoring data
                      const exportData = {
                        execution: currentExecution,
                        metrics: executionMetrics,
                        performance_history: performanceHistory,
                        logs: executionLogs.slice(-500),
                        timeline: executionTimeline,
                        system_health: systemHealth,
                        cross_spa_metrics: crossSPAMetrics,
                        ai_insights: aiInsights,
                        exported_at: new Date().toISOString(),
                        export_settings: {
                          time_range: selectedTimeRange,
                          log_level: logLevel,
                          show_advanced: showAdvancedView
                        }
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `execution-monitor-${executionId}-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main Content with Advanced Tabs */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Logs</span>
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Metrics</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Timeline</span>
                </TabsTrigger>
                <TabsTrigger value="cross-spa" className="flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span>Cross-SPA</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="h-full">
                <TabsContent value="overview" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {renderOverviewPanel()}
                  </ScrollArea>
                </TabsContent>
                
                {/* Additional tabs would be implemented here */}
                <TabsContent value="logs" className="h-full mt-0">
                  <Card className="h-full">
                    <CardContent className="p-0 h-full">
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Advanced log streaming interface</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="metrics" className="h-full mt-0">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Advanced metrics dashboard</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="timeline" className="h-full mt-0">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Execution timeline visualization</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="cross-spa" className="h-full mt-0">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="text-center py-8 text-gray-500">
                        <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Cross-SPA metrics and integration status</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Floating Alerts Panel */}
        <AnimatePresence>
          {alerts.length > 0 && alertsEnabled && (
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed top-20 right-6 w-96 max-h-96 z-50"
            >
              <Card className="shadow-2xl border-2 border-orange-200">
                <CardHeader className="pb-2 bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      <Bell className="h-4 w-4 mr-2 text-orange-600" />
                      Active Alerts ({alerts.length})
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAlertsExpanded(!alertsExpanded)}
                      >
                        {alertsExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAlerts([])}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {alertsExpanded && (
                  <CardContent className="p-3 max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {alerts.slice(0, 5).map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border ${
                            alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                            alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                            alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <AlertTriangle className={`h-4 w-4 ${
                                  alert.severity === 'critical' ? 'text-red-600' :
                                  alert.severity === 'high' ? 'text-orange-600' :
                                  alert.severity === 'medium' ? 'text-yellow-600' :
                                  'text-blue-600'
                                }`} />
                                <span className="font-medium text-sm">{alert.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{alert.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </div>
  );
};

export default RealTimeJobMonitor;
