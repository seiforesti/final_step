/**
 * useJobWorkflowBuilder Hook
 * ==========================
 * 
 * React hook for managing Databricks-style job workflow builder state and operations.
 * Maps to the job workflow API service and provides reactive state management
 * for workflow creation, execution, and monitoring.
 * 
 * Features:
 * - Reactive workflow builder state management
 * - Real-time workflow execution monitoring
 * - Drag-and-drop workflow construction helpers
 * - Template management and workflow validation
 * - Execution control and status tracking
 * - Version management and rollback capabilities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  jobWorkflowAPI, 
  WorkflowEventType, 
  type WorkflowEvent,
  type WorkflowEventHandler,
  type ExecutionControlRequest
} from '../services/job-workflow-apis';
import {
  RacineJobWorkflow,
  WorkflowStep,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowSchedule,
  WorkflowVersion,
  WorkflowValidationResult,
  UUID
} from '../types/racine-core.types';
import {
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowExecutionRequest,
  PaginationRequest,
  FilterRequest,
  SortRequest
} from '../types/api.types';

/**
 * Workflow builder state interface
 */
interface WorkflowBuilderState {
  workflows: RacineJobWorkflow[];
  currentWorkflow: RacineJobWorkflow | null;
  currentExecution: WorkflowExecution | null;
  executions: WorkflowExecution[];
  templates: WorkflowTemplate[];
  schedules: WorkflowSchedule[];
  versions: WorkflowVersion[];
  validationResult: WorkflowValidationResult | null;
  builderState: {
    selectedStep: WorkflowStep | null;
    draggedStep: WorkflowStep | null;
    canvasZoom: number;
    canvasPosition: { x: number; y: number };
    showMinimap: boolean;
    autoSave: boolean;
  };
  loading: {
    workflows: boolean;
    currentWorkflow: boolean;
    executions: boolean;
    templates: boolean;
    validation: boolean;
    execution: boolean;
  };
  errors: {
    workflows: string | null;
    currentWorkflow: string | null;
    executions: string | null;
    validation: string | null;
    execution: string | null;
  };
  executionLogs: Map<UUID, string[]>;
  realTimeMetrics: Map<UUID, any>;
}

/**
 * Initial state
 */
const initialState: WorkflowBuilderState = {
  workflows: [],
  currentWorkflow: null,
  currentExecution: null,
  executions: [],
  templates: [],
  schedules: [],
  versions: [],
  validationResult: null,
  builderState: {
    selectedStep: null,
    draggedStep: null,
    canvasZoom: 1,
    canvasPosition: { x: 0, y: 0 },
    showMinimap: true,
    autoSave: true
  },
  loading: {
    workflows: false,
    currentWorkflow: false,
    executions: false,
    templates: false,
    validation: false,
    execution: false
  },
  errors: {
    workflows: null,
    currentWorkflow: null,
    executions: null,
    validation: null,
    execution: null
  },
  executionLogs: new Map(),
  realTimeMetrics: new Map()
};

/**
 * Hook options interface
 */
interface UseJobWorkflowBuilderOptions {
  autoLoadWorkflows?: boolean;
  enableRealTimeUpdates?: boolean;
  autoSaveInterval?: number;
  defaultPagination?: Partial<PaginationRequest>;
  onWorkflowChange?: (workflow: RacineJobWorkflow | null) => void;
  onExecutionUpdate?: (execution: WorkflowExecution) => void;
  onError?: (error: string, operation: string) => void;
}

/**
 * useJobWorkflowBuilder hook
 */
