/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  env: {
    // Route all frontend API calls through the internal Next.js proxy
    // This must be an internal path, not a backend URL, to avoid bypassing our proxy route handlers
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'v15-enhanced',
  },
  // IMPORTANT: We intentionally avoid generic rewrites of "/api/*" to the backend
  // because we rely on our internal proxy route at "/api/proxy/[...path]" to map and throttle requests.
  // Any additional rewrites should be narrow and must NOT include "/api/proxy/*".
  async rewrites() {
    return [
      // Forward bare health checks to proxy so direct /health still works in code paths that skip orchestrator
      { source: '/health', destination: '/api/proxy/health' },
      { source: '/health/:path*', destination: '/api/proxy/health/:path*' },
    ]
  },
}

export default nextConfig
