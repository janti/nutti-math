import { GameStorage, GameResult } from '@/lib/storage'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

interface TeacherViewProps {
  onClose: () => void
}

export default function TeacherView({ onClose }: TeacherViewProps) {
  const t = useTranslations()
  const [selectedNickname, setSelectedNickname] = useState<string>('')
  const [nicknames, setNicknames] = useState<string[]>([])
  const [results, setResults] = useState<GameResult[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const allNicknames = GameStorage.getNicknames()
    setNicknames(allNicknames)
    
    if (selectedNickname) {
      const userResults = GameStorage.getResultsByNickname(selectedNickname)
      setResults(userResults.sort((a, b) => b.timestamp - a.timestamp))
      const userStats = GameStorage.getStats(selectedNickname)
      console.log('User stats for', selectedNickname, ':', userStats)
      console.log('User results:', userResults.map(r => ({
        nickname: r.nickname, 
        timeSpent: r.timeSpent, 
        hintsUsed: r.hintsUsed,
        questions: r.totalQuestions
      })))
      setStats(userStats)
    } else {
      setResults([])
      const allStats = GameStorage.getStats()
      console.log('All stats:', allStats)
      const allResults = GameStorage.getAllResults()
      console.log('All results:', allResults.map(r => ({
        nickname: r.nickname, 
        timeSpent: r.timeSpent, 
        hintsUsed: r.hintsUsed,
        questions: r.totalQuestions
      })))
      setStats(allStats)
    }
  }, [selectedNickname])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fi-FI')
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) {
      return '0:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const exportData = () => {
    const data = GameStorage.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutti-math-results-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (confirm(t('teacher.clearConfirm'))) {
      GameStorage.clearAllData()
      setNicknames([])
      setResults([])
      setStats(null)
      setSelectedNickname('')
    }
  }



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-blue-50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-800">👨‍🏫 {t('teacher.title')}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('teacher.selectStudent')}</label>
              <select 
                value={selectedNickname}
                onChange={(e) => setSelectedNickname(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">{t('teacher.allStudents')}</option>
                {nicknames.map(nickname => (
                  <option key={nickname} value={nickname}>{nickname}</option>
                ))}
              </select>
            </div>

            {stats && (
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <h3 className="font-semibold mb-3">
                  {selectedNickname ? t('teacher.studentStats', { student: selectedNickname }) : t('teacher.allStudentsStats')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>🎮 {t('teacher.games')}: <strong>{stats.totalGames}</strong></div>
                  <div>❓ {t('teacher.questions')}: <strong>{stats.totalQuestions}</strong></div>
                  <div>✅ {t('teacher.correct')}: <strong>{stats.totalCorrect}</strong></div>
                  <div>❌ {t('teacher.wrong')}: <strong>{stats.totalWrong}</strong></div>
                  <div>🎯 {t('teacher.accuracy')}: <strong>{stats.averageAccuracy.toFixed(1)}%</strong></div>
                  <div>💡 {t('teacher.hints')}: <strong>{stats.totalHints}</strong></div>
                  <div>⏱️ {t('teacher.averageTime')}: <strong>{formatTime(stats.averageTime)}/{t('teacher.perGame')}</strong></div>
                  <div>⏰ {t('teacher.time')}: <strong>{formatTime(stats.totalTime)}</strong></div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button 
                onClick={exportData}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                📥 {t('teacher.exportData')}
              </button>
              <button 
                onClick={clearData}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                🗑️ {t('teacher.clearAll')}
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {results.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <div className="mb-4">
                  {selectedNickname 
                    ? `${t('teacher.noResults')} ${selectedNickname}`
                    : nicknames.length === 0 
                      ? t('teacher.noGamesYet')
                      : t('teacher.selectToView')
                  }
                </div>
                {nicknames.length === 0 && (
                  <div className="text-sm text-gray-400">
                    {t('teacher.resultsWillShow')}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {selectedNickname ? t('teacher.studentHistory', { student: selectedNickname }) : t('teacher.allGames')}
                </h3>
                
                {results.map((result) => (
                  <div key={result.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{result.nickname}</h4>
                        <p className="text-sm text-gray-600">{formatDate(result.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {result.correctAnswers}/{result.totalQuestions}
                        </div>
                        <div className="text-sm text-gray-600">
                          {((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{t('teacher.difficulty')}:</span>
                        <div className="font-medium">{result.range}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('teacher.time')}:</span>
                        <div className="font-medium">{formatTime(result.timeSpent)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('teacher.hints')}:</span>
                        <div className="font-medium">{result.hintsUsed}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('teacher.speed')}:</span>
                        <div className="font-medium">
                          {(result.timeSpent / result.totalQuestions).toFixed(1)}s/{t('teacher.perQuestion')}
                        </div>
                      </div>
                    </div>

                    {/* Round breakdown - only show if more than 1 round */}
                    {result.totalRounds > 1 && result.roundResults && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-sm mb-2">
                          {t('teacher.roundBreakdown')} ({t('teacher.totalRounds', { count: result.totalRounds })})
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          {result.roundResults.map((round, index) => (
                            <div key={index} className="bg-white p-2 rounded border">
                              <div className="font-medium text-blue-600">
                                {t('teacher.roundNumber', { number: round.roundNo })}
                              </div>
                              <div className="text-xs text-gray-600">
                                {t('teacher.roundStats', {
                                  correct: round.correctInRound,
                                  total: round.questionsInRound,
                                  time: round.timeSpentInRound.toFixed(1),
                                  hints: round.hintsInRound
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed facts */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        {t('teacher.showDetails')}
                      </summary>
                      <div className="mt-2">
                        {/* Group facts by rounds if round info is available */}
                        {result.totalRounds > 1 && result.facts.some(f => f.roundNo) ? (
                          (() => {
                            // Group facts by round number
                            const factsByRound = result.facts.reduce((groups, fact) => {
                              const roundKey = fact.roundNo || 1;
                              if (!groups[roundKey]) groups[roundKey] = [];
                              groups[roundKey].push(fact);
                              return groups;
                            }, {} as Record<number, typeof result.facts>);

                            return Object.entries(factsByRound)
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .map(([roundNo, facts]) => (
                                <div key={roundNo} className="mb-4">
                                  <h6 className="font-semibold text-sm mb-2 text-blue-700">
                                    {t('teacher.roundNumber', { number: roundNo })}
                                  </h6>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                                    {facts.map((fact, index) => (
                                      <div 
                                        key={index}
                                        className={`p-2 rounded ${
                                          fact.isCorrect ? 'bg-green-100' : 'bg-red-100'
                                        }`}
                                      >
                                        <div className="font-mono">
                                          {fact.a} × {fact.b} = {fact.userAnswer}
                                          {!fact.isCorrect && (
                                            <span className="text-red-600"> ({t('teacher.correct_answer')}: {fact.correctAnswer})</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          {fact.timeSpent.toFixed(1)}s
                                          {fact.hintsUsed > 0 && `, ${fact.hintsUsed} ${t('teacher.hint_count')}`}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ));
                          })()
                        ) : (
                          // Show all facts without round grouping for single round games
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                            {result.facts.map((fact, index) => (
                              <div 
                                key={index}
                                className={`p-2 rounded ${
                                  fact.isCorrect ? 'bg-green-100' : 'bg-red-100'
                                }`}
                              >
                                <div className="font-mono">
                                  {fact.a} × {fact.b} = {fact.userAnswer}
                                  {!fact.isCorrect && (
                                    <span className="text-red-600"> ({t('teacher.correct_answer')}: {fact.correctAnswer})</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {fact.timeSpent.toFixed(1)}s
                                  {fact.hintsUsed > 0 && `, ${fact.hintsUsed} ${t('teacher.hint_count')}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}