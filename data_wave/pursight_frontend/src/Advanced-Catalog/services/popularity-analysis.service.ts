// ============================================================================
// POPULARITY ANALYSIS SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced popularity analysis and ranking for catalog assets
// Maps to backend catalog_analytics_service.py popularity analysis endpoints
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  CatalogApiResponse,
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// Import analytics service for underlying functionality
import { catalogAnalyticsService } from './catalog-analytics.service';

// ============================================================================
// POPULARITY ANALYSIS INTERFACES
// ============================================================================

export interface PopularityAnalysisRequest {
  assetIds?: string[];
  categories?: string[];
  timeRange: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
  };
  metrics: PopularityMetric[];
  weighting?: PopularityWeighting;
  includeForecasting?: boolean;
  includeSegmentation?: boolean;
  minimumInteractions?: number;
}

export interface PopularityMetric {
  type: 'views' | 'downloads' | 'queries' | 'shares' | 'bookmarks' | 'ratings' | 'comments';
  weight: number;
  enabled: boolean;
}

export interface PopularityWeighting {
  recency: number; // 0-1, how much to weight recent activity
  velocity: number; // 0-1, how much to weight growth rate
  duration: number; // 0-1, how much to weight sustained popularity
  diversity: number; // 0-1, how much to weight user diversity
}

export interface PopularityAnalysisResult {
  analysisId: string;
  request: PopularityAnalysisRequest;
  rankings: AssetPopularity[];
  trends: PopularityTrend[];
  insights: PopularityInsight[];
  segments: PopularitySegment[];
  forecasts?: PopularityForecast[];
  comparisons: PopularityComparison[];
  metadata: PopularityMetadata;
  createdAt: string;
  completedAt: string;
}

export interface AssetPopularity {
  assetId: string;
  assetName: string;
  assetType: string;
  rank: number;
  score: number;
  previousRank?: number;
  rankChange: number;
  metrics: PopularityMetrics;
  segments: string[];
  trending: boolean;
  velocity: number;
  sustainability: number;
  diversity: UserDiversity;
  timeToPopularity?: number;
  peakPopularity?: PopularityPeak;
}

export interface PopularityMetrics {
  totalViews: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  shareCount: number;
  downloadCount: number;
  bookmarkCount: number;
  ratingAverage: number;
  ratingCount: number;
  commentCount: number;
  queryCount: number;
  lastAccessed: string;
  firstAccessed: string;
}

export interface PopularityTrend {
  assetId: string;
  timeSeriesData: TrendDataPoint[];
  trendType: 'rising' | 'declining' | 'stable' | 'volatile' | 'seasonal';
  growth: GrowthMetrics;
  peaks: PopularityPeak[];
  valleys: PopularityValley[];
  seasonality?: SeasonalityPattern;
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  percentile: number;
  userCount: number;
  events: string[];
}

export interface GrowthMetrics {
  dailyGrowthRate: number;
  weeklyGrowthRate: number;
  monthlyGrowthRate: number;
  acceleration: number;
  momentum: number;
  volatility: number;
}

export interface PopularityPeak {
  timestamp: string;
  value: number;
  duration: number;
  trigger?: string;
  userSegments: string[];
  sustainabilityScore: number;
}

export interface PopularityValley {
  timestamp: string;
  value: number;
  duration: number;
  cause?: string;
  recoveryTime?: number;
}

export interface SeasonalityPattern {
  detected: boolean;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  strength: number;
  patterns: SeasonalInfo[];
}

export interface SeasonalInfo {
  type: string;
  description: string;
  occurrences: string[];
  strength: number;
}

export interface PopularityInsight {
  id: string;
  type: 'ranking_change' | 'trend_shift' | 'viral_potential' | 'decline_risk' | 'opportunity';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedAssets: string[];
  evidence: InsightEvidence[];
  confidence: number;
  recommendations: string[];
  businessImpact: 'low' | 'medium' | 'high';
}

export interface InsightEvidence {
  type: string;
  description: string;
  data: any;
  strength: number;
}

export interface PopularitySegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  assets: string[];
  characteristics: SegmentCharacteristics;
  performance: SegmentPerformance;
}

