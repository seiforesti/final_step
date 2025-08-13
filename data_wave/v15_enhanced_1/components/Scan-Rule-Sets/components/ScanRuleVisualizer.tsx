"use client"

import type React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronRight,
  ChevronDown,
  Database,
  Table,
  Columns,
  Folder,
  File,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react"
import { scanRuleSetApi } from "../services/api"
import type { ScanRuleVisualizerProps, TreeNode, PatternValidationResult } from "../types"

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  expanded: boolean
  onToggle: (nodeId: string) => void
  searchTerm: string
  showOnlyMatched: boolean
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  expanded,
  onToggle,
  searchTerm,
  showOnlyMatched,
}) => {
  const hasChildren = node.children && node.children.length > 0
  const isMatched = node.included || node.excluded
  const shouldShow =
    !showOnlyMatched || isMatched || (hasChildren && node.children?.some((child) => child.included || child.excluded))

  // Filter children based on search and match criteria
  const filteredChildren = useMemo(() => {
    if (!hasChildren) return []

    return node.children!.filter((child) => {
      const matchesSearch = !searchTerm || child.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        !showOnlyMatched ||
        child.included ||
        child.excluded ||
        (child.children && child.children.some((grandchild) => grandchild.included || grandchild.excluded))
      return matchesSearch && matchesFilter
    })
  }, [node.children, searchTerm, showOnlyMatched, hasChildren])

  if (!shouldShow) return null

  const getIcon = () => {
    switch (node.type) {
      case "database":
        return <Database className="h-4 w-4 text-blue-600" />
      case "schema":
        return <Layers className="h-4 w-4 text-purple-600" />
      case "table":
        return <Table className="h-4 w-4 text-green-600" />
      case "column":
        return <Columns className="h-4 w-4 text-orange-600" />
      case "folder":
        return <Folder className="h-4 w-4 text-yellow-600" />
      case "file":
        return <File className="h-4 w-4 text-gray-600" />
      default:
        return <File className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = () => {
    if (node.included) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
          <CheckCircle className="h-2 w-2 mr-1" />
          Included
        </Badge>
      )
    }
    if (node.excluded) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs">
          <XCircle className="h-2 w-2 mr-1" />
          Excluded
        </Badge>
      )
    }
    return null
  }

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg cursor-pointer ${
          isMatched ? (node.included ? "bg-green-50" : "bg-red-50") : ""
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <div className="w-4" />
        )}

        {getIcon()}

        <span className="flex-1 text-sm font-medium">{node.name}</span>

        {getStatusBadge()}

        {node.matched_by && (
          <Badge variant="outline" className="text-xs">
            {node.matched_by}
          </Badge>
        )}
      </div>

      {expanded && filteredChildren.length > 0 && (
        <div>
          {filteredChildren.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              searchTerm={searchTerm}
              showOnlyMatched={showOnlyMatched}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ScanRuleVisualizer: React.FC<ScanRuleVisualizerProps> = ({ ruleSetId, dataSourceId, height = 500 }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showOnlyMatched, setShowOnlyMatched] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [validationResult, setValidationResult] = useState<PatternValidationResult | null>(null)

  // Load rule set details
  const { data: ruleSet, isLoading: isLoadingRuleSet } = useQuery({
    queryKey: ["scanRuleSet", ruleSetId],
    queryFn: () => scanRuleSetApi.getById(ruleSetId),
    enabled: !!ruleSetId,
  })

  // Validate patterns and build tree
  const validateAndBuildTree = useCallback(async () => {
    if (!ruleSet || !dataSourceId) return

    try {
      const result = await scanRuleSetApi.validatePatterns({
        data_source_id: dataSourceId,
        include_patterns: ruleSet.include_patterns,
        exclude_patterns: ruleSet.exclude_patterns,
        scan_level: ruleSet.scan_settings.scan_level,
      })

      setValidationResult(result)

      // Auto-expand first level
      const firstLevelNodes = new Set<string>()
      result.matched_entities.forEach((entity) => {
        const parts = entity.split("/")
        if (parts.length > 0) {
          firstLevelNodes.add(parts[0])
        }
      })
      setExpandedNodes(firstLevelNodes)
    } catch (error) {
      console.error("Failed to validate patterns:", error)
    }
  }, [ruleSet, dataSourceId])

  // Auto-validate when rule set loads
  useEffect(() => {
    if (ruleSet && dataSourceId) {
      validateAndBuildTree()
    }
  }, [ruleSet, dataSourceId, validateAndBuildTree])

  // Build tree structure from validation result
  const treeData = useMemo(() => {
    if (!validationResult) return []

    const nodeMap = new Map<string, TreeNode>()

    // Create mock tree structure based on matched entities
    validationResult.matched_entities.forEach((entityPath, index) => {
      const parts = entityPath.split("/")
      let currentPath = ""

      parts.forEach((part, partIndex) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!nodeMap.has(currentPath)) {
          const nodeType =
            partIndex === 0 ? "database" : partIndex === 1 ? "schema" : partIndex === 2 ? "table" : "column"

          const node: TreeNode = {
            id: currentPath,
            name: part,
            type: nodeType,
            included: partIndex === parts.length - 1, // Only leaf nodes are marked as included
            excluded: false,
            level: partIndex,
            path: currentPath,
            children: [],
            matched_by: partIndex === parts.length - 1 ? "include pattern" : undefined,
          }

          nodeMap.set(currentPath, node)
        }
      })
    })

    // Build parent-child relationships
    nodeMap.forEach((node) => {
      const pathParts = node.path.split("/")
      if (pathParts.length > 1) {
        const parentPath = pathParts.slice(0, -1).join("/")
        const parent = nodeMap.get(parentPath)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(node)
        }
      }
    })

    // Get root nodes and sort
    const rootNodes = Array.from(nodeMap.values())
      .filter((node) => node.level === 0)
      .sort((a, b) => a.name.localeCompare(b.name))

    // Sort children recursively
    const sortChildren = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => a.name.localeCompare(b.name))
          sortChildren(node.children)
        }
      })
    }

    sortChildren(rootNodes)
    return rootNodes
  }, [validationResult])

  // Filter tree data
  const filteredTreeData = useMemo(() => {
    if (!searchTerm && filterType === "all" && !showOnlyMatched) {
      return treeData
    }

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || node.type === filterType
      const matchesFilter = !showOnlyMatched || node.included || node.excluded

      const filteredChildren = (node.children?.map(filterNode).filter(Boolean) as TreeNode[]) || []

      if ((matchesSearch && matchesType && matchesFilter) || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        }
      }

      return null
    }

    return treeData.map(filterNode).filter(Boolean) as TreeNode[]
  }, [treeData, searchTerm, filterType, showOnlyMatched])

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])

  const expandAll = useCallback(() => {
    const allNodeIds = new Set<string>()
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        allNodeIds.add(node.id)
        if (node.children) {
          collectIds(node.children)
        }
      })
    }
    collectIds(treeData)
    setExpandedNodes(allNodeIds)
  }, [treeData])

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set())
  }, [])

  if (isLoadingRuleSet) {
    return (
      <Card style={{ height }}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!ruleSet) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>Failed to load rule set information.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card style={{ height }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pattern Visualization
          </CardTitle>
          <Button variant="outline" onClick={validateAndBuildTree}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistics */}
        {validationResult && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{validationResult.total_entities}</div>
              <div className="text-sm text-muted-foreground">Total Entities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{validationResult.included_entities}</div>
              <div className="text-sm text-muted-foreground">Included</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{validationResult.excluded_entities}</div>
              <div className="text-sm text-muted-foreground">Excluded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{validationResult.performance_stats.validation_time_ms}ms</div>
              <div className="text-sm text-muted-foreground">Validation Time</div>
            </div>
          </div>
        )}

        <Separator />

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="database">Databases</SelectItem>
                <SelectItem value="schema">Schemas</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
                <SelectItem value="column">Columns</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch id="show-matched" checked={showOnlyMatched} onCheckedChange={setShowOnlyMatched} />
              <Label htmlFor="show-matched" className="text-sm">
                Show only matched
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              <Eye className="h-4 w-4 mr-1" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              <EyeOff className="h-4 w-4 mr-1" />
              Collapse All
            </Button>
          </div>
        </div>

        {/* Tree View */}
        <div className="border rounded-lg overflow-auto bg-background" style={{ height: height ? height - 300 : 300 }}>
          {filteredTreeData.length > 0 ? (
            <div className="p-2">
              {filteredTreeData.map((node) => (
                <TreeNodeComponent
                  key={node.id}
                  node={node}
                  level={0}
                  expanded={expandedNodes.has(node.id)}
                  onToggle={toggleNode}
                  searchTerm={searchTerm}
                  showOnlyMatched={showOnlyMatched}
                />
              ))}
            </div>
          ) : validationResult ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Filter className="h-8 w-8 mx-auto mb-2" />
                <p>No entities match the current filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("all")
                    setShowOnlyMatched(false)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p>Click "Refresh" to validate patterns and view entity tree</p>
              </div>
            </div>
          )}
        </div>

        {/* Warnings */}
        {validationResult && validationResult.warnings.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Validation Warnings:</div>
                <ul className="list-disc list-inside text-sm">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
