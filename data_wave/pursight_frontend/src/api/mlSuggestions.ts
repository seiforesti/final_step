// React Query hooks for ML Suggestions
import { useQuery } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { MLSuggestion } from '../models/MLSuggestion';
import { MLFeedbackAnalytics } from '../models/MLFeedbackAnalytics';
import { MLConfusionMatrix } from '../models/MLConfusionMatrix';

// API prefix for all ML suggestion endpoints
const ML_PREFIX = '/ml';

// Legacy interface for backward compatibility
export interface MLSuggestionLegacy {
  id: number;
  label_id: number;
  suggested_label: string;
  confidence: number;
  reviewer?: string;
  reviewer_avatar_url?: string;
  created_at: string;
}

// Interface for ML suggestion query parameters
interface MLSuggestionParams {
  entityType: string;
  entityId: string;
}

// Interface for ML feedback parameters
interface MLFeedbackParams {
  suggestionId: string;
  feedback: 'accept' | 'reject' | 'modify';
  modifiedLabel?: string;
}

/**
 * Fetch ML suggestions for a specific entity
 * @param params Query parameters for the entity
 */
export const fetchMLSuggestions = async (params: MLSuggestionParams): Promise<MLSuggestion[]> => {
  try {
    const { data } = await axios.get(`${ML_PREFIX}/suggestions`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch ML suggestions:', error);
    return [];
  }
};

/**
 * Submit feedback for an ML suggestion
 * @param params Feedback parameters
 */
export const submitMLFeedback = async (params: MLFeedbackParams): Promise<void> => {
  try {
    await axios.post(`${ML_PREFIX}/feedback`, params);
  } catch (error) {
    console.error('Failed to submit ML feedback:', error);
    throw error;
  }
};

/**
 * Fetch ML analytics data
 */
export const fetchMLAnalytics = async (): Promise<MLFeedbackAnalytics> => {
  try {
    const { data } = await axios.get(`${ML_PREFIX}/analytics`);
    return data;
  } catch (error) {
    console.error('Failed to fetch ML analytics:', error);
    // Return default empty data structure
    return {
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      rejectedSuggestions: 0,
      modifiedSuggestions: 0,
      averageConfidence: 0,
      feedbackByUser: [],
      feedbackOverTime: [],
      modelVersion: '0.0.0'
    };
  }
};

/**
 * Fetch ML confusion matrix
 */
export const fetchMLConfusionMatrix = async (): Promise<MLConfusionMatrix> => {
  try {
    const { data } = await axios.get(`${ML_PREFIX}/confusion-matrix`);
    return data;
  } catch (error) {
    console.error('Failed to fetch ML confusion matrix:', error);
    // Return default empty data structure
    return {
      labels: [],
      matrix: [],
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0
    };
  }
};

// Legacy API function for backward compatibility
export const useMLSuggestions = (path: string[] | undefined) =>
  useQuery<MLSuggestionLegacy[], Error>({
    queryKey: ["mlSuggestions", path],
    queryFn: async () => {
      if (!path || path.length === 0) return [];
      // Use the correct backend endpoint: POST to /sensitivity-labels/ml-suggest-labels-path
      const { data } = await axios.post(
        "/sensitivity-labels/ml-suggest-labels-path",
        { path }
      );
      return data;
    },
    enabled: !!path && path.length > 0,
  });
