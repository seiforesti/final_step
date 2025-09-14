/**
 * Enhanced Tree View Component with Multiple View Modes
 * Provides tree, graph, and list views for schema discovery
 */

import React, { useState, useMemo, useCallback } from 'react'
import { 
  Database, Table, Columns, FileText, Folder, FolderOpen, 
  ChevronRight, ChevronDown, Eye, Search, Zap, Star, Shield,
  Network, List, TreePine, Grid3X3, Layers, Target, Activity, Brain,
  Maximize2, Minimize2, RotateCcw, GitBranch
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AdvancedGraphView } from "./Entreprise-graph-view"
import { VirtualizedTree } from "../utils/virtualized-tree"
import OptimizedTreeNode from "./optimized-tree-node"

interface EnhancedTreeNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  level: number
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  isVisible: boolean
  metadata?: any
  children?: EnhancedTreeNode[]
}

interface EnhancedTreeViewProps {
  nodes: EnhancedTreeNode[]
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string, checked: boolean) => void
  onPreview: (node: EnhancedTreeNode) => void
  height?: number
  showViewModeToggle?: boolean
  defaultViewMode?: 'tree' | 'graph' | 'list' | 'grid'
}

export function EnhancedTreeView({
  nodes,
  onToggle,
  onSelect,
  onPreview,
  height = 600,
  showViewModeToggle = true,
  defaultViewMode = 'tree'
}: EnhancedTreeViewProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'graph' | 'list' | 'grid'>(defaultViewMode)
  const [graphViewMode, setGraphViewMode] = useState<'centralized' | 'hierarchical' | 'network'>('centralized')
  const [showConnections, setShowConnections] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedAll, setExpandedAll] = useState(false)

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes

    const filterNodes = (nodeList: EnhancedTreeNode[]): EnhancedTreeNode[] => {
      return nodeList.filter(node => {
        const matches = node.name.toLowerCase().includes(searchTerm.toLowerCase())
        const hasMatchingChildren = node.children ? 
          filterNodes(node.children).length > 0 : false
        
        if (matches || hasMatchingChildren) {
          return {
            ...node,
            children: node.children ? filterNodes(node.children) : undefined
          }
        }
        return false
      }).filter(Boolean) as EnhancedTreeNode[]
    }

    return filterNodes(nodes)
  }, [nodes, searchTerm])

  // Convert to virtualized format
  const virtualizedNodes = useMemo(() => {
    const convertToVirtualizedFormat = (nodeList: EnhancedTreeNode[], level = 0): any[] => {
      return nodeList.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        level,
        hasChildren: Boolean(node.children && node.children.length > 0),
        isExpanded: node.isExpanded,
        isSelected: node.isSelected,
        isVisible: true,
        metadata: node.metadata,
        children: node.children ? convertToVirtualizedFormat(node.children, level + 1) : undefined
      }))
    }
    return convertToVirtualizedFormat(filteredNodes)
  }, [filteredNodes])

  // Recursive tree renderer
  const renderTreeNodes = useCallback((nodeList: EnhancedTreeNode[], level = 0) => {
    return nodeList.map(node => (
      <div key={node.id} className="space-y-1">
        <div style={{ paddingLeft: `${level * 20}px` }}>
          <OptimizedTreeNode
            node={node}
            level={level}
            hasChildren={node.hasChildren}
            isExpanded={node.isExpanded}
            selectionState={node.isSelected ? 'checked' : 'unchecked'}
            onToggle={onToggle}
            onSelect={onSelect}
            onPreview={onPreview}
          />
        </div>
        {node.isExpanded && node.children && node.children.length > 0 && (
          <div className="space-y-1">
            {renderTreeNodes(node.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }, [onToggle, onSelect, onPreview])

  // Tree node renderer for virtualization
  const renderTreeNode = useCallback((node: EnhancedTreeNode, style?: any) => {
    return (
      <div style={style}>
        <OptimizedTreeNode
          node={node}
          level={node.level}
          hasChildren={node.hasChildren}
          isExpanded={node.isExpanded}
          selectionState={node.isSelected ? 'checked' : 'unchecked'}
          onToggle={onToggle}
          onSelect={onSelect}
          onPreview={onPreview}
        />
      </div>
    )
  }, [onToggle, onSelect, onPreview])

  // Advanced table view renderer
  const renderListView = () => {
    const flattenNodes = (nodeList: EnhancedTreeNode[]): EnhancedTreeNode[] => {
      const result: EnhancedTreeNode[] = []
      const flatten = (nodes: EnhancedTreeNode[], level = 0) => {
        nodes.forEach(node => {
          result.push({ ...node, level })
          if (node.children) {
            flatten(node.children, level + 1)
          }
        })
      }
      flatten(nodeList)
      return result
    }

    const flatNodes = flattenNodes(nodes)

    return (
      <div className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 border-b font-semibold text-sm">
                  <input
                    type="checkbox"
                    checked={flatNodes.every(node => node.isSelected)}
                    onChange={(e) => {
                      flatNodes.forEach(node => onSelect(node.id, e.target.checked))
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-3 border-b font-semibold text-sm">Name</th>
                <th className="text-left p-3 border-b font-semibold text-sm">Type</th>
                <th className="text-left p-3 border-b font-semibold text-sm">Level</th>
                <th className="text-left p-3 border-b font-semibold text-sm">Metadata</th>
                <th className="text-left p-3 border-b font-semibold text-sm">Status</th>
                <th className="text-left p-3 border-b font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flatNodes.map((node, index) => (
                <tr
                  key={node.id}
                  className={`
                    transition-all duration-200 hover:bg-muted/30
                    ${node.isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''}
                    ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                  `}
                >
                  <td className="p-3 border-b">
                    <input
                      type="checkbox"
                      checked={node.isSelected}
                      onChange={(e) => onSelect(node.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex items-center gap-3">
                      <div style={{ width: `${node.level * 20}px` }} />
                      <div className="flex items-center gap-2">
                        {node.type === 'database' && <Database className="h-4 w-4 text-blue-500" />}
                        {node.type === 'schema' && <Folder className="h-4 w-4 text-orange-500" />}
                        {node.type === 'table' && <Table className="h-4 w-4 text-green-500" />}
                        {node.type === 'view' && <FileText className="h-4 w-4 text-purple-500" />}
                        {node.type === 'column' && <Columns className="h-4 w-4 text-gray-500" />}
                        <span className="font-medium">{node.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    <Badge 
                      variant="outline" 
                      className={`
                        text-xs capitalize
                        ${node.type === 'database' ? 'border-blue-200 text-blue-700' : ''}
                        ${node.type === 'schema' ? 'border-orange-200 text-orange-700' : ''}
                        ${node.type === 'table' ? 'border-green-200 text-green-700' : ''}
                        ${node.type === 'view' ? 'border-purple-200 text-purple-700' : ''}
                        ${node.type === 'column' ? 'border-gray-200 text-gray-700' : ''}
                      `}
                    >
                      {node.type}
                    </Badge>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Level {node.level}</span>
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="text-sm text-muted-foreground">
                      {node.metadata?.rowCount && (
                        <div>{node.metadata.rowCount.toLocaleString()} rows</div>
                      )}
                      {node.metadata?.dataType && (
                        <div>{node.metadata.dataType}</div>
                      )}
                      {node.metadata?.description && (
                        <div className="truncate max-w-xs" title={node.metadata.description}>
                          {node.metadata.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex items-center gap-2">
                      {node.isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                      {node.hasChildren && (
                        <Badge variant="outline" className="text-xs">
                          <GitBranch className="h-3 w-3 mr-1" />
                          Has Children
                        </Badge>
                      )}
                      {node.isExpanded && (
                        <Badge variant="outline" className="text-xs">
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Expanded
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPreview(node)}
                        className="h-8 w-8 p-0"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {node.hasChildren && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggle(node.id)}
                          className="h-8 w-8 p-0"
                          title={node.isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {node.isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Advanced grid view renderer (Cursor-style cards)
  const renderGridView = () => {
    const flattenNodes = (nodeList: EnhancedTreeNode[]): EnhancedTreeNode[] => {
      const result: EnhancedTreeNode[] = []
      const flatten = (nodes: EnhancedTreeNode[]) => {
        nodes.forEach(node => {
          result.push(node)
          if (node.children) {
            flatten(node.children)
          }
        })
      }
      flatten(nodeList)
      return result
    }

    const flatNodes = flattenNodes(nodes)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {flatNodes.map(node => (
          <div
            key={node.id}
            className={`
              group relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
              ${node.isSelected 
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-lg dark:from-blue-950/30 dark:to-indigo-950/30' 
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
              }
            `}
            onClick={() => onSelect(node.id, !node.isSelected)}
          >
            {/* Selection Indicator */}
            {node.isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Star className="h-4 w-4 text-white" />
              </div>
            )}
            
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${node.type === 'database' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                  ${node.type === 'schema' ? 'bg-orange-100 dark:bg-orange-900/30' : ''}
                  ${node.type === 'table' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                  ${node.type === 'view' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                  ${node.type === 'column' ? 'bg-gray-100 dark:bg-gray-900/30' : ''}
                `}>
                  {node.type === 'database' && <Database className="h-5 w-5 text-blue-600" />}
                  {node.type === 'schema' && <Folder className="h-5 w-5 text-orange-600" />}
                  {node.type === 'table' && <Table className="h-5 w-5 text-green-600" />}
                  {node.type === 'view' && <FileText className="h-5 w-5 text-purple-600" />}
                  {node.type === 'column' && <Columns className="h-5 w-5 text-gray-600" />}
                </div>
                <div>
                  <Badge 
                    variant="outline" 
                    className={`
                      text-xs font-medium
                      ${node.type === 'database' ? 'border-blue-200 text-blue-700 bg-blue-50' : ''}
                      ${node.type === 'schema' ? 'border-orange-200 text-orange-700 bg-orange-50' : ''}
                      ${node.type === 'table' ? 'border-green-200 text-green-700 bg-green-50' : ''}
                      ${node.type === 'view' ? 'border-purple-200 text-purple-700 bg-purple-50' : ''}
                      ${node.type === 'column' ? 'border-gray-200 text-gray-700 bg-gray-50' : ''}
                    `}
                  >
                    {node.type}
                  </Badge>
                </div>
              </div>
              <input
                type="checkbox"
                checked={node.isSelected}
                onChange={(e) => {
                  e.stopPropagation()
                  onSelect(node.id, e.target.checked)
                }}
                className="rounded w-4 h-4"
              />
            </div>
            
            {/* Card Content */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm truncate group-hover:text-blue-600 transition-colors">
                {node.name}
              </h4>
              
              {node.metadata?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {node.metadata.description}
                </p>
              )}
              
              {/* Metadata Stats */}
              <div className="space-y-1">
                {node.metadata?.rowCount && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{node.metadata.rowCount.toLocaleString()} rows</span>
                  </div>
                )}
                {node.metadata?.dataType && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{node.metadata.dataType}</span>
                  </div>
                )}
                {node.hasChildren && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Has {node.children?.length || 0} children</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Card Actions */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {node.hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggle(node.id)
                    }}
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {node.isExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview(node)
                }}
                className="h-7 px-3 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    )
  }

  // Expand/collapse all
  const handleExpandAll = () => {
    const allNodeIds = new Set<string>()
    const collectIds = (nodeList: EnhancedTreeNode[]) => {
      nodeList.forEach(node => {
        allNodeIds.add(node.id)
        if (node.children) {
          collectIds(node.children)
        }
      })
    }
    collectIds(filteredNodes)
    
    allNodeIds.forEach(id => onToggle(id))
    setExpandedAll(!expandedAll)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Controls */}
      {showViewModeToggle && (
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList>
                <TabsTrigger value="tree" className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Tree
                </TabsTrigger>
                <TabsTrigger value="graph" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Graph
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Graph-specific controls */}
            {viewMode === 'graph' && (
              <div className="flex items-center gap-2">
                <Tabs value={graphViewMode} onValueChange={(value) => setGraphViewMode(value as any)}>
                  <TabsList>
                    <TabsTrigger value="centralized">Centralized</TabsTrigger>
                    <TabsTrigger value="hierarchical">Hierarchical</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConnections(!showConnections)}
                >
                  {showConnections ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
              />
            </div>

            {/* Expand/Collapse All */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandAll}
              className="flex items-center gap-2"
            >
              {expandedAll ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {expandedAll ? 'Collapse All' : 'Expand All'}
            </Button>

            {/* Reset View */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setExpandedAll(false)
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'tree' && (
          <ScrollArea className="h-full">
            <div className="p-4">
              {filteredNodes.length > 500 ? (
                <VirtualizedTree
                  nodes={virtualizedNodes}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  renderNode={renderTreeNode}
                  height={height - 100}
                  itemHeight={40}
                  overscanCount={10}
                />
              ) : (
                <div className="space-y-1">
                  {renderTreeNodes(filteredNodes)}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {viewMode === 'graph' && (
          <AdvancedGraphView
            nodes={nodes}
            onToggle={onToggle}
            onSelect={onSelect}
            onPreview={onPreview}
            height={height - 100}
            layoutAlgorithm={graphViewMode === 'centralized' ? 'force-directed' : 'hierarchical'}
            showConnections={showConnections}
          />
        )}

        {viewMode === 'list' && (
          <ScrollArea className="h-full">
            <div className="p-4">
              {renderListView()}
            </div>
          </ScrollArea>
        )}

        {viewMode === 'grid' && (
          <ScrollArea className="h-full">
            <div className="p-4">
              {renderGridView()}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total: {nodes.length}</span>
            <span>Filtered: {filteredNodes.length}</span>
            <span>Selected: {nodes.filter(n => n.isSelected).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
            </Badge>
            {viewMode === 'graph' && (
              <Badge variant="outline" className="text-xs">
                {graphViewMode.charAt(0).toUpperCase() + graphViewMode.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
