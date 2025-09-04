import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { websocketApi, WebSocketEventType, WebSocketMessage } from '../api/websocketApi';

// Real-time monitoring configuration
export interface RealTimeMonitoringConfig {
  autoConnect: boolean;
  reconnectOnError: boolean;
  bufferSize: number;
  alertThresholds: {
    errorRate: number;
    latency: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  refreshInterval: number;
  enablePredictiveAlerts: boolean;
  enableAnomalyDetection: boolean;
}

// System metrics interface
export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number;
  };
  disk: {
    used: number;
    total: number;
    readOps: number;
    writeOps: number;
    iops: number;
  };
  application: {
    activeUsers: number;
    requestsPerSecond: number;
    errorRate: number;
    responseTime: number;
    throughput: number;
  };
}

// Performance metrics interface
export interface PerformanceMetrics {
  classification: {
    totalProcessed: number;
    successRate: number;
    averageTime: number;
    throughput: number;
    errorCount: number;
  };
  ml: {
    modelsActive: number;
    trainingJobs: number;
    predictionLatency: number;
    accuracy: number;
    resourceUtilization: number;
  };
  ai: {
    agentsActive: number;
    conversationsActive: number;
    inferenceLatency: number;
    knowledgeBaseSize: number;
    intelligenceScore: number;
  };
}

// Alert interface
export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'critical' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  category: 'system' | 'performance' | 'security' | 'business';
  metadata?: any;
  acknowledged: boolean;
  resolved: boolean;
}

