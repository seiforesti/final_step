"use client"

import { Gauge, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface QualityIndicatorProps {
  score: number
  showLabel?: boolean
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function QualityIndicator({ 
  score, 
  showLabel = true, 
  showProgress = false,
  size = 'md',
  className 
}: QualityIndicatorProps) {
  const getQualityLevel = (score: number) => {
    if (score >= 90) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle }
    if (score >= 80) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-100', icon: Gauge }
    if (score >= 70) return { level: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle }
    return { level: 'poor', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle }
  }

  const quality = getQualityLevel(score)
  const Icon = quality.icon

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const badgeVariant = score >= 90 ? 'default' : score >= 70 ? 'secondary' : 'destructive'

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("p-1 rounded-full", quality.bg)}>
        <Icon className={cn(sizeClasses[size], quality.color)} />
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", quality.color)}>
            {Math.round(score)}%
          </span>
          <Badge variant={badgeVariant} className="text-xs capitalize">
            {quality.level}
          </Badge>
        </div>
      )}
      
      {showProgress && (
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Progress value={score} className="h-2" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {Math.round(score)}%
          </span>
        </div>
      )}
    </div>
  )
}

interface QualityBreakdownProps {
  metrics: {
    completeness: number
    consistency: number
    validity: number
    uniqueness: number
  }
  className?: string
}

export function QualityBreakdown({ metrics, className }: QualityBreakdownProps) {
  const overallScore = (metrics.completeness + metrics.consistency + metrics.validity + metrics.uniqueness) / 4

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Overall Quality</span>
        <QualityIndicator score={overallScore} />
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Completeness</span>
          <QualityIndicator score={metrics.completeness} showLabel={false} showProgress />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Consistency</span>
          <QualityIndicator score={metrics.consistency} showLabel={false} showProgress />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Validity</span>
          <QualityIndicator score={metrics.validity} showLabel={false} showProgress />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Uniqueness</span>
          <QualityIndicator score={metrics.uniqueness} showLabel={false} showProgress />
        </div>
      </div>
    </div>
  )
}