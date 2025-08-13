/**
 * Collaboration Hook
 * Advanced React hook for team collaboration, review workflows,
 * knowledge sharing, and expert consultation with real-time features
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { collaborationAPIService } from '../services/collaboration-apis';
import {
  CollaborationHub,
  TeamMember,
  RuleReview,
  ReviewComment,
  ApprovalWorkflow,
  KnowledgeBase,
  ExpertConsultation,
  CollaborationMetrics,
  CollaborationAnalytics,
  TeamActivity,
  ReviewMetrics,
  KnowledgeMetrics,
  CollaborationNotification,
  APIResponse,
  APIError
} from '../types/collaboration.types';

/**
 * Collaboration Hook Configuration
 */
interface UseCollaborationConfig {
  enableRealTime?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableMetrics?: boolean;
  enableNotifications?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  errorRetryDelay?: number;
}

/**
 * Collaboration State Interface
 */
interface CollaborationState {
  // Core Collaboration Data
  hubs: CollaborationHub[];
  teamMembers: TeamMember[];
  reviews: RuleReview[];
  comments: ReviewComment[];
  workflows: ApprovalWorkflow[];
  knowledgeBase: KnowledgeBase[];
  consultations: ExpertConsultation[];
  
  // Current Operations
  currentHub: CollaborationHub | null;
  currentReview: RuleReview | null;
  activeWorkflows: ApprovalWorkflow[];
  
  // Metrics and Analytics
  metrics: CollaborationMetrics | null;
  analytics: CollaborationAnalytics | null;
  teamActivity: TeamActivity[];
  reviewMetrics: ReviewMetrics | null;
  knowledgeMetrics: KnowledgeMetrics | null;
  
  // Notifications
  notifications: CollaborationNotification[];
  unreadCount: number;
  
  // UI State
  loading: boolean;
  error: APIError | null;
  selectedHubId: string | null;
  selectedReviewId: string | null;
  
  // Real-time State
  realTimeConnected: boolean;
  lastUpdate: Date | null;
  updateCount: number;
}

/**
 * Collaboration Operations Interface
 */
interface CollaborationOperations {
  // Hub Management
  loadHubs: () => Promise<void>;
  createHub: (hub: Partial<CollaborationHub>) => Promise<CollaborationHub | null>;
  updateHub: (hubId: string, updates: Partial<CollaborationHub>) => Promise<CollaborationHub | null>;
  deleteHub: (hubId: string) => Promise<boolean>;
  joinHub: (hubId: string) => Promise<boolean>;
  leaveHub: (hubId: string) => Promise<boolean>;
  
  // Team Management
  loadTeamMembers: (hubId?: string) => Promise<void>;
  addTeamMember: (hubId: string, member: Partial<TeamMember>) => Promise<TeamMember | null>;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => Promise<TeamMember | null>;
  removeTeamMember: (hubId: string, memberId: string) => Promise<boolean>;
  assignRole: (memberId: string, role: string) => Promise<boolean>;
  
  // Review Management
  loadReviews: (hubId?: string) => Promise<void>;
  createReview: (review: Partial<RuleReview>) => Promise<RuleReview | null>;
  updateReview: (reviewId: string, updates: Partial<RuleReview>) => Promise<RuleReview | null>;
  submitReview: (reviewId: string) => Promise<boolean>;
  approveReview: (reviewId: string, approval: any) => Promise<boolean>;
  rejectReview: (reviewId: string, rejection: any) => Promise<boolean>;
  
  // Comment Management
  loadComments: (reviewId: string) => Promise<void>;
  addComment: (reviewId: string, comment: Partial<ReviewComment>) => Promise<ReviewComment | null>;
  updateComment: (commentId: string, updates: Partial<ReviewComment>) => Promise<ReviewComment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  resolveComment: (commentId: string) => Promise<boolean>;
  
  // Workflow Management
  loadWorkflows: () => Promise<void>;
  createWorkflow: (workflow: Partial<ApprovalWorkflow>) => Promise<ApprovalWorkflow | null>;
  executeWorkflow: (workflowId: string, data: any) => Promise<boolean>;
  monitorWorkflow: (workflowId: string) => Promise<any>;
  
