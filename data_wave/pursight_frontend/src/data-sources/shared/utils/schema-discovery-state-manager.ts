/**
 * Enterprise Schema Discovery State Manager
 * Advanced state persistence with production-level reliability
 * Handles complex scenarios like ongoing discovery processes, view changes, and browser refresh
 */

interface SchemaDiscoveryState {
  // Core schema data
  schemaTree: any[]
  pathIndex: Record<string, string>
  
  // UI state
  selectedNodes: Set<string>
  expandedNodes: Set<string>
  searchInput: string
  searchTerm: string
  typeFilter: 'all' | 'table' | 'view' | 'column'
  
  // Discovery process state
  isLoading: boolean
  isStarted: boolean
  discoveryProgress: number
  discoveryStatus: string
  subProgress: any
  schemaStats: any
  
  // Error and success states
  error: string | null
  successMessage: string | null
  
  // Dialog states
  previewData: any
  showPreviewDialog: boolean
  showValidationPopup: boolean
  validationResult: any
  isValidating: boolean
  
  // Process control
  abortController: AbortController | null
  
  // Enhanced persistence metadata
  lastUpdated: number
  sessionId: string
  viewState: {
    scrollPosition: number
    focusedNodeId: string | null
    viewportHeight: number
  }
  
  // Discovery process metadata
  discoveryMetadata: {
    startTime: number | null
    estimatedCompletion: number | null
    processId: string | null
    retryCount: number
    lastCheckpoint: number
  }
  
  // Performance tracking
  performanceMetrics: {
    renderTime: number
    filterTime: number
    searchTime: number
    lastOptimization: number
  }
}

class SchemaDiscoveryStateManager {
  private static instance: SchemaDiscoveryStateManager
  private state: Map<string, SchemaDiscoveryState> = new Map()
  private listeners: Map<string, Set<(state: SchemaDiscoveryState) => void>> = new Map()
  private persistenceQueue: Map<string, NodeJS.Timeout> = new Map()
  private backgroundSync: Map<string, NodeJS.Timeout> = new Map()
  private readonly PERSISTENCE_DEBOUNCE_MS = 1000
  private readonly BACKGROUND_SYNC_INTERVAL = 5000
  private readonly MAX_RETRY_ATTEMPTS = 3
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  static getInstance(): SchemaDiscoveryStateManager {
    if (!SchemaDiscoveryStateManager.instance) {
      SchemaDiscoveryStateManager.instance = new SchemaDiscoveryStateManager()
    }
    return SchemaDiscoveryStateManager.instance
  }

  private getKey(dataSourceId: number): string {
    return `schema_discovery_${dataSourceId}`
  }

