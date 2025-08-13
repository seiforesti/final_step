"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Database,
  Table,
  Columns,
  Folder,
  File,
  Edit,
  Shield,
  Tag,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Download,
  Share2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  GitBranch,
  Activity,
  Settings,
  Bookmark,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data - replace with actual API calls
const mockEntity = {
  id: 1,
  name: "customer_transactions",
  entity_type: "table",
  qualified_name: "production.analytics.customer_transactions",
  description: "Customer transaction data including purchases, refunds, and payment information",
  data_source_id: 1,
  data_source_name: "PostgreSQL Production",
  sensitivity_label_id: 2,
  sensitivity_label: "Medium",
  classifications: ["Financial", "Customer Data", "PII"],
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T14:45:00Z",
  last_scan_id: 123,
  schema_name: "analytics",
  database_name: "production",
  properties: {
    row_count: 2456789,
    size_bytes: 1234567890,
    partitions: 12,
    compression: "gzip",
  },
}

const mockColumns = [
  {
    id: 1,
    name: "transaction_id",
    data_type: "bigint",
    description: "Unique identifier for each transaction",
    sensitivity_label_id: null,
    classifications: ["Identifier"],
    nullable: false,
    primary_key: true,
  },
  {
    id: 2,
    name: "customer_id",
    data_type: "bigint",
    description: "Reference to customer table",
    sensitivity_label_id: 2,
    classifications: ["PII", "Customer Data"],
    nullable: false,
    foreign_key: true,
  },
  {
    id: 3,
    name: "amount",
    data_type: "decimal(10,2)",
    description: "Transaction amount in USD",
    sensitivity_label_id: 2,
    classifications: ["Financial"],
    nullable: false,
  },
  {
    id: 4,
    name: "payment_method",
    data_type: "varchar(50)",
    description: "Payment method used",
    sensitivity_label_id: 1,
    classifications: ["Financial"],
    nullable: true,
  },
  {
    id: 5,
    name: "created_at",
    data_type: "timestamp",
    description: "Transaction timestamp",
    sensitivity_label_id: null,
    classifications: ["Temporal"],
    nullable: false,
  },
]

const mockSampleData = {
  columns: ["transaction_id", "customer_id", "amount", "payment_method", "created_at"],
  rows: [
    [1001, 12345, 99.99, "credit_card", "2024-01-20 10:30:00"],
    [1002, 12346, 149.5, "paypal", "2024-01-20 11:15:00"],
    [1003, 12347, 75.25, "debit_card", "2024-01-20 12:00:00"],
    [1004, 12348, 200.0, "bank_transfer", "2024-01-20 13:45:00"],
    [1005, 12349, 50.75, "credit_card", "2024-01-20 14:30:00"],
  ],
}

const mockLineage = {
  upstream: [
    {
      id: 10,
      name: "raw_transactions",
      entity_type: "table",
      data_source_id: 1,
      qualified_name: "staging.raw.raw_transactions",
    },
    {
      id: 11,
      name: "customer_master",
      entity_type: "table",
      data_source_id: 1,
      qualified_name: "production.master.customer_master",
    },
  ],
  downstream: [
    {
      id: 20,
      name: "monthly_revenue_report",
      entity_type: "table",
      data_source_id: 2,
      qualified_name: "analytics.reports.monthly_revenue_report",
    },
    {
      id: 21,
      name: "customer_analytics_view",
      entity_type: "table",
      data_source_id: 1,
      qualified_name: "production.views.customer_analytics_view",
    },
  ],
}

const mockIssues = [
  {
    id: 1,
    severity: "high",
    type: "Data Quality",
    description: "Missing values detected in payment_method column",
    detected_at: "2024-01-20T09:00:00Z",
    details: "15% of records have null payment_method values",
    remediation_steps: "Review data ingestion process and add validation rules",
  },
  {
    id: 2,
    severity: "medium",
    type: "Schema Drift",
    description: "New column detected: transaction_fee",
    detected_at: "2024-01-19T16:30:00Z",
    details: "Schema change detected during last scan",
    remediation_steps: "Update data catalog schema and notify downstream consumers",
  },
]

