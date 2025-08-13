/**
 * LabelHistory model representing the history of label assignments and changes
 */

export interface LabelHistory {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: 'assign' | 'remove' | 'update' | 'expire';
  labelId: string;
  labelName: string;
  previousLabelId?: string;
  previousLabelName?: string;
  performedBy: string; // User ID
  performedByName: string; // User display name
  justification: string;
  timestamp: string;
  metadata?: Record<string, any>;
}