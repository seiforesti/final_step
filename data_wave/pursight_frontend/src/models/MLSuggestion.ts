/**
 * ML Suggestion model representing a machine learning-generated suggestion
 * for sensitivity labeling or classification
 */
export interface MLSuggestion {
  id: string;
  entityType: string; // 'column', 'table', 'schema', etc.
  entityId: string;
  entityName: string;
  suggestedLabel: string;
  suggestedLabelId: string;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  modelId: string;
  modelVersion: string;
  features: MLFeature[];
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  createdAt: string;
  updatedAt: string;
  reviewer?: string;
  reviewerAvatarUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * ML Feature model representing a feature used in the ML model
 * for generating suggestions
 */
export interface MLFeature {
  name: string;
  value: any;
  importance: number; // Feature importance score
  description?: string;
}

/**
 * ML Feedback model representing user feedback on ML suggestions
 */
export interface MLFeedback {
  id: string;
  suggestionId: string;
  userId: string;
  username: string;
  feedback: 'accept' | 'reject' | 'modify';
  modifiedLabel?: string;
  modifiedLabelId?: string;
  comment?: string;
  createdAt: string;
}

/**
 * ML Feedback Analytics model representing aggregated feedback statistics
 */
export interface MLFeedbackAnalytics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  modifiedSuggestions: number;
  acceptanceRate: number; // 0.0 to 1.0
  averageConfidence: number; // 0.0 to 1.0
  byModel: {
    modelId: string;
    modelName: string;
    totalSuggestions: number;
    acceptanceRate: number;
    averageConfidence: number;
  }[];
  byEntityType: {
    entityType: string;
    totalSuggestions: number;
    acceptanceRate: number;
    averageConfidence: number;
  }[];
  byTimeRange: {
    timeRange: string;
    totalSuggestions: number;
    acceptanceRate: number;
  }[];
}

/**
 * ML Confusion Matrix model representing the performance of ML models
 */
export interface MLConfusionMatrix {
  modelId: string;
  modelName: string;
  modelVersion: string;
  labels: string[];
  matrix: number[][];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  createdAt: string;
}

/**
 * ML Model Information model representing metadata about an ML model
 */
export interface MLModelInfo {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering';
  description: string;
  features: string[];
  target: string;
  metrics: Record<string, number>;
  trainingDataset: string;
  trainingDate: string;
  status: 'training' | 'active' | 'inactive' | 'failed';
  createdAt: string;
  updatedAt: string;
}

/**
 * ML Training Request model for initiating model training
 */
export interface MLTrainingRequest {
  modelId?: string; // If updating an existing model
  name: string;
  description?: string;
  datasetId?: string;
  parameters?: Record<string, any>;
  features?: string[];
  target: string;
  testSplit?: number; // 0.0 to 1.0
  validationSplit?: number; // 0.0 to 1.0
}
