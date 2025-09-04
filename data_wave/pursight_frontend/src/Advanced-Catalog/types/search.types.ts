// ============================================================================
// ADVANCED CATALOG SEARCH TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: semantic_search_service.py, enterprise_catalog_routes.py search endpoints
// ============================================================================

import { 
  IntelligentDataAsset, 
  BusinessGlossaryTerm,
  TimePeriod,
  SemanticEmbedding 
} from './catalog-core.types';

// ============================================================================
// SEMANTIC SEARCH TYPES (semantic_search_service.py)
// ============================================================================

export interface SemanticSearchEngine {
  id: string;
  name: string;
  version: string;
  
  // Engine Configuration
  config: SearchEngineConfig;
  
  // Search Capabilities
  capabilities: SearchCapabilities;
  
  // Indexing
  indexing: SearchIndexing;
  
  // Query Processing
  queryProcessor: QueryProcessor;
  
  // Ranking
  rankingEngine: RankingEngine;
  
  // Performance
  performance: SearchEnginePerformance;
  
  // Status
  status: SearchEngineStatus;
}

export interface SearchRequest {
  id: string;
  query: string;
  searchType: SearchType;
  
  // Context
  context: SearchContext;
  
  // Filters
  filters: SearchFilter[];
  
  // Facets
  facets: SearchFacet[];
  
  // Pagination
  pagination: SearchPagination;
  
  // Sorting
  sorting: SearchSorting[];
  
  // Highlighting
  highlighting: SearchHighlighting;
  
  // Personalization
  personalization: SearchPersonalization;
  
  // Configuration
  config: SearchRequestConfig;
}

export interface SearchResponse {
  id: string;
  requestId: string;
  
  // Results
  results: SearchResult[];
  totalResults: number;
  
  // Facets
  facets: SearchFacetResult[];
  
  // Suggestions
  suggestions: SearchSuggestion[];
  
  // Corrections
  corrections: SearchCorrection[];
  
  // Related Queries
  relatedQueries: RelatedQuery[];
  
  // Performance
  performance: SearchPerformance;
  
  // Metadata
  metadata: SearchResponseMetadata;
  
  // Timestamps
  executedAt: Date;
  duration: number;
}

export interface SearchResult {
  id: string;
  
  // Result Data
  asset?: IntelligentDataAsset;
  term?: BusinessGlossaryTerm;
  
  // Relevance
  score: number;
  relevance: SearchRelevance;
  
  // Highlighting
  highlights: SearchHighlight[];
  
  // Explanation
  explanation: SearchExplanation;
  
  // Context
  context: SearchResultContext;
  
  // Metadata
  metadata: SearchResultMetadata;
  
  // Actions
  actions: SearchResultAction[];
}

export interface NaturalLanguageQuery {
  id: string;
  originalQuery: string;
  
  // Query Understanding
  intent: QueryIntent;
  entities: QueryEntity[];
  
  // Query Processing
  processedQuery: ProcessedQuery;
  
  // Transformation
  transformation: QueryTransformation;
  
  // Semantic Analysis
  semanticAnalysis: SemanticAnalysis;
  
  // Confidence
  confidence: number;
  
  // Alternatives
  alternatives: AlternativeQuery[];
}

export interface SearchPersonalization {
  userId?: string;
  
  // User Profile
  userProfile: UserSearchProfile;
  
  // Preferences
  preferences: SearchPreferences;
  
  // History
  searchHistory: SearchHistoryItem[];
  
  // Behavior
  behavior: SearchBehaviorProfile;
  
  // Context
  personalContext: PersonalSearchContext;
  
  // Recommendations
  personalizedRecommendations: PersonalizedSearchRecommendation[];
}

export interface SearchAnalytics {
  id: string;
  period: TimePeriod;
  
  // Query Analytics
  queryAnalytics: QueryAnalytics;
  
  // User Analytics
  userAnalytics: SearchUserAnalytics;
  
  // Performance Analytics
  performanceAnalytics: SearchPerformanceAnalytics;
  
  // Content Analytics
  contentAnalytics: SearchContentAnalytics;
  
  // Trend Analysis
  trendAnalysis: SearchTrendAnalysis;
  
