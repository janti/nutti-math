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
  const [isLoading, setIsLoading] = useState(false)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [autoReadDisabled, setAutoReadDisabled] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Function to make text more speech-friendly for Finnish
  const prepareFinnishText = (text: string): string => {
    if (locale !== 'fi') return text

    return text
      // Replace numbers with Finnish words
      .replace(/\b7\b/g, 'seitsemän')
      .replace(/\b8\b/g, 'kahdeksan')
      .replace(/\b56\b/g, 'viisikymmentäkuusi')
      // Make mathematical expressions more natural
      .replace(/7\s*×\s*8\s*=\s*56/g, 'seitsemän kertaa kahdeksan on viisikymmentäkuusi')
      .replace(/×/g, 'kertaa')
      .replace(/=/g, 'on')
      // Add natural pauses
      .replace(/\./g, '. ')
      .replace(/!/g, '! ')
      .replace(/\?/g, '? ')
  }

  // AI-powered Text-to-Speech functions
  const speakText = async (text: string, title: string) => {
    if (isMuted || !text || isLoading || isReading) {
      return
    }

    // Stop any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setIsLoading(true)
    setIsReading(true)

    try {
      // Only include title for the first page (page 0)
      const rawText = currentPage === 0 ? `${title}. ${text}` : text
      const processedText = prepareFinnishText(rawText)

      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: processedText,
          locale: locale
        }),
      })

      if (!response.ok) {
        throw new Error('TTS request failed')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      audioUrlRef.current = audioUrl

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsReading(false)
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current)
          audioUrlRef.current = null
        }
        audioRef.current = null
      }

      audio.onerror = () => {
        setIsReading(false)
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current)
          audioUrlRef.current = null
        }
        audioRef.current = null
        console.error('Audio playback failed')
      }

      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      setIsReading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const stopSpeaking = () => {
    // Cancel any pending auto-read timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    // Revoke object URL to prevent memory leaks
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }

    // Reset all states
    setIsReading(false)
    setIsLoading(false)
  }

  const stopReading = stopSpeaking

  const toggleMute = () => {
    setUserHasInteracted(true) // Mark user interaction
    const newMuteState = !isMuted
    setIsMuted(newMuteState)
    localStorage.setItem('nutti-story-muted', JSON.stringify(newMuteState))

    if (newMuteState) {
      stopSpeaking()
    }
  }

  // Auto-read when page changes (only after user interaction)
  useEffect(() => {
    // Clear any existing timeout first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Only auto-read if user has already interacted with the page and auto-read is not disabled
    if (!isMuted && storyPages[currentPage] && userHasInteracted && !autoReadDisabled) {
      // Delay to ensure previous audio is fully stopped and page is rendered
      timeoutRef.current = setTimeout(() => {
        // Only start if not currently playing and not muted and auto-read still enabled
        if (!isMuted && !isReading && !isLoading && timeoutRef.current && !autoReadDisabled) {
          speakText(storyPages[currentPage].text, storyPages[currentPage].title)
        }
        timeoutRef.current = null
      }, 600)
    }
  }, [currentPage, userHasInteracted, autoReadDisabled]) // Depend on currentPage, user interaction, and auto-read status

  // Cleanup audio on unmount - ensure all audio stops when story is closed
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Stop and cleanup audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }

      // Revoke object URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }

      // Reset all audio states
      setIsReading(false)
      setIsLoading(false)

      // Stop any other audio elements that might be playing
      const audioElements = document.querySelectorAll('audio')
      audioElements.forEach(audio => {
        if (!audio.paused) {
          audio.pause()
          audio.currentTime = 0
        }
      })
    }
  }, [])

  const nextPage = () => {
    setUserHasInteracted(true) // Mark user interaction
    setAutoReadDisabled(true) // Disable auto-read when user navigates manually
    stopSpeaking() // Stop current speech before moving

    // Navigate to next page without auto-read
    setTimeout(() => {
      if (currentPage < storyPages.length - 1) {
        setCurrentPage(currentPage + 1)
      } else {
        onStoryComplete()
      }
    }, 50)
  }

  const prevPage = () => {
    setUserHasInteracted(true) // Mark user interaction
    setAutoReadDisabled(true) // Disable auto-read when user navigates manually
    stopSpeaking() // Stop current speech before moving

    // Navigate to previous page without auto-read
    setTimeout(() => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1)
      }
    }, 50)
  }

  const skipStory = () => {
    setUserHasInteracted(true) // Mark user interaction
    stopSpeaking() // Stop any current audio

    // Force stop all audio and clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Ensure audio is completely stopped
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    // Revoke object URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }

    // Reset audio states
    setIsReading(false)
    setIsLoading(false)

    onStoryComplete()
  }

  const currentStory = storyPages[currentPage]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Top controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Mute/Unmute button */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg text-sm transition-colors ${isMuted
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
              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-sm transition-colors"
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
          <h2 className="text-2xl font-bold text-nutti-primary mb-4">{currentStory.title}</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {currentStory.text}
          </p>

          {/* Read aloud button */}
          <button
            onClick={() => {
              setUserHasInteracted(true) // Mark user interaction
              speakText(currentStory.text, currentStory.title)
            }}
            disabled={isReading || isLoading || isMuted}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${isReading || isLoading || isMuted
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
          >
            {isMuted ? t('story.muted') : isLoading ? t('story.loading') : isReading ? t('story.reading') : t('story.readAgain')}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center mb-6">
          {storyPages.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mx-1 transition-colors ${index === currentPage ? 'bg-nutti-accent' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${currentPage === 0
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
            className="px-6 py-3 bg-gradient-to-r from-nutti-primary to-blue-500 text-white font-semibold rounded-lg hover:from-nutti-primary/90 hover:to-blue-500/90 transition-all"
          >
            {currentPage === storyPages.length - 1 ? `${t('story.start')} 🚀` : `${t('story.next')} ➡️`}
          </button>
        </div>

        {/* Fun facts */}
        {currentPage === 2 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
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