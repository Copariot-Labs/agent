import { NextResponse } from 'next/server'

// 设置路由配置
export const runtime = 'edge' // 使用 Edge Runtime
export const maxDuration = 300 // 设置最大持续时间为 300 秒

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required')
}

export async function POST(req: Request) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    // 添加请求体的日志
    const body = await req.json()
    console.log('Request body:', body)

    // 记录完整的请求信息
    const requestInfo = {
      url: 'https://chat.pipimove.com/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY!.substring(0, 4) + '...' // 只记录部分 API key
      },
      body: body
    }
    console.log('Making request:', requestInfo)

    const response = await fetch('https://chat.pipimove.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY!
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // 尝试读取错误响应的详细信息
      let errorDetail = ''
      try {
        const errorResponse = await response.text()
        errorDetail = errorResponse
      } catch {
        errorDetail = 'Could not read error response'
      }

      console.error('API response not ok:', {
        status: response.status,
        statusText: response.statusText,
        errorDetail
      })

      return NextResponse.json(
        { 
          text: `Error: ${response.status} - ${response.statusText}\n${errorDetail}`, 
          type: 'error' 
        }, 
        { status: response.status }
      )
    }

    try {
      const data = await response.json()
      console.log('Successful response:', data)  // 记录成功的响应
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { 
          text: 'Error parsing response from server', 
          type: 'error' 
        }, 
        { status: 500 }
      )
    }
    
  } catch (error: unknown) {  // 使用 unknown 代替 any
    console.error('API Error:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    const status = error instanceof Error && error.name === 'AbortError' ? 408 : 500
    const message = error instanceof Error && error.name === 'AbortError' 
      ? 'Request timeout' 
      : error instanceof Error ? error.message : 'Server error'

    return NextResponse.json(
      { 
        text: `Server Error: ${message}`, 
        type: 'error' 
      }, 
      { status }
    )
  }
}

