// Advanced-Scan-Logic/hooks/useRealTimeMonitoring.ts
// Comprehensive React hook for real-time monitoring with live metrics and alerting

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MonitoringMetrics,
  MonitoringAlert,
  MonitoringDashboard,
  MonitoringWidget,
  MonitoringThreshold,
  MonitoringRule,
  TelemetryData,
  SystemMetrics,
  PerformanceMetrics,
  HealthCheckResult,
  AlertSeverity,
  AlertStatus,
  MetricType,
  MonitoringScope,
  AggregationType,
  MonitoringFilters,
  MonitoringSort
} from '../types/monitoring.types';

// Hook options interface
interface UseRealTimeMonitoringOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  enableAlerts?: boolean;
  enableHealthChecks?: boolean;
  monitoringScope?: MonitoringScope;
  alertThreshold?: AlertSeverity;
  onMetricThresholdExceeded?: (metric: MonitoringMetrics, threshold: MonitoringThreshold) => void;
  onHealthCheckFailed?: (result: HealthCheckResult) => void;
  onSystemAlert?: (alert: MonitoringAlert) => void;
  onCriticalAlert?: (alert: MonitoringAlert) => void;
  onError?: (error: Error) => void;
}

// Pagination state
interface PaginationState {
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Hook return type
interface UseRealTimeMonitoringReturn {
  // Metrics
  metrics: MonitoringMetrics[];
  metricsLoading: boolean;
  metricsError: Error | null;
  
  // Alerts
  alerts: MonitoringAlert[];
  alertsLoading: boolean;
  alertsError: Error | null;
  
  // Health Checks
  healthChecks: HealthCheckResult[];
  healthLoading: boolean;
  healthError: Error | null;
  
  // Dashboards
  dashboards: MonitoringDashboard[];
  dashboardsLoading: boolean;
  dashboardsError: Error | null;
  
  // System Metrics
  systemMetrics: SystemMetrics | null;
  systemMetricsLoading: boolean;
  systemMetricsError: Error | null;
  
  // Performance Metrics
  performanceMetrics: PerformanceMetrics | null;
  performanceLoading: boolean;
  performanceError: Error | null;
  
  // State management
  selectedDashboard: MonitoringDashboard | null;
  selectedAlert: MonitoringAlert | null;
  filters: MonitoringFilters;
  sort: MonitoringSort;
  pagination: PaginationState;
  isMonitoring: boolean;
  
  // Actions
  setSelectedDashboard: (dashboard: MonitoringDashboard | null) => void;
  setSelectedAlert: (alert: MonitoringAlert | null) => void;
  setFilters: (filters: Partial<MonitoringFilters>) => void;
  setSort: (sort: MonitoringSort) => void;
  setPagination: (page: number, size?: number) => void;
  setIsMonitoring: (isMonitoring: boolean) => void;
  
  // Monitoring operations
  startMonitoring: (scope: MonitoringScope) => Promise<void>;
  stopMonitoring: () => Promise<void>;
  pauseMonitoring: () => Promise<void>;
  resumeMonitoring: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  
  // Alert management
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string, resolution: string) => Promise<void>;
  snoozeAlert: (alertId: string, duration: number) => Promise<void>;
  escalateAlert: (alertId: string, escalation: any) => Promise<void>;
  
  // Threshold management
  createThreshold: (threshold: any) => Promise<MonitoringThreshold>;
  updateThreshold: (thresholdId: string, updates: any) => Promise<MonitoringThreshold>;
  deleteThreshold: (thresholdId: string) => Promise<void>;
  
  // Dashboard management
  createDashboard: (dashboard: any) => Promise<MonitoringDashboard>;
  updateDashboard: (dashboardId: string, updates: any) => Promise<MonitoringDashboard>;
  deleteDashboard: (dashboardId: string) => Promise<void>;
  addWidget: (dashboardId: string, widget: any) => Promise<MonitoringWidget>;
  updateWidget: (widgetId: string, updates: any) => Promise<MonitoringWidget>;
  removeWidget: (widgetId: string) => Promise<void>;
  
  // Health checks
  performHealthCheck: (systemId: string) => Promise<HealthCheckResult>;
  scheduleHealthCheck: (systemId: string, schedule: any) => Promise<void>;
  getHealthCheckHistory: (systemId: string, timeRange?: string) => Promise<HealthCheckResult[]>;
  
