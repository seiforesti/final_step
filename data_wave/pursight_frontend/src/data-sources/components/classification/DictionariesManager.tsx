import React, { useMemo } from 'react'
import { useManualClassification } from '../../hooks/useManualClassification'

interface DictionariesManagerProps {
  className?: string
}

export function DictionariesManager({ className }: DictionariesManagerProps) {
  const { dictionaries } = useManualClassification()
  const list = dictionaries?.data || []

  const title = useMemo(() => 'Classification Dictionaries', [])

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
        {list.map((d: any) => (
          <div key={d.id} className="px-3 py-2 rounded border border-zinc-700 bg-zinc-900">
            <div className="text-sm font-medium">{d.name}</div>
            <div className="text-xs text-zinc-400">{d.language} • entries {d.entry_count}</div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-xs text-zinc-500">No dictionaries found.</div>
        )}
      </div>
    </div>
  )
}

export default DictionariesManager


