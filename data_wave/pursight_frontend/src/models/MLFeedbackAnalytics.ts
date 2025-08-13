// ML Feedback Analytics model
export interface MLFeedbackAnalytics {
  totalFeedback: number;
  uniqueUsers: number;
  uniqueLabels: number;
  correctPredictions: number;
  incorrectPredictions: number;
  accuracy: number; // 0-1 float
}
