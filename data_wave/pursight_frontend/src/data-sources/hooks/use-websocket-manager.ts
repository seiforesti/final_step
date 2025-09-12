// Global WebSocket management hook for preventing database exhaustion
// This replaces polling-based status checks with real-time WebSocket communication
// Updated to fix WebSocket connection errors

import { useEffect, useRef, useState } from 'react'
import { getDiscoveryWebSocket, disconnectDiscoveryWebSocket } from '../services/discovery-websocket'
import { getRbacWebSocket, disconnectRbacWebSocket } from '../services/rbac-websocket'

export function useWebSocketManager(dataSourceId?: number) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const discoveryWsRef = useRef<any>(null)
  const rbacWsRef = useRef<any>(null)

  useEffect(() => {
    const connectWebSockets = async () => {
      try {
        // Connect to RBAC WebSocket for permission updates
        try {
          const rbacWs = getRbacWebSocket()
          if (rbacWs && typeof rbacWs.onError === 'function') {
            rbacWs.onError((error: any) => {
              console.error('RBAC WebSocket error:', error)
              setConnectionError(`RBAC WebSocket error: ${error}`)
            })
            
            await rbacWs.connect()
            rbacWsRef.current = rbacWs
          } else {
            console.warn('⚠️ RBAC WebSocket service not available')
            setConnectionError('RBAC WebSocket service not available')
          }
        } catch (error) {
          console.error('❌ Failed to connect RBAC WebSocket:', error)
          setConnectionError(`RBAC WebSocket connection failed: ${error}`)
        }
        
        // Connect to Discovery WebSocket if dataSourceId is provided
        if (dataSourceId) {
          try {
            const discoveryWs = getDiscoveryWebSocket(dataSourceId)
            if (discoveryWs && typeof discoveryWs.onError === 'function') {
              discoveryWs.onError((error: any) => {
                console.error('Discovery WebSocket error:', error)
                setConnectionError(`Discovery WebSocket error: ${error}`)
              })
              
              await discoveryWs.connect()
              discoveryWsRef.current = discoveryWs
            } else {
              console.warn('⚠️ Discovery WebSocket service not available')
              setConnectionError('Discovery WebSocket service not available')
            }
          } catch (error) {
            console.error('❌ Failed to connect Discovery WebSocket:', error)
            setConnectionError(`Discovery WebSocket connection failed: ${error}`)
          }
        }
        
        setIsConnected(true)
        setConnectionError(null)
        
      } catch (error) {
        console.error('Failed to connect WebSockets:', error)
        setConnectionError(`WebSocket connection failed: ${error}`)
        setIsConnected(false)
      }
    }

    connectWebSockets()

    return () => {
      // Cleanup on unmount
      if (dataSourceId) {
        disconnectDiscoveryWebSocket(dataSourceId)
      }
      disconnectRbacWebSocket()
    }
  }, [dataSourceId])


  const reconnect = async () => {
    try {
      setConnectionError(null)
      
      // Reconnect RBAC WebSocket
      if (rbacWsRef.current) {
        rbacWsRef.current.disconnect()
      }
      const rbacWs = getRbacWebSocket()
      await rbacWs.connect()
      rbacWsRef.current = rbacWs
      
      // Reconnect Discovery WebSocket if needed
      if (dataSourceId && discoveryWsRef.current) {
        discoveryWsRef.current.disconnect()
        const discoveryWs = getDiscoveryWebSocket(dataSourceId)
        await discoveryWs.connect()
        discoveryWsRef.current = discoveryWs
      }
      
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to reconnect WebSockets:', error)
      setConnectionError(`Reconnection failed: ${error}`)
    }
  }

  return {
    isConnected,
    connectionError,
    getDiscoveryWebSocket: () => discoveryWsRef.current,
    getRbacWebSocket: () => rbacWsRef.current,
    reconnect
  }
}

// Hook for checking permissions without polling
export function useRbacPermissions(resource: string) {
  const [permissions, setPermissions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const rbacWsRef = useRef<any>(null)

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const rbacWs = getRbacWebSocket()
        rbacWsRef.current = rbacWs
        
        // Set up permission update handler
        rbacWs.onPermissionUpdate((message) => {
          if (message.resource === resource) {
            setPermissions(message.permissions)
            setIsLoading(false)
          }
        })
        
        // Request permissions
        const perms = await rbacWs.checkPermissions(resource)
        setPermissions(perms)
        setIsLoading(false)
        
      } catch (err) {
        console.error('Failed to check permissions:', err)
        setError(`Permission check failed: ${err}`)
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [resource])

  const refreshPermissions = async () => {
    if (rbacWsRef.current) {
      rbacWsRef.current.requestPermissions(resource)
    }
  }

  return {
    permissions,
    isLoading,
    error,
    refreshPermissions,
    hasPermission: permissions?.hasPermission || false
  }
}
