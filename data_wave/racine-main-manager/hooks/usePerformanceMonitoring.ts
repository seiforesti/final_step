// usePerformanceMonitoring.ts
// Comprehensive React hook for performance monitoring in Racine Main Manager

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface PerformanceMetrics {
  id: string;
  timestamp: string;
  source: string;
  component: string;
  operation: string;
  duration: number;
  memoryUsage: number;
  cpuUsage: number;
  networkUsage: number;
  diskUsage: number;
  errorRate: number;
  successRate: number;
  throughput: number;
  latency: number;
  queueTime: number;
  processingTime: number;
  waitTime: number;
  resourceUtilization: ResourceUtilization;
  bottlenecks: string[];
  optimizations: string[];
  metadata: Record<string, any>;
}

export interface ResourceUtilization {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  gpu?: number;
  database?: number;
  cache?: number;
  queue?: number;
}

export interface PerformanceAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'performance' | 'resource' | 'error' | 'bottleneck';
  title: string;
  message: string;
  component: string;
  operation: string;
  threshold: number;
  currentValue: number;
  recommendedAction: string;
  acknowledged: boolean;
  resolved: boolean;
  metadata: Record<string, any>;
}

export interface PerformanceThreshold {
  id: string;
  name: string;
  component: string;
  operation: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: PerformanceAlert['severity'];
  enabled: boolean;
  description: string;
  metadata: Record<string, any>;
}

export interface PerformanceReport {
  id: string;
  timestamp: string;
  timeRange: {
    start: string;
    end: string;
  };
  summary: {
    totalOperations: number;
    averageDuration: number;
    totalErrors: number;
    errorRate: number;
    averageThroughput: number;
    averageLatency: number;
    resourceUtilization: ResourceUtilization;
  };
  components: ComponentPerformance[];
  alerts: PerformanceAlert[];
  recommendations: PerformanceRecommendation[];
  metadata: Record<string, any>;
}

export interface ComponentPerformance {
  name: string;
  operations: number;
  averageDuration: number;
  errorRate: number;
  throughput: number;
  latency: number;
  resourceUtilization: ResourceUtilization;
  bottlenecks: string[];
  trends: PerformanceTrend[];
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'degrading';
  change: number;
  period: string;
  confidence: number;
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'scaling' | 'configuration' | 'architecture';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    performance: number;
    cost: number;
    complexity: number;
  };
  implementation: string;
  estimatedEffort: number;
  estimatedSavings: number;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface PerformanceConfig {
  enabled: boolean;
  samplingRate: number;
  collectionInterval: number;
  retentionPeriod: number;
  alertingEnabled: boolean;
  reportingEnabled: boolean;
  autoOptimization: boolean;
  thresholds: PerformanceThreshold[];
  components: string[];
  metadata: Record<string, any>;
}

// Hook options
export interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  samplingRate?: number;
  collectionInterval?: number;
  alertingEnabled?: boolean;
  reportingEnabled?: boolean;
  autoOptimization?: boolean;
  onAlert?: (alert: PerformanceAlert) => void;
  onThresholdExceeded?: (threshold: PerformanceThreshold, value: number) => void;
  onOptimization?: (recommendation: PerformanceRecommendation) => void;
  onError?: (error: Error) => void;
}

// Hook return type
export interface UsePerformanceMonitoringReturn {
  // Metrics
  metrics: PerformanceMetrics[];
  currentMetrics: PerformanceMetrics | null;
  metricsLoading: boolean;
  metricsError: Error | null;
  
  // Alerts
  alerts: PerformanceAlert[];
  activeAlerts: PerformanceAlert[];
  alertsLoading: boolean;
  alertsError: Error | null;
  
  // Thresholds
  thresholds: PerformanceThreshold[];
  thresholdsLoading: boolean;
  thresholdsError: Error | null;
  
  // Reports
  reports: PerformanceReport[];
  currentReport: PerformanceReport | null;
  reportsLoading: boolean;
  reportsError: Error | null;
  
  // Configuration
  config: PerformanceConfig;
  configLoading: boolean;
  configError: Error | null;
  
  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  pauseMonitoring: () => void;
  resumeMonitoring: () => void;
  
  // Metrics operations
  recordMetric: (metric: Partial<PerformanceMetrics>) => void;
  getMetrics: (filters?: Record<string, any>) => Promise<PerformanceMetrics[]>;
  clearMetrics: () => Promise<void>;
  
  // Alert operations
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  createAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => Promise<PerformanceAlert>;
  deleteAlert: (alertId: string) => Promise<void>;
  
