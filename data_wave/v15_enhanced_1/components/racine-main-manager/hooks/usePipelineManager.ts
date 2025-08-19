/**
 * usePipelineManager Hook
 * =======================
 * 
 * React hook for managing advanced pipeline state and operations with AI optimization.
 * Maps to the pipeline management API service and provides reactive state management
 * for pipeline creation, execution, optimization, and monitoring.
 * 
 * Features:
 * - Reactive pipeline state management
 * - Real-time pipeline execution monitoring
 * - AI-driven optimization and recommendations
 * - Pipeline health monitoring and bottleneck analysis
 * - Template management and validation
 * - Performance metrics and analytics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  pipelineManagementAPI, 
  PipelineEventType, 
  type PipelineEvent,
  type PipelineEventHandler,
  type PipelineControlRequest
} from '../services/pipeline-management-apis';
import {
  RacinePipeline,
  PipelineStep,
  PipelineExecution,
  PipelineTemplate,
  PipelineOptimization,
  PipelineHealth,
  PipelineMetrics,
  PipelineBottleneck,
  UUID
} from '../types/racine-core.types';
import {
  CreatePipelineRequest,
  UpdatePipelineRequest,
  PipelineExecutionRequest,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../types/api.types';

/**
 * Pipeline manager state interface
 */
interface PipelineManagerState {
  pipelines: RacinePipeline[];
  currentPipeline: RacinePipeline | null;
  currentExecution: PipelineExecution | null;
  executions: PipelineExecution[];
  templates: PipelineTemplate[];
  optimizations: PipelineOptimization[];
  health: PipelineHealth | null;
  metrics: PipelineMetrics | null;
  bottlenecks: PipelineBottleneck[];
  designerState: {
    selectedStep: PipelineStep | null;
    draggedStep: PipelineStep | null;
    canvasZoom: number;
    canvasPosition: { x: number; y: number };
    showOptimizations: boolean;
    autoOptimize: boolean;
  };
  loading: {
    pipelines: boolean;
    currentPipeline: boolean;
    executions: boolean;
    templates: boolean;
    optimization: boolean;
    health: boolean;
    metrics: boolean;
  };
  errors: {
    pipelines: string | null;
    currentPipeline: string | null;
    executions: string | null;
    optimization: string | null;
    health: string | null;
  };
  realTimeMetrics: Map<UUID, any>;
  optimizationHistory: Map<UUID, PipelineOptimization[]>;
}

/**
 * Initial state
 */
const initialState: PipelineManagerState = {
  pipelines: [],
  currentPipeline: null,
  currentExecution: null,
  executions: [],
  templates: [],
  optimizations: [],
  health: null,
  metrics: null,
  bottlenecks: [],
  designerState: {
    selectedStep: null,
    draggedStep: null,
    canvasZoom: 1,
    canvasPosition: { x: 0, y: 0 },
    showOptimizations: true,
    autoOptimize: false
  },
  loading: {
    pipelines: false,
    currentPipeline: false,
    executions: false,
    templates: false,
    optimization: false,
    health: false,
    metrics: false
  },
  errors: {
    pipelines: null,
    currentPipeline: null,
    executions: null,
    optimization: null,
    health: null
  },
  realTimeMetrics: new Map(),
  optimizationHistory: new Map()
};

/**
 * Hook options interface
 */
interface UsePipelineManagerOptions {
  autoLoadPipelines?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAutoOptimization?: boolean;
  optimizationInterval?: number;
  healthCheckInterval?: number;
  defaultPagination?: Partial<PaginationRequest>;
  onPipelineChange?: (pipeline: RacinePipeline | null) => void;
  onExecutionUpdate?: (execution: PipelineExecution) => void;
  onOptimizationComplete?: (optimization: PipelineOptimization) => void;
  onError?: (error: string, operation: string) => void;
}

/**
 * usePipelineManager hook
 */
