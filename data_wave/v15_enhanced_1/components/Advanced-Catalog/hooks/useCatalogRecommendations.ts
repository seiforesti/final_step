// ============================================================================
// USE CATALOG RECOMMENDATIONS HOOK - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hook for managing AI-powered recommendations and intelligent suggestions
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  catalogRecommendationService,
  RecommendationRequest,
  PersonalizationRequest,
  SimilarityRequest,
  RecommendationFeedbackRequest,
  TrendingRequest,
  ContextualRecommendationRequest,
  LineageSearchRequest,
  RecommendationModelRequest
} from '../services';
import {
  AssetRecommendation,
  RecommendationEngine,
  AssetUsagePattern,
  IntelligenceInsight,
  CollaborationInsight,
  SemanticRelationship,
  TimeRange,
  CatalogApiResponse,
  PaginationRequest
} from '../types';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseCatalogRecommendationsOptions {
  userId?: string;
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  maxRetries?: number;
  defaultMaxRecommendations?: number;
  onRecommendationAction?: (recommendation: AssetRecommendation, action: string) => void;
  onRecommendationError?: (error: Error) => void;
}

export interface RecommendationsState {
  personalizedRecommendations: AssetRecommendation[];
  contextualRecommendations: AssetRecommendation[];
  similarAssets: AssetRecommendation[];
  trendingAssets: AssetRecommendation[];
  collaborativeRecommendations: AssetRecommendation[];
  contentBasedRecommendations: AssetRecommendation[];
  usagePatterns: AssetUsagePattern[];
  userProfile: any | null;
  engineConfig: RecommendationEngine | null;
  feedbackAnalytics: any | null;
  isLoading: boolean;
  isTraining: boolean;
  isGenerating: boolean;
  error: string | null;
  lastUpdateTime: Date | null;
}

export interface RecommendationFilters {
  userId?: string;
  assetTypes?: string[];
  departments?: string[];
  minRelevanceScore?: number;
  maxRecommendations?: number;
  includeReasoning?: boolean;
  recommendationType?: 'ASSETS' | 'ACTIONS' | 'INSIGHTS' | 'OPTIMIZATIONS';
  context?: Record<string, any>;
}

// ============================================================================
// RECOMMENDATION OPERATIONS
// ============================================================================

export interface RecommendationOperations {
  // Personalized Recommendations
  getPersonalizedRecommendations: (request: RecommendationRequest) => Promise<AssetRecommendation[]>;
  getContextualRecommendations: (request: ContextualRecommendationRequest) => Promise<AssetRecommendation[]>;
  updatePersonalizationProfile: (request: PersonalizationRequest) => Promise<any>;
  getUserRecommendationProfile: (userId: string) => Promise<any>;

  // Similarity & Related Assets
  findSimilarAssets: (request: SimilarityRequest) => Promise<AssetRecommendation[]>;
  getAssetRelationships: (assetId: string, relationshipType?: string) => Promise<SemanticRelationship[]>;
  getFrequentlyAccessedTogether: (assetId: string, timeRange?: TimeRange) => Promise<AssetRecommendation[]>;
  getComplementaryAssets: (assetId: string, analysisType: string) => Promise<AssetRecommendation[]>;

  // Trending & Popular
  getTrendingAssets: (request: TrendingRequest) => Promise<AssetRecommendation[]>;
  getPopularAssetsByDepartment: (department: string, timeRange: TimeRange, maxResults?: number) => Promise<AssetRecommendation[]>;
  getEmergingAssets: (timeRange: TimeRange, growthThreshold?: number) => Promise<AssetRecommendation[]>;
  getSeasonalRecommendations: (userId: string, season?: string) => Promise<AssetRecommendation[]>;

  // Collaborative Recommendations
  getCollaborativeRecommendations: (userId: string, algorithm: string) => Promise<AssetRecommendation[]>;
  getTeamRecommendations: (teamId: string, includeIndividualPreferences?: boolean) => Promise<AssetRecommendation[]>;
  getExpertRecommendations: (assetId: string, expertiseArea?: string) => Promise<any>;
  getPeerRecommendations: (userId: string, peerGroup: string) => Promise<AssetRecommendation[]>;

