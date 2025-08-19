import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { LineageGraph, LineageNode } from '../models/LineageNode';

// API prefix for all lineage endpoints
const LINEAGE_PREFIX = '/lineage';

// Interface for lineage graph query parameters
interface LineageGraphParams {
  nodeId: string;
  depth?: number;
  direction?: 'upstream' | 'downstream' | 'both';
  includeFilters?: string[];
  excludeFilters?: string[];
}

// Interface for lineage relationship parameters
interface LineageRelationshipParams {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
}

// Interface for updating lineage relationship parameters
interface UpdateLineageRelationshipParams {
  relationshipId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
}

// Interface for removing lineage relationship parameters
interface RemoveLineageRelationshipParams {
  relationshipId: string;
}

/**
 * Fetch lineage graph for a specific node
 * @param params Query parameters for filtering
 */
export const fetchLineageGraph = async (params: LineageGraphParams): Promise<LineageGraph> => {
  try {
    const { data } = await axios.get(`${LINEAGE_PREFIX}/graph`, { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch lineage graph:', error);
    // Return default empty data structure
    return {
      nodes: [],
      edges: []
    };
  }
};

/**
 * Fetch detailed information for a specific node
 * @param nodeId The ID of the node
 */
export const fetchLineageNode = async (nodeId: string): Promise<LineageNode> => {
  try {
    const { data } = await axios.get(`${LINEAGE_PREFIX}/node/${nodeId}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch lineage node ${nodeId}:`, error);
    throw error;
  }
};

/**
 * Add a lineage relationship between two nodes
 * @param params Parameters for the relationship
 */
export const addLineageRelationship = async (params: LineageRelationshipParams): Promise<void> => {
  try {
    await axios.post(`${LINEAGE_PREFIX}/relationship`, params);
  } catch (error) {
    console.error('Failed to add lineage relationship:', error);
    throw error;
  }
};

/**
 * Update a lineage relationship
 * @param params Parameters for updating the relationship
 */
export const updateLineageRelationship = async (params: UpdateLineageRelationshipParams): Promise<void> => {
  try {
    await axios.put(`${LINEAGE_PREFIX}/relationship/${params.relationshipId}`, params);
  } catch (error) {
    console.error(`Failed to update lineage relationship ${params.relationshipId}:`, error);
    throw error;
  }
};

/**
 * Remove a lineage relationship
 * @param params Parameters for removing the relationship
 */
export const removeLineageRelationship = async (params: RemoveLineageRelationshipParams): Promise<void> => {
  try {
    await axios.delete(`${LINEAGE_PREFIX}/relationship/${params.relationshipId}`);
  } catch (error) {
    console.error(`Failed to remove lineage relationship ${params.relationshipId}:`, error);
    throw error;
  }
};

// Legacy API functions

export function useLineage(
  objectType: string,
  objectId: string,
  direction: "upstream" | "downstream" | "both" = "both"
) {
  return useQuery({
    queryKey: ["lineage", objectType, objectId, direction],
    queryFn: async () => {
      const res = await axios.get(
        `/sensitivity-labels/lineage/${objectType}/${objectId}?direction=${direction}`
      );
      return res.data;
    },
  });
}

export function useImpact(objectType: string, objectId: string) {
  return useQuery({
    queryKey: ["impact", objectType, objectId],
    queryFn: async () => {
      const res = await axios.get(
        `/sensitivity-labels/impact/${objectType}/${objectId}`
      );
      return res.data;
    },
  });
}

// Added: Fetch table lineage using path (array of strings or string)
export function useTableLineage(path?: string | string[]) {
  // Convert path to string if it's an array
  const tableId = Array.isArray(path) ? path.join("/") : path || "";
  return useQuery({
    queryKey: ["tableLineage", tableId],
    queryFn: async () => {
      if (!tableId) return null;
      const res = await axios.get(
        `/sensitivity-labels/lineage/table/${tableId}`
      );
      return res.data;
    },
    enabled: !!tableId,
  });
}
