'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  ComplianceRule,
  ComplianceRulesResponse,
  ComplianceRuleFormData,
  ComplianceFilters,
  ComplianceViolation,
  ComplianceViolationsResponse,
  ComplianceReport,
  ComplianceWorkflow,
  ComplianceDashboardData,
  WorkflowExecution,
  RemediationExecution
} from '@/types/compliance.types';
import toast from 'react-hot-toast';

// Query keys
const QUERY_KEYS = {
  complianceRules: (filters?: ComplianceFilters) => ['compliance-rules', filters],
  complianceRule: (id: string) => ['compliance-rule', id],
  complianceViolations: (filters?: any) => ['compliance-violations', filters],
  complianceReports: (filters?: any) => ['compliance-reports', filters],
  complianceWorkflows: (filters?: any) => ['compliance-workflows', filters],
  complianceDashboard: () => ['compliance-dashboard'],
  ruleValidation: (id: string) => ['rule-validation', id],
  ruleStatistics: (id: string) => ['rule-statistics', id],
  frameworkCompliance: (framework: string) => ['framework-compliance', framework],
  violationDetails: (id: string) => ['violation-details', id],
  workflowExecution: (id: string) => ['workflow-execution', id],
};

// Compliance Rules hooks
export function useComplianceRules(filters?: ComplianceFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.complianceRules(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.set(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get<ComplianceRulesResponse>(
        `/api/v1/compliance-rules?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useComplianceRule(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.complianceRule(id),
    queryFn: async () => {
      const response = await apiClient.get<ComplianceRule>(
        `/api/v1/compliance-rules/${id}`
      );
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useComplianceDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.complianceDashboard(),
    queryFn: async () => {
      const response = await apiClient.get<ComplianceDashboardData>(
        '/api/v1/compliance/dashboard'
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export function useRuleStatistics(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ruleStatistics(id),
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/v1/compliance-rules/${id}/statistics`
      );
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useFrameworkCompliance(framework: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.frameworkCompliance(framework),
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/v1/compliance/frameworks/${framework}/status`
      );
      return response.data;
    },
    enabled: enabled && !!framework,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Compliance Rules CRUD operations
export function useCreateComplianceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ComplianceRuleFormData) => {
      const response = await apiClient.post<ComplianceRule>(
        '/api/v1/compliance-rules',
        data
      );
      return response.data;
    },
    onSuccess: (newRule) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-rules'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complianceDashboard() });
      
      toast.success(`Compliance rule "${newRule?.name}" created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create compliance rule');
    },
  });
}

export function useUpdateComplianceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ComplianceRuleFormData> }) => {
      const response = await apiClient.put<ComplianceRule>(
        `/api/v1/compliance-rules/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedRule, { id }) => {
      queryClient.setQueryData(QUERY_KEYS.complianceRule(id), updatedRule);
      queryClient.invalidateQueries({ queryKey: ['compliance-rules'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complianceDashboard() });
      
      toast.success(`Compliance rule "${updatedRule?.name}" updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update compliance rule');
    },
  });
}

export function useDeleteComplianceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/compliance-rules/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.complianceRule(deletedId) });
      queryClient.invalidateQueries({ queryKey: ['compliance-rules'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complianceDashboard() });
      
      toast.success('Compliance rule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete compliance rule');
    },
  });
}

export function useToggleRuleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiClient.patch<ComplianceRule>(
        `/api/v1/compliance-rules/${id}/toggle`,
        { enabled }
      );
      return response.data;
    },
    onSuccess: (updatedRule, { id }) => {
      queryClient.setQueryData(QUERY_KEYS.complianceRule(id), updatedRule);
      queryClient.invalidateQueries({ queryKey: ['compliance-rules'] });
      
      toast.success(`Rule ${updatedRule?.enabled ? 'enabled' : 'disabled'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to toggle rule status');
    },
  });
}

// Rule validation and testing
export function useValidateRule() {
  return useMutation({
    mutationFn: async ({ id, testData }: { id: string; testData?: any }) => {
      const response = await apiClient.post(
        `/api/v1/compliance-rules/${id}/validate`,
        { test_data: testData }
      );
      return response.data;
    },
    onSuccess: (result) => {
      if (result?.success) {
        toast.success('Rule validation completed successfully');
      } else {
        toast.warning('Rule validation completed with issues');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to validate rule');
    },
  });
}

export function useExecuteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scope }: { id: string; scope?: any }) => {
      const response = await apiClient.post(
        `/api/v1/compliance-rules/${id}/execute`,
        { execution_scope: scope }
      );
      return response.data;
    },
    onSuccess: (execution, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ruleStatistics(id) });
      queryClient.invalidateQueries({ queryKey: ['compliance-violations'] });
      
      toast.success('Rule execution started successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute rule');
    },
  });
}

// Compliance Violations hooks
export function useComplianceViolations(filters?: any) {
  return useQuery({
    queryKey: QUERY_KEYS.complianceViolations(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.set(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get<ComplianceViolationsResponse>(
        `/api/v1/compliance/violations?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refresh every minute for active violations
  });
}

