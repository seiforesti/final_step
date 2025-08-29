// ============================================================================
// PIPELINE BACKEND INTEGRATION - PIPELINE MANAGER
// ============================================================================
// Advanced pipeline management with full backend integration
// Provides comprehensive pipeline orchestration and optimization capabilities

import { APIResponse, UUID, PipelineDefinition, PipelineExecution, PipelineStatus } from '../types/racine-core.types';

// ============================================================================
// PIPELINE INTERFACES
// ============================================================================

export interface PipelineExecutionRequest {
  pipelineId: string;
  context?: Record<string, any>;
  parameters?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface PipelineExecutionResponse {
  executionId: string;
  status: PipelineStatus;
  startedAt: Date;
  estimatedDuration?: number;
  progress?: number;
  currentStep?: string;
  metadata?: Record<string, any>;
}

export interface PipelineOptimizationRequest {
  pipelineId: string;
  optimizationType: 'performance' | 'resource' | 'cost' | 'reliability' | 'comprehensive';
  constraints?: Record<string, any>;
  targetMetrics?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface PipelineOptimizationResult {
  originalDefinition: PipelineDefinition;
  optimizedDefinition: PipelineDefinition;
  improvements: {
    performance: number;
    resourceUsage: number;
    cost: number;
    reliability: number;
    overall: number;
  };
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface PipelineHealthMetrics {
  pipelineId: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  errorRate: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  lastExecution?: Date;
  healthScore: number;
  metadata?: Record<string, any>;
}

export interface PipelineResourceUsage {
  pipelineId: string;
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkUsage: number;
  activeConnections: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// BACKEND INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Execute pipeline with backend integration
 */
export async function executePipeline(
  request: PipelineExecutionRequest
): Promise<APIResponse<PipelineExecutionResponse>> {
  try {
    const response = await fetch('/api/pipeline/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Pipeline execution failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    throw error;
  }
}

/**
 * Get pipeline execution status
 */
export async function getPipelineExecutionStatus(
  executionId: string
): Promise<APIResponse<PipelineExecutionResponse>> {
  try {
    const response = await fetch(`/api/pipeline/execution/${executionId}/status`);
    
    if (!response.ok) {
      throw new Error(`Status fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Status fetch failed:', error);
    throw error;
  }
}

/**
 * Cancel pipeline execution
 */
export async function cancelPipelineExecution(
  executionId: string,
  reason?: string
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(`/api/pipeline/execution/${executionId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      throw new Error(`Execution cancellation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Execution cancellation failed:', error);
    throw error;
  }
}

/**
 * Pause pipeline execution
 */
export async function pausePipelineExecution(
  executionId: string
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(`/api/pipeline/execution/${executionId}/pause`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Execution pause failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Execution pause failed:', error);
    throw error;
  }
}

/**
 * Resume pipeline execution
 */
export async function resumePipelineExecution(
  executionId: string
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(`/api/pipeline/execution/${executionId}/resume`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Execution resume failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Execution resume failed:', error);
    throw error;
  }
}

/**
 * Retry pipeline execution
 */
export async function retryPipelineExecution(
  executionId: string,
  fromStep?: string
): Promise<APIResponse<PipelineExecutionResponse>> {
  try {
    const response = await fetch(`/api/pipeline/execution/${executionId}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromStep })
    });

    if (!response.ok) {
      throw new Error(`Execution retry failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Execution retry failed:', error);
    throw error;
  }
}

/**
 * Get pipeline execution logs
 */
export async function getPipelineExecutionLogs(
  executionId: string,
  level?: 'info' | 'warning' | 'error' | 'debug',
  limit?: number
): Promise<APIResponse<any[]>> {
  try {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/pipeline/execution/${executionId}/logs?${params}`);
    
    if (!response.ok) {
      throw new Error(`Logs fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Logs fetch failed:', error);
    throw error;
  }
}

/**
 * Optimize pipeline with backend integration
 */
export async function optimizePipeline(
  request: PipelineOptimizationRequest
): Promise<APIResponse<PipelineOptimizationResult>> {
  try {
    const response = await fetch('/api/pipeline/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Pipeline optimization failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Pipeline optimization failed:', error);
    throw error;
  }
}

/**
 * Get pipeline health metrics
 */
export async function getPipelineHealthMetrics(
  pipelineId: string,
  timeRange?: string
): Promise<APIResponse<PipelineHealthMetrics>> {
  try {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    const response = await fetch(`/api/pipeline/${pipelineId}/health${params}`);
    
    if (!response.ok) {
      throw new Error(`Health metrics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health metrics fetch failed:', error);
    throw error;
  }
}

/**
 * Get pipeline resource usage
 */
export async function getPipelineResourceUsage(
  pipelineId: string,
  timeRange?: string
): Promise<APIResponse<PipelineResourceUsage[]>> {
  try {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    const response = await fetch(`/api/pipeline/${pipelineId}/resources${params}`);
    
    if (!response.ok) {
      throw new Error(`Resource usage fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resource usage fetch failed:', error);
    throw error;
  }
}

/**
 * Scale pipeline resources
 */
export async function scalePipelineResources(
  pipelineId: string,
  scaling: {
    cpu?: number;
    memory?: number;
    storage?: number;
    replicas?: number;
  }
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/scale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scaling)
    });

    if (!response.ok) {
      throw new Error(`Resource scaling failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resource scaling failed:', error);
    throw error;
  }
}

/**
 * Get pipeline performance analytics
 */
export async function getPipelinePerformanceAnalytics(
  pipelineId: string,
  timeRange?: string,
  metrics?: string[]
): Promise<APIResponse<any>> {
  try {
    const params = new URLSearchParams();
    if (timeRange) params.append('timeRange', timeRange);
    if (metrics) params.append('metrics', metrics.join(','));

    const response = await fetch(`/api/pipeline/${pipelineId}/analytics/performance?${params}`);
    
    if (!response.ok) {
      throw new Error(`Performance analytics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Performance analytics fetch failed:', error);
    throw error;
  }
}

/**
 * Validate pipeline definition
 */
export async function validatePipelineDefinition(
  definition: PipelineDefinition
): Promise<APIResponse<{ valid: boolean; errors: string[]; warnings: string[] }>> {
  try {
    const response = await fetch('/api/pipeline/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(definition)
    });

    if (!response.ok) {
      throw new Error(`Pipeline validation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Pipeline validation failed:', error);
    throw error;
  }
}

/**
 * Deploy pipeline to environment
 */
export async function deployPipeline(
  pipelineId: string,
  environment: 'development' | 'staging' | 'production',
  options?: Record<string, any>
): Promise<APIResponse<{ deploymentId: string; status: string }>> {
  try {
    const response = await fetch('/api/pipeline/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineId, environment, options })
    });

    if (!response.ok) {
      throw new Error(`Pipeline deployment failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Pipeline deployment failed:', error);
    throw error;
  }
}

// ============================================================================
// RESOURCE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get resource alerts from backend
 */
export async function getResourceAlerts(
  pipelineId: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): Promise<APIResponse<any[]>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/alerts?severity=${severity || 'all'}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch resource alerts: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching resource alerts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get resource recommendations from backend
 */
export async function getResourceRecommendations(
  pipelineId: string,
  context?: Record<string, any>
): Promise<APIResponse<any[]>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch resource recommendations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching resource recommendations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get cost analysis from backend
 */
export async function getCostAnalysis(
  pipelineId: string,
  timeframe: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/cost-analysis?timeframe=${timeframe}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cost analysis: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cost analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Get resource predictions from backend
 */
export async function getResourcePredictions(
  pipelineId: string,
  horizon: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/predictions?horizon=${horizon}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch resource predictions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching resource predictions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Create resource pool with backend integration
 */
export async function createResourcePool(
  request: {
    name: string;
    type: 'compute' | 'storage' | 'network' | 'mixed';
    capacity: Record<string, number>;
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<any>> {
  try {
    const response = await fetch('/api/resource-pool/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create resource pool: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating resource pool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Optimize resource allocation with backend integration
 */
export async function optimizeResourceAllocation(
  pipelineId: string,
  constraints?: Record<string, any>
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/optimize-allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ constraints })
    });

    if (!response.ok) {
      throw new Error(`Failed to optimize resource allocation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error optimizing resource allocation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Allocate resources with backend integration
 */
export async function allocateResources(
  request: {
    pipelineId: string;
    resources: Record<string, number>;
    priority: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<any>> {
  try {
    const response = await fetch('/api/resource/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to allocate resources: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error allocating resources:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

// ============================================================================
// TEMPLATE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get template library from backend
 */
export async function getTemplateLibrary(
  filters?: Record<string, any>
): Promise<APIResponse<any[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }

    const response = await fetch(`/api/template/library?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template library: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template library:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get template analytics from backend
 */
export async function getTemplateAnalytics(
  templateId: string,
  timeframe: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/template/${templateId}/analytics?timeframe=${timeframe}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template analytics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Get template recommendations from backend
 */
export async function getTemplateRecommendations(
  context?: Record<string, any>
): Promise<APIResponse<any[]>> {
  try {
    const response = await fetch('/api/template/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template recommendations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template recommendations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Create pipeline template with backend integration
 */
export async function createPipelineTemplate(
  request: {
    name: string;
    description: string;
    definition: any;
    category: string;
    tags: string[];
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<any>> {
  try {
    const response = await fetch('/api/template/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create pipeline template: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating pipeline template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Clone template with backend integration
 */
export async function cloneTemplate(
  templateId: string,
  modifications?: Record<string, any>
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/template/${templateId}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modifications })
    });

    if (!response.ok) {
      throw new Error(`Failed to clone template: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cloning template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Delete pipeline template with backend integration
 */
export async function deletePipelineTemplate(
  templateId: string
): Promise<APIResponse<boolean>> {
  try {
    const response = await fetch(`/api/template/${templateId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete pipeline template: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting pipeline template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: false
    };
  }
}

/**
 * Import template with backend integration
 */
export async function importTemplate(
  request: {
    file: File;
    category: string;
    tags: string[];
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<any>> {
  try {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('category', request.category);
    formData.append('tags', JSON.stringify(request.tags));
    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata));
    }

    const response = await fetch('/api/template/import', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to import template: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error importing template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Rate template with backend integration
 */
export async function rateTemplate(
  templateId: string,
  rating: number,
  comment?: string
): Promise<APIResponse<boolean>> {
  try {
    const response = await fetch(`/api/template/${templateId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    });

    if (!response.ok) {
      throw new Error(`Failed to rate template: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error rating template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: false
    };
  }
}

/**
 * Validate template compatibility with backend integration
 */
export async function validateTemplateCompatibility(
  templateId: string,
  targetEnvironment: Record<string, any>
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/template/${templateId}/validate-compatibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetEnvironment })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate template compatibility: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating template compatibility:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Get pipeline templates from backend
 */
export async function getPipelineTemplates(
  filters?: Record<string, any>
): Promise<APIResponse<any[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }

    const response = await fetch(`/api/pipeline/templates?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pipeline templates: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pipeline templates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get template categories from backend
 */
export async function getTemplateCategories(): Promise<APIResponse<string[]>> {
  try {
    const response = await fetch('/api/template/categories', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get template marketplace from backend
 */
export async function getTemplateMarketplace(
  filters?: Record<string, any>
): Promise<APIResponse<any[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }

    const response = await fetch(`/api/template/marketplace?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template marketplace: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template marketplace:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Generate AI template with backend integration
 */
export async function generateAITemplate(
  request: {
    description: string;
    requirements: string[];
    category: string;
    complexity: 'simple' | 'medium' | 'complex';
    metadata?: Record<string, any>;
  }
): Promise<APIResponse<any>> {
  try {
    const response = await fetch('/api/template/generate-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate AI template: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating AI template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Get template versions from backend
 */
export async function getTemplateVersions(
  templateId: string
): Promise<APIResponse<any[]>> {
  try {
    const response = await fetch(`/api/template/${templateId}/versions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template versions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template versions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get template collaborators from backend
 */
export async function getTemplateCollaborators(
  templateId: string
): Promise<APIResponse<any[]>> {
  try {
    const response = await fetch(`/api/template/${templateId}/collaborators`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template collaborators: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template collaborators:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get template comments from backend
 */
export async function getTemplateComments(
  templateId: string
): Promise<APIResponse<any[]>> {
  try {
    const response = await fetch(`/api/template/${templateId}/comments`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template comments: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template comments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get template metrics from backend
 */
export async function getTemplateMetrics(
  templateId: string,
  timeframe: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/template/${templateId}/metrics?timeframe=${timeframe}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template metrics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching template metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Validate template with backend integration
 */
export async function validateTemplate(
  templateId: string,
  environment: Record<string, any>
): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`/api/template/${templateId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate template: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Analyze resource utilization with backend integration
 */
export async function analyzeResourceUtilization(
  pipelineId: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
): Promise<APIResponse<ResourceUtilizationAnalysis>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/resource-utilization?timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Resource utilization analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resource utilization analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        cpu: { current: 0, average: 0, peak: 0 },
        memory: { current: 0, average: 0, peak: 0 },
        storage: { current: 0, average: 0, peak: 0 },
        network: { current: 0, average: 0, peak: 0 }
      }
    };
  }
}

/**
 * Analyze cost efficiency with backend integration
 */
export async function analyzeCostEfficiency(
  pipelineId: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
): Promise<APIResponse<CostEfficiencyAnalysis>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/cost-efficiency?timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Cost efficiency analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Cost efficiency analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        totalCost: 0,
        costPerExecution: 0,
        costBreakdown: {},
        efficiencyScore: 0,
        recommendations: []
      }
    };
  }
}

/**
 * Predict pipeline bottlenecks with backend integration
 */
export async function predictPipelineBottlenecks(
  pipelineId: string,
  predictionHorizon: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<BottleneckPrediction[]>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/bottleneck-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ predictionHorizon })
    });

    if (!response.ok) {
      throw new Error(`Bottleneck prediction failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Bottleneck prediction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Optimize pipeline performance with backend integration
 */
export async function optimizePipelinePerformance(
  pipelineId: string,
  optimizationTarget: 'throughput' | 'latency' | 'resource' | 'comprehensive',
  constraints?: Record<string, any>
): Promise<APIResponse<PerformanceOptimizationResult>> {
  try {
    const response = await fetch(`/api/pipeline/${pipelineId}/optimize-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optimizationTarget, constraints })
    });

    if (!response.ok) {
      throw new Error(`Performance optimization failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Performance optimization failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        optimizedConfig: {},
        expectedImprovements: {},
        implementationSteps: []
      }
    };
  }
}

/**
 * Get system health status with backend integration
 */
export async function getSystemHealthStatus(
  pipelineId?: string
): Promise<APIResponse<SystemHealthStatus>> {
  try {
    const params = pipelineId ? `?pipelineId=${pipelineId}` : '';
    const response = await fetch(`/api/system/health${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`System health status fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('System health status fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        overall: 'unknown',
        components: {},
        lastCheck: new Date().toISOString()
      }
    };
  }
}

/**
 * Monitor resource health with backend integration
 */
export async function monitorResourceHealth(
  resourceType: 'cpu' | 'memory' | 'storage' | 'network' | 'all',
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<ResourceHealthStatus[]>> {
  try {
    const response = await fetch(`/api/system/resource-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceType, timeRange })
    });

    if (!response.ok) {
      throw new Error(`Resource health monitoring failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resource health monitoring failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Generate health alerts with backend integration
 */
export async function generateHealthAlerts(
  severity: 'low' | 'medium' | 'high' | 'critical',
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<HealthAlert[]>> {
  try {
    const response = await fetch(`/api/system/health-alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ severity, timeRange })
    });

    if (!response.ok) {
      throw new Error(`Health alert generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health alert generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get health trends with backend integration
 */
export async function getHealthTrends(
  metric: string,
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
): Promise<APIResponse<HealthTrend[]>> {
  try {
    const response = await fetch(`/api/system/health-trends?metric=${metric}&timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Health trends fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health trends fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get health anomalies with backend integration
 */
export async function getHealthAnomalies(
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<HealthAnomaly[]>> {
  try {
    const response = await fetch(`/api/system/health-anomalies?timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Health anomalies fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health anomalies fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get health forecasting with backend integration
 */
export async function getHealthForecasting(
  metric: string,
  forecastHorizon: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<HealthForecast>> {
  try {
    const response = await fetch(`/api/system/health-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric, forecastHorizon })
    });

    if (!response.ok) {
      throw new Error(`Health forecasting failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health forecasting failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        metric: '',
        predictions: [],
        confidence: 0
      }
    };
  }
}

/**
 * Get health correlation analysis with backend integration
 */
export async function getHealthCorrelationAnalysis(
  metrics: string[],
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<HealthCorrelation[]>> {
  try {
    const response = await fetch(`/api/system/health-correlation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, timeRange })
    });

    if (!response.ok) {
      throw new Error(`Health correlation analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health correlation analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get health optimization suggestions with backend integration
 */
export async function getHealthOptimizationSuggestions(
  currentMetrics: Record<string, number>,
  targetMetrics: Record<string, number>
): Promise<APIResponse<HealthOptimizationSuggestion[]>> {
  try {
    const response = await fetch(`/api/system/health-optimization-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentMetrics, targetMetrics })
    });

    if (!response.ok) {
      throw new Error(`Health optimization suggestions failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health optimization suggestions failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get compliance health status with backend integration
 */
export async function getComplianceHealthStatus(
  pipelineId?: string
): Promise<APIResponse<ComplianceHealthStatus>> {
  try {
    const params = pipelineId ? `?pipelineId=${pipelineId}` : '';
    const response = await fetch(`/api/system/compliance-health${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Compliance health status fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Compliance health status fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        overall: 'unknown',
        standards: {},
        violations: [],
        lastCheck: new Date().toISOString()
      }
    };
  }
}

/**
 * Perform health diagnostics with backend integration
 */
export async function performHealthDiagnostics(
  diagnosticType: 'quick' | 'comprehensive' | 'targeted',
  targetComponents?: string[]
): Promise<APIResponse<HealthDiagnosticResult>> {
  try {
    const response = await fetch(`/api/system/health-diagnostics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosticType, targetComponents })
    });

    if (!response.ok) {
      throw new Error(`Health diagnostics failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health diagnostics failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        status: 'failed',
        issues: [],
        recommendations: [],
        executionTime: 0
      }
    };
  }
}

/**
 * Get resource pools with backend integration
 */
export async function getResourcePools(
  poolType?: 'compute' | 'storage' | 'network' | 'mixed'
): Promise<APIResponse<ResourcePool[]>> {
  try {
    const params = poolType ? `?type=${poolType}` : '';
    const response = await fetch(`/api/resource-pool${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Resource pools fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resource pools fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get resource usage with backend integration
 */
export async function getResourceUsage(
  resourceId: string,
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<ResourceUsage[]>> {
  try {
    const response = await fetch(`/api/resource/${resourceId}/usage?timeRange=${timeRange}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Resource usage fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resource usage fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get resource metrics with backend integration
 */
export async function getResourceMetrics(
  resourceId: string,
  metrics: string[],
  timeRange: '1h' | '6h' | '24h' | '7d' = '24h'
): Promise<APIResponse<ResourceMetrics>> {
  try {
    const response = await fetch(`/api/resource/${resourceId}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, timeRange })
    });

    if (!response.ok) {
      throw new Error(`Resource metrics fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Resource metrics fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        resourceId: '',
        metrics: {},
        timestamp: new Date().toISOString()
      }
    };
  }
}