  // Content-Based Recommendations
  getContentBasedRecommendations: (assetId: string, features: string[], weights?: Record<string, number>) => Promise<AssetRecommendation[]>;
  getTagBasedRecommendations: (tags: string[], userId?: string) => Promise<AssetRecommendation[]>;
  getSchemaBasedRecommendations: (assetId: string, schemaMatchType: string) => Promise<AssetRecommendation[]>;

  // Usage Pattern Analysis
  getUsagePatternRecommendations: (userId: string, patternType: string) => Promise<AssetRecommendation[]>;
  analyzeUserBehaviorPatterns: (userId: string, timeRange: TimeRange) => Promise<AssetUsagePattern[]>;
  getWorkflowBasedRecommendations: (userId: string, currentWorkflow?: string) => Promise<AssetRecommendation[]>;

  // Feedback & Model Training
  submitRecommendationFeedback: (request: RecommendationFeedbackRequest) => Promise<void>;
  getFeedbackAnalytics: (timeRange?: TimeRange, userId?: string) => Promise<any>;
  trainRecommendationModel: (request: RecommendationModelRequest) => Promise<any>;
  evaluateModelPerformance: (modelId: string, evaluationMetrics: string[]) => Promise<any>;

  // Real-time Recommendations
  getRealTimeRecommendations: (userId: string, context: any, maxRecommendations?: number) => Promise<AssetRecommendation[]>;
  updateRealTimeContext: (userId: string, context: Record<string, any>) => Promise<void>;

  // Configuration & Management
  getEngineConfiguration: () => Promise<RecommendationEngine>;
  updateEngineConfiguration: (config: Partial<RecommendationEngine>) => Promise<RecommendationEngine>;
  resetUserRecommendations: (userId: string) => Promise<void>;

  // State Management
  setFilters: (filters: RecommendationFilters) => void;
  clearFilters: () => void;
  refreshRecommendations: () => Promise<void>;
  resetState: () => void;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  PERSONALIZED: 'catalogRecommendations.personalized',
  CONTEXTUAL: 'catalogRecommendations.contextual',
  SIMILAR_ASSETS: 'catalogRecommendations.similarAssets',
  TRENDING: 'catalogRecommendations.trending',
  COLLABORATIVE: 'catalogRecommendations.collaborative',
  CONTENT_BASED: 'catalogRecommendations.contentBased',
  USAGE_PATTERNS: 'catalogRecommendations.usagePatterns',
  USER_PROFILE: 'catalogRecommendations.userProfile',
  ENGINE_CONFIG: 'catalogRecommendations.engineConfig',
  FEEDBACK_ANALYTICS: 'catalogRecommendations.feedbackAnalytics',
} as const;

// ============================================================================
// CATALOG RECOMMENDATIONS HOOK
// ============================================================================

