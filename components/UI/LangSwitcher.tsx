'use client'
import { usePathname, useRouter } from 'next/navigation'
const locales = ['fi', 'en', 'sv'] as const
export default function LangSwitcher({ locale }: { locale: string }) {
  const r = useRouter()
  const path = usePathname() || '/fi'
  return (
    <div className="flex gap-2 text-sm">
      {locales.map(l => {
        const active = l === locale
        const parts = path.split('/').filter(Boolean)
        if (parts.length === 0) parts.push('fi')
        parts[0] = l
        const href = '/' + parts.join('/')
        return (
          <button key={l} onClick={() => r.push(href)}
            className={`px-2 py-1 rounded-lg border ${active ? 'bg-nutti-secondary border-blue-300' : 'bg-white'}`}
            aria-current={active ? 'page' : undefined}>
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