  // Knowledge Management
  loadKnowledgeBase: () => Promise<void>;
  createKnowledgeItem: (item: Partial<KnowledgeBase>) => Promise<KnowledgeBase | null>;
  updateKnowledgeItem: (itemId: string, updates: Partial<KnowledgeBase>) => Promise<KnowledgeBase | null>;
  deleteKnowledgeItem: (itemId: string) => Promise<boolean>;
  searchKnowledge: (query: string) => Promise<KnowledgeBase[]>;
  
  // Expert Consultation
  loadConsultations: () => Promise<void>;
  requestConsultation: (request: Partial<ExpertConsultation>) => Promise<ExpertConsultation | null>;
  respondToConsultation: (consultationId: string, response: any) => Promise<boolean>;
  closeConsultation: (consultationId: string) => Promise<boolean>;
  
  // Metrics and Analytics
  getMetrics: () => Promise<CollaborationMetrics | null>;
  getAnalytics: (request: any) => Promise<CollaborationAnalytics | null>;
  getTeamActivity: (hubId?: string) => Promise<void>;
  getReviewMetrics: () => Promise<ReviewMetrics | null>;
  getKnowledgeMetrics: () => Promise<KnowledgeMetrics | null>;
  
  // Notifications
  loadNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<boolean>;
  markAllNotificationsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  
  // Utility Operations
  refreshData: () => Promise<void>;
  clearCache: () => void;
  exportData: (format: 'json' | 'csv' | 'excel') => Promise<Blob | null>;
  resetState: () => void;
}

/**
 * Advanced Collaboration Hook
 */
