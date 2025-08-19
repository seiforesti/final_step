// Advanced-Scan-Logic/hooks/useWorkflowManagement.ts
// Comprehensive React hook for workflow management with enterprise orchestration

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  WorkflowTemplate,
  WorkflowVersion,
  WorkflowMetrics,
  DependencyGraph,
  ConditionalLogic,
  ApprovalWorkflow,
  WorkflowStatus,
  WorkflowPriority,
  StepType,
  ApprovalStatus,
  ExecutionContext,
  WorkflowConfiguration,
  WorkflowValidation,
  WorkflowSchedule,
  WorkflowFilters,
  WorkflowSort
} from '../types/workflow.types';
import { scanWorkflowAPI } from '../services/scan-workflow-apis';

// Hook options interface
interface UseWorkflowManagementOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  enableApprovalNotifications?: boolean;
  onWorkflowComplete?: (execution: WorkflowExecution) => void;
  onWorkflowFailed?: (execution: WorkflowExecution) => void;
  onApprovalRequired?: (approval: ApprovalWorkflow) => void;
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
interface UseWorkflowManagementReturn {
  // Templates
  templates: WorkflowTemplate[];
  templatesLoading: boolean;
  templatesError: Error | null;
  
  // Executions
  executions: WorkflowExecution[];
  executionsLoading: boolean;
  executionsError: Error | null;
  
  // Metrics
  metrics: WorkflowMetrics | null;
  metricsLoading: boolean;
  metricsError: Error | null;
  
  // Approvals
  approvals: ApprovalWorkflow[];
  approvalsLoading: boolean;
  approvalsError: Error | null;
  
  // State management
  selectedTemplate: WorkflowTemplate | null;
  selectedExecution: WorkflowExecution | null;
  filters: WorkflowFilters;
  sort: WorkflowSort;
  pagination: PaginationState;
  
  // Actions
  setSelectedTemplate: (template: WorkflowTemplate | null) => void;
  setSelectedExecution: (execution: WorkflowExecution | null) => void;
  setFilters: (filters: Partial<WorkflowFilters>) => void;
  setSort: (sort: WorkflowSort) => void;
  setPagination: (page: number, size?: number) => void;
  
  // Template operations
  createTemplate: (template: any) => Promise<WorkflowTemplate>;
  updateTemplate: (id: string, updates: any) => Promise<WorkflowTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  cloneTemplate: (id: string, name: string) => Promise<WorkflowTemplate>;
  validateTemplate: (template: any) => Promise<WorkflowValidation>;
  
  // Execution operations
  executeWorkflow: (templateId: string, context: ExecutionContext) => Promise<WorkflowExecution>;
  pauseExecution: (executionId: string) => Promise<void>;
  resumeExecution: (executionId: string) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  retryExecution: (executionId: string) => Promise<WorkflowExecution>;
  skipStep: (executionId: string, stepId: string) => Promise<void>;
  
  // Approval operations
  approveWorkflow: (approvalId: string, comment?: string) => Promise<void>;
  rejectWorkflow: (approvalId: string, reason: string) => Promise<void>;
  requestApproval: (executionId: string, approvers: string[]) => Promise<ApprovalWorkflow>;
  
  // Analytics
  getWorkflowAnalytics: (timeRange?: string) => Promise<any>;
  getExecutionLogs: (executionId: string) => Promise<any[]>;
  getDependencyGraph: (templateId: string) => Promise<DependencyGraph>;
  
  // Utility functions
  getWorkflowStatusColor: (status: WorkflowStatus) => string;
  getWorkflowPriorityLabel: (priority: WorkflowPriority) => string;
  getStepTypeIcon: (type: StepType) => string;
  calculateProgress: (execution: WorkflowExecution) => number;
  getEstimatedCompletion: (execution: WorkflowExecution) => Date | null;
  
  // Real-time subscriptions
  subscribeToWorkflowUpdates: (workflowId: string) => void;
  unsubscribeFromWorkflowUpdates: () => void;
  subscribeToApprovalNotifications: () => void;
  unsubscribeFromApprovalNotifications: () => void;
  
