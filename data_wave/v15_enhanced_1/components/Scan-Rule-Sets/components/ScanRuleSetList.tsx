"use client"

import React, { useState, useCallback, useMemo } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit,
  Eye,
  Download,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useScanRuleSets } from "../hooks/useScanRuleSets"
import { usePermissions } from "../hooks/usePermissions"
import { useNotifications } from "../hooks/useNotifications"
import { LoadingSpinner, TableLoadingSkeleton } from "./LoadingSpinner"
import { ScanRuleSetCreateModal } from "./ScanRuleSetCreateModal"
import { ScanRuleSetEditModal } from "./ScanRuleSetEditModal"
import { ScanRuleSetDetails } from "./ScanRuleSetDetails"
import type { ScanRuleSet } from "../types"

interface ScanRuleSetListProps {
  dataSourceId?: number
  embedded?: boolean
  height?: number
  onSelectionChange?: (selectedIds: number[]) => void
}

export const ScanRuleSetList: React.FC<ScanRuleSetListProps> = ({
  dataSourceId,
  embedded = false,
  height,
  onSelectionChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "system" | "custom">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "draft">("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [selectedRuleSet, setSelectedRuleSet] = useState<ScanRuleSet | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { permissions } = usePermissions()
  const { addNotification } = useNotifications()

  const {
    scanRuleSets,
    totalCount,
    filteredCount,
    selectedIds,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkOperating,
    filter,
    sort,
    pagination,
    handleFilterChange,
    handleSortChange,
    handlePaginationChange,
    handleSelectionChange,
    handleSelectAll,
    handleDeselectAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBulkOperation,
    handleRefresh,
  } = useScanRuleSets(
    {
      search: searchQuery,
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      dataSourceId,
    },
    { field: "name", direction: "asc" },
    { page: 1, pageSize: embedded ? 5 : 10 },
  )

  // Update parent component when selection changes
  React.useEffect(() => {
    onSelectionChange?.(selectedIds)
  }, [selectedIds, onSelectionChange])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      handleFilterChange({ search: value })
    },
    [handleFilterChange],
  )

  const handleTypeFilterChange = useCallback(
    (value: string) => {
      const newType = value as "all" | "system" | "custom"
      setTypeFilter(newType)
      handleFilterChange({ type: newType === "all" ? undefined : newType })
    },
    [handleFilterChange],
  )

  const handleStatusFilterChange = useCallback(
    (value: string) => {
      const newStatus = value as "all" | "active" | "inactive" | "draft"
      setStatusFilter(newStatus)
      handleFilterChange({ status: newStatus === "all" ? undefined : newStatus })
    },
    [handleFilterChange],
  )

  const handleRowSelection = useCallback(
    (id: number, checked: boolean) => {
      const newSelection = checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id)
      handleSelectionChange(newSelection)
    },
    [selectedIds, handleSelectionChange],
  )

  const handleSelectAllRows = useCallback(
    (checked: boolean) => {
      if (checked) {
        handleSelectAll()
      } else {
        handleDeselectAll()
      }
    },
    [handleSelectAll, handleDeselectAll],
  )

  const handleCreateRuleSet = useCallback(
    async (data: Partial<ScanRuleSet>) => {
      try {
        await handleCreate(data)
        setShowCreateModal(false)
        addNotification({
          type: "success",
          title: "Rule Set Created",
          message: `"${data.name}" has been created successfully.`,
        })
      } catch (error) {
        addNotification({
          type: "error",
          title: "Creation Failed",
          message: error instanceof Error ? error.message : "Failed to create rule set",
        })
      }
    },
    [handleCreate, addNotification],
  )

  const handleEditRuleSet = useCallback(
    async (data: Partial<ScanRuleSet>) => {
      if (!selectedRuleSet) return

      try {
        await handleUpdate(selectedRuleSet.id, data)
        setShowEditModal(false)
        setSelectedRuleSet(null)
        addNotification({
          type: "success",
          title: "Rule Set Updated",
          message: `"${data.name || selectedRuleSet.name}" has been updated successfully.`,
        })
      } catch (error) {
        addNotification({
          type: "error",
          title: "Update Failed",
          message: error instanceof Error ? error.message : "Failed to update rule set",
        })
      }
    },
    [selectedRuleSet, handleUpdate, addNotification],
  )

  const handleDeleteRuleSet = useCallback(
    async (ruleSet: ScanRuleSet) => {
      try {
        await handleDelete(ruleSet.id)
        addNotification({
          type: "success",
          title: "Rule Set Deleted",
          message: `"${ruleSet.name}" has been deleted successfully.`,
        })
      } catch (error) {
        addNotification({
          type: "error",
          title: "Deletion Failed",
          message: error instanceof Error ? error.message : "Failed to delete rule set",
        })
      }
    },
    [handleDelete, addNotification],
  )

  const handleBulkAction = useCallback(
    async (action: string) => {
      if (selectedIds.length === 0) return

      try {
        await handleBulkOperation({
          action: action as any,
          ruleSetIds: selectedIds,
        })
        addNotification({
          type: "success",
          title: "Bulk Operation Completed",
          message: `${action} operation completed for ${selectedIds.length} rule sets.`,
        })
      } catch (error) {
        addNotification({
          type: "error",
          title: "Bulk Operation Failed",
          message: error instanceof Error ? error.message : `Failed to perform ${action} operation`,
        })
      }
    },
    [selectedIds, handleBulkOperation, addNotification],
  )

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      draft: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "destructive"}>{status}</Badge>
  }, [])

  const getPriorityBadge = useCallback((priority: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "default",
      critical: "destructive",
    } as const

    return <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>{priority}</Badge>
  }, [])

  const filteredAndSortedRuleSets = useMemo(() => {
    return scanRuleSets
  }, [scanRuleSets])

  if (isLoading && scanRuleSets.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" variant="inline" message="Loading rule sets..." />
          </div>
        </div>
        <TableLoadingSkeleton />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4" style={{ height }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rule sets..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions ({selectedIds.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                    <Pause className="h-4 w-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("duplicate")}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {permissions.canCreate && (
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Rule Set
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: {totalCount}</span>
          <span>Filtered: {filteredCount}</span>
          {selectedIds.length > 0 && <span>Selected: {selectedIds.length}</span>}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === scanRuleSets.length && scanRuleSets.length > 0}
                      onCheckedChange={handleSelectAllRows}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Executed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && scanRuleSets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <LoadingSpinner message="Loading rule sets..." />
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedRuleSets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">No rule sets found matching your criteria</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedRuleSets.map((ruleSet) => (
                    <TableRow key={ruleSet.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(ruleSet.id)}
                          onCheckedChange={(checked) => handleRowSelection(ruleSet.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{ruleSet.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{ruleSet.description}</div>
                          <div className="flex flex-wrap gap-1">
                            {ruleSet.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {ruleSet.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{ruleSet.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ruleSet.type === "system" ? "default" : "secondary"}>{ruleSet.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ruleSet.status)}
                          {getStatusBadge(ruleSet.status)}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ruleSet.priority)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{ruleSet.successRate}%</span>
                          </div>
                          <Progress value={ruleSet.successRate} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ruleSet.lastExecuted ? (
                            <Tooltip>
                              <TooltipTrigger>{new Date(ruleSet.lastExecuted).toLocaleDateString()}</TooltipTrigger>
                              <TooltipContent>{new Date(ruleSet.lastExecuted).toLocaleString()}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRuleSet(ruleSet)
                                setShowDetailsModal(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {permissions.canUpdate && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRuleSet(ruleSet)
                                  setShowEditModal(true)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}

                            {permissions.canExecute && (
                              <DropdownMenuItem>
                                <Play className="h-4 w-4 mr-2" />
                                Execute
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>

                            {permissions.canManageSchedules && (
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {permissions.canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteRuleSet(ruleSet)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!embedded && totalCount > pagination.pageSize && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePaginationChange({ page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {Math.ceil(totalCount / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePaginationChange({ page: pagination.page + 1 })}
                disabled={pagination.page >= Math.ceil(totalCount / pagination.pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <ScanRuleSetCreateModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSubmit={handleCreateRuleSet}
            isLoading={isCreating}
          />
        )}

        {showEditModal && selectedRuleSet && (
          <ScanRuleSetEditModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            ruleSet={selectedRuleSet}
            onSubmit={handleEditRuleSet}
            isLoading={isUpdating}
          />
        )}

        {showDetailsModal && selectedRuleSet && (
          <ScanRuleSetDetails open={showDetailsModal} onOpenChange={setShowDetailsModal} ruleSet={selectedRuleSet} />
        )}
      </div>
    </TooltipProvider>
  )
}
