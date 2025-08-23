/**
 * Racine Main Manager Services - Index
 * ====================================
 *
 * Central export for all API service classes that provide 100% mapped
 * integration with backend Racine services.
 */

// Main orchestration service
export * from './racine-orchestration-apis';

// Workspace management service
export * from './workspace-management-apis';

// Job workflow service
export * from './job-workflow-apis';

// Pipeline management service
export * from './pipeline-management-apis';

// AI assistant service
export * from './ai-assistant-apis';

// Activity tracking service
export * from './activity-tracking-apis';

// Dashboard management service
export * from './dashboard-apis';

// Collaboration service
export * from './collaboration-apis';

// Cross-group integration service
export * from './cross-group-integration-apis';

// User management service
export * from './user-management-apis';

// Scan logic service (integrated with Advanced-Scan-Logic SPA)
export * from './scan-logic-apis';

// Advanced catalog service
export * from './advanced-catalog-apis';

// Classifications service
export * from './classifications-apis';

// Compliance rule service
export * from './compliance-rule-apis';

// Scan rule sets service
export * from './scan-rule-sets-apis';

// RBAC admin service (for subcomponents)
export * from './rbac-admin-apis';

// Quick actions service (for subcomponents)
export * from './quick-actions-apis';

// Re-export service instances for convenience
export { racineOrchestrationAPI } from './racine-orchestration-apis';
export { workspaceManagementAPI } from './workspace-management-apis';
export { jobWorkflowAPI } from './job-workflow-apis';
export { pipelineManagementAPI } from './pipeline-management-apis';
export { aiAssistantAPI } from './ai-assistant-apis';
export { activityTrackingAPI } from './activity-tracking-apis';
export { dashboardAPI } from './dashboard-apis';
export { collaborationAPI } from './collaboration-apis';
export { crossGroupIntegrationAPI } from './cross-group-integration-apis';
export { userManagementAPI } from './user-management-apis';
export { scanLogicAPI } from './scan-logic-apis';
export { advancedCatalogAPI } from './advanced-catalog-apis';
export { classificationsAPI } from './classifications-apis';
export { complianceRuleAPI } from './compliance-rule-apis';
export { scanRuleSetsAPI } from './scan-rule-sets-apis';
export { rbacAdminAPI } from './rbac-admin-apis';
export { quickActionsAPI } from './quick-actions-apis';

// Export service types for external usage
export type {
  OrchestrationAPIConfig,
  OrchestrationEventType,
  OrchestrationEvent,
  OrchestrationEventHandler,
  EventSubscription,
  WebSocketMessage,
  WebSocketConfig
} from './racine-orchestration-apis';

export type {
  WorkspaceAPIConfig,
  WorkspaceEventType,
  WorkspaceEvent,
  WorkspaceEventHandler,
  WorkspaceEventSubscription,
  WorkspaceWebSocketMessage
} from './workspace-management-apis';

export type {
  WorkflowAPIConfig,
  WorkflowEventType,
  WorkflowEvent,
  WorkflowEventHandler,
  WorkflowEventSubscription,
  WorkflowWebSocketMessage,
  ExecutionControlRequest
} from './job-workflow-apis';

export type {
  PipelineAPIConfig,
  PipelineEventType,
  PipelineEvent,
  PipelineEventHandler,
  PipelineEventSubscription,
  PipelineControlRequest
} from './pipeline-management-apis';

export type {
  AIAssistantAPIConfig,
  AIEventType,
  AIEvent,
  AIEventHandler,
  AIEventSubscription,
  ConversationContext
} from './ai-assistant-apis';

export type {
  ActivityTrackingAPIConfig,
  ActivityEventType,
  ActivityEvent,
  ActivityEventHandler,
  ActivityEventSubscription
} from './activity-tracking-apis';

export type {
  DashboardAPIConfig,
  DashboardEvent,
  DashboardEventHandler,
  DashboardEventSubscription
} from './dashboard-apis';

export type {
  CollaborationAPIConfig,
  CollaborationEvent,
  CollaborationEventHandler,
  CollaborationEventSubscription,
  CoAuthoringOperation,
  UserPresence
} from './collaboration-apis';

export type {
  IntegrationAPIConfig,
  IntegrationEvent,
  IntegrationEventHandler,
  IntegrationEventSubscription,
  CrossGroupSearchFilters,
  SyncOptions
} from './cross-group-integration-apis';

export type {
  UserManagementAPIConfig,
  UserManagementEventType,
  UserManagementEvent,
  UserManagementEventHandler
} from './user-management-apis';