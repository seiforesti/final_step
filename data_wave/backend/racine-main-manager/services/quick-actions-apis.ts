/**
 * Racine Quick Actions API Service
 * =================================
 * 
 * Comprehensive API service for quick actions functionality that provides
 * rapid access to common operations across the entire Racine system.
 * 
 * Features:
 * - Global quick actions management
 * - Cross-SPA action coordination
 * - Keyboard shortcuts and hotkeys
 * - Action history and favorites
 * - Custom action creation
 * - Action analytics and usage tracking
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/services/quick_actions_service.py
 * - Routes: backend/scripts_automation/app/api/routes/quick_actions.py
 */

import {
  APIResponse,
  QuickAction,
  QuickActionCategory,
  QuickActionExecution,
  QuickActionHistory,
  QuickActionAnalytics,
  QuickActionTemplate,
  QuickActionShortcut,
  UUID,
  ISODateString,
  OperationStatus,
  PaginationRequest,
  FilterRequest
} from '../types/api.types';

import {
  RacineWorkspace,
  RacineUser,
  RacineResource
} from '../types/racine-core.types';

/**
 * Configuration for the quick actions API service
 */
interface QuickActionsAPIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableWebSocket: boolean;
  websocketURL?: string;
  maxHistoryItems: number;
  enableAnalytics: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: QuickActionsAPIConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableWebSocket: true,
  websocketURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  maxHistoryItems: 100,
  enableAnalytics: true
};

/**
 * WebSocket event types for real-time quick actions updates
 */
export enum QuickActionsEventType {
  ACTION_EXECUTED = 'action_executed',
  ACTION_CREATED = 'action_created',
  ACTION_UPDATED = 'action_updated',
  ACTION_DELETED = 'action_deleted',
  SHORTCUT_REGISTERED = 'shortcut_registered',
  SHORTCUT_TRIGGERED = 'shortcut_triggered',
  FAVORITE_ADDED = 'favorite_added',
  FAVORITE_REMOVED = 'favorite_removed',
  HISTORY_UPDATED = 'history_updated',
  ANALYTICS_UPDATED = 'analytics_updated'
}

/**
 * Quick Actions API Service Class
 */
export class QuickActionsAPI {
  private config: QuickActionsAPIConfig;
  private ws: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config?: Partial<QuickActionsAPIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket() {
    if (!this.config.enableWebSocket || !this.config.websocketURL) return;

    // Check if we're in development mode and backend might not be available
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         (typeof window !== 'undefined' && (
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1'
                         ));
    
    if (isDevelopment) {
      console.log('Development environment detected, checking backend availability...');
      this.checkBackendAvailability().then(isAvailable => {
        if (isAvailable) {
          this.attemptWebSocketConnection();
        } else {
          console.log('Backend not available, will retry WebSocket connection later');
          // Schedule a retry after a delay
          setTimeout(() => this.scheduleReconnect(), 10000);
        }
      }).catch(() => {
        console.log('Backend check failed, will retry WebSocket connection later');
        setTimeout(() => this.scheduleReconnect(), 10000);
      });
      return;
    }

    // In production, attempt WebSocket connection directly
    this.attemptWebSocketConnection();
  }

