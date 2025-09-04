"use client"
import { SystemHealthDashboard } from "@/components/testing/SystemHealthDashboard"

export default function TestPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Racine System Testing & Validation</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive testing suite for the enterprise data governance platform
        </p>
      </div>

      <SystemHealthDashboard
        onHealthCheck={(status) => {
          console.log("System health status:", status)
        }}
      />
    </div>
  )
}
