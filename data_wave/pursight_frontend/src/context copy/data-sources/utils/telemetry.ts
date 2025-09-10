// telemetry.ts
// Enterprise-grade telemetry and monitoring utility for data source operations

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  eventType: string;
  eventName: string;
  source: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metadata: Record<string, any>;
  tags: string[];
  duration?: number;
  error?: {
    code: string;
    message: string;
    stack?: string;
    details?: Record<string, any>;
  };
  performance?: {
    startTime: string;
    endTime: string;
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
    networkUsage?: number;
  };
  context: {
    userAgent: string;
    url: string;
    referrer?: string;
    ipAddress?: string;
    geoLocation?: {
      country: string;
      region: string;
      city: string;
    };
  };
}

export interface TelemetryMetric {
  id: string;
  timestamp: string;
  metricName: string;
  metricType: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  unit?: string;
  source: string;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
  bucket?: string;
  quantiles?: Record<string, number>;
}

export interface TelemetryTrace {
  id: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  timestamp: string;
  operationName: string;
  serviceName: string;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  tags: Record<string, string>;
  logs: TelemetryLog[];
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  fields: Record<string, any>;
  traceId?: string;
  spanId?: string;
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint: string;
  apiKey?: string;
  batchSize: number;
  batchTimeout: number;
  maxRetries: number;
  retryDelay: number;
  enableConsole: boolean;
  enableNetwork: boolean;
  enableStorage: boolean;
  enablePerformance: boolean;
  enableErrors: boolean;
  enableUserTracking: boolean;
  enableSessionTracking: boolean;
  enableGeolocation: boolean;
  sampleRate: number;
  maxEvents: number;
  flushInterval: number;
  debug: boolean;
}

export interface TelemetrySession {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  userId?: string;
  userAgent: string;
  ipAddress?: string;
  geoLocation?: {
    country: string;
    region: string;
    city: string;
  };
  events: TelemetryEvent[];
  metrics: TelemetryMetric[];
  traces: TelemetryTrace[];
  pageViews: number;
  interactions: number;
  errors: number;
  performance: {
    averageLoadTime: number;
    averageResponseTime: number;
    totalRequests: number;
    failedRequests: number;
  };
}

export interface TelemetryUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  preferences?: Record<string, any>;
  lastSeen: string;
  sessions: TelemetrySession[];
  totalSessions: number;
  totalEvents: number;
  totalErrors: number;
  averageSessionDuration: number;
}

// Default configuration
const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: true,
  endpoint: '/proxy/telemetry',
  batchSize: 50,
  batchTimeout: 5000,
  maxRetries: 3,
  retryDelay: 1000,
  enableConsole: true,
  enableNetwork: true,
  enableStorage: true,
  enablePerformance: true,
  enableErrors: true,
  enableUserTracking: true,
  enableSessionTracking: true,
  enableGeolocation: false,
  sampleRate: 1.0,
  maxEvents: 10000,
  flushInterval: 30000,
  debug: false
};

// Global telemetry state
let config: TelemetryConfig = { ...DEFAULT_CONFIG };
let currentSession: TelemetrySession | null = null;
let currentUser: TelemetryUser | null = null;
let eventQueue: TelemetryEvent[] = [];
let metricQueue: TelemetryMetric[] = [];
let traceQueue: TelemetryTrace[] = [];
let isInitialized = false;

// Performance monitoring
let performanceObserver: PerformanceObserver | null = null;
let errorObserver: Error | null = null;

/**
 * Initialize telemetry system
 */
export function initializeTelemetry(
  customConfig: Partial<TelemetryConfig> = {}
): void {
  if (isInitialized) {
    console.warn('Telemetry already initialized');
    return;
  }

  config = { ...DEFAULT_CONFIG, ...customConfig };

  if (!config.enabled) {
    console.log('Telemetry disabled');
    return;
  }

  // Initialize session
  initializeSession();

  // Initialize user tracking
  if (config.enableUserTracking) {
    initializeUserTracking();
  }

  // Initialize performance monitoring
  if (config.enablePerformance) {
    initializePerformanceMonitoring();
  }

  // Initialize error tracking
  if (config.enableErrors) {
    initializeErrorTracking();
  }

  // Initialize network monitoring
  if (config.enableNetwork) {
    initializeNetworkMonitoring();
  }

  // Start flush interval
  startFlushInterval();

  isInitialized = true;
  console.log('Telemetry initialized');
}

