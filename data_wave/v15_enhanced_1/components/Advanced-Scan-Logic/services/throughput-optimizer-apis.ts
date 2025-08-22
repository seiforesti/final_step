// Advanced Throughput Optimizer APIs - aligned with backend routes
// Maps to: /api/v1/throughput-optimizer
import { ApiClient } from '@/lib/api-client';

export class ThroughputOptimizerAPIService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor() {
    this.apiClient = new ApiClient();
    this.baseUrl = '/api/v1/throughput-optimizer';
  }

  async listOptimizers() { return this.apiClient.get(`${this.baseUrl}/optimizers`); }
  async getOptimizer(id: string) { return this.apiClient.get(`${this.baseUrl}/optimizers/${id}`); }
  async createThroughputOptimizer(payload: any) { return this.apiClient.post(`${this.baseUrl}/optimizers`, payload); }
  async updateThroughputOptimizer(id: string, payload: any) { return this.apiClient.put(`${this.baseUrl}/optimizers/${id}`, payload); }
  async deleteThroughputOptimizer(id: string) { return this.apiClient.delete(`${this.baseUrl}/optimizers/${id}`); }

  async getMetrics(params?: Record<string, any>) { return this.apiClient.get(`${this.baseUrl}/metrics`, { params }); }
  async getConfiguration(id: string) { return this.apiClient.get(`${this.baseUrl}/optimizers/${id}/configuration`); }
  async updateConfiguration(id: string, payload: any) { return this.apiClient.put(`${this.baseUrl}/optimizers/${id}/configuration`, payload); }
}

export const throughputOptimizerAPI = new ThroughputOptimizerAPIService();
export default throughputOptimizerAPI;

export const {
  createThroughputOptimizer,
  updateThroughputOptimizer,
  deleteThroughputOptimizer,
} = throughputOptimizerAPI as any;


