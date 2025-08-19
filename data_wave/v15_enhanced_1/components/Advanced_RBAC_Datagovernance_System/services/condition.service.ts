// Condition Service - Maps to backend condition template management
// Provides comprehensive ABAC condition management, template creation, and evaluation

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  ConditionTemplate,
  ConditionCreate,
  ConditionUpdate,
  ConditionEvaluation,
  ConditionTest,
  ConditionLibrary,
  ConditionPreset,
  ConditionValidation,
  ConditionContext,
  ConditionOperator,
  ConditionAttribute
} from '../types/condition.types';

export interface ConditionFilters {
  search?: string;
  category?: string;
  isBuiltIn?: boolean;
  isActive?: boolean;
  complexity?: 'simple' | 'medium' | 'complex';
  usageCount?: {
    min?: number;
    max?: number;
  };
  createdBy?: number;
  createdAfter?: string;
  createdBefore?: string;
  tags?: string[];
}

export interface ConditionPagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ConditionService {
  // === Core CRUD Operations ===

  /**
   * Get all condition templates with filtering and pagination
   */
  async getConditionTemplates(
    filters: ConditionFilters = {},
    pagination: ConditionPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<ConditionTemplate>>> {
    const params = new URLSearchParams();
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else if (typeof value === 'object' && 'min' in value) {
          if (value.min !== undefined) params.append(`${key}_min`, value.min.toString());
          if (value.max !== undefined) params.append(`${key}_max`, value.max.toString());
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    // Apply pagination
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `${RBAC_ENDPOINTS.CONDITION_TEMPLATES}?${queryString}` : RBAC_ENDPOINTS.CONDITION_TEMPLATES;
    
    return rbacApiService.get<PaginatedResponse<ConditionTemplate>>(url);
  }

  /**
   * Get condition template by ID
   */
  async getConditionTemplate(
    templateId: number,
    includeUsage = false
  ): Promise<ApiResponse<ConditionTemplate>> {
    const params = includeUsage ? '?include_usage=true' : '';
    return rbacApiService.get<ConditionTemplate>(`${RBAC_ENDPOINTS.CONDITION_TEMPLATE(templateId)}${params}`);
  }

  /**
   * Create new condition template
   */
  async createConditionTemplate(conditionData: ConditionCreate): Promise<ApiResponse<ConditionTemplate>> {
    return rbacApiService.post<ConditionTemplate>(RBAC_ENDPOINTS.CONDITION_TEMPLATES, conditionData);
  }

  /**
   * Update existing condition template
   */
  async updateConditionTemplate(templateId: number, updates: ConditionUpdate): Promise<ApiResponse<ConditionTemplate>> {
    return rbacApiService.put<ConditionTemplate>(RBAC_ENDPOINTS.CONDITION_TEMPLATE(templateId), updates);
  }

  /**
   * Delete condition template
   */
  async deleteConditionTemplate(
    templateId: number,
    options: {
      forceDelete?: boolean;
      replacementTemplateId?: number;
    } = {}
  ): Promise<ApiResponse<void>> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.CONDITION_TEMPLATE(templateId)}?${queryString}`
      : RBAC_ENDPOINTS.CONDITION_TEMPLATE(templateId);
    
    return rbacApiService.delete<void>(url);
  }

  // === Condition Validation and Testing ===

  /**
   * Validate condition syntax and structure
   */
  async validateCondition(condition: Record<string, any>): Promise<ApiResponse<ConditionValidation>> {
    return rbacApiService.post<ConditionValidation>(RBAC_ENDPOINTS.VALIDATE_CONDITION, { condition });
  }

  /**
   * Test condition against user context
   */
  async testCondition(
    condition: Record<string, any>,
    userContext: Record<string, any>,
    resourceContext?: Record<string, any>
  ): Promise<ApiResponse<ConditionTest>> {
    return rbacApiService.post<ConditionTest>(RBAC_ENDPOINTS.TEST_ABAC, {
      condition,
      user_context: userContext,
      resource_context: resourceContext || {}
    });
  }

  /**
   * Batch test conditions
   */
  async batchTestConditions(tests: Array<{
    condition: Record<string, any>;
    userContext: Record<string, any>;
    resourceContext?: Record<string, any>;
    expectedResult?: boolean;
    testName?: string;
  }>): Promise<ApiResponse<Array<{
    test: any;
    result: ConditionTest;
    passed?: boolean;
    executionTime: number;
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/batch-test`, { tests });
  }

  /**
   * Evaluate condition template with parameters
   */
  async evaluateConditionTemplate(
    templateId: number,
    parameters: Record<string, any>,
    context: ConditionContext
  ): Promise<ApiResponse<ConditionEvaluation>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATE(templateId)}/evaluate`, {
      parameters,
      context
    });
  }

  // === Condition Helpers and Metadata ===

  /**
   * Get condition template helpers
   */
  async getConditionHelpers(): Promise<ApiResponse<{
    operators: ConditionOperator[];
    attributes: ConditionAttribute[];
    functions: Array<{
      name: string;
      description: string;
      parameters: Array<{
        name: string;
        type: string;
        required: boolean;
        description: string;
      }>;
      returnType: string;
      examples: Array<{
        usage: string;
        result: any;
      }>;
    }>;
    templates: Array<{
      name: string;
      description: string;
      condition: any;
      useCase: string;
      category: string;
    }>;
  }>> {
    return rbacApiService.get(RBAC_ENDPOINTS.CONDITION_TEMPLATES_HELPERS);
  }

  /**
   * Get available condition operators
   */
  async getConditionOperators(): Promise<ApiResponse<ConditionOperator[]>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/operators`);
  }

  /**
   * Get available condition attributes
   */
  async getConditionAttributes(category?: string): Promise<ApiResponse<ConditionAttribute[]>> {
    const params = category ? `?category=${category}` : '';
    return rbacApiService.get<ConditionAttribute[]>(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/attributes${params}`);
  }

  /**
   * Get condition examples by category
   */
  async getConditionExamples(category?: string): Promise<ApiResponse<Array<{
    name: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    condition: any;
    explanation: string;
    useCases: string[];
  }>>> {
    const params = category ? `?category=${category}` : '';
    return rbacApiService.get(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/examples${params}`);
  }

  // === Condition Library and Presets ===

  /**
   * Get condition library
   */
  async getConditionLibrary(): Promise<ApiResponse<ConditionLibrary>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/library`);
  }

  /**
   * Get condition presets by category
   */
  async getConditionPresets(category?: string): Promise<ApiResponse<ConditionPreset[]>> {
    const params = category ? `?category=${category}` : '';
    return rbacApiService.get<ConditionPreset[]>(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/presets${params}`);
  }

  /**
   * Create condition from preset
   */
  async createFromPreset(
    presetId: number,
    customizations?: Record<string, any>
  ): Promise<ApiResponse<ConditionTemplate>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/presets/${presetId}/create`, {
      customizations: customizations || {}
    });
  }

  // === Advanced Condition Operations ===

  /**
   * Parse natural language condition
   */
  async parseNaturalLanguageCondition(description: string): Promise<ApiResponse<{
    condition: Record<string, any>;
    confidence: number;
    explanation: string;
    suggestions: string[];
    alternatives: Array<{
      condition: Record<string, any>;
      confidence: number;
      description: string;
    }>;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/parse`, { description });
  }

  /**
   * Generate condition explanation
   */
  async generateConditionExplanation(condition: Record<string, any>): Promise<ApiResponse<{
    humanReadable: string;
    breakdown: Array<{
      part: string;
      explanation: string;
      type: 'operator' | 'attribute' | 'value' | 'function';
    }>;
    complexity: 'simple' | 'medium' | 'complex';
    recommendations: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/explain`, { condition });
  }

  /**
   * Optimize condition performance
   */
  async optimizeCondition(condition: Record<string, any>): Promise<ApiResponse<{
    optimizedCondition: Record<string, any>;
    improvements: Array<{
      type: 'performance' | 'readability' | 'maintainability';
      description: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    performanceMetrics: {
      originalComplexity: number;
      optimizedComplexity: number;
      estimatedSpeedup: number;
    };
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/optimize`, { condition });
  }

  /**
   * Detect condition conflicts
   */
  async detectConditionConflicts(conditions: Record<string, any>[]): Promise<ApiResponse<Array<{
    conditionPair: [number, number];
    conflictType: 'contradiction' | 'redundancy' | 'overlap';
    severity: 'low' | 'medium' | 'high';
    description: string;
    resolution: string[];
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/conflicts`, { conditions });
  }

  // === Condition Analytics ===

  /**
   * Get condition usage analytics
   */
  async getConditionUsageAnalytics(
    templateId?: number,
    timeRange?: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<{
    usageStats: {
      totalEvaluations: number;
      successfulEvaluations: number;
      failedEvaluations: number;
      averageExecutionTime: number;
      popularAttributes: Array<{
        attribute: string;
        usageCount: number;
      }>;
    };
    performanceMetrics: {
      averageComplexity: number;
      slowestConditions: Array<{
        templateId: number;
        name: string;
        averageExecutionTime: number;
      }>;
      errorRates: Record<string, number>;
    };
    trends: Array<{
      date: string;
      evaluations: number;
      averageTime: number;
      errorRate: number;
    }>;
  }>> {
    const params = new URLSearchParams();
    if (templateId) params.append('template_id', templateId.toString());
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/analytics?${queryString}`
      : `${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/analytics`;
    
    return rbacApiService.get(url);
  }

  /**
   * Get condition complexity analysis
   */
  async getConditionComplexityAnalysis(condition: Record<string, any>): Promise<ApiResponse<{
    complexityScore: number;
    factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
    recommendations: Array<{
      type: 'simplification' | 'optimization' | 'refactoring';
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    comparisonToAverage: {
      percentile: number;
      category: 'simple' | 'average' | 'complex' | 'very_complex';
    };
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/complexity`, { condition });
  }

  // === Condition Import/Export ===

  /**
   * Export condition templates
   */
  async exportConditionTemplates(
    templateIds?: number[],
    format: 'json' | 'yaml' | 'csv' = 'json',
    includeUsage = false
  ): Promise<ApiResponse<{
    format: string;
    data: any;
    metadata: {
      exportedAt: string;
      templateCount: number;
      includesUsage: boolean;
    };
  }>> {
    const params = new URLSearchParams({
      format,
      include_usage: includeUsage.toString()
    });
    
    if (templateIds?.length) {
      templateIds.forEach(id => params.append('template_ids', id.toString()));
    }
    
    return rbacApiService.get(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/export?${params.toString()}`);
  }

  /**
   * Import condition templates
   */
  async importConditionTemplates(
    importData: any,
    options: {
      overwriteExisting?: boolean;
      dryRun?: boolean;
      skipValidation?: boolean;
      defaultCategory?: string;
    } = {}
  ): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    errors: string[];
    preview?: ConditionTemplate[];
    validationResults?: Array<{
      template: any;
      valid: boolean;
      errors: string[];
    }>;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/import`, {
      data: importData,
      options
    });
  }

  // === Search and Discovery ===

  /**
   * Search condition templates
   */
  async searchConditionTemplates(query: {
    text?: string;
    categories?: string[];
    attributes?: string[];
    operators?: string[];
    complexityRange?: {
      min?: number;
      max?: number;
    };
    usageRange?: {
      min?: number;
      max?: number;
    };
  }): Promise<ApiResponse<ConditionTemplate[]>> {
    return rbacApiService.post<ConditionTemplate[]>(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/search`, query);
  }

  /**
   * Find similar condition templates
   */
  async findSimilarConditionTemplates(
    templateId: number,
    threshold = 0.8
  ): Promise<ApiResponse<Array<{
    template: ConditionTemplate;
    similarity: number;
    commonElements: string[];
    differences: string[];
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.CONDITION_TEMPLATE(templateId)}/similar?threshold=${threshold}`);
  }

  /**
   * Get condition recommendations
   */
  async getConditionRecommendations(
    context: {
      entityType?: string;
      action?: string;
      resourceType?: string;
      userAttributes?: string[];
      existingConditions?: Record<string, any>[];
    }
  ): Promise<ApiResponse<Array<{
    template: ConditionTemplate;
    confidence: number;
    reasoning: string[];
    adaptations: Record<string, any>;
    riskLevel: 'low' | 'medium' | 'high';
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.CONDITION_TEMPLATES}/recommendations`, { context });
  }
}

// Export singleton instance
export const conditionService = new ConditionService();
export default conditionService;