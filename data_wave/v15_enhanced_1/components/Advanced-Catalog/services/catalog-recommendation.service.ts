// ============================================================================
// CATALOG RECOMMENDATION SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: catalog_recommendation_service.py
// AI-powered recommendations and intelligent suggestions
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  AssetRecommendation,
  RecommendationEngine,
  AssetUsagePattern,
  IntelligenceInsight,
  CollaborationInsight,
  SemanticRelationship,
  CatalogApiResponse,
  PaginationRequest,
  TimeRange
} from '../types';
import { 
  CATALOG_RECOMMENDATION_ENDPOINTS, 
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// RECOMMENDATION REQUEST INTERFACES
// ============================================================================

export interface RecommendationRequest {
  userId: string;
  assetId?: string;
  context?: 'SEARCH' | 'BROWSING' | 'ANALYSIS' | 'COLLABORATION';
  includeReasoning: boolean;
  maxRecommendations: number;
  filters?: {
    assetTypes?: string[];
    departments?: string[];
    minRelevanceScore?: number;
  };
}

export interface PersonalizationRequest {
  userId: string;
  preferences?: Record<string, any>;
  behaviorData?: UserBehaviorData;
  updateProfile: boolean;
}

export interface UserBehaviorData {
  searchHistory: string[];
  viewHistory: string[];
  downloadHistory: string[];
  shareHistory: string[];
  collaborationHistory: string[];
  timeSpentPerAsset: Record<string, number>;
  interactionPatterns: Record<string, any>;
}

export interface SimilarityRequest {
  assetId: string;
  similarityType: 'CONTENT' | 'USAGE' | 'SEMANTIC' | 'COLLABORATIVE' | 'HYBRID';
  threshold?: number;
  maxResults?: number;
  includeScore: boolean;
}

export interface RecommendationFeedbackRequest {
  recommendationId: string;
  userId: string;
  feedback: 'HELPFUL' | 'NOT_HELPFUL' | 'IRRELEVANT' | 'INAPPROPRIATE';
  details?: string;
  context?: Record<string, any>;
}

export interface RecommendationModelRequest {
  modelType: 'COLLABORATIVE_FILTERING' | 'CONTENT_BASED' | 'HYBRID' | 'DEEP_LEARNING';
  trainingData?: any;
  hyperparameters?: Record<string, any>;
  evaluationMetrics?: string[];
}

export interface TrendingRequest {
  timeRange: TimeRange;
  category?: string;
  department?: string;
  assetType?: string;
  minTrendScore?: number;
  maxResults?: number;
}

export interface ContextualRecommendationRequest {
  userId: string;
  currentContext: {
    currentAsset?: string;
    currentQuery?: string;
    currentWorkspace?: string;
    currentProject?: string;
  };
  recommendationType: 'NEXT_STEPS' | 'RELATED_ASSETS' | 'COMPLEMENTARY_DATA' | 'EXPERT_CONTACTS';
  includeExplanation: boolean;
}

// ============================================================================
// CATALOG RECOMMENDATION SERVICE CLASS
// ============================================================================

export class CatalogRecommendationService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // ============================================================================
  // PERSONALIZED RECOMMENDATIONS
  // ============================================================================

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(request: RecommendationRequest): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.PERSONALIZED),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get contextual recommendations
   */
  async getContextualRecommendations(request: ContextualRecommendationRequest): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.CONTEXTUAL),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update user personalization profile
   */
  async updatePersonalizationProfile(request: PersonalizationRequest): Promise<CatalogApiResponse<any>> {
    const response = await axios.put<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.UPDATE_PROFILE),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get user recommendation profile
   */
  async getUserRecommendationProfile(userId: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.GET_PROFILE, { userId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // SIMILARITY & RELATED ASSETS
  // ============================================================================

  /**
   * Find similar assets
   */
  async findSimilarAssets(request: SimilarityRequest): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.SIMILAR_ASSETS),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get asset relationships
   */
  async getAssetRelationships(
    assetId: string,
    relationshipType?: 'SEMANTIC' | 'USAGE' | 'LINEAGE' | 'COLLABORATION'
  ): Promise<CatalogApiResponse<SemanticRelationship[]>> {
    const response = await axios.get<CatalogApiResponse<SemanticRelationship[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.ASSET_RELATIONSHIPS, { assetId }),
      { 
        params: { relationshipType },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get frequently accessed together assets
   */
  async getFrequentlyAccessedTogether(
    assetId: string,
    timeRange?: TimeRange
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.get<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.FREQUENTLY_TOGETHER, { assetId }),
      { 
        params: timeRange,
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get complementary assets
   */
  async getComplementaryAssets(
    assetId: string,
    analysisType: 'SCHEMA_COMPLEMENT' | 'USAGE_COMPLEMENT' | 'WORKFLOW_COMPLEMENT'
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.COMPLEMENTARY_ASSETS, { assetId }),
      { analysisType },
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // TRENDING & POPULAR
  // ============================================================================

  /**
   * Get trending assets
   */
  async getTrendingAssets(request: TrendingRequest): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.TRENDING),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get popular assets by department
   */
  async getPopularAssetsByDepartment(
    department: string,
    timeRange: TimeRange,
    maxResults: number = 10
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.get<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.POPULAR_BY_DEPT, { department }),
      { 
        params: { ...timeRange, maxResults },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get emerging assets
   */
  async getEmergingAssets(
    timeRange: TimeRange,
    growthThreshold: number = 2.0
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.get<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.EMERGING),
      { 
        params: { ...timeRange, growthThreshold },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get seasonal recommendations
   */
  async getSeasonalRecommendations(
    userId: string,
    season?: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER'
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.get<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.SEASONAL, { userId }),
      { 
        params: { season },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  // ============================================================================
  // COLLABORATIVE RECOMMENDATIONS
  // ============================================================================

  /**
   * Get collaborative filtering recommendations
   */
  async getCollaborativeRecommendations(
    userId: string,
    algorithm: 'USER_BASED' | 'ITEM_BASED' | 'MATRIX_FACTORIZATION'
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.COLLABORATIVE, { userId }),
      { algorithm },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get team recommendations
   */
  async getTeamRecommendations(
    teamId: string,
    includeIndividualPreferences: boolean = true
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.get<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.TEAM_RECOMMENDATIONS, { teamId }),
      { 
        params: { includeIndividualPreferences },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get expert recommendations
   */
  async getExpertRecommendations(
    assetId: string,
    expertise_area?: string
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.EXPERT_RECOMMENDATIONS, { assetId }),
      { 
        params: { expertise_area },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get peer recommendations
   */
  async getPeerRecommendations(
    userId: string,
    peerGroup: 'DEPARTMENT' | 'ROLE' | 'PROJECT' | 'SIMILAR_USERS'
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.get<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.PEER_RECOMMENDATIONS, { userId }),
      { 
        params: { peerGroup },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  // ============================================================================
  // CONTENT-BASED RECOMMENDATIONS
  // ============================================================================

  /**
   * Get content-based recommendations
   */
  async getContentBasedRecommendations(
    assetId: string,
    features: string[],
    weights?: Record<string, number>
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.CONTENT_BASED, { assetId }),
      { features, weights },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get tag-based recommendations
   */
  async getTagBasedRecommendations(
    tags: string[],
    userId?: string
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.TAG_BASED),
      { tags, userId },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get schema-based recommendations
   */
  async getSchemaBasedRecommendations(
    assetId: string,
    schemaMatchType: 'EXACT' | 'PARTIAL' | 'SEMANTIC'
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.SCHEMA_BASED, { assetId }),
      { schemaMatchType },
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // USAGE PATTERN ANALYSIS
  // ============================================================================

  /**
   * Get usage pattern recommendations
   */
  async getUsagePatternRecommendations(
    userId: string,
    patternType: 'TEMPORAL' | 'SEQUENTIAL' | 'COLLABORATIVE' | 'WORKFLOW'
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.USAGE_PATTERNS, { userId }),
      { patternType },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehaviorPatterns(
    userId: string,
    timeRange: TimeRange
  ): Promise<CatalogApiResponse<AssetUsagePattern[]>> {
    const response = await axios.get<CatalogApiResponse<AssetUsagePattern[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.BEHAVIOR_PATTERNS, { userId }),
      { 
        params: timeRange,
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get workflow-based recommendations
   */
  async getWorkflowBasedRecommendations(
    userId: string,
    currentWorkflow?: string
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.get<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.WORKFLOW_BASED, { userId }),
      { 
        params: { currentWorkflow },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  // ============================================================================
  // FEEDBACK & MODEL TRAINING
  // ============================================================================

  /**
   * Submit recommendation feedback
   */
  async submitRecommendationFeedback(request: RecommendationFeedbackRequest): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.SUBMIT_FEEDBACK),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get recommendation feedback analytics
   */
  async getFeedbackAnalytics(
    timeRange?: TimeRange,
    userId?: string
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.FEEDBACK_ANALYTICS),
      { 
        params: { ...timeRange, userId },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Train recommendation model
   */
  async trainRecommendationModel(request: RecommendationModelRequest): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.TRAIN_MODEL),
      request,
      { timeout: this.timeout * 5 } // Longer timeout for training
    );
    return response.data;
  }

  /**
   * Evaluate recommendation model performance
   */
  async evaluateModelPerformance(
    modelId: string,
    evaluationMetrics: string[]
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.EVALUATE_MODEL, { modelId }),
      { evaluationMetrics },
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  // ============================================================================
  // REAL-TIME RECOMMENDATIONS
  // ============================================================================

  /**
   * Get real-time recommendations
   */
  async getRealTimeRecommendations(
    userId: string,
    context: any,
    maxRecommendations: number = 5
  ): Promise<CatalogApiResponse<AssetRecommendation[]>> {
    const response = await axios.post<CatalogApiResponse<AssetRecommendation[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.REALTIME, { userId }),
      { context, maxRecommendations },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update real-time user context
   */
  async updateRealTimeContext(
    userId: string,
    context: Record<string, any>
  ): Promise<CatalogApiResponse<void>> {
    const response = await axios.put<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.UPDATE_CONTEXT, { userId }),
      context,
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // RECOMMENDATION INSIGHTS
  // ============================================================================

  /**
   * Get recommendation insights
   */
  async getRecommendationInsights(
    userId?: string,
    timeRange?: TimeRange
  ): Promise<CatalogApiResponse<IntelligenceInsight[]>> {
    const response = await axios.get<CatalogApiResponse<IntelligenceInsight[]>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.INSIGHTS),
      { 
        params: { userId, ...timeRange },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get recommendation performance metrics
   */
  async getPerformanceMetrics(
    modelId?: string,
    timeRange?: TimeRange
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.PERFORMANCE_METRICS),
      { 
        params: { modelId, ...timeRange },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get A/B testing results
   */
  async getABTestingResults(
    testId: string,
    metrics: string[]
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.AB_TESTING, { testId }),
      { metrics },
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // CONFIGURATION & SETTINGS
  // ============================================================================

  /**
   * Get recommendation engine configuration
   */
  async getEngineConfiguration(): Promise<CatalogApiResponse<RecommendationEngine>> {
    const response = await axios.get<CatalogApiResponse<RecommendationEngine>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.ENGINE_CONFIG),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update recommendation engine configuration
   */
  async updateEngineConfiguration(config: Partial<RecommendationEngine>): Promise<CatalogApiResponse<RecommendationEngine>> {
    const response = await axios.put<CatalogApiResponse<RecommendationEngine>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.UPDATE_ENGINE_CONFIG),
      config,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Reset user recommendations
   */
  async resetUserRecommendations(userId: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, CATALOG_RECOMMENDATION_ENDPOINTS.RESET_USER, { userId }),
      {},
      { timeout: this.timeout }
    );
    return response.data;
  }
}

// Create and export singleton instance
export const catalogRecommendationService = new CatalogRecommendationService();
export default catalogRecommendationService;