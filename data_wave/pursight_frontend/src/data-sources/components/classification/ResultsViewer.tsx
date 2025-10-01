import React, { useMemo } from 'react'
import { useManualClassification } from '../../hooks/useManualClassification'

interface ResultsViewerProps {
  dataSourceId?: number
  className?: string
}

export function ResultsViewer({ dataSourceId, className }: ResultsViewerProps) {
  const { results } = useManualClassification({ dataSourceId })
  const list = results?.data?.results || []

  const title = useMemo(() => 'Classification Results', [])

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
        {list.map((r: any) => (
          <div key={r.id} className="px-3 py-2 rounded border border-zinc-700 bg-zinc-900">
            <div className="text-sm font-medium">{r.entity_name || r.entity_id}</div>
            <div className="text-xs text-zinc-400">{r.entity_type} • {r.sensitivity_level} • conf {Math.round((r.confidence_score || 0)*100)}%</div>
            {r.entity_path && (
              <div className="text-xs text-zinc-500 mt-1 truncate">{r.entity_path}</div>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-xs text-zinc-500">No results yet.</div>
        )}
      </div>
    </div>
  )
}

export default ResultsViewer


