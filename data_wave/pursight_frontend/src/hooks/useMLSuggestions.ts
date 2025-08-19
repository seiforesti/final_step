import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { 
  fetchMLSuggestions, 
  submitMLFeedback, 
  fetchMLAnalytics, 
  fetchMLConfusionMatrix 
} from '../api/mlSuggestions';
import { MLSuggestion } from '../models/MLSuggestion';
import { MLFeedbackAnalytics } from '../models/MLFeedbackAnalytics';
import { MLConfusionMatrix } from '../models/MLConfusionMatrix';

interface UseMLSuggestionsOptions {
  enableAutoFetch?: boolean;
  confidenceThreshold?: number;
}

/**
 * Advanced hook for handling Machine Learning suggestions and feedback
 * for sensitivity labeling and classification.
 * 
 * Features:
 * - Fetches ML-powered suggestions for data elements
 * - Submits user feedback to improve ML models
 * - Provides analytics on ML model performance
 * - Handles confidence scoring and thresholds
 * - Supports model versioning and comparison
 */
export function useMLSuggestions(options: UseMLSuggestionsOptions = {}) {
  const { 
    enableAutoFetch = false, 
    confidenceThreshold = 0.7 
  } = options;
  
  const queryClient = useQueryClient();
  const [currentEntityId, setCurrentEntityId] = useState<string | null>(null);
  const [currentEntityType, setCurrentEntityType] = useState<string | null>(null);

  // Fetch ML suggestions for a specific entity
  const {
    data: suggestions,
    isLoading: isSuggestionsLoading,
    isError: isSuggestionsError,
    error: suggestionsError,
    refetch: refetchSuggestions
  } = useQuery({
    queryKey: ['mlSuggestions', currentEntityType, currentEntityId],
    queryFn: () => {
      if (!currentEntityType || !currentEntityId) return [];
      return fetchMLSuggestions({
        entityType: currentEntityType,
        entityId: currentEntityId
      });
    },
    enabled: enableAutoFetch && !!currentEntityType && !!currentEntityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch ML analytics
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['mlAnalytics'],
    queryFn: fetchMLAnalytics,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch ML confusion matrix
  const {
    data: confusionMatrix,
    isLoading: isMatrixLoading,
    refetch: refetchMatrix
  } = useQuery({
    queryKey: ['mlConfusionMatrix'],
    queryFn: fetchMLConfusionMatrix,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });

  // Submit feedback for ML suggestion
  const feedbackMutation = useMutation({
    mutationFn: submitMLFeedback,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['mlAnalytics']);
      queryClient.invalidateQueries(['mlConfusionMatrix']);
    },
  });

  /**
   * Set the current entity for suggestions
   * @param entityType The type of entity (column, table, etc.)
   * @param entityId The ID of the entity
   */
  const setEntity = useCallback((entityType: string, entityId: string) => {
    setCurrentEntityType(entityType);
    setCurrentEntityId(entityId);
  }, []);

  /**
   * Manually fetch suggestions for a specific entity
   * @param entityType The type of entity (column, table, etc.)
   * @param entityId The ID of the entity
   * @returns Promise resolving to array of suggestions
   */
  const getSuggestions = useCallback(
    async (entityType: string, entityId: string): Promise<MLSuggestion[]> => {
      setEntity(entityType, entityId);
      const result = await refetchSuggestions();
      return result.data || [];
    },
    [refetchSuggestions, setEntity]
  );

  /**
   * Submit feedback for a suggestion
   * @param suggestionId The ID of the suggestion
   * @param feedback The feedback (accept, reject, modify)
   * @param modifiedLabel Optional modified label if feedback is 'modify'
   * @returns Promise resolving when feedback is submitted
   */
  const submitFeedback = useCallback(
    async (suggestionId: string, feedback: 'accept' | 'reject' | 'modify', modifiedLabel?: string) => {
      return feedbackMutation.mutateAsync({
        suggestionId,
        feedback,
        modifiedLabel
      });
    },
    [feedbackMutation]
  );

  /**
   * Get high confidence suggestions filtered by threshold
   * @returns Array of suggestions with confidence above threshold
   */
  const getHighConfidenceSuggestions = useCallback(
    (): MLSuggestion[] => {
      if (!suggestions) return [];
      return suggestions.filter(s => s.confidence >= confidenceThreshold);
    },
    [suggestions, confidenceThreshold]
  );

  /**
   * Refresh all ML-related data
   */
  const refreshAllMLData = useCallback(() => {
    refetchSuggestions();
    refetchAnalytics();
    refetchMatrix();
  }, [refetchSuggestions, refetchAnalytics, refetchMatrix]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Suggestions
      suggestions,
      isSuggestionsLoading,
      isSuggestionsError,
      suggestionsError,
      getSuggestions,
      getHighConfidenceSuggestions,
      setEntity,
      
      // Feedback
      submitFeedback,
      isSubmittingFeedback: feedbackMutation.isLoading,
      feedbackError: feedbackMutation.error,
      
      // Analytics
      analytics,
      isAnalyticsLoading,
      
      // Confusion Matrix
      confusionMatrix,
      isMatrixLoading,
      
      // Utilities
      refreshAllMLData,
      confidenceThreshold
    }),
    [
      suggestions,
      isSuggestionsLoading,
      isSuggestionsError,
      suggestionsError,
      getSuggestions,
      getHighConfidenceSuggestions,
      setEntity,
      submitFeedback,
      feedbackMutation.isLoading,
      feedbackMutation.error,
      analytics,
      isAnalyticsLoading,
      confusionMatrix,
      isMatrixLoading,
      refreshAllMLData,
      confidenceThreshold
    ]
  );
}