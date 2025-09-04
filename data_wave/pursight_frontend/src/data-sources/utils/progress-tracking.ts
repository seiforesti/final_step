// progress-tracking.ts
// Enterprise-grade progress tracking utility for data source operations

export interface ProgressUpdate {
  id: string;
  operationId: string;
  percentage: number;
  status: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  error?: string;
  warnings?: string[];
  stage?: string;
  subStage?: string;
  estimatedCompletion?: string;
  itemsProcessed?: number;
  totalItems?: number;
  itemsFailed?: number;
  itemsSkipped?: number;
  throughput?: number;
  remainingTime?: number;
}

export interface ProgressTracker {
  id: string;
  operationId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  progress: number;
  currentStage: string;
  stages: ProgressStage[];
  updates: ProgressUpdate[];
  metadata: Record<string, any>;
  error?: string;
  warnings: string[];
  performance: ProgressPerformance;
  disconnect: () => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

export interface ProgressStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  error?: string;
  subStages?: ProgressSubStage[];
  metadata?: Record<string, any>;
}

export interface ProgressSubStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ProgressPerformance {
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  averageThroughput: number;
  peakThroughput: number;
  totalItemsProcessed: number;
  totalItemsFailed: number;
  totalItemsSkipped: number;
  successRate: number;
  errorRate: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
    disk: number;
  };
  bottlenecks: string[];
  optimizations: string[];
}

export interface ProgressTrackerOptions {
  operationId: string;
  stages?: Omit<ProgressStage, 'id' | 'status' | 'progress'>[];
  onProgress?: (update: ProgressUpdate) => void;
  onStageChange?: (stage: ProgressStage) => void;
  onComplete?: (tracker: ProgressTracker) => void;
  onError?: (error: string, tracker: ProgressTracker) => void;
  onWarning?: (warning: string, tracker: ProgressTracker) => void;
  autoSave?: boolean;
  saveInterval?: number;
  enableWebSocket?: boolean;
  webSocketUrl?: string;
  enableMetrics?: boolean;
  metricsInterval?: number;
}

export interface ProgressTrackerConfig {
  maxUpdates: number;
  updateInterval: number;
  saveInterval: number;
  metricsInterval: number;
  enableRealTime: boolean;
  enablePersistence: boolean;
  enableNotifications: boolean;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}

// Default configuration
const DEFAULT_CONFIG: ProgressTrackerConfig = {
  maxUpdates: 1000,
  updateInterval: 1000,
  saveInterval: 5000,
  metricsInterval: 2000,
  enableRealTime: true,
  enablePersistence: true,
  enableNotifications: true,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 300000 // 5 minutes
};

// Global progress tracker registry
const progressTrackers = new Map<string, ProgressTracker>();

// WebSocket connection for real-time updates
let progressWebSocket: WebSocket | null = null;

/**
 * Create a new progress tracker for data source operations
 */
