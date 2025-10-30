'use client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import NuttiBadge from '@/components/NuttiBadge'
import TeacherView from '@/components/TeacherView'
import MathStory from '@/components/MathStory'

// TypeScript interfaces
interface GameSettings {
  alias: string
  range: '1-5' | '1-10' | '6-10' | '2-12' | 'mix'
  rounds: 1 | 2 | 3 | 5 | 10
}

export default function HomePage() {
  const t = useTranslations()
  const router = useRouter()
  
  // Game configuration state
  const [alias, setAlias] = useState('')
  const [range, setRange] = useState<GameSettings['range']>('1-5')
  const [rounds, setRounds] = useState<GameSettings['rounds']>(1)
  
  // UI state for modals
  const [showTeacherView, setShowTeacherView] = useState(false)
  const [showStory, setShowStory] = useState(false)

  /**
   * Check if the math story should be shown on first visit
   */
  useEffect(() => {
    const storyShown = localStorage.getItem('nutti-story-shown')
    if (!storyShown) {
      setShowStory(true)
    }
  }, [])

  /**
   * Handle story completion and mark it as shown
   */
  const handleStoryComplete = () => {
    localStorage.setItem('nutti-story-shown', 'true')
    setShowStory(false)
  }
  
  /**
   * Clear localStorage and start a new game with current settings
   */
  const startNewGame = () => {
    const currentLocale = window.location.pathname.split('/')[1] || 'fi'
    
    clearPreviousGameData()
    saveGameSettings()
    precomputeFirstRoundFacts()
    
    console.log('Home: Started new game:', rounds, 'rounds,', range, 'multiplication tables')
    router.push(`/${currentLocale}/play`)
  }

  /**
   * Clear all game-specific localStorage data from previous sessions
   */
  const clearPreviousGameData = () => {
    // Remove round tracking data
    localStorage.removeItem('nutti.last-round')
    localStorage.removeItem('nutti.all-rounds')
    localStorage.removeItem('nutti.roundNo')
    
    // Clear cached facts and game save markers
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('nutti.facts.') || key.startsWith('nutti.game-saved.')) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * Save current game settings to localStorage
   */
  const saveGameSettings = () => {
    const gameSettings: GameSettings = { alias, range, rounds }
    localStorage.setItem('nutti.settings', JSON.stringify(gameSettings))
    localStorage.setItem('nutti.roundNo', '1')
  }

  /**
   * Precompute first round facts for better game performance
   */
  const precomputeFirstRoundFacts = () => {
    import('@/lib/game').then(({ factPool, pickFacts }) => {
      const firstFacts = pickFacts(factPool(range), 10)
      localStorage.setItem(`nutti.facts.1.${range}`, JSON.stringify(firstFacts))
      console.log('Home: Precomputed round 1 facts')
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-nutti-beige/30 via-white to-cyan-50/40 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Main content card with background */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 space-y-4">
          {/* Header - compact */}
          <div className="text-center mb-1">
            <div className="text-xl mb-0.5">{t('icons.gameTitle')}</div>
            <NuttiBadge />
          </div>
          
          {/* Main content - normal grid without flex-1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left column: Title and alias */}
        <div className="space-y-3">
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-nutti-teal/30 p-4">
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">{t('icons.gameInfo')}</div>
              <h1 className="text-2xl font-extrabold mb-3 text-nutti-teal">{t('home.heading')}</h1>
              <p className="text-base text-nutti-orange font-semibold bg-white/70 rounded-xl p-3 border border-nutti-beige">
                {t('home.gameInfo', {rounds})}
              </p>
            </div>

            {/* Alias input */}
            <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-nutti-orange/30">
              <div className="text-center mb-3">
                <span className="text-xl">{t('icons.alias')}</span>
                <span className="text-base font-bold text-orange-700 ml-2">{t('home.alias')}</span>
              </div>
              <input 
                value={alias} 
                onChange={e => setAlias(e.target.value.slice(0, 16))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && alias.trim()) {
                    startNewGame()
                  }
                }}
                className="w-full rounded-lg border border-nutti-beige p-3 text-xl text-center font-semibold bg-white/90 focus:ring-2 focus:ring-nutti-orange/30 focus:border-nutti-orange transition-all" 
                placeholder={t('alias.placeholder') as string}
              />
            </div>
          </div>
        </div>
        
        {/* Right column: Settings */}
        <div className="space-y-3">
          {/* Rounds selection */}
          <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4">
            <div className="text-center mb-3">
              <span className="text-xl">{t('icons.rounds')}</span>
              <span className="text-base font-bold text-green-700 ml-2">{t('home.rounds')}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 5, 10].map(n => (
                <button 
                  key={n}
                  onClick={() => setRounds(n as GameSettings['rounds'])} 
                  className={`py-3 text-base font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${
                    rounds === n
                      ? 'bg-gradient-to-r from-green-200 to-emerald-200 border-green-400 text-green-700 shadow-lg' 
                      : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-green-50'
                  }`}
                >
                  {t(`icons.roundNumbers.${n}`)} {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty selection */}
          <div className="card bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-4">
            <div className="text-center mb-3">
              <span className="text-xl">{t('icons.difficulty')}</span>
              <span className="text-base font-bold text-red-700 ml-2">{t('home.difficulty')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setRange('1-5')} 
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${
                  range === '1-5'
                    ? 'bg-gradient-to-r from-nutti-beige to-yellow-200 border-nutti-orange text-nutti-orange shadow-lg' 
                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-beige/50'
                }`}
              >
                🧸 1-5
              </button>
              <button 
                onClick={() => setRange('6-10')} 
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${
                  range === '6-10'
                    ? 'bg-gradient-to-r from-nutti-beige to-yellow-200 border-nutti-orange text-nutti-orange shadow-lg' 
                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-beige/50'
                }`}
              >
                {t('icons.difficulty6to10')} 6-10
              </button>
              <button 
                onClick={() => setRange('1-10')} 
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${
                  range === '1-10'
                    ? 'bg-gradient-to-r from-nutti-beige to-yellow-200 border-nutti-orange text-nutti-orange shadow-lg' 
                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-beige/50'
                }`}
              >
                � 1-10
              </button>
              <button 
                onClick={()=>setRange('2-12')} 
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${
                  range==='2-12'
                    ? 'bg-gradient-to-r from-nutti-beige to-yellow-200 border-nutti-orange text-nutti-orange shadow-lg' 
                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-beige/50'
                }`}
              >
                {t('icons.difficulty2to12')} 2-12
              </button>
              <button 
                onClick={()=>setRange('mix')} 
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 col-span-2 ${
                  range==='mix'
                    ? 'bg-gradient-to-r from-nutti-beige to-yellow-200 border-nutti-orange text-nutti-orange shadow-lg' 
                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-beige/50'
                }`}
              >
                {t('icons.difficultyMix')} {t('home.mix')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom section - better visual separation */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="space-y-4">
          {/* Start button with better visual hierarchy */}
          <div className="text-center">
            <button 
              className={`text-xl px-12 py-4 font-bold rounded-xl shadow-lg transform transition-all ${
                alias.trim() 
                  ? 'bg-gradient-to-r from-nutti-teal to-cyan-500 text-white hover:from-nutti-teal/90 hover:to-cyan-500/90 hover:scale-105 focus:ring-4 focus:ring-nutti-teal/30' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!alias.trim()} 
              onClick={startNewGame}
            >
              {t('icons.start')} {t('home.start')}
            </button>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 text-center">
            <span className="text-base">{t('icons.keyboard')}</span>
            {alias.trim() ? (
              <p className="text-sm text-nutti-teal font-bold mt-2 animate-pulse">{t('home.kbStart')}</p>
            ) : (
              <p className="text-sm text-slate-600 font-medium mt-2">{t('home.kb')}</p>
            )}
          </div>

          {/* Additional buttons */}
          <div className="text-center space-y-2">
            <div>
              <button 
                onClick={() => setShowStory(true)}
                className="text-sm px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors mr-2"
              >
                📖 {t('home.readStory')}
              </button>
              <button 
                onClick={() => setShowTeacherView(true)}
                className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              >
                👨‍🏫 {t('home.teacherView')}
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Story Modal */}
      {showStory && (
        <MathStory onStoryComplete={handleStoryComplete} />
      )}

      {/* Teacher View Modal */}
      {showTeacherView && (
        <TeacherView onClose={() => setShowTeacherView(false)} />
      )}
    </div>
  )
}
