// Advanced Approval Management APIs - aligned to backend
// Maps to: /api/v1/workflow/approval
import { ApiClient } from '@/lib copie/api-client';

export class ApprovalAPIService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor() {
    this.apiClient = new ApiClient();
    this.baseUrl = '/api/v1/workflow/approval';
  }

  // Workflow Management
  async getWorkflows(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dateRange' && value.start && value.end) {
            queryParams.append('startDate', value.start.toISOString());
            queryParams.append('endDate', value.end.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const url = `${this.baseUrl}/workflows${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(url);
  }

  async getWorkflow(id: string) {
    return this.apiClient.get(`${this.baseUrl}/workflows/${id}`);
  }

  async createWorkflow(workflow: any) {
    return this.apiClient.post(`${this.baseUrl}/workflows`, workflow);
  }

  async updateWorkflow(id: string, updates: any) {
    return this.apiClient.put(`${this.baseUrl}/workflows/${id}`, updates);
  }

  async deleteWorkflow(id: string) {
    return this.apiClient.delete(`${this.baseUrl}/workflows/${id}`);
  }

  async activateWorkflow(id: string) {
    return this.apiClient.post(`${this.baseUrl}/workflows/${id}/activate`);
  }

  async deactivateWorkflow(id: string) {
    return this.apiClient.post(`${this.baseUrl}/workflows/${id}/deactivate`);
  }

  // Request Management
  async getRequests(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dateRange' && value.start && value.end) {
            queryParams.append('startDate', value.start.toISOString());
            queryParams.append('endDate', value.end.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const url = `${this.baseUrl}/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(url);
  }

  async getRequest(id: string) {
    return this.apiClient.get(`${this.baseUrl}/requests/${id}`);
  }

  async submitRequest(request: any) {
    return this.apiClient.post(`${this.baseUrl}/requests`, request);
  }

  async updateRequest(id: string, updates: any) {
    return this.apiClient.put(`${this.baseUrl}/requests/${id}`, updates);
  }

  async cancelRequest(id: string, reason: string) {
    return this.apiClient.post(`${this.baseUrl}/requests/${id}/cancel`, { reason });
  }

  // Approval Actions
  async approveRequest(requestId: string, payload: any) {
    return this.apiClient.post(`${this.baseUrl}/requests/${requestId}/approve`, payload);
  }

  async rejectRequest(requestId: string, payload: any) {
    return this.apiClient.post(`${this.baseUrl}/requests/${requestId}/reject`, payload);
  }

  async escalateRequest(requestId: string, payload: any) {
    return this.apiClient.post(`${this.baseUrl}/requests/${requestId}/escalate`, payload);
  }

  async reassignRequest(requestId: string, payload: any) {
    return this.apiClient.post(`${this.baseUrl}/requests/${requestId}/reassign`, payload);
  }

  async addComment(requestId: string, comment: any) {
    return this.apiClient.post(`${this.baseUrl}/requests/${requestId}/comments`, comment);
  }

  // Policy Management
  async getPolicies(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = `${this.baseUrl}/policies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(url);
  }

  async getPolicy(id: string) {
    return this.apiClient.get(`${this.baseUrl}/policies/${id}`);
  }

  async createPolicy(policy: any) {
    return this.apiClient.post(`${this.baseUrl}/policies`, policy);
  }

  async updatePolicy(id: string, updates: any) {
    return this.apiClient.put(`${this.baseUrl}/policies/${id}`, updates);
  }

  async deletePolicy(id: string) {
    return this.apiClient.delete(`${this.baseUrl}/policies/${id}`);
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, data: any) {
    return this.apiClient.post(`${this.baseUrl}/workflows/${workflowId}/execute`, data);
  }

  async pauseWorkflow(workflowId: string, reason: string) {
    return this.apiClient.post(`${this.baseUrl}/workflows/${workflowId}/pause`, { reason });
  }

  async resumeWorkflow(workflowId: string) {
    return this.apiClient.post(`${this.baseUrl}/workflows/${workflowId}/resume`);
  }

  async rollbackWorkflow(workflowId: string, stepId: string, reason: string) {
    return this.apiClient.post(`${this.baseUrl}/workflows/${workflowId}/rollback`, { stepId, reason });
  }

  // Analytics and Reporting
  async getWorkflowMetrics(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dateRange' && value.start && value.end) {
            queryParams.append('startDate', value.start.toISOString());
            queryParams.append('endDate', value.end.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const url = `${this.baseUrl}/analytics/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(url);
  }

  async getApprovalHistory(requestId: string) {
    return this.apiClient.get(`${this.baseUrl}/requests/${requestId}/history`);
  }

  async getWorkflowAuditLog(workflowId: string, filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dateRange' && value.start && value.end) {
            queryParams.append('startDate', value.start.toISOString());
            queryParams.append('endDate', value.end.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const url = `${this.baseUrl}/workflows/${workflowId}/audit${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(url);
  }

  // Bulk Operations
  async bulkApproveRequests(requestIds: string[], payload: any) {
    return this.apiClient.post(`${this.baseUrl}/requests/bulk-approve`, { requestIds, ...payload });
  }

  async bulkRejectRequests(requestIds: string[], payload: any) {
    return this.apiClient.post(`${this.baseUrl}/requests/bulk-reject`, { requestIds, ...payload });
  }

  async bulkAssignRequests(requestIds: string[], assigneeId: string) {
    return this.apiClient.post(`${this.baseUrl}/requests/bulk-assign`, { requestIds, assigneeId });
  }

  // Notifications
  async getNotificationPreferences(userId: string) {
    return this.apiClient.get(`${this.baseUrl}/notifications/preferences/${userId}`);
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    return this.apiClient.put(`${this.baseUrl}/notifications/preferences/${userId}`, preferences);
  }

  async sendNotification(notification: any) {
    return this.apiClient.post(`${this.baseUrl}/notifications/send`, notification);
  }

  // Advanced Features
  async validateWorkflow(workflow: any) {
    return this.apiClient.post(`${this.baseUrl}/workflows/validate`, workflow);
  }

  async simulateWorkflow(workflowId: string, data: any) {
    return this.apiClient.post(`${this.baseUrl}/workflows/${workflowId}/simulate`, data);
  }

  async exportWorkflowData(workflowId: string, format: 'json' | 'csv' | 'xml') {
    return this.apiClient.get(`${this.baseUrl}/workflows/${workflowId}/export?format=${format}`);
  }

  async importWorkflowData(data: any, options?: any) {
    return this.apiClient.post(`${this.baseUrl}/workflows/import`, { data, options });
  }
}

export const approvalAPI = new ApprovalAPIService();
export default approvalAPI;

