import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 调试信息
  console.log('Middleware triggered:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  })
  
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
  response.headers.set('Access-Control-Allow-Origin', '*')  // 改为允许所有源
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key')

  // 处理预检请求
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 