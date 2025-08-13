"use client"

import { useState, useEffect, useCallback } from "react"

export interface Permission {
  resource: string
  action: string
  granted: boolean
  reason?: string
}

export interface UserPermissions {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  canExecute: boolean
  canManageSchedules: boolean
  canViewMetrics: boolean
  canExport: boolean
  canImport: boolean
  canManageUsers: boolean
}

// Mock permissions - in real app, this would come from your auth system
const mockPermissions: UserPermissions = {
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canExecute: true,
  canManageSchedules: true,
  canViewMetrics: true,
  canExport: true,
  canImport: true,
  canManageUsers: false, // Example of restricted permission
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>(mockPermissions)
  const [isLoading, setIsLoading] = useState(false)

  const checkPermission = useCallback(
    (action: keyof UserPermissions): boolean => {
      return permissions[action]
    },
    [permissions],
  )

  const checkMultiplePermissions = useCallback(
    (actions: (keyof UserPermissions)[]): boolean => {
      return actions.every((action) => permissions[action])
    },
    [permissions],
  )

  const refreshPermissions = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      // In real app, fetch permissions from API
      setPermissions(mockPermissions)
    } catch (error) {
      console.error("Failed to refresh permissions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshPermissions()
  }, [refreshPermissions])

  return {
    permissions,
    isLoading,
    checkPermission,
    checkMultiplePermissions,
    refreshPermissions,
  }
}