export interface SegmentCriteria {
  userDemographics?: string[];
  usagePatterns?: string[];
  assetTypes?: string[];
  departments?: string[];
  timeOfDay?: string[];
  dayOfWeek?: string[];
}

export interface SegmentCharacteristics {
  avgPopularityScore: number;
  dominantMetrics: string[];
  growthRate: number;
  volatility: number;
  sustainability: number;
  userEngagement: number;
}

export interface SegmentPerformance {
  topAssets: string[];
  risingAssets: string[];
  decliningAssets: string[];
  opportunities: string[];
}

export interface PopularityForecast {
  assetId: string;
  forecastPeriod: {
    start: string;
    end: string;
  };
  predictions: ForecastPrediction[];
  scenarios: ForecastScenario[];
  confidence: number;
  assumptions: string[];
  riskFactors: string[];
}

export interface ForecastPrediction {
  timestamp: string;
  predictedRank: number;
  predictedScore: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  contributingFactors: string[];
}

export interface ForecastScenario {
  name: string;
  description: string;
  probability: number;
  outcome: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number;
}

export interface PopularityComparison {
  type: 'peer' | 'category' | 'historical' | 'benchmark';
  description: string;
  assets: ComparisonAsset[];
  insights: string[];
  recommendations: string[];
}

export interface ComparisonAsset {
  assetId: string;
  assetName: string;
  score: number;
  rank: number;
  percentile: number;
  strengthsWeaknesses: string[];
}

export interface UserDiversity {
  uniqueUsers: number;
  departmentSpread: number;
  roleSpread: number;
  geographicSpread: number;
  diversityIndex: number;
  concentrationRisk: number;
}

export interface PopularityMetadata {
  analysisMethod: string;
  dataQuality: DataQualityInfo;
  limitations: string[];
  assumptions: string[];
  recommendations: string[];
  processingTime: number;
  version: string;
}

export interface DataQualityInfo {
  completeness: number;
  accuracy: number;
  recency: number;
  coverage: number;
  reliability: number;
  issues: string[];
}

// ============================================================================
// POPULARITY ANALYSIS SERVICE CLASS
// ============================================================================