  /**
   * Check if backend is available before attempting WebSocket connection
   */
  private async checkBackendAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Attempt WebSocket connection with proper error handling
   */
  private attemptWebSocketConnection() {
    try {
      this.ws = new WebSocket(this.config.websocketURL);
      
      this.ws.onopen = () => {
        console.log('Quick Actions WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.warn('Error parsing WebSocket message (handled gracefully):', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Quick Actions WebSocket disconnected');
        this.emit('disconnected', {});
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.warn('Quick Actions WebSocket error (handled gracefully):', error);
        this.emit('error', { error });
        
        // Don't immediately disconnect on error, let the connection attempt to recover
        // Only emit the error event for components to handle
      };

      // Set connection timeout
      setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout, will retry later');
          this.ws.close();
          this.scheduleReconnect();
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      console.warn('Failed to initialize Quick Actions WebSocket (will retry):', error);
      // Schedule a retry instead of giving up
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule WebSocket reconnection
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max WebSocket reconnection attempts reached, will retry later');
      // Reset attempts after a longer delay and try again
      setTimeout(() => {
        this.reconnectAttempts = 0;
        this.initializeWebSocket();
      }, 30000); // Wait 30 seconds before trying again
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.retryDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Quick Actions WebSocket reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.initializeWebSocket();
    }, delay);
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(data: any) {
    const { event, payload } = data;
    
    switch (event) {
      case QuickActionsEventType.ACTION_EXECUTED:
        this.emit('actionExecuted', payload);
        break;
      case QuickActionsEventType.ACTION_CREATED:
        this.emit('actionCreated', payload);
        break;
      case QuickActionsEventType.ACTION_UPDATED:
        this.emit('actionUpdated', payload);
        break;
      case QuickActionsEventType.ACTION_DELETED:
        this.emit('actionDeleted', payload);
        break;
      case QuickActionsEventType.SHORTCUT_TRIGGERED:
        this.emit('shortcutTriggered', payload);
        break;
      case QuickActionsEventType.FAVORITE_ADDED:
        this.emit('favoriteAdded', payload);
        break;
      case QuickActionsEventType.FAVORITE_REMOVED:
        this.emit('favoriteRemoved', payload);
        break;
      case QuickActionsEventType.HISTORY_UPDATED:
        this.emit('historyUpdated', payload);
        break;
      case QuickActionsEventType.ANALYTICS_UPDATED:
        this.emit('analyticsUpdated', payload);
        break;
      default:
        console.warn('Unknown WebSocket event:', event);
    }
  }

