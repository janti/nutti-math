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
  const locale = params.locale as string || 'fi'
  const t = useTranslations()
  
  // Game configuration state
  const [settings, setSettings] = useState<GameSettings>({ alias: 'Guest', range: '2-12', rounds: 10 })
  const [roundNo, setRoundNo] = useState(1)
  
  // Question data and progress
  const [facts, setFacts] = useState<Fact[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  
  // User input and feedback
  const [userInput, setUserInput] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [hint, setHint] = useState<string>('')
  const [currentHints, setCurrentHints] = useState(0)
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Performance tracking
  const questionStartTime = useRef<number>(performance.now())
  
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
  
  const currentQuestion = facts[currentQuestionIndex]
  
  /**
   * Submit the current answer and move to next question
   */
  const submitAnswer = () => {
    if (!currentQuestion || isSubmitting) return
    
    // Prevent multiple submits
    setIsSubmitting(true)
    
    // Calculate answer metrics
    const timeSpentMs = Math.round(performance.now() - questionStartTime.current)
    const userAnswer = Number(userInput || NaN)
    const correctAnswer = currentQuestion.a * currentQuestion.b
    const isCorrect = userAnswer === correctAnswer
    
    const answerEntry: Answer = {
      a: currentQuestion.a,
      b: currentQuestion.b,
      ms: timeSpentMs,
      correct: correctAnswer,
      child: userAnswer,
      isCorrect,
      hintsUsed: currentHints
    }
    
    console.log('Saving answer:', currentQuestion.a, 'x', currentQuestion.b, '=', userAnswer, 'hints used:', currentHints, 'time:', timeSpentMs, 'ms')
    
    // Update state and prepare for next question
    const updatedAnswers = [...answers, answerEntry]
    setAnswers(updatedAnswers)
    
    // Check if round is complete
    if (currentQuestionIndex + 1 >= facts.length) {
      saveRoundAndNavigate(updatedAnswers)
    } else {
      moveToNextQuestion()
    }
    
    console.log('Question completed. Moving to next question, hints reset to 0')
  }

  /**
   * Reset UI state for the next question
   */
  const resetForNextQuestion = () => {
    setUserInput('')
    setHint('')
    setCurrentHints(0)
    questionStartTime.current = performance.now()
  }

  /**
   * Save current round data and navigate to next screen
   */
  const saveRoundAndNavigate = (finalAnswers: Answer[]) => {
    localStorage.setItem('nutti.last-round', JSON.stringify({
      roundNo,
      answers: finalAnswers,
      alias: settings.alias
    }))
    console.log('Play: Round', roundNo, 'complete. Next:', roundNo >= settings.rounds ? 'Results' : 'Break')
    
    const nextRoute = roundNo >= settings.rounds ? 'results' : 'break'
    router.push(`/${locale}/${nextRoute}`)
  }

  /**
   * Move to the next question in the current round
   */
  const moveToNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1)
    resetForNextQuestion()
    setIsSubmitting(false)
  }
  
  /**
   * Request an AI hint for the current question
   */
  const requestHint = async () => {
    if (!currentQuestion) return
    
    try {
      const response = await fetch('/api/ai/hint', {
        method: 'POST', 
        body: JSON.stringify({ ...currentQuestion, locale })
      })
      const { hint } = await response.json()
      setHint(hint)
      setCurrentHints(prev => prev + 1)
      console.log('Hint requested for', currentQuestion.a, 'x', currentQuestion.b, '- Total hints for this question:', currentHints + 1)
    } catch (error) {
      console.error('Error fetching hint:', error)
    }
  }
  
  // Show loading screen if facts are not ready
  if (!isLoaded || facts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nutti-beige/30 via-white to-cyan-50/40 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
          <div className="flex items-center justify-center space-x-2 text-lg">
            <span>{t('icons.loading')}</span>
            <span>{t('play.loading')}</span>
          </div>
        </div>
      </div>
    )
  }
  
  if (!currentQuestion) {
    return <div className="card text-center"><p>{t('play.noTasks')}</p></div>
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-nutti-teal/10 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 space-y-3 min-h-[90vh] flex flex-col">
          {/* Header section - compact */}
          <div className="flex items-center justify-between py-2">
            <NuttiBadge mood="thinking" />
            <div className="w-1/3"><Progress value={(currentQuestionIndex/facts.length)*100} /></div>
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
              {currentQuestion.a} × {currentQuestion.b}
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
                value={userInput}
                onChange={e=>setUserInput(e.target.value.replace(/\D/g,'').slice(0,3))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    submitAnswer()
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
                onClick={submitAnswer}
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
            <Keypad value={userInput} onChange={setUserInput} onSubmit={submitAnswer} onHint={requestHint} />
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
