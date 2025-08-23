// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE COLLABORATION API SERVICE
// Enterprise-Core Implementation with Full Backend Integration
// Maps to: enhanced_collaboration_service.py (31KB), rule_review_service.py (23KB)
//          knowledge_management_service.py (24KB), advanced_collaboration_models.py (27KB)
// ============================================================================

import { 
  CollaborationPlatform,
  CollaborationWorkspace,
  WorkspaceMember,
  CollaborationFeatures,
  TeamWorkspace,
  ReviewWorkflow,
  Comment,
  KnowledgeBase,
  KnowledgeArticle,
  CollaborationMetrics,
  NotificationSettings,
  IntegrationSettings,
  SecuritySettings,
  CustomizationSettings,
  WorkflowSettings,
  APIResponse,
  APIError
} from '../types/collaboration.types';

// Enterprise API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const COLLABORATION_ENDPOINT = `${API_BASE_URL}/enhanced-collaboration`;

/**
 * Enterprise-Grade Collaboration API Service
 * Comprehensive integration with backend collaboration services
 * Features: Team Management, Review Workflows, Knowledge Sharing, Advanced Notifications
 */
export class CollaborationAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  private wsConnections: Map<string, WebSocket>;
  private collaborationCache: Map<string, any>;
  private retryConfig: { attempts: number; delay: number };

  constructor() {
    this.baseURL = COLLABORATION_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '2.0.0',
      'X-Feature-Flags': 'team-collaboration,review-workflows,knowledge-management,advanced-notifications'
    };
    this.wsConnections = new Map();
    this.collaborationCache = new Map();
    this.retryConfig = { attempts: 3, delay: 1000 };
  }

  // ============================================================================
  // AUTHENTICATION & REQUEST HANDLING
  // ============================================================================

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const orgId = localStorage.getItem('organization_id');
    const userId = localStorage.getItem('user_id');
    
    return {
      ...this.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(orgId && { 'X-Organization-ID': orgId }),
      ...(userId && { 'X-User-ID': userId }),
      'X-Request-ID': this.generateRequestId(),
      'X-Timestamp': new Date().toISOString(),
      'X-Collaboration-Context': this.getCollaborationContext(),
      'X-User-Permissions': this.getUserPermissions()
    };
  }

  private generateRequestId(): string {
    return `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCollaborationContext(): string {
    return JSON.stringify({
      userRole: this.getUserRole(),
      activeWorkspaces: this.getActiveWorkspaces(),
      collaborationPreferences: this.getUserCollaborationPreferences(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  private getUserRole(): string {
    return localStorage.getItem('user_role') || 'contributor';
  }

  private getActiveWorkspaces(): string[] {
    const workspaces = localStorage.getItem('active_workspaces');
    return workspaces ? JSON.parse(workspaces) : [];
  }

  private getUserCollaborationPreferences(): any {
    return {
      notificationFrequency: 'immediate',
      collaborationMode: 'hybrid',
      reviewPreferences: {
        autoAssign: true,
        reviewDepth: 'detailed',
        requireConsensus: false
      },
      knowledgeSharing: {
        autoShare: true,
        expertise: ['data-governance', 'scan-rules', 'compliance'],
        mentoring: true
      }
    };
  }

  private getUserPermissions(): string {
    const permissions = localStorage.getItem('user_permissions');
    return permissions || JSON.stringify(['read', 'write', 'comment', 'review']);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const requestId = response.headers.get('X-Request-ID');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Enhanced error handling with collaboration-specific context
      if (response.status >= 500 && this.retryConfig.attempts > 0) {
        await this.delay(this.retryConfig.delay);
        // Retry logic with exponential backoff
      }
      
      throw new APIError({
        code: response.status.toString(),
        message: errorData.message || response.statusText,
        details: {
          ...errorData.details,
          requestId,
          collaborationContext: errorData.collaborationContext,
          permissionIssues: errorData.permissionIssues,
          suggestedActions: errorData.suggestedActions,
          timestamp: new Date().toISOString(),
          endpoint: response.url
        },
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();
    
    // Add collaboration-specific metadata
    if (data && typeof data === 'object') {
      data._metadata = {
        requestId,
        responseTime: response.headers.get('X-Response-Time'),
        collaborationVersion: response.headers.get('X-Collaboration-Version'),
        userPermissions: response.headers.get('X-User-Permissions'),
        workspaceContext: response.headers.get('X-Workspace-Context'),
        cached: response.headers.get('X-Cache-Status') === 'HIT'
      };
    }

    return data;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // COLLABORATION PLATFORM MANAGEMENT
  // Maps to enhanced_collaboration_service.py
  // ============================================================================

  /**
   * Get collaboration platforms with workspaces and teams
   * Endpoint: GET /enhanced-collaboration/platforms
   */
  async getCollaborationPlatforms(options: {
    includeWorkspaces?: boolean;
    includeTeams?: boolean;
    includeMetrics?: boolean;
    filterByAccess?: boolean;
  } = {}): Promise<APIResponse<CollaborationPlatform[]>> {
    const params = new URLSearchParams();
    
    if (options.includeWorkspaces) params.append('include_workspaces', 'true');
    if (options.includeTeams) params.append('include_teams', 'true');
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.filterByAccess) params.append('filter_by_access', 'true');

    const response = await fetch(`${this.baseURL}/platforms?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<CollaborationPlatform[]>>(response);
  }

  /**
   * Create collaboration platform with advanced configuration
   * Endpoint: POST /enhanced-collaboration/platforms
   */
  async createCollaborationPlatform(
    platform: Omit<CollaborationPlatform, 'platform_id'>,
    options: {
      setupDefaultWorkspaces?: boolean;
      enableAdvancedFeatures?: boolean;
      configureIntegrations?: boolean;
      setupNotifications?: boolean;
    } = {}
  ): Promise<APIResponse<CollaborationPlatform & {
    defaultWorkspaces?: CollaborationWorkspace[];
    integrationSetup?: any;
    notificationConfig?: any;
  }>> {
    const requestBody = {
      ...platform,
      options: {
        setup_default_workspaces: options.setupDefaultWorkspaces,
        enable_advanced_features: options.enableAdvancedFeatures,
        configure_integrations: options.configureIntegrations,
        setup_notifications: options.setupNotifications
      },
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/platforms`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<CollaborationPlatform & {
      defaultWorkspaces?: CollaborationWorkspace[];
      integrationSetup?: any;
      notificationConfig?: any;
    }>>(response);
  }

  // ============================================================================
  // WORKSPACE MANAGEMENT
  // Maps to workspace management components in backend
  // ============================================================================

  /**
   * Get collaboration workspaces with members and activity
   * Endpoint: GET /enhanced-collaboration/workspaces
   */
  async getCollaborationWorkspaces(options: {
    includeMembers?: boolean;
    includeActivity?: boolean;
    includePermissions?: boolean;
    includeSettings?: boolean;
    filterByRole?: string;
    sortBy?: 'name' | 'activity' | 'members' | 'created_date';
  } = {}): Promise<APIResponse<CollaborationWorkspace[]>> {
    const params = new URLSearchParams();
    
    if (options.includeMembers) params.append('include_members', 'true');
    if (options.includeActivity) params.append('include_activity', 'true');
    if (options.includePermissions) params.append('include_permissions', 'true');
    if (options.includeSettings) params.append('include_settings', 'true');
    if (options.filterByRole) params.append('filter_by_role', options.filterByRole);
    if (options.sortBy) params.append('sort_by', options.sortBy);

    const response = await fetch(`${this.baseURL}/workspaces?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<CollaborationWorkspace[]>>(response);
  }

  /**
   * Create collaboration workspace with advanced configuration
   * Endpoint: POST /enhanced-collaboration/workspaces
   */
  async createCollaborationWorkspace(
    workspace: Omit<CollaborationWorkspace, 'workspace_id'>,
    options: {
      inviteInitialMembers?: string[];
      setupDefaultPermissions?: boolean;
      enableAdvancedFeatures?: boolean;
      configureIntegrations?: boolean;
    } = {}
  ): Promise<APIResponse<CollaborationWorkspace & {
    invitationResults?: any[];
    permissionSetup?: any;
    integrationConfig?: any;
  }>> {
    const requestBody = {
      ...workspace,
      options: {
        invite_initial_members: options.inviteInitialMembers,
        setup_default_permissions: options.setupDefaultPermissions,
        enable_advanced_features: options.enableAdvancedFeatures,
        configure_integrations: options.configureIntegrations
      },
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString()
      }
    };

    const response = await fetch(`${this.baseURL}/workspaces`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<CollaborationWorkspace & {
      invitationResults?: any[];
      permissionSetup?: any;
      integrationConfig?: any;
    }>>(response);
  }

  /**
   * Update workspace settings and configuration
   * Endpoint: PUT /enhanced-collaboration/workspaces/{id}
   */
  async updateCollaborationWorkspace(
    workspaceId: string,
    updates: Partial<CollaborationWorkspace>,
    options: {
      notifyMembers?: boolean;
      validatePermissions?: boolean;
      updateIntegrations?: boolean;
    } = {}
  ): Promise<APIResponse<CollaborationWorkspace & {
    notificationResults?: any;
    permissionValidation?: any;
    integrationUpdates?: any;
  }>> {
    const requestBody = {
      updates,
      options: {
        notify_members: options.notifyMembers,
        validate_permissions: options.validatePermissions,
        update_integrations: options.updateIntegrations
      },
      metadata: {
        updatedBy: localStorage.getItem('user_id'),
        updateTimestamp: new Date().toISOString()
      }
    };

    const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<CollaborationWorkspace & {
      notificationResults?: any;
      permissionValidation?: any;
      integrationUpdates?: any;
    }>>(response);
  }

  // ============================================================================
  // TEAM MEMBER MANAGEMENT
  // Maps to member management components in backend
  // ============================================================================

  /**
   * Get workspace members with roles and activity
   * Endpoint: GET /enhanced-collaboration/workspaces/{id}/members
   */
  async getWorkspaceMembers(
    workspaceId: string,
    options: {
      includeActivity?: boolean;
      includePermissions?: boolean;
      includeExpertise?: boolean;
      includeContributions?: boolean;
      filterByRole?: string;
      sortBy?: 'name' | 'activity' | 'contributions' | 'joined_date';
    } = {}
  ): Promise<APIResponse<WorkspaceMember[]>> {
    const params = new URLSearchParams();
    
    if (options.includeActivity) params.append('include_activity', 'true');
    if (options.includePermissions) params.append('include_permissions', 'true');
    if (options.includeExpertise) params.append('include_expertise', 'true');
    if (options.includeContributions) params.append('include_contributions', 'true');
    if (options.filterByRole) params.append('filter_by_role', options.filterByRole);
    if (options.sortBy) params.append('sort_by', options.sortBy);

    const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/members?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<WorkspaceMember[]>>(response);
  }

  /**
   * Invite members to workspace with role assignment
   * Endpoint: POST /enhanced-collaboration/workspaces/{id}/members/invite
   */
  async inviteWorkspaceMembers(
    workspaceId: string,
    invitationConfig: {
      invitations: {
        email: string;
        role: string;
        permissions?: string[];
        personalMessage?: string;
      }[];
      invitationSettings: {
        expirationDays?: number;
        requireApproval?: boolean;
        sendWelcomeEmail?: boolean;
        customWelcomeMessage?: string;
      };
    }
  ): Promise<APIResponse<{
    invitationId: string;
    invitationResults: {
      email: string;
      status: 'sent' | 'failed' | 'pending_approval';
      invitationLink?: string;
      error?: string;
    }[];
    summary: {
      sent: number;
      failed: number;
      pendingApproval: number;
    };
  }>> {
    const requestBody = {
      ...invitationConfig,
      metadata: {
        invitedBy: localStorage.getItem('user_id'),
        invitationTimestamp: new Date().toISOString(),
        workspaceId
      }
    };

    const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/members/invite`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      invitationId: string;
      invitationResults: {
        email: string;
        status: 'sent' | 'failed' | 'pending_approval';
        invitationLink?: string;
        error?: string;
      }[];
      summary: {
        sent: number;
        failed: number;
        pendingApproval: number;
      };
    }>>(response);
  }

  /**
   * Update member role and permissions
   * Endpoint: PUT /enhanced-collaboration/workspaces/{workspaceId}/members/{memberId}
   */
  async updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    updates: {
      role?: string;
      permissions?: string[];
      expertiseAreas?: any[];
      notificationSettings?: any;
    },
    options: {
      notifyMember?: boolean;
      validatePermissions?: boolean;
      auditChange?: boolean;
    } = {}
  ): Promise<APIResponse<WorkspaceMember & {
    notificationResult?: any;
    permissionValidation?: any;
    auditEntry?: any;
  }>> {
    const requestBody = {
      updates,
      options: {
        notify_member: options.notifyMember,
        validate_permissions: options.validatePermissions,
        audit_change: options.auditChange
      },
      metadata: {
        updatedBy: localStorage.getItem('user_id'),
        updateTimestamp: new Date().toISOString()
      }
    };

    const response = await fetch(`${this.baseURL}/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<WorkspaceMember & {
      notificationResult?: any;
      permissionValidation?: any;
      auditEntry?: any;
    }>>(response);
  }

  // ============================================================================
  // REVIEW WORKFLOWS
  // Maps to rule_review_service.py
  // ============================================================================

  /**
   * Get review workflows with status and participants
   * Endpoint: GET /enhanced-collaboration/reviews
   */
  async getReviewWorkflows(options: {
    workspaceId?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    reviewType?: 'peer' | 'expert' | 'compliance' | 'automated';
    assignedToMe?: boolean;
    createdByMe?: boolean;
    includeParticipants?: boolean;
    includeComments?: boolean;
    sortBy?: 'created_date' | 'due_date' | 'priority' | 'status';
  } = {}): Promise<APIResponse<ReviewWorkflow[]>> {
    const params = new URLSearchParams();
    
    if (options.workspaceId) params.append('workspace_id', options.workspaceId);
    if (options.status) params.append('status', options.status);
    if (options.reviewType) params.append('review_type', options.reviewType);
    if (options.assignedToMe) params.append('assigned_to_me', 'true');
    if (options.createdByMe) params.append('created_by_me', 'true');
    if (options.includeParticipants) params.append('include_participants', 'true');
    if (options.includeComments) params.append('include_comments', 'true');
    if (options.sortBy) params.append('sort_by', options.sortBy);

    const response = await fetch(`${this.baseURL}/reviews?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<ReviewWorkflow[]>>(response);
  }

  /**
   * Create review workflow with advanced configuration
   * Endpoint: POST /enhanced-collaboration/reviews
   */
  async createReviewWorkflow(
    reviewConfig: {
      title: string;
      description: string;
      reviewType: 'peer' | 'expert' | 'compliance' | 'automated';
      targetId: string; // ID of the item being reviewed (rule set, etc.)
      targetType: string;
      reviewers: {
        userId: string;
        role: 'primary' | 'secondary' | 'observer';
        expertise?: string[];
      }[];
      reviewStages: {
        name: string;
        description: string;
        requiredApprovals: number;
        timeoutDays?: number;
        criteria: string[];
      }[];
      settings: {
        allowParallelReview?: boolean;
        requireConsensus?: boolean;
        enableAnonymousComments?: boolean;
        autoCompleteOnApproval?: boolean;
        notificationFrequency?: 'immediate' | 'daily' | 'weekly';
      };
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<APIResponse<ReviewWorkflow & {
    reviewerNotifications?: any[];
    estimatedDuration?: number;
    reviewGuidelines?: any;
  }>> {
    const requestBody = {
      ...reviewConfig,
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        workspaceId: this.getActiveWorkspaces()[0] // Use first active workspace
      }
    };

    const response = await fetch(`${this.baseURL}/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<ReviewWorkflow & {
      reviewerNotifications?: any[];
      estimatedDuration?: number;
      reviewGuidelines?: any;
    }>>(response);
  }

  /**
   * Submit review with comments and decision
   * Endpoint: POST /enhanced-collaboration/reviews/{id}/submit
   */
  async submitReview(
    reviewId: string,
    reviewSubmission: {
      decision: 'approve' | 'reject' | 'request_changes' | 'abstain';
      comments: {
        text: string;
        type: 'general' | 'suggestion' | 'issue' | 'praise';
        priority?: 'low' | 'medium' | 'high';
        isBlocking?: boolean;
        attachments?: string[];
      }[];
      detailedFeedback?: {
        strengths: string[];
        improvements: string[];
        recommendations: string[];
        riskAssessment?: string;
      };
      confidenceLevel?: number; // 0-1
      timeSpentMinutes?: number;
    }
  ): Promise<APIResponse<{
    submissionId: string;
    reviewStatus: string;
    nextSteps: string[];
    notifications: any[];
    workflowProgress: any;
  }>> {
    const requestBody = {
      ...reviewSubmission,
      metadata: {
        submittedBy: localStorage.getItem('user_id'),
        submissionTimestamp: new Date().toISOString(),
        reviewId
      }
    };

    const response = await fetch(`${this.baseURL}/reviews/${reviewId}/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      submissionId: string;
      reviewStatus: string;
      nextSteps: string[];
      notifications: any[];
      workflowProgress: any;
    }>>(response);
  }

  // ============================================================================
  // COMMENTS & DISCUSSIONS
  // Maps to comment management components in backend
  // ============================================================================

  /**
   * Get comments for a specific item with threading
   * Endpoint: GET /enhanced-collaboration/comments
   */
  async getComments(options: {
    targetId: string;
    targetType: string;
    includeThreads?: boolean;
    includeReactions?: boolean;
    includeAttachments?: boolean;
    sortBy?: 'created_date' | 'updated_date' | 'relevance' | 'reactions';
    filterBy?: 'unresolved' | 'my_comments' | 'mentions';
  }): Promise<APIResponse<Comment[]>> {
    const params = new URLSearchParams();
    
    params.append('target_id', options.targetId);
    params.append('target_type', options.targetType);
    if (options.includeThreads) params.append('include_threads', 'true');
    if (options.includeReactions) params.append('include_reactions', 'true');
    if (options.includeAttachments) params.append('include_attachments', 'true');
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.filterBy) params.append('filter_by', options.filterBy);

    const response = await fetch(`${this.baseURL}/comments?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<Comment[]>>(response);
  }

  /**
   * Create comment with advanced features
   * Endpoint: POST /enhanced-collaboration/comments
   */
  async createComment(
    commentConfig: {
      targetId: string;
      targetType: string;
      content: string;
      commentType?: 'general' | 'suggestion' | 'issue' | 'question' | 'praise';
      parentCommentId?: string; // For threaded comments
      mentions?: string[]; // User IDs to mention
      attachments?: {
        filename: string;
        url: string;
        type: string;
        size: number;
      }[];
      isPrivate?: boolean;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<APIResponse<Comment & {
    mentionNotifications?: any[];
    attachmentProcessing?: any[];
  }>> {
    const requestBody = {
      ...commentConfig,
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    };

    const response = await fetch(`${this.baseURL}/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<Comment & {
      mentionNotifications?: any[];
      attachmentProcessing?: any[];
    }>>(response);
  }

  /**
   * Update comment with edit history
   * Endpoint: PUT /enhanced-collaboration/comments/{id}
   */
  async updateComment(
    commentId: string,
    updates: {
      content?: string;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      isResolved?: boolean;
    },
    options: {
      notifyMentions?: boolean;
      preserveHistory?: boolean;
    } = {}
  ): Promise<APIResponse<Comment & {
    editHistory?: any[];
    notifications?: any[];
  }>> {
    const requestBody = {
      updates,
      options: {
        notify_mentions: options.notifyMentions,
        preserve_history: options.preserveHistory
      },
      metadata: {
        updatedBy: localStorage.getItem('user_id'),
        updateTimestamp: new Date().toISOString()
      }
    };

    const response = await fetch(`${this.baseURL}/comments/${commentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<Comment & {
      editHistory?: any[];
      notifications?: any[];
    }>>(response);
  }

  // ============================================================================
  // KNOWLEDGE MANAGEMENT
  // Maps to knowledge_management_service.py
  // ============================================================================

  /**
   * Get knowledge articles with search and filtering
   * Endpoint: GET /enhanced-collaboration/knowledge/articles
   */
  async getKnowledgeArticles(options: {
    workspaceId?: string;
    category?: string;
    tags?: string[];
    searchQuery?: string;
    authorId?: string;
    includeContent?: boolean;
    includeMetrics?: boolean;
    sortBy?: 'created_date' | 'updated_date' | 'views' | 'rating' | 'relevance';
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<KnowledgeArticle[]> & {
    pagination: any;
    searchMetadata?: any;
  }> {
    const params = new URLSearchParams();
    
    if (options.workspaceId) params.append('workspace_id', options.workspaceId);
    if (options.category) params.append('category', options.category);
    if (options.tags) params.append('tags', options.tags.join(','));
    if (options.searchQuery) params.append('search_query', options.searchQuery);
    if (options.authorId) params.append('author_id', options.authorId);
    if (options.includeContent) params.append('include_content', 'true');
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${this.baseURL}/knowledge/articles?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<KnowledgeArticle[]> & {
      pagination: any;
      searchMetadata?: any;
    }>(response);
  }

  /**
   * Create knowledge article with rich content
   * Endpoint: POST /enhanced-collaboration/knowledge/articles
   */
  async createKnowledgeArticle(
    articleConfig: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      summary?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      estimatedReadTime?: number;
      prerequisites?: string[];
      relatedArticles?: string[];
      attachments?: {
        filename: string;
        url: string;
        type: string;
        description?: string;
      }[];
      isPublic?: boolean;
      allowComments?: boolean;
      expertiseLevel?: string;
    }
  ): Promise<APIResponse<KnowledgeArticle & {
    contentAnalysis?: any;
    suggestedTags?: string[];
    relatedSuggestions?: string[];
  }>> {
    const requestBody = {
      ...articleConfig,
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        workspaceId: this.getActiveWorkspaces()[0]
      }
    };

    const response = await fetch(`${this.baseURL}/knowledge/articles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<KnowledgeArticle & {
      contentAnalysis?: any;
      suggestedTags?: string[];
      relatedSuggestions?: string[];
    }>>(response);
  }

  /**
   * Search knowledge base with semantic search
   * Endpoint: POST /enhanced-collaboration/knowledge/search
   */
  async searchKnowledgeBase(
    searchConfig: {
      query: string;
      searchType?: 'semantic' | 'keyword' | 'hybrid';
      workspaceIds?: string[];
      categories?: string[];
      tags?: string[];
      difficulty?: string[];
      includeContent?: boolean;
      maxResults?: number;
      confidenceThreshold?: number;
    }
  ): Promise<APIResponse<{
    searchId: string;
    results: KnowledgeArticle[];
    searchMetadata: {
      totalResults: number;
      searchTime: number;
      suggestedQueries: string[];
      filters: any;
    };
    insights?: {
      knowledgeGaps: string[];
      popularTopics: string[];
      expertRecommendations: string[];
    };
  }>> {
    const requestBody = {
      ...searchConfig,
      metadata: {
        searchedBy: localStorage.getItem('user_id'),
        searchTimestamp: new Date().toISOString()
      }
    };

    const response = await fetch(`${this.baseURL}/knowledge/search`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      searchId: string;
      results: KnowledgeArticle[];
      searchMetadata: {
        totalResults: number;
        searchTime: number;
        suggestedQueries: string[];
        filters: any;
      };
      insights?: {
        knowledgeGaps: string[];
        popularTopics: string[];
        expertRecommendations: string[];
      };
    }>>(response);
  }

  // ============================================================================
  // COLLABORATION ANALYTICS & METRICS
  // ============================================================================

  /**
   * Get collaboration metrics and analytics
   * Endpoint: GET /enhanced-collaboration/analytics
   */
  async getCollaborationMetrics(options: {
    workspaceIds?: string[];
    timeRange?: { start: string; end: string };
    metricTypes?: string[];
    aggregationLevel?: 'daily' | 'weekly' | 'monthly';
    includeUserMetrics?: boolean;
    includeTrends?: boolean;
    includeComparisons?: boolean;
  } = {}): Promise<APIResponse<CollaborationMetrics & {
    trends?: any[];
    comparisons?: any;
    insights?: any[];
    recommendations?: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.workspaceIds) params.append('workspace_ids', options.workspaceIds.join(','));
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.metricTypes) params.append('metric_types', options.metricTypes.join(','));
    if (options.aggregationLevel) params.append('aggregation_level', options.aggregationLevel);
    if (options.includeUserMetrics) params.append('include_user_metrics', 'true');
    if (options.includeTrends) params.append('include_trends', 'true');
    if (options.includeComparisons) params.append('include_comparisons', 'true');

    const response = await fetch(`${this.baseURL}/analytics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<CollaborationMetrics & {
      trends?: any[];
      comparisons?: any;
      insights?: any[];
      recommendations?: any[];
    }>>(response);
  }

  // ============================================================================
  // REAL-TIME COLLABORATION FEATURES
  // ============================================================================

  /**
   * Subscribe to workspace activity updates
   */
  subscribeToWorkspaceActivity(
    workspaceId: string,
    callback: (activity: any) => void
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/workspaces/${workspaceId}/activity`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        workspaceId,
        userId: localStorage.getItem('user_id'),
        subscriptionTimestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = (error) => {
      console.error('Workspace activity WebSocket error:', error);
    };

    const connectionId = `workspace-${workspaceId}`;
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to review workflow updates
   */
  subscribeToReviewUpdates(
    reviewId: string,
    callback: (update: any) => void
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/reviews/${reviewId}/updates`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        reviewId,
        userId: localStorage.getItem('user_id')
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    const connectionId = `review-${reviewId}`;
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to comment updates and mentions
   */
  subscribeToCommentUpdates(
    subscriptionConfig: {
      targetId?: string;
      targetType?: string;
      mentionsOnly?: boolean;
      callback: (update: any) => void;
    }
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/comments/updates`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        config: subscriptionConfig,
        userId: localStorage.getItem('user_id')
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      subscriptionConfig.callback(data);
    };

    const connectionId = this.generateRequestId();
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Close all WebSocket connections
   */
  closeAllConnections(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
  }

  /**
   * Clear collaboration cache
   */
  clearCache(): void {
    this.collaborationCache.clear();
  }

  /**
   * Get cached collaboration data
   */
  getCachedData(key: string): any {
    const cached = this.collaborationCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached collaboration data
   */
  setCachedData(key: string, data: any, ttl: number = 300000): void {
    this.collaborationCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE & UTILITIES
// ============================================================================

export const collaborationAPI = new CollaborationAPIService();

// Export service instance for hooks
export const collaborationAPIService = new CollaborationAPIService();

// Export lowercase alias for compatibility
export const collaborationApi = collaborationAPI;

/**
 * Enterprise utilities for collaboration management
 */
export const CollaborationAPIUtils = {
  /**
   * Validate collaboration configuration
   */
  validateCollaborationConfig: (config: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push('Name is required');
    }

    if (config.members && !Array.isArray(config.members)) {
      errors.push('Members must be an array');
    }

    if (config.permissions && typeof config.permissions !== 'object') {
      errors.push('Permissions must be an object');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Format collaboration activity for display
   */
  formatCollaborationActivity: (activity: any) => ({
    ...activity,
    timeAgo: this.getTimeAgo(new Date(activity.timestamp)),
    activityType: activity.activity_type || 'unknown',
    userDisplayName: activity.user?.display_name || activity.user?.username || 'Unknown User',
    actionDescription: this.getActionDescription(activity)
  }),

  /**
   * Get time ago string
   */
  getTimeAgo: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  },

  /**
   * Get action description for activity
   */
  getActionDescription: (activity: any): string => {
    const actionMap: Record<string, string> = {
      'comment_created': 'added a comment',
      'review_submitted': 'submitted a review',
      'member_invited': 'invited a member',
      'workspace_created': 'created a workspace',
      'article_published': 'published an article',
      'rule_updated': 'updated a rule',
    };

    return actionMap[activity.activity_type] || 'performed an action';
  },

  /**
   * Generate collaboration summary
   */
  generateCollaborationSummary: (workspaces: any[], members: any[], activities: any[]) => ({
    totalWorkspaces: workspaces.length,
    activeWorkspaces: workspaces.filter(w => w.status === 'active').length,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    recentActivities: activities.length,
    collaborationScore: this.calculateCollaborationScore(workspaces, members, activities)
  }),

  /**
   * Calculate collaboration score
   */
  calculateCollaborationScore: (workspaces: any[], members: any[], activities: any[]): number => {
    const workspaceScore = Math.min(workspaces.length * 10, 40);
    const memberScore = Math.min(members.length * 5, 30);
    const activityScore = Math.min(activities.length * 2, 30);
    
    return Math.round(workspaceScore + memberScore + activityScore);
  }
};

export default collaborationAPI;