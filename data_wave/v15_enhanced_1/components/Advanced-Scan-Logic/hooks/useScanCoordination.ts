// Advanced-Scan-Logic/hooks/useScanCoordination.ts
// Comprehensive React hook for scan coordination with multi-system management

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ScanCoordination,
  CoordinatedScan,
  CrossSystemDependency,
  ResourceConflict,
  CoordinationType,
  CoordinationStatus,
  SynchronizationMode,
  FailureHandling,
  PriorityStrategy,
  ResourceAllocationStrategy,
  CoordinationMetrics,
  SystemHealth,
  LoadBalancing,
  CoordinationFilters,
  CoordinationSort
} from '../types/coordination.types';
import { scanCoordinationAPI } from '../services/scan-coordination-apis';

// Hook options interface
interface UseScanCoordinationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  enableConflictAlerts?: boolean;
  onCoordinationComplete?: (coordination: ScanCoordination) => void;
  onCoordinationFailed?: (coordination: ScanCoordination) => void;
  onConflictDetected?: (conflict: ResourceConflict) => void;
  onSystemFailure?: (systemId: string, error: string) => void;
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
interface UseScanCoordinationReturn {
  // Coordinations
  coordinations: ScanCoordination[];
  coordinationsLoading: boolean;
  coordinationsError: Error | null;
  
  // Conflicts
  conflicts: ResourceConflict[];
  conflictsLoading: boolean;
  conflictsError: Error | null;
  
  // Dependencies
  dependencies: CrossSystemDependency[];
  dependenciesLoading: boolean;
  dependenciesError: Error | null;
  
  // Metrics
  metrics: CoordinationMetrics | null;
  metricsLoading: boolean;
  metricsError: Error | null;
  
  // System Health
  systemHealth: SystemHealth[];
  healthLoading: boolean;
  healthError: Error | null;
  
  // State management
  selectedCoordination: ScanCoordination | null;
  selectedConflict: ResourceConflict | null;
  filters: CoordinationFilters;
  sort: CoordinationSort;
  pagination: PaginationState;
  
  // Actions
  setSelectedCoordination: (coordination: ScanCoordination | null) => void;
  setSelectedConflict: (conflict: ResourceConflict | null) => void;
  setFilters: (filters: Partial<CoordinationFilters>) => void;
  setSort: (sort: CoordinationSort) => void;
  setPagination: (page: number, size?: number) => void;
  
  // Coordination operations
  initiateCoordination: (request: any) => Promise<ScanCoordination>;
  pauseCoordination: (coordinationId: string) => Promise<void>;
  resumeCoordination: (coordinationId: string) => Promise<void>;
  cancelCoordination: (coordinationId: string) => Promise<void>;
  rebalanceCoordination: (coordinationId: string) => Promise<void>;
  
  // Conflict management
  resolveConflict: (conflictId: string, resolution: any) => Promise<void>;
  escalateConflict: (conflictId: string, escalation: any) => Promise<void>;
  ignoreConflict: (conflictId: string, reason: string) => Promise<void>;
  
  // Dependency management
  addDependency: (dependency: any) => Promise<CrossSystemDependency>;
  removeDependency: (dependencyId: string) => Promise<void>;
  updateDependency: (dependencyId: string, updates: any) => Promise<CrossSystemDependency>;
  validateDependencies: (systemId: string) => Promise<any>;
  
  // Load balancing
  redistributeLoad: (strategy: ResourceAllocationStrategy) => Promise<void>;
  optimizeAllocation: (coordinationId: string) => Promise<void>;
  getLoadBalancingRecommendations: () => Promise<any[]>;
  
  // System management
  registerSystem: (systemConfig: any) => Promise<void>;
  unregisterSystem: (systemId: string) => Promise<void>;
  updateSystemConfig: (systemId: string, config: any) => Promise<void>;
  checkSystemHealth: (systemId: string) => Promise<SystemHealth>;
  
  // Analytics
  getCoordinationAnalytics: (timeRange?: string) => Promise<any>;
  getResourceUtilization: (systemId?: string) => Promise<any>;
  getPerformanceMetrics: (coordinationId: string) => Promise<any>;
  
  // Utility functions
  getCoordinationStatusColor: (status: CoordinationStatus) => string;
  getCoordinationTypeLabel: (type: CoordinationType) => string;
  getPriorityColor: (priority: string) => string;
  calculateResourceUtilization: (coordination: ScanCoordination) => number;
  getEstimatedCompletion: (coordination: ScanCoordination) => Date | null;
  
