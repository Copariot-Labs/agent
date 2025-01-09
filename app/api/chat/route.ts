import { NextResponse } from 'next/server'

if (!process.env.API_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error('Missing required environment variables')
}

// 根据环境选择 API URL
const API_URL = process.env.VERCEL 
  ? '/api/chat'  // Vercel 环境使用内部路由
  : process.env.NEXT_PUBLIC_BASE_URL  // 本地开发使用完整 URL

export async function POST(req: Request) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY!
      },
      body: JSON.stringify(await req.json()),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({ text: `Error: ${response.status}`, type: 'error' }, 
        { status: response.status })
    }

    return NextResponse.json(await response.json())
    
  } catch (error: any) {
    const status = error.name === 'AbortError' ? 408 : 500
    const message = error.name === 'AbortError' ? 'Request timeout' : 'Server error'
    return NextResponse.json({ text: message, type: 'error' }, { status })
  }
}

