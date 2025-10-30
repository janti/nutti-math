'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface MathStoryProps {
  onStoryComplete: () => void
}

export default function MathStory({ onStoryComplete }: MathStoryProps) {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string || 'fi'
  
  const [currentPage, setCurrentPage] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const storyPages = [
    {
      title: t('story.pages.1.title'),
      text: t('story.pages.1.text'),
      image: "🐿️🌳"
    },
    {
      title: t('story.pages.2.title'),
      text: t('story.pages.2.text'),
      image: "🍂🥜"
    },
    {
      title: t('story.pages.3.title'),
      text: t('story.pages.3.text'),
      image: "👵🐿️"
    },
    {
      title: t('story.pages.4.title'),
      text: t('story.pages.4.text'),
      image: "✨🧮"
    },
    {
      title: t('story.pages.5.title'),
      text: t('story.pages.5.text'),
      image: "🎯🥜"
    }
  ]

  // Load mute preference from localStorage
  useEffect(() => {
    const savedMuteState = localStorage.getItem('nutti-story-muted')
    if (savedMuteState) {
      setIsMuted(JSON.parse(savedMuteState))
    }
  }, [])

  // Speech synthesis functions
  const speakText = (text: string, title: string) => {
    if (isMuted || !('speechSynthesis' in window)) return

    // Stop any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance()
    
    // Configure voice based on locale
    const getVoiceSettings = () => {
      switch (locale) {
        case 'en':
          return { lang: 'en-US', rate: 0.9, pitch: 1.2 }
        case 'sv':
          return { lang: 'sv-SE', rate: 0.9, pitch: 1.2 }
        default:
          return { lang: 'fi-FI', rate: 0.9, pitch: 1.2 }
      }
    }

    const voiceSettings = getVoiceSettings()
    
    // Combine title and text for better flow
    const fullText = `${title}. ${text}`
    
    utterance.text = fullText
    utterance.lang = voiceSettings.lang
    utterance.rate = voiceSettings.rate // Slightly slower for story-telling
    utterance.pitch = voiceSettings.pitch // Higher pitch for friendly squirrel voice
    utterance.volume = 0.8

    utterance.onstart = () => setIsReading(true)
    utterance.onend = () => setIsReading(false)
    utterance.onerror = () => setIsReading(false)

    speechRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsReading(false)
  }

  const stopReading = stopSpeaking

  const toggleMute = () => {
    const newMuteState = !isMuted
    setIsMuted(newMuteState)
    localStorage.setItem('nutti-story-muted', JSON.stringify(newMuteState))
    
    if (newMuteState) {
      stopSpeaking()
    }
  }

  // Auto-read when page changes (if not muted)
  useEffect(() => {
    if (!isMuted && storyPages[currentPage]) {
      // Small delay to let the page render
      setTimeout(() => {
        speakText(storyPages[currentPage].text, storyPages[currentPage].title)
      }, 500)
    }
  }, [currentPage, isMuted])

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  const nextPage = () => {
    stopSpeaking() // Stop current speech before moving
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      onStoryComplete()
    }
  }

  const prevPage = () => {
    stopSpeaking() // Stop current speech before moving
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const skipStory = () => {
    stopSpeaking()
    onStoryComplete()
  }

  const currentStory = storyPages[currentPage]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Top controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Mute/Unmute button */}
          <button 
            onClick={toggleMute}
            className={`p-2 rounded-lg text-sm transition-colors ${
              isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={isMuted ? t('story.mute') : t('story.unmute')}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          {/* Stop reading button (shown when reading) */}
          {isReading && (
            <button 
              onClick={stopSpeaking}
              className="p-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg text-sm transition-colors"
              title={t('story.stopReading')}
            >
              ⏸️
            </button>
          )}

          {/* Skip button */}
          <button 
            onClick={skipStory}
            className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1"
          >
            {t('story.skip')} ⏭️
          </button>
        </div>

        {/* Story content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{currentStory.image}</div>
          <h2 className="text-2xl font-bold text-nutti-teal mb-4">{currentStory.title}</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {currentStory.text}
          </p>
          
          {/* Read aloud button */}
          {!isMuted && 'speechSynthesis' in window && (
            <button
              onClick={() => speakText(currentStory.text, currentStory.title)}
              disabled={isReading}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                isReading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isReading ? t('story.reading') : t('story.readAgain')}
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center mb-6">
          {storyPages.map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                index === currentPage ? 'bg-nutti-orange' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button 
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentPage === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ⬅️ {t('story.previous')}
          </button>

          <span className="text-sm text-gray-500">
            {t('story.page')} {currentPage + 1} / {storyPages.length}
          </span>

          <button 
            onClick={nextPage}
            className="px-6 py-3 bg-gradient-to-r from-nutti-teal to-cyan-500 text-white font-semibold rounded-lg hover:from-nutti-teal/90 hover:to-cyan-500/90 transition-all"
          >
            {currentPage === storyPages.length - 1 ? `${t('story.start')} 🚀` : `${t('story.next')} ➡️`}
          </button>
        </div>

        {/* Fun facts */}
        {currentPage === 2 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
            <p className="text-sm text-amber-800">
              💡 {t('story.funFacts.page3')}
            </p>
          </div>
        )}

        {currentPage === 4 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <p className="text-sm text-green-800">
              🎮 {t('story.funFacts.page5')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}