import { NextRequest, NextResponse } from 'next/server'
import { aiRoundFeedback } from '@/lib/ai'

export async function POST(req: NextRequest){
  const { answers, locale = 'fi' } = await req.json() as { answers: Array<{a:number,b:number,isCorrect:boolean,ms:number}>, locale?: 'fi'|'en'|'sv' }
  const correct = answers.filter(a=>a.isCorrect).length
  const total = answers.length
  const avgMs = Math.round(answers.reduce((s,a)=>s+a.ms,0)/Math.max(1,total))
  const mistakes = answers.filter(a=>!a.isCorrect).map(a=>({a:a.a,b:a.b}))
  const text = await aiRoundFeedback({ correct, total, avgMs, mistakes }, locale)
  const warmup = mistakes.slice(0,3).length ? mistakes.slice(0,3) : answers.slice(0,3).map(a=>({a:a.a,b:a.b}))
  return NextResponse.json({ text, warmup })
}