export function useViolationDetails(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.violationDetails(id),
    queryFn: async () => {
      const response = await apiClient.get<ComplianceViolation>(
        `/api/v1/compliance/violations/${id}`
      );
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Violation management
export function useAcknowledgeViolation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const response = await apiClient.post(
        `/api/v1/compliance/violations/${id}/acknowledge`,
        { comment }
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.violationDetails(id) });
      queryClient.invalidateQueries({ queryKey: ['compliance-violations'] });
      
      toast.success('Violation acknowledged successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to acknowledge violation');
    },
  });
}

export function useResolveViolation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      resolution_comment, 
      remediation_actions 
    }: { 
      id: string; 
      resolution_comment: string; 
      remediation_actions?: string[] 
    }) => {
      const response = await apiClient.post(
        `/api/v1/compliance/violations/${id}/resolve`,
        { 
          resolution_comment, 
          remediation_actions 
        }
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.violationDetails(id) });
      queryClient.invalidateQueries({ queryKey: ['compliance-violations'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complianceDashboard() });
      
      toast.success('Violation resolved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resolve violation');
    },
  });
}

export function useExecuteRemediation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      violationId, 
      actionIds, 
      approvalRequired 
    }: { 
      violationId: string; 
      actionIds: string[]; 
      approvalRequired?: boolean 
    }) => {
      const response = await apiClient.post(
        `/api/v1/compliance/violations/${violationId}/remediate`,
        { 
          action_ids: actionIds, 
          approval_required: approvalRequired 
        }
      );
      return response.data;
    },
    onSuccess: (_, { violationId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.violationDetails(violationId) });
      
      toast.success('Remediation actions initiated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute remediation');
    },
  });
}

// Compliance Reports hooks
export function useComplianceReports(filters?: any) {
  return useQuery({
    queryKey: QUERY_KEYS.complianceReports(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.set(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(
        `/api/v1/compliance/reports?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportConfig: any) => {
      const response = await apiClient.post<ComplianceReport>(
        '/api/v1/compliance/reports/generate',
        reportConfig
      );
      return response.data;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-reports'] });
      
      toast.success(`Report "${report?.name}" generation started`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({ id, format }: { id: string; format: string }) => {
      const response = await apiClient.get(
        `/api/v1/compliance/reports/${id}/download?format=${format}`,
        { responseType: 'blob' }
      );
      return { blob: response.data, format };
    },
    onSuccess: ({ blob, format }, { id }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${id}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download report');
    },
  });
}

// Compliance Workflows hooks
export function useComplianceWorkflows(filters?: any) {
  return useQuery({
    queryKey: QUERY_KEYS.complianceWorkflows(filters),
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/v1/compliance/workflows?${new URLSearchParams(filters).toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWorkflowExecution(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.workflowExecution(id),
    queryFn: async () => {
      const response = await apiClient.get<WorkflowExecution>(
        `/api/v1/compliance/workflows/executions/${id}`
      );
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refresh every 10 seconds for active executions
  });
}

export function useExecuteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, context }: { workflowId: string; context?: any }) => {
      const response = await apiClient.post<WorkflowExecution>(
        `/api/v1/compliance/workflows/${workflowId}/execute`,
        { context }
      );
      return response.data;
    },
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-workflows'] });
      
      toast.success('Workflow execution started successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute workflow');
    },
  });
}

export function useCancelWorkflowExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (executionId: string) => {
      const response = await apiClient.post(
        `/api/v1/compliance/workflows/executions/${executionId}/cancel`
      );
      return response.data;
    },
    onSuccess: (_, executionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workflowExecution(executionId) });
      
      toast.success('Workflow execution cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel workflow execution');
    },
  });
}

// Bulk operations
export function useBulkRuleOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      operation, 
      ruleIds, 
      parameters 
    }: { 
      operation: string; 
      ruleIds: string[]; 
      parameters?: any 
    }) => {
      const response = await apiClient.post(
        '/api/v1/compliance-rules/bulk',
        {
          operation,
          rule_ids: ruleIds,
          parameters,
        }
      );
      return response.data;
    },
    onSuccess: (result, { operation }) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-rules'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complianceDashboard() });
      
      toast.success(`Bulk ${operation} operation completed successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to execute bulk operation');
    },
  });
}

// Export and import
export function useExportComplianceData() {
  return useMutation({
    mutationFn: async ({ 
      type, 
      filters, 
      format 
    }: { 
      type: 'rules' | 'violations' | 'reports'; 
      filters?: any; 
      format: 'json' | 'csv' | 'excel' 
    }) => {
      const response = await apiClient.post(
        `/api/v1/compliance/${type}/export`,
        { filters, format },
        { responseType: 'blob' }
      );
      return { blob: response.data, type, format };
    },
    onSuccess: ({ blob, type, format }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-${type}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Compliance ${type} exported successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export compliance data');
    },
  });
}

export function useImportComplianceRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(
        '/api/v1/compliance-rules/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-rules'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complianceDashboard() });
      
      toast.success(`Successfully imported ${result?.imported_count || 0} compliance rules`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import compliance rules');
    },
  });
}