import { ApiClient } from '@/lib/api-client';

const BASE = '/api/v1/scan/performance/resource-optimization';

export class ResourceOptimizationAPIService {
  private client: ApiClient;
  constructor() { this.client = new ApiClient(); }

  async analyzeUsage(params?: Record<string, any>) { return this.client.get(`${BASE}/usage`, { params }); }
  async optimizeAllocation(payload: any) { return this.client.post(`${BASE}/optimize`, payload); }
  async predictDemand(params?: Record<string, any>) { return this.client.get(`${BASE}/demand`, { params }); }
}

export const resourceOptimizationAPI = new ResourceOptimizationAPIService();

export const {
  analyzeUsage: analyzeResourceUsage,
  optimizeAllocation: optimizeResourceAllocation,
  predictDemand: predictResourceDemand,
} = resourceOptimizationAPI;

// Additional resource optimization functions
export const scaleResourceCapacity = async (resourceId: string, scaleType: 'up' | 'down' | 'auto', capacity: number, params?: Record<string, any>) => {
  const response = await resourceOptimizationAPI.optimizeAllocation({ resourceId, scaleType, capacity, ...params });
  return response.data;
};

export const migrateResources = async (sourceId: string, targetId: string, migrationType: 'full' | 'partial' | 'incremental', params?: Record<string, any>) => {
  const response = await resourceOptimizationAPI.optimizeAllocation({ sourceId, targetId, migrationType, ...params });
  return response.data;
};

export const consolidateResources = async (resourceIds: string[], consolidationType: 'merge' | 'pool' | 'cluster', params?: Record<string, any>) => {
  const response = await resourceOptimizationAPI.optimizeAllocation({ resourceIds, consolidationType, ...params });
  return response.data;
};