export const useCollaboration = (config: UseCollaborationConfig = {}): [CollaborationState, CollaborationOperations] => {
  // Configuration with defaults
  const hookConfig = useMemo(() => ({
    enableRealTime: true,
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableMetrics: true,
    enableNotifications: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    maxRetries: 3,
    errorRetryDelay: 1000,
    ...config
  }), [config]);

  // State Management
  const [state, setState] = useState<CollaborationState>({
    // Core Collaboration Data
    hubs: [],
    teamMembers: [],
    reviews: [],
    comments: [],
    workflows: [],
    knowledgeBase: [],
    consultations: [],
    
    // Current Operations
    currentHub: null,
    currentReview: null,
    activeWorkflows: [],
    
    // Metrics and Analytics
    metrics: null,
    analytics: null,
    teamActivity: [],
    reviewMetrics: null,
    knowledgeMetrics: null,
    
    // Notifications
    notifications: [],
    unreadCount: 0,
    
    // UI State
    loading: false,
    error: null,
    selectedHubId: null,
    selectedReviewId: null,
    
    // Real-time State
    realTimeConnected: false,
    lastUpdate: null,
    updateCount: 0
  });

  // Refs for managing timers and subscriptions
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const metricsRef = useRef<any>({
    operations: 0,
    successful: 0,
    failed: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  /**
   * Update state with error handling
   */
  const updateState = useCallback((updates: Partial<CollaborationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle API errors with retry logic
   */
  const handleError = useCallback(async (error: APIError, operation: () => Promise<any>, retryCount = 0) => {
    console.error('Collaboration operation error:', error);
    
    updateState({ error, loading: false });
    metricsRef.current.failed++;

    if (retryCount < hookConfig.maxRetries) {
      retryTimeoutRef.current = setTimeout(async () => {
        try {
          await operation();
        } catch (retryError) {
          await handleError(retryError as APIError, operation, retryCount + 1);
        }
      }, hookConfig.errorRetryDelay * Math.pow(2, retryCount));
    }
  }, [hookConfig.maxRetries, hookConfig.errorRetryDelay, updateState]);

  /**
   * Cache management
   */
  const getCachedData = useCallback((key: string) => {
    if (!hookConfig.enableCaching) return null;
    
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < hookConfig.cacheTimeout) {
      metricsRef.current.cacheHits++;
      return cached.data;
    }
    
    metricsRef.current.cacheMisses++;
    return null;
  }, [hookConfig.enableCaching, hookConfig.cacheTimeout]);

  const setCachedData = useCallback((key: string, data: any) => {
    if (hookConfig.enableCaching) {
      cacheRef.current.set(key, { data, timestamp: Date.now() });
    }
  }, [hookConfig.enableCaching]);

  // ==================== HUB MANAGEMENT ====================

  const loadHubs = useCallback(async () => {
    const cacheKey = 'collaboration-hubs';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ hubs: cachedData });
      return;
    }

    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.getCollaborationHubs({
        includeMetrics: hookConfig.enableMetrics,
        realTimeUpdates: hookConfig.enableRealTime
      });
      
      if (response.success) {
        updateState({ hubs: response.data, loading: false });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadHubs);
    }
  }, [getCachedData, setCachedData, hookConfig.enableMetrics, hookConfig.enableRealTime, updateState, handleError]);

  const createHub = useCallback(async (hub: Partial<CollaborationHub>): Promise<CollaborationHub | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.createCollaborationHub(hub);
      
      if (response.success) {
        updateState(prev => ({
          hubs: [...prev.hubs, response.data],
          currentHub: response.data,
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createHub(hub));
    }
    
    return null;
  }, [updateState, handleError]);

  const updateHub = useCallback(async (hubId: string, updates: Partial<CollaborationHub>): Promise<CollaborationHub | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.updateCollaborationHub(hubId, updates);
      
      if (response.success) {
        updateState(prev => ({
          hubs: prev.hubs.map(hub => 
            hub.id === hubId ? { ...hub, ...response.data } : hub
          ),
          loading: false
        }));
        
        cacheRef.current.delete(`collaboration-hub-${hubId}`);
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateHub(hubId, updates));
    }
    
    return null;
  }, [updateState, handleError]);

  const deleteHub = useCallback(async (hubId: string): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.deleteCollaborationHub(hubId);
      
      if (response.success) {
        updateState(prev => ({
          hubs: prev.hubs.filter(hub => hub.id !== hubId),
          loading: false
        }));
        
        cacheRef.current.delete(`collaboration-hub-${hubId}`);
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteHub(hubId));
    }
    
    return false;
  }, [updateState, handleError]);

  const joinHub = useCallback(async (hubId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.joinCollaborationHub(hubId);
      
      if (response.success) {
        updateState(prev => ({
          hubs: prev.hubs.map(hub => 
            hub.id === hubId ? { ...hub, memberCount: (hub.memberCount || 0) + 1 } : hub
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => joinHub(hubId));
    }
    
    return false;
  }, [updateState, handleError]);

  const leaveHub = useCallback(async (hubId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.leaveCollaborationHub(hubId);
      
      if (response.success) {
        updateState(prev => ({
          hubs: prev.hubs.map(hub => 
            hub.id === hubId ? { ...hub, memberCount: Math.max((hub.memberCount || 1) - 1, 0) } : hub
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => leaveHub(hubId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== TEAM MANAGEMENT ====================

  const loadTeamMembers = useCallback(async (hubId?: string) => {
    const cacheKey = `team-members-${hubId || 'all'}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ teamMembers: cachedData });
      return;
    }

    try {
      const response = await collaborationAPIService.getTeamMembers(hubId);
      
      if (response.success) {
        updateState({ teamMembers: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, () => loadTeamMembers(hubId));
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const addTeamMember = useCallback(async (hubId: string, member: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      const response = await collaborationAPIService.addTeamMember(hubId, member);
      
      if (response.success) {
        updateState(prev => ({
          teamMembers: [...prev.teamMembers, response.data]
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => addTeamMember(hubId, member));
    }
    
    return null;
  }, [updateState, handleError]);

  const updateTeamMember = useCallback(async (memberId: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      const response = await collaborationAPIService.updateTeamMember(memberId, updates);
      
      if (response.success) {
        updateState(prev => ({
          teamMembers: prev.teamMembers.map(member => 
            member.id === memberId ? { ...member, ...response.data } : member
          )
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateTeamMember(memberId, updates));
    }
    
    return null;
  }, [updateState, handleError]);

  const removeTeamMember = useCallback(async (hubId: string, memberId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.removeTeamMember(hubId, memberId);
      
      if (response.success) {
        updateState(prev => ({
          teamMembers: prev.teamMembers.filter(member => member.id !== memberId)
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => removeTeamMember(hubId, memberId));
    }
    
    return false;
  }, [updateState, handleError]);

  const assignRole = useCallback(async (memberId: string, role: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.assignRole(memberId, role);
      
      if (response.success) {
        updateState(prev => ({
          teamMembers: prev.teamMembers.map(member => 
            member.id === memberId ? { ...member, role } : member
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => assignRole(memberId, role));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== REVIEW MANAGEMENT ====================

  const loadReviews = useCallback(async (hubId?: string) => {
    const cacheKey = `reviews-${hubId || 'all'}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ reviews: cachedData });
      return;
    }

    try {
      const response = await collaborationAPIService.getRuleReviews(hubId);
      
      if (response.success) {
        updateState({ reviews: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, () => loadReviews(hubId));
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createReview = useCallback(async (review: Partial<RuleReview>): Promise<RuleReview | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.createRuleReview(review);
      
      if (response.success) {
        updateState(prev => ({
          reviews: [...prev.reviews, response.data],
          currentReview: response.data,
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createReview(review));
    }
    
    return null;
  }, [updateState, handleError]);

  const updateReview = useCallback(async (reviewId: string, updates: Partial<RuleReview>): Promise<RuleReview | null> => {
    try {
      const response = await collaborationAPIService.updateRuleReview(reviewId, updates);
      
      if (response.success) {
        updateState(prev => ({
          reviews: prev.reviews.map(review => 
            review.id === reviewId ? { ...review, ...response.data } : review
          )
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateReview(reviewId, updates));
    }
    
    return null;
  }, [updateState, handleError]);

  const submitReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.submitRuleReview(reviewId);
      
      if (response.success) {
        updateState(prev => ({
          reviews: prev.reviews.map(review => 
            review.id === reviewId ? { ...review, status: 'submitted' } : review
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => submitReview(reviewId));
    }
    
    return false;
  }, [updateState, handleError]);

  const approveReview = useCallback(async (reviewId: string, approval: any): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.approveRuleReview(reviewId, approval);
      
      if (response.success) {
        updateState(prev => ({
          reviews: prev.reviews.map(review => 
            review.id === reviewId ? { ...review, status: 'approved', approval } : review
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => approveReview(reviewId, approval));
    }
    
    return false;
  }, [updateState, handleError]);

  const rejectReview = useCallback(async (reviewId: string, rejection: any): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.rejectRuleReview(reviewId, rejection);
      
      if (response.success) {
        updateState(prev => ({
          reviews: prev.reviews.map(review => 
            review.id === reviewId ? { ...review, status: 'rejected', rejection } : review
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => rejectReview(reviewId, rejection));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== COMMENT MANAGEMENT ====================

  const loadComments = useCallback(async (reviewId: string) => {
    const cacheKey = `comments-${reviewId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ comments: cachedData });
      return;
    }

    try {
      const response = await collaborationAPIService.getReviewComments(reviewId);
      
      if (response.success) {
        updateState({ comments: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, () => loadComments(reviewId));
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const addComment = useCallback(async (reviewId: string, comment: Partial<ReviewComment>): Promise<ReviewComment | null> => {
    try {
      const response = await collaborationAPIService.addReviewComment(reviewId, comment);
      
      if (response.success) {
        updateState(prev => ({
          comments: [...prev.comments, response.data]
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => addComment(reviewId, comment));
    }
    
    return null;
  }, [updateState, handleError]);

  const updateComment = useCallback(async (commentId: string, updates: Partial<ReviewComment>): Promise<ReviewComment | null> => {
    try {
      const response = await collaborationAPIService.updateReviewComment(commentId, updates);
      
      if (response.success) {
        updateState(prev => ({
          comments: prev.comments.map(comment => 
            comment.id === commentId ? { ...comment, ...response.data } : comment
          )
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateComment(commentId, updates));
    }
    
    return null;
  }, [updateState, handleError]);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.deleteReviewComment(commentId);
      
      if (response.success) {
        updateState(prev => ({
          comments: prev.comments.filter(comment => comment.id !== commentId)
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteComment(commentId));
    }
    
    return false;
  }, [updateState, handleError]);

  const resolveComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.resolveReviewComment(commentId);
      
      if (response.success) {
        updateState(prev => ({
          comments: prev.comments.map(comment => 
            comment.id === commentId ? { ...comment, resolved: true } : comment
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => resolveComment(commentId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== WORKFLOW MANAGEMENT ====================

  const loadWorkflows = useCallback(async () => {
    const cacheKey = 'approval-workflows';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ workflows: cachedData });
      return;
    }

    try {
      const response = await collaborationAPIService.getApprovalWorkflows();
      
      if (response.success) {
        updateState({ workflows: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadWorkflows);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createWorkflow = useCallback(async (workflow: Partial<ApprovalWorkflow>): Promise<ApprovalWorkflow | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.createApprovalWorkflow(workflow);
      
      if (response.success) {
        updateState(prev => ({
          workflows: [...prev.workflows, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createWorkflow(workflow));
    }
    
    return null;
  }, [updateState, handleError]);

  const executeWorkflow = useCallback(async (workflowId: string, data: any): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.executeApprovalWorkflow(workflowId, data);
      
      if (response.success) {
        updateState(prev => ({
          activeWorkflows: [...prev.activeWorkflows.filter(w => w.id !== workflowId), response.data]
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => executeWorkflow(workflowId, data));
    }
    
    return false;
  }, [updateState, handleError]);

  const monitorWorkflow = useCallback(async (workflowId: string): Promise<any> => {
    try {
      const response = await collaborationAPIService.monitorApprovalWorkflow(workflowId);
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => monitorWorkflow(workflowId));
    }
    
    return null;
  }, [handleError]);

  // ==================== KNOWLEDGE MANAGEMENT ====================

  const loadKnowledgeBase = useCallback(async () => {
    const cacheKey = 'knowledge-base';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ knowledgeBase: cachedData });
      return;
    }

    try {
      const response = await collaborationAPIService.getKnowledgeBase();
      
      if (response.success) {
        updateState({ knowledgeBase: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadKnowledgeBase);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const createKnowledgeItem = useCallback(async (item: Partial<KnowledgeBase>): Promise<KnowledgeBase | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.createKnowledgeItem(item);
      
      if (response.success) {
        updateState(prev => ({
          knowledgeBase: [...prev.knowledgeBase, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => createKnowledgeItem(item));
    }
    
    return null;
  }, [updateState, handleError]);

  const updateKnowledgeItem = useCallback(async (itemId: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | null> => {
    try {
      const response = await collaborationAPIService.updateKnowledgeItem(itemId, updates);
      
      if (response.success) {
        updateState(prev => ({
          knowledgeBase: prev.knowledgeBase.map(item => 
            item.id === itemId ? { ...item, ...response.data } : item
          )
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => updateKnowledgeItem(itemId, updates));
    }
    
    return null;
  }, [updateState, handleError]);

  const deleteKnowledgeItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.deleteKnowledgeItem(itemId);
      
      if (response.success) {
        updateState(prev => ({
          knowledgeBase: prev.knowledgeBase.filter(item => item.id !== itemId)
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteKnowledgeItem(itemId));
    }
    
    return false;
  }, [updateState, handleError]);

  const searchKnowledge = useCallback(async (query: string): Promise<KnowledgeBase[]> => {
    try {
      const response = await collaborationAPIService.searchKnowledgeBase(query);
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => searchKnowledge(query));
    }
    
    return [];
  }, [handleError]);

  // ==================== EXPERT CONSULTATION ====================

  const loadConsultations = useCallback(async () => {
    const cacheKey = 'expert-consultations';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      updateState({ consultations: cachedData });
      return;
    }

    try {
      const response = await collaborationAPIService.getExpertConsultations();
      
      if (response.success) {
        updateState({ consultations: response.data });
        setCachedData(cacheKey, response.data);
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadConsultations);
    }
  }, [getCachedData, setCachedData, updateState, handleError]);

  const requestConsultation = useCallback(async (request: Partial<ExpertConsultation>): Promise<ExpertConsultation | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await collaborationAPIService.requestExpertConsultation(request);
      
      if (response.success) {
        updateState(prev => ({
          consultations: [...prev.consultations, response.data],
          loading: false
        }));
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => requestConsultation(request));
    }
    
    return null;
  }, [updateState, handleError]);

  const respondToConsultation = useCallback(async (consultationId: string, response: any): Promise<boolean> => {
    try {
      const apiResponse = await collaborationAPIService.respondToExpertConsultation(consultationId, response);
      
      if (apiResponse.success) {
        updateState(prev => ({
          consultations: prev.consultations.map(consultation => 
            consultation.id === consultationId ? { ...consultation, status: 'responded', response } : consultation
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => respondToConsultation(consultationId, response));
    }
    
    return false;
  }, [updateState, handleError]);

  const closeConsultation = useCallback(async (consultationId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.closeExpertConsultation(consultationId);
      
      if (response.success) {
        updateState(prev => ({
          consultations: prev.consultations.map(consultation => 
            consultation.id === consultationId ? { ...consultation, status: 'closed' } : consultation
          )
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => closeConsultation(consultationId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== METRICS AND ANALYTICS ====================

  const getMetrics = useCallback(async (): Promise<CollaborationMetrics | null> => {
    try {
      const response = await collaborationAPIService.getCollaborationMetrics();
      
      if (response.success) {
        updateState({ metrics: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getMetrics);
    }
    
    return null;
  }, [updateState, handleError]);

  const getAnalytics = useCallback(async (request: any): Promise<CollaborationAnalytics | null> => {
    try {
      const response = await collaborationAPIService.getCollaborationAnalytics(request);
      
      if (response.success) {
        updateState({ analytics: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => getAnalytics(request));
    }
    
    return null;
  }, [updateState, handleError]);

  const getTeamActivity = useCallback(async (hubId?: string) => {
    try {
      const response = await collaborationAPIService.getTeamActivity(hubId);
      
      if (response.success) {
        updateState({ teamActivity: response.data });
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, () => getTeamActivity(hubId));
    }
  }, [updateState, handleError]);

  const getReviewMetrics = useCallback(async (): Promise<ReviewMetrics | null> => {
    try {
      const response = await collaborationAPIService.getReviewMetrics();
      
      if (response.success) {
        updateState({ reviewMetrics: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getReviewMetrics);
    }
    
    return null;
  }, [updateState, handleError]);

  const getKnowledgeMetrics = useCallback(async (): Promise<KnowledgeMetrics | null> => {
    try {
      const response = await collaborationAPIService.getKnowledgeMetrics();
      
      if (response.success) {
        updateState({ knowledgeMetrics: response.data });
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, getKnowledgeMetrics);
    }
    
    return null;
  }, [updateState, handleError]);

  // ==================== NOTIFICATIONS ====================

  const loadNotifications = useCallback(async () => {
    try {
      const response = await collaborationAPIService.getCollaborationNotifications();
      
      if (response.success) {
        const unreadCount = response.data.filter((n: CollaborationNotification) => !n.read).length;
        updateState({ 
          notifications: response.data,
          unreadCount
        });
        metricsRef.current.successful++;
      }
    } catch (error) {
      await handleError(error as APIError, loadNotifications);
    }
  }, [updateState, handleError]);

  const markNotificationRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.markNotificationRead(notificationId);
      
      if (response.success) {
        updateState(prev => ({
          notifications: prev.notifications.map(notification => 
            notification.id === notificationId ? { ...notification, read: true } : notification
          ),
          unreadCount: Math.max(prev.unreadCount - 1, 0)
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => markNotificationRead(notificationId));
    }
    
    return false;
  }, [updateState, handleError]);

  const markAllNotificationsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.markAllNotificationsRead();
      
      if (response.success) {
        updateState(prev => ({
          notifications: prev.notifications.map(notification => ({ ...notification, read: true })),
          unreadCount: 0
        }));
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, markAllNotificationsRead);
    }
    
    return false;
  }, [updateState, handleError]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const response = await collaborationAPIService.deleteNotification(notificationId);
      
      if (response.success) {
        updateState(prev => {
          const notification = prev.notifications.find(n => n.id === notificationId);
          const wasUnread = notification && !notification.read;
          
          return {
            notifications: prev.notifications.filter(n => n.id !== notificationId),
            unreadCount: wasUnread ? Math.max(prev.unreadCount - 1, 0) : prev.unreadCount
          };
        });
        metricsRef.current.successful++;
        return true;
      }
    } catch (error) {
      await handleError(error as APIError, () => deleteNotification(notificationId));
    }
    
    return false;
  }, [updateState, handleError]);

  // ==================== UTILITY OPERATIONS ====================

  const refreshData = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      await Promise.all([
        loadHubs(),
        loadTeamMembers(),
        loadReviews(),
        loadWorkflows(),
        loadKnowledgeBase(),
        loadConsultations(),
        getMetrics(),
        loadNotifications()
      ]);
      
      updateState({ 
        loading: false, 
        lastUpdate: new Date(),
        updateCount: state.updateCount + 1
      });
    } catch (error) {
      await handleError(error as APIError, refreshData);
    }
  }, [
    loadHubs, loadTeamMembers, loadReviews, loadWorkflows, 
    loadKnowledgeBase, loadConsultations, getMetrics, loadNotifications,
    state.updateCount, updateState, handleError
  ]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    metricsRef.current.cacheHits = 0;
    metricsRef.current.cacheMisses = 0;
  }, []);

  const exportData = useCallback(async (format: 'json' | 'csv' | 'excel'): Promise<Blob | null> => {
    try {
      const response = await collaborationAPIService.exportCollaborationData({ format });
      
      if (response.success) {
        metricsRef.current.successful++;
        return response.data;
      }
    } catch (error) {
      await handleError(error as APIError, () => exportData(format));
    }
    
    return null;
  }, [handleError]);

  const resetState = useCallback(() => {
    setState({
      hubs: [],
      teamMembers: [],
      reviews: [],
      comments: [],
      workflows: [],
      knowledgeBase: [],
      consultations: [],
      currentHub: null,
      currentReview: null,
      activeWorkflows: [],
      metrics: null,
      analytics: null,
      teamActivity: [],
      reviewMetrics: null,
      knowledgeMetrics: null,
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      selectedHubId: null,
      selectedReviewId: null,
      realTimeConnected: false,
      lastUpdate: null,
      updateCount: 0
    });
    
    clearCache();
    metricsRef.current = {
      operations: 0,
      successful: 0,
      failed: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }, [clearCache]);

  // ==================== EFFECTS ====================

  // Initialize real-time connection
  useEffect(() => {
    if (hookConfig.enableRealTime) {
      const unsubscribe = collaborationAPIService.subscribe('collaboration_updated', (data) => {
        updateState(prev => ({
          ...prev,
          lastUpdate: new Date(),
          updateCount: prev.updateCount + 1,
          realTimeConnected: true
        }));
      });
      
      wsUnsubscribeRef.current = unsubscribe;
      
      return () => {
        if (wsUnsubscribeRef.current) {
          wsUnsubscribeRef.current();
        }
      };
    }
  }, [hookConfig.enableRealTime, updateState]);

  // Auto-refresh timer
  useEffect(() => {
    if (hookConfig.autoRefresh && hookConfig.refreshInterval > 0) {
      refreshTimerRef.current = setInterval(refreshData, hookConfig.refreshInterval);
      
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [hookConfig.autoRefresh, hookConfig.refreshInterval, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
    };
  }, []);

  // Operations object
  const operations: CollaborationOperations = {
    // Hub Management
    loadHubs,
    createHub,
    updateHub,
    deleteHub,
    joinHub,
    leaveHub,
    
    // Team Management
    loadTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    assignRole,
    
    // Review Management
    loadReviews,
    createReview,
    updateReview,
    submitReview,
    approveReview,
    rejectReview,
    
    // Comment Management
    loadComments,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    
    // Workflow Management
    loadWorkflows,
    createWorkflow,
    executeWorkflow,
    monitorWorkflow,
    
    // Knowledge Management
    loadKnowledgeBase,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    searchKnowledge,
    
    // Expert Consultation
    loadConsultations,
    requestConsultation,
    respondToConsultation,
    closeConsultation,
    
    // Metrics and Analytics
    getMetrics,
    getAnalytics,
    getTeamActivity,
    getReviewMetrics,
    getKnowledgeMetrics,
    
    // Notifications
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    
    // Utility Operations
    refreshData,
    clearCache,
    exportData,
    resetState
  };

  return [state, operations];
};

export default useCollaboration;