  // Telemetry
  collectTelemetry: (scope: MonitoringScope) => Promise<TelemetryData>;
  getTelemetryHistory: (timeRange?: string) => Promise<TelemetryData[]>;
  exportTelemetryData: (format: string, timeRange?: string) => Promise<any>;
  
  // Analytics
  getMonitoringAnalytics: (timeRange?: string) => Promise<any>;
  getMetricTrends: (metricType: MetricType, timeRange?: string) => Promise<any>;
  getSystemPerformanceReport: (systemId?: string) => Promise<any>;
  getAlertsAnalytics: (timeRange?: string) => Promise<any>;
  
  // Utility functions
  getAlertSeverityColor: (severity: AlertSeverity) => string;
  getAlertStatusColor: (status: AlertStatus) => string;
  getMetricTypeIcon: (type: MetricType) => string;
  formatMetricValue: (value: number, type: MetricType) => string;
  calculateUptime: (healthChecks: HealthCheckResult[]) => number;
  getHealthStatusColor: (isHealthy: boolean) => string;
  
  // Real-time subscriptions
  subscribeToMetricsUpdates: () => void;
  unsubscribeFromMetricsUpdates: () => void;
  subscribeToAlerts: () => void;
  unsubscribeFromAlerts: () => void;
  subscribeToHealthChecks: () => void;
  unsubscribeFromHealthChecks: () => void;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isUpdating: boolean;
}

