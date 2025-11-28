'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface MathStoryProps {
  onStoryComplete: () => void
}

export default function MathStory({ onStoryComplete }: MathStoryProps) {
  const t = useTranslations()
  const [currentPage, setCurrentPage] = useState(0)

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

  const nextPage = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      onStoryComplete()
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentStory = storyPages[currentPage]

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-nutti-primary mb-2">
            {currentStory.title}
          </h1>
          <div className="text-sm text-gray-500 mb-4">
            {t('story.page')} {currentPage + 1} / {storyPages.length}
          </div>
        </div>

        {/* Story content */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6 select-none">
            {currentStory.image}
          </div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            {currentStory.text}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentPage === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-nutti-secondary text-nutti-primary hover:bg-nutti-accent hover:text-white'
            }`}
          >
            {t('story.previous')}
          </button>

          <div className="flex space-x-2">
            {storyPages.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentPage ? 'bg-nutti-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            className="px-6 py-3 bg-nutti-primary text-white rounded-xl font-semibold hover:bg-nutti-primary/90 transition-all"
          >
            {currentPage === storyPages.length - 1 ? t('story.start') : t('story.next')}
          </button>
        </div>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={onStoryComplete}
            className="text-sm text-gray-500 hover:text-nutti-primary transition-colors underline"
          >
            {t('story.skip')}
          </button>
        </div>
      </div>
    </div>
  )
}