  // Insights
  insights: SearchInsight[];
  
  // Recommendations
  optimizationRecommendations: SearchOptimizationRecommendation[];
}

// ============================================================================
// UNIFIED SEARCH TYPES
// ============================================================================

export interface UnifiedSearchInterface {
  id: string;
  name: string;
  
  // Search Scope
  scope: UnifiedSearchScope;
  
  // Search Domains
  domains: SearchDomain[];
  
  // Federated Search
  federatedSearch: FederatedSearchConfig;
  
  // Cross-Domain Ranking
  crossDomainRanking: CrossDomainRankingConfig;
  
  // Result Aggregation
  resultAggregation: ResultAggregationConfig;
  
  // Unified Filters
  unifiedFilters: UnifiedSearchFilter[];
  
  // Performance
  performance: UnifiedSearchPerformance;
}

export interface FederatedSearchConfig {
  id: string;
  
  // Search Sources
  sources: FederatedSearchSource[];
  
  // Orchestration
  orchestration: FederatedOrchestration;
  
  // Result Merging
  resultMerging: ResultMergingStrategy;
  
  // Timeout Configuration
  timeouts: FederatedTimeoutConfig;
  
  // Fallback Strategy
  fallbackStrategy: FederatedFallbackStrategy;
  
  // Quality Control
  qualityControl: FederatedQualityControl;
}

export interface SearchRecommendationEngine {
  id: string;
  name: string;
  
  // Recommendation Types
  types: SearchRecommendationType[];
  
  // Algorithms
  algorithms: RecommendationAlgorithm[];
  
  // Personalization
  personalization: RecommendationPersonalization;
  
  // Context Awareness
  contextAwareness: RecommendationContextAwareness;
  
  // Feedback Loop
  feedbackLoop: RecommendationFeedbackLoop;
  
  // Performance
  performance: RecommendationEnginePerformance;
}

// ============================================================================
// ADVANCED SEARCH FEATURES
// ============================================================================

export interface SearchAutoComplete {
  id: string;
  
  // Suggestions
  suggestions: AutoCompleteSuggestion[];
  
  // Categories
  categories: AutoCompleteCategory[];
  
  // Personalization
  personalized: boolean;
  personalizedSuggestions: PersonalizedSuggestion[];
  
  // Performance
  responseTime: number;
  
  // Configuration
  config: AutoCompleteConfig;
}

export interface SearchFiltering {
  id: string;
  
  // Available Filters
  availableFilters: AvailableFilter[];
  
  // Active Filters
  activeFilters: ActiveFilter[];
  
  // Filter Dependencies
  dependencies: FilterDependency[];
  
  // Dynamic Filters
  dynamicFilters: DynamicFilter[];
  
  // Filter Analytics
  analytics: FilterAnalytics;
}

export interface SearchFaceting {
  id: string;
  
  // Facet Configuration
  config: FacetConfig;
  
  // Facet Results
  facetResults: FacetResult[];
  
  // Hierarchical Facets
  hierarchicalFacets: HierarchicalFacet[];
  
  // Range Facets
  rangeFacets: RangeFacet[];
  
  // Custom Facets
  customFacets: CustomFacet[];
}

export interface SearchSuggestionEngine {
  id: string;
  
  // Suggestion Types
  types: SuggestionType[];
  
  // Suggestion Sources
  sources: SuggestionSource[];
  
  // Machine Learning
  mlModels: SuggestionMLModel[];
  
  // Real-time Suggestions
  realTimeSuggestions: RealTimeSuggestion[];
  
  // Performance
  performance: SuggestionEnginePerformance;
}

// ============================================================================
// SEARCH MONITORING & OPTIMIZATION
// ============================================================================

export interface SearchMonitoring {
  id: string;
  
  // Performance Monitoring
  performanceMonitoring: SearchPerformanceMonitoring;
  
  // Quality Monitoring
  qualityMonitoring: SearchQualityMonitoring;
  
  // User Experience Monitoring
  uxMonitoring: SearchUXMonitoring;
  
  // System Health
  systemHealth: SearchSystemHealth;
  
  // Alerts
  alerts: SearchAlert[];
  
