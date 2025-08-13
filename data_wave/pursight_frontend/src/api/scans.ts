import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from './axiosConfig';
import { ScanSummaryStats, ScanOperation, ScanSchedule, ScanHistory } from '../models/ScanSummaryStats';

/**
 * API functions for scans
 */

// Types
export interface ScanCreateParams {
  data_source_id: number;
  rule_set_id: number;
  description?: string;
  scan_settings?: Record<string, any>;
}

export interface ScanScheduleCreateParams {
  data_source_id: number;
  rule_set_id: number;
  cron_expression: string;
  description?: string;
  scan_settings?: Record<string, any>;
  is_active: boolean;
}

export interface ScanScheduleUpdateParams {
  cron_expression?: string;
  description?: string;
  scan_settings?: Record<string, any>;
  is_active?: boolean;
}

export interface ScanFilters {
  data_source_id?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  search?: string;
}

// API functions

/**
 * Get all scans with optional filtering
 */
export const getScans = async (filters: ScanFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.data_source_id) params.append('data_source_id', filters.data_source_id.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await axios.get(`/scan/scans?${params.toString()}`);
  return data;
};

/**
 * Get scan summary statistics
 */
export const getScanSummaryStats = async (filters: ScanFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.data_source_id) params.append('data_source_id', filters.data_source_id.toString());
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  
  const { data } = await axios.get(`/dashboard/scan-summary-stats?${params.toString()}`);
  return data as ScanSummaryStats;
};

/**
 * Get a specific scan by ID
 */
export const getScanById = async (scanId: number) => {
  const { data } = await axios.get(`/scan/scans/${scanId}`);
  return data as ScanOperation;
};

/**
 * Get scan history for a data source
 */
export const getScanHistory = async (dataSourceId: number, timeRange: string = '30d') => {
  const { data } = await axios.get(`/scan/scans/history?data_source_id=${dataSourceId}&time_range=${timeRange}`);
  return data as ScanHistory;
};

/**
 * Get all scan schedules
 */
export const getScanSchedules = async () => {
  const { data } = await axios.get('/scan/schedules');
  return data as ScanSchedule[];
};

/**
 * Get scan schedules for a data source
 */
export const getScanSchedulesByDataSource = async (dataSourceId: number) => {
  const { data } = await axios.get(`/scan/schedules?data_source_id=${dataSourceId}`);
  return data as ScanSchedule[];
};

/**
 * Start a new scan
 */
export const startScan = async (params: ScanCreateParams) => {
  const { data } = await axios.post('/scan/scans', params);
  return data;
};

/**
 * Cancel a running scan
 */
export const cancelScan = async (scanId: number) => {
  await axios.post(`/scan/scans/${scanId}/cancel`);
  return scanId;
};

/**
 * Create a scan schedule
 */
export const createScanSchedule = async (params: ScanScheduleCreateParams) => {
  const { data } = await axios.post('/scan/schedules', params);
  return data;
};

/**
 * Update a scan schedule
 */
export const updateScanSchedule = async (id: number, params: ScanScheduleUpdateParams) => {
  const { data } = await axios.put(`/scan/schedules/${id}`, params);
  return data;
};

/**
 * Delete a scan schedule
 */
export const deleteScanSchedule = async (id: number) => {
  await axios.delete(`/scan/schedules/${id}`);
  return id;
};

// React Query hooks

/**
 * Hook for fetching scans with React Query
 */
export const useScansQuery = (filters: ScanFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['scans', filters],
    queryFn: () => getScans(filters),
    ...options
  });
};

/**
 * Hook for fetching scan summary statistics with React Query
 */
export const useScanSummaryStatsQuery = (filters: ScanFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['scanStats', filters],
    queryFn: () => getScanSummaryStats(filters),
    ...options
  });
};

/**
 * Hook for fetching a single scan with React Query
 */
export const useScanQuery = (scanId: number, options = {}) => {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => getScanById(scanId),
    enabled: !!scanId,
    ...options
  });
};

/**
 * Hook for fetching scan history with React Query
 */
export const useScanHistoryQuery = (dataSourceId: number, timeRange: string = '30d', options = {}) => {
  return useQuery({
    queryKey: ['scanHistory', dataSourceId, timeRange],
    queryFn: () => getScanHistory(dataSourceId, timeRange),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for fetching scan schedules with React Query
 */
export const useScanSchedulesQuery = (dataSourceId?: number, options = {}) => {
  return useQuery({
    queryKey: ['scanSchedules', dataSourceId],
    queryFn: () => dataSourceId ? getScanSchedulesByDataSource(dataSourceId) : getScanSchedules(),
    ...options
  });
};

/**
 * Hook for fetching scan schedules by data source with React Query
 */
export const useScanSchedulesByDataSourceQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['scanSchedulesByDataSource', dataSourceId],
    queryFn: () => getScanSchedulesByDataSource(dataSourceId),
    enabled: !!dataSourceId,
    ...options
  });
};

/**
 * Hook for starting a scan with React Query
 */
export const useStartScanMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: startScan,
    onSuccess: () => {
      queryClient.invalidateQueries(['scans']);
      queryClient.invalidateQueries(['scanStats']);
    }
  });
};

/**
 * Hook for cancelling a scan with React Query
 */
export const useCancelScanMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelScan,
    onSuccess: (scanId) => {
      queryClient.invalidateQueries(['scans']);
      queryClient.invalidateQueries(['scan', scanId]);
      queryClient.invalidateQueries(['scanStats']);
    }
  });
};

/**
 * Hook for creating a scan schedule with React Query
 */
export const useCreateScanScheduleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createScanSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries(['scanSchedules']);
    }
  });
};

/**
 * Hook for updating a scan schedule with React Query
 */
export const useUpdateScanScheduleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & ScanScheduleUpdateParams) => 
      updateScanSchedule(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries(['scanSchedules']);
      queryClient.invalidateQueries(['scanSchedulesByDataSource']);
    }
  });
};

/**
 * Hook for deleting a scan schedule with React Query
 */
export const useDeleteScanScheduleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteScanSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries(['scanSchedules']);
      queryClient.invalidateQueries(['scanSchedulesByDataSource']);
    }
  });
};