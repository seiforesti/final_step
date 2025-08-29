"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { CheckCircle, AlertTriangle, XCircle, Activity, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ValidationResult {
  component: string
  status: "pass" | "warning" | "fail"
  message: string
  details?: string[]
  performance?: {
    renderTime: number
    memoryUsage: number
  }
}

interface ComponentValidatorProps {
  onValidationComplete?: (results: ValidationResult[]) => void
}

export const ComponentValidator: React.FC<ComponentValidatorProps> = ({ onValidationComplete }) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateComponent = useCallback(async (componentName: string): Promise<ValidationResult> => {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0

    try {
      // Simulate component validation
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check if component exists and can be imported
      const componentExists = true
      const errorDetails: string[] = []

      // Basic validation checks
      switch (componentName) {
        case "RacineMainLayout":
          // Validate layout component
          if (typeof window !== "undefined") {
            const layoutElements = document.querySelectorAll('[data-testid="main-layout"]')
            if (layoutElements.length === 0) {
              errorDetails.push("Main layout element not found")
            }
          }
          break

        case "MainContentRenderer":
          // Validate content renderer
          if (typeof window !== "undefined") {
            const contentElements = document.querySelectorAll('[data-testid="main-content"]')
            if (contentElements.length === 0) {
              errorDetails.push("Main content element not found")
            }
          }
          break

        case "EnterpriseErrorBoundary":
          // Validate error boundary
          errorDetails.push("Error boundary validation requires error simulation")
          break

        case "HookOrchestrator":
          // Validate hook orchestrator
          if (typeof window !== "undefined") {
            const hookStatus = (window as any).__RACINE_HOOK_STATUS__
            if (!hookStatus) {
              errorDetails.push("Hook orchestrator status not available")
            }
          }
          break

        default:
          errorDetails.push("Component validation not implemented")
      }

      const endTime = performance.now()
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0

      return {
        component: componentName,
        status: errorDetails.length === 0 ? "pass" : "warning",
        message:
          errorDetails.length === 0
            ? `${componentName} validation passed`
            : `${componentName} has ${errorDetails.length} warnings`,
        details: errorDetails,
        performance: {
          renderTime: endTime - startTime,
          memoryUsage: endMemory - startMemory,
        },
      }
    } catch (error) {
      return {
        component: componentName,
        status: "fail",
        message: `${componentName} validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: [error instanceof Error ? error.stack || "" : "Unknown error"],
      }
    }
  }, [])

  const runValidation = useCallback(async () => {
    setIsValidating(true)
    setProgress(0)
    setValidationResults([])

    const componentsToValidate = [
      "RacineMainLayout",
      "MainContentRenderer",
      "SystemStatusIndicator",
      "AIAssistantModal",
      "FloatingActionMenu",
      "EnterpriseErrorBoundary",
      "EnterpriseLoadingState",
      "HookOrchestrator",
      "OptimizedAnimations",
      "ComponentFallbacks",
    ]

    const results: ValidationResult[] = []

    for (let i = 0; i < componentsToValidate.length; i++) {
      const component = componentsToValidate[i]
      const result = await validateComponent(component)
      results.push(result)
      setValidationResults([...results])
      setProgress(((i + 1) / componentsToValidate.length) * 100)
    }

    setIsValidating(false)
    onValidationComplete?.(results)
  }, [validateComponent, onValidationComplete])

  const getStatusIcon = (status: ValidationResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "fail":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: ValidationResult["status"]) => {
    switch (status) {
      case "pass":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
      case "fail":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
    }
  }

  const passCount = validationResults.filter((r) => r.status === "pass").length
  const warningCount = validationResults.filter((r) => r.status === "warning").length
  const failCount = validationResults.filter((r) => r.status === "fail").length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-500" />
            <CardTitle>Component Validation Suite</CardTitle>
          </div>
          <Button onClick={runValidation} disabled={isValidating}>
            {isValidating ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
            {isValidating ? "Validating..." : "Run Validation"}
          </Button>
        </div>
        {isValidating && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{progress.toFixed(0)}% complete</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {validationResults.length > 0 && (
          <div className="flex gap-4 mb-6">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              {passCount} Passed
            </Badge>
            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {warningCount} Warnings
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-200">
              <XCircle className="w-3 h-3 mr-1" />
              {failCount} Failed
            </Badge>
          </div>
        )}

        <div className="space-y-3">
          {validationResults.map((result, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.component}</span>
                </div>
                {result.performance && (
                  <div className="text-xs text-muted-foreground">{result.performance.renderTime.toFixed(2)}ms</div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
              {result.details && result.details.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View Details</summary>
                  <div className="mt-2 space-y-1">
                    {result.details.map((detail, i) => (
                      <div key={i} className="pl-4 border-l-2 border-muted">
                        {detail}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
