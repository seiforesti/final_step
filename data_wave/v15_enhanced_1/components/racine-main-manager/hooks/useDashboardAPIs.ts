// hooks/useDashboardAPIs.ts
'use client'

import { useQuery } from '@tanstack/react-query'

export function useDashboardAPIs() {
	const getMetrics = (scope: string) => useQuery({
		queryKey: ['dashboard-metrics', scope],
		queryFn: async () => ({ scope, ts: Date.now() }),
		staleTime: 15_000
	})

	return { getMetrics }
}
