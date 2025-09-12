/**
 * Optimized Tree Node Component
 * Memoized for maximum performance with large datasets
 */

import React, { memo, useCallback, useMemo } from 'react'
import { 
  ChevronRight, ChevronDown, Database, Table, Columns, Search, Eye, 
  FileText, Folder, FolderOpen, CheckCircle
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface OptimizedTreeNodeProps {
  node: {
    id: string
    name: string
    type: 'database' | 'schema' | 'table' | 'view' | 'column'
    children?: any[]
    metadata?: any
    selected?: boolean
    expanded?: boolean
    parentPath?: string
  }
  level: number
  hasChildren: boolean
  isExpanded: boolean
  selectionState: 'checked' | 'unchecked' | 'indeterminate'
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string, checked: boolean) => void
  onPreview?: (node: any) => void
  style?: any
}

const OptimizedTreeNode = memo<OptimizedTreeNodeProps>(({
  node,
  level,
  hasChildren,
  isExpanded,
  selectionState,
  onToggle,
  onSelect,
  onPreview,
  style
}) => {
  // Memoized icon component
  const NodeIcon = useMemo(() => {
    switch (node.type) {
      case 'database':
        return <Database className="h-4 w-4 text-blue-500" />
      case 'schema':
        return isExpanded ? 
          <FolderOpen className="h-4 w-4 text-orange-500" /> : 
          <Folder className="h-4 w-4 text-orange-500" />
      case 'table':
        return <Table className="h-4 w-4 text-green-500" />
      case 'view':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'column':
        return <Columns className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }, [node.type, isExpanded])

  // Memoized metadata badges
  const MetadataBadges = useMemo(() => {
    if (!node.metadata) return null

    const badges = []

    if (node.type === 'table' && node.metadata.rowCount) {
      badges.push(
        <Badge key="rows" variant="outline" className="text-xs">
          {node.metadata.rowCount.toLocaleString()} rows
        </Badge>
      )
    }

    if ((node.type === 'table' || node.type === 'view') && node.metadata.columnCount) {
      badges.push(
        <Badge key="cols" variant="secondary" className="text-xs">
          {node.metadata.columnCount} cols
        </Badge>
      )
    }

    if (node.type === 'column') {
      badges.push(
        <Badge key="type" variant="outline" className="text-xs">
          {node.metadata.dataType}
          {node.metadata.primaryKey && (
            <span className="ml-1 text-yellow-600">PK</span>
          )}
          {node.metadata.isForeignKey && (
            <span className="ml-1 text-blue-600">FK</span>
          )}
        </Badge>
      )

      if (node.metadata.nullable === false) {
        badges.push(
          <Badge key="null" variant="destructive" className="text-xs px-1">
            NOT NULL
          </Badge>
        )
      }

      if (node.metadata.isIndexed) {
        badges.push(
          <Badge key="idx" variant="secondary" className="text-xs px-1">
            IDX
          </Badge>
        )
      }
    }

    return badges
  }, [node.metadata, node.type])

  // Memoized preview button
  const PreviewButton = useMemo(() => {
    if (!onPreview || (node.type !== 'table' && node.type !== 'view')) {
      return null
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onPreview(node)}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Preview data</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }, [onPreview, node])

  // Memoized event handlers
  const handleToggle = useCallback(() => {
    onToggle(node.id)
  }, [onToggle, node.id])

  const handleSelect = useCallback((checked: boolean) => {
    onSelect(node.id, checked)
  }, [onSelect, node.id])

  return (
    <div 
      className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer select-none"
      style={{ 
        marginLeft: `${level * 20}px`,
        ...style 
      }}
    >
      {/* Expand/Collapse Button */}
      {hasChildren ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0"
          onClick={handleToggle}
        >
          {isExpanded ? 
            <ChevronDown className="h-3 w-3" /> : 
            <ChevronRight className="h-3 w-3" />
          }
        </Button>
      ) : (
        <div className="w-4" />
      )}
      
      {/* Selection Checkbox */}
      <Checkbox
        checked={selectionState === 'indeterminate' ? 'indeterminate' : selectionState === 'checked'}
        onCheckedChange={handleSelect}
      />
      
      {/* Node Icon */}
      {NodeIcon}
      
      {/* Node Name */}
      <span className="flex-1 text-sm font-medium truncate" title={node.name}>
        {node.name}
      </span>
      
      {/* Metadata Badges */}
      {MetadataBadges && (
        <div className="flex items-center gap-1">
          {MetadataBadges}
        </div>
      )}
      
      {/* Preview Button */}
      {PreviewButton}
    </div>
  )
})

OptimizedTreeNode.displayName = 'OptimizedTreeNode'

export default OptimizedTreeNode

