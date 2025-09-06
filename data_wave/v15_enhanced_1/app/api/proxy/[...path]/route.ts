import { NextResponse } from 'next/server';

const BACKEND_BASE = process.env.RACINE_BACKEND_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = process.env.NODE_ENV === 'development' ? 8000 : 20000;
const MAX_RETRIES = process.env.NODE_ENV === 'development' ? 1 : 3;
const RETRY_DELAY_MS = 1000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

// ============================================================================
// INTELLIGENT API MAPPING SYSTEM
// ============================================================================
// This system maps frontend API calls to the correct backend routes
// based on the actual backend route structure from main.py

interface ApiMapping {
  frontendPattern: RegExp;
  backendPath: string;
  description: string;
}

// Comprehensive API mappings based on actual backend routes
const API_MAPPINGS: ApiMapping[] = [
  // ============================================================================
  // DATA SOURCE APIs - Mapped to scan_routes.py (prefix: /scan)
  // ============================================================================
  {
    frontendPattern: /^\/scan\/data-sources\/?$/,
    backendPath: '/scan/data-sources',
    description: 'Data sources CRUD operations'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/?$/,
    backendPath: '/scan/data-sources/$1',
    description: 'Individual data source operations'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/stats\/?$/,
    backendPath: '/scan/data-sources/$1/stats',
    description: 'Data source statistics'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/health\/?$/,
    backendPath: '/scan/data-sources/$1/health',
    description: 'Data source health check'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/scan\/?$/,
    backendPath: '/scan/data-sources/$1/scan',
    description: 'Start data source scan'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/toggle-favorite\/?$/,
    backendPath: '/scan/data-sources/$1/toggle-favorite',
    description: 'Toggle data source favorite'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/toggle-monitoring\/?$/,
    backendPath: '/scan/data-sources/$1/toggle-monitoring',
    description: 'Toggle data source monitoring'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/toggle-backup\/?$/,
    backendPath: '/scan/data-sources/$1/toggle-backup',
    description: 'Toggle data source backup'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/(\d+)\/validate\/?$/,
    backendPath: '/scan/data-sources/$1/validate',
    description: 'Validate data source'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/favorites\/?$/,
    backendPath: '/scan/data-sources/favorites',
    description: 'Get favorite data sources'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/enums\/?$/,
    backendPath: '/scan/data-sources/enums',
    description: 'Get data source enums'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/bulk-update\/?$/,
    backendPath: '/scan/data-sources/bulk-update',
    description: 'Bulk update data sources'
  },
  {
    frontendPattern: /^\/scan\/data-sources\/bulk-delete\/?$/,
    backendPath: '/scan/data-sources/bulk-delete',
    description: 'Bulk delete data sources'
  },
  {
    frontendPattern: /^\/scan\/schedules\/?$/,
    backendPath: '/scan/schedules',
    description: 'Get scan schedules'
  },

  // ============================================================================
  // DATA DISCOVERY APIs - Mapped to data_discovery_routes.py (prefix: /data-discovery)
  // ============================================================================
  {
    frontendPattern: /^\/data-discovery\/data-sources\/(\d+)\/test-connection\/?$/,
    backendPath: '/data-discovery/data-sources/$1/test-connection',
    description: 'Test data source connection'
  },
  {
    frontendPattern: /^\/data-discovery\/data-sources\/(\d+)\/discover-schema\/?$/,
    backendPath: '/data-discovery/data-sources/$1/discover-schema',
    description: 'Discover data source schema'
  },
  // Alias: frontend sometimes uses schema-discovery instead of discover-schema
  {
    frontendPattern: /^\/data-discovery\/data-sources\/(\d+)\/schema-discovery\/?$/,
    backendPath: '/data-discovery/data-sources/$1/discover-schema',
    description: 'Alias for schema discovery'
  },
  {
    frontendPattern: /^\/data-discovery\/data-sources\/(\d+)\/discovery-history\/?$/,
    backendPath: '/data-discovery/data-sources/$1/discovery-history',
    description: 'Get discovery history'
  },
  {
    frontendPattern: /^\/data-discovery\/data-sources\/(\d+)\/preview-table\/?$/,
    backendPath: '/data-discovery/data-sources/$1/preview-table',
    description: 'Preview table data'
  },
  {
    frontendPattern: /^\/data-discovery\/data-sources\/profile-column\/?$/,
    backendPath: '/data-discovery/data-sources/profile-column',
    description: 'Profile column data'
  },
  {
    frontendPattern: /^\/data-discovery\/data-sources\/(\d+)\/workspaces\/?$/,
    backendPath: '/data-discovery/data-sources/$1/workspaces',
    description: 'Get data source workspaces'
  },
  {
    frontendPattern: /^\/data-discovery\/data-sources\/(\d+)\/save-workspace\/?$/,
    backendPath: '/data-discovery/data-sources/$1/save-workspace',
    description: 'Save workspace'
  },

  // ============================================================================
  // RACINE APIs - Mapped to racine_routes.py (prefix: /racine)
  // ============================================================================
  {
    frontendPattern: /^\/racine\/orchestration\/?$/,
    backendPath: '/racine/orchestration',
    description: 'Racine orchestration operations'
  },
  {
    frontendPattern: /^\/racine\/orchestration\/([^\/]+)\/?$/,
    backendPath: '/racine/orchestration/$1',
    description: 'Individual orchestration operations'
  },
  {
    frontendPattern: /^\/racine\/workspace\/?$/,
    backendPath: '/racine/workspace',
    description: 'Racine workspace operations'
  },
  {
    frontendPattern: /^\/racine\/workspace\/([^\/]+)\/?$/,
    backendPath: '/racine/workspace/$1',
    description: 'Individual workspace operations'
  },
  {
    frontendPattern: /^\/racine\/collaboration\/?$/,
    backendPath: '/racine/collaboration',
    description: 'Racine collaboration operations'
  },
  {
    frontendPattern: /^\/racine\/dashboard\/?$/,
    backendPath: '/racine/dashboard',
    description: 'Racine dashboard operations'
  },
  {
    frontendPattern: /^\/racine\/activity\/?$/,
    backendPath: '/racine/activity',
    description: 'Racine activity operations'
  },
  {
    frontendPattern: /^\/racine\/ai\/?$/,
    backendPath: '/racine/ai',
    description: 'Racine AI operations'
  },
  {
    frontendPattern: /^\/racine\/integration\/?$/,
    backendPath: '/racine/integration',
    description: 'Racine integration operations'
  },
  {
    frontendPattern: /^\/api\/racine\/integration\/health\/?$/,
    backendPath: '/api/racine/integration/health',
    description: 'Racine integration health check'
  },
  {
    frontendPattern: /^\/racine\/pipeline\/?$/,
    backendPath: '/racine/pipeline',
    description: 'Racine pipeline operations'
  },
  {
    frontendPattern: /^\/racine\/workflow\/?$/,
    backendPath: '/racine/workflow',
    description: 'Racine workflow operations'
  },
  {
    frontendPattern: /^\/api\/racine\/orchestration\/health\/?$/,
    backendPath: '/api/racine/orchestration/health',
    description: 'Racine orchestration health check'
  },
  {
    frontendPattern: /^\/api\/racine\/orchestration\/masters\/?$/,
    backendPath: '/api/racine/orchestration/masters',
    description: 'Racine orchestration masters'
  },
  {
    frontendPattern: /^\/api\/racine\/orchestration\/alerts\/?$/,
    backendPath: '/api/racine/orchestration/alerts',
    description: 'Racine orchestration alerts'
  },
  {
    frontendPattern: /^\/api\/racine\/orchestration\/metrics\/?$/,
    backendPath: '/api/racine/orchestration/metrics',
    description: 'Racine orchestration metrics'
  },
  {
    frontendPattern: /^\/api\/racine\/orchestration\/recommendations\/?$/,
    backendPath: '/api/racine/orchestration/recommendations',
    description: 'Racine orchestration recommendations'
  },
  {
    frontendPattern: /^\/api\/racine\/workspace\/list\/?$/,
    backendPath: '/api/racine/workspace/list',
    description: 'Racine workspace list'
  },
  {
    frontendPattern: /^\/api\/racine\/workspace\/templates\/?$/,
    backendPath: '/api/racine/workspace/templates',
    description: 'Racine workspace templates'
  },
  {
    frontendPattern: /^\/api\/v1\/notifications\/?$/,
    backendPath: '/api/v1/notifications',
    description: 'Notifications API'
  },
  {
    frontendPattern: /^\/api\/v1\/notifications\/settings\/?$/,
    backendPath: '/api/v1/notifications/settings',
    description: 'Notification settings'
  },

  // ============================================================================
  // NOTIFICATION APIs - Mapped to notification_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/scan\/notifications\/?$/,
    backendPath: '/scan/notifications',
    description: 'Get notifications'
  },
  // Aliases for notifications
  {
    frontendPattern: /^\/notifications\/?$/,
    backendPath: '/scan/notifications',
    description: 'Notifications alias to scan notifications'
  },
  {
    frontendPattern: /^\/api\/v1\/notifications\/?$/,
    backendPath: '/scan/notifications',
    description: 'Legacy v1 notifications bridged to scan notifications'
  },

  // ============================================================================
  // PERFORMANCE APIs - Mapped to performance_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/performance\/metrics\/?$/,
    backendPath: '/performance/metrics',
    description: 'Get performance metrics'
  },
  {
    frontendPattern: /^\/performance\/alerts\/?$/,
    backendPath: '/performance/alerts',
    description: 'Get performance alerts'
  },
  {
    frontendPattern: /^\/performance\/trends\/?$/,
    backendPath: '/performance/trends',
    description: 'Get performance trends'
  },
  {
    frontendPattern: /^\/performance\/recommendations\/?$/,
    backendPath: '/performance/recommendations',
    description: 'Get performance recommendations'
  },
  {
    frontendPattern: /^\/performance\/thresholds\/?$/,
    backendPath: '/performance/thresholds',
    description: 'Get performance thresholds'
  },

  // ============================================================================
  // SECURITY APIs - Mapped to security_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/security\/vulnerabilities\/?$/,
    backendPath: '/security/vulnerabilities',
    description: 'Get security vulnerabilities'
  },
  {
    frontendPattern: /^\/security\/incidents\/?$/,
    backendPath: '/security/incidents',
    description: 'Get security incidents'
  },
  {
    frontendPattern: /^\/security\/threats\/?$/,
    backendPath: '/security/threats',
    description: 'Get security threats'
  },
  {
    frontendPattern: /^\/security\/compliance\/?$/,
    backendPath: '/security/compliance',
    description: 'Get security compliance'
  },
  {
    frontendPattern: /^\/security\/analytics\/?$/,
    backendPath: '/security/analytics',
    description: 'Get security analytics'
  },

  // ============================================================================
  // BACKUP APIs - Mapped to backup_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/backups\/?$/,
    backendPath: '/backups',
    description: 'Backup operations'
  },
  {
    frontendPattern: /^\/backups\/schedules\/?$/,
    backendPath: '/backups/schedules',
    description: 'Backup schedules'
  },
  {
    frontendPattern: /^\/restores\/?$/,
    backendPath: '/restores',
    description: 'Restore operations'
  },

  // ============================================================================
  // TASK APIs - Mapped to various task-related routes
  // ============================================================================
  {
    frontendPattern: /^\/tasks\/?$/,
    backendPath: '/tasks',
    description: 'Task operations'
  },
  {
    frontendPattern: /^\/tasks\/stats\/?$/,
    backendPath: '/tasks/stats',
    description: 'Task statistics'
  },

  // ============================================================================
  // INTEGRATION APIs - Mapped to integration_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/integrations\/?$/,
    backendPath: '/integrations',
    description: 'Integration operations'
  },

  // ============================================================================
  // REPORT APIs - Mapped to report_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/reports\/?$/,
    backendPath: '/reports',
    description: 'Report operations'
  },
  {
    frontendPattern: /^\/reports\/stats\/?$/,
    backendPath: '/reports/stats',
    description: 'Report statistics'
  },

  // ============================================================================
  // VERSION APIs - Mapped to version_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/versions\/?$/,
    backendPath: '/versions',
    description: 'Version operations'
  },

  // ============================================================================
  // HEALTH APIs - System health endpoints
  // ============================================================================
  {
    frontendPattern: /^\/health\/?$/,
    backendPath: '/health',
    description: 'System health check'
  },
  {
    frontendPattern: /^\/health\/frontend-config\/?$/,
    backendPath: '/health/frontend-config',
    description: 'Frontend throttling config'
  },
  {
    frontendPattern: /^\/system\/health\/?$/,
    backendPath: '/system/health',
    description: 'System health status'
  },

  // ============================================================================
  // AUTH APIs - Mapped to auth_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/auth\/me\/?$/,
    backendPath: '/auth/me',
    description: 'Get current user'
  },
  {
    frontendPattern: /^\/auth\/login\/?$/,
    backendPath: '/auth/login',
    description: 'User login'
  },
  {
    frontendPattern: /^\/auth\/logout\/?$/,
    backendPath: '/auth/logout',
    description: 'User logout'
  },
  {
    frontendPattern: /^\/auth\/profile\/?$/,
    backendPath: '/auth/profile',
    description: 'User profile management'
  },
  {
    frontendPattern: /^\/auth\/preferences\/?$/,
    backendPath: '/auth/preferences',
    description: 'User preferences'
  },
  {
    frontendPattern: /^\/auth\/notifications\/?$/,
    backendPath: '/auth/notifications',
    description: 'User notifications'
  },
  {
    frontendPattern: /^\/auth\/api-keys\/?$/,
    backendPath: '/auth/api-keys',
    description: 'API key management'
  },
  {
    frontendPattern: /^\/auth\/analytics\/?$/,
    backendPath: '/auth/analytics',
    description: 'User analytics'
  },
  {
    frontendPattern: /^\/auth\/activity\/summary\/?$/,
    backendPath: '/auth/activity/summary',
    description: 'User activity summary'
  },
  {
    frontendPattern: /^\/auth\/usage\/statistics\/?$/,
    backendPath: '/auth/usage/statistics',
    description: 'Usage statistics'
  },
  {
    frontendPattern: /^\/auth\/custom-themes\/?$/,
    backendPath: '/auth/custom-themes',
    description: 'Custom themes'
  },
  {
    frontendPattern: /^\/auth\/custom-layouts\/?$/,
    backendPath: '/auth/custom-layouts',
    description: 'Custom layouts'
  },
  {
    frontendPattern: /^\/auth\/device-preferences\/?$/,
    backendPath: '/auth/device-preferences',
    description: 'Device preferences'
  },

  // ============================================================================
  // RBAC APIs - Mapped to rbac routes
  // ============================================================================
  {
    frontendPattern: /^\/rbac\/permissions\/?$/,
    backendPath: '/rbac/permissions',
    description: 'Get user permissions'
  },
  {
    frontendPattern: /^\/rbac\/roles\/?$/,
    backendPath: '/rbac/roles',
    description: 'Get roles'
  },
  {
    frontendPattern: /^\/rbac\/user\/permissions\/?$/,
    backendPath: '/rbac/user/permissions',
    description: 'Get user permissions'
  },
  {
    frontendPattern: /^\/rbac\/user\/roles\/?$/,
    backendPath: '/rbac/user/roles',
    description: 'Get user roles'
  },
  {
    frontendPattern: /^\/rbac\/access-requests\/?$/,
    backendPath: '/rbac/access-requests',
    description: 'Access requests management'
  },

  // ============================================================================
  // WORKFLOW APIs - Mapped to workflow_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/workflow\/designer\/workflows\/?$/,
    backendPath: '/workflow/designer/workflows',
    description: 'Workflow designer operations'
  },
  {
    frontendPattern: /^\/workflow\/executions\/?$/,
    backendPath: '/workflow/executions',
    description: 'Workflow executions'
  },
  {
    frontendPattern: /^\/workflow\/approvals\/workflows\/?$/,
    backendPath: '/workflow/approvals/workflows',
    description: 'Workflow approvals'
  },
  {
    frontendPattern: /^\/workflow\/approvals\/pending\/?$/,
    backendPath: '/workflow/approvals/pending',
    description: 'Pending workflow approvals'
  },
  {
    frontendPattern: /^\/workflow\/bulk-operations\/?$/,
    backendPath: '/workflow/bulk-operations',
    description: 'Workflow bulk operations'
  },
  {
    frontendPattern: /^\/workflow\/templates\/?$/,
    backendPath: '/workflow/templates',
    description: 'Workflow templates'
  },

  // ============================================================================
  // COLLABORATION APIs - Mapped to collaboration_routes.py
  // ============================================================================
  {
    frontendPattern: /^\/collaboration\/sessions\/?$/,
    backendPath: '/collaboration/sessions',
    description: 'Collaboration sessions'
  },
  {
    frontendPattern: /^\/collaboration\/documents\/?$/,
    backendPath: '/collaboration/documents',
    description: 'Collaboration documents'
  },
  {
    frontendPattern: /^\/collaboration\/workspaces\/?$/,
    backendPath: '/collaboration/workspaces',
    description: 'Collaboration workspaces'
  },

  // ============================================================================
  // SENSITIVITY LABELS APIs - Mapped to sensitivity_labeling
  // ============================================================================
  {
    frontendPattern: /^\/sensitivity-labels\/rbac\/audit-logs\/?$/,
    backendPath: '/sensitivity-labels/rbac/audit-logs',
    description: 'Audit logs'
  },

  // ============================================================================
  // CATALOG APIs - Mapped to catalog routes
  // ============================================================================
  {
    frontendPattern: /^\/scan\/catalog\/?$/,
    backendPath: '/scan/catalog',
    description: 'Data catalog operations'
  },

  // ============================================================================
  // FALLBACK MAPPINGS - For APIs that don't match specific patterns
  // ============================================================================
  {
    frontendPattern: /^\/api\/(.+)$/,
    backendPath: '/api/$1',
    description: 'Generic API fallback'
  },
  {
    frontendPattern: /^\/scan\/(.+)$/,
    backendPath: '/scan/$1',
    description: 'Generic scan API fallback'
  },
  {
    frontendPattern: /^\/data-discovery\/(.+)$/,
    backendPath: '/data-discovery/$1',
    description: 'Generic data discovery API fallback'
  },
  {
    frontendPattern: /^\/racine\/(.+)$/,
    backendPath: '/racine/$1',
    description: 'Generic racine API fallback'
  },
  {
    frontendPattern: /^\/performance\/(.+)$/,
    backendPath: '/performance/$1',
    description: 'Generic performance API fallback'
  },
  {
    frontendPattern: /^\/security\/(.+)$/,
    backendPath: '/security/$1',
    description: 'Generic security API fallback'
  },
  {
    frontendPattern: /^\/workflow\/(.+)$/,
    backendPath: '/workflow/$1',
    description: 'Generic workflow API fallback'
  },
  {
    frontendPattern: /^\/collaboration\/(.+)$/,
    backendPath: '/collaboration/$1',
    description: 'Generic collaboration API fallback'
  },
  {
    frontendPattern: /^\/auth\/(.+)$/,
    backendPath: '/auth/$1',
    description: 'Generic auth API fallback'
  },
  {
    frontendPattern: /^\/rbac\/(.+)$/,
    backendPath: '/rbac/$1',
    description: 'Generic RBAC API fallback'
  },
  {
    frontendPattern: /^\/backups\/(.+)$/,
    backendPath: '/backups/$1',
    description: 'Generic backup API fallback'
  },
  {
    frontendPattern: /^\/restores\/(.+)$/,
    backendPath: '/restores/$1',
    description: 'Generic restore API fallback'
  },
  {
    frontendPattern: /^\/tasks\/(.+)$/,
    backendPath: '/tasks/$1',
    description: 'Generic task API fallback'
  },
  {
    frontendPattern: /^\/integrations\/(.+)$/,
    backendPath: '/integrations/$1',
    description: 'Generic integration API fallback'
  },
  {
    frontendPattern: /^\/reports\/(.+)$/,
    backendPath: '/reports/$1',
    description: 'Generic report API fallback'
  },
  {
    frontendPattern: /^\/versions\/(.+)$/,
    backendPath: '/versions/$1',
    description: 'Generic version API fallback'
  },
  {
    frontendPattern: /^\/sensitivity-labels\/(.+)$/,
    backendPath: '/sensitivity-labels/$1',
    description: 'Generic sensitivity labels API fallback'
  },
];

