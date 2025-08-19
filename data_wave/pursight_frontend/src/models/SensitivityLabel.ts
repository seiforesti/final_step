/**
 * Sensitivity Label model representing a data sensitivity classification
 */
export interface SensitivityLabel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string; // Hex color code
  icon?: string;
  order: number; // For sorting/display order
  isBuiltIn: boolean;
  isDefault: boolean;
  parentId?: string; // For hierarchical labels
  createdAt: string;
  updatedAt: string;
  isConditional: boolean;
  conditionExpression?: string;
  appliesTo: string;
  metadata?: Record<string, any>;
}

/**
 * Label Rule model representing an automated rule for assigning sensitivity labels
 */
export interface LabelRule {
  id: string;
  name: string;
  description: string;
  labelId: string;
  condition: string; // JSON or expression string representing the condition
  scope: {
    entityTypes: string[]; // Types of entities this rule applies to
    dataSourceIds?: string[]; // Optional specific data sources
  };
  priority: number; // For rule ordering/precedence
  isActive: boolean;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  lastRunStatus?: 'success' | 'partial' | 'failed';
  metadata?: Record<string, any>;
}

/**
 * Label Propagation Rule model for defining how labels propagate through data lineage
 */
export interface LabelPropagationRule {
  id: string;
  name: string;
  description: string;
  sourceEntityTypes: string[];
  targetEntityTypes: string[];
  relationshipTypes: string[];
  propagationType: 'copy' | 'inherit' | 'suggest';
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Label Statistics model for analytics on sensitivity label usage
 */
export interface LabelStatistics {
  totalLabels: number;
  totalAssignments: number;
  byLabel: {
    labelId: string;
    labelName: string;
    count: number;
    percentage: number;
  }[];
  byEntityType: {
    entityType: string;
    count: number;
    percentage: number;
  }[];
  byDataSource: {
    dataSourceId: string;
    dataSourceName: string;
    count: number;
    percentage: number;
  }[];
  byAssignmentMethod: {
    method: 'manual' | 'ml' | 'rule' | 'propagation';
    count: number;
    percentage: number;
  }[];
  byTimeRange: {
    timeRange: string;
    count: number;
  }[];
}