export function useCatalogRecommendations(
  options: UseCatalogRecommendationsOptions = {}
): RecommendationsState & RecommendationOperations {
  const {
    userId,
    enableRealTimeUpdates = false,
    autoRefreshInterval = 300000, // 5 minutes
    maxRetries = 3,
    defaultMaxRecommendations = 10,
    onRecommendationAction,
    onRecommendationError
  } = options;

  const queryClient = useQueryClient();

  // Local State
  const [filters, setFiltersState] = useState<RecommendationFilters>({
    userId,
    maxRecommendations: defaultMaxRecommendations,
    includeReasoning: true
  });
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Personalized Recommendations
  const {
    data: personalizedResponse,
    isLoading: personalizedLoading,
    error: personalizedError,
    refetch: refetchPersonalized
  } = useQuery({
    queryKey: [QUERY_KEYS.PERSONALIZED, filters],
    queryFn: () => catalogRecommendationService.getPersonalizedRecommendations({
      userId: filters.userId!,
      context: 'BROWSING',
      includeReasoning: filters.includeReasoning || true,
      maxRecommendations: filters.maxRecommendations || defaultMaxRecommendations,
      filters: {
        assetTypes: filters.assetTypes,
        departments: filters.departments,
        minRelevanceScore: filters.minRelevanceScore
      }
    }),
    enabled: !!filters.userId,
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // Trending Assets
  const {
    data: trendingResponse,
    isLoading: trendingLoading,
    refetch: refetchTrending
  } = useQuery({
    queryKey: [QUERY_KEYS.TRENDING, filters],
    queryFn: () => catalogRecommendationService.getTrendingAssets({
      timeRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date()
      },
      assetType: filters.assetTypes?.[0],
      department: filters.departments?.[0],
      maxResults: filters.maxRecommendations || defaultMaxRecommendations
    }),
    refetchInterval: enableRealTimeUpdates ? autoRefreshInterval : false,
    retry: maxRetries
  });

  // User Profile
  const {
    data: userProfileResponse,
    refetch: refetchUserProfile
  } = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE, filters.userId],
    queryFn: () => catalogRecommendationService.getUserRecommendationProfile(filters.userId!),
    enabled: !!filters.userId,
    retry: maxRetries
  });

  // Engine Configuration
  const {
    data: engineConfigResponse,
    refetch: refetchEngineConfig
  } = useQuery({
    queryKey: [QUERY_KEYS.ENGINE_CONFIG],
    queryFn: () => catalogRecommendationService.getEngineConfiguration(),
    retry: maxRetries
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Submit Feedback
  const feedbackMutation = useMutation({
    mutationFn: (request: RecommendationFeedbackRequest) =>
      catalogRecommendationService.submitRecommendationFeedback(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONALIZED] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEEDBACK_ANALYTICS] });
    },
    onError: (error) => {
      onRecommendationError?.(error as Error);
    }
  });

  // Train Model
  const trainModelMutation = useMutation({
    mutationFn: (request: RecommendationModelRequest) =>
      catalogRecommendationService.trainRecommendationModel(request),
    onMutate: () => {
      setIsTraining(true);
    },
    onSuccess: () => {
      setIsTraining(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONALIZED] });
    },
    onError: (error) => {
      setIsTraining(false);
      onRecommendationError?.(error as Error);
    }
  });

  // Update Personalization
  const updatePersonalizationMutation = useMutation({
    mutationFn: (request: PersonalizationRequest) =>
      catalogRecommendationService.updatePersonalizationProfile(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONALIZED] });
    }
  });

  // ============================================================================
  // COMPUTED STATE
  // ============================================================================

  const personalizedRecommendations = useMemo(() => personalizedResponse?.data || [], [personalizedResponse]);
  const trendingAssets = useMemo(() => trendingResponse?.data || [], [trendingResponse]);
  const userProfile = useMemo(() => userProfileResponse?.data || null, [userProfileResponse]);
  const engineConfig = useMemo(() => engineConfigResponse?.data || null, [engineConfigResponse]);
  const isLoading = personalizedLoading || trendingLoading;
  const error = personalizedError?.message || null;

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  const getPersonalizedRecommendations = useCallback(async (
    request: RecommendationRequest
  ): Promise<AssetRecommendation[]> => {
    setIsGenerating(true);
    try {
      const result = await catalogRecommendationService.getPersonalizedRecommendations(request);
      setIsGenerating(false);
      setLastUpdateTime(new Date());
      return result.data;
    } catch (error) {
      setIsGenerating(false);
      throw error;
    }
  }, []);

  const getContextualRecommendations = useCallback(async (
    request: ContextualRecommendationRequest
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getContextualRecommendations(request);
    return result.data;
  }, []);

  const updatePersonalizationProfile = useCallback(async (
    request: PersonalizationRequest
  ): Promise<any> => {
    const result = await updatePersonalizationMutation.mutateAsync(request);
    return result.data;
  }, [updatePersonalizationMutation]);

  const getUserRecommendationProfile = useCallback(async (userId: string): Promise<any> => {
    const result = await catalogRecommendationService.getUserRecommendationProfile(userId);
    return result.data;
  }, []);

  const findSimilarAssets = useCallback(async (
    request: SimilarityRequest
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.findSimilarAssets(request);
    return result.data;
  }, []);

  const getAssetRelationships = useCallback(async (
    assetId: string,
    relationshipType?: string
  ): Promise<SemanticRelationship[]> => {
    const result = await catalogRecommendationService.getAssetRelationships(assetId, relationshipType as any);
    return result.data;
  }, []);

  const getFrequentlyAccessedTogether = useCallback(async (
    assetId: string,
    timeRange?: TimeRange
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getFrequentlyAccessedTogether(assetId, timeRange);
    return result.data;
  }, []);

  const getComplementaryAssets = useCallback(async (
    assetId: string,
    analysisType: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getComplementaryAssets(assetId, analysisType as any);
    return result.data;
  }, []);

  const getTrendingAssets = useCallback(async (
    request: TrendingRequest
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getTrendingAssets(request);
    return result.data;
  }, []);

  const getPopularAssetsByDepartment = useCallback(async (
    department: string,
    timeRange: TimeRange,
    maxResults: number = 10
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getPopularAssetsByDepartment(department, timeRange, maxResults);
    return result.data;
  }, []);

  const getEmergingAssets = useCallback(async (
    timeRange: TimeRange,
    growthThreshold: number = 2.0
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getEmergingAssets(timeRange, growthThreshold);
    return result.data;
  }, []);

  const getSeasonalRecommendations = useCallback(async (
    userId: string,
    season?: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getSeasonalRecommendations(userId, season as any);
    return result.data;
  }, []);

  const getCollaborativeRecommendations = useCallback(async (
    userId: string,
    algorithm: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getCollaborativeRecommendations(userId, algorithm as any);
    return result.data;
  }, []);

  const getTeamRecommendations = useCallback(async (
    teamId: string,
    includeIndividualPreferences: boolean = true
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getTeamRecommendations(teamId, includeIndividualPreferences);
    return result.data;
  }, []);

  const getExpertRecommendations = useCallback(async (
    assetId: string,
    expertiseArea?: string
  ): Promise<any> => {
    const result = await catalogRecommendationService.getExpertRecommendations(assetId, expertiseArea);
    return result.data;
  }, []);

  const getPeerRecommendations = useCallback(async (
    userId: string,
    peerGroup: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getPeerRecommendations(userId, peerGroup as any);
    return result.data;
  }, []);

  const getContentBasedRecommendations = useCallback(async (
    assetId: string,
    features: string[],
    weights?: Record<string, number>
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getContentBasedRecommendations(assetId, features, weights);
    return result.data;
  }, []);

  const getTagBasedRecommendations = useCallback(async (
    tags: string[],
    userId?: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getTagBasedRecommendations(tags, userId);
    return result.data;
  }, []);

  const getSchemaBasedRecommendations = useCallback(async (
    assetId: string,
    schemaMatchType: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getSchemaBasedRecommendations(assetId, schemaMatchType as any);
    return result.data;
  }, []);

  const getUsagePatternRecommendations = useCallback(async (
    userId: string,
    patternType: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getUsagePatternRecommendations(userId, patternType as any);
    return result.data;
  }, []);

  const analyzeUserBehaviorPatterns = useCallback(async (
    userId: string,
    timeRange: TimeRange
  ): Promise<AssetUsagePattern[]> => {
    const result = await catalogRecommendationService.analyzeUserBehaviorPatterns(userId, timeRange);
    return result.data;
  }, []);

  const getWorkflowBasedRecommendations = useCallback(async (
    userId: string,
    currentWorkflow?: string
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getWorkflowBasedRecommendations(userId, currentWorkflow);
    return result.data;
  }, []);

  const submitRecommendationFeedback = useCallback(async (
    request: RecommendationFeedbackRequest
  ): Promise<void> => {
    await feedbackMutation.mutateAsync(request);
  }, [feedbackMutation]);

  const getFeedbackAnalytics = useCallback(async (
    timeRange?: TimeRange,
    userId?: string
  ): Promise<any> => {
    const result = await catalogRecommendationService.getFeedbackAnalytics(timeRange, userId);
    return result.data;
  }, []);

  const trainRecommendationModel = useCallback(async (
    request: RecommendationModelRequest
  ): Promise<any> => {
    const result = await trainModelMutation.mutateAsync(request);
    return result.data;
  }, [trainModelMutation]);

  const evaluateModelPerformance = useCallback(async (
    modelId: string,
    evaluationMetrics: string[]
  ): Promise<any> => {
    const result = await catalogRecommendationService.evaluateModelPerformance(modelId, evaluationMetrics);
    return result.data;
  }, []);

  const getRealTimeRecommendations = useCallback(async (
    userId: string,
    context: any,
    maxRecommendations: number = 5
  ): Promise<AssetRecommendation[]> => {
    const result = await catalogRecommendationService.getRealTimeRecommendations(userId, context, maxRecommendations);
    return result.data;
  }, []);

  const updateRealTimeContext = useCallback(async (
    userId: string,
    context: Record<string, any>
  ): Promise<void> => {
    await catalogRecommendationService.updateRealTimeContext(userId, context);
  }, []);

  const getEngineConfiguration = useCallback(async (): Promise<RecommendationEngine> => {
    const result = await catalogRecommendationService.getEngineConfiguration();
    return result.data;
  }, []);

  const updateEngineConfiguration = useCallback(async (
    config: Partial<RecommendationEngine>
  ): Promise<RecommendationEngine> => {
    const result = await catalogRecommendationService.updateEngineConfiguration(config);
    return result.data;
  }, []);

  const resetUserRecommendations = useCallback(async (userId: string): Promise<void> => {
    await catalogRecommendationService.resetUserRecommendations(userId);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONALIZED] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
  }, [queryClient]);

  const setFilters = useCallback((newFilters: RecommendationFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      userId,
      maxRecommendations: defaultMaxRecommendations,
      includeReasoning: true
    });
  }, [userId, defaultMaxRecommendations]);

  const refreshRecommendations = useCallback(async () => {
    await Promise.all([
      refetchPersonalized(),
      refetchTrending(),
      refetchUserProfile(),
      refetchEngineConfig()
    ]);
    setLastUpdateTime(new Date());
  }, [refetchPersonalized, refetchTrending, refetchUserProfile, refetchEngineConfig]);

  const resetState = useCallback(() => {
    setFiltersState({
      userId,
      maxRecommendations: defaultMaxRecommendations,
      includeReasoning: true
    });
    setIsTraining(false);
    setIsGenerating(false);
    setLastUpdateTime(null);
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.PERSONALIZED] });
  }, [queryClient, userId, defaultMaxRecommendations]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    personalizedRecommendations,
    contextualRecommendations: [],
    similarAssets: [],
    trendingAssets,
    collaborativeRecommendations: [],
    contentBasedRecommendations: [],
    usagePatterns: [],
    userProfile,
    engineConfig,
    feedbackAnalytics: null,
    isLoading,
    isTraining,
    isGenerating,
    error,
    lastUpdateTime,

    // Operations
    getPersonalizedRecommendations,
    getContextualRecommendations,
    updatePersonalizationProfile,
    getUserRecommendationProfile,
    findSimilarAssets,
    getAssetRelationships,
    getFrequentlyAccessedTogether,
    getComplementaryAssets,
    getTrendingAssets,
    getPopularAssetsByDepartment,
    getEmergingAssets,
    getSeasonalRecommendations,
    getCollaborativeRecommendations,
    getTeamRecommendations,
    getExpertRecommendations,
    getPeerRecommendations,
    getContentBasedRecommendations,
    getTagBasedRecommendations,
    getSchemaBasedRecommendations,
    getUsagePatternRecommendations,
    analyzeUserBehaviorPatterns,
    getWorkflowBasedRecommendations,
    submitRecommendationFeedback,
    getFeedbackAnalytics,
    trainRecommendationModel,
    evaluateModelPerformance,
    getRealTimeRecommendations,
    updateRealTimeContext,
    getEngineConfiguration,
    updateEngineConfiguration,
    resetUserRecommendations,
    setFilters,
    clearFilters,
    refreshRecommendations,
    resetState
  };
}