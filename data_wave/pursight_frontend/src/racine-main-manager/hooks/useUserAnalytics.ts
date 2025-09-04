// ============================================================================
// USER ANALYTICS HOOK - USER MANAGEMENT
// ============================================================================
// Advanced user analytics hook with comprehensive user behavior tracking
// Provides user activity analysis, performance metrics, and engagement insights

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// USER ANALYTICS INTERFACES
// ============================================================================

export interface UserActivity {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  timestamp: Date;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface UserBehavior {
  userId: string;
  userEmail: string;
  sessionCount: number;
  averageSessionDuration: number;
  mostUsedFeatures: string[];
  preferredTimes: string[];
  deviceTypes: string[];
  lastActivity: Date;
  engagementScore: number;
  metadata?: Record<string, any>;
}

export interface UserPerformance {
  userId: string;
  userEmail: string;
  taskCompletionRate: number;
  averageTaskTime: number;
  errorRate: number;
  helpRequests: number;
  trainingCompletions: number;
  performanceScore: number;
  metadata?: Record<string, any>;
}

export interface UserEngagement {
  userId: string;
  userEmail: string;
  loginFrequency: number;
  featureUsage: Record<string, number>;
  collaborationActions: number;
  feedbackSubmissions: number;
  trainingParticipation: number;
  engagementLevel: 'low' | 'medium' | 'high' | 'excellent';
  metadata?: Record<string, any>;
}

export interface UserAnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
  averageEngagementScore: number;
  topPerformingUsers: string[];
  topEngagedUsers: string[];
  userRetentionRate: number;
  metadata?: Record<string, any>;
}

export interface UserAnalyticsFilter {
  timeRange?: string;
  userRole?: string[];
  department?: string[];
  performanceThreshold?: number;
  engagementLevel?: string[];
  activityType?: string[];
}

// ============================================================================
// USER ANALYTICS HOOK
// ============================================================================

