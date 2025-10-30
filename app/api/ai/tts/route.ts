import { NextRequest, NextResponse } from 'next/server'
import { aiTextToSpeech } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { text, locale } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Limit text length for safety
    if (text.length > 1000) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 })
    }

    const audioBuffer = await aiTextToSpeech(text, locale || 'fi')
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 })
  }
}