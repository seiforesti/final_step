// React Query hooks for Table Insights
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";
import { TableInsightsData } from "../models/TableInsights";

// Fetch insights for a specific table
export const useTableInsightsData = (path: string[] | undefined) =>
  useQuery<TableInsightsData, Error>({
    queryKey: ["tableInsightsData", path],
    queryFn: async () => {
      if (!path || path.length === 0) throw new Error("Invalid path");
      const { data } = await axios.post("/api/catalog/insights", { path });
      return data;
    },
    enabled: !!path && path.length > 0,
  });

// Fetch insights by category
export const useTableInsightsByCategory = (
  path: string[] | undefined,
  category: string
) =>
  useQuery<TableInsightsData, Error>({
    queryKey: ["tableInsightsByCategory", path, category],
    queryFn: async () => {
      if (!path || path.length === 0) throw new Error("Invalid path");
      const { data } = await axios.post("/api/catalog/insights/by-category", {
        path,
        category,
      });
      return data;
    },
    enabled: !!path && path.length > 0 && !!category,
  });

// Fetch usage metrics for a specific time range
export const useTableUsageMetrics = (
  path: string[] | undefined,
  timeRange: "day" | "week" | "month" | "quarter" | "year" = "month"
) =>
  useQuery<TableInsightsData["usageMetrics"], Error>({
    queryKey: ["tableUsageMetrics", path, timeRange],
    queryFn: async () => {
      if (!path || path.length === 0) throw new Error("Invalid path");
      const { data } = await axios.post("/api/catalog/insights/usage", {
        path,
        timeRange,
      });
      return data;
    },
    enabled: !!path && path.length > 0,
  });

// Dismiss an insight
export const useDismissInsight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { path: string[]; insightId: string }) =>
      axios.post("/api/catalog/insights/dismiss", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tableInsightsData", variables.path],
      });
      queryClient.invalidateQueries({
        queryKey: ["tableInsightsByCategory", variables.path],
      });
    },
  });
};

// Implement a recommendation from an insight
export const useImplementRecommendation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      path: string[];
      insightId: string;
      recommendationId: string;
    }) => axios.post("/api/catalog/insights/implement-recommendation", params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tableInsightsData", variables.path],
      });
      queryClient.invalidateQueries({
        queryKey: ["tableInsightsByCategory", variables.path],
      });
    },
  });
};