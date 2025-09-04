import { ApiClient } from '@/lib copie/api-client';

const BASE = '/api/v1/scan/performance/monitoring';

export class PerformanceMonitoringAPIService {
  private client: ApiClient;
  constructor() { this.client = new ApiClient(); }

  async startMonitoring(targetId: string, payload?: any) { return this.client.post(`${BASE}/${targetId}/start`, payload || {}); }
  async stopMonitoring(targetId: string) { return this.client.post(`${BASE}/${targetId}/stop`, {}); }
  async pauseMonitoring(targetId: string) { return this.client.post(`${BASE}/${targetId}/pause`, {}); }
  async resumeMonitoring(targetId: string) { return this.client.post(`${BASE}/${targetId}/resume`, {}); }
  async getMetrics(targetId: string, params?: Record<string, any>) { return this.client.get(`${BASE}/${targetId}/metrics`, { params }); }
  async getAlerts(targetId: string, params?: Record<string, any>) { return this.client.get(`${BASE}/${targetId}/alerts`, { params }); }
}

export const performanceMonitoringAPI = new PerformanceMonitoringAPIService();

export const {
  startMonitoring: startPerformanceMonitoring,
  stopMonitoring: stopPerformanceMonitoring,
  pauseMonitoring: pausePerformanceMonitoring,
  resumeMonitoring: resumePerformanceMonitoring,
  getMetrics: fetchPerformanceMetrics,
  getAlerts: fetchPerformanceAlerts,
} = performanceMonitoringAPI;

// Additional performance monitoring functions
export const exportPerformanceData = async (targetId: string, format: 'json' | 'csv' | 'excel' = 'json', params?: Record<string, any>) => {
  const response = await performanceMonitoringAPI.getMetrics(targetId, { ...params, format });
  return response.data;
};

export const getPerformanceReport = async (targetId: string, reportType: 'summary' | 'detailed' | 'trend' = 'summary', params?: Record<string, any>) => {
  const response = await performanceMonitoringAPI.getMetrics(targetId, { ...params, report_type: reportType });
  return response.data;
};



