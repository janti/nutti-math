'use client'
import { useTranslations } from 'next-intl'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import NuttiBadge from '@/components/NuttiBadge'
import { GameStorage, GameResult, FactResult } from '@/lib/storage'
import AcornDisplay from '@/components/AcornDisplay'
import { calculateAcorns, calculateTotalAcorns } from '@/lib/game'

// TypeScript interfaces
interface GameSummary {
  total: number
  correct: number
  timeMs: number
}

interface Answer {
  a: number
  b: number
  ms: number
  isCorrect: boolean
  hintsUsed?: number // Add hints field
}

interface Round {
  roundNo: number
  answers: Answer[]
  alias: string
}

interface FinalAI {
  text: string
}

export default function Results() {
  const t = useTranslations()
  const params = useParams()
  const loc = params.locale as string || 'fi'

  // State management with proper TypeScript types
  const [summary, setSummary] = useState<GameSummary>({ total: 0, correct: 0, timeMs: 0 })
  const [rounds, setRounds] = useState<Round[]>([])
  const [finalAi, setFinalAi] = useState<FinalAI | null>(null)
  const [finalAiLoading, setFinalAiLoading] = useState(false)
  const [finalAiRequested, setFinalAiRequested] = useState(false)
  const finalAiRequestedRef = useRef(false)

  useEffect(() => {
    // Reset states on mount to prevent duplicates
    setFinalAi(null)
    setFinalAiLoading(false)
    setFinalAiRequested(false)

    const last: Round | null = JSON.parse(localStorage.getItem('nutti.last-round') || 'null')
    const prev: Round[] = JSON.parse(localStorage.getItem('nutti.all-rounds') || '[]')

    // Ensure that the last round is saved
    let allRounds: Round[] = prev
    if (last) {
      const alreadyExists = prev.some((round: Round) =>
        round.roundNo === last.roundNo &&
        round.answers?.length === last.answers?.length
      )

      if (!alreadyExists) {
        allRounds = [...prev, last]
        localStorage.setItem('nutti.all-rounds', JSON.stringify(allRounds))
        console.log('Results: Saved last round', last.roundNo, 'to localStorage. Total rounds:', allRounds.length)
      } else {
        console.log('Results: Last round', last.roundNo, 'was already saved')
      }
    }

    console.log('Results: Loaded total', allRounds.length, 'rounds:', allRounds.map((r: Round) => `Round ${r.roundNo}`).join(', '))

    setRounds(allRounds)

    // Calculate overall game statistics
    const allAnswers = allRounds.flatMap((r: Round) => r.answers || [])
    const total = allAnswers.length
    const correct = allAnswers.filter((a: Answer) => a.isCorrect).length
    const timeMs = allAnswers.reduce((sum: number, a: Answer) => sum + a.ms, 0)
    setSummary({ total, correct, timeMs })

    // Get final AI feedback
    const getAiFeedback = async () => {
      if (finalAiRequestedRef.current) {
        console.log('Final AI already requested')
        return
      }

      finalAiRequestedRef.current = true
      setFinalAiLoading(true)

      try {
        console.log('Requesting final AI feedback for rounds:', allRounds.length)
        const response = await fetch('/api/ai/final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rounds: allRounds,
            locale: loc
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Final AI response received:', data)
        setFinalAi(data)
      } catch (error) {
        console.error('Error getting final AI feedback:', error)
      } finally {
        setFinalAiLoading(false)
      }
    }

    // Only request AI feedback if we have valid data
    if (total > 0) {
      // Add delay to ensure all states are properly set
      setTimeout(() => {
        getAiFeedback()
      }, 500)
    }

    // Save game results to localStorage for teacher view (only once per unique game)
    if (total > 0 && allRounds.length > 0) {
      const settings = JSON.parse(localStorage.getItem('nutti.settings') || '{}')

      // Create a unique game identifier based on game content
      const gameIdentifier = `${allRounds[0]?.alias || t('common.unknown')}-${total}-${correct}-${Math.round(summary.timeMs)}-${allRounds.length}`
      const alreadySaved = localStorage.getItem(`nutti.game-saved.${gameIdentifier}`)

      if (!alreadySaved) {
        // Count hints used from all answers
        const totalHints = allRounds.reduce((sum: number, round: Round) =>
          sum + (round.answers?.reduce((roundSum: number, answer: Answer) =>
            roundSum + ((answer as any).hintsUsed || 0), 0) || 0), 0)

        // Create FactResults from all answers with round numbers
        const facts: FactResult[] = allRounds.flatMap((round: Round) =>
          round.answers?.map((answer: Answer) => ({
            a: answer.a,
            b: answer.b,
            userAnswer: (answer as any).child || 0, // Get user's actual answer
            correctAnswer: answer.a * answer.b,
            isCorrect: answer.isCorrect,
            timeSpent: answer.ms / 1000,
            hintsUsed: (answer as any).hintsUsed || 0, // Get actual hints used
            roundNo: round.roundNo // Add round number to each fact
          })) || []
        )

        // Calculate round-by-round results
        const roundResults = allRounds.map((round: Round) => ({
          roundNo: round.roundNo,
          questionsInRound: round.answers?.length || 0,
          correctInRound: round.answers?.filter((a: Answer) => a.isCorrect).length || 0,
          timeSpentInRound: (round.answers?.reduce((sum: number, a: Answer) => sum + a.ms, 0) || 0) / 1000,
          hintsInRound: round.answers?.reduce((sum: number, a: Answer) => sum + ((a as any).hintsUsed || 0), 0) || 0,
          acornsInRound: calculateAcorns(
            round.answers?.filter((a: Answer) => a.isCorrect).length || 0,
            round.answers?.length || 0,
            Math.round((round.answers?.reduce((sum: number, a: Answer) => sum + a.ms, 0) || 0) / Math.max(1, round.answers?.length || 1))
          )
        }))

        // Calculate total acorns from round results (ensures consistency)
        const totalAcorns = roundResults.reduce((sum: number, round: any) => sum + round.acornsInRound, 0)

        const gameResult: GameResult = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          nickname: allRounds[0]?.alias || t('common.unknown'),
          timestamp: Date.now(),
          range: settings.range || '1-5',
          totalQuestions: total,
          correctAnswers: correct,
          wrongAnswers: total - correct,
          hintsUsed: totalHints,
          timeSpent: timeMs / 1000,
          totalRounds: allRounds.length,
          totalAcorns: totalAcorns,
          facts: facts,
          roundResults: roundResults
        }

        console.log('Saving game result (first time):', gameResult)
        console.log('Time calculation: timeMs =', timeMs, 'seconds =', timeMs / 1000)
        console.log('Total hints calculated:', totalHints)
        console.log('All answers with time and hints:', allAnswers.map(a => ({
          problem: `${a.a}×${a.b}`,
          timeMs: a.ms,
          hints: (a as any).hintsUsed || 0
        })))
        GameStorage.saveResult(gameResult)

        // Mark this game as saved
        localStorage.setItem(`nutti.game-saved.${gameIdentifier}`, 'true')
      } else {
        console.log('Game already saved, skipping duplicate save')
      }
    }

    // Clean up localStorage when game is completed
    localStorage.removeItem('nutti.roundNo')
    localStorage.removeItem('nutti.last-round')
  }, [])
  const sec = (summary.timeMs / 1000).toFixed(1)
  const accuracy = summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0

  // Calculate total acorns from all rounds consistently
  const totalAcorns = rounds.reduce((sum: number, round: Round) => {
    const correct = round.answers.filter(a => a.isCorrect).length
    const total = round.answers.length
    const totalMs = round.answers.reduce((ms, a) => ms + a.ms, 0)
    const avgMs = Math.round(totalMs / total)
    return sum + calculateAcorns(correct, total, avgMs)
  }, 0)



  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl p-6">
        {/* Header */}
        <div className="text-center mb-2">
          <NuttiBadge mood="excited" />
        </div>

        {/* Main content - grid layout with less flex expansion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left column: Title and summary */}
          <div className="space-y-3">
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-nutti-primary/30 p-4">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{t('icons.party')}</div>
                <h2 className="text-4xl font-extrabold text-nutti-primary mb-2">{t('results.title')}</h2>
                <div className="text-3xl">{t('icons.sparkles')}</div>
              </div>

              {/* Summary text */}
              <div className="p-4 bg-white/70 rounded-xl border border-nutti-secondary text-center">
                <div className="text-2xl mb-2">{t('icons.medal')}</div>
                <p className="text-lg font-semibold text-nutti-accent">
                  {t('results.summary', { total: summary.total, correct: summary.correct, seconds: sec })}
                </p>
              </div>

              {/* AI Final Feedback - optimized for better text display */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl mt-4">
                <div className="text-center mb-3">
                  <span className="text-xl">{t('icons.squirrel')}</span>
                  <span className="text-lg font-bold text-green-700 ml-2">{t('results.finalFeedback')}</span>
                </div>
                <div className="bg-white/90 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                  {finalAiLoading ? (
                    <div className="text-center py-2">
                      <div className="animate-pulse text-green-600">
                        <div className="text-lg mb-1">{t('icons.hourglass')}</div>
                        <p className="text-sm">{t('results.generatingFinalFeedback')}</p>
                      </div>
                    </div>
                  ) : finalAi ? (
                    <div className="text-center w-full">
                      <p className="text-base sm:text-lg leading-relaxed text-gray-800 whitespace-pre-wrap break-words max-w-full font-medium">
                        {finalAi.text}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-1">
                      <p className="text-xs text-gray-500">{t('results.finalFeedbackSkipped')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Stats and round details */}
          <div className="space-y-3">
            {/* Stats cards - compact grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total questions */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-nutti-primary/30 text-center">
                <div className="text-2xl mb-1">{t('icons.books')}</div>
                <div className="text-2xl font-bold text-nutti-primary">{summary.total}</div>
                <div className="text-sm font-semibold text-nutti-primary">{t('results.tasks')}</div>
              </div>

              {/* Correct answers */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-300 text-center">
                <div className="text-2xl mb-1">{t('icons.checkmark')}</div>
                <div className="text-2xl font-bold text-green-600">{summary.correct}</div>
                <div className="text-sm font-semibold text-green-600">{t('results.correct')}</div>
              </div>

              {/* Accuracy percentage */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-300 text-center">
                <div className="text-2xl mb-1">{t('icons.bullseye')}</div>
                <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
                <div className="text-sm font-semibold text-purple-600">{t('results.accuracy')}</div>
              </div>

              {/* Acorns earned */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-300 text-center">
                <div className="text-2xl mb-1">🌰</div>
                <div className="text-2xl font-bold text-nutti-accent">{totalAcorns}</div>
                <div className="text-sm font-semibold text-nutti-accent">{t('acorns.acorns')}</div>
              </div>
            </div>

            {/* Acorn collection display */}
            <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
              <div className="text-center mb-3">
                <span className="text-xl">🌰</span>
                <span className="text-lg font-bold text-nutti-accent ml-2">{t('acorns.collection')}</span>
              </div>
              <div className="text-center">
                <AcornDisplay
                  acorns={totalAcorns}
                  maxAcorns={totalAcorns}
                  size="medium"
                  showEmptySlots={false}
                />
                <p className="text-sm text-nutti-accent mt-2">
                  {t('acorns.total', { total: totalAcorns, rounds: rounds.length })}
                </p>
              </div>
            </div>

            {/* Round details */}
            {rounds.length > 0 && (
              <div className="card p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200">
                <div className="text-center mb-3">
                  <span className="text-xl">{t('icons.chart')}</span>
                  <p className="text-lg font-bold text-indigo-700 inline ml-2">{t('results.roundDetails')}</p>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {rounds.map((round: any, index: number) => {
                    const roundCorrect = round.answers?.filter((a: any) => a.isCorrect).length || 0
                    const roundTotal = round.answers?.length || 0
                    const roundTimeMs = round.answers?.reduce((s: any, a: any) => s + a.ms, 0) || 0
                    const roundTimeSeconds = (roundTimeMs / 1000).toFixed(1)
                    const roundAccuracy = roundTotal > 0 ? Math.round((roundCorrect / roundTotal) * 100) : 0
                    return (
                      <div key={index} className="bg-white/80 rounded-lg p-2 flex justify-between items-center text-sm">
                        <span className="font-semibold text-indigo-600">{t('results.round', { number: round.roundNo })}</span>
                        <div className="flex gap-3 text-xs text-gray-600">
                          <span>{t('icons.checkmark')} {roundCorrect}/{roundTotal}</span>
                          <span>{t('icons.bullseye')} {roundAccuracy}%</span>
                          <span>{t('icons.timer')} {roundTimeSeconds}s</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons - better positioned */}
        <div className="flex flex-col items-center gap-4 mt-6 mb-8">
          <a
            className="btn text-xl px-10 py-4 bg-gradient-to-r from-nutti-primary to-blue-500 hover:from-nutti-primary/90 hover:to-blue-500/90 shadow-lg transform hover:scale-105 transition-all focus:ring-4 focus:ring-nutti-primary/30"
            href={`/${loc}`}
          >
            {t('icons.rocket')} {t('results.newGame')}
          </a>

        </div>
      </div>
    </div>
  )
}
