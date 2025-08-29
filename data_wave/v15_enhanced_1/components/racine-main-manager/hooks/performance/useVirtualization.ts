'use client'

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { FixedSizeList as List, VariableSizeList as VariableList, FixedSizeGrid as Grid, VariableSizeGrid as VariableGrid } from 'react-window'

interface VirtualizationOptions {
  enableDynamicHeight?: boolean
  enableHorizontalVirtualization?: boolean
  overscanCount?: number
  estimatedItemSize?: number
  enableScrollOptimization?: boolean
  enableResizeObserver?: boolean
  debounceResizeMs?: number
  enablePerformanceTracking?: boolean
}

interface VirtualizedListConfig {
  height: number
  width?: number
  itemCount: number
  itemSize: number | ((index: number) => number)
  itemData?: any
  overscanCount?: number
  onItemsRendered?: (props: any) => void
}

interface VirtualizedGridConfig {
  height: number
  width: number
  columnCount: number
  rowCount: number
  columnWidth: number | ((index: number) => number)
  rowHeight: number | ((index: number) => number)
  itemData?: any
  overscanColumnCount?: number
  overscanRowCount?: number
  onItemsRendered?: (props: any) => void
}

interface VirtualizationMetrics {
  totalItems: number
  renderedItems: number
  renderRatio: number
  scrollTop: number
  scrollHeight: number
  visibleStartIndex: number
  visibleStopIndex: number
  overscanStartIndex: number
  overscanStopIndex: number
}

const DEFAULT_OPTIONS: Required<VirtualizationOptions> = {
  enableDynamicHeight: false,
  enableHorizontalVirtualization: false,
  overscanCount: 3,
  estimatedItemSize: 50,
  enableScrollOptimization: true,
  enableResizeObserver: true,
  debounceResizeMs: 100,
  enablePerformanceTracking: false
}

