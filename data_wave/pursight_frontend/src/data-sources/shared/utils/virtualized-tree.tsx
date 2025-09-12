/**
 * Virtualized Tree Component for Large Data Sets
 * Provides smooth scrolling and rendering for thousands of nodes
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

// Fallback implementation for react-window
const FixedSizeList = React.forwardRef<any, any>(({ children, height, itemCount, itemSize, overscanCount, itemData }, ref) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const visibleStart = Math.floor(scrollTop / itemSize)
  const visibleEnd = Math.min(visibleStart + Math.ceil(height / itemSize) + overscanCount, itemCount)
  
  const visibleItems = []
  for (let i = visibleStart; i < visibleEnd; i++) {
    visibleItems.push(
      <div key={i} style={{ height: itemSize }}>
        {children({ index: i, style: { height: itemSize } })}
      </div>
    )
  }
  
  return (
    <div
      ref={containerRef}
      style={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: itemCount * itemSize, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleStart * itemSize}px)` }}>
          {visibleItems}
        </div>
      </div>
    </div>
  )
})

interface VirtualizedTreeNode {
  id: string
  name: string
  type: 'database' | 'schema' | 'table' | 'view' | 'column'
  level: number
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  isVisible: boolean
  metadata?: any
  children?: VirtualizedTreeNode[]
}

interface VirtualizedTreeProps {
  nodes: VirtualizedTreeNode[]
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string, checked: boolean) => void
  renderNode: (node: VirtualizedTreeNode, style: any) => React.ReactNode
  height?: number
  itemHeight?: number
  overscanCount?: number
}

export function VirtualizedTree({
  nodes,
  onToggle,
  onSelect,
  renderNode,
  height = 400,
  itemHeight = 32,
  overscanCount = 5
}: VirtualizedTreeProps) {
  const listRef = useRef<any>(null)
  const [visibleNodes, setVisibleNodes] = useState<VirtualizedTreeNode[]>([])

  // Flatten tree to linear structure for virtualization
  const flattenedNodes = useMemo(() => {
    const result: VirtualizedTreeNode[] = []
    
    const flatten = (nodeList: VirtualizedTreeNode[], level = 0) => {
      nodeList.forEach(node => {
        if (node.isVisible) {
          result.push({ ...node, level })
          if (node.isExpanded && node.children && node.children.length > 0) {
            flatten(node.children, level + 1)
          }
        }
      })
    }
    
    flatten(nodes)
    return result
  }, [nodes])

  useEffect(() => {
    setVisibleNodes(flattenedNodes)
  }, [flattenedNodes])

  const ItemRenderer = useCallback(({ index, style }: { index: number; style: any }) => {
    const node = visibleNodes[index]
    if (!node) return null

    return (
      <div style={style}>
        {renderNode(node, style)}
      </div>
    )
  }, [visibleNodes, renderNode])

  return (
    <FixedSizeList
      ref={listRef}
      height={height}
      itemCount={visibleNodes.length}
      itemSize={itemHeight}
      overscanCount={overscanCount}
      itemData={visibleNodes}
    >
      {ItemRenderer}
    </FixedSizeList>
  )
}

/**
 * Hook for managing large tree performance
 */
export function useTreePerformance(nodes: any[], maxVisibleNodes = 1000) {
  const [isVirtualized, setIsVirtualized] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Determine if virtualization is needed
  useEffect(() => {
    const totalNodes = countAllNodes(nodes)
    setIsVirtualized(totalNodes > maxVisibleNodes)
  }, [nodes, maxVisibleNodes])

  // Memoized filtered nodes
  const filteredNodes = useMemo(() => {
    if (!debouncedSearchTerm) return nodes
    
    return filterNodes(nodes, debouncedSearchTerm.toLowerCase())
  }, [nodes, debouncedSearchTerm])

  return {
    isVirtualized,
    filteredNodes,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm
  }
}

function countAllNodes(nodes: any[]): number {
  let count = 0
  const countRecursive = (nodeList: any[]) => {
    nodeList.forEach(node => {
      count++
      if (node.children) {
        countRecursive(node.children)
      }
    })
  }
  countRecursive(nodes)
  return count
}

function filterNodes(nodes: any[], searchTerm: string): any[] {
  return nodes.filter(node => {
    const matches = node.name.toLowerCase().includes(searchTerm)
    const hasMatchingChildren = node.children ? 
      filterNodes(node.children, searchTerm).length > 0 : false
    
    if (matches || hasMatchingChildren) {
      return {
        ...node,
        children: node.children ? filterNodes(node.children, searchTerm) : undefined
      }
    }
    return false
  }).filter(Boolean)
}
