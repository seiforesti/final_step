"use client"

import { useState, useEffect, useCallback } from "react"
import type { ScanConfig, ScanRun, ScanSchedule } from "../types"
import { mockScanConfigs, mockScanRuns, mockScanSchedules } from "../data/mock-data"

export function useScanSystem() {
  const [scanConfigs, setScanConfigs] = useState<ScanConfig[]>([])
  const [scanRuns, setScanRuns] = useState<ScanRun[]>([])
  const [scanSchedules, setScanSchedules] = useState<ScanSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setScanConfigs(mockScanConfigs)
        setScanRuns(mockScanRuns)
        setScanSchedules(mockScanSchedules)
        setError(null)
      } catch (err) {
        setError("Failed to load scan data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Create new scan configuration
  const createScan = useCallback(async (scanData: Omit<ScanConfig, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newScan: ScanConfig = {
        ...scanData,
        id: `scan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setScanConfigs((prev) => [...prev, newScan])
      return newScan
    } catch (err) {
      throw new Error("Failed to create scan")
    }
  }, [])

  // Update scan configuration
  const updateScan = useCallback(async (id: string, updates: Partial<ScanConfig>) => {
    try {
      setScanConfigs((prev) =>
        prev.map((scan) => (scan.id === id ? { ...scan, ...updates, updatedAt: new Date().toISOString() } : scan)),
      )
    } catch (err) {
      throw new Error("Failed to update scan")
    }
  }, [])

  // Delete scan configuration
  const deleteScan = useCallback(async (id: string) => {
    try {
      setScanConfigs((prev) => prev.filter((scan) => scan.id !== id))
      setScanRuns((prev) => prev.filter((run) => run.scanId !== id))
      setScanSchedules((prev) => prev.filter((schedule) => schedule.scanId !== id))
    } catch (err) {
      throw new Error("Failed to delete scan")
    }
  }, [])

  // Run scan manually
  const runScan = useCallback(
    async (scanId: string) => {
      try {
        const scan = scanConfigs.find((s) => s.id === scanId)
        if (!scan) throw new Error("Scan not found")

        const newRun: ScanRun = {
          id: `run-${Date.now()}`,
          scanId,
          scanName: scan.name,
          status: "running",
          startTime: new Date().toISOString(),
          progress: 0,
          entitiesScanned: 0,
          entitiesTotal: 1000, // Mock total
          issuesFound: 0,
          dataSourceName: scan.dataSourceName,
          triggeredBy: "manual",
          logs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: "info",
              message: "Scan started manually",
            },
          ],
        }

        setScanRuns((prev) => [newRun, ...prev])

        // Simulate scan progress
        simulateScanProgress(newRun.id)

        return newRun
      } catch (err) {
        throw new Error("Failed to start scan")
      }
    },
    [scanConfigs],
  )

  // Cancel running scan
  const cancelScan = useCallback(async (runId: string) => {
    try {
      setScanRuns((prev) =>
        prev.map((run) =>
          run.id === runId
            ? {
                ...run,
                status: "cancelled",
                endTime: new Date().toISOString(),
                logs: [
                  ...run.logs,
                  {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    level: "warning",
                    message: "Scan cancelled by user",
                  },
                ],
              }
            : run,
        ),
      )
    } catch (err) {
      throw new Error("Failed to cancel scan")
    }
  }, [])

  // Update scan schedule
  const updateSchedule = useCallback(
    async (scanId: string, schedule: ScanSchedule["cron"], timezone: string, enabled: boolean) => {
      try {
        const existingSchedule = scanSchedules.find((s) => s.scanId === scanId)
        const scan = scanConfigs.find((s) => s.id === scanId)

        if (!scan) throw new Error("Scan not found")

        if (existingSchedule) {
          setScanSchedules((prev) =>
            prev.map((s) =>
              s.scanId === scanId
                ? {
                    ...s,
                    cron: schedule,
                    timezone,
                    enabled,
                    updatedAt: new Date().toISOString(),
                    nextRun: calculateNextRun(schedule, timezone),
                  }
                : s,
            ),
          )
        } else {
          const newSchedule: ScanSchedule = {
            id: `schedule-${Date.now()}`,
            scanId,
            scanName: scan.name,
            enabled,
            cron: schedule,
            timezone,
            nextRun: calculateNextRun(schedule, timezone),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          setScanSchedules((prev) => [...prev, newSchedule])
        }

        // Update scan config
        await updateScan(scanId, {
          schedule: { enabled, cron: schedule, timezone },
        })
      } catch (err) {
        throw new Error("Failed to update schedule")
      }
    },
    [scanSchedules, scanConfigs, updateScan],
  )

  // Simulate scan progress
  const simulateScanProgress = useCallback((runId: string) => {
    const interval = setInterval(() => {
      setScanRuns((prev) =>
        prev.map((run) => {
          if (run.id === runId && run.status === "running") {
            const newProgress = Math.min(run.progress + Math.random() * 15, 100)
            const newEntitiesScanned = Math.floor((newProgress / 100) * run.entitiesTotal)
            const newIssuesFound = Math.floor(Math.random() * 5)

            if (newProgress >= 100) {
              clearInterval(interval)
              return {
                ...run,
                status: "completed",
                progress: 100,
                entitiesScanned: run.entitiesTotal,
                issuesFound: run.issuesFound + newIssuesFound,
                endTime: new Date().toISOString(),
                duration: Date.now() - new Date(run.startTime).getTime(),
                logs: [
                  ...run.logs,
                  {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    level: "info",
                    message: "Scan completed successfully",
                  },
                ],
              }
            }

            return {
              ...run,
              progress: newProgress,
              entitiesScanned: newEntitiesScanned,
              issuesFound: run.issuesFound + (Math.random() > 0.8 ? 1 : 0),
            }
          }
          return run
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Helper function to calculate next run time
  const calculateNextRun = (cron: string, timezone: string): string => {
    // This is a simplified calculation - in real app, use a proper cron library
    const now = new Date()
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next day
    return nextRun.toISOString()
  }

  return {
    scanConfigs,
    scanRuns,
    scanSchedules,
    loading,
    error,
    createScan,
    updateScan,
    deleteScan,
    runScan,
    cancelScan,
    updateSchedule,
  }
}
