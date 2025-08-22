import { ApiClient } from '@/lib/api-client';

const BASE = '/api/v1/scan/performance/load-balancer';

export class LoadBalancerAPIService {
  private client: ApiClient;
  constructor() { this.client = new ApiClient(); }

  async listBalancers() { return this.client.get(`${BASE}/balancers`); }
  async getBalancer(id: string) { return this.client.get(`${BASE}/balancers/${id}`); }
  async createBalancer(payload: any) { return this.client.post(`${BASE}/balancers`, payload); }
  async updateBalancer(id: string, payload: any) { return this.client.put(`${BASE}/balancers/${id}`, payload); }
  async deleteBalancer(id: string) { return this.client.delete(`${BASE}/balancers/${id}`); }

  async listPools(id: string) { return this.client.get(`${BASE}/balancers/${id}/pools`); }
  async listNodes(id: string) { return this.client.get(`${BASE}/balancers/${id}/nodes`); }
}

export const loadBalancerAPI = new LoadBalancerAPIService();

export const {
  listBalancers: fetchLoadBalancers,
  getBalancer: fetchLoadBalancer,
  createBalancer: createLoadBalancer,
  updateBalancer: updateLoadBalancer,
  deleteBalancer: deleteLoadBalancer,
  listPools: fetchLoadBalancerPools,
  listNodes: fetchLoadBalancerNodes,
} = loadBalancerAPI;



