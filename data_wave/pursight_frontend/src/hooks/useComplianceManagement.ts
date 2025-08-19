import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { 
  fetchComplianceRules, 
  fetchComplianceIssues, 
  fetchComplianceReports,
  createComplianceRule,
  updateComplianceRule,
  deleteComplianceRule,
  resolveComplianceIssue,
  generateComplianceReport
} from '../api/compliance';
import { ComplianceRule } from '../models/ComplianceRule';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { ComplianceReport } from '../models/ComplianceReport';
import { useRBACPermissions } from './useRBACPermissions';

interface UseComplianceManagementOptions {
  dataSourceId?: string;
  ruleType?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  status?: 'active' | 'inactive' | 'draft';
  issueStatus?: 'open' | 'resolved' | 'in_progress' | 'waived';
}

/**
 * Advanced hook for compliance management and governance
 * with comprehensive rule management and issue tracking.
 * 
 * Features:
 * - Manages compliance rules and policies
 * - Tracks compliance issues and violations
 * - Generates compliance reports
 * - Supports filtering by data source, rule type, severity, and status
 * - Integrates with RBAC permissions
 */
export function useComplianceManagement(options: UseComplianceManagementOptions = {}) {
  const { 
    dataSourceId, 
    ruleType, 
    severity, 
    status = 'active',
    issueStatus = 'open'
  } = options;
  
  const queryClient = useQueryClient();
  const { hasPermission } = useRBACPermissions();
  const [filters, setFilters] = useState({
    dataSourceId,
    ruleType,
    severity,
    status,
    issueStatus
  });

  // Check permissions
  const canViewCompliance = hasPermission('compliance.view');
  const canManageRules = hasPermission('compliance.manage.rules');
  const canResolveIssues = hasPermission('compliance.resolve.issues');
  const canGenerateReports = hasPermission('compliance.generate.reports');

  // Fetch compliance rules
  const {
    data: rules,
    isLoading: isRulesLoading,
    isError: isRulesError,
    error: rulesError,
    refetch: refetchRules
  } = useQuery({
    queryKey: ['complianceRules', filters.dataSourceId, filters.ruleType, filters.severity, filters.status],
    queryFn: () => fetchComplianceRules({
      dataSourceId: filters.dataSourceId,
      ruleType: filters.ruleType,
      severity: filters.severity,
      status: filters.status
    }),
    enabled: canViewCompliance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch compliance issues
  const {
    data: issues,
    isLoading: isIssuesLoading,
    isError: isIssuesError,
    error: issuesError,
    refetch: refetchIssues
  } = useQuery({
    queryKey: ['complianceIssues', filters.dataSourceId, filters.ruleType, filters.severity, filters.issueStatus],
    queryFn: () => fetchComplianceIssues({
      dataSourceId: filters.dataSourceId,
      ruleType: filters.ruleType,
      severity: filters.severity,
      status: filters.issueStatus
    }),
    enabled: canViewCompliance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch compliance reports
  const {
    data: reports,
    isLoading: isReportsLoading,
    isError: isReportsError,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['complianceReports', filters.dataSourceId],
    queryFn: () => fetchComplianceReports({
      dataSourceId: filters.dataSourceId
    }),
    enabled: canViewCompliance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create compliance rule mutation
  const createRuleMutation = useMutation({
    mutationFn: createComplianceRule,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['complianceRules']);
    },
  });

  // Update compliance rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: updateComplianceRule,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['complianceRules']);
    },
  });

  // Delete compliance rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: deleteComplianceRule,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['complianceRules']);
    },
  });

  // Resolve compliance issue mutation
  const resolveIssueMutation = useMutation({
    mutationFn: resolveComplianceIssue,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['complianceIssues']);
    },
  });

  // Generate compliance report mutation
  const generateReportMutation = useMutation({
    mutationFn: generateComplianceReport,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['complianceReports']);
    },
  });

  /**
   * Update filters for compliance data
   * @param newFilters The new filters to apply
   */
  const updateFilters = useCallback((newFilters: Partial<UseComplianceManagementOptions>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  /**
   * Create a new compliance rule
   * @param rule The rule to create
   * @returns Promise resolving when rule is created
   */
  const createRule = useCallback(
    async (rule: Omit<ComplianceRule, 'id'>) => {
      if (!canManageRules) {
        throw new Error('You do not have permission to manage compliance rules');
      }

      return createRuleMutation.mutateAsync(rule);
    },
    [canManageRules, createRuleMutation]
  );

  /**
   * Update an existing compliance rule
   * @param ruleId The ID of the rule to update
   * @param rule The updated rule data
   * @returns Promise resolving when rule is updated
   */
  const updateRule = useCallback(
    async (ruleId: string, rule: Partial<ComplianceRule>) => {
      if (!canManageRules) {
        throw new Error('You do not have permission to manage compliance rules');
      }

      return updateRuleMutation.mutateAsync({
        ruleId,
        ...rule
      });
    },
    [canManageRules, updateRuleMutation]
  );

  /**
   * Delete a compliance rule
   * @param ruleId The ID of the rule to delete
   * @returns Promise resolving when rule is deleted
   */
  const deleteRule = useCallback(
    async (ruleId: string) => {
      if (!canManageRules) {
        throw new Error('You do not have permission to manage compliance rules');
      }

      return deleteRuleMutation.mutateAsync({
        ruleId
      });
    },
    [canManageRules, deleteRuleMutation]
  );

  /**
   * Resolve a compliance issue
   * @param issueId The ID of the issue to resolve
   * @param resolution The resolution details
   * @returns Promise resolving when issue is resolved
   */
  const resolveIssue = useCallback(
    async (issueId: string, resolution: { status: 'resolved' | 'waived'; comment: string }) => {
      if (!canResolveIssues) {
        throw new Error('You do not have permission to resolve compliance issues');
      }

      return resolveIssueMutation.mutateAsync({
        issueId,
        ...resolution
      });
    },
    [canResolveIssues, resolveIssueMutation]
  );

  /**
   * Generate a compliance report
   * @param reportConfig The report configuration
   * @returns Promise resolving when report is generated
   */
  const generateReport = useCallback(
    async (reportConfig: {
      name: string;
      description?: string;
      dataSourceId?: string;
      ruleTypes?: string[];
      severities?: ('critical' | 'high' | 'medium' | 'low')[];
      format?: 'pdf' | 'csv' | 'json';
    }) => {
      if (!canGenerateReports) {
        throw new Error('You do not have permission to generate compliance reports');
      }

      return generateReportMutation.mutateAsync(reportConfig);
    },
    [canGenerateReports, generateReportMutation]
  );

  /**
   * Get a rule by ID
   * @param ruleId The ID of the rule
   * @returns The rule or undefined if not found
   */
  const getRuleById = useCallback(
    (ruleId: string): ComplianceRule | undefined => {
      if (!rules) return undefined;
      return rules.find(rule => rule.id === ruleId);
    },
    [rules]
  );

  /**
   * Get issues for a specific rule
   * @param ruleId The ID of the rule
   * @returns Array of issues for the rule
   */
  const getIssuesByRuleId = useCallback(
    (ruleId: string): ComplianceIssue[] => {
      if (!issues) return [];
      return issues.filter(issue => issue.ruleId === ruleId);
    },
    [issues]
  );

  /**
   * Get issues for a specific data source
   * @param dataSourceId The ID of the data source
   * @returns Array of issues for the data source
   */
  const getIssuesByDataSourceId = useCallback(
    (dataSourceId: string): ComplianceIssue[] => {
      if (!issues) return [];
      return issues.filter(issue => issue.dataSourceId === dataSourceId);
    },
    [issues]
  );

  /**
   * Refresh all compliance data
   */
  const refreshAllComplianceData = useCallback(() => {
    refetchRules();
    refetchIssues();
    refetchReports();
  }, [refetchRules, refetchIssues, refetchReports]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Compliance rules
      rules,
      isRulesLoading,
      isRulesError,
      rulesError,
      
      // Compliance issues
      issues,
      isIssuesLoading,
      isIssuesError,
      issuesError,
      
      // Compliance reports
      reports,
      isReportsLoading,
      isReportsError,
      reportsError,
      
      // Filters
      filters,
      updateFilters,
      
      // Rule operations
      createRule,
      updateRule,
      deleteRule,
      isCreatingRule: createRuleMutation.isLoading,
      isUpdatingRule: updateRuleMutation.isLoading,
      isDeletingRule: deleteRuleMutation.isLoading,
      createRuleError: createRuleMutation.error,
      updateRuleError: updateRuleMutation.error,
      deleteRuleError: deleteRuleMutation.error,
      
      // Issue operations
      resolveIssue,
      isResolvingIssue: resolveIssueMutation.isLoading,
      resolveIssueError: resolveIssueMutation.error,
      
      // Report operations
      generateReport,
      isGeneratingReport: generateReportMutation.isLoading,
      generateReportError: generateReportMutation.error,
      
      // Utilities
      getRuleById,
      getIssuesByRuleId,
      getIssuesByDataSourceId,
      refreshAllComplianceData,
      
      // Permissions
      canViewCompliance,
      canManageRules,
      canResolveIssues,
      canGenerateReports
    }),
    [
      rules,
      isRulesLoading,
      isRulesError,
      rulesError,
      issues,
      isIssuesLoading,
      isIssuesError,
      issuesError,
      reports,
      isReportsLoading,
      isReportsError,
      reportsError,
      filters,
      updateFilters,
      createRule,
      updateRule,
      deleteRule,
      createRuleMutation.isLoading,
      updateRuleMutation.isLoading,
      deleteRuleMutation.isLoading,
      createRuleMutation.error,
      updateRuleMutation.error,
      deleteRuleMutation.error,
      resolveIssue,
      resolveIssueMutation.isLoading,
      resolveIssueMutation.error,
      generateReport,
      generateReportMutation.isLoading,
      generateReportMutation.error,
      getRuleById,
      getIssuesByRuleId,
      getIssuesByDataSourceId,
      refreshAllComplianceData,
      canViewCompliance,
      canManageRules,
      canResolveIssues,
      canGenerateReports
    ]
  );
}