import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface AuditEvent {
  id: number;
  timestamp: string;
  performed_by: string;
  action: string;
  note?: string;
  proposal_id?: number;
  proposal?: {
    object_type: string;
    object_id: string;
  };
}

export function useAuditTrail(params: {
  skip?: number;
  limit?: number;
  user?: string;
  entity_type?: string;
  entity_id?: number; // changed from string to number
  action?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ["auditTrail", params],
    queryFn: async () => {
      const { data } = await axios.get("/sensitivity-labels/audits", {
        params,
      });
      return data;
    },
  });
}

export function useAuditDetail(audit_id: number) {
  return useQuery({
    queryKey: ["auditDetail", audit_id],
    queryFn: async () => {
      const { data } = await axios.get(
        `/sensitivity-labels/audits/${audit_id}`
      );
      return data;
    },
    enabled: !!audit_id,
  });
}

export async function exportAuditTrail(
  params: any,
  format: "csv" | "json" = "csv"
) {
  const { data } = await axios.get("/api/audits/export", {
    params: { ...params, format },
    responseType: format === "csv" ? "blob" : "json",
  });
  return data;
}