export const useRealTimeMonitoring = (options: UseRealTimeMonitoringOptions = {}): UseRealTimeMonitoringReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 5000, // 5 seconds for real-time monitoring
    enableRealTimeUpdates = true,
    enableAlerts = true,
    enableHealthChecks = true,
    monitoringScope = MonitoringScope.SYSTEM,
    alertThreshold = AlertSeverity.WARNING,
    onMetricThresholdExceeded,
    onHealthCheckFailed,
    onSystemAlert,
    onCriticalAlert,
    onError
  } = options;

  const queryClient = useQueryClient();
  const metricsWsRef = useRef<WebSocket | null>(null);
  const alertsWsRef = useRef<WebSocket | null>(null);
  const healthWsRef = useRef<WebSocket | null>(null);

  // State management
  const [selectedDashboard, setSelectedDashboard] = useState<MonitoringDashboard | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<MonitoringAlert | null>(null);
  const [filters, setFiltersState] = useState<MonitoringFilters>({});
  const [sort, setSortState] = useState<MonitoringSort>({ field: 'timestamp', direction: 'desc' });
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    size: 50,
    total: 0,
    hasNext: false,
    hasPrevious: false
  });
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  // API service - will be implemented
  const monitoringAPI = {
    getMetrics: async (params: any) => ({ metrics: [], total: 0 }),
    getAlerts: async (params: any) => ({ alerts: [], total: 0 }),
    getHealthChecks: async () => ({ health_checks: [] }),
    getDashboards: async () => ({ dashboards: [] }),
    getSystemMetrics: async () => null,
    getPerformanceMetrics: async () => null,
    acknowledgeAlert: async (id: string) => {},
    resolveAlert: async (id: string, resolution: string) => {},
    createThreshold: async (threshold: any) => threshold,
    updateThreshold: async (id: string, updates: any) => updates,
    deleteThreshold: async (id: string) => {},
    createDashboard: async (dashboard: any) => dashboard,
    updateDashboard: async (id: string, updates: any) => updates,
    deleteDashboard: async (id: string) => {},
    performHealthCheck: async (systemId: string) => ({ system_id: systemId, is_healthy: true }),
    subscribeToMetricsUpdates: (callback: Function, onError: Function) => new WebSocket('ws://localhost'),
    subscribeToAlerts: (callback: Function, onError: Function) => new WebSocket('ws://localhost'),
    subscribeToHealthChecks: (callback: Function, onError: Function) => new WebSocket('ws://localhost')
  };

  // Query for metrics
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['monitoring-metrics', filters, sort, pagination.page, pagination.size, monitoringScope],
    queryFn: () => monitoringAPI.getMetrics({
      ...filters,
      sort,
      page: pagination.page,
      size: pagination.size,
      scope: monitoringScope
    }),
    enabled: isMonitoring,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 2000 // Very fresh data for real-time monitoring
  });

  // Query for alerts
  const {
    data: alertsData,
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['monitoring-alerts', filters],
    queryFn: () => monitoringAPI.getAlerts({
      ...filters,
      severity_threshold: alertThreshold
    }),
    enabled: isMonitoring && enableAlerts,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5000
  });

  // Query for health checks
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['health-checks'],
    queryFn: () => monitoringAPI.getHealthChecks(),
    enabled: isMonitoring && enableHealthChecks,
    refetchInterval: autoRefresh ? refreshInterval * 2 : false, // Less frequent for health checks
    staleTime: 10000
  });

  // Query for dashboards
  const {
    data: dashboardsData,
    isLoading: dashboardsLoading,
    error: dashboardsError
  } = useQuery({
    queryKey: ['monitoring-dashboards'],
    queryFn: () => monitoringAPI.getDashboards(),
    enabled: true,
    staleTime: 300000 // 5 minutes for dashboards
  });

  // Query for system metrics
  const {
    data: systemMetrics,
    isLoading: systemMetricsLoading,
    error: systemMetricsError
  } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => monitoringAPI.getSystemMetrics(),
    enabled: isMonitoring,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 3000
  });

  // Query for performance metrics
  const {
    data: performanceMetrics,
    isLoading: performanceLoading,
    error: performanceError
  } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => monitoringAPI.getPerformanceMetrics(),
    enabled: isMonitoring,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 3000
  });

  // Mutations for alert management
  const acknowledgeAlertMutation = useMutation({
    mutationFn: monitoringAPI.acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries(['monitoring-alerts']);
      toast.success('Alert acknowledged');
    },
    onError: (error: Error) => {
      toast.error(`Failed to acknowledge alert: ${error.message}`);
      onError?.(error);
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, resolution }: { alertId: string; resolution: string }) =>
      monitoringAPI.resolveAlert(alertId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries(['monitoring-alerts']);
      toast.success('Alert resolved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resolve alert: ${error.message}`);
      onError?.(error);
    }
  });

  // Mutations for threshold management
  const createThresholdMutation = useMutation({
    mutationFn: monitoringAPI.createThreshold,
    onSuccess: () => {
      toast.success('Monitoring threshold created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create threshold: ${error.message}`);
      onError?.(error);
    }
  });

  // Mutations for dashboard management
  const createDashboardMutation = useMutation({
    mutationFn: monitoringAPI.createDashboard,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['monitoring-dashboards']);
      toast.success('Dashboard created successfully');
      setSelectedDashboard(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create dashboard: ${error.message}`);
      onError?.(error);
    }
  });

  // Utility functions
  const getAlertSeverityColor = useCallback((severity: AlertSeverity): string => {
    const severityColors = {
      [AlertSeverity.INFO]: 'text-blue-500',
      [AlertSeverity.WARNING]: 'text-yellow-500',
      [AlertSeverity.ERROR]: 'text-orange-500',
      [AlertSeverity.CRITICAL]: 'text-red-500'
    };
    return severityColors[severity] || 'text-gray-500';
  }, []);

  const getAlertStatusColor = useCallback((status: AlertStatus): string => {
    const statusColors = {
      [AlertStatus.ACTIVE]: 'text-red-500',
      [AlertStatus.ACKNOWLEDGED]: 'text-yellow-500',
      [AlertStatus.RESOLVED]: 'text-green-500',
      [AlertStatus.SNOOZED]: 'text-blue-500'
    };
    return statusColors[status] || 'text-gray-500';
  }, []);

  const getMetricTypeIcon = useCallback((type: MetricType): string => {
    const typeIcons = {
      [MetricType.CPU]: '🖥️',
      [MetricType.MEMORY]: '💾',
      [MetricType.DISK]: '💿',
      [MetricType.NETWORK]: '🌐',
      [MetricType.THROUGHPUT]: '⚡',
      [MetricType.LATENCY]: '⏱️',
      [MetricType.ERROR_RATE]: '❌',
      [MetricType.AVAILABILITY]: '✅'
    };
    return typeIcons[type] || '📊';
  }, []);

  const formatMetricValue = useCallback((value: number, type: MetricType): string => {
    switch (type) {
      case MetricType.CPU:
      case MetricType.MEMORY:
      case MetricType.DISK:
        return `${value.toFixed(1)}%`;
      case MetricType.LATENCY:
        return `${value.toFixed(2)}ms`;
      case MetricType.THROUGHPUT:
        return `${value.toFixed(0)}/s`;
      case MetricType.ERROR_RATE:
        return `${value.toFixed(2)}%`;
      case MetricType.AVAILABILITY:
        return `${value.toFixed(3)}%`;
      default:
        return value.toString();
    }
  }, []);

  const calculateUptime = useCallback((healthChecks: HealthCheckResult[]): number => {
    if (!healthChecks || healthChecks.length === 0) return 100;
    
    const healthyChecks = healthChecks.filter(check => check.is_healthy).length;
    return Math.round((healthyChecks / healthChecks.length) * 100);
  }, []);

  const getHealthStatusColor = useCallback((isHealthy: boolean): string => {
    return isHealthy ? 'text-green-500' : 'text-red-500';
  }, []);

  // Action handlers
  const setFilters = useCallback((newFilters: Partial<MonitoringFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setSort = useCallback((newSort: MonitoringSort) => {
    setSortState(newSort);
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setPagination = useCallback((page: number, size?: number) => {
    setPaginationState(prev => ({
      ...prev,
      page,
      ...(size && { size })
    }));
  }, []);

  // Monitoring operations
  const startMonitoring = useCallback(async (scope: MonitoringScope): Promise<void> => {
    try {
      setIsMonitoring(true);
      toast.success('Real-time monitoring started');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to start monitoring: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const stopMonitoring = useCallback(async (): Promise<void> => {
    try {
      setIsMonitoring(false);
      toast.success('Real-time monitoring stopped');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to stop monitoring: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const pauseMonitoring = useCallback(async (): Promise<void> => {
    try {
      setIsMonitoring(false);
      toast.success('Monitoring paused');
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const resumeMonitoring = useCallback(async (): Promise<void> => {
    try {
      setIsMonitoring(true);
      toast.success('Monitoring resumed');
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const refreshMetrics = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        refetchMetrics(),
        refetchAlerts(),
        refetchHealth()
      ]);
      toast.success('Metrics refreshed');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to refresh metrics: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [refetchMetrics, refetchAlerts, refetchHealth, onError]);

  // Alert management
  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    return acknowledgeAlertMutation.mutateAsync(alertId);
  }, [acknowledgeAlertMutation]);

  const resolveAlert = useCallback(async (alertId: string, resolution: string): Promise<void> => {
    return resolveAlertMutation.mutateAsync({ alertId, resolution });
  }, [resolveAlertMutation]);

  const snoozeAlert = useCallback(async (alertId: string, duration: number): Promise<void> => {
    try {
      // Implementation would call API
      queryClient.invalidateQueries(['monitoring-alerts']);
      toast.success('Alert snoozed');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to snooze alert: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const escalateAlert = useCallback(async (alertId: string, escalation: any): Promise<void> => {
    try {
      // Implementation would call API
      queryClient.invalidateQueries(['monitoring-alerts']);
      toast.success('Alert escalated');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to escalate alert: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  // Threshold management
  const createThreshold = useCallback(async (threshold: any): Promise<MonitoringThreshold> => {
    return createThresholdMutation.mutateAsync(threshold);
  }, [createThresholdMutation]);

  const updateThreshold = useCallback(async (thresholdId: string, updates: any): Promise<MonitoringThreshold> => {
    return monitoringAPI.updateThreshold(thresholdId, updates);
  }, []);

  const deleteThreshold = useCallback(async (thresholdId: string): Promise<void> => {
    return monitoringAPI.deleteThreshold(thresholdId);
  }, []);

  // Dashboard management
  const createDashboard = useCallback(async (dashboard: any): Promise<MonitoringDashboard> => {
    return createDashboardMutation.mutateAsync(dashboard);
  }, [createDashboardMutation]);

  const updateDashboard = useCallback(async (dashboardId: string, updates: any): Promise<MonitoringDashboard> => {
    return monitoringAPI.updateDashboard(dashboardId, updates);
  }, []);

  const deleteDashboard = useCallback(async (dashboardId: string): Promise<void> => {
    return monitoringAPI.deleteDashboard(dashboardId);
  }, []);

  const addWidget = useCallback(async (dashboardId: string, widget: any): Promise<MonitoringWidget> => {
    // Implementation would call API
    return widget;
  }, []);

  const updateWidget = useCallback(async (widgetId: string, updates: any): Promise<MonitoringWidget> => {
    // Implementation would call API
    return updates;
  }, []);

  const removeWidget = useCallback(async (widgetId: string): Promise<void> => {
    // Implementation would call API
  }, []);

  // Health checks
  const performHealthCheck = useCallback(async (systemId: string): Promise<HealthCheckResult> => {
    return monitoringAPI.performHealthCheck(systemId);
  }, []);

  const scheduleHealthCheck = useCallback(async (systemId: string, schedule: any): Promise<void> => {
    // Implementation would call API
  }, []);

  const getHealthCheckHistory = useCallback(async (systemId: string, timeRange?: string): Promise<HealthCheckResult[]> => {
    // Implementation would call API
    return [];
  }, []);

  // Telemetry
  const collectTelemetry = useCallback(async (scope: MonitoringScope): Promise<TelemetryData> => {
    // Implementation would call API
    return {} as TelemetryData;
  }, []);

  const getTelemetryHistory = useCallback(async (timeRange?: string): Promise<TelemetryData[]> => {
    // Implementation would call API
    return [];
  }, []);

  const exportTelemetryData = useCallback(async (format: string, timeRange?: string): Promise<any> => {
    // Implementation would call API
    return {};
  }, []);

  // Analytics
  const getMonitoringAnalytics = useCallback(async (timeRange?: string): Promise<any> => {
    // Implementation would call API
    return {};
  }, []);

  const getMetricTrends = useCallback(async (metricType: MetricType, timeRange?: string): Promise<any> => {
    // Implementation would call API
    return {};
  }, []);

  const getSystemPerformanceReport = useCallback(async (systemId?: string): Promise<any> => {
    // Implementation would call API
    return {};
  }, []);

  const getAlertsAnalytics = useCallback(async (timeRange?: string): Promise<any> => {
    // Implementation would call API
    return {};
  }, []);

  // Real-time subscriptions
  const subscribeToMetricsUpdates = useCallback(() => {
    if (!enableRealTimeUpdates || metricsWsRef.current) return;

    try {
      metricsWsRef.current = monitoringAPI.subscribeToMetricsUpdates(
        (data) => {
          queryClient.invalidateQueries(['monitoring-metrics']);
          
          if (data.threshold_exceeded && onMetricThresholdExceeded) {
            onMetricThresholdExceeded(data.metric, data.threshold);
          }
        },
        (error) => {
          console.error('Metrics WebSocket error:', error);
          onError?.(new Error('Real-time metrics connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to metrics updates:', error);
    }
  }, [enableRealTimeUpdates, queryClient, onMetricThresholdExceeded, onError]);

  const unsubscribeFromMetricsUpdates = useCallback(() => {
    if (metricsWsRef.current) {
      metricsWsRef.current.close();
      metricsWsRef.current = null;
    }
  }, []);

  const subscribeToAlerts = useCallback(() => {
    if (!enableAlerts || alertsWsRef.current) return;

    try {
      alertsWsRef.current = monitoringAPI.subscribeToAlerts(
        (alert) => {
          queryClient.invalidateQueries(['monitoring-alerts']);
          
          if (onSystemAlert) {
            onSystemAlert(alert);
          }
          
          if (alert.severity === AlertSeverity.CRITICAL && onCriticalAlert) {
            onCriticalAlert(alert);
          }
        },
        (error) => {
          console.error('Alerts WebSocket error:', error);
          onError?.(new Error('Alert notifications connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to alerts:', error);
    }
  }, [enableAlerts, queryClient, onSystemAlert, onCriticalAlert, onError]);

  const unsubscribeFromAlerts = useCallback(() => {
    if (alertsWsRef.current) {
      alertsWsRef.current.close();
      alertsWsRef.current = null;
    }
  }, []);

  const subscribeToHealthChecks = useCallback(() => {
    if (!enableHealthChecks || healthWsRef.current) return;

    try {
      healthWsRef.current = monitoringAPI.subscribeToHealthChecks(
        (result) => {
          queryClient.invalidateQueries(['health-checks']);
          
          if (!result.is_healthy && onHealthCheckFailed) {
            onHealthCheckFailed(result);
          }
        },
        (error) => {
          console.error('Health checks WebSocket error:', error);
          onError?.(new Error('Health check notifications connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to health checks:', error);
    }
  }, [enableHealthChecks, queryClient, onHealthCheckFailed, onError]);

  const unsubscribeFromHealthChecks = useCallback(() => {
    if (healthWsRef.current) {
      healthWsRef.current.close();
      healthWsRef.current = null;
    }
  }, []);

  // Effect to update pagination when data changes
  useEffect(() => {
    if (metricsData) {
      setPaginationState(prev => ({
        ...prev,
        total: metricsData.total || 0,
        hasNext: metricsData.has_next || false,
        hasPrevious: metricsData.has_previous || false
      }));
    }
  }, [metricsData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromMetricsUpdates();
      unsubscribeFromAlerts();
      unsubscribeFromHealthChecks();
    };
  }, [unsubscribeFromMetricsUpdates, unsubscribeFromAlerts, unsubscribeFromHealthChecks]);

  // Load initial data and setup subscriptions
  useEffect(() => {
    if (isMonitoring) {
      if (enableRealTimeUpdates) {
        subscribeToMetricsUpdates();
      }
      if (enableAlerts) {
        subscribeToAlerts();
      }
      if (enableHealthChecks) {
        subscribeToHealthChecks();
      }
    }
  }, [isMonitoring, enableRealTimeUpdates, enableAlerts, enableHealthChecks, subscribeToMetricsUpdates, subscribeToAlerts, subscribeToHealthChecks]);

  // Combine loading states
  const isLoading = metricsLoading || alertsLoading || healthLoading || dashboardsLoading;
  const isRefreshing = false; // Would be set during manual refresh
  const isUpdating = acknowledgeAlertMutation.isPending || resolveAlertMutation.isPending || createDashboardMutation.isPending;

  return {
    // Metrics
    metrics: metricsData?.metrics || [],
    metricsLoading,
    metricsError,
    
    // Alerts
    alerts: alertsData?.alerts || [],
    alertsLoading,
    alertsError,
    
    // Health Checks
    healthChecks: healthData?.health_checks || [],
    healthLoading,
    healthError,
    
    // Dashboards
    dashboards: dashboardsData?.dashboards || [],
    dashboardsLoading,
    dashboardsError,
    
    // System Metrics
    systemMetrics,
    systemMetricsLoading,
    systemMetricsError,
    
    // Performance Metrics
    performanceMetrics,
    performanceLoading,
    performanceError,
    
    // State management
    selectedDashboard,
    selectedAlert,
    filters,
    sort,
    pagination,
    isMonitoring,
    
    // Actions
    setSelectedDashboard,
    setSelectedAlert,
    setFilters,
    setSort,
    setPagination,
    setIsMonitoring,
    
    // Monitoring operations
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    refreshMetrics,
    
    // Alert management
    acknowledgeAlert,
    resolveAlert,
    snoozeAlert,
    escalateAlert,
    
    // Threshold management
    createThreshold,
    updateThreshold,
    deleteThreshold,
    
    // Dashboard management
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    updateWidget,
    removeWidget,
    
    // Health checks
    performHealthCheck,
    scheduleHealthCheck,
    getHealthCheckHistory,
    
    // Telemetry
    collectTelemetry,
    getTelemetryHistory,
    exportTelemetryData,
    
    // Analytics
    getMonitoringAnalytics,
    getMetricTrends,
    getSystemPerformanceReport,
    getAlertsAnalytics,
    
    // Utility functions
    getAlertSeverityColor,
    getAlertStatusColor,
    getMetricTypeIcon,
    formatMetricValue,
    calculateUptime,
    getHealthStatusColor,
    
    // Real-time subscriptions
    subscribeToMetricsUpdates,
    unsubscribeFromMetricsUpdates,
    subscribeToAlerts,
    unsubscribeFromAlerts,
    subscribeToHealthChecks,
    unsubscribeFromHealthChecks,
    
    // Loading states
    isLoading,
    isRefreshing,
    isUpdating
  };
};