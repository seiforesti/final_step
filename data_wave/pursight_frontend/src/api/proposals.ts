// React Query hooks for Proposals
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { LabelProposal } from "../models/LabelProposal";

export const useProposals = () =>
  useQuery<LabelProposal[], Error>({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data } = await axios.get("/sensitivity-labels/proposals/");
      return data;
    },
  });

export const useCreateProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposal: Partial<LabelProposal>) =>
      axios.post("/sensitivity-labels/proposals/", proposal),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
  });
};

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      axios.patch(`/sensitivity-labels/proposals/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
  });
};

export const useDeleteProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      axios.post("/bulk/proposals/actions", {
        action: "delete",
        proposal_ids: [id],
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
  });
};

export interface ProposalAnalytics {
  total_proposals: number;
  approved: number;
  rejected: number;
  expired: number;
  pending: number;
  unique_objects: number;
  created_from?: string;
  created_to?: string;
}

export interface ProposalAnalyticsFilters {
  status?: string;
  object_type?: string;
  object_id?: string;
  date_from?: string;
  date_to?: string;
}

export function useProposalAnalytics(filters?: ProposalAnalyticsFilters) {
  // No /proposals/analytics endpoint exists in backend, so return dummy data or handle as needed
  return useQuery<ProposalAnalytics>({
    queryKey: ["proposalAnalytics", filters],
    queryFn: async () => {
      // Return dummy analytics or throw an error if you want to show a message
      return {
        total_proposals: 0,
        approved: 0,
        rejected: 0,
        expired: 0,
        pending: 0,
        unique_objects: 0,
      };
    },
  });
}
