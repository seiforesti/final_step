// Advanced Failure Recovery Utilities - aligned to backend
// Maps to: /api/v1/workflow/failure-recovery

import { apiClient } from '@/lib copie/api-client';

// Core formatting functions
export const formatFailureType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
};

export const formatFailureSeverity = (severity: string): string => {
  const severityMap: Record<string, string> = {
    'critical': 'Critical',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low'
  };
  return severityMap[severity] || severity;
};

export const formatRecoveryStrategy = (strategy: string): string => {
  return strategy.charAt(0).toUpperCase() + strategy.slice(1).replace(/_/g, ' ');
};

export const formatRecoveryAction = (action: string): string => {
  return action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ');
};

export const formatRecoveryStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

export const formatCircuitBreakerState = (state: string): string => {
  return state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' ');
};

export const formatFailurePattern = (pattern: string): string => {
  return pattern.charAt(0).toUpperCase() + pattern.slice(1).replace(/_/g, ' ');
};

export const formatRecoveryPattern = (pattern: string): string => {
  return pattern.charAt(0).toUpperCase() + pattern.slice(1).replace(/_/g, ' ');
};

// Calculation functions
export const calculateFailureRate = (failures: any[], timeWindow: number): number => {
  if (failures.length === 0) return 0;
  const recentFailures = failures.filter(f => 
    Date.now() - new Date(f.timestamp).getTime() <= timeWindow
  );
  return recentFailures.length / (timeWindow / (1000 * 60 * 60)); // failures per hour
};

export const calculateRecoveryTime = (failure: any, recovery: any): number => {
  if (!failure.timestamp || !recovery.timestamp) return 0;
  return new Date(recovery.timestamp).getTime() - new Date(failure.timestamp).getTime();
};

export const calculateMTTR = (failures: any[]): number => {
  if (failures.length === 0) return 0;
  const totalTime = failures.reduce((sum, f) => sum + (f.recoveryTime || 0), 0);
  return totalTime / failures.length;
};

export const calculateMTBF = (failures: any[], totalTime: number): number => {
  if (failures.length === 0) return totalTime;
  return totalTime / failures.length;
};

export const calculateAvailability = (uptime: number, totalTime: number): number => {
  return (uptime / totalTime) * 100;
};

export const calculateReliability = (successfulOperations: number, totalOperations: number): number => {
  if (totalOperations === 0) return 100;
  return (successfulOperations / totalOperations) * 100;
};

export const calculateRecoverySuccess = (recoveries: any[]): number => {
  if (recoveries.length === 0) return 0;
  const successful = recoveries.filter(r => r.status === 'completed');
  return (successful.length / recoveries.length) * 100;
};

export const calculateFailureImpact = (failure: any): number => {
  const severityMap: Record<string, number> = {
    'critical': 100,
    'high': 75,
    'medium': 50,
    'low': 25
  };
  return severityMap[failure.severity] || 0;
};

export const calculateRecoveryEffectiveness = (recovery: any): number => {
  if (!recovery.startTime || !recovery.endTime) return 0;
  const duration = new Date(recovery.endTime).getTime() - new Date(recovery.startTime).getTime();
  const expectedDuration = recovery.expectedDuration || 300000; // 5 minutes default
  return Math.max(0, 100 - (duration / expectedDuration) * 100);
};