// ============================================================================
// INTELLIGENT API MAPPING FUNCTION
// ============================================================================
function mapFrontendToBackend(frontendPath: string): { backendPath: string; description: string } | null {
  // Keep the leading slash so our regex patterns (which start with \/) match correctly
  const pathForMatch = frontendPath;
  
  // Try to find a matching pattern
  for (const mapping of API_MAPPINGS) {
    const match = pathForMatch.match(mapping.frontendPattern);
    if (match) {
      // Replace placeholders in backend path
      let backendPath = mapping.backendPath;
      for (let i = 1; i < match.length; i++) {
        backendPath = backendPath.replace(`$${i}`, match[i]);
      }
      
      return {
        backendPath: `/${backendPath}`,
        description: mapping.description
      };
    }
  }
  
  return null;
}

// ============================================================================
// PROXY PERFORMANCE MONITOR
// ============================================================================
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
    
    // Update average response time
    this.avgResponseTime = (this.avgResponseTime * (this.requestCount - 1) + responseTime) / this.requestCount;
    
    // Reset every hour
    if (Date.now() - this.lastResetTime > 3600000) {
      this.reset();
    }
  }

  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: this.requestCount > 0 ? ((this.requestCount - this.errorCount) / this.requestCount) * 100 : 100,
      avgResponseTime: Math.round(this.avgResponseTime),
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

