// ============================================================================
// ENTERPRISE CATALOG SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: enterprise_catalog_service.py
// Core catalog operations, asset management, and enterprise features
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  IntelligentDataAsset, 
  CatalogApiResponse,
  CatalogSearchRequest,
  SearchFilter,
  SortOption,
  PaginationRequest,
  AssetUsageMetrics,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  EnterpriseDataLineage
} from '../types';
import { 
  ENTERPRISE_CATALOG_ENDPOINTS, 
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// BASE SERVICE CONFIGURATION
// ============================================================================

class BaseApiService {
  protected baseURL: string;
  protected timeout: number;
  protected retryAttempts: number;
  protected retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    
    // Configure axios defaults
    axios.defaults.timeout = this.timeout;
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth and common headers
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Content-Type'] = 'application/json';
        config.headers['X-API-Version'] = API_CONFIG.VERSION;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  protected async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempts: number = this.retryAttempts
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempts > 1 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay);
        return this.retryRequest(requestFn, attempts - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNABORTED' ||
      (error.response?.status >= 500 && error.response?.status <= 599)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// ENTERPRISE CATALOG SERVICE INTERFACES
// ============================================================================

export interface AssetCreateRequest {
  name: string;
  displayName?: string;
  description?: string;
  assetType: string;
  dataSource: {
    id: string;
    connectionString?: string;
    location: string;
  };
  schema?: any;
  columns?: any[];
  tags?: string[];
  classifications?: string[];
  sensitivityLevel?: string;
  owner?: string;
  stewards?: string[];
  metadata?: Record<string, any>;
}

export interface AssetUpdateRequest extends Partial<AssetCreateRequest> {
  id: string;
}

export interface AssetBulkUpdateRequest {
  assetIds: string[];
  updates: Partial<AssetCreateRequest>;
  strategy: 'MERGE' | 'REPLACE' | 'SELECTIVE';
}

export interface AssetSearchResponse {
  assets: IntelligentDataAsset[];
  totalCount: number;
  facets?: any[];
  suggestions?: string[];
  relatedQueries?: string[];
  searchMetadata: {
    query: string;
    executionTime: number;
    searchType: string;
    filters: SearchFilter[];
  };
}

export interface AssetValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface ValidationWarning extends ValidationError {
  canIgnore: boolean;
  recommendation?: string;
}

export interface ValidationSuggestion {
  field: string;
  suggestion: string;
  confidence: number;
  category: string;
}

export interface EnterpriseMetrics {
  totalAssets: number;
  assetsByType: Record<string, number>;
  assetsByStatus: Record<string, number>;
  assetsBySensitivity: Record<string, number>;
  qualityDistribution: Record<string, number>;
  usageStatistics: {
    totalViews: number;
    totalDownloads: number;
    activeUsers: number;
    topAssets: Array<{ id: string; name: string; views: number }>;
  };
  recentActivities: Array<{
    type: string;
    assetId: string;
    assetName: string;
    userId: string;
    timestamp: Date;
  }>;
  systemHealth: {
    status: 'HEALTHY' | 'WARNING' | 'ERROR';
    uptime: number;
    performance: {
      averageResponseTime: number;
      successRate: number;
      errorRate: number;
    };
  };
}

// ============================================================================
// ENTERPRISE CATALOG SERVICE CLASS
// ============================================================================

export class EnterpriseCatalogService extends BaseApiService {
  
  // ============================================================================
  // ASSET MANAGEMENT OPERATIONS
  // ============================================================================

  /**
   * Retrieve paginated list of assets with filtering and sorting
   */
  async getAssets(
    page: number = 1,
    limit: number = 20,
    filters?: SearchFilter[],
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    includeMetadata: boolean = true
  ): Promise<CatalogApiResponse<AssetSearchResponse>> {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      includeMetadata,
      ...(filters && { filters: JSON.stringify(filters) })
    };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<AssetSearchResponse>>(
        buildPaginatedUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.LIST, page, limit, params)
      )
    );

    return response.data;
  }

  /**
   * Create a new data asset
   */
  async createAsset(
    assetData: AssetCreateRequest
  ): Promise<CatalogApiResponse<IntelligentDataAsset>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<IntelligentDataAsset>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.CREATE,
        assetData
      )
    );

    return response.data;
  }

  /**
   * Retrieve a specific asset by ID
   */
  async getAsset(
    id: string,
    includeLineage: boolean = false,
    includeQuality: boolean = false,
    includeUsage: boolean = false
  ): Promise<CatalogApiResponse<IntelligentDataAsset>> {
    const params = {
      includeLineage,
      includeQuality,
      includeUsage
    };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<IntelligentDataAsset>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.GET(id), params)
      )
    );

    return response.data;
  }

  /**
   * Update an existing asset
   */
  async updateAsset(
    id: string,
    updates: Partial<AssetCreateRequest>
  ): Promise<CatalogApiResponse<IntelligentDataAsset>> {
    const response = await this.retryRequest(() =>
      axios.put<CatalogApiResponse<IntelligentDataAsset>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.UPDATE(id),
        updates
      )
    );

    return response.data;
  }

  /**
   * Delete an asset
   */
  async deleteAsset(id: string): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.delete<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.DELETE(id)
      )
    );

    return response.data;
  }

  /**
   * Bulk update multiple assets
   */
  async bulkUpdateAssets(
    request: AssetBulkUpdateRequest
  ): Promise<CatalogApiResponse<{ updated: number; failed: number; errors: any[] }>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<{ updated: number; failed: number; errors: any[] }>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.BULK_UPDATE,
        request
      )
    );

    return response.data;
  }

  /**
   * Bulk delete multiple assets
   */
  async bulkDeleteAssets(
    assetIds: string[],
    force: boolean = false
  ): Promise<CatalogApiResponse<{ deleted: number; failed: number; errors: any[] }>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<{ deleted: number; failed: number; errors: any[] }>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.BULK_DELETE,
        { assetIds, force }
      )
    );

    return response.data;
  }

  /**
   * Validate asset data before creation or update
   */
  async validateAsset(
    assetData: AssetCreateRequest | AssetUpdateRequest
  ): Promise<CatalogApiResponse<AssetValidationResult>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<AssetValidationResult>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.VALIDATE,
        assetData
      )
    );

    return response.data;
  }

  // ============================================================================
  // ASSET METADATA OPERATIONS
  // ============================================================================

  /**
   * Get asset schema information
   */
  async getAssetSchema(id: string): Promise<CatalogApiResponse<any>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.SCHEMA(id)
      )
    );

    return response.data;
  }

  /**
   * Get asset columns with detailed information
   */
  async getAssetColumns(
    id: string,
    includeProfile: boolean = false,
    includeQuality: boolean = false
  ): Promise<CatalogApiResponse<any[]>> {
    const params = { includeProfile, includeQuality };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.COLUMNS(id), params)
      )
    );

    return response.data;
  }

  /**
   * Get comprehensive asset metadata
   */
  async getAssetMetadata(id: string): Promise<CatalogApiResponse<any>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.METADATA(id)
      )
    );

    return response.data;
  }

  /**
   * Get asset relationships and dependencies
   */
  async getAssetRelationships(
    id: string,
    relationshipType?: string
  ): Promise<CatalogApiResponse<any[]>> {
    const params = relationshipType ? { type: relationshipType } : {};

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.RELATIONSHIPS(id), params)
      )
    );

    return response.data;
  }

  // ============================================================================
  // ASSET CLASSIFICATION & TAGGING
  // ============================================================================

  /**
   * Get asset tags
   */
  async getAssetTags(id: string): Promise<CatalogApiResponse<string[]>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<string[]>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.TAGS(id)
      )
    );

    return response.data;
  }

  /**
   * Add tags to an asset
   */
  async addAssetTags(
    id: string,
    tags: string[]
  ): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.TAGS(id),
        { tags, action: 'ADD' }
      )
    );

    return response.data;
  }

  /**
   * Remove tags from an asset
   */
  async removeAssetTags(
    id: string,
    tags: string[]
  ): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.TAGS(id),
        { tags, action: 'REMOVE' }
      )
    );

    return response.data;
  }

  /**
   * Get asset classifications
   */
  async getAssetClassifications(id: string): Promise<CatalogApiResponse<any[]>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any[]>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.CLASSIFICATIONS(id)
      )
    );

    return response.data;
  }

  /**
   * Apply classifications to an asset
   */
  async applyAssetClassifications(
    id: string,
    classifications: any[]
  ): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.CLASSIFICATIONS(id),
        { classifications }
      )
    );

    return response.data;
  }

  // ============================================================================
  // ASSET QUALITY & USAGE
  // ============================================================================

  /**
   * Get asset quality score and assessment
   */
  async getAssetQuality(id: string): Promise<CatalogApiResponse<DataQualityAssessment>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<DataQualityAssessment>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.QUALITY_SCORE(id)
      )
    );

    return response.data;
  }

  /**
   * Get asset usage metrics and analytics
   */
  async getAssetUsage(
    id: string,
    period?: string,
    granularity?: string
  ): Promise<CatalogApiResponse<AssetUsageMetrics>> {
    const params = { period, granularity };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<AssetUsageMetrics>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.USAGE_METRICS(id), params)
      )
    );

    return response.data;
  }

  /**
   * Get asset lineage information
   */
  async getAssetLineage(
    id: string,
    direction?: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH',
    depth?: number
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const params = { direction, depth };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.LINEAGE(id), params)
      )
    );

    return response.data;
  }

  // ============================================================================
  // ASSET RECOMMENDATIONS & DISCOVERY
  // ============================================================================

  /**
   * Get asset recommendations for a user
   */
  async getAssetRecommendations(
    id: string,
    userId?: string,
    limit: number = 10
  ): Promise<CatalogApiResponse<IntelligentDataAsset[]>> {
    const params = { userId, limit };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<IntelligentDataAsset[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.RECOMMENDATIONS(id), params)
      )
    );

    return response.data;
  }

  /**
   * Find similar assets
   */
  async getSimilarAssets(
    id: string,
    similarity_threshold: number = 0.7,
    limit: number = 10
  ): Promise<CatalogApiResponse<IntelligentDataAsset[]>> {
    const params = { similarity_threshold, limit };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<IntelligentDataAsset[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.SIMILAR(id), params)
      )
    );

    return response.data;
  }

  // ============================================================================
  // USER INTERACTION OPERATIONS
  // ============================================================================

  /**
   * Add asset to user favorites
   */
  async addToFavorites(id: string, userId: string): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.FAVORITES(id),
        { userId, action: 'ADD' }
      )
    );

    return response.data;
  }

  /**
   * Remove asset from user favorites
   */
  async removeFromFavorites(id: string, userId: string): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.FAVORITES(id),
        { userId, action: 'REMOVE' }
      )
    );

    return response.data;
  }

  /**
   * Watch/subscribe to asset changes
   */
  async watchAsset(id: string, userId: string): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.WATCH(id),
        { userId, action: 'WATCH' }
      )
    );

    return response.data;
  }

  /**
   * Unwatch/unsubscribe from asset changes
   */
  async unwatchAsset(id: string, userId: string): Promise<CatalogApiResponse<void>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<void>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ASSETS.WATCH(id),
        { userId, action: 'UNWATCH' }
      )
    );

    return response.data;
  }

  // ============================================================================
  // ENTERPRISE FEATURES
  // ============================================================================

  /**
   * Get enterprise dashboard data
   */
  async getEnterpriseDashboard(): Promise<CatalogApiResponse<EnterpriseMetrics>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<EnterpriseMetrics>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ENTERPRISE.DASHBOARD
      )
    );

    return response.data;
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<CatalogApiResponse<any>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ENTERPRISE.HEALTH
      )
    );

    return response.data;
  }

  /**
   * Get enterprise metrics
   */
  async getEnterpriseMetrics(
    period?: string,
    groupBy?: string
  ): Promise<CatalogApiResponse<any>> {
    const params = { period, groupBy };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.ENTERPRISE.METRICS, params)
      )
    );

    return response.data;
  }

  /**
   * Generate enterprise reports
   */
  async generateEnterpriseReport(
    reportType: string,
    parameters: any
  ): Promise<CatalogApiResponse<any>> {
    const response = await this.retryRequest(() =>
      axios.post<CatalogApiResponse<any>>(
        ENTERPRISE_CATALOG_ENDPOINTS.ENTERPRISE.REPORTS,
        { reportType, parameters }
      )
    );

    return response.data;
  }

  // ============================================================================
  // CATALOG OVERVIEW OPERATIONS
  // ============================================================================

  /**
   * Get catalog overview and statistics
   */
  async getCatalogOverview(): Promise<CatalogApiResponse<any>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any>>(
        ENTERPRISE_CATALOG_ENDPOINTS.CATALOG.OVERVIEW
      )
    );

    return response.data;
  }

  /**
   * Get catalog statistics
   */
  async getCatalogStatistics(): Promise<CatalogApiResponse<any>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<any>>(
        ENTERPRISE_CATALOG_ENDPOINTS.CATALOG.STATISTICS
      )
    );

    return response.data;
  }

  /**
   * Get trending assets
   */
  async getTrendingAssets(
    period: string = '7d',
    limit: number = 10
  ): Promise<CatalogApiResponse<IntelligentDataAsset[]>> {
    const params = { period, limit };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<IntelligentDataAsset[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.CATALOG.TRENDING, params)
      )
    );

    return response.data;
  }

  /**
   * Get popular assets
   */
  async getPopularAssets(
    period: string = '30d',
    limit: number = 10
  ): Promise<CatalogApiResponse<IntelligentDataAsset[]>> {
    const params = { period, limit };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<IntelligentDataAsset[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.CATALOG.POPULAR, params)
      )
    );

    return response.data;
  }

  /**
   * Get featured assets
   */
  async getFeaturedAssets(): Promise<CatalogApiResponse<IntelligentDataAsset[]>> {
    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<IntelligentDataAsset[]>>(
        ENTERPRISE_CATALOG_ENDPOINTS.CATALOG.FEATURED
      )
    );

    return response.data;
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<CatalogApiResponse<IntelligentDataAsset[]>> {
    const params = { userId, limit };

    const response = await this.retryRequest(() =>
      axios.get<CatalogApiResponse<IntelligentDataAsset[]>>(
        buildUrl(ENTERPRISE_CATALOG_ENDPOINTS.CATALOG.PERSONALIZED, params)
      )
    );

    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const enterpriseCatalogService = new EnterpriseCatalogService();
export default enterpriseCatalogService;