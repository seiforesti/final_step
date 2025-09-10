"use client"

export interface SchemaNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  children?: SchemaNode[]
  metadata?: any
  selected?: boolean
  expanded?: boolean
  parentPath?: string
}

export interface FilterOptions {
  showTables: boolean
  showViews: boolean
  showColumns: boolean
  qualityThreshold: number
  hasData: boolean
  hasPII: boolean
  businessCritical: boolean
}

export interface SortOptions {
  by: 'name' | 'size' | 'quality' | 'usage'
  direction: 'asc' | 'desc'
}

/**
 * Filter schema nodes based on various criteria
 */
export function filterSchemaNodes(
  nodes: SchemaNode[],
  searchTerm: string,
  filters: FilterOptions
): SchemaNode[] {
  return nodes.filter(node => {
    // Text search
    if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Type filters
    if (!filters.showTables && node.type === 'table') return false
    if (!filters.showViews && node.type === 'view') return false
    if (!filters.showColumns && node.type === 'column') return false

    // Quality filter
    if (filters.qualityThreshold > 0 && node.metadata?.qualityScore) {
      if (node.metadata.qualityScore < filters.qualityThreshold) return false
    }

    // Data filters
    if (filters.hasData && node.metadata?.rowCount === 0) return false
    if (filters.hasPII && !node.metadata?.piiDetected) return false
    if (filters.businessCritical && node.metadata?.businessValue < 80) return false

    return true
  }).map(node => ({
    ...node,
    children: node.children ? filterSchemaNodes(node.children, searchTerm, filters) : undefined
  }))
}

/**
 * Sort schema nodes based on specified criteria
 */
export function sortSchemaNodes(nodes: SchemaNode[], options: SortOptions): SchemaNode[] {
  return [...nodes].sort((a, b) => {
    let comparison = 0

    switch (options.by) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        const aSize = a.metadata?.rowCount || a.metadata?.estimatedSize || 0
        const bSize = b.metadata?.rowCount || b.metadata?.estimatedSize || 0
        comparison = aSize - bSize
        break
      case 'quality':
        const aQuality = a.metadata?.qualityScore || 0
        const bQuality = b.metadata?.qualityScore || 0
        comparison = aQuality - bQuality
        break
      case 'usage':
        const aUsage = a.metadata?.usageFrequency || 0
        const bUsage = b.metadata?.usageFrequency || 0
        comparison = aUsage - bUsage
        break
    }

    return options.direction === 'desc' ? -comparison : comparison
  }).map(node => ({
    ...node,
    children: node.children ? sortSchemaNodes(node.children, options) : undefined
  }))
}

/**
 * Get schema statistics from nodes
 */
export function getSchemaStatistics(nodes: SchemaNode[]) {
  let totalTables = 0
  let totalViews = 0
  let totalColumns = 0
  let totalRows = 0
  let qualityScores: number[] = []
  let businessValues: number[] = []
  let piiColumns = 0

  function traverse(nodeList: SchemaNode[]) {
    for (const node of nodeList) {
      switch (node.type) {
        case 'table':
          totalTables++
          if (node.metadata?.rowCount) totalRows += node.metadata.rowCount
          break
        case 'view':
          totalViews++
          break
        case 'column':
          totalColumns++
          if (node.metadata?.piiDetected) piiColumns++
          break
      }

      if (node.metadata?.qualityScore) qualityScores.push(node.metadata.qualityScore)
      if (node.metadata?.businessValue) businessValues.push(node.metadata.businessValue)

      if (node.children) traverse(node.children)
    }
  }

  traverse(nodes)

  return {
    totalTables,
    totalViews,
    totalColumns,
    totalRows,
    piiColumns,
    averageQuality: qualityScores.length ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length : 0,
    averageBusinessValue: businessValues.length ? businessValues.reduce((a, b) => a + b, 0) / businessValues.length : 0
  }
}

/**
 * Generate selection manifest for API consumption
 */
