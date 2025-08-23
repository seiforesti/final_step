// hooks/useComplianceManagement.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchComplianceActivities, exportComplianceReport, ComplianceActivityFilter, ComplianceActivityItem } from '../services/compliance-activity-apis'

export function useComplianceManagement() {
	const qc = useQueryClient()

	const activitiesQuery = (filter: ComplianceActivityFilter = {}) => useQuery({
		queryKey: ['compliance-activities', filter],
		queryFn: () => fetchComplianceActivities(filter),
		staleTime: 30_000
	})

	const exportReportMutation = useMutation({
		mutationFn: (filter: ComplianceActivityFilter = {}) => exportComplianceReport(filter)
	})

	return {
		activitiesQuery,
		exportReportMutation,
		invalidate: () => qc.invalidateQueries({ queryKey: ['compliance-activities'] })
	}
}
