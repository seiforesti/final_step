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
  
  // Advanced API routing and proxying
  async rewrites() {
    const backend = process.env.RACINE_BACKEND_URL || "http://localhost:8000";
    return [
      // Smart proxy entrypoint (stays in Next, handled by app/api/proxy)
      {
        source: "/proxy/:path*",
        destination: "/api/proxy/:path*",
      },
      // Route any API calls through the smart proxy
      {
        source: "/api/:path*",
        destination: "/api/proxy/:path*",
      },
      // Health probe through proxy
      {
        source: "/health",
        destination: "/api/proxy/health",
      },
      // Map app paths to smart proxy namespaces
      {
        source: "/racine/:path*",
        destination: "/api/proxy/racine/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "/api/proxy/auth/:path*",
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
