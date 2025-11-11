'use client'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import NuttiBadge from '@/components/NuttiBadge'
import TeacherView from '@/components/TeacherView'
import MathStory from '@/components/MathStory'

interface GameMode {
  id: string
  name: string
  description: string
  icon: string
  route: string
  difficulty: 'easy' | 'medium' | 'hard'
  available: boolean
}

export default function HomePage() {
  const params = useParams()
  const t = useTranslations()
  const router = useRouter()
  const locale = params.locale as string || 'fi'
  
  // UI state for modals
  const [showTeacherView, setShowTeacherView] = useState(false)
  const [showStory, setShowStory] = useState(false)

  const gameModes: GameMode[] = [
    {
      id: 'multiplication',
      name: t('gameModes.multiplication.name'),
      description: t('gameModes.multiplication.description'),
      icon: '✖️',
      route: '/multiplication',
      difficulty: 'medium',
      available: true
    },
    {
      id: 'addition',
      name: t('gameModes.addition.name'),
      description: t('gameModes.addition.description'),
      icon: '➕',
      route: '/addition',
      difficulty: 'easy',
      available: false
    },
    {
      id: 'subtraction',
      name: t('gameModes.subtraction.name'),
      description: t('gameModes.subtraction.description'),
      icon: '➖',
      route: '/subtraction',
      difficulty: 'easy',
      available: false
    },
    {
      id: 'division',
      name: t('gameModes.division.name'),
      description: t('gameModes.division.description'),
      icon: '➗',
      route: '/division',
      difficulty: 'hard',
      available: false
    },
    {
      id: 'equations',
      name: t('gameModes.equations.name'),
      description: t('gameModes.equations.description'),
      icon: '🔢',
      route: '/equations',
      difficulty: 'hard',
      available: false
    },
    {
      id: 'wordProblems',
      name: t('gameModes.wordProblems.name'),
      description: t('gameModes.wordProblems.description'),
      icon: '📝',
      route: '/word-problems',
      difficulty: 'hard',
      available: false
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 border-green-300 text-green-800'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'hard': return 'bg-red-100 border-red-300 text-red-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const selectGameMode = (mode: GameMode) => {
    if (!mode.available) {
      return // Ei tee mitään jos peli ei ole saatavilla
    }
    
    router.push(`/${locale}${mode.route}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutti-beige/30 via-white to-cyan-50/40 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">{t('icons.gameTitle')}</div>
          <NuttiBadge />
          <h1 className="text-3xl font-extrabold mb-2 text-nutti-teal">{t('app.title')}</h1>
          <p className="text-lg text-gray-600">{t('home.subtitle')}</p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              className={`relative bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-200 ${
                mode.available 
                  ? 'hover:shadow-xl hover:scale-105 cursor-pointer border-nutti-teal/30' 
                  : 'opacity-60 border-gray-200'
              }`}
              onClick={() => selectGameMode(mode)}
            >
              {/* Difficulty Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(mode.difficulty)}`}>
                  {t(`difficulty.${mode.difficulty}`)}
                </span>
              </div>

              {/* Icon */}
              <div className="text-4xl mb-3 text-center">{mode.icon}</div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
                {mode.name}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-center text-sm mb-4">
                {mode.description}
              </p>
              
              {/* Action Button */}
              <div className="text-center">
                {mode.available ? (
                  <span className="inline-block px-4 py-2 bg-nutti-teal text-white rounded-lg font-semibold">
                    {t('home.startGame')}
                  </span>
                ) : (
                  <span className="inline-block px-4 py-2 bg-gray-300 text-gray-500 rounded-lg">
                    {t('home.comingSoon')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional buttons */}
        <div className="text-center space-x-4">
          <button 
            onClick={() => setShowStory(true)}
            className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
          >
            📖 {t('home.readStory')}
          </button>
          <button 
            onClick={() => setShowTeacherView(true)}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
          >
            👨‍🏫 {t('home.teacherView')}
          </button>
        </div>
      </div>

      {/* Story Modal */}
      {showStory && (
        <MathStory onStoryComplete={() => setShowStory(false)} />
      )}

      {/* Teacher View Modal */}
      {showTeacherView && (
        <TeacherView onClose={() => setShowTeacherView(false)} />
      )}
    </div>
  )
}
