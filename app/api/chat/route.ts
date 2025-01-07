import { NextResponse } from 'next/server'

// 云服务器的API地址
const API_URL = 'https://chat.pipimove.com'
// 使用正确的 API Key
const API_KEY = 'L2M85AKH4yVU3KProNMfi3FasitJVp8XHbZvmi4EcRFGSpruDhNg'

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
        'X-API-Key': API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API response error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      })
      
      // Return a friendlier message for 401 error
      if (response.status === 401) {
        return NextResponse.json(
          {
            text: 'Server authentication failed, please contact the administrator 🔑',
            type: 'error',
            actions: []
          },
          { status: 401 }
        )
      }
      
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
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
    return NextResponse.json(
      { 
        text: `Sorry, an error occurred while connecting to the server: ${(error as Error).message} 🥺`,
        type: 'error', 
        actions: [],
        content: `Sorry, an error occurred while connecting to the server: ${(error as Error).message} 🥺`
      },
      { status: 500 }
    )
  }
}

