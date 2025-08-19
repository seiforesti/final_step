// LabelReview.ts
export interface LabelReview {
  id: number;
  proposal_id: number;
  reviewer: string;
  review_status: string; // e.g. 'proposed', 'approved', 'rejected', 'expired'
  review_note?: string;
  review_date: string;
  completed_date?: string;
}