export function useJobWorkflowBuilder(options: UseJobWorkflowBuilderOptions = {}) {
  const {
    autoLoadWorkflows = true,
    enableRealTimeUpdates = true,
    autoSaveInterval = 30000,
    defaultPagination = { page: 1, limit: 20 },
    onWorkflowChange,
    onExecutionUpdate,
    onError
  } = options;

  const [state, setState] = useState<WorkflowBuilderState>(initialState);
  const eventSubscriptions = useRef<UUID[]>([]);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const logStreamConnections = useRef<Map<UUID, EventSource>>(new Map());
  const isInitialized = useRef(false);

  // =============================================================================
  // STATE MANAGEMENT HELPERS
  // =============================================================================

  const updateState = useCallback((updater: Partial<WorkflowBuilderState> | ((prev: WorkflowBuilderState) => WorkflowBuilderState)) => {
    setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
  }, []);

  const setLoading = useCallback((key: keyof WorkflowBuilderState['loading'], value: boolean) => {
    updateState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, [updateState]);

  const setError = useCallback((key: keyof WorkflowBuilderState['errors'], error: string | null) => {
    updateState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
    
    if (error && onError) {
      onError(error, key);
    }
  }, [updateState, onError]);

  // =============================================================================
  // WORKFLOW CRUD OPERATIONS
  // =============================================================================

  const createWorkflow = useCallback(async (request: CreateWorkflowRequest): Promise<RacineJobWorkflow | null> => {
    setLoading('workflows', true);
    setError('workflows', null);

    try {
      const response = await jobWorkflowAPI.createWorkflow(request);
      const newWorkflow = response.workflow;

      // Optimistic update
      updateState(prev => ({
        ...prev,
        workflows: [newWorkflow, ...prev.workflows]
      }));

      return newWorkflow;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create workflow';
      setError('workflows', message);
      return null;
    } finally {
      setLoading('workflows', false);
    }
  }, [setLoading, setError, updateState]);

  const loadWorkflow = useCallback(async (workflowId: UUID): Promise<RacineJobWorkflow | null> => {
    setLoading('currentWorkflow', true);
    setError('currentWorkflow', null);

    try {
      const response = await jobWorkflowAPI.getWorkflow(workflowId);
      const workflow = response.workflow;

      updateState(prev => ({
        ...prev,
        currentWorkflow: workflow
      }));

      if (onWorkflowChange) {
        onWorkflowChange(workflow);
      }

      // Auto-validate when loading workflow
      await validateWorkflow(workflow);

      return workflow;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load workflow';
      setError('currentWorkflow', message);
      return null;
    } finally {
      setLoading('currentWorkflow', false);
    }
  }, [setLoading, setError, updateState, onWorkflowChange]);

  const loadWorkflows = useCallback(async (
    pagination?: PaginationRequest,
    filters?: FilterRequest,
    sort?: SortRequest
  ): Promise<void> => {
    setLoading('workflows', true);
    setError('workflows', null);

    try {
      const response = await jobWorkflowAPI.listWorkflows(
        pagination || defaultPagination,
        filters,
        sort
      );

      updateState(prev => ({
        ...prev,
        workflows: response.workflows
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load workflows';
      setError('workflows', message);
    } finally {
      setLoading('workflows', false);
    }
  }, [setLoading, setError, updateState, defaultPagination]);

  const updateWorkflow = useCallback(async (
    workflowId: UUID, 
    request: UpdateWorkflowRequest
  ): Promise<RacineJobWorkflow | null> => {
    setLoading('currentWorkflow', true);
    setError('currentWorkflow', null);

    try {
      const response = await jobWorkflowAPI.updateWorkflow(workflowId, request);
      const updatedWorkflow = response.workflow;

      // Update in both current workflow and workflows list
      updateState(prev => ({
        ...prev,
        currentWorkflow: prev.currentWorkflow?.id === workflowId ? updatedWorkflow : prev.currentWorkflow,
        workflows: prev.workflows.map(w => w.id === workflowId ? updatedWorkflow : w)
      }));

      return updatedWorkflow;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update workflow';
      setError('currentWorkflow', message);
      return null;
    } finally {
      setLoading('currentWorkflow', false);
    }
  }, [setLoading, setError, updateState]);

  const deleteWorkflow = useCallback(async (workflowId: UUID): Promise<boolean> => {
    setLoading('workflows', true);
    setError('workflows', null);

    try {
      await jobWorkflowAPI.deleteWorkflow(workflowId);

      // Remove from state
      updateState(prev => ({
        ...prev,
        workflows: prev.workflows.filter(w => w.id !== workflowId),
        currentWorkflow: prev.currentWorkflow?.id === workflowId ? null : prev.currentWorkflow
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete workflow';
      setError('workflows', message);
      return false;
    } finally {
      setLoading('workflows', false);
    }
  }, [setLoading, setError, updateState]);

  // =============================================================================
  // WORKFLOW VALIDATION
  // =============================================================================

  const validateWorkflow = useCallback(async (workflow: RacineJobWorkflow): Promise<WorkflowValidationResult | null> => {
    setLoading('validation', true);
    setError('validation', null);

    try {
      const result = await jobWorkflowAPI.validateWorkflow({
        workflow: workflow.configuration,
        steps: workflow.steps
      });

      updateState(prev => ({
        ...prev,
        validationResult: result
      }));

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate workflow';
      setError('validation', message);
      return null;
    } finally {
      setLoading('validation', false);
    }
  }, [setLoading, setError, updateState]);

  const validateStep = useCallback(async (step: WorkflowStep): Promise<boolean> => {
    try {
      const result = await jobWorkflowAPI.validateStep({
        step: step.configuration,
        context: state.currentWorkflow?.configuration
      });
      return result.isValid;
    } catch (error) {
      console.error('Failed to validate step:', error);
      return false;
    }
  }, [state.currentWorkflow]);

  // =============================================================================
  // WORKFLOW EXECUTION
  // =============================================================================

  const executeWorkflow = useCallback(async (
    workflowId: UUID,
    parameters?: Record<string, any>
  ): Promise<WorkflowExecution | null> => {
    setLoading('execution', true);
    setError('execution', null);

    try {
      const response = await jobWorkflowAPI.executeWorkflow(workflowId, {
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

      // Start monitoring this execution
      await startExecutionMonitoring(execution.id);

      return execution;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to execute workflow';
      setError('execution', message);
      return null;
    } finally {
      setLoading('execution', false);
    }
  }, [setLoading, setError, updateState, onExecutionUpdate]);

  const controlExecution = useCallback(async (
    workflowId: UUID,
    executionId: UUID,
    action: 'pause' | 'resume' | 'cancel' | 'retry'
  ): Promise<boolean> => {
    try {
      const request: ExecutionControlRequest = { action };
      await jobWorkflowAPI.controlExecution(workflowId, executionId, request);

      // The real-time updates will handle state changes
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${action} execution`;
      setError('execution', message);
      return false;
    }
  }, [setError]);

  const loadExecutions = useCallback(async (workflowId: UUID): Promise<void> => {
    setLoading('executions', true);
    setError('executions', null);

    try {
      const executions = await jobWorkflowAPI.getExecutions(workflowId);
      updateState(prev => ({ ...prev, executions }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load executions';
      setError('executions', message);
    } finally {
      setLoading('executions', false);
    }
  }, [setLoading, setError, updateState]);

  // =============================================================================
  // EXECUTION MONITORING
  // =============================================================================

  const startExecutionMonitoring = useCallback(async (executionId: UUID): Promise<void> => {
    try {
      // Start log streaming
      const logStream = await jobWorkflowAPI.streamLogs(
        state.currentWorkflow!.id,
        executionId
      );

      logStream.onmessage = (event) => {
        const logData = JSON.parse(event.data);
        updateState(prev => {
          const logs = prev.executionLogs.get(executionId) || [];
          const newLogs = new Map(prev.executionLogs);
          newLogs.set(executionId, [...logs, logData.message]);
          return { ...prev, executionLogs: newLogs };
        });
      };

      logStreamConnections.current.set(executionId, logStream);

      // Start polling for status updates
      const pollStatus = async () => {
        try {
          const status = await jobWorkflowAPI.getExecutionStatus(
            state.currentWorkflow!.id,
            executionId
          );

          updateState(prev => ({
            ...prev,
            currentExecution: prev.currentExecution?.id === executionId ? status : prev.currentExecution,
            executions: prev.executions.map(e => e.id === executionId ? status : e)
          }));

          // Continue polling if execution is still running
          if (['running', 'pending', 'paused'].includes(status.status)) {
            setTimeout(pollStatus, 2000);
          } else {
            // Stop log streaming when execution completes
            const stream = logStreamConnections.current.get(executionId);
            if (stream) {
              stream.close();
              logStreamConnections.current.delete(executionId);
            }
          }
        } catch (error) {
          console.error('Failed to poll execution status:', error);
        }
      };

      // Start polling
      setTimeout(pollStatus, 1000);
    } catch (error) {
      console.error('Failed to start execution monitoring:', error);
    }
  }, [state.currentWorkflow, updateState]);

  const stopExecutionMonitoring = useCallback((executionId: UUID): void => {
    const stream = logStreamConnections.current.get(executionId);
    if (stream) {
      stream.close();
      logStreamConnections.current.delete(executionId);
    }
  }, []);

  // =============================================================================
  // BUILDER STATE MANAGEMENT
  // =============================================================================

  const updateBuilderState = useCallback((updates: Partial<WorkflowBuilderState['builderState']>) => {
    updateState(prev => ({
      ...prev,
      builderState: { ...prev.builderState, ...updates }
    }));
  }, [updateState]);

  const selectStep = useCallback((step: WorkflowStep | null) => {
    updateBuilderState({ selectedStep: step });
  }, [updateBuilderState]);

  const setDraggedStep = useCallback((step: WorkflowStep | null) => {
    updateBuilderState({ draggedStep: step });
  }, [updateBuilderState]);

  const updateCanvasView = useCallback((zoom: number, position: { x: number; y: number }) => {
    updateBuilderState({ canvasZoom: zoom, canvasPosition: position });
  }, [updateBuilderState]);

  // =============================================================================
  // TEMPLATE MANAGEMENT
  // =============================================================================

  const loadTemplates = useCallback(async (): Promise<void> => {
    setLoading('templates', true);

    try {
      const templates = await jobWorkflowAPI.getTemplates();
      updateState(prev => ({ ...prev, templates }));
    } catch (error) {
      console.error('Failed to load workflow templates:', error);
    } finally {
      setLoading('templates', false);
    }
  }, [setLoading, updateState]);

  const createFromTemplate = useCallback(async (
    templateId: UUID,
    name: string,
    customizations?: Record<string, any>
  ): Promise<RacineJobWorkflow | null> => {
    setLoading('workflows', true);
    
    try {
      const response = await jobWorkflowAPI.createFromTemplate({
        templateId,
        name,
        customizations
      });

      // Add to workflows list
      updateState(prev => ({
        ...prev,
        workflows: [response.workflow, ...prev.workflows]
      }));

      return response.workflow;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create workflow from template';
      setError('workflows', message);
      return null;
    } finally {
      setLoading('workflows', false);
    }
  }, [setLoading, setError, updateState]);

  // =============================================================================
  // AUTO-SAVE FUNCTIONALITY
  // =============================================================================

  const setupAutoSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearInterval(autoSaveTimer.current);
    }

    if (state.builderState.autoSave && state.currentWorkflow) {
      autoSaveTimer.current = setInterval(async () => {
        if (state.currentWorkflow && state.validationResult?.isValid) {
          try {
            await updateWorkflow(state.currentWorkflow.id, {
              configuration: state.currentWorkflow.configuration,
              steps: state.currentWorkflow.steps
            });
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, autoSaveInterval);
    }
  }, [state.builderState.autoSave, state.currentWorkflow, state.validationResult, autoSaveInterval, updateWorkflow]);

  // =============================================================================
  // REAL-TIME EVENT HANDLING
  // =============================================================================

  const handleWorkflowEvent: WorkflowEventHandler = useCallback((event: WorkflowEvent) => {
    switch (event.type) {
      case WorkflowEventType.WORKFLOW_CREATED:
        if (event.data.workflow) {
          updateState(prev => ({
            ...prev,
            workflows: [event.data.workflow, ...prev.workflows]
          }));
        }
        break;

      case WorkflowEventType.WORKFLOW_UPDATED:
        if (event.data.workflow) {
          updateState(prev => ({
            ...prev,
            workflows: prev.workflows.map(w => 
              w.id === event.workflowId ? event.data.workflow : w
            ),
            currentWorkflow: prev.currentWorkflow?.id === event.workflowId 
              ? event.data.workflow 
              : prev.currentWorkflow
          }));
        }
        break;

      case WorkflowEventType.EXECUTION_STARTED:
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

      case WorkflowEventType.EXECUTION_COMPLETED:
      case WorkflowEventType.EXECUTION_FAILED:
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

          // Stop monitoring completed executions
          if (event.executionId) {
            stopExecutionMonitoring(event.executionId);
          }
        }
        break;
    }
  }, [updateState, onExecutionUpdate, stopExecutionMonitoring]);

  // =============================================================================
  // INITIALIZATION AND CLEANUP
  // =============================================================================

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Initialize real-time updates
      if (enableRealTimeUpdates) {
        jobWorkflowAPI.initializeRealTimeUpdates();

        // Subscribe to workflow events
        Object.values(WorkflowEventType).forEach(eventType => {
          const id = jobWorkflowAPI.subscribeToEvents(eventType, handleWorkflowEvent);
          eventSubscriptions.current.push(id);
        });
      }

      // Auto-load workflows if enabled
      if (autoLoadWorkflows) {
        loadWorkflows();
      }

      // Load templates
      loadTemplates();
    }

    return () => {
      // Cleanup subscriptions
      eventSubscriptions.current.forEach(id => {
        jobWorkflowAPI.unsubscribeFromEvents(id);
      });
      eventSubscriptions.current = [];

      // Cleanup timers
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }

      // Close all log streams
      logStreamConnections.current.forEach(stream => stream.close());
      logStreamConnections.current.clear();
    };
  }, [enableRealTimeUpdates, autoLoadWorkflows, handleWorkflowEvent, loadWorkflows, loadTemplates]);

  // Setup auto-save when relevant state changes
  useEffect(() => {
    setupAutoSave();
  }, [setupAutoSave]);

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // State
    ...state,
    
    // Loading states
    isLoading: Object.values(state.loading).some(Boolean),
    
    // Workflow actions
    createWorkflow,
    loadWorkflow,
    loadWorkflows,
    updateWorkflow,
    deleteWorkflow,
    
    // Validation
    validateWorkflow,
    validateStep,
    
    // Execution
    executeWorkflow,
    controlExecution,
    loadExecutions,
    
    // Monitoring
    startExecutionMonitoring,
    stopExecutionMonitoring,
    
    // Builder state
    selectStep,
    setDraggedStep,
    updateCanvasView,
    updateBuilderState,
    
    // Templates
    loadTemplates,
    createFromTemplate,
    
    // Utility functions
    clearErrors: useCallback(() => {
      updateState(prev => ({
        ...prev,
        errors: {
          workflows: null,
          currentWorkflow: null,
          executions: null,
          validation: null,
          execution: null
        }
      }));
    }, [updateState]),
    
    refresh: useCallback(() => {
      loadWorkflows();
      loadTemplates();
    }, [loadWorkflows, loadTemplates])
  };
}