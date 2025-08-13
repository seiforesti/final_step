"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, AlertTriangle, CheckCircle, XCircle, Shield, BarChart3, Lightbulb } from "lucide-react"
import type { ScanResults, ScanIssue } from "./types"

interface ScanResultsViewProps {
  results: ScanResults
  onUpdateIssueStatus: (issueId: string, status: ScanIssue["status"]) => Promise<void>
}

export function ScanResultsView({ results, onUpdateIssueStatus }: ScanResultsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredIssues = results.issues.filter((issue) => {
    if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (severityFilter !== "all" && issue.severity !== severityFilter) {
      return false
    }
    if (typeFilter !== "all" && issue.type !== typeFilter) {
      return false
    }
    if (statusFilter !== "all" && issue.status !== statusFilter) {
      return false
    }
    return true
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="h-4 w-4" />
      case "data_quality":
        return <BarChart3 className="h-4 w-4" />
      case "compliance":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Tabs defaultValue="issues" className="space-y-4">
      <TabsList>
        <TabsTrigger value="issues">Issues ({results.issues.length})</TabsTrigger>
        <TabsTrigger value="classifications">Classifications ({results.classifications.length})</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations ({results.recommendations.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="issues" className="space-y-4">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="data_quality">Data Quality</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="ignored">Ignored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <Card key={issue.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getSeverityColor(issue.severity)} border-0`}>{issue.severity}</Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getTypeIcon(issue.type)}
                        <span className="capitalize">{issue.type.replace("_", " ")}</span>
                      </Badge>
                      <Badge variant={issue.status === "resolved" ? "default" : "secondary"}>{issue.status}</Badge>
                    </div>
                    <CardTitle className="text-base">{issue.title}</CardTitle>
                    <CardDescription>{issue.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {issue.status === "open" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onUpdateIssueStatus(issue.id, "resolved")}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onUpdateIssueStatus(issue.id, "ignored")}>
                          <XCircle className="h-3 w-3 mr-1" />
                          Ignore
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Entity:</span>
                    <p className="font-mono text-xs mt-1">{issue.entity}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <p className="mt-1">{issue.impact}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Recommendation:</span>
                  <p className="text-sm mt-1">{issue.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No issues found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || severityFilter !== "all" || typeFilter !== "all" || statusFilter !== "all"
                  ? "No issues match your current filters."
                  : "Great! No issues were discovered during this scan."}
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="classifications" className="space-y-4">
        <div className="space-y-4">
          {results.classifications.map((classification) => (
            <Card key={classification.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{classification.name}</Badge>
                      <Badge variant="secondary">{classification.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(classification.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{classification.entity}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Applied by {classification.appliedBy}</p>
                    <p>{new Date(classification.appliedAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="recommendations" className="space-y-4">
        <div className="space-y-4">
          {results.recommendations.map((recommendation) => (
            <Card key={recommendation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <Badge className={`${getPriorityColor(recommendation.priority)} border-0`}>
                        {recommendation.priority} priority
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {recommendation.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{recommendation.title}</CardTitle>
                    <CardDescription>{recommendation.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <p className="mt-1">{recommendation.impact}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Effort:</span>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {recommendation.effort}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Affected Entities:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {recommendation.entities.map((entity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs font-mono">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
