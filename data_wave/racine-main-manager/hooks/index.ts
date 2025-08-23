/**
 * Racine Main Manager Hooks - Index
 * ==================================
 * 
 * Central export point for all Racine Main Manager React hooks.
 * All hooks provide comprehensive state management, API integration,
 * and real-time updates for the master data governance system.
 */

// Core orchestration hooks
export { useRacineOrchestration } from './useRacineOrchestration';
export type { 
  OrchestrationState,
  OrchestrationHookOperations,
  OrchestrationHookConfig
} from './useRacineOrchestration';

// Workspace management hooks
export { useWorkspaceManagement } from './useWorkspaceManagement';
export type {
  WorkspaceManagementHookState,
  WorkspaceManagementHookOperations,
  WorkspaceManagementHookConfig
} from './useWorkspaceManagement';

// Job workflow hooks
export { useJobWorkflowBuilder } from './useJobWorkflowBuilder';
export type {
  JobWorkflowBuilderHookState,
  JobWorkflowBuilderHookOperations,
  JobWorkflowBuilderHookConfig
} from './useJobWorkflowBuilder';

// Pipeline management hooks
export { usePipelineManager } from './usePipelineManager';
export type {
  PipelineManagerHookState,
  PipelineManagerHookOperations,
  PipelineManagerHookConfig
} from './usePipelineManager';

// AI assistant hooks
export { useAIAssistant } from './useAIAssistant';
export type {
  AIAssistantHookState,
  AIAssistantHookOperations,
  AIAssistantHookConfig
} from './useAIAssistant';

// Context-aware AI hooks
export { useContextAwareAI } from './useContextAwareAI';
export type {
  ContextAwareAIHookState,
  ContextAwareAIHookOperations,
  ContextAwareAIHookConfig
} from './useContextAwareAI';

// Activity tracking hooks
export { useActivityTracker } from './useActivityTracker';
export type {
  ActivityTrackerHookState,
  ActivityTrackerHookOperations,
  ActivityTrackerHookConfig
} from './useActivityTracker';

// Collaboration hooks
export { useCollaboration } from './useCollaboration';
export type {
  CollaborationHookState,
  CollaborationHookOperations,
  CollaborationHookConfig
} from './useCollaboration';

// Intelligent dashboard hooks
export { useIntelligentDashboard } from './useIntelligentDashboard';
export type {
  DashboardHookState,
  DashboardHookOperations,
  DashboardHookConfig
} from './useIntelligentDashboard';

// User management hooks
export { useUserManagement } from './useUserManagement';
export type {
  UserManagementHookState,
  UserManagementHookOperations,
  UserManagementHookConfig
} from './useUserManagement';

// Cross-group integration hooks
export { useCrossGroupIntegration } from './useCrossGroupIntegration';
export type {
  CrossGroupIntegrationHookState,
  CrossGroupIntegrationHookOperations,
  CrossGroupIntegrationHookConfig
} from './useCrossGroupIntegration';

// Data source management hooks
export { useDataSources } from './useDataSources';
export { useConnectionValidator } from './useConnectionValidator';

// Security management hooks
export { useSecurityManager } from './useSecurityManager';

// Notification management hooks
export { useNotificationManager } from './useNotificationManager';
export { useNotifications } from './useNotifications';
export type {
  NotificationState,
  NotificationMethods,
  UseNotificationsReturn
} from './useNotifications';

// Scan rule set management hooks
export { useScanRuleSets } from './useScanRuleSets';

// Additional SPA integration hooks
export { useClassifications } from './useClassifications';
export { useComplianceRules } from './useComplianceRules';
export { useAdvancedCatalog } from './useAdvancedCatalog';

// Scan logic integration hooks
export { useScanLogic } from './useScanLogic';
export type {
  ScanLogicState,
  ScanLogicMethods,
  UseScanLogicOptions,
  UseScanLogicReturn
} from './useScanLogic';

// RBAC system integration hooks
export { useRBACSystem } from './useRBACSystem';
export type {
  RBACSystemState,
  RBACSystemMethods,
  UseRBACSystemOptions,
  UseRBACSystemReturn
} from './useRBACSystem';

// Navigation & UI hooks (CRITICAL ADDITIONS)
export { default as useGlobalSearch } from './useGlobalSearch';
export type {
  GlobalSearchState,
  GlobalSearchActions
} from './useGlobalSearch';

export { default as useQuickActions } from './useQuickActions';
export type {
  QuickActionsState,
  QuickActionsManager
} from './useQuickActions';

export { default as useNavigationAnalytics } from './useNavigationAnalytics';
export type {
  NavigationAnalyticsState,
  NavigationAnalyticsActions
} from './useNavigationAnalytics';

export { default as useUserPreferences } from './useUserPreferences';
export type {
  UserPreferencesState,
  UserPreferencesActions
} from './useUserPreferences';