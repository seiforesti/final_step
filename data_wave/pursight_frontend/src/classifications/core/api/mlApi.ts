import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  MLModel, 
  TrainingJob, 
  Prediction, 
  MLMetrics, 
  HyperparameterConfig,
  MLDriftDetection,
  FeatureEngineering,
  ModelEnsemble,
  MLAnalytics,
  MLModelCreate,
  MLModelUpdate,
  TrainingJobCreate,
  PredictionRequest,
  MLBulkOperation,
  MLOptimizationRequest,
  MLModelComparison,
  MLDeploymentConfig,
  MLMonitoringConfig,
  MLFeatureImportance,
  MLModelValidation,
  MLResourceUsage
} from '../types';

// Advanced caching interface for ML operations
interface MLCacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  metadata?: Record<string, any>;
}

interface MLRequestInterceptor {
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onRequestError?: (error: any) => any;
}

interface MLResponseInterceptor {
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onResponseError?: (error: any) => any;
}

interface MLRetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
  exponentialBackoff?: boolean;
}

interface MLApiConfig {
  baseURL: string;
  timeout: number;
  retryConfig: MLRetryConfig;
  cacheConfig: {
    enabled: boolean;
    defaultTTL: number;
    maxEntries: number;
  };
  interceptors: {
    request: MLRequestInterceptor[];
    response: MLResponseInterceptor[];
  };
}

class MLApiClient {
  private client: AxiosInstance;
  private cache: Map<string, MLCacheEntry<any>> = new Map();
  private config: MLApiConfig;
  private requestId = 0;

  constructor(config: MLApiConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupRetryLogic();
    this.startCacheCleanup();
  }

  private setupInterceptors(): void {
    // Request interceptors
    this.config.interceptors.request.forEach(interceptor => {
      this.client.interceptors.request.use(
        interceptor.onRequest,
        interceptor.onRequestError
      );
    });

    // Response interceptors
    this.config.interceptors.response.forEach(interceptor => {
      this.client.interceptors.response.use(
        interceptor.onResponse,
        interceptor.onResponseError
      );
    });

    // Built-in request ID interceptor
    this.client.interceptors.request.use(config => {
      config.headers = {
        ...config.headers,
        'X-Request-ID': `ml-${++this.requestId}-${Date.now()}`
      };
      return config;
    });
  }

