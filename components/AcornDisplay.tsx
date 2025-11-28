'use client'
import { useState } from 'react'

interface AcornDisplayProps {
  acorns: number
  maxAcorns?: number
  size?: 'small' | 'medium' | 'large'
  showEmptySlots?: boolean
}

export default function AcornDisplay({
  acorns,
  maxAcorns = 5,
  size = 'medium',
  showEmptySlots = true
}: AcornDisplayProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const sizeClasses = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-12 h-12 text-2xl',
    large: 'w-16 h-16 text-3xl'
  }

  const sizeClass = sizeClasses[size]

  const handleImageError = (src: string) => {
    setImageErrors(prev => new Set(prev).add(src))
  }

  // If showing many acorns (>50), show summary
  if (acorns > 50 && !showEmptySlots) {
    return (
      <div className="flex items-center justify-center gap-4">
        <div className={`${sizeClass} relative flex items-center justify-center`}>
          {imageErrors.has('/pahkina.png') ? (
            <span className="text-nutti-warm text-4xl">🌰</span>
          ) : (
            <img
              src="/pahkina.png"
              alt=""
              className="w-full h-full object-contain drop-shadow-sm"
              onError={() => handleImageError('/pahkina.png')}
            />
          )}
        </div>
        <div className="text-4xl font-bold text-nutti-accent">
          × {acorns}
        </div>
      </div>
    )
  }

  // If showing many acorns (11-50), group them nicely
  if (acorns > 10 && !showEmptySlots) {
    const rows = Math.ceil(acorns / 10)
    const acornsPerRow = Math.ceil(acorns / rows)

    return (
      <div className="flex flex-col items-center gap-2">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const startIndex = rowIndex * acornsPerRow
          const endIndex = Math.min(startIndex + acornsPerRow, acorns)
          const acornsInThisRow = endIndex - startIndex

          return (
            <div key={rowIndex} className="flex items-center gap-1 flex-wrap justify-center">
              {Array.from({ length: acornsInThisRow }, (_, i) => (
                <div
                  key={startIndex + i}
                  className={`${sizeClass} relative transition-transform duration-300 scale-100 flex items-center justify-center`}
                >
                  {imageErrors.has('/pahkina.png') ? (
                    <span className="text-nutti-warm">🌰</span>
                  ) : (
                    <img
                      src="/pahkina.png"
                      alt=""
                      className="w-full h-full object-contain drop-shadow-sm"
                      onError={() => handleImageError('/pahkina.png')}
                    />
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap max-w-md mx-auto">
      {Array.from({ length: maxAcorns }, (_, i) => {
        const isEarned = i < acorns

        if (!isEarned && !showEmptySlots) {
          return null
        }

        const imageSrc = isEarned ? "/pahkina.png" : "/pahkina_reunukset.png"
        const emoji = isEarned ? '🌰' : '⚪'

        return (
          <div
            key={i}
            className={`${sizeClass} relative transition-transform duration-300 flex items-center justify-center ${isEarned ? 'scale-100' : 'scale-75 opacity-30'
              }`}
          >
            {imageErrors.has(imageSrc) ? (
              <span className={isEarned ? "text-nutti-warm" : "text-gray-400"}>{emoji}</span>
            ) : (
              <img
                src={imageSrc}
                alt=""
                className="w-full h-full object-contain drop-shadow-sm"
                onError={() => handleImageError(imageSrc)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Component to show acorn collection with animation
export function AcornReward({ acorns, t }: { acorns: number, t: any }) {
  const plural = acorns !== 1 ? 'ä' : 'n'

  return (
    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
      <div className="text-lg font-bold text-nutti-accent mb-2">
        🌰 {t('acorns.reward')}
      </div>
      <AcornDisplay acorns={acorns} size="large" />
      <p className="text-sm text-nutti-accent mt-2">
        {t('acorns.earned', { count: acorns, plural })}
      </p>
    </div>
  )
}