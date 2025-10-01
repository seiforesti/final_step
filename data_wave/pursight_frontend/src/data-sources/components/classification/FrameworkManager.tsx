import React, { useMemo } from 'react'
import { useManualClassification } from '../../hooks/useManualClassification'

interface FrameworkManagerProps {
  frameworkId?: number
  onSelect?: (id: number) => void
  className?: string
}

export function FrameworkManager({ frameworkId, onSelect, className }: FrameworkManagerProps) {
  const { frameworks, framework } = useManualClassification({ frameworkId })

  const list = frameworks?.data || []
  const current = frameworkId ? framework?.data : undefined

  const title = useMemo(() => 'Classification Frameworks', [])

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
        {list.map((fw: any) => (
          <button
            key={fw.id}
            className={`text-left px-3 py-2 rounded border ${fw.id === frameworkId ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 bg-zinc-900'}`}
            onClick={() => onSelect?.(fw.id)}
          >
            <div className="text-sm font-medium">{fw.name}</div>
            <div className="text-xs text-zinc-400">v{fw.version} • {fw.is_active ? 'Active' : 'Inactive'}</div>
          </button>
        ))}
        {list.length === 0 && (
          <div className="text-xs text-zinc-500">No frameworks available.</div>
        )}
      </div>

      {current && (
        <div className="mt-4 text-xs text-zinc-400">
          <div>Selected: <span className="text-zinc-200">{current.name}</span></div>
          <div>Version: {current.version}</div>
          <div>Applies: {current.applies_to_columns ? 'Columns' : ''} {current.applies_to_tables ? 'Tables' : ''}</div>
        </div>
      )}
    </div>
  )
}

export default FrameworkManager


