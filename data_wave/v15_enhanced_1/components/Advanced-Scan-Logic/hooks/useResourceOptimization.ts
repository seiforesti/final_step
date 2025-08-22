import { useQuery, useMutation } from '@tanstack/react-query';
import {
  analyzeResourceUsage,
  optimizeResourceAllocation,
  predictResourceDemand,
} from '../services/resource-optimization-apis';

export function useResourceOptimization(params?: Record<string, any>) {
  const usage = useQuery({ queryKey: ['resource','usage', params], queryFn: () => analyzeResourceUsage(params) });
  const optimize = useMutation({ mutationFn: optimizeResourceAllocation });
  const predict = useQuery({ queryKey: ['resource','demand', params], queryFn: () => predictResourceDemand(params) });
  return { usage, optimize, predict };
}

export const useResourceMonitoring = useResourceOptimization;
export const useResourceAllocation = () => useMutation({ mutationFn: optimizeResourceAllocation });