export function usePipelineManager(options: UsePipelineManagerOptions = {}) {
  const {
    autoLoadPipelines = true,
    enableRealTimeUpdates = true,
    enableAutoOptimization = false,
    optimizationInterval = 300000, // 5 minutes
    healthCheckInterval = 60000, // 1 minute
    defaultPagination = { page: 1, limit: 20 },
    onPipelineChange,
    onExecutionUpdate,
    onOptimizationComplete,
    onError
  } = options;

  const [state, setState] = useState<PipelineManagerState>(initialState);
  const eventSubscriptions = useRef<UUID[]>([]);
  const optimizationTimer = useRef<NodeJS.Timeout | null>(null);
  const healthCheckTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // =============================================================================
  // STATE MANAGEMENT HELPERS
  // =============================================================================

  const updateState = useCallback((updater: Partial<PipelineManagerState> | ((prev: PipelineManagerState) => PipelineManagerState)) => {
    setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
  }, []);

  const setLoading = useCallback((key: keyof PipelineManagerState['loading'], value: boolean) => {
    updateState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, [updateState]);

  const setError = useCallback((key: keyof PipelineManagerState['errors'], error: string | null) => {
    updateState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
    
    if (error && onError) {
      onError(error, key);
    }
  }, [updateState, onError]);

  // =============================================================================
  // PIPELINE CRUD OPERATIONS
  // =============================================================================

  const createPipeline = useCallback(async (request: CreatePipelineRequest): Promise<RacinePipeline | null> => {
    setLoading('pipelines', true);
    setError('pipelines', null);

    try {
      const response = await pipelineManagementAPI.createPipeline(request);
      const newPipeline = response.pipeline;

      updateState(prev => ({
        ...prev,
        pipelines: [newPipeline, ...prev.pipelines]
      }));

      return newPipeline;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create pipeline';
      setError('pipelines', message);
      return null;
    } finally {
      setLoading('pipelines', false);
    }
  }, [setLoading, setError, updateState]);

  const loadPipeline = useCallback(async (pipelineId: UUID): Promise<RacinePipeline | null> => {
    setLoading('currentPipeline', true);
    setError('currentPipeline', null);

    try {
      const response = await pipelineManagementAPI.getPipeline(pipelineId);
      const pipeline = response.pipeline;

      updateState(prev => ({
        ...prev,
        currentPipeline: pipeline
      }));

      if (onPipelineChange) {
        onPipelineChange(pipeline);
      }

      // Load related data
      await Promise.all([
        loadPipelineHealth(pipelineId),
        loadPipelineMetrics(pipelineId),
        loadBottlenecks(pipelineId)
      ]);

      return pipeline;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load pipeline';
      setError('currentPipeline', message);
      return null;
    } finally {
      setLoading('currentPipeline', false);
    }
  }, [setLoading, setError, updateState, onPipelineChange]);

  const loadPipelines = useCallback(async (
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<void> => {
    setLoading('pipelines', true);
    setError('pipelines', null);

    try {
      const response = await pipelineManagementAPI.listPipelines(
        pagination || defaultPagination,
        filters,
        sort
      );

      updateState(prev => ({
        ...prev,
        pipelines: response.pipelines
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load pipelines';
      setError('pipelines', message);
    } finally {
      setLoading('pipelines', false);
    }
  }, [setLoading, setError, updateState, defaultPagination]);

  const updatePipeline = useCallback(async (
    pipelineId: UUID, 
    request: UpdatePipelineRequest
  ): Promise<RacinePipeline | null> => {
    setLoading('currentPipeline', true);
    setError('currentPipeline', null);

    try {
      const response = await pipelineManagementAPI.updatePipeline(pipelineId, request);
      const updatedPipeline = response.pipeline;

      updateState(prev => ({
        ...prev,
        currentPipeline: prev.currentPipeline?.id === pipelineId ? updatedPipeline : prev.currentPipeline,
        pipelines: prev.pipelines.map(p => p.id === pipelineId ? updatedPipeline : p)
      }));

      return updatedPipeline;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update pipeline';
      setError('currentPipeline', message);
      return null;
    } finally {
      setLoading('currentPipeline', false);
    }
  }, [setLoading, setError, updateState]);

  const deletePipeline = useCallback(async (pipelineId: UUID): Promise<boolean> => {
    setLoading('pipelines', true);
    setError('pipelines', null);

    try {
      await pipelineManagementAPI.deletePipeline(pipelineId);

      updateState(prev => ({
        ...prev,
        pipelines: prev.pipelines.filter(p => p.id !== pipelineId),
        currentPipeline: prev.currentPipeline?.id === pipelineId ? null : prev.currentPipeline
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete pipeline';
      setError('pipelines', message);
      return false;
    } finally {
      setLoading('pipelines', false);
    }
  }, [setLoading, setError, updateState]);

  // =============================================================================
  // PIPELINE EXECUTION
  // =============================================================================

  const executePipeline = useCallback(async (
    pipelineId: UUID,
    parameters?: Record<string, any>
  ): Promise<PipelineExecution | null> => {
    setLoading('executions', true);
    setError('executions', null);

    try {
      const response = await pipelineManagementAPI.executePipeline(pipelineId, {
        parameters: parameters || {}
      });

      const execution = response.execution;

      updateState(prev => ({
        ...prev,
        currentExecution: execution,
        executions: [execution, ...prev.executions]
      }));

      if (onExecutionUpdate) {
        onExecutionUpdate(execution);
      }

      return execution;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to execute pipeline';
      setError('executions', message);
      return null;
    } finally {
      setLoading('executions', false);
    }
  }, [setLoading, setError, updateState, onExecutionUpdate]);

  const controlExecution = useCallback(async (
    pipelineId: UUID,
    executionId: UUID,
    action: 'pause' | 'resume' | 'cancel' | 'retry'
  ): Promise<boolean> => {
    try {
      const request: PipelineControlRequest = { action };
      await pipelineManagementAPI.controlExecution(pipelineId, executionId, request);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${action} execution`;
      setError('executions', message);
      return false;
    }
  }, [setError]);

  // =============================================================================
  // AI OPTIMIZATION
  // =============================================================================

  const optimizePipeline = useCallback(async (
    pipelineId: UUID,
    optimizationType: 'performance' | 'cost' | 'reliability' | 'all' = 'all'
  ): Promise<PipelineOptimization | null> => {
    setLoading('optimization', true);
    setError('optimization', null);

    try {
      const optimization = await pipelineManagementAPI.optimizePipeline(pipelineId, {
        optimization_type: optimizationType
      });

      updateState(prev => {
        const history = prev.optimizationHistory.get(pipelineId) || [];
        const newHistory = new Map(prev.optimizationHistory);
        newHistory.set(pipelineId, [optimization, ...history]);

        return {
          ...prev,
          optimizations: [optimization, ...prev.optimizations],
          optimizationHistory: newHistory
        };
      });

      if (onOptimizationComplete) {
        onOptimizationComplete(optimization);
      }

      return optimization;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to optimize pipeline';
      setError('optimization', message);
      return null;
    } finally {
      setLoading('optimization', false);
    }
  }, [setLoading, setError, updateState, onOptimizationComplete]);

  const getOptimizationRecommendations = useCallback(async (pipelineId: UUID): Promise<any[]> => {
    try {
      return await pipelineManagementAPI.getOptimizationRecommendations(pipelineId);
    } catch (error) {
      console.error('Failed to get optimization recommendations:', error);
      return [];
    }
  }, []);

  const applyOptimization = useCallback(async (
    pipelineId: UUID,
    optimizationId: UUID,
    parameters?: Record<string, any>
  ): Promise<boolean> => {
    setLoading('optimization', true);

    try {
      await pipelineManagementAPI.applyOptimization(pipelineId, {
        optimization_id: optimizationId,
        parameters: parameters || {}
      });

      // Reload pipeline to get updated configuration
      await loadPipeline(pipelineId);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply optimization';
      setError('optimization', message);
      return false;
    } finally {
      setLoading('optimization', false);
    }
  }, [setLoading, setError, loadPipeline]);

  // =============================================================================
  // HEALTH AND METRICS
  // =============================================================================

  const loadPipelineHealth = useCallback(async (pipelineId: UUID): Promise<void> => {
    setLoading('health', true);
    setError('health', null);

    try {
      const health = await pipelineManagementAPI.getPipelineHealth(pipelineId);
      updateState(prev => ({ ...prev, health }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load pipeline health';
      setError('health', message);
    } finally {
      setLoading('health', false);
    }
  }, [setLoading, setError, updateState]);

  const loadPipelineMetrics = useCallback(async (pipelineId: UUID): Promise<void> => {
    setLoading('metrics', true);

    try {
      const metrics = await pipelineManagementAPI.getPipelineMetrics(pipelineId);
      updateState(prev => ({ ...prev, metrics }));
    } catch (error) {
      console.error('Failed to load pipeline metrics:', error);
    } finally {
      setLoading('metrics', false);
    }
  }, [setLoading, updateState]);

  const loadBottlenecks = useCallback(async (pipelineId: UUID): Promise<void> => {
    try {
      const bottlenecks = await pipelineManagementAPI.getBottlenecks(pipelineId);
      updateState(prev => ({ ...prev, bottlenecks }));
    } catch (error) {
      console.error('Failed to load pipeline bottlenecks:', error);
    }
  }, [updateState]);

  // =============================================================================
  // DESIGNER STATE MANAGEMENT
  // =============================================================================

  const updateDesignerState = useCallback((updates: Partial<PipelineManagerState['designerState']>) => {
    updateState(prev => ({
      ...prev,
      designerState: { ...prev.designerState, ...updates }
    }));
  }, [updateState]);

  const selectStep = useCallback((step: PipelineStep | null) => {
    updateDesignerState({ selectedStep: step });
  }, [updateDesignerState]);

  const setDraggedStep = useCallback((step: PipelineStep | null) => {
    updateDesignerState({ draggedStep: step });
  }, [updateDesignerState]);

  const updateCanvasView = useCallback((zoom: number, position: { x: number; y: number }) => {
    updateDesignerState({ canvasZoom: zoom, canvasPosition: position });
  }, [updateDesignerState]);

  // =============================================================================
  // TEMPLATE MANAGEMENT
  // =============================================================================

  const loadTemplates = useCallback(async (): Promise<void> => {
    setLoading('templates', true);

    try {
      const templates = await pipelineManagementAPI.getTemplates();
      updateState(prev => ({ ...prev, templates }));
    } catch (error) {
      console.error('Failed to load pipeline templates:', error);
    } finally {
      setLoading('templates', false);
    }
  }, [setLoading, updateState]);

  const createFromTemplate = useCallback(async (
    templateId: UUID,
    name: string,
    customizations?: Record<string, any>
  ): Promise<RacinePipeline | null> => {
    setLoading('pipelines', true);
    
    try {
      const response = await pipelineManagementAPI.createFromTemplate({
        templateId,
        name,
        customizations
      });

      updateState(prev => ({
        ...prev,
        pipelines: [response.pipeline, ...prev.pipelines]
      }));

      return response.pipeline;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create pipeline from template';
      setError('pipelines', message);
      return null;
    } finally {
      setLoading('pipelines', false);
    }
  }, [setLoading, setError, updateState]);

  // =============================================================================
  // AUTOMATED OPTIMIZATION
  // =============================================================================

  const setupAutoOptimization = useCallback(() => {
    if (optimizationTimer.current) {
      clearInterval(optimizationTimer.current);
    }

    if (state.designerState.autoOptimize && state.currentPipeline) {
      optimizationTimer.current = setInterval(async () => {
        if (state.currentPipeline) {
          try {
            await optimizePipeline(state.currentPipeline.id, 'performance');
          } catch (error) {
            console.error('Auto-optimization failed:', error);
          }
        }
      }, optimizationInterval);
    }
  }, [state.designerState.autoOptimize, state.currentPipeline, optimizationInterval, optimizePipeline]);

  const setupHealthMonitoring = useCallback(() => {
    if (healthCheckTimer.current) {
      clearInterval(healthCheckTimer.current);
    }

    if (state.currentPipeline) {
      healthCheckTimer.current = setInterval(async () => {
        if (state.currentPipeline) {
          try {
            await loadPipelineHealth(state.currentPipeline.id);
            await loadPipelineMetrics(state.currentPipeline.id);
          } catch (error) {
            console.error('Health monitoring failed:', error);
          }
        }
      }, healthCheckInterval);
    }
  }, [state.currentPipeline, healthCheckInterval, loadPipelineHealth, loadPipelineMetrics]);

  // =============================================================================
  // REAL-TIME EVENT HANDLING
  // =============================================================================

  const handlePipelineEvent: PipelineEventHandler = useCallback((event: PipelineEvent) => {
    switch (event.type) {
      case PipelineEventType.PIPELINE_CREATED:
        if (event.data.pipeline) {
          updateState(prev => ({
            ...prev,
            pipelines: [event.data.pipeline, ...prev.pipelines]
          }));
        }
        break;

      case PipelineEventType.PIPELINE_UPDATED:
        if (event.data.pipeline) {
          updateState(prev => ({
            ...prev,
            pipelines: prev.pipelines.map(p => 
              p.id === event.pipelineId ? event.data.pipeline : p
            ),
            currentPipeline: prev.currentPipeline?.id === event.pipelineId 
              ? event.data.pipeline 
              : prev.currentPipeline
          }));
        }
        break;

      case PipelineEventType.EXECUTION_STARTED:
        if (event.data.execution) {
          updateState(prev => ({
            ...prev,
            executions: [event.data.execution, ...prev.executions]
          }));
          
          if (onExecutionUpdate) {
            onExecutionUpdate(event.data.execution);
          }
        }
        break;

      case PipelineEventType.EXECUTION_COMPLETED:
      case PipelineEventType.EXECUTION_FAILED:
        if (event.data.execution) {
          updateState(prev => ({
            ...prev,
            executions: prev.executions.map(e => 
              e.id === event.executionId ? event.data.execution : e
            ),
            currentExecution: prev.currentExecution?.id === event.executionId 
              ? event.data.execution 
              : prev.currentExecution
          }));

          if (onExecutionUpdate) {
            onExecutionUpdate(event.data.execution);
          }
        }
        break;

      case PipelineEventType.OPTIMIZATION_COMPLETED:
        if (event.data.optimization) {
          updateState(prev => ({
            ...prev,
            optimizations: [event.data.optimization, ...prev.optimizations]
          }));

          if (onOptimizationComplete) {
            onOptimizationComplete(event.data.optimization);
          }
        }
        break;
    }
  }, [updateState, onExecutionUpdate, onOptimizationComplete]);

  // =============================================================================
  // INITIALIZATION AND CLEANUP
  // =============================================================================

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Initialize real-time updates
      if (enableRealTimeUpdates) {
        pipelineManagementAPI.initializeRealTimeUpdates();

        Object.values(PipelineEventType).forEach(eventType => {
          const id = pipelineManagementAPI.subscribeToEvents(eventType, handlePipelineEvent);
          eventSubscriptions.current.push(id);
        });
      }

      // Auto-load pipelines if enabled
      if (autoLoadPipelines) {
        loadPipelines();
      }

      // Load templates
      loadTemplates();
    }

    return () => {
      // Cleanup subscriptions
      eventSubscriptions.current.forEach(id => {
        pipelineManagementAPI.unsubscribeFromEvents(id);
      });
      eventSubscriptions.current = [];

      // Cleanup timers
      if (optimizationTimer.current) {
        clearInterval(optimizationTimer.current);
      }
      if (healthCheckTimer.current) {
        clearInterval(healthCheckTimer.current);
      }
    };
  }, [enableRealTimeUpdates, autoLoadPipelines, handlePipelineEvent, loadPipelines, loadTemplates]);

  // Setup auto-optimization and health monitoring
  useEffect(() => {
    setupAutoOptimization();
    setupHealthMonitoring();
  }, [setupAutoOptimization, setupHealthMonitoring]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // State
    ...state,
    
    // Loading states
    isLoading: Object.values(state.loading).some(Boolean),
    
    // Pipeline actions
    createPipeline,
    loadPipeline,
    loadPipelines,
    updatePipeline,
    deletePipeline,
    
    // Execution
    executePipeline,
    controlExecution,
    
    // Optimization
    optimizePipeline,
    getOptimizationRecommendations,
    applyOptimization,
    
    // Health and metrics
    loadPipelineHealth,
    loadPipelineMetrics,
    loadBottlenecks,
    
    // Designer state
    selectStep,
    setDraggedStep,
    updateCanvasView,
    updateDesignerState,
    
    // Templates
    loadTemplates,
    createFromTemplate,
    
    // Utility functions
    clearErrors: useCallback(() => {
      updateState(prev => ({
        ...prev,
        errors: {
          pipelines: null,
          currentPipeline: null,
          executions: null,
          optimization: null,
          health: null
        }
      }));
    }, [updateState]),
    
    refresh: useCallback(() => {
      loadPipelines();
      loadTemplates();
      if (state.currentPipeline) {
        loadPipelineHealth(state.currentPipeline.id);
        loadPipelineMetrics(state.currentPipeline.id);
      }
    }, [loadPipelines, loadTemplates, loadPipelineHealth, loadPipelineMetrics, state.currentPipeline])
  };
}