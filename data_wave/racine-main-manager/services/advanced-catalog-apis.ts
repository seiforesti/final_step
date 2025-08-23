// ============================================================================
// RACINE MAIN MANAGER - ADVANCED CATALOG API SERVICE
// Integration Layer with Advanced-Catalog SPA
// Maps to backend: advanced_catalog_routes.py + racine orchestration
// ============================================================================

import { 
  CatalogAsset,
  CatalogAssetType,
  AssetStatus,
  CatalogMetadata,
  DataLineage,
  AssetProfile,
  DataQuality,
  AssetUsage,
  CatalogSearch,
  AssetDiscovery,
  SemanticSearch,
  CatalogCreateRequest,
  CatalogUpdateRequest,
  CatalogFilters,
  CatalogStats,
  APIResponse,
  PaginatedResponse
} from '../types/racine-core.types';

// Import existing Advanced Catalog services for integration
import { EnterpriseCatalogService } from '../../Advanced-Catalog/services/enterprise-catalog.service';
import { AdvancedLineageService } from '../../Advanced-Catalog/services/advanced-lineage.service';
import { CatalogQualityService } from '../../Advanced-Catalog/services/catalog-quality.service';
import { IntelligentDiscoveryService } from '../../Advanced-Catalog/services/intelligent-discovery.service';
import { SemanticSearchService } from '../../Advanced-Catalog/services/semantic-search.service';
import { CatalogAIService } from '../../Advanced-Catalog/services/catalog-ai.service';
import { DataProfilingService } from '../../Advanced-Catalog/services/data-profiling.service';
import { CatalogAnalyticsService } from '../../Advanced-Catalog/services/catalog-analytics.service';
import { CatalogRecommendationService } from '../../Advanced-Catalog/services/catalog-recommendation.service';
import { collaborationService } from '../../Advanced-Catalog/services/collaboration.service';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const RACINE_CATALOG_ENDPOINT = `${API_BASE_URL}/racine/advanced-catalog`;

/**
 * Racine Advanced Catalog API Service
 * Integrates with existing Advanced-Catalog SPA services
 * Provides racine-level orchestration and cross-SPA integration
 */
class RacineAdvancedCatalogAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  
  // Integration with existing SPA services
  private catalogService: EnterpriseCatalogService;
  private lineageService: AdvancedLineageService;
  private qualityService: CatalogQualityService;
  private discoveryService: IntelligentDiscoveryService;
  private searchService: SemanticSearchService;
  private aiService: CatalogAIService;
  private profilingService: DataProfilingService;
  private analyticsService: CatalogAnalyticsService;
  private recommendationService: CatalogRecommendationService;
  private collaborationService: CollaborationService;

  constructor() {
    this.baseURL = RACINE_CATALOG_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Racine-Integration': 'true',
      'X-Client-Version': '2.0.0'
    };

    // Initialize existing SPA service integrations
    this.catalogService = new EnterpriseCatalogService();
    this.lineageService = new AdvancedLineageService();
    this.qualityService = new CatalogQualityService();
    this.discoveryService = new IntelligentDiscoveryService();
    this.searchService = new SemanticSearchService();
    this.aiService = new CatalogAIService();
    this.profilingService = new DataProfilingService();
    this.analyticsService = new CatalogAnalyticsService();
    this.recommendationService = new CatalogRecommendationService();
    this.collaborationService = new CollaborationService();
  }

  /**
   * Make authenticated API request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: { ...this.headers, ...options.headers }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: 'Request successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  }

  // ============================================================================
  // CORE CATALOG ASSET OPERATIONS
  // ============================================================================

  /**
   * Get all catalog assets with racine orchestration
   */
  async getAllAssets(filters?: CatalogFilters): Promise<APIResponse<PaginatedResponse<CatalogAsset>>> {
    const existingResult = await this.catalogService.getAllAssets(filters);
    const racineResult = await this.makeRequest<PaginatedResponse<CatalogAsset>>('/assets', {
      method: 'POST',
      body: JSON.stringify({ filters, integration: 'advanced-catalog-spa' })
    });

    if (existingResult.success && racineResult.success) {
      return {
        success: true,
        data: {
          ...racineResult.data,
          items: [...(racineResult.data?.items || []), ...(existingResult.data?.items || [])],
          metadata: {
            ...racineResult.data?.metadata,
            racineEnhanced: true,
            existingSpaIntegration: true
          }
        },
        message: 'Assets retrieved with racine orchestration'
      };
    }
    return racineResult;
  }

  /**
   * Get catalog asset by ID with enhanced racine context
   */
  async getAssetById(id: string): Promise<APIResponse<CatalogAsset>> {
    const existingResult = await this.catalogService.getAssetById(id);
    const racineContext = await this.makeRequest<any>(`/assets/${id}/racine-context`);
    
    if (existingResult.success) {
      return {
        success: true,
        data: {
          ...existingResult.data,
          racineContext: racineContext.data,
          crossSpaIntegration: true
        },
        message: 'Asset retrieved with racine enhancements'
      };
    }
    return existingResult;
  }

  /**
   * Create new catalog asset with racine orchestration
   */
  async createAsset(request: CatalogCreateRequest): Promise<APIResponse<CatalogAsset>> {
    const existingResult = await this.catalogService.createAsset(request);
    
    if (existingResult.success) {
      await this.makeRequest('/assets/register', {
        method: 'POST',
        body: JSON.stringify({
          assetId: existingResult.data?.id,
          racineIntegration: true,
          crossSpaEnabled: true
        })
      });
    }
    return existingResult;
  }

  /**
   * Update catalog asset with racine coordination
   */
  async updateAsset(id: string, updates: CatalogUpdateRequest): Promise<APIResponse<CatalogAsset>> {
    const existingResult = await this.catalogService.updateAsset(id, updates);
    
    if (existingResult.success) {
      await this.makeRequest(`/assets/${id}/sync`, {
        method: 'POST',
        body: JSON.stringify({ updates, timestamp: new Date().toISOString() })
      });
    }
    return existingResult;
  }

  /**
   * Delete catalog asset with racine cleanup
   */
  async deleteAsset(id: string): Promise<APIResponse<void>> {
    await this.makeRequest(`/assets/${id}/cleanup`, { method: 'DELETE' });
    return await this.catalogService.deleteAsset(id);
  }

  // ============================================================================
  // ADVANCED LINEAGE OPERATIONS
  // ============================================================================

  /**
   * Get asset lineage
   */
  async getAssetLineage(assetId: string, depth?: number): Promise<APIResponse<DataLineage>> {
    return await this.lineageService.getAssetLineage(assetId, depth);
  }

  /**
   * Get lineage graph
   */
  async getLineageGraph(assetId: string, options?: any): Promise<APIResponse<any>> {
    return await this.lineageService.getLineageGraph(assetId, options);
  }

  /**
   * Get impact analysis
   */
  async getImpactAnalysis(assetId: string): Promise<APIResponse<any>> {
    return await this.lineageService.getImpactAnalysis(assetId);
  }

  /**
   * Update lineage relationships
   */
  async updateLineage(assetId: string, lineageData: any): Promise<APIResponse<DataLineage>> {
    return await this.lineageService.updateLineage(assetId, lineageData);
  }

  // ============================================================================
  // DATA QUALITY OPERATIONS
  // ============================================================================

  /**
   * Get asset quality profile
   */
  async getAssetQuality(assetId: string): Promise<APIResponse<DataQuality>> {
    return await this.qualityService.getAssetQuality(assetId);
  }

  /**
   * Run quality assessment
   */
  async runQualityAssessment(assetId: string, rules?: string[]): Promise<APIResponse<DataQuality>> {
    return await this.qualityService.runQualityAssessment(assetId, rules);
  }

  /**
   * Get quality rules
   */
  async getQualityRules(): Promise<APIResponse<any[]>> {
    return await this.qualityService.getQualityRules();
  }

  /**
   * Create quality rule
   */
  async createQualityRule(rule: any): Promise<APIResponse<any>> {
    return await this.qualityService.createQualityRule(rule);
  }

  // ============================================================================
  // DATA PROFILING OPERATIONS
  // ============================================================================

  /**
   * Get asset profile
   */
  async getAssetProfile(assetId: string): Promise<APIResponse<AssetProfile>> {
    return await this.profilingService.getAssetProfile(assetId);
  }

  /**
   * Run data profiling
   */
  async runDataProfiling(assetId: string, options?: any): Promise<APIResponse<AssetProfile>> {
    return await this.profilingService.runDataProfiling(assetId, options);
  }

  /**
   * Get column profile
   */
  async getColumnProfile(assetId: string, columnName: string): Promise<APIResponse<any>> {
    return await this.profilingService.getColumnProfile(assetId, columnName);
  }

  // ============================================================================
  // INTELLIGENT DISCOVERY OPERATIONS
  // ============================================================================

  /**
   * Discover assets
   */
  async discoverAssets(sources?: string[]): Promise<APIResponse<AssetDiscovery>> {
    return await this.discoveryService.discoverAssets(sources);
  }

  /**
   * Get discovery recommendations
   */
  async getDiscoveryRecommendations(assetId?: string): Promise<APIResponse<any[]>> {
    return await this.discoveryService.getDiscoveryRecommendations(assetId);
  }

  /**
   * Auto-classify assets
   */
  async autoClassifyAssets(assetIds: string[]): Promise<APIResponse<any[]>> {
    return await this.discoveryService.autoClassifyAssets(assetIds);
  }

  // ============================================================================
  // SEMANTIC SEARCH OPERATIONS
  // ============================================================================

  /**
   * Perform semantic search
   */
  async semanticSearch(query: string, options?: any): Promise<APIResponse<SemanticSearch>> {
    return await this.searchService.semanticSearch(query, options);
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<APIResponse<string[]>> {
    return await this.searchService.getSearchSuggestions(query);
  }

  /**
   * Search assets
   */
  async searchAssets(searchQuery: CatalogSearch): Promise<APIResponse<any>> {
    return await this.searchService.searchAssets(searchQuery);
  }

  // ============================================================================
  // AI-POWERED OPERATIONS
  // ============================================================================

  /**
   * Get AI recommendations
   */
  async getAIRecommendations(assetId: string, type?: string): Promise<APIResponse<any[]>> {
    return await this.aiService.getAIRecommendations(assetId, type);
  }

  /**
   * Generate asset description
   */
  async generateAssetDescription(assetId: string): Promise<APIResponse<string>> {
    return await this.aiService.generateAssetDescription(assetId);
  }

  /**
   * Suggest tags
   */
  async suggestTags(assetId: string): Promise<APIResponse<string[]>> {
    return await this.aiService.suggestTags(assetId);
  }

  /**
   * Find similar assets
   */
  async findSimilarAssets(assetId: string, limit?: number): Promise<APIResponse<CatalogAsset[]>> {
    return await this.aiService.findSimilarAssets(assetId, limit);
  }

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  /**
   * Get catalog analytics
   */
  async getCatalogAnalytics(timeRange?: string): Promise<APIResponse<any>> {
    return await this.analyticsService.getCatalogAnalytics(timeRange);
  }

  /**
   * Get asset usage analytics
   */
  async getAssetUsageAnalytics(assetId: string, timeRange?: string): Promise<APIResponse<AssetUsage>> {
    return await this.analyticsService.getAssetUsageAnalytics(assetId, timeRange);
  }

  /**
   * Get popular assets
   */
  async getPopularAssets(limit?: number, timeRange?: string): Promise<APIResponse<CatalogAsset[]>> {
    return await this.analyticsService.getPopularAssets(limit, timeRange);
  }

  // ============================================================================
  // COLLABORATION OPERATIONS
  // ============================================================================

  /**
   * Get asset comments
   */
  async getAssetComments(assetId: string): Promise<APIResponse<any[]>> {
    return await this.collaborationService.getAssetComments(assetId);
  }

  /**
   * Add asset comment
   */
  async addAssetComment(assetId: string, comment: string): Promise<APIResponse<any>> {
    return await this.collaborationService.addAssetComment(assetId, comment);
  }

  /**
   * Get asset ratings
   */
  async getAssetRatings(assetId: string): Promise<APIResponse<any>> {
    return await this.collaborationService.getAssetRatings(assetId);
  }

  /**
   * Rate asset
   */
  async rateAsset(assetId: string, rating: number, review?: string): Promise<APIResponse<any>> {
    return await this.collaborationService.rateAsset(assetId, rating, review);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update assets
   */
  async bulkUpdateAssets(updates: Array<{ id: string; updates: CatalogUpdateRequest }>): Promise<APIResponse<CatalogAsset[]>> {
    return await this.catalogService.bulkUpdateAssets(updates);
  }

  /**
   * Bulk delete assets
   */
  async bulkDeleteAssets(ids: string[]): Promise<APIResponse<void>> {
    await Promise.all(ids.map(id => 
      this.makeRequest(`/assets/${id}/cleanup`, { method: 'DELETE' })
    ));
    return await this.catalogService.bulkDeleteAssets(ids);
  }

  /**
   * Bulk tag assets
   */
  async bulkTagAssets(assetIds: string[], tags: any[]): Promise<APIResponse<void>> {
    return await this.catalogService.bulkTagAssets(assetIds, tags);
  }

  // ============================================================================
  // CROSS-SPA INTEGRATION METHODS
  // ============================================================================

  /**
   * Link asset to data sources
   */
  async linkToDataSources(assetId: string, dataSourceIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/assets/${assetId}/link-data-sources`, {
      method: 'POST',
      body: JSON.stringify({ dataSourceIds })
    });
  }

  /**
   * Link asset to classifications
   */
  async linkToClassifications(assetId: string, classificationIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/assets/${assetId}/link-classifications`, {
      method: 'POST',
      body: JSON.stringify({ classificationIds })
    });
  }

  /**
   * Link asset to compliance rules
   */
  async linkToComplianceRules(assetId: string, complianceRuleIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/assets/${assetId}/link-compliance-rules`, {
      method: 'POST',
      body: JSON.stringify({ complianceRuleIds })
    });
  }

  /**
   * Get cross-SPA dependencies
   */
  async getCrossSPADependencies(assetId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/assets/${assetId}/cross-spa-dependencies`);
  }

  /**
   * Get asset usage across SPAs
   */
  async getCrossSPAUsage(assetId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/assets/${assetId}/cross-spa-usage`);
  }

  // ============================================================================
  // STATISTICS AND REPORTING
  // ============================================================================

  /**
   * Get catalog statistics
   */
  async getCatalogStats(): Promise<APIResponse<CatalogStats>> {
    const existingStats = await this.catalogService.getCatalogStats();
    const racineStats = await this.makeRequest<any>('/racine-stats');
    
    if (existingStats.success && racineStats.success) {
      return {
        success: true,
        data: {
          ...existingStats.data,
          racineOrchestration: racineStats.data,
          crossSpaEnabled: true
        },
        message: 'Statistics with racine orchestration'
      };
    }
    return existingStats;
  }

  /**
   * Generate catalog report
   */
  async generateCatalogReport(config: any): Promise<APIResponse<any>> {
    return await this.catalogService.generateCatalogReport(config);
  }

  /**
   * Export catalog data
   */
  async exportCatalogData(format: 'json' | 'csv' | 'excel', filters?: CatalogFilters): Promise<APIResponse<Blob>> {
    return await this.catalogService.exportCatalogData(format, filters);
  }

  // ============================================================================
  // HEALTH AND STATUS MONITORING
  // ============================================================================

  /**
   * Get catalog service health
   */
  async getServiceHealth(): Promise<APIResponse<any>> {
    return await this.catalogService.getServiceHealth();
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<APIResponse<any>> {
    const existingStatus = await this.catalogService.getSystemStatus();
    const racineStatus = await this.makeRequest<any>('/system-status');
    
    if (existingStatus.success && racineStatus.success) {
      return {
        success: true,
        data: {
          ...existingStatus.data,
          racineOrchestration: racineStatus.data,
          integrated: true
        },
        message: 'System status with racine integration'
      };
    }
    return existingStatus;
  }
}

// Export singleton instance
export const racineAdvancedCatalogAPI = new RacineAdvancedCatalogAPIService();

// Export class for testing and extension
export { RacineAdvancedCatalogAPIService };

// Export default
export default racineAdvancedCatalogAPI;