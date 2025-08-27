import { NextResponse } from 'next/server';

const BACKEND_BASE = process.env.RACINE_BACKEND_URL || 'http://localhost:8000';
// Keep proxy snappy in development to avoid UI hangs when backend is slow/unavailable
const DEFAULT_TIMEOUT_MS = process.env.NODE_ENV === 'development' ? 8000 : 20000;
const MAX_RETRIES = process.env.NODE_ENV === 'development' ? 1 : 3;
const RETRY_DELAY_MS = 1000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

// Enterprise API endpoint mappings for advanced backend integration
const ENTERPRISE_API_MAPPINGS: Record<string, string[]> = {
  // Authentication & Authorization
  '/auth/': ['/auth/', '/api/auth/', '/api/v1/auth/'],
  '/oauth/': ['/oauth/', '/auth/', '/api/auth/', '/api/oauth/'],
  
  // Core Data Governance APIs
  '/racine/': ['/api/racine/', '/racine/', '/api/v1/racine/'],
  '/governance/': ['/api/governance/', '/governance/', '/api/v1/governance/'],
  '/compliance/': ['/api/compliance/', '/compliance/', '/api/v1/compliance/'],
  
  // Scan & Discovery Services
  '/scan/': ['/api/scan/', '/scan/', '/api/v1/scan/', '/api/scanning/'],
  '/discovery/': ['/api/discovery/', '/discovery/', '/api/v1/discovery/', '/api/data-discovery/'],
  '/classification/': ['/api/classification/', '/classification/', '/api/v1/classification/', '/api/classify/'],
  
  // Analytics & Reporting
  '/analytics/': ['/api/analytics/', '/analytics/', '/api/v1/analytics/', '/api/enterprise-analytics/'],
  '/reports/': ['/api/reports/', '/reports/', '/api/v1/reports/', '/api/reporting/'],
  '/metrics/': ['/api/metrics/', '/metrics/', '/api/v1/metrics/', '/api/ml-metrics/'],
  
  // Workflow & Orchestration
  '/workflows/': ['/api/workflows/', '/workflows/', '/api/v1/workflows/', '/api/workflow/'],
  '/orchestration/': ['/api/orchestration/', '/orchestration/', '/api/v1/orchestration/', '/api/scan-orchestration/'],
  '/integration/': ['/api/integration/', '/integration/', '/api/v1/integration/', '/api/enterprise-integration/'],
  
  // Advanced Services
  '/ai/': ['/api/ai/', '/ai/', '/api/v1/ai/', '/api/ai-explainability/'],
  '/ml/': ['/api/ml/', '/ml/', '/api/v1/ml/', '/api/machine-learning/'],
  '/search/': ['/api/search/', '/search/', '/api/v1/search/', '/api/semantic-search/'],
  '/lineage/': ['/api/lineage/', '/lineage/', '/api/v1/lineage/', '/api/advanced-lineage/'],
  
  // Security & Performance
  '/security/': ['/api/security/', '/security/', '/api/v1/security/'],
  '/performance/': ['/api/performance/', '/performance/', '/api/v1/performance/', '/api/scan-performance/'],
  '/monitoring/': ['/api/monitoring/', '/monitoring/', '/api/v1/monitoring/', '/api/advanced-monitoring/'],
  
  // Collaboration & Management
  '/collaboration/': ['/api/collaboration/', '/collaboration/', '/api/v1/collaboration/'],
  '/workspace/': ['/api/workspace/', '/workspace/', '/api/v1/workspace/', '/api/workspaces/'],
  '/catalog/': ['/api/catalog/', '/catalog/', '/api/v1/catalog/', '/api/enterprise-catalog/'],
};

// Performance monitoring for enterprise-grade reliability
class ProxyPerformanceMonitor {
  private static instance: ProxyPerformanceMonitor;
  private requestCount = 0;
  private errorCount = 0;
  private avgResponseTime = 0;
  private lastResetTime = Date.now();

  static getInstance(): ProxyPerformanceMonitor {
    if (!ProxyPerformanceMonitor.instance) {
      ProxyPerformanceMonitor.instance = new ProxyPerformanceMonitor();
    }
    return ProxyPerformanceMonitor.instance;
  }

  recordRequest(responseTime: number, isError: boolean = false) {
    this.requestCount++;
    if (isError) this.errorCount++;
    
    // Update rolling average
    this.avgResponseTime = (this.avgResponseTime * (this.requestCount - 1) + responseTime) / this.requestCount;
    
    // Reset metrics every hour for fresh statistics
    if (Date.now() - this.lastResetTime > 3600000) {
      this.reset();
    }
  }

  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      avgResponseTime: this.avgResponseTime,
      uptime: Date.now() - this.lastResetTime
    };
  }

  private reset() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.avgResponseTime = 0;
    this.lastResetTime = Date.now();
  }
}

