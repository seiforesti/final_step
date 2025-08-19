// ============================================================================
// ADVANCED CATALOG COLLABORATION HOOKS - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// React hooks for comprehensive catalog collaboration functionality
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// Import types
import type {
  CatalogCollaborationHub,
  CollaborationTeam,
  DataStewardshipCenter,
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

// Import service
import { advancedCatalogCollaborationService } from '../services/collaboration.service';

// ============================================================================
// COLLABORATION HUB HOOKS
// ============================================================================

/**
 * Hook for managing collaboration hubs
 */
export function useCollaborationHubs(options?: { 
  includeInactive?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}) {
  const queryClient = useQueryClient();
  
  // Query for hubs
  const {
    data: hubs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['catalog-collaboration-hubs', options?.includeInactive],
    queryFn: () => advancedCatalogCollaborationService.getCollaborationHubs({
      includeInactive: options?.includeInactive || false
    }),
    refetchInterval: options?.autoRefresh ? (options.refreshInterval || 30000) : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create hub mutation
  const createHubMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.createCollaborationHub,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-collaboration-hubs'] });
      toast.success('Collaboration hub created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create hub: ${error.message}`);
    }
  });

  const createHub = useCallback(async (hubData: {
    name: string;
    description: string;
    config?: Record<string, any>;
    governanceEnabled?: boolean;
  }) => {
    return createHubMutation.mutateAsync(hubData);
  }, [createHubMutation]);

  return {
    hubs: hubs || [],
    isLoading,
    error,
    refetch,
    createHub,
    isCreating: createHubMutation.isPending
  };
}

/**
 * Hook for individual collaboration hub
 */
export function useCollaborationHub(hubId: number) {
  const queryClient = useQueryClient();
  
  const {
    data: hub,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-collaboration-hub', hubId],
    queryFn: () => advancedCatalogCollaborationService.getCollaborationHub(hubId),
    enabled: !!hubId,
  });

  const updateHubMutation = useMutation({
    mutationFn: (data: Partial<CatalogCollaborationHub>) => 
      advancedCatalogCollaborationService.updateCollaborationHub(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-collaboration-hub', hubId] });
      queryClient.invalidateQueries({ queryKey: ['catalog-collaboration-hubs'] });
      toast.success('Hub updated successfully');
    }
  });

  return {
    hub,
    isLoading,
    error,
    updateHub: updateHubMutation.mutateAsync,
    isUpdating: updateHubMutation.isPending
  };
}

// ============================================================================
// TEAM COLLABORATION HOOKS
// ============================================================================

/**
 * Hook for managing collaboration teams
 */
export function useCollaborationTeams(hubId?: number) {
  const queryClient = useQueryClient();
  
  const {
    data: teams,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-collaboration-teams', hubId],
    queryFn: () => advancedCatalogCollaborationService.getCollaborationTeams(hubId),
    enabled: !!hubId,
  });

  const createTeamMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.createCollaborationTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-collaboration-teams'] });
      toast.success('Team created successfully');
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.addTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-collaboration-teams'] });
      toast.success('Member added successfully');
    }
  });

  return {
    teams: teams || [],
    isLoading,
    error,
    createTeam: createTeamMutation.mutateAsync,
    addMember: addMemberMutation.mutateAsync,
    isCreatingTeam: createTeamMutation.isPending,
    isAddingMember: addMemberMutation.isPending
  };
}

// ============================================================================
// DATA STEWARDSHIP HOOKS
// ============================================================================

/**
 * Hook for data stewardship management
 */
