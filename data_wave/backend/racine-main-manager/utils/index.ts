/**
 * Racine Main Manager Utilities Index
 * ===================================
 * 
 * Central export point for all utility functions used throughout the
 * Racine Main Manager system. This includes utilities for cross-group
 * orchestration, workflow management, pipeline execution, context analysis,
 * collaboration, dashboard management, and security.
 */

// Cross-group orchestration utilities
export * from './cross-group-orchestrator';
export { 
  coordinateServices,
  validateIntegration,
  optimizeExecution,
  handleErrors
} from './cross-group-orchestrator';

// Workflow engine utilities
export * from './workflow-engine';
export {
  executeWorkflow,
  handleDependencies,
  optimizeWorkflow,
  validateWorkflow
} from './workflow-engine';

// Pipeline engine utilities
export * from './pipeline-engine';
export {
  executePipeline,
  monitorHealth,
  optimizePipeline,
  handleErrors as handlePipelineErrors
} from './pipeline-engine';

// Context analyzer utilities
export * from './context-analyzer';
export {
  ContextAnalyzer,
  contextAnalyzer,
  analyzeContext,
  getContextHistory,
  clearContextHistory
} from './context-analyzer';
export type {
  ContextAnalysisResult,
  ContextEntity,
  ContextPattern,
  ContextRecommendation,
  ContextAnomaly,
  ContextVector,
  ContextCluster
} from './context-analyzer';

// Collaboration utilities
export * from './collaboration-utils';
export {
  collaborationUtils,
  CollaborationSessionManager,
  DocumentCollaborationManager,
  WorkflowCoAuthoringManager,
  ExpertNetworkManager,
  CollaborationAnalyticsManager,
  createCollaborationId,
  validateCollaborationPermissions,
  formatCollaborationDuration,
  generateCollaborationSummary
} from './collaboration-utils';

// Dashboard utilities
export * from './dashboard-utils';
export {
  dashboardUtils,
  DashboardConfigurationManager,
  DashboardWidgetManager,
  DashboardKPICalculator,
  DashboardAlertProcessor,
  PredictiveInsightsEngine,
  createDashboardId,
  createWidgetId,
  formatDashboardValue,
  calculateWidgetPerformance,
  generateDashboardReport
} from './dashboard-utils';

// Security utilities
export * from './security-utils';
export {
  securityUtils,
  RBACManager,
  AccessControlManager,
  SecurityAuditManager,
  ThreatDetectionEngine,
  generateSecurityId,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validateIPAddress,
  calculatePasswordStrength,
  sanitizeInput,
  isSecureContext,
  generateCSRFToken,
  validateCSRFToken
} from './security-utils';

// Integration utilities
export * from './integration-utils';
export {
  integrationUtils,
  CrossGroupDataTransformer,
  ConflictResolver,
  SynchronizationManager,
  IntegrationHealthMonitor,
  crossGroupDataTransformer,
  conflictResolver,
  synchronizationManager,
  integrationHealthMonitor
} from './integration-utils';
export type {
  IntegrationContext,
  IntegrationOperation,
  ConflictResolutionStrategy,
  SyncConfiguration,
  DataTransformation,
  ValidationRule,
  IntegrationMetrics
} from './integration-utils';

// Utility type definitions
export interface UtilityResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface OperationResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Common utility functions
export const createOperationResult = (
  success: boolean,
  message: string,
  details?: any
): OperationResult => ({
  success,
  message,
  details,
  timestamp: new Date().toISOString()
});

export const createValidationResult = (
  valid: boolean,
  errors: string[] = [],
  warnings: string[] = [],
  suggestions: string[] = []
): ValidationResult => ({
  valid,
  errors,
  warnings,
  suggestions
});

export const createUtilityResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  metadata?: Record<string, any>
): UtilityResponse<T> => ({
  success,
  data,
  error,
  metadata
});

// Utility constants
export const UTILITY_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  BATCH_SIZE: 100,
  CACHE_TTL: 300000, // 5 minutes
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 1000,
    BURST_LIMIT: 100
  }
} as const;

// Error types
export class UtilityError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'UtilityError';
  }
}

export class ValidationError extends UtilityError {
  constructor(message: string, public validationErrors: string[]) {
    super(message, 'VALIDATION_ERROR', { validationErrors });
    this.name = 'ValidationError';
  }
}

export class OrchestrationError extends UtilityError {
  constructor(message: string, public step?: string, public workflowId?: string) {
    super(message, 'ORCHESTRATION_ERROR', { step, workflowId });
    this.name = 'OrchestrationError';
  }
}

export class SecurityError extends UtilityError {
  constructor(message: string, public securityContext?: any) {
    super(message, 'SECURITY_ERROR', { securityContext });
    this.name = 'SecurityError';
  }
}

// Utility helpers
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = UTILITY_CONSTANTS.MAX_RETRY_ATTEMPTS,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await delay(delayMs * attempt); // Exponential backoff
    }
  }
  
  throw lastError!;
};

export const timeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = UTILITY_CONSTANTS.DEFAULT_TIMEOUT
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

export const batch = <T, R>(
  items: T[],
  batchFn: (batch: T[]) => Promise<R[]>,
  batchSize: number = UTILITY_CONSTANTS.BATCH_SIZE
): Promise<R[]> => {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return Promise.all(batches.map(batchFn)).then(results => results.flat());
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limitMs);
    }
  }) as T;
};

// New utility exports for Scan Logic and RBAC
export { scanLogicUtils } from './scan-logic-utils';
export type {
  ScanLogicConfigurationUtils,
  ScanLogicMonitoringUtils,
  ScanLogicCoordinationUtils,
  ScanLogicRealTimeUtils
} from './scan-logic-utils';

export { rbacUtils } from './rbac-utils';
export type {
  RBACPermissionUtils,
  RBACRoleUtils,
  RBACUserUtils,
  RBACPolicyUtils,
  RBACAnalyticsUtils,
  RBACConfigurationUtils
} from './rbac-utils';