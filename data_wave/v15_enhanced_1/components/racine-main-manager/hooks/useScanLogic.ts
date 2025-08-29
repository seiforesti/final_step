// useScanLogic Hook - Advanced Scan Logic Integration and Orchestration
// Integrates with existing Advanced-Scan-Logic SPA for racine-level coordination

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import existing scan logic services
import { racineScanLogicAPI } from '../services/scan-logic-apis';
import { racineOrchestrationAPI } from '../services/racine-orchestration-apis';

// Import types
import type {
  ScanLogicConfig,
  ScanLogicStatus,
  ScanLogicMetrics,
  ScanLogicWorkflow,
  ScanLogicResult,
  ScanLogicOptimization,
  ScanLogicAnalytics,
  ScanLogicCoordination,
  RacineResponse,
  APIError,
  WorkspaceContext,
  UserPermissions
} from '../types';

// Import utilities
import { scanLogicUtils } from '../utils/scan-logic-utils';
import { coordinateServices, validateIntegration, optimizeExecution, handleErrors } from '../utils/cross-group-orchestrator';
import { contextAnalyzer } from '../utils/context-analyzer';

/**
 * Comprehensive scan logic state interface
 */
export interface ScanLogicState {
  // Core scan logic state
  scanConfigs: ScanLogicConfig[];
  activeScanCount: number;
  scanQueue: ScanLogicWorkflow[];
  scanHistory: ScanLogicResult[];
  scanMetrics: ScanLogicMetrics | null;
  
  // Performance state
  performance: {
    throughput: number;
    latency: number;
    errorRate: number;
    resourceUsage: number;
  };
  
  // Coordination state
  coordination: {
    crossGroupScans: ScanLogicCoordination[];
    workspaceScans: Record<string, ScanLogicWorkflow[]>;
    collaborativeScans: ScanLogicWorkflow[];
  };
  
  // Real-time state
  realTimeUpdates: {
    scanProgress: Record<string, number>;
    scanStatus: Record<string, ScanLogicStatus>;
    scanAlerts: any[];
  };
  
  // Loading and error states
  isLoading: boolean;
  error: APIError | null;
  isInitialized: boolean;
}

/**
 * Scan logic management methods interface
 */
export interface ScanLogicMethods {
  // Core scan operations
  createScanConfig: (config: Partial<ScanLogicConfig>) => Promise<ScanLogicConfig>;
  updateScanConfig: (id: string, updates: Partial<ScanLogicConfig>) => Promise<ScanLogicConfig>;
  deleteScanConfig: (id: string) => Promise<void>;
  executeScan: (configId: string, options?: any) => Promise<ScanLogicResult>;
  
  // Scan management
  startScan: (workflowId: string) => Promise<void>;
  pauseScan: (workflowId: string) => Promise<void>;
  stopScan: (workflowId: string) => Promise<void>;
  restartScan: (workflowId: string) => Promise<void>;
  
  // Advanced operations
  optimizeScan: (configId: string) => Promise<ScanLogicOptimization>;
  analyzeScanPerformance: (scanId: string) => Promise<ScanLogicAnalytics>;
  coordinateCrossGroupScan: (coordination: ScanLogicCoordination) => Promise<void>;
  
  // Workspace integration
  getScansByWorkspace: (workspaceId: string) => Promise<ScanLogicWorkflow[]>;
  createWorkspaceScan: (workspaceId: string, config: Partial<ScanLogicConfig>) => Promise<ScanLogicWorkflow>;
  
  // Real-time operations
  subscribeScanUpdates: (scanId: string, callback: (update: any) => void) => () => void;
  getScanProgress: (scanId: string) => number;
  getScanStatus: (scanId: string) => ScanLogicStatus;
  
  // Utility methods
  refreshScanLogic: () => Promise<void>;
  clearScanHistory: () => Promise<void>;
  exportScanResults: (scanIds: string[]) => Promise<Blob>;
}

/**
 * Hook options interface
 */
export interface UseScanLogicOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  workspaceId?: string;
  enableOptimization?: boolean;
  enableCoordination?: boolean;
}

/**
 * Main hook return interface
 */
export interface UseScanLogicReturn extends ScanLogicState, ScanLogicMethods {
  // Query states
  isRefreshing: boolean;
  lastUpdated: Date | null;
  
