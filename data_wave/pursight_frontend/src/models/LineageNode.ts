// LineageNode.ts - Comprehensive data lineage model interfaces

/**
 * Represents a node in the data lineage graph
 */
export interface LineageNode {
  id: string;
  label: string;
  type: string; // e.g., 'source', 'process', 'dataset', 'model', 'output'
  status: string; // e.g., 'available', 'pending', 'running', 'completed', 'scheduled', 'failed'
  qualifiedName?: string; // Fully qualified name of the entity
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  owner?: string;
  classification?: string[];
  sensitivityLabels?: string[];
  attributes?: Record<string, any>; // Additional attributes specific to the node type
  metadata?: Record<string, any>; // Additional metadata
  icon?: string; // Icon to display for this node type
  displayProperties?: string[]; // Properties to display in the UI
  url?: string; // URL to the entity in the system
  version?: string; // Version of the entity
  isExpanded?: boolean; // UI state - whether the node is expanded in the graph
  isHighlighted?: boolean; // UI state - whether the node is highlighted
}

/**
 * Represents an edge (relationship) in the data lineage graph
 */
export interface LineageEdge {
  id: string;
  from: string; // Source node ID
  to: string; // Target node ID
  label?: string; // Relationship type
  type?: string; // e.g., 'read', 'write', 'process', 'derive'
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  properties?: Record<string, any>; // Additional properties specific to the edge
  metadata?: Record<string, any>; // Additional metadata
  isHighlighted?: boolean; // UI state - whether the edge is highlighted
  weight?: number; // Weight of the relationship (for graph layout)
  style?: 'solid' | 'dashed' | 'dotted'; // Visual style of the edge
  color?: string; // Color of the edge
}

/**
 * Complete lineage data structure including nodes and edges
 */
export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata?: {
    totalNodes: number;
    totalEdges: number;
    lastUpdated?: string;
    generatedBy?: string;
    depth?: number;
    direction?: 'upstream' | 'downstream' | 'both';
    rootEntityId?: string;
    truncated?: boolean; // Indicates if the graph was truncated due to size limits
  };
}

/**
 * Represents the impact analysis of a data entity
 */
export interface LineageImpact {
  entityId: string;
  entityType: string;
  entityName: string;
  impactedEntities: {
    direct: Array<{
      id: string;
      name: string;
      type: string;
      impact: 'high' | 'medium' | 'low';
    }>;
    indirect: Array<{
      id: string;
      name: string;
      type: string;
      impact: 'high' | 'medium' | 'low';
      path: string[];
    }>;
  };
  impactSummary: {
    totalImpactedEntities: number;
    criticalEntities: number;
    highImpactEntities: number;
    mediumImpactEntities: number;
    lowImpactEntities: number;
  };
}

/**
 * Represents a change in the lineage graph over time
 */
export interface LineageChange {
  id: string;
  timestamp: string;
  user: string;
  changeType: 'add' | 'update' | 'delete';
  entityType: 'node' | 'edge';
  entityId: string;
  previousState?: Partial<LineageNode | LineageEdge>;
  newState?: Partial<LineageNode | LineageEdge>;
  description?: string;
}

/**
 * Represents a search result in the lineage graph
 */
export interface LineageSearchResult {
  query: string;
  timestamp: string;
  results: {
    nodes: Array<LineageNode & { matchScore: number; matchFields: string[] }>;
    edges: Array<LineageEdge & { matchScore: number; matchFields: string[] }>;
  };
  metadata: {
    totalResults: number;
    executionTimeMs: number;
    filters?: Record<string, any>;
  };
}

/**
 * Legacy interface for backward compatibility
 */
export interface LineageData extends LineageGraph {}