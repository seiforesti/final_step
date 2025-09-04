import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchScalabilityManagers,
  fetchScalabilityManager,
  createScalabilityManager,
  updateScalabilityManager,
  deleteScalabilityManager,
  fetchScalabilityConfiguration,
  updateScalabilityConfiguration,
  fetchScalabilityMetrics,
} from '../services/scalability-manager-apis';

export function useScalabilityManager(id?: string) {
  const qc = useQueryClient();
  const managerQuery = useQuery({
    queryKey: ['scalability','manager', id],
    queryFn: () => id ? fetchScalabilityManager(id) : fetchScalabilityManagers(),
    enabled: !!id,
  });
  const create = useMutation({ mutationFn: createScalabilityManager, onSuccess: () => qc.invalidateQueries({ queryKey: ['scalability'] }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string, payload: any }) => updateScalabilityManager(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['scalability','manager', id] }) });
  const remove = useMutation({ mutationFn: (id: string) => deleteScalabilityManager(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['scalability'] }) });
  return { managerQuery, create, update, remove };
}

export function useScalabilityMetrics(id: string, params?: Record<string, any>) {
  return useQuery({ queryKey: ['scalability','metrics', id, params], queryFn: () => fetchScalabilityMetrics(id, params), enabled: !!id });
}

export function useScalabilityConfiguration(id: string) {
  const qc = useQueryClient();
  const configuration = useQuery({ queryKey: ['scalability','configuration', id], queryFn: () => fetchScalabilityConfiguration(id), enabled: !!id });
  const update = useMutation({ mutationFn: (payload: any) => updateScalabilityConfiguration(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['scalability','configuration', id] }) });
  return { configuration, update };
}

// Missing hooks referenced by components
export function useScalabilityMonitoring(id: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['scalability', 'monitoring', id, params], 
    queryFn: () => fetchScalabilityMetrics(id, { ...params, type: 'monitoring' }),
    enabled: !!id,
    refetchInterval: 30000
  });
}

export function useScalabilityPolicies(params?: Record<string, any>) {
  const qc = useQueryClient();
  const policies = useQuery({ 
    queryKey: ['scalability', 'policies', params], 
    queryFn: () => fetchScalabilityManagers(), // Will be filtered by backend
  });
  
  const updatePolicy = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => updateScalabilityManager(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scalability', 'policies'] }),
  });
  
  return { policies, updatePolicy };
}

export function useScalabilityPlans(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['scalability', 'plans', params], 
    queryFn: () => fetchScalabilityManagers()
  });
}

export function useScalabilityTargets(id: string) {
  return useQuery({ 
    queryKey: ['scalability', 'targets', id], 
    queryFn: () => fetchScalabilityMetrics(id, { type: 'targets' }),
    enabled: !!id
  });
}

export function useScalabilityTests(id: string) {
  const qc = useQueryClient();
  const tests = useQuery({ 
    queryKey: ['scalability', 'tests', id], 
    queryFn: () => fetchScalabilityMetrics(id, { type: 'tests' }),
    enabled: !!id
  });
  
  const runTest = useMutation({
    mutationFn: (testConfig: any) => updateScalabilityManager(id, { testConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scalability', 'tests', id] }),
  });
  
  return { tests, runTest };
}

export function useScalabilityBenchmarks(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['scalability', 'benchmarks', params], 
    queryFn: () => fetchScalabilityManagers()
  });
}

export function useScalabilityPredictions(id: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['scalability', 'predictions', id, params], 
    queryFn: () => fetchScalabilityMetrics(id, { ...params, type: 'predictions' }),
    enabled: !!id
  });
}

export function useScalabilityRecommendations(id: string) {
  return useQuery({ 
    queryKey: ['scalability', 'recommendations', id], 
    queryFn: () => fetchScalabilityMetrics(id, { type: 'recommendations' }),
    enabled: !!id
  });
}

export function useScalabilityAutoscaling(id: string) {
  const qc = useQueryClient();
  const autoscaling = useQuery({ 
    queryKey: ['scalability', 'autoscaling', id], 
    queryFn: () => fetchScalabilityConfiguration(id),
    enabled: !!id
  });
  
  const updateAutoscaling = useMutation({
    mutationFn: (config: any) => updateScalabilityConfiguration(id, { autoscaling: config }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scalability', 'autoscaling', id] }),
  });
  
  return { autoscaling, updateAutoscaling };
}

export function useScalabilityAudit(id: string) {
  return useQuery({ 
    queryKey: ['scalability', 'audit', id], 
    queryFn: () => fetchScalabilityMetrics(id, { type: 'audit' }),
    enabled: !!id
  });
}



