import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { ScanSummaryStats, ScanOperation, ScanSchedule, ScanHistory } from '../models/ScanSummaryStats';
import { useRBACPermissions } from './useRBACPermissions';
import {
  ScanFilters,
  ScanCreateParams,
  ScanScheduleCreateParams,
  ScanScheduleUpdateParams,
  useScansQuery,
  useScanSummaryStatsQuery,
  useScanQuery,
  useScanHistoryQuery,
  useScanSchedulesQuery,
  useStartScanMutation,
  useCancelScanMutation,
  useCreateScanMutation,
  useUpdateScanMutation,
  useDeleteScanMutation,
  useCreateScanScheduleMutation,
  useUpdateScanScheduleMutation,
  useDeleteScanScheduleMutation
} from '../api/scans';

// Types are imported from scans.ts

interface UseScansOptions {
  refreshInterval?: number;
  initialFilters?: ScanFilters;
}

/**
 * Advanced hook for managing scans with comprehensive filtering,
 * scheduling, and monitoring capabilities.
 * 
 * Features:
 * - Fetches all scans with filtering options
 * - Provides detailed information for individual scans
 * - Offers operations to start, cancel, and monitor scans
 * - Supports scheduling of recurring scans
 * - Provides scan history and statistics
 * - Integrates with RBAC permissions
 */
export function useScans(options: UseScansOptions = {}) {
  const { refreshInterval = 0, initialFilters = {} } = options;
  
  // No need for queryClient as it's handled in the API file
  const { hasPermission } = useRBACPermissions();
  const [filters, setFilters] = useState<ScanFilters>(initialFilters);

  // Check permissions
  const canViewScans = hasPermission('scan.view');
  const canRunScan = hasPermission('scan.run');
  const canCancelScan = hasPermission('scan.cancel');
  const canScheduleScan = hasPermission('scan.schedule');

  // Fetch all scans
  const {
    data: scans,
    isLoading: isScansLoading,
    isError: isScansError,
    error: scansError,
    refetch: refetchScans
  } = useScansQuery(filters, {
    enabled: canViewScans,
    staleTime: 1 * 60 * 1000, // 1 minute (shorter due to active nature of scans)
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch scan summary statistics
  const {
    data: scanStats,
    isLoading: isScanStatsLoading,
    refetch: refetchScanStats
  } = useScanSummaryStatsQuery(filters, {
    enabled: canViewScans,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined
  });

  // Fetch single scan details
  const fetchScanDetails = useCallback((scanId: number) => {
    return useScanQuery(scanId, {
      enabled: canViewScans && !!scanId,
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: 10000 // 10 seconds for active scans
    });
  }, [canViewScans]);

  // Fetch scan history for a data source
  const fetchScanHistory = useCallback((dataSourceId: number, timeRange: string = '30d') => {
    return useScanHistoryQuery(dataSourceId, timeRange, {
      enabled: canViewScans && !!dataSourceId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [canViewScans]);

  // Fetch scan schedules
  const {
    data: scanSchedules,
    isLoading: isScanSchedulesLoading,
    refetch: refetchScanSchedules
  } = useScanSchedulesQuery(undefined, {
    enabled: canViewScans,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch scan schedules for a data source
  const fetchScanSchedulesByDataSource = useCallback((dataSourceId: number) => {
    return useScanSchedulesQuery(dataSourceId, {
      enabled: canViewScans && !!dataSourceId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [canViewScans]);

  // Start a new scan mutation
  const startScanMutation = useStartScanMutation();

  // Cancel a running scan mutation
  const cancelScanMutation = useCancelScanMutation();

  // Create scan schedule mutation
  const createScanScheduleMutation = useCreateScanScheduleMutation();

  // Update scan schedule mutation
  const updateScanScheduleMutation = useUpdateScanScheduleMutation();

  // Delete scan schedule mutation
  const deleteScanScheduleMutation = useDeleteScanScheduleMutation();

  /**
   * Update filters for scans
   * @param newFilters The new filters to apply
   */
  const updateFilters = useCallback((newFilters: Partial<ScanFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Refresh all scan related data
   */
  const refreshAllScanData = useCallback(() => {
    refetchScans();
    refetchScanStats();
    refetchScanSchedules();
  }, [refetchScans, refetchScanStats, refetchScanSchedules]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Data
      scans,
      scanStats,
      scanSchedules,
      
      // Loading states
      isScansLoading,
      isScanStatsLoading,
      isScanSchedulesLoading,
      isLoading: isScansLoading || isScanStatsLoading || isScanSchedulesLoading,
      
      // Error states
      isScansError,
      scansError,
      
      // Filters
      filters,
      updateFilters,
      clearFilters,
      
      // Fetch functions
      fetchScanDetails,
      fetchScanHistory,
      fetchScanSchedulesByDataSource,
      refreshAllScanData,
      
      // Mutations
      startScan: startScanMutation.mutateAsync,
      cancelScan: cancelScanMutation.mutateAsync,
      createScanSchedule: createScanScheduleMutation.mutateAsync,
      updateScanSchedule: updateScanScheduleMutation.mutateAsync,
      deleteScanSchedule: deleteScanScheduleMutation.mutateAsync,
      
      // Mutation states
      isStartingScan: startScanMutation.isPending,
      isCancellingScan: cancelScanMutation.isPending,
      isCreatingScanSchedule: createScanScheduleMutation.isPending,
      isUpdatingScanSchedule: updateScanScheduleMutation.isPending,
      isDeletingScanSchedule: deleteScanScheduleMutation.isPending,
      
      // Permissions
      canViewScans,
      canRunScan,
      canCancelScan,
      canScheduleScan
    }),
    [
      scans,
      scanStats,
      scanSchedules,
      isScansLoading,
      isScanStatsLoading,
      isScanSchedulesLoading,
      isScansError,
      scansError,
      filters,
      updateFilters,
      clearFilters,
      fetchScanDetails,
      fetchScanHistory,
      fetchScanSchedulesByDataSource,
      refreshAllScanData,
      startScanMutation.mutateAsync,
      cancelScanMutation.mutateAsync,
      createScanScheduleMutation.mutateAsync,
      updateScanScheduleMutation.mutateAsync,
      deleteScanScheduleMutation.mutateAsync,
      startScanMutation.isPending,
      cancelScanMutation.isPending,
      createScanScheduleMutation.isPending,
      updateScanScheduleMutation.isPending,
      deleteScanScheduleMutation.isPending,
      canViewScans,
      canRunScan,
      canCancelScan,
      canScheduleScan
    ]
  );
}