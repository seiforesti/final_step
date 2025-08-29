// ============================================================================
// JOB WORKFLOW SPACE HOOK - WORKSPACE MANAGEMENT
// ============================================================================
// Advanced job workflow space management hook
// Provides comprehensive job workflow orchestration and project management capabilities

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UUID, ISODateString } from '../types/racine-core.types';

// ============================================================================
// JOB WORKFLOW INTERFACES
// ============================================================================

export type JobStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'running' | 'failed';

export interface JobWorkflow {
  id: UUID;
  name: string;
  description: string;
  projectId: UUID;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'data_pipeline' | 'ml_training' | 'etl_process' | 'reporting' | 'custom';
  steps: WorkflowStep[];
  dependencies: WorkflowDependency[];
  schedule: WorkflowSchedule;
  actions: WorkflowAction[];
  metadata: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  estimatedDuration: number;
  actualDuration?: number;
  progress: number;
  owner: UUID;
  team: UUID[];
  tags: string[];
}

export interface WorkflowStep {
  id: UUID;
  name: string;
  description: string;
  type: 'data_processing' | 'ml_training' | 'validation' | 'notification' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  order: number;
  dependencies: string[];
  timeout: number;
  retryCount: number;
  maxRetries: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  error?: string;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  duration?: number;
  metadata: Record<string, any>;
}

export interface WorkflowDependency {
  id: UUID;
  workflowId: UUID;
  dependencyType: 'data' | 'resource' | 'workflow' | 'external';
  dependencyId: string;
  condition: 'completed' | 'successful' | 'available' | 'custom';
  customCondition?: string;
  timeout: number;
  isRequired: boolean;
  metadata: Record<string, any>;
}

export interface WorkflowSchedule {
  id: UUID;
  workflowId: UUID;
  type: 'manual' | 'scheduled' | 'event_driven' | 'continuous';
  cronExpression?: string;
  timezone: string;
  startDate: ISODateString;
  endDate?: ISODateString;
  isActive: boolean;
  lastRun?: ISODateString;
  nextRun?: ISODateString;
  maxConcurrentRuns: number;
  retryOnFailure: boolean;
  metadata: Record<string, any>;
}

export interface WorkflowAction {
  id: UUID;
  workflowId: UUID;
  name: string;
  description: string;
  type: 'start' | 'pause' | 'resume' | 'stop' | 'restart' | 'rollback';
  conditions: Record<string, any>;
  permissions: string[];
  isEnabled: boolean;
  metadata: Record<string, any>;
}