  private getInitialState(): SchemaDiscoveryState {
    const now = Date.now()
    return {
      // Core schema data
      schemaTree: [],
      pathIndex: {},
      
      // UI state
      selectedNodes: new Set(),
      expandedNodes: new Set(),
      searchInput: "",
      searchTerm: "",
      typeFilter: 'all',
      
      // Discovery process state
      isLoading: false,
      isStarted: false,
      discoveryProgress: 0,
      discoveryStatus: "",
      subProgress: null,
      schemaStats: null,
      
      // Error and success states
      error: null,
      successMessage: null,
      
      // Dialog states
      previewData: null,
      showPreviewDialog: false,
      showValidationPopup: false,
      validationResult: null,
      isValidating: false,
      
      // Process control
      abortController: null,
      
      // Enhanced persistence metadata
      lastUpdated: now,
      sessionId: this.generateSessionId(),
      viewState: {
        scrollPosition: 0,
        focusedNodeId: null,
        viewportHeight: 0
      },
      
      // Discovery process metadata
      discoveryMetadata: {
        startTime: null,
        estimatedCompletion: null,
        processId: null,
        retryCount: 0,
        lastCheckpoint: 0
      },
      
      // Performance tracking
      performanceMetrics: {
        renderTime: 0,
        filterTime: 0,
        searchTime: 0,
        lastOptimization: now
      }
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getState(dataSourceId: number): SchemaDiscoveryState {
    const key = this.getKey(dataSourceId)
    if (!this.state.has(key)) {
      // Try to restore from persistent storage first
      const restoredState = this.restoreFromSession(dataSourceId)
      if (Object.keys(restoredState).length > 0) {
        const initialState = this.getInitialState()
        const mergedState = { ...initialState, ...restoredState }
        this.state.set(key, mergedState)
        this.startBackgroundSync(dataSourceId)
      } else {
        this.state.set(key, this.getInitialState())
      }
    }
    return this.state.get(key)!
  }

  updateState(dataSourceId: number, updates: Partial<SchemaDiscoveryState>): void {
    const key = this.getKey(dataSourceId)
    const currentState = this.getState(dataSourceId)
    const now = Date.now()
    
    // Create new state with enhanced metadata
    const newState: SchemaDiscoveryState = { 
      ...currentState, 
      ...updates,
      lastUpdated: now
    }
    
    // Handle Set objects properly
    if (updates.selectedNodes) newState.selectedNodes = updates.selectedNodes
    if (updates.expandedNodes) newState.expandedNodes = updates.expandedNodes
    
    // Update discovery metadata for ongoing processes
    if (updates.isLoading || updates.isStarted) {
      if (!newState.discoveryMetadata.startTime && updates.isLoading) {
        newState.discoveryMetadata.startTime = now
        newState.discoveryMetadata.processId = this.generateSessionId()
      }
      if (updates.discoveryProgress !== undefined) {
        newState.discoveryMetadata.lastCheckpoint = updates.discoveryProgress
      }
    }
    
    this.state.set(key, newState)
    this.notifyListeners(dataSourceId, newState)
    
    // Schedule debounced persistence
    this.schedulePersistence(dataSourceId)
    
    // Start background sync for ongoing processes
    if (newState.isLoading || newState.isStarted) {
      this.startBackgroundSync(dataSourceId)
    }
  }

  subscribe(dataSourceId: number, callback: (state: SchemaDiscoveryState) => void): () => void {
    const key = this.getKey(dataSourceId)
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }

  private notifyListeners(dataSourceId: number, state: SchemaDiscoveryState): void {
    const key = this.getKey(dataSourceId)
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(state)
        } catch (error) {
          console.error('Error in state listener:', error)
        }
      })
    }
  }

  // Enhanced persistence with comprehensive state management
  private schedulePersistence(dataSourceId: number): void {
    const key = this.getKey(dataSourceId)
    
    // Clear existing timeout
    if (this.persistenceQueue.has(key)) {
      clearTimeout(this.persistenceQueue.get(key)!)
    }
    
    // Schedule new persistence
    const timeout = setTimeout(() => {
      this.persistToSession(dataSourceId)
      this.persistenceQueue.delete(key)
    }, this.PERSISTENCE_DEBOUNCE_MS)
    
    this.persistenceQueue.set(key, timeout)
  }

  // Persist comprehensive state to multiple storage layers
  persistToSession(dataSourceId: number): void {
    try {
      const state = this.getState(dataSourceId)
      const key = `schema_discovery_persistent_${dataSourceId}`
      const now = Date.now()
      
      // Create comprehensive persistent data
      const persistentData = {
        // Core schema data
        schemaTree: state.schemaTree,
        pathIndex: state.pathIndex,
        
        // UI state
        selectedNodes: Array.from(state.selectedNodes),
        expandedNodes: Array.from(state.expandedNodes),
        searchInput: state.searchInput,
        searchTerm: state.searchTerm,
        typeFilter: state.typeFilter,
        
        // Discovery process state
        isLoading: state.isLoading,
        isStarted: state.isStarted,
        discoveryProgress: state.discoveryProgress,
        discoveryStatus: state.discoveryStatus,
        subProgress: state.subProgress,
        schemaStats: state.schemaStats,
        
        // Error and success states
        error: state.error,
        successMessage: state.successMessage,
        
        // Dialog states
        previewData: state.previewData,
        showPreviewDialog: state.showPreviewDialog,
        showValidationPopup: state.showValidationPopup,
        validationResult: state.validationResult,
        isValidating: state.isValidating,
        
        // Enhanced metadata
        lastUpdated: state.lastUpdated,
        sessionId: state.sessionId,
        viewState: state.viewState,
        discoveryMetadata: state.discoveryMetadata,
        performanceMetrics: state.performanceMetrics,
        
        // Persistence metadata
        timestamp: now,
        version: '2.0.0',
        checksum: this.calculateChecksum(state)
      }
      
      if (typeof window !== 'undefined') {
        // Primary storage in sessionStorage
        window.sessionStorage.setItem(key, JSON.stringify(persistentData))
        
        // Backup storage in localStorage for critical data
        const criticalData = {
          dataSourceId,
          sessionId: state.sessionId,
          isStarted: state.isStarted,
          isLoading: state.isLoading,
          discoveryProgress: state.discoveryProgress,
          discoveryStatus: state.discoveryStatus,
          lastUpdated: state.lastUpdated,
          timestamp: now
        }
        window.localStorage.setItem(`schema_discovery_backup_${dataSourceId}`, JSON.stringify(criticalData))
        
        // Index for quick discovery of active sessions
        this.updateActiveSessionsIndex(dataSourceId, now)
      }
    } catch (error) {
      console.error('Failed to persist state to sessionStorage:', error)
      // Fallback to minimal persistence
      this.persistMinimalState(dataSourceId)
    }
  }

  private persistMinimalState(dataSourceId: number): void {
    try {
      const state = this.getState(dataSourceId)
      const minimalData = {
        dataSourceId,
        isStarted: state.isStarted,
        isLoading: state.isLoading,
        discoveryProgress: state.discoveryProgress,
        discoveryStatus: state.discoveryStatus,
        timestamp: Date.now()
      }
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`schema_discovery_minimal_${dataSourceId}`, JSON.stringify(minimalData))
      }
    } catch (error) {
      console.error('Failed to persist minimal state:', error)
    }
  }

  private calculateChecksum(state: SchemaDiscoveryState): string {
    const data = JSON.stringify({
      schemaTree: state.schemaTree,
      selectedNodes: Array.from(state.selectedNodes),
      expandedNodes: Array.from(state.expandedNodes),
      discoveryProgress: state.discoveryProgress
    })
    
    // Simple checksum for data integrity
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private updateActiveSessionsIndex(dataSourceId: number, timestamp: number): void {
    try {
      if (typeof window === 'undefined') return
      
      const indexKey = 'schema_discovery_active_sessions'
      const existing = window.localStorage.getItem(indexKey)
      const sessions = existing ? JSON.parse(existing) : {}
      
      sessions[dataSourceId] = {
        timestamp,
        lastActivity: timestamp
      }
      
      // Clean up old sessions
      const cutoff = timestamp - this.SESSION_TIMEOUT
      Object.keys(sessions).forEach(id => {
        if (sessions[id].lastActivity < cutoff) {
          delete sessions[id]
        }
      })
      
      window.localStorage.setItem(indexKey, JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to update active sessions index:', error)
    }
  }

  // Enhanced restoration with comprehensive state recovery
  restoreFromSession(dataSourceId: number): Partial<SchemaDiscoveryState> {
    try {
      const key = `schema_discovery_persistent_${dataSourceId}`
      if (typeof window === 'undefined') return {}
      
      const saved = window.sessionStorage.getItem(key)
      if (!saved) {
        // Try backup storage
        return this.restoreFromBackup(dataSourceId)
      }
      
      const parsed = JSON.parse(saved)
      const now = Date.now()
      const maxAge = this.SESSION_TIMEOUT
      
      // Check if data is not too old
      if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
        window.sessionStorage.removeItem(key)
        return this.restoreFromBackup(dataSourceId)
      }
      
      // Validate data integrity
      if (parsed.checksum && parsed.checksum !== this.calculateChecksumFromParsed(parsed)) {
        console.warn('Data integrity check failed, using backup')
        return this.restoreFromBackup(dataSourceId)
      }
      
      // Restore comprehensive state
      return {
        // Core schema data
        schemaTree: parsed.schemaTree || [],
        pathIndex: parsed.pathIndex || {},
        
        // UI state
        selectedNodes: new Set(parsed.selectedNodes || []),
        expandedNodes: new Set(parsed.expandedNodes || []),
        searchInput: parsed.searchInput || "",
        searchTerm: parsed.searchTerm || "",
        typeFilter: parsed.typeFilter || 'all',
        
        // Discovery process state
        isLoading: parsed.isLoading || false,
        isStarted: parsed.isStarted || false,
        discoveryProgress: parsed.discoveryProgress || 0,
        discoveryStatus: parsed.discoveryStatus || "",
        subProgress: parsed.subProgress || null,
        schemaStats: parsed.schemaStats || null,
        
        // Error and success states
        error: parsed.error || null,
        successMessage: parsed.successMessage || null,
        
        // Dialog states
        previewData: parsed.previewData || null,
        showPreviewDialog: parsed.showPreviewDialog || false,
        showValidationPopup: parsed.showValidationPopup || false,
        validationResult: parsed.validationResult || null,
        isValidating: parsed.isValidating || false,
        
        // Enhanced metadata
        lastUpdated: parsed.lastUpdated || now,
        sessionId: parsed.sessionId || this.generateSessionId(),
        viewState: parsed.viewState || {
          scrollPosition: 0,
          focusedNodeId: null,
          viewportHeight: 0
        },
        discoveryMetadata: parsed.discoveryMetadata || {
          startTime: null,
          estimatedCompletion: null,
          processId: null,
          retryCount: 0,
          lastCheckpoint: 0
        },
        performanceMetrics: parsed.performanceMetrics || {
          renderTime: 0,
          filterTime: 0,
          searchTime: 0,
          lastOptimization: now
        }
      }
    } catch (error) {
      console.error('Failed to restore state from sessionStorage:', error)
      return this.restoreFromBackup(dataSourceId)
    }
  }

  private restoreFromBackup(dataSourceId: number): Partial<SchemaDiscoveryState> {
    try {
      if (typeof window === 'undefined') return {}
      
      const backupKey = `schema_discovery_backup_${dataSourceId}`
      const saved = window.localStorage.getItem(backupKey)
      if (!saved) return {}
      
      const parsed = JSON.parse(saved)
      const now = Date.now()
      const maxAge = this.SESSION_TIMEOUT
      
      // Check if backup is not too old
      if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
        window.localStorage.removeItem(backupKey)
        return {}
      }
      
      return {
        isStarted: parsed.isStarted || false,
        isLoading: parsed.isLoading || false,
        discoveryProgress: parsed.discoveryProgress || 0,
        discoveryStatus: parsed.discoveryStatus || "",
        lastUpdated: parsed.lastUpdated || now,
        sessionId: parsed.sessionId || this.generateSessionId()
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return {}
    }
  }

  private calculateChecksumFromParsed(parsed: any): string {
    const data = JSON.stringify({
      schemaTree: parsed.schemaTree || [],
      selectedNodes: parsed.selectedNodes || [],
      expandedNodes: parsed.expandedNodes || [],
      discoveryProgress: parsed.discoveryProgress || 0
    })
    
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  // Background sync for ongoing discovery processes
  private startBackgroundSync(dataSourceId: number): void {
    const key = this.getKey(dataSourceId)
    
    // Clear existing sync
    if (this.backgroundSync.has(key)) {
      clearInterval(this.backgroundSync.get(key)!)
    }
    
    // Start new background sync
    const interval = setInterval(async () => {
      try {
        const state = this.getState(dataSourceId)
        
        // Only sync if discovery is running
        if (!state.isLoading && !state.isStarted) {
          this.stopBackgroundSync(dataSourceId)
          return
        }
        
        // Persist current state
        this.persistToSession(dataSourceId)
        
        // Update activity timestamp
        this.updateActiveSessionsIndex(dataSourceId, Date.now())
        
        // Check for discovery completion
        if (state.isLoading) {
          await this.checkDiscoveryStatus(dataSourceId)
        }
      } catch (error) {
        console.error('Background sync error:', error)
      }
    }, this.BACKGROUND_SYNC_INTERVAL)
    
    this.backgroundSync.set(key, interval)
  }

  private stopBackgroundSync(dataSourceId: number): void {
    const key = this.getKey(dataSourceId)
    if (this.backgroundSync.has(key)) {
      clearInterval(this.backgroundSync.get(key)!)
      this.backgroundSync.delete(key)
    }
  }

  private async checkDiscoveryStatus(dataSourceId: number): Promise<void> {
    try {
      const state = this.getState(dataSourceId)
      if (!state.isLoading && !state.isStarted) return
      
      // Check actual discovery status from backend
      const token = (typeof window !== 'undefined' && (localStorage.getItem('authToken') || localStorage.getItem('auth_token'))) || ''
      const response = await fetch(`/proxy/data-discovery/data-sources/${dataSourceId}/discovery-status`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      })
      
      if (response.ok) {
        const data = await response.json()
        const isRunning = data?.data?.is_running === true
        
        if (!isRunning && state.isLoading) {
          // Discovery completed while we were away
          this.updateState(dataSourceId, {
            isLoading: false,
            discoveryProgress: 100,
            discoveryStatus: '🎉 Discovery completed successfully!',
            lastUpdated: Date.now()
          })
          
          // Trigger a refresh to get the completed results
          this.triggerDiscoveryResultsRefresh(dataSourceId)
        } else if (isRunning && !state.isLoading) {
          // Discovery is running but we lost track
          this.updateState(dataSourceId, {
            isLoading: true,
            isStarted: true,
            lastUpdated: Date.now()
          })
        }
      }
    } catch (error) {
      console.error('Failed to check discovery status:', error)
      // If we can't check status, assume discovery is still running if it was before
      const state = this.getState(dataSourceId)
      if (state.isLoading || state.isStarted) {
        this.updateState(dataSourceId, {
          lastUpdated: Date.now()
        })
      }
    }
  }

  // Enhanced state management methods
  updateViewState(dataSourceId: number, viewState: Partial<SchemaDiscoveryState['viewState']>): void {
    const currentState = this.getState(dataSourceId)
    this.updateState(dataSourceId, {
      viewState: { ...currentState.viewState, ...viewState }
    })
  }

  updatePerformanceMetrics(dataSourceId: number, metrics: Partial<SchemaDiscoveryState['performanceMetrics']>): void {
    const currentState = this.getState(dataSourceId)
    this.updateState(dataSourceId, {
      performanceMetrics: { ...currentState.performanceMetrics, ...metrics }
    })
  }

  // Get active sessions across all data sources
  getActiveSessions(): Record<string, { timestamp: number; lastActivity: number }> {
    try {
      if (typeof window === 'undefined') return {}
      
      const indexKey = 'schema_discovery_active_sessions'
      const saved = window.localStorage.getItem(indexKey)
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Failed to get active sessions:', error)
      return {}
    }
  }

  // Check if a discovery process is running for any data source
  hasActiveDiscovery(): boolean {
    const sessions = this.getActiveSessions()
    const now = Date.now()
    
    return Object.values(sessions).some(session => 
      (now - session.lastActivity) < this.SESSION_TIMEOUT
    )
  }

  // Clear state for a specific data source with enhanced cleanup
  clearState(dataSourceId: number): void {
    const key = this.getKey(dataSourceId)
    
    // Stop background sync
    this.stopBackgroundSync(dataSourceId)
    
    // Clear persistence queue
    if (this.persistenceQueue.has(key)) {
      clearTimeout(this.persistenceQueue.get(key)!)
      this.persistenceQueue.delete(key)
    }
    
    // Clear in-memory state
    this.state.delete(key)
    this.listeners.delete(key)
    
    // Clear all storage layers
    try {
      if (typeof window !== 'undefined') {
        // Clear primary storage
        window.sessionStorage.removeItem(`schema_discovery_persistent_${dataSourceId}`)
        
        // Clear backup storage
        window.localStorage.removeItem(`schema_discovery_backup_${dataSourceId}`)
        window.localStorage.removeItem(`schema_discovery_minimal_${dataSourceId}`)
        
        // Update active sessions index
        const sessions = this.getActiveSessions()
        delete sessions[dataSourceId]
        window.localStorage.setItem('schema_discovery_active_sessions', JSON.stringify(sessions))
      }
    } catch (error) {
      console.error('Failed to clear persistent state:', error)
    }
  }

  // Check if discovery is running for a data source
  isDiscoveryRunning(dataSourceId: number): boolean {
    const state = this.getState(dataSourceId)
    return state.isLoading || state.isStarted
  }

  // Get discovery status for a data source
  getDiscoveryStatus(dataSourceId: number): { isRunning: boolean; progress: number; status: string } {
    const state = this.getState(dataSourceId)
    return {
      isRunning: state.isLoading || state.isStarted,
      progress: state.discoveryProgress,
      status: state.discoveryStatus
    }
  }

  // Enhanced discovery status with metadata
  getEnhancedDiscoveryStatus(dataSourceId: number): {
    isRunning: boolean
    progress: number
    status: string
    startTime: number | null
    estimatedCompletion: number | null
    retryCount: number
    lastCheckpoint: number
  } {
    const state = this.getState(dataSourceId)
    return {
      isRunning: state.isLoading || state.isStarted,
      progress: state.discoveryProgress,
      status: state.discoveryStatus,
      startTime: state.discoveryMetadata.startTime,
      estimatedCompletion: state.discoveryMetadata.estimatedCompletion,
      retryCount: state.discoveryMetadata.retryCount,
      lastCheckpoint: state.discoveryMetadata.lastCheckpoint
    }
  }

  // Force immediate persistence (useful before navigation)
  forcePersist(dataSourceId: number): void {
    this.persistToSession(dataSourceId)
  }

  // Force refresh discovery status (useful when returning to view)
  async forceRefreshDiscoveryStatus(dataSourceId: number): Promise<void> {
    const state = this.getState(dataSourceId)
    
    // If discovery was running, check current status
    if (state.isStarted || state.isLoading) {
      await this.checkDiscoveryStatus(dataSourceId)
    }
    
    // Force immediate persistence after refresh
    this.forcePersist(dataSourceId)
  }

  // Check if we need to refresh state when returning to view
  shouldRefreshOnReturn(dataSourceId: number): boolean {
    const state = this.getState(dataSourceId)
    const now = Date.now()
    const timeSinceLastUpdate = now - state.lastUpdated
    
    // Refresh if discovery was running and it's been more than 5 seconds
    return (state.isStarted || state.isLoading) && timeSinceLastUpdate > 5000
  }

  // Trigger discovery results refresh when discovery completes
  private async triggerDiscoveryResultsRefresh(dataSourceId: number): Promise<void> {
    try {
      // This would trigger the component to fetch the completed discovery results
      // For now, we'll just update the state to indicate completion
      const state = this.getState(dataSourceId)
      if (state.isStarted && !state.isLoading && state.discoveryProgress >= 100) {
        // Discovery completed, we should trigger a refresh in the component
        this.notifyListeners(dataSourceId, {
          ...state,
          discoveryStatus: '🎉 Discovery completed! Refreshing results...'
        })
      }
    } catch (error) {
      console.error('Failed to trigger discovery results refresh:', error)
    }
  }

  // Restore view state (scroll position, focus, etc.)
  restoreViewState(dataSourceId: number): SchemaDiscoveryState['viewState'] {
    const state = this.getState(dataSourceId)
    return state.viewState
  }

  // Get performance metrics
  getPerformanceMetrics(dataSourceId: number): SchemaDiscoveryState['performanceMetrics'] {
    const state = this.getState(dataSourceId)
    return state.performanceMetrics
  }

  // Cleanup all expired sessions
  cleanupExpiredSessions(): void {
    try {
      if (typeof window === 'undefined') return
      
      const sessions = this.getActiveSessions()
      const now = Date.now()
      const cutoff = now - this.SESSION_TIMEOUT
      
      let hasChanges = false
      Object.keys(sessions).forEach(dataSourceId => {
        if (sessions[dataSourceId].lastActivity < cutoff) {
          this.clearState(parseInt(dataSourceId))
          delete sessions[dataSourceId]
          hasChanges = true
        }
      })
      
      if (hasChanges) {
        window.localStorage.setItem('schema_discovery_active_sessions', JSON.stringify(sessions))
      }
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error)
    }
  }

  // Initialize cleanup on page load
  initialize(): void {
    // Cleanup expired sessions on initialization
    this.cleanupExpiredSessions()
    
    // Set up periodic cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupExpiredSessions()
      }, 5 * 60 * 1000) // Every 5 minutes
    }
  }
}

export const schemaDiscoveryStateManager = SchemaDiscoveryStateManager.getInstance()
export type { SchemaDiscoveryState }
