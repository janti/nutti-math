'use client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import NuttiBadge from '@/components/NuttiBadge'

// TypeScript interfaces
interface GameSettings {
    alias: string
    range: '1-5' | '1-10' | '6-10' | '1-12' | '2-12' | 'mix' | '1-10-add' | '1-20-add' | '1-50-add' | '50-100-add' | '1-100-add' | 'mix-add' | '1-10-sub' | '1-20-sub' | '1-50-sub' | '50-100-sub' | '1-100-sub' | 'mix-sub' | 'equations-easy' | 'equations-medium' | 'equations-hard' | '1-5-div' | '1-10-div' | '1-12-div' | 'mix-div'
    rounds: 1 | 2 | 3 | 5 | 10
    gameType: 'multiplication' | 'addition' | 'subtraction' | 'equations' | 'division'
}

export default function MenuPage() {
    const t = useTranslations()
    const router = useRouter()

    // Game configuration state
    const [alias, setAlias] = useState('')
    const [range, setRange] = useState<GameSettings['range']>('1-10')
    const [rounds, setRounds] = useState<GameSettings['rounds']>(1)
    const [topic, setTopic] = useState('multiplication')
    const [gameType, setGameType] = useState<'multiplication' | 'addition' | 'subtraction' | 'equations' | 'division'>('multiplication')

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
        const gameSettings: GameSettings = { alias, range, rounds, gameType }
        console.log('Saving game settings:', gameSettings)
        localStorage.setItem('nutti.settings', JSON.stringify(gameSettings))
        localStorage.setItem('nutti.roundNo', '1')
    }

    /**
     * Precompute first round facts for better game performance
     */
    const precomputeFirstRoundFacts = () => {
        if (gameType === 'equations') {
            // Don't precompute for equations as they are generated dynamically
            console.log('Skipping precompute for equations gameType')
            return
        }
        import('@/lib/game').then(({ factPool, pickFacts }) => {
            const firstFacts = pickFacts(factPool(range, gameType), 10)
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
        { id: 'division', icon: '➗', label: 'division', enabled: true },
        { id: 'addition', icon: '➕', label: 'addition', enabled: true },
        { id: 'subtraction', icon: '➖', label: 'subtraction', enabled: true },
        { id: 'wordProblems', icon: '📝', label: 'wordProblems', enabled: false },
        { id: 'equations', icon: '📐', label: 'equations', enabled: true },
    ]

    // Update gameType and reset range when topic changes
    const handleTopicChange = (topicId: string) => {
        console.log('Topic changed to:', topicId)
        setTopic(topicId)
        if (topicId === 'addition') {
            setGameType('addition')
            setRange('1-100-add')
        } else if (topicId === 'subtraction') {
            setGameType('subtraction')
            setRange('1-100-sub')
        } else if (topicId === 'multiplication') {
            setGameType('multiplication')
            setRange('1-10')
        } else if (topicId === 'equations') {
            setGameType('equations')
            setRange('equations-easy')
            console.log('Set equations gameType and range to equations-easy')
        } else if (topicId === 'division') {
            setGameType('division')
            setRange('1-5-div')
            console.log('Set division gameType and range to 1-5-div')
        }
    }

    return (
        <div className="h-[850px] bg-gradient-to-br from-nutti-secondary/30 via-white to-blue-50/40 overflow-hidden flex items-start justify-center py-2">
            <div className="max-w-4xl mx-auto w-full px-4 h-full flex flex-col">
                {/* Main content card with background */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 flex-1 overflow-y-auto flex flex-col">
                    {/* Header - full width */}
                    <div className="text-center mb-2 relative flex-shrink-0">
                        <NuttiBadge />
                        <button
                            onClick={() => {
                                const currentLocale = window.location.pathname.split('/')[1] || 'fi'
                                router.push(`/${currentLocale}`)
                            }}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-nutti-primary bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <span>←</span>
                            <span>{t('menu.backToStart')}</span>
                        </button>
                    </div>

                    {/* Main content area - takes available space */}
                    <div className="flex-1 flex flex-col">
                        {/* Content section */}
                        <div className="flex-1">
                            {/* Two column layout for main content */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-3 mt-4">

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
                                    {gameType === 'multiplication' ? (
                                        <>
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
                                        </>
                                    ) : gameType === 'addition' ? (
                                        <>
                                            <button
                                                onClick={() => setRange('1-10-add')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-10-add'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                🧸 1-10
                                            </button>
                                            <button
                                                onClick={() => setRange('1-20-add')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-20-add'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-20
                                            </button>
                                            <button
                                                onClick={() => setRange('1-50-add')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-50-add'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-50
                                            </button>
                                            <button
                                                onClick={() => setRange('50-100-add')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '50-100-add'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                50-100
                                            </button>
                                            <button
                                                onClick={() => setRange('1-100-add')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-100-add'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-100
                                            </button>
                                            <button
                                                onClick={() => setRange('mix-add')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === 'mix-add'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                {t('icons.difficultyMix')} {t('home.mix')}
                                            </button>
                                        </>
                                    ) : gameType === 'subtraction' ? (
                                        <>
                                            <button
                                                onClick={() => setRange('1-10-sub')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-10-sub'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                🧸 1-10
                                            </button>
                                            <button
                                                onClick={() => setRange('1-20-sub')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-20-sub'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-20
                                            </button>
                                            <button
                                                onClick={() => setRange('1-50-sub')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-50-sub'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-50
                                            </button>
                                            <button
                                                onClick={() => setRange('50-100-sub')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '50-100-sub'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                50-100
                                            </button>
                                            <button
                                                onClick={() => setRange('1-100-sub')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-100-sub'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-100
                                            </button>
                                            <button
                                                onClick={() => setRange('mix-sub')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === 'mix-sub'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                {t('icons.difficultyMix')} {t('home.mix')}
                                            </button>
                                        </>
                                    ) : gameType === 'equations' ? (
                                        <>
                                            <button
                                                onClick={() => setRange('equations-easy')}
                                                className={`py-2 px-4 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === 'equations-easy'
                                                    ? 'bg-gradient-to-r from-green-200 to-emerald-200 border-green-400 text-green-700 shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-green-50'
                                                    }`}
                                            >
                                                🍎 {t('difficulty.easy')}
                                            </button>
                                            <button
                                                onClick={() => setRange('equations-medium')}
                                                className={`py-2 px-4 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === 'equations-medium'
                                                    ? 'bg-gradient-to-r from-yellow-200 to-orange-200 border-yellow-400 text-yellow-700 shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-yellow-50'
                                                    }`}
                                            >
                                                🍊 {t('difficulty.medium')}
                                            </button>
                                            <button
                                                onClick={() => setRange('equations-hard')}
                                                className={`py-2 px-4 text-sm font-bold rounded-lg border-2 transition-all transform hover:scale-105 w-full ${range === 'equations-hard'
                                                    ? 'bg-gradient-to-r from-red-200 to-pink-200 border-red-400 text-red-700 shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-red-50'
                                                    }`}
                                            >
                                                🍓 {t('difficulty.hard')}
                                            </button>
                                        </>
                                    ) : gameType === 'division' ? (
                                        <>
                                            <button
                                                onClick={() => setRange('1-5-div')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-5-div'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                🧸 1-5
                                            </button>
                                            <button
                                                onClick={() => setRange('1-10-div')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-10-div'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-10
                                            </button>
                                            <button
                                                onClick={() => setRange('1-12-div')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === '1-12-div'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                1-12
                                            </button>
                                            <button
                                                onClick={() => setRange('mix-div')}
                                                className={`py-2 text-xs font-bold rounded-lg border-2 transition-all transform hover:scale-105 ${range === 'mix-div'
                                                    ? 'bg-gradient-to-r from-nutti-secondary to-blue-200 border-nutti-accent text-nutti-accent shadow-lg'
                                                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-nutti-secondary/50'
                                                    }`}
                                            >
                                                {t('icons.difficultyMix')} {t('home.mix')}
                                            </button>
                                        </>
                                    ) : null}
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
                                    onClick={() => tItem.enabled && handleTopicChange(tItem.id)}
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
                            </div>
                        </div>
                        
                        {/* Start button at bottom - flex-shrink-0 keeps it at bottom */}
                        <div className="flex-shrink-0 border-t border-gray-100 pt-4 pb-4 lg:pb-2">
                            <div className="text-center">
                                <button
                                    className={`text-base lg:text-lg px-6 lg:px-8 py-3 font-bold rounded-xl shadow-lg transform transition-all w-full max-w-xs mx-auto ${
                                        alias.trim()
                                            ? 'bg-gradient-to-r from-nutti-primary to-blue-500 text-white hover:from-nutti-primary/90 hover:to-blue-500/90 hover:scale-105 focus:ring-4 focus:ring-nutti-primary/30'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={!alias.trim()}
                                    onClick={startNewGame}
                                >
                                    {t('icons.start')} {t('home.start')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      
    )
}
