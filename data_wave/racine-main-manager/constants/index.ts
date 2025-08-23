/**
 * Racine Main Manager Constants - Index
 * =====================================
 *
 * Central export for all configuration constants, templates, and
 * cross-group settings used throughout the Racine Main Manager.
 */

// Cross-group configuration constants
export * from './cross-group-configs';

// Workflow template constants
export * from './workflow-templates';

// Pipeline template constants
export * from './pipeline-templates';

// Workspace configuration constants
export * from './workspace-configs';

// Integration configuration constants
export * from './integration-configs';

// Re-export main constants for convenience
export {
  SUPPORTED_GROUPS,
  GROUP_IDS,
  GROUP_PRIORITIES,
  API_ENDPOINTS,
  PERFORMANCE_THRESHOLDS,
  LAYOUT_PRESETS,
  STATUS_CONFIGS,
  RETRY_CONFIGS,
  TIMEOUT_CONFIGS,
  WEBSOCKET_CONFIGS,
  CACHE_CONFIGS,
  MONITORING_CONFIGS,
  SECURITY_CONFIGS,
  FEATURE_FLAGS
} from './cross-group-configs';

export {
  WORKFLOW_TEMPLATES,
  STEP_TEMPLATES,
  VALIDATION_RULES,
  WORKFLOW_CATEGORIES
} from './workflow-templates';

export {
  PIPELINE_TEMPLATES,
  STAGE_TEMPLATES,
  OPTIMIZATION_CONFIGS,
  PIPELINE_CATEGORIES
} from './pipeline-templates';

export {
  INTEGRATION_GROUPS,
  INTEGRATION_API_ENDPOINTS,
  SYNC_PATTERNS,
  CONFLICT_RESOLUTION_STRATEGIES,
  INTEGRATION_TEMPLATES
} from './integration-configs';

// Re-export utility functions for convenience
export {
  getGroupById,
  getEnabledGroups,
  getGroupsByPriority,
  buildApiUrl,
  getStatusConfig,
  getPerformanceLevel,
  getCacheKey,
  isFeatureEnabled
} from './cross-group-configs';

export {
  getWorkflowTemplate,
  getStepTemplate as getWorkflowStepTemplate,
  getWorkflowsByCategory,
  getWorkflowsByGroup,
  validateWorkflowStep,
  estimateWorkflowDuration,
  getWorkflowComplexity
} from './workflow-templates';

export {
  getPipelineTemplate,
  getStageTemplate as getPipelineStageTemplate,
  getPipelinesByCategory,
  getPipelinesByGroup,
  getOptimizationConfig,
  estimatePipelineComplexity,
  calculateThroughputCapacity,
  validatePipelineStage,
  getOptimizationRecommendations
} from './pipeline-templates';

export {
  getIntegrationGroupById,
  getEnabledIntegrationGroups,
  getIntegrationGroupsByPriority,
  buildIntegrationApiUrl,
  getSyncTemplate,
  getConflictResolutionStrategy,
  isIntegrationFeatureEnabled
} from './integration-configs';