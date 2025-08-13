import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from './axiosConfig';

/**
 * API functions for scan rule sets
 */

// Types
export interface ScanRuleSetCreateParams {
  name: string;
  description?: string;
  include_patterns: string[];
  exclude_patterns: string[];
  data_source_id?: number;
  is_global: boolean;
  scan_settings?: Record<string, any>;
}

export interface ScanRuleSetUpdateParams {
  name?: string;
  description?: string;
  include_patterns?: string[];
  exclude_patterns?: string[];
  is_global?: boolean;
  scan_settings?: Record<string, any>;
}

export interface ScanRuleSetFilters {
  data_source_id?: number;
  is_global?: boolean;
  search?: string;
}

// API functions

/**
 * Get all scan rule sets with optional filtering
 */
export const getScanRuleSets = async (filters: ScanRuleSetFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.data_source_id) params.append('data_source_id', filters.data_source_id.toString());
  if (filters.is_global !== undefined) params.append('is_global', filters.is_global.toString());
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await axios.get(`/scan/rule-sets?${params.toString()}`);
  return data;
};

/**
 * Get a specific scan rule set by ID
 */
export const getScanRuleSet = async (ruleSetId: number) => {
  const { data } = await axios.get(`/scan/rule-sets/${ruleSetId}`);
  return data;
};

/**
 * Create a new scan rule set
 */
export const createScanRuleSet = async (params: ScanRuleSetCreateParams) => {
  const { data } = await axios.post('/scan/rule-sets', params);
  return data;
};

/**
 * Update an existing scan rule set
 */
export const updateScanRuleSet = async (id: number, params: ScanRuleSetUpdateParams) => {
  const { data } = await axios.put(`/scan/rule-sets/${id}`, params);
  return data;
};

/**
 * Delete a scan rule set
 */
export const deleteScanRuleSet = async (id: number) => {
  await axios.delete(`/scan/rule-sets/${id}`);
  return id;
};

/**
 * Validate scan rule patterns
 */
export const validateScanRulePatterns = async ({
  data_source_id,
  include_patterns,
  exclude_patterns
}: {
  data_source_id: number;
  include_patterns: string[];
  exclude_patterns: string[];
}) => {
  const { data } = await axios.post(`/scan/rule-sets/validate-patterns`, {
    data_source_id,
    include_patterns,
    exclude_patterns
  });
  return data;
};

/**
 * Get scan rule sets for a specific data source
 */
export const getScanRuleSetsByDataSource = async (dataSourceId: number) => {
  const { data } = await axios.get(`/scan/rule-sets?data_source_id=${dataSourceId}`);
  return data;
};

/**
 * Get global scan rule sets
 */
export const getGlobalScanRuleSets = async () => {
  const { data } = await axios.get('/scan/rule-sets?is_global=true');
  return data;
};

// React Query hooks

/**
 * Hook for using scan rule sets with React Query
 */
export const useScanRuleSetsQuery = (filters: ScanRuleSetFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['scanRuleSets', filters],
    queryFn: () => getScanRuleSets(filters),
    ...options
  });
};

/**
 * Hook for fetching a single scan rule set with React Query
 */
export const useScanRuleSetQuery = (ruleSetId: number, options = {}) => {
  return useQuery({
    queryKey: ['scanRuleSet', ruleSetId],
    queryFn: () => getScanRuleSet(ruleSetId),
    enabled: !!ruleSetId,
    ...options
  });
};

/**
 * Hook for creating a scan rule set with React Query
 */
export const useCreateScanRuleSetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createScanRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries(['scanRuleSets']);
    }
  });
};

/**
 * Hook for updating a scan rule set with React Query
 */
export const useUpdateScanRuleSetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & ScanRuleSetUpdateParams) => 
      updateScanRuleSet(id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['scanRuleSets']);
      queryClient.invalidateQueries(['scanRuleSet', variables.id]);
    }
  });
};

/**
 * Hook for deleting a scan rule set with React Query
 */
export const useDeleteScanRuleSetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteScanRuleSet,
    onSuccess: (id) => {
      queryClient.invalidateQueries(['scanRuleSets']);
      queryClient.invalidateQueries(['scanRuleSet', id]);
    }
  });
};

/**
 * Hook for validating scan rule patterns with React Query
 */
export const useValidateScanRulePatternsMutation = () => {
  return useMutation({
    mutationFn: validateScanRulePatterns
  });
};