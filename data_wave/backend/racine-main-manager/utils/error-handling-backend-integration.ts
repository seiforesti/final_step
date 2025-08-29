// ============================================================================
// ERROR HANDLING BACKEND INTEGRATION - PIPELINE MANAGER
// ============================================================================
// Advanced error handling framework with full backend integration
// Provides comprehensive error management and recovery capabilities

import { APIResponse, UUID } from '../types/racine-core.types';

// ============================================================================
// ERROR HANDLING INTERFACES
// ============================================================================

export interface PipelineError {
  id: string;
  type: 'validation' | 'execution' | 'system' | 'network' | 'timeout' | 'resource' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  code: string;
  message: string;
  description: string;
  context: ErrorContext;
  timestamp: Date;
  resolved: boolean;
  resolution?: ErrorResolution;
  metadata?: Record<string, any>;
}

export interface ErrorContext {
  pipelineId: string;
  executionId: string;
  stepId: string;
  stage: string;
  data?: any;
  stackTrace?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface ErrorResolution {
  id: string;
  errorId: string;
  resolvedBy: string;
  resolvedAt: Date;
  resolutionType: 'automatic' | 'manual' | 'workaround';
  description: string;
  steps: string[];
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryStrategy {
  id: string;
  name: string;
  description: string;
  errorTypes: string[];
  conditions: RecoveryCondition[];
  actions: RecoveryAction[];
  priority: number;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface RecoveryCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
}

export interface RecoveryAction {
  type: 'retry' | 'skip' | 'fallback' | 'notify' | 'escalate' | 'custom';
  parameters: Record<string, any>;
  target?: string;
  metadata?: Record<string, any>;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  resolutionTime: Record<string, number>;
  recurrenceRate: Record<string, number>;
  topErrorPatterns: ErrorPattern[];
  metadata?: Record<string, any>;
}

export interface ErrorPattern {
  pattern: string;
  frequency: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  commonCauses: string[];
  recommendedSolutions: string[];
}

// ============================================================================
// BACKEND INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Report pipeline error with backend integration
 */
export async function reportPipelineError(error: PipelineError): Promise<APIResponse<PipelineError>> {
  try {
    const response = await fetch('/api/pipeline/errors/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    });

    if (!response.ok) {
      throw new Error(`Error reporting failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error reporting failed:', error);
    throw error;
  }
}

/**
 * Get pipeline errors with filtering
 */
export async function getPipelineErrors(
  filters?: {
    pipelineId?: string;
    executionId?: string;
    severity?: string;
    type?: string;
    resolved?: boolean;
    timeRange?: string;
  }
): Promise<APIResponse<PipelineError[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.pipelineId) params.append('pipelineId', filters.pipelineId);
    if (filters?.executionId) params.append('executionId', filters.executionId);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.resolved !== undefined) params.append('resolved', filters.resolved.toString());
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);

    const response = await fetch(`/api/pipeline/errors?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch errors: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetch failed:', error);
    throw error;
  }
}

/**
 * Resolve pipeline error
 */
export async function resolvePipelineError(
  errorId: string,
  resolution: ErrorResolution
): Promise<APIResponse<ErrorResolution>> {
  try {
    const response = await fetch(`/api/pipeline/errors/${errorId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolution)
    });

    if (!response.ok) {
      throw new Error(`Error resolution failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resolution failed:', error);
    throw error;
  }
}

/**
 * Get error recovery strategies
 */
export async function getErrorRecoveryStrategies(
  errorType?: string
): Promise<APIResponse<ErrorRecoveryStrategy[]>> {
  try {
    const params = errorType ? `?errorType=${errorType}` : '';
    const response = await fetch(`/api/pipeline/errors/recovery-strategies${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recovery strategies: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Recovery strategies fetch failed:', error);
    throw error;
  }
}

/**
 * Execute error recovery strategy
 */
export async function executeErrorRecovery(
  strategyId: string,
  errorContext: ErrorContext
): Promise<APIResponse<{ success: boolean; actions: string[]; metadata?: any }>> {
  try {
    const response = await fetch('/api/pipeline/errors/recovery/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategyId, errorContext })
    });

    if (!response.ok) {
      throw new Error(`Recovery execution failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Recovery execution failed:', error);
    throw error;
  }
}

/**
 * Get error analytics
 */
export async function getErrorAnalytics(
  pipelineId?: string,
  timeRange?: string
): Promise<APIResponse<ErrorAnalytics>> {
  try {
    const params = new URLSearchParams();
    if (pipelineId) params.append('pipelineId', pipelineId);
    if (timeRange) params.append('timeRange', timeRange);

    const response = await fetch(`/api/pipeline/errors/analytics?${params}`);
    
    if (!response.ok) {
      throw new Error(`Analytics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analytics fetch failed:', error);
    throw error;
  }
}

/**
 * Create custom error recovery strategy
 */
export async function createErrorRecoveryStrategy(
  strategy: ErrorRecoveryStrategy
): Promise<APIResponse<ErrorRecoveryStrategy>> {
  try {
    const response = await fetch('/api/pipeline/errors/recovery-strategies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategy)
    });

    if (!response.ok) {
      throw new Error(`Strategy creation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Strategy creation failed:', error);
    throw error;
  }
}

/**
 * Update error recovery strategy
 */
export async function updateErrorRecoveryStrategy(
  strategyId: string,
  updates: Partial<ErrorRecoveryStrategy>
): Promise<APIResponse<ErrorRecoveryStrategy>> {
  try {
    const response = await fetch(`/api/pipeline/errors/recovery-strategies/${strategyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Strategy update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Strategy update failed:', error);
    throw error;
  }
}

/**
 * Delete error recovery strategy
 */
export async function deleteErrorRecoveryStrategy(strategyId: string): Promise<APIResponse<void>> {
  try {
    const response = await fetch(`/api/pipeline/errors/recovery-strategies/${strategyId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Strategy deletion failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Strategy deletion failed:', error);
    throw error;
  }
}

/**
 * Test error recovery strategy
 */
export async function testErrorRecoveryStrategy(
  strategy: ErrorRecoveryStrategy,
  testError: PipelineError
): Promise<APIResponse<{ success: boolean; actions: string[]; executionTime: number }>> {
  try {
    const response = await fetch('/api/pipeline/errors/recovery/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, testError })
    });

    if (!response.ok) {
      throw new Error(`Strategy testing failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Strategy testing failed:', error);
    throw error;
  }
}

/**
 * Get error patterns and recommendations
 */
export async function getErrorPatterns(
  pipelineId?: string
): Promise<APIResponse<ErrorPattern[]>> {
  try {
    const params = pipelineId ? `?pipelineId=${pipelineId}` : '';
    const response = await fetch(`/api/pipeline/errors/patterns${params}`);
    
    if (!response.ok) {
      throw new Error(`Patterns fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Patterns fetch failed:', error);
    throw error;
  }
}

/**
 * Analyze error patterns with backend integration
 */
export async function analyzeErrorPatterns(
  pipelineId: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h',
  analysisType: 'frequency' | 'severity' | 'correlation' | 'comprehensive' = 'comprehensive'
): Promise<APIResponse<ErrorPatternAnalysis>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/error-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeRange, analysisType })
    });

    if (!response.ok) {
      throw new Error(`Error pattern analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error pattern analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        patterns: [],
        correlations: [],
        recommendations: [],
        riskScore: 0
      }
    };
  }
}

