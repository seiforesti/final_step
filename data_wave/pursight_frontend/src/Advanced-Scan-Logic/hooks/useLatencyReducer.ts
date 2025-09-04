import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLatencyReducers,
  fetchLatencyReducer,
  createLatencyReducer,
  updateLatencyReducer,
  deleteLatencyReducer,
  fetchLatencyMetrics,
  fetchLatencyConfiguration,
  updateLatencyConfiguration,
} from '../services/latency-reducer-apis';

export function useLatencyReducer(id?: string) {
  const qc = useQueryClient();
  const reducerQuery = useQuery({
    queryKey: ['latency','reducer', id],
    queryFn: () => id ? fetchLatencyReducer(id) : fetchLatencyReducers(),
    enabled: !!id,
  });
  const create = useMutation({ mutationFn: createLatencyReducer, onSuccess: () => qc.invalidateQueries({ queryKey: ['latency'] }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string, payload: any }) => updateLatencyReducer(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['latency','reducer', id] }) });
  const remove = useMutation({ mutationFn: (id: string) => deleteLatencyReducer(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['latency'] }) });
  return { reducerQuery, create, update, remove };
}

export function useLatencyMetrics(params?: Record<string, any>) {
  return useQuery({ queryKey: ['latency','metrics', params], queryFn: () => fetchLatencyMetrics(params) });
}

export function useLatencyConfiguration(id: string) {
  const qc = useQueryClient();
  const configuration = useQuery({ queryKey: ['latency','configuration', id], queryFn: () => fetchLatencyConfiguration(id), enabled: !!id });
  const update = useMutation({ mutationFn: (payload: any) => updateLatencyConfiguration(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['latency','configuration', id] }) });
  return { configuration, update };
}

// Missing hooks referenced by components
export function useLatencyMonitoring(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['latency', 'monitoring', params], 
    queryFn: () => fetchLatencyMetrics(params),
    refetchInterval: 30000 // Real-time monitoring
  });
}

export function useLatencyAnalysis(analysisParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['latency', 'analysis', analysisParams], 
    queryFn: () => fetchLatencyMetrics(analysisParams) 
  });
}

export function useLatencyOptimization(optimizationParams?: Record<string, any>) {
  const qc = useQueryClient();
  const optimization = useQuery({ 
    queryKey: ['latency', 'optimization', optimizationParams], 
    queryFn: () => fetchLatencyMetrics(optimizationParams) 
  });
  
  const optimize = useMutation({
    mutationFn: (payload: any) => updateLatencyConfiguration('optimization', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['latency', 'optimization'] }),
  });
  
  return { optimization, optimize };
}

export function useLatencyTargets(targetParams?: Record<string, any>) {
  const qc = useQueryClient();
  const targets = useQuery({ 
    queryKey: ['latency', 'targets', targetParams], 
    queryFn: () => fetchLatencyMetrics(targetParams) 
  });
  
  const updateTargets = useMutation({
    mutationFn: (payload: any) => updateLatencyConfiguration('targets', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['latency', 'targets'] }),
  });
  
  return { targets, updateTargets };
}

export function useLatencyBenchmarks(benchmarkParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['latency', 'benchmarks', benchmarkParams], 
    queryFn: () => fetchLatencyMetrics(benchmarkParams) 
  });
}

export function useLatencyTests(testParams?: Record<string, any>) {
  const qc = useQueryClient();
  const tests = useQuery({ 
    queryKey: ['latency', 'tests', testParams], 
    queryFn: () => fetchLatencyMetrics(testParams) 
  });
  
  const runTest = useMutation({
    mutationFn: (testConfig: any) => createLatencyReducer(testConfig),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['latency', 'tests'] }),
  });
  
  return { tests, runTest };
}

export function useLatencyPredictions(predictionParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['latency', 'predictions', predictionParams], 
    queryFn: () => fetchLatencyMetrics(predictionParams) 
  });
}

export function useLatencyRecommendations(recommendationParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['latency', 'recommendations', recommendationParams], 
    queryFn: () => fetchLatencyMetrics(recommendationParams) 
  });
}

export function useLatencyAudit(auditParams?: Record<string, any>) {
  const qc = useQueryClient();
  const audit = useQuery({ 
    queryKey: ['latency', 'audit', auditParams], 
    queryFn: () => fetchLatencyMetrics(auditParams) 
  });
  
  const runAudit = useMutation({
    mutationFn: (auditConfig: any) => createLatencyReducer(auditConfig),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['latency', 'audit'] }),
  });
  
  return { audit, runAudit };
}



