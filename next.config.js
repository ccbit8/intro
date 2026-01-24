/** @type {import('next').NextConfig} */
const cl = require('next-contentlayer')

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',

  // 启用 SWC 压缩和优化
  swcMinify: true,
  
  // ✅ 启用 gzip 和 brotli 压缩
  compress: true,

  // 性能优化
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.microlink.io',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'api.screenshotone.com',
      },
      {
        protocol: 'https',
        hostname: 'shot.screenshotapi.net',
      },
      {
        protocol: 'https',
        hostname: 'api.apiflash.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
          // ✅ 动态内容缓存
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          // ✅ 减少服务器负载的关键头
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      // ✅ 静态资源长期缓存（1 年）
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ✅ 公共静态资源缓存
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // ✅ HTML 页面缓存（短期）
      {
        source: '/:path*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },

  // ✅ 启用 onDemandEntries 优化
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 秒后释放内存
    pagesBufferLength: 5, // 保留最近 5 个页面
  },

  // ✅ 性能相关的 experimental 特性
  experimental: {
    // optimizeCss: true, // 启用关键 CSS 内联优化 (moved to manual post-build script)
    optimizePackageImports: ['recharts', 'lucide-react'], // 优化按需导入
  },
}

module.exports = cl.withContentlayer(nextConfig)