export const useVirtualization = (options: VirtualizationOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const listRef = useRef<List | VariableList>(null)
  const gridRef = useRef<Grid | VariableGrid>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver>()
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()
  const metricsRef = useRef<VirtualizationMetrics>()
  
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollMetrics, setScrollMetrics] = useState({
    scrollTop: 0,
    scrollLeft: 0,
    scrollDirection: 'forward' as 'forward' | 'backward'
  })

  // Dynamic item size cache for variable size lists
  const itemSizeCache = useRef<Map<number, number>>(new Map())
  const measuredItemsRef = useRef<Set<number>>(new Set())

  // Performance tracking
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef(0)

  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setContainerDimensions({ width, height })
        
        // Reset list/grid cache on resize
        if (listRef.current && 'resetAfterIndex' in listRef.current) {
          listRef.current.resetAfterIndex(0, true)
        }
        if (gridRef.current && 'resetAfterIndices' in gridRef.current) {
          gridRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 }, true)
        }
      }
    }, opts.debounceResizeMs)
  }, [opts.debounceResizeMs])

  // Setup resize observer
  useEffect(() => {
    if (opts.enableResizeObserver && containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleResize)
      resizeObserverRef.current.observe(containerRef.current)
      
      // Initial measurement
      handleResize()

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
        }
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
      }
    }
  }, [opts.enableResizeObserver, handleResize])

  // Get item size for variable size lists
  const getItemSize = useCallback((index: number, defaultSize?: number): number => {
    if (itemSizeCache.current.has(index)) {
      return itemSizeCache.current.get(index)!
    }
    return defaultSize || opts.estimatedItemSize
  }, [opts.estimatedItemSize])

  // Set item size for variable size lists
  const setItemSize = useCallback((index: number, size: number) => {
    itemSizeCache.current.set(index, size)
    measuredItemsRef.current.add(index)
    
    // Reset list after this index to trigger re-render
    if (listRef.current && 'resetAfterIndex' in listRef.current) {
      listRef.current.resetAfterIndex(index, false)
    }
  }, [])

  // Clear item size cache
  const clearItemSizeCache = useCallback((startIndex?: number) => {
    if (startIndex !== undefined) {
      // Clear cache from startIndex onwards
      const keysToDelete = Array.from(itemSizeCache.current.keys())
        .filter(key => key >= startIndex)
      
      keysToDelete.forEach(key => {
        itemSizeCache.current.delete(key)
        measuredItemsRef.current.delete(key)
      })
    } else {
      // Clear entire cache
      itemSizeCache.current.clear()
      measuredItemsRef.current.clear()
    }
  }, [])

  // Handle scroll events
  const handleScroll = useCallback(({ scrollTop, scrollLeft, scrollDirection }: any) => {
    if (opts.enableScrollOptimization) {
      setIsScrolling(true)
      setScrollMetrics({ scrollTop, scrollLeft, scrollDirection })
      
      // Reset scrolling state after scroll ends
      setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }
  }, [opts.enableScrollOptimization])

  // Handle items rendered (for performance tracking)
  const handleItemsRendered = useCallback((props: any) => {
    if (opts.enablePerformanceTracking) {
      renderCountRef.current++
      lastRenderTimeRef.current = performance.now()
      
      metricsRef.current = {
        totalItems: props.itemCount || 0,
        renderedItems: (props.visibleStopIndex - props.visibleStartIndex) + 1,
        renderRatio: ((props.visibleStopIndex - props.visibleStartIndex) + 1) / (props.itemCount || 1),
        scrollTop: scrollMetrics.scrollTop,
        scrollHeight: containerDimensions.height,
        visibleStartIndex: props.visibleStartIndex,
        visibleStopIndex: props.visibleStopIndex,
        overscanStartIndex: props.overscanStartIndex,
        overscanStopIndex: props.overscanStopIndex
      }
    }
  }, [opts.enablePerformanceTracking, scrollMetrics.scrollTop, containerDimensions.height])

  // Create virtualized list
  const createVirtualizedList = useCallback(<T = any>(config: VirtualizedListConfig) => {
    const {
      height,
      width = containerDimensions.width,
      itemCount,
      itemSize,
      itemData,
      overscanCount = opts.overscanCount,
      onItemsRendered
    } = config

    const listProps = {
      ref: listRef,
      height,
      width,
      itemCount,
      itemData,
      overscanCount,
      onScroll: handleScroll,
      onItemsRendered: (props: any) => {
        handleItemsRendered(props)
        onItemsRendered?.(props)
      }
    }

    if (opts.enableDynamicHeight && typeof itemSize === 'function') {
      return React.createElement(VariableList, {
        ...listProps,
        itemSize: (index: number) => getItemSize(index, (itemSize as any)(index)),
        estimatedItemSize: opts.estimatedItemSize
      })
    } else {
      return React.createElement(List, {
        ...listProps,
        itemSize: typeof itemSize === 'function' ? opts.estimatedItemSize : itemSize
      })
    }
  }, [
    containerDimensions.width,
    opts.overscanCount,
    opts.enableDynamicHeight,
    opts.estimatedItemSize,
    getItemSize,
    handleScroll,
    handleItemsRendered
  ])

  // Create virtualized grid
  const createVirtualizedGrid = useCallback(<T = any>(config: VirtualizedGridConfig) => {
    const {
      height,
      width,
      columnCount,
      rowCount,
      columnWidth,
      rowHeight,
      itemData,
      overscanColumnCount = opts.overscanCount,
      overscanRowCount = opts.overscanCount,
      onItemsRendered
    } = config

    const gridProps = {
      ref: gridRef,
      height,
      width,
      columnCount,
      rowCount,
      itemData,
      overscanColumnCount,
      overscanRowCount,
      onScroll: handleScroll,
      onItemsRendered: (props: any) => {
        handleItemsRendered(props)
        onItemsRendered?.(props)
      }
    }

    if (opts.enableDynamicHeight && (typeof columnWidth === 'function' || typeof rowHeight === 'function')) {
      return React.createElement(VariableGrid, {
        ...gridProps,
        columnWidth: typeof columnWidth === 'function' 
          ? columnWidth 
          : () => columnWidth as number,
        rowHeight: typeof rowHeight === 'function' 
          ? rowHeight 
          : () => rowHeight as number,
        estimatedColumnWidth: opts.estimatedItemSize,
        estimatedRowHeight: opts.estimatedItemSize
      })
    } else {
      return React.createElement(Grid, {
        ...gridProps,
        columnWidth: typeof columnWidth === 'function' ? opts.estimatedItemSize : columnWidth,
        rowHeight: typeof rowHeight === 'function' ? opts.estimatedItemSize : rowHeight
      })
    }
  }, [
    opts.overscanCount,
    opts.enableDynamicHeight,
    opts.estimatedItemSize,
    handleScroll,
    handleItemsRendered
  ])

  // Scroll to item
  const scrollToItem = useCallback((index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start') => {
    if (listRef.current) {
      listRef.current.scrollToItem(index, align)
    }
  }, [])

  // Scroll to grid item
  const scrollToGridItem = useCallback((
    { columnIndex, rowIndex }: { columnIndex: number; rowIndex: number },
    align?: 'auto' | 'smart' | 'center' | 'end' | 'start'
  ) => {
    if (gridRef.current) {
      gridRef.current.scrollToItem({ columnIndex, rowIndex, align })
    }
  }, [])

  // Get current scroll offset
  const getScrollOffset = useCallback(() => {
    return {
      scrollTop: scrollMetrics.scrollTop,
      scrollLeft: scrollMetrics.scrollLeft
    }
  }, [scrollMetrics])

  // Get virtualization metrics
  const getVirtualizationMetrics = useCallback((): VirtualizationMetrics | null => {
    return metricsRef.current || null
  }, [])

  // Get performance stats
  const getPerformanceStats = useCallback(() => {
    return {
      renderCount: renderCountRef.current,
      lastRenderTime: lastRenderTimeRef.current,
      isScrolling,
      containerDimensions,
      itemSizeCacheSize: itemSizeCache.current.size,
      measuredItemsCount: measuredItemsRef.current.size,
      metrics: getVirtualizationMetrics()
    }
  }, [isScrolling, containerDimensions, getVirtualizationMetrics])

  // Optimize for specific scenarios
  const optimizeForScenario = useCallback((scenario: 'large-dataset' | 'dynamic-content' | 'high-frequency-updates' | 'mobile') => {
    const optimizations: Record<string, Partial<VirtualizationOptions>> = {
      'large-dataset': {
        overscanCount: 1,
        enableScrollOptimization: true,
        estimatedItemSize: 40
      },
      'dynamic-content': {
        enableDynamicHeight: true,
        overscanCount: 5,
        enableResizeObserver: true
      },
      'high-frequency-updates': {
        overscanCount: 2,
        enableScrollOptimization: true,
        debounceResizeMs: 50
      },
      'mobile': {
        overscanCount: 2,
        enableScrollOptimization: true,
        estimatedItemSize: 60
      }
    }

    return optimizations[scenario] || {}
  }, [])

  // Create window dimensions hook for responsive virtualization
  const useResponsiveVirtualization = useCallback((breakpoints: Record<string, number>) => {
    const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('')

    useEffect(() => {
      const updateBreakpoint = () => {
        const width = window.innerWidth
        const breakpointEntries = Object.entries(breakpoints).sort(([, a], [, b]) => b - a)
        
        for (const [name, minWidth] of breakpointEntries) {
          if (width >= minWidth) {
            setCurrentBreakpoint(name)
            break
          }
        }
      }

      updateBreakpoint()
      window.addEventListener('resize', updateBreakpoint)
      
      return () => window.removeEventListener('resize', updateBreakpoint)
    }, [breakpoints])

    return currentBreakpoint
  }, [])

  // Memory cleanup
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      
      // Clear caches
      itemSizeCache.current.clear()
      measuredItemsRef.current.clear()
      
      // Log final performance stats
      if (opts.enablePerformanceTracking) {
        console.info('Virtualization final stats:', getPerformanceStats())
      }
    }
  }, [opts.enablePerformanceTracking, getPerformanceStats])

  return {
    // Core functionality
    createVirtualizedList,
    createVirtualizedGrid,
    containerRef,
    
    // Size management
    getItemSize,
    setItemSize,
    clearItemSizeCache,
    
    // Scrolling
    scrollToItem,
    scrollToGridItem,
    getScrollOffset,
    
    // State
    containerDimensions,
    isScrolling,
    scrollMetrics,
    
    // Metrics and optimization
    getVirtualizationMetrics,
    getPerformanceStats,
    optimizeForScenario,
    useResponsiveVirtualization,
    
    // Refs for advanced usage
    listRef,
    gridRef
  }
}