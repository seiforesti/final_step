// LineageEdge.ts
export interface LineageEdge {
  id: number;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string; // e.g. 'data_flow', 'reference', etc.
}
