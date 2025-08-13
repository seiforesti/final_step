import type React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  message?: string
  progress?: number
  className?: string
  variant?: "default" | "overlay" | "inline"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message,
  progress,
  className,
  variant = "default",
}) => {
  const spinnerContent = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary", className)} />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-medium text-primary">{Math.round(progress)}%</div>
          </div>
        )}
      </div>

      {message && <div className="text-sm text-muted-foreground text-center max-w-xs">{message}</div>}

      {progress !== undefined && (
        <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )

  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary", className)} />
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    )
  }

  return <div className="flex items-center justify-center p-8">{spinnerContent}</div>
}

// Loading skeleton components for different content types
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
)

export const TableLoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <LoadingSkeleton className="h-4 w-4" />
        <LoadingSkeleton className="h-4 flex-1" />
        <LoadingSkeleton className="h-4 w-20" />
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-12" />
      </div>
    ))}
  </div>
)

export const CardLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <LoadingSkeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
      </div>
    </div>
    <LoadingSkeleton className="h-20 w-full" />
    <div className="flex space-x-2">
      <LoadingSkeleton className="h-6 w-16" />
      <LoadingSkeleton className="h-6 w-20" />
      <LoadingSkeleton className="h-6 w-14" />
    </div>
  </div>
)