export function useDataStewardship(hubId?: number) {
  const queryClient = useQueryClient();
  
  const {
    data: stewardshipCenter,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-stewardship-center', hubId],
    queryFn: () => advancedCatalogCollaborationService.getStewardshipCenter(hubId),
    enabled: !!hubId,
  });

  const createCenterMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.createStewardshipCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-stewardship-center'] });
      toast.success('Stewardship center created successfully');
    }
  });

  const assignStewardMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.assignDataSteward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-stewardship-center'] });
      toast.success('Data steward assigned successfully');
    }
  });

  return {
    stewardshipCenter,
    isLoading,
    error,
    createCenter: createCenterMutation.mutateAsync,
    assignSteward: assignStewardMutation.mutateAsync,
    isCreatingCenter: createCenterMutation.isPending,
    isAssigningSteward: assignStewardMutation.isPending
  };
}

// ============================================================================
// ANNOTATION HOOKS
// ============================================================================

/**
 * Hook for managing data annotations
 */
export function useDataAnnotations(assetId?: string, targetType?: AnnotationTargetType) {
  const queryClient = useQueryClient();
  
  const {
    data: annotations,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['catalog-annotations', assetId, targetType],
    queryFn: () => advancedCatalogCollaborationService.getAssetAnnotations(assetId!, targetType!),
    enabled: !!(assetId && targetType),
  });

  const createAnnotationMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.createAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-annotations'] });
      toast.success('Annotation created successfully');
    }
  });

  const updateAnnotationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DataAnnotation> }) =>
      advancedCatalogCollaborationService.updateAnnotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-annotations'] });
      toast.success('Annotation updated successfully');
    }
  });

  return {
    annotations: annotations || [],
    isLoading,
    error,
    refetch,
    createAnnotation: createAnnotationMutation.mutateAsync,
    updateAnnotation: updateAnnotationMutation.mutateAsync,
    isCreating: createAnnotationMutation.isPending,
    isUpdating: updateAnnotationMutation.isPending
  };
}

// ============================================================================
// REVIEW WORKFLOW HOOKS
// ============================================================================

/**
 * Hook for managing asset reviews
 */
export function useAssetReviews(assetId?: string) {
  const queryClient = useQueryClient();
  
  const {
    data: reviews,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-asset-reviews', assetId],
    queryFn: () => advancedCatalogCollaborationService.getAssetReviews(assetId!),
    enabled: !!assetId,
  });

  const createReviewMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.createAssetReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-asset-reviews'] });
      toast.success('Review created successfully');
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.addReviewComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-asset-reviews'] });
      toast.success('Comment added successfully');
    }
  });

  return {
    reviews: reviews || [],
    isLoading,
    error,
    createReview: createReviewMutation.mutateAsync,
    addComment: addCommentMutation.mutateAsync,
    isCreatingReview: createReviewMutation.isPending,
    isAddingComment: addCommentMutation.isPending
  };
}

// ============================================================================
// CROWDSOURCING HOOKS
// ============================================================================

/**
 * Hook for crowdsourcing campaigns
 */
export function useCrowdsourcingCampaigns(platformId?: number) {
  const queryClient = useQueryClient();
  
  const {
    data: campaigns,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-crowdsourcing-campaigns', platformId],
    queryFn: () => advancedCatalogCollaborationService.getCrowdsourcingCampaigns(platformId),
    enabled: !!platformId,
  });

  const createCampaignMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.createCrowdsourcingCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-crowdsourcing-campaigns'] });
      toast.success('Campaign created successfully');
    }
  });

  const submitContributionMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.submitCommunityContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-crowdsourcing-campaigns'] });
      toast.success('Contribution submitted successfully');
    }
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    error,
    createCampaign: createCampaignMutation.mutateAsync,
    submitContribution: submitContributionMutation.mutateAsync,
    isCreatingCampaign: createCampaignMutation.isPending,
    isSubmittingContribution: submitContributionMutation.isPending
  };
}

// ============================================================================
// EXPERT NETWORKING HOOKS
// ============================================================================

/**
 * Hook for expert consultation
 */
