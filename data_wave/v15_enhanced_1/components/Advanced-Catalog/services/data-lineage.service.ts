// ============================================================================
// DATA LINEAGE SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Comprehensive data lineage tracking, analysis, and visualization service
// Maps to backend advanced_lineage_service.py
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// Re-export from advanced-lineage.service for compatibility
export { 
  AdvancedLineageService as DataLineageService,
  advancedLineageService as dataLineageService 
} from './advanced-lineage.service';

// Additional lineage-specific interfaces for backward compatibility
export interface LineageTraceRequest {
  assetId: string;
  direction: 'upstream' | 'downstream' | 'both';
  depth?: number;
  includeColumns?: boolean;
  includeTransformations?: boolean;
}

export interface LineageTraceResponse {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata: LineageMetadata;
}

export interface LineageNode {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, any>;
  position?: { x: number; y: number; };
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  metadata: Record<string, any>;
}

export interface LineageMetadata {
  totalNodes: number;
  totalEdges: number;
  maxDepth: number;
  tracedAt: string;
  confidence: number;
}

// Additional compatibility exports
export const lineageService = {
  // Re-export main service methods
  ...advancedLineageService,
  
  // Additional helper methods for backward compatibility
  traceLineage: async (request: LineageTraceRequest): Promise<LineageTraceResponse> => {
    return advancedLineageService.traceLineage(request.assetId, request.depth || 3);
  },
  
  getLineageGraph: async (assetId: string) => {
    return advancedLineageService.getLineageVisualization(assetId);
  },
  
  getImpactAnalysis: async (assetId: string) => {
    return advancedLineageService.analyzeImpact(assetId);
  }
};

export default lineageService;