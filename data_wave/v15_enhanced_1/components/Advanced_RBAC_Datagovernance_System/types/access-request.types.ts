// Access Request Types - Maps to backend auth_models.py AccessRequest model

export interface AccessRequest {
  id: number;
  user_id: number;
  resource_type: string;
  resource_id: string;
  requested_role: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  review_note?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  
  // Populated relationships
  user?: User;
  reviewer?: User;
}

export interface AccessRequestCreate {
  user_id: number;
  resource_type: string;
  resource_id: string;
  requested_role: string;
  justification: string;
}

export interface AccessRequestReview {
  request_id: number;
  approve: boolean;
  review_note?: string;
}

export interface AccessRequestFilters {
  user_id?: number;
  status?: 'pending' | 'approved' | 'rejected';
  resource_type?: string;
  resource_id?: string;
  requested_role?: string;
  created_after?: string;
  created_before?: string;
}

export interface AccessRequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  requests_by_resource_type: Record<string, number>;
  requests_by_role: Record<string, number>;
  avg_review_time: number;
}

export interface AccessReviewTrigger {
  assignments_for_review: {
    id: number;
    user_id: number;
    role_id: number;
    resource_type: string;
    resource_id: number;
    assigned_at: string;
  }[];
  count: number;
}

// Import related types
import type { User } from './user.types';