const mockRecentActivity = [
  {
    id: 1,
    action: "Schema updated",
    user: "john.doe",
    timestamp: "2024-01-20T14:30:00Z",
    details: "Added new column: transaction_fee",
  },
  {
    id: 2,
    action: "Sensitivity label assigned",
    user: "jane.smith",
    timestamp: "2024-01-20T13:15:00Z",
    details: "Applied Medium sensitivity to amount column",
  },
  {
    id: 3,
    action: "Quality check completed",
    user: "system",
    timestamp: "2024-01-20T12:00:00Z",
    details: "Data quality scan completed with 2 issues found",
  },
]

// Entity icon mapping
const getEntityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "database":
      return Database
    case "schema":
      return Folder
    case "table":
      return Table
    case "column":
      return Columns
    case "file":
      return File
    default:
      return Database
  }
}

// Sensitivity level colors
const getSensitivityColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "high":
      return "destructive"
    case "medium":
      return "warning"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

// Issue severity colors
const getIssueSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "destructive"
    case "high":
      return "destructive"
    case "medium":
      return "warning"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

export default function EntityDetails() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const EntityIcon = getEntityIcon(mockEntity.entity_type)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6 gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <EntityIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{mockEntity.name}</h1>
              <p className="text-sm text-muted-foreground">{mockEntity.qualified_name}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bookmark</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Schema
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Qualified Name
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Entity Header Card */}
      <div className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border">
                    <EntityIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{mockEntity.name}</CardTitle>
                    <CardDescription className="text-base">{mockEntity.description}</CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <EntityIcon className="h-3 w-3" />
                    {mockEntity.entity_type.charAt(0).toUpperCase() + mockEntity.entity_type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Database className="h-3 w-3" />
                    {mockEntity.data_source_name}
                  </Badge>
                  {mockEntity.sensitivity_label && (
                    <Badge variant={getSensitivityColor(mockEntity.sensitivity_label) as any} className="gap-1">
                      <Shield className="h-3 w-3" />
                      {mockEntity.sensitivity_label} Sensitivity
                    </Badge>
                  )}
                  {mockColumns.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Columns className="h-3 w-3" />
                      {mockColumns.length} Columns
                    </Badge>
                  )}
                  {mockIssues.length > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {mockIssues.length} Issues
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {mockEntity.classifications.map((classification) => (
                    <Badge key={classification} variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {classification}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Updated {formatDate(mockEntity.updated_at)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created {formatDate(mockEntity.created_at)}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="columns">Columns ({mockColumns.length})</TabsTrigger>
            <TabsTrigger value="sample-data">Sample Data</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
            <TabsTrigger value="issues">Issues ({mockIssues.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Metadata Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p className="text-sm font-medium">{mockEntity.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <div className="flex items-center gap-2">
                        <EntityIcon className="h-4 w-4" />
                        <p className="text-sm font-medium">{mockEntity.entity_type}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Qualified Name</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                          {mockEntity.qualified_name}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(mockEntity.qualified_name)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {mockEntity.schema_name && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Schema</Label>
                        <p className="text-sm font-medium">{mockEntity.schema_name}</p>
                      </div>
                    )}
                    {mockEntity.database_name && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Database</Label>
                        <p className="text-sm font-medium">{mockEntity.database_name}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Data Source</Label>
                      <p className="text-sm font-medium">{mockEntity.data_source_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Scan</Label>
                      <Button variant="link" className="h-auto p-0 text-sm">
                        View Scan #{mockEntity.last_scan_id}
                      </Button>
                    </div>
                  </div>

                  {mockEntity.properties && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Properties</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Row Count:</span>
                          <span className="text-sm font-medium">
                            {mockEntity.properties.row_count.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Size:</span>
                          <span className="text-sm font-medium">{formatBytes(mockEntity.properties.size_bytes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Partitions:</span>
                          <span className="text-sm font-medium">{mockEntity.properties.partitions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Compression:</span>
                          <span className="text-sm font-medium">{mockEntity.properties.compression}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Classification & Sensitivity Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Sensitivity Level</Label>
                    {mockEntity.sensitivity_label ? (
                      <Badge variant={getSensitivityColor(mockEntity.sensitivity_label) as any} className="mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {mockEntity.sensitivity_label}
                      </Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not classified</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Classifications</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mockEntity.classifications.map((classification) => (
                        <Badge key={classification} variant="outline" className="text-xs">
                          {classification}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Security
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="p-1 rounded-full bg-primary/10">
                        <Activity className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.user}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Columns Tab */}
          <TabsContent value="columns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Columns ({mockColumns.length})</h3>
                <p className="text-sm text-muted-foreground">Schema and metadata for table columns</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search columns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Sensitivity</TableHead>
                      <TableHead>Classifications</TableHead>
                      <TableHead>Constraints</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockColumns.map((column) => (
                      <TableRow key={column.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Columns className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{column.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {column.data_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {column.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          {column.sensitivity_label_id ? (
                            <Badge variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Medium
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {column.classifications.slice(0, 2).map((classification) => (
                              <Badge key={classification} variant="outline" className="text-xs">
                                {classification}
                              </Badge>
                            ))}
                            {column.classifications.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{column.classifications.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {column.primary_key && (
                              <Badge variant="secondary" className="text-xs">
                                PK
                              </Badge>
                            )}
                            {column.foreign_key && (
                              <Badge variant="secondary" className="text-xs">
                                FK
                              </Badge>
                            )}
                            {!column.nullable && (
                              <Badge variant="outline" className="text-xs">
                                NOT NULL
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sample Data Tab */}
          <TabsContent value="sample-data" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Sample Data</h3>
                <p className="text-sm text-muted-foreground">Preview of table data (limited to 100 rows)</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Sample
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-96">
                  <UITable>
                    <TableHeader>
                      <TableRow>
                        {mockSampleData.columns.map((column) => (
                          <TableHead key={column} className="font-mono text-xs">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockSampleData.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="font-mono text-xs">
                              {cell !== null ? (
                                String(cell)
                              ) : (
                                <span className="text-muted-foreground italic">NULL</span>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </UITable>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lineage Tab */}
          <TabsContent value="lineage" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Data Lineage</h3>
                <p className="text-sm text-muted-foreground">Visualize data flow and dependencies</p>
              </div>
              <Button variant="outline" size="sm">
                <GitBranch className="h-4 w-4 mr-2" />
                View Full Lineage
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upstream */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    Upstream Sources ({mockLineage.upstream.length})
                  </CardTitle>
                  <CardDescription>Data sources that feed into this entity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockLineage.upstream.map((entity) => {
                      const Icon = getEntityIcon(entity.entity_type)
                      return (
                        <div
                          key={entity.id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{entity.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{entity.qualified_name}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Downstream */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                    Downstream Consumers ({mockLineage.downstream.length})
                  </CardTitle>
                  <CardDescription>Entities that consume data from this source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockLineage.downstream.map((entity) => {
                      const Icon = getEntityIcon(entity.entity_type)
                      return (
                        <div
                          key={entity.id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{entity.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{entity.qualified_name}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lineage Visualization Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Lineage Diagram</CardTitle>
                <CardDescription>Interactive visualization of data relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interactive lineage diagram would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Data Quality Issues ({mockIssues.length})</h3>
                <p className="text-sm text-muted-foreground">Issues detected during data quality scans</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Quality Check
              </Button>
            </div>

            <div className="space-y-4">
              {mockIssues.map((issue) => (
                <Card key={issue.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{issue.description}</h4>
                            <p className="text-sm text-muted-foreground">Detected on {formatDate(issue.detected_at)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getIssueSeverityColor(issue.severity) as any}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{issue.type}</Badge>
                          </div>
                        </div>

                        {issue.details && <p className="text-sm">{issue.details}</p>}

                        {issue.remediation_steps && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Recommended Actions:</p>
                            <p className="text-sm text-muted-foreground">{issue.remediation_steps}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {mockIssues.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                  <p className="text-muted-foreground">This entity has passed all data quality checks</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
