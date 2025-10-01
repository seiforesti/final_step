/**
 * useManualClassification
 * Advanced orchestration hook for Manual (policy/rule-based) classification tier
 */

import { useMemo, useCallback } from 'react'
import {
  useClassificationFrameworksQuery,
  useClassificationFrameworkQuery,
  useClassificationPoliciesQuery,
  useClassificationRulesQuery,
  useClassificationDictionariesQuery,
  useClassificationResultsQuery,
  useClassificationMetricsQuery,
  useCreateClassificationFrameworkMutation,
  useUpdateClassificationFrameworkMutation,
  useDeleteClassificationFrameworkMutation,
  useCreateClassificationRuleMutation,
  useUpdateClassificationRuleMutation,
  useDeleteClassificationRuleMutation,
  useCreateClassificationAssignmentMutation,
  useBulkApplyClassificationMutation,
} from '../services/classification-apis'
import {
  ClassificationScope,
  SensitivityLevel,
} from '../types/classification'

export interface UseManualClassificationOptions {
  frameworkId?: number
  dataSourceId?: number
  scope?: ClassificationScope
  sensitivity?: SensitivityLevel
}

export function useManualClassification(options: UseManualClassificationOptions = {}) {
  const { frameworkId, dataSourceId, scope, sensitivity } = options

  // Queries
  const frameworks = useClassificationFrameworksQuery({
    staleTime: 5 * 60 * 1000,
  })

  const framework = useClassificationFrameworkQuery(frameworkId || 0, {
    enabled: !!frameworkId,
    staleTime: 60 * 1000,
  })

  const policies = useClassificationPoliciesQuery(frameworkId, {
    enabled: !!frameworkId,
    staleTime: 60 * 1000,
  })

  const rules = useClassificationRulesQuery(frameworkId, scope, {
    enabled: !!frameworkId,
    staleTime: 60 * 1000,
  })

  const dictionaries = useClassificationDictionariesQuery({
    staleTime: 10 * 60 * 1000,
  })

  const results = useClassificationResultsQuery(
    {
      data_source_id: dataSourceId,
      sensitivity_level: sensitivity,
      limit: 50,
    },
    {
      enabled: !!dataSourceId,
      staleTime: 30 * 1000,
    }
  )

  const metrics = useClassificationMetricsQuery(
    { framework_id: frameworkId, data_source_id: dataSourceId, time_range: '24h' },
    { enabled: !!frameworkId, staleTime: 60 * 1000 }
  )

  // Mutations
  const createFramework = useCreateClassificationFrameworkMutation()
  const updateFramework = useUpdateClassificationFrameworkMutation()
  const deleteFramework = useDeleteClassificationFrameworkMutation()

  const createRule = useCreateClassificationRuleMutation()
  const updateRule = useUpdateClassificationRuleMutation()
  const deleteRule = useDeleteClassificationRuleMutation()

  const assignClassification = useCreateClassificationAssignmentMutation()
  const bulkApply = useBulkApplyClassificationMutation()

  // Helpers
  const selectedFrameworkId = useMemo(() => frameworkId || frameworks?.data?.find?.((f: any) => f.is_default)?.id, [frameworkId, frameworks?.data])

  const createAssignment = useCallback(
    async (params: {
      asset_type: string
      asset_id: string
      asset_name: string
      classification_id: number
      rule_id?: string
      confidence_score?: number
      justification?: string
    }) => {
      return assignClassification.mutateAsync({
        ...params,
        source: 'manual' as any,
      })
    },
    [assignClassification]
  )

  const applyBulk = useCallback(
    async (cfg: { force_reclassify?: boolean; batch_size?: number; parallel_jobs?: number }) => {
      return bulkApply.mutateAsync({
        framework_id: selectedFrameworkId,
        data_source_ids: dataSourceId ? [dataSourceId] : undefined,
        force_reclassify: cfg?.force_reclassify,
        batch_size: cfg?.batch_size ?? 500,
        parallel_jobs: cfg?.parallel_jobs ?? 2,
      })
    },
    [bulkApply, selectedFrameworkId, dataSourceId]
  )

  return {
    // data
    frameworks,
    framework,
    policies,
    rules,
    dictionaries,
    results,
    metrics,
    // mutations
    createFramework,
    updateFramework,
    deleteFramework,
    createRule,
    updateRule,
    deleteRule,
    createAssignment,
    applyBulk,
  }
}


