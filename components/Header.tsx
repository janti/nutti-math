'use client'

import { useTranslations } from 'next-intl'
import LangSwitcher from '@/components/UI/LangSwitcher'

interface HeaderProps {
  locale: string
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations()

  return (
    <header className="mx-auto max-w-3xl px-4 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <img src="/nutti.png" alt={t('layout.nuttiAlt')} className="w-6 h-6 rounded-full object-cover" />
        <span className="font-bold text-nutti-accent text-lg">{t('nutti.name')}</span>
      </div>
      <LangSwitcher locale={locale} />
    </header>
  )
}