// ============================================================================
// ADVANCED CATALOG HOOKS INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export for all Advanced Catalog React hooks
// ============================================================================

// Discovery Hooks
export {
  useCatalogDiscovery,
  type UseCatalogDiscoveryOptions,
  type DiscoveryState,
  type DiscoveryFilters,
  type DiscoveryOperations
} from './useCatalogDiscovery';

// Analytics Hooks
export {
  useCatalogAnalytics,
  type UseCatalogAnalyticsOptions,
  type AnalyticsState,
  type AnalyticsFilters,
  type AnalyticsOperations
} from './useCatalogAnalytics';

// Lineage Hooks
export {
  useCatalogLineage,
  type UseCatalogLineageOptions,
  type LineageState,
  type LineageFilters,
  type LineageOperations
} from './useCatalogLineage';

// Data Lineage Hook
export {
  useDataLineage,
  type UseDataLineageOptions,
  type UseDataLineageReturn
} from './useDataLineage';

// Recommendations Hooks
export {
  useCatalogRecommendations,
  type UseCatalogRecommendationsOptions,
  type RecommendationsState,
  type RecommendationFilters,
  type RecommendationOperations
} from './useCatalogRecommendations';

// AI Hooks
export {
  useCatalogAI,
  type UseCatalogAIOptions,
  type AIState,
  type AIFilters,
  type AIOperations
} from './useCatalogAI';

// Profiling Hooks
export {
  useCatalogProfiling,
  type UseCatalogProfilingOptions,
  type ProfilingState,
  type ProfilingFilters,
  type ProfilingOperations
} from './useCatalogProfiling';

// Collaboration Hooks
export {
  useCatalogCollaboration,
  useCollaborationHubs,
  useCollaborationHub,
  useCollaborationTeams,
  useDataStewardship,
  useDataAnnotations,
  useAssetReviews,
  useCrowdsourcingCampaigns,
  useExpertConsultation,
  useKnowledgeBase,
  useCollaborationAnalytics,
  type UseCatalogCollaborationOptions,
  type CollaborationState,
  type CollaborationOperations
} from './useCatalogCollaboration';

// ============================================================================
// HOOK COLLECTION TYPES
// ============================================================================

export interface CatalogHooks {
  discovery: typeof useCatalogDiscovery;
  analytics: typeof useCatalogAnalytics;
  lineage: typeof useCatalogLineage;
  recommendations: typeof useCatalogRecommendations;
  ai: typeof useCatalogAI;
  profiling: typeof useCatalogProfiling;
  collaboration: typeof useCatalogCollaboration;
}

export interface CatalogHookStates {
  discovery: DiscoveryState;
  analytics: AnalyticsState;
  lineage: LineageState;
  recommendations: RecommendationsState;
  ai: AIState;
  profiling: ProfilingState;
  collaboration: CollaborationState;
}

export interface CatalogHookOperations {
  discovery: DiscoveryOperations;
  analytics: AnalyticsOperations;
  lineage: LineageOperations;
  recommendations: RecommendationOperations;
  ai: AIOperations;
  profiling: ProfilingOperations;
  collaboration: CollaborationOperations;
}

// ============================================================================
// HOOK UTILITIES
// ============================================================================

/**
 * Collection of all Advanced Catalog hooks
 */
export const catalogHooks: CatalogHooks = {
  discovery: useCatalogDiscovery,
  analytics: useCatalogAnalytics,
  lineage: useCatalogLineage,
  recommendations: useCatalogRecommendations,
  ai: useCatalogAI,
  profiling: useCatalogProfiling,
  collaboration: useCatalogCollaboration
};

/**
 * Hook names for dynamic access
 */
export const CATALOG_HOOK_NAMES = {
  DISCOVERY: 'discovery',
  ANALYTICS: 'analytics',
  LINEAGE: 'lineage',
  RECOMMENDATIONS: 'recommendations',
  AI: 'ai',
  PROFILING: 'profiling',
  COLLABORATION: 'collaboration'
} as const;

export type CatalogHookName = keyof typeof CATALOG_HOOK_NAMES;

// ============================================================================
// EXPORTS
// ============================================================================

export default catalogHooks;