// Validation functions
export const validateFailureConfiguration = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.thresholds) errors.push('Thresholds are required');
  if (!config.retryPolicy) errors.push('Retry policy is required');
  if (!config.fallbackPolicy) errors.push('Fallback policy is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRecoveryConfiguration = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.strategies) errors.push('Recovery strategies are required');
  if (!config.timeouts) errors.push('Timeouts are required');
  if (!config.escalationRules) errors.push('Escalation rules are required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Optimization functions
export const optimizeRetryPolicy = (currentPolicy: any, failureHistory: any[]): any => {
  const failureRate = calculateFailureRate(failureHistory, 24 * 60 * 60 * 1000); // 24 hours
  
  if (failureRate > 0.1) { // High failure rate
    return {
      ...currentPolicy,
      maxRetries: Math.min(currentPolicy.maxRetries + 1, 5),
      backoffMultiplier: Math.min(currentPolicy.backoffMultiplier + 0.1, 2.0)
    };
  }
  
  return currentPolicy;
};

export const optimizeFallbackPolicy = (currentPolicy: any, recoveryHistory: any[]): any => {
  const successRate = calculateRecoverySuccess(recoveryHistory);
  
  if (successRate < 80) { // Low success rate
    return {
      ...currentPolicy,
      enableGracefulDegradation: true,
      fallbackTimeout: Math.min(currentPolicy.fallbackTimeout * 1.2, 30000)
    };
  }
  
  return currentPolicy;
};

export const optimizeFailoverPolicy = (currentPolicy: any, systemHealth: any): any => {
  if (systemHealth.cpu > 80 || systemHealth.memory > 80) {
    return {
      ...currentPolicy,
      enableAutoFailover: true,
      failoverThreshold: Math.max(currentPolicy.failoverThreshold * 0.8, 50)
    };
  }
  
  return currentPolicy;
};

export const optimizeRollbackPolicy = (currentPolicy: any, deploymentHistory: any[]): any => {
  const recentDeployments = deploymentHistory.filter(d => 
    Date.now() - new Date(d.timestamp).getTime() <= 24 * 60 * 60 * 1000
  );
  
  if (recentDeployments.length > 5) {
    return {
      ...currentPolicy,
      enableAutoRollback: true,
      rollbackThreshold: Math.min(currentPolicy.rollbackThreshold + 1, 3)
    };
  }
  
  return currentPolicy;
};

export const optimizeCompensationPolicy = (currentPolicy: any, transactionHistory: any[]): any => {
  const compensationRate = transactionHistory.filter(t => t.compensated).length / transactionHistory.length;
  
  if (compensationRate > 0.05) { // High compensation rate
    return {
      ...currentPolicy,
      enableSagaPattern: true,
      compensationTimeout: Math.max(currentPolicy.compensationTimeout * 1.5, 60000)
    };
  }
  
  return currentPolicy;
};

// Detection functions
export const detectFailureAnomaly = (failures: any[], threshold: number = 2): any[] => {
  const failureRates = failures.map(f => calculateFailureRate([f], 60 * 60 * 1000)); // 1 hour
  const mean = failureRates.reduce((sum, rate) => sum + rate, 0) / failureRates.length;
  const stdDev = Math.sqrt(
    failureRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / failureRates.length
  );
  
  return failures.filter((_, index) => 
    Math.abs(failureRates[index] - mean) > threshold * stdDev
  );
};

export const detectRecoveryAnomaly = (recoveries: any[], threshold: number = 2): any[] => {
  const recoveryTimes = recoveries.map(r => calculateRecoveryTime(r.failure, r));
  const mean = recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length;
  const stdDev = Math.sqrt(
    recoveryTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / recoveryTimes.length
  );
  
  return recoveries.filter((_, index) => 
    Math.abs(recoveryTimes[index] - mean) > threshold * stdDev
  );
};

// Classification functions
export const classifyFailure = (failure: any): string => {
  if (failure.severity === 'critical' && failure.impact > 80) return 'catastrophic';
  if (failure.severity === 'high' && failure.impact > 60) return 'severe';
  if (failure.severity === 'medium' && failure.impact > 40) return 'moderate';
  return 'minor';
};

export const classifyRecovery = (recovery: any): string => {
  const effectiveness = calculateRecoveryEffectiveness(recovery);
  if (effectiveness > 90) return 'excellent';
  if (effectiveness > 75) return 'good';
  if (effectiveness > 50) return 'fair';
  return 'poor';
};

// Prioritization functions
export const prioritizeFailure = (failure: any): number => {
  const severityScore = failure.severity === 'critical' ? 100 : 
                       failure.severity === 'high' ? 75 :
                       failure.severity === 'medium' ? 50 : 25;
  
  const impactScore = failure.impact || 0;
  const timeScore = Math.min((Date.now() - new Date(failure.timestamp).getTime()) / 1000 / 60, 60); // Max 60 minutes
  
  return severityScore + impactScore + timeScore;
};

export const prioritizeRecovery = (recovery: any): number => {
  const failurePriority = prioritizeFailure(recovery.failure);
  const recoveryUrgency = recovery.urgency || 50;
  
  return failurePriority + recoveryUrgency;
};

// Escalation functions
export const escalateFailure = async (failure: any, escalationLevel: number): Promise<void> => {
  try {
    await apiClient.post('/api/v1/workflow/failure-recovery/escalate', {
      failureId: failure.id,
      escalationLevel,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to escalate failure:', error);
  }
};

export const escalateRecovery = async (recovery: any, escalationLevel: number): Promise<void> => {
  try {
    await apiClient.post('/api/v1/workflow/failure-recovery/escalate-recovery', {
      recoveryId: recovery.id,
      escalationLevel,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to escalate recovery:', error);
  }
};

// Resolution functions
export const resolveFailure = async (failure: any, resolution: string): Promise<void> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/resolve', {
      failureId: failure.id,
      resolution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to resolve failure:', error);
  }
};

export const resolveRecovery = async (recovery: any, resolution: string): Promise<void> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/resolve-recovery', {
      recoveryId: recovery.id,
      resolution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to resolve recovery:', error);
  }
};

// Close functions
export const closeFailure = async (failure: any): Promise<void> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/close', {
      failureId: failure.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to close failure:', error);
  }
};

