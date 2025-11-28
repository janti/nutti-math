'use client'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import NuttiBadge from '@/components/NuttiBadge'
import TeacherView from '@/components/TeacherView'
import MathStory from '@/components/MathStory'

export default function LandingPage() {
  const t = useTranslations('landing')
  const tHome = useTranslations('home') // Reuse readStory from home or add to landing
  const locale = useLocale()
  const [showTeacherView, setShowTeacherView] = useState(false)
  const [showStory, setShowStory] = useState(false)

  const handleStoryComplete = () => {
    // Stop any playing audio elements
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    setShowStory(false)
  }

  return (
    <div className="h-[750px] bg-gradient-to-br from-nutti-secondary via-white to-blue-50/40 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 text-center space-y-8">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <NuttiBadge />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-nutti-primary to-nutti-accent">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 font-medium leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href={`/${locale}/menu`}
            className="inline-block bg-gradient-to-r from-nutti-primary to-blue-500 text-white text-2xl font-bold px-12 py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ring-4 ring-transparent hover:ring-nutti-primary/20"
          >
            {t('cta')} 🚀
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 text-sm text-gray-500">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🎯</span>
            <span>{t('feature1')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🐿️</span>
            <span>{t('feature2')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🏆</span>
            <span>{t('feature3')}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => setShowStory(true)}
            className="text-sm text-nutti-accent hover:text-blue-700 transition-colors flex items-center justify-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100"
          >
            <span>📖</span>
            {tHome('readStory')}
          </button>

          <button
            onClick={() => setShowTeacherView(true)}
            className="text-sm text-slate-400 hover:text-nutti-primary transition-colors flex items-center justify-center gap-2"
          >
            <span>👨‍🏫</span>
            {t('teacherView')}
          </button>
        </div>
      </div>

      {/* Teacher View Modal */}
      {showTeacherView && (
        <TeacherView onClose={() => setShowTeacherView(false)} />
      )}

      {/* Story Modal */}
      {showStory && (
        <MathStory onStoryComplete={handleStoryComplete} />
      )}
    </div>
  )
}