  // Loading states
  isLoading: boolean;
  isExecuting: boolean;
  isSaving: boolean;
}

export const useWorkflowManagement = (options: UseWorkflowManagementOptions = {}): UseWorkflowManagementReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true,
    enableApprovalNotifications = true,
    onWorkflowComplete,
    onWorkflowFailed,
    onApprovalRequired,
    onError
  } = options;

  const queryClient = useQueryClient();
  const workflowWsRef = useRef<WebSocket | null>(null);
  const approvalWsRef = useRef<WebSocket | null>(null);

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [filters, setFiltersState] = useState<WorkflowFilters>({});
  const [sort, setSortState] = useState<WorkflowSort>({ field: 'created_at', direction: 'desc' });
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    size: 20,
    total: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Query for workflow templates
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ['workflow-templates', filters, sort, pagination.page, pagination.size],
    queryFn: () => scanWorkflowAPI.getWorkflowTemplates({
      ...filters,
      sort,
      page: pagination.page,
      size: pagination.size
    }),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Query for workflow executions
  const {
    data: executionsData,
    isLoading: executionsLoading,
    error: executionsError,
    refetch: refetchExecutions
  } = useQuery({
    queryKey: ['workflow-executions', filters, sort, pagination.page, pagination.size],
    queryFn: () => scanWorkflowAPI.getWorkflowExecutions({
      ...filters,
      sort,
      page: pagination.page,
      size: pagination.size
    }),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 15000
  });

  // Query for workflow metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError
  } = useQuery({
    queryKey: ['workflow-metrics'],
    queryFn: () => scanWorkflowAPI.getWorkflowMetrics(),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000
  });

  // Query for pending approvals
  const {
    data: approvalsData,
    isLoading: approvalsLoading,
    error: approvalsError,
    refetch: refetchApprovals
  } = useQuery({
    queryKey: ['workflow-approvals'],
    queryFn: () => scanWorkflowAPI.getPendingApprovals(),
    enabled: true,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Mutations for template operations
  const createTemplateMutation = useMutation({
    mutationFn: scanWorkflowAPI.createWorkflowTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workflow-templates']);
      toast.success('Workflow template created successfully');
      setSelectedTemplate(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
      onError?.(error);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      scanWorkflowAPI.updateWorkflowTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workflow-templates']);
      toast.success('Workflow template updated successfully');
      setSelectedTemplate(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
      onError?.(error);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: scanWorkflowAPI.deleteWorkflowTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-templates']);
      toast.success('Workflow template deleted successfully');
      if (selectedTemplate) {
        setSelectedTemplate(null);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
      onError?.(error);
    }
  });

  // Mutations for execution operations
  const executeWorkflowMutation = useMutation({
    mutationFn: ({ templateId, context }: { templateId: string; context: ExecutionContext }) =>
      scanWorkflowAPI.executeWorkflow(templateId, context),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow execution started successfully');
      setSelectedExecution(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to execute workflow: ${error.message}`);
      onError?.(error);
    }
  });

  const pauseExecutionMutation = useMutation({
    mutationFn: scanWorkflowAPI.pauseWorkflowExecution,
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow execution paused');
    },
    onError: (error: Error) => {
      toast.error(`Failed to pause workflow: ${error.message}`);
      onError?.(error);
    }
  });

  const resumeExecutionMutation = useMutation({
    mutationFn: scanWorkflowAPI.resumeWorkflowExecution,
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow execution resumed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resume workflow: ${error.message}`);
      onError?.(error);
    }
  });

  const cancelExecutionMutation = useMutation({
    mutationFn: scanWorkflowAPI.cancelWorkflowExecution,
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow execution cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel workflow: ${error.message}`);
      onError?.(error);
    }
  });

  // Mutations for approval operations
  const approveWorkflowMutation = useMutation({
    mutationFn: ({ approvalId, comment }: { approvalId: string; comment?: string }) =>
      scanWorkflowAPI.approveWorkflow(approvalId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-approvals']);
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow approved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve workflow: ${error.message}`);
      onError?.(error);
    }
  });

  const rejectWorkflowMutation = useMutation({
    mutationFn: ({ approvalId, reason }: { approvalId: string; reason: string }) =>
      scanWorkflowAPI.rejectWorkflow(approvalId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-approvals']);
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject workflow: ${error.message}`);
      onError?.(error);
    }
  });

  // Utility functions
  const getWorkflowStatusColor = useCallback((status: WorkflowStatus): string => {
    const statusColors = {
      [WorkflowStatus.QUEUED]: 'text-gray-500',
      [WorkflowStatus.INITIALIZING]: 'text-blue-500',
      [WorkflowStatus.RUNNING]: 'text-green-500',
      [WorkflowStatus.WAITING]: 'text-yellow-500',
      [WorkflowStatus.COMPLETED]: 'text-green-600',
      [WorkflowStatus.FAILED]: 'text-red-500',
      [WorkflowStatus.SKIPPED]: 'text-gray-400',
      [WorkflowStatus.RETRYING]: 'text-orange-500'
    };
    return statusColors[status] || 'text-gray-500';
  }, []);

  const getWorkflowPriorityLabel = useCallback((priority: WorkflowPriority): string => {
    const priorityLabels = {
      [WorkflowPriority.LOW]: 'Low',
      [WorkflowPriority.NORMAL]: 'Normal',
      [WorkflowPriority.HIGH]: 'High',
      [WorkflowPriority.CRITICAL]: 'Critical',
      [WorkflowPriority.URGENT]: 'Urgent'
    };
    return priorityLabels[priority] || 'Normal';
  }, []);

  const getStepTypeIcon = useCallback((type: StepType): string => {
    const typeIcons = {
      [StepType.SCAN]: '🔍',
      [StepType.VALIDATION]: '✅',
      [StepType.TRANSFORMATION]: '🔄',
      [StepType.NOTIFICATION]: '📧',
      [StepType.APPROVAL]: '👥',
      [StepType.CONDITION]: '🔀',
      [StepType.PARALLEL]: '⚡',
      [StepType.CUSTOM]: '⚙️'
    };
    return typeIcons[type] || '⚙️';
  }, []);

  const calculateProgress = useCallback((execution: WorkflowExecution): number => {
    if (!execution.steps || execution.steps.length === 0) return 0;
    
    const completedSteps = execution.steps.filter(step => 
      step.status === WorkflowStatus.COMPLETED || step.status === WorkflowStatus.SKIPPED
    ).length;
    
    return Math.round((completedSteps / execution.steps.length) * 100);
  }, []);

  const getEstimatedCompletion = useCallback((execution: WorkflowExecution): Date | null => {
    if (!execution.started_at || execution.status === WorkflowStatus.COMPLETED) return null;
    
    const progress = calculateProgress(execution);
    if (progress === 0) return null;
    
    const elapsed = Date.now() - new Date(execution.started_at).getTime();
    const totalEstimate = (elapsed / progress) * 100;
    const remaining = totalEstimate - elapsed;
    
    return new Date(Date.now() + remaining);
  }, [calculateProgress]);

  // Action handlers
  const setFilters = useCallback((newFilters: Partial<WorkflowFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  }, []);

  const setSort = useCallback((newSort: WorkflowSort) => {
    setSortState(newSort);
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page when sorting
  }, []);

  const setPagination = useCallback((page: number, size?: number) => {
    setPaginationState(prev => ({
      ...prev,
      page,
      ...(size && { size })
    }));
  }, []);

  // Template operations
  const createTemplate = useCallback(async (template: any): Promise<WorkflowTemplate> => {
    return createTemplateMutation.mutateAsync(template);
  }, [createTemplateMutation]);

  const updateTemplate = useCallback(async (id: string, updates: any): Promise<WorkflowTemplate> => {
    return updateTemplateMutation.mutateAsync({ id, updates });
  }, [updateTemplateMutation]);

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    return deleteTemplateMutation.mutateAsync(id);
  }, [deleteTemplateMutation]);

  const cloneTemplate = useCallback(async (id: string, name: string): Promise<WorkflowTemplate> => {
    try {
      const result = await scanWorkflowAPI.cloneWorkflowTemplate(id, name);
      queryClient.invalidateQueries(['workflow-templates']);
      toast.success('Workflow template cloned successfully');
      return result;
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to clone template: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const validateTemplate = useCallback(async (template: any): Promise<WorkflowValidation> => {
    try {
      return await scanWorkflowAPI.validateWorkflowTemplate(template);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  // Execution operations
  const executeWorkflow = useCallback(async (templateId: string, context: ExecutionContext): Promise<WorkflowExecution> => {
    return executeWorkflowMutation.mutateAsync({ templateId, context });
  }, [executeWorkflowMutation]);

  const pauseExecution = useCallback(async (executionId: string): Promise<void> => {
    return pauseExecutionMutation.mutateAsync(executionId);
  }, [pauseExecutionMutation]);

  const resumeExecution = useCallback(async (executionId: string): Promise<void> => {
    return resumeExecutionMutation.mutateAsync(executionId);
  }, [resumeExecutionMutation]);

  const cancelExecution = useCallback(async (executionId: string): Promise<void> => {
    return cancelExecutionMutation.mutateAsync(executionId);
  }, [cancelExecutionMutation]);

  const retryExecution = useCallback(async (executionId: string): Promise<WorkflowExecution> => {
    try {
      const result = await scanWorkflowAPI.retryWorkflowExecution(executionId);
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow execution retried');
      return result;
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to retry workflow: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  const skipStep = useCallback(async (executionId: string, stepId: string): Promise<void> => {
    try {
      await scanWorkflowAPI.skipWorkflowStep(executionId, stepId);
      queryClient.invalidateQueries(['workflow-executions']);
      toast.success('Workflow step skipped');
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to skip step: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  // Approval operations
  const approveWorkflow = useCallback(async (approvalId: string, comment?: string): Promise<void> => {
    return approveWorkflowMutation.mutateAsync({ approvalId, comment });
  }, [approveWorkflowMutation]);

  const rejectWorkflow = useCallback(async (approvalId: string, reason: string): Promise<void> => {
    return rejectWorkflowMutation.mutateAsync({ approvalId, reason });
  }, [rejectWorkflowMutation]);

  const requestApproval = useCallback(async (executionId: string, approvers: string[]): Promise<ApprovalWorkflow> => {
    try {
      const result = await scanWorkflowAPI.requestWorkflowApproval(executionId, approvers);
      queryClient.invalidateQueries(['workflow-approvals']);
      toast.success('Approval request sent');
      return result;
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to request approval: ${err.message}`);
      onError?.(err);
      throw error;
    }
  }, [queryClient, onError]);

  // Analytics functions
  const getWorkflowAnalytics = useCallback(async (timeRange?: string): Promise<any> => {
    try {
      return await scanWorkflowAPI.getWorkflowAnalytics(timeRange);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const getExecutionLogs = useCallback(async (executionId: string): Promise<any[]> => {
    try {
      return await scanWorkflowAPI.getWorkflowExecutionLogs(executionId);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  const getDependencyGraph = useCallback(async (templateId: string): Promise<DependencyGraph> => {
    try {
      return await scanWorkflowAPI.getWorkflowDependencies(templateId);
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw error;
    }
  }, [onError]);

  // Real-time updates subscription
  const subscribeToWorkflowUpdates = useCallback((workflowId: string) => {
    if (!enableRealTimeUpdates || workflowWsRef.current) return;

    try {
      workflowWsRef.current = scanWorkflowAPI.subscribeToWorkflowUpdates(
        workflowId,
        (data) => {
          // Handle real-time workflow updates
          if (data.type === 'execution_status_changed') {
            queryClient.invalidateQueries(['workflow-executions']);
            
            if (data.execution) {
              if (data.execution.status === WorkflowStatus.COMPLETED) {
                onWorkflowComplete?.(data.execution);
              } else if (data.execution.status === WorkflowStatus.FAILED) {
                onWorkflowFailed?.(data.execution);
              }
            }
          }
        },
        (error) => {
          console.error('Workflow WebSocket error:', error);
          onError?.(new Error('Real-time workflow updates connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to workflow updates:', error);
    }
  }, [enableRealTimeUpdates, queryClient, onWorkflowComplete, onWorkflowFailed, onError]);

  const unsubscribeFromWorkflowUpdates = useCallback(() => {
    if (workflowWsRef.current) {
      workflowWsRef.current.close();
      workflowWsRef.current = null;
    }
  }, []);

  const subscribeToApprovalNotifications = useCallback(() => {
    if (!enableApprovalNotifications || approvalWsRef.current) return;

    try {
      approvalWsRef.current = scanWorkflowAPI.subscribeToApprovalNotifications(
        (notification) => {
          onApprovalRequired?.(notification);
          queryClient.invalidateQueries(['workflow-approvals']);
        },
        (error) => {
          console.error('Approval notifications WebSocket error:', error);
          onError?.(new Error('Approval notifications connection failed'));
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to approval notifications:', error);
    }
  }, [enableApprovalNotifications, queryClient, onApprovalRequired, onError]);

  const unsubscribeFromApprovalNotifications = useCallback(() => {
    if (approvalWsRef.current) {
      approvalWsRef.current.close();
      approvalWsRef.current = null;
    }
  }, []);

  // Effect to update pagination when data changes
  useEffect(() => {
    if (templatesData) {
      setPaginationState(prev => ({
        ...prev,
        total: templatesData.total || 0,
        hasNext: templatesData.has_next || false,
        hasPrevious: templatesData.has_previous || false
      }));
    }
  }, [templatesData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromWorkflowUpdates();
      unsubscribeFromApprovalNotifications();
    };
  }, [unsubscribeFromWorkflowUpdates, unsubscribeFromApprovalNotifications]);

  // Load initial data and setup subscriptions
  useEffect(() => {
    if (enableApprovalNotifications) {
      subscribeToApprovalNotifications();
    }
  }, [enableApprovalNotifications, subscribeToApprovalNotifications]);

  // Combine loading states
  const isLoading = templatesLoading || executionsLoading || metricsLoading;
  const isExecuting = executeWorkflowMutation.isPending;
  const isSaving = createTemplateMutation.isPending || updateTemplateMutation.isPending || deleteTemplateMutation.isPending;

  return {
    // Templates
    templates: templatesData?.templates || [],
    templatesLoading,
    templatesError,
    
    // Executions
    executions: executionsData?.executions || [],
    executionsLoading,
    executionsError,
    
    // Metrics
    metrics,
    metricsLoading,
    metricsError,
    
    // Approvals
    approvals: approvalsData?.approvals || [],
    approvalsLoading,
    approvalsError,
    
    // State management
    selectedTemplate,
    selectedExecution,
    filters,
    sort,
    pagination,
    
    // Actions
    setSelectedTemplate,
    setSelectedExecution,
    setFilters,
    setSort,
    setPagination,
    
    // Template operations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    validateTemplate,
    
    // Execution operations
    executeWorkflow,
    pauseExecution,
    resumeExecution,
    cancelExecution,
    retryExecution,
    skipStep,
    
    // Approval operations
    approveWorkflow,
    rejectWorkflow,
    requestApproval,
    
    // Analytics
    getWorkflowAnalytics,
    getExecutionLogs,
    getDependencyGraph,
    
    // Utility functions
    getWorkflowStatusColor,
    getWorkflowPriorityLabel,
    getStepTypeIcon,
    calculateProgress,
    getEstimatedCompletion,
    
    // Real-time subscriptions
    subscribeToWorkflowUpdates,
    unsubscribeFromWorkflowUpdates,
    subscribeToApprovalNotifications,
    unsubscribeFromApprovalNotifications,
    
    // Loading states
    isLoading,
    isExecuting,
    isSaving
  };
};