export function createProgressTracker(
  options: ProgressTrackerOptions,
  config: Partial<ProgressTrackerConfig> = {}
): ProgressTracker {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const trackerId = `tracker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const tracker: ProgressTracker = {
    id: trackerId,
    operationId: options.operationId,
    startTime: new Date().toISOString(),
    status: 'running',
    progress: 0,
    currentStage: options.stages?.[0]?.name || 'Initializing',
    stages: options.stages?.map((stage, index) => ({
      id: `stage-${index}`,
      name: stage.name,
      description: stage.description,
      status: index === 0 ? 'running' : 'pending',
      progress: 0,
      subStages: stage.subStages?.map((subStage, subIndex) => ({
        id: `substage-${index}-${subIndex}`,
        name: subStage.name,
        status: 'pending',
        progress: 0,
        metadata: subStage.metadata
      }))
    })) || [],
    updates: [],
    metadata: {},
    warnings: [],
    performance: {
      startTime: new Date().toISOString(),
      averageThroughput: 0,
      peakThroughput: 0,
      totalItemsProcessed: 0,
      totalItemsFailed: 0,
      totalItemsSkipped: 0,
      successRate: 0,
      errorRate: 0,
      resourceUtilization: {
        cpu: 0,
        memory: 0,
        network: 0,
        disk: 0
      },
      bottlenecks: [],
      optimizations: []
    },
    disconnect: () => disconnectProgressTracker(trackerId),
    pause: () => pauseProgressTracker(trackerId),
    resume: () => resumeProgressTracker(trackerId),
    cancel: () => cancelProgressTracker(trackerId)
  };

  // Register tracker
  progressTrackers.set(trackerId, tracker);

  // Initialize WebSocket if enabled
  if (finalConfig.enableRealTime && options.enableWebSocket) {
    initializeProgressWebSocket(options.webSocketUrl);
  }

  // Start metrics collection if enabled
  if (finalConfig.enableMetrics) {
    startMetricsCollection(trackerId, finalConfig.metricsInterval);
  }

  // Auto-save if enabled
  if (finalConfig.enablePersistence && options.autoSave) {
    startAutoSave(trackerId, finalConfig.saveInterval);
  }

  return tracker;
}

/**
 * Update progress for a specific tracker
 */
export function updateProgress(
  trackerId: string,
  update: Partial<ProgressUpdate>
): void {
  const tracker = progressTrackers.get(trackerId);
  if (!tracker) {
    console.warn(`Progress tracker ${trackerId} not found`);
    return;
  }

  const progressUpdate: ProgressUpdate = {
    id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    operationId: tracker.operationId,
    percentage: update.percentage || tracker.progress,
    status: update.status || tracker.currentStage,
    message: update.message || '',
    timestamp: new Date().toISOString(),
    metadata: update.metadata,
    error: update.error,
    warnings: update.warnings,
    stage: update.stage,
    subStage: update.subStage,
    estimatedCompletion: update.estimatedCompletion,
    itemsProcessed: update.itemsProcessed,
    totalItems: update.totalItems,
    itemsFailed: update.itemsFailed,
    itemsSkipped: update.itemsSkipped,
    throughput: update.throughput,
    remainingTime: update.remainingTime
  };

  // Update tracker state
  tracker.progress = progressUpdate.percentage;
  tracker.currentStage = progressUpdate.status;
  tracker.updates.push(progressUpdate);

  // Limit updates to prevent memory issues
  if (tracker.updates.length > 1000) {
    tracker.updates = tracker.updates.slice(-500);
  }

  // Update current stage
  if (progressUpdate.stage) {
    const currentStage = tracker.stages.find(s => s.name === progressUpdate.stage);
    if (currentStage) {
      currentStage.progress = progressUpdate.percentage;
      currentStage.status = progressUpdate.percentage >= 100 ? 'completed' : 'running';
    }
  }

  // Update performance metrics
  updatePerformanceMetrics(tracker, progressUpdate);

  // Send real-time update
  if (progressWebSocket && progressWebSocket.readyState === WebSocket.OPEN) {
    progressWebSocket.send(JSON.stringify({
      type: 'progress_update',
      trackerId,
      update: progressUpdate
    }));
  }

  // Persist update if enabled
  persistProgressUpdate(trackerId, progressUpdate);
}

/**
 * Complete a progress tracker
 */
export function completeProgressTracker(
  trackerId: string,
  success: boolean = true,
  error?: string
): void {
  const tracker = progressTrackers.get(trackerId);
  if (!tracker) {
    console.warn(`Progress tracker ${trackerId} not found`);
    return;
  }

  tracker.status = success ? 'completed' : 'failed';
  tracker.endTime = new Date().toISOString();
  tracker.progress = 100;
  tracker.error = error;

  // Update performance metrics
  if (tracker.performance.startTime) {
    const startTime = new Date(tracker.performance.startTime);
    const endTime = new Date(tracker.endTime);
    tracker.performance.totalDuration = endTime.getTime() - startTime.getTime();
  }

  // Final update
  updateProgress(trackerId, {
    percentage: 100,
    status: success ? 'Completed' : 'Failed',
    message: success ? 'Operation completed successfully' : `Operation failed: ${error}`,
    error
  });

  // Cleanup
  setTimeout(() => {
    progressTrackers.delete(trackerId);
  }, 60000); // Keep for 1 minute after completion
}

/**
 * Get progress tracker by ID
 */
export function getProgressTracker(trackerId: string): ProgressTracker | undefined {
  return progressTrackers.get(trackerId);
}

/**
 * Get all active progress trackers
 */
export function getActiveProgressTrackers(): ProgressTracker[] {
  return Array.from(progressTrackers.values()).filter(t => t.status === 'running');
}

/**
 * Setup progress tracking for data source operations
 */
export function setupProgressTracking(
  dataSourceId: string,
  onProgress?: (update: ProgressUpdate) => void,
  options: Partial<ProgressTrackerOptions> = {}
): ProgressTracker {
  const tracker = createProgressTracker({
    operationId: `data-source-${dataSourceId}`,
    stages: [
      {
        name: 'Initializing',
        description: 'Initializing data source connection and configuration'
      },
      {
        name: 'Connecting',
        description: 'Establishing connection to data source'
      },
      {
        name: 'Discovering',
        description: 'Discovering data source schema and metadata'
      },
      {
        name: 'Processing',
        description: 'Processing discovered data and metadata'
      },
      {
        name: 'Validating',
        description: 'Validating data source configuration and access'
      },
      {
        name: 'Finalizing',
        description: 'Finalizing discovery process and cleanup'
      }
    ],
    onProgress,
    autoSave: true,
    enableWebSocket: true,
    enableMetrics: true,
    ...options
  });

  return tracker;
}

/**
 * Initialize WebSocket connection for real-time progress updates
 */
function initializeProgressWebSocket(url?: string): void {
  if (progressWebSocket) {
    progressWebSocket.close();
  }

  const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/progress`;
  
  progressWebSocket = new WebSocket(wsUrl);
  
  progressWebSocket.onopen = () => {
    console.log('Progress tracking WebSocket connected');
  };
  
  progressWebSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'progress_update') {
        // Handle incoming progress updates
        const tracker = progressTrackers.get(data.trackerId);
        if (tracker) {
          tracker.updates.push(data.update);
        }
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };
  
  progressWebSocket.onerror = (error) => {
    console.error('Progress tracking WebSocket error:', error);
  };
  
  progressWebSocket.onclose = () => {
    console.log('Progress tracking WebSocket disconnected');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      if (progressTrackers.size > 0) {
        initializeProgressWebSocket(url);
      }
    }, 5000);
  };
}

