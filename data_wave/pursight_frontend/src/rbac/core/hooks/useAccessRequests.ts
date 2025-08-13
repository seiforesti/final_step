/**
 * useAccessRequests Hook
 * 
 * This hook provides utilities for managing access requests.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { AccessRequest } from '../api/models';
import { accessRequestsApi } from '../api/accessRequestsApi';

/**
 * Interface for the useAccessRequests hook parameters
 */
interface UseAccessRequestsParams {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'approved' | 'denied' | 'expired' | 'all';
  userId?: number;
  resourceType?: string;
  resourceId?: string;
}

/**
 * Interface for the useAccessRequests hook return value
 */
interface UseAccessRequestsReturn {
  // Access requests data and loading state
  requests: AccessRequest[] | undefined;
  totalRequests: number;
  isLoading: boolean;
  error: Error | null;
  
  // Access request operations
  getAccessRequest: (requestId: number) => Promise<AccessRequest | null>;
  requestAccess: (resourceType: string, resourceId: string, requestedRole: string, justification: string) => Promise<any>;
  reviewAccessRequest: (requestId: number, approved: boolean, note?: string) => Promise<any>;
  triggerAccessReview: (params: {
    resourceType?: string;
    resourceId?: string;
    roleId?: number;
    userId?: number;
    expirationDays?: number;
  }) => Promise<any>;
  
  // Access request utility functions
  getPendingRequests: () => AccessRequest[];
  getRequestsByUser: (userId: number) => AccessRequest[];
  getRequestsByResource: (resourceType: string, resourceId: string) => AccessRequest[];
}

/**
 * Hook for managing access requests
 */
export const useAccessRequests = (params: UseAccessRequestsParams = {}): UseAccessRequestsReturn => {
  // Fetch access requests
  const { data, isLoading, error } = useAccessRequestsQuery(params);
  const requests = data?.requests;
  const totalRequests = data?.total || 0;
  
  // Access request mutations
  const requestAccessMutation = useRequestAccess();
  const reviewAccessRequestMutation = useReviewAccessRequest();
  const triggerAccessReviewMutation = useTriggerAccessReview();

  return useMemo(() => {
    // Access request operations
    const getAccessRequest = async (requestId: number) => {
      try {
        const { data } = await useAccessRequest(requestId);
        return data || null;
      } catch (error) {
        console.error('Error fetching access request:', error);
        return null;
      }
    };

    const requestAccess = async (resourceType: string, resourceId: string, requestedRole: string, justification: string) => {
      return requestAccessMutation.mutateAsync({
        resource_type: resourceType,
        resource_id: resourceId,
        requested_role: requestedRole,
        justification,
      });
    };

    const reviewAccessRequest = async (requestId: number, approved: boolean, note?: string) => {
      return reviewAccessRequestMutation.mutateAsync({
        requestId,
        approved,
        note,
      });
    };

    const triggerAccessReview = async (params: {
      resourceType?: string;
      resourceId?: string;
      roleId?: number;
      userId?: number;
      expirationDays?: number;
    }) => {
      return triggerAccessReviewMutation.mutateAsync({
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        role_id: params.roleId,
        user_id: params.userId,
        expiration_days: params.expirationDays,
      });
    };

    // Access request utility functions
    const getPendingRequests = () => {
      return requests?.filter((request) => request.status === 'pending') || [];
    };

    const getRequestsByUser = (userId: number) => {
      return requests?.filter((request) => request.user_id === userId) || [];
    };

    const getRequestsByResource = (resourceType: string, resourceId: string) => {
      return requests?.filter(
        (request) => request.resource_type === resourceType && request.resource_id === resourceId
      ) || [];
    };

    return {
      requests,
      totalRequests,
      isLoading,
      error,
      getAccessRequest,
      requestAccess,
      reviewAccessRequest,
      triggerAccessReview,
      getPendingRequests,
      getRequestsByUser,
      getRequestsByResource,
    };
  }, [requests, totalRequests, isLoading, error, requestAccessMutation, reviewAccessRequestMutation, triggerAccessReviewMutation]);
};