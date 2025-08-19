import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./reviews";
import { LabelReview } from "../types/reviews";

export function useReviews(proposalId?: number) {
  return useQuery<LabelReview[]>({
    queryKey: ["reviews", proposalId],
    queryFn: () => api.fetchReviews(proposalId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useCompleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, note }: { reviewId: number; note?: string }) =>
      api.completeReview(reviewId, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useEscalateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, note }: { reviewId: number; note?: string }) =>
      api.escalateReview(reviewId, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useBulkReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewIds,
      action,
      note,
    }: {
      reviewIds: number[];
      action: "approve" | "reject";
      note?: string;
    }) => api.bulkReview(reviewIds, action, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useAssignReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      assignee,
    }: {
      reviewId: number;
      assignee: string;
    }) => api.assignReview(reviewId, assignee),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useCommentReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      comment,
    }: {
      reviewId: number;
      comment: string;
    }) => api.commentReview(reviewId, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
