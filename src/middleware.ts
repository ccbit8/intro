import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ✅ 中间件：优化首屏响应和缓存策略
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // ✅ 为首页添加优化的缓存头
  if (request.nextUrl.pathname === '/') {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, must-revalidate' // 不缓存 HTML，但 CDN 可缓存
    )
  }

  // ✅ 为 API 路由添加适当的缓存头
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'private, max-age=0, must-revalidate'
    )
  }

  // ✅ 添加性能相关的头部
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // ✅ 启用 DNS 预解析
  response.headers.set(
    'Link',
    '</styles.css>; rel=preload; as=style, </script.js>; rel=preload; as=script'
  )

  return response
}

// ✅ 配置中间件匹配的路由
export const config = {
  matcher: [
    // 匹配所有路由除了:
    // - api (API 路由)
    // - _next/static (静态文件)
    // - favicon.ico (favicon 文件)
    '/((?!_next/static|favicon.ico).*)',
  ],
}
