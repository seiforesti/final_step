/**
 * Advanced Scan Logic Services Index
 * Centralized export of all service APIs for the Advanced Scan Logic system
 */

import advancedMonitoringAPI from './advanced-monitoring-apis';
import distributedCachingAPI from './distributed-caching-apis';
import intelligentScanningAPI from './intelligent-scanning-apis';
import streamingOrchestrationAPI from './streaming-orchestration-apis';

// Core Monitoring and Analytics Services
export { advancedMonitoringAPI } from './advanced-monitoring-apis';
export { intelligentScanningAPI } from './intelligent-scanning-apis';
export { distributedCachingAPI } from './distributed-caching-apis';
export { streamingOrchestrationAPI } from './streaming-orchestration-apis';

// Scan Intelligence and Analytics Services
export { scanIntelligenceAPI } from './scan-intelligence-apis';
export { scanAnalyticsAPI } from './scan-analytics-apis';
export { scanCoordinationAPI } from './scan-coordination-apis';
export { scanOrchestrationAPI } from './scan-orchestration-apis';
export { scanOptimizationAPI } from './scan-optimization-apis';
export { scanPerformanceAPI } from './scan-performance-apis';
export { scanWorkflowAPI } from './scan-workflow-apis';

// Performance and Optimization Services
export { performanceMonitoringAPI } from './performance-monitoring-apis';
export { resourceOptimizationAPI } from './resource-optimization-apis';
export { throughputOptimizerAPI } from './throughput-optimizer-apis';
export { efficiencyAnalyzerAPI } from './efficiency-analyzer-apis';
export { latencyReducerAPI } from './latency-reducer-apis';
export { loadBalancerAPI } from './load-balancer-apis';
export { scalabilityManagerAPI } from './scalability-manager-apis';

// Cache and Storage Services
export * from './cache-services';

// Workflow and Approval Services
export { approvalAPI } from './approval-apis';
export { versionControlAPI } from './version-control-apis';

// Note: Type exports are handled by individual service files
// This prevents duplicate type definitions and ensures proper typing

// Export default configurations
export const DEFAULT_SERVICE_CONFIG = {
  monitoring: {
    enabled: true,
    interval: 5000,
    timeout: 30000,
    retries: 3
  },
  caching: {
    enabled: true,
    ttl: 3600000,
    maxSize: 1000,
    evictionPolicy: 'lru'
  },
  orchestration: {
    enabled: true,
    maxConcurrency: 10,
    timeout: 60000,
    retryPolicy: 'exponential'
  },
  intelligence: {
    enabled: true,
    modelUpdateInterval: 300000,
    confidenceThreshold: 0.8,
    maxPredictions: 100
  }
} as const;

// Export service health check function
export const checkServiceHealth = async () => {
  const services = [
    { name: 'Advanced Monitoring', api: advancedMonitoringAPI },
    { name: 'Intelligent Scanning', api: intelligentScanningAPI },
    { name: 'Distributed Caching', api: distributedCachingAPI },
    { name: 'Streaming Orchestration', api: streamingOrchestrationAPI }
  ];

  const healthResults = await Promise.allSettled(
    services.map(async ({ name, api }) => {
      try {
        const health = await api.getServiceHealth();
        return { name, status: 'healthy', health };
      } catch (error) {
        return { name, status: 'unhealthy', error: error.message };
      }
    })
  );

  return healthResults.map((result, index) => ({
    ...result,
    service: services[index].name
  }));
};

// Export service initialization function
export const initializeServices = async (config = DEFAULT_SERVICE_CONFIG) => {
  try {
    // Initialize monitoring service
    if (config.monitoring.enabled) {
      await advancedMonitoringAPI.initialize(config.monitoring);
    }

    // Initialize caching service
    if (config.caching.enabled) {
      await distributedCachingAPI.initialize(config.caching);
    }

    // Initialize orchestration service
    if (config.orchestration.enabled) {
      await streamingOrchestrationAPI.initialize(config.orchestration);
    }

    // Initialize intelligence service
    if (config.intelligence.enabled) {
      await intelligentScanningAPI.initialize(config.intelligence);
    }

    return { success: true, message: 'All services initialized successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export service cleanup function
export const cleanupServices = async () => {
  try {
    await Promise.allSettled([
      advancedMonitoringAPI.cleanup(),
      intelligentScanningAPI.cleanup(),
      distributedCachingAPI.cleanup(),
      streamingOrchestrationAPI.cleanup()
    ]);

    return { success: true, message: 'All services cleaned up successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
