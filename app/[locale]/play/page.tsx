'use client'
import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Keypad from '@/components/Keypad'
import Progress from '@/components/Progress'
import NuttiBadge from '@/components/NuttiBadge'
import { factPool, pickFacts } from '@/lib/game'

// TypeScript interfaces
interface Answer { 
  a: number; 
  b: number; 
  ms: number; 
  correct: number; 
  child: number; 
  isCorrect: boolean;
  hintsUsed?: number; // Track hints per answer
}

interface GameSettings {
  alias: string
  range: '1-5' | '1-10' | '6-10' | '2-12' | 'mix'
  rounds: number
}

interface Fact {
  a: number
  b: number
}

export default function Play() {
  const params = useParams()
  const router = useRouter()
  const loc = params.locale as string || 'fi'
  const t = useTranslations()
  
  // State management with proper TypeScript types
  const [settings, setSettings] = useState<GameSettings>({ alias: 'Guest', range: '2-12', rounds: 10 })
  const [roundNo, setRoundNo] = useState(1)
  const [facts, setFacts] = useState<Fact[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [hint, setHint] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentHints, setCurrentHints] = useState(0) // Track hints for current question
  const t0 = useRef<number>(performance.now())
  
  useEffect(() => {
    // Reset hint counter when component mounts or facts change
    setCurrentHints(0)
    
    // Optimized initialization - no heavy computation
    const savedSettings: GameSettings = JSON.parse(
      localStorage.getItem('nutti.settings') || 
      '{"alias":"Guest","range":"2-12","rounds":10}'
    )
    const savedRoundNo = Number(localStorage.getItem('nutti.roundNo') || '1')
    
    // Check if facts are already precomputed
    const precomputedKey = `nutti.facts.${savedRoundNo}.${savedSettings.range}`
    let roundFacts: Fact[] = JSON.parse(localStorage.getItem(precomputedKey) || 'null')
    
    if (!roundFacts) {
      // Compute only if no cache exists
      roundFacts = pickFacts(factPool(savedSettings.range), 10)
      localStorage.setItem(precomputedKey, JSON.stringify(roundFacts))
    }
    
    setSettings(savedSettings)
    setRoundNo(savedRoundNo)
    setFacts(roundFacts)
    setIsLoaded(true)
    console.log('Play: Loaded', roundFacts.length, 'facts for round', savedRoundNo, '- Expected: 10')
    document.body.tabIndex = -1
    document.body.focus()
  }, [])
  const current = facts[idx]
  
  const submit = () => {
    if (!current || isSubmitting) return
    
    // Prevent multiple submits
    setIsSubmitting(true)
    
    // Calculate answer metrics
    const ms = Math.round(performance.now() - t0.current)
    const child = Number(input || NaN)
    const correct = current.a * current.b
    const isCorrect = child === correct
    
    const entry: Answer = {
      a: current.a,
      b: current.b,
      ms,
      correct,
      child,
      isCorrect,
      hintsUsed: currentHints
    }
    
    console.log('Saving answer:', current.a, 'x', current.b, '=', child, 'hints used:', currentHints, 'time:', ms, 'ms')
    // Update state and prepare for next question
    const nextAnswers = [...answers, entry]
    setAnswers(nextAnswers)
    setInput('')
    setHint('')
    setCurrentHints(0) // Reset hint counter for next question
    t0.current = performance.now()
    
    // Check if round is complete
    if (idx + 1 >= facts.length) {
      // Save round data and navigate
      localStorage.setItem('nutti.last-round', JSON.stringify({
        roundNo,
        answers: nextAnswers,
        alias: settings.alias
      }))
      console.log('Play: Round', roundNo, 'complete. Next:', roundNo >= settings.rounds ? 'Results' : 'Break')
      
      if (roundNo >= settings.rounds) {
        router.push(`/${loc}/results`)
      } else {
        router.push(`/${loc}/break`)
      }
    } else {
      setIdx(idx + 1)
      // Re-enable submit for next question
      setIsSubmitting(false)
    }
    
    console.log('Question completed. Moving to next question, hints reset to 0')
  }
  
  const askHint = async () => {
    if (!current) return
    
    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST', 
        body: JSON.stringify({ ...current, locale: loc })
      })
      const { hint } = await res.json()
      setHint(hint)
      setCurrentHints(prev => prev + 1) // Increment hint counter
      console.log('Hint requested for', current.a, 'x', current.b, '- Total hints for this question:', currentHints + 1)
    } catch (error) {
      console.error('Error fetching hint:', error)
    }
  }
  
  // Optimized loading - show only if facts are actually missing
  if (!isLoaded || facts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-3xl mb-2">{t('icons.calculator')}</div>
          <p className="text-nutti-teal font-semibold">{t('play.loading')}</p>
        </div>
      </div>
    )
  }
  
  if (!current) {
    return <div className="card text-center"><p>{t('play.noTasks')}</p></div>
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-nutti-teal/10 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 space-y-3 min-h-[90vh] flex flex-col">
          {/* Header section - compact */}
          <div className="flex items-center justify-between py-2">
            <NuttiBadge mood="thinking" />
            <div className="w-1/3"><Progress value={(idx/facts.length)*100} /></div>
          </div>
      
      {/* Main game area - flexible grid layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        
        {/* Left column: Problem and input - MAIN FOCUS */}
        <div className="space-y-4">
          {/* Round indicator - compact */}
          <div className="text-center py-3 bg-gradient-to-r from-nutti-teal/20 to-cyan-100 rounded-xl border-2 border-nutti-teal/30 shadow-sm">
            <div className="text-3xl">{t('icons.target')}</div>
            <div className="text-xl font-bold text-nutti-teal">
              Erä {roundNo} / {settings.rounds}
            </div>
          </div>
          
          {/* Problem display - ENHANCED & PROMINENT */}
          <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-3 border-nutti-teal/40 text-center shadow-lg transform hover:scale-[1.02] transition-all">
            <div className="text-4xl mb-3">{t('icons.calculator')}</div>
            <div className="text-6xl lg:text-7xl font-black tracking-tight text-nutti-teal select-none mb-3 drop-shadow-sm">
              {current.a} × {current.b}
            </div>
            <div className="text-3xl">{t('icons.sparkles')}</div>
          </div>
          
          {/* Answer input section - ENHANCED */}
          <div className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-3 border-nutti-orange/40 text-center shadow-lg">
            <div className="text-3xl mb-3">{t('icons.honey')}</div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <input 
                aria-label={t('play.answer')} 
                inputMode="numeric" 
                value={input}
                onChange={e=>setInput(e.target.value.replace(/\D/g,'').slice(0,3))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    submit()
                  }
                }}
                disabled={isSubmitting}
                className={`w-32 text-center text-3xl font-bold rounded-xl border-3 p-3 transition-all shadow-sm ${
                  isSubmitting 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                    : 'bg-white border-nutti-beige focus:ring-4 focus:ring-nutti-orange/40 focus:border-nutti-orange'
                }`}
                placeholder="?"
              />
              <button 
                className={`btn text-lg px-6 py-3 shadow-xl transition-all focus:ring-4 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-nutti-teal to-cyan-500 hover:from-nutti-teal/90 hover:to-cyan-500/90 transform hover:scale-110 focus:ring-nutti-teal/30'
                }`}
                onClick={submit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳' : t('icons.lightning')} {t('play.submit')}
              </button>
            </div>
          </div>

          {/* Hint section - compact when present */}
          {hint && (
            <div className="p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-300 text-center">
              <div className="text-lg mb-1">{t('icons.lightbulb')}</div>
              <p className="text-base text-amber-800 font-semibold">
                {hint}
              </p>
            </div>
          )}
        </div>
        
        {/* Right column: Keypad - less prominent */}
        <div className="flex flex-col">
          <div className={`transition-opacity ${isSubmitting ? 'opacity-30 pointer-events-none' : 'opacity-75 hover:opacity-100'}`}>
            <Keypad value={input} onChange={setInput} onSubmit={submit} onHint={askHint} />
          </div>
          
          {/* Instructions - compact */}
          <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200 text-center opacity-60">
            <span className="text-base">{t('icons.keyboard')}</span>
            <p className="text-xs text-slate-500 font-medium mt-1">{t('home.kb')}</p>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}
