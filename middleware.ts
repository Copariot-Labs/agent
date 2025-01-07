import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 获取响应头
  const requestHeaders = new Headers(request.headers)
  
  // 获取来源
  const origin = requestHeaders.get('origin') || '*'

  // 创建响应
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // 添加 CORS 头
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Accept')
  response.headers.set('Access-Control-Max-Age', '86400')

  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

// 配置中间件匹配的路径
export const config = {
  matcher: '/api/:path*',
} 