  // Reports
  reports: SearchMonitoringReport[];
}

export interface SearchOptimization {
  id: string;
  
  // Query Optimization
  queryOptimization: QueryOptimization;
  
  // Index Optimization
  indexOptimization: IndexOptimization;
  
  // Ranking Optimization
  rankingOptimization: RankingOptimization;
  
  // Performance Optimization
  performanceOptimization: SearchPerformanceOptimization;
  
  // A/B Testing
  abTesting: SearchABTesting;
  
  // Recommendations
  optimizationRecommendations: OptimizationRecommendation[];
}

export interface SearchConfiguration {
  id: string;
  name: string;
  
  // Engine Configuration
  engineConfig: SearchEngineConfiguration;
  
  // Index Configuration
  indexConfig: SearchIndexConfiguration;
  
  // Query Configuration
  queryConfig: SearchQueryConfiguration;
  
  // Ranking Configuration
  rankingConfig: SearchRankingConfiguration;
  
  // UI Configuration
  uiConfig: SearchUIConfiguration;
  
  // Advanced Settings
  advancedSettings: SearchAdvancedSettings;
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum SearchType {
  KEYWORD = 'KEYWORD',
  SEMANTIC = 'SEMANTIC',
  NATURAL_LANGUAGE = 'NATURAL_LANGUAGE',
  FACETED = 'FACETED',
  FUZZY = 'FUZZY',
  BOOLEAN = 'BOOLEAN',
  PHRASE = 'PHRASE',
  WILDCARD = 'WILDCARD'
}

export enum SearchEngineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  INDEXING = 'INDEXING',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR'
}

export enum QueryIntent {
  FIND_ASSET = 'FIND_ASSET',
  FIND_DEFINITION = 'FIND_DEFINITION',
  FIND_LINEAGE = 'FIND_LINEAGE',
  FIND_USAGE = 'FIND_USAGE',
  FIND_QUALITY = 'FIND_QUALITY',
  FIND_OWNER = 'FIND_OWNER',
  FIND_SIMILAR = 'FIND_SIMILAR',
  EXPLORE = 'EXPLORE'
}

export enum SearchRecommendationType {
  QUERY_SUGGESTION = 'QUERY_SUGGESTION',
  RESULT_RECOMMENDATION = 'RESULT_RECOMMENDATION',
  FILTER_SUGGESTION = 'FILTER_SUGGESTION',
  SIMILAR_SEARCH = 'SIMILAR_SEARCH',
  TRENDING_SEARCH = 'TRENDING_SEARCH',
  PERSONALIZED = 'PERSONALIZED'
}

export enum SuggestionType {
  QUERY_COMPLETION = 'QUERY_COMPLETION',
  SPELL_CORRECTION = 'SPELL_CORRECTION',
  SYNONYM_EXPANSION = 'SYNONYM_EXPANSION',
  RELATED_TERMS = 'RELATED_TERMS',
  POPULAR_SEARCHES = 'POPULAR_SEARCHES',
  TRENDING_SEARCHES = 'TRENDING_SEARCHES'
}

export enum FilterType {
  TEXT = 'TEXT',
  NUMERIC = 'NUMERIC',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  LIST = 'LIST',
  RANGE = 'RANGE',
  HIERARCHICAL = 'HIERARCHICAL',
  GEO = 'GEO'
}

export enum FacetType {
  TERMS = 'TERMS',
  RANGE = 'RANGE',
  DATE_HISTOGRAM = 'DATE_HISTOGRAM',
  NESTED = 'NESTED',
  FILTER = 'FILTER',
  QUERY = 'QUERY'
}

export enum SortOrder {
  RELEVANCE = 'RELEVANCE',
  POPULARITY = 'POPULARITY',
  RECENCY = 'RECENCY',
  ALPHABETICAL = 'ALPHABETICAL',
  CUSTOM = 'CUSTOM'
}