// ============================================================================
// MAIN PROXY FUNCTION
// ============================================================================
// Simple in-memory limiter per client IP+path (token bucket)
type BucketKey = string;
const buckets: Map<BucketKey, { tokens: number; lastRefill: number }> = new Map();
const MAX_TOKENS_PER_WINDOW = 8; // max concurrent-like tokens per key
const REFILL_INTERVAL_MS = 1000; // 1s
const TOKENS_PER_INTERVAL = 4; // refill rate

function getClientIp(req: Request): string {
  try {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    const url = new URL(req.url);
    return url.hostname;
  } catch {
    return 'unknown';
  }
}

function allowRequest(key: BucketKey): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS_PER_WINDOW, lastRefill: now };
    buckets.set(key, bucket);
  }
  // Refill
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    const increments = Math.floor(elapsed / REFILL_INTERVAL_MS);
    bucket.tokens = Math.min(MAX_TOKENS_PER_WINDOW, bucket.tokens + increments * TOKENS_PER_INTERVAL);
    bucket.lastRefill = now;
  }
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

async function proxy(request: Request, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const startTime = Date.now();
  const monitor = ProxyPerformanceMonitor.getInstance();
  
  try {
    // Get the path from the request
    const params = await ctx.params;
    const pathSegments = params.path || [];
    const frontendPath = `/${pathSegments.join('/')}`;
    // Apply limiter per client and path family to cap burst concurrency
    const client = getClientIp(request);
    const limiterKey = `${client}:${frontendPath.split('/').slice(0,3).join('/')}`;
    if (!allowRequest(limiterKey)) {
      monitor.recordRequest(Date.now() - startTime, true);
      return NextResponse.json({ error: 'Too many requests - proxy is rate limiting' }, { status: 429 });
    }
    
    // Map frontend path to backend path
    const mapping = mapFrontendToBackend(frontendPath);
    
    if (!mapping) {
      console.warn(`❌ No mapping found for frontend path: ${frontendPath}`);
      monitor.recordRequest(Date.now() - startTime, true);
      return NextResponse.json(
        { 
          error: 'API endpoint not found', 
          frontendPath,
          availableMappings: API_MAPPINGS.length,
          suggestion: 'Check API_MAPPINGS in proxy route for available endpoints'
        },
        { status: 404 }
      );
    }
    
    // Build the backend URL
    const backendUrl = `${BACKEND_BASE}${mapping.backendPath}`;
    
    // Get request method and headers
    const method = request.method as HttpMethod;
    const headers = new Headers(request.headers);
    
    // Remove host header to avoid conflicts
    headers.delete('host');
    
    // Prepare request body
    let body: BodyInit | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (error) {
        console.warn('Failed to read request body:', error);
      }
    }
    
    // Add query parameters if present
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const finalBackendUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl;
    
    console.log(`🔄 ${method} ${frontendPath} → ${finalBackendUrl} (${mapping.description})`);
    
    // Make the request to backend with retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
        
        const response = await fetch(finalBackendUrl, {
          method,
          headers,
          body,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // Clone the response to read it
        const responseClone = response.clone();
        const responseText = await responseClone.text();
        
        // Log response details
        const responseTime = Date.now() - startTime;
        const statusEmoji = response.ok ? '✅' : '❌';
        console.log(`${statusEmoji} ${method} ${frontendPath} → ${response.status} (${responseTime}ms)`);
        
        // Record metrics
        monitor.recordRequest(responseTime, !response.ok);
        
        // Return the response
        return new NextResponse(responseText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Attempt ${attempt}/${MAX_RETRIES} failed for ${finalBackendUrl}:`, error);
        
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        }
      }
    }
    
    // All retries failed
    const responseTime = Date.now() - startTime;
    monitor.recordRequest(responseTime, true);
    
    console.error(`❌ All ${MAX_RETRIES} attempts failed for ${finalBackendUrl}:`, lastError);
    
    return NextResponse.json(
      {
        error: 'Backend service unavailable',
        frontendPath,
        backendPath: mapping.backendPath,
        attempts: MAX_RETRIES,
        lastError: lastError?.message,
        responseTime
      },
      { status: 503 }
    );
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitor.recordRequest(responseTime, true);
    
    console.error('❌ Proxy error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal proxy error',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HTTP METHOD HANDLERS
// ============================================================================
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

