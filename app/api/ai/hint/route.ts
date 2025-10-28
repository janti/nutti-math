import { NextRequest, NextResponse } from 'next/server'
import { aiHint } from '@/lib/ai'

export async function POST(req: NextRequest){
  const { a, b, locale = 'fi' } = await req.json()
  const hint = await aiHint(a,b, locale)
  return NextResponse.json({ hint })
}
