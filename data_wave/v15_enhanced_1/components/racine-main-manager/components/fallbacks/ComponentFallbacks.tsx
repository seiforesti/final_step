"use client"

import type React from "react"
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FallbackProps {
  title?: string
  description?: string
  action?: () => void
  actionLabel?: string
  showHomeButton?: boolean
  showBackButton?: boolean
}

export const ComponentFallback: React.FC<FallbackProps> = ({
  title = "Component Unavailable",
  description = "This component is temporarily unavailable. Please try again.",
  action,
  actionLabel = "Retry",
  showHomeButton = false,
  showBackButton = false,
}) => (
  <Card className="w-full max-w-md mx-auto my-4">
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 p-3 rounded-full bg-muted">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      {action && (
        <Button onClick={action} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
      {showBackButton && (
        <Button variant="outline" onClick={() => window.history.back()} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      )}
      {showHomeButton && (
        <Button variant="ghost" onClick={() => (window.location.href = "/")} className="w-full">
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      )}
    </CardContent>
  </Card>
)

export const DataFallback: React.FC<FallbackProps> = (props) => (
  <ComponentFallback
    title="Data Unavailable"
    description="Unable to load data. Please check your connection and try again."
    {...props}
  />
)

export const FeatureFallback: React.FC<FallbackProps> = (props) => (
  <ComponentFallback
    title="Feature Unavailable"
    description="This feature is temporarily unavailable. We're working to restore it."
    {...props}
  />
)
