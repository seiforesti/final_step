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



