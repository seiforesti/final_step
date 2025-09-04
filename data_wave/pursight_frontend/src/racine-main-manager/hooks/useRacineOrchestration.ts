/**
 * Racine Orchestration Hooks
 * ==========================
 * 
 * Comprehensive React hooks for racine orchestration functionality that provide
 * state management, API integration, and real-time updates for the master
 * orchestration system.
 * 
 * Features:
 * - Master orchestration state management
 * - Real-time system health monitoring
 * - Cross-group workflow execution
 * - Performance optimization
 * - WebSocket integration for live updates
 * - Error handling and loading states
 * - Caching and optimization
 * 
 * Backend Integration:
 * - Maps to: RacineOrchestrationService
 * - Uses: racine-orchestration-apis.ts
 * - Real-time: WebSocket events
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  racineOrchestrationAPI,
  OrchestrationEventType,
  OrchestrationEvent,
  OrchestrationEventHandler
} from '../services/racine-orchestration-apis';

import {
  SystemHealthResponse,
  OrchestrationResponse,
  WorkflowExecutionResponse,
  PerformanceOptimizationResponse,
  CreateOrchestrationRequest,
  ExecuteWorkflowRequest,
  OptimizePerformanceRequest,
  SystemAlert,
  GroupHealthStatus,
  ServiceHealthStatus,
  IntegrationHealthStatus,
  OptimizationRecommendation,
  UUID,
  ISODateString,
  SystemStatus,
  OperationStatus,
  PaginationRequest,
  FilterRequest
} from '../types/api.types';

import {
  SystemHealth,
  PerformanceMetrics,
  ExecutionLog,
  ExecutionError
} from '../types/racine-core.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Orchestration state interface
 */
export interface OrchestrationState {
  // Master orchestration
  orchestrationMasters: OrchestrationResponse[];
  currentOrchestration: OrchestrationResponse | null;
  
  // System health
  systemHealth: SystemHealthResponse | null;
  groupsHealth: Record<string, GroupHealthStatus>;
  servicesHealth: Record<string, ServiceHealthStatus>;
  integrationsHealth: Record<string, IntegrationHealthStatus>;
  
  // Alerts and monitoring
  systemAlerts: SystemAlert[];
  unacknowledgedAlerts: number;
  criticalAlerts: number;
  
  // Workflow execution
  activeWorkflows: Record<UUID, WorkflowExecutionResponse>;
  workflowHistory: WorkflowExecutionResponse[];
  
  // Performance metrics
  currentMetrics: PerformanceMetrics | null;
  metricsHistory: PerformanceMetrics[];
  
  // Optimization
  optimizationRecommendations: OptimizationRecommendation[];
  lastOptimization: PerformanceOptimizationResponse | null;
  
  // Connection status
  isConnected: boolean;
  lastSync: ISODateString | null;
  websocketConnected: boolean;
}

/**
 * Loading states
 */
export interface OrchestrationLoading {
  orchestrationMasters: boolean;
  systemHealth: boolean;
  alerts: boolean;
  workflows: boolean;
  metrics: boolean;
  optimization: boolean;
  creating: boolean;
  executing: boolean;
  optimizing: boolean;
}

/**
 * Error states
 */
export interface OrchestrationErrors {
  orchestrationMasters: string | null;
  systemHealth: string | null;
  alerts: string | null;
  workflows: string | null;
  metrics: string | null;
  optimization: string | null;
  creating: string | null;
  executing: string | null;
  optimizing: string | null;
  connection: string | null;
}

/**
 * Hook configuration options
 */
export interface UseOrchestrationOptions {
  // Auto-refresh intervals (in milliseconds)
  healthRefreshInterval?: number;
  metricsRefreshInterval?: number;
  alertsRefreshInterval?: number;
  
  // Real-time features
  enableRealTimeUpdates?: boolean;
  enableWebSocket?: boolean;
  
  // Data management
  maxHistoryItems?: number;
  cacheDuration?: number;
  
  // Initial data loading
  autoLoadData?: boolean;
  loadOrchestrationMasters?: boolean;
  loadSystemHealth?: boolean;
  loadAlerts?: boolean;
  loadMetrics?: boolean;
  
  // Filtering
  initialFilters?: FilterRequest;
  initialPagination?: PaginationRequest;
}

/**
 * Hook return type
 */