async function proxy(request: Request, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const startTime = Date.now();
  const monitor = ProxyPerformanceMonitor.getInstance();
  const method = (request.method || 'GET').toUpperCase() as HttpMethod;
  const search = new URL(request.url).search;
  
  // Next.js (App Router) may provide params as a Promise
  const awaited = (typeof (ctx.params as any)?.then === 'function')
    ? await (ctx.params as Promise<{ path: string[] }>)
    : (ctx.params as { path: string[] });
  const rawPath = '/' + (awaited?.path?.join('/') || '');

  // Special-case OAuth initiations/callbacks: issue a browser redirect directly
  // to the backend to avoid fetch timeouts/aborts and preserve cross-origin flow.
  if (request.method === 'GET') {
    const oauthMatch = rawPath.match(/^\/(?:api\/)?auth\/(google|microsoft)(?:\/callback)?$/);
    if (oauthMatch) {
      const normalized = rawPath.startsWith('/api/') ? rawPath.replace('/api/', '/') : rawPath;
      const target = `${BACKEND_BASE}${normalized}${search}`.replace(/\/\/+/, '/');
      return NextResponse.redirect(target, { status: 307 });
    }
  }

  // Build candidate backend paths with enterprise mappings and heuristics
  const candidates = buildEnterpriseAwareCandidatePaths(rawPath)
    .map((p: string) => `${BACKEND_BASE}${p}${search}`)
    .slice(0, 12); // increased for enterprise coverage

  // Copy headers (omit host-related headers that can break fetch)
  const incomingHeaders = new Headers(request.headers);
  incomingHeaders.delete('host');
  incomingHeaders.delete('connection');
  incomingHeaders.delete('content-length');

  // Prepare body for non-GET/HEAD
  let body: BodyInit | undefined = undefined;
  if (!['GET', 'HEAD'].includes(method)) {
    // Attempt to pass body as is; if no body, keep undefined
    try {
      const contentType = incomingHeaders.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await request.json().catch(() => undefined);
        body = json !== undefined ? JSON.stringify(json) : undefined;
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData().catch(() => undefined);
        if (formData) {
          const fd = new FormData();
          for (const [k, v] of formData.entries()) {
            // v can be string or File
            // @ts-ignore - FormDataEntryValue is acceptable
            fd.append(k, v);
          }
          body = fd;
          // Let fetch set proper boundaries
          incomingHeaders.delete('content-type');
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await request.text().catch(() => undefined);
        body = text;
      } else {
        const arrayBuffer = await request.arrayBuffer().catch(() => undefined);
        body = arrayBuffer;
      }
    } catch {
      // Ignore body errors; proceed without body
      body = undefined;
    }
  }

  // Try candidates with retry logic and performance monitoring
  let lastError: unknown = null;
  let attempt = 0;
  
  for (const url of candidates) {
    for (let retry = 0; retry < MAX_RETRIES; retry++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
        const res = await fetch(url, {
          method,
          headers: incomingHeaders,
          body,
          signal: controller.signal
        });
        clearTimeout(timer);

        const responseTime = Date.now() - startTime;
        
        if (res.ok || (res.status >= 300 && res.status < 400)) {
          // Record successful request
          monitor.recordRequest(responseTime, false);
          
          // Stream back response with headers and status
          const respHeaders = new Headers(res.headers);
          // Remove hop-by-hop headers
          respHeaders.delete('transfer-encoding');
          respHeaders.delete('connection');
          
          // Add performance headers for monitoring
          if (process.env.NODE_ENV === 'development') {
            respHeaders.set('X-Proxy-Response-Time', responseTime.toString());
            respHeaders.set('X-Proxy-Attempt', (attempt + 1).toString());
            respHeaders.set('X-Proxy-Retry', retry.toString());
          }
          
          return new Response(res.body, {
            status: res.status,
            statusText: res.statusText,
            headers: respHeaders
          });
        }

        // For 404, try next candidate; for 4xx/5xx else, retry or continue
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        if (res.status === 404) {
          break; // Try next candidate
        }
        
        // For server errors, retry with delay
        if (res.status >= 500 && retry < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retry + 1)));
          continue;
        }
        
      } catch (err) {
        lastError = err;
        
        // Retry on network errors
        if (retry < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retry + 1)));
          continue;
        }
      }
    }
    attempt++;
  }

  // Record failed request
  const responseTime = Date.now() - startTime;
  monitor.recordRequest(responseTime, true);

  // If all fail, return last error with 502 (with diagnostics in dev)
  const message = lastError instanceof Error ? lastError.message : 'Upstream request failed';
  if (process.env.NODE_ENV === 'development') {
    console.warn('[SmartProxy] All candidates failed for', rawPath, '\nTried:', candidates);
    console.warn('[SmartProxy] Last error:', message);
    console.warn('[SmartProxy] Performance metrics:', monitor.getMetrics());
  }
  return NextResponse.json({ 
    success: false, 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      candidates: candidates.length,
      responseTime,
      metrics: monitor.getMetrics()
    })
  }, { status: 502 });
}

