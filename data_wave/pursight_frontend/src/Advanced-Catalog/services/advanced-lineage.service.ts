// ============================================================================
// ADVANCED LINEAGE SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: advanced_lineage_service.py
// Column-level lineage tracking and advanced lineage management
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { cn } from '@/lib copie/utils';
import { toast } from 'sonner';
import { 
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageVisualizationConfig,
  LineageMetrics,
  LineageImpactAnalysis,
  LineageQuery,
  CatalogApiResponse,
  PaginationRequest,
  LineageVisualization,
  LineageAnalysisResult,
  LineageRiskAssessment,
  LineageCostAnalysis,
  LineageBusinessImpact,
  LineageROIMetrics,
  LineageEfficiencyMetrics,
  LineageUsageStatistics,
  LineageHealthMetrics,
  LineageReliabilityMetrics,
  LineageAvailabilityMetrics,
  LineageScalabilityMetrics,
  LineagePerformanceMetrics,
  LineageQualityContext,
  LineageSecurityContext,
  LineageComplianceContext,
  LineageOperationalContext,
  LineageBusinessContext,
  LineageDataContext,
  LineageTechnicalContext,
  LineageGovernanceContext,
  LineageMetadata,
  LineageValidationResult,
  LineageOptimizationSuggestion,
  LineageComplianceStatus,
  LineageSecurityClassification,
  TimeRange
} from '../types';
import { 
  ADVANCED_LINEAGE_ENDPOINTS, 
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// REQUEST TYPES FOR ADVANCED LINEAGE OPERATIONS
// ============================================================================

export interface ImpactAnalysisRequest {
  assetIds: string[];
  analysisType: 'IMPACT' | 'DEPENDENCY' | 'CHANGE' | 'RISK';
  includeMetrics?: boolean;
  timeRange?: TimeRange;
  depth?: number;
  includeDownstream?: boolean;
  includeUpstream?: boolean;
  includeCrossDomain?: boolean;
  changeType?: 'schema_change' | 'data_change' | 'process_change' | 'system_change';
  changeDetails?: Record<string, any>;
}

export interface RiskAssessmentRequest {
  assetIds: string[];
  riskFactors?: string[];
  assessmentType?: 'OPERATIONAL' | 'SECURITY' | 'COMPLIANCE' | 'BUSINESS';
  timeHorizon?: number; // days
  includeHistoricalData?: boolean;
  mitigationStrategy?: 'PROACTIVE' | 'REACTIVE' | 'PREVENTIVE';
}

export interface CostAnalysisRequest {
  assetIds: string[];
  analysisScope: 'DIRECT' | 'INDIRECT' | 'COMPREHENSIVE';
  currency?: string;
  timeHorizon?: number; // months
  includeOpportunityCost?: boolean;
  includeRiskCost?: boolean;
  costCategories?: string[];
}

export interface BusinessImpactRequest {
  assetIds: string[];
  businessProcesses?: string[];
  stakeholders?: string[];
  impactCategories?: string[];
  severityThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timeframe?: TimeRange;
}

export interface ROICalculationRequest {
  assetIds: string[];
  investmentAmount?: number;
  currency?: string;
  timeHorizon?: number; // months
  discountRate?: number;
  benefitCategories?: string[];
  costCategories?: string[];
}

// ============================================================================
// LINEAGE REQUEST INTERFACES
// ============================================================================

export interface CreateLineageRequest {
  sourceAssetId: string;
  targetAssetId: string;
  lineageType: 'COLUMN' | 'TABLE' | 'SCHEMA' | 'DATABASE';
  transformationLogic?: string;
  metadata?: Record<string, any>;
  columnMappings?: ColumnMapping[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  transformationType: 'DIRECT' | 'CALCULATED' | 'AGGREGATED' | 'DERIVED';
  transformationFunction?: string;
  confidence: number;
}

export interface LineageTrackingRequest {
  assetId: string;
  direction: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH';
  depth: number;
  includeColumns: boolean;
  includeTransformations: boolean;
  filterTypes?: string[];
}

export interface LineageAnalysisRequest {
  assetIds: string[];
  analysisType: 'IMPACT' | 'DEPENDENCY' | 'COVERAGE' | 'QUALITY';
  timeRange?: {
    start: Date;
    end: Date;
  };
  includeMetrics: boolean;
}

export interface LineageVisualizationRequest {
  assetId: string;
  config: LineageVisualizationConfig;
  direction: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH';
  maxDepth: number;
  includeLabels: boolean;
  layoutType: 'HIERARCHICAL' | 'FORCE_DIRECTED' | 'CIRCULAR' | 'TREE';
}

export interface LineageSearchRequest {
  query: string;
  searchType: 'ASSET_NAME' | 'COLUMN_NAME' | 'TRANSFORMATION' | 'METADATA';
  filters?: {
    assetTypes?: string[];
    lineageTypes?: string[];
    confidenceThreshold?: number;
  };
  pagination: PaginationRequest;
}

export interface BulkLineageUpdateRequest {
  lineageUpdates: LineageUpdate[];
  updateMode: 'INCREMENTAL' | 'REPLACE' | 'MERGE';
  validateBeforeUpdate: boolean;
}

export interface LineageUpdate {
  id?: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  lineageData: Partial<EnterpriseDataLineage>;
}

// ============================================================================
// ADVANCED LINEAGE SERVICE CLASS
// ============================================================================

export class AdvancedLineageService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // ============================================================================
  // LINEAGE MANAGEMENT
  // ============================================================================

  /**
   * Create new lineage relationship
   */
  async createLineage(request: CreateLineageRequest): Promise<CatalogApiResponse<EnterpriseDataLineage>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.CREATE_LINEAGE),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage by ID
   */
  async getLineage(lineageId: string): Promise<CatalogApiResponse<EnterpriseDataLineage>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_LINEAGE, { lineageId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update lineage relationship
   */
  async updateLineage(
    lineageId: string, 
    updates: Partial<EnterpriseDataLineage>
  ): Promise<CatalogApiResponse<EnterpriseDataLineage>> {
    const response = await axios.put<CatalogApiResponse<EnterpriseDataLineage>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.UPDATE_LINEAGE, { lineageId }),
      updates,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Delete lineage relationship
   */
  async deleteLineage(lineageId: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.DELETE_LINEAGE, { lineageId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Bulk update lineage relationships
   */
  async bulkUpdateLineage(request: BulkLineageUpdateRequest): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.BULK_UPDATE),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE TRACKING & DISCOVERY
  // ============================================================================

  /**
   * Track lineage for an asset
   */
  async trackLineage(request: LineageTrackingRequest): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.TRACK_LINEAGE),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Get upstream lineage
   */
  async getUpstreamLineage(
    assetId: string, 
    depth: number = 5,
    includeColumns: boolean = true
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_UPSTREAM, { assetId }),
      { 
        params: { depth, includeColumns },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get downstream lineage
   */
  async getDownstreamLineage(
    assetId: string, 
    depth: number = 5,
    includeColumns: boolean = true
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_DOWNSTREAM, { assetId }),
      { 
        params: { depth, includeColumns },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get column-level lineage
   */
  async getColumnLineage(
    assetId: string, 
    columnName: string
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_COLUMN_LINEAGE, { assetId, columnName }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Discover automatic lineage
   */
  async discoverLineage(
    assetId: string,
    discoveryType: 'SQL_PARSING' | 'METADATA_ANALYSIS' | 'EXECUTION_LOGS' | 'ALL'
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.DISCOVER_LINEAGE, { assetId }),
      { discoveryType },
      { timeout: this.timeout * 3 }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE VISUALIZATION
  // ============================================================================

  /**
   * Generate lineage visualization
   */
  async generateLineageVisualization(request: LineageVisualizationRequest): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GENERATE_VISUALIZATION),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Get lineage graph data
   */
  async getLineageGraph(
    assetId: string,
    config: LineageVisualizationConfig
  ): Promise<CatalogApiResponse<{ nodes: DataLineageNode[]; edges: DataLineageEdge[] }>> {
    const response = await axios.post<CatalogApiResponse<{ nodes: DataLineageNode[]; edges: DataLineageEdge[] }>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_GRAPH, { assetId }),
      config,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update visualization configuration
   */
  async updateVisualizationConfig(
    assetId: string,
    config: LineageVisualizationConfig
  ): Promise<CatalogApiResponse<LineageVisualizationConfig>> {
    const response = await axios.put<CatalogApiResponse<LineageVisualizationConfig>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.UPDATE_VIZ_CONFIG, { assetId }),
      config,
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // IMPACT ANALYSIS
  // ============================================================================

  /**
   * Perform impact analysis
   */
  async performImpactAnalysis(request: LineageAnalysisRequest): Promise<CatalogApiResponse<LineageImpactAnalysis>> {
    const response = await axios.post<CatalogApiResponse<LineageImpactAnalysis>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.IMPACT_ANALYSIS),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Get change impact analysis
   */
  async getChangeImpactAnalysis(
    assetId: string,
    changeType: 'SCHEMA_CHANGE' | 'DATA_CHANGE' | 'LOGIC_CHANGE' | 'DELETION'
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.CHANGE_IMPACT, { assetId }),
      { changeType },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get dependency analysis
   */
  async getDependencyAnalysis(assetId: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.DEPENDENCY_ANALYSIS, { assetId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage coverage analysis
   */
  async getLineageCoverageAnalysis(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.COVERAGE_ANALYSIS),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE SEARCH & QUERY
  // ============================================================================

  /**
   * Search lineage relationships
   */
  async searchLineage(request: LineageSearchRequest): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.SEARCH_LINEAGE),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Execute lineage query
   */
  async executeLineageQuery(query: LineageQuery): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.EXECUTE_QUERY),
      query,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage path between assets
   */
  async getLineagePath(
    sourceAssetId: string,
    targetAssetId: string
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_PATH),
      { 
        params: { sourceAssetId, targetAssetId },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE METRICS & ANALYTICS
  // ============================================================================

  /**
   * Get lineage metrics
   */
  async getLineageMetrics(assetId?: string): Promise<CatalogApiResponse<LineageMetrics>> {
    const response = await axios.get<CatalogApiResponse<LineageMetrics>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_METRICS),
      { 
        params: assetId ? { assetId } : {},
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get lineage quality metrics
   */
  async getLineageQualityMetrics(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.QUALITY_METRICS),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage statistics
   */
  async getLineageStatistics(
    timeRange?: { start: Date; end: Date }
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_STATISTICS),
      { 
        params: timeRange,
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE VALIDATION & GOVERNANCE
  // ============================================================================

  /**
   * Validate lineage consistency
   */
  async validateLineageConsistency(assetId?: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.VALIDATE_CONSISTENCY),
      { assetId },
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Validate lineage completeness
   */
  async validateLineageCompleteness(assetId: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.VALIDATE_COMPLETENESS, { assetId }),
      {},
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage governance policies
   */
  async getLineageGovernancePolicies(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GOVERNANCE_POLICIES),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE EXPORT & REPORTING
  // ============================================================================

  /**
   * Export lineage data
   */
  async exportLineageData(
    assetId: string,
    format: 'JSON' | 'CSV' | 'GRAPHML' | 'DOT',
    includeColumns: boolean = true
  ): Promise<Blob> {
    const response = await axios.get(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.EXPORT_LINEAGE, { assetId }),
      { 
        params: { format, includeColumns },
        responseType: 'blob',
        timeout: this.timeout * 2
      }
    );
    return response.data;
  }

  /**
   * Generate lineage report
   */
  async generateLineageReport(
    assetId: string,
    reportType: 'SUMMARY' | 'DETAILED' | 'IMPACT' | 'COMPLIANCE'
  ): Promise<CatalogApiResponse<string>> {
    const response = await axios.post<CatalogApiResponse<string>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GENERATE_REPORT, { assetId }),
      { reportType },
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Schedule lineage tracking job
   */
  async scheduleLineageTracking(
    assetId: string,
    schedule: {
      frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
      cronExpression?: string;
    }
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.SCHEDULE_TRACKING, { assetId }),
      schedule,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get change requests for impact analysis
   */
  async getChangeRequests(): Promise<any[]> {
    try {
      const response = await axios.get<CatalogApiResponse<any[]>>(
        buildUrl(this.baseURL, '/change-requests'),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch change requests:', error);
      return [];
    }
  }

  /**
   * Get predictive models for impact analysis
   */
  async getPredictiveModels(): Promise<any[]> {
    try {
      const response = await axios.get<CatalogApiResponse<any[]>>(
        buildUrl(this.baseURL, '/predictive-models'),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch predictive models:', error);
      return [];
    }
  }

  /**
   * Get lineage by ID
   */
  async getLineageById(lineageId: string): Promise<any> {
    try {
      const response = await axios.get<CatalogApiResponse<any>>(
        buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_LINEAGE, { assetId: lineageId }),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch lineage by ID:', error);
      return null;
    }
  }

  /**
   * Validate lineage
   */
  async validateLineage(lineageId: string): Promise<any> {
    try {
      const response = await axios.post<CatalogApiResponse<any>>(
        buildUrl(this.baseURL, `/lineage/${lineageId}/validate`),
        {},
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to validate lineage:', error);
      throw error;
    }
  }

  /**
   * Assess lineage risks
   */
  async assessLineageRisk(request: RiskAssessmentRequest): Promise<LineageRiskAssessment> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageRiskAssessment>>(
        buildUrl(this.baseURL, '/lineage/risk-assessment'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to assess lineage risk:', error);
      throw error;
    }
  }

  /**
   * Analyze lineage costs
   */
  async analyzeLineageCost(request: CostAnalysisRequest): Promise<LineageCostAnalysis> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageCostAnalysis>>(
        buildUrl(this.baseURL, '/lineage/cost-analysis'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to analyze lineage cost:', error);
      throw error;
    }
  }

  /**
   * Generate business impact assessment
   */
  async generateBusinessImpact(request: BusinessImpactRequest): Promise<LineageBusinessImpact> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageBusinessImpact>>(
        buildUrl(this.baseURL, '/lineage/business-impact'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to generate business impact assessment:', error);
      throw error;
    }
  }

  /**
   * Calculate ROI metrics for lineage changes
   */
  async calculateROIMetrics(request: ROICalculationRequest): Promise<LineageROIMetrics> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageROIMetrics>>(
        buildUrl(this.baseURL, '/lineage/roi-metrics'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to calculate ROI metrics:', error);
      throw error;
    }
  }

  /**
   * Get efficiency metrics
   */
  async getEfficiencyMetrics(assetId: string, timeRange?: TimeRange): Promise<LineageEfficiencyMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageEfficiencyMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/efficiency-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get efficiency metrics:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStatistics(assetId: string, timeRange?: TimeRange): Promise<LineageUsageStatistics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageUsageStatistics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/usage-statistics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get usage statistics:', error);
      throw error;
    }
  }

  /**
   * Get health metrics
   */
  async getHealthMetrics(assetId: string): Promise<LineageHealthMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageHealthMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/health-metrics`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get health metrics:', error);
      throw error;
    }
  }

  /**
   * Get reliability metrics
   */
  async getReliabilityMetrics(assetId: string, timeRange?: TimeRange): Promise<LineageReliabilityMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageReliabilityMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/reliability-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get reliability metrics:', error);
      throw error;
    }
  }

  /**
   * Get availability metrics
   */
  async getAvailabilityMetrics(assetId: string, timeRange?: TimeRange): Promise<LineageAvailabilityMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageAvailabilityMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/availability-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get availability metrics:', error);
      throw error;
    }
  }

  /**
   * Get scalability metrics
   */
  async getScalabilityMetrics(assetId: string): Promise<LineageScalabilityMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageScalabilityMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/scalability-metrics`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get scalability metrics:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(assetId: string, timeRange?: TimeRange): Promise<LineagePerformanceMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineagePerformanceMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/performance-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get quality context
   */
  async getQualityContext(assetId: string): Promise<LineageQualityContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageQualityContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/quality-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get quality context:', error);
      throw error;
    }
  }

  /**
   * Get security context
   */
  async getSecurityContext(assetId: string): Promise<LineageSecurityContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageSecurityContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/security-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get security context:', error);
      throw error;
    }
  }

  /**
   * Get compliance context
   */
  async getComplianceContext(assetId: string): Promise<LineageComplianceContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageComplianceContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/compliance-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get compliance context:', error);
      throw error;
    }
  }

  /**
   * Get operational context
   */
  async getOperationalContext(assetId: string): Promise<LineageOperationalContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageOperationalContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/operational-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get operational context:', error);
      throw error;
    }
  }

  /**
   * Get business context
   */
  async getBusinessContext(assetId: string): Promise<LineageBusinessContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageBusinessContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/business-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get business context:', error);
      throw error;
    }
  }

  /**
   * Get data context
   */
  async getDataContext(assetId: string): Promise<LineageDataContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageDataContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/data-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get data context:', error);
      throw error;
    }
  }

  /**
   * Get technical context
   */
  async getTechnicalContext(assetId: string): Promise<LineageTechnicalContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageTechnicalContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/technical-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get technical context:', error);
      throw error;
    }
  }

  /**
   * Get governance context
   */
  async getGovernanceContext(assetId: string): Promise<LineageGovernanceContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageGovernanceContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/governance-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get governance context:', error);
      throw error;
    }
  }

  /**
   * Get optimization suggestions
   */
  async getOptimizationSuggestions(assetId: string): Promise<LineageOptimizationSuggestion[]> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageOptimizationSuggestion[]>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/optimization-suggestions`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get optimization suggestions:', error);
      return [];
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(assetId: string): Promise<LineageComplianceStatus> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageComplianceStatus>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/compliance-status`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get compliance status:', error);
      throw error;
    }
  }

  /**
   * Get security classification
   */
  async getSecurityClassification(assetId: string): Promise<LineageSecurityClassification> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageSecurityClassification>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/security-classification`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get security classification:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const advancedLineageService = new AdvancedLineageService();
export default advancedLineageService;