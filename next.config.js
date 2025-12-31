// next.config.js - Enhanced version
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // REMOVE emotion: true - you're not using Emotion
  },
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      }
    }

    // Optimize lodash imports
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/lodash/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: ['lodash'],
        },
      },
    })

    // Split chunks optimization
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
        },
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
          priority: -20,
        },
      },
    }

    return config
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
}

module.exports = nextConfig