function buildEnterpriseAwareCandidatePaths(rawPath: string): string[] {
  const paths = new Set<string>();

  const add = (p: string) => {
    // Normalize double slashes
    const norm = p.replace(/\/+/g, '/').replace(/\/$/, '');
    paths.add(norm || '/');
  };

  // Enterprise API mappings first (highest priority)
  for (const [pattern, mappings] of Object.entries(ENTERPRISE_API_MAPPINGS)) {
    if (rawPath.startsWith(pattern) || rawPath.includes(pattern.slice(1, -1))) {
      mappings.forEach(mapping => {
        const mappedPath = rawPath.replace(pattern, mapping);
        add(mappedPath);
        // Also try with remaining path appended
        if (rawPath.startsWith(pattern)) {
          const remaining = rawPath.substring(pattern.length);
          add(`${mapping}${remaining}`);
        }
      });
    }
  }

  // As-is path
  add(rawPath);

  // Standard API prefixing
  if (!rawPath.startsWith('/api/')) {
    add(`/api${rawPath.startsWith('/') ? '' : '/'}${rawPath}`);
  }

  // Remove duplicate /api
  if (rawPath.startsWith('/api/api/')) {
    add(rawPath.replace('/api/api/', '/api/'));
  }

  // Version variants
  const withApi = rawPath.startsWith('/api/') ? rawPath : `/api${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
  add(withApi.replace('/api/', '/api/v1/'));

  // Namespace adjustments for core services
  if (rawPath.startsWith('/racine/')) {
    add(`/api/racine${rawPath.substring('/racine'.length)}`);
  }
  if (rawPath.startsWith('/auth/')) {
    add(`/api/auth${rawPath.substring('/auth'.length)}`);
  }
  if (rawPath.startsWith('/api/racine/')) {
    add(`/api/${rawPath.substring('/api/racine/'.length)}`);
  }

  // Pluralization variants
  const segments = rawPath.split('/');
  const lastSegment = segments[segments.length - 1] || '';
  if (lastSegment && !lastSegment.endsWith('s')) {
    segments[segments.length - 1] = `${lastSegment}s`;
    const pluralPath = segments.join('/');
    add(pluralPath);
    if (!pluralPath.startsWith('/api/')) {
      add(`/api${pluralPath.startsWith('/') ? '' : '/'}${pluralPath}`);
    }
  }

  // Environment-based custom mappings
  try {
    const mappingEnv = process.env.SMART_PROXY_REWRITE;
    if (mappingEnv) {
      const mapping = JSON.parse(mappingEnv) as Record<string, string>;
      Object.entries(mapping).forEach(([fromPrefix, toPrefix]) => {
        if (rawPath.startsWith(fromPrefix)) {
          const rest = rawPath.substring(fromPrefix.length);
          add(`${toPrefix}${rest}`);
        }
      });
    }
  } catch {
    // Ignore invalid JSON
  }

  return Array.from(paths);
}

export async function GET(request: Request, ctx: { params: { path: string[] } }) {
  return proxy(request, ctx);
}
export async function POST(request: Request, ctx: { params: { path: string[] } }) {
  return proxy(request, ctx);
}
export async function PUT(request: Request, ctx: { params: { path: string[] } }) {
  return proxy(request, ctx);
}
export async function PATCH(request: Request, ctx: { params: { path: string[] } }) {
  return proxy(request, ctx);
}
export async function DELETE(request: Request, ctx: { params: { path: string[] } }) {
  return proxy(request, ctx);
}
export async function OPTIONS(request: Request, ctx: { params: { path: string[] } }) {
  return proxy(request, ctx);
}
export async function HEAD(request: Request, ctx: { params: { path: string[] } }) {
  return proxy(request, ctx);
}


