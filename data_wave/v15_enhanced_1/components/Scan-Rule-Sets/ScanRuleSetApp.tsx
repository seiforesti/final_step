"use client"

import React, { useState, useCallback } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Code, Activity, Database, Target, Zap } from "lucide-react"
import { ScanRuleSetList } from "./components/ScanRuleSetList"
import { CustomScanRuleList } from "./components/CustomScanRuleList"
import { useAnalytics } from "./hooks/useAnalytics"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface ScanRuleSetAppProps {
  dataSourceId?: number
  embedded?: boolean
  height?: number
}

const ScanRuleSetAppContent: React.FC<ScanRuleSetAppProps> = ({ dataSourceId, embedded = false, height }) => {
  const [activeTab, setActiveTab] = useState("rule-sets")
  const [selectedRuleSetIds, setSelectedRuleSetIds] = useState<number[]>([])

  const { trackPageView, trackEvent } = useAnalytics()

  // Track page view on mount
  React.useEffect(() => {
    trackPageView("scan_rule_sets", {
      embedded,
      data_source_id: dataSourceId,
    })
  }, [trackPageView, embedded, dataSourceId])

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value)
      trackEvent("tab_changed", { tab: value })
    },
    [trackEvent],
  )

  const handleSelectionChange = useCallback(
    (selectedIds: number[]) => {
      setSelectedRuleSetIds(selectedIds)
      if (selectedIds.length > 0) {
        trackEvent("rule_sets_selected", { count: selectedIds.length })
      }
    },
    [trackEvent],
  )

  return (
    <div className={`space-y-6 ${embedded ? "p-0" : "p-6"}`} style={{ height }}>
      {/* Header */}
      {!embedded && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Scan Rule Sets</h1>
              <p className="text-muted-foreground">Manage data scanning patterns and custom classification rules</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">Rule Sets</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-muted-foreground">Custom Rules</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Total Scans</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">98.5%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rule-sets" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Scan Rule Sets
            <Badge variant="secondary" className="ml-1">
              12
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="custom-rules" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Custom Rules
            <Badge variant="secondary" className="ml-1">
              8
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rule-sets" className="space-y-6">
          <ScanRuleSetList
            dataSourceId={dataSourceId}
            embedded={embedded}
            height={height ? height - (embedded ? 100 : 400) : undefined}
            onSelectionChange={handleSelectionChange}
          />
        </TabsContent>

        <TabsContent value="custom-rules" className="space-y-6">
          <CustomScanRuleList />
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedRuleSetIds.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {selectedRuleSetIds.length} rule set{selectedRuleSetIds.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ready for bulk operations</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const ScanRuleSetApp: React.FC<ScanRuleSetAppProps> = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ScanRuleSetAppContent {...props} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </QueryClientProvider>
  )
}
