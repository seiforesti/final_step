import { useQuery } from "@tanstack/react-query";
import axios from "./axiosConfig";

export interface AuditEntry {
  user: string;
  action: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface MLSuggestion {
  suggestedLabel: string;
  confidence: number;
  reviewer: string;
  reviewerAvatarUrl?: string;
}

export function useLabelAuditTrail(labelId: number) {
  return useQuery<AuditEntry[]>({
    queryKey: ["labelAuditTrail", labelId],
    queryFn: async () =>
      (await axios.get(`/api/sensitivity-labels/${labelId}/audit`)).data,
    enabled: !!labelId,
  });
}

export function useLabelMLSuggestions(labelId: number) {
  return useQuery<MLSuggestion[]>({
    queryKey: ["labelMLSuggestions", labelId],
    queryFn: async () =>
      (await axios.get(`/api/sensitivity-labels/${labelId}/ml-suggestions`))
        .data,
    enabled: !!labelId,
  });
}
