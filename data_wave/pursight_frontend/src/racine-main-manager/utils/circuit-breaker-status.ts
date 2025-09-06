/**
 * Circuit Breaker Status Utility
 * =============================
 * 
 * Provides utilities to check circuit breaker status and prevent
 * unnecessary retry attempts when services are down.
 */

import { circuitBreakers, CircuitBreakerState } from './circuit-breaker';

export interface ServiceStatus {
  isHealthy: boolean;
  state: CircuitBreakerState;
  nextAttemptTime?: number;
  canRetry: boolean;
}

/**
 * Check if a service is healthy and can accept requests
 */
export function isServiceHealthy(serviceName: keyof typeof circuitBreakers): boolean {
  const circuitBreaker = circuitBreakers[serviceName];
  return circuitBreaker.isHealthy();
}

/**
 * Get detailed status of a service
 */
export function getServiceStatus(serviceName: keyof typeof circuitBreakers): ServiceStatus {
  const circuitBreaker = circuitBreakers[serviceName];
  const stats = circuitBreaker.getStats();
  
  return {
    isHealthy: circuitBreaker.isHealthy(),
    state: stats.state,
    nextAttemptTime: stats.nextAttemptTime,
    canRetry: stats.state === CircuitBreakerState.CLOSED || 
              (stats.state === CircuitBreakerState.HALF_OPEN) ||
              (stats.state === CircuitBreakerState.OPEN && Date.now() >= stats.nextAttemptTime)
  };
}

/**
 * Check if we should attempt a request to a service
 */
export function shouldAttemptRequest(serviceName: keyof typeof circuitBreakers): boolean {
  const status = getServiceStatus(serviceName);
  return status.canRetry;
}

/**
 * Get time until next retry attempt
 */
export function getTimeUntilRetry(serviceName: keyof typeof circuitBreakers): number {
  const status = getServiceStatus(serviceName);
  if (status.nextAttemptTime) {
    return Math.max(0, status.nextAttemptTime - Date.now());
  }
  return 0;
}

/**
 * Wait for a service to become available
 */
export async function waitForService(
  serviceName: keyof typeof circuitBreakers, 
  maxWaitTime: number = 30000
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    if (shouldAttemptRequest(serviceName)) {
      return true;
    }
    
    const waitTime = Math.min(1000, getTimeUntilRetry(serviceName));
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  return false;
}

/**
 * Get all service statuses
 */
export function getAllServiceStatuses(): Record<keyof typeof circuitBreakers, ServiceStatus> {
  const statuses = {} as Record<keyof typeof circuitBreakers, ServiceStatus>;
  
  for (const serviceName of Object.keys(circuitBreakers) as Array<keyof typeof circuitBreakers>) {
    statuses[serviceName] = getServiceStatus(serviceName);
  }
  
  return statuses;
}

/**
 * Check if any critical services are down
 */
export function areCriticalServicesDown(): boolean {
  const criticalServices: Array<keyof typeof circuitBreakers> = ['userManagement', 'orchestration'];
  
  return criticalServices.some(service => !isServiceHealthy(service));
}

/**
 * Get a user-friendly message about service status
 */
export function getServiceStatusMessage(serviceName: keyof typeof circuitBreakers): string {
  const status = getServiceStatus(serviceName);
  
  switch (status.state) {
    case CircuitBreakerState.CLOSED:
      return `${serviceName} service is healthy`;
    case CircuitBreakerState.OPEN:
      const waitTime = Math.ceil(getTimeUntilRetry(serviceName) / 1000);
      return `${serviceName} service is temporarily unavailable. Retry in ${waitTime}s`;
    case CircuitBreakerState.HALF_OPEN:
      return `${serviceName} service is testing recovery`;
    default:
      return `${serviceName} service status unknown`;
  }
}
