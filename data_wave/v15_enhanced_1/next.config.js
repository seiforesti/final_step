/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize production performance
  compiler: {
    // Enable React Server Components
    relay: {
      // Enable aggressive dead code elimination
      eagerEsm: true,
    },
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Enable server actions for form handling
    serverActions: true,
    // Enable incremental static regeneration
    isrMemoryCacheSize: 0,
    // Optimize page loading
    optimizeCss: true,
  },
  // Configure module/dependency optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize CSS
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              reuseExistingChunk: true,
            },
            lib: {
              test: /[\\/]lib[\\/]/,
              name: 'lib',
              chunks: 'all',
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
  // Environment configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Configure redirects for SEO
  async redirects() {
    return []
  },
  // Configure rewrites for API proxying
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
