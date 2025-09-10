export function setupProgressTracking(
  dataSourceId: number,
  onUpdate: (evt: any) => void
) {
  const token = (typeof window !== 'undefined' && localStorage.getItem('authToken')) || ''
  const sseUrl = `/proxy/data-discovery/data-sources/${dataSourceId}/discover-schema/progress` + (token ? `?token=${encodeURIComponent(token)}` : '')
  let es: EventSource | null = null
  let ws: WebSocket | null = null

  const connectSse = () => {
    try {
      es = new EventSource(sseUrl)
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          onUpdate && onUpdate(data)
        } catch {}
      }
      es.onerror = () => {
        try { es && es.close() } catch {}
        es = null
        connectWs()
      }
    } catch {
      connectWs()
    }
  }

  const connectWs = () => {
    try {
      const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${proto}://${window.location.host}/proxy/data-discovery/data-sources/${dataSourceId}/discover-schema/progress/ws` + (token ? `?token=${encodeURIComponent(token)}` : '')
      ws = new WebSocket(wsUrl)
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          onUpdate && onUpdate(data)
        } catch {}
      }
      ws.onerror = () => {
        try { ws && ws.close() } catch {}
        ws = null
      }
    } catch {}
  }

  connectSse()

  return {
    disconnect() {
      try { es && es.close() } catch {}
      try { ws && ws.close() } catch {}
      es = null
      ws = null
    }
  }
}

