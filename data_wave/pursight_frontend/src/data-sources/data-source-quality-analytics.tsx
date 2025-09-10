"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity, CheckCircle, AlertTriangle, XCircle, Clock, Database, Target, Zap, Shield, AlertCircle, Filter, Download, Upload, RefreshCw, Settings, Calendar, Eye, ArrowUp, ArrowDown, Minus, Users, FileText, ThumbsUp, ThumbsDown, Star, Bug, CheckSquare, Square, Search, MoreHorizontal,  } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
} from "recharts"

import { DataSource, QualityMetrics, QualityIssue, QualityRule } from "./types"
import {
  useQualityMetricsQuery,
  useQualityIssuesQuery,
  useQualityRulesQuery,
  useQualityTrendsQuery,
  useCreateQualityRuleMutation,
  useResolveIssueMutation,
} from "./services/apis"

interface DataSourceQualityAnalyticsProps {
  dataSource: DataSource
}

export function DataSourceQualityAnalytics({ dataSource }: DataSourceQualityAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("overall")
  const [showFilters, setShowFilters] = useState(false)
  const [issueFilter, setIssueFilter] = useState("all")
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    type: "completeness",
    condition: "",
    severity: "medium",
    enabled: true,
  })

  // Queries
  const { data: qualityMetrics, isLoading: metricsLoading } = useQualityMetricsQuery(dataSource.id, timeRange)
  const { data: qualityIssues, isLoading: issuesLoading } = useQualityIssuesQuery(dataSource.id, {
    filter: issueFilter,
    timeRange,
  })
  const { data: qualityRules, isLoading: rulesLoading } = useQualityRulesQuery(dataSource.id)
  const { data: qualityTrends, isLoading: trendsLoading } = useQualityTrendsQuery(dataSource.id, timeRange)

  // Mutations
  const createRuleMutation = useCreateQualityRuleMutation()
  const resolveIssueMutation = useResolveIssueMutation()

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const handleCreateRule = async () => {
    try {
      await createRuleMutation.mutateAsync({
        data_source_id: dataSource.id,
        ...newRule,
      })
      setRuleDialogOpen(false)
      setNewRule({
        name: "",
        description: "",
        type: "completeness",
        condition: "",
        severity: "medium",
        enabled: true,
      })
    } catch (error) {
      console.error("Failed to create quality rule:", error)
    }
  }

  const handleResolveIssue = async (issueId: string) => {
    try {
      await resolveIssueMutation.mutateAsync(issueId)
    } catch (error) {
      console.error("Failed to resolve issue:", error)
    }
  }

  const getQualityScore = (metrics?: QualityMetrics) => {
    if (!metrics) return 0
    return Math.round(
      ((metrics.completeness_score + metrics.accuracy_score + metrics.consistency_score + metrics.validity_score) / 4) * 100
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 70) return "secondary"
    return "destructive"
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const qualityScoreData = useMemo(() => {
    if (!qualityMetrics) return []
    return [
      { name: "Completeness", value: Math.round(qualityMetrics.completeness_score * 100), color: COLORS[0] },
      { name: "Accuracy", value: Math.round(qualityMetrics.accuracy_score * 100), color: COLORS[1] },
      { name: "Consistency", value: Math.round(qualityMetrics.consistency_score * 100), color: COLORS[2] },
      { name: "Validity", value: Math.round(qualityMetrics.validity_score * 100), color: COLORS[3] },
    ]
  }, [qualityMetrics])

  const issuesByTypeData = useMemo(() => {
    if (!qualityIssues) return []
    const groupedIssues = qualityIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(groupedIssues).map(([type, count], index) => ({
      name: type,
      value: count,
      color: COLORS[index % COLORS.length]
    }))
  }, [qualityIssues])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Quality Analytics</h2>
          <p className="text-muted-foreground">
            Monitor and analyze data quality metrics for {dataSource.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics Details</TabsTrigger>
          <TabsTrigger value="issues">Quality Issues</TabsTrigger>
          <TabsTrigger value="rules">Quality Rules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Overall Quality Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Overall Data Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(getQualityScore(qualityMetrics))}`}>
                      {getQualityScore(qualityMetrics)}%
                    </div>
                    <p className="text-muted-foreground mt-2">
                      Overall Quality Score
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Badge variant={getScoreVariant(getQualityScore(qualityMetrics))}>
                        {getQualityScore(qualityMetrics) >= 90 ? "Excellent" :
                         getQualityScore(qualityMetrics) >= 70 ? "Good" : "Needs Improvement"}
                      </Badge>
                      {qualityMetrics?.score_change !== undefined && (
                        <div className="flex items-center gap-1">
                          {getTrendIcon(qualityMetrics.score_change)}
                          <span className="text-sm">
                            {Math.abs(qualityMetrics.score_change).toFixed(1)}% vs last period
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quality Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              qualityScoreData.map((dimension) => (
                <Card key={dimension.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{dimension.name}</p>
                      <span className={`text-lg font-bold ${getScoreColor(dimension.value)}`}>
                        {dimension.value}%
                      </span>
                    </div>
                    <Progress value={dimension.value} className="h-2" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={qualityScoreData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {qualityScoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Issues by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issues by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {issuesLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={issuesByTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {issuesByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Resolved Issues</p>
                    <p className="text-2xl font-bold">{qualityMetrics?.resolved_issues || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                    <p className="text-2xl font-bold">{qualityMetrics?.open_issues || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                    <p className="text-2xl font-bold">{qualityMetrics?.active_rules || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Tables Monitored</p>
                    <p className="text-2xl font-bold">{qualityMetrics?.monitored_tables || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Details Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {/* Quality Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quality Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={qualityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="completeness" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="accuracy" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="consistency" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="validity" stackId="1" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completeness Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Null Values</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-20 h-2" />
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Empty Strings</span>
                  <div className="flex items-center gap-2">
                    <Progress value={92} className="w-20 h-2" />
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Missing Records</span>
                  <div className="flex items-center gap-2">
                    <Progress value={78} className="w-20 h-2" />
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accuracy Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Data Type Validation</span>
                  <div className="flex items-center gap-2">
                    <Progress value={95} className="w-20 h-2" />
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Format Validation</span>
                  <div className="flex items-center gap-2">
                    <Progress value={88} className="w-20 h-2" />
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Range Validation</span>
                  <div className="flex items-center gap-2">
                    <Progress value={91} className="w-20 h-2" />
                    <span className="text-sm font-medium">91%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consistency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Cross-Table Consistency</span>
                  <div className="flex items-center gap-2">
                    <Progress value={83} className="w-20 h-2" />
                    <span className="text-sm font-medium">83%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Referential Integrity</span>
                  <div className="flex items-center gap-2">
                    <Progress value={94} className="w-20 h-2" />
                    <span className="text-sm font-medium">94%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duplicate Records</span>
                  <div className="flex items-center gap-2">
                    <Progress value={97} className="w-20 h-2" />
                    <span className="text-sm font-medium">97%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validity Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Business Rules</span>
                  <div className="flex items-center gap-2">
                    <Progress value={89} className="w-20 h-2" />
                    <span className="text-sm font-medium">89%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Domain Validation</span>
                  <div className="flex items-center gap-2">
                    <Progress value={92} className="w-20 h-2" />
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pattern Matching</span>
                  <div className="flex items-center gap-2">
                    <Progress value={86} className="w-20 h-2" />
                    <span className="text-sm font-medium">86%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search issues..." className="pl-10" />
                </div>
                <Select value={issueFilter} onValueChange={setIssueFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issues</SelectItem>
                    <SelectItem value="open">Open Issues</SelectItem>
                    <SelectItem value="resolved">Resolved Issues</SelectItem>
                    <SelectItem value="critical">Critical Issues</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues</CardTitle>
              <CardDescription>
                {qualityIssues?.length || 0} issues found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[300px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {qualityIssues?.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(issue.severity)}
                          <div>
                            <h4 className="font-medium">{issue.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={issue.status === "resolved" ? "default" : "destructive"}>
                            {issue.status}
                          </Badge>
                          <Badge variant="outline">{issue.severity}</Badge>
                          {issue.status !== "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveIssue(issue.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Table:</span> {issue.table_name}
                        </div>
                        <div>
                          <span className="font-medium">Column:</span> {issue.column_name || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {issue.type}
                        </div>
                        <div>
                          <span className="font-medium">Detected:</span>{" "}
                          {new Date(issue.detected_at).toLocaleDateString()}
                        </div>
                      </div>

                      {issue.affected_rows && (
                        <div className="mt-2">
                          <Badge variant="secondary">
                            {issue.affected_rows} rows affected
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {/* Rules Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Quality Rules</h3>
              <p className="text-sm text-muted-foreground">
                Configure data quality validation rules
              </p>
            </div>
            <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Quality Rule</DialogTitle>
                  <DialogDescription>
                    Define a new data quality validation rule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input
                        id="rule-name"
                        value={newRule.name}
                        onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter rule name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-type">Rule Type</Label>
                      <Select
                        value={newRule.type}
                        onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completeness">Completeness</SelectItem>
                          <SelectItem value="accuracy">Accuracy</SelectItem>
                          <SelectItem value="consistency">Consistency</SelectItem>
                          <SelectItem value="validity">Validity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-description">Description</Label>
                    <Input
                      id="rule-description"
                      value={newRule.description}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this rule validates"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-condition">Condition (SQL)</Label>
                    <Input
                      id="rule-condition"
                      value={newRule.condition}
                      onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
                      placeholder="e.g., column_name IS NOT NULL"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-severity">Severity</Label>
                      <Select
                        value={newRule.severity}
                        onValueChange={(value) => setNewRule(prev => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="rule-enabled"
                        checked={newRule.enabled}
                        onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, enabled: checked }))}
                      />
                      <Label htmlFor="rule-enabled">Enable rule</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRule} disabled={createRuleMutation.isPending}>
                    {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Rules List */}
          <Card>
            <CardContent className="pt-6">
              {rulesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qualityRules?.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {rule.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(rule.severity)}
                            <span className="capitalize">{rule.severity}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.enabled ? "default" : "secondary"}>
                            {rule.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule.last_run ? new Date(rule.last_run).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Edit Rule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Delete Rule
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
