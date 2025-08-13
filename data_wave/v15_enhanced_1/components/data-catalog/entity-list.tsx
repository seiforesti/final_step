"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Database,
  TableIcon as Tbl,
  Columns,
  Folder,
  File,
  Shield,
  Tag,
  MoreHorizontal,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock data
const mockEntities = [
  {
    id: 1,
    name: "customer_transactions",
    entity_type: "table",
    qualified_name: "production.analytics.customer_transactions",
    description: "Customer transaction data including purchases and refunds",
    data_source_id: 1,
    data_source_name: "PostgreSQL Production",
    sensitivity_label_id: 2,
    sensitivity_label: "Medium",
    classifications: ["Financial", "Customer Data", "PII"],
    updated_at: "2024-01-20T14:45:00Z",
    created_at: "2024-01-15T10:30:00Z",
    row_count: 2456789,
    size_bytes: 1234567890,
    issues_count: 2,
    last_scan: "2024-01-20T12:00:00Z",
    tags: ["financial", "customer-data", "pii"],
  },
  {
    id: 2,
    name: "user_profiles",
    entity_type: "table",
    qualified_name: "production.users.user_profiles",
    description: "User profile information and preferences",
    data_source_id: 1,
    data_source_name: "PostgreSQL Production",
    sensitivity_label_id: 3,
    sensitivity_label: "High",
    classifications: ["PII", "Personal", "Customer Data"],
    updated_at: "2024-01-19T16:30:00Z",
    created_at: "2024-01-10T09:15:00Z",
    row_count: 156789,
    size_bytes: 234567890,
    issues_count: 0,
    last_scan: "2024-01-19T18:00:00Z",
    tags: ["pii", "personal", "customer-data"],
  },
  {
    id: 3,
    name: "product_catalog",
    entity_type: "table",
    qualified_name: "production.inventory.product_catalog",
    description: "Product information and inventory data",
    data_source_id: 2,
    data_source_name: "MySQL Inventory",
    sensitivity_label_id: 1,
    sensitivity_label: "Low",
    classifications: ["Product", "Inventory"],
    updated_at: "2024-01-18T11:20:00Z",
    created_at: "2024-01-05T14:45:00Z",
    row_count: 45678,
    size_bytes: 123456789,
    issues_count: 1,
    last_scan: "2024-01-18T15:30:00Z",
    tags: ["product", "inventory"],
  },
  {
    id: 4,
    name: "analytics_schema",
    entity_type: "schema",
    qualified_name: "production.analytics",
    description: "Analytics and reporting schema",
    data_source_id: 1,
    data_source_name: "PostgreSQL Production",
    sensitivity_label_id: null,
    sensitivity_label: null,
    classifications: ["Analytics"],
    updated_at: "2024-01-17T09:45:00Z",
    created_at: "2024-01-01T00:00:00Z",
    row_count: null,
    size_bytes: null,
    issues_count: 0,
    last_scan: "2024-01-17T10:00:00Z",
    tags: ["analytics"],
  },
  {
    id: 5,
    name: "production_db",
    entity_type: "database",
    qualified_name: "production",
    description: "Main production database",
    data_source_id: 1,
    data_source_name: "PostgreSQL Production",
    sensitivity_label_id: null,
    sensitivity_label: null,
    classifications: ["Production"],
    updated_at: "2024-01-16T08:30:00Z",
    created_at: "2023-12-01T00:00:00Z",
    row_count: null,
    size_bytes: null,
    issues_count: 0,
    last_scan: "2024-01-16T09:00:00Z",
    tags: ["prod", "customer-data"],
  },
]

const mockDataSources = [
  { id: 1, name: "PostgreSQL Production" },
  { id: 2, name: "MySQL Inventory" },
  { id: 3, name: "MongoDB Logs" },
  { id: 4, name: "Snowflake Analytics" },
]

const mockSensitivityLabels = [
  { id: 1, name: "Low", level: "low" },
  { id: 2, name: "Medium", level: "medium" },
  { id: 3, name: "High", level: "high" },
]

// Entity type configuration
const entityTypes = [
  { value: "database", label: "Database", icon: Database },
  { value: "schema", label: "Schema", icon: Folder },
  { value: "table", label: "Table", icon: Tbl },
  { value: "column", label: "Column", icon: Columns },
  { value: "file", label: "File", icon: File },
]

// Get entity icon
const getEntityIcon = (type: string) => {
  const entityType = entityTypes.find((t) => t.value === type)
  return entityType ? entityType.icon : Database
}

// Get sensitivity color
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