/**
 * Start metrics collection for a tracker
 */
function startMetricsCollection(trackerId: string, interval: number): void {
  const intervalId = setInterval(() => {
    const tracker = progressTrackers.get(trackerId);
    if (!tracker || tracker.status !== 'running') {
      clearInterval(intervalId);
      return;
    }

    // Collect system metrics
    collectSystemMetrics(tracker);
  }, interval);

  // Store interval ID for cleanup
  tracker.metadata.metricsIntervalId = intervalId;
}

/**
 * Collect system metrics for performance tracking
 */
function collectSystemMetrics(tracker: ProgressTracker): void {
  // Simulate system metrics collection
  // In a real implementation, this would collect actual system metrics
  const metrics = {
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 100,
    disk: Math.random() * 100
  };

  tracker.performance.resourceUtilization = metrics;

  // Detect bottlenecks
  const bottlenecks = [];
  if (metrics.cpu > 80) bottlenecks.push('High CPU usage');
  if (metrics.memory > 80) bottlenecks.push('High memory usage');
  if (metrics.disk > 90) bottlenecks.push('High disk usage');

  tracker.performance.bottlenecks = bottlenecks;
}

/**
 * Start auto-save for a tracker
 */
function startAutoSave(trackerId: string, interval: number): void {
  const intervalId = setInterval(() => {
    const tracker = progressTrackers.get(trackerId);
    if (!tracker || tracker.status !== 'running') {
      clearInterval(intervalId);
      return;
    }

    persistProgressTracker(trackerId);
  }, interval);

  // Store interval ID for cleanup
  const tracker = progressTrackers.get(trackerId);
  if (tracker) {
    tracker.metadata.autoSaveIntervalId = intervalId;
  }
}

