// ============================================================================
// TREND ANALYSIS SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced trend analysis and forecasting for catalog metrics and usage
// Maps to backend catalog_analytics_service.py trend analysis endpoints
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
// TREND ANALYSIS INTERFACES
// ============================================================================

export interface TrendAnalysisRequest {
  metricType: 'usage' | 'quality' | 'growth' | 'performance' | 'compliance' | 'engagement';
  entityType: 'asset' | 'user' | 'department' | 'system' | 'process';
  entityIds?: string[];
  timeRange: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  analysisType: 'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive';
  forecastPeriods?: number;
  includeSeasonality?: boolean;
  includeAnomalies?: boolean;
  confidenceLevel?: number;
  smoothingFactor?: number;
}

export interface TrendAnalysisResult {
  analysisId: string;
  request: TrendAnalysisRequest;
  summary: TrendSummary;
  dataPoints: TrendDataPoint[];
  trends: TrendPattern[];
  forecasts?: ForecastData[];
  anomalies?: AnomalyData[];
  insights: TrendInsight[];
  recommendations: TrendRecommendation[];
  statisticalTests: StatisticalTest[];
  metadata: TrendMetadata;
  createdAt: string;
  completedAt: string;
}

export interface TrendSummary {
  overallTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'cyclical';
  trendStrength: number; // 0-1
  seasonality: SeasonalityInfo;
  volatility: VolatilityInfo;
  growthRate: GrowthRateInfo;
  correlation: CorrelationInfo;
  qualityScore: number;
  reliabilityScore: number;
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  baseline?: number;
  predicted?: number;
  upperBound?: number;
  lowerBound?: number;
  confidence?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TrendPattern {
  id: string;
  type: 'linear' | 'exponential' | 'logarithmic' | 'polynomial' | 'cyclical' | 'seasonal';
  description: string;
  startDate: string;
  endDate: string;
  strength: number;
  significance: number;
  parameters: Record<string, number>;
  equation: string;
  rSquared: number;
  pValue: number;
}

export interface ForecastData {
  timestamp: string;
  value: number;
  upperBound: number;
  lowerBound: number;
  confidence: number;
  method: string;
  contributingFactors: string[];
  assumptions: string[];
  risks: string[];
}

export interface AnomalyData {
  timestamp: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'point' | 'contextual' | 'collective';
  explanation: string;
  possibleCauses: string[];
  impact: string;
  recommendations: string[];
}

export interface TrendInsight {
  id: string;
  type: 'trend' | 'pattern' | 'correlation' | 'anomaly' | 'forecast';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  relatedInsights: string[];
}

export interface TrendRecommendation {
  id: string;
  type: 'optimization' | 'investigation' | 'intervention' | 'monitoring';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  rationale: string;
  expectedOutcome: string;
  implementation: string[];
  timeframe: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  dependencies: string[];
  risks: string[];
}

export interface StatisticalTest {
  name: string;
  hypothesis: string;
  testStatistic: number;
  pValue: number;
  criticalValue: number;
  result: 'reject' | 'fail_to_reject';
  significance: number;
  interpretation: string;
}

export interface TrendMetadata {
  dataQuality: DataQualityInfo;
  methodology: MethodologyInfo;
  limitations: string[];
  assumptions: string[];
  dataSource: string[];
  processingTime: number;
  version: string;
}

export interface SeasonalityInfo {
  detected: boolean;
  period?: number;
  strength?: number;
  patterns?: SeasonalPattern[];
}

export interface SeasonalPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  strength: number;
  peaks: string[];
  troughs: string[];
}

export interface VolatilityInfo {
  level: 'low' | 'medium' | 'high' | 'extreme';
  coefficient: number;
  periods: VolatilityPeriod[];
}

export interface VolatilityPeriod {
  start: string;
  end: string;
  level: number;
  cause?: string;
}

export interface GrowthRateInfo {
  overall: number;
  compoundAnnual: number;
  periods: GrowthPeriod[];
  acceleration: number;
}

