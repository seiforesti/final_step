"use client"

import { useState, useEffect, useCallback } from "react"
import type { ScanRun, DiscoveredEntity, ScanIssue, ScanResults } from "../types"
import { mockDiscoveredEntities, mockScanIssues } from "../data/mock-data"

export function useScanDetails(runId: string) {
  const [scanRun, setScanRun] = useState<ScanRun | null>(null)
  const [entities, setEntities] = useState<DiscoveredEntity[]>([])
  const [issues, setIssues] = useState<ScanIssue[]>([])
  const [results, setResults] = useState<ScanResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load scan details
  useEffect(() => {
    const loadScanDetails = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Mock scan run data
        const mockScanRun: ScanRun = {
          id: runId,
          scanId: "scan-1",
          scanName: "Customer Data Discovery",
          status: "completed",
          startTime: "2024-01-20T08:00:00Z",
          endTime: "2024-01-20T08:45:00Z",
          duration: 2700,
          progress: 100,
          entitiesScanned: 1250,
          entitiesTotal: 1250,
          issuesFound: 23,
          dataSourceName: "Customer PostgreSQL",
          triggeredBy: "manual",
          logs: [
            {
              id: "log-1",
              timestamp: "2024-01-20T08:00:00Z",
              level: "info",
              message: "Scan started successfully",
            },
            {
              id: "log-2",
              timestamp: "2024-01-20T08:15:00Z",
              level: "info",
              message: "Scanning database: customer_db",
            },
            {
              id: "log-3",
              timestamp: "2024-01-20T08:30:00Z",
              level: "warning",
              message: "PII detected in users.email column",
            },
            {
              id: "log-4",
              timestamp: "2024-01-20T08:45:00Z",
              level: "info",
              message: "Scan completed successfully",
            },
          ],
        }

        const mockResults: ScanResults = {
          summary: {
            entitiesScanned: 1250,
            tablesScanned: 45,
            columnsScanned: 1205,
            issuesFound: 23,
            classificationsApplied: 156,
            piiDetected: 12,
          },
          entities: mockDiscoveredEntities,
          issues: mockScanIssues,
          classifications: [
            {
              id: "class-1",
              name: "PII",
              category: "Sensitive Data",
              confidence: 0.95,
              entity: "customer_db.public.users.email",
              appliedBy: "system",
              appliedAt: "2024-01-20T08:30:00Z",
            },
            {
              id: "class-2",
              name: "Financial",
              category: "Business Data",
              confidence: 0.87,
              entity: "customer_db.public.orders.amount",
              appliedBy: "system",
              appliedAt: "2024-01-20T08:35:00Z",
            },
          ],
          recommendations: [
            {
              id: "rec-1",
              type: "security",
              priority: "high",
              title: "Implement Data Encryption",
              description: "Encrypt sensitive PII data at rest and in transit",
              impact: "Significantly reduces data breach risk",
              effort: "medium",
              entities: ["customer_db.public.users.email", "customer_db.public.users.phone"],
            },
            {
              id: "rec-2",
              type: "governance",
              priority: "medium",
              title: "Add Data Documentation",
              description: "Document data lineage and business context",
              impact: "Improves data discoverability and compliance",
              effort: "low",
              entities: ["customer_db.public.orders"],
            },
          ],
        }

        setScanRun({ ...mockScanRun, results: mockResults })
        setEntities(mockDiscoveredEntities)
        setIssues(mockScanIssues)
        setResults(mockResults)
        setError(null)
      } catch (err) {
        setError("Failed to load scan details")
      } finally {
        setLoading(false)
      }
    }

    if (runId) {
      loadScanDetails()
    }
  }, [runId])

  // Update issue status
  const updateIssueStatus = useCallback(async (issueId: string, status: ScanIssue["status"]) => {
    try {
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status } : issue)))
    } catch (err) {
      throw new Error("Failed to update issue status")
    }
  }, [])

  // Filter entities
  const filterEntities = useCallback(
    (filters: {
      type?: string
      classification?: string
      pii?: boolean
      search?: string
    }) => {
      return entities.filter((entity) => {
        if (filters.type && entity.type !== filters.type) return false
        if (filters.classification && !entity.classifications.includes(filters.classification)) return false
        if (filters.pii && entity.piiTags.length === 0) return false
        if (filters.search && !entity.name.toLowerCase().includes(filters.search.toLowerCase())) return false
        return true
      })
    },
    [entities],
  )

  // Filter issues
  const filterIssues = useCallback(
    (filters: {
      severity?: string
      type?: string
      status?: string
      search?: string
    }) => {
      return issues.filter((issue) => {
        if (filters.severity && issue.severity !== filters.severity) return false
        if (filters.type && issue.type !== filters.type) return false
        if (filters.status && issue.status !== filters.status) return false
        if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase())) return false
        return true
      })
    },
    [issues],
  )

  return {
    scanRun,
    entities,
    issues,
    results,
    loading,
    error,
    updateIssueStatus,
    filterEntities,
    filterIssues,
  }
}