  // Advanced features
  optimization: {
    suggestions: ScanLogicOptimization[];
    applyOptimization: (optimization: ScanLogicOptimization) => Promise<void>;
  };
  
  // Analytics
  analytics: {
    scanTrends: any[];
    performanceMetrics: ScanLogicMetrics;
    generateReport: () => Promise<Blob>;
  };
  
  // Integration status
  integrationStatus: {
    existingSPAConnected: boolean;
    crossGroupEnabled: boolean;
    workspaceIntegrated: boolean;
  };
}

/**
 * Advanced Scan Logic Hook with racine-level orchestration
 */
export function useScanLogic(options: UseScanLogicOptions = {}): UseScanLogicReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealTime = true,
    workspaceId,
    enableOptimization = true,
    enableCoordination = true
  } = options;

  const queryClient = useQueryClient();
  const [error, setError] = useState<APIError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  // Core scan configurations query
  const {
    data: scanConfigs = [],
    isLoading: isLoadingConfigs,
    error: configsError,
    refetch: refetchConfigs
  } = useQuery({
    queryKey: ['scanLogic', 'configs', workspaceId],
    queryFn: () => racineScanLogicAPI.getScanConfigs(workspaceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Active scans query
  const {
    data: activeScans = [],
    isLoading: isLoadingScans,
    refetch: refetchScans
  } = useQuery({
    queryKey: ['scanLogic', 'activeScans', workspaceId],
    queryFn: () => racineScanLogicAPI.getActiveScans(workspaceId),
    refetchInterval: autoRefresh ? 5000 : false,
    enabled: true
  });

  // Scan metrics query
  const {
    data: scanMetrics,
    isLoading: isLoadingMetrics,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['scanLogic', 'metrics', workspaceId],
    queryFn: () => racineScanLogicAPI.getScanMetrics(workspaceId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled: true
  });

  // Scan history query
  const {
    data: scanHistory = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['scanLogic', 'history', workspaceId],
    queryFn: () => racineScanLogicAPI.getScanHistory(workspaceId),
    enabled: true
  });

  // Cross-group coordination query
  const {
    data: crossGroupScans = [],
    isLoading: isLoadingCoordination,
    refetch: refetchCoordination
  } = useQuery({
    queryKey: ['scanLogic', 'crossGroup', workspaceId],
    queryFn: () => racineOrchestrationAPI.getCrossGroupScans(workspaceId),
    enabled: enableCoordination,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Optimization suggestions query
  const {
    data: optimizationSuggestions = [],
    refetch: refetchOptimizations
  } = useQuery({
    queryKey: ['scanLogic', 'optimizations', workspaceId],
    queryFn: () => racineScanLogicAPI.getOptimizationSuggestions(workspaceId),
    enabled: enableOptimization,
    refetchInterval: autoRefresh ? refreshInterval * 2 : false
  });

  // Create scan configuration mutation
  const createScanConfigMutation = useMutation({
    mutationFn: (config: Partial<ScanLogicConfig>) => 
      racineScanLogicAPI.createScanConfig(config, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'configs'] });
    },
    onError: (error: APIError) => setError(error)
  });

  // Update scan configuration mutation
  const updateScanConfigMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ScanLogicConfig> }) =>
      racineScanLogicAPI.updateScanConfig(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'configs'] });
    },
    onError: (error: APIError) => setError(error)
  });

  // Delete scan configuration mutation
  const deleteScanConfigMutation = useMutation({
    mutationFn: (id: string) => racineScanLogicAPI.deleteScanConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'configs'] });
    },
    onError: (error: APIError) => setError(error)
  });

  // Execute scan mutation
  const executeScanMutation = useMutation({
    mutationFn: ({ configId, options }: { configId: string; options?: any }) =>
      racineScanLogicAPI.executeScan(configId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'activeScans'] });
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'history'] });
    },
    onError: (error: APIError) => setError(error)
  });

  // Scan control mutations
  const startScanMutation = useMutation({
    mutationFn: (workflowId: string) => racineScanLogicAPI.startScan(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'activeScans'] });
    }
  });

  const pauseScanMutation = useMutation({
    mutationFn: (workflowId: string) => racineScanLogicAPI.pauseScan(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'activeScans'] });
    }
  });

  const stopScanMutation = useMutation({
    mutationFn: (workflowId: string) => racineScanLogicAPI.stopScan(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'activeScans'] });
    }
  });

  // Advanced optimization mutation
  const optimizeScanMutation = useMutation({
    mutationFn: (configId: string) => racineScanLogicAPI.optimizeScan(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'optimizations'] });
    }
  });

  // Cross-group coordination mutation
  const coordinateCrossGroupScanMutation = useMutation({
    mutationFn: (coordination: ScanLogicCoordination) =>
      racineOrchestrationAPI.coordinateCrossGroupScan(coordination),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanLogic', 'crossGroup'] });
    }
  });

  // Initialize scan logic integration
  useEffect(() => {
    const initializeScanLogic = async () => {
      try {
        // Initialize integration with existing Advanced-Scan-Logic SPA
        await racineOrchestrationAPI.initializeScanLogicIntegration(workspaceId);
        
        // Set up cross-group coordination if enabled
        if (enableCoordination) {
          await crossGroupOrchestrator.initializeScanCoordination(workspaceId);
        }
        
        setIsInitialized(true);
      } catch (error) {
        setError(error as APIError);
      }
    };

    initializeScanLogic();
  }, [workspaceId, enableCoordination]);

  // Real-time updates setup
  useEffect(() => {
    if (!enableRealTime || !isInitialized) return;

    const setupRealTimeUpdates = async () => {
      try {
        // Subscribe to scan status updates
        const scanUpdatesSubscription = await racineScanLogicAPI.subscribeToScanUpdates(
          workspaceId,
          (update) => {
            queryClient.setQueryData(
              ['scanLogic', 'activeScans', workspaceId],
              (oldData: any[]) => scanLogicUtils.updateScanInList(oldData, update)
            );
          }
        );

        subscriptionsRef.current.set('scanUpdates', scanUpdatesSubscription);
      } catch (error) {
        console.error('Failed to setup real-time updates:', error);
      }
    };

    setupRealTimeUpdates();

    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, [enableRealTime, isInitialized, workspaceId, queryClient]);

  // Computed state
  const activeScanCount = activeScans.length;
  const performance = scanMetrics?.performance || {
    throughput: 0,
    latency: 0,
    errorRate: 0,
    resourceUsage: 0
  };

  const coordination = {
    crossGroupScans,
    workspaceScans: scanLogicUtils.groupScansByWorkspace(activeScans),
    collaborativeScans: activeScans.filter(scan => scan.isCollaborative)
  };

  const realTimeUpdates = {
    scanProgress: scanLogicUtils.extractScanProgress(activeScans),
    scanStatus: scanLogicUtils.extractScanStatus(activeScans),
    scanAlerts: scanMetrics?.alerts || []
  };

  const isLoading = isLoadingConfigs || isLoadingScans || isLoadingMetrics;

  // Methods implementation
  const createScanConfig = useCallback(async (config: Partial<ScanLogicConfig>) => {
    const result = await createScanConfigMutation.mutateAsync(config);
    return result;
  }, [createScanConfigMutation]);

  const updateScanConfig = useCallback(async (id: string, updates: Partial<ScanLogicConfig>) => {
    const result = await updateScanConfigMutation.mutateAsync({ id, updates });
    return result;
  }, [updateScanConfigMutation]);

  const deleteScanConfig = useCallback(async (id: string) => {
    await deleteScanConfigMutation.mutateAsync(id);
  }, [deleteScanConfigMutation]);

  const executeScan = useCallback(async (configId: string, options?: any) => {
    const result = await executeScanMutation.mutateAsync({ configId, options });
    return result;
  }, [executeScanMutation]);

  const startScan = useCallback(async (workflowId: string) => {
    await startScanMutation.mutateAsync(workflowId);
  }, [startScanMutation]);

  const pauseScan = useCallback(async (workflowId: string) => {
    await pauseScanMutation.mutateAsync(workflowId);
  }, [pauseScanMutation]);

  const stopScan = useCallback(async (workflowId: string) => {
    await stopScanMutation.mutateAsync(workflowId);
  }, [stopScanMutation]);

  const restartScan = useCallback(async (workflowId: string) => {
    await racineScanLogicAPI.restartScan(workflowId);
    await refetchScans();
  }, [refetchScans]);

  const optimizeScan = useCallback(async (configId: string) => {
    const result = await optimizeScanMutation.mutateAsync(configId);
    return result;
  }, [optimizeScanMutation]);

  const analyzeScanPerformance = useCallback(async (scanId: string) => {
    return await racineScanLogicAPI.analyzeScanPerformance(scanId);
  }, []);

  const coordinateCrossGroupScan = useCallback(async (coordination: ScanLogicCoordination) => {
    await coordinateCrossGroupScanMutation.mutateAsync(coordination);
  }, [coordinateCrossGroupScanMutation]);

  const getScansByWorkspace = useCallback(async (workspaceId: string) => {
    return await racineScanLogicAPI.getScansByWorkspace(workspaceId);
  }, []);

  const createWorkspaceScan = useCallback(async (workspaceId: string, config: Partial<ScanLogicConfig>) => {
    return await racineScanLogicAPI.createWorkspaceScan(workspaceId, config);
  }, []);

  const subscribeScanUpdates = useCallback((scanId: string, callback: (update: any) => void) => {
    const unsubscribe = racineScanLogicAPI.subscribeScanUpdates(scanId, callback);
    return unsubscribe;
  }, []);

  const getScanProgress = useCallback((scanId: string) => {
    return realTimeUpdates.scanProgress[scanId] || 0;
  }, [realTimeUpdates.scanProgress]);

  const getScanStatus = useCallback((scanId: string) => {
    return realTimeUpdates.scanStatus[scanId] || 'unknown';
  }, [realTimeUpdates.scanStatus]);

  const refreshScanLogic = useCallback(async () => {
    await Promise.all([
      refetchConfigs(),
      refetchScans(),
      refetchMetrics(),
      refetchHistory(),
      refetchCoordination()
    ]);
  }, [refetchConfigs, refetchScans, refetchMetrics, refetchHistory, refetchCoordination]);

  const clearScanHistory = useCallback(async () => {
    await racineScanLogicAPI.clearScanHistory(workspaceId);
    await refetchHistory();
  }, [workspaceId, refetchHistory]);

  const exportScanResults = useCallback(async (scanIds: string[]) => {
    return await racineScanLogicAPI.exportScanResults(scanIds);
  }, []);

  // Advanced features
  const applyOptimization = useCallback(async (optimization: ScanLogicOptimization) => {
    await racineScanLogicAPI.applyOptimization(optimization);
    await refetchOptimizations();
  }, [refetchOptimizations]);

  const generateReport = useCallback(async () => {
    return await racineScanLogicAPI.generateAnalyticsReport(workspaceId);
  }, [workspaceId]);

  // Integration status
  const integrationStatus = {
    existingSPAConnected: isInitialized,
    crossGroupEnabled: enableCoordination && crossGroupScans.length > 0,
    workspaceIntegrated: !!workspaceId && isInitialized
  };

  return {
    // State
    scanConfigs,
    activeScanCount,
    scanQueue: activeScans,
    scanHistory,
    scanMetrics,
    performance,
    coordination,
    realTimeUpdates,
    isLoading,
    error: error || configsError,
    isInitialized,

    // Query states
    isRefreshing: createScanConfigMutation.isPending || updateScanConfigMutation.isPending,
    lastUpdated: new Date(),

    // Core methods
    createScanConfig,
    updateScanConfig,
    deleteScanConfig,
    executeScan,
    startScan,
    pauseScan,
    stopScan,
    restartScan,
    optimizeScan,
    analyzeScanPerformance,
    coordinateCrossGroupScan,
    getScansByWorkspace,
    createWorkspaceScan,
    subscribeScanUpdates,
    getScanProgress,
    getScanStatus,
    refreshScanLogic,
    clearScanHistory,
    exportScanResults,

    // Advanced features
    optimization: {
      suggestions: optimizationSuggestions,
      applyOptimization
    },
    analytics: {
      scanTrends: scanMetrics?.trends || [],
      performanceMetrics: scanMetrics || {} as ScanLogicMetrics,
      generateReport
    },
    integrationStatus
  };
}

export default useScanLogic;
