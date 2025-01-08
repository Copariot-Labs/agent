import { NextResponse } from 'next/server'

// 云服务器的API地址 - 确保使用环境变量
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chat.pipimove.com'
const API_KEY = process.env.API_KEY || 'L2M85AKH4yVU3KProNMfi3FasitJVp8XHbZvmi4EcRFGSpruDhNg'

// 获取基础URL
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://chat.pipimove.com'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 准备发送到服务器的数据
    const requestData = {
      message: body.message,
      user_id: body.userId || 'default',
      wallet_data: body.walletData || null
    }

    // 添加请求诊断信息
    console.log('Attempting to connect to:', API_URL)
    console.log('Base URL:', getBaseUrl())

    // 设置超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    // 调用云服务器API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
        'Origin': getBaseUrl()
      },
      body: JSON.stringify(requestData),
      signal: controller.signal,
      cache: 'no-store'
    })

    clearTimeout(timeoutId)

    // 详细的错误处理
    if (!response.ok) {
      const errorText = await response.text()
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: API_URL,
        vercelEnv: process.env.VERCEL_ENV || 'unknown',
        vercelUrl: process.env.VERCEL_URL || 'unknown'
      }
      console.error('API response error:', errorDetails)

      // 针对不同错误返回不同消息
      switch (response.status) {
        case 401:
          return NextResponse.json({
            text: 'Authentication failed. Please try again later.',
            type: 'error',
            actions: [],
            content: 'Authentication failed. Please try again later.'
          }, { status: 401 })
        case 404:
          return NextResponse.json({
            text: 'API endpoint not found. Please check the configuration.',
            type: 'error',
            actions: [],
            content: 'API endpoint not found. Please check the configuration.'
          }, { status: 404 })
        case 405:
          return NextResponse.json({
            text: 'Method not allowed. Please check the request method.',
            type: 'error',
            actions: [],
            content: 'Method not allowed. Please check the request method.'
          }, { status: 405 })
        default:
          return NextResponse.json({
            text: `Server error: ${response.status}. Please try again later.`,
            type: 'error',
            actions: [],
            content: `Server error: ${response.status}. Please try again later.`
          }, { status: response.status })
      }
    }

    const data = await response.json()
    return NextResponse.json({
      text: data.text || 'No response content',
      type: data.type || 'text',
      actions: data.actions || [],
      content: data.content || data.text || ''
    })
    
  } catch (error) {
    console.error('Chat API detailed error:', error)
    
    // 检查是否是超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        text: 'Request timed out. Please try again.',
        type: 'error',
        actions: [],
        content: 'Request timed out. Please try again.'
      }, { status: 408 })
    }

    return NextResponse.json(
      { 
        text: `Connection error: ${(error as Error).message}`,
        type: 'error', 
        actions: [],
        content: `Connection error: ${(error as Error).message}`
      },
      { status: 500 }
    )
  }
}

