export function setupProgressTracking(
  dataSourceId: number,
  onUpdate: (evt: any) => void
) {
  const token = (typeof window !== 'undefined' && localStorage.getItem('authToken')) || ''
  const sseUrl = `/proxy/data-discovery/data-sources/${dataSourceId}/discover-schema/progress` + (token ? `?token=${encodeURIComponent(token)}` : '')
  let es: EventSource | null = null
  let ws: WebSocket | null = null

  console.log(`🔗 Setting up progress tracking for data source ${dataSourceId}`)
  console.log(`📡 SSE URL: ${sseUrl}`)

  const connectSse = () => {
    try {
      console.log(`📡 Connecting to SSE: ${sseUrl}`)
      es = new EventSource(sseUrl)
      es.onopen = () => {
        console.log(`✅ SSE connection opened for data source ${dataSourceId}`)
      }
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          console.log(`📨 SSE message received:`, data)
          onUpdate && onUpdate(data)
        } catch (err) {
          console.error(`❌ Failed to parse SSE message:`, err)
        }
      }
      es.onerror = (err) => {
        console.error(`❌ SSE error for data source ${dataSourceId}:`, err)
        try { es && es.close() } catch {}
        es = null
        console.log(`🔄 Falling back to WebSocket...`)
        connectWs()
      }
    } catch (err) {
      console.error(`❌ Failed to create SSE connection:`, err)
      connectWs()
    }
  }

  const connectWs = () => {
    try {
      const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${proto}://${window.location.host}/proxy/data-discovery/data-sources/${dataSourceId}/discover-schema/progress/ws` + (token ? `?token=${encodeURIComponent(token)}` : '')
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`)
      ws = new WebSocket(wsUrl)
      ws.onopen = () => {
        console.log(`✅ WebSocket connection opened for data source ${dataSourceId}`)
      }
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          console.log(`📨 WebSocket message received:`, data)
          onUpdate && onUpdate(data)
        } catch (err) {
          console.error(`❌ Failed to parse WebSocket message:`, err)
        }
      }
      ws.onerror = (err) => {
        console.error(`❌ WebSocket error for data source ${dataSourceId}:`, err)
        try { ws && ws.close() } catch {}
        ws = null
      }
      ws.onclose = () => {
        console.log(`🔌 WebSocket connection closed for data source ${dataSourceId}`)
      }
    } catch (err) {
      console.error(`❌ Failed to create WebSocket connection:`, err)
    }
  }

  connectSse()

  return {
    disconnect() {
      console.log(`🔌 Disconnecting progress tracking for data source ${dataSourceId}`)
      try { es && es.close() } catch {}
      try { ws && ws.close() } catch {}
      es = null
      ws = null
    }
  }
}
