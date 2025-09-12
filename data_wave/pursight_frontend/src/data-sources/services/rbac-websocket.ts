// RBAC WebSocket service for real-time permission updates
// This prevents polling-based permission checks that exhaust the database

export class RbacWebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private pingInterval: NodeJS.Timeout | null = null
  private onPermissionUpdateCallback: ((permissions: any) => void) | null = null
  private onErrorCallback: ((error: any) => void) | null = null
  private cachedPermissions: Map<string, any> = new Map()
  private sessionToken: string = ''
  private meCache: any | null = null

  constructor() {}

  private getToken(): string {
    if (typeof window === 'undefined') return ''
    return (
      window.localStorage.getItem('authToken') ||
      window.localStorage.getItem('auth_token') ||
      ''
    )
  }

  private storageKey(resource: string): string {
    const token = this.sessionToken || 'anon'
    return `rbac:${token}:${resource}`
  }

  private persistPermission(resource: string, perms: any) {
    try {
      if (typeof window === 'undefined') return
      window.sessionStorage.setItem(this.storageKey(resource), JSON.stringify(perms))
    } catch {}
  }

  private readPersistedPermission(resource: string): any | null {
    try {
      if (typeof window === 'undefined') return null
      const raw = window.sessionStorage.getItem(this.storageKey(resource))
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  // RBAC ME persistence helpers
  private meStorageKey(): string {
    const token = this.sessionToken || this.getToken() || 'anon'
    return `rbac:${token}:me`
  }

  private persistMe(me: any) {
    try {
      if (typeof window === 'undefined') return
      window.sessionStorage.setItem(this.meStorageKey(), JSON.stringify(me))
    } catch {}
  }

  private readPersistedMe(): any | null {
    try {
      if (typeof window === 'undefined') return null
      const raw = window.sessionStorage.getItem(this.meStorageKey())
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.sessionToken = this.getToken()
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        // Always go through proxy to match backend mount path under /proxy
        const wsUrl = `${protocol}//${window.location.host}/proxy/rbac/permissions`
        
        console.log('🔌 Connecting to RBAC WebSocket:', wsUrl)
        
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('✅ RBAC WebSocket connected')
          this.reconnectAttempts = 0
          this.startPingInterval()
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log('📨 RBAC WebSocket message received:', message)
            
            // Handle permission updates
            if (message.type === 'permission_update') {
              this.cachedPermissions.set(message.resource, message.permissions)
              this.persistPermission(message.resource, message.permissions)
              if (this.onPermissionUpdateCallback) {
                this.onPermissionUpdateCallback(message)
              }
            } else if (message.type === 'pong') {
              // Ping response - connection is alive
            }
          } catch (error) {
            console.error('❌ Error parsing RBAC WebSocket message:', error)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('🔌 RBAC WebSocket disconnected:', event.code, event.reason)
          this.stopPingInterval()
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`🔄 Attempting to reconnect RBAC WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            setTimeout(() => {
              this.connect().catch(console.error)
            }, this.reconnectDelay * this.reconnectAttempts)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('❌ RBAC WebSocket error:', error)
          if (this.onErrorCallback) {
            this.onErrorCallback(error)
          }
          reject(error)
        }
        
      } catch (error) {
        console.error('❌ Failed to create RBAC WebSocket connection:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    console.log('🔌 Disconnecting RBAC WebSocket')
    this.stopPingInterval()
    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect')
      this.ws = null
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  requestPermissions(resource: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ 
        type: 'get_permissions', 
        resource: resource 
      }))
    }
  }

  // Check cached permissions first, then request if not available
  async checkPermissions(resource: string): Promise<any> {
    // Return cached permissions if available
    if (this.cachedPermissions.has(resource)) {
      return this.cachedPermissions.get(resource)
    }
    // Check persisted permissions
    const persisted = this.readPersistedPermission(resource)
    if (persisted) {
      this.cachedPermissions.set(resource, persisted)
      return persisted
    }
    
    // Request fresh permissions via WebSocket
    this.requestPermissions(resource)
    
    // Return a promise that resolves when permissions are received
    return new Promise((resolve) => {
      const originalCallback = this.onPermissionUpdateCallback
      this.onPermissionUpdateCallback = (message) => {
        if (message.resource === resource) {
          resolve(message.permissions)
          this.onPermissionUpdateCallback = originalCallback
        } else if (originalCallback) {
          originalCallback(message)
        }
      }
      
      // Timeout after 5 seconds
      setTimeout(() => {
        // Fallback to persisted cache even on timeout
        const fallback = this.readPersistedPermission(resource)
        if (fallback) resolve(fallback)
        else resolve({ hasPermission: false, error: 'Timeout' })
        this.onPermissionUpdateCallback = originalCallback
      }, 5000)
    })
  }

  // RBAC ME: capture once per session token and serve from cache
  async getMe(): Promise<any> {
    // If already in memory
    if (this.meCache) return this.meCache
    // Read persisted
    const persisted = this.readPersistedMe()
    if (persisted) {
      this.meCache = persisted
      return persisted
    }
    // Fetch once and persist
    try {
      const token = this.getToken()
      this.sessionToken = token
      const resp = await fetch('/proxy/rbac/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (!resp.ok) throw new Error(`RBAC me failed: ${resp.status}`)
      const data = await resp.json()
      this.meCache = data
      this.persistMe(data)
      return data
    } catch (e) {
      const fallback = this.readPersistedMe()
      if (fallback) return fallback
      throw e
    }
  }

  invalidateMe(): void {
    this.meCache = null
    try {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(this.meStorageKey())
    } catch {}
  }

  // Event handlers
  onPermissionUpdate(callback: (permissions: any) => void): void {
    this.onPermissionUpdateCallback = callback
  }

  onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  getCachedPermissions(resource: string): any {
    return this.cachedPermissions.get(resource)
  }
}

// Singleton instance for RBAC WebSocket
let rbacWsInstance: RbacWebSocketService | null = null

export function getRbacWebSocket(): RbacWebSocketService {
  if (!rbacWsInstance) {
    rbacWsInstance = new RbacWebSocketService()
  }
  return rbacWsInstance
}

export function disconnectRbacWebSocket(): void {
  if (rbacWsInstance) {
    rbacWsInstance.disconnect()
    rbacWsInstance = null
  }
}

