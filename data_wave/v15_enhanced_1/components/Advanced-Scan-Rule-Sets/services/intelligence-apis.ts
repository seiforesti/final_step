// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE INTELLIGENCE API SERVICE
// Enterprise-Core Implementation with Full Backend Integration
// Maps to: scan_intelligence_service.py (69KB), intelligent_pattern_service.py (40KB)
//          intelligent_scan_coordinator.py (36KB), advanced_ai_tuning_service.py
// ============================================================================

import { 
  IntelligenceEngine,
  IntelligenceCapability,
  IntelligenceMLModel,
  KnowledgeBase,
  PatternRecognitionEngine,
  PatternDetectionResult,
  PredictiveAnalyticsEngine,
  PredictionResult,
  IntelligenceEngineConfig,
  IntelligenceEngineMetrics,
  APIResponse,
  APIError
} from '../types/intelligence.types';

// Enterprise API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const INTELLIGENCE_ENDPOINT = `${API_BASE_URL}/scan-intelligence`;

/**
 * Enterprise-Grade Intelligence API Service
 * Comprehensive integration with backend intelligence services
 * Features: AI/ML Models, Pattern Recognition, Predictive Analytics, Knowledge Management
 */
export class IntelligenceAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  private wsConnections: Map<string, WebSocket>;
  private intelligenceCache: Map<string, any>;
  private mlModelCache: Map<string, any>;
  private retryConfig: { attempts: number; delay: number };

  constructor() {
    this.baseURL = INTELLIGENCE_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '2.0.0',
      'X-Feature-Flags': 'ai-intelligence,ml-models,pattern-recognition,predictive-analytics,knowledge-base'
    };
    this.wsConnections = new Map();
    this.intelligenceCache = new Map();
    this.mlModelCache = new Map();
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
      'X-Intelligence-Context': this.getIntelligenceContext(),
      'X-ML-Preferences': this.getMLPreferences()
    };
  }

  private generateRequestId(): string {
    return `intel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getIntelligenceContext(): string {
    return JSON.stringify({
      userExpertise: this.getUserExpertiseLevel(),
      systemCapabilities: this.getSystemCapabilities(),
      currentWorkload: this.getCurrentWorkloadMetrics(),
      preferences: this.getUserIntelligencePreferences()
    });
  }

  private getUserExpertiseLevel(): string {
    // This would typically come from user profile
    return 'advanced'; // 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }

  private getSystemCapabilities(): any {
    return {
      cpuCores: navigator.hardwareConcurrency || 4,
      memoryGB: (navigator as any).deviceMemory || 8,
      gpuAcceleration: this.checkGPUAcceleration(),
      webAssembly: typeof WebAssembly !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
      mlFrameworks: this.getAvailableMLFrameworks()
    };
  }

  private checkGPUAcceleration(): boolean {
    // Check for WebGL support as proxy for GPU acceleration
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  private getAvailableMLFrameworks(): string[] {
    const frameworks = [];
    
    // Check for TensorFlow.js
    if (typeof window !== 'undefined' && (window as any).tf) {
      frameworks.push('tensorflow.js');
    }
    
    // Check for ONNX.js
    if (typeof window !== 'undefined' && (window as any).onnx) {
      frameworks.push('onnx.js');
    }
    
    // Check for WebAssembly ML support
    if (typeof WebAssembly !== 'undefined') {
      frameworks.push('wasm-ml');
    }
    
    return frameworks;
  }

  private getCurrentWorkloadMetrics(): any {
    return {
      activeIntelligenceJobs: this.wsConnections.size,
      cacheSize: this.intelligenceCache.size,
      mlModelsCached: this.mlModelCache.size,
      timestamp: Date.now()
    };
  }

  private getUserIntelligencePreferences(): any {
    return {
      preferredMLModels: ['neural_network', 'random_forest', 'gradient_boosting'],
      accuracyThreshold: 0.85,
      performanceMode: 'balanced', // 'speed' | 'balanced' | 'accuracy'
      autoTuning: true,
      explainability: 'high' // 'low' | 'medium' | 'high'
    };
  }

  private getMLPreferences(): string {
    return JSON.stringify({
      frameworks: this.getAvailableMLFrameworks(),
      preferences: this.getUserIntelligencePreferences(),
      capabilities: this.getSystemCapabilities()
    });
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const requestId = response.headers.get('X-Request-ID');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Enhanced error handling with intelligence-specific context
      if (response.status >= 500 && this.retryConfig.attempts > 0) {
        await this.delay(this.retryConfig.delay);
        // Retry logic with exponential backoff
      }
      
      throw new APIError({
        code: response.status.toString(),
        message: errorData.message || response.statusText,
        details: {
          ...errorData.details,
          requestId,
          intelligenceContext: errorData.intelligenceContext,
          mlModelRecommendations: errorData.mlModelRecommendations,
          suggestedActions: errorData.suggestedActions,
          timestamp: new Date().toISOString(),
          endpoint: response.url
        },
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();
    
    // Add intelligence-specific metadata
    if (data && typeof data === 'object') {
      data._metadata = {
        requestId,
        responseTime: response.headers.get('X-Response-Time'),
        intelligenceVersion: response.headers.get('X-Intelligence-Version'),
        mlModelVersion: response.headers.get('X-ML-Model-Version'),
        accuracyScore: response.headers.get('X-Accuracy-Score'),
        confidenceLevel: response.headers.get('X-Confidence-Level'),
        cached: response.headers.get('X-Cache-Status') === 'HIT'
      };
    }

    return data;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // INTELLIGENCE ENGINE MANAGEMENT
  // Maps to scan_intelligence_service.py and intelligent_scan_coordinator.py
  // ============================================================================

  /**
   * Get intelligence engines with advanced capabilities
   * Endpoint: GET /scan-intelligence/engines
   */
  async getIntelligenceEngines(options: {
    includeCapabilities?: boolean;
    includeMLModels?: boolean;
    includePerformanceMetrics?: boolean;
    filterByCapability?: string[];
    sortBy?: 'performance' | 'accuracy' | 'speed' | 'popularity';
  } = {}): Promise<APIResponse<IntelligenceEngine[]>> {
    const params = new URLSearchParams();
    
    if (options.includeCapabilities) params.append('include_capabilities', 'true');
    if (options.includeMLModels) params.append('include_ml_models', 'true');
    if (options.includePerformanceMetrics) params.append('include_performance_metrics', 'true');
    if (options.filterByCapability) params.append('filter_by_capability', options.filterByCapability.join(','));
    if (options.sortBy) params.append('sort_by', options.sortBy);

    const response = await fetch(`${this.baseURL}/engines?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<IntelligenceEngine[]>>(response);
  }

  /**
   * Get specific intelligence engine with detailed configuration
   * Endpoint: GET /scan-intelligence/engines/{id}
   */
  async getIntelligenceEngine(
    id: string,
    options: {
      includeMLModels?: boolean;
      includeKnowledgeBase?: boolean;
      includePerformanceHistory?: boolean;
      includeActiveJobs?: boolean;
    } = {}
  ): Promise<APIResponse<IntelligenceEngine & {
    mlModels?: IntelligenceMLModel[];
    knowledgeBase?: KnowledgeBase;
    performanceHistory?: any[];
    activeJobs?: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeMLModels) params.append('include_ml_models', 'true');
    if (options.includeKnowledgeBase) params.append('include_knowledge_base', 'true');
    if (options.includePerformanceHistory) params.append('include_performance_history', 'true');
    if (options.includeActiveJobs) params.append('include_active_jobs', 'true');

    const response = await fetch(`${this.baseURL}/engines/${id}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<IntelligenceEngine & {
      mlModels?: IntelligenceMLModel[];
      knowledgeBase?: KnowledgeBase;
      performanceHistory?: any[];
      activeJobs?: any[];
    }>>(response);
  }

  /**
   * Create intelligence engine with advanced AI configuration
   * Endpoint: POST /scan-intelligence/engines
   */
  async createIntelligenceEngine(
    engine: Omit<IntelligenceEngine, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      autoConfigureMLModels?: boolean;
      enableAdvancedFeatures?: boolean;
      setupKnowledgeBase?: boolean;
      performInitialTraining?: boolean;
    } = {}
  ): Promise<APIResponse<IntelligenceEngine & {
    mlModelConfiguration?: any;
    knowledgeBaseSetup?: any;
    trainingResults?: any;
  }>> {
    const requestBody = {
      ...engine,
      options: {
        auto_configure_ml_models: options.autoConfigureMLModels,
        enable_advanced_features: options.enableAdvancedFeatures,
        setup_knowledge_base: options.setupKnowledgeBase,
        perform_initial_training: options.performInitialTraining
      },
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationContext: this.getIntelligenceContext(),
        systemCapabilities: this.getSystemCapabilities(),
        version: '2.0.0'
      }
    };

    const response = await fetch(`${this.baseURL}/engines`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<IntelligenceEngine & {
      mlModelConfiguration?: any;
      knowledgeBaseSetup?: any;
      trainingResults?: any;
    }>>(response);
  }

  // ============================================================================
  // MACHINE LEARNING MODELS MANAGEMENT
  // Maps to ML model components in backend services
  // ============================================================================

  /**
   * Get available ML models with performance metrics
   * Endpoint: GET /scan-intelligence/ml/models
   */
  async getMLModels(options: {
    modelType?: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'nlp';
    includeMetrics?: boolean;
    includeTrainingData?: boolean;
    filterByAccuracy?: number;
    sortBy?: 'accuracy' | 'speed' | 'memory_usage' | 'popularity';
  } = {}): Promise<APIResponse<IntelligenceMLModel[]>> {
    const params = new URLSearchParams();
    
    if (options.modelType) params.append('model_type', options.modelType);
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.includeTrainingData) params.append('include_training_data', 'true');
    if (options.filterByAccuracy) params.append('filter_by_accuracy', options.filterByAccuracy.toString());
    if (options.sortBy) params.append('sort_by', options.sortBy);

    const response = await fetch(`${this.baseURL}/ml/models?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<IntelligenceMLModel[]>>(response);
  }

  /**
   * Train custom ML model with advanced configuration
   * Endpoint: POST /scan-intelligence/ml/train
   */
  async trainMLModel(
    trainingConfig: {
      modelName: string;
      modelType: string;
      algorithm: string;
      trainingData: any;
      hyperparameters?: any;
      validationSplit: number;
      crossValidation?: boolean;
      featureEngineering?: any;
      autoTuning?: boolean;
    }
  ): Promise<APIResponse<{
    trainingJobId: string;
    estimatedDuration: number;
    modelId?: string;
    trainingMetrics: any;
    hyperparameterSpace?: any;
  }>> {
    const requestBody = {
      ...trainingConfig,
      metadata: {
        trainedBy: localStorage.getItem('user_id'),
        trainingTimestamp: new Date().toISOString(),
        systemCapabilities: this.getSystemCapabilities(),
        userPreferences: this.getUserIntelligencePreferences()
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
      modelId?: string;
      trainingMetrics: any;
      hyperparameterSpace?: any;
    }>>(response);
  }

  /**
   * Get ML model training status and progress
   * Endpoint: GET /scan-intelligence/ml/training/{jobId}/status
   */
  async getMLTrainingStatus(
    jobId: string,
    options: {
      includeMetrics?: boolean;
      includeLogs?: boolean;
      includeVisualization?: boolean;
    } = {}
  ): Promise<APIResponse<{
    status: string;
    progress: number;
    currentEpoch?: number;
    metrics?: any;
    logs?: string[];
    visualization?: any;
    estimatedCompletion: string;
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.includeLogs) params.append('include_logs', 'true');
    if (options.includeVisualization) params.append('include_visualization', 'true');

    const response = await fetch(`${this.baseURL}/ml/training/${jobId}/status?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      status: string;
      progress: number;
      currentEpoch?: number;
      metrics?: any;
      logs?: string[];
      visualization?: any;
      estimatedCompletion: string;
    }>>(response);
  }

  /**
   * Deploy ML model for inference
   * Endpoint: POST /scan-intelligence/ml/models/{id}/deploy
   */
  async deployMLModel(
    modelId: string,
    deploymentConfig: {
      deploymentMode: 'development' | 'staging' | 'production';
      scalingConfig?: any;
      monitoringConfig?: any;
      rollbackSettings?: any;
    }
  ): Promise<APIResponse<{
    deploymentId: string;
    endpointUrl: string;
    deploymentStatus: string;
    monitoringDashboard?: string;
  }>> {
    const requestBody = {
      ...deploymentConfig,
      metadata: {
        deployedBy: localStorage.getItem('user_id'),
        deploymentTimestamp: new Date().toISOString(),
        modelId
      }
    };

    const response = await fetch(`${this.baseURL}/ml/models/${modelId}/deploy`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      deploymentId: string;
      endpointUrl: string;
      deploymentStatus: string;
      monitoringDashboard?: string;
    }>>(response);
  }

  // ============================================================================
  // PATTERN RECOGNITION & DETECTION
  // Maps to intelligent_pattern_service.py
  // ============================================================================

  /**
   * Get pattern recognition engines
   * Endpoint: GET /scan-intelligence/patterns/engines
   */
  async getPatternRecognitionEngines(options: {
    includeAlgorithms?: boolean;
    includePatternLibrary?: boolean;
    includePerformanceMetrics?: boolean;
    filterByAccuracy?: number;
  } = {}): Promise<APIResponse<PatternRecognitionEngine[]>> {
    const params = new URLSearchParams();
    
    if (options.includeAlgorithms) params.append('include_algorithms', 'true');
    if (options.includePatternLibrary) params.append('include_pattern_library', 'true');
    if (options.includePerformanceMetrics) params.append('include_performance_metrics', 'true');
    if (options.filterByAccuracy) params.append('filter_by_accuracy', options.filterByAccuracy.toString());

    const response = await fetch(`${this.baseURL}/patterns/engines?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<PatternRecognitionEngine[]>>(response);
  }

  /**
   * Detect patterns in data with AI analysis
   * Endpoint: POST /scan-intelligence/patterns/detect
   */
  async detectPatterns(
    detectionConfig: {
      dataSource: any;
      patternTypes: string[];
      algorithms?: string[];
      confidenceThreshold?: number;
      maxPatterns?: number;
      includeAnomalies?: boolean;
      realTimeMode?: boolean;
    }
  ): Promise<APIResponse<{
    detectionId: string;
    patterns: PatternDetectionResult[];
    anomalies?: any[];
    insights: any[];
    recommendations: any[];
  }>> {
    const requestBody = {
      ...detectionConfig,
      metadata: {
        requestedBy: localStorage.getItem('user_id'),
        requestTimestamp: new Date().toISOString(),
        systemCapabilities: this.getSystemCapabilities()
      }
    };

    const response = await fetch(`${this.baseURL}/patterns/detect`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      detectionId: string;
      patterns: PatternDetectionResult[];
      anomalies?: any[];
      insights: any[];
      recommendations: any[];
    }>>(response);
  }

  /**
   * Get pattern detection results with analysis
   * Endpoint: GET /scan-intelligence/patterns/detections/{id}/results
   */
  async getPatternDetectionResults(
    detectionId: string,
    options: {
      includeVisualization?: boolean;
      includeStatistics?: boolean;
      includeRecommendations?: boolean;
      format?: 'json' | 'csv' | 'visualization';
    } = {}
  ): Promise<APIResponse<{
    results: PatternDetectionResult[];
    statistics?: any;
    visualization?: any;
    recommendations?: any[];
    metadata: any;
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeVisualization) params.append('include_visualization', 'true');
    if (options.includeStatistics) params.append('include_statistics', 'true');
    if (options.includeRecommendations) params.append('include_recommendations', 'true');
    if (options.format) params.append('format', options.format);

    const response = await fetch(`${this.baseURL}/patterns/detections/${detectionId}/results?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      results: PatternDetectionResult[];
      statistics?: any;
      visualization?: any;
      recommendations?: any[];
      metadata: any;
    }>>(response);
  }

  // ============================================================================
  // PREDICTIVE ANALYTICS
  // Maps to predictive analytics components in backend
  // ============================================================================

  /**
   * Get predictive analytics engines
   * Endpoint: GET /scan-intelligence/predictive/engines
   */
  async getPredictiveAnalyticsEngines(options: {
    includeModels?: boolean;
    includeCapabilities?: boolean;
    filterByAccuracy?: number;
    modelType?: 'time_series' | 'classification' | 'regression' | 'anomaly';
  } = {}): Promise<APIResponse<PredictiveAnalyticsEngine[]>> {
    const params = new URLSearchParams();
    
    if (options.includeModels) params.append('include_models', 'true');
    if (options.includeCapabilities) params.append('include_capabilities', 'true');
    if (options.filterByAccuracy) params.append('filter_by_accuracy', options.filterByAccuracy.toString());
    if (options.modelType) params.append('model_type', options.modelType);

    const response = await fetch(`${this.baseURL}/predictive/engines?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<PredictiveAnalyticsEngine[]>>(response);
  }

  /**
   * Create prediction job with advanced analytics
   * Endpoint: POST /scan-intelligence/predictive/predict
   */
  async createPrediction(
    predictionConfig: {
      engineId: string;
      inputData: any;
      predictionType: 'single' | 'batch' | 'streaming';
      timeHorizon?: number;
      confidenceInterval?: number;
      includeExplanation?: boolean;
      customParameters?: any;
    }
  ): Promise<APIResponse<{
    predictionId: string;
    predictions: PredictionResult[];
    confidence: number;
    explanation?: any;
    metadata: any;
  }>> {
    const requestBody = {
      ...predictionConfig,
      metadata: {
        requestedBy: localStorage.getItem('user_id'),
        requestTimestamp: new Date().toISOString(),
        systemContext: this.getSystemCapabilities()
      }
    };

    const response = await fetch(`${this.baseURL}/predictive/predict`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      predictionId: string;
      predictions: PredictionResult[];
      confidence: number;
      explanation?: any;
      metadata: any;
    }>>(response);
  }

  /**
   * Get prediction results with advanced analysis
   * Endpoint: GET /scan-intelligence/predictive/predictions/{id}/results
   */
  async getPredictionResults(
    predictionId: string,
    options: {
      includeConfidenceIntervals?: boolean;
      includeFeatureImportance?: boolean;
      includeVisualization?: boolean;
      includeComparison?: boolean;
    } = {}
  ): Promise<APIResponse<{
    results: PredictionResult[];
    confidenceIntervals?: any;
    featureImportance?: any;
    visualization?: any;
    comparison?: any;
    metadata: any;
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeConfidenceIntervals) params.append('include_confidence_intervals', 'true');
    if (options.includeFeatureImportance) params.append('include_feature_importance', 'true');
    if (options.includeVisualization) params.append('include_visualization', 'true');
    if (options.includeComparison) params.append('include_comparison', 'true');

    const response = await fetch(`${this.baseURL}/predictive/predictions/${predictionId}/results?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      results: PredictionResult[];
      confidenceIntervals?: any;
      featureImportance?: any;
      visualization?: any;
      comparison?: any;
      metadata: any;
    }>>(response);
  }

  // ============================================================================
  // KNOWLEDGE BASE MANAGEMENT
  // Maps to knowledge base components in backend
  // ============================================================================

  /**
   * Get knowledge bases with domain information
   * Endpoint: GET /scan-intelligence/knowledge/bases
   */
  async getKnowledgeBases(options: {
    includeDomains?: boolean;
    includeStatistics?: boolean;
    filterByDomain?: string[];
    sortBy?: 'size' | 'accuracy' | 'freshness' | 'usage';
  } = {}): Promise<APIResponse<KnowledgeBase[]>> {
    const params = new URLSearchParams();
    
    if (options.includeDomains) params.append('include_domains', 'true');
    if (options.includeStatistics) params.append('include_statistics', 'true');
    if (options.filterByDomain) params.append('filter_by_domain', options.filterByDomain.join(','));
    if (options.sortBy) params.append('sort_by', options.sortBy);

    const response = await fetch(`${this.baseURL}/knowledge/bases?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<KnowledgeBase[]>>(response);
  }

  /**
   * Query knowledge base with semantic search
   * Endpoint: POST /scan-intelligence/knowledge/query
   */
  async queryKnowledgeBase(
    queryConfig: {
      knowledgeBaseId: string;
      query: string;
      queryType: 'semantic' | 'exact' | 'fuzzy' | 'hybrid';
      maxResults?: number;
      confidenceThreshold?: number;
      includeExplanation?: boolean;
      contextFilters?: any;
    }
  ): Promise<APIResponse<{
    queryId: string;
    results: any[];
    confidence: number;
    explanation?: any;
    relatedQueries?: string[];
    metadata: any;
  }>> {
    const requestBody = {
      ...queryConfig,
      metadata: {
        queriedBy: localStorage.getItem('user_id'),
        queryTimestamp: new Date().toISOString()
      }
    };

    const response = await fetch(`${this.baseURL}/knowledge/query`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      queryId: string;
      results: any[];
      confidence: number;
      explanation?: any;
      relatedQueries?: string[];
      metadata: any;
    }>>(response);
  }

  /**
   * Update knowledge base with new information
   * Endpoint: POST /scan-intelligence/knowledge/bases/{id}/update
   */
  async updateKnowledgeBase(
    knowledgeBaseId: string,
    updateConfig: {
      newData: any;
      updateType: 'incremental' | 'replacement' | 'merge';
      validationLevel: 'basic' | 'strict' | 'comprehensive';
      autoIndex?: boolean;
    }
  ): Promise<APIResponse<{
    updateId: string;
    status: string;
    validationResults: any;
    indexingStatus?: string;
    metadata: any;
  }>> {
    const requestBody = {
      ...updateConfig,
      metadata: {
        updatedBy: localStorage.getItem('user_id'),
        updateTimestamp: new Date().toISOString(),
        knowledgeBaseId
      }
    };

    const response = await fetch(`${this.baseURL}/knowledge/bases/${knowledgeBaseId}/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      updateId: string;
      status: string;
      validationResults: any;
      indexingStatus?: string;
      metadata: any;
    }>>(response);
  }

  // ============================================================================
  // INTELLIGENCE ANALYTICS & INSIGHTS
  // ============================================================================

  /**
   * Get intelligence analytics with advanced insights
   * Endpoint: GET /scan-intelligence/analytics
   */
  async getIntelligenceAnalytics(options: {
    timeRange?: { start: string; end: string };
    engineIds?: string[];
    metricTypes?: string[];
    aggregationLevel?: 'minute' | 'hour' | 'day' | 'week' | 'month';
    includeMLInsights?: boolean;
    includeTrends?: boolean;
    includeForecasting?: boolean;
  } = {}): Promise<APIResponse<{
    performanceMetrics: any;
    accuracyMetrics: any;
    usageStatistics: any;
    mlInsights?: any;
    trends?: any[];
    forecasts?: any[];
    recommendations: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.engineIds) params.append('engine_ids', options.engineIds.join(','));
    if (options.metricTypes) params.append('metric_types', options.metricTypes.join(','));
    if (options.aggregationLevel) params.append('aggregation_level', options.aggregationLevel);
    if (options.includeMLInsights) params.append('include_ml_insights', 'true');
    if (options.includeTrends) params.append('include_trends', 'true');
    if (options.includeForecasting) params.append('include_forecasting', 'true');

    const response = await fetch(`${this.baseURL}/analytics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      performanceMetrics: any;
      accuracyMetrics: any;
      usageStatistics: any;
      mlInsights?: any;
      trends?: any[];
      forecasts?: any[];
      recommendations: any[];
    }>>(response);
  }

  /**
   * Generate intelligence insights report
   * Endpoint: POST /scan-intelligence/insights/generate
   */
  async generateIntelligenceInsights(
    insightsConfig: {
      scope: 'engine' | 'model' | 'pattern' | 'prediction' | 'comprehensive';
      scopeId?: string;
      timeRange: { start: string; end: string };
      analysisDepth: 'basic' | 'detailed' | 'comprehensive';
      includeRecommendations: boolean;
      customMetrics?: string[];
    }
  ): Promise<APIResponse<{
    insightsId: string;
    insights: any[];
    recommendations: any[];
    visualizations: any[];
    reportUrl?: string;
  }>> {
    const requestBody = {
      ...insightsConfig,
      metadata: {
        requestedBy: localStorage.getItem('user_id'),
        requestTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/insights/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      insightsId: string;
      insights: any[];
      recommendations: any[];
      visualizations: any[];
      reportUrl?: string;
    }>>(response);
  }

  // ============================================================================
  // REAL-TIME INTELLIGENCE MONITORING
  // ============================================================================

  /**
   * Subscribe to intelligence engine metrics
   */
  subscribeToIntelligenceMetrics(
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
        config: subscriptionConfig,
        metadata: {
          userId: localStorage.getItem('user_id'),
          subscriptionTimestamp: new Date().toISOString()
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      subscriptionConfig.callback(data);
    };

    ws.onerror = (error) => {
      console.error('Intelligence WebSocket error:', error);
    };

    const connectionId = this.generateRequestId();
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to ML model training progress
   */
  subscribeToMLTrainingProgress(
    trainingJobId: string,
    callback: (progress: any) => void
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/ml/training/${trainingJobId}/progress`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        trainingJobId,
        includeMetrics: true,
        includeVisualization: true
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    const connectionId = `training-${trainingJobId}`;
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to pattern detection updates
   */
  subscribeToPatternDetection(
    detectionId: string,
    callback: (update: any) => void
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/patterns/detections/${detectionId}/updates`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        detectionId,
        includeVisualization: true
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    const connectionId = `pattern-${detectionId}`;
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
   * Clear intelligence cache
   */
  clearCache(): void {
    this.intelligenceCache.clear();
    this.mlModelCache.clear();
  }

  /**
   * Get cached intelligence data
   */
  getCachedData(key: string): any {
    return this.intelligenceCache.get(key);
  }

  /**
   * Set cached intelligence data
   */
  setCachedData(key: string, data: any, ttl: number = 300000): void {
    this.intelligenceCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cached ML model
   */
  getCachedMLModel(modelId: string): any {
    return this.mlModelCache.get(modelId);
  }

  /**
   * Cache ML model
   */
  cacheMLModel(modelId: string, model: any, ttl: number = 3600000): void {
    this.mlModelCache.set(modelId, {
      model,
      timestamp: Date.now(),
      ttl
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE & UTILITIES
// ============================================================================

export const intelligenceAPI = new IntelligenceAPIService();

/**
 * Enterprise utilities for intelligence management
 */
export const IntelligenceAPIUtils = {
  /**
   * Validate intelligence configuration
   */
  validateIntelligenceConfig: (config: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.engineId && !config.capabilities) {
      errors.push('Either engine ID or capabilities must be specified');
    }

    if (config.accuracyThreshold && (config.accuracyThreshold < 0 || config.accuracyThreshold > 1)) {
      errors.push('Accuracy threshold must be between 0 and 1');
    }

    if (config.confidenceThreshold && (config.confidenceThreshold < 0 || config.confidenceThreshold > 1)) {
      errors.push('Confidence threshold must be between 0 and 1');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Calculate model performance metrics
   */
  calculateModelPerformance: (predictions: any[], actuals: any[]): any => {
    if (predictions.length !== actuals.length) {
      throw new Error('Predictions and actuals must have the same length');
    }

    // Calculate basic metrics
    let correct = 0;
    let total = predictions.length;
    
    for (let i = 0; i < total; i++) {
      if (predictions[i] === actuals[i]) {
        correct++;
      }
    }

    const accuracy = correct / total;
    
    return {
      accuracy,
      total,
      correct,
      incorrect: total - correct,
      errorRate: 1 - accuracy
    };
  },

  /**
   * Format intelligence results for display
   */
  formatIntelligenceResults: (results: any) => ({
    ...results,
    accuracyPercentage: Math.round((results.accuracy || 0) * 100),
    confidenceLevel: results.confidence > 0.8 ? 'high' : results.confidence > 0.6 ? 'medium' : 'low',
    statusColor: results.status === 'completed' ? 'green' : results.status === 'failed' ? 'red' : 'blue',
    formattedDuration: results.duration ? `${Math.round(results.duration / 1000)}s` : 'N/A'
  }),

  /**
   * Generate intelligence summary
   */
  generateIntelligenceSummary: (engines: any[], models: any[], patterns: any[]) => ({
    totalEngines: engines.length,
    activeEngines: engines.filter(e => e.status === 'active').length,
    totalModels: models.length,
    trainedModels: models.filter(m => m.status === 'trained').length,
    totalPatterns: patterns.length,
    avgAccuracy: models.reduce((acc, m) => acc + (m.accuracy || 0), 0) / models.length,
    avgConfidence: patterns.reduce((acc, p) => acc + (p.confidence || 0), 0) / patterns.length
  })
};

// Export service instance
export const intelligenceAPIService = new IntelligenceAPIService();

export default intelligenceAPI;