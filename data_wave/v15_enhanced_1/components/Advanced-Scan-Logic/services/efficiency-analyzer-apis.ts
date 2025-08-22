import { ApiClient } from '@/lib/api-client';

const BASE = '/api/v1/scan/performance/efficiency';

export class EfficiencyAnalyzerAPIService {
  private client: ApiClient;
  constructor() { this.client = new ApiClient(); }

  async listAnalyzers() { return this.client.get(`${BASE}/analyzers`); }
  async getAnalyzer(id: string) { return this.client.get(`${BASE}/analyzers/${id}`); }
  async createAnalyzer(payload: any) { return this.client.post(`${BASE}/analyzers`, payload); }
  async updateAnalyzer(id: string, payload: any) { return this.client.put(`${BASE}/analyzers/${id}`, payload); }
  async deleteAnalyzer(id: string) { return this.client.delete(`${BASE}/analyzers/${id}`); }

  async getMetrics(params?: Record<string, any>) { return this.client.get(`${BASE}/metrics`, { params }); }
  async getConfiguration(id: string) { return this.client.get(`${BASE}/analyzers/${id}/configuration`); }
  async updateConfiguration(id: string, payload: any) { return this.client.put(`${BASE}/analyzers/${id}/configuration`, payload); }
}

export const efficiencyAnalyzerAPI = new EfficiencyAnalyzerAPIService();

export const {
  listAnalyzers: fetchEfficiencyAnalyzers,
  getAnalyzer: fetchEfficiencyAnalyzer,
  createAnalyzer: createEfficiencyAnalyzer,
  updateAnalyzer: updateEfficiencyAnalyzer,
  deleteAnalyzer: deleteEfficiencyAnalyzer,
  getMetrics: fetchEfficiencyMetrics,
  getConfiguration: fetchEfficiencyConfiguration,
  updateConfiguration: updateEfficiencyConfiguration,
} = efficiencyAnalyzerAPI;



