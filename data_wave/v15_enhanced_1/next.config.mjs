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
        source: '/health',
        destination: `${backendBase}/health`,
      },
    ]
  },
}

export default nextConfig