/**
 * Log a telemetry event
 */
export function logTelemetryEvent(
  eventName: string,
  eventType: string,
  message: string,
  metadata: Record<string, any> = {},
  severity: TelemetryEvent['severity'] = 'info',
  tags: string[] = []
): void {
  if (!isInitialized || !config.enabled) return;

  const event: TelemetryEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    eventType,
    eventName,
    source: 'data-sources',
    userId: currentUser?.id,
    sessionId: currentSession?.id,
    correlationId: getCorrelationId(),
    severity,
    message,
    metadata,
    tags,
    context: getEventContext()
  };

  addEventToQueue(event);

  if (config.enableConsole && config.debug) {
    console.log(`[Telemetry] ${eventName}:`, event);
  }
}

/**
 * Log discovery telemetry
 */
export function logDiscoveryTelemetry(data: {
  dataSourceId: string;
  dataSourceName: string;
  discoveryTime: number;
  itemsDiscovered: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}): void {
  logTelemetryEvent(
    'data_discovery',
    'discovery',
    `Data discovery ${data.success ? 'completed' : 'failed'} for ${data.dataSourceName}`,
    {
      dataSourceId: data.dataSourceId,
      dataSourceName: data.dataSourceName,
      discoveryTime: data.discoveryTime,
      itemsDiscovered: data.itemsDiscovered,
      success: data.success,
      error: data.error,
      ...data.metadata
    },
    data.success ? 'info' : 'error',
    ['discovery', 'data-source', data.success ? 'success' : 'failure']
  );
}

/**
 * Log preview telemetry
 */
export function logPreviewTelemetry(data: {
  dataSourceId: string;
  tableName: string;
  previewTime: number;
  rowsReturned: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}): void {
  logTelemetryEvent(
    'data_preview',
    'preview',
    `Data preview ${data.success ? 'completed' : 'failed'} for ${data.tableName}`,
    {
      dataSourceId: data.dataSourceId,
      tableName: data.tableName,
      previewTime: data.previewTime,
      rowsReturned: data.rowsReturned,
      success: data.success,
      error: data.error,
      ...data.metadata
    },
    data.success ? 'info' : 'error',
    ['preview', 'data-source', data.success ? 'success' : 'failure']
  );
}

/**
 * Log performance telemetry
 */
export function logPerformanceTelemetry(data: {
  operation: string;
  duration: number;
  memoryUsage?: number;
  cpuUsage?: number;
  networkUsage?: number;
  metadata?: Record<string, any>;
}): void {
  const event: TelemetryEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    eventType: 'performance',
    eventName: 'performance_measurement',
    source: 'data-sources',
    userId: currentUser?.id,
    sessionId: currentSession?.id,
    correlationId: getCorrelationId(),
    severity: 'info',
    message: `Performance measurement for ${data.operation}`,
    metadata: {
      operation: data.operation,
      duration: data.duration,
      memoryUsage: data.memoryUsage,
      cpuUsage: data.cpuUsage,
      networkUsage: data.networkUsage,
      ...data.metadata
    },
    tags: ['performance', 'measurement'],
    performance: {
      startTime: new Date(Date.now() - data.duration).toISOString(),
      endTime: new Date().toISOString(),
      duration: data.duration,
      memoryUsage: data.memoryUsage,
      cpuUsage: data.cpuUsage,
      networkUsage: data.networkUsage
    },
    context: getEventContext()
  };

  addEventToQueue(event);
}

/**
 * Log error telemetry
 */
export function logErrorTelemetry(
  error: Error,
  context: Record<string, any> = {},
  severity: 'error' | 'critical' = 'error'
): void {
  logTelemetryEvent(
    'error',
    'error',
    error.message,
    {
      errorName: error.name,
      errorStack: error.stack,
      ...context
    },
    severity,
    ['error', 'exception']
  );
}

/**
 * Log user interaction telemetry
 */
export function logUserInteractionTelemetry(data: {
  action: string;
  component: string;
  target?: string;
  duration?: number;
  metadata?: Record<string, any>;
}): void {
  logTelemetryEvent(
    'user_interaction',
    'interaction',
    `User interaction: ${data.action} on ${data.component}`,
    {
      action: data.action,
      component: data.component,
      target: data.target,
      duration: data.duration,
      ...data.metadata
    },
    'info',
    ['user-interaction', 'ui', data.component]
  );
}

