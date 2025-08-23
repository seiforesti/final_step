// ============================================================================
// SECURITY AUDIT HOOK - USER MANAGEMENT
// ============================================================================
// Advanced security audit hook with comprehensive security monitoring
// Provides security event tracking, compliance monitoring, and threat detection

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// SECURITY AUDIT INTERFACES
// ============================================================================

export interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'system_change' | 'threat' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  description: string;
  details: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
  metadata?: Record<string, any>;
}

export interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'suspicious_activity' | 'data_exfiltration' | 'privilege_escalation' | 'malware' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  detectedAt: Date;
  description: string;
  indicators: ThreatIndicator[];
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  responseActions: string[];
  metadata?: Record<string, any>;
}

export interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'behavior' | 'pattern';
  value: string;
  confidence: number;
  source: string;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ComplianceViolation {
  id: string;
  standard: string;
  requirement: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  affectedUsers: string[];
  affectedResources: string[];
  status: 'open' | 'investigating' | 'resolved' | 'accepted_risk';
  remediation: string;
  metadata?: Record<string, any>;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  threatsByType: Record<string, number>;
  complianceScore: number;
  averageResponseTime: number;
  openIncidents: number;
  resolvedIncidents: number;
}

export interface SecurityFilter {
  timeRange?: string;
  severity?: string[];
  type?: string[];
  userId?: string;
  status?: string[];
  ipAddress?: string;
}

// ============================================================================
// SECURITY AUDIT HOOK
// ============================================================================

export function useSecurityAudit(userId?: string) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SecurityFilter>({});
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Fetch security events
  const securityEventsQuery = useQuery({
    queryKey: ['security-events', filters],
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

      const response = await fetch(`/api/security/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch security events');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch security threats
  const securityThreatsQuery = useQuery({
    queryKey: ['security-threats', filters],
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

      const response = await fetch(`/api/security/threats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch security threats');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch compliance violations
  const complianceViolationsQuery = useQuery({
    queryKey: ['compliance-violations', filters],
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

      const response = await fetch(`/api/security/compliance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch compliance violations');
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch security metrics
  const securityMetricsQuery = useQuery({
    queryKey: ['security-metrics', filters],
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

      const response = await fetch(`/api/security/metrics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch security metrics');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Update security event status
  const updateEventStatusMutation = useMutation({
    mutationFn: async (params: { eventId: string; status: string; resolution?: string }) => {
      const response = await fetch(`/api/security/events/${params.eventId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: params.status, resolution: params.resolution }),
      });
      if (!response.ok) throw new Error('Failed to update event status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
    },
  });

  // Assign security event
  const assignEventMutation = useMutation({
    mutationFn: async (params: { eventId: string; assignedTo: string }) => {
      const response = await fetch(`/api/security/events/${params.eventId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: params.assignedTo }),
      });
      if (!response.ok) throw new Error('Failed to assign event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
    },
  });

  // Update threat status
  const updateThreatStatusMutation = useMutation({
    mutationFn: async (params: { threatId: string; status: string; responseActions: string[] }) => {
      const response = await fetch(`/api/security/threats/${params.threatId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: params.status, responseActions: params.responseActions }),
      });
      if (!response.ok) throw new Error('Failed to update threat status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-threats'] });
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
    },
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const updateEventStatus = useCallback(async (eventId: string, status: string, resolution?: string) => {
    try {
      await updateEventStatusMutation.mutateAsync({ eventId, status, resolution });
    } catch (error) {
      console.error('Failed to update event status:', error);
      throw error;
    }
  }, [updateEventStatusMutation]);

  const assignEvent = useCallback(async (eventId: string, assignedTo: string) => {
    try {
      await assignEventMutation.mutateAsync({ eventId, assignedTo });
    } catch (error) {
      console.error('Failed to assign event:', error);
      throw error;
    }
  }, [assignEventMutation]);

  const updateThreatStatus = useCallback(async (threatId: string, status: string, responseActions: string[]) => {
    try {
      await updateThreatStatusMutation.mutateAsync({ threatId, status, responseActions });
    } catch (error) {
      console.error('Failed to update threat status:', error);
      throw error;
    }
  }, [updateThreatStatusMutation]);

  const setEventFilters = useCallback((newFilters: SecurityFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const selectEvent = useCallback((event: SecurityEvent | null) => {
    setSelectedEvent(event);
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getEventsBySeverity = useCallback((severity: string) => {
    return securityEventsQuery.data?.filter((event: SecurityEvent) => event.severity === severity) || [];
  }, [securityEventsQuery.data]);

  const getEventsByType = useCallback((type: string) => {
    return securityEventsQuery.data?.filter((event: SecurityEvent) => event.type === type) || [];
  }, [securityEventsQuery.data]);

  const getOpenIncidents = useCallback(() => {
    return securityEventsQuery.data?.filter((event: SecurityEvent) => 
      event.status === 'open' || event.status === 'investigating'
    ) || [];
  }, [securityEventsQuery.data]);

  const getThreatsByType = useCallback((type: string) => {
    return securityThreatsQuery.data?.filter((threat: SecurityThreat) => threat.type === type) || [];
  }, [securityThreatsQuery.data]);

  const getActiveThreats = useCallback(() => {
    return securityThreatsQuery.data?.filter((threat: SecurityThreat) => 
      threat.status === 'detected' || threat.status === 'investigating'
    ) || [];
  }, [securityThreatsQuery.data]);

  const getComplianceViolationsByStandard = useCallback((standard: string) => {
    return complianceViolationsQuery.data?.filter((violation: ComplianceViolation) => 
      violation.standard === standard
    ) || [];
  }, [complianceViolationsQuery.data]);

  const getOpenViolations = useCallback(() => {
    return complianceViolationsQuery.data?.filter((violation: ComplianceViolation) => 
      violation.status === 'open' || violation.status === 'investigating'
    ) || [];
  }, [complianceViolationsQuery.data]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    filters,
    selectedEvent,
    
    // Data
    securityEvents: securityEventsQuery.data || [],
    securityThreats: securityThreatsQuery.data || [],
    complianceViolations: complianceViolationsQuery.data || [],
    securityMetrics: securityMetricsQuery.data,
    
    // Loading states
    isLoading: securityEventsQuery.isLoading || securityThreatsQuery.isLoading || 
               complianceViolationsQuery.isLoading || securityMetricsQuery.isLoading,
    isError: securityEventsQuery.isError || securityThreatsQuery.isError || 
             complianceViolationsQuery.isError || securityMetricsQuery.isError,
    
    // Mutations
    updateEventStatus,
    assignEvent,
    updateThreatStatus,
    
    // Event handlers
    setEventFilters,
    clearFilters,
    selectEvent,
    
    // Utility functions
    getEventsBySeverity,
    getEventsByType,
    getOpenIncidents,
    getThreatsByType,
    getActiveThreats,
    getComplianceViolationsByStandard,
    getOpenViolations,
    
    // Refetch functions
    refetchEvents: securityEventsQuery.refetch,
    refetchThreats: securityThreatsQuery.refetch,
    refetchViolations: complianceViolationsQuery.refetch,
    refetchMetrics: securityMetricsQuery.refetch,
  };
}

