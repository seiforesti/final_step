"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, RefreshCw, MoreHorizontal, Database, Activity, AlertCircle, CheckCircle, Clock, X,  } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { DataSourceCreateModal } from "./data-source-create-modal"
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal"

interface DataSource {
  id: number
  name: string
  source_type: string
  host: string
  port: number
  database_name?: string
  status: "active" | "inactive" | "error" | "pending"
  last_scan?: string
  created_at: string
  updated_at: string
  description?: string
}

interface DataSourceListProps {
  dataSources?: DataSource[]
  isLoading?: boolean
  onRefresh?: () => void
  onCreateDataSource?: (dataSource: any) => Promise<void>
  onTestConnection?: (id: number) => Promise<any>
  canCreateDataSource?: boolean
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "active":
      return "default"
    case "error":
      return "destructive"
    case "pending":
      return "secondary"
    default:
      return "outline"
  }
}

const getTypeIcon = (type: string) => {
  return <Database className="h-4 w-4" />
}

export function DataSourceList({
  dataSources = [],
  isLoading = false,
  onRefresh,
  onCreateDataSource,
  onTestConnection,
  canCreateDataSource = true,
}: DataSourceListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<number | null>(null)
  const [filteredDataSources, setFilteredDataSources] = useState<DataSource[]>([])

  // Filter data sources based on search and filters
  useEffect(() => {
    let filtered = dataSources

    if (searchTerm) {
      filtered = filtered.filter(
        (ds) =>
          ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ds.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ds.source_type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((ds) => ds.source_type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ds) => ds.status === statusFilter)
    }

    setFilteredDataSources(filtered)
  }, [dataSources, searchTerm, typeFilter, statusFilter])

  const handleViewDetails = (id: number) => {
    router.push(`/data-sources/${id}`)
  }

  const handleTestConnection = (id: number) => {
    setSelectedDataSourceId(id)
    setShowTestModal(true)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
  }

  const formatLastScan = (lastScan?: string) => {
    if (!lastScan) return "Never"
    const date = new Date(lastScan)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const uniqueTypes = [...new Set(dataSources.map((ds) => ds.source_type))]
  const hasActiveFilters = searchTerm || typeFilter !== "all" || statusFilter !== "all"

  return (
    <TooltipProvider>
      <div className="space-y-6 bg-[#1e1e1e] text-[#cccccc] p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#cccccc]">Data Sources</h1>
            <p className="text-[#858585]">Manage and monitor your data source connections</p>
          </div>
          {canCreateDataSource && (
            <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-[#007acc] hover:bg-[#005a9e] text-white">
              <Plus className="h-4 w-4" />
              Add Data Source
            </Button>
          )}
        </div>

        {/* Filters and Search */}
        <Card className="bg-[#252526] border-[#3c3c3c]">
          <CardContent className="pt-6 bg-[#252526]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#858585]" />
                  <Input
                    placeholder="Search data sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#3c3c3c] border-[#464647] text-[#cccccc] placeholder-[#858585] focus:bg-[#1e1e1e] focus:border-[#007acc]"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data sources</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Sources ({filteredDataSources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDataSources.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No data sources found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? "No data sources match your current filters."
                    : "Get started by adding your first data source."}
                </p>
                {canCreateDataSource && !hasActiveFilters && (
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Data Source
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Connection</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Scan</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDataSources.map((dataSource) => (
                      <TableRow key={dataSource.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell onClick={() => handleViewDetails(dataSource.id)}>
                          <div className="space-y-1">
                            <div className="font-medium">{dataSource.name}</div>
                            {dataSource.description && (
                              <div className="text-sm text-muted-foreground">{dataSource.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(dataSource.id)}>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(dataSource.source_type)}
                            <Badge variant="outline">{dataSource.source_type.toUpperCase()}</Badge>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(dataSource.id)}>
                          <div className="space-y-1">
                            <div className="text-sm font-mono">
                              {dataSource.host}:{dataSource.port}
                            </div>
                            {dataSource.database_name && (
                              <div className="text-sm text-muted-foreground">{dataSource.database_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(dataSource.id)}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(dataSource.status)}
                            <Badge variant={getStatusVariant(dataSource.status)}>{dataSource.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(dataSource.id)}>
                          <div className="text-sm text-muted-foreground">{formatLastScan(dataSource.last_scan)}</div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(dataSource.id)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTestConnection(dataSource.id)}>
                                Test Connection
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <DataSourceCreateModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={async (dataSource) => {
            if (onCreateDataSource) {
              await onCreateDataSource(dataSource)
            }
            setShowCreateModal(false)
          }}
        />

        {selectedDataSourceId && (
          <DataSourceConnectionTestModal
            open={showTestModal}
            onClose={() => {
              setShowTestModal(false)
              setSelectedDataSourceId(null)
            }}
            dataSourceId={selectedDataSourceId}
            onTestConnection={onTestConnection}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
