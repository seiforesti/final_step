import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startPerformanceMonitoring,
  stopPerformanceMonitoring,
  pausePerformanceMonitoring,
  resumePerformanceMonitoring,
  fetchPerformanceMetrics,
  fetchPerformanceAlerts,
} from '../services/performance-monitoring-apis';

export function usePerformanceMonitoring(targetId: string) {
  const qc = useQueryClient();
  const start = useMutation({ mutationFn: (payload?: any) => startPerformanceMonitoring(targetId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['performance','metrics', targetId] }) });
  const stop = useMutation({ mutationFn: () => stopPerformanceMonitoring(targetId), onSuccess: () => qc.invalidateQueries({ queryKey: ['performance','metrics', targetId] }) });
  const pause = useMutation({ mutationFn: () => pausePerformanceMonitoring(targetId) });
  const resume = useMutation({ mutationFn: () => resumePerformanceMonitoring(targetId) });
  return { start, stop, pause, resume };
}

export function usePerformanceMetrics(targetId: string, params?: Record<string, any>) {
  return useQuery({ queryKey: ['performance','metrics', targetId, params], queryFn: () => fetchPerformanceMetrics(targetId, params), enabled: !!targetId });
}

export function usePerformanceAlerts(targetId: string, params?: Record<string, any>) {
  return useQuery({ queryKey: ['performance','alerts', targetId, params], queryFn: () => fetchPerformanceAlerts(targetId, params), enabled: !!targetId });
}

// Missing hooks referenced by components
export function usePerformanceAnalysis(targetId: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['performance', 'analysis', targetId, params], 
    queryFn: () => fetchPerformanceMetrics(targetId, { ...params, analysisType: 'detailed' }),
    enabled: !!targetId 
  });
}

export function usePerformanceBenchmarks(targetId: string) {
  return useQuery({ 
    queryKey: ['performance', 'benchmarks', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'benchmarks' }),
    enabled: !!targetId 
  });
}

export function usePerformanceProfiles(targetId: string) {
  return useQuery({ 
    queryKey: ['performance', 'profiles', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'profiles' }),
    enabled: !!targetId 
  });
}

export function usePerformanceTests(targetId: string) {
  const qc = useQueryClient();
  const tests = useQuery({ 
    queryKey: ['performance', 'tests', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'tests' }),
    enabled: !!targetId 
  });
  
  const runTest = useMutation({
    mutationFn: (testConfig: any) => startPerformanceMonitoring(targetId, { testConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performance', 'tests', targetId] }),
  });
  
  return { tests, runTest };
}

export function usePerformanceOptimization(targetId: string) {
  const qc = useQueryClient();
  const optimizations = useQuery({ 
    queryKey: ['performance', 'optimizations', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'optimizations' }),
    enabled: !!targetId 
  });
  
  const applyOptimization = useMutation({
    mutationFn: (optimizationConfig: any) => startPerformanceMonitoring(targetId, { optimizationConfig }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performance', 'optimizations', targetId] }),
  });
  
  return { optimizations, applyOptimization };
}

export function usePerformanceConfiguration(targetId: string) {
  const qc = useQueryClient();
  const configuration = useQuery({ 
    queryKey: ['performance', 'configuration', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'configuration' }),
    enabled: !!targetId 
  });
  
  const updateConfiguration = useMutation({
    mutationFn: (config: any) => startPerformanceMonitoring(targetId, { configuration: config }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performance', 'configuration', targetId] }),
  });
  
  return { configuration, updateConfiguration };
}

export function usePerformanceAudit(targetId: string) {
  return useQuery({ 
    queryKey: ['performance', 'audit', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'audit' }),
    enabled: !!targetId 
  });
}

export function usePerformanceInsights(targetId: string) {
  return useQuery({ 
    queryKey: ['performance', 'insights', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'insights' }),
    enabled: !!targetId 
  });
}

export function usePerformancePredictions(targetId: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['performance', 'predictions', targetId, params], 
    queryFn: () => fetchPerformanceMetrics(targetId, { ...params, type: 'predictions' }),
    enabled: !!targetId 
  });
}

export function usePerformanceAnomalies(targetId: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['performance', 'anomalies', targetId, params], 
    queryFn: () => fetchPerformanceAlerts(targetId, { ...params, type: 'anomalies' }),
    enabled: !!targetId,
    refetchInterval: 30000 // Real-time anomaly detection
  });
}

export function usePerformanceBaselines(targetId: string) {
  return useQuery({ 
    queryKey: ['performance', 'baselines', targetId], 
    queryFn: () => fetchPerformanceMetrics(targetId, { type: 'baselines' }),
    enabled: !!targetId 
  });
}

export function usePerformanceReports(targetId: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['performance', 'reports', targetId, params], 
    queryFn: () => fetchPerformanceMetrics(targetId, { ...params, type: 'reports' }),
    enabled: !!targetId 
  });
}



