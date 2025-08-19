// Advanced-Scan-Logic/hooks/usePerformanceOptimization.ts
// Comprehensive React hook for performance optimization and monitoring

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  PerformanceMetric,
  PerformanceBottleneck,
  PerformanceOptimization,
  PerformanceAlert,
  ResourceUtilization,
  PerformanceBaseline,
  ScalingRecommendation,
  CostOptimization,
  PerformanceThreshold,
  PerformanceMetricType,
  PerformanceStatus,
  BottleneckType,
  OptimizationType,
  MonitoringScope,
  AlertSeverity,
  TrendDirection
} from '../types/performance.types';
import { scanPerformanceAPI } from '../services/scan-performance-apis';

// Hook options interface
interface UsePerformanceOptimizationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeMonitoring?: boolean;
  enableAlerts?: boolean;
  monitoringScope?: MonitoringScope;
  onPerformanceAlert?: (alert: PerformanceAlert) => void;
  onBottleneckDetected?: (bottleneck: PerformanceBottleneck) => void;
  onOptimizationComplete?: (optimization: PerformanceOptimization) => void;
  onError?: (error: Error) => void;
}

// Optimization filters
interface OptimizationFilters {
  metric_types?: PerformanceMetricType[];
  optimization_types?: OptimizationType[];
  severity_levels?: AlertSeverity[];
  time_range?: string;
  status?: PerformanceStatus[];
  include_predictions?: boolean;
}

// Hook return type
interface UsePerformanceOptimizationReturn {
  // Performance data
  metrics: PerformanceMetric[];
  bottlenecks: PerformanceBottleneck[];
  optimizations: PerformanceOptimization[];
  alerts: PerformanceAlert[];
  resourceUtilization: ResourceUtilization[];
  baselines: PerformanceBaseline[];
  scalingRecommendations: ScalingRecommendation[];
  
  // State
  isLoading: boolean;
  isOptimizing: boolean;
  isAnalyzing: boolean;
  error: Error | null;
  selectedMetric: PerformanceMetric | null;
  selectedBottleneck: PerformanceBottleneck | null;
  
  // Filters and configuration
  filters: OptimizationFilters;
  monitoringConfig: any;
  
  // Performance monitoring
  getPerformanceMetrics: (params?: any) => Promise<any>;
  getScanMetrics: (scanId: string, params?: any) => Promise<any>;
  createPerformanceMetric: (metric: Omit<PerformanceMetric, 'id' | 'created_at' | 'updated_at'>) => Promise<PerformanceMetric>;
  recordMetricData: (metricId: string, data: any) => Promise<void>;
  
  // Performance history and trends
  getPerformanceHistory: (params: any) => Promise<any>;
  getMetricTrends: (metricId: string, timeRange?: string) => Promise<any>;
  
  // Bottleneck detection and resolution
  detectBottlenecks: (params: any) => Promise<any>;
  getActiveBottlenecks: (params?: any) => Promise<any>;
  resolveBottleneck: (bottleneckId: string, resolution: any) => Promise<void>;
  
  // Optimization analysis and execution
  analyzeOptimization: (request: any) => Promise<any>;
  applyOptimization: (request: any) => Promise<any>;
  getOptimizationHistory: (params?: any) => Promise<any>;
  
  // Resource management
  getResourceUtilization: (params?: any) => Promise<any>;
  getScalingRecommendations: (params?: any) => Promise<any>;
  optimizeResourceAllocation: (params: any) => Promise<any>;
  
  // Performance alerts
  getPerformanceAlerts: (params?: any) => Promise<any>;
  createPerformanceAlert: (alert: any) => Promise<PerformanceAlert>;
  acknowledgeAlert: (alertId: string, acknowledgment: any) => Promise<void>;
  
  // Benchmarks and baselines
  getPerformanceBaselines: (params?: any) => Promise<any>;
  createBaseline: (baseline: any) => Promise<PerformanceBaseline>;
  compareToBaseline: (baselineId: string, currentMetrics: any) => Promise<any>;
  
  // Cost optimization
  getCostOptimizationRecommendations: (params?: any) => Promise<CostOptimization[]>;
  analyzeCostImpact: (optimizationId: string) => Promise<any>;
  
