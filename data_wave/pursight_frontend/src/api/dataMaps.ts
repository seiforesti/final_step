import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from './axiosConfig';
import { DataMap, DataMapNode, DataMapEdge } from '../models/DataMap';

/**
 * API functions for data maps
 */

// Types
export interface DataMapCreateParams {
  name: string;
  description?: string;
  nodes?: DataMapNode[];
  edges?: DataMapEdge[];
}

export interface DataMapUpdateParams {
  name?: string;
  description?: string;
  nodes?: DataMapNode[];
  edges?: DataMapEdge[];
  version?: number;
}

export interface DataMapFilters {
  search?: string;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// API functions

/**
 * Get all data maps with optional filtering
 */
export const getDataMaps = async (filters: DataMapFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.createdBy) params.append('createdBy', filters.createdBy);
  if (filters.dateRange) {
    params.append('startDate', filters.dateRange.start);
    params.append('endDate', filters.dateRange.end);
  }
  
  const { data } = await axios.get(`/datamap/maps?${params.toString()}`);
  return data;
};

/**
 * Get a specific data map by ID
 */
export const getDataMapById = async (dataMapId: string) => {
  const { data } = await axios.get(`/datamap/maps/${dataMapId}`);
  return data as DataMap;
};

/**
 * Create a new data map
 */
export const createDataMap = async (params: DataMapCreateParams) => {
  const { data } = await axios.post('/datamap/maps', params);
  return data as DataMap;
};

/**
 * Update an existing data map
 */
export const updateDataMap = async (id: string, params: DataMapUpdateParams) => {
  const { data } = await axios.put(`/datamap/maps/${id}`, params);
  return data as DataMap;
};

/**
 * Delete a data map
 */
export const deleteDataMap = async (id: string) => {
  await axios.delete(`/datamap/maps/${id}`);
  return id;
};

/**
 * Generate a data map from a data source
 */
export const generateDataMapFromSource = async (dataSourceId: number, options: {
  includeColumns?: boolean;
  includeRelationships?: boolean;
  depth?: number;
} = {}) => {
  const { data } = await axios.post(`/datamap/generate/${dataSourceId}`, options);
  return data as DataMap;
};

/**
 * Duplicate an existing data map
 */
export const duplicateDataMap = async (id: string, newName?: string) => {
  const { data } = await axios.post(`/datamap/maps/${id}/duplicate`, { newName });
  return data as DataMap;
};

/**
 * Export a data map to JSON format
 */
export const exportDataMap = async (id: string) => {
  const { data } = await axios.get(`/datamap/maps/${id}/export`, {
    responseType: 'blob'
  });
  return data;
};

// React Query hooks

/**
 * Hook for fetching data maps with React Query
 */
export const useDataMapsQuery = (filters: DataMapFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['dataMaps', filters],
    queryFn: () => getDataMaps(filters),
    ...options
  });
};

/**
 * Hook for fetching a single data map with React Query
 */
export const useDataMapQuery = (dataMapId: string, options = {}) => {
  return useQuery({
    queryKey: ['dataMap', dataMapId],
    queryFn: () => getDataMapById(dataMapId),
    enabled: !!dataMapId,
    ...options
  });
};

/**
 * Hook for creating a data map with React Query
 */
export const useCreateDataMapMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDataMap,
    onSuccess: () => {
      queryClient.invalidateQueries(['dataMaps']);
    }
  });
};

/**
 * Hook for updating a data map with React Query
 */
export const useUpdateDataMapMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...params }: { id: string } & DataMapUpdateParams) => 
      updateDataMap(id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['dataMaps']);
      queryClient.invalidateQueries(['dataMap', variables.id]);
    }
  });
};

/**
 * Hook for deleting a data map with React Query
 */
export const useDeleteDataMapMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDataMap,
    onSuccess: (id) => {
      queryClient.invalidateQueries(['dataMaps']);
      queryClient.invalidateQueries(['dataMap', id]);
    }
  });
};

/**
 * Hook for generating a data map from a data source with React Query
 */
export const useGenerateDataMapMutation = () => {
  return useMutation({
    mutationFn: ({ dataSourceId, options }: { 
      dataSourceId: number, 
      options?: {
        includeColumns?: boolean;
        includeRelationships?: boolean;
        depth?: number;
      }
    }) => generateDataMapFromSource(dataSourceId, options)
  });
};

/**
 * Hook for duplicating a data map with React Query
 */
export const useDuplicateDataMapMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: string, newName?: string }) => 
      duplicateDataMap(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries(['dataMaps']);
    }
  });
};

/**
 * Hook for exporting a data map with React Query
 */
export const useExportDataMapMutation = () => {
  return useMutation({
    mutationFn: (id: string) => exportDataMap(id)
  });
};