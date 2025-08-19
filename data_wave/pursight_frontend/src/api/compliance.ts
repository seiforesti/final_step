// React Query hooks for Compliance Management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from './axiosConfig';
import { ComplianceRule } from '../models/ComplianceRule';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { ComplianceReport } from '../models/ComplianceReport';

// API prefix for all compliance endpoints
const COMPLIANCE_PREFIX = '/compliance';

// Interfaces for API parameters
interface ComplianceRuleFilters {
  dataSourceId?: string;
  ruleType?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  status?: 'active' | 'inactive' | 'draft';
}

interface ComplianceIssueFilters {
  dataSourceId?: string;
  ruleType?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  status?: 'open' | 'resolved' | 'in_progress' | 'waived';
}

interface ComplianceReportFilters {
  dataSourceId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch compliance rules with optional filters
 */
export const fetchComplianceRules = async (filters: ComplianceRuleFilters = {}): Promise<ComplianceRule[]> => {
  try {
    const { data } = await axios.get(`${COMPLIANCE_PREFIX}/rules`, { params: filters });
    return data;
  } catch (error) {
    console.error('Failed to fetch compliance rules:', error);
    return [];
  }
};

/**
 * Fetch compliance issues with optional filters
 */
export const fetchComplianceIssues = async (filters: ComplianceIssueFilters = {}): Promise<ComplianceIssue[]> => {
  try {
    const { data } = await axios.get(`${COMPLIANCE_PREFIX}/issues`, { params: filters });
    return data;
  } catch (error) {
    console.error('Failed to fetch compliance issues:', error);
    return [];
  }
};

/**
 * Fetch compliance reports with optional filters
 */
export const fetchComplianceReports = async (filters: ComplianceReportFilters = {}): Promise<ComplianceReport[]> => {
  try {
    const { data } = await axios.get(`${COMPLIANCE_PREFIX}/reports`, { params: filters });
    return data;
  } catch (error) {
    console.error('Failed to fetch compliance reports:', error);
    return [];
  }
};

/**
 * Create a new compliance rule
 */
export const createComplianceRule = async (rule: Omit<ComplianceRule, 'id'>): Promise<ComplianceRule> => {
  const { data } = await axios.post(`${COMPLIANCE_PREFIX}/rules`, rule);
  return data;
};

/**
 * Update an existing compliance rule
 */
export const updateComplianceRule = async ({
  id,
  ...rule
}: { id: string } & Partial<ComplianceRule>): Promise<ComplianceRule> => {
  const { data } = await axios.put(`${COMPLIANCE_PREFIX}/rules/${id}`, rule);
  return data;
};

/**
 * Delete a compliance rule
 */
export const deleteComplianceRule = async (id: string): Promise<void> => {
  await axios.delete(`${COMPLIANCE_PREFIX}/rules/${id}`);
};

/**
 * Resolve a compliance issue
 */
export const resolveComplianceIssue = async ({
  id,
  resolution,
  notes
}: {
  id: string;
  resolution: 'fixed' | 'waived' | 'false_positive';
  notes?: string;
}): Promise<ComplianceIssue> => {
  const { data } = await axios.post(`${COMPLIANCE_PREFIX}/issues/${id}/resolve`, {
    resolution,
    notes
  });
  return data;
};

/**
 * Generate a compliance report
 */
export const generateComplianceReport = async ({
  name,
  description,
  dataSourceIds,
  ruleTypes,
  startDate,
  endDate,
  format = 'pdf'
}: {
  name: string;
  description?: string;
  dataSourceIds?: string[];
  ruleTypes?: string[];
  startDate?: string;
  endDate?: string;
  format?: 'pdf' | 'csv' | 'excel';
}): Promise<ComplianceReport> => {
  const { data } = await axios.post(`${COMPLIANCE_PREFIX}/reports/generate`, {
    name,
    description,
    dataSourceIds,
    ruleTypes,
    startDate,
    endDate,
    format
  });
  return data;
};

// React Query hooks

/**
 * Hook to fetch and cache compliance rules
 */
export const useComplianceRules = (filters: ComplianceRuleFilters = {}) =>
  useQuery<ComplianceRule[], Error>({
    queryKey: ['complianceRules', filters],
    queryFn: () => fetchComplianceRules(filters),
  });

/**
 * Hook to fetch and cache compliance issues
 */
export const useComplianceIssues = (filters: ComplianceIssueFilters = {}) =>
  useQuery<ComplianceIssue[], Error>({
    queryKey: ['complianceIssues', filters],
    queryFn: () => fetchComplianceIssues(filters),
  });

/**
 * Hook to fetch and cache compliance reports
 */
export const useComplianceReports = (filters: ComplianceReportFilters = {}) =>
  useQuery<ComplianceReport[], Error>({
    queryKey: ['complianceReports', filters],
    queryFn: () => fetchComplianceReports(filters),
  });

/**
 * Hook to create a compliance rule
 */
export const useCreateComplianceRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComplianceRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceRules'] }),
  });
};

/**
 * Hook to update a compliance rule
 */
export const useUpdateComplianceRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateComplianceRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceRules'] }),
  });
};

/**
 * Hook to delete a compliance rule
 */
export const useDeleteComplianceRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComplianceRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceRules'] }),
  });
};

/**
 * Hook to resolve a compliance issue
 */
export const useResolveComplianceIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveComplianceIssue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceIssues'] }),
  });
};

/**
 * Hook to generate a compliance report
 */
export const useGenerateComplianceReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateComplianceReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceReports'] }),
  });
};