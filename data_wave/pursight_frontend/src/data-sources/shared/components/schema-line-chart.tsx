"use client"

import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle,
  Info,
  X
} from 'lucide-react'
import type { LineChartData, SchemaPattern } from '../utils/schema-analysis-utils'

interface SchemaLineChartProps {
  data: LineChartData[]
  patterns: SchemaPattern[]
  selectedPattern: string | null
  onPatternSelect: (patternId: string | null) => void
  onClose: () => void
  className?: string
}

export interface SchemaLineChartRef {
  getCanvas: () => HTMLCanvasElement | null
}

export const SchemaLineChart = forwardRef<SchemaLineChartRef, SchemaLineChartProps>(({
  data,
  patterns,
  selectedPattern,
  onPatternSelect,
  onClose,
  className = ""
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [chartRange, setChartRange] = useState({ min: 0, max: 100 })

  // Expose canvas ref for screenshot capture
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current
  }), [])

  // Render line chart on canvas
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 0.5
    ctx.setLineDash([])
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // CRITICAL: Calculate dynamic data range for proper scaling
    const allValues = data.flatMap(patternData => patternData.dataPoints.map(point => point.value))
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const valueRange = maxValue - minValue
    const paddingRange = valueRange * 0.1 // Add 10% padding above and below
    
    // Use dynamic range instead of fixed 0-100
    const chartMinValue = Math.max(0, minValue - paddingRange)
    const chartMaxValue = maxValue + paddingRange
    const dynamicRange = chartMaxValue - chartMinValue
    
    console.log('📊 CHART SCALING:', { minValue, maxValue, chartMinValue, chartMaxValue, dynamicRange })
    
    // Update chart range state for display
    setChartRange({ min: chartMinValue, max: chartMaxValue })

    // Draw Y-axis labels with dynamic scaling
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const value = chartMaxValue - (dynamicRange / 5) * i
      const y = padding + (chartHeight / 5) * i + 3
      ctx.fillText(value.toFixed(1), padding - 5, y)
    }

    // Draw X-axis labels (dates)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#94a3b8'
    data[0]?.dataPoints.forEach((point, index) => {
      if (index % 5 === 0) {
        const x = padding + (chartWidth / (data[0].dataPoints.length - 1)) * index
        const date = new Date(point.timestamp)
        const label = `${date.getMonth() + 1}/${date.getDate()}`
        ctx.fillText(label, x, height - padding + 15)
      }
    })

    // CRITICAL: Draw lines for each pattern with enhanced visibility
    data.forEach((patternData, index) => {
      const isSelected = selectedPattern === patternData.patternId
      const isHovered = hoveredPattern === patternData.patternId
      const opacity = selectedPattern ? (isSelected ? 1 : 0.3) : (isHovered ? 0.9 : 0.8) // Increased base opacity
      
      // CRITICAL: Enhanced line visibility - ensure all lines are clearly visible
      ctx.strokeStyle = patternData.color
      ctx.lineWidth = isSelected ? 6 : isHovered ? 4 : 3 // Increased base line width
      ctx.globalAlpha = opacity
      ctx.setLineDash([])
      
      // CRITICAL: Add glow effect for better visibility
      if (isSelected || isHovered) {
        ctx.shadowColor = patternData.color
        ctx.shadowBlur = 8
      } else {
        // Add subtle glow for all lines to make them more visible
        ctx.shadowColor = patternData.color
        ctx.shadowBlur = 2
      }
      
      // Draw line with enhanced visibility using dynamic scaling
      ctx.beginPath()
      patternData.dataPoints.forEach((point, pointIndex) => {
        const x = padding + (chartWidth / (patternData.dataPoints.length - 1)) * pointIndex
        // CRITICAL: Use dynamic scaling instead of fixed 0-100 range
        const normalizedValue = (point.value - chartMinValue) / dynamicRange
        // CRITICAL: Ensure minimum visibility for very low values
        const minVisibleHeight = chartHeight * 0.05 // 5% of chart height minimum
        const adjustedValue = Math.max(normalizedValue, minVisibleHeight / chartHeight)
        const y = padding + chartHeight - (adjustedValue * chartHeight)
        
        if (pointIndex === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      
      // Reset shadow
      ctx.shadowBlur = 0
      
      // CRITICAL: Enhanced data points with better visibility using dynamic scaling
      ctx.fillStyle = patternData.color
      patternData.dataPoints.forEach((point, pointIndex) => {
        const x = padding + (chartWidth / (patternData.dataPoints.length - 1)) * pointIndex
        // CRITICAL: Use dynamic scaling for data points too
        const normalizedValue = (point.value - chartMinValue) / dynamicRange
        // CRITICAL: Ensure minimum visibility for data points too
        const minVisibleHeight = chartHeight * 0.05 // 5% of chart height minimum
        const adjustedValue = Math.max(normalizedValue, minVisibleHeight / chartHeight)
        const y = padding + chartHeight - (adjustedValue * chartHeight)
        
        ctx.beginPath()
        const radius = isSelected ? 8 : isHovered ? 6 : 4 // Increased base radius
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
        
        // Add white center for better contrast
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = patternData.color
      })
    })

    ctx.globalAlpha = 1

    // Draw trend indicators
    data.forEach((patternData, index) => {
      if (selectedPattern && selectedPattern !== patternData.patternId) return
      
      const isSelected = selectedPattern === patternData.patternId
      if (!isSelected) return

      const lastPoint = patternData.dataPoints[patternData.dataPoints.length - 1]
      const secondLastPoint = patternData.dataPoints[patternData.dataPoints.length - 2]
      
      if (lastPoint && secondLastPoint) {
        const x = padding + chartWidth - 20
        const y = padding + 20 + (index * 25)
        
        // Draw trend arrow
        ctx.fillStyle = patternData.color
        ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu'
        ctx.textAlign = 'left'
        
        const trend = lastPoint.value > secondLastPoint.value ? '↗' : 
                     lastPoint.value < secondLastPoint.value ? '↘' : '→'
        ctx.fillText(trend, x, y)
      }
    })
  }, [data, selectedPattern, hoveredPattern])

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2
    
    // Find which pattern was clicked (simplified - check if click is near any line)
    const clickIndex = Math.round(((x - padding) / chartWidth) * (data[0]?.dataPoints.length - 1))
    
    if (clickIndex >= 0 && clickIndex < data[0]?.dataPoints.length) {
      // Find the pattern with the highest value at this point
      let maxValue = 0
      let clickedPattern = null
      
      data.forEach(patternData => {
        const point = patternData.dataPoints[clickIndex]
        if (point && point.value > maxValue) {
          maxValue = point.value
          clickedPattern = patternData.patternId
        }
      })
      
      if (clickedPattern) {
        onPatternSelect(clickedPattern === selectedPattern ? null : clickedPattern)
      }
    }
  }, [data, selectedPattern, onPatternSelect])

  // Handle mouse move for hover effects
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const padding = 40
    const chartWidth = rect.width - padding * 2
    
    // Find which pattern is being hovered
    const clickIndex = Math.round(((x - padding) / chartWidth) * (data[0]?.dataPoints.length - 1))
    
    if (clickIndex >= 0 && clickIndex < data[0]?.dataPoints.length) {
      let maxValue = 0
      let hoveredPatternId = null
      
      data.forEach(patternData => {
        const point = patternData.dataPoints[clickIndex]
        if (point && point.value > maxValue) {
          maxValue = point.value
          hoveredPatternId = patternData.patternId
        }
      })
      
      setHoveredPattern(hoveredPatternId)
    } else {
      setHoveredPattern(null)
    }
  }, [data])

  // Render chart when data changes
  useEffect(() => {
    renderChart()
  }, [renderChart])

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'declining': return <TrendingDown className="h-3 w-3 text-red-500" />
      case 'critical': return <AlertTriangle className="h-3 w-3 text-red-500" />
      default: return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  // Get criticality icon
  const getCriticalityIcon = (criticality: string) => {
    switch (criticality) {
      case 'critical': return <AlertTriangle className="h-3 w-3 text-red-500" />
      case 'high': return <AlertTriangle className="h-3 w-3 text-orange-500" />
      case 'medium': return <Info className="h-3 w-3 text-yellow-500" />
      case 'low': return <CheckCircle className="h-3 w-3 text-green-500" />
      default: return <Info className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className={`bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Schema Lifecycle Analysis</h3>
            <Badge variant="outline" className="text-xs">
              {data.length} Patterns
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Click on lines to highlight patterns in the schema graph
        </p>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-64 cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPattern(null)}
          />
          
          {/* Chart Title */}
          <div className="absolute top-2 left-2 text-xs text-slate-400">
            Criticality Score Over Time
            <div className="text-xs text-slate-500 mt-1">
              Range: {chartRange.min.toFixed(1)} - {chartRange.max.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Legend */}
      <div className="p-4 border-t border-slate-700">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.map((patternData) => {
            const pattern = patterns.find(p => p.id === patternData.patternId)
            if (!pattern) return null

            const isSelected = selectedPattern === patternData.patternId
            const isHovered = hoveredPattern === patternData.patternId

            return (
              <TooltipProvider key={patternData.patternId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-slate-700 border border-slate-500' 
                          : isHovered
                          ? 'bg-slate-800'
                          : 'hover:bg-slate-800'
                      }`}
                      onClick={() => onPatternSelect(patternData.patternId === selectedPattern ? null : patternData.patternId)}
                    >
                      {/* Pattern Color Indicator */}
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: patternData.color }}
                      />
                      
                      {/* Pattern Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">
                            {patternData.patternName}
                          </span>
                          {getCriticalityIcon(pattern.criticality)}
                          {getTrendIcon(patternData.trend)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{pattern.criticality.toUpperCase()}</span>
                          <span>•</span>
                          <span>Priority {pattern.priority}</span>
                          <span>•</span>
                          <span>Current: {patternData.currentValue.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <Badge 
                        variant="outline" 
                        className={`text-xs flex-shrink-0 ${
                          pattern.criticality === 'critical' ? 'border-red-500 text-red-400' :
                          pattern.criticality === 'high' ? 'border-orange-500 text-orange-400' :
                          pattern.criticality === 'medium' ? 'border-yellow-500 text-yellow-400' :
                          'border-green-500 text-green-400'
                        }`}
                      >
                        {pattern.criticality}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-medium">{patternData.patternName}</div>
                      <div className="text-xs text-slate-300">
                        {pattern.description}
                      </div>
                      <div className="text-xs text-slate-400">
                        Current: {patternData.currentValue.toFixed(1)} | 
                        Avg: {patternData.averageValue.toFixed(1)} | 
                        Peak: {patternData.peakValue.toFixed(1)}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPatternSelect(null)}
          className="flex-1 text-xs"
        >
          Clear Selection
        </Button>
        <Button
          size="sm"
          onClick={() => {
            // Generate report functionality will be handled by parent
            console.log('Generate report for patterns:', selectedPattern ? [selectedPattern] : data.map(d => d.patternId))
          }}
          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
        >
          <Activity className="h-3 w-3 mr-1" />
          Generate Report
        </Button>
      </div>
    </div>
  )
})

SchemaLineChart.displayName = 'SchemaLineChart'
