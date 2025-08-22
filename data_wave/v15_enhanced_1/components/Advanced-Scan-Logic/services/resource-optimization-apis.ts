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



