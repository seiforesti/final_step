// ============================================================================
// RACINE MAIN MANAGER - SCAN LOGIC API SERVICE
// Integration Layer with Advanced-Scan-Logic SPA
// Maps to backend: scan_logic_routes.py + racine orchestration
// ============================================================================

import { 
  ScanEngine,
  ScanEngineType,
  ScanEngineStatus,
  ScanLogic,
  ScanExecution,
  ScanConfiguration,
  ScanSchedule,
  ScanResult,
  ScanMetrics,
  ScanHistory,
  ScanOptimization,
  ScanDiagnostics,
  ScanTemplate,
  ScanPattern,
  ScanPolicy,
  ScanCreateRequest,
  ScanUpdateRequest,
  ScanFilters,
  ScanStats,
  ScanPerformance,
  ScanAlert,
  ScanRecommendation
} from '../types/racine-core.types';

// Import existing Advanced Scan Logic services for integration
import intelligentScanningAPI from '../../Advanced-Scan-Logic/services/intelligent-scanning-apis';
import scanOrchestrationAPI from '../../Advanced-Scan-Logic/services/scan-orchestration-apis';
import scanOptimizationAPI from '../../Advanced-Scan-Logic/services/scan-optimization-apis';
import scanPerformanceAPI from '../../Advanced-Scan-Logic/services/scan-performance-apis';
import scanAnalyticsAPI from '../../Advanced-Scan-Logic/services/scan-analytics-apis';
import scanCoordinationAPI from '../../Advanced-Scan-Logic/services/scan-coordination-apis';
import scanIntelligenceAPI from '../../Advanced-Scan-Logic/services/scan-intelligence-apis';
import scanWorkflowAPI from '../../Advanced-Scan-Logic/services/scan-workflow-apis';
import advancedMonitoringAPI from '../../Advanced-Scan-Logic/services/advanced-monitoring-apis';
import distributedCachingAPI from '../../Advanced-Scan-Logic/services/distributed-caching-apis';
import streamingOrchestrationAPI from '../../Advanced-Scan-Logic/services/streaming-orchestration-apis';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const RACINE_SCAN_LOGIC_ENDPOINT = `${API_BASE_URL}/racine/scan-logic`;

/**
 * Racine Scan Logic API Service
 * Integrates with existing Advanced-Scan-Logic SPA services
 * Provides racine-level orchestration and cross-SPA integration
 */
class RacineScanLogicAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  
  // Integration with existing SPA services
  private intelligentScanningAPI: typeof intelligentScanningAPI;
  private scanOrchestrationAPI: typeof scanOrchestrationAPI;
  private scanOptimizationAPI: typeof scanOptimizationAPI;
  private scanPerformanceAPI: typeof scanPerformanceAPI;
  private scanAnalyticsAPI: typeof scanAnalyticsAPI;
  private scanCoordinationAPI: typeof scanCoordinationAPI;
  private scanIntelligenceAPI: typeof scanIntelligenceAPI;
  private scanWorkflowAPI: typeof scanWorkflowAPI;
  private advancedMonitoringAPI: typeof advancedMonitoringAPI;
  private distributedCachingAPI: typeof distributedCachingAPI;
  private streamingOrchestrationAPI: typeof streamingOrchestrationAPI;

  constructor() {
    this.baseURL = RACINE_SCAN_LOGIC_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Racine-Integration': 'true',
      'X-Client-Version': '2.0.0'
    };

    // Initialize existing SPA service integrations
    this.intelligentScanningAPI = intelligentScanningAPI;
    this.scanOrchestrationAPI = scanOrchestrationAPI;
    this.scanOptimizationAPI = scanOptimizationAPI;
    this.scanPerformanceAPI = scanPerformanceAPI;
    this.scanAnalyticsAPI = scanAnalyticsAPI;
    this.scanCoordinationAPI = scanCoordinationAPI;
    this.scanIntelligenceAPI = scanIntelligenceAPI;
    this.scanWorkflowAPI = scanWorkflowAPI;
    this.advancedMonitoringAPI = advancedMonitoringAPI;
    this.distributedCachingAPI = distributedCachingAPI;
    this.streamingOrchestrationAPI = streamingOrchestrationAPI;
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
  // CORE SCAN ENGINE OPERATIONS
  // ============================================================================

  /**
   * Get all scan engines with racine orchestration
   */
  async getAllScanEngines(filters?: ScanFilters): Promise<APIResponse<PaginatedResponse<ScanEngine>>> {
    const existingResult = await this.scanOrchestrationAPIs.getAllScanEngines(filters);
    const racineResult = await this.makeRequest<PaginatedResponse<ScanEngine>>('/engines', {
      method: 'POST',
      body: JSON.stringify({ filters, integration: 'advanced-scan-logic-spa' })
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
        message: 'Scan engines retrieved with racine orchestration'
      };
    }
    return racineResult;
  }

  /**
   * Get scan engine by ID with enhanced racine context
   */
  async getScanEngineById(id: string): Promise<APIResponse<ScanEngine>> {
    const existingResult = await this.scanOrchestrationAPIs.getScanEngineById(id);
    const racineContext = await this.makeRequest<any>(`/engines/${id}/racine-context`);
    
    if (existingResult.success) {
      return {
        success: true,
        data: {
          ...existingResult.data,
          racineContext: racineContext.data,
          crossSpaIntegration: true
        },
        message: 'Scan engine retrieved with racine enhancements'
      };
    }
    return existingResult;
  }

  /**
   * Create new scan engine with racine orchestration
   */
  async createScanEngine(request: ScanCreateRequest): Promise<APIResponse<ScanEngine>> {
    const existingResult = await this.scanOrchestrationAPIs.createScanEngine(request);
    
    if (existingResult.success) {
      await this.makeRequest('/engines/register', {
        method: 'POST',
        body: JSON.stringify({
          engineId: existingResult.data?.id,
          racineIntegration: true,
          crossSpaEnabled: true
        })
      });
    }
    return existingResult;
  }

  /**
   * Update scan engine with racine coordination
   */
  async updateScanEngine(id: string, updates: ScanUpdateRequest): Promise<APIResponse<ScanEngine>> {
    const existingResult = await this.scanOrchestrationAPIs.updateScanEngine(id, updates);
    
    if (existingResult.success) {
      await this.makeRequest(`/engines/${id}/sync`, {
        method: 'POST',
        body: JSON.stringify({ updates, timestamp: new Date().toISOString() })
      });
    }
    return existingResult;
  }

  /**
   * Delete scan engine with racine cleanup
   */
  async deleteScanEngine(id: string): Promise<APIResponse<void>> {
    await this.makeRequest(`/engines/${id}/cleanup`, { method: 'DELETE' });
    return await this.scanOrchestrationAPIs.deleteScanEngine(id);
  }

  // ============================================================================
  // SCAN EXECUTION OPERATIONS
  // ============================================================================

  /**
   * Execute scan with intelligent orchestration
   */
  async executeScan(engineId: string, configuration?: ScanConfiguration): Promise<APIResponse<ScanExecution>> {
    return await this.intelligentScanningAPIs.executeScan(engineId, configuration);
  }

  /**
   * Get scan execution status
   */
  async getScanExecution(executionId: string): Promise<APIResponse<ScanExecution>> {
    return await this.intelligentScanningAPIs.getScanExecution(executionId);
  }

  /**
   * Cancel scan execution
   */
  async cancelScanExecution(executionId: string): Promise<APIResponse<void>> {
    return await this.intelligentScanningAPIs.cancelScanExecution(executionId);
  }

  /**
   * Pause scan execution
   */
  async pauseScanExecution(executionId: string): Promise<APIResponse<ScanExecution>> {
    return await this.intelligentScanningAPIs.pauseScanExecution(executionId);
  }

  /**
   * Resume scan execution
   */
  async resumeScanExecution(executionId: string): Promise<APIResponse<ScanExecution>> {
    return await this.intelligentScanningAPIs.resumeScanExecution(executionId);
  }

  // ============================================================================
  // SCAN RESULTS OPERATIONS
  // ============================================================================

  /**
   * Get scan results
   */
  async getScanResults(executionId: string, filters?: any): Promise<APIResponse<ScanResult[]>> {
    return await this.scanAnalyticsAPIs.getScanResults(executionId, filters);
  }

  /**
   * Get scan result by ID
   */
  async getScanResultById(resultId: string): Promise<APIResponse<ScanResult>> {
    return await this.scanAnalyticsAPIs.getScanResultById(resultId);
  }

  /**
   * Export scan results
   */
  async exportScanResults(executionId: string, format: 'json' | 'csv' | 'xml'): Promise<APIResponse<Blob>> {
    return await this.scanAnalyticsAPIs.exportScanResults(executionId, format);
  }

  // ============================================================================
  // SCAN PATTERNS AND POLICIES
  // ============================================================================

  /**
   * Get scan patterns
   */
  async getScanPatterns(category?: string): Promise<APIResponse<ScanPattern[]>> {
    return await this.scanIntelligenceAPIs.getScanPatterns(category);
  }

  /**
   * Create scan pattern
   */
  async createScanPattern(pattern: Partial<ScanPattern>): Promise<APIResponse<ScanPattern>> {
    return await this.scanIntelligenceAPIs.createScanPattern(pattern);
  }

  /**
   * Update scan pattern
   */
  async updateScanPattern(id: string, updates: Partial<ScanPattern>): Promise<APIResponse<ScanPattern>> {
    return await this.scanIntelligenceAPIs.updateScanPattern(id, updates);
  }

  /**
   * Delete scan pattern
   */
  async deleteScanPattern(id: string): Promise<APIResponse<void>> {
    return await this.scanIntelligenceAPIs.deleteScanPattern(id);
  }

  /**
   * Get scan policies
   */
  async getScanPolicies(): Promise<APIResponse<ScanPolicy[]>> {
    return await this.scanIntelligenceAPIs.getScanPolicies();
  }

  /**
   * Create scan policy
   */
  async createScanPolicy(policy: Partial<ScanPolicy>): Promise<APIResponse<ScanPolicy>> {
    return await this.scanIntelligenceAPIs.createScanPolicy(policy);
  }

  /**
   * Update scan policy
   */
  async updateScanPolicy(id: string, updates: Partial<ScanPolicy>): Promise<APIResponse<ScanPolicy>> {
    return await this.scanIntelligenceAPIs.updateScanPolicy(id, updates);
  }

  /**
   * Delete scan policy
   */
  async deleteScanPolicy(id: string): Promise<APIResponse<void>> {
    return await this.scanIntelligenceAPIs.deleteScanPolicy(id);
  }

  // ============================================================================
  // SCAN TEMPLATES OPERATIONS
  // ============================================================================

  /**
   * Get scan templates
   */
  async getScanTemplates(category?: string): Promise<APIResponse<ScanTemplate[]>> {
    return await this.scanWorkflowAPIs.getScanTemplates(category);
  }

  /**
   * Get scan template by ID
   */
  async getScanTemplateById(id: string): Promise<APIResponse<ScanTemplate>> {
    return await this.scanWorkflowAPIs.getScanTemplateById(id);
  }

  /**
   * Create scan template
   */
  async createScanTemplate(template: Partial<ScanTemplate>): Promise<APIResponse<ScanTemplate>> {
    return await this.scanWorkflowAPIs.createScanTemplate(template);
  }

  /**
   * Update scan template
   */
  async updateScanTemplate(id: string, updates: Partial<ScanTemplate>): Promise<APIResponse<ScanTemplate>> {
    return await this.scanWorkflowAPIs.updateScanTemplate(id, updates);
  }

  /**
   * Delete scan template
   */
  async deleteScanTemplate(id: string): Promise<APIResponse<void>> {
    return await this.scanWorkflowAPIs.deleteScanTemplate(id);
  }

  // ============================================================================
  // SCAN SCHEDULING OPERATIONS
  // ============================================================================

  /**
   * Schedule scan
   */
  async scheduleScan(engineId: string, schedule: ScanSchedule): Promise<APIResponse<ScanSchedule>> {
    return await this.scanCoordinationAPIs.scheduleScan(engineId, schedule);
  }

  /**
   * Get scan schedules
   */
  async getScanSchedules(engineId?: string): Promise<APIResponse<ScanSchedule[]>> {
    return await this.scanCoordinationAPIs.getScanSchedules(engineId);
  }

  /**
   * Update scan schedule
   */
  async updateScanSchedule(scheduleId: string, updates: Partial<ScanSchedule>): Promise<APIResponse<ScanSchedule>> {
    return await this.scanCoordinationAPIs.updateScanSchedule(scheduleId, updates);
  }

  /**
   * Delete scan schedule
   */
  async deleteScanSchedule(scheduleId: string): Promise<APIResponse<void>> {
    return await this.scanCoordinationAPIs.deleteScanSchedule(scheduleId);
  }

  /**
   * Enable scan schedule
   */
  async enableScanSchedule(scheduleId: string): Promise<APIResponse<ScanSchedule>> {
    return await this.scanCoordinationAPIs.enableScanSchedule(scheduleId);
  }

  /**
   * Disable scan schedule
   */
  async disableScanSchedule(scheduleId: string): Promise<APIResponse<ScanSchedule>> {
    return await this.scanCoordinationAPIs.disableScanSchedule(scheduleId);
  }

  // ============================================================================
  // SCAN PERFORMANCE AND OPTIMIZATION
  // ============================================================================

  /**
   * Get scan performance metrics
   */
  async getScanPerformanceMetrics(engineId?: string, timeRange?: string): Promise<APIResponse<ScanPerformance>> {
    return await this.scanPerformanceAPIs.getScanPerformanceMetrics(engineId, timeRange);
  }

  /**
   * Get scan optimization recommendations
   */
  async getScanOptimizationRecommendations(engineId: string): Promise<APIResponse<ScanOptimization>> {
    return await this.scanOptimizationAPIs.getScanOptimizationRecommendations(engineId);
  }

  /**
   * Apply scan optimization
   */
  async applyScanOptimization(engineId: string, optimization: any): Promise<APIResponse<ScanEngine>> {
    return await this.scanOptimizationAPIs.applyScanOptimization(engineId, optimization);
  }

  /**
   * Get scan benchmarks
   */
  async getScanBenchmarks(engineId: string): Promise<APIResponse<any[]>> {
    return await this.scanPerformanceAPIs.getScanBenchmarks(engineId);
  }

  /**
   * Run performance benchmark
   */
  async runPerformanceBenchmark(engineId: string, config: any): Promise<APIResponse<any>> {
    return await this.scanPerformanceAPIs.runPerformanceBenchmark(engineId, config);
  }

  // ============================================================================
  // SCAN MONITORING AND DIAGNOSTICS
  // ============================================================================

  /**
   * Get scan diagnostics
   */
  async getScanDiagnostics(engineId: string): Promise<APIResponse<ScanDiagnostics>> {
    return await this.advancedMonitoringAPIs.getScanDiagnostics(engineId);
  }

  /**
   * Get scan health status
   */
  async getScanHealthStatus(engineId?: string): Promise<APIResponse<any>> {
    return await this.advancedMonitoringAPIs.getScanHealthStatus(engineId);
  }

  /**
   * Get scan alerts
   */
  async getScanAlerts(filters?: any): Promise<APIResponse<ScanAlert[]>> {
    return await this.advancedMonitoringAPIs.getScanAlerts(filters);
  }

  /**
   * Acknowledge scan alert
   */
  async acknowledgeScanAlert(alertId: string, acknowledgment: any): Promise<APIResponse<ScanAlert>> {
    return await this.advancedMonitoringAPIs.acknowledgeScanAlert(alertId, acknowledgment);
  }

  /**
   * Configure scan monitoring
   */
  async configureScanMonitoring(config: any): Promise<APIResponse<any>> {
    return await this.advancedMonitoringAPIs.configureScanMonitoring(config);
  }

  // ============================================================================
  // SCAN ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Get scan analytics
   */
  async getScanAnalytics(timeRange?: string, filters?: any): Promise<APIResponse<any>> {
    return await this.scanAnalyticsAPIs.getScanAnalytics(timeRange, filters);
  }

  /**
   * Get scan metrics
   */
  async getScanMetrics(engineId?: string): Promise<APIResponse<ScanMetrics>> {
    return await this.scanAnalyticsAPIs.getScanMetrics(engineId);
  }

  /**
   * Get scan history
   */
  async getScanHistory(engineId: string, limit?: number): Promise<APIResponse<ScanHistory[]>> {
    return await this.scanAnalyticsAPIs.getScanHistory(engineId, limit);
  }

  /**
   * Generate scan report
   */
  async generateScanReport(config: any): Promise<APIResponse<any>> {
    return await this.scanAnalyticsAPIs.generateScanReport(config);
  }

  /**
   * Export scan analytics
   */
  async exportScanAnalytics(format: 'json' | 'csv' | 'pdf', filters?: any): Promise<APIResponse<Blob>> {
    return await this.scanAnalyticsAPIs.exportScanAnalytics(format, filters);
  }

  // ============================================================================
  // DISTRIBUTED CACHING OPERATIONS
  // ============================================================================

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<APIResponse<any>> {
    return await this.distributedCachingAPIs.getCacheStatus();
  }

  /**
   * Clear cache
   */
  async clearCache(cacheKey?: string): Promise<APIResponse<void>> {
    return await this.distributedCachingAPIs.clearCache(cacheKey);
  }

  /**
   * Configure cache
   */
  async configureCache(config: any): Promise<APIResponse<any>> {
    return await this.distributedCachingAPIs.configureCache(config);
  }

  // ============================================================================
  // STREAMING ORCHESTRATION
  // ============================================================================

  /**
   * Start streaming scan
   */
  async startStreamingScan(config: any): Promise<APIResponse<any>> {
    return await this.streamingOrchestrationAPIs.startStreamingScan(config);
  }

  /**
   * Stop streaming scan
   */
  async stopStreamingScan(streamId: string): Promise<APIResponse<void>> {
    return await this.streamingOrchestrationAPIs.stopStreamingScan(streamId);
  }

  /**
   * Get streaming scan status
   */
  async getStreamingScanStatus(streamId: string): Promise<APIResponse<any>> {
    return await this.streamingOrchestrationAPIs.getStreamingScanStatus(streamId);
  }

  // ============================================================================
  // CROSS-SPA INTEGRATION METHODS
  // ============================================================================

  /**
   * Link scan engine to data sources
   */
  async linkToDataSources(engineId: string, dataSourceIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/engines/${engineId}/link-data-sources`, {
      method: 'POST',
      body: JSON.stringify({ dataSourceIds })
    });
  }

  /**
   * Link scan engine to compliance rules
   */
  async linkToComplianceRules(engineId: string, complianceRuleIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/engines/${engineId}/link-compliance-rules`, {
      method: 'POST',
      body: JSON.stringify({ complianceRuleIds })
    });
  }

  /**
   * Link scan engine to classifications
   */
  async linkToClassifications(engineId: string, classificationIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/engines/${engineId}/link-classifications`, {
      method: 'POST',
      body: JSON.stringify({ classificationIds })
    });
  }

  /**
   * Get cross-SPA dependencies
   */
  async getCrossSPADependencies(engineId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/engines/${engineId}/cross-spa-dependencies`);
  }

  /**
   * Get scan engine usage across SPAs
   */
  async getCrossSPAUsage(engineId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/engines/${engineId}/cross-spa-usage`);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update scan engines
   */
  async bulkUpdateScanEngines(updates: Array<{ id: string; updates: ScanUpdateRequest }>): Promise<APIResponse<ScanEngine[]>> {
    return await this.scanOrchestrationAPIs.bulkUpdateScanEngines(updates);
  }

  /**
   * Bulk delete scan engines
   */
  async bulkDeleteScanEngines(ids: string[]): Promise<APIResponse<void>> {
    await Promise.all(ids.map(id => 
      this.makeRequest(`/engines/${id}/cleanup`, { method: 'DELETE' })
    ));
    return await this.scanOrchestrationAPIs.bulkDeleteScanEngines(ids);
  }

  /**
   * Bulk execute scans
   */
  async bulkExecuteScans(executions: Array<{ engineId: string; configuration?: ScanConfiguration }>): Promise<APIResponse<ScanExecution[]>> {
    return await this.intelligentScanningAPIs.bulkExecuteScans(executions);
  }

  // ============================================================================
  // STATISTICS AND REPORTING
  // ============================================================================

  /**
   * Get scan statistics
   */
  async getScanStats(): Promise<APIResponse<ScanStats>> {
    const existingStats = await this.scanAnalyticsAPIs.getScanStats();
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

  // ============================================================================
  // HEALTH AND STATUS MONITORING
  // ============================================================================

  /**
   * Get scan logic service health
   */
  async getServiceHealth(): Promise<APIResponse<any>> {
    return await this.advancedMonitoringAPIs.getServiceHealth();
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<APIResponse<any>> {
    const existingStatus = await this.advancedMonitoringAPIs.getSystemStatus();
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
export const racineScanLogicAPI = new RacineScanLogicAPIService();

// Export class for testing and extension
export { RacineScanLogicAPIService };

// Export default
export default racineScanLogicAPI;