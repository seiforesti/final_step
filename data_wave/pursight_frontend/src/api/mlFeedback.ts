// React Query hooks for ML Feedback
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { MLFeedback } from "../models/MLFeedback";
import { MLFeedbackAnalytics } from "../models/MLFeedbackAnalytics";
import { MLConfusionMatrix } from "../models/MLConfusionMatrix";

export const useMLFeedback = () =>
  useQuery<MLFeedback[], Error>({
    queryKey: ["mlFeedback"],
    queryFn: async () => {
      const { data } = await axios.get(`/ml-feedback/`);
      return data;
    },
  });

export const useSubmitMLFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feedback: Partial<MLFeedback>) =>
      axios.post("/ml-feedback/", feedback),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["mlFeedback"] }),
  });
};

export interface MLFeedbackAnalyticsFilters {
  userId?: string;
  labelId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useMLFeedbackAnalytics = (
  filters: MLFeedbackAnalyticsFilters = {}
) =>
  useQuery<MLFeedbackAnalytics, Error>({
    queryKey: ["mlFeedbackAnalytics", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.userId) params.append("user_id", filters.userId);
      if (filters.labelId) params.append("label_id", filters.labelId);
      if (filters.dateFrom) params.append("date_from", filters.dateFrom);
      if (filters.dateTo) params.append("date_to", filters.dateTo);
      const { data } = await axios.get(
        `/ml-feedback/analytics?${params.toString()}`
      );
      return data;
    },
  });

export const useMLConfusionMatrix = (
  filters: {
    labelId?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
) =>
  useQuery<MLConfusionMatrix, Error>({
    queryKey: ["mlConfusionMatrix", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.labelId) params.append("label_id", filters.labelId);
      if (filters.dateFrom) params.append("date_from", filters.dateFrom);
      if (filters.dateTo) params.append("date_to", filters.dateTo);
      const { data } = await axios.get(
        `/ml-feedback/confusion-matrix?${params.toString()}`
      );
      return data;
    },
  });