export interface GrowthPeriod {
  start: string;
  end: string;
  rate: number;
  type: 'growth' | 'decline' | 'stable';
}

export interface CorrelationInfo {
  relationships: CorrelationRelationship[];
  strongestCorrelation: number;
  leadingIndicators: string[];
  laggingIndicators: string[];
}

export interface CorrelationRelationship {
  metric: string;
  correlation: number;
  significance: number;
  lag: number;
  type: 'positive' | 'negative';
}

export interface DataQualityInfo {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  issues: string[];
}

export interface MethodologyInfo {
  algorithm: string;
  parameters: Record<string, any>;
  preprocessing: string[];
  validation: string;
  accuracy: number;
  performance: string;
}

// ============================================================================
// SPECIALIZED TREND ANALYSIS INTERFACES
// ============================================================================

export interface UsageTrendAnalysis extends TrendAnalysisResult {
  usageMetrics: {
    totalQueries: TrendDataPoint[];
    uniqueUsers: TrendDataPoint[];
    avgSessionDuration: TrendDataPoint[];
    popularAssets: PopularityTrend[];
    accessPatterns: AccessPattern[];
  };
}

export interface QualityTrendAnalysis extends TrendAnalysisResult {
  qualityMetrics: {
    overallQuality: TrendDataPoint[];
    ruleCompliance: TrendDataPoint[];
    issueResolution: TrendDataPoint[];
    qualityImprovement: TrendDataPoint[];
    criticalIssues: TrendDataPoint[];
  };
}

export interface PopularityTrend {
  assetId: string;
  assetName: string;
  trend: TrendDataPoint[];
  ranking: number;
  change: number;
}

export interface AccessPattern {
  pattern: string;
  frequency: TrendDataPoint[];
  users: string[];
  timeOfDay: number[];
  dayOfWeek: number[];
}

// ============================================================================
// TREND ANALYSIS SERVICE CLASS
// ============================================================================

