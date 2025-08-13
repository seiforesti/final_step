"use client"

import { useState, useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  ScanRuleSet,
  ScanRuleSetFilter,
  ScanRuleSetSort,
  PaginationParams,
  ApiResponse,
  BulkOperation,
  ValidationResult,
} from "../types"

// Mock API functions
const mockApi = {
  getScanRuleSets: async (
    filter: ScanRuleSetFilter = {},
    sort: ScanRuleSetSort = { field: "name", direction: "asc" },
    pagination: PaginationParams = { page: 1, pageSize: 10 },
  ): Promise<ApiResponse<ScanRuleSet[]>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    const mockData: ScanRuleSet[] = [
      {
        id: 1,
        name: "PII Detection Rules",
        description: "Comprehensive set of rules for detecting personally identifiable information",
        type: "system",
        status: "active",
        version: "2.1.0",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-20T14:45:00Z",
        createdBy: "system",
        rules: [],
        dataSourceTypes: ["postgresql", "mysql", "snowflake"],
        tags: ["pii", "gdpr", "compliance"],
        priority: "high",
        executionCount: 1247,
        successRate: 98.5,
        lastExecuted: "2024-01-20T09:15:00Z",
        estimatedDuration: 300,
        resourceUsage: { cpu: 65, memory: 512, storage: 1024 },
        compliance: { gdpr: true, hipaa: true, sox: false, pci: true },
        schedule: {
          enabled: true,
          cron: "0 2 * * *",
          timezone: "UTC",
          nextRun: "2024-01-21T02:00:00Z",
        },
      },
      {
        id: 2,
        name: "Financial Data Classification",
        description: "Rules for identifying and classifying financial data elements",
        type: "custom",
        status: "active",
        version: "1.3.2",
        createdAt: "2024-01-10T08:20:00Z",
        updatedAt: "2024-01-18T16:30:00Z",
        createdBy: "john.doe",
        rules: [],
        dataSourceTypes: ["oracle", "sqlserver"],
        tags: ["financial", "sox", "audit"],
        priority: "critical",
        executionCount: 892,
        successRate: 96.2,
        lastExecuted: "2024-01-19T22:30:00Z",
        estimatedDuration: 450,
        resourceUsage: { cpu: 80, memory: 768, storage: 2048 },
        compliance: { gdpr: false, hipaa: false, sox: true, pci: true },
        schedule: {
          enabled: true,
          cron: "0 0 * * 0",
          timezone: "EST",
          nextRun: "2024-01-21T00:00:00Z",
        },
      },
      {
        id: 3,
        name: "Healthcare Data Profiling",
        description: "Specialized rules for healthcare data discovery and profiling",
        type: "system",
        status: "active",
        version: "3.0.1",
        createdAt: "2024-01-05T12:15:00Z",
        updatedAt: "2024-01-19T11:20:00Z",
        createdBy: "system",
        rules: [],
        dataSourceTypes: ["mongodb", "cassandra"],
        tags: ["healthcare", "hipaa", "phi"],
        priority: "critical",
        executionCount: 2156,
        successRate: 99.1,
        lastExecuted: "2024-01-20T06:45:00Z",
        estimatedDuration: 600,
        resourceUsage: { cpu: 90, memory: 1024, storage: 4096 },
        compliance: { gdpr: true, hipaa: true, sox: false, pci: false },
        schedule: {
          enabled: true,
          cron: "0 */6 * * *",
          timezone: "UTC",
          nextRun: "2024-01-20T18:00:00Z",
        },
      },
      {
        id: 4,
        name: "Data Quality Assessment",
        description: "Comprehensive data quality rules for completeness, accuracy, and consistency",
        type: "custom",
        status: "draft",
        version: "0.9.0",
        createdAt: "2024-01-18T14:30:00Z",
        updatedAt: "2024-01-19T09:45:00Z",
        createdBy: "jane.smith",
        rules: [],
        dataSourceTypes: ["bigquery", "redshift"],
        tags: ["quality", "validation", "monitoring"],
        priority: "medium",
        executionCount: 45,
        successRate: 87.3,
        estimatedDuration: 180,
        resourceUsage: { cpu: 45, memory: 256, storage: 512 },
        compliance: { gdpr: false, hipaa: false, sox: false, pci: false },
      },
      {
        id: 5,
        name: "Sensitive Data Discovery",
        description: "Advanced pattern matching for sensitive data across all data sources",
        type: "system",
        status: "active",
        version: "4.2.1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-20T08:30:00Z",
        createdBy: "system",
        rules: [],
        dataSourceTypes: ["all"],
        tags: ["sensitive", "discovery", "classification"],
        priority: "high",
        executionCount: 3421,
        successRate: 97.8,
        lastExecuted: "2024-01-20T12:00:00Z",
        estimatedDuration: 720,
        resourceUsage: { cpu: 75, memory: 896, storage: 3072 },
        compliance: { gdpr: true, hipaa: true, sox: true, pci: true },
        schedule: {
          enabled: true,
          cron: "0 1 * * *",
          timezone: "UTC",
          nextRun: "2024-01-21T01:00:00Z",
        },
      },
    ]

    // Apply filters
    let filteredData = mockData
    if (filter.search) {
      filteredData = filteredData.filter(
        (item) =>
          item.name.toLowerCase().includes(filter.search!.toLowerCase()) ||
          item.description.toLowerCase().includes(filter.search!.toLowerCase()),
      )
    }
    if (filter.type && filter.type !== "all") {
      filteredData = filteredData.filter((item) => item.type === filter.type)
    }
    if (filter.status && filter.status !== "all") {
      filteredData = filteredData.filter((item) => item.status === filter.status)
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]
      const direction = sort.direction === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction
      }
      return 0
    })

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      pagination: {
        ...pagination,
        total: filteredData.length,
      },
      metadata: {
        totalCount: mockData.length,
        filteredCount: filteredData.length,
        executionTime: Math.random() * 100 + 50,
      },
    }
  },

  createScanRuleSet: async (data: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      id: Date.now(),
      name: data.name || "",
      description: data.description || "",
      type: data.type || "custom",
      status: "draft",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      rules: [],
      dataSourceTypes: data.dataSourceTypes || [],
      tags: data.tags || [],
      priority: data.priority || "medium",
      executionCount: 0,
      successRate: 0,
      estimatedDuration: 0,
      resourceUsage: { cpu: 0, memory: 0, storage: 0 },
      compliance: { gdpr: false, hipaa: false, sox: false, pci: false },
    }
  },

  updateScanRuleSet: async (id: number, data: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    // Return updated mock data
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    } as ScanRuleSet
  },

  deleteScanRuleSet: async (id: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },

  bulkOperation: async (operation: BulkOperation): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
  },

  validateRuleSet: async (data: Partial<ScanRuleSet>): Promise<ValidationResult> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      isValid: true,
      errors: [],
      warnings: [],
    }
  },
}