/**
 * Persist progress tracker to storage
 */
function persistProgressTracker(trackerId: string): void {
  const tracker = progressTrackers.get(trackerId);
  if (!tracker) return;

  try {
    const key = `progress_tracker_${trackerId}`;
    const data = {
      ...tracker,
      disconnect: undefined, // Remove function references
      pause: undefined,
      resume: undefined,
      cancel: undefined
    };
    
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to persist progress tracker:', error);
  }
}

/**
 * Persist progress update
 */
function persistProgressUpdate(trackerId: string, update: ProgressUpdate): void {
  try {
    const key = `progress_update_${trackerId}_${update.id}`;
    localStorage.setItem(key, JSON.stringify(update));
  } catch (error) {
    console.error('Failed to persist progress update:', error);
  }
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics(tracker: ProgressTracker, update: ProgressUpdate): void {
  if (update.itemsProcessed && update.totalItems) {
    tracker.performance.totalItemsProcessed = update.itemsProcessed;
    
    if (update.throughput) {
      tracker.performance.averageThroughput = update.throughput;
      if (update.throughput > tracker.performance.peakThroughput) {
        tracker.performance.peakThroughput = update.throughput;
      }
    }
  }

  if (update.itemsFailed) {
    tracker.performance.totalItemsFailed = update.itemsFailed;
  }

  if (update.itemsSkipped) {
    tracker.performance.totalItemsSkipped = update.itemsSkipped;
  }

  // Calculate success rate
  const total = tracker.performance.totalItemsProcessed + tracker.performance.totalItemsFailed + tracker.performance.totalItemsSkipped;
  if (total > 0) {
    tracker.performance.successRate = (tracker.performance.totalItemsProcessed / total) * 100;
    tracker.performance.errorRate = (tracker.performance.totalItemsFailed / total) * 100;
  }
}

/**
 * Disconnect progress tracker
 */
function disconnectProgressTracker(trackerId: string): void {
  const tracker = progressTrackers.get(trackerId);
  if (!tracker) return;

  // Cleanup intervals
  if (tracker.metadata.metricsIntervalId) {
    clearInterval(tracker.metadata.metricsIntervalId);
  }
  if (tracker.metadata.autoSaveIntervalId) {
    clearInterval(tracker.metadata.autoSaveIntervalId);
  }

  // Remove from registry
  progressTrackers.delete(trackerId);
}

/**
 * Pause progress tracker
 */
function pauseProgressTracker(trackerId: string): void {
  const tracker = progressTrackers.get(trackerId);
  if (tracker && tracker.status === 'running') {
    tracker.status = 'paused';
    updateProgress(trackerId, {
      status: 'Paused',
      message: 'Operation paused by user'
    });
  }
}

/**
 * Resume progress tracker
 */
function resumeProgressTracker(trackerId: string): void {
  const tracker = progressTrackers.get(trackerId);
  if (tracker && tracker.status === 'paused') {
    tracker.status = 'running';
    updateProgress(trackerId, {
      status: 'Resumed',
      message: 'Operation resumed'
    });
  }
}

/**
 * Cancel progress tracker
 */
function cancelProgressTracker(trackerId: string): void {
  const tracker = progressTrackers.get(trackerId);
  if (tracker) {
    tracker.status = 'cancelled';
    updateProgress(trackerId, {
      status: 'Cancelled',
      message: 'Operation cancelled by user'
    });
    
    // Cleanup after a short delay
    setTimeout(() => {
      disconnectProgressTracker(trackerId);
    }, 5000);
  }
}

/**
 * Clean up all progress trackers
 */
export function cleanupProgressTrackers(): void {
  progressTrackers.forEach((tracker) => {
    disconnectProgressTracker(tracker.id);
  });
  
  if (progressWebSocket) {
    progressWebSocket.close();
    progressWebSocket = null;
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupProgressTrackers);
}
