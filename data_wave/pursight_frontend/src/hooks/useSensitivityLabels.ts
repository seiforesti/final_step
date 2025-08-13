import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { 
  fetchSensitivityLabels, 
  fetchEntityLabels, 
  assignSensitivityLabel, 
  removeSensitivityLabel,
  fetchLabelHistory
} from '../api/sensitivityLabels';
import { SensitivityLabel } from '../models/SensitivityLabel';
import { LabelAssignment } from '../models/LabelAssignment';
import { LabelHistory } from '../models/LabelHistory';
import { useRBACPermissions } from './useRBACPermissions';

interface UseSensitivityLabelsOptions {
  entityType?: string;
  entityId?: string;
  includeHistory?: boolean;
}

/**
 * Advanced hook for managing sensitivity labels and their assignments
 * to data elements with full history tracking and justification.
 * 
 * Features:
 * - Fetches available sensitivity labels
 * - Manages label assignments to data entities
 * - Tracks label history and changes
 * - Supports justification and expiration
 * - Integrates with RBAC permissions
 */
export function useSensitivityLabels(options: UseSensitivityLabelsOptions = {}) {
  const { 
    entityType, 
    entityId, 
    includeHistory = false 
  } = options;
  
  const queryClient = useQueryClient();
  const { hasPermission } = useRBACPermissions();
  const [currentEntityType, setCurrentEntityType] = useState<string | undefined>(entityType);
  const [currentEntityId, setCurrentEntityId] = useState<string | undefined>(entityId);

  // Check permissions
  const canViewLabels = hasPermission('sensitivity.view');
  const canAssignLabels = hasPermission('sensitivity.assign');
  const canManageLabels = hasPermission('sensitivity.manage');

  // Fetch all available sensitivity labels
  const {
    data: labels,
    isLoading: isLabelsLoading,
    isError: isLabelsError,
    error: labelsError,
    refetch: refetchLabels
  } = useQuery({
    queryKey: ['sensitivityLabels'],
    queryFn: fetchSensitivityLabels,
    enabled: canViewLabels,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch labels assigned to the current entity
  const {
    data: entityLabels,
    isLoading: isEntityLabelsLoading,
    isError: isEntityLabelsError,
    error: entityLabelsError,
    refetch: refetchEntityLabels
  } = useQuery({
    queryKey: ['entityLabels', currentEntityType, currentEntityId],
    queryFn: () => {
      if (!currentEntityType || !currentEntityId) return [];
      return fetchEntityLabels(currentEntityType, currentEntityId);
    },
    enabled: canViewLabels && !!currentEntityType && !!currentEntityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch label history for the current entity
  const {
    data: labelHistory,
    isLoading: isHistoryLoading,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['labelHistory', currentEntityType, currentEntityId],
    queryFn: () => {
      if (!currentEntityType || !currentEntityId) return [];
      return fetchLabelHistory(currentEntityType, currentEntityId);
    },
    enabled: canViewLabels && includeHistory && !!currentEntityType && !!currentEntityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Assign sensitivity label mutation
  const assignLabelMutation = useMutation({
    mutationFn: assignSensitivityLabel,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['entityLabels', currentEntityType, currentEntityId]);
      queryClient.invalidateQueries(['labelHistory', currentEntityType, currentEntityId]);
    },
  });

  // Remove sensitivity label mutation
  const removeLabelMutation = useMutation({
    mutationFn: removeSensitivityLabel,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['entityLabels', currentEntityType, currentEntityId]);
      queryClient.invalidateQueries(['labelHistory', currentEntityType, currentEntityId]);
    },
  });

  /**
   * Set the current entity for label operations
   * @param entityType The type of entity (column, table, etc.)
   * @param entityId The ID of the entity
   */
  const setEntity = useCallback((entityType: string, entityId: string) => {
    setCurrentEntityType(entityType);
    setCurrentEntityId(entityId);
  }, []);

  /**
   * Assign a sensitivity label to the current entity
   * @param labelId The ID of the sensitivity label
   * @param justification The justification for assigning this label
   * @param expiresAt Optional expiration date for the label
   * @returns Promise resolving when label is assigned
   */
  const assignLabel = useCallback(
    async (labelId: string, justification: string, expiresAt?: Date) => {
      if (!currentEntityType || !currentEntityId) {
        throw new Error('Entity type and ID must be set before assigning a label');
      }
      
      if (!canAssignLabels) {
        throw new Error('You do not have permission to assign sensitivity labels');
      }

      return assignLabelMutation.mutateAsync({
        entityType: currentEntityType,
        entityId: currentEntityId,
        labelId,
        justification,
        expiresAt: expiresAt ? expiresAt.toISOString() : undefined
      });
    },
    [currentEntityType, currentEntityId, canAssignLabels, assignLabelMutation]
  );

  /**
   * Remove a sensitivity label from the current entity
   * @param assignmentId The ID of the label assignment
   * @param justification The justification for removing this label
   * @returns Promise resolving when label is removed
   */
  const removeLabel = useCallback(
    async (assignmentId: string, justification: string) => {
      if (!canAssignLabels) {
        throw new Error('You do not have permission to remove sensitivity labels');
      }

      return removeLabelMutation.mutateAsync({
        assignmentId,
        justification
      });
    },
    [canAssignLabels, removeLabelMutation]
  );

  /**
   * Get a sensitivity label by ID
   * @param labelId The ID of the sensitivity label
   * @returns The sensitivity label or undefined if not found
   */
  const getLabelById = useCallback(
    (labelId: string): SensitivityLabel | undefined => {
      if (!labels) return undefined;
      return labels.find(label => label.id === labelId);
    },
    [labels]
  );

  /**
   * Refresh all sensitivity label data
   */
  const refreshAllLabelData = useCallback(() => {
    refetchLabels();
    if (currentEntityType && currentEntityId) {
      refetchEntityLabels();
      if (includeHistory) {
        refetchHistory();
      }
    }
  }, [refetchLabels, refetchEntityLabels, refetchHistory, currentEntityType, currentEntityId, includeHistory]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Available labels
      labels,
      isLabelsLoading,
      isLabelsError,
      labelsError,
      
      // Entity labels
      entityLabels,
      isEntityLabelsLoading,
      isEntityLabelsError,
      entityLabelsError,
      
      // Label history
      labelHistory,
      isHistoryLoading,
      
      // Operations
      assignLabel,
      removeLabel,
      isAssigningLabel: assignLabelMutation.isLoading,
      isRemovingLabel: removeLabelMutation.isLoading,
      assignLabelError: assignLabelMutation.error,
      removeLabelError: removeLabelMutation.error,
      
      // Utilities
      setEntity,
      getLabelById,
      refreshAllLabelData,
      
      // Permissions
      canViewLabels,
      canAssignLabels,
      canManageLabels
    }),
    [
      labels,
      isLabelsLoading,
      isLabelsError,
      labelsError,
      entityLabels,
      isEntityLabelsLoading,
      isEntityLabelsError,
      entityLabelsError,
      labelHistory,
      isHistoryLoading,
      assignLabel,
      removeLabel,
      assignLabelMutation.isLoading,
      removeLabelMutation.isLoading,
      assignLabelMutation.error,
      removeLabelMutation.error,
      setEntity,
      getLabelById,
      refreshAllLabelData,
      canViewLabels,
      canAssignLabels,
      canManageLabels
    ]
  );
}