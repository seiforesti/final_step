import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRBACPermissions } from './useRBACPermissions';
import {
  ScanRuleSetFilters,
  ScanRuleSetCreateParams,
  ScanRuleSetUpdateParams,
  useScanRuleSetsQuery,
  useScanRuleSetQuery,
  useCreateScanRuleSetMutation,
  useUpdateScanRuleSetMutation,
  useDeleteScanRuleSetMutation,
  useValidateScanRulePatternsMutation,
  getScanRuleSetsByDataSource,
  getGlobalScanRuleSets
} from '../api/scanRules';

// Types are imported from scanRules.ts

interface UseScanRuleSetsOptions {
  refreshInterval?: number;
  initialFilters?: ScanRuleSetFilters;
}

/**
 * Advanced hook for managing scan rule sets with comprehensive filtering
 * and validation capabilities.
 * 
 * Features:
 * - Fetches all scan rule sets with filtering options
 * - Provides detailed information for individual scan rule sets
 * - Offers CRUD operations for scan rule sets
 * - Supports validation of scan rule patterns
 * - Integrates with RBAC permissions
 */
export function useScanRuleSets(options: UseScanRuleSetsOptions = {}) {
  const { refreshInterval = 0, initialFilters = {} } = options;
  
  // No need for queryClient as it's handled in the API file
  const { hasPermission } = useRBACPermissions();
  const [filters, setFilters] = useState<ScanRuleSetFilters>(initialFilters);

  // Check permissions
  const canViewScanRuleSets = hasPermission('scan.ruleset.view');
  const canCreateScanRuleSet = hasPermission('scan.ruleset.create');
  const canEditScanRuleSet = hasPermission('scan.ruleset.edit');
  const canDeleteScanRuleSet = hasPermission('scan.ruleset.delete');

  // Fetch all scan rule sets
  const {
    data: scanRuleSets,
    isLoading: isScanRuleSetsLoading,
    isError: isScanRuleSetsError,
    error: scanRuleSetsError,
    refetch: refetchScanRuleSets
  } = useScanRuleSetsQuery(filters, {
    enabled: canViewScanRuleSets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch single scan rule set details
  const fetchScanRuleSetDetails = useCallback((ruleSetId: number) => {
    return useScanRuleSetQuery(ruleSetId, {
      enabled: canViewScanRuleSets && !!ruleSetId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [canViewScanRuleSets]);

  // Create scan rule set mutation
  const createScanRuleSetMutation = useCreateScanRuleSetMutation();

  // Update scan rule set mutation
  const updateScanRuleSetMutation = useUpdateScanRuleSetMutation();

  // Delete scan rule set mutation
  const deleteScanRuleSetMutation = useDeleteScanRuleSetMutation();

  // Validate scan rule patterns mutation
  const validatePatternsMutation = useValidateScanRulePatternsMutation();

  // Fetch scan rule sets by data source
  const fetchRuleSetsByDataSource = useCallback((dataSourceId: number) => {
    return useQuery([
      'scanRuleSetsByDataSource', 
      dataSourceId
    ], 
    () => getScanRuleSetsByDataSource(dataSourceId), 
    {
      enabled: canViewScanRuleSets && !!dataSourceId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [canViewScanRuleSets]);

  // Fetch global scan rule sets
  const fetchGlobalRuleSets = useCallback(() => {
    return useQuery(
      ['globalScanRuleSets'],
      getGlobalScanRuleSets,
      {
        enabled: canViewScanRuleSets,
        staleTime: 5 * 60 * 1000 // 5 minutes
      }
    );
  }, [canViewScanRuleSets]);

  /**
   * Update filters for scan rule sets
   * @param newFilters The new filters to apply
   */
  const updateFilters = useCallback((newFilters: Partial<ScanRuleSetFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Refresh all scan rule set related data
   */
  const refreshAllScanRuleSetData = useCallback(() => {
    refetchScanRuleSets();
  }, [refetchScanRuleSets]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Data
      scanRuleSets,
      
      // Loading states
      isScanRuleSetsLoading,
      isLoading: isScanRuleSetsLoading,
      
      // Error states
      isScanRuleSetsError,
      scanRuleSetsError,
      
      // Filters
      filters,
      updateFilters,
      clearFilters,
      
      // Fetch functions
      fetchScanRuleSetDetails,
      fetchRuleSetsByDataSource,
      fetchGlobalRuleSets,
      refreshAllScanRuleSetData,
      
      // Mutations
      createScanRuleSet: createScanRuleSetMutation.mutateAsync,
      updateScanRuleSet: updateScanRuleSetMutation.mutateAsync,
      deleteScanRuleSet: deleteScanRuleSetMutation.mutateAsync,
      validatePatterns: validatePatternsMutation.mutateAsync,
      
      // Mutation states
      isCreatingScanRuleSet: createScanRuleSetMutation.isPending,
      isUpdatingScanRuleSet: updateScanRuleSetMutation.isPending,
      isDeletingScanRuleSet: deleteScanRuleSetMutation.isPending,
      isValidatingPatterns: validatePatternsMutation.isPending,
      
      // Permissions
      canViewScanRuleSets,
      canCreateScanRuleSet,
      canEditScanRuleSet,
      canDeleteScanRuleSet
    }),
    [
      scanRuleSets,
      isScanRuleSetsLoading,
      isScanRuleSetsError,
      scanRuleSetsError,
      filters,
      updateFilters,
      clearFilters,
      fetchScanRuleSetDetails,
      fetchRuleSetsByDataSource,
      fetchGlobalRuleSets,
      refreshAllScanRuleSetData,
      createScanRuleSetMutation.mutateAsync,
      updateScanRuleSetMutation.mutateAsync,
      deleteScanRuleSetMutation.mutateAsync,
      validatePatternsMutation.mutateAsync,
      createScanRuleSetMutation.isPending,
      updateScanRuleSetMutation.isPending,
      deleteScanRuleSetMutation.isPending,
      validatePatternsMutation.isPending,
      canViewScanRuleSets,
      canCreateScanRuleSet,
      canEditScanRuleSet,
      canDeleteScanRuleSet
    ]
  );
}