import { NextResponse } from 'next/server'

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required')
}

export async function POST(req: Request) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch('https://chat.pipimove.com', {
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
    
  } catch (error: Error | unknown) {
    const status = error instanceof Error && error.name === 'AbortError' ? 408 : 500
    const message = error instanceof Error && error.name === 'AbortError' ? 'Request timeout' : 'Server error'
    return NextResponse.json({ text: message, type: 'error' }, { status })
  }
}