export function useExpertConsultation() {
  const queryClient = useQueryClient();
  
  const requestConsultationMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.requestExpertConsultation,
    onSuccess: () => {
      toast.success('Expert consultation requested successfully');
    }
  });

  const {
    data: consultationRequests,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-consultation-requests'],
    queryFn: () => advancedCatalogCollaborationService.getConsultationRequests(),
  });

  return {
    consultationRequests: consultationRequests || [],
    isLoading,
    error,
    requestConsultation: requestConsultationMutation.mutateAsync,
    isRequestingConsultation: requestConsultationMutation.isPending
  };
}

// ============================================================================
// KNOWLEDGE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for knowledge base articles
 */
export function useKnowledgeBase(categoryId?: number) {
  const queryClient = useQueryClient();
  
  const {
    data: articles,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-knowledge-articles', categoryId],
    queryFn: () => advancedCatalogCollaborationService.getKnowledgeArticles(categoryId),
    enabled: !!categoryId,
  });

  const createArticleMutation = useMutation({
    mutationFn: advancedCatalogCollaborationService.createKnowledgeArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-knowledge-articles'] });
      toast.success('Knowledge article created successfully');
    }
  });

  return {
    articles: articles || [],
    isLoading,
    error,
    createArticle: createArticleMutation.mutateAsync,
    isCreatingArticle: createArticleMutation.isPending
  };
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

/**
 * Hook for collaboration analytics
 */
export function useCollaborationAnalytics(hubId: number, options?: {
  timePeriod?: 'day' | 'week' | 'month';
  metrics?: string[];
  autoRefresh?: boolean;
}) {
  const {
    data: analytics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['catalog-collaboration-analytics', hubId, options?.timePeriod, options?.metrics],
    queryFn: () => advancedCatalogCollaborationService.getCollaborationAnalytics(
      hubId,
      options?.timePeriod || 'week',
      options?.metrics
    ),
    enabled: !!hubId,
    refetchInterval: options?.autoRefresh ? 60000 : false, // 1 minute
  });

  const {
    data: insights,
    isLoading: isLoadingInsights
  } = useQuery({
    queryKey: ['catalog-collaboration-insights', hubId],
    queryFn: () => advancedCatalogCollaborationService.getAdvancedCollaborationInsights(hubId),
    enabled: !!hubId,
  });

  const {
    data: compliance,
    isLoading: isLoadingCompliance
  } = useQuery({
    queryKey: ['catalog-collaboration-compliance', hubId],
    queryFn: () => advancedCatalogCollaborationService.getCollaborationCompliance(hubId),
    enabled: !!hubId,
  });

  return {
    analytics,
    insights,
    compliance,
    isLoading: isLoading || isLoadingInsights || isLoadingCompliance,
    error,
    refetch
  };
}

// ============================================================================
// MAIN COLLABORATION HOOK
// ============================================================================

export interface UseCatalogCollaborationOptions {
  hubId?: number;
  assetId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface CollaborationState {
  hubs: CatalogCollaborationHub[];
  teams: CollaborationTeam[];
  annotations: DataAnnotation[];
  reviews: AssetReview[];
  campaigns: CrowdsourcingCampaign[];
  consultationRequests: ConsultationRequest[];
  articles: KnowledgeArticle[];
  analytics: any;
  isLoading: boolean;
  error: Error | null;
}

export interface CollaborationOperations {
  // Hub operations
  createHub: (data: any) => Promise<any>;
  updateHub: (id: number, data: any) => Promise<any>;
  
  // Team operations
  createTeam: (data: any) => Promise<any>;
  addMember: (data: any) => Promise<any>;
  
  // Stewardship operations
  createStewardshipCenter: (data: any) => Promise<any>;
  assignDataSteward: (data: any) => Promise<any>;
  
  // Annotation operations
  createAnnotation: (data: any) => Promise<any>;
  updateAnnotation: (id: number, data: any) => Promise<any>;
  
  // Review operations
  createReview: (data: any) => Promise<any>;
  addComment: (data: any) => Promise<any>;
  
