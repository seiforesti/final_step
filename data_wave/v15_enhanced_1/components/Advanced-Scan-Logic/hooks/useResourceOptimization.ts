import { useQuery, useMutation } from '@tanstack/react-query';
import {
  analyzeResourceUsage,
  optimizeResourceAllocation,
  predictResourceDemand,
} from '../services/resource-optimization-apis';

export function useResourceOptimization(params?: Record<string, any>) {
  const usage = useQuery({ queryKey: ['resource','usage', params], queryFn: () => analyzeResourceUsage(params) });
  const optimize = useMutation({ mutationFn: optimizeResourceAllocation });
  const predict = useQuery({ queryKey: ['resource','demand', params], queryFn: () => predictResourceDemand(params) });
  return { usage, optimize, predict };
}

export const useResourceMonitoring = useResourceOptimization;
export const useResourceAllocation = () => useMutation({ mutationFn: optimizeResourceAllocation });

// Missing hooks referenced by components
export function useResourcePools(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'pools', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'pools' }),
    refetchInterval: 30000
  });
}

export function useResourceQuotas(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'quotas', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'quotas' })
  });
}

export function useResourcePolicies(params?: Record<string, any>) {
  const qc = require('@tanstack/react-query').useQueryClient();
  const policies = useQuery({ 
    queryKey: ['resource', 'policies', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'policies' })
  });
  
  const updatePolicy = useMutation({
    mutationFn: (policyConfig: any) => optimizeResourceAllocation({ policyConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resource', 'policies'] }),
  });
  
  return { policies, updatePolicy };
}

export function useResourceMetrics(resourceId: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'metrics', resourceId, params], 
    queryFn: () => analyzeResourceUsage({ resourceId, ...params, type: 'metrics' }),
    enabled: !!resourceId,
    refetchInterval: 15000 // Real-time metrics
  });
}

export function useResourceAnalysis(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'analysis', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'analysis' })
  });
}

export function useResourcePlanning(params?: Record<string, any>) {
  const qc = require('@tanstack/react-query').useQueryClient();
  const plans = useQuery({ 
    queryKey: ['resource', 'planning', params], 
    queryFn: () => predictResourceDemand({ ...params, type: 'planning' })
  });
  
  const createPlan = useMutation({
    mutationFn: (planConfig: any) => optimizeResourceAllocation({ planConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resource', 'planning'] }),
  });
  
  return { plans, createPlan };
}

export function useResourceScheduling(params?: Record<string, any>) {
  const qc = require('@tanstack/react-query').useQueryClient();
  const schedules = useQuery({ 
    queryKey: ['resource', 'scheduling', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'scheduling' })
  });
  
  const updateSchedule = useMutation({
    mutationFn: (scheduleConfig: any) => optimizeResourceAllocation({ scheduleConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resource', 'scheduling'] }),
  });
  
  return { schedules, updateSchedule };
}

export function useResourceBalancing(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'balancing', params], 
    queryFn: () => optimizeResourceAllocation({ ...params, type: 'balancing' }),
    refetchInterval: 60000 // Regular balancing checks
  });
}

export function useResourceProfiles(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'profiles', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'profiles' })
  });
}

export function useResourceTemplates(params?: Record<string, any>) {
  const qc = require('@tanstack/react-query').useQueryClient();
  const templates = useQuery({ 
    queryKey: ['resource', 'templates', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'templates' })
  });
  
  const createTemplate = useMutation({
    mutationFn: (templateConfig: any) => optimizeResourceAllocation({ templateConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resource', 'templates'] }),
  });
  
  return { templates, createTemplate };
}

export function useResourceWorkloads(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'workloads', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'workloads' }),
    refetchInterval: 45000
  });
}

export function useResourceConfiguration(resourceId: string) {
  const qc = require('@tanstack/react-query').useQueryClient();
  const configuration = useQuery({ 
    queryKey: ['resource', 'configuration', resourceId], 
    queryFn: () => analyzeResourceUsage({ resourceId, type: 'configuration' }),
    enabled: !!resourceId
  });
  
  const updateConfiguration = useMutation({
    mutationFn: (config: any) => optimizeResourceAllocation({ resourceId, configuration: config }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resource', 'configuration', resourceId] }),
  });
  
  return { configuration, updateConfiguration };
}

export function useResourceAudit(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['resource', 'audit', params], 
    queryFn: () => analyzeResourceUsage({ ...params, type: 'audit' })
  });
}