/**
 * Log API call telemetry
 */
export function logApiCallTelemetry(data: {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  requestSize?: number;
  responseSize?: number;
  error?: string;
  metadata?: Record<string, any>;
}): void {
  logTelemetryEvent(
    'api_call',
    'api',
    `API call: ${data.method} ${data.endpoint} - ${data.statusCode}`,
    {
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      duration: data.duration,
      requestSize: data.requestSize,
      responseSize: data.responseSize,
      error: data.error,
      ...data.metadata
    },
    data.statusCode >= 400 ? 'error' : 'info',
    ['api', 'http', data.method.toLowerCase()]
  );
}

/**
 * Record a telemetry metric
 */
export function recordTelemetryMetric(
  metricName: string,
  value: number,
  metricType: TelemetryMetric['metricType'] = 'gauge',
  unit?: string,
  tags: Record<string, string> = {},
  metadata?: Record<string, any>
): void {
  if (!isInitialized || !config.enabled) return;

  const metric: TelemetryMetric = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    metricName,
    metricType,
    value,
    unit,
    source: 'data-sources',
    tags: {
      ...tags,
      userId: currentUser?.id,
      sessionId: currentSession?.id
    },
    metadata
  };

  addMetricToQueue(metric);
}

/**
 * Start a telemetry trace
 */
export function startTelemetryTrace(
  operationName: string,
  serviceName: string = 'data-sources',
  tags: Record<string, string> = {}
): string {
  if (!isInitialized || !config.enabled) return '';

  const traceId = generateId();
  const spanId = generateId();

  const trace: TelemetryTrace = {
    id: generateId(),
    traceId,
    spanId,
    timestamp: new Date().toISOString(),
    operationName,
    serviceName,
    duration: 0,
    status: 'success',
    tags,
    logs: []
  };

  addTraceToQueue(trace);

  return traceId;
}

/**
 * End a telemetry trace
 */
export function endTelemetryTrace(
  traceId: string,
  status: 'success' | 'error' | 'timeout' = 'success',
  error?: Error
): void {
  if (!isInitialized || !config.enabled || !traceId) return;

  const trace = traceQueue.find(t => t.traceId === traceId);
  if (!trace) return;

  trace.duration = Date.now() - new Date(trace.timestamp).getTime();
  trace.status = status;

  if (error) {
    trace.error = {
      code: error.name,
      message: error.message,
      stack: error.stack
    };
  }
}

/**
 * Add log to telemetry trace
 */
export function addTraceLog(
  traceId: string,
  level: TelemetryLog['level'],
  message: string,
  fields: Record<string, any> = {}
): void {
  if (!isInitialized || !config.enabled || !traceId) return;

  const trace = traceQueue.find(t => t.traceId === traceId);
  if (!trace) return;

  const log: TelemetryLog = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    level,
    message,
    fields,
    traceId,
    spanId: trace.spanId
  };

  trace.logs.push(log);
}

/**
 * Flush telemetry data
 */
