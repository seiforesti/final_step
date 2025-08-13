// React Query hooks for ML Model Management
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";

export interface MLModelVersion {
  id: number;
  version: string;
  trained_at: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  notes?: string;
  is_active?: boolean;
}

export const useMLModels = () =>
  useQuery<MLModelVersion[], Error>({
    queryKey: ["mlModels"],
    queryFn: async () => (await axios.get("/ml-model-versions")).data,
  });

export const useSetActiveMLVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (version: string) =>
      axios.post("/ml-set-active-version", { version }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mlModels"] }),
  });
};

export const useMLTrain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axios.post("/ml-train"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mlModels"] }),
  });
};

export const useMLRetrain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axios.post("/ml-retrain"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mlModels"] }),
  });
};
