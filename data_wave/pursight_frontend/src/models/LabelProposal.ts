// LabelProposal.ts
export interface LabelProposal {
  id: number;
  label_id: number;
  object_type: string;
  object_id: string;
  proposed_by: string;
  justification?: string;
  status: string;
  created_at: string;
  updated_at: string;
  expiry_date?: string;
  review_cycle_days?: number;
}
