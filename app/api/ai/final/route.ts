import { NextRequest, NextResponse } from 'next/server'
import { aiFinalFeedback } from '@/lib/ai'

export async function POST(req: NextRequest){
  const { rounds, locale = 'fi' } = await req.json() as { 
    rounds: Array<{
      roundNo: number,
      answers: Array<{a:number,b:number,isCorrect:boolean,ms:number}>
    }>, 
    locale?: 'fi'|'en'|'sv' 
  }
  
  // Calculate overall statistics
  const allAnswers = rounds.flatMap(r => r.answers)
  const totalCorrect = allAnswers.filter(a => a.isCorrect).length
  const totalQuestions = allAnswers.length
  const totalTimeMs = allAnswers.reduce((sum, a) => sum + a.ms, 0)
  const avgTimeMs = Math.round(totalTimeMs / Math.max(1, totalQuestions))
  
  const text = await aiFinalFeedback({ 
    rounds: rounds.length,
    totalCorrect, 
    totalQuestions, 
    avgTimeMs,
    roundsData: rounds.map(r => ({
      roundNo: r.roundNo,
      correct: r.answers.filter(a => a.isCorrect).length,
      total: r.answers.length,
      timeMs: r.answers.reduce((s, a) => s + a.ms, 0)
    }))
  }, locale)
  
  return NextResponse.json({ text })
}