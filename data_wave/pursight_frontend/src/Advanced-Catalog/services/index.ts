// ============================================================================
// ADVANCED CATALOG SERVICES INDEX - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized export point for all catalog services
// ============================================================================

// Export individual service classes and instances
export { 
  EnterpriseCatalogService,
  enterpriseCatalogService 
} from './enterprise-catalog.service';

export { 
  SemanticSearchService,
  semanticSearchService 
} from './semantic-search.service';

export { 
  IntelligentDiscoveryService,
  intelligentDiscoveryService 
} from './intelligent-discovery.service';

export { 
  CatalogQualityService,
  catalogQualityService 
} from './catalog-quality.service';

export { 
  DataProfilingService,
  dataProfilingService 
} from './data-profiling.service';

export { 
  AdvancedLineageService,
  advancedLineageService 
} from './advanced-lineage.service';

export { 
  CatalogAnalyticsService,
  catalogAnalyticsService 
} from './catalog-analytics.service';

export { 
  CatalogRecommendationService,
  catalogRecommendationService 
} from './catalog-recommendation.service';

export { 
  CatalogAIService,
  catalogAIService 
} from './catalog-ai.service';

export { 
  advancedCatalogCollaborationService,
  collaborationService
} from './collaboration.service';

export {
  DataLineageService,
  dataLineageService
} from './data-lineage.service';

export {
  ImpactAnalysisService,
  impactAnalysisService
} from './impact-analysis.service';

export {
  TrendAnalysisService,
  trendAnalysisService
} from './trend-analysis.service';

export {
  PopularityAnalysisService,
  popularityAnalysisService
} from './popularity-analysis.service';

// Export service interfaces for type safety
export type {
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetBulkUpdateRequest,
  AssetSearchResponse,
  AssetValidationResult,
  EnterpriseMetrics
} from './enterprise-catalog.service';

export type {
  BasicSearchRequest,
  AdvancedSearchRequest,
  SemanticSearchRequest,
  FacetedSearchRequest,
  NaturalLanguageSearchRequest,
  SearchSuggestionRequest,
  SearchPersonalizationRequest,
  SearchAnalyticsRequest
} from './semantic-search.service';

export type {
  CreateDiscoveryJobRequest,
  DiscoveryJobUpdateRequest,
  CreateDiscoveryConfigRequest,
  CreateDiscoverySourceRequest,
  DiscoveryJobExecutionRequest,
  DiscoveryAnalyticsRequest,
  IncrementalDiscoveryRequest
} from './intelligent-discovery.service';

export type {
  CreateQualityAssessmentRequest,
  CreateQualityRuleRequest,
  CreateQualityDashboardRequest,
  CreateQualityMonitoringRequest,
  CreateQualityReportRequest,
  QualityAnalyticsRequest,
  QualityIssueUpdateRequest
} from './catalog-quality.service';

// ============================================================================
// CENTRALIZED SERVICE REGISTRY
// ============================================================================

/**
 * Centralized registry of all catalog services
 * Provides easy access to all service instances
 */
export const catalogServices = {
  enterpriseCatalog: enterpriseCatalogService,
  semanticSearch: semanticSearchService,
  intelligentDiscovery: intelligentDiscoveryService,
  catalogQuality: catalogQualityService,
  dataProfiling: dataProfilingService,
  advancedLineage: advancedLineageService,
  catalogAnalytics: catalogAnalyticsService,
  catalogRecommendation: catalogRecommendationService,
  catalogAI: catalogAIService,
  advancedCatalogCollaboration: advancedCatalogCollaborationService,
  
  // Specialized Analytics Services
  dataLineage: dataLineageService,
  impactAnalysis: impactAnalysisService,
  trendAnalysis: trendAnalysisService,
  popularityAnalysis: popularityAnalysisService,
} as const;

/**
 * Service types registry for type checking
 */
export type CatalogServiceRegistry = typeof catalogServices;

/**
 * Service names enum for type-safe service access
 */
export enum CatalogServiceNames {
  ENTERPRISE_CATALOG = 'enterpriseCatalog',
  SEMANTIC_SEARCH = 'semanticSearch',
  INTELLIGENT_DISCOVERY = 'intelligentDiscovery',
  CATALOG_QUALITY = 'catalogQuality',
  DATA_PROFILING = 'dataProfiling',
  ADVANCED_LINEAGE = 'advancedLineage',
  CATALOG_ANALYTICS = 'catalogAnalytics',
  CATALOG_RECOMMENDATION = 'catalogRecommendation',
  CATALOG_AI = 'catalogAI',
  ADVANCED_CATALOG_COLLABORATION = 'advancedCatalogCollaboration',
}

// ============================================================================
// SERVICE UTILITIES
// ============================================================================

/**
 * Get a specific service by name with type safety
 */
export function getCatalogService<T extends keyof CatalogServiceRegistry>(
  serviceName: T
): CatalogServiceRegistry[T] {
  return catalogServices[serviceName];
}

/**
 * Check if a service is available
 */
export function isServiceAvailable(serviceName: keyof CatalogServiceRegistry): boolean {
  return serviceName in catalogServices && catalogServices[serviceName] !== undefined;
}

