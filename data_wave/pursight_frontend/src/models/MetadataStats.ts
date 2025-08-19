/**
 * MetadataStats model representing statistics for metadata management
 */
export interface MetadataStats {
  // General metadata statistics
  totalEntities: number;
  entitiesByType: Record<string, number>; // e.g., { 'table': 120, 'column': 1500, ... }
  entitiesByDataSource: Record<string, number>; // Data source ID to entity count
  
  // Metadata quality statistics
  entitiesWithDescription: number;
  descriptionCoverage: number; // Percentage
  entitiesWithOwner: number;
  ownershipCoverage: number; // Percentage
  entitiesWithTags: number;
  tagCoverage: number; // Percentage
  
  // Classification statistics
  classifiedEntities: number;
  classificationCoverage: number; // Percentage
  classificationsByType: Record<string, number>; // Classification type to count
  
  // Sensitivity statistics
  sensitiveEntities: number;
  sensitivityCoverage: number; // Percentage
  sensitivityByLabel: Record<string, number>; // Sensitivity label to count
  
  // Term statistics
  totalTerms: number;
  termsWithDefinition: number;
  termsWithSteward: number;
  termsWithExamples: number;
  termAssignments: number;
  
  // Glossary statistics
  totalGlossaries: number;
  glossaryTerms: number;
  glossaryCategories: number;
  
  // Lineage statistics
  entitiesWithLineage: number;
  lineageCoverage: number; // Percentage
  averageLineageDepth: number;
  totalLineageRelationships: number;
  
  // Schema statistics
  schemaChanges: {
    last24Hours: number;
    lastWeek: number;
    lastMonth: number;
  };
  
  // Time-based information
  lastUpdated: string;
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Metadata quality score
 */
export interface MetadataQualityScore {
  overallScore: number; // 0-100
  dimensions: {
    completeness: number; // 0-100
    accuracy: number; // 0-100
    consistency: number; // 0-100
    timeliness: number; // 0-100
    coverage: number; // 0-100
  };
  entityTypeScores: Record<string, number>; // Entity type to score
  dataSourceScores: Record<string, number>; // Data source ID to score
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    potentialImprovement: number; // Points
  }>;
}

/**
 * Metadata change statistics
 */
export interface MetadataChangeStats {
  totalChanges: number;
  changesByType: {
    addition: number;
    modification: number;
    deletion: number;
  };
  changesByEntityType: Record<string, number>; // Entity type to change count
  changesByDataSource: Record<string, number>; // Data source ID to change count
  changesByUser: Record<string, number>; // User ID to change count
  
  // Time-based changes
  changesLastHour: number;
  changesLastDay: number;
  changesLastWeek: number;
  changesLastMonth: number;
  
  // Change trend
  changeTrend: Array<{
    period: string; // e.g., '2023-01-01', '2023-W01', '2023-01'
    additions: number;
    modifications: number;
    deletions: number;
  }>;
  
  // Recent changes
  recentChanges: Array<{
    id: string;
    entityId: string;
    entityName: string;
    entityType: string;
    changeType: 'addition' | 'modification' | 'deletion';
    changedBy: string;
    changedAt: string;
    changes?: Record<string, { oldValue: any; newValue: any }>;
  }>;
}

/**
 * Term usage statistics
 */
export interface TermUsageStats {
  termId: string;
  termName: string;
  assignmentCount: number;
  viewCount: number;
  searchCount: number;
  relatedTerms: Array<{
    id: string;
    name: string;
    relationshipType: string;
    assignmentCount: number;
  }>;
  usageByEntityType: Record<string, number>; // Entity type to usage count
  usageByDataSource: Record<string, number>; // Data source ID to usage count
  usageTrend: Array<{
    period: string; // e.g., '2023-01-01', '2023-W01', '2023-01'
    assignments: number;
    views: number;
    searches: number;
  }>;
}

/**
 * Custom metadata attribute statistics
 */
export interface CustomAttributeStats {
  totalAttributes: number;
  attributesByEntityType: Record<string, number>; // Entity type to attribute count
  mostUsedAttributes: Array<{
    name: string;
    entityType: string;
    usageCount: number;
    coveragePercentage: number;
  }>;
  attributeValueDistribution: Record<string, Record<string, number>>; // Attribute name to value distribution
}