// ============================================================================
// COLLABORATION SERVICE - ADVANCED TEAM COLLABORATION OPERATIONS
// ============================================================================
// Enterprise Data Governance System - Collaboration Service
// Team collaboration, discussions, reviews, workflows, notifications,
// and collaborative governance processes
// ============================================================================

import { apiClient } from '@/lib/api-client';
import {
  CatalogCollaborationHub,
  CollaborationTeam,
  TeamMember,
  DataStewardshipCenter,
  DataSteward,
  DataAnnotation,
  AssetReview,
  CrowdsourcingCampaign,
  ConsultationRequest,
  KnowledgeArticle,
  CollaborationActivity,
  TeamType,
  TeamPurpose,
  AnnotationTargetType,
  AnnotationType,
  ReviewType,
  ContributionType
} from '../types/collaboration.types';

// ============================================================================
// ADVANCED CATALOG COLLABORATION SERVICE
// ============================================================================

class AdvancedCatalogCollaborationService {
  private readonly baseUrl = '/api/v1/catalog/collaboration';

  // ========================================================================
  // COLLABORATION HUB OPERATIONS
  // ========================================================================

  /**
   * Create a collaboration hub for Advanced-Catalog
   */
  async createCollaborationHub(
    name: string,
    description: string,
    config?: Record<string, any>,
    governanceEnabled: boolean = true
  ): Promise<CatalogCollaborationHub> {
    const response = await apiClient.post(`${this.baseUrl}/hubs`, {
      name,
      description,
      config,
      governance_enabled: governanceEnabled
    });
    return response.data;
  }

  /**
   * Create a collaboration team within a hub
   */
  async createCollaborationTeam(
    hubId: number,
    name: string,
    description: string,
    teamType: TeamType = TeamType.DATA_STEWARDSHIP,
    purpose: TeamPurpose = TeamPurpose.ASSET_MANAGEMENT,
    assignedAssets: string[] = []
  ): Promise<CollaborationTeam> {
    const response = await apiClient.post(`${this.baseUrl}/hubs/${hubId}/teams`, {
      name,
      description,
      team_type: teamType,
      purpose,
      assigned_assets: assignedAssets
    });
    return response.data;
  }

  /**
   * Add a member to a collaboration team
   */
  async addTeamMember(
    teamId: number,
    userId: string,
    name: string,
    email: string,
    role: string = 'member',
    expertise: string[] = []
  ): Promise<TeamMember> {
    const response = await apiClient.post(`${this.baseUrl}/teams/${teamId}/members`, {
      user_id: userId,
      name,
      email,
      role,
      expertise
    });
    return response.data;
  }

  // ========================================================================
  // DATA STEWARDSHIP OPERATIONS
  // ========================================================================

  /**
   * Create a data stewardship center
   */
  async createStewardshipCenter(
    name: string,
    config?: Record<string, any>
  ): Promise<DataStewardshipCenter> {
    const response = await apiClient.post(`${this.baseUrl}/stewardship/centers`, {
      name,
      config
    });
    return response.data;
  }

  /**
   * Assign a data steward to a stewardship center
   */
  async assignDataSteward(
    centerId: number,
    userId: string,
    name: string,
    email: string,
    expertiseAreas: string[] = [],
    assignedAssets: string[] = []
  ): Promise<DataSteward> {
    const response = await apiClient.post(`${this.baseUrl}/stewardship/centers/${centerId}/stewards`, {
      user_id: userId,
      name,
      email,
      expertise_areas: expertiseAreas,
      assigned_assets: assignedAssets
    });
    return response.data;
  }

  // ========================================================================
  // ANNOTATION MANAGEMENT OPERATIONS
  // ========================================================================

  /**
   * Create a data annotation
   */
  async createAnnotation(
    managerId: number,
    targetId: string,
    targetType: AnnotationTargetType,
    content: string,
    annotationType: AnnotationType = AnnotationType.COMMENT,
    title?: string,
    category?: string,
    tags: string[] = []
  ): Promise<DataAnnotation> {
    const response = await apiClient.post(`${this.baseUrl}/annotations`, {
      manager_id: managerId,
      target_id: targetId,
      target_type: targetType,
      content,
      annotation_type: annotationType,
      title,
      category,
      tags
    });
    return response.data;
  }

