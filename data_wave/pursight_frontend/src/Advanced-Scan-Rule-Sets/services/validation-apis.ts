/**
 * Validation API Service
 * Advanced enterprise-grade API service for validation engines, rule validation,
 * compliance checking, and quality assurance with real-time monitoring
 */

import { 
  ValidationEngine,
  ValidationRule,
  ValidationResult,
  ValidationProcess,
  ValidationWorkflow,
  ValidationStage,
  ComplianceValidation,
  PerformanceValidation,
  ValidationCapability,
  ValidationFeature,
  ValidationCondition
} from '../types/validation.types';

import {
  APIResponse,
  APIError,
  PaginationInfo,
  SortConfig,
  SearchConfig,
  ExportConfig
} from '../types/orchestration.types';

/**
 * Enhanced Validation Configuration
 */
interface ValidationConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableRealTime: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  enableMetrics: boolean;
  enableCompliance: boolean;
  enableQuality: boolean;
  batchSize: number;
  maxConcurrentValidations: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  validationThreshold: number;
  complianceStandards: string[];
  qualityGates: string[];
}

/**
 * Validation Request Parameters
 */
interface ValidationRequestParams {
  engineId?: string;
  validatorId?: string;
  ruleId?: string;
  workflowId?: string;
  templateId?: string;
  includeMetrics?: boolean;
  includeAnalytics?: boolean;
  includeCompliance?: boolean;
  includeQuality?: boolean;
  includePerformance?: boolean;
  realTimeUpdates?: boolean;
  pagination?: PaginationInfo;
  sorting?: SortConfig;
  search?: SearchConfig;
  filters?: Record<string, any>;
  export?: ExportConfig;
}

/**
 * Advanced Validation Request
 */
interface AdvancedValidationRequest {
  data: any;
  rules?: string[];
  validators?: string[];
  engines?: string[];
  compliance?: string[];
  quality?: string[];
  options?: {
    strictMode?: boolean;
    failFast?: boolean;
    includeWarnings?: boolean;
    includeRecommendations?: boolean;
    enableOptimization?: boolean;
    enableMonitoring?: boolean;
    customValidators?: any[];
    contextData?: Record<string, any>;
    validationLevel?: 'basic' | 'standard' | 'comprehensive' | 'enterprise';
    reportFormat?: 'summary' | 'detailed' | 'executive' | 'technical';
  };
}

/**
 * Compliance Validation Request
 */
interface ComplianceValidationRequest {
  data: any;
  standards: string[];
  frameworks: string[];
  regulations: string[];
  policies?: string[];
  options?: {
    strictCompliance?: boolean;
    includeGaps?: boolean;
    includeRemediation?: boolean;
    generateReport?: boolean;
    certificationRequired?: boolean;
    auditTrail?: boolean;
  };
}

/**
 * Quality Assessment Request
 */
interface QualityAssessmentRequest {
  data: any;
  qualityDimensions: string[];
  qualityMetrics: string[];
  benchmarks?: string[];
  options?: {
    includeScore?: boolean;
    includeRecommendations?: boolean;
    includeTrends?: boolean;
    generateInsights?: boolean;
    comparativeBenchmarking?: boolean;
  };
}

/**
 * Validation Analytics Request
 */
interface ValidationAnalyticsRequest {
  timeRange?: {
    startDate: string;
    endDate: string;
  };
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'year';
  includeCompliance?: boolean;
  includeQuality?: boolean;
  includePerformance?: boolean;
}

/**
 * Validation Optimization Request
 */
interface ValidationOptimizationRequest {
  validationIds: string[];
  optimizationTargets: string[];
  constraints?: Record<string, any>;
  preferences?: Record<string, any>;
  performanceGoals?: Record<string, any>;
  qualityTargets?: Record<string, any>;
  complianceRequirements?: string[];
}

/**
 * WebSocket Event Types for Real-time Updates
 */
