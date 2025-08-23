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

// Missing hooks referenced by components
export function useLoadBalancerRules(id: string) {
  const qc = useQueryClient();
  const rules = useQuery({ 
    queryKey: ['load-balancer', 'rules', id], 
    queryFn: () => fetchLoadBalancerPools(id), 
    enabled: !!id 
  });
  
  const updateRules = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'rules', id] }),
  });
  
  return { rules, updateRules };
}

export function useLoadBalancerPolicies(id: string) {
  const qc = useQueryClient();
  const policies = useQuery({ 
    queryKey: ['load-balancer', 'policies', id], 
    queryFn: () => fetchLoadBalancerPools(id), 
    enabled: !!id 
  });
  
  const updatePolicies = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'policies', id] }),
  });
  
  return { policies, updatePolicies };
}

export function useLoadBalancerHealthChecks(id: string) {
  return useQuery({ 
    queryKey: ['load-balancer', 'health-checks', id], 
    queryFn: () => fetchLoadBalancerNodes(id), 
    enabled: !!id,
    refetchInterval: 10000 // Health checks every 10 seconds
  });
}

export function useLoadBalancerMetrics(id: string, params?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['load-balancer', 'metrics', id, params], 
    queryFn: () => fetchLoadBalancerPools(id), 
    enabled: !!id,
    refetchInterval: 30000 // Metrics every 30 seconds
  });
}

export function useLoadBalancerConfiguration(id: string) {
  const qc = useQueryClient();
  const configuration = useQuery({ 
    queryKey: ['load-balancer', 'configuration', id], 
    queryFn: () => fetchLoadBalancer(id), 
    enabled: !!id 
  });
  
  const updateConfiguration = useMutation({
    mutationFn: (payload: any) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'configuration', id] }),
  });
  
  return { configuration, updateConfiguration };
}

export function useLoadBalancerMonitoring(id: string) {
  return useQuery({ 
    queryKey: ['load-balancer', 'monitoring', id], 
    queryFn: () => fetchLoadBalancerNodes(id), 
    enabled: !!id,
    refetchInterval: 5000 // Real-time monitoring every 5 seconds
  });
}

export function useLoadBalancerOptimization(id: string) {
  const qc = useQueryClient();
  const optimization = useQuery({ 
    queryKey: ['load-balancer', 'optimization', id], 
    queryFn: () => fetchLoadBalancerPools(id), 
    enabled: !!id 
  });
  
  const optimize = useMutation({
    mutationFn: (payload: any) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'optimization', id] }),
  });
  
  return { optimization, optimize };
}

export function useLoadBalancerAnalysis(id: string, analysisParams?: Record<string, any>) {
  return useQuery({ 
    queryKey: ['load-balancer', 'analysis', id, analysisParams], 
    queryFn: () => fetchLoadBalancerPools(id), 
    enabled: !!id 
  });
}

export function useLoadBalancerSecurity(id: string) {
  const qc = useQueryClient();
  const security = useQuery({ 
    queryKey: ['load-balancer', 'security', id], 
    queryFn: () => fetchLoadBalancer(id), 
    enabled: !!id 
  });
  
  const updateSecurity = useMutation({
    mutationFn: (payload: any) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'security', id] }),
  });
  
  return { security, updateSecurity };
}

export function useLoadBalancerSSL(id: string) {
  const qc = useQueryClient();
  const ssl = useQuery({ 
    queryKey: ['load-balancer', 'ssl', id], 
    queryFn: () => fetchLoadBalancer(id), 
    enabled: !!id 
  });
  
  const updateSSL = useMutation({
    mutationFn: (payload: any) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'ssl', id] }),
  });
  
  return { ssl, updateSSL };
}

export function useLoadBalancerScaling(id: string) {
  const qc = useQueryClient();
  const scaling = useQuery({ 
    queryKey: ['load-balancer', 'scaling', id], 
    queryFn: () => fetchLoadBalancerNodes(id), 
    enabled: !!id 
  });
  
  const scale = useMutation({
    mutationFn: (payload: any) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'scaling', id] }),
  });
  
  return { scaling, scale };
}

export function useLoadBalancerFailover(id: string) {
  const qc = useQueryClient();
  const failover = useQuery({ 
    queryKey: ['load-balancer', 'failover', id], 
    queryFn: () => fetchLoadBalancerNodes(id), 
    enabled: !!id 
  });
  
  const triggerFailover = useMutation({
    mutationFn: (payload: any) => updateLoadBalancer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'failover', id] }),
  });
  
  return { failover, triggerFailover };
}

export function useLoadBalancerAudit(id: string, auditParams?: Record<string, any>) {
  const qc = useQueryClient();
  const audit = useQuery({ 
    queryKey: ['load-balancer', 'audit', id, auditParams], 
    queryFn: () => fetchLoadBalancer(id), 
    enabled: !!id 
  });
  
  const runAudit = useMutation({
    mutationFn: (auditConfig: any) => createLoadBalancer(auditConfig),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['load-balancer', 'audit', id] }),
  });
  
  return { audit, runAudit };
}



