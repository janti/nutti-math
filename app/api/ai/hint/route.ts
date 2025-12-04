import { NextRequest, NextResponse } from 'next/server'
import { aiHint } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { a, b, locale = 'fi', gameType = 'multiplication', equation, problem } = await req.json()
    
    // For word problems, we need the problem text
    if (gameType === 'wordProblems') {
      if (!problem) {
        return NextResponse.json({ error: 'Missing problem parameter for wordProblems gameType' }, { status: 400 })
      }
      const hint = await aiHint(0, 0, locale, gameType, problem)
      return NextResponse.json({ hint })
    }
    // For equations, we need the equation string
    else if (gameType === 'equations') {
      if (!equation) {
        return NextResponse.json({ error: 'Missing equation parameter for equations gameType' }, { status: 400 })
      }
      // For equations, use dummy a,b values as the hint logic uses the equation string
      const hint = await aiHint(0, 0, locale, gameType, equation)
      return NextResponse.json({ hint })
    } else {
      if (!a || !b) {
        return NextResponse.json({ error: 'Missing required parameters a and b' }, { status: 400 })
      }
      const hint = await aiHint(a, b, locale, gameType)
      return NextResponse.json({ hint })
    }
  } catch (error) {
    console.error('Hint API error:', error)
    return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 })
  }
}
