// ============================================================================
// RACINE MAIN MANAGER - CLASSIFICATIONS API SERVICE
// Integration Layer with Classifications SPA
// Maps to backend: classifications_routes.py + racine orchestration
// ============================================================================

import { 
  Classification,
  ClassificationFramework,
  ClassificationRule,
  ClassificationResult,
  ClassificationMetrics,
  ClassificationStatus,
  ClassificationScope,
  ClassificationCreateRequest,
  ClassificationUpdateRequest,
  ClassificationFilters,
  ClassificationStats,
  APIResponse,
  PaginatedResponse
} from '../types/racine-core.types';

// Import existing Classifications services for integration
import { ClassificationFrameworkApi, ClassificationRulesApi, BulkOperationsApi, ClassificationResultsApi } from '../../classifications/core/api/classificationApi';
import { aiApi } from '../../classifications/core/api/aiApi';
import { mlApi } from '../../classifications/core/api/mlApi';
import { websocketApi } from '../../classifications/core/api/websocketApi';

// Base API configuration
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/v1';
const RACINE_CLASSIFICATIONS_ENDPOINT = `${API_BASE_URL}/racine/classifications`;

/**
 * Racine Classifications API Service
 * Integrates with existing Classifications SPA services
 * Provides racine-level orchestration and cross-SPA integration
 */
class RacineClassificationsAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  
  // Integration with existing SPA services
  private classificationFrameworkApi: ClassificationFrameworkApi;
  private classificationRulesApi: ClassificationRulesApi;
  private bulkOperationsApi: BulkOperationsApi;
  private classificationResultsApi: ClassificationResultsApi;
  private aiService: typeof aiApi;
  private mlService: typeof mlApi;
  private websocketService: typeof websocketApi;

  constructor() {
    this.baseURL = RACINE_CLASSIFICATIONS_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Racine-Integration': 'true',
      'X-Client-Version': '2.0.0'
    };

    // Initialize existing SPA service integrations
    this.classificationFrameworkApi = new ClassificationFrameworkApi();
    this.classificationRulesApi = new ClassificationRulesApi();
    this.bulkOperationsApi = new BulkOperationsApi();
    this.classificationResultsApi = new ClassificationResultsApi();
    this.aiService = aiApi;
    this.mlService = mlApi;
    this.websocketService = websocketApi;
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
  // CORE CLASSIFICATION OPERATIONS
  // ============================================================================

  /**
   * Get all classifications with racine orchestration
   */
  async getAllClassifications(filters?: ClassificationFilters): Promise<APIResponse<PaginatedResponse<Classification>>> {
    // Integrate with existing SPA service
    const existingResult = await this.classificationService.getAllClassifications(filters);
    
    // Add racine-level orchestration
    const racineResult = await this.makeRequest<PaginatedResponse<Classification>>('/list', {
      method: 'POST',
      body: JSON.stringify({ filters, integration: 'classifications-spa' })
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
        message: 'Classifications retrieved with racine orchestration'
      };
    }

    return racineResult;
  }

  /**
   * Get classification by ID with enhanced racine context
   */
  async getClassificationById(id: string): Promise<APIResponse<Classification>> {
    // Get from existing SPA service
    const existingResult = await this.classificationService.getClassificationById(id);
    
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
        message: 'Classification retrieved with racine enhancements'
      };
    }

    return existingResult;
  }

  /**
   * Create new classification with racine orchestration
   */
  async createClassification(request: ClassificationCreateRequest): Promise<APIResponse<Classification>> {
    // Create in existing SPA
    const existingResult = await this.classificationService.createClassification(request);
    
    if (existingResult.success) {
      // Register with racine orchestration
      await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          classificationId: existingResult.data?.id,
          racineIntegration: true,
          crossSpaEnabled: true
        })
      });
    }

    return existingResult;
  }

  /**
   * Update classification with racine coordination
   */
  async updateClassification(id: string, updates: ClassificationUpdateRequest): Promise<APIResponse<Classification>> {
    // Update in existing SPA
    const existingResult = await this.classificationService.updateClassification(id, updates);
    
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
   * Delete classification with racine cleanup
   */
  async deleteClassification(id: string): Promise<APIResponse<void>> {
    // Clean up racine orchestration first
    await this.makeRequest(`/${id}/cleanup`, { method: 'DELETE' });
    
    // Delete from existing SPA
    return await this.classificationService.deleteClassification(id);
  }

  // ============================================================================
  // CLASSIFICATION FRAMEWORK OPERATIONS
  // ============================================================================

  /**
   * Get all classification frameworks
   */
  async getAllFrameworks(filters?: any): Promise<APIResponse<PaginatedResponse<ClassificationFramework>>> {
    return await this.classificationService.getAllFrameworks(filters);
  }

  /**
   * Create classification framework
   */
  async createFramework(framework: Partial<ClassificationFramework>): Promise<APIResponse<ClassificationFramework>> {
    const result = await this.classificationService.createFramework(framework);
    
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
   * Update classification framework
   */
  async updateFramework(id: string, updates: Partial<ClassificationFramework>): Promise<APIResponse<ClassificationFramework>> {
    return await this.classificationService.updateFramework(id, updates);
  }

  /**
   * Delete classification framework
   */
  async deleteFramework(id: string): Promise<APIResponse<void>> {
    // Clean up racine orchestration first
    await this.makeRequest(`/frameworks/${id}/cleanup`, { method: 'DELETE' });
    
    return await this.classificationService.deleteFramework(id);
  }

  /**
   * Activate classification framework
   */
  async activateFramework(id: string): Promise<APIResponse<ClassificationFramework>> {
    return await this.classificationService.activateFramework(id);
  }

  /**
   * Deactivate classification framework
   */
  async deactivateFramework(id: string): Promise<APIResponse<ClassificationFramework>> {
    return await this.classificationService.deactivateFramework(id);
  }

  // ============================================================================
  // CLASSIFICATION RULES OPERATIONS
  // ============================================================================

  /**
   * Get classification rules for framework
   */
  async getFrameworkRules(frameworkId: string): Promise<APIResponse<ClassificationRule[]>> {
    return await this.classificationService.getFrameworkRules(frameworkId);
  }

  /**
   * Create classification rule
   */
  async createRule(frameworkId: string, rule: Partial<ClassificationRule>): Promise<APIResponse<ClassificationRule>> {
    return await this.classificationService.createRule(frameworkId, rule);
  }

  /**
   * Update classification rule
   */
  async updateRule(frameworkId: string, ruleId: string, updates: Partial<ClassificationRule>): Promise<APIResponse<ClassificationRule>> {
    return await this.classificationService.updateRule(frameworkId, ruleId, updates);
  }

  /**
   * Delete classification rule
   */
  async deleteRule(frameworkId: string, ruleId: string): Promise<APIResponse<void>> {
    return await this.classificationService.deleteRule(frameworkId, ruleId);
  }

  /**
   * Validate classification rule
   */
  async validateRule(rule: Partial<ClassificationRule>): Promise<APIResponse<any>> {
    return await this.classificationService.validateRule(rule);
  }

  /**
   * Test classification rule
   */
  async testRule(rule: Partial<ClassificationRule>, testData: any): Promise<APIResponse<any>> {
    return await this.classificationService.testRule(rule, testData);
  }

  // ============================================================================
  // AI-POWERED CLASSIFICATION OPERATIONS
  // ============================================================================

  /**
   * Get AI classification suggestions
   */
  async getAIClassificationSuggestions(data: any): Promise<APIResponse<any[]>> {
    return await this.aiService.getClassificationSuggestions(data);
  }

  /**
   * Train AI classification model
   */
  async trainAIModel(trainingData: any): Promise<APIResponse<any>> {
    return await this.aiService.trainModel(trainingData);
  }

  /**
   * Get AI model performance metrics
   */
  async getAIModelMetrics(modelId: string): Promise<APIResponse<any>> {
    return await this.aiService.getModelMetrics(modelId);
  }

  /**
   * Apply AI classification to data
   */
  async applyAIClassification(data: any, modelId?: string): Promise<APIResponse<ClassificationResult[]>> {
    return await this.aiService.applyClassification(data, modelId);
  }

  // ============================================================================
  // ML-POWERED CLASSIFICATION OPERATIONS
  // ============================================================================

  /**
   * Get ML classification models
   */
  async getMLModels(): Promise<APIResponse<any[]>> {
    return await this.mlService.getModels();
  }

  /**
   * Train ML classification model
   */
  async trainMLModel(config: any): Promise<APIResponse<any>> {
    return await this.mlService.trainModel(config);
  }

  /**
   * Apply ML classification
   */
  async applyMLClassification(data: any, modelId: string): Promise<APIResponse<ClassificationResult[]>> {
    return await this.mlService.applyClassification(data, modelId);
  }

  /**
   * Get ML model performance
   */
  async getMLModelPerformance(modelId: string): Promise<APIResponse<any>> {
    return await this.mlService.getModelPerformance(modelId);
  }

  // ============================================================================
  // CLASSIFICATION EXECUTION AND RESULTS
  // ============================================================================

  /**
   * Execute classification on data
   */
  async executeClassification(data: any, frameworkId?: string): Promise<APIResponse<ClassificationResult[]>> {
    // Execute through existing SPA service
    const existingResult = await this.classificationService.executeClassification(data, frameworkId);
    
    // Log execution in racine orchestration
    if (existingResult.success) {
      await this.makeRequest('/executions/log', {
        method: 'POST',
        body: JSON.stringify({
          executionId: Date.now().toString(),
          frameworkId,
          resultCount: existingResult.data?.length || 0,
          timestamp: new Date().toISOString()
        })
      });
    }

    return existingResult;
  }

  /**
   * Get classification results
   */
  async getClassificationResults(filters?: any): Promise<APIResponse<PaginatedResponse<ClassificationResult>>> {
    return await this.classificationService.getClassificationResults(filters);
  }

  /**
   * Get classification result by ID
   */
  async getClassificationResultById(id: string): Promise<APIResponse<ClassificationResult>> {
    return await this.classificationService.getClassificationResultById(id);
  }

  /**
   * Update classification result
   */
  async updateClassificationResult(id: string, updates: Partial<ClassificationResult>): Promise<APIResponse<ClassificationResult>> {
    return await this.classificationService.updateClassificationResult(id, updates);
  }

  /**
   * Delete classification result
   */
  async deleteClassificationResult(id: string): Promise<APIResponse<void>> {
    return await this.classificationService.deleteClassificationResult(id);
  }

  // ============================================================================
  // METRICS AND ANALYTICS
  // ============================================================================

  /**
   * Get classification metrics
   */
  async getClassificationMetrics(timeRange?: string): Promise<APIResponse<ClassificationMetrics>> {
    const existingMetrics = await this.classificationService.getMetrics(timeRange);
    
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
   * Get classification statistics
   */
  async getClassificationStats(): Promise<APIResponse<ClassificationStats>> {
    const existingStats = await this.classificationService.getStats();
    
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
   * Get framework performance metrics
   */
  async getFrameworkMetrics(frameworkId: string, timeRange?: string): Promise<APIResponse<any>> {
    return await this.classificationService.getFrameworkMetrics(frameworkId, timeRange);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk classify data
   */
  async bulkClassifyData(data: any[], frameworkId?: string): Promise<APIResponse<ClassificationResult[]>> {
    return await this.classificationService.bulkClassifyData(data, frameworkId);
  }

  /**
   * Bulk update classifications
   */
  async bulkUpdateClassifications(updates: Array<{ id: string; updates: ClassificationUpdateRequest }>): Promise<APIResponse<Classification[]>> {
    return await this.classificationService.bulkUpdateClassifications(updates);
  }

  /**
   * Bulk delete classifications
   */
  async bulkDeleteClassifications(ids: string[]): Promise<APIResponse<void>> {
    // Clean up racine orchestration for all classifications
    await Promise.all(ids.map(id => 
      this.makeRequest(`/${id}/cleanup`, { method: 'DELETE' })
    ));
    
    return await this.classificationService.bulkDeleteClassifications(ids);
  }

  // ============================================================================
  // CROSS-SPA INTEGRATION METHODS
  // ============================================================================

  /**
   * Link classification to data sources
   */
  async linkToDataSources(classificationId: string, dataSourceIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${classificationId}/link-data-sources`, {
      method: 'POST',
      body: JSON.stringify({ dataSourceIds })
    });
  }

  /**
   * Link classification to scan rule sets
   */
  async linkToScanRuleSets(classificationId: string, ruleSetIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${classificationId}/link-scan-rule-sets`, {
      method: 'POST',
      body: JSON.stringify({ ruleSetIds })
    });
  }

  /**
   * Link classification to compliance rules
   */
  async linkToComplianceRules(classificationId: string, complianceRuleIds: string[]): Promise<APIResponse<void>> {
    return await this.makeRequest(`/${classificationId}/link-compliance-rules`, {
      method: 'POST',
      body: JSON.stringify({ complianceRuleIds })
    });
  }

  /**
   * Get cross-SPA dependencies
   */
  async getCrossSPADependencies(classificationId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/${classificationId}/cross-spa-dependencies`);
  }

  /**
   * Get classification usage across SPAs
   */
  async getCrossSPAUsage(classificationId: string): Promise<APIResponse<any>> {
    return await this.makeRequest(`/${classificationId}/cross-spa-usage`);
  }

  // ============================================================================
  // REAL-TIME OPERATIONS WITH WEBSOCKET
  // ============================================================================

  /**
   * Subscribe to classification updates
   */
  subscribeToClassificationUpdates(callback: (data: any) => void): void {
    this.websocketService.subscribe('classification_updates', callback);
  }

  /**
   * Subscribe to framework updates
   */
  subscribeToFrameworkUpdates(callback: (data: any) => void): void {
    this.websocketService.subscribe('framework_updates', callback);
  }

  /**
   * Subscribe to execution updates
   */
  subscribeToExecutionUpdates(callback: (data: any) => void): void {
    this.websocketService.subscribe('execution_updates', callback);
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribeFromUpdates(eventType: string): void {
    this.websocketService.unsubscribe(eventType);
  }

  // ============================================================================
  // HEALTH AND STATUS MONITORING
  // ============================================================================

  /**
   * Get classification service health
   */
  async getServiceHealth(): Promise<APIResponse<any>> {
    return await this.classificationService.getHealth();
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<APIResponse<any>> {
    const existingStatus = await this.classificationService.getSystemStatus();
    
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
}

// Export singleton instance
export const racineClassificationsAPI = new RacineClassificationsAPIService();

// Export class for testing and extension
export { RacineClassificationsAPIService };

// Export default
export default racineClassificationsAPI;