  // Real-time subscriptions
  subscribeToCoordinationUpdates: (coordinationId: string) => void;
  unsubscribeFromCoordinationUpdates: () => void;
  subscribeToConflictAlerts: () => void;
  unsubscribeFromConflictAlerts: () => void;
  
  // Loading states
  isLoading: boolean;
  isCoordinating: boolean;
  isResolving: boolean;
}

export const useScanCoordination = (options: UseScanCoordinationOptions = {}): UseScanCoordinationReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 20000, // 20 seconds for coordination
    enableRealTimeUpdates = true,
    enableConflictAlerts = true,
    onCoordinationComplete,
    onCoordinationFailed,
    onConflictDetected,
    onSystemFailure,
    onError
  } = options;

  const queryClient = useQueryClient();
  const coordinationWsRef = useRef<WebSocket | null>(null);
  const conflictWsRef = useRef<WebSocket | null>(null);

  // State management
  const [selectedCoordination, setSelectedCoordination] = useState<ScanCoordination | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<ResourceConflict | null>(null);
  const [filters, setFiltersState] = useState<CoordinationFilters>({});
  const [sort, setSortState] = useState<CoordinationSort>({ field: 'created_at', direction: 'desc' });
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    size: 20,
    total: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Query for coordinations
  const {
    data: coordinationsData,
    isLoading: coordinationsLoading,
    error: coordinationsError,
    refetch: refetchCoordinations
  } = useQuery({
    queryKey: ['scan-coordinations', filters, sort, pagination.page, pagination.size],
    queryFn: () => scanCoordinationAPI.getCoordinations({
      ...filters,
      sort,
      page: pagination.page,
      size: pagination.size
    }),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 15000
  });

  // Query for conflicts
  const {
    data: conflictsData,
    isLoading: conflictsLoading,
    error: conflictsError,
    refetch: refetchConflicts
  } = useQuery({
    queryKey: ['scan-conflicts'],
    queryFn: () => scanCoordinationAPI.getResourceConflicts(),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000 // More frequent updates for conflicts
  });

  // Query for dependencies
  const {
    data: dependenciesData,
    isLoading: dependenciesLoading,
    error: dependenciesError,
    refetch: refetchDependencies
  } = useQuery({
    queryKey: ['cross-system-dependencies'],
    queryFn: () => scanCoordinationAPI.getCrossSystemDependencies(),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Query for coordination metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError
  } = useQuery({
    queryKey: ['coordination-metrics'],
    queryFn: () => scanCoordinationAPI.getCoordinationMetrics(),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000
  });

  // Query for system health
  const {
    data: systemHealthData,
    isLoading: healthLoading,
    error: healthError
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => scanCoordinationAPI.getSystemHealth(),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Mutations for coordination operations
  const initiateCoordinationMutation = useMutation({
    mutationFn: scanCoordinationAPI.coordinateScans,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['scan-coordinations']);
      toast.success('Scan coordination initiated successfully');
      setSelectedCoordination(data.coordination);
    },
    onError: (error: Error) => {
      toast.error(`Failed to initiate coordination: ${error.message}`);
      onError?.(error);
    }
  });

  const pauseCoordinationMutation = useMutation({
    mutationFn: scanCoordinationAPI.pauseCoordination,
    onSuccess: () => {
      queryClient.invalidateQueries(['scan-coordinations']);
      toast.success('Coordination paused');
    },
    onError: (error: Error) => {
      toast.error(`Failed to pause coordination: ${error.message}`);
      onError?.(error);
    }
  });

  const resumeCoordinationMutation = useMutation({
    mutationFn: scanCoordinationAPI.resumeCoordination,
    onSuccess: () => {
      queryClient.invalidateQueries(['scan-coordinations']);
      toast.success('Coordination resumed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resume coordination: ${error.message}`);
      onError?.(error);
    }
  });

  const cancelCoordinationMutation = useMutation({
    mutationFn: scanCoordinationAPI.cancelCoordination,
    onSuccess: () => {
      queryClient.invalidateQueries(['scan-coordinations']);
      toast.success('Coordination cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel coordination: ${error.message}`);
      onError?.(error);
    }
  });

  // Mutations for conflict resolution
  const resolveConflictMutation = useMutation({
    mutationFn: ({ conflictId, resolution }: { conflictId: string; resolution: any }) =>
      scanCoordinationAPI.resolveResourceConflict(conflictId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries(['scan-conflicts']);
      queryClient.invalidateQueries(['scan-coordinations']);
      toast.success('Resource conflict resolved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resolve conflict: ${error.message}`);
      onError?.(error);
    }
  });

  const addDependencyMutation = useMutation({
    mutationFn: scanCoordinationAPI.addCrossSystemDependency,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cross-system-dependencies']);
      toast.success('Dependency added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add dependency: ${error.message}`);
      onError?.(error);
    }
  });

  // Utility functions
  const getCoordinationStatusColor = useCallback((status: CoordinationStatus): string => {
    const statusColors = {
      [CoordinationStatus.PENDING]: 'text-gray-500',
      [CoordinationStatus.PLANNING]: 'text-blue-500',
      [CoordinationStatus.EXECUTING]: 'text-green-500',
      [CoordinationStatus.PAUSED]: 'text-yellow-500',
      [CoordinationStatus.COMPLETED]: 'text-green-600',
      [CoordinationStatus.FAILED]: 'text-red-500',
      [CoordinationStatus.CANCELLED]: 'text-gray-400',
      [CoordinationStatus.TIMEOUT]: 'text-orange-500'
    };
    return statusColors[status] || 'text-gray-500';
  }, []);

  const getCoordinationTypeLabel = useCallback((type: CoordinationType): string => {
    const typeLabels = {
      [CoordinationType.SEQUENTIAL]: 'Sequential',
      [CoordinationType.PARALLEL]: 'Parallel',
      [CoordinationType.PIPELINE]: 'Pipeline',
      [CoordinationType.BATCH]: 'Batch',
      [CoordinationType.STREAM]: 'Streaming',
      [CoordinationType.HYBRID]: 'Hybrid',
      [CoordinationType.ADAPTIVE]: 'Adaptive'
    };
    return typeLabels[type] || 'Unknown';
  }, []);

  const getPriorityColor = useCallback((priority: string): string => {
    const priorityColors = {
      critical: 'text-red-600',
      high: 'text-orange-500',
      normal: 'text-blue-500',
      low: 'text-gray-500'
    };
    return priorityColors[priority.toLowerCase()] || 'text-gray-500';
  }, []);

  const calculateResourceUtilization = useCallback((coordination: ScanCoordination): number => {
    if (!coordination.resource_allocation) return 0;
    
    const allocated = coordination.resource_allocation.allocated_resources || 0;
    const total = coordination.resource_allocation.total_resources || 1;
    
    return Math.round((allocated / total) * 100);
  }, []);

  const getEstimatedCompletion = useCallback((coordination: ScanCoordination): Date | null => {
    if (!coordination.started_at || coordination.status === CoordinationStatus.COMPLETED) return null;
    
    const progress = coordination.progress_percentage || 0;
    if (progress === 0) return null;
    
    const elapsed = Date.now() - new Date(coordination.started_at).getTime();
    const totalEstimate = (elapsed / progress) * 100;
    const remaining = totalEstimate - elapsed;
    
    return new Date(Date.now() + remaining);
  }, []);

  // Action handlers
  const setFilters = useCallback((newFilters: Partial<CoordinationFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setSort = useCallback((newSort: CoordinationSort) => {
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

  // Coordination operations
  const initiateCoordination = useCallback(async (request: any): Promise<ScanCoordination> => {
    const result = await initiateCoordinationMutation.mutateAsync(request);
    return result.coordination;
  }, [initiateCoordinationMutation]);

  const pauseCoordination = useCallback(async (coordinationId: string): Promise<void> => {
    return pauseCoordinationMutation.mutateAsync(coordinationId);
  }, [pauseCoordinationMutation]);

  const resumeCoordination = useCallback(async (coordinationId: string): Promise<void> => {
    return resumeCoordinationMutation.mutateAsync(coordinationId);
  }, [resumeCoordinationMutation]);

  const cancelCoordination = useCallback(async (coordinationId: string): Promise<void> => {
    return cancelCoordinationMutation.mutateAsync(coordinationId);
  }, [cancelCoordinationMutation]);

  const rebalanceCoordination = useCallback(async (coordinationId: string): Promise<void> => {
    try {
      await scanCoordinationAPI.rebalanceCoordination(coordinationId);
      queryClient.invalidateQueries(['scan-coordinations']);
      toast.success('Coordination rebalanced successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to rebalance coordination: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  // Conflict management
  const resolveConflict = useCallback(async (conflictId: string, resolution: any): Promise<void> => {
    return resolveConflictMutation.mutateAsync({ conflictId, resolution });
  }, [resolveConflictMutation]);

  const escalateConflict = useCallback(async (conflictId: string, escalation: any): Promise<void> => {
    try {
      await scanCoordinationAPI.escalateResourceConflict(conflictId, escalation);
      queryClient.invalidateQueries(['scan-conflicts']);
      toast.success('Conflict escalated successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to escalate conflict: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const ignoreConflict = useCallback(async (conflictId: string, reason: string): Promise<void> => {
    try {
      await scanCoordinationAPI.ignoreResourceConflict(conflictId, reason);
      queryClient.invalidateQueries(['scan-conflicts']);
      toast.success('Conflict ignored');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to ignore conflict: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  // Dependency management
  const addDependency = useCallback(async (dependency: any): Promise<CrossSystemDependency> => {
    return addDependencyMutation.mutateAsync(dependency);
  }, [addDependencyMutation]);

  const removeDependency = useCallback(async (dependencyId: string): Promise<void> => {
    try {
      await scanCoordinationAPI.removeCrossSystemDependency(dependencyId);
      queryClient.invalidateQueries(['cross-system-dependencies']);
      toast.success('Dependency removed successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to remove dependency: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const updateDependency = useCallback(async (dependencyId: string, updates: any): Promise<CrossSystemDependency> => {
    try {
      const result = await scanCoordinationAPI.updateCrossSystemDependency(dependencyId, updates);
      queryClient.invalidateQueries(['cross-system-dependencies']);
      toast.success('Dependency updated successfully');
      return result;
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to update dependency: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const validateDependencies = useCallback(async (systemId: string): Promise<any> => {
    try {
      return await scanCoordinationAPI.validateDependencies(systemId);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  // Load balancing
  const redistributeLoad = useCallback(async (strategy: ResourceAllocationStrategy): Promise<void> => {
    try {
      await scanCoordinationAPI.redistributeLoad(strategy);
      queryClient.invalidateQueries(['scan-coordinations']);
      queryClient.invalidateQueries(['coordination-metrics']);
      toast.success('Load redistributed successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to redistribute load: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const optimizeAllocation = useCallback(async (coordinationId: string): Promise<void> => {
    try {
      await scanCoordinationAPI.optimizeResourceAllocation(coordinationId);
      queryClient.invalidateQueries(['scan-coordinations']);
      toast.success('Resource allocation optimized');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to optimize allocation: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const getLoadBalancingRecommendations = useCallback(async (): Promise<any[]> => {
    try {
      return await scanCoordinationAPI.getLoadBalancingRecommendations();
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  // System management
  const registerSystem = useCallback(async (systemConfig: any): Promise<void> => {
    try {
      await scanCoordinationAPI.registerSystem(systemConfig);
      queryClient.invalidateQueries(['system-health']);
      toast.success('System registered successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to register system: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const unregisterSystem = useCallback(async (systemId: string): Promise<void> => {
    try {
      await scanCoordinationAPI.unregisterSystem(systemId);
      queryClient.invalidateQueries(['system-health']);
      toast.success('System unregistered successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to unregister system: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const updateSystemConfig = useCallback(async (systemId: string, config: any): Promise<void> => {
    try {
      await scanCoordinationAPI.updateSystemConfig(systemId, config);
      queryClient.invalidateQueries(['system-health']);
      toast.success('System configuration updated');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to update system config: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const checkSystemHealth = useCallback(async (systemId: string): Promise<SystemHealth> => {
    try {
      return await scanCoordinationAPI.checkSystemHealth(systemId);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  // Analytics functions
  const getCoordinationAnalytics = useCallback(async (timeRange?: string): Promise<any> => {
    try {
      return await scanCoordinationAPI.getCoordinationAnalytics(timeRange);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const getResourceUtilization = useCallback(async (systemId?: string): Promise<any> => {
    try {
      return await scanCoordinationAPI.getResourceUtilization(systemId);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const getPerformanceMetrics = useCallback(async (coordinationId: string): Promise<any> => {
    try {
      return await scanCoordinationAPI.getCoordinationPerformance(coordinationId);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  // Real-time updates subscription
  const subscribeToCoordinationUpdates = useCallback((coordinationId: string) => {
    if (!enableRealTimeUpdates || coordinationWsRef.current) return;

    try {
      coordinationWsRef.current = scanCoordinationAPI.subscribeToCoordinationUpdates(
        coordinationId,
        (data) => {
          queryClient.invalidateQueries(['scan-coordinations']);
          
          if (data.coordination) {
            if (data.coordination.status === CoordinationStatus.COMPLETED) {
              onCoordinationComplete?.(data.coordination);
            } else if (data.coordination.status === CoordinationStatus.FAILED) {
              onCoordinationFailed?.(data.coordination);
            }
          }
        },
        (error) => {
          console.error('Coordination WebSocket error:', error);
          onError?.(new Error('Real-time coordination updates connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to coordination updates:', error);
    }
  }, [enableRealTimeUpdates, queryClient, onCoordinationComplete, onCoordinationFailed, onError]);

  const unsubscribeFromCoordinationUpdates = useCallback(() => {
    if (coordinationWsRef.current) {
      coordinationWsRef.current.close();
      coordinationWsRef.current = null;
    }
  }, []);

  const subscribeToConflictAlerts = useCallback(() => {
    if (!enableConflictAlerts || conflictWsRef.current) return;

    try {
      conflictWsRef.current = scanCoordinationAPI.subscribeToConflictAlerts(
        (conflict) => {
          onConflictDetected?.(conflict);
          queryClient.invalidateQueries(['scan-conflicts']);
        },
        (error) => {
          console.error('Conflict alerts WebSocket error:', error);
          onError?.(new Error('Conflict alerts connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to conflict alerts:', error);
    }
  }, [enableConflictAlerts, queryClient, onConflictDetected, onError]);

  const unsubscribeFromConflictAlerts = useCallback(() => {
    if (conflictWsRef.current) {
      conflictWsRef.current.close();
      conflictWsRef.current = null;
    }
  }, []);

  // Effect to update pagination when data changes
  useEffect(() => {
    if (coordinationsData) {
      setPaginationState(prev => ({
        ...prev,
        total: coordinationsData.total || 0,
        hasNext: coordinationsData.has_next || false,
        hasPrevious: coordinationsData.has_previous || false
      }));
    }
  }, [coordinationsData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromCoordinationUpdates();
      unsubscribeFromConflictAlerts();
    };
  }, [unsubscribeFromCoordinationUpdates, unsubscribeFromConflictAlerts]);

  // Load initial data and setup subscriptions
  useEffect(() => {
    if (enableConflictAlerts) {
      subscribeToConflictAlerts();
    }
  }, [enableConflictAlerts, subscribeToConflictAlerts]);

  // Combine loading states
  const isLoading = coordinationsLoading || conflictsLoading || dependenciesLoading || metricsLoading;
  const isCoordinating = initiateCoordinationMutation.isPending;
  const isResolving = resolveConflictMutation.isPending;

  return {
    // Coordinations
    coordinations: coordinationsData?.coordinations || [],
    coordinationsLoading,
    coordinationsError,
    
    // Conflicts
    conflicts: conflictsData?.conflicts || [],
    conflictsLoading,
    conflictsError,
    
    // Dependencies
    dependencies: dependenciesData?.dependencies || [],
    dependenciesLoading,
    dependenciesError,
    
    // Metrics
    metrics,
    metricsLoading,
    metricsError,
    
    // System Health
    systemHealth: systemHealthData?.systems || [],
    healthLoading,
    healthError,
    
    // State management
    selectedCoordination,
    selectedConflict,
    filters,
    sort,
    pagination,
    
    // Actions
    setSelectedCoordination,
    setSelectedConflict,
    setFilters,
    setSort,
    setPagination,
    
    // Coordination operations
    initiateCoordination,
    pauseCoordination,
    resumeCoordination,
    cancelCoordination,
    rebalanceCoordination,
    
    // Conflict management
    resolveConflict,
    escalateConflict,
    ignoreConflict,
    
    // Dependency management
    addDependency,
    removeDependency,
    updateDependency,
    validateDependencies,
    
    // Load balancing
    redistributeLoad,
    optimizeAllocation,
    getLoadBalancingRecommendations,
    
    // System management
    registerSystem,
    unregisterSystem,
    updateSystemConfig,
    checkSystemHealth,
    
    // Analytics
    getCoordinationAnalytics,
    getResourceUtilization,
    getPerformanceMetrics,
    
    // Utility functions
    getCoordinationStatusColor,
    getCoordinationTypeLabel,
    getPriorityColor,
    calculateResourceUtilization,
    getEstimatedCompletion,
    
    // Real-time subscriptions
    subscribeToCoordinationUpdates,
    unsubscribeFromCoordinationUpdates,
    subscribeToConflictAlerts,
    unsubscribeFromConflictAlerts,
    
    // Loading states
    isLoading,
    isCoordinating,
    isResolving
  };
};