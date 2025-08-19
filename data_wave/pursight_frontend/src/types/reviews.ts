export type LabelReview = {
  id: number;
  proposal_id: number;
  reviewer: string;
  review_status: string;
  review_note?: string;
  review_date: string;
  completed_date?: string; // <-- wire completed_date from backend
  entity_type?: string;
  entity_id?: string;
  proposal_summary?: string;
};
