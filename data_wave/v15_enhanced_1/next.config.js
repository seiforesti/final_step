/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize production performance
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3002"],
    },
    // Enable optimized CSS
    optimizeCss: true,
  },
  // Enable Turbopack for faster development
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Set output configuration
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  // Configure image optimization
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Webpack configuration for production optimization
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev) {
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
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  // Environment configuration
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  // Configure rewrites for API proxying
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
