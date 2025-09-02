/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Enterprise-grade compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    styledComponents: true,
  },
  
  // Advanced experimental features for enterprise use
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:8000'],
      bodySizeLimit: '2mb',
    },
    optimizeCss: true,
    optimizePackageImports: [
      // Icon optimization disabled for compatibility
      '@radix-ui/react-icons',
      '@heroicons/react',
      'framer-motion',
      'recharts',
      'd3'
    ],
    // Advanced memory management
    workerThreads: false,
  },
  
  // Production-optimized output configuration
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  
  // Advanced image optimization for enterprise
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enterprise-grade webpack configuration
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Advanced chunk splitting for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for better caching
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk for shared components
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // React chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: "react",
              chunks: "all",
              priority: 30,
              reuseExistingChunk: true,
            },
            // UI components chunk
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|@heroicons)[\\/]/,
              name: "ui",
              chunks: "all",
              priority: 25,
              reuseExistingChunk: true,
            },
          },
        },
        // Memory optimizations
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        minimize: true,
      };
    }
    
    // Memory management for large builds
    config.parallelism = 1;
    
    // Advanced caching configuration
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(process.cwd(), '.next/cache'),
      maxMemoryGenerations: 1,
      compression: 'gzip',
    };
    
    // SVG support with optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    
    // Advanced bundle analyzer (optional)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    // Memory optimization plugins
    config.plugins.push(
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin()
    );
    
    return config;
  },
  
  // Environment configuration for enterprise
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || "development",
  },
  
  // Advanced API routing and proxying - INTELLIGENT MAPPING SYSTEM
  async rewrites() {
    const backend = process.env.RACINE_BACKEND_URL || "http://localhost:8000";
    return [
      // ============================================================================
      // PRIMARY PROXY ROUTE - Handles all API mapping intelligently
      // ============================================================================
      {
        source: "/proxy/:path*",
        destination: `${backend}/:path*`,
      },
      
      // ============================================================================
      // DIRECT BACKEND ROUTE MAPPINGS - Based on actual backend route structure
      // ============================================================================
      
      // Data Source APIs - scan_routes.py
      {
        source: "/scan/:path*",
        destination: `${backend}/scan/:path*`,
      },
      
      // Data Discovery APIs - data_discovery_routes.py
      {
        source: "/data-discovery/:path*",
        destination: `${backend}/data-discovery/:path*`,
      },
      
      // Racine APIs - racine_routes.py
      {
        source: "/racine/:path*",
        destination: `${backend}/racine/:path*`,
      },
      
      // Performance APIs - performance_routes.py
      {
        source: "/performance/:path*",
        destination: `${backend}/performance/:path*`,
      },
      
      // Security APIs - security_routes.py
      {
        source: "/security/:path*",
        destination: `${backend}/security/:path*`,
      },
      
      // Workflow APIs - workflow_routes.py
      {
        source: "/workflow/:path*",
        destination: `${backend}/workflow/:path*`,
      },
      
      // Collaboration APIs - collaboration_routes.py
      {
        source: "/collaboration/:path*",
        destination: `${backend}/collaboration/:path*`,
      },
      
      // Auth APIs - auth_routes.py
      {
        source: "/auth/:path*",
        destination: `${backend}/auth/:path*`,
      },
      
      // RBAC APIs - rbac routes
      {
        source: "/rbac/:path*",
        destination: `${backend}/rbac/:path*`,
      },
      
      // Backup APIs - backup_routes.py
      {
        source: "/backups/:path*",
        destination: `${backend}/backups/:path*`,
      },
      
      // Restore APIs - backup_routes.py
      {
        source: "/restores/:path*",
        destination: `${backend}/restores/:path*`,
      },
      
      // Task APIs - various task routes
      {
        source: "/tasks/:path*",
        destination: `${backend}/tasks/:path*`,
      },
      
      // Integration APIs - integration_routes.py
      {
        source: "/integrations/:path*",
        destination: `${backend}/integrations/:path*`,
      },
      
      // Report APIs - report_routes.py
      {
        source: "/reports/:path*",
        destination: `${backend}/reports/:path*`,
      },
      
      // Version APIs - version_routes.py
      {
        source: "/versions/:path*",
        destination: `${backend}/versions/:path*`,
      },
      
      // Sensitivity Labels APIs - sensitivity_labeling
      {
        source: "/sensitivity-labels/:path*",
        destination: `${backend}/sensitivity-labels/:path*`,
      },
      
      // Health check endpoints
      {
        source: "/health",
        destination: `${backend}/health`,
      },
      {
        source: "/system/health",
        destination: `${backend}/system/health`,
      },
      
      // ============================================================================
      // FALLBACK ROUTES - For any unmatched API calls
      // ============================================================================
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
  
  // Security headers for enterprise
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.mathpix.com; font-src 'self' https://fonts.gstatic.com https://cdn.mathpix.com; img-src 'self' data: https:; connect-src 'self' http://localhost:8000 https://localhost:8000 ws://localhost:8000 wss://localhost:8000;",
          },
        ],
      },
    ];
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Advanced TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
