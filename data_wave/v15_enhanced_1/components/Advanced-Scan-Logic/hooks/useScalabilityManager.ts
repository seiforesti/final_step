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



