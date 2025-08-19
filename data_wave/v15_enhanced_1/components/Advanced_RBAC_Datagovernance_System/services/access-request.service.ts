// Access Request Service - Maps to backend access request management
// Provides comprehensive access request workflows, approvals, and automation

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  AccessRequest,
  AccessRequestCreate,
  AccessRequestUpdate,
  AccessReview,
  AccessApproval,
  AccessWorkflow,
  AccessPolicy,
  AccessRequestTemplate,
  AccessRequestAnalytics,
  AccessNotification,
  AccessEscalation
} from '../types/access-request.types';
import type { User } from '../types/user.types';
import type { Role } from '../types/role.types';
import type { Resource } from '../types/resource.types';

export interface AccessRequestFilters {
  search?: string;
  status?: 'pending' | 'approved' | 'denied' | 'expired' | 'cancelled';
  requestType?: 'role' | 'permission' | 'resource' | 'temporary' | 'emergency';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  requesterId?: number;
  reviewerId?: number;
  resourceType?: string;
  resourceId?: string;
  createdAfter?: string;
  createdBefore?: string;
  expiresAfter?: string;
  expiresBefore?: string;
  tags?: string[];
  hasComments?: boolean;
  requiresApproval?: boolean;
}

export interface AccessRequestPagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AccessRequestWorkflow {
  name: string;
  description?: string;
  steps: Array<{
    name: string;
    type: 'approval' | 'review' | 'notification' | 'automation';
    approvers?: number[];
    conditions?: Record<string, any>;
    timeout?: number;
    escalation?: {
      after: number;
      to: number[];
      action: 'notify' | 'auto_approve' | 'auto_deny';
    };
  }>;
  triggers: Array<{
    condition: Record<string, any>;
    priority: number;
  }>;
  isActive: boolean;
}

export class AccessRequestService {
  // === Core CRUD Operations ===

