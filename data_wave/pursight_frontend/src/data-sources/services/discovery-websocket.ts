// WebSocket service for real-time discovery updates
// This replaces polling-based status checks to prevent database exhaustion

export class DiscoveryWebSocketService {
  private ws: WebSocket | null = null
  private dataSourceId: number
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private pingInterval: NodeJS.Timeout | null = null
  private onMessageCallback: ((message: any) => void) | null = null
  private onStatusUpdateCallback: ((status: any) => void) | null = null
  private onErrorCallback: ((error: any) => void) | null = null

  constructor(dataSourceId: number) {
    this.dataSourceId = dataSourceId
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        // Always use proxy path to reach backend WS
        const wsUrl = `${protocol}//${window.location.host}/proxy/data-discovery/data-sources/${this.dataSourceId}/discovery-status`
        
        console.log('🔌 Connecting to WebSocket:', wsUrl)
        
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('✅ WebSocket connected for data source', this.dataSourceId)
          this.reconnectAttempts = 0
          this.startPingInterval()
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log('📨 WebSocket message received:', message)
            
            if (this.onMessageCallback) {
              this.onMessageCallback(message)
            }
            
            // Handle specific message types
            switch (message.type) {
              case 'discovery_started':
                console.log('🚀 Discovery started via WebSocket')
                if (this.onStatusUpdateCallback) {
                  this.onStatusUpdateCallback({ is_running: true, active_user: message.user })
                }
                break
              case 'discovery_completed':
                console.log('✅ Discovery completed via WebSocket')
                if (this.onStatusUpdateCallback) {
                  this.onStatusUpdateCallback({ is_running: false })
                }
                break
              case 'discovery_stopped':
                console.log('⏹️ Discovery stopped via WebSocket')
                if (this.onStatusUpdateCallback) {
                  this.onStatusUpdateCallback({ is_running: false })
                }
                break
              case 'status_update':
                console.log('📊 Status update via WebSocket')
                if (this.onStatusUpdateCallback) {
                  this.onStatusUpdateCallback(message)
                }
                break
              case 'pong':
                // Ping response - connection is alive
                break
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason)
          this.stopPingInterval()
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            setTimeout(() => {
              this.connect().catch(console.error)
            }, this.reconnectDelay * this.reconnectAttempts)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          if (this.onErrorCallback) {
            this.onErrorCallback(error)
          }
          reject(error)
        }
        
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket')
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

  requestStatus(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'get_status' }))
    }
  }

  // Event handlers
  onMessage(callback: (message: any) => void): void {
    this.onMessageCallback = callback
  }

  onStatusUpdate(callback: (status: any) => void): void {
    this.onStatusUpdateCallback = callback
  }

  onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Singleton instance for each data source
const wsInstances: Map<number, DiscoveryWebSocketService> = new Map()

export function getDiscoveryWebSocket(dataSourceId: number): DiscoveryWebSocketService {
  if (!wsInstances.has(dataSourceId)) {
    wsInstances.set(dataSourceId, new DiscoveryWebSocketService(dataSourceId))
  }
  return wsInstances.get(dataSourceId)!
}

export function disconnectDiscoveryWebSocket(dataSourceId: number): void {
  const ws = wsInstances.get(dataSourceId)
  if (ws) {
    ws.disconnect()
    wsInstances.delete(dataSourceId)
  }
}
