// api/sensitivityLabels.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { SensitivityLabel } from "../models/SensitivityLabel";

const API_URL = "/sensitivity-labels";

export interface LabelFilterParams {
  search?: string;
  scopes?: string[];
  colors?: string[];
  conditionalOnly?: boolean;
  dateRange?: [Date | null, Date | null];
}

export function useLabels(filters?: LabelFilterParams) {
  return useQuery<SensitivityLabel[]>({
    queryKey: ["sensitivityLabels", filters],
    queryFn: async () => {
      const params: any = {};
      if (filters) {
        if (filters.search) params.search = filters.search;
        if (filters.scopes && filters.scopes.length > 0)
          params.scopes = filters.scopes.join(",");
        if (filters.colors && filters.colors.length > 0)
          params.colors = filters.colors.join(",");
        if (filters.conditionalOnly) params.conditional_only = true;
        if (filters.dateRange) {
          if (filters.dateRange[0])
            params.date_from = filters.dateRange[0].toISOString();
          if (filters.dateRange[1])
            params.date_to = filters.dateRange[1].toISOString();
        }
      }
      return (await axios.get(API_URL, { params })).data;
    },
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (label: Partial<SensitivityLabel>) =>
      (await axios.post(API_URL, label)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sensitivityLabels"] }),
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (label: SensitivityLabel) =>
      (await axios.put(`${API_URL}/${label.id}`, label)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sensitivityLabels"] }),
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await axios.delete(`${API_URL}/${id}`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sensitivityLabels"] }),
  });
}

export interface SensitivityLabelAnalytics {
  total_labels: number;
  conditional_labels: number;
  non_conditional_labels: number;
  unique_scopes: number;
  scopes: string[];
  created_from?: string;
  created_to?: string;
}

export function useLabelAnalytics(filters?: LabelFilterParams) {
  return useQuery<SensitivityLabelAnalytics>({
    queryKey: ["sensitivityLabelAnalytics", filters],
    queryFn: async () => {
      const params: any = {};
      if (filters) {
        if (filters.dateRange) {
          if (filters.dateRange[0])
            params.date_from = filters.dateRange[0].toISOString();
          if (filters.dateRange[1])
            params.date_to = filters.dateRange[1].toISOString();
        }
      }
      return (await axios.get(`${API_URL}/analytics`, { params })).data;
    },
  });
}

// --- API functions for useSensitivityLabels hook ---

// 1. Fetch all sensitivity labels
export async function fetchSensitivityLabels() {
  const res = await axios.get("/sensitivity-labels");
  return res.data;
}

// 2. Fetch labels assigned to an entity (table/column/etc)
export async function fetchEntityLabels(entityType: string, entityId: string) {
  const res = await axios.get("/sensitivity-labels/proposals/", {
    params: {
      object_type: entityType,
      object_id: entityId,
      status: "APPROVED",
    },
  });
  return res.data;
}

// 3. Assign a sensitivity label to an entity (creates a proposal)
export async function assignSensitivityLabel({
  entityType,
  entityId,
  labelId,
  justification,
  expiresAt,
}: {
  entityType: string;
  entityId: string;
  labelId: string;
  justification: string;
  expiresAt?: string;
}) {
  const payload = {
    object_type: entityType,
    object_id: entityId,
    label_id: labelId,
    justification,
    expiry_date: expiresAt,
    status: "APPROVED",
  };
  const res = await axios.post("/sensitivity-labels/proposals/", payload);
  return res.data;
}

// 4. Remove a sensitivity label from an entity (set proposal status to REJECTED)
export async function removeSensitivityLabel({
  assignmentId,
  justification,
}: {
  assignmentId: string;
  justification: string;
}) {
  // assignmentId is proposal_id
  const payload = {
    status: "REJECTED",
    justification,
  };
  const res = await axios.patch(
    `/sensitivity-labels/proposals/${assignmentId}/status`,
    payload
  );
  return res.data;
}

// 5. Fetch label assignment history for an entity
export async function fetchLabelHistory(entityType: string, entityId: string) {
  const res = await axios.get("/sensitivity-labels/audits", {
    params: {
      entity_type: entityType,
      entity_id: entityId,
    },
  });
  return res.data;
}
