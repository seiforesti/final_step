// hooks/useRealtimeUpdates.ts
'use client'

import { useEffect, useRef } from 'react'

export function useRealtimeUpdates(channel: string, onMessage: (msg: any) => void) {
	const wsRef = useRef<WebSocket | null>(null)

	useEffect(() => {
		const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/ws/${channel}`
		wsRef.current = new WebSocket(url)
		wsRef.current.onmessage = (e) => {
			try { onMessage(JSON.parse(e.data)) } catch { /* noop */ }
		}
		return () => { wsRef.current?.close(); wsRef.current = null }
	}, [channel, onMessage])

	return { connected: !!wsRef.current }
}