export interface UseOrchestrationReturn {
  // State
  state: OrchestrationState;
  loading: OrchestrationLoading;
  errors: OrchestrationErrors;
  
  // Master orchestration management
  createOrchestrationMaster: (request: CreateOrchestrationRequest) => Promise<OrchestrationResponse>;
  updateOrchestrationMaster: (id: UUID, updates: Partial<CreateOrchestrationRequest>) => Promise<OrchestrationResponse>;
  deleteOrchestrationMaster: (id: UUID) => Promise<void>;
  loadOrchestrationMasters: () => Promise<void>;
  selectOrchestration: (orchestration: OrchestrationResponse) => void;
  
  // System health monitoring
  refreshSystemHealth: () => Promise<void>;
  refreshGroupHealth: (groupId: string) => Promise<void>;
  refreshServiceHealth: (serviceId: string) => Promise<void>;
  refreshIntegrationHealth: (integrationId: UUID) => Promise<void>;
  
  // Alerts management
  loadAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: UUID) => Promise<void>;
  resolveAlert: (alertId: UUID, resolution?: string) => Promise<void>;
  
  // Workflow execution
  executeWorkflow: (request: ExecuteWorkflowRequest) => Promise<WorkflowExecutionResponse>;
  getWorkflowStatus: (executionId: UUID) => Promise<WorkflowExecutionResponse>;
  controlWorkflow: (executionId: UUID, action: 'pause' | 'resume' | 'cancel') => Promise<void>;
  loadWorkflowHistory: () => Promise<void>;
  subscribeToWorkflowLogs: (executionId: UUID, callback: (log: ExecutionLog) => void) => () => void;
  
  // Performance and optimization
  loadMetrics: () => Promise<void>;
  optimizePerformance: (request: OptimizePerformanceRequest) => Promise<PerformanceOptimizationResponse>;
  loadOptimizationRecommendations: () => Promise<void>;
  implementOptimization: (recommendationId: UUID, dryRun?: boolean) => Promise<void>;
  
  // Real-time updates
  subscribeToEvents: (eventType: OrchestrationEventType, handler: OrchestrationEventHandler) => () => void;
  
  // Utility functions
  isHealthy: (status: SystemStatus) => boolean;
  getHealthColor: (status: SystemStatus) => string;
  formatMetric: (value: number, type: string) => string;
  testConnection: () => Promise<boolean>;
  
  // Cache management
  clearCache: () => void;
  refreshAll: () => Promise<void>;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const DEFAULT_OPTIONS: Required<UseOrchestrationOptions> = {
  healthRefreshInterval: 30000, // 30 seconds
  metricsRefreshInterval: 10000, // 10 seconds
  alertsRefreshInterval: 15000, // 15 seconds
  enableRealTimeUpdates: true,
  enableWebSocket: true,
  maxHistoryItems: 100,
  cacheDuration: 60000, // 1 minute
  autoLoadData: true,
  loadOrchestrationMasters: true,
  loadSystemHealth: true,
  loadAlerts: true,
  loadMetrics: true,
  initialFilters: {},
  initialPagination: { page: 1, pageSize: 20 }
};

const INITIAL_STATE: OrchestrationState = {
  orchestrationMasters: [],
  currentOrchestration: null,
  systemHealth: null,
  groupsHealth: {},
  servicesHealth: {},
  integrationsHealth: {},
  systemAlerts: [],
  unacknowledgedAlerts: 0,
  criticalAlerts: 0,
  activeWorkflows: {},
  workflowHistory: [],
  currentMetrics: null,
  metricsHistory: [],
  optimizationRecommendations: [],
  lastOptimization: null,
  isConnected: false,
  lastSync: null,
  websocketConnected: false
};

const INITIAL_LOADING: OrchestrationLoading = {
  orchestrationMasters: false,
  systemHealth: false,
  alerts: false,
  workflows: false,
  metrics: false,
  optimization: false,
  creating: false,
  executing: false,
  optimizing: false
};

const INITIAL_ERRORS: OrchestrationErrors = {
  orchestrationMasters: null,
  systemHealth: null,
  alerts: null,
  workflows: null,
  metrics: null,
  optimization: null,
  creating: null,
  executing: null,
  optimizing: null,
  connection: null
};

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Main orchestration hook
 */
