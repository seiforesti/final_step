import { ApiClient } from '@/lib copie/api-client';

const BASE = '/api/v1/scan/performance/latency';

export class LatencyReducerAPIService {
  private client: ApiClient;
  constructor() { this.client = new ApiClient(); }

  async listReducers() { return this.client.get(`${BASE}/reducers`); }
  async getReducer(id: string) { return this.client.get(`${BASE}/reducers/${id}`); }
  async createReducer(payload: any) { return this.client.post(`${BASE}/reducers`, payload); }
  async updateReducer(id: string, payload: any) { return this.client.put(`${BASE}/reducers/${id}`, payload); }
  async deleteReducer(id: string) { return this.client.delete(`${BASE}/reducers/${id}`); }

  async getMetrics(params?: Record<string, any>) { return this.client.get(`${BASE}/metrics`, { params }); }
  async getConfiguration(id: string) { return this.client.get(`${BASE}/reducers/${id}/configuration`); }
  async updateConfiguration(id: string, payload: any) { return this.client.put(`${BASE}/reducers/${id}/configuration`, payload); }
  
  // Missing function referenced by components
  async optimizeLatency(params?: Record<string, any>) { 
    return this.client.post(`${BASE}/optimize`, params); 
  }
}

export const latencyReducerAPI = new LatencyReducerAPIService();

export const {
  listReducers: fetchLatencyReducers,
  getReducer: fetchLatencyReducer,
  createReducer: createLatencyReducer,
  updateReducer: updateLatencyReducer,
  deleteReducer: deleteLatencyReducer,
  getMetrics: fetchLatencyMetrics,
  getConfiguration: fetchLatencyConfiguration,
  updateConfiguration: updateLatencyConfiguration,
  optimizeLatency,
} = latencyReducerAPI;