  // Threshold operations
  createThreshold: (threshold: Omit<PerformanceThreshold, 'id'>) => Promise<PerformanceThreshold>;
  updateThreshold: (id: string, updates: Partial<PerformanceThreshold>) => Promise<PerformanceThreshold>;
  deleteThreshold: (id: string) => Promise<void>;
  enableThreshold: (id: string) => Promise<void>;
  disableThreshold: (id: string) => Promise<void>;
  
  // Report operations
  generateReport: (timeRange: { start: string; end: string }) => Promise<PerformanceReport>;
  getReport: (reportId: string) => Promise<PerformanceReport>;
  exportReport: (reportId: string, format: 'json' | 'csv' | 'pdf') => Promise<string>;
  
  // Configuration operations
  updateConfig: (updates: Partial<PerformanceConfig>) => Promise<PerformanceConfig>;
  resetConfig: () => Promise<PerformanceConfig>;
  
  // Utility functions
  getComponentPerformance: (componentName: string) => ComponentPerformance | null;
  getResourceUtilization: () => ResourceUtilization;
  getBottlenecks: () => string[];
  getOptimizations: () => PerformanceRecommendation[];
  calculateTrends: (metric: string, timeRange: string) => PerformanceTrend[];
  
  // Real-time subscriptions
  subscribeToMetrics: (callback: (metrics: PerformanceMetrics) => void) => void;
  unsubscribeFromMetrics: () => void;
  subscribeToAlerts: (callback: (alert: PerformanceAlert) => void) => void;
  unsubscribeFromAlerts: () => void;
  
  // Loading states
  isLoading: boolean;
  isMonitoring: boolean;
  isPaused: boolean;
}

// Mock API functions (to be replaced with real API calls)
const performanceAPI = {
  getMetrics: async (filters?: Record<string, any>) => {
    // Mock implementation
    return [];
  },
  
  recordMetric: async (metric: Partial<PerformanceMetrics>) => {
    // Mock implementation
    return {} as PerformanceMetrics;
  },
  
  clearMetrics: async () => {
    // Mock implementation
  },
  
  getAlerts: async () => {
    // Mock implementation
    return [];
  },
  
  acknowledgeAlert: async (alertId: string) => {
    // Mock implementation
  },
  
  resolveAlert: async (alertId: string) => {
    // Mock implementation
  },
  
  createAlert: async (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
    // Mock implementation
    return {} as PerformanceAlert;
  },
  
  deleteAlert: async (alertId: string) => {
    // Mock implementation
  },
  
  getThresholds: async () => {
    // Mock implementation
    return [];
  },
  
  createThreshold: async (threshold: Omit<PerformanceThreshold, 'id'>) => {
    // Mock implementation
    return {} as PerformanceThreshold;
  },
  
  updateThreshold: async (id: string, updates: Partial<PerformanceThreshold>) => {
    // Mock implementation
    return {} as PerformanceThreshold;
  },
  
  deleteThreshold: async (id: string) => {
    // Mock implementation
  },
  
  enableThreshold: async (id: string) => {
    // Mock implementation
  },
  
  disableThreshold: async (id: string) => {
    // Mock implementation
  },
  
  generateReport: async (timeRange: { start: string; end: string }) => {
    // Mock implementation
    return {} as PerformanceReport;
  },
  
  getReport: async (reportId: string) => {
    // Mock implementation
    return {} as PerformanceReport;
  },
  
  exportReport: async (reportId: string, format: 'json' | 'csv' | 'pdf') => {
    // Mock implementation
    return '';
  },
  
  getConfig: async () => {
    // Mock implementation
    return {} as PerformanceConfig;
  },
  
  updateConfig: async (updates: Partial<PerformanceConfig>) => {
    // Mock implementation
    return {} as PerformanceConfig;
  },
  
  resetConfig: async () => {
    // Mock implementation
    return {} as PerformanceConfig;
  }
};