  private setupRetryLogic(): void {
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const { retries, retryDelay, retryCondition, exponentialBackoff } = this.config.retryConfig;
        
        if (
          error.config &&
          !error.config.__retryCount &&
          retries > 0 &&
          (!retryCondition || retryCondition(error))
        ) {
          error.config.__retryCount = 0;
        }

        if (error.config && error.config.__retryCount < retries) {
          error.config.__retryCount += 1;
          
          const delay = exponentialBackoff 
            ? retryDelay * Math.pow(2, error.config.__retryCount - 1)
            : retryDelay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(error.config);
        }

        return Promise.reject(error);
      }
    );
  }

  private startCacheCleanup(): void {
    if (this.config.cacheConfig.enabled) {
      setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
          if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
          }
        }
      }, 60000); // Cleanup every minute
    }
  }

  private getCacheKey(method: string, url: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
  }

  private getCachedData<T>(cacheKey: string): T | null {
    if (!this.config.cacheConfig.enabled) return null;
    
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }

  private setCachedData<T>(cacheKey: string, data: T, ttl?: number): void {
    if (!this.config.cacheConfig.enabled) return;
    
    if (this.cache.size >= this.config.cacheConfig.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheConfig.defaultTTL,
    });
  }

  // ML Model Management
  async getMLModels(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    modelType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ models: MLModel[]; total: number; page: number; pageSize: number }> {
    const cacheKey = this.getCacheKey('GET', '/v2/ml/models', params);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/v2/ml/models', { params });
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  async getMLModel(modelId: string): Promise<MLModel> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/models/${modelId}`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/models/${modelId}`);
    this.setCachedData(cacheKey, response.data, 600000); // 10 minutes
    return response.data;
  }

  async createMLModel(model: MLModelCreate): Promise<MLModel> {
    const response = await this.client.post('/v2/ml/models', model);
    this.invalidateMLModelCaches();
    return response.data;
  }

  async updateMLModel(modelId: string, updates: MLModelUpdate): Promise<MLModel> {
    const response = await this.client.put(`/v2/ml/models/${modelId}`, updates);
    this.invalidateMLModelCaches();
    this.cache.delete(this.getCacheKey('GET', `/v2/ml/models/${modelId}`));
    return response.data;
  }

  async deleteMLModel(modelId: string): Promise<void> {
    await this.client.delete(`/v2/ml/models/${modelId}`);
    this.invalidateMLModelCaches();
    this.cache.delete(this.getCacheKey('GET', `/v2/ml/models/${modelId}`));
  }

  async deployMLModel(modelId: string, config: MLDeploymentConfig): Promise<MLModel> {
    const response = await this.client.post(`/v2/ml/models/${modelId}/deploy`, config);
    this.invalidateMLModelCaches();
    return response.data;
  }

  async retireMLModel(modelId: string): Promise<MLModel> {
    const response = await this.client.post(`/v2/ml/models/${modelId}/retire`);
    this.invalidateMLModelCaches();
    return response.data;
  }

  // Training Job Management
  async getTrainingJobs(params?: {
    page?: number;
    pageSize?: number;
    modelId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ jobs: TrainingJob[]; total: number; page: number; pageSize: number }> {
    const cacheKey = this.getCacheKey('GET', '/v2/ml/training-jobs', params);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/v2/ml/training-jobs', { params });
    this.setCachedData(cacheKey, response.data, 120000); // 2 minutes
    return response.data;
  }

  async getTrainingJob(jobId: string): Promise<TrainingJob> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/training-jobs/${jobId}`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/training-jobs/${jobId}`);
    this.setCachedData(cacheKey, response.data, 60000); // 1 minute for training jobs
    return response.data;
  }

  async createTrainingJob(job: TrainingJobCreate): Promise<TrainingJob> {
    const response = await this.client.post('/v2/ml/training-jobs', job);
    this.invalidateTrainingJobCaches();
    return response.data;
  }

  async stopTrainingJob(jobId: string): Promise<TrainingJob> {
    const response = await this.client.post(`/v2/ml/training-jobs/${jobId}/stop`);
    this.invalidateTrainingJobCaches();
    return response.data;
  }

  async getTrainingJobLogs(jobId: string, params?: { 
    level?: string; 
    limit?: number; 
    offset?: number 
  }): Promise<{ logs: string[]; total: number }> {
    const response = await this.client.get(`/v2/ml/training-jobs/${jobId}/logs`, { params });
    return response.data;
  }

  async getTrainingJobMetrics(jobId: string): Promise<MLMetrics> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/training-jobs/${jobId}/metrics`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/training-jobs/${jobId}/metrics`);
    this.setCachedData(cacheKey, response.data, 30000); // 30 seconds
    return response.data;
  }

  // Prediction Management
  async makePrediction(request: PredictionRequest): Promise<Prediction> {
    const response = await this.client.post('/v2/ml/predictions', request);
    return response.data;
  }

  async getPredictions(params?: {
    page?: number;
    pageSize?: number;
    modelId?: string;
    startDate?: string;
    endDate?: string;
    confidence?: number;
  }): Promise<{ predictions: Prediction[]; total: number; page: number; pageSize: number }> {
    const cacheKey = this.getCacheKey('GET', '/v2/ml/predictions', params);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/v2/ml/predictions', { params });
    this.setCachedData(cacheKey, response.data, 180000); // 3 minutes
    return response.data;
  }

  async getPrediction(predictionId: string): Promise<Prediction> {
    const response = await this.client.get(`/v2/ml/predictions/${predictionId}`);
    return response.data;
  }

  async provideFeedback(predictionId: string, feedback: {
    correctClassification?: string;
    confidence?: number;
    notes?: string;
  }): Promise<Prediction> {
    const response = await this.client.post(`/v2/ml/predictions/${predictionId}/feedback`, feedback);
    return response.data;
  }

  // Hyperparameter Optimization
  async optimizeHyperparameters(request: MLOptimizationRequest): Promise<HyperparameterConfig> {
    const response = await this.client.post('/v2/ml/hyperparameter-optimization', request);
    return response.data;
  }

  async getHyperparameterOptimizations(modelId: string): Promise<HyperparameterConfig[]> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/models/${modelId}/hyperparameters`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/models/${modelId}/hyperparameters`);
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  // Drift Detection
  async getDriftDetection(modelId: string, params?: {
    startDate?: string;
    endDate?: string;
    threshold?: number;
  }): Promise<MLDriftDetection> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/models/${modelId}/drift`, params);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/models/${modelId}/drift`, { params });
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  async configureDriftDetection(modelId: string, config: MLMonitoringConfig): Promise<MLDriftDetection> {
    const response = await this.client.post(`/v2/ml/models/${modelId}/drift/configure`, config);
    return response.data;
  }

  // Feature Engineering
  async getFeatureEngineering(modelId: string): Promise<FeatureEngineering> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/models/${modelId}/features`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/models/${modelId}/features`);
    this.setCachedData(cacheKey, response.data, 600000); // 10 minutes
    return response.data;
  }

  async updateFeatureEngineering(modelId: string, features: Partial<FeatureEngineering>): Promise<FeatureEngineering> {
    const response = await this.client.put(`/v2/ml/models/${modelId}/features`, features);
    this.cache.delete(this.getCacheKey('GET', `/v2/ml/models/${modelId}/features`));
    return response.data;
  }

  async getFeatureImportance(modelId: string): Promise<MLFeatureImportance> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/models/${modelId}/feature-importance`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/models/${modelId}/feature-importance`);
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  // Model Ensemble
  async createEnsemble(ensemble: Omit<ModelEnsemble, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModelEnsemble> {
    const response = await this.client.post('/v2/ml/ensembles', ensemble);
    this.invalidateEnsembleCaches();
    return response.data;
  }

  async getEnsembles(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ ensembles: ModelEnsemble[]; total: number }> {
    const cacheKey = this.getCacheKey('GET', '/v2/ml/ensembles', params);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/v2/ml/ensembles', { params });
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  async getEnsemble(ensembleId: string): Promise<ModelEnsemble> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/ensembles/${ensembleId}`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/ensembles/${ensembleId}`);
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  async updateEnsemble(ensembleId: string, updates: Partial<ModelEnsemble>): Promise<ModelEnsemble> {
    const response = await this.client.put(`/v2/ml/ensembles/${ensembleId}`, updates);
    this.invalidateEnsembleCaches();
    return response.data;
  }

  async deleteEnsemble(ensembleId: string): Promise<void> {
    await this.client.delete(`/v2/ml/ensembles/${ensembleId}`);
    this.invalidateEnsembleCaches();
  }

  // Model Comparison
  async compareModels(modelIds: string[], metrics: string[]): Promise<MLModelComparison> {
    const response = await this.client.post('/v2/ml/models/compare', {
      modelIds,
      metrics
    });
    return response.data;
  }

  // Model Validation
  async validateModel(modelId: string, validationConfig: {
    testDatasetId?: string;
    validationType: 'cross_validation' | 'holdout' | 'bootstrap';
    folds?: number;
    testSize?: number;
    metrics: string[];
  }): Promise<MLModelValidation> {
    const response = await this.client.post(`/v2/ml/models/${modelId}/validate`, validationConfig);
    return response.data;
  }

  async getModelValidations(modelId: string): Promise<MLModelValidation[]> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/models/${modelId}/validations`);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/models/${modelId}/validations`);
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  // Analytics and Monitoring
  async getMLAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    modelIds?: string[];
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<MLAnalytics> {
    const cacheKey = this.getCacheKey('GET', '/v2/ml/analytics', params);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/v2/ml/analytics', { params });
    this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    return response.data;
  }

  async getResourceUsage(params?: {
    startDate?: string;
    endDate?: string;
    resourceType?: 'cpu' | 'memory' | 'gpu';
  }): Promise<MLResourceUsage> {
    const cacheKey = this.getCacheKey('GET', '/v2/ml/resource-usage', params);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/v2/ml/resource-usage', { params });
    this.setCachedData(cacheKey, response.data, 60000); // 1 minute
    return response.data;
  }

  async getModelPerformanceMetrics(modelId: string, timeRange?: {
    startDate: string;
    endDate: string;
  }): Promise<MLMetrics> {
    const cacheKey = this.getCacheKey('GET', `/v2/ml/models/${modelId}/performance`, timeRange);
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/v2/ml/models/${modelId}/performance`, {
      params: timeRange
    });
    this.setCachedData(cacheKey, response.data, 180000); // 3 minutes
    return response.data;
  }

  // Bulk Operations
  async performBulkOperation(operation: MLBulkOperation): Promise<{ operationId: string; status: string }> {
    const response = await this.client.post('/v2/ml/bulk-operations', operation);
    this.invalidateMLModelCaches();
    return response.data;
  }

  async getBulkOperationStatus(operationId: string): Promise<{
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    results?: any;
    error?: string;
  }> {
    const response = await this.client.get(`/v2/ml/bulk-operations/${operationId}`);
    return response.data;
  }

  // Auto ML
  async startAutoML(config: {
    datasetId: string;
    targetColumn: string;
    problemType: 'classification' | 'regression';
    timeLimit?: number;
    evaluationMetric?: string;
    featureEngineering?: boolean;
    hyperparameterOptimization?: boolean;
  }): Promise<{ jobId: string; status: string }> {
    const response = await this.client.post('/v2/ml/automl', config);
    return response.data;
  }

  async getAutoMLStatus(jobId: string): Promise<{
    jobId: string;
    status: 'running' | 'completed' | 'failed';
    progress: number;
    bestModel?: MLModel;
    leaderboard?: Array<{ modelId: string; score: number; metrics: Record<string, number> }>;
  }> {
    const response = await this.client.get(`/v2/ml/automl/${jobId}`);
    return response.data;
  }

  // Cache management
  private invalidateMLModelCaches(): void {
    for (const key of this.cache.keys()) {
      if (key.includes('/v2/ml/models')) {
        this.cache.delete(key);
      }
    }
  }

  private invalidateTrainingJobCaches(): void {
    for (const key of this.cache.keys()) {
      if (key.includes('/v2/ml/training-jobs')) {
        this.cache.delete(key);
      }
    }
  }

  private invalidateEnsembleCaches(): void {
    for (const key of this.cache.keys()) {
      if (key.includes('/v2/ml/ensembles')) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; size: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      size: JSON.stringify(entry.data).length
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.cacheConfig.maxEntries,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      entries
    };
  }
}

// Default configuration
const defaultMLApiConfig: MLApiConfig = {
  baseURL: (typeof window !== 'undefined' && (window as any).ENV?.REACT_APP_API_BASE_URL) || '/api/proxy',
  timeout: 30000,
  retryConfig: {
    retries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    retryCondition: (error) => {
      return !error.response || error.response.status >= 500;
    }
  },
  cacheConfig: {
    enabled: true,
    defaultTTL: 300000, // 5 minutes
    maxEntries: 1000
  },
  interceptors: {
    request: [{
      onRequest: (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          };
        }
        return config;
      }
    }],
    response: [{
      onResponse: (response) => {
        // Log successful requests in development
        if ((typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development') {
          console.log(`ML API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
      },
      onResponseError: (error) => {
        // Log errors and handle common error scenarios
        if ((typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development') {
          console.error(`ML API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    }]
  }
};

// ============================================================================
// MISSING ML API METHODS - ADVANCED IMPLEMENTATIONS
// ============================================================================

// Add missing methods to MLApiClient class
class EnhancedMLApiClient extends MLApiClient {
  // Model Health and Management
  async getModelHealthMetrics(): Promise<any> {
    return this.get('/models/health-metrics');
  }

  async startRetraining(config: any): Promise<any> {
    return this.post('/models/retrain', config);
  }

  async scaleModel(config: any): Promise<any> {
    return this.post('/models/scale', config);
  }

  async predictWorkloadTrends(): Promise<any> {
    return this.get('/analytics/workload-trends');
  }

  async searchModels(config: any): Promise<any> {
    return this.post('/search/models', config);
  }

  async prepareTrainingData(config: any): Promise<any> {
    return this.post('/data/prepare-training', config);
  }

  async optimizeHyperparameters(config: any): Promise<any> {
    return this.post('/models/optimize-hyperparameters', config);
  }

  async startTraining(config: any): Promise<any> {
    return this.post('/models/train', config);
  }

  async validateModel(config: any): Promise<any> {
    return this.post('/models/validate', config);
  }

  async setupDriftDetection(config: any): Promise<any> {
    return this.post('/models/drift-detection', config);
  }

  async deployModel(config: any): Promise<any> {
    return this.post('/models/deploy', config);
  }

  async getMLModels(filter?: any): Promise<any> {
    const params = filter ? new URLSearchParams(filter).toString() : '';
    return this.get(`/models${params ? '?' + params : ''}`);
  }

  async getMLModel(id: string): Promise<any> {
    return this.get(`/models/${id}`);
  }

  // Feature Engineering Methods
  async getAllFeatureEngineering(filters?: any): Promise<any> {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    return this.get(`/feature-engineering${params ? '?' + params : ''}`);
  }

  async getFeatureEngineeringProject(projectId: string): Promise<any> {
    return this.get(`/feature-engineering/${projectId}`);
  }

  async createFeatureEngineeringProject(config: any): Promise<any> {
    return this.post('/feature-engineering', config);
  }

  async updateFeatureEngineeringProject(projectId: string, config: any): Promise<any> {
    return this.put(`/feature-engineering/${projectId}`, config);
  }

  async deleteFeatureEngineeringProject(projectId: string): Promise<any> {
    return this.delete(`/feature-engineering/${projectId}`);
  }

  async executeFeaturePipeline(projectId: string, config?: any): Promise<any> {
    return this.post(`/feature-engineering/${projectId}/execute`, config || {});
  }

  // Data Quality Methods
  async assessDataQuality(datasetId: string, config: any): Promise<any> {
    return this.post(`/intelligence/assess-data-quality/${datasetId}`, config);
  }

  async getDataQualityHistory(datasetId: string, timeRange?: any): Promise<any> {
    const params = timeRange ? new URLSearchParams(timeRange).toString() : '';
    return this.get(`/data-quality/${datasetId}/history${params ? '?' + params : ''}`);
  }

  async generateQualityReport(datasetId: string, config?: any): Promise<any> {
    return this.post(`/data-quality/${datasetId}/report`, config || {});
  }

  // Workflow Step Execution
  async executeMLStep(stepId: string, config?: any): Promise<any> {
    return this.post(`/workflows/steps/${stepId}/execute`, { type: 'ml', config });
  }
}

// Export singleton instance with enhanced methods
export const mlApi = new EnhancedMLApiClient(defaultMLApiConfig);
export { MLApiClient, EnhancedMLApiClient };
export type { MLApiConfig, MLCacheEntry, MLRequestInterceptor, MLResponseInterceptor, MLRetryConfig };

// Default export for compatibility
export default EnhancedMLApiClient;