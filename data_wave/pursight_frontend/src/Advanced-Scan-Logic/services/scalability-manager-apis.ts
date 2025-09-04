import { ApiClient } from '@/lib copie/api-client';

const BASE = '/api/v1/scan/performance/scalability';

export class ScalabilityManagerAPIService {
  private client: ApiClient;
  constructor() { this.client = new ApiClient(); }

  async listManagers() { return this.client.get(`${BASE}/managers`); }
  async getManager(id: string) { return this.client.get(`${BASE}/managers/${id}`); }
  async createManager(payload: any) { return this.client.post(`${BASE}/managers`, payload); }
  async updateManager(id: string, payload: any) { return this.client.put(`${BASE}/managers/${id}`, payload); }
  async deleteManager(id: string) { return this.client.delete(`${BASE}/managers/${id}`); }

  async getConfiguration(id: string) { return this.client.get(`${BASE}/managers/${id}/configuration`); }
  async updateConfiguration(id: string, payload: any) { return this.client.put(`${BASE}/managers/${id}/configuration`, payload); }
  async getMetrics(id: string, params?: Record<string, any>) { return this.client.get(`${BASE}/managers/${id}/metrics`, { params }); }
  
  // Missing functions referenced by components
  async scaleUp(id: string, params?: Record<string, any>) { 
    return this.client.post(`${BASE}/managers/${id}/scale-up`, params); 
  }
  
  async scaleDown(id: string, params?: Record<string, any>) { 
    return this.client.post(`${BASE}/managers/${id}/scale-down`, params); 
  }
  
  async analyzeScalability(id: string, params?: Record<string, any>) { 
    return this.client.post(`${BASE}/managers/${id}/analyze`, params); 
  }
}

export const scalabilityManagerAPI = new ScalabilityManagerAPIService();

export const {
  listManagers: fetchScalabilityManagers,
  getManager: fetchScalabilityManager,
  createManager: createScalabilityManager,
  updateManager: updateScalabilityManager,
  deleteManager: deleteScalabilityManager,
  getConfiguration: fetchScalabilityConfiguration,
  updateConfiguration: updateScalabilityConfiguration,
  getMetrics: fetchScalabilityMetrics,
  scaleUp,
  scaleDown,
  analyzeScalability,
} = scalabilityManagerAPI;



