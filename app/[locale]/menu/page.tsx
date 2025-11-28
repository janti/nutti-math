'use client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import NuttiBadge from '@/components/NuttiBadge'

// TypeScript interfaces
interface GameSettings {
    alias: string
    range: '1-5' | '1-10' | '6-10' | '1-12' | '2-12' | 'mix'
    rounds: 1 | 2 | 3 | 5 | 10
}

export default function MenuPage() {
    const t = useTranslations()
    const router = useRouter()

    // Game configuration state
    const [alias, setAlias] = useState('')
    const [range, setRange] = useState<GameSettings['range']>('1-10')
    const [rounds, setRounds] = useState<GameSettings['rounds']>(1)
    const [topic, setTopic] = useState('multiplication')

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

    /**
     * Cleanup effect to ensure all audio is stopped when leaving the page
     */
    useEffect(() => {
        return () => {
            // Stop any playing audio when component unmounts
            const audioElements = document.querySelectorAll('audio')
            audioElements.forEach(audio => {
                if (!audio.paused) {
                    audio.pause()
                    audio.currentTime = 0
                }
            })
        }
    }, [])

    const topics = [
        { id: 'multiplication', icon: '✖️', label: 'multiplication', enabled: true },
        { id: 'division', icon: '➗', label: 'division', enabled: false },
        { id: 'addition', icon: '➕', label: 'addition', enabled: false },
        { id: 'subtraction', icon: '➖', label: 'subtraction', enabled: false },
        { id: 'wordProblems', icon: '📝', label: 'wordProblems', enabled: false },
        { id: 'equations', icon: '📐', label: 'equations', enabled: false },
    ]

    return (
        <div className="h-[750px] bg-gradient-to-br from-nutti-secondary/30 via-white to-blue-50/40 overflow-hidden flex items-start justify-center py-2">
            <div className="max-w-4xl mx-auto w-full px-4">
                {/* Main content card with background */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 max-h-[98vh] overflow-y-auto">
                    {/* Header - compact */}
                    <div className="text-center">
                        <NuttiBadge />
                    </div>

                    {/* Main content - grid with top alignment and spacing */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">

                        {/* Left column: Title and alias */}
                        <div className="flex flex-col gap-3 h-full">
                            <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-nutti-primary/30 p-4 h-full flex flex-col justify-between">
                                <div className="text-center mb-2">
                                    <div className="text-xl mb-1">{t('icons.gameInfo')}</div>
                                    <h1 className="text-xl font-extrabold mb-2 text-nutti-primary">{t('home.heading')}</h1>
                                    <p className="text-sm text-nutti-accent font-semibold bg-white/70 rounded-xl p-2 border border-nutti-secondary">
                                        {t('home.gameInfo', { rounds })}
                                    </p>
                                </div>

                                {/* Alias input */}
                                <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-nutti-accent/30">
                                    <div className="text-center mb-2">
                                        <span className="text-lg">{t('icons.alias')}</span>
                                        <span className="text-sm font-bold text-nutti-accent ml-2">{t('home.alias')}</span>
                                    </div>
                                    <input
                                        value={alias}
                                        onChange={e => setAlias(e.target.value.slice(0, 16))}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && alias.trim()) {
                                                startNewGame()
                                            }
                                        }}
                                        className="w-full rounded-lg border border-nutti-secondary p-2 text-lg text-center font-semibold bg-white/90 focus:ring-2 focus:ring-nutti-accent/30 focus:border-nutti-accent transition-all"
                                        placeholder={t('alias.placeholder') as string}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right column: Settings */}
                        <div className="flex flex-col gap-3">
                            {/* Rounds selection */}
                            <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-3">
                                <div className="text-center mb-2">
                                    <span className="text-lg">{t('icons.rounds')}</span>
                                    <span className="text-sm font-bold text-green-700 ml-2">{t('home.rounds')}</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 5, 10].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setRounds(n as GameSettings['rounds'])}
                                            className={`py-2 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${rounds === n
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
                            <div className="card bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-3">
                                <div className="text-center mb-2">
                                    <span className="text-lg">{t('icons.difficulty')}</span>
                                    <span className="text-sm font-bold text-red-700 ml-2">{t('home.difficulty')}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setRange('1-5')}
                                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-5'
                                            ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                            : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                            }`}
                                    >
                                        🧸 1-5
                                    </button>
                                    <button
                                        onClick={() => setRange('1-10')}
                                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-10'
                                            ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                            : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                            }`}
                                    >
                                        1-10
                                    </button>
                                    <button
                                        onClick={() => setRange('6-10')}
                                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '6-10'
                                            ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                            : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                            }`}
                                    >
                                        {t('icons.difficulty6to10')} 6-10
                                    </button>
                                    <button
                                        onClick={() => setRange('1-12')}
                                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-12'
                                            ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                            : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                            }`}
                                    >
                                        {t('icons.difficulty1to12')} 1-12
                                    </button>
                                    <button
                                        onClick={() => setRange('2-12')}
                                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '2-12'
                                            ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                            : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                            }`}
                                    >
                                        {t('icons.difficulty2to12')} 2-12
                                    </button>
                                    <button
                                        onClick={() => setRange('mix')}
                                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === 'mix'
                                            ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                            : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                            }`}
                                    >
                                        {t('icons.difficultyMix')} {t('home.mix')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Topic Selection - Full Width */}
                    <div className="card bg-gradient-to-br from-purple-50 to-fuchsia-50 border-2 border-purple-200 p-3 mt-3">
                        <div className="text-center mb-2">
                            <span className="text-lg">📚</span>
                            <span className="text-sm font-bold text-purple-700 ml-2">{t('home.topic')}</span>
                        </div>
                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                            {topics.map((tItem) => (
                                <button
                                    key={tItem.id}
                                    onClick={() => tItem.enabled && setTopic(tItem.id)}
                                    disabled={!tItem.enabled}
                                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${topic === tItem.id
                                        ? 'bg-purple-100 border-purple-400 text-purple-800 shadow-md'
                                        : tItem.enabled
                                            ? 'bg-white border-gray-200 text-gray-700 hover:bg-purple-50'
                                            : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="text-lg">{tItem.icon}</span>
                                    <span className="text-xs font-medium">{t(`topics.${tItem.label}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom section - better visual separation */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="space-y-1.5">
                            {/* Start button with better visual hierarchy */}
                            <div className="text-center">
                                <button
                                    className={`text-lg px-8 py-3 font-bold rounded-xl shadow-lg transform transition-all ${alias.trim()
                                        ? 'bg-gradient-to-r from-nutti-primary to-blue-500 text-white hover:from-nutti-primary/90 hover:to-blue-500/90 hover:scale-105 focus:ring-4 focus:ring-nutti-primary/30'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    disabled={!alias.trim()}
                                    onClick={startNewGame}
                                >
                                    {t('icons.start')} {t('home.start')}
                                </button>
                            </div>

                            {/* Instructions */}
                            <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 text-center">
                                <span className="text-sm">{t('icons.keyboard')}</span>
                                {alias.trim() ? (
                                    <p className="text-xs text-nutti-primary font-bold mt-1 animate-pulse">{t('home.kbStart')}</p>
                                ) : (
                                    <p className="text-xs text-slate-600 font-medium mt-1">{t('home.kb')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
