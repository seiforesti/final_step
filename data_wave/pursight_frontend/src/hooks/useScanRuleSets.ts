import { useQuery } from '@tanstack/react-query';
import {
  ScanRuleSet,
  ValidationResult,
  getScanRuleSet,
  getAllScanRuleSets,
  getScanRuleSetsByDataSource,
  createScanRuleSet,
  updateScanRuleSet,
  deleteScanRuleSet,
  cloneScanRuleSet,
  validateScanRulePatterns,
  useCreateScanRuleSetMutation,
  useUpdateScanRuleSetMutation,
  useDeleteScanRuleSetMutation,
  useCloneScanRuleSetMutation,
  useValidateScanRulePatternsMutation
} from '../api/scanRuleSets';

// Types are imported from scanRuleSets.ts

export const useScanRuleSets = () => {
  // Use the query hooks for fetching data
  const useFetchAllScanRuleSets = () => {
    return useQuery(['scanRuleSets'], getAllScanRuleSets);
  };

  const useFetchScanRuleSet = (id: number) => {
    return useQuery(['scanRuleSet', id], () => getScanRuleSet(id));
  };

  const useFetchScanRuleSetsByDataSource = (dataSourceId: number) => {
    return useQuery(
      ['scanRuleSets', 'dataSource', dataSourceId], 
      () => getScanRuleSetsByDataSource(dataSourceId)
    );
  };

  return {
    // Query hooks
    useFetchAllScanRuleSets,
    useFetchScanRuleSet,
    useFetchScanRuleSetsByDataSource,
    
    // Mutation hooks
    useCreateScanRuleSetMutation,
    useUpdateScanRuleSetMutation,
    useDeleteScanRuleSetMutation,
    useCloneScanRuleSetMutation,
    useValidateScanRulePatternsMutation,
  };
};