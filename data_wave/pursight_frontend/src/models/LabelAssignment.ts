/**
 * LabelAssignment model representing the assignment of a sensitivity label to an entity
 */
import { SensitivityLabel } from './SensitivityLabel';

export interface LabelAssignment {
  id: string;
  entityType: string; // 'column', 'table', 'schema', etc.
  entityId: string;
  entityName: string;
  labelId: string;
  label: SensitivityLabel;
  assignedBy: string; // User ID
  assignedByName: string; // User display name
  justification: string;
  expiresAt?: string;
  isAutoAssigned: boolean; // True if assigned by ML or rule
  mlSuggestionId?: string; // If assigned based on ML suggestion
  ruleId?: string; // If assigned based on rule
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}