// Format bytes
const formatBytes = (bytes: number) => {
  if (!bytes) return "N/A"
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function EntityList() {
  const router = useRouter()
  const [entities, setEntities] = useState(mockEntities)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([])
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([])
  const [selectedSensitivityLevels, setSelectedSensitivityLevels] = useState<string[]>([])
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([])

  // Table state
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortField, setSortField] = useState<string>("updated_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<any>(null)

  // Get unique classifications
  const availableClassifications = useMemo(() => {
    const classifications = new Set<string>()
    entities.forEach((entity) => {
      entity.classifications.forEach((classification) => {
        classifications.add(classification)
      })
    })
    return Array.from(classifications).sort()
  }, [entities])

  // Filter and sort entities
  const filteredEntities = useMemo(() => {
    const filtered = entities.filter((entity) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !entity.name.toLowerCase().includes(query) &&
          !entity.qualified_name.toLowerCase().includes(query) &&
          !entity.description?.toLowerCase().includes(query) &&
          !entity.classifications.some((c) => c.toLowerCase().includes(query))
        ) {
          return false
        }
      }

      // Entity type filter
      if (selectedEntityTypes.length > 0 && !selectedEntityTypes.includes(entity.entity_type)) {
        return false
      }

      // Data source filter
      if (selectedDataSources.length > 0 && !selectedDataSources.includes(entity.data_source_name)) {
        return false
      }

      // Sensitivity filter
      if (selectedSensitivityLevels.length > 0) {
        if (!entity.sensitivity_label || !selectedSensitivityLevels.includes(entity.sensitivity_label)) {
          return false
        }
      }

      // Classification filter
      if (selectedClassifications.length > 0) {
        if (!entity.classifications.some((c) => selectedClassifications.includes(c))) {
          return false
        }
      }

      return true
    })

    // Sort entities
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof typeof a]
      let bValue = b[sortField as keyof typeof b]

      if (aValue === null || aValue === undefined) aValue = ""
      if (bValue === null || bValue === undefined) bValue = ""

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [
    entities,
    searchQuery,
    selectedEntityTypes,
    selectedDataSources,
    selectedSensitivityLevels,
    selectedClassifications,
    sortField,
    sortDirection,
  ])

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle row selection
  const handleRowSelect = (entityId: number) => {
    setSelectedRows((prev) => (prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]))
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.length === filteredEntities.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredEntities.map((entity) => entity.id))
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedEntityTypes([])
    setSelectedDataSources([])
    setSelectedSensitivityLevels([])
    setSelectedClassifications([])
  }

  // Active filter count
  const activeFilterCount =
    selectedEntityTypes.length +
    selectedDataSources.length +
    selectedSensitivityLevels.length +
    selectedClassifications.length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6 gap-4">
          <div>
            <h1 className="text-lg font-semibold">Data Catalog</h1>
            <p className="text-sm text-muted-foreground">
              {filteredEntities.length} of {entities.length} entities
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6">
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Search & Filter</CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters ({activeFilterCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entities by name, description, or classification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Entity Type Filter */}
              <div>
                <Label className="text-sm font-medium">Entity Type</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      {selectedEntityTypes.length > 0 ? `${selectedEntityTypes.length} selected` : "All types"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Entity Types</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {entityTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <DropdownMenuCheckboxItem
                          key={type.value}
                          checked={selectedEntityTypes.includes(type.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEntityTypes([...selectedEntityTypes, type.value])
                            } else {
                              setSelectedEntityTypes(selectedEntityTypes.filter((t) => t !== type.value))
                            }
                          }}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {type.label}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Data Source Filter */}
              <div>
                <Label className="text-sm font-medium">Data Source</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      {selectedDataSources.length > 0 ? `${selectedDataSources.length} selected` : "All sources"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Data Sources</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mockDataSources.map((source) => (
                      <DropdownMenuCheckboxItem
                        key={source.id}
                        checked={selectedDataSources.includes(source.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDataSources([...selectedDataSources, source.name])
                          } else {
                            setSelectedDataSources(selectedDataSources.filter((s) => s !== source.name))
                          }
                        }}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {source.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sensitivity Filter */}
              <div>
                <Label className="text-sm font-medium">Sensitivity</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      {selectedSensitivityLevels.length > 0
                        ? `${selectedSensitivityLevels.length} selected`
                        : "All levels"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Sensitivity Levels</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mockSensitivityLabels.map((label) => (
                      <DropdownMenuCheckboxItem
                        key={label.id}
                        checked={selectedSensitivityLevels.includes(label.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSensitivityLevels([...selectedSensitivityLevels, label.name])
                          } else {
                            setSelectedSensitivityLevels(selectedSensitivityLevels.filter((l) => l !== label.name))
                          }
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {label.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Classification Filter */}
              <div>
                <Label className="text-sm font-medium">Classification</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      {selectedClassifications.length > 0
                        ? `${selectedClassifications.length} selected`
                        : "All classifications"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Classifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableClassifications.map((classification) => (
                      <DropdownMenuCheckboxItem
                        key={classification}
                        checked={selectedClassifications.includes(classification)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClassifications([...selectedClassifications, classification])
                          } else {
                            setSelectedClassifications(selectedClassifications.filter((c) => c !== classification))
                          }
                        }}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        {classification}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEntityTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="gap-1">
                    {entityTypes.find((t) => t.value === type)?.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedEntityTypes(selectedEntityTypes.filter((t) => t !== type))}
                    />
                  </Badge>
                ))}
                {selectedDataSources.map((source) => (
                  <Badge key={source} variant="secondary" className="gap-1">
                    {source}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedDataSources(selectedDataSources.filter((s) => s !== source))}
                    />
                  </Badge>
                ))}
                {selectedSensitivityLevels.map((level) => (
                  <Badge key={level} variant="secondary" className="gap-1">
                    {level} Sensitivity
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedSensitivityLevels(selectedSensitivityLevels.filter((l) => l !== level))}
                    />
                  </Badge>
                ))}
                {selectedClassifications.map((classification) => (
                  <Badge key={classification} variant="secondary" className="gap-1">
                    {classification}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setSelectedClassifications(selectedClassifications.filter((c) => c !== classification))
                      }
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <>
                <Badge variant="secondary">{selectedRows.length} selected</Badge>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Separator orientation="vertical" className="h-4" />
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsLoading(true)}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: "table" | "grid") => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="grid">Grid View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRows.length === filteredEntities.length && filteredEntities.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium"
                          onClick={() => handleSort("name")}
                        >
                          Name
                          {sortField === "name" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="ml-2 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-2 h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Data Source</TableHead>
                      <TableHead>Sensitivity</TableHead>
                      <TableHead>Classifications</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium"
                          onClick={() => handleSort("updated_at")}
                        >
                          Last Updated
                          {sortField === "updated_at" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="ml-2 h-4 w-4" />
                            ) : (
                              <SortDesc className="ml-2 h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntities.map((entity) => {
                      const EntityIcon = getEntityIcon(entity.entity_type)
                      return (
                        <TableRow key={entity.id} className={cn(selectedRows.includes(entity.id) && "bg-muted/50")}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(entity.id)}
                              onCheckedChange={() => handleRowSelect(entity.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <EntityIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{entity.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">{entity.qualified_name}</p>
                              {entity.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{entity.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <EntityIcon className="h-3 w-3" />
                              {entity.entity_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{entity.data_source_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {entity.sensitivity_label ? (
                              <Badge variant={getSensitivityColor(entity.sensitivity_label) as any} className="gap-1">
                                <Shield className="h-3 w-3" />
                                {entity.sensitivity_label}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {entity.classifications.slice(0, 2).map((classification) => (
                                <Badge key={classification} variant="outline" className="text-xs">
                                  {classification}
                                </Badge>
                              ))}
                              {entity.classifications.length > 2 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs cursor-help">
                                        +{entity.classifications.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        {entity.classifications.slice(2).map((classification) => (
                                          <div key={classification}>{classification}</div>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {entity.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {entity.tags.length > 2 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs cursor-help">
                                        +{entity.tags.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        {entity.tags.slice(2).map((tag) => (
                                          <div key={tag}>{tag}</div>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {formatDate(entity.updated_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {entity.issues_count > 0 ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {entity.issues_count}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />0
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/data-catalog/${entity.entity_type}/${entity.id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/data-catalog/${entity.entity_type}/${entity.id}/edit`)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setEntityToDelete(entity)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
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

                {filteredEntities.length === 0 && (
                  <div className="p-12 text-center">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No entities found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || activeFilterCount > 0
                        ? "Try adjusting your search or filters"
                        : "Get started by adding your first entity"}
                    </p>
                    {!searchQuery && activeFilterCount === 0 && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entity
                      </Button>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEntities.map((entity) => {
              const EntityIcon = getEntityIcon(entity.entity_type)
              return (
                <Card key={entity.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <EntityIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm truncate">{entity.name}</CardTitle>
                          <p className="text-xs text-muted-foreground truncate">{entity.entity_type}</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedRows.includes(entity.id)}
                        onCheckedChange={() => handleRowSelect(entity.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entity.description || "No description available"}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{entity.data_source_name}</span>
                      </div>

                      {entity.sensitivity_label && (
                        <div className="flex items-center gap-2">
                          <Badge variant={getSensitivityColor(entity.sensitivity_label) as any} className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {entity.sensitivity_label}
                          </Badge>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {entity.classifications.slice(0, 2).map((classification) => (
                          <Badge key={classification} variant="outline" className="text-xs">
                            {classification}
                          </Badge>
                        ))}
                        {entity.classifications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{entity.classifications.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {entity.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {entity.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{entity.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(entity.updated_at)}
                      </div>

                      <div className="flex items-center gap-1">
                        {entity.issues_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {entity.issues_count}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/data-catalog/${entity.entity_type}/${entity.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filteredEntities.length === 0 && (
              <div className="col-span-full p-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entities found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || activeFilterCount > 0
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first entity"}
                </p>
                {!searchQuery && activeFilterCount === 0 && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entity
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{entityToDelete?.name}</strong>? This action cannot be undone and
              will remove all associated metadata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Handle delete logic here
                setDeleteDialogOpen(false)
                setEntityToDelete(null)
              }}
            >
              Delete Entity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