export function useRacineOrchestration(
  options: UseOrchestrationOptions = {}
): UseOrchestrationReturn {
  // Merge options with defaults
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  
  // State management
  const [state, setState] = useState<OrchestrationState>(INITIAL_STATE);
  const [loading, setLoading] = useState<OrchestrationLoading>(INITIAL_LOADING);
  const [errors, setErrors] = useState<OrchestrationErrors>(INITIAL_ERRORS);
  
  // Refs for cleanup and subscriptions
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);
  const subscriptionRefs = useRef<UUID[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logSubscriptions = useRef<Map<UUID, () => void>>(new Map());
  
  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================
  
  const updateLoading = useCallback((key: keyof OrchestrationLoading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const updateError = useCallback((key: keyof OrchestrationErrors, error: string | null) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);
  
  const handleApiError = useCallback((error: Error, errorKey: keyof OrchestrationErrors) => {
    // Handle timeout errors gracefully - don't crash the application
    if (error.message && error.message.includes('timeout')) {
      console.warn(`Orchestration API timeout (${errorKey}): ${error.message}`);
      // Don't update error state for timeouts - just log warning
      return;
    }
    
    // Handle network errors gracefully
    if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.warn(`Orchestration API network error (${errorKey}): ${error.message}`);
      // Don't update error state for network errors - just log warning
      return;
    }
    
    // For other errors, log and update state as normal
    console.error(`Orchestration API error (${errorKey}):`, error);
    updateError(errorKey, error.message);
  }, [updateError]);
  
  // =============================================================================
  // MASTER ORCHESTRATION MANAGEMENT
  // =============================================================================
  
  const createOrchestrationMaster = useCallback(async (
    request: CreateOrchestrationRequest
  ): Promise<OrchestrationResponse> => {
    updateLoading('creating', true);
    updateError('creating', null);
    
    try {
      const response = await racineOrchestrationAPI.createOrchestrationMaster(request);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          orchestrationMasters: [...prev.orchestrationMasters, response.data!],
          currentOrchestration: response.data!
        }));
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to create orchestration master');
      }
    } catch (error) {
      handleApiError(error as Error, 'creating');
      throw error;
    } finally {
      updateLoading('creating', false);
    }
  }, [updateLoading, updateError, handleApiError]);
  
  const updateOrchestrationMaster = useCallback(async (
    id: UUID,
    updates: Partial<CreateOrchestrationRequest>
  ): Promise<OrchestrationResponse> => {
    updateLoading('orchestrationMasters', true);
    updateError('orchestrationMasters', null);
    
    try {
      const response = await racineOrchestrationAPI.updateOrchestrationMaster(id, updates);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          orchestrationMasters: prev.orchestrationMasters.map(om => 
            om.id === id ? response.data! : om
          ),
          currentOrchestration: prev.currentOrchestration?.id === id ? 
            response.data! : prev.currentOrchestration
        }));
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to update orchestration master');
      }
    } catch (error) {
      handleApiError(error as Error, 'orchestrationMasters');
      throw error;
    } finally {
      updateLoading('orchestrationMasters', false);
    }
  }, [updateLoading, updateError, handleApiError]);
  
  const deleteOrchestrationMaster = useCallback(async (id: UUID): Promise<void> => {
    updateLoading('orchestrationMasters', true);
    updateError('orchestrationMasters', null);
    
    try {
      const response = await racineOrchestrationAPI.deleteOrchestrationMaster(id);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          orchestrationMasters: prev.orchestrationMasters.filter(om => om.id !== id),
          currentOrchestration: prev.currentOrchestration?.id === id ? 
            null : prev.currentOrchestration
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to delete orchestration master');
      }
    } catch (error) {
      handleApiError(error as Error, 'orchestrationMasters');
      throw error;
    } finally {
      updateLoading('orchestrationMasters', false);
    }
  }, [updateLoading, updateError, handleApiError]);
  
  const loadOrchestrationMasters = useCallback(async (): Promise<void> => {
    updateLoading('orchestrationMasters', true);
    updateError('orchestrationMasters', null);
    
    try {
      const response = await racineOrchestrationAPI.listOrchestrationMasters(
        config.initialPagination,
        config.initialFilters
      );
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          orchestrationMasters: response.data!,
          currentOrchestration: response.data!.length > 0 && !prev.currentOrchestration ? 
            response.data![0] : prev.currentOrchestration
        }));
      } else {
        console.warn('Failed to load orchestration masters:', response.error?.message || 'Unknown');
        setState(prev => ({
          ...prev,
          orchestrationMasters: [],
        }));
      }
    } catch (error) {
      handleApiError(error as Error, 'orchestrationMasters');
    } finally {
      updateLoading('orchestrationMasters', false);
    }
  }, [config.initialPagination, config.initialFilters, updateLoading, updateError, handleApiError]);
  
  const selectOrchestration = useCallback((orchestration: OrchestrationResponse) => {
    setState(prev => ({ ...prev, currentOrchestration: orchestration }));
  }, []);
  
  // =============================================================================
  // SYSTEM HEALTH MONITORING
  // =============================================================================
  
  const refreshSystemHealth = useCallback(async (): Promise<void> => {
    updateLoading('systemHealth', true);
    updateError('systemHealth', null);
    
    try {
      const response = await racineOrchestrationAPI.getSystemHealth();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          systemHealth: response.data!,
          groupsHealth: response.data!.groups,
          servicesHealth: response.data!.services,
          integrationsHealth: response.data!.integrations,
          lastSync: new Date().toISOString(),
          isConnected: true
        }));
      } else {
        // Handle API failure gracefully instead of throwing
        console.warn('Failed to load system health from API:', response.error?.message || 'Unknown error');
        
        // Set default offline health status
        const defaultHealth: SystemHealthResponse = {
          overall: 'offline' as SystemStatus,
          groups: {},
          services: {},
          integrations: {},
          performance: {
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            diskUsage: 0,
            networkLatency: 0,
            activeConnections: 0,
            queueDepth: 0
          },
          lastCheck: new Date().toISOString(),
          uptime: 0,
          version: 'offline',
          alerts: []
        };
        
        setState(prev => ({
          ...prev,
          systemHealth: defaultHealth,
          groupsHealth: {},
          servicesHealth: {},
          integrationsHealth: {},
          lastSync: new Date().toISOString(),
          isConnected: false
        }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isConnected: false }));
      handleApiError(error as Error, 'systemHealth');
    } finally {
      updateLoading('systemHealth', false);
    }
  }, [updateLoading, updateError, handleApiError]);
  
  const refreshGroupHealth = useCallback(async (groupId: string): Promise<void> => {
    try {
      const response = await racineOrchestrationAPI.getGroupHealth(groupId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          groupsHealth: {
            ...prev.groupsHealth,
            [groupId]: response.data!
          }
        }));
      }
    } catch (error) {
      handleApiError(error as Error, 'systemHealth');
    }
  }, [handleApiError]);
  
  const refreshServiceHealth = useCallback(async (serviceId: string): Promise<void> => {
    try {
      const response = await racineOrchestrationAPI.getServiceHealth(serviceId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          servicesHealth: {
            ...prev.servicesHealth,
            [serviceId]: response.data!
          }
        }));
      }
    } catch (error) {
      handleApiError(error as Error, 'systemHealth');
    }
  }, [handleApiError]);
  
  const refreshIntegrationHealth = useCallback(async (integrationId: UUID): Promise<void> => {
    try {
      const response = await racineOrchestrationAPI.getIntegrationHealth(integrationId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          integrationsHealth: {
            ...prev.integrationsHealth,
            [integrationId]: response.data!
          }
        }));
      }
    } catch (error) {
      handleApiError(error as Error, 'systemHealth');
    }
  }, [handleApiError]);
  
  // =============================================================================
  // ALERTS MANAGEMENT
  // =============================================================================
  
  const loadAlerts = useCallback(async (): Promise<void> => {
    updateLoading('alerts', true);
    updateError('alerts', null);
    
    try {
      const response = await racineOrchestrationAPI.getSystemAlerts(
        config.initialPagination,
        config.initialFilters
      );
      
      if (response.success && response.data) {
        const alerts = response.data;
        const unacknowledged = alerts.filter(alert => !alert.acknowledged).length;
        const critical = alerts.filter(alert => alert.severity === 'critical').length;
        
        setState(prev => ({
          ...prev,
          systemAlerts: alerts,
          unacknowledgedAlerts: unacknowledged,
          criticalAlerts: critical
        }));
      } else {
        // Handle API failure gracefully instead of throwing
        console.warn('Failed to load alerts from API:', response.error?.message || 'Unknown error');
        
        // Set empty alerts for offline mode
        setState(prev => ({
          ...prev,
          systemAlerts: [],
          unacknowledgedAlerts: 0,
          criticalAlerts: 0
        }));
      }
    } catch (error) {
      handleApiError(error as Error, 'alerts');
    } finally {
      updateLoading('alerts', false);
    }
  }, [config.initialPagination, config.initialFilters, updateLoading, updateError, handleApiError]);
  
  const acknowledgeAlert = useCallback(async (alertId: UUID): Promise<void> => {
    try {
      const response = await racineOrchestrationAPI.acknowledgeAlert(alertId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          systemAlerts: prev.systemAlerts.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          ),
          unacknowledgedAlerts: Math.max(0, prev.unacknowledgedAlerts - 1)
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to acknowledge alert');
      }
    } catch (error) {
      handleApiError(error as Error, 'alerts');
    }
  }, [handleApiError]);
  
  const resolveAlert = useCallback(async (alertId: UUID, resolution?: string): Promise<void> => {
    try {
      const response = await racineOrchestrationAPI.resolveAlert(alertId, resolution);
      
      if (response.success) {
        setState(prev => {
          const alert = prev.systemAlerts.find(a => a.id === alertId);
          const wasCritical = alert?.severity === 'critical';
          const wasUnacknowledged = alert && !alert.acknowledged;
          
          return {
            ...prev,
            systemAlerts: prev.systemAlerts.map(alert =>
              alert.id === alertId ? 
                { ...alert, acknowledged: true, resolvedAt: new Date().toISOString() } : 
                alert
            ),
            unacknowledgedAlerts: wasUnacknowledged ? 
              Math.max(0, prev.unacknowledgedAlerts - 1) : 
              prev.unacknowledgedAlerts,
            criticalAlerts: wasCritical ? 
              Math.max(0, prev.criticalAlerts - 1) : 
              prev.criticalAlerts
          };
        });
      } else {
        throw new Error(response.error?.message || 'Failed to resolve alert');
      }
    } catch (error) {
      handleApiError(error as Error, 'alerts');
    }
  }, [handleApiError]);
  
  // =============================================================================
  // WORKFLOW EXECUTION
  // =============================================================================
  
  const executeWorkflow = useCallback(async (
    request: ExecuteWorkflowRequest
  ): Promise<WorkflowExecutionResponse> => {
    updateLoading('executing', true);
    updateError('executing', null);
    
    try {
      const response = await racineOrchestrationAPI.executeWorkflow(request);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          activeWorkflows: {
            ...prev.activeWorkflows,
            [response.data!.executionId]: response.data!
          }
        }));
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to execute workflow');
      }
    } catch (error) {
      handleApiError(error as Error, 'executing');
      throw error;
    } finally {
      updateLoading('executing', false);
    }
  }, [updateLoading, updateError, handleApiError]);
  
  const getWorkflowStatus = useCallback(async (
    executionId: UUID
  ): Promise<WorkflowExecutionResponse> => {
    try {
      const response = await racineOrchestrationAPI.getWorkflowStatus(executionId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          activeWorkflows: {
            ...prev.activeWorkflows,
            [executionId]: response.data!
          }
        }));
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to get workflow status');
      }
    } catch (error) {
      handleApiError(error as Error, 'workflows');
      throw error;
    }
  }, [handleApiError]);
  
  const controlWorkflow = useCallback(async (
    executionId: UUID,
    action: 'pause' | 'resume' | 'cancel'
  ): Promise<void> => {
    try {
      const response = await racineOrchestrationAPI.controlWorkflow(executionId, action);
      
      if (response.success) {
        // Refresh workflow status after control action
        await getWorkflowStatus(executionId);
      } else {
        throw new Error(response.error?.message || `Failed to ${action} workflow`);
      }
    } catch (error) {
      handleApiError(error as Error, 'workflows');
      throw error;
    }
  }, [getWorkflowStatus, handleApiError]);
  
  const loadWorkflowHistory = useCallback(async (): Promise<void> => {
    updateLoading('workflows', true);
    updateError('workflows', null);
    
    try {
      const response = await racineOrchestrationAPI.getWorkflowHistory(
        undefined,
        config.initialPagination,
        config.initialFilters
      );
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          workflowHistory: response.data!.slice(0, config.maxHistoryItems)
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to load workflow history');
      }
    } catch (error) {
      handleApiError(error as Error, 'workflows');
    } finally {
      updateLoading('workflows', false);
    }
  }, [config.initialPagination, config.initialFilters, config.maxHistoryItems, updateLoading, updateError, handleApiError]);
  
  const subscribeToWorkflowLogs = useCallback((
    executionId: UUID,
    callback: (log: ExecutionLog) => void
  ): (() => void) => {
    const controller = new AbortController();
    
    (async () => {
      try {
        const logStream = racineOrchestrationAPI.getWorkflowLogs(executionId, {
          signal: controller.signal
        });
        
        for await (const log of logStream) {
          if (!controller.signal.aborted) {
            callback(log);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error streaming workflow logs:', error);
        }
      }
    })();
    
    const unsubscribe = () => {
      controller.abort();
    };
    
    logSubscriptions.current.set(executionId, unsubscribe);
    
    return unsubscribe;
  }, []);
  
  // =============================================================================
  // PERFORMANCE AND OPTIMIZATION
  // =============================================================================
  
  const loadMetrics = useCallback(async (): Promise<void> => {
    updateLoading('metrics', true);
    updateError('metrics', null);
    
    try {
      const response = await racineOrchestrationAPI.getMetrics();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          currentMetrics: response.data!,
          metricsHistory: [
            ...prev.metricsHistory.slice(-(config.maxHistoryItems - 1)),
            response.data!
          ]
        }));
      } else {
        // Handle API failure gracefully instead of throwing
        console.warn('Failed to load metrics from API:', response.error?.message || 'Unknown error');
        
        // Set default metrics for offline mode
        const defaultMetrics: PerformanceMetrics = {
          responseTime: {
            average: 0,
            p95: 0,
            p99: 0,
            max: 0
          },
          throughput: {
            requestsPerSecond: 0,
            operationsPerSecond: 0,
            dataProcessed: 0
          },
          resources: {
            memoryUsage: 0,
            cpuUsage: 0,
            diskUsage: 0,
            networkLatency: 0
          },
          errors: {
            totalCount: 0,
            errorRate: 0,
            criticalErrors: 0,
            warningCount: 0
          },
          lastUpdated: new Date().toISOString()
        };
        
        setState(prev => ({
          ...prev,
          currentMetrics: defaultMetrics,
          metricsHistory: [
            ...prev.metricsHistory.slice(-(config.maxHistoryItems - 1)),
            defaultMetrics
          ]
        }));
      }
    } catch (error) {
      handleApiError(error as Error, 'metrics');
    } finally {
      updateLoading('metrics', false);
    }
  }, [config.maxHistoryItems, updateLoading, updateError, handleApiError]);
  
  const optimizePerformance = useCallback(async (
    request: OptimizePerformanceRequest
  ): Promise<PerformanceOptimizationResponse> => {
    updateLoading('optimizing', true);
    updateError('optimizing', null);
    
    try {
      const response = await racineOrchestrationAPI.optimizePerformance(request);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          lastOptimization: response.data!,
          optimizationRecommendations: response.data!.recommendations
        }));
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to optimize performance');
      }
    } catch (error) {
      handleApiError(error as Error, 'optimizing');
      throw error;
    } finally {
      updateLoading('optimizing', false);
    }
  }, [updateLoading, updateError, handleApiError]);
  
  const loadOptimizationRecommendations = useCallback(async (): Promise<void> => {
    updateLoading('optimization', true);
    updateError('optimization', null);
    
    try {
      const response = await racineOrchestrationAPI.getOptimizationRecommendations();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          optimizationRecommendations: response.data!
        }));
      } else {
        // Handle API failure gracefully instead of throwing
        console.warn('Failed to load optimization recommendations from API:', response.error?.message || 'Unknown error');
        
        // Set empty recommendations for offline mode
        setState(prev => ({
          ...prev,
          optimizationRecommendations: []
        }));
      }
    } catch (error) {
      handleApiError(error as Error, 'optimization');
    } finally {
      updateLoading('optimization', false);
    }
  }, [updateLoading, updateError, handleApiError]);
  
  const implementOptimization = useCallback(async (
    recommendationId: UUID,
    dryRun: boolean = false
  ): Promise<void> => {
    updateLoading('optimization', true);
    updateError('optimization', null);
    
    try {
      const response = await racineOrchestrationAPI.implementOptimization(recommendationId, dryRun);
      
      if (response.success) {
        // Refresh recommendations after implementation
        await loadOptimizationRecommendations();
      } else {
        throw new Error(response.error?.message || 'Failed to implement optimization');
      }
    } catch (error) {
      handleApiError(error as Error, 'optimization');
      throw error;
    } finally {
      updateLoading('optimization', false);
    }
  }, [loadOptimizationRecommendations, updateLoading, updateError, handleApiError]);
  
  // =============================================================================
  // REAL-TIME UPDATES
  // =============================================================================
  
  const subscribeToEvents = useCallback((
    eventType: OrchestrationEventType,
    handler: OrchestrationEventHandler
  ): (() => void) => {
    if (!config.enableWebSocket) {
      return () => {};
    }
    
    const subscriptionId = racineOrchestrationAPI.subscribeToEvents(eventType, (event) => {
      // Update websocket connection status
      setState(prev => ({ ...prev, websocketConnected: true }));
      
      // Handle specific event types
      switch (event.type) {
        case OrchestrationEventType.HEALTH_UPDATE:
          refreshSystemHealth();
          break;
        case OrchestrationEventType.WORKFLOW_STARTED:
        case OrchestrationEventType.WORKFLOW_COMPLETED:
        case OrchestrationEventType.WORKFLOW_FAILED:
          if (event.workflowId) {
            getWorkflowStatus(event.workflowId);
          }
          break;
        case OrchestrationEventType.PERFORMANCE_ALERT:
        case OrchestrationEventType.SYSTEM_ALERT:
          loadAlerts();
          break;
        case OrchestrationEventType.METRICS_UPDATE:
          loadMetrics();
          break;
      }
      
      // Call user handler
      handler(event);
    });
    
    subscriptionRefs.current.push(subscriptionId);
    
    return () => {
      racineOrchestrationAPI.unsubscribeFromEvents(subscriptionId);
      subscriptionRefs.current = subscriptionRefs.current.filter(id => id !== subscriptionId);
    };
  }, [config.enableWebSocket, refreshSystemHealth, getWorkflowStatus, loadAlerts, loadMetrics]);
  
  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================
  
  const isHealthy = useCallback((status: SystemStatus): boolean => {
    return status === 'healthy';
  }, []);
  
  const getHealthColor = useCallback((status: SystemStatus): string => {
    switch (status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'failed': return 'red';
      case 'maintenance': return 'blue';
      case 'initializing': return 'gray';
      default: return 'gray';
    }
  }, []);
  
  const formatMetric = useCallback((value: number, type: string): string => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'bytes':
        return formatBytes(value);
      case 'duration':
        return formatDuration(value);
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value);
      default:
        return value.toLocaleString();
    }
  }, []);
  
  const testConnection = useCallback(async (): Promise<boolean> => {
    updateError('connection', null);
    
    try {
      const result = await racineOrchestrationAPI.testConnection();
      setState(prev => ({ ...prev, isConnected: result }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isConnected: false }));
      updateError('connection', (error as Error).message);
      return false;
    }
  }, [updateError]);
  
  const clearCache = useCallback(() => {
    setState(INITIAL_STATE);
    setErrors(INITIAL_ERRORS);
  }, []);
  
  const refreshAll = useCallback(async (): Promise<void> => {
    await Promise.all([
      config.loadOrchestrationMasters && loadOrchestrationMasters(),
      config.loadSystemHealth && refreshSystemHealth(),
      config.loadAlerts && loadAlerts(),
      config.loadMetrics && loadMetrics(),
      loadOptimizationRecommendations()
    ].filter(Boolean));
  }, [
    config.loadOrchestrationMasters,
    config.loadSystemHealth,
    config.loadAlerts,
    config.loadMetrics,
    loadOrchestrationMasters,
    refreshSystemHealth,
    loadAlerts,
    loadMetrics,
    loadOptimizationRecommendations
  ]);
  
  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  // Initialize API and test backend connectivity
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        // Test backend connectivity and set up offline mode
        await racineOrchestrationAPI.testBackendConnectivity();
        
        // Set connection status based on backend availability
        setState(prev => ({ 
          ...prev, 
          isConnected: true // Assume connected if no error during initialization
        }));
        
        console.log('Racine Orchestration API initialized with offline mode support');
      } catch (error) {
        console.warn('Failed to initialize Racine Orchestration API:', error);
        // Set offline mode if initialization fails
        setState(prev => ({ ...prev, isConnected: false }));
      }
    };
    
    initializeAPI();
  }, []);
  
  // Initial data loading
  useEffect(() => {
    if (config.autoLoadData) {
      refreshAll();
    }
  }, [config.autoLoadData, refreshAll]);
  
  // Setup auto-refresh intervals
  useEffect(() => {
    if (config.enableRealTimeUpdates) {
      // Health monitoring interval
      if (config.healthRefreshInterval > 0) {
        const healthInterval = setInterval(refreshSystemHealth, config.healthRefreshInterval);
        intervalRefs.current.push(healthInterval);
      }
      
      // Metrics interval
      if (config.metricsRefreshInterval > 0) {
        const metricsInterval = setInterval(loadMetrics, config.metricsRefreshInterval);
        intervalRefs.current.push(metricsInterval);
      }
      
      // Alerts interval
      if (config.alertsRefreshInterval > 0) {
        const alertsInterval = setInterval(loadAlerts, config.alertsRefreshInterval);
        intervalRefs.current.push(alertsInterval);
      }
    }
    
    return () => {
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
    };
  }, [
    config.enableRealTimeUpdates,
    config.healthRefreshInterval,
    config.metricsRefreshInterval,
    config.alertsRefreshInterval,
    refreshSystemHealth,
    loadMetrics,
    loadAlerts
  ]);
  
  // Monitor WebSocket connection
  useEffect(() => {
    if (config.enableWebSocket) {
      const checkConnection = () => {
        const connected = racineOrchestrationAPI.isWebSocketConnected();
        setState(prev => ({ ...prev, websocketConnected: connected }));
      };
      
      const connectionInterval = setInterval(checkConnection, 5000);
      intervalRefs.current.push(connectionInterval);
      
      return () => clearInterval(connectionInterval);
    }
  }, [config.enableWebSocket]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear intervals
      intervalRefs.current.forEach(clearInterval);
      
      // Unsubscribe from events
      subscriptionRefs.current.forEach(id => 
        racineOrchestrationAPI.unsubscribeFromEvents(id)
      );
      
      // Clear log subscriptions
      logSubscriptions.current.forEach(unsubscribe => unsubscribe());
      logSubscriptions.current.clear();
      
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================
  
  return {
    // State
    state,
    loading,
    errors,
    
    // Master orchestration management
    createOrchestrationMaster,
    updateOrchestrationMaster,
    deleteOrchestrationMaster,
    loadOrchestrationMasters,
    selectOrchestration,
    
    // System health monitoring
    refreshSystemHealth,
    refreshGroupHealth,
    refreshServiceHealth,
    refreshIntegrationHealth,
    monitorSystemHealth: refreshSystemHealth, // Alias for compatibility
    
    // Alerts management
    loadAlerts,
    acknowledgeAlert,
    resolveAlert,
    
    // Workflow execution
    executeWorkflow,
    getWorkflowStatus,
    controlWorkflow,
    loadWorkflowHistory,
    subscribeToWorkflowLogs,
    
    // Performance and optimization
    loadMetrics,
    optimizePerformance,
    loadOptimizationRecommendations,
    implementOptimization,
    
    // Real-time updates
    subscribeToEvents,
    
    // Layout tracking
    trackLayoutEvent: (eventData: any) => {
      // Track layout events for analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'layout_change', eventData);
      }
      
      // Send to backend if connected
      if (state.isConnected) {
        racineOrchestrationAPI.trackEvent('layout_event', eventData).catch(console.error);
      }
      
      // Log for debugging
      if ((typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development') {
        console.log('Layout Event:', eventData);
      }
    },
    
    // Utility functions
    isHealthy,
    getHealthColor,
    formatMetric,
    testConnection,
    
    // Cache management
    clearCache,
    refreshAll
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type {
  OrchestrationState,
  OrchestrationLoading,
  OrchestrationErrors,
  UseOrchestrationOptions,
  UseOrchestrationReturn
};