export function generateSelectionManifest(selectedNodes: Set<string>, allNodes: SchemaNode[]) {
  const manifest: any = { databases: [] }
  const dbMap: Record<string, any> = {}

  function findNodeById(nodes: SchemaNode[], id: string): SchemaNode | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  for (const nodeId of selectedNodes) {
    const node = findNodeById(allNodes, nodeId)
    if (!node) continue

    const dbName = extractDatabaseName(node)
    const schemaName = extractSchemaName(node)
    const tableName = extractTableName(node)
    const columnName = extractColumnName(node)

    if (!dbMap[dbName]) {
      dbMap[dbName] = { name: dbName, schemas: [], _schemaMap: {} }
      manifest.databases.push(dbMap[dbName])
    }

    const dbNode = dbMap[dbName]
    
    if (schemaName && !dbNode._schemaMap[schemaName]) {
      dbNode._schemaMap[schemaName] = { name: schemaName, tables: [], _tableMap: {} }
      dbNode.schemas.push(dbNode._schemaMap[schemaName])
    }

    if (tableName && schemaName) {
      const schemaNode = dbNode._schemaMap[schemaName]
      if (!schemaNode._tableMap[tableName]) {
        schemaNode._tableMap[tableName] = { name: tableName, columns: [] }
        schemaNode.tables.push(schemaNode._tableMap[tableName])
      }

      if (columnName) {
        const tableNode = schemaNode._tableMap[tableName]
        if (!tableNode.columns.includes(columnName)) {
          tableNode.columns.push(columnName)
        }
      }
    }
  }

  // Clean up helper maps
  for (const dbNode of manifest.databases) {
    delete dbNode._schemaMap
    for (const schemaNode of dbNode.schemas) {
      delete schemaNode._tableMap
    }
  }

  return manifest
}

/**
 * Extract database name from node or metadata
 */
function extractDatabaseName(node: SchemaNode): string {
  if (node.type === 'database') return node.name
  return node.metadata?.databaseName || 'default'
}

/**
 * Extract schema name from node or metadata
 */
function extractSchemaName(node: SchemaNode): string | null {
  if (node.type === 'schema') return node.name
  return node.metadata?.schemaName || null
}

/**
 * Extract table name from node or metadata
 */
function extractTableName(node: SchemaNode): string | null {
  if (node.type === 'table' || node.type === 'view') return node.name
  return node.metadata?.tableName || node.metadata?.viewName || null
}

/**
 * Extract column name from node or metadata
 */
function extractColumnName(node: SchemaNode): string | null {
  if (node.type === 'column') return node.name
  return null
}

/**
 * Calculate quality score for a node based on its metadata
 */
export function calculateQualityScore(node: SchemaNode): number {
  if (!node.metadata) return 0

  let score = 100
  
  // Deduct points for various quality issues
  if (node.metadata.nullable && node.type === 'column') score -= 5
  if (!node.metadata.description) score -= 10
  if (node.metadata.rowCount === 0) score -= 20
  if (node.metadata.piiDetected && !node.metadata.isEncrypted) score -= 15
  
  // Add points for good practices
  if (node.metadata.primaryKey) score += 5
  if (node.metadata.isIndexed) score += 5
  if (node.metadata.owner) score += 5

  return Math.max(0, Math.min(100, score))
}

/**
 * Generate AI insights for schema nodes
 */
export function generateSchemaInsights(nodes: SchemaNode[]) {
  const stats = getSchemaStatistics(nodes)
  const insights = []

  // Quality insights
  if (stats.averageQuality > 90) {
    insights.push({
      type: 'quality',
      title: 'Excellent Data Quality',
      description: `Average quality score of ${Math.round(stats.averageQuality)}% indicates well-maintained data`,
      severity: 'positive'
    })
  } else if (stats.averageQuality < 70) {
    insights.push({
      type: 'quality',
      title: 'Quality Improvement Needed',
      description: `Average quality score of ${Math.round(stats.averageQuality)}% suggests data quality issues`,
      severity: 'warning'
    })
  }

  // PII insights
  if (stats.piiColumns > 0) {
    insights.push({
      type: 'compliance',
      title: 'PII Data Detected',
      description: `Found ${stats.piiColumns} columns containing personally identifiable information`,
      severity: 'warning'
    })
  }

  // Size insights
  if (stats.totalRows > 1000000) {
    insights.push({
      type: 'performance',
      title: 'Large Dataset Detected',
      description: `Dataset contains ${stats.totalRows.toLocaleString()} rows - consider partitioning`,
      severity: 'info'
    })
  }

  return insights
}