  /**
   * Get access requests with advanced filtering and pagination
   */
  async getAccessRequests(
    filters: AccessRequestFilters = {},
    pagination: AccessRequestPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<AccessRequest>>> {
    const params = new URLSearchParams();
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    // Apply pagination
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `${RBAC_ENDPOINTS.ACCESS_REQUESTS}?${queryString}` : RBAC_ENDPOINTS.ACCESS_REQUESTS;
    
    return rbacApiService.get<PaginatedResponse<AccessRequest>>(url);
  }

  /**
   * Get access request by ID
   */
  async getAccessRequest(
    requestId: number,
    includeHistory = true,
    includeComments = true
  ): Promise<ApiResponse<AccessRequest>> {
    const params = new URLSearchParams({
      include_history: includeHistory.toString(),
      include_comments: includeComments.toString()
    });
    
    return rbacApiService.get<AccessRequest>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}?${params.toString()}`);
  }

  /**
   * Create new access request
   */
  async createAccessRequest(requestData: AccessRequestCreate): Promise<ApiResponse<AccessRequest>> {
    return rbacApiService.post<AccessRequest>(RBAC_ENDPOINTS.REQUEST_ACCESS, requestData);
  }

  /**
   * Update access request
   */
  async updateAccessRequest(requestId: number, updates: AccessRequestUpdate): Promise<ApiResponse<AccessRequest>> {
    return rbacApiService.put<AccessRequest>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}`, updates);
  }

  /**
   * Cancel access request
   */
  async cancelAccessRequest(
    requestId: number,
    reason?: string
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/cancel`, {
      reason: reason || null
    });
  }

  // === Request Lifecycle Management ===

  /**
   * Submit access request for review
   */
  async submitAccessRequest(requestId: number): Promise<ApiResponse<AccessRequest>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/submit`, {});
  }

  /**
   * Approve access request
   */
  async approveAccessRequest(
    requestId: number,
    approval: {
      comment?: string;
      conditions?: Record<string, any>;
      expiresAt?: string;
      partialApproval?: {
        approvedItems: string[];
        deniedItems: string[];
      };
    } = {}
  ): Promise<ApiResponse<AccessApproval>> {
    return rbacApiService.post<AccessApproval>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/approve`, approval);
  }

  /**
   * Deny access request
   */
  async denyAccessRequest(
    requestId: number,
    denial: {
      reason: string;
      comment?: string;
      suggestions?: string[];
    }
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/deny`, denial);
  }

  /**
   * Request more information
   */
  async requestMoreInformation(
    requestId: number,
    request: {
      questions: string[];
      deadline?: string;
      comment?: string;
    }
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/request-info`, request);
  }

  /**
   * Provide additional information
   */
  async provideAdditionalInformation(
    requestId: number,
    information: {
      answers: Record<string, string>;
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
      }>;
      comment?: string;
    }
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/provide-info`, information);
  }

  // === Review and Approval Workflows ===

  /**
   * Get pending reviews for current user
   */
  async getPendingReviews(
    pagination: AccessRequestPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<AccessRequest>>> {
    const params = new URLSearchParams();
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `${RBAC_ENDPOINTS.ACCESS_REVIEW}/pending?${queryString}`
      : `${RBAC_ENDPOINTS.ACCESS_REVIEW}/pending`;
    
    return rbacApiService.get<PaginatedResponse<AccessRequest>>(url);
  }

  /**
   * Bulk approve/deny requests
   */
  async bulkReviewRequests(actions: Array<{
    requestId: number;
    action: 'approve' | 'deny';
    comment?: string;
    conditions?: Record<string, any>;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    results: Array<{
      requestId: number;
      success: boolean;
      error?: string;
    }>;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REVIEW}/bulk`, { actions });
  }

  /**
   * Delegate review to another user
   */
  async delegateReview(
    requestId: number,
    delegateToUserId: number,
    comment?: string
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/delegate`, {
      delegate_to_user_id: delegateToUserId,
      comment: comment || null
    });
  }

  /**
   * Escalate access request
   */
  async escalateAccessRequest(
    requestId: number,
    escalation: {
      reason: string;
      escalateTo?: number[];
      priority?: 'high' | 'critical';
      deadline?: string;
    }
  ): Promise<ApiResponse<AccessEscalation>> {
    return rbacApiService.post<AccessEscalation>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/escalate`, escalation);
  }

  // === Workflow Management ===

  /**
   * Get access workflows
   */
  async getAccessWorkflows(): Promise<ApiResponse<AccessWorkflow[]>> {
    return rbacApiService.get<AccessWorkflow[]>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/workflows`);
  }

  /**
   * Create access workflow
   */
  async createAccessWorkflow(workflow: AccessRequestWorkflow): Promise<ApiResponse<AccessWorkflow>> {
    return rbacApiService.post<AccessWorkflow>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/workflows`, workflow);
  }

  /**
   * Update access workflow
   */
  async updateAccessWorkflow(workflowId: number, updates: Partial<AccessWorkflow>): Promise<ApiResponse<AccessWorkflow>> {
    return rbacApiService.put<AccessWorkflow>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/workflows/${workflowId}`, updates);
  }

  /**
   * Test access workflow
   */
  async testAccessWorkflow(
    workflowId: number,
    testRequest: AccessRequestCreate
  ): Promise<ApiResponse<{
    steps: Array<{
      stepName: string;
      triggered: boolean;
      approvers: User[];
      estimatedDuration: number;
      conditions: Record<string, any>;
    }>;
    totalEstimatedDuration: number;
    potentialIssues: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/workflows/${workflowId}/test`, { test_request: testRequest });
  }

  // === Templates and Automation ===

  /**
   * Get access request templates
   */
  async getAccessRequestTemplates(category?: string): Promise<ApiResponse<AccessRequestTemplate[]>> {
    const params = category ? `?category=${category}` : '';
    return rbacApiService.get<AccessRequestTemplate[]>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/templates${params}`);
  }

  /**
   * Create access request from template
   */
  async createFromTemplate(
    templateId: number,
    customizations?: Record<string, any>
  ): Promise<ApiResponse<AccessRequest>> {
    return rbacApiService.post<AccessRequest>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/templates/${templateId}/create`, {
      customizations: customizations || {}
    });
  }

  /**
   * Get automated approval rules
   */
  async getAutomatedApprovalRules(): Promise<ApiResponse<Array<{
    id: number;
    name: string;
    conditions: Record<string, any>;
    action: 'auto_approve' | 'fast_track' | 'require_additional_approval';
    isActive: boolean;
    usageCount: number;
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/automation/rules`);
  }

  /**
   * Create automated approval rule
   */
  async createAutomatedApprovalRule(rule: {
    name: string;
    description?: string;
    conditions: Record<string, any>;
    action: 'auto_approve' | 'fast_track' | 'require_additional_approval';
    limitations?: {
      maxDuration?: number;
      maxResources?: number;
      restrictedActions?: string[];
    };
    isActive: boolean;
  }): Promise<ApiResponse<any>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/automation/rules`, rule);
  }

  // === Analytics and Reporting ===

  /**
   * Get access request analytics
   */
  async getAccessRequestAnalytics(
    timeRange: {
      start: string;
      end: string;
    },
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<AccessRequestAnalytics>> {
    const params = new URLSearchParams({
      start_date: timeRange.start,
      end_date: timeRange.end,
      granularity
    });
    
    return rbacApiService.get<AccessRequestAnalytics>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/analytics?${params.toString()}`);
  }

  /**
   * Get approval metrics
   */
  async getApprovalMetrics(
    timeRange?: {
      start: string;
      end: string;
    },
    groupBy: 'approver' | 'request_type' | 'department' | 'priority' = 'request_type'
  ): Promise<ApiResponse<{
    totalRequests: number;
    approvedRequests: number;
    deniedRequests: number;
    pendingRequests: number;
    averageApprovalTime: number;
    approvalRate: number;
    metrics: Array<{
      group: string;
      totalRequests: number;
      approvedRequests: number;
      deniedRequests: number;
      averageTime: number;
      approvalRate: number;
    }>;
    trends: Array<{
      date: string;
      totalRequests: number;
      approvedRequests: number;
      averageTime: number;
    }>;
  }>> {
    const params = new URLSearchParams({ group_by: groupBy });
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    return rbacApiService.get(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/metrics?${params.toString()}`);
  }

  /**
   * Get bottleneck analysis
   */
  async getBottleneckAnalysis(
    timeRange: {
      start: string;
      end: string;
    }
  ): Promise<ApiResponse<{
    bottlenecks: Array<{
      stage: string;
      averageTime: number;
      medianTime: number;
      maxTime: number;
      requestCount: number;
      impact: 'low' | 'medium' | 'high';
      recommendations: string[];
    }>;
    slowestApprovers: Array<{
      user: User;
      averageTime: number;
      requestCount: number;
      onTimeRate: number;
    }>;
    workflowEfficiency: Record<string, {
      averageTime: number;
      completionRate: number;
      escalationRate: number;
    }>;
  }>> {
    const params = new URLSearchParams({
      start_date: timeRange.start,
      end_date: timeRange.end
    });
    
    return rbacApiService.get(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/bottlenecks?${params.toString()}`);
  }

  // === Notifications and Communications ===

  /**
   * Get access request notifications
   */
  async getAccessRequestNotifications(
    filters: {
      type?: 'request_submitted' | 'approval_needed' | 'request_approved' | 'request_denied' | 'request_expired';
      isRead?: boolean;
      timeRange?: {
        start: string;
        end: string;
      };
    } = {},
    pagination: AccessRequestPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<AccessNotification>>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'start' in value) {
          params.append('start_date', value.start);
          params.append('end_date', value.end);
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return rbacApiService.get<PaginatedResponse<AccessNotification>>(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/notifications?${params.toString()}`);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: number): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/notifications/${notificationId}/read`, {});
  }

  /**
   * Send reminder for pending request
   */
  async sendReminder(
    requestId: number,
    message?: string
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/remind`, {
      message: message || null
    });
  }

  // === Comments and Collaboration ===

  /**
   * Add comment to access request
   */
  async addComment(
    requestId: number,
    comment: {
      text: string;
      isPrivate?: boolean;
      mentionedUsers?: number[];
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
      }>;
    }
  ): Promise<ApiResponse<any>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/comments`, comment);
  }

  /**
   * Get comments for access request
   */
  async getComments(
    requestId: number,
    includePrivate = false
  ): Promise<ApiResponse<Array<{
    id: number;
    text: string;
    author: User;
    createdAt: string;
    isPrivate: boolean;
    attachments: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  }>>> {
    const params = includePrivate ? '?include_private=true' : '';
    return rbacApiService.get(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/comments${params}`);
  }

  // === Emergency Access ===

  /**
   * Create emergency access request
   */
  async createEmergencyAccessRequest(request: {
    reason: string;
    urgency: 'high' | 'critical';
    requestedAccess: {
      roles?: number[];
      permissions?: number[];
      resources?: Array<{
        id: number;
        type: string;
        actions: string[];
      }>;
    };
    duration: number; // in hours
    justification: string;
    emergencyContact?: string;
  }): Promise<ApiResponse<AccessRequest>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/emergency`, request);
  }

  /**
   * Approve emergency access
   */
  async approveEmergencyAccess(
    requestId: number,
    approval: {
      comment?: string;
      reducedDuration?: number;
      additionalConditions?: Record<string, any>;
    } = {}
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/${requestId}/emergency-approve`, approval);
  }

  // === Compliance and Audit ===

  /**
   * Get compliance report for access requests
   */
  async getComplianceReport(
    timeRange: {
      start: string;
      end: string;
    },
    framework: 'SOX' | 'GDPR' | 'HIPAA' | 'SOC2' = 'SOX'
  ): Promise<ApiResponse<{
    framework: string;
    period: { start: string; end: string };
    summary: {
      totalRequests: number;
      approvedRequests: number;
      deniedRequests: number;
      averageApprovalTime: number;
      complianceScore: number;
    };
    violations: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      requests: AccessRequest[];
      remediation: string[];
    }>;
    recommendations: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/compliance`, {
      time_range: timeRange,
      framework
    });
  }

  /**
   * Get segregation of duties analysis
   */
  async getSegregationOfDutiesAnalysis(): Promise<ApiResponse<{
    conflicts: Array<{
      user: User;
      conflictingRoles: Role[];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendations: string[];
    }>;
    patterns: Array<{
      pattern: string;
      frequency: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      affectedUsers: User[];
    }>;
    summary: {
      totalConflicts: number;
      highRiskConflicts: number;
      affectedUsers: number;
      complianceScore: number;
    };
  }>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.ACCESS_REQUESTS}/sod-analysis`);
  }
}

// Export singleton instance
export const accessRequestService = new AccessRequestService();
export default accessRequestService;