export function useUserAnalytics(userId?: string) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserAnalyticsFilter>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Fetch user activities
  const userActivitiesQuery = useQuery({
    queryKey: ['user-activities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/user-analytics/activities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch user activities');
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch user behaviors
  const userBehaviorsQuery = useQuery({
    queryKey: ['user-behaviors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/user-analytics/behaviors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch user behaviors');
      return response.json();
    },
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  // Fetch user performance
  const userPerformanceQuery = useQuery({
    queryKey: ['user-performance', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/user-analytics/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch user performance');
      return response.json();
    },
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  // Fetch user engagement
  const userEngagementQuery = useQuery({
    queryKey: ['user-engagement', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/user-analytics/engagement?${params}`);
      if (!response.ok) throw new Error('Failed to fetch user engagement');
      return response.json();
    },
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  // Fetch user analytics metrics
  const userMetricsQuery = useQuery({
    queryKey: ['user-metrics', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/user-analytics/metrics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch user metrics');
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch specific user analytics
  const specificUserQuery = useQuery({
    queryKey: ['specific-user-analytics', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null;
      const response = await fetch(`/api/user-analytics/user/${selectedUser}`);
      if (!response.ok) throw new Error('Failed to fetch user analytics');
      return response.json();
    },
    enabled: !!selectedUser,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Update user performance metrics
  const updateUserPerformanceMutation = useMutation({
    mutationFn: async (params: { userId: string; updates: Partial<UserPerformance> }) => {
      const response = await fetch(`/api/user-analytics/performance/${params.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.updates),
      });
      if (!response.ok) throw new Error('Failed to update user performance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-performance'] });
      queryClient.invalidateQueries({ queryKey: ['user-metrics'] });
    },
  });

  // Update user engagement metrics
  const updateUserEngagementMutation = useMutation({
    mutationFn: async (params: { userId: string; updates: Partial<UserEngagement> }) => {
      const response = await fetch(`/api/user-analytics/engagement/${params.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.updates),
      });
      if (!response.ok) throw new Error('Failed to update user engagement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-engagement'] });
      queryClient.invalidateQueries({ queryKey: ['user-metrics'] });
    },
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const updateUserPerformance = useCallback(async (userId: string, updates: Partial<UserPerformance>) => {
    try {
      await updateUserPerformanceMutation.mutateAsync({ userId, updates });
    } catch (error) {
      console.error('Failed to update user performance:', error);
      throw error;
    }
  }, [updateUserPerformanceMutation]);

  const updateUserEngagement = useCallback(async (userId: string, updates: Partial<UserEngagement>) => {
    try {
      await updateUserEngagementMutation.mutateAsync({ userId, updates });
    } catch (error) {
      console.error('Failed to update user engagement:', error);
      throw error;
    }
  }, [updateUserEngagementMutation]);

  const setAnalyticsFilters = useCallback((newFilters: UserAnalyticsFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearAnalyticsFilters = useCallback(() => {
    setFilters({});
  }, []);

  const selectUser = useCallback((userId: string | null) => {
    setSelectedUser(userId);
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getTopPerformers = useCallback((limit: number = 10) => {
    return userPerformanceQuery.data
      ?.sort((a: UserPerformance, b: UserPerformance) => b.performanceScore - a.performanceScore)
      .slice(0, limit) || [];
  }, [userPerformanceQuery.data]);

  const getTopEngagedUsers = useCallback((limit: number = 10) => {
    return userEngagementQuery.data
      ?.sort((a: UserEngagement, b: UserEngagement) => b.engagementLevel.localeCompare(a.engagementLevel))
      .slice(0, limit) || [];
  }, [userEngagementQuery.data]);

  const getUsersByPerformanceRange = useCallback((minScore: number, maxScore: number) => {
    return userPerformanceQuery.data?.filter((user: UserPerformance) => 
      user.performanceScore >= minScore && user.performanceScore <= maxScore
    ) || [];
  }, [userPerformanceQuery.data]);

  const getUsersByEngagementLevel = useCallback((level: string) => {
    return userEngagementQuery.data?.filter((user: UserEngagement) => 
      user.engagementLevel === level
    ) || [];
  }, [userEngagementQuery.data]);

  const getActivitySummary = useCallback((userId: string) => {
    return userActivitiesQuery.data?.filter((activity: UserActivity) => 
      activity.userId === userId
    ) || [];
  }, [userActivitiesQuery.data]);

  const getBehaviorSummary = useCallback((userId: string) => {
    return userBehaviorsQuery.data?.find((behavior: UserBehavior) => 
      behavior.userId === userId
    );
  }, [userBehaviorsQuery.data]);

  const getPerformanceSummary = useCallback((userId: string) => {
    return userPerformanceQuery.data?.find((performance: UserPerformance) => 
      performance.userId === userId
    );
  }, [userPerformanceQuery.data]);

  const getEngagementSummary = useCallback((userId: string) => {
    return userEngagementQuery.data?.find((engagement: UserEngagement) => 
      engagement.userId === userId
    );
  }, [userEngagementQuery.data]);

  const calculateUserInsights = useCallback((userId: string) => {
    const activities = getActivitySummary(userId);
    const behavior = getBehaviorSummary(userId);
    const performance = getPerformanceSummary(userId);
    const engagement = getEngagementSummary(userId);

    if (!behavior || !performance || !engagement) {
      return null;
    }

    const insights = {
      strengths: [] as string[],
      areasForImprovement: [] as string[],
      recommendations: [] as string[],
    };

    // Analyze performance
    if (performance.performanceScore >= 80) {
      insights.strengths.push('High performance score');
    } else if (performance.performanceScore < 60) {
      insights.areasForImprovement.push('Low performance score');
      insights.recommendations.push('Consider additional training or support');
    }

    // Analyze engagement
    if (engagement.engagementLevel === 'excellent') {
      insights.strengths.push('Excellent engagement level');
    } else if (engagement.engagementLevel === 'low') {
      insights.areasForImprovement.push('Low engagement level');
      insights.recommendations.push('Review user experience and feature accessibility');
    }

    // Analyze behavior patterns
    if (behavior.averageSessionDuration < 300) { // Less than 5 minutes
      insights.areasForImprovement.push('Short session duration');
      insights.recommendations.push('Investigate session flow and user onboarding');
    }

    if (performance.errorRate > 0.1) { // More than 10% error rate
      insights.areasForImprovement.push('High error rate');
      insights.recommendations.push('Review user interface and provide better guidance');
    }

    return insights;
  }, [getActivitySummary, getBehaviorSummary, getPerformanceSummary, getEngagementSummary]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    filters,
    selectedUser,
    
    // Data
    userActivities: userActivitiesQuery.data || [],
    userBehaviors: userBehaviorsQuery.data || [],
    userPerformance: userPerformanceQuery.data || [],
    userEngagement: userEngagementQuery.data || [],
    userMetrics: userMetricsQuery.data,
    specificUserAnalytics: specificUserQuery.data,
    
    // Loading states
    isLoading: userActivitiesQuery.isLoading || userBehaviorsQuery.isLoading || 
               userPerformanceQuery.isLoading || userEngagementQuery.isLoading || 
               userMetricsQuery.isLoading,
    isError: userActivitiesQuery.isError || userBehaviorsQuery.isError || 
             userPerformanceQuery.isError || userEngagementQuery.isError || 
             userMetricsQuery.isError,
    
    // Mutations
    updateUserPerformance,
    updateUserEngagement,
    
    // Event handlers
    setAnalyticsFilters,
    clearAnalyticsFilters,
    selectUser,
    
    // Utility functions
    getTopPerformers,
    getTopEngagedUsers,
    getUsersByPerformanceRange,
    getUsersByEngagementLevel,
    getActivitySummary,
    getBehaviorSummary,
    getPerformanceSummary,
    getEngagementSummary,
    calculateUserInsights,
    
    // Refetch functions
    refetchActivities: userActivitiesQuery.refetch,
    refetchBehaviors: userBehaviorsQuery.refetch,
    refetchPerformance: userPerformanceQuery.refetch,
    refetchEngagement: userEngagementQuery.refetch,
    refetchMetrics: userMetricsQuery.refetch,
    refetchSpecificUser: specificUserQuery.refetch,
  };
}