  /**
   * Event management
   */
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.config.baseURL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        });

        if (!response.ok) {
          // Graceful handling for upstream gateway errors in dev
          if ([502, 503, 504].includes(response.status)) {
            throw new Error(`Gateway ${response.status}: ${response.statusText}`);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * attempt)
          );
        }
      }
    }

    throw lastError || new Error('Request failed after all retry attempts');
  }

  /**
   * Usage analytics used by GlobalQuickActionsSidebar
   */
  async getUsageAnalytics(): Promise<Record<string, any>> {
    try {
      return await this.makeRequest<Record<string, any>>('/api/v1/quick-actions/usage-analytics');
    } catch (e) {
      // Provide safe defaults to keep UI responsive
      return {
        totalActionsExecuted: 0,
        favoriteActions: 0,
        recentExecutions: 0,
        topCategories: [],
      };
    }
  }

  // ============================================================================
  // QUICK ACTIONS CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all quick actions
   */
  async getQuickActions(filters?: FilterRequest): Promise<QuickAction[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return this.makeRequest<QuickAction[]>(`/api/v1/quick-actions?${params.toString()}`);
  }

  /**
   * Get quick action by ID
   */
  async getQuickActionById(id: UUID): Promise<QuickAction> {
    return this.makeRequest<QuickAction>(`/api/v1/quick-actions/${id}`);
  }

  /**
   * Create new quick action
   */
  async createQuickAction(action: Partial<QuickAction>): Promise<QuickAction> {
    return this.makeRequest<QuickAction>('/api/v1/quick-actions', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  /**
   * Update quick action
   */
  async updateQuickAction(id: UUID, updates: Partial<QuickAction>): Promise<QuickAction> {
    return this.makeRequest<QuickAction>(`/api/v1/quick-actions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete quick action
   */
  async deleteQuickAction(id: UUID): Promise<void> {
    return this.makeRequest<void>(`/api/v1/quick-actions/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // QUICK ACTION EXECUTION
  // ============================================================================

  /**
   * Execute quick action
   */
  async executeQuickAction(
    id: UUID,
    context?: Record<string, any>
  ): Promise<QuickActionExecution> {
    return this.makeRequest<QuickActionExecution>(`/api/v1/quick-actions/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ context }),
    });
  }

  /**
   * Execute quick action by name
   */
  async executeQuickActionByName(
    name: string,
    context?: Record<string, any>
  ): Promise<QuickActionExecution> {
    return this.makeRequest<QuickActionExecution>('/api/v1/quick-actions/execute-by-name', {
      method: 'POST',
      body: JSON.stringify({ name, context }),
    });
  }

  /**
   * Execute multiple quick actions
   */
  async executeMultipleActions(
    actionIds: UUID[],
    context?: Record<string, any>
  ): Promise<QuickActionExecution[]> {
    return this.makeRequest<QuickActionExecution[]>('/api/v1/quick-actions/execute-multiple', {
      method: 'POST',
      body: JSON.stringify({ actionIds, context }),
    });
  }

  // ============================================================================
  // SHORTCUTS MANAGEMENT
  // ============================================================================

  /**
   * Register keyboard shortcut
   */
  async registerShortcut(
    actionId: UUID,
    shortcut: QuickActionShortcut
  ): Promise<QuickActionShortcut> {
    return this.makeRequest<QuickActionShortcut>(`/api/v1/quick-actions/${actionId}/shortcuts`, {
      method: 'POST',
      body: JSON.stringify(shortcut),
    });
  }

  /**
   * Get shortcuts for action
   */
  async getActionShortcuts(actionId: UUID): Promise<QuickActionShortcut[]> {
    return this.makeRequest<QuickActionShortcut[]>(`/api/v1/quick-actions/${actionId}/shortcuts`);
  }

  /**
   * Remove shortcut
   */
  async removeShortcut(actionId: UUID, shortcutId: UUID): Promise<void> {
    return this.makeRequest<void>(`/api/v1/quick-actions/${actionId}/shortcuts/${shortcutId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Trigger shortcut
   */
  async triggerShortcut(shortcut: string, context?: Record<string, any>): Promise<QuickActionExecution> {
    return this.makeRequest<QuickActionExecution>('/api/v1/quick-actions/trigger-shortcut', {
      method: 'POST',
      body: JSON.stringify({ shortcut, context }),
    });
  }

  // ============================================================================
  // FAVORITES MANAGEMENT
  // ============================================================================

  /**
   * Add action to favorites
   */
  async addToFavorites(actionId: UUID): Promise<void> {
    return this.makeRequest<void>(`/api/v1/quick-actions/${actionId}/favorite`, {
      method: 'POST',
    });
  }

  /**
   * Remove action from favorites
   */
  async removeFromFavorites(actionId: UUID): Promise<void> {
    return this.makeRequest<void>(`/api/v1/quick-actions/${actionId}/favorite`, {
      method: 'DELETE',
    });
  }

  /**
   * Get favorite actions
   */
  async getFavorites(): Promise<QuickAction[]> {
    return this.makeRequest<QuickAction[]>('/api/v1/quick-actions/favorites');
  }

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================

  /**
   * Get action history
   */
  async getActionHistory(
    filters?: FilterRequest,
    pagination?: PaginationRequest
  ): Promise<QuickActionHistory[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return this.makeRequest<QuickActionHistory[]>(`/api/v1/quick-actions/history?${params.toString()}`);
  }

  /**
   * Clear action history
   */
  async clearHistory(): Promise<void> {
    return this.makeRequest<void>('/api/v1/quick-actions/history', {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get action analytics
   */
  async getActionAnalytics(
    timeRange?: string,
    filters?: FilterRequest
  ): Promise<QuickActionAnalytics> {
    const params = new URLSearchParams();
    if (timeRange) params.append('timeRange', timeRange);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return this.makeRequest<QuickActionAnalytics>(`/api/v1/quick-actions/analytics?${params.toString()}`);
  }

  /**
   * Track action usage
   */
  async trackActionUsage(
    actionId: UUID,
    context?: Record<string, any>
  ): Promise<void> {
    return this.makeRequest<void>('/api/v1/quick-actions/track-usage', {
      method: 'POST',
      body: JSON.stringify({ actionId, context }),
    });
  }

  // ============================================================================
  // TEMPLATES
  // ============================================================================

  /**
   * Get action templates
   */
  async getActionTemplates(): Promise<QuickActionTemplate[]> {
    return this.makeRequest<QuickActionTemplate[]>('/api/v1/quick-actions/templates');
  }

  /**
   * Create action from template
   */
  async createFromTemplate(
    templateId: UUID,
    customizations?: Record<string, any>
  ): Promise<QuickAction> {
    return this.makeRequest<QuickAction>('/api/v1/quick-actions/from-template', {
      method: 'POST',
      body: JSON.stringify({ templateId, customizations }),
    });
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * Get action categories
   */
  async getActionCategories(): Promise<QuickActionCategory[]> {
    return this.makeRequest<QuickActionCategory[]>('/api/v1/quick-actions/categories');
  }

  /**
   * Get actions by category
   */
  async getActionsByCategory(categoryId: UUID): Promise<QuickAction[]> {
    return this.makeRequest<QuickAction[]>(`/api/v1/quick-actions/categories/${categoryId}/actions`);
  }

  // ============================================================================
  // SEARCH AND DISCOVERY
  // ============================================================================

  /**
   * Search actions
   */
  async searchActions(
    query: string,
    filters?: FilterRequest
  ): Promise<QuickAction[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return this.makeRequest<QuickAction[]>(`/api/v1/quick-actions/search?${params.toString()}`);
  }

  /**
   * Get suggested actions
   */
  async getSuggestedActions(
    context?: Record<string, any>,
    limit?: number
  ): Promise<QuickAction[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (context) {
      params.append('context', JSON.stringify(context));
    }

    return this.makeRequest<QuickAction[]>(`/api/v1/quick-actions/suggested?${params.toString()}`);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk create actions
   */
  async bulkCreateActions(actions: Partial<QuickAction>[]): Promise<QuickAction[]> {
    return this.makeRequest<QuickAction[]>('/api/v1/quick-actions/bulk', {
      method: 'POST',
      body: JSON.stringify({ actions }),
    });
  }

  /**
   * Bulk update actions
   */
  async bulkUpdateActions(updates: { id: UUID; updates: Partial<QuickAction> }[]): Promise<QuickAction[]> {
    return this.makeRequest<QuickAction[]>('/api/v1/quick-actions/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  /**
   * Bulk delete actions
   */
  async bulkDeleteActions(actionIds: UUID[]): Promise<void> {
    return this.makeRequest<void>('/api/v1/quick-actions/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ actionIds }),
    });
  }

  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================

  /**
   * Export actions
   */
  async exportActions(
    actionIds?: UUID[],
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    const params = new URLSearchParams();
    if (actionIds) params.append('actionIds', actionIds.join(','));
    params.append('format', format);

    return this.makeRequest<any>(`/api/v1/quick-actions/export?${params.toString()}`);
  }

  /**
   * Import actions
   */
  async importActions(
    data: any,
    options?: {
      overwrite?: boolean;
      category?: UUID;
    }
  ): Promise<QuickAction[]> {
    return this.makeRequest<QuickAction[]>('/api/v1/quick-actions/import', {
      method: 'POST',
      body: JSON.stringify({ data, options }),
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate action configuration
   */
  async validateAction(action: Partial<QuickAction>): Promise<{ isValid: boolean; errors: string[] }> {
    return this.makeRequest<{ isValid: boolean; errors: string[] }>('/api/v1/quick-actions/validate', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  /**
   * Test action execution
   */
  async testAction(
    action: Partial<QuickAction>,
    context?: Record<string, any>
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    return this.makeRequest<{ success: boolean; result?: any; error?: string }>('/api/v1/quick-actions/test', {
      method: 'POST',
      body: JSON.stringify({ action, context }),
    });
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{
    totalActions: number;
    activeActions: number;
    recentExecutions: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    return this.makeRequest<any>('/api/v1/quick-actions/status');
  }

  /**
   * Cleanup old data
   */
  async cleanupOldData(options?: {
    olderThan?: string;
    maxHistoryItems?: number;
  }): Promise<{ deletedItems: number }> {
    return this.makeRequest<{ deletedItems: number }>('/api/v1/quick-actions/cleanup', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
}

// ============================================================================
// EXPORT INSTANCE
// ============================================================================

export const quickActionsAPI = new QuickActionsAPI();


