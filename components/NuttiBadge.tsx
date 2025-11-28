'use client'
import { useTranslations } from 'next-intl'

export default function NuttiBadge({ mood = 'happy' }: { mood?: 'happy' | 'thinking' | 'excited' }) {
  const t = useTranslations()
  const moodEmojis = {
    happy: '😊',
    thinking: '🤔',
    excited: '🤩'
  }

  const moodColors = {
    happy: 'from-blue-400 to-indigo-400',
    thinking: 'from-blue-400 to-cyan-400',
    excited: 'from-pink-400 to-purple-400'
  }

  return (
    <div aria-hidden className="flex items-center gap-3 bg-white/80 rounded-xl p-2 border border-nutti-secondary shadow-sm">
      <div className={`size-12 rounded-full bg-gradient-to-br ${moodColors[mood]} shadow-lg overflow-hidden flex items-center justify-center transform hover:scale-110 transition-all`}>
        <img
          src="/nutti.png"
          alt="Nutti Orava"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-3xl">${t('nutti.fallbackIcon')}</span>`;
            }
          }}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-nutti-accent text-lg">{t('nutti.name')}</span>
          <span className="text-lg">{moodEmojis[mood]}</span>
        </div>
        <div className="text-xs text-nutti-primary font-medium">
          {t(`nutti.moods.${mood}`)}
        </div>
      </div>
      <span className="sr-only">{t('nutti.screenReader', { mood })}</span>
    </div>
  )
}
