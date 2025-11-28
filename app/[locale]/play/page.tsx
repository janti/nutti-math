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
  range: '1-5' | '1-10' | '6-10' | '1-12' | '2-12' | 'mix' | '1-10-add' | '1-20-add' | '1-50-add' | '50-100-add' | '1-100-add' | 'mix-add'
  rounds: number
  gameType: 'multiplication' | 'addition'
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
  const [settings, setSettings] = useState<GameSettings>({ alias: 'Guest', range: '2-12', rounds: 10, gameType: 'multiplication' })
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
  const [showEmptyHint, setShowEmptyHint] = useState(false)
  const [showKeypad, setShowKeypad] = useState(true)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  const handleQuit = () => {
    router.push(`/${locale}/menu`)
  }

  // Performance tracking
  const questionStartTime = useRef<number>(performance.now())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Reset hint counter when component mounts or facts change
    setCurrentHints(0)

    // Optimized initialization - no heavy computation
    const savedSettings: GameSettings = JSON.parse(
      localStorage.getItem('nutti.settings') ||
      '{"alias":"Guest","range":"2-12","rounds":10,"gameType":"multiplication"}'
    )
    const savedRoundNo = Number(localStorage.getItem('nutti.roundNo') || '1')

    // Check if facts are already precomputed
    const precomputedKey = `nutti.facts.${savedRoundNo}.${savedSettings.range}`
    let roundFacts: Fact[] = JSON.parse(localStorage.getItem(precomputedKey) || 'null')

    if (!roundFacts) {
      // Compute only if no cache exists
      roundFacts = pickFacts(factPool(savedSettings.range, savedSettings.gameType || 'multiplication'), 10)
      localStorage.setItem(precomputedKey, JSON.stringify(roundFacts))
    }

    setSettings(savedSettings)
    setRoundNo(savedRoundNo)
    setFacts(roundFacts)
    setIsLoaded(true)
    console.log('Play: Loaded', roundFacts.length, 'facts for round', savedRoundNo, '- Expected: 10')
    document.body.tabIndex = -1
    document.body.focus()
    // Focus input field when game starts
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [])

  const currentQuestion = facts[currentQuestionIndex]

  /**
   * Submit the current answer and move to next question
   */
  const submitAnswer = () => {
    if (!currentQuestion || isSubmitting) return

    // Check if input is empty
    if (!userInput.trim()) {
      setShowEmptyHint(true)
      return
    }

    // Prevent multiple submits
    setIsSubmitting(true)

    // Calculate answer metrics
    const timeSpentMs = Math.round(performance.now() - questionStartTime.current)
    const userAnswer = Number(userInput || NaN)
    const correctAnswer = settings.gameType === 'addition' 
      ? currentQuestion.a + currentQuestion.b 
      : currentQuestion.a * currentQuestion.b
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

    const operation = settings.gameType === 'addition' ? '+' : 'x'
    console.log('Saving answer:', currentQuestion.a, operation, currentQuestion.b, '=', userAnswer, 'hints used:', currentHints, 'time:', timeSpentMs, 'ms')

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
    setShowEmptyHint(false)
    questionStartTime.current = performance.now()
    // Focus input field for next question
    setTimeout(() => inputRef.current?.focus(), 100)
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
      const operation = settings.gameType === 'addition' ? '+' : 'x'
      console.log('Hint requested for', currentQuestion.a, operation, currentQuestion.b, '- Total hints for this question:', currentHints + 1)
    } catch (error) {
      console.error('Error fetching hint:', error)
    }
  }

  // Show loading screen if facts are not ready
  if (!isLoaded || facts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nutti-secondary/30 via-white to-blue-50/40 py-8">
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
    <div className="h-[800px] bg-gradient-to-br from-blue-50/40 via-white to-nutti-primary/10 py-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto h-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 space-y-3 h-full flex flex-col relative">

          {/* Quit Confirmation Modal */}
          {showQuitConfirm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-2xl border-2 border-nutti-primary/20 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                  {t('play.quitConfirm')}
                </h3>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowQuitConfirm(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {t('play.quitCancel')}
                  </button>
                  <button
                    onClick={handleQuit}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    {t('play.quitOk')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header section - compact */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuitConfirm(true)}
                className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title={t('play.quit')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <NuttiBadge mood="thinking" />
            </div>
            <div className="w-1/3"><Progress value={(currentQuestionIndex / facts.length) * 100} /></div>
          </div>

          {/* Main game area - flexible grid layout */}
          <div className={`flex-1 grid gap-4 items-start transition-all duration-500 ${showKeypad ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto w-full'}`}>

            {/* Left column: Problem and input - MAIN FOCUS */}
            <div className="space-y-4">
              {/* Round indicator - compact */}
              <div className="text-center py-3 bg-gradient-to-r from-nutti-primary/20 to-blue-100 rounded-xl border-2 border-nutti-primary/30 shadow-sm">
                <div className="text-3xl">{t('icons.target')}</div>
                <div className="text-xl font-bold text-nutti-primary">
                  {t('play.round', { n: roundNo, total: settings.rounds })}
                </div>
              </div>

              {/* Problem display - ENHANCED & PROMINENT */}
              <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-3 border-nutti-primary/40 text-center shadow-lg transform hover:scale-[1.02] transition-all">
                <div className="text-4xl mb-3">{t('icons.calculator')}</div>
                <div className="text-6xl lg:text-7xl font-black tracking-tight text-nutti-primary select-none mb-3 drop-shadow-sm">
                  {currentQuestion.a} {settings.gameType === 'addition' ? '+' : '×'} {currentQuestion.b}
                </div>
                <div className="text-3xl">{t('icons.sparkles')}</div>
              </div>

              {/* Answer input section - ENHANCED */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-3 border-nutti-accent/40 text-center shadow-lg">
                <div className="text-3xl mb-3">{t('icons.honey')}</div>
                <div className="flex gap-4 justify-center items-center flex-wrap">
                  <input
                    ref={inputRef}
                    aria-label={t('play.answer')}
                    inputMode="numeric"
                    value={userInput}
                    onChange={e => {
                      setUserInput(e.target.value.replace(/\D/g, '').slice(0, 3))
                      setShowEmptyHint(false) // Hide hint when user starts typing
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !isSubmitting) {
                        submitAnswer()
                      }
                    }}
                    autoFocus
                    disabled={isSubmitting}
                    className={`w-32 text-center text-3xl font-bold rounded-xl border-3 p-3 transition-all shadow-sm ${isSubmitting
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-white border-nutti-secondary focus:ring-4 focus:ring-nutti-accent/40 focus:border-nutti-accent'
                      }`}
                    placeholder=""
                  />
                  <button
                    className={`btn text-lg px-6 py-3 shadow-xl transition-all focus:ring-4 ${isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-nutti-primary to-blue-500 hover:from-nutti-primary/90 hover:to-blue-500/90 transform hover:scale-110 focus:ring-nutti-primary/30'
                      }`}
                    onClick={submitAnswer}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '⏳' : t('icons.lightning')} {t('play.submit')}
                  </button>
                </div>
                {/* Fixed space for hint message to prevent layout jumping */}
                <div className="h-6 mt-2 flex justify-center">
                  {showEmptyHint && (
                    <p className="text-sm text-red-600 animate-pulse">
                      {t('icons.pointingDown')} {t('play.enterAnswerHint')}
                    </p>
                  )}
                </div>
              </div>

              {/* Hint section - compact when present */}
              {hint && (
                <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-300 text-center">
                  <div className="text-lg mb-1">{t('icons.lightbulb')}</div>
                  <p className="text-base text-nutti-accent font-semibold">
                    {hint}
                  </p>
                </div>
              )}
            </div>

            {/* Right column: Keypad - collapsible */}
            <div className="flex flex-col">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => {
                    setShowKeypad(!showKeypad)
                    // Ensure focus returns to input after toggling keypad
                    setTimeout(() => inputRef.current?.focus(), 50)
                  }}
                  className="text-xs text-gray-400 hover:text-nutti-primary flex items-center gap-1 transition-colors"
                >
                  {showKeypad ? '🔽 Piilota' : '🔼 Näytä'}
                </button>
              </div>

              {showKeypad && (
                <div className={`transition-all duration-300 ${isSubmitting ? 'opacity-30 pointer-events-none' : 'opacity-75 hover:opacity-100'}`}>
                  <Keypad 
                    value={userInput} 
                    onChange={setUserInput} 
                    onSubmit={submitAnswer} 
                    onHint={requestHint}
                    inputRef={inputRef}
                  />

                  {/* Instructions - compact */}
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200 text-center opacity-60">
                    <span className="text-base">{t('icons.keyboard')}</span>
                    <p className="text-xs text-slate-500 font-medium mt-1">{t('home.kb')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
