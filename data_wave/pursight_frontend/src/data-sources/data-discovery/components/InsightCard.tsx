"use client"

import { Brain, Sparkles, Target, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface InsightCardProps {
  insight: {
    id: string
    type: 'quality' | 'pattern' | 'relationship' | 'anomaly' | 'recommendation'
    title: string
    description: string
    confidence: number
    impact: 'low' | 'medium' | 'high'
    category: string
    metadata?: any
  }
  className?: string
  compact?: boolean
}

export function InsightCard({ insight, className, compact = false }: InsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'quality': return CheckCircle
      case 'pattern': return Target
      case 'relationship': return Brain
      case 'anomaly': return AlertTriangle
      case 'recommendation': return Sparkles
      default: return Info
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'quality': return 'text-green-500'
      case 'pattern': return 'text-blue-500'
      case 'relationship': return 'text-purple-500'
      case 'anomaly': return 'text-red-500'
      case 'recommendation': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const Icon = getInsightIcon(insight.type)
  const iconColor = getInsightColor(insight.type)

  if (compact) {
    return (
      <div className={cn(
        "p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors",
        className
      )}>
        <div className="flex items-start gap-2">
          <Icon className={cn("h-4 w-4 mt-0.5", iconColor)} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{insight.title}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{insight.description}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {insight.category}
              </Badge>
              <Badge variant={getImpactVariant(insight.impact)} className="text-xs">
                {insight.impact} impact
              </Badge>
              <span className="text-xs text-muted-foreground">
                {Math.round(insight.confidence * 100)}% confident
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className={cn("p-2 rounded-lg bg-muted", iconColor.replace('text-', 'bg-').replace('-500', '-100'))}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{insight.title}</div>
            <div className="text-xs text-muted-foreground font-normal">{insight.category}</div>
          </div>
          <Badge variant={getImpactVariant(insight.impact)} className="text-xs">
            {insight.impact}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
          </div>
          <Progress value={insight.confidence * 100} className="h-2" />
        </div>

        {insight.metadata && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs font-medium mb-2">Additional Details</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {Object.entries(insight.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface InsightGridProps {
  insights: InsightCardProps['insight'][]
  className?: string
  compact?: boolean
  maxItems?: number
}

export function InsightGrid({ insights, className, compact = false, maxItems }: InsightGridProps) {
  const displayInsights = maxItems ? insights.slice(0, maxItems) : insights

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {displayInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} compact />
        ))}
        {maxItems && insights.length > maxItems && (
          <div className="text-center py-2">
            <Badge variant="outline" className="text-xs">
              +{insights.length - maxItems} more insights
            </Badge>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {displayInsights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}