// React Query hooks for Bulk Proposals Import/Export/Actions
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axiosConfig";

export const useBulkImportProposals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return axios.post("/bulk/proposals/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
  });
};

export const useBulkExportProposals = () => {
  return async (format: "csv" | "excel" | "json" = "csv") => {
    const res = await axios.get(`/bulk/proposals/export?format=${format}`, {
      responseType: format === "csv" ? "blob" : "json",
    });
    return res.data;
  };
};

export const useBulkProposalActions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      action,
      proposalIds,
    }: {
      action: string;
      proposalIds: number[];
    }) =>
      axios.post("/bulk/proposals/actions", {
        action,
        proposal_ids: proposalIds,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
  });
};
