import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface CatalogNode {
  label: string;
  type: "workspace" | "schema" | "server" | "database" | "table" | "folder";
  icon?: React.ReactNode;
  children?: CatalogNode[];
}

// Fetch the catalog tree from the backend
export async function fetchCatalogTree(): Promise<CatalogNode[]> {
  const res = await axios.get("/api/catalog/tree");
  return res.data;
}

export function useCatalogTree() {
  return useQuery<CatalogNode[]>({
    queryKey: ["catalogTree"],
    queryFn: fetchCatalogTree,
  });
}

// Fetch sample data for a table
export async function fetchSampleData(
  path: string[]
): Promise<{ columns: string[]; rows: any[][] }> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/sample-data", { path });
  return res.data;
}

export function useSampleData(path: string[] | undefined) {
  return useQuery<{ columns: string[]; rows: any[][] }>({
    queryKey: ["sampleData", path],
    queryFn: () => fetchSampleData(path!),
    enabled: !!path && path.length > 0,
  });
}

// Fetch table details (metadata)
export async function fetchTableDetails(path: string[]): Promise<any> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/details", { path });
  return res.data;
}

export function useTableDetails(path: string[] | undefined) {
  return useQuery<any>({
    queryKey: ["tableDetails", path],
    queryFn: () => fetchTableDetails(path!),
    enabled: !!path && path.length > 0,
  });
}

// Fetch table permissions (RBAC)
export async function fetchTablePermissions(path: string[]): Promise<any[]> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/permissions", { path });
  return res.data;
}

export function useTablePermissions(path: string[] | undefined) {
  return useQuery<any[]>({
    queryKey: ["tablePermissions", path],
    queryFn: () => fetchTablePermissions(path!),
    enabled: !!path && path.length > 0,
  });
}

// Fetch table history (audit trail)
import { TableHistoryData } from "../models/TableHistory";

export async function fetchTableHistory(path: string[]): Promise<TableHistoryData> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/history", { path });
  return res.data;
}

export function useTableHistory(path: string[] | undefined) {
  return useQuery<TableHistoryData>({
    queryKey: ["tableHistory", path],
    queryFn: () => fetchTableHistory(path!),
    enabled: !!path && path.length > 0,
  });
}

// Fetch table lineage (upstream/downstream dependencies)
export async function fetchTableLineage(
  path: string[]
): Promise<{ upstream: any[]; downstream: any[] }> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/lineage", { path });
  return res.data;
}

export function useTableLineage(path: string[] | undefined) {
  return useQuery<{ upstream: any[]; downstream: any[] }>({
    queryKey: ["tableLineage", path],
    queryFn: () => fetchTableLineage(path!),
    enabled: !!path && path.length > 0,
  });
}

// Fetch table insights (ML feedback, analytics, etc.)
export async function fetchTableInsights(path: string[]): Promise<any> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/insights", { path });
  return res.data;
}

export function useTableInsights(path: string[] | undefined) {
  return useQuery<any>({
    queryKey: ["tableInsights", path],
    queryFn: () => fetchTableInsights(path!),
    enabled: !!path && path.length > 0,
  });
}

// Fetch table quality metrics
export async function fetchTableQuality(path: string[]): Promise<any> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/quality", { path });
  return res.data;
}

export function useTableQuality(path: string[] | undefined) {
  return useQuery<any>({
    queryKey: ["tableQuality", path],
    queryFn: () => fetchTableQuality(path!),
    enabled: !!path && path.length > 0,
  });
}

// Fetch sensitivity labels for a table/column
export async function fetchSensitivityLabels(path: string[]): Promise<any[]> {
  // path: [workspace, schema, ...table]
  const res = await axios.post("/api/catalog/sensitivity-labels", { path });
  return res.data;
}

export function useSensitivityLabels(path: string[] | undefined) {
  return useQuery<any[]>({
    queryKey: ["sensitivityLabels", path],
    queryFn: () => fetchSensitivityLabels(path!),
    enabled: !!path && path.length > 0,
  });
}

// Update sensitivity label for a column
export async function updateSensitivityLabel(
  path: string[],
  column: string,
  label: string
) {
  return axios.post("/api/catalog/update-sensitivity-label", {
    path,
    column,
    label,
  });
}