export class PopularityAnalysisService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Perform comprehensive popularity analysis
   */
  async analyzePopularity(request: PopularityAnalysisRequest): Promise<CatalogApiResponse<PopularityAnalysisResult>> {
    const url = buildUrl('/api/v1/catalog/popularity/analyze');
    
    const response = await axios.post<CatalogApiResponse<PopularityAnalysisResult>>(url, request, {
      timeout: this.timeout * 2
    });
    
    return response.data;
  }

  /**
   * Get popularity analysis by ID
   */
  async getPopularityAnalysis(analysisId: string): Promise<CatalogApiResponse<PopularityAnalysisResult>> {
    const url = buildUrl(`/api/v1/catalog/popularity/${analysisId}`);
    
    const response = await axios.get<CatalogApiResponse<PopularityAnalysisResult>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get current popularity rankings
   */
  async getPopularityRankings(limit: number = 50, category?: string): Promise<CatalogApiResponse<AssetPopularity[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/rankings', {
      limit,
      category
    });
    
    const response = await axios.get<CatalogApiResponse<AssetPopularity[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get trending assets (rising in popularity)
   */
  async getTrendingAssets(timeRange: any, limit: number = 20): Promise<CatalogApiResponse<AssetPopularity[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/trending', {
      ...timeRange,
      limit
    });
    
    const response = await axios.get<CatalogApiResponse<AssetPopularity[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get popularity trends for specific assets
   */
  async getAssetPopularityTrends(assetIds: string[], timeRange: any): Promise<CatalogApiResponse<PopularityTrend[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/trends');
    
    const response = await axios.post<CatalogApiResponse<PopularityTrend[]>>(url, {
      asset_ids: assetIds,
      time_range: timeRange
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Compare asset popularity
   */
  async compareAssetPopularity(assetIds: string[], timeRange: any): Promise<CatalogApiResponse<PopularityComparison>> {
    const url = buildUrl('/api/v1/catalog/popularity/compare');
    
    const response = await axios.post<CatalogApiResponse<PopularityComparison>>(url, {
      asset_ids: assetIds,
      time_range: timeRange
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get popularity insights
   */
  async getPopularityInsights(analysisId?: string): Promise<CatalogApiResponse<PopularityInsight[]>> {
    const url = analysisId 
      ? buildUrl(`/api/v1/catalog/popularity/${analysisId}/insights`)
      : buildUrl('/api/v1/catalog/popularity/insights');
    
    const response = await axios.get<CatalogApiResponse<PopularityInsight[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get popularity segments
   */
  async getPopularitySegments(): Promise<CatalogApiResponse<PopularitySegment[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/segments');
    
    const response = await axios.get<CatalogApiResponse<PopularitySegment[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Forecast asset popularity
   */
  async forecastPopularity(assetIds: string[], periods: number): Promise<CatalogApiResponse<PopularityForecast[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/forecast');
    
    const response = await axios.post<CatalogApiResponse<PopularityForecast[]>>(url, {
      asset_ids: assetIds,
      periods,
      method: 'auto'
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get popularity metrics for specific assets
   */
  async getAssetPopularityMetrics(assetIds: string[], timeRange: any): Promise<CatalogApiResponse<PopularityMetrics[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/metrics');
    
    const response = await axios.post<CatalogApiResponse<PopularityMetrics[]>>(url, {
      asset_ids: assetIds,
      time_range: timeRange
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Create popularity monitoring alert
   */
  async createPopularityAlert(config: any): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/popularity/alerts');
    
    const response = await axios.post<CatalogApiResponse<any>>(url, config, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get popularity leaderboard
   */
  async getPopularityLeaderboard(category?: string, timeRange?: any): Promise<CatalogApiResponse<AssetPopularity[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/leaderboard', {
      category,
      ...timeRange
    });
    
    const response = await axios.get<CatalogApiResponse<AssetPopularity[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Analyze viral potential
   */
  async analyzeViralPotential(assetId: string): Promise<CatalogApiResponse<any>> {
    const url = buildUrl(`/api/v1/catalog/popularity/${assetId}/viral-potential`);
    
    const response = await axios.get<CatalogApiResponse<any>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get declining assets (losing popularity)
   */
  async getDecliningAssets(timeRange: any, threshold: number = 20): Promise<CatalogApiResponse<AssetPopularity[]>> {
    const url = buildUrl('/api/v1/catalog/popularity/declining', {
      ...timeRange,
      threshold
    });
    
    const response = await axios.get<CatalogApiResponse<AssetPopularity[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Export popularity analysis
   */
  async exportPopularityAnalysis(analysisId: string, format: 'pdf' | 'xlsx' | 'json' = 'pdf'): Promise<CatalogApiResponse<string>> {
    const url = buildUrl(`/api/v1/catalog/popularity/${analysisId}/export`);
    
    const response = await axios.post<CatalogApiResponse<string>>(url, {
      format
    }, {
      timeout: this.timeout * 2
    });
    
    return response.data;
  }

  /**
   * Get popularity history for an asset
   */
  async getAssetPopularityHistory(assetId: string, timeRange: any): Promise<CatalogApiResponse<PopularityTrend>> {
    const url = buildUrl(`/api/v1/catalog/popularity/${assetId}/history`, timeRange);
    
    const response = await axios.get<CatalogApiResponse<PopularityTrend>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Calculate user diversity metrics
   */
  async calculateUserDiversity(assetId: string, timeRange: any): Promise<CatalogApiResponse<UserDiversity>> {
    const url = buildUrl(`/api/v1/catalog/popularity/${assetId}/diversity`);
    
    const response = await axios.post<CatalogApiResponse<UserDiversity>>(url, {
      time_range: timeRange
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get popularity benchmarks
   */
  async getPopularityBenchmarks(category: string): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/popularity/benchmarks', { category });
    
    const response = await axios.get<CatalogApiResponse<any>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Validate popularity analysis request
   */
  async validatePopularityRequest(request: PopularityAnalysisRequest): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/popularity/validate');
    
    const response = await axios.post<CatalogApiResponse<any>>(url, request, {
      timeout: this.timeout
    });
    
    return response.data;
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const popularityAnalysisService = new PopularityAnalysisService();

// Default export
export default popularityAnalysisService;