"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Database,
  Table,
  Columns,
  Folder,
  File,
  Eye,
  Edit,
  Trash2,
  GitBranch,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  Settings,
  ArrowUpDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import EntityCreateEditModal from "@/components/data-catalog/entity-create-edit-modal"

// Mock data for entity management
const mockEntities = [
  {
    id: 1,
    name: "customer_transactions",
    entity_type: "table",
    qualified_name: "production.analytics.customer_transactions",
    data_source_name: "PostgreSQL Production",
    sensitivity_label: "Medium",
    classifications: ["Financial", "Customer Data", "PII"],
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    row_count: 2456789,
    issues_count: 2,
    quality_score: 85,
    owner: "data-team",
    status: "active",
  },
  {
    id: 2,
    name: "user_profiles",
    entity_type: "table",
    qualified_name: "production.users.user_profiles",
    data_source_name: "PostgreSQL Production",
    sensitivity_label: "High",
    classifications: ["PII", "Customer Data"],
    created_at: "2024-01-10T08:15:00Z",
    updated_at: "2024-01-21T09:30:00Z",
    row_count: 156789,
    issues_count: 0,
    quality_score: 95,
    owner: "user-team",
    status: "active",
  },
  {
    id: 3,
    name: "product_catalog",
    entity_type: "table",
    qualified_name: "production.inventory.product_catalog",
    data_source_name: "PostgreSQL Production",
    sensitivity_label: "Low",
    classifications: ["Product Data", "Reference"],
    created_at: "2024-01-05T14:20:00Z",
    updated_at: "2024-01-19T16:45:00Z",
    row_count: 45678,
    issues_count: 1,
    quality_score: 78,
    owner: "product-team",
    status: "active",
  },
  {
    id: 4,
    name: "sales_analytics_view",
    entity_type: "view",
    qualified_name: "analytics.reports.sales_analytics_view",
    data_source_name: "Snowflake Analytics",
    sensitivity_label: "Medium",
    classifications: ["Analytics", "Financial"],
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-20T13:15:00Z",
    row_count: 234567,
    issues_count: 0,
    quality_score: 92,
    owner: "analytics-team",
    status: "active",
  },
  {
    id: 5,
    name: "legacy_orders",
    entity_type: "table",
    qualified_name: "legacy.orders.order_history",
    data_source_name: "MySQL Legacy",
    sensitivity_label: "Medium",
    classifications: ["Legacy", "Financial"],
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2024-01-15T12:00:00Z",
    row_count: 1234567,
    issues_count: 5,
    quality_score: 65,
    owner: "legacy-team",
    status: "deprecated",
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
    case "view":
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

// Quality score colors
const getQualityScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600"
  if (score >= 75) return "text-yellow-600"
  return "text-red-600"
}

// Status colors
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "default"
    case "deprecated":
      return "secondary"
    case "archived":
      return "outline"
    default:
      return "outline"
  }
}

interface EntityManagementContentProps {
  onViewDetails: (entityId: number, entityType: string) => void
  onViewLineage: (entityId: number, entityType: string) => void
}

export default function EntityManagementContent({ onViewDetails, onViewLineage }: EntityManagementContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEntities, setSelectedEntities] = useState<number[]>([])
  const [filterType, setFilterType] = useState("all")
  const [filterSensitivity, setFilterSensitivity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  // Filter and sort entities
  const filteredEntities = mockEntities
    .filter((entity) => {
      const matchesSearch =
        !searchQuery ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.qualified_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.data_source_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === "all" || entity.entity_type === filterType
      const matchesSensitivity =
        filterSensitivity === "all" || entity.sensitivity_label?.toLowerCase() === filterSensitivity
      const matchesStatus = filterStatus === "all" || entity.status === filterStatus

      return matchesSearch && matchesType && matchesSensitivity && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntities(filteredEntities.map((e) => e.id))
    } else {
      setSelectedEntities([])
    }
  }

  const handleSelectEntity = (entityId: number, checked: boolean) => {
    if (checked) {
      setSelectedEntities([...selectedEntities, entityId])
    } else {
      setSelectedEntities(selectedEntities.filter((id) => id !== entityId))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on entities:`, selectedEntities)
    // Implement bulk actions here
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const stats = {
    total: mockEntities.length,
    active: mockEntities.filter((e) => e.status === "active").length,
    deprecated: mockEntities.filter((e) => e.status === "deprecated").length,
    withIssues: mockEntities.filter((e) => e.issues_count > 0).length,
    avgQuality: Math.round(mockEntities.reduce((sum, e) => sum + e.quality_score, 0) / mockEntities.length),
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6 gap-4">
          <div>
            <h1 className="text-lg font-semibold">Entity Management</h1>
            <p className="text-sm text-muted-foreground">Manage and monitor your data catalog entities</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entities</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deprecated</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.deprecated}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With Issues</p>
                  <p className="text-2xl font-bold text-red-600">{stats.withIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Quality</p>
                  <p className={`text-2xl font-bold ${getQualityScoreColor(stats.avgQuality)}`}>{stats.avgQuality}%</p>
                </div>
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entities by name, qualified name, or data source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="schema">Schema</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSensitivity} onValueChange={setFilterSensitivity}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sensitivity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedEntities.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedEntities.length} entities selected</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("classify")}>
                    <Tag className="h-4 w-4 mr-2" />
                    Classify
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("scan")}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Quality
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("export")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entity Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Entities ({filteredEntities.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="entity_type">Type</SelectItem>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                    <SelectItem value="quality_score">Quality Score</SelectItem>
                    <SelectItem value="row_count">Row Count</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEntities.length === filteredEntities.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Sensitivity</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Row Count</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.map((entity) => {
                  const EntityIcon = getEntityIcon(entity.entity_type)
                  const isSelected = selectedEntities.includes(entity.id)

                  return (
                    <TableRow key={entity.id} className={isSelected ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectEntity(entity.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <EntityIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{entity.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{entity.qualified_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entity.entity_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entity.data_source_name}</span>
                      </TableCell>
                      <TableCell>
                        {entity.sensitivity_label && (
                          <Badge variant={getSensitivityColor(entity.sensitivity_label) as any}>
                            {entity.sensitivity_label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getQualityScoreColor(entity.quality_score)}`}>
                            {entity.quality_score}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatNumber(entity.row_count)}</span>
                      </TableCell>
                      <TableCell>
                        {entity.issues_count > 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {entity.issues_count}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            None
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(entity.status) as any}>{entity.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(entity.updated_at)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(entity.id, entity.entity_type)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewLineage(entity.id, entity.entity_type)}
                          >
                            <GitBranch className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Scan Quality
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="h-4 w-4 mr-2" />
                                Manage Classifications
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </UITable>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <EntityCreateEditModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(entityData) => {
          console.log("Saving entity:", entityData)
          setIsCreateModalOpen(false)
        }}
      />
    </div>
  )
}
