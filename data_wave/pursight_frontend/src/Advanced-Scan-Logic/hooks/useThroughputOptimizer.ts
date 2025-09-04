import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ThroughputOptimizerAPIService,
} from '../services/throughput-optimizer-apis';

const api = new ThroughputOptimizerAPIService();

export function useThroughputOptimizer(id?: string) {
  const qc = useQueryClient();
  const optimizerQuery = useQuery({
    queryKey: ['throughput','optimizer', id],
    queryFn: () => id ? api.getOptimizer(id) : api.listOptimizers(),
    enabled: !!id,
  });
  const create = useMutation({ mutationFn: (payload: any) => api.createThroughputOptimizer(payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['throughput'] }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string, payload: any }) => api.updateThroughputOptimizer(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['throughput','optimizer', id] }) });
  const remove = useMutation({ mutationFn: (id: string) => api.deleteThroughputOptimizer(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['throughput'] }) });
  return { optimizerQuery, create, update, remove };
}

export function useThroughputMetrics(params?: Record<string, any>) {
  return useQuery({ queryKey: ['throughput','metrics', params], queryFn: () => api.getMetrics(params) });
}

export function useThroughputConfiguration(id: string) {
  const qc = useQueryClient();
  const configuration = useQuery({ queryKey: ['throughput','configuration', id], queryFn: () => api.getConfiguration(id), enabled: !!id });
  const update = useMutation({ mutationFn: (payload: any) => api.updateConfiguration(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['throughput','configuration', id] }) });
  return { configuration, update };
}

// Missing hooks referenced by components
export function useThroughputMonitoring(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['throughput', 'monitoring', params], 
    queryFn: () => api.getMetrics({ ...params, type: 'monitoring' }),
    refetchInterval: 30000
  });
}

export function useThroughputAnalysis(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['throughput', 'analysis', params], 
    queryFn: () => api.getMetrics({ ...params, type: 'analysis' })
  });
}

export function useThroughputPolicies(params?: Record<string, any>) {
  const qc = useQueryClient();
  const policies = useQuery({ 
    queryKey: ['throughput', 'policies', params], 
    queryFn: () => api.listOptimizers()
  });
  
  const updatePolicy = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => api.updateThroughputOptimizer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['throughput', 'policies'] }),
  });
  
  return { policies, updatePolicy };
}

export function useThroughputTargets(id: string) {
  return useQuery({ 
    queryKey: ['throughput', 'targets', id], 
    queryFn: () => api.getMetrics({ targetId: id, type: 'targets' }),
    enabled: !!id
  });
}

export function useThroughputBenchmarks(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['throughput', 'benchmarks', params], 
    queryFn: () => api.getMetrics({ ...params, type: 'benchmarks' })
  });
}

export function useThroughputTests(id: string) {
  const qc = useQueryClient();
  const tests = useQuery({ 
    queryKey: ['throughput', 'tests', id], 
    queryFn: () => api.getMetrics({ optimizerId: id, type: 'tests' }),
    enabled: !!id
  });
  
  const runTest = useMutation({
    mutationFn: (testConfig: any) => api.updateThroughputOptimizer(id, { testConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['throughput', 'tests', id] }),
  });
  
  return { tests, runTest };
}

export function useThroughputPredictions(id: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['throughput', 'predictions', id, params], 
    queryFn: () => api.getMetrics({ optimizerId: id, ...params, type: 'predictions' }),
    enabled: !!id
  });
}

export function useThroughputRecommendations(id: string) {
  return useQuery({ 
    queryKey: ['throughput', 'recommendations', id], 
    queryFn: () => api.getMetrics({ optimizerId: id, type: 'recommendations' }),
    enabled: !!id
  });
}

export function useThroughputScaling(id: string) {
  const qc = useQueryClient();
  const scaling = useQuery({ 
    queryKey: ['throughput', 'scaling', id], 
    queryFn: () => api.getConfiguration(id),
    enabled: !!id
  });
  
  const updateScaling = useMutation({
    mutationFn: (config: any) => api.updateConfiguration(id, { scaling: config }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['throughput', 'scaling', id] }),
  });
  
  return { scaling, updateScaling };
}

export function useThroughputAudit(id: string) {
  return useQuery({ 
    queryKey: ['throughput', 'audit', id], 
    queryFn: () => api.getMetrics({ optimizerId: id, type: 'audit' }),
    enabled: !!id
  });
}



