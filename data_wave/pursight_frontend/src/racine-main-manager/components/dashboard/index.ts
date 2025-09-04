// ============================================================================
// DASHBOARD COMPONENTS - INDEX EXPORTS
// ============================================================================
// Central export file for all dashboard components
// Redirects to intelligent-dashboard components for proper module resolution

export { default as IntelligentDashboardOrchestrator } from '../intelligent-dashboard/IntelligentDashboardOrchestrator';
export { default as PerformanceMonitoringDashboard } from '../intelligent-dashboard/PerformanceMonitoringDashboard';
export { default as CrossGroupKPIDashboard } from '../intelligent-dashboard/CrossGroupKPIDashboard';
export { default as RealTimeMetricsEngine } from '../intelligent-dashboard/RealTimeMetricsEngine';
export { default as CustomDashboardBuilder } from '../intelligent-dashboard/CustomDashboardBuilder';

// Re-export types and utilities
export type { 
  DashboardWidget, 
  DashboardLayout, 
  DashboardConfig,
  KPIMetric,
  SystemHealth
} from '../../types/racine-core.types';
