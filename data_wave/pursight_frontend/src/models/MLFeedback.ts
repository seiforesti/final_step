// ML Feedback model for predictions and feedback
export interface MLFeedback {
  id: string;
  labelId: string;
  userId: string;
  prediction: string;
  feedback: string;
  createdAt: string;
  updatedAt?: string;
}
