// ============================================================================
// RACINE MAIN MANAGER - COMPLIANCE RULE API SERVICE
// Integration Layer with Compliance-Rule SPA
// Maps to backend: compliance_rules_routes.py + racine orchestration
// ============================================================================

import { 
  ComplianceRule,
  ComplianceFramework,
  ComplianceAudit,
  ComplianceResult,
  ComplianceMetrics,
  ComplianceStatus,
  ComplianceRisk,
  ComplianceCreateRequest,
  ComplianceUpdateRequest,
  ComplianceFilters,
  ComplianceStats,
  APIResponse,
  PaginatedResponse
} from '../types/racine-core.types';

// Import existing Compliance Rule services for integration
import { ComplianceAPIs } from '../../Compliance-Rule/services/enterprise-apis';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const RACINE_COMPLIANCE_ENDPOINT = `${API_BASE_URL}/racine/compliance-rules`;

/**
 * Racine Compliance Rule API Service
 * Integrates with existing Compliance-Rule SPA services
 * Provides racine-level orchestration and cross-SPA integration
 */
class RacineComplianceRuleAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  
  // Integration with existing SPA services
  private complianceService: typeof ComplianceAPIs;

  constructor() {
    this.baseURL = RACINE_COMPLIANCE_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Racine-Integration': 'true',
      'X-Client-Version': '2.0.0'
    };

    // Initialize existing SPA service integrations
    this.complianceService = ComplianceAPIs;
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
  // CORE COMPLIANCE RULE OPERATIONS
  // ============================================================================

  /**
   * Get all compliance rules with racine orchestration
   */
  async getAllComplianceRules(filters?: ComplianceFilters): Promise<APIResponse<PaginatedResponse<ComplianceRule>>> {
    // Integrate with existing SPA service
    const existingResult = await this.complianceService.getAllComplianceRules(filters);
    
    // Add racine-level orchestration
    const racineResult = await this.makeRequest<PaginatedResponse<ComplianceRule>>('/list', {
      method: 'POST',
      body: JSON.stringify({ filters, integration: 'compliance-rule-spa' })
    });

    // Merge results for comprehensive view
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
        message: 'Compliance rules retrieved with racine orchestration'
      };
    }

    return racineResult;
  }

  /**
   * Get compliance rule by ID with enhanced racine context
   */
  async getComplianceRuleById(id: string): Promise<APIResponse<ComplianceRule>> {
    // Get from existing SPA service
    const existingResult = await this.complianceService.getComplianceRuleById(id);
    
    // Enhance with racine context
    const racineContext = await this.makeRequest<any>(`/${id}/racine-context`);
    
    if (existingResult.success) {
      return {
        success: true,
        data: {
          ...existingResult.data,
          racineContext: racineContext.data,
          crossSpaIntegration: true
        },
        message: 'Compliance rule retrieved with racine enhancements'
      };
    }

    return existingResult;
  }

  /**
   * Create new compliance rule with racine orchestration
   */
  async createComplianceRule(request: ComplianceCreateRequest): Promise<APIResponse<ComplianceRule>> {
    // Create in existing SPA
    const existingResult = await this.complianceService.createComplianceRule(request);
    
    if (existingResult.success) {
      // Register with racine orchestration
      await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          complianceRuleId: existingResult.data?.id,
          racineIntegration: true,
          crossSpaEnabled: true
        })
      });
    }

    return existingResult;
  }

  /**
   * Update compliance rule with racine coordination
   */
  async updateComplianceRule(id: string, updates: ComplianceUpdateRequest): Promise<APIResponse<ComplianceRule>> {
    // Update in existing SPA
    const existingResult = await this.complianceService.updateComplianceRule(id, updates);
    
    if (existingResult.success) {
      // Sync with racine orchestration
      await this.makeRequest(`/${id}/sync`, {
        method: 'POST',
        body: JSON.stringify({ updates, timestamp: new Date().toISOString() })
      });
    }

    return existingResult;
  }

  /**
   * Delete compliance rule with racine cleanup
   */
  async deleteComplianceRule(id: string): Promise<APIResponse<void>> {
    // Clean up racine orchestration first
    await this.makeRequest(`/${id}/cleanup`, { method: 'DELETE' });
    
    // Delete from existing SPA
    return await this.complianceService.deleteComplianceRule(id);
  }

  /**
   * Activate compliance rule
   */
  async activateComplianceRule(id: string): Promise<APIResponse<ComplianceRule>> {
    const result = await this.complianceService.activateComplianceRule(id);
    
    if (result.success) {
      // Sync activation with racine orchestration
      await this.makeRequest(`/${id}/activate`, {
        method: 'POST',
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      });
    }

    return result;
  }

  /**
   * Deactivate compliance rule
   */
  async deactivateComplianceRule(id: string): Promise<APIResponse<ComplianceRule>> {
    const result = await this.complianceService.deactivateComplianceRule(id);
    
    if (result.success) {
      // Sync deactivation with racine orchestration
      await this.makeRequest(`/${id}/deactivate`, {
        method: 'POST',
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      });
    }

    return result;
  }

  // ============================================================================
  // COMPLIANCE FRAMEWORK OPERATIONS
  // ============================================================================

  /**
   * Get all compliance frameworks
   */
  async getAllComplianceFrameworks(filters?: any): Promise<APIResponse<PaginatedResponse<ComplianceFramework>>> {
    return await this.complianceService.getAllComplianceFrameworks(filters);
  }

  /**
   * Create compliance framework
   */
  async createComplianceFramework(framework: Partial<ComplianceFramework>): Promise<APIResponse<ComplianceFramework>> {
    const result = await this.complianceService.createComplianceFramework(framework);
    
    if (result.success) {
      // Register with racine orchestration
      await this.makeRequest('/frameworks/register', {
        method: 'POST',
        body: JSON.stringify({
          frameworkId: result.data?.id,
          racineIntegration: true
        })
      });
    }

    return result;
  }

  /**
   * Update compliance framework
   */
  async updateComplianceFramework(id: string, updates: Partial<ComplianceFramework>): Promise<APIResponse<ComplianceFramework>> {
    return await this.complianceService.updateComplianceFramework(id, updates);
  }

  /**
   * Delete compliance framework
   */
  async deleteComplianceFramework(id: string): Promise<APIResponse<void>> {
    // Clean up racine orchestration first
    await this.makeRequest(`/frameworks/${id}/cleanup`, { method: 'DELETE' });
    
    return await this.complianceService.deleteComplianceFramework(id);
  }

  // ============================================================================
  // COMPLIANCE VALIDATION AND TESTING
  // ============================================================================

  /**
   * Validate compliance rule
   */
  async validateComplianceRule(rule: Partial<ComplianceRule>): Promise<APIResponse<any>> {
    return await this.complianceService.validateComplianceRule(rule);
  }

  /**
   * Test compliance rule
   */
  async testComplianceRule(rule: Partial<ComplianceRule>, testData: any): Promise<APIResponse<any>> {
    return await this.complianceService.testComplianceRule(rule, testData);
  }

  /**
   * Validate compliance framework
   */
  async validateComplianceFramework(framework: Partial<ComplianceFramework>): Promise<APIResponse<any>> {
    return await this.complianceService.validateComplianceFramework(framework);
  }

  // ============================================================================
  // COMPLIANCE EXECUTION AND AUDITING
  // ============================================================================

  /**
   * Execute compliance check
   */
  async executeComplianceCheck(ruleId: string, targetData: any): Promise<APIResponse<ComplianceResult[]>> {
    // Execute through existing SPA service
    const existingResult = await this.complianceService.executeComplianceCheck(ruleId, targetData);
    
    // Log execution in racine orchestration
    if (existingResult.success) {
      await this.makeRequest('/executions/log', {
        method: 'POST',
        body: JSON.stringify({
          executionId: Date.now().toString(),
          ruleId,
          resultCount: existingResult.data?.length || 0,
          timestamp: new Date().toISOString()
        })
      });
    }

    return existingResult;
  }

  /**
   * Run compliance audit
   */
  async runComplianceAudit(frameworkId: string, scope: any): Promise<APIResponse<ComplianceAudit>> {
    const result = await this.complianceService.runComplianceAudit(frameworkId, scope);
    
    if (result.success) {
      // Register audit with racine orchestration
      await this.makeRequest('/audits/register', {
        method: 'POST',
        body: JSON.stringify({
          auditId: result.data?.id,
          frameworkId,
          scope,
          timestamp: new Date().toISOString()
        })
      });
    }

    return result;
  }

  /**
   * Get compliance audit results
   */
  async getComplianceAuditResults(auditId: string): Promise<APIResponse<ComplianceAudit>> {
    return await this.complianceService.getComplianceAuditResults(auditId);
  }

  /**
   * Get compliance results
   */
  async getComplianceResults(filters?: any): Promise<APIResponse<PaginatedResponse<ComplianceResult>>> {
    return await this.complianceService.getComplianceResults(filters);
  }

  /**
   * Get compliance result by ID
   */
  async getComplianceResultById(id: string): Promise<APIResponse<ComplianceResult>> {
    return await this.complianceService.getComplianceResultById(id);
  }

  // ============================================================================
  // RISK ASSESSMENT AND MANAGEMENT
  // ============================================================================

  /**
   * Assess compliance risks
   */
  async assessComplianceRisks(data: any): Promise<APIResponse<ComplianceRisk[]>> {
    return await this.complianceService.assessComplianceRisks(data);
  }

  /**
   * Get risk assessment results
   */
  async getRiskAssessmentResults(assessmentId: string): Promise<APIResponse<ComplianceRisk[]>> {
    return await this.complianceService.getRiskAssessmentResults(assessmentId);
  }

  /**
   * Update risk mitigation status
   */
  async updateRiskMitigation(riskId: string, mitigationData: any): Promise<APIResponse<ComplianceRisk>> {
    return await this.complianceService.updateRiskMitigation(riskId, mitigationData);
  }

  /**
   * Get compliance risk dashboard
   */
  async getComplianceRiskDashboard(filters?: any): Promise<APIResponse<any>> {
    return await this.complianceService.getComplianceRiskDashboard(filters);
  }

  // ============================================================================
  // METRICS AND ANALYTICS
  // ============================================================================

  /**
   * Get compliance metrics
   */
  async getComplianceMetrics(timeRange?: string): Promise<APIResponse<ComplianceMetrics>> {
    const existingMetrics = await this.complianceService.getComplianceMetrics(timeRange);
    
    // Enhance with racine analytics
    const racineMetrics = await this.makeRequest<any>('/racine-metrics', {
      method: 'POST',
      body: JSON.stringify({ timeRange })
    });

    if (existingMetrics.success && racineMetrics.success) {
      return {
        success: true,
        data: {
          ...existingMetrics.data,
          racineAnalytics: racineMetrics.data,
          crossSpaMetrics: true
        },
        message: 'Enhanced metrics with racine analytics'
      };
    }

    return existingMetrics;
  }

  /**
   * Get compliance statistics
   */
  async getComplianceStats(): Promise<APIResponse<ComplianceStats>> {
    const existingStats = await this.complianceService.getComplianceStats();
    
    // Add racine orchestration stats
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
   * Get framework compliance score
   */
  async getFrameworkComplianceScore(frameworkId: string, timeRange?: string): Promise<APIResponse<any>> {
    return await this.complianceService.getFrameworkComplianceScore(frameworkId, timeRange);
  }

  /**
   * Get compliance trends
   */
  async getComplianceTrends(timeRange?: string): Promise<APIResponse<any>> {
    return await this.complianceService.getComplianceTrends(timeRange);
  }

  // ============================================================================
  // REPORTING AND DOCUMENTATION
  // ============================================================================

  /**
   * Generate compliance report
   */
  async generateComplianceReport(config: any): Promise<APIResponse<any>> {
    return await this.complianceService.generateComplianceReport(config);
  }

  /**
   * Export compliance data
   */
  async exportComplianceData(format: 'json' | 'csv' | 'pdf', filters?: any): Promise<APIResponse<Blob>> {
    return await this.complianceService.exportComplianceData(format, filters);
  }

  /**
   * Get compliance documentation
   */
  async getComplianceDocumentation(ruleId: string): Promise<APIResponse<any>> {
    return await this.complianceService.getComplianceDocumentation(ruleId);
  }

  /**
   * Update compliance documentation
   */
  async updateComplianceDocumentation(ruleId: string, documentation: any): Promise<APIResponse<any>> {
    return await this.complianceService.updateComplianceDocumentation(ruleId, documentation);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk execute compliance checks
   */
  async bulkExecuteComplianceChecks(ruleIds: string[], targetData: any): Promise<APIResponse<ComplianceResult[]>> {
    return await this.complianceService.bulkExecuteComplianceChecks(ruleIds, targetData);
  }

  /**
   * Bulk update compliance rules
   */
  async bulkUpdateComplianceRules(updates: Array<{ id: string; updates: ComplianceUpdateRequest }>): Promise<APIResponse<ComplianceRule[]>> {
    return await this.complianceService.bulkUpdateComplianceRules(updates);
  }

  /**
   * Bulk delete compliance rules
   */
  async bulkDeleteComplianceRules(ids: string[]): Promise<APIResponse<void>> {
    // Clean up racine orchestration for all rules
    await Promise.all(ids.map(id => 
      this.makeRequest(`/${id}/cleanup`, { method: 'DELETE' })
    ));
    
    return await this.complianceService.bulkDeleteComplianceRules(ids);
  }

  /**
   * Bulk activate compliance rules
   */
  async bulkActivateComplianceRules(ids: string[]): Promise<APIResponse<ComplianceRule[]>> {
    const result = await this.complianceService.bulkActivateComplianceRules(ids);
    
    if (result.success) {
      // Sync bulk activation with racine orchestration
      await this.makeRequest('/bulk-activate', {
        method: 'POST',
        body: JSON.stringify({ ruleIds: ids, timestamp: new Date().toISOString() })
      });
    }

    return result;
  }

  /**
   * Bulk deactivate compliance rules
   */
  async bulkDeactivateComplianceRules(ids: string[]): Promise<APIResponse<ComplianceRule[]>> {
    const result = await this.complianceService.bulkDeactivateComplianceRules(ids);
    
    if (result.success) {
      // Sync bulk deactivation with racine orchestration
      await this.makeRequest('/bulk-deactivate', {
        method: 'POST',
        body: JSON.stringify({ ruleIds: ids, timestamp: new Date().toISOString() })
      });
    }

    return result;
  }

  // ============================================================================
  // CROSS-SPA INTEGRATION METHODS
  // ============================================================================

  /**
   * Link compliance rule to data sources
   */
  async linkToDataSources(complianceRuleId: string, dataSourceIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${complianceRuleId}/link-data-sources`, {
      method: 'POST',
      body: JSON.stringify({ dataSourceIds })
    });
  }

  /**
   * Link compliance rule to scan rule sets
   */
  async linkToScanRuleSets(complianceRuleId: string, ruleSetIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${complianceRuleId}/link-scan-rule-sets`, {
      method: 'POST',
      body: JSON.stringify({ ruleSetIds })
    });
  }

  /**
   * Link compliance rule to classifications
   */
  async linkToClassifications(complianceRuleId: string, classificationIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${complianceRuleId}/link-classifications`, {
      method: 'POST',
      body: JSON.stringify({ classificationIds })
    });
  }

  /**
   * Get cross-SPA dependencies
   */
  async getCrossSPADependencies(complianceRuleId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/${complianceRuleId}/cross-spa-dependencies`);
  }

  /**
   * Get compliance rule usage across SPAs
   */
  async getCrossSPAUsage(complianceRuleId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/${complianceRuleId}/cross-spa-usage`);
  }

  /**
   * Get compliance impact analysis
   */
  async getComplianceImpactAnalysis(ruleId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/${ruleId}/impact-analysis`);
  }

  // ============================================================================
  // MONITORING AND ALERTING
  // ============================================================================

  /**
   * Set up compliance monitoring
   */
  async setupComplianceMonitoring(config: any): Promise<APIResponse<any>> {
    return await this.complianceService.setupComplianceMonitoring(config);
  }

  /**
   * Get compliance alerts
   */
  async getComplianceAlerts(filters?: any): Promise<APIResponse<any[]>> {
    return await this.complianceService.getComplianceAlerts(filters);
  }

  /**
   * Acknowledge compliance alert
   */
  async acknowledgeComplianceAlert(alertId: string, acknowledgment: any): Promise<APIResponse<any>> {
    return await this.complianceService.acknowledgeComplianceAlert(alertId, acknowledgment);
  }

  /**
   * Configure compliance notifications
   */
  async configureComplianceNotifications(config: any): Promise<APIResponse<any>> {
    return await this.complianceService.configureComplianceNotifications(config);
  }

  // ============================================================================
  // HEALTH AND STATUS MONITORING
  // ============================================================================

  /**
   * Get compliance service health
   */
  async getServiceHealth(): Promise<APIResponse<any>> {
    return await this.complianceService.getServiceHealth();
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<APIResponse<any>> {
    const existingStatus = await this.complianceService.getSystemStatus();
    
    // Add racine orchestration status
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

  /**
   * Get compliance engine status
   */
  async getComplianceEngineStatus(): Promise<APIResponse<any>> {
    return await this.complianceService.getComplianceEngineStatus();
  }

  // ============================================================================
  // ADVANCED ANALYTICS AND AI
  // ============================================================================

  /**
   * Get AI compliance recommendations
   */
  async getAIComplianceRecommendations(data: any): Promise<APIResponse<any[]>> {
    return await this.complianceService.getAIComplianceRecommendations(data);
  }

  /**
   * Analyze compliance patterns
   */
  async analyzeCompliancePatterns(timeRange?: string): Promise<APIResponse<any>> {
    return await this.complianceService.analyzeCompliancePatterns(timeRange);
  }

  /**
   * Predict compliance risks
   */
  async predictComplianceRisks(data: any): Promise<APIResponse<any[]>> {
    return await this.complianceService.predictComplianceRisks(data);
  }

  /**
   * Get compliance optimization suggestions
   */
  async getComplianceOptimizationSuggestions(frameworkId: string): Promise<APIResponse<any[]>> {
    return await this.complianceService.getComplianceOptimizationSuggestions(frameworkId);
  }
}

// Export singleton instance
export const racineComplianceRuleAPI = new RacineComplianceRuleAPIService();

// Export class for testing and extension
export { RacineComplianceRuleAPIService };

// Export default
export default racineComplianceRuleAPI;