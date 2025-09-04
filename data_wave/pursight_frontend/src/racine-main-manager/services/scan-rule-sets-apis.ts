// ============================================================================
// RACINE MAIN MANAGER - SCAN RULE SETS API SERVICE
// Integration Layer with Advanced-Scan-Rule-Sets SPA
// Maps to backend: enterprise_scan_rules_routes.py + racine orchestration
// ============================================================================

import { 
  ScanRuleSet, 
  ScanRule,
  RuleCategory,
  RuleComplexity,
  RuleStatus,
  RuleExecution,
  RuleValidation,
  RuleMetrics,
  RuleSchedule,
  RuleHistory,
  RuleOptimization,
  RuleTemplate,
  ScanRuleSetCreateRequest,
  ScanRuleSetUpdateRequest,
  ScanRuleSetFilters,
  ScanRuleSetStats,
  APIResponse,
  PaginatedResponse
} from '../types/racine-core.types';

// Import existing Advanced-Scan-Rule-Sets services for integration
import { scanRulesAPIService } from '../../Advanced-Scan-Rule-Sets/services/scan-rules-apis';
import { optimizationAPIService } from '../../Advanced-Scan-Rule-Sets/services/optimization-apis';
import { validationAPIService } from '../../Advanced-Scan-Rule-Sets/services/validation-apis';
import { orchestrationAPIService } from '../../Advanced-Scan-Rule-Sets/services/orchestration-apis';

// Base API configuration
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/v1';
const RACINE_SCAN_RULES_ENDPOINT = `${API_BASE_URL}/racine/scan-rule-sets`;

/**
 * Racine Scan Rule Sets API Service
 * Integrates with existing Advanced-Scan-Rule-Sets SPA services
 * Provides racine-level orchestration and cross-SPA integration
 */
class RacineScanRuleSetsAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  
  // Integration with existing SPA services
  private scanRulesService: typeof scanRulesAPIService;
  private optimizationService: typeof optimizationAPIService;
  private validationService: typeof validationAPIService;
  private orchestrationService: typeof orchestrationAPIService;

  constructor() {
    this.baseURL = RACINE_SCAN_RULES_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Racine-Integration': 'true',
      'X-Client-Version': '2.0.0'
    };

    // Initialize existing SPA service integrations
    this.scanRulesService = scanRulesAPIService;
    this.optimizationService = optimizationAPIService;
    this.validationService = validationAPIService;
    this.orchestrationService = orchestrationAPIService;
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
  // CORE SCAN RULE SET OPERATIONS
  // ============================================================================

  /**
   * Get all scan rule sets with racine orchestration
   */
  async getAllRuleSets(filters?: ScanRuleSetFilters): Promise<APIResponse<PaginatedResponse<ScanRuleSet>>> {
    // Integrate with existing SPA service
    const existingResult = await this.scanRulesService.getAllRuleSets();
    
    // Add racine-level orchestration
    const racineResult = await this.makeRequest<PaginatedResponse<ScanRuleSet>>('/list', {
      method: 'POST',
      body: JSON.stringify({ filters, integration: 'advanced-scan-rule-sets' })
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
        message: 'Rule sets retrieved with racine orchestration'
      };
    }

    return racineResult;
  }

  /**
   * Get scan rule set by ID with enhanced racine context
   */
  async getRuleSetById(id: string): Promise<APIResponse<ScanRuleSet>> {
    // Get from existing SPA service
    const existingResult = await this.scanRulesService.getRuleSetById(id);
    
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
        message: 'Rule set retrieved with racine enhancements'
      };
    }

    return existingResult;
  }

  /**
   * Create new scan rule set with racine orchestration
   */
  async createRuleSet(request: ScanRuleSetCreateRequest): Promise<APIResponse<ScanRuleSet>> {
    // Create in existing SPA
    const existingResult = await this.scanRulesService.createRuleSet(request);
    
    if (existingResult.success) {
      // Register with racine orchestration
      await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          ruleSetId: existingResult.data?.id,
          racineIntegration: true,
          crossSpaEnabled: true
        })
      });
    }

    return existingResult;
  }

  /**
   * Update scan rule set with racine coordination
   */
  async updateRuleSet(id: string, updates: ScanRuleSetUpdateRequest): Promise<APIResponse<ScanRuleSet>> {
    // Update in existing SPA
    const existingResult = await this.scanRulesService.updateRuleSet(id, updates);
    
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
   * Delete scan rule set with racine cleanup
   */
  async deleteRuleSet(id: string): Promise<APIResponse<void>> {
    // Clean up racine orchestration first
    await this.makeRequest(`/${id}/cleanup`, { method: 'DELETE' });
    
    // Delete from existing SPA
    return await this.scanRulesService.deleteRuleSet(id);
  }

  /**
   * Duplicate scan rule set with racine registration
   */
  async duplicateRuleSet(id: string, newName: string): Promise<APIResponse<ScanRuleSet>> {
    const result = await this.scanRulesService.duplicateRuleSet(id, newName);
    
    if (result.success) {
      // Register duplicate with racine
      await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          ruleSetId: result.data?.id,
          originalId: id,
          duplicated: true
        })
      });
    }

    return result;
  }

  // ============================================================================
  // RULE MANAGEMENT WITH EXISTING SPA INTEGRATION
  // ============================================================================

  /**
   * Add rule to rule set
   */
  async addRule(ruleSetId: string, rule: Partial<ScanRule>): Promise<APIResponse<ScanRule>> {
    return await this.scanRulesService.addRule(ruleSetId, rule);
  }

  /**
   * Update rule in rule set
   */
  async updateRule(ruleSetId: string, ruleId: string, updates: Partial<ScanRule>): Promise<APIResponse<ScanRule>> {
    return await this.scanRulesService.updateRule(ruleSetId, ruleId, updates);
  }

  /**
   * Delete rule from rule set
   */
  async deleteRule(ruleSetId: string, ruleId: string): Promise<APIResponse<void>> {
    return await this.scanRulesService.deleteRule(ruleSetId, ruleId);
  }

  /**
   * Reorder rules in rule set
   */
  async reorderRules(ruleSetId: string, ruleIds: string[]): Promise<APIResponse<void>> {
    return await this.scanRulesService.reorderRules(ruleSetId, ruleIds);
  }

  // ============================================================================
  // VALIDATION AND TESTING WITH EXISTING INTEGRATION
  // ============================================================================

  /**
   * Validate rule with existing validation service
   */
  async validateRule(rule: Partial<ScanRule>): Promise<APIResponse<RuleValidation>> {
    return await this.validationService.validateRule(rule);
  }

  /**
   * Test rule with sample data
   */
  async testRule(rule: Partial<ScanRule>, testData: any): Promise<APIResponse<any>> {
    return await this.validationService.testRule(rule, testData);
  }

  /**
   * Validate entire rule set
   */
  async validateRuleSet(ruleSet: Partial<ScanRuleSet>): Promise<APIResponse<RuleValidation>> {
    return await this.validationService.validateRuleSet(ruleSet);
  }

  // ============================================================================
  // EXECUTION AND ORCHESTRATION
  // ============================================================================

  /**
   * Execute rule set with orchestration service
   */
  async executeRuleSet(id: string, dataSourceId?: string): Promise<APIResponse<RuleExecution>> {
    return await this.orchestrationService.executeRuleSet(id, { dataSourceId });
  }

  /**
   * Schedule rule set execution
   */
  async scheduleRuleSet(id: string, schedule: RuleSchedule): Promise<APIResponse<RuleExecution>> {
    return await this.orchestrationService.scheduleRuleSet(id, schedule);
  }

  /**
   * Cancel rule set execution
   */
  async cancelExecution(executionId: string): Promise<APIResponse<void>> {
    return await this.orchestrationService.cancelExecution(executionId);
  }

  /**
   * Get active executions
   */
  async getActiveExecutions(): Promise<APIResponse<RuleExecution[]>> {
    return await this.orchestrationService.getActiveExecutions();
  }

  // ============================================================================
  // METRICS AND ANALYTICS
  // ============================================================================

  /**
   * Get rule set metrics
   */
  async getRuleSetMetrics(id: string, timeRange?: string): Promise<APIResponse<RuleMetrics>> {
    const existingMetrics = await this.scanRulesService.getRuleSetMetrics(id, timeRange);
    
    // Enhance with racine analytics
    const racineMetrics = await this.makeRequest<any>(`/${id}/racine-metrics`, {
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
   * Get execution history
   */
  async getExecutionHistory(id: string, limit?: number): Promise<APIResponse<RuleHistory[]>> {
    return await this.orchestrationService.getExecutionHistory(id, limit);
  }

  /**
   * Get rule set statistics
   */
  async getRuleSetStats(): Promise<APIResponse<ScanRuleSetStats>> {
    const existingStats = await this.scanRulesService.getRuleSetStats();
    
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

  // ============================================================================
  // OPTIMIZATION WITH EXISTING SERVICE
  // ============================================================================

  /**
   * Get optimization recommendations
   */
  async optimizeRuleSet(id: string): Promise<APIResponse<RuleOptimization>> {
    return await this.optimizationService.optimizeRuleSet(id);
  }

  /**
   * Apply optimization recommendations
   */
  async applyOptimization(id: string, optimization: RuleOptimization): Promise<APIResponse<ScanRuleSet>> {
    return await this.optimizationService.applyOptimization(id, optimization);
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Get rule templates
   */
  async getRuleTemplates(): Promise<APIResponse<RuleTemplate[]>> {
    return await this.scanRulesService.getRuleTemplates();
  }

  /**
   * Create rule set from template
   */
  async createFromTemplate(templateId: string, name: string): Promise<APIResponse<ScanRuleSet>> {
    const result = await this.scanRulesService.createFromTemplate(templateId, name);
    
    if (result.success) {
      // Register with racine orchestration
      await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          ruleSetId: result.data?.id,
          templateId,
          racineIntegration: true
        })
      });
    }

    return result;
  }

  /**
   * Create template from rule set
   */
  async createTemplate(ruleSetId: string, templateName: string): Promise<APIResponse<RuleTemplate>> {
    return await this.scanRulesService.createTemplate(ruleSetId, templateName);
  }

  // ============================================================================
  // IMPORT/EXPORT WITH RACINE INTEGRATION
  // ============================================================================

  /**
   * Export rule set with racine metadata
   */
  async exportRuleSet(id: string, format: 'json' | 'yaml' | 'xml'): Promise<APIResponse<Blob>> {
    return await this.scanRulesService.exportRuleSet(id, format);
  }

  /**
   * Import rule set with racine registration
   */
  async importRuleSet(file: File): Promise<APIResponse<ScanRuleSet>> {
    const result = await this.scanRulesService.importRuleSet(file);
    
    if (result.success) {
      // Register imported rule set with racine
      await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          ruleSetId: result.data?.id,
          imported: true,
          racineIntegration: true
        })
      });
    }

    return result;
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update rule sets
   */
  async bulkUpdateRuleSets(updates: Array<{ id: string; updates: ScanRuleSetUpdateRequest }>): Promise<APIResponse<ScanRuleSet[]>> {
    return await this.scanRulesService.bulkUpdateRuleSets(updates);
  }

  /**
   * Bulk delete rule sets
   */
  async bulkDeleteRuleSets(ids: string[]): Promise<APIResponse<void>> {
    // Clean up racine orchestration for all rule sets
    await Promise.all(ids.map(id => 
      this.makeRequest(`/${id}/cleanup`, { method: 'DELETE' })
    ));
    
    return await this.scanRulesService.bulkDeleteRuleSets(ids);
  }

  /**
   * Bulk execute rule sets
   */
  async bulkExecuteRuleSets(ids: string[], dataSourceId?: string): Promise<APIResponse<RuleExecution[]>> {
    return await this.orchestrationService.bulkExecuteRuleSets(ids, dataSourceId);
  }

  // ============================================================================
  // CROSS-SPA INTEGRATION METHODS
  // ============================================================================

  /**
   * Link rule set to data sources
   */
  async linkToDataSources(ruleSetId: string, dataSourceIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${ruleSetId}/link-data-sources`, {
      method: 'POST',
      body: JSON.stringify({ dataSourceIds })
    });
  }

  /**
   * Link rule set to classifications
   */
  async linkToClassifications(ruleSetId: string, classificationIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${ruleSetId}/link-classifications`, {
      method: 'POST',
      body: JSON.stringify({ classificationIds })
    });
  }

  /**
   * Link rule set to compliance rules
   */
  async linkToComplianceRules(ruleSetId: string, complianceRuleIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${ruleSetId}/link-compliance-rules`, {
      method: 'POST',
      body: JSON.stringify({ complianceRuleIds })
    });
  }

  /**
   * Get cross-SPA dependencies
   */
  async getCrossSPADependencies(ruleSetId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/${ruleSetId}/cross-spa-dependencies`);
  }

  /**
   * Get rule set usage across SPAs
   */
  async getCrossSPAUsage(ruleSetId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/${ruleSetId}/cross-spa-usage`);
  }
}

// Export singleton instance
export const racineScanRuleSetsAPI = new RacineScanRuleSetsAPIService();

// Export class for testing and extension
export { RacineScanRuleSetsAPIService };

// Export default
export default racineScanRuleSetsAPI;