export class TrendAnalysisService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Perform comprehensive trend analysis
   */
  async analyzeTrends(request: TrendAnalysisRequest): Promise<CatalogApiResponse<TrendAnalysisResult>> {
    const url = buildUrl('/api/v1/catalog/trends/analyze');
    
    const response = await axios.post<CatalogApiResponse<TrendAnalysisResult>>(url, request, {
      timeout: this.timeout * 2 // Trend analysis might take longer
    });
    
    return response.data;
  }

  /**
   * Get trend analysis by ID
   */
  async getTrendAnalysis(analysisId: string): Promise<CatalogApiResponse<TrendAnalysisResult>> {
    const url = buildUrl(`/api/v1/catalog/trends/${analysisId}`);
    
    const response = await axios.get<CatalogApiResponse<TrendAnalysisResult>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Analyze usage trends for assets
   */
  async analyzeUsageTrends(assetIds: string[], timeRange: any): Promise<CatalogApiResponse<UsageTrendAnalysis>> {
    const request: TrendAnalysisRequest = {
      metricType: 'usage',
      entityType: 'asset',
      entityIds: assetIds,
      timeRange,
      analysisType: 'predictive',
      forecastPeriods: 30,
      includeSeasonality: true,
      includeAnomalies: true
    };
    
    return this.analyzeTrends(request) as Promise<CatalogApiResponse<UsageTrendAnalysis>>;
  }

  /**
   * Analyze quality trends
   */
  async analyzeQualityTrends(timeRange: any): Promise<CatalogApiResponse<QualityTrendAnalysis>> {
    const request: TrendAnalysisRequest = {
      metricType: 'quality',
      entityType: 'system',
      timeRange,
      analysisType: 'diagnostic',
      includeSeasonality: false,
      includeAnomalies: true
    };
    
    return this.analyzeTrends(request) as Promise<CatalogApiResponse<QualityTrendAnalysis>>;
  }

  /**
   * Get trending assets
   */
  async getTrendingAssets(timeRange: any, limit: number = 10): Promise<CatalogApiResponse<PopularityTrend[]>> {
    const url = buildUrl('/api/v1/catalog/trends/assets', { 
      ...timeRange, 
      limit 
    });
    
    const response = await axios.get<CatalogApiResponse<PopularityTrend[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Detect anomalies in metrics
   */
  async detectAnomalies(metricType: string, entityId: string, timeRange: any): Promise<CatalogApiResponse<AnomalyData[]>> {
    const url = buildUrl('/api/v1/catalog/trends/anomalies');
    
    const response = await axios.post<CatalogApiResponse<AnomalyData[]>>(url, {
      metric_type: metricType,
      entity_id: entityId,
      time_range: timeRange,
      sensitivity: 'medium'
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Generate forecasts
   */
  async generateForecast(metricType: string, entityId: string, periods: number): Promise<CatalogApiResponse<ForecastData[]>> {
    const url = buildUrl('/api/v1/catalog/trends/forecast');
    
    const response = await axios.post<CatalogApiResponse<ForecastData[]>>(url, {
      metric_type: metricType,
      entity_id: entityId,
      periods,
      method: 'auto'
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Compare trends between entities
   */
  async compareTrends(entityIds: string[], metricType: string, timeRange: any): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/trends/compare');
    
    const response = await axios.post<CatalogApiResponse<any>>(url, {
      entity_ids: entityIds,
      metric_type: metricType,
      time_range: timeRange
    }, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get trend insights
   */
  async getTrendInsights(analysisId?: string): Promise<CatalogApiResponse<TrendInsight[]>> {
    const url = analysisId 
      ? buildUrl(`/api/v1/catalog/trends/${analysisId}/insights`)
      : buildUrl('/api/v1/catalog/trends/insights');
    
    const response = await axios.get<CatalogApiResponse<TrendInsight[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get trend recommendations
   */
  async getTrendRecommendations(analysisId?: string): Promise<CatalogApiResponse<TrendRecommendation[]>> {
    const url = analysisId 
      ? buildUrl(`/api/v1/catalog/trends/${analysisId}/recommendations`)
      : buildUrl('/api/v1/catalog/trends/recommendations');
    
    const response = await axios.get<CatalogApiResponse<TrendRecommendation[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Export trend analysis
   */
  async exportTrendAnalysis(analysisId: string, format: 'pdf' | 'xlsx' | 'json' = 'pdf'): Promise<CatalogApiResponse<string>> {
    const url = buildUrl(`/api/v1/catalog/trends/${analysisId}/export`);
    
    const response = await axios.post<CatalogApiResponse<string>>(url, {
      format
    }, {
      timeout: this.timeout * 2
    });
    
    return response.data;
  }

  /**
   * Create automated trend monitoring
   */
  async createTrendMonitoring(config: any): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/trends/monitoring');
    
    const response = await axios.post<CatalogApiResponse<any>>(url, config, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get historical trend data
   */
  async getHistoricalTrends(metricType: string, timeRange: any): Promise<CatalogApiResponse<TrendDataPoint[]>> {
    const url = buildUrl('/api/v1/catalog/trends/historical', {
      metric_type: metricType,
      ...timeRange
    });
    
    const response = await axios.get<CatalogApiResponse<TrendDataPoint[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Validate trend analysis request
   */
  async validateTrendRequest(request: TrendAnalysisRequest): Promise<CatalogApiResponse<any>> {
    const url = buildUrl('/api/v1/catalog/trends/validate');
    
    const response = await axios.post<CatalogApiResponse<any>>(url, request, {
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Get trend analysis templates
   */
  async getTrendTemplates(): Promise<CatalogApiResponse<any[]>> {
    const url = buildUrl('/api/v1/catalog/trends/templates');
    
    const response = await axios.get<CatalogApiResponse<any[]>>(url, {
      timeout: this.timeout
    });
    
    return response.data;
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const trendAnalysisService = new TrendAnalysisService();

// Default export
export default trendAnalysisService;