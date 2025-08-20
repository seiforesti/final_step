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
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'v15-enhanced',
  },
  async rewrites() {
    // Proxy frontend "/api/*" calls to backend to avoid CORS and align with enterprise routing
    const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
      {
        // Bridge mismatch: frontend uses /api/racine/orchestration/* but backend exposes /racine/orchestration/*
        source: '/api/racine/orchestration/:path*',
        destination: `${backendBase}/racine/orchestration/:path*`,
      },
      {
        // Fix pluralization mismatch for workflow routes
        source: '/api/racine/workflows/:path*',
        destination: `${backendBase}/api/racine/workflow/:path*`,
      },
      {
        // Workspace pluralization bridge
        source: '/api/racine/workspaces/:path*',
        destination: `${backendBase}/api/racine/workspace/:path*`,
      },
      {
        // Racine analytics bridge to enterprise analytics service
        source: '/api/racine/analytics/:path*',
        destination: `${backendBase}/analytics/:path*`,
      },
      {
        // Security service bridge
        source: '/api/racine/security/:path*',
        destination: `${backendBase}/security/:path*`,
      },
      {
        // Lineage service bridge
        source: '/api/racine/lineage/:path*',
        destination: `${backendBase}/api/v1/lineage/:path*`,
      },
      {
        // Monitoring service bridge
        source: '/api/racine/monitoring/:path*',
        destination: `${backendBase}/api/v1/monitoring/:path*`,
      },
      {
        // Integration service bridge
        source: '/api/racine/integration/:path*',
        destination: `${backendBase}/api/v1/integration/:path*`,
      },
      {
        // Streaming orchestration bridge
        source: '/api/racine/streaming/:path*',
        destination: `${backendBase}/api/v1/streaming-orchestration/:path*`,
      },
      {
        // Semantic search bridge
        source: '/api/racine/search/:path*',
        destination: `${backendBase}/semantic-search/:path*`,
      },
      {
        source: '/health',
        destination: `${backendBase}/health`,
      },
    ]
  },
}

export default nextConfig
