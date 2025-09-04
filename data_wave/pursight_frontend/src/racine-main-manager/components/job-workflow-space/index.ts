// ============================================================================
// JOB WORKFLOW SPACE COMPONENTS - INDEX EXPORTS
// ============================================================================
// Central export file for all job workflow space components
// Enables proper module resolution for app pages

export { default as JobWorkflowBuilder } from './JobWorkflowBuilder';
export { default as JobSchedulingEngine } from './JobSchedulingEngine';
export { default as RealTimeJobMonitor } from './RealTimeJobMonitor';
export { default as WorkflowTemplateLibrary } from './WorkflowTemplateLibrary';
export { default as VisualScriptingEngine } from './VisualScriptingEngine';
export { default as WorkflowAnalytics } from './WorkflowAnalytics';
export { default as DependencyManager } from './DependencyManager';
export { default as CrossGroupOrchestrator } from './CrossGroupOrchestrator';
export { default as AIWorkflowOptimizer } from './AIWorkflowOptimizer';

// Re-export types and utilities
export type { 
  JobWorkflow, 
  JobSchedule, 
  WorkflowTemplate,
  JobDependency,
  WorkflowExecution
} from '../../types/racine-core.types';