// Anomaly detection result
export interface AnomalyDetection {
  timestamp: string;
  metric: string;
  value: number;
  expectedRange: [number, number];
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Predictive analysis result
export interface PredictiveAnalysis {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeHorizon: string;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation?: string;
}

// Real-time monitoring state
export interface RealTimeMonitoringState {
  isConnected: boolean;
  isMonitoring: boolean;
  systemMetrics: SystemMetrics | null;
  performanceMetrics: PerformanceMetrics | null;
  alerts: Alert[];
  anomalies: AnomalyDetection[];
  predictions: PredictiveAnalysis[];
  connectionStats: {
    uptime: number;
    messagesReceived: number;
    lastUpdate: string | null;
    reconnectCount: number;
  };
  healthScore: number;
  trends: {
    cpu: number[];
    memory: number[];
    network: number[];
    errors: number[];
  };
}

// Default configuration
const defaultConfig: RealTimeMonitoringConfig = {
  autoConnect: true,
  reconnectOnError: true,
  bufferSize: 100,
  alertThresholds: {
    errorRate: 0.05, // 5%
    latency: 1000, // 1 second
    throughput: 100, // requests per second
    memoryUsage: 0.85, // 85%
    cpuUsage: 0.80 // 80%
  },
  refreshInterval: 5000, // 5 seconds
  enablePredictiveAlerts: true,
  enableAnomalyDetection: true
};

// Real-time monitoring hook
export const useRealTimeMonitoring = (config: Partial<RealTimeMonitoringConfig> = {}) => {
  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  
  // State management
  const [state, setState] = useState<RealTimeMonitoringState>({
    isConnected: false,
    isMonitoring: false,
    systemMetrics: null,
    performanceMetrics: null,
    alerts: [],
    anomalies: [],
    predictions: [],
    connectionStats: {
      uptime: 0,
      messagesReceived: 0,
      lastUpdate: null,
      reconnectCount: 0
    },
    healthScore: 100,
    trends: {
      cpu: [],
      memory: [],
      network: [],
      errors: []
    }
  });

  // Refs for tracking
  const subscriptionRefs = useRef<string[]>([]);
  const metricsBuffer = useRef<SystemMetrics[]>([]);
  const alertBuffer = useRef<Alert[]>([]);
  const startTime = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket instance
  const wsInstance = useMemo(() => websocketApi.getInstance(), []);

  // Initialize monitoring
  const initialize = useCallback(async () => {
    if (!wsInstance) {
      console.error('WebSocket instance not available');
      return;
    }

    try {
      if (finalConfig.autoConnect && !state.isConnected) {
        await wsInstance.connect();
      }

      // Subscribe to system events
      const systemSubscription = wsInstance.subscribe(
        WebSocketEventType.SYSTEM_STATUS,
        handleSystemMetrics,
        { priority: 10 }
      );

      const performanceSubscription = wsInstance.subscribe(
        WebSocketEventType.PERFORMANCE_METRICS,
        handlePerformanceMetrics,
        { priority: 10 }
      );

      const alertSubscription = wsInstance.subscribe(
        WebSocketEventType.INTELLIGENCE_ALERT,
        handleAlert,
        { priority: 20 }
      );

      subscriptionRefs.current = [systemSubscription, performanceSubscription, alertSubscription];

      setState(prev => ({
        ...prev,
        isConnected: true,
        isMonitoring: true
      }));

      // Start periodic health checks
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        updateHealthScore();
        performAnomalyDetection();
        generatePredictions();
      }, finalConfig.refreshInterval);

    } catch (error) {
      console.error('Failed to initialize real-time monitoring:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isMonitoring: false
      }));
    }
  }, [wsInstance, finalConfig.autoConnect, finalConfig.refreshInterval]);

  // Handle system metrics
  const handleSystemMetrics = useCallback((message: WebSocketMessage) => {
    const metrics: SystemMetrics = message.payload;
    
    // Update metrics buffer
    metricsBuffer.current.push(metrics);
    if (metricsBuffer.current.length > finalConfig.bufferSize) {
      metricsBuffer.current.shift();
    }

    // Update state
    setState(prev => ({
      ...prev,
      systemMetrics: metrics,
      connectionStats: {
        ...prev.connectionStats,
        messagesReceived: prev.connectionStats.messagesReceived + 1,
        lastUpdate: metrics.timestamp,
        uptime: Date.now() - startTime.current
      },
      trends: {
        ...prev.trends,
        cpu: [...prev.trends.cpu.slice(-19), metrics.cpu.usage],
        memory: [...prev.trends.memory.slice(-19), metrics.memory.percentage],
        network: [...prev.trends.network.slice(-19), metrics.network.latency],
        errors: [...prev.trends.errors.slice(-19), metrics.application.errorRate]
      }
    }));

    // Check thresholds and generate alerts
    checkThresholds(metrics);
  }, [finalConfig.bufferSize]);

  // Handle performance metrics
  const handlePerformanceMetrics = useCallback((message: WebSocketMessage) => {
    const metrics: PerformanceMetrics = message.payload;
    
    setState(prev => ({
      ...prev,
      performanceMetrics: metrics
    }));
  }, []);

  // Handle alerts
  const handleAlert = useCallback((message: WebSocketMessage) => {
    const alert: Alert = {
      ...message.payload,
      timestamp: message.timestamp
    };

    alertBuffer.current.push(alert);
    
    setState(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts.slice(0, 99)] // Keep last 100 alerts
    }));
  }, []);

  // Check thresholds and generate alerts
  const checkThresholds = useCallback((metrics: SystemMetrics) => {
    const alerts: Alert[] = [];

    // CPU usage alert
    if (metrics.cpu.usage > finalConfig.alertThresholds.cpuUsage) {
      alerts.push({
        id: `cpu_${Date.now()}`,
        type: 'warning',
        severity: metrics.cpu.usage > 0.95 ? 'critical' : 'high',
        title: 'High CPU Usage',
        message: `CPU usage is at ${(metrics.cpu.usage * 100).toFixed(1)}%`,
        timestamp: metrics.timestamp,
        source: 'system',
        category: 'performance',
        acknowledged: false,
        resolved: false
      });
    }

    // Memory usage alert
    if (metrics.memory.percentage > finalConfig.alertThresholds.memoryUsage) {
      alerts.push({
        id: `memory_${Date.now()}`,
        type: 'warning',
        severity: metrics.memory.percentage > 0.95 ? 'critical' : 'high',
        title: 'High Memory Usage',
        message: `Memory usage is at ${(metrics.memory.percentage * 100).toFixed(1)}%`,
        timestamp: metrics.timestamp,
        source: 'system',
        category: 'performance',
        acknowledged: false,
        resolved: false
      });
    }

    // Error rate alert
    if (metrics.application.errorRate > finalConfig.alertThresholds.errorRate) {
      alerts.push({
        id: `error_${Date.now()}`,
        type: 'error',
        severity: metrics.application.errorRate > 0.1 ? 'critical' : 'medium',
        title: 'High Error Rate',
        message: `Error rate is at ${(metrics.application.errorRate * 100).toFixed(2)}%`,
        timestamp: metrics.timestamp,
        source: 'application',
        category: 'system',
        acknowledged: false,
        resolved: false
      });
    }

    // Latency alert
    if (metrics.application.responseTime > finalConfig.alertThresholds.latency) {
      alerts.push({
        id: `latency_${Date.now()}`,
        type: 'warning',
        severity: metrics.application.responseTime > 5000 ? 'high' : 'medium',
        title: 'High Response Time',
        message: `Response time is ${metrics.application.responseTime}ms`,
        timestamp: metrics.timestamp,
        source: 'application',
        category: 'performance',
        acknowledged: false,
        resolved: false
      });
    }

    // Add alerts to state
    if (alerts.length > 0) {
      setState(prev => ({
        ...prev,
        alerts: [...alerts, ...prev.alerts.slice(0, 100 - alerts.length)]
      }));
    }
  }, [finalConfig.alertThresholds]);

  // Update health score
  const updateHealthScore = useCallback(() => {
    if (!state.systemMetrics) return;

    const metrics = state.systemMetrics;
    let score = 100;

    // Deduct points based on various factors
    score -= Math.max(0, (metrics.cpu.usage - 0.7) * 100); // CPU penalty
    score -= Math.max(0, (metrics.memory.percentage - 0.7) * 100); // Memory penalty
    score -= Math.max(0, (metrics.application.errorRate - 0.01) * 1000); // Error penalty
    score -= Math.max(0, (metrics.application.responseTime - 500) / 10); // Latency penalty

    // Recent alerts penalty
    const recentAlerts = state.alerts.filter(alert => 
      Date.now() - new Date(alert.timestamp).getTime() < 300000 // Last 5 minutes
    );
    score -= recentAlerts.length * 5;

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    setState(prev => ({
      ...prev,
      healthScore: Math.round(score)
    }));
  }, [state.systemMetrics, state.alerts]);

  // Perform anomaly detection
  const performAnomalyDetection = useCallback(() => {
    if (!finalConfig.enableAnomalyDetection || metricsBuffer.current.length < 10) return;

    const recentMetrics = metricsBuffer.current.slice(-10);
    const anomalies: AnomalyDetection[] = [];

    // Analyze CPU usage
    const cpuValues = recentMetrics.map(m => m.cpu.usage);
    const cpuMean = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;
    const cpuStd = Math.sqrt(cpuValues.reduce((sq, n) => sq + Math.pow(n - cpuMean, 2), 0) / cpuValues.length);
    const currentCpu = recentMetrics[recentMetrics.length - 1].cpu.usage;

    if (Math.abs(currentCpu - cpuMean) > 2 * cpuStd) {
      anomalies.push({
        timestamp: new Date().toISOString(),
        metric: 'cpu_usage',
        value: currentCpu,
        expectedRange: [cpuMean - cpuStd, cpuMean + cpuStd],
        confidence: 0.85,
        severity: Math.abs(currentCpu - cpuMean) > 3 * cpuStd ? 'high' : 'medium',
        description: `CPU usage anomaly detected: ${(currentCpu * 100).toFixed(1)}% (expected: ${(cpuMean * 100).toFixed(1)}%)`
      });
    }

    // Analyze memory usage
    const memoryValues = recentMetrics.map(m => m.memory.percentage);
    const memoryMean = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;
    const memoryStd = Math.sqrt(memoryValues.reduce((sq, n) => sq + Math.pow(n - memoryMean, 2), 0) / memoryValues.length);
    const currentMemory = recentMetrics[recentMetrics.length - 1].memory.percentage;

    if (Math.abs(currentMemory - memoryMean) > 2 * memoryStd) {
      anomalies.push({
        timestamp: new Date().toISOString(),
        metric: 'memory_usage',
        value: currentMemory,
        expectedRange: [memoryMean - memoryStd, memoryMean + memoryStd],
        confidence: 0.82,
        severity: Math.abs(currentMemory - memoryMean) > 3 * memoryStd ? 'high' : 'medium',
        description: `Memory usage anomaly detected: ${(currentMemory * 100).toFixed(1)}% (expected: ${(memoryMean * 100).toFixed(1)}%)`
      });
    }

    if (anomalies.length > 0) {
      setState(prev => ({
        ...prev,
        anomalies: [...anomalies, ...prev.anomalies.slice(0, 50 - anomalies.length)]
      }));
    }
  }, [finalConfig.enableAnomalyDetection]);

  // Generate predictions
  const generatePredictions = useCallback(() => {
    if (!finalConfig.enablePredictiveAlerts || metricsBuffer.current.length < 5) return;

    const recentMetrics = metricsBuffer.current.slice(-5);
    const predictions: PredictiveAnalysis[] = [];

    // CPU trend prediction
    const cpuValues = recentMetrics.map(m => m.cpu.usage);
    const cpuTrend = calculateTrend(cpuValues);
    const currentCpu = cpuValues[cpuValues.length - 1];
    const predictedCpu = currentCpu + (cpuTrend * 3); // Predict 3 intervals ahead

    predictions.push({
      metric: 'cpu_usage',
      currentValue: currentCpu,
      predictedValue: Math.max(0, Math.min(1, predictedCpu)),
      timeHorizon: '15 minutes',
      confidence: 0.75,
      trend: cpuTrend > 0.01 ? 'increasing' : cpuTrend < -0.01 ? 'decreasing' : 'stable',
      recommendation: predictedCpu > 0.9 ? 'Consider scaling resources or optimizing workload' : undefined
    });

    // Memory trend prediction
    const memoryValues = recentMetrics.map(m => m.memory.percentage);
    const memoryTrend = calculateTrend(memoryValues);
    const currentMemory = memoryValues[memoryValues.length - 1];
    const predictedMemory = currentMemory + (memoryTrend * 3);

    predictions.push({
      metric: 'memory_usage',
      currentValue: currentMemory,
      predictedValue: Math.max(0, Math.min(1, predictedMemory)),
      timeHorizon: '15 minutes',
      confidence: 0.78,
      trend: memoryTrend > 0.01 ? 'increasing' : memoryTrend < -0.01 ? 'decreasing' : 'stable',
      recommendation: predictedMemory > 0.9 ? 'Consider garbage collection or memory optimization' : undefined
    });

    setState(prev => ({
      ...prev,
      predictions
    }));
  }, [finalConfig.enablePredictiveAlerts]);

  // Calculate trend from values
  const calculateTrend = useCallback((values: number[]): number => {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = n * (n - 1) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = n * (n - 1) * (2 * n - 1) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }));
  }, []);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    }));
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setState(prev => ({
      ...prev,
      alerts: []
    }));
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    // Unsubscribe from all events
    if (wsInstance) {
      subscriptionRefs.current.forEach(id => {
        wsInstance.unsubscribe(id);
      });
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isMonitoring: false
    }));
  }, [wsInstance]);

  // Disconnect
  const disconnect = useCallback(() => {
    stopMonitoring();
    if (wsInstance) {
      wsInstance.disconnect();
    }
    setState(prev => ({
      ...prev,
      isConnected: false
    }));
  }, [wsInstance, stopMonitoring]);

  // Get metrics history
  const getMetricsHistory = useCallback(() => {
    return [...metricsBuffer.current];
  }, []);

  // Get alert statistics
  const getAlertStats = useCallback(() => {
    const total = state.alerts.length;
    const acknowledged = state.alerts.filter(a => a.acknowledged).length;
    const resolved = state.alerts.filter(a => a.resolved).length;
    const critical = state.alerts.filter(a => a.severity === 'critical').length;
    const high = state.alerts.filter(a => a.severity === 'high').length;
    const medium = state.alerts.filter(a => a.severity === 'medium').length;
    const low = state.alerts.filter(a => a.severity === 'low').length;

    return {
      total,
      acknowledged,
      resolved,
      unresolved: total - resolved,
      byType: { critical, high, medium, low }
    };
  }, [state.alerts]);

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    return () => {
      stopMonitoring();
    };
  }, [initialize, stopMonitoring]);

  // Export monitoring interface
  return {
    // State
    ...state,
    
    // Configuration
    config: finalConfig,
    
    // Actions
    initialize,
    stopMonitoring,
    disconnect,
    acknowledgeAlert,
    resolveAlert,
    clearAlerts,
    
    // Data access
    getMetricsHistory,
    getAlertStats,
    
    // Computed values
    isHealthy: state.healthScore >= 80,
    hasActiveAlerts: state.alerts.some(a => !a.resolved),
    hasCriticalAlerts: state.alerts.some(a => a.severity === 'critical' && !a.resolved),
    connectionUptime: state.connectionStats.uptime,
    
    // Real-time status
    lastUpdate: state.connectionStats.lastUpdate,
    messagesReceived: state.connectionStats.messagesReceived,
    reconnectCount: state.connectionStats.reconnectCount
  };
};

export default useRealTimeMonitoring;