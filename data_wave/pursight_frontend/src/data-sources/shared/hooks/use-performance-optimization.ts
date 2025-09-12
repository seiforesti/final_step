/**
 * Performance Optimization Hook
 * Provides utilities for optimizing heavy data components
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

interface PerformanceConfig {
  enableVirtualization?: boolean
  maxVisibleItems?: number
  debounceMs?: number
  enableMemoization?: boolean
  enableLazyLoading?: boolean
  batchSize?: number
}

export function usePerformanceOptimization<T>(
  data: T[],
  config: PerformanceConfig = {}
) {
  const {
    enableVirtualization = true,
    maxVisibleItems = 1000,
    debounceMs = 300,
    enableMemoization = true,
    enableLazyLoading = true,
    batchSize = 50
  } = config

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [visibleItems, setVisibleItems] = useState(batchSize)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data
    return data.filter((item: any) => 
      item.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [data, debouncedSearchTerm])

  // Determine if virtualization is needed
  const needsVirtualization = useMemo(() => {
    return enableVirtualization && filteredData.length > maxVisibleItems
  }, [enableVirtualization, filteredData.length, maxVisibleItems])

  // Memoized visible data slice
  const visibleData = useMemo(() => {
    if (needsVirtualization) {
      return filteredData.slice(0, visibleItems)
    }
    return filteredData
  }, [filteredData, needsVirtualization, visibleItems])

  // Lazy loading setup
  useEffect(() => {
    if (!enableLazyLoading || !needsVirtualization) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && visibleItems < filteredData.length) {
          setIsLoading(true)
          setTimeout(() => {
            setVisibleItems(prev => Math.min(prev + batchSize, filteredData.length))
            setIsLoading(false)
          }, 100)
        }
      },
      { threshold: 0.1 }
    )

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [enableLazyLoading, needsVirtualization, visibleItems, filteredData.length, batchSize])

  // Reset visible items when search changes
  useEffect(() => {
    setVisibleItems(batchSize)
  }, [debouncedSearchTerm, batchSize])

  const loadMore = useCallback(() => {
    if (visibleItems < filteredData.length) {
      setIsLoading(true)
      setTimeout(() => {
        setVisibleItems(prev => Math.min(prev + batchSize, filteredData.length))
        setIsLoading(false)
      }, 100)
    }
  }, [visibleItems, filteredData.length, batchSize])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filteredData,
    visibleData,
    needsVirtualization,
    isLoading,
    loadMore,
    loadingRef,
    hasMore: visibleItems < filteredData.length,
    totalItems: filteredData.length,
    visibleCount: visibleItems
  }
}

/**
 * Hook for optimizing tree structures
 */
export function useTreePerformance<T extends { children?: T[] }>(
  treeData: T[],
  config: PerformanceConfig = {}
) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())

  // Flatten tree for performance
  const flattenedTree = useMemo(() => {
    const result: Array<T & { level: number; path: string; isVisible: boolean }> = []
    
    const flatten = (nodes: T[], level = 0, path = '') => {
      nodes.forEach((node, index) => {
        const nodePath = path ? `${path}.${index}` : `${index}`
        const isVisible = level === 0 || expandedNodes.has(nodePath)
        
        result.push({
          ...node,
          level,
          path: nodePath,
          isVisible
        })
        
        if (node.children && isVisible) {
          flatten(node.children, level + 1, nodePath)
        }
      })
    }
    
    flatten(treeData)
    return result
  }, [treeData, expandedNodes])

  const toggleNode = useCallback((nodePath: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath)
      } else {
        newSet.add(nodePath)
      }
      return newSet
    })
  }, [])

  const selectNode = useCallback((nodePath: string, selected: boolean) => {
    setSelectedNodes(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(nodePath)
      } else {
        newSet.delete(nodePath)
      }
      return newSet
    })
  }, [])

  return {
    flattenedTree,
    expandedNodes,
    selectedNodes,
    toggleNode,
    selectNode,
    setExpandedNodes,
    setSelectedNodes
  }
}

/**
 * Hook for batch processing large datasets
 */
export function useBatchProcessing<T>(
  data: T[],
  batchSize = 100,
  delay = 16 // ~60fps
) {
  const [processedData, setProcessedData] = useState<T[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const processBatch = useCallback(async (
    processor: (batch: T[]) => T[],
    onComplete?: (result: T[]) => void
  ) => {
    setIsProcessing(true)
    setProgress(0)
    setProcessedData([])

    const result: T[] = []
    const totalBatches = Math.ceil(data.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, data.length)
      const batch = data.slice(start, end)
      
      const processedBatch = processor(batch)
      result.push(...processedBatch)
      
      setProcessedData([...result])
      setProgress((i + 1) / totalBatches * 100)

      // Yield control to prevent blocking
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    setIsProcessing(false)
    onComplete?.(result)
  }, [data, batchSize, delay])

  return {
    processedData,
    isProcessing,
    progress,
    processBatch
  }
}