/**
 * Get all available service names
 */
export function getAvailableServices(): Array<keyof CatalogServiceRegistry> {
  return Object.keys(catalogServices) as Array<keyof CatalogServiceRegistry>;
}

/**
 * Service health check interface
 */
export interface ServiceHealthStatus {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  lastChecked: Date;
  responseTime?: number;
  errors?: string[];
}

/**
 * Perform health check on all services
 */
export async function performServiceHealthCheck(): Promise<ServiceHealthStatus[]> {
  const healthChecks: ServiceHealthStatus[] = [];
  
  for (const [serviceName] of Object.entries(catalogServices)) {
    const startTime = Date.now();
    
    try {
      // Basic connectivity check - this would be implemented per service
      // For now, we'll assume services are healthy if they exist
      const responseTime = Date.now() - startTime;
      
      healthChecks.push({
        serviceName,
        status: 'healthy',
        lastChecked: new Date(),
        responseTime
      });
    } catch (error) {
      healthChecks.push({
        serviceName,
        status: 'unavailable',
        lastChecked: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  }
  
  return healthChecks;
}

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

/**
 * Global service configuration interface
 */
export interface ServiceConfiguration {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
}

/**
 * Default service configuration
 */
export const defaultServiceConfig: ServiceConfiguration = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: true,
  enableMetrics: true,
  enableCaching: true,
  cacheTimeout: 300000,
};

/**
 * Service configuration registry
 */
let serviceConfig: ServiceConfiguration = { ...defaultServiceConfig };

/**
 * Update global service configuration
 */
export function updateServiceConfiguration(config: Partial<ServiceConfiguration>): void {
  serviceConfig = { ...serviceConfig, ...config };
}

/**
 * Get current service configuration
 */
export function getServiceConfiguration(): ServiceConfiguration {
  return { ...serviceConfig };
}

// ============================================================================
// SERVICE EVENTS
// ============================================================================

/**
 * Service event types
 */
export enum ServiceEventType {
  REQUEST_START = 'request_start',
  REQUEST_SUCCESS = 'request_success',
  REQUEST_ERROR = 'request_error',
  REQUEST_TIMEOUT = 'request_timeout',
  SERVICE_UNAVAILABLE = 'service_unavailable',
}

/**
 * Service event interface
 */
export interface ServiceEvent {
  type: ServiceEventType;
  serviceName: string;
  timestamp: Date;
  duration?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

/**
 * Service event listener type
 */
export type ServiceEventListener = (event: ServiceEvent) => void;

/**
 * Service event manager
 */
class ServiceEventManager {
  private listeners: Map<ServiceEventType, ServiceEventListener[]> = new Map();

  /**
   * Add event listener
   */
  addEventListener(type: ServiceEventType, listener: ServiceEventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: ServiceEventType, listener: ServiceEventListener): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const index = typeListeners.indexOf(listener);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  emit(event: ServiceEvent): void {
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in service event listener:', error);
        }
      });
    }
  }

  /**
   * Clear all listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Global service event manager instance
 */
export const serviceEventManager = new ServiceEventManager();

// ============================================================================
// SERVICE METRICS
// ============================================================================

/**
 * Service metrics interface
 */
export interface ServiceMetrics {
  serviceName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime?: Date;
  uptime: number;
}

/**
 * Service metrics registry
 */
const serviceMetrics: Map<string, ServiceMetrics> = new Map();

/**
 * Initialize metrics for a service
 */
export function initializeServiceMetrics(serviceName: string): void {
  serviceMetrics.set(serviceName, {
    serviceName,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    uptime: Date.now(),
  });
}

/**
 * Update service metrics
 */
export function updateServiceMetrics(
  serviceName: string,
  success: boolean,
  responseTime: number
): void {
  const metrics = serviceMetrics.get(serviceName);
  if (metrics) {
    metrics.totalRequests++;
    metrics.lastRequestTime = new Date();
    
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }
    
    // Update average response time
    const totalTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime;
    metrics.averageResponseTime = totalTime / metrics.totalRequests;
  }
}

/**
 * Get metrics for a specific service
 */
export function getServiceMetrics(serviceName: string): ServiceMetrics | undefined {
  return serviceMetrics.get(serviceName);
}

/**
 * Get metrics for all services
 */
export function getAllServiceMetrics(): ServiceMetrics[] {
  return Array.from(serviceMetrics.values());
}

/**
 * Reset metrics for a service
 */
export function resetServiceMetrics(serviceName: string): void {
  const metrics = serviceMetrics.get(serviceName);
  if (metrics) {
    metrics.totalRequests = 0;
    metrics.successfulRequests = 0;
    metrics.failedRequests = 0;
    metrics.averageResponseTime = 0;
    metrics.lastRequestTime = undefined;
    metrics.uptime = Date.now();
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all services and metrics
 */
export function initializeCatalogServices(): void {
  // Initialize metrics for all services
  Object.keys(catalogServices).forEach(serviceName => {
    initializeServiceMetrics(serviceName);
  });

  console.log('Catalog services initialized successfully');
}

// Auto-initialize when module loads
initializeCatalogServices();

// Default export for convenience
export default catalogServices;