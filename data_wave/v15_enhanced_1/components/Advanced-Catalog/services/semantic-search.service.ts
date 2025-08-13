// ============================================================================
// SEMANTIC SEARCH SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: semantic_search_service.py
// Advanced search capabilities, natural language processing, and personalization
// ============================================================================

import axios from 'axios';
import { 
  SearchRequest,
  SearchResponse,
  NaturalLanguageQuery,
  SearchPersonalization,
  SearchAnalytics,
  SemanticSearchEngine,
  UnifiedSearchInterface,
  SearchAutoComplete,
  CatalogApiResponse,
  IntelligentDataAsset,
  BusinessGlossaryTerm
} from '../types';
import { 
  SEARCH_ENDPOINTS, 
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// SEARCH SERVICE INTERFACES
// ============================================================================

export interface BasicSearchRequest {
  query: string;
  searchType?: 'KEYWORD' | 'SEMANTIC' | 'NATURAL_LANGUAGE' | 'FACETED' | 'FUZZY' | 'BOOLEAN';
  scope?: 'ALL' | 'ASSETS' | 'GLOSSARY' | 'LINEAGE' | 'QUALITY' | 'DOCUMENTATION';
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  facets?: string[];
  sort?: Array<{
    field: string;
    order: 'ASC' | 'DESC';
  }>;
  pagination?: {
    page: number;
    size: number;
  };
  highlighting?: {
    enabled: boolean;
    fields: string[];
    fragmentSize?: number;
  };
  personalization?: {
    userId?: string;
    preferences?: any;
  };
}

export interface AdvancedSearchRequest extends BasicSearchRequest {
  aggregations?: Array<{
    field: string;
    type: 'TERMS' | 'RANGE' | 'DATE_HISTOGRAM';
    size?: number;
  }>;
  suggestions?: {
    enabled: boolean;
    count?: number;
  };
  similarityThreshold?: number;
  boostFields?: Record<string, number>;
  customQuery?: any;
}

export interface SemanticSearchRequest {
  query: string;
  embeddingModel?: string;
  similarityThreshold?: number;
  maxResults?: number;
  includeScore?: boolean;
  contextFilters?: any[];
  semanticExpansion?: boolean;
}

export interface FacetedSearchRequest extends BasicSearchRequest {
  facetConfiguration?: {
    minCount?: number;
    maxTerms?: number;
    includeEmpty?: boolean;
    sortBy?: 'COUNT' | 'TERM';
  };
  drillDown?: Array<{
    facet: string;
    values: string[];
  }>;
}

export interface NaturalLanguageSearchRequest {
  naturalLanguageQuery: string;
  intentRecognition?: boolean;
  entityExtraction?: boolean;
  queryExpansion?: boolean;
  confidence?: number;
  fallbackToKeyword?: boolean;
  language?: string;
}

export interface SearchSuggestionRequest {
  partialQuery: string;
  maxSuggestions?: number;
  suggestionTypes?: string[];
  context?: any;
  personalized?: boolean;
  userId?: string;
}

export interface SearchPersonalizationRequest {
  userId: string;
  searchHistory?: boolean;
  userPreferences?: boolean;
  collaborativeFiltering?: boolean;
  contentBasedRecommendations?: boolean;
  behaviorAnalysis?: boolean;
}

export interface SearchAnalyticsRequest {
  startDate: Date;
  endDate: Date;
  granularity?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
  metrics?: string[];
  groupBy?: string[];
  filters?: any[];
}

// ============================================================================
// SEMANTIC SEARCH SERVICE CLASS
// ============================================================================

export class SemanticSearchService {
  private baseURL: string;

  constructor() {
    this.baseURL = SEARCH_ENDPOINTS.SEARCH.QUERY;
  }

  // ============================================================================
  // BASIC SEARCH OPERATIONS
  // ============================================================================

  /**
   * Perform a basic search with keyword matching
   */
  async search(request: BasicSearchRequest): Promise<CatalogApiResponse<SearchResponse>> {
    const response = await axios.post<CatalogApiResponse<SearchResponse>>(
      SEARCH_ENDPOINTS.SEARCH.QUERY,
      request
    );

    return response.data;
  }

  /**
   * Perform semantic search using vector embeddings
   */
  async semanticSearch(request: SemanticSearchRequest): Promise<CatalogApiResponse<SearchResponse>> {
    const response = await axios.post<CatalogApiResponse<SearchResponse>>(
      SEARCH_ENDPOINTS.SEARCH.SEMANTIC,
      request
    );

    return response.data;
  }

  /**
   * Perform advanced search with complex queries and aggregations
   */
  async advancedSearch(request: AdvancedSearchRequest): Promise<CatalogApiResponse<SearchResponse>> {
    const response = await axios.post<CatalogApiResponse<SearchResponse>>(
      SEARCH_ENDPOINTS.SEARCH.ADVANCED,
      request
    );

    return response.data;
  }

  /**
   * Perform faceted search with category-based filtering
   */
  async facetedSearch(request: FacetedSearchRequest): Promise<CatalogApiResponse<SearchResponse>> {
    const response = await axios.post<CatalogApiResponse<SearchResponse>>(
      SEARCH_ENDPOINTS.SEARCH.FACETED,
      request
    );

    return response.data;
  }

  /**
   * Process natural language queries with intent recognition
   */
  async naturalLanguageSearch(
    request: NaturalLanguageSearchRequest
  ): Promise<CatalogApiResponse<SearchResponse & { processedQuery: NaturalLanguageQuery }>> {
    const response = await axios.post<CatalogApiResponse<SearchResponse & { processedQuery: NaturalLanguageQuery }>>(
      SEARCH_ENDPOINTS.SEARCH.NATURAL_LANGUAGE,
      request
    );

    return response.data;
  }

  /**
   * Find similar assets based on content similarity
   */
  async similaritySearch(
    assetId: string,
    similarityThreshold: number = 0.7,
    maxResults: number = 10,
    excludeSelf: boolean = true
  ): Promise<CatalogApiResponse<IntelligentDataAsset[]>> {
    const params = {
      assetId,
      similarityThreshold,
      maxResults,
      excludeSelf
    };

    const response = await axios.get<CatalogApiResponse<IntelligentDataAsset[]>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.SIMILARITY, params)
    );

    return response.data;
  }

  /**
   * Perform fuzzy search with approximate matching
   */
  async fuzzySearch(
    query: string,
    fuzziness: number = 1,
    prefixLength: number = 0,
    maxExpansions: number = 50
  ): Promise<CatalogApiResponse<SearchResponse>> {
    const request = {
      query,
      fuzziness,
      prefixLength,
      maxExpansions
    };

    const response = await axios.post<CatalogApiResponse<SearchResponse>>(
      SEARCH_ENDPOINTS.SEARCH.FUZZY,
      request
    );

    return response.data;
  }

  /**
   * Perform boolean search with logical operators
   */
  async booleanSearch(
    booleanQuery: string,
    defaultOperator: 'AND' | 'OR' = 'AND'
  ): Promise<CatalogApiResponse<SearchResponse>> {
    const request = {
      query: booleanQuery,
      defaultOperator
    };

    const response = await axios.post<CatalogApiResponse<SearchResponse>>(
      SEARCH_ENDPOINTS.SEARCH.BOOLEAN,
      request
    );

    return response.data;
  }

  // ============================================================================
  // SEARCH SUGGESTIONS & AUTOCOMPLETE
  // ============================================================================

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(request: SearchSuggestionRequest): Promise<CatalogApiResponse<string[]>> {
    const response = await axios.post<CatalogApiResponse<string[]>>(
      SEARCH_ENDPOINTS.SEARCH.SUGGEST,
      request
    );

    return response.data;
  }

  /**
   * Get autocomplete suggestions for search as user types
   */
  async getAutocompleteSuggestions(
    partialQuery: string,
    maxSuggestions: number = 10,
    includeHighlighting: boolean = true,
    userId?: string
  ): Promise<CatalogApiResponse<SearchAutoComplete>> {
    const params = {
      q: partialQuery,
      max: maxSuggestions,
      highlight: includeHighlighting,
      ...(userId && { userId })
    };

    const response = await axios.get<CatalogApiResponse<SearchAutoComplete>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.AUTOCOMPLETE, params)
    );

    return response.data;
  }

  /**
   * Get query corrections and spell-check suggestions
   */
  async getQueryCorrections(
    query: string,
    maxCorrections: number = 5
  ): Promise<CatalogApiResponse<{ original: string; suggestions: string[]; confidence: number[] }>> {
    const params = {
      q: query,
      max: maxCorrections
    };

    const response = await axios.get<CatalogApiResponse<{ original: string; suggestions: string[]; confidence: number[] }>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.CORRECTIONS, params)
    );

    return response.data;
  }

  /**
   * Get related queries based on search history and patterns
   */
  async getRelatedQueries(
    query: string,
    maxQueries: number = 5,
    userId?: string
  ): Promise<CatalogApiResponse<string[]>> {
    const params = {
      q: query,
      max: maxQueries,
      ...(userId && { userId })
    };

    const response = await axios.get<CatalogApiResponse<string[]>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.RELATED, params)
    );

    return response.data;
  }

  // ============================================================================
  // TRENDING & POPULAR SEARCHES
  // ============================================================================

  /**
   * Get trending search queries
   */
  async getTrendingSearches(
    period: string = '24h',
    limit: number = 10,
    category?: string
  ): Promise<CatalogApiResponse<Array<{ query: string; count: number; trend: number }>>> {
    const params = {
      period,
      limit,
      ...(category && { category })
    };

    const response = await axios.get<CatalogApiResponse<Array<{ query: string; count: number; trend: number }>>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.TRENDING, params)
    );

    return response.data;
  }

  /**
   * Get popular search queries
   */
  async getPopularSearches(
    period: string = '7d',
    limit: number = 10,
    userSegment?: string
  ): Promise<CatalogApiResponse<Array<{ query: string; count: number; users: number }>>> {
    const params = {
      period,
      limit,
      ...(userSegment && { segment: userSegment })
    };

    const response = await axios.get<CatalogApiResponse<Array<{ query: string; count: number; users: number }>>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.POPULAR, params)
    );

    return response.data;
  }

  /**
   * Get recent searches for a user
   */
  async getRecentSearches(
    userId: string,
    limit: number = 20,
    includeFailed: boolean = false
  ): Promise<CatalogApiResponse<Array<{ query: string; timestamp: Date; results: number }>>> {
    const params = {
      userId,
      limit,
      includeFailed
    };

    const response = await axios.get<CatalogApiResponse<Array<{ query: string; timestamp: Date; results: number }>>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.RECENT, params)
    );

    return response.data;
  }

  /**
   * Get saved searches for a user
   */
  async getSavedSearches(userId: string): Promise<CatalogApiResponse<Array<{
    id: string;
    name: string;
    query: any;
    createdAt: Date;
    lastUsed: Date;
  }>>> {
    const params = { userId };

    const response = await axios.get<CatalogApiResponse<Array<{
      id: string;
      name: string;
      query: any;
      createdAt: Date;
      lastUsed: Date;
    }>>>(
      buildUrl(SEARCH_ENDPOINTS.SEARCH.SAVED, params)
    );

    return response.data;
  }

  /**
   * Save a search query for later use
   */
  async saveSearch(
    userId: string,
    name: string,
    query: any,
    description?: string
  ): Promise<CatalogApiResponse<{ id: string }>> {
    const request = {
      userId,
      name,
      query,
      description
    };

    const response = await axios.post<CatalogApiResponse<{ id: string }>>(
      SEARCH_ENDPOINTS.SEARCH.SAVED,
      request
    );

    return response.data;
  }

  // ============================================================================
  // SEARCH PERSONALIZATION
  // ============================================================================

  /**
   * Get user search profile and preferences
   */
  async getUserSearchProfile(userId: string): Promise<CatalogApiResponse<SearchPersonalization>> {
    const response = await axios.get<CatalogApiResponse<SearchPersonalization>>(
      SEARCH_ENDPOINTS.PERSONALIZATION.PROFILE(userId)
    );

    return response.data;
  }

  /**
   * Update user search preferences
   */
  async updateSearchPreferences(
    userId: string,
    preferences: any
  ): Promise<CatalogApiResponse<void>> {
    const response = await axios.put<CatalogApiResponse<void>>(
      SEARCH_ENDPOINTS.PERSONALIZATION.PREFERENCES(userId),
      preferences
    );

    return response.data;
  }

  /**
   * Get personalized search recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    context?: any,
    limit: number = 10
  ): Promise<CatalogApiResponse<Array<{
    type: string;
    title: string;
    query?: any;
    assets?: IntelligentDataAsset[];
    score: number;
  }>>> {
    const params = {
      context: context ? JSON.stringify(context) : undefined,
      limit
    };

    const response = await axios.get<CatalogApiResponse<Array<{
      type: string;
      title: string;
      query?: any;
      assets?: IntelligentDataAsset[];
      score: number;
    }>>>(
      buildUrl(SEARCH_ENDPOINTS.PERSONALIZATION.RECOMMENDATIONS(userId), params)
    );

    return response.data;
  }

  /**
   * Provide feedback on search results to improve personalization
   */
  async provideFeedback(
    userId: string,
    searchId: string,
    feedback: {
      rating?: number;
      relevantResults?: string[];
      irrelevantResults?: string[];
      comments?: string;
    }
  ): Promise<CatalogApiResponse<void>> {
    const request = {
      searchId,
      feedback
    };

    const response = await axios.post<CatalogApiResponse<void>>(
      SEARCH_ENDPOINTS.PERSONALIZATION.FEEDBACK(userId),
      request
    );

    return response.data;
  }

  // ============================================================================
  // SEARCH CONFIGURATION & MANAGEMENT
  // ============================================================================

  /**
   * Get current search engine configuration
   */
  async getSearchConfiguration(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      SEARCH_ENDPOINTS.CONFIGURATION.GET
    );

    return response.data;
  }

  /**
   * Update search engine configuration
   */
  async updateSearchConfiguration(config: any): Promise<CatalogApiResponse<void>> {
    const response = await axios.put<CatalogApiResponse<void>>(
      SEARCH_ENDPOINTS.CONFIGURATION.UPDATE,
      config
    );

    return response.data;
  }

  /**
   * Validate search configuration
   */
  async validateSearchConfiguration(config: any): Promise<CatalogApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    const response = await axios.post<CatalogApiResponse<{
      valid: boolean;
      errors: string[];
      warnings: string[];
    }>>(
      SEARCH_ENDPOINTS.CONFIGURATION.VALIDATE,
      config
    );

    return response.data;
  }

  // ============================================================================
  // SEARCH INDEX MANAGEMENT
  // ============================================================================

  /**
   * Get search index status and health
   */
  async getIndexStatus(): Promise<CatalogApiResponse<{
    status: string;
    health: string;
    totalDocuments: number;
    indexSize: string;
    lastUpdated: Date;
  }>> {
    const response = await axios.get<CatalogApiResponse<{
      status: string;
      health: string;
      totalDocuments: number;
      indexSize: string;
      lastUpdated: Date;
    }>>(
      SEARCH_ENDPOINTS.INDEX.STATUS
    );

    return response.data;
  }

  /**
   * Trigger search index rebuild
   */
  async rebuildIndex(
    incremental: boolean = false,
    priority: 'LOW' | 'NORMAL' | 'HIGH' = 'NORMAL'
  ): Promise<CatalogApiResponse<{ jobId: string; estimatedDuration: number }>> {
    const request = {
      incremental,
      priority
    };

    const response = await axios.post<CatalogApiResponse<{ jobId: string; estimatedDuration: number }>>(
      SEARCH_ENDPOINTS.INDEX.REBUILD,
      request
    );

    return response.data;
  }

  /**
   * Optimize search index for better performance
   */
  async optimizeIndex(): Promise<CatalogApiResponse<{ jobId: string }>> {
    const response = await axios.post<CatalogApiResponse<{ jobId: string }>>(
      SEARCH_ENDPOINTS.INDEX.OPTIMIZE
    );

    return response.data;
  }

  /**
   * Get search index statistics
   */
  async getIndexStatistics(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      SEARCH_ENDPOINTS.INDEX.STATISTICS
    );

    return response.data;
  }

  // ============================================================================
  // SEARCH ANALYTICS
  // ============================================================================

  /**
   * Get search analytics overview
   */
  async getSearchAnalyticsOverview(
    request: SearchAnalyticsRequest
  ): Promise<CatalogApiResponse<SearchAnalytics>> {
    const response = await axios.post<CatalogApiResponse<SearchAnalytics>>(
      SEARCH_ENDPOINTS.ANALYTICS.OVERVIEW,
      request
    );

    return response.data;
  }

  /**
   * Get query analytics and performance metrics
   */
  async getQueryAnalytics(
    startDate: Date,
    endDate: Date,
    topQueries: number = 100
  ): Promise<CatalogApiResponse<any>> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      topQueries
    };

    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(SEARCH_ENDPOINTS.ANALYTICS.QUERIES, params)
    );

    return response.data;
  }

  /**
   * Get search performance analytics
   */
  async getPerformanceAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<CatalogApiResponse<any>> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(SEARCH_ENDPOINTS.ANALYTICS.PERFORMANCE, params)
    );

    return response.data;
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehaviorAnalytics(
    startDate: Date,
    endDate: Date,
    segment?: string
  ): Promise<CatalogApiResponse<any>> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...(segment && { segment })
    };

    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(SEARCH_ENDPOINTS.ANALYTICS.USER_BEHAVIOR, params)
    );

    return response.data;
  }

  // ============================================================================
  // EXPORT & UTILITY OPERATIONS
  // ============================================================================

  /**
   * Export search results to various formats
   */
  async exportSearchResults(
    searchRequest: BasicSearchRequest,
    format: 'CSV' | 'EXCEL' | 'JSON' | 'PDF',
    includeMetadata: boolean = true
  ): Promise<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>> {
    const request = {
      searchRequest,
      format,
      includeMetadata
    };

    const response = await axios.post<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>>(
      SEARCH_ENDPOINTS.SEARCH.EXPORT,
      request
    );

    return response.data;
  }

  /**
   * Get search recommendations for improving search quality
   */
  async getSearchOptimizationRecommendations(): Promise<CatalogApiResponse<Array<{
    type: string;
    title: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    implementation: string;
  }>>> {
    const response = await axios.get<CatalogApiResponse<Array<{
      type: string;
      title: string;
      description: string;
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
      effort: 'LOW' | 'MEDIUM' | 'HIGH';
      implementation: string;
    }>>>(
      SEARCH_ENDPOINTS.ANALYTICS.RECOMMENDATIONS
    );

    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const semanticSearchService = new SemanticSearchService();
export default semanticSearchService;