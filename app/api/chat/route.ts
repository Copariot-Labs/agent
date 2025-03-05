import { NextResponse } from 'next/server'

// Set up route configurations
export const runtime = 'edge' // Use Edge Runtime
export const maxDuration = 300 // Set maximum duration to 300 seconds

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required')
}

export async function POST(req: Request) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    // Log the request body
    const body = await req.json()
    console.log('Request body:', body)

    // Log the complete request information
    const requestInfo = {
      url: 'https://chat.pipimove.com/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY!.substring(0, 4) + '...' // Only log part of the API key
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
      // Attempt to read the detailed information of the error response
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
      console.log('Successful response:', data)  // Log the successful response
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
    
  } catch (error: unknown) {  // Use unknown instead of any
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

