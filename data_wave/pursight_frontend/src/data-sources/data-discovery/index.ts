// Main components
export { DataDiscoveryWorkspace } from './data-discovery-workspace'
export { DataLineageGraph } from './data-lineage-graph'
export { SchemaDiscovery } from './schema-discovery'

// Hooks
export { useDataDiscovery } from './hooks/useDataDiscovery'
export { useSchemaAnalysis } from './hooks/useSchemaAnalysis'

// Utils
export * from './utils/schemaUtils'

// Components
export { QualityIndicator, QualityBreakdown } from './components/QualityIndicator'
export { InsightCard, InsightGrid } from './components/InsightCard'

// Types
export type { SchemaNode, FilterOptions, SortOptions } from './utils/schemaUtils'
export type { AIInsight, DataDiscoveryState } from './hooks/useDataDiscovery'
export type { SchemaAnalysisResult } from './hooks/useSchemaAnalysis'