  // Reports and analytics
  generatePerformanceReport: (request: any) => Promise<any>;
  getPerformanceReport: (reportId: string) => Promise<any>;
  getPerformanceAnalytics: (params?: any) => Promise<any>;
  
  // Selection and filtering
  selectMetric: (metric: PerformanceMetric | null) => void;
  selectBottleneck: (bottleneck: PerformanceBottleneck | null) => void;
  setFilters: (filters: Partial<OptimizationFilters>) => void;
  clearFilters: () => void;
  
  // Real-time monitoring
  subscribeToPerformanceUpdates: () => void;
  unsubscribeFromPerformanceUpdates: () => void;
  subscribeToPerformanceAlerts: () => void;
  unsubscribeFromPerformanceAlerts: () => void;
  
  // Utility functions
  refreshData: () => Promise<void>;
  getMetricStatusColor: (status: PerformanceStatus) => string;
  getBottleneckSeverityLabel: (severity: AlertSeverity) => string;
  calculatePerformanceScore: (metrics: PerformanceMetric[]) => number;
  formatMetricValue: (value: number, type: PerformanceMetricType) => string;
  predictPerformanceTrend: (metrics: PerformanceMetric[]) => TrendDirection;
}

export const usePerformanceOptimization = (options: UsePerformanceOptimizationOptions = {}): UsePerformanceOptimizationReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTimeMonitoring = true,
    enableAlerts = true,
    monitoringScope = MonitoringScope.SYSTEM,
    onPerformanceAlert,
    onBottleneckDetected,
    onOptimizationComplete,
    onError
  } = options;

  const queryClient = useQueryClient();
  const performanceWsRef = useRef<WebSocket | null>(null);
  const alertsWsRef = useRef<WebSocket | null>(null);

  // State management
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [selectedBottleneck, setSelectedBottleneck] = useState<PerformanceBottleneck | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [monitoringConfig, setMonitoringConfig] = useState<any>({});

  const [filters, setFiltersState] = useState<OptimizationFilters>({
    metric_types: [],
    optimization_types: [],
    severity_levels: [],
    time_range: '1h',
    status: [],
    include_predictions: true
  });

  // Query for performance metrics
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['performance-metrics', filters, monitoringScope],
    queryFn: async () => {
      return scanPerformanceAPI.getPerformanceMetrics({
        scope: monitoringScope,
        metric_types: filters.metric_types,
        time_range: filters.time_range,
        include_history: filters.include_predictions
      });
    },
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    onError: (err) => {
      console.error('Failed to fetch performance metrics:', err);
      onError?.(err as Error);
    }
  });

  // Query for bottlenecks
  const {
    data: bottlenecksData,
    isLoading: bottlenecksLoading,
    error: bottlenecksError,
    refetch: refetchBottlenecks
  } = useQuery({
    queryKey: ['performance-bottlenecks', filters],
    queryFn: async () => {
      return scanPerformanceAPI.getActiveBottlenecks({
        severity: filters.severity_levels?.map(s => s.toString()),
        scope: monitoringScope
      });
    },
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    onSuccess: (data) => {
      data.bottlenecks?.forEach((bottleneck: PerformanceBottleneck) => {
        onBottleneckDetected?.(bottleneck);
      });
    }
  });

  // Query for resource utilization
  const {
    data: resourceData,
    isLoading: resourceLoading,
    refetch: refetchResources
  } = useQuery({
    queryKey: ['resource-utilization', filters],
    queryFn: async () => {
      return scanPerformanceAPI.getResourceUtilization({
        time_range: filters.time_range,
        include_predictions: filters.include_predictions
      });
    },
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Query for performance alerts
  const {
    data: alertsData,
    isLoading: alertsLoading,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['performance-alerts', filters],
    queryFn: async () => {
      return scanPerformanceAPI.getPerformanceAlerts({
        severity: filters.severity_levels,
        time_range: filters.time_range
      });
    },
    enabled: enableAlerts,
    refetchInterval: autoRefresh ? refreshInterval : false,
    onSuccess: (data) => {
      data.alerts?.forEach((alert: PerformanceAlert) => {
        onPerformanceAlert?.(alert);
      });
    }
  });

  // Mutations for optimization operations
  const optimizationAnalysisMutation = useMutation({
    mutationFn: (request: any) => scanPerformanceAPI.analyzeOptimization(request),
    onMutate: () => setIsAnalyzing(true),
    onSuccess: (data) => {
      setIsAnalyzing(false);
      toast.success('Performance analysis completed');
      queryClient.invalidateQueries(['performance-metrics']);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      const message = error instanceof Error ? error.message : 'Analysis failed';
      toast.error(`Performance analysis failed: ${message}`);
      onError?.(error as Error);
    }
  });

  const optimizationApplicationMutation = useMutation({
    mutationFn: (request: any) => scanPerformanceAPI.applyOptimization(request),
    onMutate: () => setIsOptimizing(true),
    onSuccess: (data) => {
      setIsOptimizing(false);
      toast.success('Performance optimization applied successfully');
      onOptimizationComplete?.(data);
      queryClient.invalidateQueries(['performance-metrics']);
      queryClient.invalidateQueries(['performance-bottlenecks']);
    },
    onError: (error) => {
      setIsOptimizing(false);
      const message = error instanceof Error ? error.message : 'Optimization failed';
      toast.error(`Performance optimization failed: ${message}`);
      onError?.(error as Error);
    }
  });

  const bottleneckDetectionMutation = useMutation({
    mutationFn: (params: any) => scanPerformanceAPI.detectBottlenecks(params),
    onSuccess: (data) => {
      toast.success(`Detected ${data.bottlenecks.length} performance bottlenecks`);
      data.bottlenecks.forEach((bottleneck: PerformanceBottleneck) => {
        onBottleneckDetected?.(bottleneck);
      });
      queryClient.invalidateQueries(['performance-bottlenecks']);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Bottleneck detection failed';
      toast.error(`Bottleneck detection failed: ${message}`);
      onError?.(error as Error);
    }
  });

  const bottleneckResolutionMutation = useMutation({
    mutationFn: ({ bottleneckId, resolution }: { bottleneckId: string; resolution: any }) =>
      scanPerformanceAPI.resolveBottleneck(bottleneckId, resolution),
    onSuccess: () => {
      toast.success('Bottleneck resolved successfully');
      queryClient.invalidateQueries(['performance-bottlenecks']);
      queryClient.invalidateQueries(['performance-metrics']);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Resolution failed';
      toast.error(`Bottleneck resolution failed: ${message}`);
      onError?.(error as Error);
    }
  });

  const alertAcknowledgmentMutation = useMutation({
    mutationFn: ({ alertId, acknowledgment }: { alertId: string; acknowledgment: any }) =>
      scanPerformanceAPI.acknowledgeAlert(alertId, acknowledgment),
    onSuccess: () => {
      toast.success('Alert acknowledged');
      queryClient.invalidateQueries(['performance-alerts']);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Acknowledgment failed';
      toast.error(`Alert acknowledgment failed: ${message}`);
      onError?.(error as Error);
    }
  });

  // Utility functions
  const getMetricStatusColor = useCallback((status: PerformanceStatus): string => {
    const colors = {
      [PerformanceStatus.OPTIMAL]: 'text-green-600 bg-green-50',
      [PerformanceStatus.GOOD]: 'text-blue-600 bg-blue-50',
      [PerformanceStatus.WARNING]: 'text-yellow-600 bg-yellow-50',
      [PerformanceStatus.CRITICAL]: 'text-red-600 bg-red-50',
      [PerformanceStatus.UNKNOWN]: 'text-gray-600 bg-gray-50'
    };
    return colors[status] || colors[PerformanceStatus.UNKNOWN];
  }, []);

  const getBottleneckSeverityLabel = useCallback((severity: AlertSeverity): string => {
    const labels = {
      [AlertSeverity.CRITICAL]: 'Critical',
      [AlertSeverity.HIGH]: 'High',
      [AlertSeverity.MEDIUM]: 'Medium',
      [AlertSeverity.LOW]: 'Low',
      [AlertSeverity.INFO]: 'Info'
    };
    return labels[severity] || 'Unknown';
  }, []);

  const calculatePerformanceScore = useCallback((metrics: PerformanceMetric[]): number => {
    if (!metrics || metrics.length === 0) return 0;
    
    const scores = metrics.map(metric => {
      // Calculate score based on metric type and thresholds
      const normalizedValue = metric.current_value / (metric.threshold || 100);
      return Math.max(0, Math.min(100, (1 - normalizedValue) * 100));
    });
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, []);

  const formatMetricValue = useCallback((value: number, type: PerformanceMetricType): string => {
    switch (type) {
      case PerformanceMetricType.CPU_USAGE:
      case PerformanceMetricType.MEMORY_USAGE:
      case PerformanceMetricType.DISK_USAGE:
        return `${value.toFixed(1)}%`;
      case PerformanceMetricType.RESPONSE_TIME:
        return `${value.toFixed(0)}ms`;
      case PerformanceMetricType.THROUGHPUT:
        return `${value.toFixed(0)}/s`;
      case PerformanceMetricType.ERROR_RATE:
        return `${(value * 100).toFixed(2)}%`;
      default:
        return value.toString();
    }
  }, []);

  const predictPerformanceTrend = useCallback((metrics: PerformanceMetric[]): TrendDirection => {
    if (!metrics || metrics.length < 2) return TrendDirection.STABLE;
    
    const recent = metrics.slice(-5);
    const trend = recent.reduce((acc, metric, index) => {
      if (index === 0) return acc;
      const prev = recent[index - 1];
      return acc + (metric.current_value - prev.current_value);
    }, 0);
    
    if (trend > 0.1) return TrendDirection.INCREASING;
    if (trend < -0.1) return TrendDirection.DECREASING;
    return TrendDirection.STABLE;
  }, []);

  // Real-time monitoring subscriptions
  const subscribeToPerformanceUpdates = useCallback(() => {
    if (!enableRealTimeMonitoring || performanceWsRef.current) return;

    try {
      performanceWsRef.current = scanPerformanceAPI.subscribeToPerformanceUpdates(
        { metric_types: filters.metric_types, scope: monitoringScope },
        (data) => {
          queryClient.invalidateQueries(['performance-metrics']);
        },
        (error) => {
          console.error('Performance monitoring WebSocket error:', error);
          onError?.(new Error('Real-time monitoring connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to performance updates:', error);
    }
  }, [enableRealTimeMonitoring, filters.metric_types, monitoringScope, queryClient, onError]);

  const unsubscribeFromPerformanceUpdates = useCallback(() => {
    if (performanceWsRef.current) {
      performanceWsRef.current.close();
      performanceWsRef.current = null;
    }
  }, []);

  const subscribeToPerformanceAlerts = useCallback(() => {
    if (!enableAlerts || alertsWsRef.current) return;

    try {
      alertsWsRef.current = scanPerformanceAPI.subscribeToPerformanceAlerts(
        (alert) => {
          onPerformanceAlert?.(alert);
          queryClient.invalidateQueries(['performance-alerts']);
        },
        (error) => {
          console.error('Performance alerts WebSocket error:', error);
          onError?.(new Error('Alert monitoring connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to performance alerts:', error);
    }
  }, [enableAlerts, queryClient, onPerformanceAlert, onError]);

  const unsubscribeFromPerformanceAlerts = useCallback(() => {
    if (alertsWsRef.current) {
      alertsWsRef.current.close();
      alertsWsRef.current = null;
    }
  }, []);

  // Setup subscriptions
  useEffect(() => {
    if (enableRealTimeMonitoring) {
      subscribeToPerformanceUpdates();
    }
    if (enableAlerts) {
      subscribeToPerformanceAlerts();
    }

    return () => {
      unsubscribeFromPerformanceUpdates();
      unsubscribeFromPerformanceAlerts();
    };
  }, [
    enableRealTimeMonitoring,
    enableAlerts,
    subscribeToPerformanceUpdates,
    subscribeToPerformanceAlerts,
    unsubscribeFromPerformanceUpdates,
    unsubscribeFromPerformanceAlerts
  ]);

  // Combine loading states
  const isLoading = metricsLoading || bottlenecksLoading || resourceLoading || alertsLoading;
  const error = metricsError || bottlenecksError;

  return {
    // Performance data
    metrics: metricsData?.metrics || [],
    bottlenecks: bottlenecksData?.bottlenecks || [],
    optimizations: [],
    alerts: alertsData?.alerts || [],
    resourceUtilization: resourceData?.utilization || [],
    baselines: [],
    scalingRecommendations: [],
    
    // State
    isLoading,
    isOptimizing,
    isAnalyzing,
    error: error as Error | null,
    selectedMetric,
    selectedBottleneck,
    
    // Filters and configuration
    filters,
    monitoringConfig,
    
    // Performance monitoring
    getPerformanceMetrics: scanPerformanceAPI.getPerformanceMetrics,
    getScanMetrics: scanPerformanceAPI.getScanMetrics,
    createPerformanceMetric: scanPerformanceAPI.createPerformanceMetric,
    recordMetricData: scanPerformanceAPI.recordMetricData,
    
    // Performance history and trends
    getPerformanceHistory: scanPerformanceAPI.getPerformanceHistory,
    getMetricTrends: async (metricId: string, timeRange?: string) => {
      // Implementation would use performance history API
      return scanPerformanceAPI.getPerformanceHistory({
        time_range: timeRange || '24h',
        metric_types: [PerformanceMetricType.RESPONSE_TIME]
      });
    },
    
    // Bottleneck detection and resolution
    detectBottlenecks: bottleneckDetectionMutation.mutateAsync,
    getActiveBottlenecks: scanPerformanceAPI.getActiveBottlenecks,
    resolveBottleneck: (bottleneckId: string, resolution: any) =>
      bottleneckResolutionMutation.mutateAsync({ bottleneckId, resolution }),
    
    // Optimization analysis and execution
    analyzeOptimization: optimizationAnalysisMutation.mutateAsync,
    applyOptimization: optimizationApplicationMutation.mutateAsync,
    getOptimizationHistory: scanPerformanceAPI.getOptimizationHistory,
    
    // Resource management
    getResourceUtilization: scanPerformanceAPI.getResourceUtilization,
    getScalingRecommendations: scanPerformanceAPI.getScalingRecommendations,
    optimizeResourceAllocation: async (params: any) => {
      // This would integrate with resource optimization APIs
      return optimizationApplicationMutation.mutateAsync(params);
    },
    
    // Performance alerts
    getPerformanceAlerts: scanPerformanceAPI.getPerformanceAlerts,
    createPerformanceAlert: scanPerformanceAPI.createPerformanceAlert,
    acknowledgeAlert: (alertId: string, acknowledgment: any) =>
      alertAcknowledgmentMutation.mutateAsync({ alertId, acknowledgment }),
    
    // Benchmarks and baselines
    getPerformanceBaselines: async (params?: any) => {
      return scanPerformanceAPI.getPerformanceBenchmarks(params);
    },
    createBaseline: scanPerformanceAPI.createBenchmark,
    compareToBaseline: async (baselineId: string, currentMetrics: any) => {
      // Implementation would compare current metrics to baseline
      return { comparison: 'baseline_comparison_result' };
    },
    
    // Cost optimization
    getCostOptimizationRecommendations: async (params?: any) => {
      const recommendations = await scanPerformanceAPI.getScalingRecommendations(params);
      return recommendations.recommendations || [];
    },
    analyzeCostImpact: async (optimizationId: string) => {
      // Implementation would analyze cost impact
      return { cost_impact: 'analysis_result' };
    },
    
    // Reports and analytics
    generatePerformanceReport: scanPerformanceAPI.generatePerformanceReport,
    getPerformanceReport: scanPerformanceAPI.getPerformanceReport,
    getPerformanceAnalytics: async (params?: any) => {
      return metricsData?.summary || {};
    },
    
    // Selection and filtering
    selectMetric: setSelectedMetric,
    selectBottleneck: setSelectedBottleneck,
    setFilters: (newFilters: Partial<OptimizationFilters>) => {
      setFiltersState(prev => ({ ...prev, ...newFilters }));
    },
    clearFilters: () => {
      setFiltersState({
        metric_types: [],
        optimization_types: [],
        severity_levels: [],
        time_range: '1h',
        status: [],
        include_predictions: true
      });
    },
    
    // Real-time monitoring
    subscribeToPerformanceUpdates,
    unsubscribeFromPerformanceUpdates,
    subscribeToPerformanceAlerts,
    unsubscribeFromPerformanceAlerts,
    
    // Utility functions
    refreshData: async () => {
      await Promise.all([
        refetchMetrics(),
        refetchBottlenecks(),
        refetchResources(),
        refetchAlerts()
      ]);
    },
    getMetricStatusColor,
    getBottleneckSeverityLabel,
    calculatePerformanceScore,
    formatMetricValue,
    predictPerformanceTrend
  };
};