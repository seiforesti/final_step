"use client"

import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface VisualizerItem {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'failed'
}

interface PatternResult {
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'name' | 'address' | 'ip' | 'url' | 'pii' | 'unknown'
  confidence: number
  risk: 'low' | 'medium' | 'high' | 'critical'
  color: string
  description: string
  category: 'personal' | 'financial' | 'contact' | 'technical' | 'other'
}

export interface WorkflowVisualizerProps {
  mode: 'manual' | 'semi_auto' | 'full_auto'
  totalSteps: number
  currentStep: number
  running: boolean
  successRate: number
  onExit: () => void
  metrics: { autoResolvable: number; requiresReview: number; highRisk: number }
  selectedItems?: Array<{ id: string; name: string; type: string; priority: number; item: any }>
}

export function WorkflowVisualizer({ mode, totalSteps, currentStep, running, successRate, onExit, metrics, selectedItems = [] }: WorkflowVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const tickRef = useRef<number>(0)
  // Persist the latest non-empty items so subsequent stages reuse them
  const itemsRef = useRef<WorkflowVisualizerProps['selectedItems']>([])
  if (selectedItems && selectedItems.length > 0) {
    itemsRef.current = selectedItems
  }
  
  // Ensure we always have items for the visualizer
  const stableItems = itemsRef.current && itemsRef.current.length > 0 ? itemsRef.current : selectedItems

  // Debug logging
  console.log('WorkflowVisualizer props:', { mode, totalSteps, currentStep, running, successRate, selectedItemsLength: selectedItems.length })

  // Advanced pattern detection function
  const detectPattern = (itemName: string, itemType: string): PatternResult => {
    const name = itemName.toLowerCase()
    const type = itemType.toLowerCase()
    
    // Email pattern detection
    if (name.includes('email') || name.includes('mail') || name.includes('e_mail') || 
        type.includes('email') || name.includes('@') || name.includes('correo')) {
      return {
        type: 'email',
        confidence: 95,
        risk: 'high',
        color: '#dc2626', // Red
        description: 'Email Address',
        category: 'contact'
      }
    }
    
    // Phone pattern detection
    if (name.includes('phone') || name.includes('tel') || name.includes('mobile') || 
        name.includes('telefono') || name.includes('cell') || name.includes('contact') ||
        type.includes('phone') || name.includes('number') && (name.includes('phone') || name.includes('mobile'))) {
      return {
        type: 'phone',
        confidence: 90,
        risk: 'high',
        color: '#ea580c', // Orange
        description: 'Phone Number',
        category: 'contact'
      }
    }
    
    // SSN pattern detection
    if (name.includes('ssn') || name.includes('social') || name.includes('security') ||
        name.includes('social_security') || name.includes('ss_number') || 
        name.includes('tax_id') || name.includes('tin')) {
      return {
        type: 'ssn',
        confidence: 98,
        risk: 'critical',
        color: '#7c2d12', // Dark red
        description: 'Social Security Number',
        category: 'personal'
      }
    }
    
    // Credit card pattern detection
    if (name.includes('card') || name.includes('credit') || name.includes('payment') || 
        name.includes('cc') || name.includes('visa') || name.includes('mastercard') ||
        name.includes('amex') || name.includes('cvv') || name.includes('cvc') ||
        name.includes('expiry') || name.includes('exp_date')) {
      return {
        type: 'credit_card',
        confidence: 92,
        risk: 'critical',
        color: '#991b1b', // Very dark red
        description: 'Credit Card Info',
        category: 'financial'
      }
    }
    
    // Name pattern detection
    if (name.includes('name') || name.includes('first') || name.includes('last') || 
        name.includes('full') || name.includes('given') || name.includes('family') ||
        name.includes('surname') || name.includes('forename') || name.includes('middle')) {
      return {
        type: 'name',
        confidence: 85,
        risk: 'medium',
        color: '#d97706', // Amber
        description: 'Personal Name',
        category: 'personal'
      }
    }
    
    // Address pattern detection
    if (name.includes('address') || name.includes('street') || name.includes('city') || 
        name.includes('zip') || name.includes('postal') || name.includes('state') ||
        name.includes('country') || name.includes('location') || name.includes('addr')) {
      return {
        type: 'address',
        confidence: 88,
        risk: 'medium',
        color: '#ca8a04', // Yellow
        description: 'Address Information',
        category: 'personal'
      }
    }
    
    // IP pattern detection
    if (name.includes('ip') || (name.includes('address') && name.includes('network')) ||
        name.includes('ip_address') || name.includes('ipv4') || name.includes('ipv6')) {
      return {
        type: 'ip',
        confidence: 80,
        risk: 'low',
        color: '#16a34a', // Green
        description: 'IP Address',
        category: 'technical'
      }
    }
    
    // URL pattern detection
    if (name.includes('url') || name.includes('link') || name.includes('website') ||
        name.includes('web') || name.includes('domain') || name.includes('uri')) {
      return {
        type: 'url',
        confidence: 75,
        risk: 'low',
        color: '#0891b2', // Cyan
        description: 'URL/Link',
        category: 'technical'
      }
    }
    
    // General PII detection
    if (name.includes('id') || name.includes('identifier') || name.includes('user') ||
        name.includes('person') || name.includes('individual') || name.includes('citizen') ||
        name.includes('birth') || name.includes('age') || name.includes('gender') ||
        name.includes('nationality') || name.includes('passport') || name.includes('license')) {
      return {
        type: 'pii',
        confidence: 70,
        risk: 'medium',
        color: '#9333ea', // Purple
        description: 'Personal Information',
        category: 'personal'
      }
    }
    
    // Default unknown pattern
    return {
      type: 'unknown',
      confidence: 50,
      risk: 'low',
      color: '#6b7280', // Gray
      description: 'Unknown Pattern',
      category: 'other'
    }
  }

  const basePercent = Math.min(100, Math.max(0, Math.round((currentStep / Math.max(1, totalSteps)) * 100)))

  type NodeDef = { x: number; y: number; label: string }
  type Particle = { t: number; speed: number; pathIndex: number; hue: number; radius: number }
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const resize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(900, rect.width)
      canvas.width = width
      canvas.height = 320
      drawStatic(0)
    }
    // Check if ResizeObserver is available
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resize)
      ro.observe(container)
      window.addEventListener('resize', resize)
      resize()
      return () => { ro.disconnect(); window.removeEventListener('resize', resize) }
    } else {
      // Fallback for browsers without ResizeObserver
      window.addEventListener('resize', resize)
      resize()
      return () => { window.removeEventListener('resize', resize) }
    }
  }, [])

  const getNodes = (w: number, h: number): NodeDef[] => {
    return [
      { x: 120, y: h / 2 - 110, label: 'Select' },
      { x: w / 2 - 160, y: h / 2 - 110, label: 'Analyze' },
      { x: w - 260, y: h / 2 - 110, label: 'Recommend' },
      { x: 120, y: h / 2 + 20, label: 'Resolve' },
      { x: w / 2 - 160, y: h / 2 + 20, label: 'Apply' },
      { x: w - 260, y: h / 2 + 20, label: 'Catalog' },
    ]
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save()
    const spacing = 24
    ctx.lineWidth = 1
    for (let y = 0; y < h; y += spacing) {
      ctx.strokeStyle = y % (spacing * 4) === 0 ? 'rgba(15,23,42,0.09)' : 'rgba(15,23,42,0.04)'
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    for (let x = 0; x < w; x += spacing) {
      ctx.strokeStyle = x % (spacing * 4) === 0 ? 'rgba(15,23,42,0.09)' : 'rgba(15,23,42,0.04)'
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    ctx.restore()
  }

  const drawNode = (ctx: CanvasRenderingContext2D, node: NodeDef, active: boolean, progress: number, t: number) => {
    const w = 140
    const h = 52
    const r = 10
    const x = node.x
    const y = node.y

    const pulse = active ? (0.6 + 0.4 * Math.sin(t * 0.08)) : 0
    if (active) {
      ctx.save()
      ctx.shadowColor = `rgba(15,23,42,${0.35 * (0.6 + pulse * 0.4)})`
      ctx.shadowBlur = 20 + 10 * pulse
      ctx.fillStyle = '#0f172a'
      roundRect(ctx, x, y, w, h, r, true, false)
      ctx.restore()
    }

    ctx.strokeStyle = '#0f172a'
    ctx.fillStyle = active ? '#0f172a' : '#eef2f7'
    roundRect(ctx, x, y, w, h, r, true, true)

    ctx.fillStyle = active ? '#ffffff' : '#0f172a'
    ctx.font = '12px ui-sans-serif, system-ui'
    ctx.fillText(node.label, x + 14, y + 32)

    ctx.save()
    ctx.translate(x + w - 18, y + 18)
    ctx.strokeStyle = 'rgba(15,23,42,0.18)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 12, 0, Math.PI * 2)
    ctx.stroke()
    if (active) {
      const grad = (ctx as any).createConicGradient ? (ctx as any).createConicGradient(t * 0.02, 0, 0) : null
      if (grad) {
        grad.addColorStop(0, '#0f172a')
        grad.addColorStop(1, 'rgba(15,23,42,0.6)')
        ctx.strokeStyle = grad as any
      } else {
        ctx.strokeStyle = '#0f172a'
      }
      ctx.beginPath()
      ctx.arc(0, 0, 12, -Math.PI / 2, (Math.PI * 2) * progress - Math.PI / 2)
      ctx.stroke()
    }
    ctx.restore()
  }

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean, stroke: boolean) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    if (fill) ctx.fill()
    if (stroke) ctx.stroke()
  }

  const drawBezier = (ctx: CanvasRenderingContext2D, a: NodeDef, b: NodeDef, t: number) => {
    const sx = a.x + 140
    const sy = a.y + 26
    const ex = b.x
    const ey = b.y + 26
    const cp1x = sx + Math.abs(ex - sx) * 0.33
    const cp1y = sy + Math.sin(t * 0.01) * 2
    const cp2x = ex - Math.abs(ex - sx) * 0.33
    const cp2y = ey + Math.cos(t * 0.01) * 2

    const grad = ctx.createLinearGradient(sx, sy, ex, ey)
    grad.addColorStop(0, 'rgba(15,23,42,0.35)')
    grad.addColorStop(1, 'rgba(15,23,42,0.10)')
    ctx.strokeStyle = grad
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey)
    ctx.stroke()

    const angle = Math.atan2(ey - cp2y, ex - cp2x)
    drawArrowHead(ctx, ex, ey, angle)
  }

  const drawArrowHead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillStyle = 'rgba(15,23,42,0.5)'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-10, -5)
    ctx.lineTo(-10, 5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const drawSmallCheck = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-4, 0)
    ctx.lineTo(-1, 3)
    ctx.lineTo(4, -3)
    ctx.stroke()
    ctx.restore()
  }

  // ENTERPRISE-LEVEL step card renderer with real selected items
  const drawStepCard = (ctx: CanvasRenderingContext2D, node: NodeDef, title: string, itemsCount: number, progress01: number, t: number) => {
    const isSelecting = title === 'Selecting'
    const isAnalyzing = title === 'Analyzing'
    const w = (isSelecting || isAnalyzing) ? 320 : 220
    const h = (isSelecting || isAnalyzing) ? 100 : 120
    const r = 12
    const x = node.x - ((isSelecting || isAnalyzing) ? 80 : 30)
    const y = node.y - ((isSelecting || isAnalyzing) ? 30 : 34)

    // Calculate validation progress early for card styling
    let validationProgress = 0
    let analysisProgress = 0
    
    if (isSelecting && stableItems.length > 0) {
      // Create a simulated progress that actually moves through all items sequentially
      const totalItems = stableItems.length
      const timePerItem = 300 // 300 frames per item (about 5 seconds at 60fps for better visibility)
      const totalTime = totalItems * timePerItem
      
      // FIXED: Don't loop - stay at 100% once completed
      if (t >= totalTime) {
        validationProgress = 1.0 // Stay at 100% completion
      } else {
        const currentTime = t % totalTime
        const currentItemIndex = Math.floor(currentTime / timePerItem)
        const itemProgress = (currentTime % timePerItem) / timePerItem
        
        // Calculate overall progress: completed items + current item progress
        validationProgress = (currentItemIndex + itemProgress) / totalItems
        validationProgress = Math.min(1, validationProgress)
      }
    }
    
    if (isAnalyzing && stableItems.length > 0) {
      // ENTERPRISE-GRADE SEQUENTIAL ANALYSIS - Each item analyzed completely before next
      const totalItems = stableItems.length
      const timePerItem = 600 // Slower analysis for better visibility of pattern detection
      const totalTime = totalItems * timePerItem
      
      // STEP-BY-STEP ANALYSIS: Start only when analyzing step is active
      const analysisStartTime = 200 // Brief delay to show step transition
      
      if (t >= analysisStartTime) {
        const analysisTime = t - analysisStartTime
        
        if (analysisTime >= totalTime) {
          analysisProgress = 1.0 // All items analyzed - show final results
        } else {
          // SEQUENTIAL PROCESSING: One item at a time, complete analysis before next
          const currentItemIndex = Math.floor(analysisTime / timePerItem)
          const itemProgress = (analysisTime % timePerItem) / timePerItem
          
          // ENTERPRISE LOGIC: Item must be 100% analyzed before moving to next
          const completedItems = currentItemIndex
          const currentItemAnalysis = itemProgress >= 0.95 ? 1.0 : itemProgress
          
          analysisProgress = (completedItems + currentItemAnalysis) / totalItems
          analysisProgress = Math.min(1, analysisProgress)
        }
      }
    }

    // Card container with enterprise styling - green for selecting, red for analyzing
    const allItemsCompleted = isSelecting && stableItems.length > 0 && validationProgress >= 0.95
    const allAnalysisCompleted = isAnalyzing && stableItems.length > 0 && analysisProgress >= 0.95
    
    if (allItemsCompleted) {
      ctx.fillStyle = '#f0fdf4' // Light green background
      ctx.strokeStyle = '#10b981' // Green border
      ctx.lineWidth = 2
    } else if (allAnalysisCompleted) {
      ctx.fillStyle = '#fef2f2' // Light red background
      ctx.strokeStyle = '#dc2626' // Red border
      ctx.lineWidth = 2
    } else {
      ctx.fillStyle = '#ffffff' // White background
      ctx.strokeStyle = '#0f172a' // Dark border
      ctx.lineWidth = 1.5
    }
    roundRect(ctx, x, y, w, h, r, true, true)

    // Header with gradient background - green for selecting, red for analyzing
    const headerH = 24
    const grad = ctx.createLinearGradient(x, y, x, y + headerH)
    if (allItemsCompleted) {
      grad.addColorStop(0, '#dcfce7')
      grad.addColorStop(1, '#bbf7d0')
    } else if (allAnalysisCompleted) {
      grad.addColorStop(0, '#fecaca')
      grad.addColorStop(1, '#fca5a5')
    } else {
      grad.addColorStop(0, '#f8fafc')
      grad.addColorStop(1, '#e2e8f0')
    }
    ctx.fillStyle = grad
    roundRect(ctx, x, y, w, headerH, r, true, false)
    roundRect(ctx, x, y, w, headerH, r, false, true)

    // Header text - green for selecting, red for analyzing
    if (allItemsCompleted) {
      ctx.fillStyle = '#166534' // Dark green
    } else if (allAnalysisCompleted) {
      ctx.fillStyle = '#991b1b' // Dark red
    } else {
      ctx.fillStyle = '#0f172a' // Dark gray
    }
    ctx.font = 'bold 11px ui-sans-serif, system-ui'
    ctx.fillText(title, x + 12, y + 16)

    if (isSelecting && stableItems.length > 0) {
      // HORIZONTAL SEQUENTIAL VALIDATION LAYOUT
      const itemWidth = 60
      const itemHeight = 20
      const itemSpacing = 8
      const maxVisible = Math.min(4, stableItems.length)
      const startX = x + 12
      const startY = y + 36
      
      // Use the already calculated validation progress
      const itemValidationTime = 0.25 // Time per item (25% of total progress) - normal transitions
      
      // FIXED: Use only the actual progress, no time-based looping
      const combinedProgress = validationProgress
      
      // Check if all items are completed
      const allCompleted = validationProgress >= 0.95
      
      if (allCompleted) {
        // SUCCESS STATE - All items validated
        ctx.fillStyle = '#10b981'
        ctx.font = 'bold 24px ui-sans-serif, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('✓', x + w/2, y + h/2 + 4)
        
        // Success text
        ctx.fillStyle = '#10b981'
        ctx.font = 'bold 10px ui-sans-serif, system-ui'
        ctx.fillText('All Validated', x + w/2, y + h/2 + 16)
        
        // Completion stats
        ctx.fillStyle = '#0f172a'
        ctx.font = '8px ui-sans-serif, system-ui'
        ctx.fillText(`${stableItems.length}/${stableItems.length} Complete`, x + w/2, y + h - 8)
        ctx.textAlign = 'left'
        
      } else {
        // HORIZONTAL SEQUENTIAL VALIDATION ANIMATION
        for (let i = 0; i < maxVisible; i++) {
          const item = stableItems[i]
          if (!item) continue
          
          // Calculate item validation state with more precise timing
          const itemStartTime = i * itemValidationTime
          let itemProgress = Math.max(0, Math.min(1, (combinedProgress - itemStartTime) / itemValidationTime))
          
          // FIXED: If validation is complete, all items should be completed
          if (validationProgress >= 0.95) {
            itemProgress = 1.0 // Force all items to completed state
          }
          
          
          const isPending = itemProgress <= 0.05
          const isActive = itemProgress > 0.05 && itemProgress < 0.85
          const isCompleted = itemProgress >= 0.85
          
          
          // Calculate horizontal position with slight vertical movement during active state
          let itemX = startX + i * (itemWidth + itemSpacing)
          let itemY = startY
          
          // Add subtle vertical movement during active phase
          if (isActive) {
            const moveUp = (itemProgress - 0.1) * 3 // Move up 3px during processing
            itemY = startY - moveUp
          } else if (isCompleted) {
            // Keep completed items at their final position
            itemY = startY - 2
          }
          
          // Item background with priority-based styling
          const priority = item.priority || 5
          let bgColor = '#f8fafc'
          let borderColor = '#e2e8f0'
          let textColor = '#475569'
          
          if (isActive) {
            bgColor = priority >= 8 ? '#1e293b' : priority >= 6 ? '#334155' : '#475569'
            borderColor = priority >= 8 ? '#0f172a' : priority >= 6 ? '#1e293b' : '#334155'
            textColor = '#ffffff'
          } else if (isCompleted) {
            bgColor = '#dcfce7'
            borderColor = '#10b981'
            textColor = '#166534'
          }
          
          // Item container with rounded corners
          ctx.fillStyle = bgColor
          ctx.strokeStyle = borderColor
          ctx.lineWidth = isActive ? 2 : 1
          roundRect(ctx, itemX, itemY, itemWidth, itemHeight, 6, true, true)
          
          // Item name (truncated to fit)
          ctx.fillStyle = textColor
          ctx.font = '8px ui-sans-serif, system-ui'
          const maxChars = Math.floor((itemWidth - 20) / 5)
          let displayName = item.name || item.item?.table || item.item?.schema || `Item ${i + 1}`
          if (displayName.length > maxChars) {
            displayName = displayName.slice(0, maxChars - 2) + '..'
          }
          ctx.fillText(displayName, itemX + 6, itemY + 13)
          
          // Status indicator on the right side
          const indicatorX = itemX + itemWidth - 12
          const indicatorY = itemY + 10
          
          if (isPending) {
            // Pending - small gray dot
            ctx.fillStyle = '#94a3b8'
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 1.5, 0, Math.PI * 2)
            ctx.fill()
            
          } else if (isActive) {
            // Active - ENTERPRISE-GRADE animated spinner with enhanced glow
            ctx.save()
            
            // Outer glow ring - slower animation
            ctx.shadowColor = 'rgba(59, 130, 246, 0.9)'
            ctx.shadowBlur = 12
            ctx.strokeStyle = '#3b82f6'
            ctx.lineWidth = 3
            ctx.beginPath()
            const spin = (t * 0.3 + i * 0.4) % (Math.PI * 2) // Slower spin
            ctx.arc(indicatorX, indicatorY, 5, spin, spin + Math.PI * 1.5)
            ctx.stroke()
            
            // Inner spinning ring - slower animation
            ctx.shadowBlur = 8
            ctx.strokeStyle = '#1d4ed8'
            ctx.lineWidth = 2
            ctx.beginPath()
            const innerSpin = (t * 0.4 + i * 0.5) % (Math.PI * 2) // Slower spin
            ctx.arc(indicatorX, indicatorY, 3, innerSpin, innerSpin + Math.PI * 1.2)
            ctx.stroke()
            
            // Pulsing center dot with enterprise glow - slower pulse
            const pulse = 0.7 + 0.3 * Math.sin(t * 0.25 + i * 0.4) // Slower pulse
            ctx.shadowColor = 'rgba(59, 130, 246, 0.8)'
            ctx.shadowBlur = 6
            ctx.fillStyle = `rgba(59, 130, 246, ${pulse})`
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 2, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.restore()
            
          } else if (isCompleted) {
            // Completed - ENTERPRISE-GRADE success checkmark with enhanced glow
            ctx.save()
            
            // Success background circle
            ctx.shadowColor = 'rgba(16, 185, 129, 0.6)'
            ctx.shadowBlur = 10
            ctx.fillStyle = '#dcfce7'
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2)
            ctx.fill()
            
            // Animated checkmark with enterprise styling
            ctx.shadowColor = 'rgba(16, 185, 129, 0.9)'
            ctx.shadowBlur = 8
            ctx.strokeStyle = '#10b981'
            ctx.lineWidth = 3
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.beginPath()
            
            // Animated checkmark drawing with smooth progression
            const checkProgress = Math.min(1, (itemProgress - 0.8) * 5)
            const checkX = indicatorX - 4
            const checkY = indicatorY - 1
            
            if (checkProgress > 0) {
              ctx.moveTo(checkX, checkY)
              ctx.lineTo(checkX + 4 * checkProgress, checkY + 4 * checkProgress)
              ctx.lineTo(checkX + 8 * checkProgress, checkY - 4 * checkProgress)
            }
            ctx.stroke()
            
            // Pulsing success glow - slower pulse
            const successPulse = 0.8 + 0.2 * Math.sin(t * 0.15 + i * 0.2) // Slower pulse
            ctx.shadowColor = `rgba(16, 185, 129, ${successPulse})`
            ctx.shadowBlur = 6
            ctx.fillStyle = '#10b981'
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 1, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.restore()
          }
        }
        
        // Show remaining items count
        if (stableItems.length > maxVisible) {
          ctx.fillStyle = '#64748b'
          ctx.font = '7px ui-sans-serif, system-ui'
          ctx.fillText(`+${stableItems.length - maxVisible} more`, startX + maxVisible * (itemWidth + itemSpacing), startY + 13)
        }
        
        // Progress indicator
        const completedCount = Math.floor(validationProgress * stableItems.length)
        ctx.fillStyle = '#0f172a'
        ctx.font = '8px ui-sans-serif, system-ui'
        ctx.fillText(`${completedCount}/${stableItems.length} validating...`, x + 12, y + h - 8)
      }
      
    } else if (title === 'Analyzing' && stableItems.length > 0) {
      
      // ENTERPRISE-GRADE SEQUENTIAL ANALYSIS LAYOUT
      const itemWidth = 70 // Wider for pattern display
      const itemHeight = 24 // Taller for pattern info
      const itemSpacing = 10
      const maxVisible = Math.min(4, stableItems.length)
      const startX = x + 12
      const startY = y + 32
      
      // ADVANCED ANALYSIS TIMING - Each item gets full analysis cycle
      const itemAnalysisTime = 0.25 // 25% of total time per item
      const combinedProgress = analysisProgress
      
      // ENTERPRISE PATTERN DETECTION - Show real-time analysis
      const displayProgress = combinedProgress
      
      // Check if all items are analyzed with patterns detected
      const allCompleted = analysisProgress >= 0.95
      
      if (allCompleted) {
        // ENTERPRISE SUCCESS STATE - All items analyzed with comprehensive pattern results
        
        // Calculate comprehensive pattern analysis
        const patterns = stableItems.map(item => detectPattern(item.name, item.type))
        const patternCounts = patterns.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        // Risk assessment based on pattern types
        const highRiskPatterns = patterns.filter(p => p.risk === 'critical' || p.risk === 'high').length
        const riskPercentage = Math.round((highRiskPatterns / stableItems.length) * 100)
        
        // RED CARD BACKGROUND for high-risk detection
        ctx.fillStyle = riskPercentage > 50 ? '#dc2626' : riskPercentage > 25 ? '#ea580c' : '#10b981'
        ctx.font = 'bold 24px ui-sans-serif, system-ui'
        ctx.textAlign = 'center'
        const riskIcon = riskPercentage > 50 ? '🚨' : riskPercentage > 25 ? '⚠️' : '✅'
        ctx.fillText(riskIcon, x + w/2, y + h/2 - 8)
        
        // Analysis completion text
        ctx.fillStyle = riskPercentage > 50 ? '#dc2626' : riskPercentage > 25 ? '#ea580c' : '#10b981'
        ctx.font = 'bold 11px ui-sans-serif, system-ui'
        ctx.fillText('Analysis Complete', x + w/2, y + h/2 + 8)
        
        // ENTERPRISE PATTERN SUMMARY with percentages
        const topPatterns = Object.entries(patternCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2) // Show top 2 patterns
        
        if (topPatterns.length > 0) {
          ctx.fillStyle = '#0f172a'
          ctx.font = '8px ui-sans-serif, system-ui'
          const pattern1 = topPatterns[0]
          const pattern2 = topPatterns[1]
          
          let summaryText = `${pattern1[0]}: ${Math.round((pattern1[1] / stableItems.length) * 100)}%`
          if (pattern2) {
            summaryText += ` | ${pattern2[0]}: ${Math.round((pattern2[1] / stableItems.length) * 100)}%`
          }
          
          ctx.fillText(summaryText, x + w/2, y + h - 12)
          
          // Risk percentage display
          ctx.fillStyle = riskPercentage > 50 ? '#dc2626' : riskPercentage > 25 ? '#ea580c' : '#10b981'
          ctx.font = 'bold 8px ui-sans-serif, system-ui'
          ctx.fillText(`Risk Level: ${riskPercentage}%`, x + w/2, y + h - 4)
        }
        ctx.textAlign = 'left'
        
      } else {
        // HORIZONTAL SEQUENTIAL ANALYSIS ANIMATION
        for (let i = 0; i < maxVisible; i++) {
          const item = stableItems[i]
          if (!item) continue
          
          // Calculate item analysis state with more precise timing
          const itemStartTime = i * itemAnalysisTime
          let itemProgress = Math.max(0, Math.min(1, (displayProgress - itemStartTime) / itemAnalysisTime))
          
          // FIXED: If analysis is complete, all items should be completed
          if (analysisProgress >= 0.95) {
            itemProgress = 1.0 // Force all items to completed state
          }
          
          const isPending = itemProgress <= 0.05
          const isActive = itemProgress > 0.05 && itemProgress < 0.85
          const isCompleted = itemProgress >= 0.85
          
          // Calculate horizontal position with slight vertical movement during active state
          let itemX = startX + i * (itemWidth + itemSpacing)
          let itemY = startY
          
          // Add subtle vertical movement during active phase
          if (isActive) {
            const moveUp = (itemProgress - 0.05) * 3 // Move up 3px during processing
            itemY = startY - moveUp
          } else if (isCompleted) {
            // Keep completed items at their final position
            itemY = startY - 2
          }
          
          // ENTERPRISE PATTERN DETECTION with real-time analysis
          const pattern = detectPattern(item.name, item.type)
          
          // ADVANCED STYLING based on analysis state and pattern risk
          let bgColor = '#f8fafc'
          let borderColor = '#e2e8f0'
          let textColor = '#475569'
          
          if (isActive) {
            // ANALYZING STATE - Show active analysis with pulsing effect
            const analysisPhase = Math.floor((itemProgress * 4)) % 4
            switch (analysisPhase) {
              case 0: // Scanning phase
                bgColor = '#fef3c7' // Light yellow
                borderColor = '#f59e0b' // Amber
                textColor = '#92400e'
                break
              case 1: // Pattern detection phase
                bgColor = '#fef2f2' // Light red
                borderColor = '#f87171' // Red
                textColor = '#dc2626'
                break
              case 2: // Risk assessment phase
                bgColor = '#f3e8ff' // Light purple
                borderColor = '#a855f7' // Purple
                textColor = '#7c3aed'
                break
              case 3: // Finalizing phase
                bgColor = pattern.color + '30' // Pattern color preview
                borderColor = pattern.color
                textColor = pattern.color
                break
            }
          } else if (isCompleted) {
            // COMPLETED STATE - Show final pattern-based colors with risk indication
            const riskAlpha = pattern.risk === 'critical' ? '40' : pattern.risk === 'high' ? '30' : '20'
            bgColor = pattern.color + riskAlpha
            borderColor = pattern.color
            textColor = pattern.color
          }
          
          // Item container with rounded corners
          ctx.fillStyle = bgColor
          ctx.strokeStyle = borderColor
          ctx.lineWidth = isActive ? 2 : 1
          roundRect(ctx, itemX, itemY, itemWidth, itemHeight, 6, true, true)
          
          // Item name (truncated to fit)
          ctx.fillStyle = textColor
          ctx.font = '8px ui-sans-serif, system-ui'
          const maxChars = Math.floor((itemWidth - 20) / 5)
          let displayName = item.name || item.item?.table || item.item?.schema || `Item ${i + 1}`
          if (displayName.length > maxChars) {
            displayName = displayName.slice(0, maxChars - 2) + '..'
          }
          ctx.fillText(displayName, itemX + 6, itemY + 13)
          
          // Status indicator on the right side
          const indicatorX = itemX + itemWidth - 12
          const indicatorY = itemY + 10
          
          if (isPending) {
            // Pending - small gray dot
            ctx.fillStyle = '#94a3b8'
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 1.5, 0, Math.PI * 2)
            ctx.fill()
            
          } else if (isActive) {
            // ENTERPRISE-GRADE ANALYZING SPINNER with multi-phase analysis indication
            ctx.save()
            
            // Determine analysis phase for different spinner styles
            const analysisPhase = Math.floor((itemProgress * 4)) % 4
            let spinnerColor = '#f59e0b' // Default amber
            let glowColor = 'rgba(245, 158, 11, 0.9)'
            
            switch (analysisPhase) {
              case 0: // Scanning
                spinnerColor = '#f59e0b'
                glowColor = 'rgba(245, 158, 11, 0.9)'
                break
              case 1: // Pattern detection
                spinnerColor = '#dc2626'
                glowColor = 'rgba(220, 38, 38, 0.9)'
                break
              case 2: // Risk assessment
                spinnerColor = '#7c3aed'
                glowColor = 'rgba(124, 58, 237, 0.9)'
                break
              case 3: // Finalizing
                spinnerColor = pattern.color
                glowColor = pattern.color + '90'
                break
            }
            
            // Multi-ring spinner for enterprise analysis
            ctx.shadowColor = glowColor
            ctx.shadowBlur = 15
            ctx.strokeStyle = spinnerColor
            ctx.lineWidth = 3
            ctx.beginPath()
            const spin = (t * 0.4 + i * 0.6) % (Math.PI * 2)
            ctx.arc(indicatorX, indicatorY, 6, spin, spin + Math.PI * 1.3)
            ctx.stroke()
            
            // Inner analysis ring
            ctx.shadowBlur = 10
            ctx.strokeStyle = spinnerColor
            ctx.lineWidth = 2
            ctx.beginPath()
            const innerSpin = (t * 0.6 + i * 0.8) % (Math.PI * 2)
            ctx.arc(indicatorX, indicatorY, 3.5, innerSpin, innerSpin + Math.PI * 0.8)
            ctx.stroke()
            
            // Pulsing analysis center with phase-based color
            const pulse = 0.6 + 0.4 * Math.sin(t * 0.3 + i * 0.5)
            ctx.shadowColor = glowColor
            ctx.shadowBlur = 8
            ctx.fillStyle = spinnerColor + Math.round(pulse * 255).toString(16).padStart(2, '0')
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 2.5, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.restore()
            
          } else if (isCompleted) {
            // ENTERPRISE PATTERN COMPLETION INDICATOR with risk-based styling
            ctx.save()
            
            // Risk-based background circle with enhanced glow
            const riskGlow = pattern.risk === 'critical' ? '80' : pattern.risk === 'high' ? '60' : '40'
            ctx.shadowColor = pattern.color + riskGlow
            ctx.shadowBlur = pattern.risk === 'critical' ? 15 : pattern.risk === 'high' ? 12 : 8
            ctx.fillStyle = pattern.color + '25'
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 7, 0, Math.PI * 2)
            ctx.fill()
            
            // Pattern type indicator with risk border
            ctx.strokeStyle = pattern.color
            ctx.lineWidth = pattern.risk === 'critical' ? 3 : pattern.risk === 'high' ? 2.5 : 2
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2)
            ctx.stroke()
            
            // Pattern symbol based on type
            ctx.shadowColor = pattern.color
            ctx.shadowBlur = 10
            ctx.fillStyle = pattern.color
            ctx.font = 'bold 9px ui-sans-serif, system-ui'
            ctx.textAlign = 'center'
            
            let patternSymbol = pattern.type.charAt(0).toUpperCase()
            switch (pattern.type) {
              case 'email': patternSymbol = '@'; break
              case 'phone': patternSymbol = '📞'; break
              case 'ssn': patternSymbol = '#'; break
              case 'credit_card': patternSymbol = '💳'; break
              case 'name': patternSymbol = '👤'; break
              case 'address': patternSymbol = '🏠'; break
              case 'ip': patternSymbol = '🌐'; break
              case 'url': patternSymbol = '🔗'; break
              case 'pii': patternSymbol = '🔒'; break
              default: patternSymbol = '?'; break
            }
            
            ctx.fillText(patternSymbol, indicatorX, indicatorY + 3)
            
            // Risk-based pulsing glow
            const riskPulse = pattern.risk === 'critical' ? 0.9 + 0.1 * Math.sin(t * 0.4 + i * 0.3) :
                             pattern.risk === 'high' ? 0.8 + 0.2 * Math.sin(t * 0.2 + i * 0.2) :
                             0.7 + 0.3 * Math.sin(t * 0.15 + i * 0.2)
            
            ctx.shadowColor = pattern.color + Math.round(riskPulse * 255).toString(16).padStart(2, '0')
            ctx.shadowBlur = 8
            ctx.fillStyle = pattern.color
            ctx.beginPath()
            ctx.arc(indicatorX, indicatorY, 1.5, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.restore()
            ctx.textAlign = 'left'
          }
        }
        
        // Show remaining items count
        if (stableItems.length > maxVisible) {
          ctx.fillStyle = '#64748b'
          ctx.font = '7px ui-sans-serif, system-ui'
          ctx.fillText(`+${stableItems.length - maxVisible} more`, startX + maxVisible * (itemWidth + itemSpacing), startY + 13)
        }
        
        // ENTERPRISE PROGRESS INDICATOR with analysis details
        const completedCount = Math.floor(displayProgress * stableItems.length)
        const currentlyAnalyzing = Math.ceil(displayProgress * stableItems.length) - completedCount
        
        ctx.fillStyle = '#0f172a'
        ctx.font = '8px ui-sans-serif, system-ui'
        
        if (completedCount === stableItems.length) {
          ctx.fillText(`Analysis Complete: ${stableItems.length} items processed`, x + 12, y + h - 8)
        } else {
          ctx.fillText(`Analyzing: ${completedCount}/${stableItems.length} items (${currentlyAnalyzing} active)`, x + 12, y + h - 8)
        }
      }
      
    } else {
      // ENTERPRISE WORKFLOW STAGES - Advanced animations for each step
      const isRecommending = title === 'AI Recommending'
      const isResolving = title === 'Resolving'
      const isApplying = title === 'Applying'
      const isCataloging = title === 'Cataloging'

      const itemsToUse = selectedItems.length > 0 ? selectedItems : Array.from({ length: Math.max(4, Math.min(12, itemsCount || 8)) }).map((_, i) => ({
        id: `synthetic-${i+1}`,
        name: `field_${i+1}`,
        type: (i % 3 === 0 ? 'string' : (i % 3 === 1 ? 'number' : 'date')),
        priority: 3,
        item: { schema: 'unknown', table: 'unknown' }
      }))

      if (isRecommending) {
        drawAIRecommendationCard(ctx, x, y, w, h, itemsToUse, progress01, t)
      } else if (isResolving) {
        drawResolutionEngineCard(ctx, x, y, w, h, itemsToUse, progress01, t)
      } else if (isApplying) {
        drawApplicationCard(ctx, x, y, w, h, itemsToUse, progress01, t)
      } else if (isCataloging) {
        drawCatalogingCard(ctx, x, y, w, h, itemsToUse, progress01, t)
      }
    }
  }

  // ENTERPRISE AI RECOMMENDATION CARD
  const drawAIRecommendationCard = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, items: any[], progress: number, t: number) => {
    const allCompleted = progress >= 0.95
    
    if (allCompleted) {
      // AI SUCCESS STATE
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 20px ui-sans-serif, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('🤖', x + w/2, y + h/2 - 8)
      
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 11px ui-sans-serif, system-ui'
      ctx.fillText('AI Recommendations Ready', x + w/2, y + h/2 + 8)
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '8px ui-sans-serif, system-ui'
      ctx.fillText(`${items.length} items processed`, x + w/2, y + h - 8)
      ctx.textAlign = 'left'
    } else {
      // AI PROCESSING ANIMATION
      const aiPhase = Math.floor((progress * 3)) % 3
      const phaseNames = ['Analyzing...', 'Learning...', 'Recommending...']
      
      // Neural network visualization
      for (let i = 0; i < 6; i++) {
        const nodeX = x + 20 + (i % 3) * 30
        const nodeY = y + 40 + Math.floor(i / 3) * 25
        const isActive = (t + i * 10) % 60 < 30
        
        ctx.fillStyle = isActive ? '#3b82f6' : '#e2e8f0'
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, 4, 0, Math.PI * 2)
        ctx.fill()
        
        // Connections
        if (i < 3) {
          ctx.strokeStyle = isActive ? '#3b82f6' : '#e2e8f0'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(nodeX + 4, nodeY)
          ctx.lineTo(nodeX + 26, nodeY + 25)
          ctx.stroke()
        }
      }
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '10px ui-sans-serif, system-ui'
      ctx.fillText(phaseNames[aiPhase], x + 12, y + h - 8)
    }
  }

  // ENTERPRISE RESOLUTION ENGINE CARD
  const drawResolutionEngineCard = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, items: any[], progress: number, t: number) => {
    const allCompleted = progress >= 0.95
    
    if (allCompleted) {
      ctx.fillStyle = '#6366f1'
      ctx.font = 'bold 20px ui-sans-serif, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('⚡', x + w/2, y + h/2 - 8)
      
      ctx.fillStyle = '#6366f1'
      ctx.font = 'bold 11px ui-sans-serif, system-ui'
      ctx.fillText('Resolution Complete', x + w/2, y + h/2 + 8)
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '8px ui-sans-serif, system-ui'
      ctx.fillText(`${items.length} conflicts resolved`, x + w/2, y + h - 8)
      ctx.textAlign = 'left'
    } else {
      // RESOLUTION ENGINE ANIMATION
      const enginePhase = Math.floor((progress * 4)) % 4
      const phases = ['Detecting...', 'Analyzing...', 'Resolving...', 'Validating...']
      
      // Gear animation
      ctx.save()
      ctx.translate(x + w/2, y + h/2 - 10)
      ctx.rotate((t * 0.05) % (Math.PI * 2))
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 3
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const r1 = 12
        const r2 = 16
        ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1)
        ctx.lineTo(Math.cos(angle + 0.2) * r2, Math.sin(angle + 0.2) * r2)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '10px ui-sans-serif, system-ui'
      ctx.fillText(phases[enginePhase], x + 12, y + h - 8)
    }
  }

  // ENTERPRISE APPLICATION CARD
  const drawApplicationCard = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, items: any[], progress: number, t: number) => {
    const allCompleted = progress >= 0.95
    
    if (allCompleted) {
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 20px ui-sans-serif, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('✅', x + w/2, y + h/2 - 8)
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 11px ui-sans-serif, system-ui'
      ctx.fillText('Applied Successfully', x + w/2, y + h/2 + 8)
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '8px ui-sans-serif, system-ui'
      ctx.fillText(`${items.length} items updated`, x + w/2, y + h - 8)
      ctx.textAlign = 'left'
    } else {
      // APPLICATION ANIMATION - Items flowing and being applied
      for (let i = 0; i < Math.min(4, items.length); i++) {
        const itemProgress = Math.max(0, Math.min(1, (progress - i * 0.2) / 0.3))
        const itemX = x + 15 + i * 25
        const itemY = y + 40 + Math.sin(t * 0.1 + i) * 3
        
        const alpha = itemProgress > 0 ? Math.min(1, itemProgress * 2) : 0.3
        ctx.globalAlpha = alpha
        
        ctx.fillStyle = itemProgress > 0.8 ? '#10b981' : '#f59e0b'
        ctx.beginPath()
        ctx.arc(itemX, itemY, 6, 0, Math.PI * 2)
        ctx.fill()
        
        if (itemProgress > 0.8) {
          ctx.fillStyle = '#ffffff'
          ctx.font = '8px ui-sans-serif, system-ui'
          ctx.textAlign = 'center'
          ctx.fillText('✓', itemX, itemY + 2)
          ctx.textAlign = 'left'
        }
      }
      ctx.globalAlpha = 1
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '10px ui-sans-serif, system-ui'
      ctx.fillText('Applying changes...', x + 12, y + h - 8)
    }
  }

  // ENTERPRISE CATALOGING CARD
  const drawCatalogingCard = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, items: any[], progress: number, t: number) => {
    const allCompleted = progress >= 0.95
    
    if (allCompleted) {
      ctx.fillStyle = '#334155'
      ctx.font = 'bold 20px ui-sans-serif, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('📚', x + w/2, y + h/2 - 8)
      
      ctx.fillStyle = '#334155'
      ctx.font = 'bold 11px ui-sans-serif, system-ui'
      ctx.fillText('Cataloged Successfully', x + w/2, y + h/2 + 8)
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '8px ui-sans-serif, system-ui'
      ctx.fillText(`${items.length} items stored`, x + w/2, y + h - 8)
      ctx.textAlign = 'left'
    } else {
      // CATALOGING ANIMATION - Items being stored in catalog
      const catalogPhase = Math.floor((progress * 3)) % 3
      const phases = ['Indexing...', 'Storing...', 'Finalizing...']
      
      // Database/catalog visualization
      for (let i = 0; i < 3; i++) {
        const shelfY = y + 35 + i * 12
        const shelfProgress = Math.max(0, Math.min(1, (progress - i * 0.2) / 0.4))
        
        // Shelf
        ctx.fillStyle = '#e2e8f0'
        ctx.fillRect(x + 15, shelfY, 80, 8)
        
        // Items being placed on shelf
        const itemCount = Math.floor(shelfProgress * 5)
        for (let j = 0; j < itemCount; j++) {
          ctx.fillStyle = '#334155'
          ctx.fillRect(x + 20 + j * 12, shelfY + 1, 10, 6)
        }
      }
      
      ctx.fillStyle = '#0f172a'
      ctx.font = '10px ui-sans-serif, system-ui'
      ctx.fillText(phases[catalogPhase], x + 12, y + h - 8)
    }
  }

  const drawBurst = (ctx: CanvasRenderingContext2D, a: NodeDef, b: NodeDef, t: number) => {
    const sx = a.x + 140
    const sy = a.y + 26
    const ex = b.x
    const ey = b.y + 26
    const cp1x = sx + Math.abs(ex - sx) * 0.33
    const cp1y = sy
    const cp2x = ex - Math.abs(ex - sx) * 0.33
    const cp2y = ey
    for (let i = 0; i < 24; i++) {
      const tt = ((t * 0.08) + i * 0.04) % 1
      const pos = cubicBezierPoint(sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, tt)
      ctx.fillStyle = 'rgba(15,23,42,0.9)'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawStatic = (t: number) => {
    try {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)
      drawGrid(ctx, w, h)

    const nodes = getNodes(w, h)
    
    // ENTERPRISE-GRADE STEP-BY-STEP PROGRESSION - NO MOVEMENT UNTIL STEP COMPLETE
    let percent = 0
    if (running && currentStep > 0) {
      // Only advance to next step when current step is 100% complete
      // Each step must be fully finished before proceeding
      const completedSteps = Math.max(0, currentStep - 1)
      percent = (completedSteps / totalSteps) * 100
      
      // Add current step progress only if it's the final completion phase
      if (currentStep <= totalSteps) {
        const currentStepProgress = 100 // Always show 100% for current step to avoid premature movement
        percent = ((completedSteps * 100) + currentStepProgress) / totalSteps
      }
    }

    ctx.save()
    ctx.lineWidth = 2
    ctx.setLineDash([12, 10])
    ctx.lineDashOffset = -((t % 200) / 200) * 22
    for (let i = 0; i < nodes.length - 1; i++) {
      drawBezier(ctx, nodes[i], nodes[i + 1], t)
    }
    ctx.restore()

    const stages = nodes.length
    // ENTERPRISE-GRADE STAGE CONTROL - WAIT FOR COMPLETE STEP BEFORE ADVANCING
    let stageIdx = 0
    let stageProgress = 0
    
    if (running && currentStep > 0) {
      // Only advance stage when previous stage is 100% complete
      stageIdx = Math.min(stages - 1, Math.max(0, currentStep - 1))
      
      // Current stage shows full progress immediately for step-by-step control
      stageProgress = 1.0
      
      // CRITICAL: No partial progress - either 0% or 100% per stage
      // This prevents tunnel animations until step completion
    } else {
      stageIdx = Math.min(stages - 1, Math.floor((percent / 100) * stages))
      stageProgress = Math.max(0, Math.min(1, (percent / 100) * stages - stageIdx))
    }
    
    // ENTERPRISE CONTROL: Full progress for active stage, no partial animations
    const enhancedProgress = stageProgress
    

    nodes.forEach((n, i) => {
      const complete = i < stageIdx
      const active = i === stageIdx
      const p = complete ? 1 : active ? enhancedProgress : 0
      if (active) {
        const title = n.label === 'Select' ? 'Selecting' : n.label === 'Analyze' ? 'Analyzing' : n.label === 'Recommend' ? 'AI Recommending' : n.label === 'Resolve' ? 'Resolving' : n.label === 'Apply' ? 'Applying' : 'Cataloging'
        const stableItems = itemsRef.current && itemsRef.current.length > 0 ? itemsRef.current : (selectedItems || [])
        const items = n.label === 'Select' ? Math.max(8, Math.min(32, (stableItems.length || metrics.autoResolvable || 16))) : (stableItems.length || 12)
        
        
        // Ensure drawStepCard sees a non-empty selectedItems by shadowing the variable within this scope
        const originalSelected = selectedItems as any
        try {
          ;(selectedItems as any) = (stableItems.length ? stableItems : originalSelected)
          drawStepCard(ctx, n, title, items, enhancedProgress, t)
        } finally {
          ;(selectedItems as any) = originalSelected
        }
      } else {
        drawNode(ctx, n, active || complete, p, t)
      }
    })

    if (stageProgress > 0.98 && stageIdx < nodes.length - 1) {
      drawBurst(ctx, nodes[stageIdx], nodes[stageIdx + 1], t)
    }

    drawParticles(ctx, nodes, t)
    } catch (error) {
      console.error('Error in drawStatic:', error)
    }
  }

  const ensureParticles = (paths: number) => {
    const arr = particlesRef.current
    const target = 80 // Normal particle count for good visual effects
    while (arr.length < target) {
      arr.push({ t: Math.random(), speed: 0.003 + Math.random() * 0.012, pathIndex: Math.floor(Math.random() * paths), hue: 210 + Math.floor(Math.random() * 20), radius: 1.6 + Math.random() * 1.2 })
    }
    if (arr.length > target) arr.splice(target)
  }

  const drawParticles = (ctx: CanvasRenderingContext2D, nodes: NodeDef[], t: number) => {
    ensureParticles(nodes.length - 1)
    const arr = particlesRef.current
    for (const p of arr) {
      p.t += p.speed
      if (p.t > 1) { p.t = 0; p.pathIndex = (p.pathIndex + 1) % (nodes.length - 1) }
      const a = nodes[p.pathIndex]
      const b = nodes[p.pathIndex + 1]
      const sx = a.x + 140
      const sy = a.y + 26
      const ex = b.x
      const ey = b.y + 26
      const cp1x = sx + Math.abs(ex - sx) * 0.33
      const cp1y = sy + Math.sin((t + p.pathIndex * 20) * 0.01) * 2
      const cp2x = ex - Math.abs(ex - sx) * 0.33
      const cp2y = ey + Math.cos((t + p.pathIndex * 20) * 0.01) * 2
      const pos = cubicBezierPoint(sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, p.t)
      ctx.fillStyle = `hsla(${p.hue}, 42%, 22%, 0.9)`
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const cubicBezierPoint = (sx: number, sy: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, ex: number, ey: number, t: number) => {
    const u = 1 - t
    const tt = t * t
    const uu = u * u
    const uuu = uu * u
    const ttt = tt * t
    const x = uuu * sx + 3 * uu * t * cp1x + 3 * u * tt * cp2x + ttt * ex
    const y = uuu * sy + 3 * uu * t * cp1y + 3 * u * tt * cp2y + ttt * ey
    return { x, y }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let mounted = true

    const animate = () => {
      if (!mounted) return
      try {
        const t = tickRef.current
        drawStatic(t)
        tickRef.current += 1
        rafRef.current = requestAnimationFrame(animate)
      } catch (error) {
        console.error('Error in animation loop:', error)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => { mounted = false; if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [basePercent, currentStep, running])

  return (
    <div className="border border-slate-200 rounded-sm p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-slate-300">Mode: {mode.replace('_', '-')}</Badge>
          <Badge variant="outline" className="text-xs border-slate-300">Success {successRate}%</Badge>
          <Badge variant="outline" className="text-xs border-slate-300">Steps {currentStep}/{totalSteps}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onExit} className="h-8">Return to Overview</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3" ref={containerRef}>
          <canvas ref={canvasRef} className="w-full border border-slate-200 rounded" />
        </div>
        <div className="col-span-1 border border-slate-200 rounded p-3">
          <div className="text-xs text-slate-600 mb-2">Automation Metrics</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span>Auto-Resolvable</span><span className="font-mono">{metrics.autoResolvable}</span></div>
            <div className="flex justify-between"><span>Requires Review</span><span className="font-mono">{metrics.requiresReview}</span></div>
            <div className="flex justify-between"><span>High Risk</span><span className="font-mono">{metrics.highRisk}</span></div>
          </div>
        </div>
        <div className="col-span-2 border border-slate-200 rounded p-3">
          <div className="text-xs text-slate-600 mb-2">Execution Progress</div>
          <Progress value={basePercent} className="h-2 bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default WorkflowVisualizer


