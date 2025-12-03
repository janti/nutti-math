'use client'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import NuttiBadge from '@/components/NuttiBadge'
import TeacherView from '@/components/TeacherView'
import MathStory from '@/components/MathStory'
import nuttiTauluImage from '@/assets/nutti_taulu.png'
import nuttiIsoImage from '@/assets/nutti_iso.png'

export default function LandingPage() {
  const t = useTranslations('landing')
  const tHome = useTranslations('home') // Reuse readStory from home or add to landing
  const tHelp = useTranslations('help')
  const tFeatures = useTranslations('features')
  const locale = useLocale()
  const [showTeacherView, setShowTeacherView] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

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
    <div className="h-[850px] bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-32 right-16 w-12 h-12 bg-pink-200 rounded-full opacity-30 animate-bounce delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-10 h-10 bg-green-200 rounded-full opacity-25 animate-pulse delay-2000"></div>
      
      <div className="max-w-4xl mx-auto h-full px-4">
        <div className="h-full flex flex-col py-4">
          {/* Header Section */}
          <div className="text-center mb-2">
            <div className="mb-3">
              <NuttiBadge />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-nutti-primary via-purple-600 to-pink-500 mb-3">
              {t('title')}
            </h1>
            <p className="text-base md:text-lg text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>      <div className="container mx-auto px-4 py-4 h-full flex flex-col">

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 items-center mb-8 flex-1">
          {/* Left - Nutti Iso */}
          <div className="lg:col-span-1 flex justify-center order-1 lg:order-none">
            <div className="relative transform hover:scale-105 transition-transform duration-500">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-2xl blur opacity-20 animate-pulse"></div>
              <Image
                src={nuttiIsoImage}
                alt="Nutti Squirrel character"
                width={200}
                height={240}
                className="relative rounded-xl shadow-lg"
                priority
                sizes="(max-width: 768px) 60vw, (max-width: 1200px) 25vw, 20vw"
              />
            </div>
          </div>

          {/* Center - Features & CTA */}
          <div className="lg:col-span-1 space-y-8 lg:space-y-6 order-3 lg:order-none">
            {/* Main CTA */}
            <div className="text-center">
              <Link
                href={`/${locale}/menu`}
                className="group inline-flex items-center justify-center bg-gradient-to-r from-nutti-primary via-blue-500 to-purple-600 text-white text-lg md:text-xl font-bold px-6 md:px-8 py-4 md:py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="mr-2 text-xl">🎮</span>
                {t('cta')}
                <span className="ml-2 group-hover:animate-bounce text-xl">🚀</span>
              </Link>
            </div>

            {/* Enhanced Features */}
            <div className="space-y-4 lg:space-y-3">
              <div className="group p-4 lg:p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:scale-105 border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:animate-bounce">🎯</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{t('feature1')}</h3>
                    <p className="text-xs text-gray-600">{tFeatures('multiplication')}</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-4 lg:p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:scale-105 border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:animate-bounce">🐿️</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{t('feature2')}</h3>
                    <p className="text-xs text-gray-600">{tFeatures('interactive')}</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-4 lg:p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 hover:scale-105 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:animate-bounce">🏆</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{t('feature3')}</h3>
                    <p className="text-xs text-gray-600">{tFeatures('tracking')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Nutti Taulu */}
          <div className="lg:col-span-1 flex justify-center order-2 lg:order-none">
            <div className="relative transform hover:scale-105 transition-transform duration-500">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl blur opacity-20 animate-pulse delay-1000"></div>
              <Image
                src={nuttiTauluImage}
                alt="Nutti with multiplication table"
                width={240}
                height={200}
                className="relative rounded-xl shadow-lg"
                priority
                sizes="(max-width: 768px) 60vw, (max-width: 1200px) 25vw, 20vw"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pb-6 lg:pb-4">
          <button
            onClick={() => setShowStory(true)}
            className="group bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 hover:text-purple-800 px-4 py-3 rounded-xl border border-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-lg group-hover:animate-spin">📚</span>
            <div className="text-left">
              <div className="font-bold text-sm">{tHome('readStory')}</div>
              <div className="text-xs opacity-75">{tFeatures('storyDescription')}</div>
            </div>
          </button>

          <button
            onClick={() => setShowTeacherView(true)}
            className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 hover:text-gray-800 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-lg group-hover:animate-bounce">👨‍🏫</span>
            <div className="text-left">
              <div className="font-bold text-sm">{t('teacherView')}</div>
              <div className="text-xs opacity-75">{tFeatures('teacherDescription')}</div>
            </div>
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="group bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-800 px-4 py-3 rounded-xl border border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-lg group-hover:animate-pulse">⌨️</span>
            <div className="text-left">
              <div className="font-bold text-sm">{t('help')}</div>
              <div className="text-xs opacity-75">{tFeatures('helpDescription')}</div>
            </div>
          </button>
        </div>
        </div>
      </div>
    </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                  <span className="text-2xl">⌨️</span>
                  {tHelp('title')}
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">0-9</span>
                  <span>{tHelp('numbers')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">Enter</span>
                  <span>{tHelp('enter')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">Backspace</span>
                  <span>{tHelp('backspace')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">H</span>
                  <span>{tHelp('hint')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">Esc</span>
                  <span>{tHelp('escape')}</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  💡 <strong>{tHelp('tipTitle')}</strong> {tHelp('tipText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
