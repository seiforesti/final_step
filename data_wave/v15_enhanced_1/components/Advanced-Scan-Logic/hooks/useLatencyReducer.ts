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



