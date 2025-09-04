import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEfficiencyAnalyzers,
  fetchEfficiencyAnalyzer,
  createEfficiencyAnalyzer,
  updateEfficiencyAnalyzer,
  deleteEfficiencyAnalyzer,
  fetchEfficiencyMetrics,
  fetchEfficiencyConfiguration,
  updateEfficiencyConfiguration,
} from '../services/efficiency-analyzer-apis';

export function useEfficiencyAnalyzer(id?: string) {
  const qc = useQueryClient();
  const analyzerQuery = useQuery({
    queryKey: ['efficiency','analyzer', id],
    queryFn: () => id ? fetchEfficiencyAnalyzer(id) : fetchEfficiencyAnalyzers(),
    enabled: !!id,
  });

  const create = useMutation({
    mutationFn: createEfficiencyAnalyzer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => updateEfficiencyAnalyzer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency','analyzer', id] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEfficiencyAnalyzer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency'] }),
  });

  return { analyzerQuery, create, update, remove };
}

export function useEfficiencyMetrics(params?: Record<string, any>) {
  return useQuery({ queryKey: ['efficiency','metrics', params], queryFn: () => fetchEfficiencyMetrics(params) });
}

export function useEfficiencyConfiguration(id: string) {
  const qc = useQueryClient();
  const configuration = useQuery({ queryKey: ['efficiency','configuration', id], queryFn: () => fetchEfficiencyConfiguration(id), enabled: !!id });
  const update = useMutation({
    mutationFn: (payload: any) => updateEfficiencyConfiguration(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency','configuration', id] }),
  });
  return { configuration, update };
}

// Missing hooks referenced by components
export function useEfficiencyMonitoring(params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['efficiency', 'monitoring', params], 
    queryFn: () => fetchEfficiencyMetrics(params),
    refetchInterval: 30000 // Real-time monitoring
  });
}

export function useEfficiencyAnalysis(analysisParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['efficiency', 'analysis', analysisParams], 
    queryFn: () => fetchEfficiencyMetrics(analysisParams) 
  });
}

export function useEfficiencyTargets(targetParams?: Record<string, any>) {
  const qc = useQueryClient();
  const targets = useQuery({ 
    queryKey: ['efficiency', 'targets', targetParams], 
    queryFn: () => fetchEfficiencyMetrics(targetParams) 
  });
  
  const updateTargets = useMutation({
    mutationFn: (payload: any) => updateEfficiencyConfiguration('targets', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency', 'targets'] }),
  });
  
  return { targets, updateTargets };
}

export function useEfficiencyBenchmarks(benchmarkParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['efficiency', 'benchmarks', benchmarkParams], 
    queryFn: () => fetchEfficiencyMetrics(benchmarkParams) 
  });
}

export function useEfficiencyTests(testParams?: Record<string, any>) {
  const qc = useQueryClient();
  const tests = useQuery({ 
    queryKey: ['efficiency', 'tests', testParams], 
    queryFn: () => fetchEfficiencyMetrics(testParams) 
  });
  
  const runTest = useMutation({
    mutationFn: (testConfig: any) => createEfficiencyAnalyzer(testConfig),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency', 'tests'] }),
  });
  
  return { tests, runTest };
}

export function useEfficiencyOptimization(optimizationParams?: Record<string, any>) {
  const qc = useQueryClient();
  const optimization = useQuery({ 
    queryKey: ['efficiency', 'optimization', optimizationParams], 
    queryFn: () => fetchEfficiencyMetrics(optimizationParams) 
  });
  
  const optimize = useMutation({
    mutationFn: (payload: any) => updateEfficiencyConfiguration('optimization', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency', 'optimization'] }),
  });
  
  return { optimization, optimize };
}

export function useEfficiencyPredictions(predictionParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['efficiency', 'predictions', predictionParams], 
    queryFn: () => fetchEfficiencyMetrics(predictionParams) 
  });
}

export function useEfficiencyRecommendations(recommendationParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['efficiency', 'recommendations', recommendationParams], 
    queryFn: () => fetchEfficiencyMetrics(recommendationParams) 
  });
}

export function useEfficiencyAudit(auditParams?: Record<string, any>) {
  const qc = useQueryClient();
  const audit = useQuery({ 
    queryKey: ['efficiency', 'audit', auditParams], 
    queryFn: () => fetchEfficiencyMetrics(auditParams) 
  });
  
  const runAudit = useMutation({
    mutationFn: (auditConfig: any) => createEfficiencyAnalyzer(auditConfig),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['efficiency', 'audit'] }),
  });
  
  return { audit, runAudit };
}