  /**
   * Get annotations for a specific asset
   */
  async getAssetAnnotations(
    targetId: string,
    annotationType?: AnnotationType,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    annotations: DataAnnotation[];
    total: number;
  }> {
    const params: Record<string, any> = {
      limit,
      offset
    };
    
    if (annotationType) {
      params.annotation_type = annotationType;
    }

    const response = await apiClient.get(`${this.baseUrl}/annotations/assets/${targetId}`, {
      params
    });
    return response.data;
  }

  // ========================================================================
  // REVIEW WORKFLOW OPERATIONS
  // ========================================================================

  /**
   * Create a new asset review
   */
  async createAssetReview(
    engineId: number,
    assetId: string,
    reviewType: ReviewType,
    criteria?: Record<string, any>[]
  ): Promise<AssetReview> {
    const response = await apiClient.post(`${this.baseUrl}/reviews`, {
      engine_id: engineId,
      asset_id: assetId,
      review_type: reviewType,
      criteria
    });
    return response.data;
  }

  /**
   * Add a comment to a review
   */
  async addReviewComment(
    reviewId: number,
    content: string,
    commentType: string = 'general',
    parentCommentId?: number
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/reviews/${reviewId}/comments`, {
      content,
      comment_type: commentType,
      parent_comment_id: parentCommentId
    });
    return response.data;
  }

  // ========================================================================
  // COMMUNITY & CROWDSOURCING OPERATIONS
  // ========================================================================

  /**
   * Create a crowdsourcing campaign
   */
  async createCrowdsourcingCampaign(
    platformId: number,
    name: string,
    description: string,
    campaignType: string = 'annotation',
    targetAssets: string[] = [],
    goals?: Record<string, any>,
    endDate?: Date
  ): Promise<CrowdsourcingCampaign> {
    const response = await apiClient.post(`${this.baseUrl}/crowdsourcing/campaigns`, {
      platform_id: platformId,
      name,
      description,
      campaign_type: campaignType,
      target_assets: targetAssets,
      goals,
      end_date: endDate?.toISOString()
    });
    return response.data;
  }

  /**
   * Submit a community contribution
   */
  async submitCommunityContribution(
    platformId: number,
    contributorId: number,
    contributionType: ContributionType,
    title: string,
    targetAssetId: string,
    content: Record<string, any>,
    description?: string
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/community/contributions`, {
      platform_id: platformId,
      contributor_id: contributorId,
      contribution_type: contributionType,
      title,
      target_asset_id: targetAssetId,
      content,
      description
    });
    return response.data;
  }

  // ========================================================================
  // EXPERT NETWORKING OPERATIONS
  // ========================================================================

  /**
   * Request expert consultation
   */
  async requestExpertConsultation(
    networkId: number,
    topic: string,
    description: string,
    urgency: string = 'medium',
    relatedAssets: string[] = []
  ): Promise<ConsultationRequest> {
    const response = await apiClient.post(`${this.baseUrl}/expert-consultation/requests`, {
      network_id: networkId,
      topic,
      description,
      urgency,
      related_assets: relatedAssets
    });
    return response.data;
  }

  // ========================================================================
  // KNOWLEDGE BASE OPERATIONS
  // ========================================================================

  /**
   * Create a knowledge base article
   */
  async createKnowledgeArticle(
    knowledgeBaseId: number,
    title: string,
    content: string,
    summary?: string,
    keywords: string[] = [],
    tags: string[] = [],
    authors: Record<string, any>[] = [],
    relatedAssets: string[] = []
  ): Promise<KnowledgeArticle> {
    const response = await apiClient.post(`${this.baseUrl}/knowledge/articles`, {
      knowledge_base_id: knowledgeBaseId,
      title,
      content,
      summary,
      keywords,
      tags,
      authors,
      related_assets: relatedAssets
    });
    return response.data;
  }

  /**
   * Report comment
   */
  async reportComment(
    commentId: string,
    reason: 'spam' | 'inappropriate' | 'harassment' | 'other',
    description?: string
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/comments/${commentId}/report`, {
      reason,
      description
    });
  }

  // ========================================================================
  // ASSET REVIEWS OPERATIONS
  // ========================================================================

  /**
   * Get asset reviews
   */
  async getAssetReviews(
    assetId: string,
    filters?: {
      reviewers?: string[];
      types?: string[];
      status?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<AssetReview[]> {
    const response = await apiClient.get(`${this.baseUrl}/reviews/asset/${assetId}`, {
      params: {
        reviewers: filters?.reviewers?.join(','),
        types: filters?.types?.join(','),
        status: filters?.status?.join(','),
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString(),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      }
    });
    return response.data;
  }

  /**
   * Get all reviews across organization
   */
  async getAllReviews(
    filters?: {
      assetIds?: string[];
      reviewers?: string[];
      types?: string[];
      status?: string[];
      priority?: string[];
      dateRange?: { start: Date; end: Date };
      sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'progress';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    reviews: AssetReview[];
    total: number;
    summary: {
      byStatus: Record<string, number>;
      byType: Record<string, number>;
      byPriority: Record<string, number>;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/reviews/search`, { filters });
    return response.data;
  }

  /**
   * Get review details
   */
  async getReviewDetails(reviewId: string): Promise<{
    review: AssetReview;
    checklist: Array<{
      id: string;
      item: string;
      status: 'pending' | 'completed' | 'na';
      comment?: string;
      evidence?: Array<{ name: string; url: string }>;
    }>;
    comments: CollaborationComment[];
    history: Array<{
      timestamp: Date;
      action: string;
      user: string;
      comment?: string;
      oldValue?: any;
      newValue?: any;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/reviews/${reviewId}/details`);
    return response.data;
  }

  /**
   * Create asset review
   */
  async createAssetReview(review: {
    assetId: string;
    title: string;
    description: string;
    type: 'quality' | 'compliance' | 'security' | 'technical' | 'business';
    priority: 'low' | 'medium' | 'high' | 'critical';
    reviewer?: string;
    dueDate?: Date;
    templateId?: string;
    checklist?: Array<{
      item: string;
      required: boolean;
      category: string;
    }>;
    metadata?: Record<string, any>;
  }): Promise<AssetReview> {
    const response = await apiClient.post(`${this.baseUrl}/reviews`, {
      ...review,
      dueDate: review.dueDate?.toISOString()
    });
    return response.data;
  }

  /**
   * Update asset review
   */
  async updateAssetReview(
    reviewId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      status?: 'draft' | 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
      reviewer?: string;
      dueDate?: Date;
      progress?: number;
      findings?: string;
      recommendations?: string[];
    }
  ): Promise<AssetReview> {
    const response = await apiClient.patch(`${this.baseUrl}/reviews/${reviewId}`, {
      ...updates,
      dueDate: updates.dueDate?.toISOString()
    });
    return response.data;
  }

  /**
   * Submit review for approval
   */
  async submitReview(reviewId: string, submission: {
    findings: string;
    recommendations: string[];
    score?: number;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  }): Promise<AssetReview> {
    const response = await apiClient.post(`${this.baseUrl}/reviews/${reviewId}/submit`, submission);
    return response.data;
  }

  /**
   * Approve/reject review
   */
  async reviewApproval(
    reviewId: string,
    decision: 'approve' | 'reject',
    comment: string,
    requiresChanges?: boolean
  ): Promise<AssetReview> {
    const response = await apiClient.post(`${this.baseUrl}/reviews/${reviewId}/approval`, {
      decision,
      comment,
      requiresChanges
    });
    return response.data;
  }

  // ========================================================================
  // APPROVAL WORKFLOWS OPERATIONS
  // ========================================================================

  /**
   * Get approval workflows
   */
  async getApprovalWorkflows(
    filters?: {
      isActive?: boolean;
      triggers?: string[];
      types?: string[];
    }
  ): Promise<ApprovalWorkflow[]> {
    const response = await apiClient.get(`${this.baseUrl}/workflows`, { params: filters });
    return response.data;
  }

  /**
   * Get workflow details
   */
  async getWorkflowDetails(workflowId: string): Promise<{
    workflow: ApprovalWorkflow;
    steps: WorkflowStep[];
    executions: Array<{
      id: string;
      triggeredAt: Date;
      triggeredBy: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      currentStep: number;
      completedAt?: Date;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/workflows/${workflowId}/details`);
    return response.data;
  }

  /**
   * Create approval workflow
   */
  async createApprovalWorkflow(workflow: {
    name: string;
    description: string;
    trigger: 'manual' | 'asset_change' | 'review_submission' | 'quality_issue' | 'scheduled';
    triggerConditions?: Record<string, any>;
    steps: Array<{
      name: string;
      type: 'approval' | 'review' | 'notification' | 'automation';
      assignees: string[];
      requiredApprovals: number;
      timeoutHours?: number;
      skipConditions?: Record<string, any>;
    }>;
    isActive: boolean;
    metadata?: Record<string, any>;
  }): Promise<ApprovalWorkflow> {
    const response = await apiClient.post(`${this.baseUrl}/workflows`, workflow);
    return response.data;
  }

  /**
   * Update approval workflow
   */
  async updateApprovalWorkflow(
    workflowId: string,
    updates: Partial<ApprovalWorkflow>
  ): Promise<ApprovalWorkflow> {
    const response = await apiClient.patch(`${this.baseUrl}/workflows/${workflowId}`, updates);
    return response.data;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: {
      assetId?: string;
      triggeredBy: string;
      metadata?: Record<string, any>;
    }
  ): Promise<{
    executionId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    currentStep: number;
    estimatedCompletion?: Date;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/execute`, context);
    return response.data;
  }

  // ========================================================================
  // APPROVAL REQUESTS OPERATIONS
  // ========================================================================

  /**
   * Get pending approval requests
   */
  async getPendingApprovals(
    filters?: {
      assignee?: string;
      types?: string[];
      priority?: string[];
      assetIds?: string[];
      workflowIds?: string[];
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<ApprovalRequest[]> {
    const response = await apiClient.get(`${this.baseUrl}/approvals/pending`, {
      params: {
        assignee: filters?.assignee,
        types: filters?.types?.join(','),
        priority: filters?.priority?.join(','),
        assetIds: filters?.assetIds?.join(','),
        workflowIds: filters?.workflowIds?.join(','),
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString()
      }
    });
    return response.data;
  }

  /**
   * Get approval request details
   */
  async getApprovalRequestDetails(requestId: string): Promise<{
    request: ApprovalRequest;
    workflow: ApprovalWorkflow;
    asset?: CatalogAsset;
    history: Array<{
      timestamp: Date;
      action: string;
      user: string;
      comment?: string;
      decision?: 'approve' | 'reject' | 'delegate';
    }>;
    attachments: Array<{
      name: string;
      url: string;
      type: string;
      uploadedBy: string;
      uploadedAt: Date;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/approvals/${requestId}/details`);
    return response.data;
  }

  /**
   * Approve request
   */
  async approveRequest(
    requestId: string,
    comment?: string,
    conditions?: string[]
  ): Promise<{
    success: boolean;
    nextStep?: WorkflowStep;
    workflowCompleted: boolean;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/approvals/${requestId}/approve`, {
      comment,
      conditions
    });
    return response.data;
  }

  /**
   * Reject request
   */
  async rejectRequest(
    requestId: string,
    reason: string,
    sendBack?: boolean
  ): Promise<{
    success: boolean;
    workflowStopped: boolean;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/approvals/${requestId}/reject`, {
      reason,
      sendBack
    });
    return response.data;
  }

  /**
   * Delegate approval request
   */
  async delegateRequest(
    requestId: string,
    delegateTo: string,
    comment?: string
  ): Promise<ApprovalRequest> {
    const response = await apiClient.post(`${this.baseUrl}/approvals/${requestId}/delegate`, {
      delegateTo,
      comment
    });
    return response.data;
  }

  // ========================================================================
  // NOTIFICATIONS OPERATIONS
  // ========================================================================

  /**
   * Get user notifications
   */
  async getNotifications(
    filters?: {
      types?: string[];
      isRead?: boolean;
      priority?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<CollaborationNotification[]> {
    const response = await apiClient.get(`${this.baseUrl}/notifications`, { params: filters });
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/notifications/read-all`);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/notifications/${notificationId}`);
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
    notificationTypes: Record<string, boolean>;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  }> {
    const response = await apiClient.get(`${this.baseUrl}/notifications/settings`);
    return response.data;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    inAppNotifications?: boolean;
    notificationTypes?: Record<string, boolean>;
    frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  }): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/notifications/settings`, settings);
  }

  // ========================================================================
  // COLLABORATION ACTIVITIES
  // ========================================================================

  /**
   * Get collaboration activities
   */
  async getCollaborationActivities(
    assetId: string,
    filters?: {
      types?: string[];
      users?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<CollaborationActivity[]> {
    const response = await apiClient.get(`${this.baseUrl}/activities/asset/${assetId}`, {
      params: {
        types: filters?.types?.join(','),
        users: filters?.users?.join(','),
        startDate: filters?.dateRange?.start?.toISOString(),
        endDate: filters?.dateRange?.end?.toISOString(),
        limit: filters?.limit || 50,
        offset: filters?.offset || 0
      }
    });
    return response.data;
  }

  /**
   * Get organization-wide activities
   */
  async getOrganizationActivities(
    filters?: {
      types?: string[];
      users?: string[];
      assetIds?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      offset?: number;
    }
  ): Promise<CollaborationActivity[]> {
    const response = await apiClient.get(`${this.baseUrl}/activities`, { params: filters });
    return response.data;
  }

  // ========================================================================
  // TEAM MEMBERS AND PERMISSIONS
  // ========================================================================

  /**
   * Get team members
   */
  async getTeamMembers(
    filters?: {
      roles?: string[];
      departments?: string[];
      search?: string;
      isActive?: boolean;
    }
  ): Promise<TeamMember[]> {
    const response = await apiClient.get(`${this.baseUrl}/team`, { params: filters });
    return response.data;
  }

  /**
   * Get team member details
   */
  async getTeamMemberDetails(userId: string): Promise<{
    member: TeamMember;
    permissions: string[];
    recentActivity: CollaborationActivity[];
    statistics: {
      threadsParticipated: number;
      reviewsCompleted: number;
      commentsPosted: number;
      approvalsHandled: number;
    };
  }> {
    const response = await apiClient.get(`${this.baseUrl}/team/${userId}/details`);
    return response.data;
  }

  /**
   * Invite team member
   */
  async inviteTeamMember(invitation: {
    email: string;
    role: string;
    department?: string;
    permissions: string[];
    message?: string;
  }): Promise<{
    invitationId: string;
    inviteUrl: string;
    expiresAt: Date;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/team/invite`, invitation);
    return response.data;
  }

  // ========================================================================
  // ASSET SUBSCRIPTIONS
  // ========================================================================

  /**
   * Get asset subscriptions
   */
  async getAssetSubscriptions(userId: string): Promise<AssetSubscription[]> {
    const response = await apiClient.get(`${this.baseUrl}/subscriptions/user/${userId}`);
    return response.data;
  }

  /**
   * Subscribe to asset
   */
  async subscribeToAsset(
    assetId: string,
    notificationTypes: ('comments' | 'reviews' | 'changes' | 'quality_issues')[]
  ): Promise<AssetSubscription> {
    const response = await apiClient.post(`${this.baseUrl}/subscriptions`, {
      assetId,
      notificationTypes
    });
    return response.data;
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      notificationTypes?: string[];
      isActive?: boolean;
    }
  ): Promise<AssetSubscription> {
    const response = await apiClient.patch(`${this.baseUrl}/subscriptions/${subscriptionId}`, updates);
    return response.data;
  }

  /**
   * Unsubscribe from asset
   */
  async unsubscribeFromAsset(subscriptionId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/subscriptions/${subscriptionId}`);
  }

  // ========================================================================
  // REVIEW TEMPLATES
  // ========================================================================

  /**
   * Get review templates
   */
  async getReviewTemplates(
    filters?: {
      types?: string[];
      categories?: string[];
      isActive?: boolean;
    }
  ): Promise<ReviewTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/templates`, { params: filters });
    return response.data;
  }

  /**
   * Create review template
   */
  async createReviewTemplate(template: {
    name: string;
    description: string;
    type: string;
    category: string;
    checklist: Array<{
      item: string;
      description?: string;
      required: boolean;
      category: string;
      weight: number;
    }>;
    guidelines?: string;
    isActive: boolean;
  }): Promise<ReviewTemplate> {
    const response = await apiClient.post(`${this.baseUrl}/templates`, template);
    return response.data;
  }

  // ========================================================================
  // REAL-TIME COLLABORATION
  // ========================================================================

  /**
   * Subscribe to collaboration events
   */
  subscribeToCollaborationEvents(
    assetId: string,
    eventTypes: ('thread_created' | 'comment_added' | 'review_submitted' | 'approval_requested')[],
    callback: (event: {
      type: string;
      assetId: string;
      timestamp: Date;
      data: any;
      user: string;
    }) => void
  ): () => void {
    const eventSource = new EventSource(
      `${this.baseUrl}/events/subscribe/${assetId}?eventTypes=${eventTypes.join(',')}`
    );

    eventSource.onmessage = (event) => {
      const collaborationEvent = JSON.parse(event.data);
      callback(collaborationEvent);
    };

    return () => {
      eventSource.close();
    };
  }

  /**
   * Send real-time message
   */
  async sendRealtimeMessage(
    threadId: string,
    message: {
      type: 'typing' | 'presence' | 'reaction';
      data: any;
    }
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/realtime/${threadId}/message`, message);
  }

  // ========================================================================
  // COLLABORATION ANALYTICS
  // ========================================================================

  /**
   * Get collaboration metrics
   */
  async getCollaborationMetrics(
    timeRange: { start: Date; end: Date },
    scope: 'asset' | 'team' | 'organization',
    scopeId?: string
  ): Promise<{
    threadsCreated: number;
    commentsPosted: number;
    reviewsCompleted: number;
    approvalsProcessed: number;
    activeParticipants: number;
    averageResponseTime: number;
    collaborationScore: number;
    trends: {
      threadsCreated: Array<{ date: string; count: number }>;
      engagement: Array<{ date: string; score: number }>;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/analytics/metrics`, {
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      },
      scope,
      scopeId
    });
    return response.data;
  }

  /**
   * Get collaboration insights
   */
  async getCollaborationInsights(
    timeRange: { start: Date; end: Date }
  ): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/insights`, {
      params: {
        start_date: timeRange.start.toISOString(),
        end_date: timeRange.end.toISOString()
      }
    });
    return response.data;
  }

  // ========================================================================
  // ANALYTICS & INSIGHTS OPERATIONS  
  // ========================================================================

  /**
   * Get collaboration analytics for a hub
   */
  async getCollaborationAnalytics(
    hubId: number,
    timePeriod: string = 'week',
    metrics?: string[]
  ): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/analytics/hubs/${hubId}`, {
      params: {
        time_period: timePeriod,
        metrics: metrics?.join(',')
      }
    });
    return response.data;
  }

  /**
   * Get advanced collaboration insights
   */
  async getAdvancedCollaborationInsights(
    hubId?: number,
    timeRange: string = 'month',
    insightTypes?: string[]
  ): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/analytics/insights/advanced`, {
      params: {
        hub_id: hubId,
        time_range: timeRange,
        insight_types: insightTypes?.join(',')
      }
    });
    return response.data;
  }

  /**
   * Get collaboration compliance status
   */
  async getCollaborationCompliance(
    hubId?: number,
    complianceFramework?: string
  ): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/governance/compliance`, {
      params: {
        hub_id: hubId,
        compliance_framework: complianceFramework
      }
    });
    return response.data;
  }

  /**
   * Get collaboration integration status
   */
  async getCollaborationIntegrationStatus(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/status/integration`);
    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const advancedCatalogCollaborationService = new AdvancedCatalogCollaborationService();
export default advancedCatalogCollaborationService;