export const closeRecovery = async (recovery: any): Promise<void> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/close-recovery', {
      recoveryId: recovery.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to close recovery:', error);
  }
};

// Archive functions
export const archiveFailure = async (failure: any): Promise<void> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/archive', {
      failureId: failure.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to archive failure:', error);
  }
};

export const archiveRecovery = async (recovery: any): Promise<void> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/archive-recovery', {
      recoveryId: recovery.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to archive recovery:', error);
  }
};

// Export/Import functions
export const exportFailureData = async (filters: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/export', filters);
    return response.data;
  } catch (error) {
    console.error('Failed to export failure data:', error);
    return null;
  }
};

export const exportRecoveryData = async (filters: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/export-recovery', filters);
    return response.data;
  } catch (error) {
    console.error('Failed to export recovery data:', error);
    return null;
  }
};

export const importFailureConfiguration = async (config: any): Promise<boolean> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/import-config', config);
    return true;
  } catch (error) {
    console.error('Failed to import failure configuration:', error);
    return false;
  }
};

export const importRecoveryConfiguration = async (config: any): Promise<boolean> => {
  try {
    await ApiClient.post('/api/v1/workflow/failure-recovery/import-recovery-config', config);
    return true;
  } catch (error) {
    console.error('Failed to import recovery configuration:', error);
    return false;
  }
};

// Simulation and testing functions
export const simulateFailure = async (failureScenario: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/simulate', failureScenario);
    return response.data;
  } catch (error) {
    console.error('Failed to simulate failure:', error);
    return null;
  }
};

export const simulateRecovery = async (recoveryScenario: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/simulate-recovery', recoveryScenario);
    return response.data;
  } catch (error) {
    console.error('Failed to simulate recovery:', error);
    return null;
  }
};

export const testFailureScenario = async (scenario: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/test-scenario', scenario);
    return response.data;
  } catch (error) {
    console.error('Failed to test failure scenario:', error);
    return null;
  }
};

export const testRecoveryScenario = async (scenario: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/test-recovery-scenario', scenario);
    return response.data;
  } catch (error) {
    console.error('Failed to test recovery scenario:', error);
    return null;
  }
};

// Benchmarking functions
export const benchmarkFailureHandling = async (benchmarkConfig: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/benchmark', benchmarkConfig);
    return response.data;
  } catch (error) {
    console.error('Failed to benchmark failure handling:', error);
    return null;
  }
};

export const benchmarkRecoveryHandling = async (benchmarkConfig: any): Promise<any> => {
  try {
    const response = await ApiClient.post('/api/v1/workflow/failure-recovery/benchmark-recovery', benchmarkConfig);
    return response.data;
  } catch (error) {
    console.error('Failed to benchmark recovery handling:', error);
    return null;
  }
};

// Export all functions as a utility object
export const failureRecoveryUtils = {
  formatFailureType,
  formatFailureSeverity,
  formatRecoveryStrategy,
  formatRecoveryAction,
  formatRecoveryStatus,
  formatCircuitBreakerState,
  formatFailurePattern,
  formatRecoveryPattern,
  calculateFailureRate,
  calculateRecoveryTime,
  calculateMTTR,
  calculateMTBF,
  calculateAvailability,
  calculateReliability,
  calculateRecoverySuccess,
  calculateFailureImpact,
  calculateRecoveryEffectiveness,
  validateFailureConfiguration,
  validateRecoveryConfiguration,
  optimizeRetryPolicy,
  optimizeFallbackPolicy,
  optimizeFailoverPolicy,
  optimizeRollbackPolicy,
  optimizeCompensationPolicy,
  detectFailureAnomaly,
  detectRecoveryAnomaly,
  classifyFailure,
  classifyRecovery,
  prioritizeFailure,
  prioritizeRecovery,
  escalateFailure,
  escalateRecovery,
  resolveFailure,
  resolveRecovery,
  closeFailure,
  closeRecovery,
  archiveFailure,
  archiveRecovery,
  exportFailureData,
  exportRecoveryData,
  importFailureConfiguration,
  importRecoveryConfiguration,
  simulateFailure,
  simulateRecovery,
  testFailureScenario,
  testRecoveryScenario,
  benchmarkFailureHandling,
  benchmarkRecoveryHandling
};

export default failureRecoveryUtils;
