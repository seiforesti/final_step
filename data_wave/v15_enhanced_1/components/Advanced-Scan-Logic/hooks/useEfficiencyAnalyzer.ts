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



