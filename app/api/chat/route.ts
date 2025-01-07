import { NextResponse } from 'next/server'

// 云服务器的API地址
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://64.176.34.72:5007/chat'
// 使用公共的 API Key
const PUBLIC_API_KEY = 'Hy7#mK9$pL2@vN4*xQ8'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 准备发送到服务器的数据
    const requestData = {
      message: body.message,
      user_id: body.userId || 'default',
      wallet_data: body.walletData || null
    }

    // 调用云服务器API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PUBLIC_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API响应错误:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      throw new Error(`API调用失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Chat API详细错误:', error)
    return NextResponse.json(
      { 
        text: `抱歉，连接服务器时出现错误: ${(error as Error).message} 🥺`,
        type: 'error', 
        actions: []
      },
      { status: 500 }
    )
  }
}

