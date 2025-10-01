import type React from "react"
import { Loader2, Database, Activity, Zap, Shield, Brain } from "lucide-react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Progress } from "../ui/progress"

interface LoadingStateProps {
  type?: "default" | "data" | "processing" | "ai" | "security" | "system"
  message?: string
  progress?: number
  details?: string[]
  showProgress?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "card" | "inline" | "overlay"
}

const loadingConfigs = {
  default: {
    icon: Loader2,
    color: "text-primary",
    bgColor: "bg-primary/10",
    message: "Loading...",
  },
  data: {
    icon: Database,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    message: "Processing data governance...",
  },
  processing: {
    icon: Activity,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    message: "Processing workflows...",
  },
  ai: {
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    message: "AI analysis in progress...",
  },
  security: {
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    message: "Security validation...",
  },
  system: {
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    message: "System initialization...",
  },
}

export const EnterpriseLoadingState: React.FC<LoadingStateProps> = ({
  type = "default",
  message,
  progress,
  details = [],
  showProgress = false,
  size = "md",
  variant = "card",
}) => {
  const config = loadingConfigs[type] || loadingConfigs.default
  const IconComponent = config?.icon || Loader2
  const displayMessage = message || config?.message || "Loading..."

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`p-3 rounded-full ${config?.bgColor || 'bg-primary/10'}`}>
        <IconComponent className={`${sizeClasses[size]} ${config?.color || 'text-primary'} animate-spin`} />
      </div>

      <div className="text-center space-y-2">
        <p className="font-medium text-foreground">{displayMessage}</p>

        {showProgress && typeof progress === "number" && (
          <div className="w-64 space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {details.length > 0 && (
          <div className="space-y-1">
            {details.map((detail, index) => (
              <p key={index} className="text-xs text-muted-foreground">
                {detail}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 p-2">
        <IconComponent className={`${sizeClasses.sm} ${config?.color || 'text-primary'} animate-spin`} />
        <span className="text-sm text-muted-foreground">{displayMessage}</span>
      </div>
    )
  }

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <LoadingContent />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <LoadingContent />
      </CardContent>
    </Card>
  )
}

// Specialized loading components for different contexts
export const DataGovernanceLoader: React.FC<Omit<LoadingStateProps, "type">> = (props) => (
  <EnterpriseLoadingState {...props} type="data" />
)

export const AIProcessingLoader: React.FC<Omit<LoadingStateProps, "type">> = (props) => (
  <EnterpriseLoadingState {...props} type="ai" />
)

export const SecurityLoader: React.FC<Omit<LoadingStateProps, "type">> = (props) => (
  <EnterpriseLoadingState {...props} type="security" />
)

export const SystemLoader: React.FC<Omit<LoadingStateProps, "type">> = (props) => (
  <EnterpriseLoadingState {...props} type="system" />
)

// Skeleton loading components
export const DataTableSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <div className="h-6 bg-muted rounded w-48 animate-pulse" />
      <div className="h-8 bg-muted rounded w-24 animate-pulse" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        <div className="h-4 bg-muted rounded w-16 animate-pulse" />
      </div>
    ))}
  </div>
)

export const DashboardSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="h-5 bg-muted rounded w-32 animate-pulse" />
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    ))}
  </div>
)
