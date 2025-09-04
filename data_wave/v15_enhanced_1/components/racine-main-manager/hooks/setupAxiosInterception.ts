import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { RequestPriority } from './useGlobalAPIOrchestrator'

// Simple guard to ensure we only patch axios once per session
let axiosPatched = false

// Determine request priority and estimated duration heuristically (mirrors fetch interceptor)
const getRequestPriority = (url: string, method: string): RequestPriority => {
  if (/\/auth\//.test(url) || /\/health/.test(url) || /\/ping/.test(url)) return RequestPriority.CRITICAL
  if (/\/notifications/.test(url) || /\/user\//.test(url) || /\/data-sources\/\d+\/(health|stats)/.test(url)) return RequestPriority.HIGH
  if (/\/data-sources|\/scans|\/reports|\/tasks/.test(url)) return RequestPriority.MEDIUM
  if (/\/analytics|\/metrics|\/logs/.test(url)) return RequestPriority.LOW
  if (/\/bulk|\/import|\/export/.test(url)) return RequestPriority.BULK
  return RequestPriority.MEDIUM
}

const getEstimatedDuration = (url: string, method: string): number => {
  if (/\/auth\//.test(url) || /\/health/.test(url) || /\/ping/.test(url)) return 1000
  if (/\/notifications|\/user\//.test(url)) return 1500
  if (/\/data-sources|\/scans|\/reports|\/tasks/.test(url)) return 3000
  if (/\/analytics|\/metrics|\/logs/.test(url)) return 5000
  if (/\/bulk|\/import|\/export/.test(url)) return 10000
  return 3000
}

export const setupAxiosInterception = (orchestrator: any) => {
  if (axiosPatched) return

  // Install a request interceptor that waits for a slot via orchestrator,
  // then lets axios proceed normally using its default adapter.
  axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
      const base = config.baseURL || ''
      const path = typeof config.url === 'string' ? config.url : ''
      const endpoint = base ? new URL(path, base).toString() : path
      const method = (config.method || 'get').toUpperCase()

      // Skip static/assets, websocket URLs, Next.js dev tooling and internal endpoints
      if (
        endpoint.includes('.js') || endpoint.includes('.css') || endpoint.includes('.png') || endpoint.includes('.jpg') ||
        endpoint.startsWith('ws://') || endpoint.startsWith('wss://') ||
        endpoint.includes('/__nextjs_') || endpoint.includes('/__next/')
      ) {
        return config
      }

      const priority = getRequestPriority(endpoint, method)
      const estimatedDuration = getEstimatedDuration(endpoint, method)

      // Acquire a slot; requestFn is a no-op because axios will actually perform the request after this.
      await orchestrator.executeRequest({
        priority,
        endpoint,
        method,
        estimatedDuration
      }, async () => true)

      return config
    } catch (_) {
      return config
    }
  })

  axiosPatched = true
}


