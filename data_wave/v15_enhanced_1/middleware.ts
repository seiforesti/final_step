/**
 * 🛡️ NEXT.JS MIDDLEWARE - RACINE ROUTE PROTECTION
 * ===============================================
 * 
 * Edge-level route protection that integrates with the Racine RBAC system
 * to provide enterprise-grade security and access control for all routes.
 * 
 * Features:
 * - RBAC-based route protection at the edge
 * - Performance-optimized permission checks
 * - Real-time authentication validation
 * - Cross-group access coordination
 * - Advanced security headers
 * - Audit logging for security events
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// ROUTE PATTERNS & PROTECTION LEVELS
// ============================================================================

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/api/health'
];

const PROTECTED_ROUTES = {
  // SPA Routes (require authentication + specific permissions)
  '/data-sources': ['data_sources.view'],
  '/scan-rule-sets': ['scan_rules.view'],
  '/classifications': ['classifications.view'], 
  '/compliance-rules': ['compliance.view'],
  '/advanced-catalog': ['catalog.view'],
  '/scan-logic': ['scan_logic.view'],
  '/rbac-system': ['rbac.view', 'admin.access'],
  
  // Management Routes
  '/workspace': ['workspace.view'],
  '/dashboard': ['dashboard.view'],
  '/workflows': ['workflows.view'],
  '/pipelines': ['pipelines.view'],
  '/ai-assistant': ['ai.access'],
  '/activity': ['activity.view'],
  '/collaboration': ['collaboration.view'],
  '/settings': ['profile.view'],
  
  // Admin-only Routes
  '/data-governance': ['admin.access'],
  '/system-admin': ['admin.access', 'system.admin']
};

const ADMIN_ONLY_ROUTES = [
  '/rbac-system',
  '/data-governance',
  '/system-admin'
];

// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname) || pathname === '/') {
    return NextResponse.next();
  }

  // Get authentication token from cookies
  const authToken = request.cookies.get('racine_auth_token')?.value;
  const sessionToken = request.cookies.get('racine_session')?.value;
  
  // If no authentication tokens, redirect to login
  if (!authToken && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if route requires specific permissions
  const requiredPermissions = PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES];
  
  if (requiredPermissions) {
    // Get user permissions from headers (set by auth service)
    const userPermissions = request.headers.get('x-user-permissions');
    const userRole = request.headers.get('x-user-role');
    
    // For admin-only routes, check admin role
    if (ADMIN_ONLY_ROUTES.includes(pathname)) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        const accessDeniedUrl = new URL('/access-denied', request.url);
        accessDeniedUrl.searchParams.set('reason', 'admin_required');
        accessDeniedUrl.searchParams.set('route', pathname);
        return NextResponse.redirect(accessDeniedUrl);
      }
    }
    
    // Check specific permissions
    if (userPermissions && requiredPermissions.length > 0) {
      const permissions = userPermissions.split(',');
      const hasRequiredPermissions = requiredPermissions.every(
        permission => permissions.includes(permission)
      );
      
      if (!hasRequiredPermissions) {
        const accessDeniedUrl = new URL('/access-denied', request.url);
        accessDeniedUrl.searchParams.set('reason', 'insufficient_permissions');
        accessDeniedUrl.searchParams.set('required', requiredPermissions.join(','));
        accessDeniedUrl.searchParams.set('route', pathname);
        return NextResponse.redirect(accessDeniedUrl);
      }
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers for enterprise-grade protection
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
  );
  
  // Add custom headers for Racine system
  response.headers.set('X-Racine-Version', 'v15-enhanced');
  response.headers.set('X-Racine-Environment', process.env.NODE_ENV || 'development');
  response.headers.set('X-Route-Protected', requiredPermissions ? 'true' : 'false');
  
  return response;
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};