import { NextRequest, NextResponse } from 'next/server'
import { aiHint } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { a, b, locale = 'fi', gameType = 'multiplication' } = await req.json()
    
    if (!a || !b) {
      return NextResponse.json({ error: 'Missing required parameters a and b' }, { status: 400 })
    }
    
    const hint = await aiHint(a, b, locale, gameType)
    return NextResponse.json({ hint })
  } catch (error) {
    console.error('Hint API error:', error)
    return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 })
  }
}
