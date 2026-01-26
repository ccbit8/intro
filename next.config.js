/** @type {import('next').NextConfig} */
// const cl = require('next-contentlayer')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

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
    // ✅ 优先使用现代高效格式（AVIF 比 PNG 小 60-70%，WebP 小 30-40%）
    formats: ['image/avif', 'image/webp'],
    // ✅ 自动生成的图片尺寸（用于响应式设计）
    // 这会让 Next.js 在构建时为每个图片生成不同尺寸的版本
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // ✅ 允许外部图片源（需要显式列出安全的域名）
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
    // ✅ 默认图片质量（0-100，默认 75 已经很好）
    // 75 是推荐值：可感知损失最小，文件大小下降明显
    // 生产环境不建议改
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

  // ✅ 强制模块化导入 Lucide React (Tree Shaking)
  // 这是为了配合 standalone 模式，强制将 import 重写为具体文件路径，
  // 这样 Next.js 的文件追踪器（File Tracer）就不会把整个包都复制进去。
  // modularizeImports: {
  //   'lucide-react': {
  //     transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
  //     skipDefaultConversion: true,
  //   },
  // },

  // ✅ 性能相关的 experimental 特性
  experimental: {
    // optimizeCss: true, // 启用关键 CSS 内联优化 (moved to manual post-build script)
    optimizePackageImports: ['recharts', 'lucide-react'], // 恢复 lucide-react 优化
  },

  // 为了便于分析，给 Webpack 的 chunk 和 module 使用可读名称
  webpack: (config, { isServer }) => {
    // 仅影响客户端构建的输出命名
    if (!isServer) {
      config.optimization = config.optimization || {}
      config.optimization.chunkIds = 'named'
      config.optimization.moduleIds = 'named'
      
      // 🔪 强制切割：防止 Lucide 和 Recharts 纠缠在一起
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...(config.optimization.splitChunks?.cacheGroups || {}),
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: 'all',
            priority: 20,
            enforce: true
          },
          lucide: {
            name: 'lucide-react',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            chunks: 'all',
            priority: 20,
            enforce: true
          }
        }
      }
    }
    return config
  },
}

// module.exports = withBundleAnalyzer(cl.withContentlayer(nextConfig))
module.exports = withBundleAnalyzer(nextConfig)
