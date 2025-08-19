import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EntityFilters {
  search?: string;
  entity_types?: string[];
  data_source_ids?: number[];
  sensitivity_label_ids?: number[];
  classifications?: string[];
  page?: number;
  page_size?: number;
}

export function useDataCatalog() {
  const queryClient = useQueryClient();

  // Get all entities with optional filtering
  const getEntities = async (filters: EntityFilters = {}) => {
    const response = await axios.post('/api/catalog/entities', filters);
    return response.data;
  };

  // Get a single entity by type and ID
  const getEntity = async (entityType: string, entityId: number) => {
    const response = await axios.get(`/api/catalog/entities/${entityType}/${entityId}`);
    return response.data;
  };

  // Get entity lineage (upstream and downstream)
  const getEntityLineage = async (entityType: string, entityId: number) => {
    const response = await axios.get(`/api/catalog/entities/${entityType}/${entityId}/lineage`);
    return response.data;
  };

  // Get entity issues/quality metrics
  const getEntityIssues = async (entityType: string, entityId: number) => {
    const response = await axios.get(`/api/catalog/entities/${entityType}/${entityId}/issues`);
    return response.data;
  };

  // Get entity columns (for tables)
  const getEntityColumns = async (entityId: number) => {
    const response = await axios.get(`/api/catalog/entities/table/${entityId}/columns`);
    return response.data;
  };

  // Get entity sample data (for tables)
  const getEntitySampleData = async (entityId: number) => {
    const response = await axios.get(`/api/catalog/entities/table/${entityId}/sample-data`);
    return response.data;
  };

  // Create a new entity
  const createEntity = async (entityData: any) => {
    const response = await axios.post('/api/catalog/entities', entityData);
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    return response.data;
  };

  // Update an existing entity
  const updateEntity = async ({ entityType, entityId, data }: { entityType: string; entityId: number; data: any }) => {
    const response = await axios.put(`/api/catalog/entities/${entityType}/${entityId}`, data);
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    queryClient.invalidateQueries({ queryKey: ['entity', entityType, entityId] });
    return response.data;
  };

  // Delete an entity
  const deleteEntity = async ({ entityType, entityId }: { entityType: string; entityId: number }) => {
    const response = await axios.delete(`/api/catalog/entities/${entityType}/${entityId}`);
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    return response.data;
  };

  // Get available parent entities for a given entity type
  const getEntityParents = async (entityType: string) => {
    const response = await axios.get(`/api/catalog/entities/${entityType}/parents`);
    return response.data;
  };

  // Assign sensitivity label to an entity
  const assignSensitivityLabel = async ({ entityType, entityId, labelId }: { entityType: string; entityId: number; labelId: number }) => {
    const response = await axios.post(`/api/catalog/entities/${entityType}/${entityId}/sensitivity`, { label_id: labelId });
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    queryClient.invalidateQueries({ queryKey: ['entity', entityType, entityId] });
    return response.data;
  };

  // Get entity classifications
  const getEntityClassifications = async (entityType: string, entityId: number) => {
    const response = await axios.get(`/api/catalog/entities/${entityType}/${entityId}/classifications`);
    return response.data;
  };

  // Update entity classifications
  const updateEntityClassifications = async ({ entityType, entityId, classifications }: { entityType: string; entityId: number; classifications: string[] }) => {
    const response = await axios.post(`/api/catalog/entities/${entityType}/${entityId}/classifications`, { classifications });
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    queryClient.invalidateQueries({ queryKey: ['entity', entityType, entityId] });
    return response.data;
  };

  return {
    getEntities,
    getEntity,
    getEntityLineage,
    getEntityIssues,
    getEntityColumns,
    getEntitySampleData,
    createEntity,
    updateEntity,
    deleteEntity,
    getEntityParents,
    assignSensitivityLabel,
    getEntityClassifications,
    updateEntityClassifications
  };
}