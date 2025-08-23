// ============================================================================
// ACTIVITY TRACKER COMPONENTS - INDEX EXPORTS
// ============================================================================
// Central export file for all activity tracker components
// Enables proper module resolution for app pages

export { default as ActivityTrackingHub } from './ActivityTrackingHub';
export { default as AuditTrailManager } from './AuditTrailManager';
export { default as RealTimeActivityStream } from './RealTimeActivityStream';
export { default as CrossGroupActivityAnalyzer } from './CrossGroupActivityAnalyzer';
export { default as ComplianceActivityMonitor } from './ComplianceActivityMonitor';
export { default as ActivityVisualizationSuite } from './ActivityVisualizationSuite';
export { default as ActivitySearchEngine } from './ActivitySearchEngine';
export { default as ActivityReportingEngine } from './ActivityReportingEngine';

// Re-export types and utilities
export type { 
  ActivityRecord, 
  ActivityFilter, 
  ActivityMetrics,
  AuditTrailEntry,
  ComplianceActivityItem
} from '../../types/racine-core.types';

