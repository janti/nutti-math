'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import NuttiBadge from '@/components/NuttiBadge'
import Progress from '@/components/Progress'
import { AcornReward } from '@/components/AcornDisplay'
import { calculateAcorns, calculateAcornsForEquations } from '@/lib/game'

// Types
interface RoundData {
  roundNo: number
  answers: Array<{
    a: number
    b: number
    ms: number
    isCorrect: boolean
  }>
  alias: string
  acorns?: number
}

interface GameSettings {
  rounds: number
  range: string
  gameType?: 'multiplication' | 'addition' | 'equations'
}

export default function Break() {
  const params = useParams()
  const loc = (params.locale as string) || 'fi'
  const t = useTranslations()

  // State management
  const [data, setData] = useState<RoundData | null>(null)
  const [previousRounds, setPreviousRounds] = useState<RoundData[]>([])
  const [ai, setAi] = useState<{ text: string; warmup: Array<{ a: number; b: number }> } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiRequested, setAiRequested] = useState(false)
  const aiRequestedRef = useRef(false)
  const [settings, setSettings] = useState<GameSettings>({ rounds: 10, range: '2-12' })
  useEffect(() => {
    console.log('Break useEffect running, aiRequested:', aiRequested)

    // Load data only once on mount
    if (data === null) {
      // Load data from localStorage
      const payload = JSON.parse(localStorage.getItem('nutti.last-round') || 'null')
      const prevRounds = JSON.parse(localStorage.getItem('nutti.all-rounds') || '[]')
      const gameSettings = JSON.parse(localStorage.getItem('nutti.settings') || '{"gameType":"multiplication","rounds":10}')
      const gameType = gameSettings.gameType || 'multiplication'

      setData(payload)
      setSettings(gameSettings)

      // Save round data to localStorage and combine for display
      let allRounds = prevRounds
      if (payload) {
        // Check if this round is not already saved
        const alreadyExists = prevRounds.some((round: RoundData) =>
          round.roundNo === payload.roundNo &&
          round.answers?.length === payload.answers?.length
        )

        if (!alreadyExists) {
          // Add acorn count to the payload before saving
          const roundWithAcorns = {
            ...payload,
            acorns: gameType === 'equations' ? calculateAcornsForEquations(
              payload.answers.filter((a: any) => a.isCorrect).length,
              payload.answers.length,
              Math.round(payload.answers.reduce((sum: number, answer: any) => sum + answer.ms, 0) / payload.answers.length)
            ) : calculateAcorns(
              payload.answers.filter((a: any) => a.isCorrect).length,
              payload.answers.length,
              Math.round(payload.answers.reduce((sum: number, answer: any) => sum + answer.ms, 0) / payload.answers.length)
            )
          }
          allRounds = [...prevRounds, roundWithAcorns]
          localStorage.setItem('nutti.all-rounds', JSON.stringify(allRounds))
          console.log('Break: Saved round', payload.roundNo, 'to localStorage with', roundWithAcorns.acorns, 'acorns. Total rounds:', allRounds.length)
        } else {
          console.log('Break: Round', payload.roundNo, 'was already saved')
        }
      }

      setPreviousRounds(allRounds)

      // Load AI feedback in background - doesn't block navigation, 10s timeout  
      if (payload && !aiRequestedRef.current) {
        console.log('Requesting AI feedback for round', payload.roundNo)

        aiRequestedRef.current = true
        setAiRequested(true)
        setAiLoading(true)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        fetch('/api/ai/feedback', {
          method: 'POST',
          body: JSON.stringify({
            answers: payload.answers.map((a: any) => ({
              a: a.a,
              b: a.b,
              isCorrect: a.isCorrect,
              ms: a.ms
            })),
            locale: loc
          }),
          signal: controller.signal
        })
          .then(r => r.json())
          .then(result => {
            clearTimeout(timeoutId)
            setAi(result)
            setAiLoading(false)
          })
          .catch(err => {
            clearTimeout(timeoutId)
            console.log('AI feedback skipped:', err.name === 'AbortError' ? 'timeout' : err.message)
            setAiLoading(false)
          })
      }
    }
  }, [])
  if (!data) return <p>—</p>

  // Get game settings for acorn calculation
  const gameSettings = JSON.parse(localStorage.getItem('nutti.settings') || '{"gameType":"multiplication"}')
  const gameType = gameSettings.gameType || 'multiplication'

  // Calculate round statistics
  const correct = data.answers.filter((a: any) => a.isCorrect).length
  const total = data.answers.length
  const totalMs = data.answers.reduce((sum: number, answer: any) => sum + answer.ms, 0)
  const avgMs = Math.round(totalMs / total)
  const avgSeconds = (avgMs / 1000).toFixed(1)
  const totalSeconds = (totalMs / 1000).toFixed(1)

  // Calculate acorns earned for this round
  const acornsEarned = gameType === 'equations' ? 
    calculateAcornsForEquations(correct, total, avgMs) : 
    calculateAcorns(correct, total, avgMs)
  return (
    <div className="h-[800px] bg-gradient-to-br from-green-50/40 via-white to-nutti-secondary/20 py-4 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 space-y-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <NuttiBadge mood="happy" />
            <div className="w-1/3"><Progress value={100} /></div>
          </div>

          {/* Main content - grid layout with less flex expansion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left column: Celebration and stats */}
            <div className="space-y-3">
              <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-nutti-accent/30 p-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{t('icons.breakCelebration')}</div>
                  <h2 className="text-3xl font-bold mb-2 text-nutti-accent">{t('break.done')}</h2>
                  <div className="text-2xl">{t('icons.star')}</div>
                </div>

                {/* Stats - compact */}
                <div className="bg-white/70 rounded-xl p-4 border border-nutti-secondary">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{t('icons.candy')}</div>
                    <p className="text-xl font-bold text-nutti-primary mb-2">
                      {t('break.correct', { correct, total })}
                    </p>
                    <div className="flex justify-center gap-2 text-sm flex-wrap">
                      <span className="bg-nutti-secondary px-2 py-1 rounded-full text-xs">
                        {t('icons.timer')} {t('break.average', { seconds: avgSeconds })}
                      </span>
                      <span className="bg-nutti-secondary px-2 py-1 rounded-full text-xs">
                        🕐 {t('break.total', { seconds: totalSeconds })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acorn reward display */}
                <AcornReward acorns={acornsEarned} t={t} />
              </div>
            </div>

            {/* Right column: Previous rounds and AI feedback */}
            <div className="space-y-3">
              {/* Previous rounds - compact */}
              {previousRounds.length > 0 ? (
                <div className="card p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 flex-1 flex flex-col">
                  <div className="text-center mb-3">
                    <span className="text-xl">{t('icons.trophy')}</span>
                    <p className="text-lg font-bold text-purple-700 inline ml-2">{t('break.allRounds')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-[100px] max-h-[250px] content-start">
                    {previousRounds.map((round: any, index: number) => {
                      const roundTimeMs = round.answers?.reduce((s: any, a: any) => s + a.ms, 0) || 0
                      const roundTimeSeconds = (roundTimeMs / 1000).toFixed(1)
                      return (
                        <div key={round.roundNo || index} className="bg-white/80 rounded-lg p-2 text-center text-sm shadow-sm">
                          <div className="text-base">{t('icons.cookie')}</div>
                          <p className="text-sm font-semibold text-purple-600">
                            {t('break.roundNumber', { round: round.roundNo })}
                          </p>
                          <p className="text-xs text-purple-500">{roundTimeSeconds}s</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {/* AI feedback - optimized for better text display */}
              <div className="card p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-nutti-primary/30">
                <div className="text-center mb-3">
                  <span className="text-2xl">{t('icons.squirrel')}</span>
                  <p className="text-lg font-bold text-nutti-primary inline ml-2">{t('break.nuttiSays')}</p>
                </div>
                <div className="bg-white/90 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
                  {aiLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-pulse text-nutti-primary">
                        <div className="text-2xl mb-2">{t('icons.hourglass')}</div>
                        <p className="text-sm">{t('break.generating')}</p>
                      </div>
                    </div>
                  ) : ai ? (
                    <div className="text-center w-full">
                      <p className="text-sm sm:text-base leading-relaxed text-gray-800 whitespace-pre-wrap break-words max-w-full">
                        {ai.text}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">{t('break.skipAiFeedback')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons - better positioned with more space */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 mb-6">
            {data && data.roundNo < settings.rounds ? (
              <a
                className="btn text-lg px-8 py-4 bg-gradient-to-r from-nutti-primary to-blue-500 hover:from-nutti-primary/90 hover:to-blue-500/90 shadow-lg transform hover:scale-105 transition-all w-full sm:w-auto"
                href={`/${loc}/play`}
                rel="prefetch"
                onClick={() => {
                  const currentRoundNo = Number(localStorage.getItem('nutti.roundNo') || '1');
                  const nextRound = currentRoundNo + 1;
                  localStorage.setItem('nutti.roundNo', String(nextRound));

                  // Precompute next round facts for optimization
                  const gameSettings = JSON.parse(localStorage.getItem('nutti.settings') || '{"range":"2-12"}')
                  const precomputeKey = `nutti.facts.${nextRound}.${gameSettings.range}`

                  // Only if not already computed
                  if (!localStorage.getItem(precomputeKey)) {
                    import('@/lib/game').then(({ factPool, pickFacts }) => {
                      const nextFacts = pickFacts(factPool(gameSettings.range as any, gameSettings.gameType || 'multiplication'), 10)
                      localStorage.setItem(precomputeKey, JSON.stringify(nextFacts))
                    })
                  }
                }}
              >
                {t('icons.rocket')} {t('break.continue')}
              </a>
            ) : null}
            <a
              className="px-8 py-4 text-lg rounded-lg border-2 border-nutti-accent text-nutti-accent font-semibold hover:bg-nutti-accent hover:text-white transition-all transform hover:scale-105 w-full sm:w-auto"
              href={`/${loc}/results`}
            >
              {t('icons.finish')} {data && data.roundNo >= settings.rounds ? t('break.gameComplete') : t('break.stop')}
            </a>

          </div>
        </div>
      </div>
    </div>
  )
}
