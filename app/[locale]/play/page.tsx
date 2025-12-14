'use client'
import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Keypad from '@/components/Keypad'
import Progress from '@/components/Progress'
import NuttiBadge from '@/components/NuttiBadge'
import { factPool, pickFacts, generateEquationFacts, getEquationAnswer, formatEquation } from '@/lib/game'
import type { EquationFact } from '@/lib/game'

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
  range: '1-5' | '1-10' | '6-10' | '1-12' | '2-12' | '1-20' | '1-10-add' | '1-20-add' | '1-50-add' | '50-100-add' | '1-100-add' | '1-200-add' | '1-10-sub' | '1-20-sub' | '1-50-sub' | '50-100-sub' | '1-100-sub' | '1-200-sub' | 'equations-easy' | 'equations-medium' | 'equations-hard' | 'equations-veryhard' | '1-5-div' | '1-10-div' | '1-12-div' | '1-20-div' | 'word-problems-easy' | 'word-problems-medium' | 'word-problems-hard' | 'word-problems-veryhard'
  rounds: number
  gameType: 'multiplication' | 'addition' | 'subtraction' | 'equations' | 'division' | 'wordProblems'
}

interface WordProblem {
  problem: string
  equation: string
  answer: number
  operation: 'addition' | 'multiplication' | 'subtraction' | 'division'
}

interface Fact {
  a: number
  b: number
}