  // Crowdsourcing operations
  createCampaign: (data: any) => Promise<any>;
  submitContribution: (data: any) => Promise<any>;
  
  // Expert networking
  requestConsultation: (data: any) => Promise<any>;
  
  // Knowledge management
  createArticle: (data: any) => Promise<any>;
  
  // Utility operations
  refreshData: () => void;
}

/**
 * Main hook for catalog collaboration functionality
 */
export function useCatalogCollaboration(
  options: UseCatalogCollaborationOptions = {}
): {
  state: CollaborationState;
  operations: CollaborationOperations;
} {
  const { hubId, assetId, autoRefresh, refreshInterval } = options;

  // Use all sub-hooks
  const hubsResult = useCollaborationHubs({ autoRefresh, refreshInterval });
  const teamsResult = useCollaborationTeams(hubId);
  const stewardshipResult = useDataStewardship(hubId);
  const annotationsResult = useDataAnnotations(assetId, 'asset');
  const reviewsResult = useAssetReviews(assetId);
  const crowdsourcingResult = useCrowdsourcingCampaigns(hubId);
  const expertResult = useExpertConsultation();
  const knowledgeResult = useKnowledgeBase(hubId);
  const analyticsResult = useCollaborationAnalytics(hubId || 0, { autoRefresh });

  // Aggregate state
  const state: CollaborationState = useMemo(() => ({
    hubs: hubsResult.hubs,
    teams: teamsResult.teams,
    annotations: annotationsResult.annotations,
    reviews: reviewsResult.reviews,
    campaigns: crowdsourcingResult.campaigns,
    consultationRequests: expertResult.consultationRequests,
    articles: knowledgeResult.articles,
    analytics: analyticsResult.analytics,
    isLoading: hubsResult.isLoading || teamsResult.isLoading || annotationsResult.isLoading ||
              reviewsResult.isLoading || crowdsourcingResult.isLoading || expertResult.isLoading ||
              knowledgeResult.isLoading || analyticsResult.isLoading,
    error: hubsResult.error || teamsResult.error || annotationsResult.error ||
           reviewsResult.error || crowdsourcingResult.error || expertResult.error ||
           knowledgeResult.error || analyticsResult.error
  }), [
    hubsResult, teamsResult, annotationsResult, reviewsResult,
    crowdsourcingResult, expertResult, knowledgeResult, analyticsResult
  ]);

  // Aggregate operations
  const operations: CollaborationOperations = useMemo(() => ({
    // Hub operations
    createHub: hubsResult.createHub,
    updateHub: async (id: number, data: any) => {
      // Implementation would be added to hub hook
      return Promise.resolve();
    },
    
    // Team operations
    createTeam: teamsResult.createTeam,
    addMember: teamsResult.addMember,
    
    // Stewardship operations
    createStewardshipCenter: stewardshipResult.createCenter,
    assignDataSteward: stewardshipResult.assignSteward,
    
    // Annotation operations
    createAnnotation: annotationsResult.createAnnotation,
    updateAnnotation: annotationsResult.updateAnnotation,
    
    // Review operations
    createReview: reviewsResult.createReview,
    addComment: reviewsResult.addComment,
    
    // Crowdsourcing operations
    createCampaign: crowdsourcingResult.createCampaign,
    submitContribution: crowdsourcingResult.submitContribution,
    
    // Expert networking
    requestConsultation: expertResult.requestConsultation,
    
    // Knowledge management
    createArticle: knowledgeResult.createArticle,
    
    // Utility operations
    refreshData: () => {
      hubsResult.refetch();
      annotationsResult.refetch();
      analyticsResult.refetch();
    }
  }), [
    hubsResult, teamsResult, stewardshipResult, annotationsResult,
    reviewsResult, crowdsourcingResult, expertResult, knowledgeResult
  ]);

  return { state, operations };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  UseCatalogCollaborationOptions,
  CollaborationState,
  CollaborationOperations
};

export default useCatalogCollaboration;