export function flushTelemetry(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isInitialized || !config.enabled) {
      resolve();
      return;
    }

    const data = {
      events: eventQueue,
      metrics: metricQueue,
      traces: traceQueue,
      session: currentSession,
      user: currentUser
    };

    if (data.events.length === 0 && data.metrics.length === 0 && data.traces.length === 0) {
      resolve();
      return;
    }

    // Send data to telemetry endpoint
    fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Telemetry flush failed: ${response.status}`);
        }
        
        // Clear queues after successful flush
        eventQueue = [];
        metricQueue = [];
        traceQueue = [];
        
        resolve();
      })
      .catch(error => {
        console.error('Telemetry flush error:', error);
        reject(error);
      });
  });
}

/**
 * Initialize session tracking
 */
function initializeSession(): void {
  const sessionId = generateId();
  const startTime = new Date().toISOString();

  currentSession = {
    id: sessionId,
    startTime,
    userAgent: navigator.userAgent,
    events: [],
    metrics: [],
    traces: [],
    pageViews: 0,
    interactions: 0,
    errors: 0,
    performance: {
      averageLoadTime: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      failedRequests: 0
    }
  };

  // Store session in localStorage
  if (config.enableStorage) {
    localStorage.setItem('telemetry_session', JSON.stringify(currentSession));
  }
}

/**
 * Initialize user tracking
 */
function initializeUserTracking(): void {
  // Try to get existing user from localStorage
  const existingUser = localStorage.getItem('telemetry_user');
  
  if (existingUser) {
    try {
      currentUser = JSON.parse(existingUser);
      currentUser.lastSeen = new Date().toISOString();
    } catch (error) {
      console.error('Failed to parse existing user:', error);
    }
  }

  if (!currentUser) {
    currentUser = {
      id: generateId(),
      lastSeen: new Date().toISOString(),
      sessions: [],
      totalSessions: 0,
      totalEvents: 0,
      totalErrors: 0,
      averageSessionDuration: 0
    };
  }

  // Store user in localStorage
  if (config.enableStorage) {
    localStorage.setItem('telemetry_user', JSON.stringify(currentUser));
  }
}

/**
 * Initialize performance monitoring
 */
function initializePerformanceMonitoring(): void {
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            recordTelemetryMetric(
              `performance.${entry.name}`,
              entry.duration,
              'histogram',
              'ms',
              { entryType: entry.entryType }
            );
          }
        });
      });

      performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }
}

/**
 * Initialize error tracking
 */
function initializeErrorTracking(): void {
  // Global error handler
  window.addEventListener('error', (event) => {
    logErrorTelemetry(
      new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }
    );
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logErrorTelemetry(
      new Error(event.reason),
      {
        type: 'unhandledrejection',
        reason: event.reason
      }
    );
  });
}

/**
 * Initialize network monitoring
 */
function initializeNetworkMonitoring(): void {
  // Monitor fetch requests
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const startTime = Date.now();
    const [url, options] = args;

    try {
      const response = await originalFetch(...args);
      const duration = Date.now() - startTime;

      logApiCallTelemetry({
        endpoint: typeof url === 'string' ? url : url.toString(),
        method: options?.method || 'GET',
        statusCode: response.status,
        duration,
        requestSize: options?.body ? JSON.stringify(options.body).length : undefined,
        responseSize: response.headers.get('content-length') ? parseInt(response.headers.get('content-length')!) : undefined
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logApiCallTelemetry({
        endpoint: typeof url === 'string' ? url : url.toString(),
        method: options?.method || 'GET',
        statusCode: 0,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  };
}

/**
 * Start flush interval
 */
function startFlushInterval(): void {
  setInterval(() => {
    flushTelemetry().catch(error => {
      console.error('Periodic telemetry flush failed:', error);
    });
  }, config.flushInterval);
}

/**
 * Add event to queue
 */
function addEventToQueue(event: TelemetryEvent): void {
  eventQueue.push(event);
  
  if (currentSession) {
    currentSession.events.push(event);
    currentSession.interactions++;
    
    if (event.severity === 'error' || event.severity === 'critical') {
      currentSession.errors++;
    }
  }

  // Flush if queue is full
  if (eventQueue.length >= config.batchSize) {
    flushTelemetry().catch(error => {
      console.error('Batch telemetry flush failed:', error);
    });
  }
}

/**
 * Add metric to queue
 */
function addMetricToQueue(metric: TelemetryMetric): void {
  metricQueue.push(metric);
  
  if (currentSession) {
    currentSession.metrics.push(metric);
  }
}

/**
 * Add trace to queue
 */
function addTraceToQueue(trace: TelemetryTrace): void {
  traceQueue.push(trace);
  
  if (currentSession) {
    currentSession.traces.push(trace);
  }
}

/**
 * Get event context
 */
function getEventContext(): TelemetryEvent['context'] {
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    referrer: document.referrer,
    ipAddress: undefined, // Would be set by server
    geoLocation: undefined // Would be set by server
  };
}

/**
 * Get correlation ID
 */
function getCorrelationId(): string {
  return sessionStorage.getItem('telemetry_correlation_id') || generateId();
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cleanup telemetry
 */
export function cleanupTelemetry(): void {
  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }

  // Flush remaining data
  flushTelemetry().catch(error => {
    console.error('Final telemetry flush failed:', error);
  });
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupTelemetry);
}