export default function Play() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const locale = (params.locale as string) || 'fi'

  // Game configuration state
  const [settings, setSettings] = useState<GameSettings>({ alias: 'Guest', range: '2-12', rounds: 10, gameType: 'multiplication' })
  const [roundNo, setRoundNo] = useState(1)

  // Question data and progress
  const [facts, setFacts] = useState<Fact[]>([])
  const [equationFacts, setEquationFacts] = useState<EquationFact[]>([])
  const [wordProblems, setWordProblems] = useState<WordProblem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [factsReady, setFactsReady] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // User input and feedback
  const [userInput, setUserInput] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [hint, setHint] = useState<string>('')
  const [currentHints, setCurrentHints] = useState(0)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingHint, setIsLoadingHint] = useState(false)
  const [showEmptyHint, setShowEmptyHint] = useState(false)
  const [showKeypad, setShowKeypad] = useState(true)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null)

  const handleQuit = () => {
    router.push(`/${locale}/menu`)
  }

  // Helper function to generate and cache word problems
  const generateAndCacheWordProblems = async (locale: string, range: string): Promise<WordProblem[]> => {
    const operations: ('addition' | 'subtraction' | 'multiplication' | 'division')[] =
      ['addition', 'subtraction', 'multiplication', 'division']
    const problems: WordProblem[] = []

    for (let i = 0; i < 10; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)]
      try {
        const response = await fetch('/api/wordproblems/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, operation, range })
        })

        if (response.ok) {
          const data = await response.json()
          problems.push({ ...data, operation })
        }
      } catch (error) {
        console.error('Error generating word problem', i, error)
      }
    }

    if (problems.length > 0) {
      const cacheKey = `nutti.wordproblems.${locale}.${range}`
      localStorage.setItem(cacheKey, JSON.stringify(problems))

    }

    return problems
  }

  // Performance tracking
  const questionStartTime = useRef<number>(performance.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const isGeneratingRef = useRef<boolean>(false)

  useEffect(() => {
    // Prevent running multiple times
    if (isLoaded) return
    if (isGeneratingRef.current) return

    // Reset hint counter when component mounts or facts change
    setCurrentHints(0)

    // Optimized initialization - no heavy computation
    const savedSettings: GameSettings = JSON.parse(
      localStorage.getItem('nutti.settings') ||
      '{"alias":"Guest","range":"2-12","rounds":10,"gameType":"multiplication"}'
    )
    const savedRoundNo = Number(localStorage.getItem('nutti.roundNo') || '1')

    // Repair mismatched settings (e.g. if gameType is multiplication but range is equations)
    if (savedSettings.range.startsWith('equations-') && savedSettings.gameType !== 'equations') {
      savedSettings.gameType = 'equations'
      localStorage.setItem('nutti.settings', JSON.stringify(savedSettings))
    } else if (savedSettings.range.startsWith('word-problems-') && savedSettings.gameType !== 'wordProblems') {
      savedSettings.gameType = 'wordProblems'
      localStorage.setItem('nutti.settings', JSON.stringify(savedSettings))
    }

    if (savedSettings.gameType === 'equations') {
      // Generate equation facts directly

      const difficulty = savedSettings.range === 'equations-easy' ? 'easy' :
        savedSettings.range === 'equations-medium' ? 'medium' :
          savedSettings.range === 'equations-hard' ? 'hard' :
            savedSettings.range === 'equations-veryhard' ? 'veryhard' : 'easy'

      const eqFacts = generateEquationFacts(difficulty, 10)

      setEquationFacts(eqFacts)
      setFacts([]) // Clear regular facts
      setFactsReady(true)

    } else if (savedSettings.gameType === 'wordProblems') {
      // Use cached word problems or generate new ones


      // Prevent duplicate generation
      if (isGeneratingRef.current) {

        return
      }

      isGeneratingRef.current = true
      setFactsReady(false)

      const cacheKey = `nutti.wordproblems.${locale}.${savedSettings.range}`

      // Try to use cached problems first
      const cachedProblems = localStorage.getItem(cacheKey)

      if (cachedProblems) {

        const problems = JSON.parse(cachedProblems)
        setWordProblems(problems)
        setFacts([])
        setEquationFacts([])
        setFactsReady(true)
        isGeneratingRef.current = false

        // Start timer
        setTimeout(() => {
          questionStartTime.current = performance.now()
        }, 100)

        // Pre-fetch next set for THIS SPECIFIC difficulty in background

        setTimeout(() => {
          generateAndCacheWordProblems(locale, savedSettings.range)
        }, 1000) // Small delay to not interfere with game start
      } else {
        // No cache, generate now

        generateAndCacheWordProblems(locale, savedSettings.range).then(problems => {
          if (problems && problems.length > 0) {
            setWordProblems(problems)
            setFacts([])
            setEquationFacts([])
            setFactsReady(true)
            setTimeout(() => {
              questionStartTime.current = performance.now()
            }, 100)
          }
        }).finally(() => {
          isGeneratingRef.current = false
        })
      }
    } else {
      // Check if facts are already precomputed
      const precomputedKey = `nutti.facts.${savedRoundNo}.${savedSettings.range}`
      let roundFacts: Fact[] = JSON.parse(localStorage.getItem(precomputedKey) || 'null')

      if (!roundFacts) {
        // Compute only if no cache exists
        roundFacts = pickFacts(factPool(savedSettings.range, savedSettings.gameType || 'multiplication'), 10)
        localStorage.setItem(precomputedKey, JSON.stringify(roundFacts))
      }

      setFacts(roundFacts)
      setEquationFacts([]) // Clear equation facts
      setFactsReady(true)

    }

    setSettings(savedSettings)
    setRoundNo(savedRoundNo)
    setIsLoaded(true)
    document.body.tabIndex = -1
    document.body.focus()
    // Focus input field when game starts
    setTimeout(() => inputRef.current?.focus(), 200)

  }, [isLoaded])

  const currentQuestion = facts[currentQuestionIndex]
  const currentEquation = equationFacts[currentQuestionIndex]
  const currentWordProblem = wordProblems[currentQuestionIndex]
  const isEquationMode = settings.gameType === 'equations'
  const isWordProblemMode = settings.gameType === 'wordProblems'
  const totalQuestions = isEquationMode ? equationFacts.length : isWordProblemMode ? wordProblems.length : facts.length



  // Separate effect for keyboard listener to avoid dependency issues
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' && !isSubmitting && totalQuestions > 0 && currentQuestionIndex < totalQuestions) {
        e.preventDefault()
        requestHint()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, totalQuestions, currentQuestionIndex])

  /**
   * Submit the current answer and move to next question
   */
  const submitAnswer = () => {
    if ((!currentQuestion && !currentEquation && !currentWordProblem) || isSubmitting) return

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

    let correctAnswer: number
    let a: number, b: number

    if (isWordProblemMode && currentWordProblem) {
      correctAnswer = currentWordProblem.answer
      // For word problems, we'll use dummy values for a and b in storage
      a = correctAnswer
      b = 0
    } else if (isEquationMode && currentEquation) {
      correctAnswer = getEquationAnswer(currentEquation)
      a = currentEquation.a
      b = currentEquation.b
    } else if (currentQuestion) {
      correctAnswer = settings.gameType === 'addition'
        ? currentQuestion.a + currentQuestion.b
        : settings.gameType === 'subtraction'
          ? currentQuestion.a - currentQuestion.b
          : settings.gameType === 'division'
            ? currentQuestion.a / currentQuestion.b
            : currentQuestion.a * currentQuestion.b
      a = currentQuestion.a
      b = currentQuestion.b
    } else {
      setIsSubmitting(false)
      return
    }

    const isCorrect = userAnswer === correctAnswer

    const answerEntry: Answer = {
      a: a,
      b: b,
      ms: timeSpentMs,
      correct: correctAnswer,
      child: userAnswer,
      isCorrect,
      hintsUsed: currentHints,
      // Add word problem data if applicable
      ...(isWordProblemMode && currentWordProblem ? {
        problem: currentWordProblem.problem,
        equation: currentWordProblem.equation
      } : {})
    }

    const operation = isEquationMode ? 'equation' : settings.gameType === 'addition' ? '+' : settings.gameType === 'subtraction' ? '−' : settings.gameType === 'division' ? '÷' : 'x'


    // Update state and prepare for next question
    const updatedAnswers = [...answers, answerEntry]
    setAnswers(updatedAnswers)

    // Show visual feedback
    setFeedbackType(isCorrect ? 'correct' : 'incorrect')
    setShowFeedback(true)

    // Wait for feedback animation, then proceed
    setTimeout(() => {
      setShowFeedback(false)
      setFeedbackType(null)

      // Check if round is complete
      if (currentQuestionIndex + 1 >= totalQuestions) {
        saveRoundAndNavigate(updatedAnswers)
      } else {
        moveToNextQuestion()
      }
    }, 150)


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


    // Always go to break page after completing a round
    router.push(`/${locale}/break`)
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
    if ((!currentQuestion && !currentEquation && !currentWordProblem) || isLoadingHint) return

    setIsLoadingHint(true)
    try {
      let requestBody: any

      if (isWordProblemMode && currentWordProblem) {
        // For word problems, send problem text and equation
        requestBody = {
          problem: currentWordProblem.problem,
          equation: currentWordProblem.equation,
          answer: currentWordProblem.answer,
          locale,
          gameType: 'wordProblems'
        }
      } else if (isEquationMode && currentEquation) {
        // For equations, send the equation info
        requestBody = {
          equation: formatEquation(currentEquation),
          variableIcon: currentEquation.variableIcon,
          answer: getEquationAnswer(currentEquation),
          locale,
          gameType: 'equations'
        }
      } else if (currentQuestion) {
        // For regular math problems
        requestBody = {
          ...currentQuestion,
          locale,
          gameType: settings.gameType
        }
      } else {
        setIsLoadingHint(false)
        return
      }

      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { hint } = await response.json()
      setHint(hint)
      setCurrentHints(prev => prev + 1)

      if (isEquationMode && currentEquation) {

      } else if (currentQuestion) {
        const operation = settings.gameType === 'addition' ? '+' : settings.gameType === 'division' ? '÷' : 'x'

      }
    } catch (error) {
      console.error('Error fetching hint:', error)
      setHint(t('play.hintError'))
    } finally {
      setIsLoadingHint(false)
    }
  }

  // Show loading screen if facts are not ready
  if (!isLoaded || !factsReady || totalQuestions === 0) {
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

  // Check if we have a valid question/equation/word problem for the current mode
  if (isWordProblemMode && !currentWordProblem) {
    return <div className="card text-center"><p>{t('play.noTasks')}</p></div>
  }

  if (isEquationMode && !currentEquation) {
    return <div className="card text-center"><p>{t('play.noTasks')}</p></div>
  }

  if (!isEquationMode && !isWordProblemMode && !currentQuestion) {
    return <div className="card text-center"><p>{t('play.noTasks')}</p></div>
  }



  return (
    <div className="h-full bg-gradient-to-br from-blue-50/40 via-white to-nutti-primary/10 py-4 overflow-hidden">
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
            <div className="w-1/3"><Progress value={(currentQuestionIndex / totalQuestions) * 100} /></div>
          </div>

          {/* Main game area - flexible grid layout */}
          <div className={`flex-1 transition-all duration-500 ${showKeypad ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 items-start' : 'max-w-2xl mx-auto w-full space-y-4'}`}>

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
                <div className="text-4xl mb-3">{isWordProblemMode ? '📝' : t('icons.calculator')}</div>
                {isWordProblemMode && currentWordProblem ? (
                  <div className="text-lg lg:text-xl font-semibold text-gray-800 leading-relaxed px-2">
                    {currentWordProblem.problem}
                  </div>
                ) : isEquationMode && currentEquation ? (
                  <>
                    <div className={`${showKeypad ? 'text-xl lg:text-3xl' : 'text-4xl lg:text-6xl'} font-black tracking-tight text-nutti-primary select-none mb-3 drop-shadow-sm`}>
                      {formatEquation(currentEquation)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {t('play.equationHint')}
                    </div>
                  </>
                ) : currentQuestion ? (
                  <div className="text-6xl lg:text-7xl font-black tracking-tight text-nutti-primary select-none mb-3 drop-shadow-sm">
                    {currentQuestion.a} {settings.gameType === 'addition' ? '+' : settings.gameType === 'subtraction' ? '−' : settings.gameType === 'division' ? '÷' : '×'} {currentQuestion.b}
                  </div>
                ) : null}
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
                {/* Fixed space for feedback and hint messages */}
                <div className="h-8 mt-3 flex justify-center items-center">
                  {showFeedback && feedbackType ? (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${feedbackType === 'correct'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                      <span className="text-2xl">
                        {feedbackType === 'correct' ? '✓' : '✗'}
                      </span>
                      <span className="font-semibold text-sm">
                        {feedbackType === 'correct' ? t('play.correct') : t('play.incorrect')}
                      </span>
                    </div>
                  ) : showEmptyHint ? (
                    <p className="text-sm text-red-600 animate-pulse">
                      {t('icons.pointingDown')} {t('play.enterAnswerHint')}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right column: Keypad and hints */}
            {showKeypad && (
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
                    {showKeypad ? `🔽 ${t('common.hide')}` : `🔼 ${t('common.show')}`}
                  </button>
                </div>

                <div className={`transition-all duration-300 space-y-3 ${isSubmitting ? 'opacity-30 pointer-events-none' : 'opacity-75 hover:opacity-100'}`}>
                  <Keypad
                    value={userInput}
                    onChange={setUserInput}
                    onSubmit={submitAnswer}
                    onHint={requestHint}
                    inputRef={inputRef}
                  />

                  {/* Hint section under keypad */}
                  {isLoadingHint ? (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-sm text-blue-800 font-semibold">{t('play.loadingHint')}</span>
                      </div>
                    </div>
                  ) : hint ? (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 text-center">
                      <div className="text-lg mb-1">{t('icons.lightbulb')}</div>
                      <p className="text-sm text-green-800 font-semibold">
                        {hint}
                      </p>
                    </div>
                  ) : null}

                  {/* Instructions - compact */}
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-center opacity-60">
                    <span className="text-base">{t('icons.keyboard')}</span>
                    <p className="text-xs text-slate-500 font-medium mt-1">{t('home.kb')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Compact hint and controls when keypad is hidden */}
            {!showKeypad && (
              <div className="space-y-2">
                {/* Compact hint section */}
                {isLoadingHint ? (
                  <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-xs text-blue-800 font-medium">{t('play.loadingHint')}</span>
                    </div>
                  </div>
                ) : hint ? (
                  <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center">
                    <div className="text-lg mb-1">{t('icons.lightbulb')}</div>
                    <p className="text-sm text-green-800 font-medium">
                      {hint}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 text-center">
                    <p className="text-xs text-yellow-800 mb-2">
                      💡 {t('play.hintPrompt')}
                    </p>
                    <button
                      onClick={requestHint}
                      disabled={isSubmitting || isLoadingHint}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${isSubmitting || isLoadingHint
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white'
                        }`}
                    >
                      💡 {t('play.hint')}
                    </button>
                  </div>
                )}

                {/* Small toggle keypad link */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowKeypad(true)
                      setTimeout(() => inputRef.current?.focus(), 50)
                    }}
                    className="text-xs text-gray-400 hover:text-nutti-primary transition-colors underline"
                  >
                    ↩️ {t('keypad.title')}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
