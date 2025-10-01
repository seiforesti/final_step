import React, { useMemo } from 'react'
import { useManualClassification } from '../../hooks/useManualClassification'
import { ClassificationScope } from '../../types/classification'

interface RulesManagerProps {
  frameworkId?: number
  scope?: ClassificationScope
  className?: string
}

export function RulesManager({ frameworkId, scope, className }: RulesManagerProps) {
  const { rules } = useManualClassification({ frameworkId, scope })
  const list = rules?.data || []

  const title = useMemo(() => 'Classification Rules', [])

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
        {list.map((rule: any) => (
          <div key={rule.id} className="px-3 py-2 rounded border border-zinc-700 bg-zinc-900">
            <div className="text-sm font-medium">{rule.name}</div>
            <div className="text-xs text-zinc-400">{rule.rule_type} • priority {rule.priority} • {rule.is_active ? 'Active' : 'Inactive'}</div>
            <div className="text-xs text-zinc-500 mt-1 truncate">{rule.pattern}</div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-xs text-zinc-500">No rules found.</div>
        )}
      </div>
    </div>
  )
}

export default RulesManager