export const usePerformanceMonitoring = (options: UsePerformanceMonitoringOptions = {}): UsePerformanceMonitoringReturn => {
  const {
    enabled = true,
    samplingRate = 1.0,
    collectionInterval = 5000,
    alertingEnabled = true,
    reportingEnabled = true,
    autoOptimization = false,
    onAlert,
    onThresholdExceeded,
    onOptimization,
    onError
  } = options;

  const queryClient = useQueryClient();
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);

  // State management
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Query for metrics
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => performanceAPI.getMetrics(),
    enabled: enabled && isMonitoring,
    refetchInterval: collectionInterval,
    staleTime: 1000
  });

  // Query for alerts
  const {
    data: alertsData,
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['performance-alerts'],
    queryFn: () => performanceAPI.getAlerts(),
    enabled: enabled && alertingEnabled,
    refetchInterval: 10000,
    staleTime: 5000
  });

  // Query for thresholds
  const {
    data: thresholdsData,
    isLoading: thresholdsLoading,
    error: thresholdsError,
    refetch: refetchThresholds
  } = useQuery({
    queryKey: ['performance-thresholds'],
    queryFn: () => performanceAPI.getThresholds(),
    enabled: enabled && alertingEnabled,
    staleTime: 300000 // 5 minutes
  });

  // Query for reports
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['performance-reports'],
    queryFn: () => performanceAPI.generateReport({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    }),
    enabled: enabled && reportingEnabled,
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000
  });

  // Query for configuration
  const {
    data: configData,
    isLoading: configLoading,
    error: configError,
    refetch: refetchConfig
  } = useQuery({
    queryKey: ['performance-config'],
    queryFn: () => performanceAPI.getConfig(),
    enabled: enabled,
    staleTime: 300000 // 5 minutes
  });

  // Mutations
  const recordMetricMutation = useMutation({
    mutationFn: performanceAPI.recordMetric,
    onSuccess: (metric) => {
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
      
      // Check thresholds
      checkThresholds(metric);
    },
    onError: (error) => {
      console.error('Failed to record metric:', error);
      onError?.(error);
    }
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: performanceAPI.acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: (error) => {
      toast.error('Failed to acknowledge alert');
      onError?.(error);
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: performanceAPI.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-alerts'] });
      toast.success('Alert resolved');
    },
    onError: (error) => {
      toast.error('Failed to resolve alert');
      onError?.(error);
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: performanceAPI.createAlert,
    onSuccess: (alert) => {
      queryClient.invalidateQueries({ queryKey: ['performance-alerts'] });
      onAlert?.(alert);
      toast.success('Alert created');
    },
    onError: (error) => {
      toast.error('Failed to create alert');
      onError?.(error);
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: performanceAPI.updateConfig,
    onSuccess: (config) => {
      queryClient.invalidateQueries({ queryKey: ['performance-config'] });
      toast.success('Configuration updated');
    },
    onError: (error) => {
      toast.error('Failed to update configuration');
      onError?.(error);
    }
  });

  // Action functions
  const startMonitoring = useCallback(() => {
    if (monitoringRef.current) return;

    monitoringRef.current = true;
    setIsMonitoring(true);
    setIsPaused(false);
    pausedRef.current = false;

    // Start metrics collection
    metricsIntervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        collectMetrics();
      }
    }, collectionInterval);

    console.log('Performance monitoring started');
  }, [collectionInterval]);

  const stopMonitoring = useCallback(() => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }

    monitoringRef.current = false;
    setIsMonitoring(false);
    setIsPaused(false);
    pausedRef.current = false;

    console.log('Performance monitoring stopped');
  }, []);

  const pauseMonitoring = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
    console.log('Performance monitoring paused');
  }, []);

  const resumeMonitoring = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
    console.log('Performance monitoring resumed');
  }, []);

  // Metrics operations
  const recordMetric = useCallback((metric: Partial<PerformanceMetrics>) => {
    if (!enabled) return;

    const fullMetric: PerformanceMetrics = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: 'racine-main-manager',
      component: metric.component || 'unknown',
      operation: metric.operation || 'unknown',
      duration: metric.duration || 0,
      memoryUsage: metric.memoryUsage || 0,
      cpuUsage: metric.cpuUsage || 0,
      networkUsage: metric.networkUsage || 0,
      diskUsage: metric.diskUsage || 0,
      errorRate: metric.errorRate || 0,
      successRate: metric.successRate || 100,
      throughput: metric.throughput || 0,
      latency: metric.latency || 0,
      queueTime: metric.queueTime || 0,
      processingTime: metric.processingTime || 0,
      waitTime: metric.waitTime || 0,
      resourceUtilization: metric.resourceUtilization || {
        cpu: 0,
        memory: 0,
        network: 0,
        disk: 0
      },
      bottlenecks: metric.bottlenecks || [],
      optimizations: metric.optimizations || [],
      metadata: metric.metadata || {}
    };

    recordMetricMutation.mutate(fullMetric);
  }, [enabled, recordMetricMutation]);

  const getMetrics = useCallback(async (filters?: Record<string, any>) => {
    return performanceAPI.getMetrics(filters);
  }, []);

  const clearMetrics = useCallback(async () => {
    await performanceAPI.clearMetrics();
    queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
  }, [queryClient]);

  // Alert operations
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    return acknowledgeAlertMutation.mutateAsync(alertId);
  }, [acknowledgeAlertMutation]);

  const resolveAlert = useCallback(async (alertId: string) => {
    return resolveAlertMutation.mutateAsync(alertId);
  }, [resolveAlertMutation]);

  const createAlert = useCallback(async (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
    return createAlertMutation.mutateAsync(alert);
  }, [createAlertMutation]);

  const deleteAlert = useCallback(async (alertId: string) => {
    await performanceAPI.deleteAlert(alertId);
    queryClient.invalidateQueries({ queryKey: ['performance-alerts'] });
  }, [queryClient]);

  // Threshold operations
  const createThreshold = useCallback(async (threshold: Omit<PerformanceThreshold, 'id'>) => {
    const newThreshold = await performanceAPI.createThreshold(threshold);
    queryClient.invalidateQueries({ queryKey: ['performance-thresholds'] });
    return newThreshold;
  }, [queryClient]);

  const updateThreshold = useCallback(async (id: string, updates: Partial<PerformanceThreshold>) => {
    const updatedThreshold = await performanceAPI.updateThreshold(id, updates);
    queryClient.invalidateQueries({ queryKey: ['performance-thresholds'] });
    return updatedThreshold;
  }, [queryClient]);

  const deleteThreshold = useCallback(async (id: string) => {
    await performanceAPI.deleteThreshold(id);
    queryClient.invalidateQueries({ queryKey: ['performance-thresholds'] });
  }, [queryClient]);

  const enableThreshold = useCallback(async (id: string) => {
    await performanceAPI.enableThreshold(id);
    queryClient.invalidateQueries({ queryKey: ['performance-thresholds'] });
  }, [queryClient]);

  const disableThreshold = useCallback(async (id: string) => {
    await performanceAPI.disableThreshold(id);
    queryClient.invalidateQueries({ queryKey: ['performance-thresholds'] });
  }, [queryClient]);

  // Report operations
  const generateReport = useCallback(async (timeRange: { start: string; end: string }) => {
    return performanceAPI.generateReport(timeRange);
  }, []);

  const getReport = useCallback(async (reportId: string) => {
    return performanceAPI.getReport(reportId);
  }, []);

  const exportReport = useCallback(async (reportId: string, format: 'json' | 'csv' | 'pdf') => {
    return performanceAPI.exportReport(reportId, format);
  }, []);

  // Configuration operations
  const updateConfig = useCallback(async (updates: Partial<PerformanceConfig>) => {
    return updateConfigMutation.mutateAsync(updates);
  }, [updateConfigMutation]);

  const resetConfig = useCallback(async () => {
    const resetConfig = await performanceAPI.resetConfig();
    queryClient.invalidateQueries({ queryKey: ['performance-config'] });
    return resetConfig;
  }, [queryClient]);

  // Utility functions
  const getComponentPerformance = useCallback((componentName: string) => {
    if (!reportsData) return null;
    
    return reportsData.components?.find(c => c.name === componentName) || null;
  }, [reportsData]);

  const getResourceUtilization = useCallback(() => {
    if (!reportsData) {
      return { cpu: 0, memory: 0, network: 0, disk: 0 };
    }
    
    return reportsData.summary.resourceUtilization;
  }, [reportsData]);

  const getBottlenecks = useCallback(() => {
    if (!reportsData) return [];
    
    const bottlenecks: string[] = [];
    reportsData.components?.forEach(component => {
      bottlenecks.push(...component.bottlenecks);
    });
    
    return [...new Set(bottlenecks)];
  }, [reportsData]);

  const getOptimizations = useCallback(() => {
    if (!reportsData) return [];
    
    return reportsData.recommendations || [];
  }, [reportsData]);

  const calculateTrends = useCallback((metric: string, timeRange: string) => {
    // Mock implementation for trend calculation
    return [];
  }, []);

  // Real-time subscriptions
  const subscribeToMetrics = useCallback((callback: (metrics: PerformanceMetrics) => void) => {
    // Implementation for WebSocket subscription
  }, []);

  const unsubscribeFromMetrics = useCallback(() => {
    // Implementation for WebSocket unsubscription
  }, []);

  const subscribeToAlerts = useCallback((callback: (alert: PerformanceAlert) => void) => {
    // Implementation for WebSocket subscription
  }, []);

  const unsubscribeFromAlerts = useCallback(() => {
    // Implementation for WebSocket unsubscription
  }, []);

  // Helper functions
  const collectMetrics = useCallback(() => {
    if (Math.random() > samplingRate) return;

    // Collect system metrics
    const metrics: Partial<PerformanceMetrics> = {
      component: 'racine-main-manager',
      operation: 'system-monitoring',
      duration: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      networkUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      errorRate: Math.random() * 5,
      successRate: 95 + Math.random() * 5,
      throughput: Math.random() * 1000,
      latency: Math.random() * 100,
      queueTime: Math.random() * 50,
      processingTime: Math.random() * 200,
      waitTime: Math.random() * 30,
      resourceUtilization: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        disk: Math.random() * 100
      },
      bottlenecks: [],
      optimizations: [],
      metadata: {
        timestamp: Date.now(),
        source: 'system'
      }
    };

    recordMetric(metrics);
  }, [samplingRate, recordMetric]);

  const checkThresholds = useCallback((metric: PerformanceMetrics) => {
    if (!thresholdsData || !alertingEnabled) return;

    thresholdsData.forEach(threshold => {
      if (!threshold.enabled || threshold.component !== metric.component) return;

      let value: number;
      switch (threshold.metric) {
        case 'duration':
          value = metric.duration;
          break;
        case 'memoryUsage':
          value = metric.memoryUsage;
          break;
        case 'cpuUsage':
          value = metric.cpuUsage;
          break;
        case 'errorRate':
          value = metric.errorRate;
          break;
        default:
          return;
      }

      let exceeded = false;
      switch (threshold.operator) {
        case 'gt':
          exceeded = value > threshold.value;
          break;
        case 'lt':
          exceeded = value < threshold.value;
          break;
        case 'eq':
          exceeded = value === threshold.value;
          break;
        case 'gte':
          exceeded = value >= threshold.value;
          break;
        case 'lte':
          exceeded = value <= threshold.value;
          break;
      }

      if (exceeded) {
        onThresholdExceeded?.(threshold, value);
        
        // Create alert
        createAlert({
          severity: threshold.severity,
          type: 'performance',
          title: `Performance threshold exceeded: ${threshold.name}`,
          message: `${threshold.metric} exceeded threshold of ${threshold.value} (current: ${value})`,
          component: threshold.component,
          operation: metric.operation,
          threshold: threshold.value,
          currentValue: value,
          recommendedAction: threshold.description,
          acknowledged: false,
          resolved: false,
          metadata: {
            thresholdId: threshold.id,
            metric: threshold.metric,
            operator: threshold.operator
          }
        });
      }
    });
  }, [thresholdsData, alertingEnabled, onThresholdExceeded, createAlert]);

  // Effects
  useEffect(() => {
    if (enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enabled, startMonitoring, stopMonitoring]);

  // Loading states
  const isLoading = metricsLoading || alertsLoading || thresholdsLoading || reportsLoading || configLoading;

  return {
    // Metrics
    metrics: metricsData || [],
    currentMetrics: metricsData?.[metricsData.length - 1] || null,
    metricsLoading,
    metricsError,
    
    // Alerts
    alerts: alertsData || [],
    activeAlerts: (alertsData || []).filter(alert => !alert.resolved),
    alertsLoading,
    alertsError,
    
    // Thresholds
    thresholds: thresholdsData || [],
    thresholdsLoading,
    thresholdsError,
    
    // Reports
    reports: reportsData ? [reportsData] : [],
    currentReport: reportsData || null,
    reportsLoading,
    reportsError,
    
    // Configuration
    config: configData || {
      enabled: true,
      samplingRate: 1.0,
      collectionInterval: 5000,
      retentionPeriod: 86400000,
      alertingEnabled: true,
      reportingEnabled: true,
      autoOptimization: false,
      thresholds: [],
      components: [],
      metadata: {}
    },
    configLoading,
    configError,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    
    // Metrics operations
    recordMetric,
    getMetrics,
    clearMetrics,
    
    // Alert operations
    acknowledgeAlert,
    resolveAlert,
    createAlert,
    deleteAlert,
    
    // Threshold operations
    createThreshold,
    updateThreshold,
    deleteThreshold,
    enableThreshold,
    disableThreshold,
    
    // Report operations
    generateReport,
    getReport,
    exportReport,
    
    // Configuration operations
    updateConfig,
    resetConfig,
    
    // Utility functions
    getComponentPerformance,
    getResourceUtilization,
    getBottlenecks,
    getOptimizations,
    calculateTrends,
    
    // Real-time subscriptions
    subscribeToMetrics,
    unsubscribeFromMetrics,
    subscribeToAlerts,
    unsubscribeFromAlerts,
    
    // Loading states
    isLoading,
    isMonitoring,
    isPaused
  };
};
