import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLoadBalancers,
  fetchLoadBalancer,
  createLoadBalancer,
  updateLoadBalancer,
  deleteLoadBalancer,
  fetchLoadBalancerPools,
  fetchLoadBalancerNodes,
} from '../services/load-balancer-apis';

export function useLoadBalancer(id?: string) {
  const qc = useQueryClient();
  const balancerQuery = useQuery({
    queryKey: ['load-balancer','balancer', id],
    queryFn: () => id ? fetchLoadBalancer(id) : fetchLoadBalancers(),
    enabled: !!id,
  });
  const create = useMutation({ mutationFn: createLoadBalancer, onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer'] }) });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: string, payload: any }) => updateLoadBalancer(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer','balancer', id] }) });
  const remove = useMutation({ mutationFn: (id: string) => deleteLoadBalancer(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer'] }) });
  return { balancerQuery, create, update, remove };
}

export function useLoadBalancerPools(id: string) {
  return useQuery({ queryKey: ['load-balancer','pools', id], queryFn: () => fetchLoadBalancerPools(id), enabled: !!id });
}

export function useLoadBalancerNodes(id: string) {
  return useQuery({ queryKey: ['load-balancer','nodes', id], queryFn: () => fetchLoadBalancerNodes(id), enabled: !!id });
}



