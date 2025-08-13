import axios from "./axiosConfig";
import { useQuery } from "@tanstack/react-query";
import { LabelReview } from "../models/LabelReview";

// Fetch all reviews for a proposal (or all, if backend supports)
export async function fetchReviews(
  proposalId?: number
): Promise<LabelReview[]> {
  const url = proposalId ? `/api/reviews/${proposalId}` : `/api/reviews/`;
  const res = await axios.get(url);
  return res.data;
}

/**
 * Hook to fetch review history for a specific proposal
 * @param proposalId The ID of the proposal to fetch reviews for
 */
export const useProposalReviews = (proposalId: number | undefined) =>
  useQuery<LabelReview[], Error>({
    queryKey: ["proposalReviews", proposalId],
    queryFn: async () => {
      if (!proposalId) return [];
      try {
        const { data } = await axios.get(`/reviews/${proposalId}`);
        return data;
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // No reviews found for this proposal, return empty array
          return [];
        }
        throw error;
      }
    },
    enabled: !!proposalId,
  });

// Create a new review
export async function createReview(
  review: Omit<LabelReview, "id" | "review_date">
): Promise<LabelReview> {
  const res = await axios.post(`/api/reviews/`, review);
  return res.data;
}

// Complete a review (custom endpoint if needed)
export async function completeReview(
  reviewId: number,
  note?: string
): Promise<LabelReview> {
  const res = await axios.patch(`/api/reviews/${reviewId}/complete`, { note });
  return res.data;
}

// Escalate a review (custom endpoint if needed)
export async function escalateReview(
  reviewId: number,
  note?: string
): Promise<LabelReview> {
  const res = await axios.patch(`/api/reviews/${reviewId}/escalate`, { note });
  return res.data;
}

// Bulk review (approve/reject)
export async function bulkReview(
  reviewIds: number[],
  action: "approve" | "reject",
  note?: string
): Promise<LabelReview[]> {
  const res = await axios.post(`/api/reviews/bulk`, {
    review_ids: reviewIds,
    action,
    note,
  });
  return res.data;
}

// Assign a review to a new reviewer
export async function assignReview(
  reviewId: number,
  assignee: string
): Promise<LabelReview> {
  const res = await axios.patch(`/api/reviews/${reviewId}/assign`, {
    assignee,
  });
  return res.data;
}

// Add a comment to a review
export async function commentReview(
  reviewId: number,
  comment: string
): Promise<LabelReview> {
  const res = await axios.patch(`/api/reviews/${reviewId}/comment`, {
    comment,
  });
  return res.data;
}
