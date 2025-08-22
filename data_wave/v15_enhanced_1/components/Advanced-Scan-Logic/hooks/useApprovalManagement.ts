"use client";

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalAPI } from '../services/approval-apis';
import { toast } from '@/hooks/use-toast';
import { useRBAC } from '@/components/Advanced_RBAC_Datagovernance_System/hooks/useRBACState';

// Advanced approval workflow management hooks
export const useApprovalWorkflows = (filters?: ApprovalWorkflowFilters) => {
  const { hasPermission } = useRBAC();
  const canManageWorkflows = hasPermission('workflow', 'manage');
  
  return useQuery({
    queryKey: ['approval-workflows', filters],
    queryFn: () => approvalAPI.getWorkflows(filters),
    enabled: canManageWorkflows,
    staleTime: 30000,
    retry: 3,
    refetchOnWindowFocus: true,
    select: (data) => ({
      ...data,
      workflows: data.workflows?.map(workflow => ({
        ...workflow,
        status: workflow.status || 'draft',
        priority: workflow.priority || 'medium',
        createdAt: new Date(workflow.createdAt),
        updatedAt: new Date(workflow.updatedAt)
      }))
    })
  });
};

export const useApprovalRequests = (filters?: ApprovalRequestFilters) => {
  const { hasPermission } = useRBAC();
  const canViewRequests = hasPermission('approval', 'read');
  
  return useQuery({
    queryKey: ['approval-requests', filters],
    queryFn: () => approvalAPI.getRequests(filters),
    enabled: canViewRequests,
    staleTime: 15000,
    retry: 2,
    refetchOnWindowFocus: true,
    select: (data) => ({
      ...data,
      requests: data.requests?.map(request => ({
        ...request,
        submittedAt: new Date(request.submittedAt),
        deadline: request.deadline ? new Date(request.deadline) : null,
        urgency: calculateUrgency(request.deadline, request.priority)
      }))
    })
  });
};

export const useApprovalPolicies = (filters?: ApprovalPolicyFilters) => {
  const { hasPermission } = useRBAC();
  const canManagePolicies = hasPermission('policy', 'manage');
  
  return useQuery({
    queryKey: ['approval-policies', filters],
    queryFn: () => approvalAPI.getPolicies(filters),
    enabled: canManagePolicies,
    staleTime: 60000,
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useApprovalActions = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useRBAC();
  
  const approveRequest = useMutation({
    mutationFn: ({ requestId, comment, approvedBy }: ApproveRequestPayload) =>
      approvalAPI.approveRequest(requestId, { comment, approvedBy }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast({
        title: "Request Approved",
        description: `Request ${variables.requestId} has been approved successfully.`,
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve the request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const rejectRequest = useMutation({
    mutationFn: ({ requestId, comment, rejectedBy, reason }: RejectRequestPayload) =>
      approvalAPI.rejectRequest(requestId, { comment, rejectedBy, reason }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast({
        title: "Request Rejected",
        description: `Request ${variables.requestId} has been rejected.`,
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const escalateRequest = useMutation({
    mutationFn: ({ requestId, escalatedTo, reason }: EscalateRequestPayload) =>
      approvalAPI.escalateRequest(requestId, { escalatedTo, reason }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      toast({
        title: "Request Escalated",
        description: `Request ${variables.requestId} has been escalated.`,
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Escalation Failed",
        description: "Failed to escalate the request. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    approveRequest,
    rejectRequest,
    escalateRequest,
    canApprove: hasPermission('approval', 'approve'),
    canReject: hasPermission('approval', 'reject'),
    canEscalate: hasPermission('approval', 'escalate')
  };
};

export const useApprovalWorkflowCreation = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useRBAC();
  
  const createWorkflow = useMutation({
    mutationFn: (workflow: CreateWorkflowPayload) => approvalAPI.createWorkflow(workflow),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast({
        title: "Workflow Created",
        description: "New approval workflow has been created successfully.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create the workflow. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateWorkflow = useMutation({
    mutationFn: ({ id, updates }: UpdateWorkflowPayload) => 
      approvalAPI.updateWorkflow(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast({
        title: "Workflow Updated",
        description: "Workflow has been updated successfully.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update the workflow. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    createWorkflow,
    updateWorkflow,
    canCreate: hasPermission('workflow', 'create'),
    canUpdate: hasPermission('workflow', 'update')
  };
};

// Utility functions
const calculateUrgency = (deadline: Date | null, priority: string): 'low' | 'medium' | 'high' | 'critical' => {
  if (!deadline) return priority === 'high' ? 'high' : 'medium';
  
  const now = new Date();
  const timeDiff = deadline.getTime() - now.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  if (daysDiff < 1) return 'critical';
  if (daysDiff < 3) return 'high';
  if (daysDiff < 7) return 'medium';
  return 'low';
};

// Type definitions
interface ApprovalWorkflowFilters {
  status?: string;
  priority?: string;
  createdBy?: string;
  dateRange?: { start: Date; end: Date };
}

interface ApprovalRequestFilters {
  status?: string;
  priority?: string;
  submittedBy?: string;
  assignedTo?: string;
  dateRange?: { start: Date; end: Date };
}

interface ApprovalPolicyFilters {
  type?: string;
  active?: boolean;
  department?: string;
}

interface ApproveRequestPayload {
  requestId: string;
  comment?: string;
  approvedBy: string;
}

interface RejectRequestPayload {
  requestId: string;
  comment?: string;
  rejectedBy: string;
  reason: string;
}

interface EscalateRequestPayload {
  requestId: string;
  escalatedTo: string;
  reason: string;
}

interface CreateWorkflowPayload {
  name: string;
  description: string;
  steps: WorkflowStep[];
  approvers: string[];
  autoApproval?: boolean;
  escalationRules?: EscalationRule[];
}

interface UpdateWorkflowPayload {
  id: string;
  updates: Partial<CreateWorkflowPayload>;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'review' | 'notification';
  approvers: string[];
  order: number;
  timeout?: number;
}

interface EscalationRule {
  condition: string;
  action: 'escalate' | 'auto-approve' | 'notify';
  target: string;
  delay: number;
}