export interface JobExecution {
  id: UUID;
  workflowId: UUID;
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: ISODateString;
  completedAt?: ISODateString;
  duration?: number;
  progress: number;
  currentStep?: string;
  logs: ExecutionLog[];
  metadata: Record<string, any>;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface ExecutionLog {
  id: UUID;
  executionId: UUID;
  stepId: UUID;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: ISODateString;
  metadata: Record<string, any>;
}

export interface WorkflowTemplate {
  id: UUID;
  name: string;
  description: string;
  category: string;
  version: string;
  workflow: Partial<JobWorkflow>;
  isPublic: boolean;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  usageCount: number;
  rating: number;
  tags: string[];
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface WorkflowListResponse {
  workflows: JobWorkflow[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface WorkflowExecutionResponse {
  execution: JobExecution;
  logs: ExecutionLog[];
  metrics: Record<string, any>;
}

export interface WorkflowTemplateResponse {
  templates: WorkflowTemplate[];
  total: number;
  categories: string[];
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  projectId: UUID;
  type: JobWorkflow['type'];
  priority: JobWorkflow['priority'];
  steps: Partial<WorkflowStep>[];
  dependencies: Partial<WorkflowDependency>[];
  schedule: Partial<WorkflowSchedule>;
  team: UUID[];
  tags: string[];
  metadata?: Record<string, any>;
}

export interface UpdateWorkflowRequest {
  id: UUID;
  name?: string;
  description?: string;
  priority?: JobWorkflow['priority'];
  steps?: Partial<WorkflowStep>[];
  dependencies?: Partial<WorkflowDependency>[];
  schedule?: Partial<WorkflowSchedule>;
  team?: UUID[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ExecuteWorkflowRequest {
  workflowId: UUID;
  inputs?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// USE JOB WORKFLOW SPACE HOOK
// ============================================================================

export const useJobWorkflowSpace = () => {
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<JobWorkflow | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<JobExecution | null>(null);

  // ============================================================================
  // WORKFLOW QUERIES
  // ============================================================================

  const useWorkflowsQuery = (filters?: {
    projectId?: UUID;
    status?: JobWorkflow['status'];
    type?: JobWorkflow['type'];
    priority?: JobWorkflow['priority'];
    owner?: UUID;
    tags?: string[];
    search?: string;
  }, options = {}) => {
    return useQuery({
      queryKey: ['workflows', filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.projectId) params.append('projectId', filters.projectId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.owner) params.append('owner', filters.owner);
        if (filters?.tags) params.append('tags', filters.tags.join(','));
        if (filters?.search) params.append('search', filters.search);

        const response = await fetch(`/api/workflows?${params}`);
        if (!response.ok) throw new Error('Failed to fetch workflows');
        return response.json() as Promise<WorkflowListResponse>;
      },
      ...options,
    });
  };

  const useWorkflowQuery = (workflowId: UUID, options = {}) => {
    return useQuery({
      queryKey: ['workflow', workflowId],
      queryFn: async () => {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (!response.ok) throw new Error('Failed to fetch workflow');
        return response.json() as Promise<JobWorkflow>;
      },
      enabled: !!workflowId,
      ...options,
    });
  };

  const useWorkflowExecutionsQuery = (workflowId: UUID, options = {}) => {
    return useQuery({
      queryKey: ['workflow-executions', workflowId],
      queryFn: async () => {
        const response = await fetch(`/api/workflows/${workflowId}/executions`);
        if (!response.ok) throw new Error('Failed to fetch executions');
        return response.json() as Promise<JobExecution[]>;
      },
      enabled: !!workflowId,
      ...options,
    });
  };

  const useWorkflowTemplatesQuery = (category?: string, options = {}) => {
    return useQuery({
      queryKey: ['workflow-templates', category],
      queryFn: async () => {
        const params = category ? `?category=${category}` : '';
        const response = await fetch(`/api/workflow-templates${params}`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        return response.json() as Promise<WorkflowTemplateResponse>;
      },
      ...options,
    });
  };

  // ============================================================================
  // WORKFLOW MUTATIONS
  // ============================================================================

  const createWorkflowMutation = useMutation({
    mutationFn: async (request: CreateWorkflowRequest): Promise<JobWorkflow> => {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to create workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async (request: UpdateWorkflowRequest): Promise<JobWorkflow> => {
      const response = await fetch(`/api/workflows/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to update workflow');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', data.id] });
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId: UUID): Promise<void> => {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workflow');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: async (request: ExecuteWorkflowRequest): Promise<JobExecution> => {
      const response = await fetch(`/api/workflows/${request.workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to execute workflow');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions', data.workflowId] });
    },
  });

  // ============================================================================
  // WORKFLOW ACTIONS
  // ============================================================================

  const pauseWorkflow = useCallback(async (workflowId: UUID) => {
    const response = await fetch(`/api/workflows/${workflowId}/pause`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to pause workflow');
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
    queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
  }, [queryClient]);

  const resumeWorkflow = useCallback(async (workflowId: UUID) => {
    const response = await fetch(`/api/workflows/${workflowId}/resume`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to resume workflow');
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
    queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
  }, [queryClient]);

  const stopWorkflow = useCallback(async (workflowId: UUID) => {
    const response = await fetch(`/api/workflows/${workflowId}/stop`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to stop workflow');
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
    queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
  }, [queryClient]);

  const restartWorkflow = useCallback(async (workflowId: UUID) => {
    const response = await fetch(`/api/workflows/${workflowId}/restart`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to restart workflow');
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
    queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
  }, [queryClient]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getWorkflowStatus = useCallback((workflow: JobWorkflow) => {
    if (workflow.status === 'completed') return 'success';
    if (workflow.status === 'failed') return 'error';
    if (workflow.status === 'running') return 'warning';
    if (workflow.status === 'paused') return 'info';
    return 'default';
  }, []);

  const getWorkflowProgress = useCallback((workflow: JobWorkflow) => {
    if (workflow.status === 'completed') return 100;
    if (workflow.status === 'failed') return 0;
    return workflow.progress || 0;
  }, []);

  const canExecuteWorkflow = useCallback((workflow: JobWorkflow) => {
    return workflow.status === 'draft' || workflow.status === 'paused';
  }, []);

  const canPauseWorkflow = useCallback((workflow: JobWorkflow) => {
    return workflow.status === 'active' || workflow.status === 'running';
  }, []);

  const canResumeWorkflow = useCallback((workflow: JobWorkflow) => {
    return workflow.status === 'paused';
  }, []);

  const canStopWorkflow = useCallback((workflow: JobWorkflow) => {
    return workflow.status === 'active' || workflow.status === 'running';
  }, []);

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // State
    selectedWorkflow,
    selectedExecution,
    setSelectedWorkflow,
    setSelectedExecution,

    // Queries
    useWorkflowsQuery,
    useWorkflowQuery,
    useWorkflowExecutionsQuery,
    useWorkflowTemplatesQuery,

    // Mutations
    createWorkflow: createWorkflowMutation.mutateAsync,
    updateWorkflow: updateWorkflowMutation.mutateAsync,
    deleteWorkflow: deleteWorkflowMutation.mutateAsync,
    executeWorkflow: executeWorkflowMutation.mutateAsync,

    // Actions
    pauseWorkflow,
    resumeWorkflow,
    stopWorkflow,
    restartWorkflow,

    // Utilities
    getWorkflowStatus,
    getWorkflowProgress,
    canExecuteWorkflow,
    canPauseWorkflow,
    canResumeWorkflow,
    canStopWorkflow,

    // Loading states
    isCreating: createWorkflowMutation.isPending,
    isUpdating: updateWorkflowMutation.isPending,
    isDeleting: deleteWorkflowMutation.isPending,
    isExecuting: executeWorkflowMutation.isPending,
  };
};