type ValidationWebSocketEvent = 
  | 'validation_started'
  | 'validation_completed'
  | 'validation_failed'
  | 'compliance_check_completed'
  | 'quality_assessment_completed'
  | 'validation_optimized'
  | 'validation_deployed'
  | 'metrics_updated'
  | 'analytics_updated'
  | 'performance_alert'
  | 'compliance_alert'
  | 'quality_alert'
  | 'error_occurred';

/**
 * Advanced Validation API Service Class
 */
class ValidationAPIService {
  private config: ValidationConfig;
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<ValidationWebSocketEvent, Function[]> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();
  private metricsCollector: any = null;
  private performanceMonitor: any = null;
  private complianceTracker: any = null;
  private qualityMonitor: any = null;
  private useWebSocket: boolean = true; // Flag to track if WebSocket is enabled
  private isWebSocketConnected: boolean = false; // Flag to track WebSocket connection status
  private connectionRetries: number = 0; // Counter for WebSocket reconnection attempts
  private maxReconnectionAttempts: number = 5; // Maximum number of reconnection attempts

  /**
   * Generate a unique client ID for WebSocket connections
   */
  private generateClientId(): string {
    return `validation-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  constructor(config: Partial<ValidationConfig> = {}) {
    // Check if we're in development and should disable WebSocket
    const isDevelopment = typeof window !== 'undefined' && (
      (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    );

    this.config = {
      baseURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/proxy',
      timeout: 45000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableRealTime: true, // Enable WebSocket since backend now supports it
      enableCaching: true,
      cacheTimeout: 300000,
      enableMetrics: true,
      enableCompliance: true,
      enableQuality: true,
      batchSize: 50,
      maxConcurrentValidations: 5,
      compressionEnabled: true,
      encryptionEnabled: true,
      validationThreshold: 0.95,
      complianceStandards: ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS'],
      qualityGates: ['accuracy', 'completeness', 'consistency', 'validity'],
      ...config
    };

    // Only initialize WebSocket if real-time is enabled
    if (this.config.enableRealTime) {
      this.initializeWebSocket();
    } else {
      console.log('WebSocket disabled in development mode, using HTTP polling');
    }

    this.initializeMetrics();
    this.initializePerformanceMonitoring();
    this.initializeComplianceTracking();
    this.initializeQualityMonitoring();
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    // Skip WebSocket initialization if real-time is disabled
    if (!this.config.enableRealTime) {
      console.log('Real-time updates disabled, using HTTP polling only');
      this.useWebSocket = false;
      return;
    }

    try {
      // Check if WebSocket is supported
      if (typeof WebSocket === 'undefined') {
        console.log('WebSocket not supported in this environment, using HTTP polling');
        this.useWebSocket = false;
        return;
      }

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('Not in browser environment, WebSocket disabled');
        this.useWebSocket = false;
        return;
      }

      // Check if we're in development mode and backend might not be available
      const isDevelopment = (typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
      
      if (isDevelopment) {
        console.log('Development environment detected, checking backend availability...');
        this.checkBackendAvailability().then(isAvailable => {
          if (isAvailable) {
            this.attemptWebSocketConnection();
          } else {
            console.log('Backend not available, using HTTP polling');
            this.useWebSocket = false;
          }
        }).catch(() => {
          console.log('Backend check failed, using HTTP polling');
          this.useWebSocket = false;
        });
      } else {
        // In production, attempt WebSocket connection directly
        this.attemptWebSocketConnection();
      }

    } catch (error) {
      console.log('WebSocket initialization failed, using HTTP polling:', error);
      this.useWebSocket = false;
    }
  }

  /**
   * Check if backend is available before attempting WebSocket connection
   */
  private async checkBackendAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Attempt WebSocket connection with proper error handling
   */
  private attemptWebSocketConnection(): void {
    try {
      const wsUrl = this.config.baseURL.replace('http', 'ws') + '/ws/validation/';
      
      // Validate WebSocket URL
      if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        console.log('Invalid WebSocket URL, using HTTP polling');
        this.useWebSocket = false;
        return;
      }

      console.log('Attempting WebSocket connection to:', wsUrl);
      
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('Validation WebSocket connected successfully');
        this.isWebSocketConnected = true;
        this.connectionRetries = 0;
        
        // Send initial connection message
        this.wsConnection?.send(JSON.stringify({
          type: 'connection',
          timestamp: new Date().toISOString(),
          clientId: this.generateClientId()
        }));
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = (event) => {
        console.log('Validation WebSocket closed:', event.code, event.reason);
        this.isWebSocketConnected = false;
        
        // Attempt reconnection with exponential backoff
        if (this.connectionRetries < this.maxReconnectionAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);
          console.log(`WebSocket reconnection attempt ${this.connectionRetries + 1} in ${delay}ms`);
          
          setTimeout(() => {
            this.connectionRetries++;
            this.attemptWebSocketConnection();
          }, delay);
        } else {
          console.log('Max WebSocket reconnection attempts reached, using HTTP polling');
          this.useWebSocket = false;
        }
      };

      this.wsConnection.onerror = (error) => {
        // Silent error handling - don't spam console with WebSocket errors
        if (this.connectionRetries < 2) {
          console.log('WebSocket connection attempt failed, will retry...');
        } else {
          console.log('WebSocket connection failed, switching to HTTP polling');
          this.useWebSocket = false;
          this.wsConnection?.close();
        }
      };

      // Set connection timeout
      setTimeout(() => {
        if (this.wsConnection?.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout, using HTTP polling');
          this.useWebSocket = false;
          this.wsConnection.close();
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      console.log('WebSocket connection failed, using HTTP polling');
      this.useWebSocket = false;
    }
  }

  /**
   * Send WebSocket message
   */
  private sendWebSocketMessage(type: string, payload: any): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({ type, payload }));
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    const { event, payload } = data;
    const listeners = this.eventListeners.get(event as ValidationWebSocketEvent);
    
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.warn('Error in WebSocket event listener (handled gracefully):', error);
        }
      });
    }

    // Update internal trackers
    this.updateInternalTrackers(event, payload);
  }

  /**
   * Update internal tracking systems
   */
  private updateInternalTrackers(event: string, payload: any): void {
    switch (event) {
      case 'validation_completed':
        this.metricsCollector.validations++;
        break;
      case 'compliance_check_completed':
        this.complianceTracker.checks++;
        break;
      case 'quality_assessment_completed':
        this.qualityMonitor.assessments++;
        break;
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  public subscribe(event: ValidationWebSocketEvent, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(callback);
    
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Initialize metrics collection
   */
  private initializeMetrics(): void {
    if (!this.config.enableMetrics) return;
    
    this.metricsCollector = {
      validations: 0,
      successful: 0,
      failed: 0,
      warnings: 0,
      averageValidationTime: 0,
      throughput: 0,
      errorRate: 0,
      complianceRate: 0,
      qualityScore: 0
    };
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    this.performanceMonitor = {
      startTime: Date.now(),
      validationTimes: new Map<string, number>(),
      performanceBaselines: new Map<string, number>(),
      bottlenecks: [],
      optimizationOpportunities: []
    };
  }

  /**
   * Initialize compliance tracking
   */
  private initializeComplianceTracking(): void {
    if (!this.config.enableCompliance) return;
    
    this.complianceTracker = {
      checks: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      standards: new Map<string, any>(),
      violations: [],
      remediations: []
    };
  }

  /**
   * Initialize quality monitoring
   */
  private initializeQualityMonitoring(): void {
    if (!this.config.enableQuality) return;
    
    this.qualityMonitor = {
      assessments: 0,
      averageScore: 0,
      qualityTrends: [],
      dimensionScores: new Map<string, number>(),
      improvements: [],
      recommendations: []
    };
  }

  /**
   * Enhanced HTTP request with advanced features
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: ValidationRequestParams
  ): Promise<APIResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      // Build URL with query parameters
      const url = new URL(`${this.config.baseURL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
              url.searchParams.append(key, JSON.stringify(value));
            } else {
              url.searchParams.append(key, String(value));
            }
          }
        });
      }

      // Enhanced headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': requestId,
        'X-Client-Version': '1.0.0',
        'X-Validation-Config': JSON.stringify({
          threshold: this.config.validationThreshold,
          compliance: this.config.enableCompliance,
          quality: this.config.enableQuality,
          realTime: this.config.enableRealTime
        }),
        'X-Feature-Flags': JSON.stringify({
          strictValidation: true,
          complianceChecking: this.config.enableCompliance,
          qualityAssessment: this.config.enableQuality,
          performanceOptimization: true
        }),
        ...options.headers
      };

      // Add authentication if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add context headers
      headers['X-User-Context'] = JSON.stringify({
        userId: localStorage.getItem('user_id'),
        organizationId: localStorage.getItem('organization_id'),
        role: localStorage.getItem('user_role'),
        permissions: JSON.parse(localStorage.getItem('user_permissions') || '[]')
      });

      const requestOptions: RequestInit = {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.config.timeout)
      };

      // Record request start
      this.performanceMonitor.validationTimes.set(requestId, startTime);

      const response = await fetch(url.toString(), requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Record metrics
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.metricsCollector.averageValidationTime = 
        (this.metricsCollector.averageValidationTime + responseTime) / 2;

      return {
        data,
        success: true,
        message: 'Validation request completed successfully',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          responseTime,
          cached: false,
          version: '1.0.0',
          validationMetrics: {
            threshold: this.config.validationThreshold,
            complianceEnabled: this.config.enableCompliance,
            qualityEnabled: this.config.enableQuality
          }
        }
      };

    } catch (error) {
      this.metricsCollector.failed++;
      
      const apiError: APIError = {
        code: 'VALIDATION_API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown validation error occurred',
        details: {
          endpoint,
          requestId,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          validationContext: {
            threshold: this.config.validationThreshold,
            compliance: this.config.enableCompliance,
            quality: this.config.enableQuality
          }
        }
      };

      throw apiError;
    } finally {
      this.performanceMonitor.validationTimes.delete(requestId);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== VALIDATION ENGINE MANAGEMENT ====================

  /**
   * Get all validation engines
   */
  async getValidationEngines(params?: ValidationRequestParams): Promise<APIResponse<ValidationEngine[]>> {
    return this.makeRequest<ValidationEngine[]>('/api/validation/engines', { method: 'GET' }, params);
  }

  /**
   * Get validation engine by ID
   */
  async getValidationEngine(engineId: string, params?: ValidationRequestParams): Promise<APIResponse<ValidationEngine>> {
    return this.makeRequest<ValidationEngine>(`/api/validation/engines/${engineId}`, { method: 'GET' }, params);
  }

  /**
   * Create validation engine
   */
  async createValidationEngine(engine: Partial<ValidationEngine>): Promise<APIResponse<ValidationEngine>> {
    return this.makeRequest<ValidationEngine>('/api/validation/engines', {
      method: 'POST',
      body: JSON.stringify(engine)
    });
  }

  /**
   * Update validation engine
   */
  async updateValidationEngine(engineId: string, updates: Partial<ValidationEngine>): Promise<APIResponse<ValidationEngine>> {
    return this.makeRequest<ValidationEngine>(`/api/validation/engines/${engineId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete validation engine
   */
  async deleteValidationEngine(engineId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/validation/engines/${engineId}`, { method: 'DELETE' });
  }

  // ==================== VALIDATOR MANAGEMENT ====================

  /**
   * Get validators
   */
  async getValidators(engineId?: string, params?: ValidationRequestParams): Promise<APIResponse<Validator[]>> {
    const endpoint = engineId 
      ? `/api/validation/engines/${engineId}/validators`
      : '/api/validation/validators';
    return this.makeRequest<Validator[]>(endpoint, { method: 'GET' }, params);
  }

  /**
   * Get validator by ID
   */
  async getValidator(validatorId: string, params?: ValidationRequestParams): Promise<APIResponse<Validator>> {
    return this.makeRequest<Validator>(`/api/validation/validators/${validatorId}`, { method: 'GET' }, params);
  }

  /**
   * Create validator
   */
  async createValidator(engineId: string, validator: Partial<Validator>): Promise<APIResponse<Validator>> {
    return this.makeRequest<Validator>(`/api/validation/engines/${engineId}/validators`, {
      method: 'POST',
      body: JSON.stringify(validator)
    });
  }

  /**
   * Update validator
   */
  async updateValidator(validatorId: string, updates: Partial<Validator>): Promise<APIResponse<Validator>> {
    return this.makeRequest<Validator>(`/api/validation/validators/${validatorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete validator
   */
  async deleteValidator(validatorId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/validation/validators/${validatorId}`, { method: 'DELETE' });
  }

  // ==================== VALIDATION RULE MANAGEMENT ====================

  /**
   * Get validation rules
   */
  async getValidationRules(validatorId?: string, params?: ValidationRequestParams): Promise<APIResponse<ValidationRule[]>> {
    const endpoint = validatorId 
      ? `/api/validation/validators/${validatorId}/rules`
      : '/api/validation/rules';
    return this.makeRequest<ValidationRule[]>(endpoint, { method: 'GET' }, params);
  }

  /**
   * Get validation rule by ID
   */
  async getValidationRule(ruleId: string, params?: ValidationRequestParams): Promise<APIResponse<ValidationRule>> {
    return this.makeRequest<ValidationRule>(`/api/validation/rules/${ruleId}`, { method: 'GET' }, params);
  }

  /**
   * Create validation rule
   */
  async createValidationRule(validatorId: string, rule: Partial<ValidationRule>): Promise<APIResponse<ValidationRule>> {
    return this.makeRequest<ValidationRule>(`/api/validation/validators/${validatorId}/rules`, {
      method: 'POST',
      body: JSON.stringify(rule)
    });
  }

  /**
   * Update validation rule
   */
  async updateValidationRule(ruleId: string, updates: Partial<ValidationRule>): Promise<APIResponse<ValidationRule>> {
    return this.makeRequest<ValidationRule>(`/api/validation/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete validation rule
   */
  async deleteValidationRule(ruleId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/validation/rules/${ruleId}`, { method: 'DELETE' });
  }

  // ==================== VALIDATION EXECUTION ====================

  /**
   * Execute validation
   */
  async executeValidation(request: AdvancedValidationRequest): Promise<APIResponse<ValidationResult>> {
    this.metricsCollector.validations++;
    return this.makeRequest<ValidationResult>('/api/validation/execute', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Execute batch validation
   */
  async executeBatchValidation(requests: AdvancedValidationRequest[]): Promise<APIResponse<ValidationResult[]>> {
    return this.makeRequest<ValidationResult[]>('/api/validation/execute-batch', {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
  }

  /**
   * Get validation result
   */
  async getValidationResult(validationId: string, params?: ValidationRequestParams): Promise<APIResponse<ValidationResult>> {
    return this.makeRequest<ValidationResult>(`/api/validation/results/${validationId}`, { method: 'GET' }, params);
  }

  /**
   * Get validation history
   */
  async getValidationHistory(params?: ValidationRequestParams): Promise<APIResponse<ValidationHistory[]>> {
    return this.makeRequest<ValidationHistory[]>('/api/validation/history', { method: 'GET' }, params);
  }

  // ==================== COMPLIANCE VALIDATION ====================

  /**
   * Execute compliance check
   */
  async executeComplianceCheck(request: ComplianceValidationRequest): Promise<APIResponse<ComplianceCheck>> {
    this.complianceTracker.checks++;
    return this.makeRequest<ComplianceCheck>('/api/validation/compliance/check', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Get compliance standards
   */
  async getComplianceStandards(params?: ValidationRequestParams): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/validation/compliance/standards', { method: 'GET' }, params);
  }

  /**
   * Get compliance frameworks
   */
  async getComplianceFrameworks(params?: ValidationRequestParams): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/validation/compliance/frameworks', { method: 'GET' }, params);
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(checkId: string, params?: ValidationRequestParams): Promise<APIResponse<ValidationReport>> {
    return this.makeRequest<ValidationReport>(`/api/validation/compliance/reports/${checkId}`, { method: 'GET' }, params);
  }

  // ==================== QUALITY ASSESSMENT ====================

  /**
   * Execute quality assessment
   */
  async executeQualityAssessment(request: QualityAssessmentRequest): Promise<APIResponse<QualityAssessment>> {
    this.qualityMonitor.assessments++;
    return this.makeRequest<QualityAssessment>('/api/validation/quality/assess', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Get quality dimensions
   */
  async getQualityDimensions(params?: ValidationRequestParams): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/validation/quality/dimensions', { method: 'GET' }, params);
  }

  /**
   * Get quality metrics
   */
  async getQualityMetrics(params?: ValidationRequestParams): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/validation/quality/metrics', { method: 'GET' }, params);
  }

  /**
   * Get quality benchmarks
   */
  async getQualityBenchmarks(params?: ValidationRequestParams): Promise<APIResponse<any[]>> {
    return this.makeRequest<any[]>('/api/validation/quality/benchmarks', { method: 'GET' }, params);
  }

  // ==================== VALIDATION WORKFLOWS ====================

  /**
   * Get validation workflows
   */
  async getValidationWorkflows(params?: ValidationRequestParams): Promise<APIResponse<ValidationWorkflow[]>> {
    return this.makeRequest<ValidationWorkflow[]>('/api/validation/workflows', { method: 'GET' }, params);
  }

  /**
   * Create validation workflow
   */
  async createValidationWorkflow(workflow: Partial<ValidationWorkflow>): Promise<APIResponse<ValidationWorkflow>> {
    return this.makeRequest<ValidationWorkflow>('/api/validation/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  }

  /**
   * Execute validation workflow
   */
  async executeValidationWorkflow(workflowId: string, data: any): Promise<APIResponse<ValidationResult>> {
    return this.makeRequest<ValidationResult>(`/api/validation/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  }

  // ==================== VALIDATION TEMPLATES ====================

  /**
   * Get validation templates
   */
  async getValidationTemplates(params?: ValidationRequestParams): Promise<APIResponse<ValidationTemplate[]>> {
    return this.makeRequest<ValidationTemplate[]>('/api/validation/templates', { method: 'GET' }, params);
  }

  /**
   * Create validation template
   */
  async createValidationTemplate(template: Partial<ValidationTemplate>): Promise<APIResponse<ValidationTemplate>> {
    return this.makeRequest<ValidationTemplate>('/api/validation/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  }

  /**
   * Apply validation template
   */
  async applyValidationTemplate(templateId: string, data: any): Promise<APIResponse<ValidationResult>> {
    return this.makeRequest<ValidationResult>(`/api/validation/templates/${templateId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  }

  // ==================== VALIDATION ANALYTICS ====================

  /**
   * Get validation analytics
   */
  async getValidationAnalytics(request: ValidationAnalyticsRequest): Promise<APIResponse<ValidationAnalytics>> {
    return this.makeRequest<ValidationAnalytics>('/api/validation/analytics', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Get validation metrics
   */
  async getValidationMetrics(params?: ValidationRequestParams): Promise<APIResponse<ValidationMetrics>> {
    return this.makeRequest<ValidationMetrics>('/api/validation/metrics', { method: 'GET' }, params);
  }

  /**
   * Get validation performance
   */
  async getValidationPerformance(params?: ValidationRequestParams): Promise<APIResponse<ValidationPerformance>> {
    return this.makeRequest<ValidationPerformance>('/api/validation/performance', { method: 'GET' }, params);
  }

  // ==================== VALIDATION OPTIMIZATION ====================

  /**
   * Start validation optimization
   */
  async startValidationOptimization(request: ValidationOptimizationRequest): Promise<APIResponse<ValidationOptimization>> {
    return this.makeRequest<ValidationOptimization>('/api/validation/optimize', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Get optimization results
   */
  async getOptimizationResults(optimizationId: string, params?: ValidationRequestParams): Promise<APIResponse<ValidationOptimization>> {
    return this.makeRequest<ValidationOptimization>(`/api/validation/optimization-results/${optimizationId}`, { method: 'GET' }, params);
  }

  /**
   * Apply optimization
   */
  async applyOptimization(optimizationId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/validation/optimizations/${optimizationId}/apply`, { method: 'POST' });
  }

  // ==================== VALIDATION DEPLOYMENT ====================

  /**
   * Deploy validation configuration
   */
  async deployValidationConfiguration(configId: string, deploymentOptions: any): Promise<APIResponse<ValidationDeployment>> {
    return this.makeRequest<ValidationDeployment>(`/api/validation/configurations/${configId}/deploy`, {
      method: 'POST',
      body: JSON.stringify(deploymentOptions)
    });
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string, params?: ValidationRequestParams): Promise<APIResponse<ValidationDeployment>> {
    return this.makeRequest<ValidationDeployment>(`/api/validation/deployments/${deploymentId}`, { method: 'GET' }, params);
  }

  // ==================== VALIDATION MONITORING ====================

  /**
   * Get validation monitoring data
   */
  async getValidationMonitoring(params?: ValidationRequestParams): Promise<APIResponse<ValidationMonitoring>> {
    return this.makeRequest<ValidationMonitoring>('/api/validation/monitoring', { method: 'GET' }, params);
  }

  /**
   * Start validation monitoring
   */
  async startValidationMonitoring(monitoringConfig: any): Promise<APIResponse<ValidationMonitoring>> {
    return this.makeRequest<ValidationMonitoring>('/api/validation/monitoring/start', {
      method: 'POST',
      body: JSON.stringify(monitoringConfig)
    });
  }

  /**
   * Stop validation monitoring
   */
  async stopValidationMonitoring(monitoringId: string): Promise<APIResponse<void>> {
    return this.makeRequest<void>(`/api/validation/monitoring/${monitoringId}/stop`, { method: 'POST' });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get service metrics
   */
  getMetrics() {
    return { 
      ...this.metricsCollector,
      compliance: { ...this.complianceTracker },
      quality: { ...this.qualityMonitor }
    };
  }

  /**
   * Get performance data
   */
  getPerformanceData() {
    return {
      uptime: Date.now() - this.performanceMonitor.startTime,
      activeValidations: this.performanceMonitor.validationTimes.size,
      averageValidationTime: this.metricsCollector.averageValidationTime,
      throughput: this.metricsCollector.throughput,
      errorRate: this.metricsCollector.errorRate,
      complianceRate: this.metricsCollector.complianceRate,
      qualityScore: this.metricsCollector.qualityScore
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.initializeMetrics();
    this.initializeComplianceTracking();
    this.initializeQualityMonitoring();
  }

  /**
   * Check if WebSocket is currently being used
   */
  isWebSocketEnabled(): boolean {
    return this.useWebSocket && this.isWebSocketConnected;
  }

  /**
   * Manually disable WebSocket and force HTTP polling
   */
  disableWebSocket(): void {
    console.log('Manually disabling WebSocket, switching to HTTP polling');
    this.useWebSocket = false;
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.isWebSocketConnected = false;
  }

  /**
   * Manually enable WebSocket (will attempt connection)
   */
  enableWebSocket(): void {
    console.log('Manually enabling WebSocket');
    this.useWebSocket = true;
    this.connectionRetries = 0;
    this.initializeWebSocket();
  }

  /**
   * Close WebSocket connection
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.eventListeners.clear();
  }
}

// Create and export singleton instance
export const validationAPIService = new ValidationAPIService();
export default validationAPIService;