export const useScanRuleSets = (
  initialFilter: ScanRuleSetFilter = {},
  initialSort: ScanRuleSetSort = { field: "name", direction: "asc" },
  initialPagination: PaginationParams = { page: 1, pageSize: 10 },
) => {
  const [filter, setFilter] = useState<ScanRuleSetFilter>(initialFilter)
  const [sort, setSort] = useState<ScanRuleSetSort>(initialSort)
  const [pagination, setPagination] = useState<PaginationParams>(initialPagination)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const queryClient = useQueryClient()

  // Query for fetching scan rule sets
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["scanRuleSets", filter, sort, pagination],
    queryFn: () => mockApi.getScanRuleSets(filter, sort, pagination),
    keepPreviousData: true,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: mockApi.createScanRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanRuleSets"] })
      toast.success("Scan rule set created successfully")
    },
    onError: (error) => {
      toast.error(`Failed to create scan rule set: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ScanRuleSet> }) => mockApi.updateScanRuleSet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanRuleSets"] })
      toast.success("Scan rule set updated successfully")
    },
    onError: (error) => {
      toast.error(`Failed to update scan rule set: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: mockApi.deleteScanRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanRuleSets"] })
      toast.success("Scan rule set deleted successfully")
    },
    onError: (error) => {
      toast.error(`Failed to delete scan rule set: ${error.message}`)
    },
  })

  const bulkOperationMutation = useMutation({
    mutationFn: mockApi.bulkOperation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["scanRuleSets"] })
      toast.success(`Bulk ${variables.action} completed successfully`)
      setSelectedIds([])
    },
    onError: (error, variables) => {
      toast.error(`Failed to perform bulk ${variables.action}: ${error.message}`)
    },
  })

  // Computed values
  const scanRuleSets = useMemo(() => response?.data || [], [response])
  const totalCount = useMemo(() => response?.metadata?.totalCount || 0, [response])
  const filteredCount = useMemo(() => response?.metadata?.filteredCount || 0, [response])

  // Handlers
  const handleFilterChange = useCallback((newFilter: Partial<ScanRuleSetFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const handleSortChange = useCallback((newSort: ScanRuleSetSort) => {
    setSort(newSort)
  }, [])

  const handlePaginationChange = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }))
  }, [])

  const handleSelectionChange = useCallback((ids: number[]) => {
    setSelectedIds(ids)
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(scanRuleSets.map((item) => item.id))
  }, [scanRuleSets])

  const handleDeselectAll = useCallback(() => {
    setSelectedIds([])
  }, [])

  const handleCreate = useCallback(
    (data: Partial<ScanRuleSet>) => {
      return createMutation.mutateAsync(data)
    },
    [createMutation],
  )

  const handleUpdate = useCallback(
    (id: number, data: Partial<ScanRuleSet>) => {
      return updateMutation.mutateAsync({ id, data })
    },
    [updateMutation],
  )

  const handleDelete = useCallback(
    (id: number) => {
      return deleteMutation.mutateAsync(id)
    },
    [deleteMutation],
  )

  const handleBulkOperation = useCallback(
    (operation: BulkOperation) => {
      return bulkOperationMutation.mutateAsync(operation)
    },
    [bulkOperationMutation],
  )

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    // Data
    scanRuleSets,
    totalCount,
    filteredCount,
    selectedIds,

    // State
    filter,
    sort,
    pagination,

    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkOperating: bulkOperationMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    bulkOperationError: bulkOperationMutation.error,

    // Handlers
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
  }
}