export enum SearchScope {
  ASSETS = 'ASSETS',
  GLOSSARY = 'GLOSSARY',
  LINEAGE = 'LINEAGE',
  QUALITY = 'QUALITY',
  DOCUMENTATION = 'DOCUMENTATION',
  ALL = 'ALL'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface SearchFilter {
  field: string;
  type: FilterType;
  operator: FilterOperator;
  value: any;
  values?: any[];
  enabled: boolean;
}

export interface SearchFacet {
  field: string;
  type: FacetType;
  size: number;
  minCount?: number;
  include?: string[];
  exclude?: string[];
}

export interface SearchPagination {
  page: number;
  size: number;
  offset: number;
  maxSize: number;
}

export interface SearchSorting {
  field: string;
  order: SortOrder;
  direction: SortDirection;
}

export interface SearchHighlighting {
  enabled: boolean;
  fields: string[];
  fragmentSize: number;
  numberOfFragments: number;
  preTag: string;
  postTag: string;
}

export interface SearchContext {
  userId?: string;
  sessionId: string;
  userAgent: string;
  location?: SearchLocation;
  timestamp: Date;
  referrer?: string;
}

export interface SearchRelevance {
  score: number;
  factors: RelevanceFactor[];
  explanation: string;
  boost: number;
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
  matched: boolean;
}

export interface SearchExplanation {
  description: string;
  value: number;
  details: ExplanationDetail[];
}

export interface QueryEntity {
  text: string;
  type: EntityType;
  confidence: number;
  start: number;
  end: number;
}

export interface SearchPreferences {
  defaultSort: SortOrder;
  resultsPerPage: number;
  enablePersonalization: boolean;
  enableSuggestions: boolean;
  enableHighlighting: boolean;
  preferredDomains: string[];
}

export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  results: number;
  clicked: boolean;
  clickedResult?: string;
}

export interface AutoCompleteSuggestion {
  text: string;
  type: SuggestionType;
  score: number;
  category: string;
  metadata: Record<string, any>;
}

export interface FacetResult {
  field: string;
  type: FacetType;
  buckets: FacetBucket[];
  otherCount?: number;
  error?: string;
}

export interface FacetBucket {
  key: string;
  count: number;
  selected: boolean;
  subFacets?: FacetResult[];
}

export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  BETWEEN = 'BETWEEN',
  IN = 'IN',
  NOT_IN = 'NOT_IN'
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum EntityType {
  ASSET_NAME = 'ASSET_NAME',
  COLUMN_NAME = 'COLUMN_NAME',
  BUSINESS_TERM = 'BUSINESS_TERM',
  OWNER = 'OWNER',
  TAG = 'TAG',
  DOMAIN = 'DOMAIN',
  DATE = 'DATE',
  NUMBER = 'NUMBER'
}

export interface SearchLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

export interface RelevanceFactor {
  name: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface ExplanationDetail {
  description: string;
  value: number;
  details?: ExplanationDetail[];
}

// ============================================================================
// SEARCH PERFORMANCE & ANALYTICS TYPES
// ============================================================================

export interface SearchPerformance {
  totalTime: number;
  queryTime: number;
  fetchTime: number;
  processingTime: number;
  
  // Cache Performance
  cacheHitRate: number;
  cacheSize: number;
  
  // Resource Usage
  memoryUsage: number;
  cpuUsage: number;
  
  // Throughput
  queriesPerSecond: number;
  
  // Errors
  errorRate: number;
  errors: SearchError[];
}

export interface QueryAnalytics {
  totalQueries: number;
  uniqueQueries: number;
  averageQueryLength: number;
  
  // Query Types
  queryTypes: QueryTypeAnalytics[];
  
  // Popular Queries
  popularQueries: PopularQuery[];
  
  // Query Success Rate
  successRate: number;
  noResultsRate: number;
  
  // Query Patterns
  queryPatterns: QueryPattern[];
}

export interface SearchUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  
  // User Behavior
  averageSessionDuration: number;
  averageQueriesPerSession: number;
  bounceRate: number;
  
  // User Segments
  userSegments: UserSegmentAnalytics[];
  
  // Engagement
  engagementMetrics: SearchEngagementMetrics;
}

export interface SearchError {
  type: SearchErrorType;
  message: string;
  timestamp: Date;
  context: Record<string, any>;
}

export enum SearchErrorType {
  QUERY_PARSE_ERROR = 'QUERY_PARSE_ERROR',
  INDEX_ERROR = 'INDEX_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR'
}