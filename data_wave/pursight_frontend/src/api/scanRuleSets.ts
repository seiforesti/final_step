import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from './axiosConfig';

/**
 * API functions for scan rule sets
 */

// Types
export interface ScanRuleSet {
  id: number;
  name: string;
  description: string;
  data_source_id: number;
  include_patterns: string[];
  exclude_patterns: string[];
  sample_size: number;
  scan_level: 'database' | 'schema' | 'table' | 'column';
  created_at: string;
  updated_at: string;
  is_global: boolean;
  scan_settings?: Record<string, any>;
}

export interface ValidationResult {
  total_entities: number;
  included_entities: number;
  excluded_entities: number;
  entity_types: {
    type: string;
    total: number;
    included: number;
    excluded: number;
  }[];
}

// API functions

/**
 * Get all scan rule sets
 */
export const getAllScanRuleSets = async () => {
  const { data } = await axios.get('/scan/rule-sets');
  return data as ScanRuleSet[];
};

/**
 * Get a specific scan rule set by ID
 */
export const getScanRuleSet = async (id: number) => {
  const { data } = await axios.get(`/scan/rule-sets/${id}`);
  return data as ScanRuleSet;
};

/**
 * Create a new scan rule set
 */
export const createScanRuleSet = async (ruleSet: Omit<ScanRuleSet, 'id' | 'created_at' | 'updated_at'>) => {
  const { data } = await axios.post('/scan/rule-sets', ruleSet);
  return data as ScanRuleSet;
};

/**
 * Update an existing scan rule set
 */
export const updateScanRuleSet = async (
  id: number,
  ruleSet: Partial<Omit<ScanRuleSet, 'id' | 'created_at' | 'updated_at'>>
) => {
  const { data } = await axios.put(`/scan/rule-sets/${id}`, ruleSet);
  return data as ScanRuleSet;
};

/**
 * Delete a scan rule set
 */
export const deleteScanRuleSet = async (id: number) => {
  const { data } = await axios.delete(`/scan/rule-sets/${id}`);
  return data;
};

/**
 * Clone a scan rule set
 */
export const cloneScanRuleSet = async (id: number) => {
  const { data } = await axios.post(`/scan/rule-sets/${id}/clone`);
  return data as ScanRuleSet;
};

/**
 * Validate scan rule set patterns
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
  const { data } = await axios.get(`/scan/data-sources/${dataSourceId}/rule-sets`);
  return data as ScanRuleSet[];
};

// React Query hooks

/**
 * Hook for fetching all scan rule sets with React Query
 */
export const useScanRuleSetsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['scanRuleSets'],
    queryFn: getAllScanRuleSets,
    ...options
  });
};

/**
 * Hook for fetching a single scan rule set with React Query
 */
export const useScanRuleSetQuery = (id: number, options = {}) => {
  return useQuery({
    queryKey: ['scanRuleSet', id],
    queryFn: () => getScanRuleSet(id),
    enabled: !!id,
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
    mutationFn: ({ id, ...ruleSet }: { id: number } & Partial<Omit<ScanRuleSet, 'id' | 'created_at' | 'updated_at'>>) => 
      updateScanRuleSet(id, ruleSet),
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
    onSuccess: () => {
      queryClient.invalidateQueries(['scanRuleSets']);
    }
  });
};

/**
 * Hook for cloning a scan rule set with React Query
 */
export const useCloneScanRuleSetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cloneScanRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries(['scanRuleSets']);
    }
  });
};

/**
 * Hook for validating scan rule set patterns with React Query
 */
export const useValidateScanRulePatternsMutation = () => {
  return useMutation({
    mutationFn: validateScanRulePatterns
  });
};

/**
 * Hook for fetching scan rule sets for a specific data source with React Query
 */
export const useScanRuleSetsForDataSourceQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['scanRuleSets', 'dataSource', dataSourceId],
    queryFn: () => getScanRuleSetsByDataSource(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};