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



