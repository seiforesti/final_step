// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE OPTIMIZATION API SERVICE
// Enterprise-Core Implementation with Full Backend Integration
// Maps to: rule_optimization_service.py (28KB), scan_performance_optimizer.py (61KB)
//          scan_performance_service.py (31KB), advanced_ai_tuning_service.py
// ============================================================================

import { 
  OptimizationEngine,
  OptimizationCapability,
  PerformanceOptimizer,
  PerformanceTarget,
  ResourceOptimizer,
  CostOptimizer,
  OptimizationExecution,
  OptimizationResult,
  OptimizationAnalytics,
  OptimizationEngineMetrics,
  APIResponse
} from '../types/optimization.types';

import { APIError, createAPIError } from '../types/api-error.types';

// Enterprise API Configuration
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/v1';
const OPTIMIZATION_ENDPOINT = `${API_BASE_URL}/scan-optimization`;

/**
 * Enterprise-Grade Optimization API Service
 * Comprehensive integration with backend optimization services
 * Features: AI-Powered Optimization, Performance Tuning, Resource Optimization, Cost Management
 */
export class OptimizationAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  private wsConnections: Map<string, WebSocket>;
  private optimizationCache: Map<string, any>;
  private retryConfig: { attempts: number; delay: number };

  constructor() {
    this.baseURL = OPTIMIZATION_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '2.0.0',
      'X-Feature-Flags': 'ai-optimization,performance-tuning,cost-optimization,ml-recommendations'
    };
    this.wsConnections = new Map();
    this.optimizationCache = new Map();
    this.retryConfig = { attempts: 3, delay: 1000 };
  }

  // ============================================================================
  // AUTHENTICATION & REQUEST HANDLING
  // ============================================================================

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const orgId = localStorage.getItem('organization_id');
    const userId = localStorage.getItem('user_id');
    
    return {
      ...this.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(orgId && { 'X-Organization-ID': orgId }),
      ...(userId && { 'X-User-ID': userId }),
      'X-Request-ID': this.generateRequestId(),
      'X-Timestamp': new Date().toISOString(),
      'X-Optimization-Context': this.getOptimizationContext()
    };
  }

  private generateRequestId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOptimizationContext(): string {
    // Generate context for optimization requests
    return JSON.stringify({
      userPreferences: this.getUserOptimizationPreferences(),
      systemCapabilities: this.getSystemCapabilities(),
      currentWorkload: this.getCurrentWorkloadMetrics()
    });
  }

  private getUserOptimizationPreferences(): any {
    return {
      preferredTargets: ['performance', 'cost', 'accuracy'],
      riskTolerance: 'medium',
      optimizationFrequency: 'daily',
      mlModelPreference: 'balanced'
    };
  }

  private getSystemCapabilities(): any {
    return {
      cpuCores: navigator.hardwareConcurrency || 4,
      memoryGB: (navigator as any).deviceMemory || 8,
      networkType: (navigator as any).connection?.effectiveType || '4g',
      browserCapabilities: this.getBrowserCapabilities()
    };
  }

  private getBrowserCapabilities(): any {
    return {
      webWorkers: typeof Worker !== 'undefined',
      webAssembly: typeof WebAssembly !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator
    };
  }

  private getCurrentWorkloadMetrics(): any {
    return {
      activeOptimizations: this.wsConnections.size,
      cacheSize: this.optimizationCache.size,
      timestamp: Date.now()
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const requestId = response.headers.get('X-Request-ID');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Enhanced error handling with optimization-specific context
      if (response.status >= 500 && this.retryConfig.attempts > 0) {
        await this.delay(this.retryConfig.delay);
        // Retry logic with exponential backoff
      }
      
      throw createAPIError(
        errorData.message || response.statusText,
        response.status.toString(),
        response.status,
        {
          ...errorData.details,
          requestId,
          optimizationContext: errorData.optimizationContext,
          suggestedActions: errorData.suggestedActions,
          endpoint: response.url
        }
      );
    }

    const data = await response.json();
    
    // Add optimization-specific metadata
    if (data && typeof data === 'object') {
      data._metadata = {
        requestId,
        responseTime: response.headers.get('X-Response-Time'),
        optimizationVersion: response.headers.get('X-Optimization-Version'),
        cached: response.headers.get('X-Cache-Status') === 'HIT',
        mlModelVersion: response.headers.get('X-ML-Model-Version'),
        performanceScore: response.headers.get('X-Performance-Score')
      };
    }

    return data;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // OPTIMIZATION ENGINE MANAGEMENT
  // Maps to rule_optimization_service.py and advanced optimization backends
  // ============================================================================

  /**
   * Get optimization engines with advanced capabilities
   * Endpoint: GET /scan-optimization/engines
   */
  async getOptimizationEngines(options: {
    includeCapabilities?: boolean;
    includePerformanceMetrics?: boolean;
    includeMLModels?: boolean;
    filterByTarget?: string[];
    sortBy?: 'performance' | 'accuracy' | 'cost' | 'popularity';
  } = {}): Promise<APIResponse<OptimizationEngine[]>> {
    const params = new URLSearchParams();
    
    if (options.includeCapabilities) params.append('include_capabilities', 'true');
    if (options.includePerformanceMetrics) params.append('include_performance_metrics', 'true');
    if (options.includeMLModels) params.append('include_ml_models', 'true');
    if (options.filterByTarget) params.append('filter_by_target', options.filterByTarget.join(','));
    if (options.sortBy) params.append('sort_by', options.sortBy);

    const response = await fetch(`${this.baseURL}/engines?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<OptimizationEngine[]>>(response);
  }

  /**
   * Get specific optimization engine with detailed configuration
   * Endpoint: GET /scan-optimization/engines/{id}
   */
  async getOptimizationEngine(
    id: string,
    options: {
      includeHistoricalPerformance?: boolean;
      includeActiveOptimizations?: boolean;
      includeResourceUtilization?: boolean;
      includeMLModelDetails?: boolean;
    } = {}
  ): Promise<APIResponse<OptimizationEngine & {
    historicalPerformance?: any[];
    activeOptimizations?: any[];
    resourceUtilization?: any;
    mlModelDetails?: any;
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeHistoricalPerformance) params.append('include_historical_performance', 'true');
    if (options.includeActiveOptimizations) params.append('include_active_optimizations', 'true');
    if (options.includeResourceUtilization) params.append('include_resource_utilization', 'true');
    if (options.includeMLModelDetails) params.append('include_ml_model_details', 'true');

    const response = await fetch(`${this.baseURL}/engines/${id}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<OptimizationEngine & {
      historicalPerformance?: any[];
      activeOptimizations?: any[];
      resourceUtilization?: any;
      mlModelDetails?: any;
    }>>(response);
  }

  /**
   * Create optimization engine with advanced configuration
   * Endpoint: POST /scan-optimization/engines
   */
  async createOptimizationEngine(
    engine: Omit<OptimizationEngine, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      autoConfigureMLModels?: boolean;
      enableAdvancedFeatures?: boolean;
      setupMonitoring?: boolean;
      performInitialCalibration?: boolean;
    } = {}
  ): Promise<APIResponse<OptimizationEngine & {
    mlModelConfiguration?: any;
    calibrationResults?: any;
    monitoringSetup?: any;
  }>> {
    const requestBody = {
      ...engine,
      options: {
        auto_configure_ml_models: options.autoConfigureMLModels,
        enable_advanced_features: options.enableAdvancedFeatures,
        setup_monitoring: options.setupMonitoring,
        perform_initial_calibration: options.performInitialCalibration
      },
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationContext: this.getOptimizationContext(),
        version: '2.0.0'
      }
    };

    const response = await fetch(`${this.baseURL}/engines`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<OptimizationEngine & {
      mlModelConfiguration?: any;
      calibrationResults?: any;
      monitoringSetup?: any;
    }>>(response);
  }

  // ============================================================================
  // PERFORMANCE OPTIMIZATION
  // Maps to scan_performance_optimizer.py and scan_performance_service.py
  // ============================================================================

  /**
   * Get performance optimizers with advanced metrics
   * Endpoint: GET /scan-optimization/performance/optimizers
   */
  async getPerformanceOptimizers(options: {
    includeBaselines?: boolean;
    includeTargets?: boolean;
    includeStrategies?: boolean;
    filterByComplexity?: 'low' | 'medium' | 'high' | 'adaptive';
  } = {}): Promise<APIResponse<PerformanceOptimizer[]>> {
    const params = new URLSearchParams();
    
    if (options.includeBaselines) params.append('include_baselines', 'true');
    if (options.includeTargets) params.append('include_targets', 'true');
    if (options.includeStrategies) params.append('include_strategies', 'true');
    if (options.filterByComplexity) params.append('filter_by_complexity', options.filterByComplexity);

    const response = await fetch(`${this.baseURL}/performance/optimizers?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<PerformanceOptimizer[]>>(response);
  }

  /**
   * Create performance optimization job with AI-powered analysis
   * Endpoint: POST /scan-optimization/performance/optimize
   */
  async createPerformanceOptimization(
    optimizationConfig: {
      ruleSetId: string;
      targets: PerformanceTarget[];
      constraints?: any[];
      mlModelPreferences?: string[];
      optimizationScope: 'single' | 'batch' | 'continuous';
      priority: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<APIResponse<{
    optimizationId: string;
    estimatedDuration: number;
    expectedImprovements: any;
    resourceRequirements: any;
    mlModelsSelected: string[];
    optimizationPlan: any;
  }>> {
    const requestBody = {
      ...optimizationConfig,
      metadata: {
        requestedBy: localStorage.getItem('user_id'),
        requestTimestamp: new Date().toISOString(),
        systemContext: this.getSystemCapabilities(),
        userPreferences: this.getUserOptimizationPreferences()
      }
    };

    const response = await fetch(`${this.baseURL}/performance/optimize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      optimizationId: string;
      estimatedDuration: number;
      expectedImprovements: any;
      resourceRequirements: any;
      mlModelsSelected: string[];
      optimizationPlan: any;
    }>>(response);
  }

  /**
   * Get performance optimization status with real-time metrics
   * Endpoint: GET /scan-optimization/performance/optimizations/{id}/status
   */
  async getPerformanceOptimizationStatus(
    optimizationId: string,
    options: {
      includeDetailedMetrics?: boolean;
      includeMLInsights?: boolean;
      includeResourceUsage?: boolean;
      includePredictions?: boolean;
    } = {}
  ): Promise<APIResponse<{
    status: string;
    progress: number;
    currentPhase: string;
    metrics: any;
    mlInsights?: any;
    resourceUsage?: any;
    predictions?: any;
    estimatedCompletion: string;
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeDetailedMetrics) params.append('include_detailed_metrics', 'true');
    if (options.includeMLInsights) params.append('include_ml_insights', 'true');
    if (options.includeResourceUsage) params.append('include_resource_usage', 'true');
    if (options.includePredictions) params.append('include_predictions', 'true');

    const response = await fetch(`${this.baseURL}/performance/optimizations/${optimizationId}/status?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      status: string;
      progress: number;
      currentPhase: string;
      metrics: any;
      mlInsights?: any;
      resourceUsage?: any;
      predictions?: any;
      estimatedCompletion: string;
    }>>(response);
  }

  /**
   * Apply performance optimization results
   * Endpoint: POST /scan-optimization/performance/optimizations/{id}/apply
   */
  async applyPerformanceOptimization(
    optimizationId: string,
    applicationConfig: {
      applyMode: 'immediate' | 'scheduled' | 'gradual';
      rollbackPlan?: boolean;
      validationChecks?: boolean;
      notificationSettings?: any;
      backupConfiguration?: boolean;
    }
  ): Promise<APIResponse<{
    applicationId: string;
    status: string;
    appliedChanges: any[];
    rollbackId?: string;
    validationResults?: any;
    estimatedImpact: any;
  }>> {
    const requestBody = {
      ...applicationConfig,
      metadata: {
        appliedBy: localStorage.getItem('user_id'),
        applicationTimestamp: new Date().toISOString(),
        optimizationId
      }
    };

    const response = await fetch(`${this.baseURL}/performance/optimizations/${optimizationId}/apply`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      applicationId: string;
      status: string;
      appliedChanges: any[];
      rollbackId?: string;
      validationResults?: any;
      estimatedImpact: any;
    }>>(response);
  }

  // ============================================================================
  // RESOURCE OPTIMIZATION
  // Maps to resource optimization components in backend
  // ============================================================================

  /**
   * Get resource optimizers with utilization metrics
   * Endpoint: GET /scan-optimization/resources/optimizers
   */
  async getResourceOptimizers(options: {
    includeUtilizationMetrics?: boolean;
    includeCostAnalysis?: boolean;
    includeScalingOptions?: boolean;
    filterByResourceType?: string[];
  } = {}): Promise<APIResponse<ResourceOptimizer[]>> {
    const params = new URLSearchParams();
    
    if (options.includeUtilizationMetrics) params.append('include_utilization_metrics', 'true');
    if (options.includeCostAnalysis) params.append('include_cost_analysis', 'true');
    if (options.includeScalingOptions) params.append('include_scaling_options', 'true');
    if (options.filterByResourceType) params.append('filter_by_resource_type', options.filterByResourceType.join(','));

    const response = await fetch(`${this.baseURL}/resources/optimizers?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<ResourceOptimizer[]>>(response);
  }

  /**
   * Create resource optimization plan
   * Endpoint: POST /scan-optimization/resources/optimize
   */
  async createResourceOptimization(
    optimizationConfig: {
      scope: 'global' | 'regional' | 'local';
      resourceTypes: string[];
      objectives: ('cost' | 'performance' | 'utilization' | 'sustainability')[];
      constraints: any[];
      timeHorizon: number; // hours
      optimizationStrategy: 'conservative' | 'balanced' | 'aggressive';
    }
  ): Promise<APIResponse<{
    optimizationId: string;
    plan: any;
    projectedSavings: number;
    riskAssessment: any;
    implementationSteps: any[];
    monitoringPlan: any;
  }>> {
    const requestBody = {
      ...optimizationConfig,
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/resources/optimize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      optimizationId: string;
      plan: any;
      projectedSavings: number;
      riskAssessment: any;
      implementationSteps: any[];
      monitoringPlan: any;
    }>>(response);
  }

  /**
   * Get resource utilization analytics
   * Endpoint: GET /scan-optimization/resources/analytics
   */
  async getResourceUtilizationAnalytics(options: {
    timeRange?: { start: string; end: string };
    resourceTypes?: string[];
    aggregationLevel?: 'minute' | 'hour' | 'day' | 'week';
    includeForecasting?: boolean;
    includeCostAnalysis?: boolean;
    includeEfficiencyMetrics?: boolean;
  } = {}): Promise<APIResponse<{
    utilizationMetrics: any;
    trends: any[];
    forecasts?: any[];
    costAnalysis?: any;
    efficiencyMetrics?: any;
    recommendations: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.resourceTypes) params.append('resource_types', options.resourceTypes.join(','));
    if (options.aggregationLevel) params.append('aggregation_level', options.aggregationLevel);
    if (options.includeForecasting) params.append('include_forecasting', 'true');
    if (options.includeCostAnalysis) params.append('include_cost_analysis', 'true');
    if (options.includeEfficiencyMetrics) params.append('include_efficiency_metrics', 'true');

    const response = await fetch(`${this.baseURL}/resources/analytics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      utilizationMetrics: any;
      trends: any[];
      forecasts?: any[];
      costAnalysis?: any;
      efficiencyMetrics?: any;
      recommendations: any[];
    }>>(response);
  }

  // ============================================================================
  // COST OPTIMIZATION
  // Maps to cost optimization components in backend
  // ============================================================================

  /**
   * Get cost optimizers with financial analysis
   * Endpoint: GET /scan-optimization/cost/optimizers
   */
  async getCostOptimizers(options: {
    includeCostModels?: boolean;
    includeROIAnalysis?: boolean;
    includeBenchmarks?: boolean;
    filterByCostCategory?: string[];
  } = {}): Promise<APIResponse<CostOptimizer[]>> {
    const params = new URLSearchParams();
    
    if (options.includeCostModels) params.append('include_cost_models', 'true');
    if (options.includeROIAnalysis) params.append('include_roi_analysis', 'true');
    if (options.includeBenchmarks) params.append('include_benchmarks', 'true');
    if (options.filterByCostCategory) params.append('filter_by_cost_category', options.filterByCostCategory.join(','));

    const response = await fetch(`${this.baseURL}/cost/optimizers?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<CostOptimizer[]>>(response);
  }

  /**
   * Create cost optimization analysis
   * Endpoint: POST /scan-optimization/cost/analyze
   */
  async createCostOptimizationAnalysis(
    analysisConfig: {
      scope: 'organization' | 'department' | 'project' | 'resource_group';
      scopeId: string;
      analysisType: 'comprehensive' | 'focused' | 'quick_wins' | 'strategic';
      timeHorizon: number; // months
      costCategories: string[];
      optimizationGoals: any[];
    }
  ): Promise<APIResponse<{
    analysisId: string;
    costBreakdown: any;
    savingsOpportunities: any[];
    riskAssessment: any;
    implementationPlan: any;
    roiProjections: any;
  }>> {
    const requestBody = {
      ...analysisConfig,
      metadata: {
        requestedBy: localStorage.getItem('user_id'),
        requestTimestamp: new Date().toISOString(),
        organizationContext: {
          orgId: localStorage.getItem('organization_id'),
          budget: this.getOrganizationBudgetContext(),
          costPreferences: this.getCostOptimizationPreferences()
        }
      }
    };

    const response = await fetch(`${this.baseURL}/cost/analyze`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      analysisId: string;
      costBreakdown: any;
      savingsOpportunities: any[];
      riskAssessment: any;
      implementationPlan: any;
      roiProjections: any;
    }>>(response);
  }

  private getOrganizationBudgetContext(): any {
    // This would typically come from user settings or organization config
    return {
      annualBudget: 1000000, // Example budget
      currentSpend: 750000,
      budgetPeriod: 'annual',
      costCenters: ['infrastructure', 'software', 'personnel', 'operations']
    };
  }

  private getCostOptimizationPreferences(): any {
    return {
      riskTolerance: 'medium',
      paybackPeriod: 12, // months
      preferredSavingsType: 'balanced', // 'immediate' | 'long_term' | 'balanced'
      sustainabilityWeight: 0.3 // 0-1 scale
    };
  }

  // ============================================================================
  // OPTIMIZATION EXECUTION & MONITORING
  // ============================================================================

  /**
   * Execute optimization with advanced monitoring
   * Endpoint: POST /scan-optimization/execute
   */
  async executeOptimization(
    executionConfig: {
      optimizationId: string;
      executionMode: 'simulation' | 'pilot' | 'production';
      monitoringLevel: 'basic' | 'detailed' | 'comprehensive';
      rollbackSettings: any;
      notificationSettings: any;
    }
  ): Promise<APIResponse<OptimizationExecution & {
    monitoringDashboard: string;
    realTimeMetricsUrl: string;
    rollbackProcedures: any[];
  }>> {
    const requestBody = {
      ...executionConfig,
      metadata: {
        executedBy: localStorage.getItem('user_id'),
        executionTimestamp: new Date().toISOString(),
        systemSnapshot: this.getSystemCapabilities()
      }
    };

    const response = await fetch(`${this.baseURL}/execute`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<OptimizationExecution & {
      monitoringDashboard: string;
      realTimeMetricsUrl: string;
      rollbackProcedures: any[];
    }>>(response);
  }

  /**
   * Get optimization execution results
   * Endpoint: GET /scan-optimization/executions/{id}/results
   */
  async getOptimizationResults(
    executionId: string,
    options: {
      includeDetailedMetrics?: boolean;
      includeComparison?: boolean;
      includeMLInsights?: boolean;
      includeRecommendations?: boolean;
    } = {}
  ): Promise<APIResponse<OptimizationResult & {
    detailedMetrics?: any;
    comparison?: any;
    mlInsights?: any;
    recommendations?: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeDetailedMetrics) params.append('include_detailed_metrics', 'true');
    if (options.includeComparison) params.append('include_comparison', 'true');
    if (options.includeMLInsights) params.append('include_ml_insights', 'true');
    if (options.includeRecommendations) params.append('include_recommendations', 'true');

    const response = await fetch(`${this.baseURL}/executions/${executionId}/results?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<OptimizationResult & {
      detailedMetrics?: any;
      comparison?: any;
      mlInsights?: any;
      recommendations?: any[];
    }>>(response);
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  /**
   * Get optimization analytics with advanced insights
   * Endpoint: GET /scan-optimization/analytics
   */
  async getOptimizationAnalytics(options: {
    timeRange?: { start: string; end: string };
    optimizationTypes?: string[];
    aggregationLevel?: 'execution' | 'daily' | 'weekly' | 'monthly';
    includeMLAnalysis?: boolean;
    includeTrendAnalysis?: boolean;
    includeROIAnalysis?: boolean;
    includeBenchmarking?: boolean;
  } = {}): Promise<APIResponse<OptimizationAnalytics & {
    mlAnalysis?: any;
    trendAnalysis?: any;
    roiAnalysis?: any;
    benchmarking?: any;
  }>> {
    const params = new URLSearchParams();
    
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.optimizationTypes) params.append('optimization_types', options.optimizationTypes.join(','));
    if (options.aggregationLevel) params.append('aggregation_level', options.aggregationLevel);
    if (options.includeMLAnalysis) params.append('include_ml_analysis', 'true');
    if (options.includeTrendAnalysis) params.append('include_trend_analysis', 'true');
    if (options.includeROIAnalysis) params.append('include_roi_analysis', 'true');
    if (options.includeBenchmarking) params.append('include_benchmarking', 'true');

    const response = await fetch(`${this.baseURL}/analytics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<OptimizationAnalytics & {
      mlAnalysis?: any;
      trendAnalysis?: any;
      roiAnalysis?: any;
      benchmarking?: any;
    }>>(response);
  }

  /**
   * Generate optimization report
   * Endpoint: POST /scan-optimization/reports/generate
   */
  async generateOptimizationReport(
    reportConfig: {
      reportType: 'executive' | 'technical' | 'financial' | 'comprehensive';
      scope: any;
      timeRange: { start: string; end: string };
      format: 'pdf' | 'excel' | 'html' | 'json' | 'dashboard';
      includeCharts: boolean;
      includeRecommendations: boolean;
      customSections?: string[];
    }
  ): Promise<APIResponse<{
    reportId: string;
    downloadUrl?: string;
    dashboardUrl?: string;
    generationTime: number;
    reportMetadata: any;
  }>> {
    const requestBody = {
      ...reportConfig,
      metadata: {
        requestedBy: localStorage.getItem('user_id'),
        requestTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/reports/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      reportId: string;
      downloadUrl?: string;
      dashboardUrl?: string;
      generationTime: number;
      reportMetadata: any;
    }>>(response);
  }

  // ============================================================================
  // MACHINE LEARNING & AI FEATURES
  // Maps to advanced_ai_tuning_service.py and ML components
  // ============================================================================

  /**
   * Get ML models for optimization
   * Endpoint: GET /scan-optimization/ml/models
   */
  async getMLOptimizationModels(options: {
    modelType?: 'performance' | 'cost' | 'resource' | 'hybrid';
    includeMetrics?: boolean;
    includeTrainingData?: boolean;
    filterByAccuracy?: number; // minimum accuracy threshold
  } = {}): Promise<APIResponse<{
    models: any[];
    recommendations: any[];
    modelComparison: any;
  }>> {
    const params = new URLSearchParams();
    
    if (options.modelType) params.append('model_type', options.modelType);
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.includeTrainingData) params.append('include_training_data', 'true');
    if (options.filterByAccuracy) params.append('filter_by_accuracy', options.filterByAccuracy.toString());

    const response = await fetch(`${this.baseURL}/ml/models?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      models: any[];
      recommendations: any[];
      modelComparison: any;
    }>>(response);
  }

  /**
   * Train custom optimization model
   * Endpoint: POST /scan-optimization/ml/train
   */
  async trainCustomOptimizationModel(
    trainingConfig: {
      modelName: string;
      modelType: string;
      trainingData: any;
      hyperparameters?: any;
      validationSplit: number;
      optimizationTarget: string;
    }
  ): Promise<APIResponse<{
    trainingJobId: string;
    estimatedDuration: number;
    trainingMetrics: any;
    modelId?: string;
  }>> {
    const requestBody = {
      ...trainingConfig,
      metadata: {
        trainedBy: localStorage.getItem('user_id'),
        trainingTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/ml/train`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      trainingJobId: string;
      estimatedDuration: number;
      trainingMetrics: any;
      modelId?: string;
    }>>(response);
  }

  // ============================================================================
  // REAL-TIME MONITORING & WEBSOCKETS
  // ============================================================================

  /**
   * Subscribe to optimization progress updates
   */
  subscribeToOptimizationProgress(
    optimizationId: string,
    callback: (progress: any) => void
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/optimizations/${optimizationId}/progress`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        optimizationId,
        includeMetrics: true,
        includeMLInsights: true
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = (error) => {
      console.error('Optimization WebSocket error:', error);
    };

    const connectionId = `optimization-${optimizationId}`;
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to real-time optimization metrics
   */
  subscribeToOptimizationMetrics(
    subscriptionConfig: {
      engineIds?: string[];
      metricTypes: string[];
      updateInterval?: number;
      callback: (metrics: any) => void;
    }
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/metrics/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        config: subscriptionConfig
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      subscriptionConfig.callback(data);
    };

    const connectionId = this.generateRequestId();
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Close all WebSocket connections
   */
  closeAllConnections(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
  }

  /**
   * Clear optimization cache
   */
  clearCache(): void {
    this.optimizationCache.clear();
  }

  /**
   * Get cached optimization data
   */
  getCachedData(key: string): any {
    return this.optimizationCache.get(key);
  }

  /**
   * Set cached optimization data
   */
  setCachedData(key: string, data: any, ttl: number = 300000): void {
    this.optimizationCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE & UTILITIES
// ============================================================================

export const optimizationAPI = new OptimizationAPIService();
export const optimizationAPIService = optimizationAPI;

// Export lowercase alias for compatibility
export const optimizationApi = optimizationAPI;

/**
 * Enterprise utilities for optimization management
 */
export const OptimizationAPIUtils = {
  /**
   * Validate optimization configuration
   */
  validateOptimizationConfig: (config: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.targets || config.targets.length === 0) {
      errors.push('At least one optimization target is required');
    }

    if (!config.ruleSetId) {
      errors.push('Rule set ID is required');
    }

    if (config.priority && !['low', 'medium', 'high', 'critical'].includes(config.priority)) {
      errors.push('Invalid priority level');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Calculate optimization ROI
   */
  calculateOptimizationROI: (beforeMetrics: any, afterMetrics: any, costs: any): number => {
    const benefits = (afterMetrics.performance - beforeMetrics.performance) * afterMetrics.value;
    const totalCosts = costs.implementation + costs.maintenance;
    return totalCosts > 0 ? (benefits - totalCosts) / totalCosts : 0;
  },

  /**
   * Format optimization results for display
   */
  formatOptimizationResults: (results: any) => ({
    ...results,
    improvementPercentage: Math.round(((results.after - results.before) / results.before) * 100),
    formattedDuration: `${Math.round(results.duration / 60)}m ${results.duration % 60}s`,
    statusColor: results.status === 'completed' ? 'green' : results.status === 'failed' ? 'red' : 'blue',
    confidenceLevel: results.confidence > 0.8 ? 'high' : results.confidence > 0.6 ? 'medium' : 'low'
  }),

  /**
   * Generate optimization summary
   */
  generateOptimizationSummary: (optimizations: any[]) => ({
    total: optimizations.length,
    completed: optimizations.filter(o => o.status === 'completed').length,
    running: optimizations.filter(o => o.status === 'running').length,
    failed: optimizations.filter(o => o.status === 'failed').length,
    avgImprovement: optimizations.reduce((acc, o) => acc + (o.improvement || 0), 0) / optimizations.length,
    totalSavings: optimizations.reduce((acc, o) => acc + (o.savings || 0), 0)
  })
};

export default optimizationAPI;