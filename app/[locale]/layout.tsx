import '../globals.css'
import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import type {Metadata} from 'next'
import {defaultLocale, type Locale} from '@/i18n'
import LangSwitcher from '@/components/UI/LangSwitcher'

export const metadata: Metadata = {
  title: 'Nutti – Math Game',
  description: 'AI-assisted multiplication game for kids.',
  icons: {
    icon: '/nutti.png',
    shortcut: '/nutti.png',
    apple: '/nutti.png',
  },
  openGraph: {
    title: 'Nutti – Math Game',
    description: 'AI-assisted multiplication game for kids.',
    images: ['/nutti.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Nutti – Math Game',
    description: 'AI-assisted multiplication game for kids.',
    images: ['/nutti.png'],
  }
}

export default async function LocaleLayout({
  children, params
}:{ children: React.ReactNode; params: { locale: Locale } }){
  const locale = params.locale || defaultLocale
  const messages = await getMessages()
  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <header className="mx-auto max-w-3xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/nutti.png" alt="Nutti" className="w-6 h-6 rounded-full object-cover" />
              <span className="font-bold text-nutti-orange text-lg">Nutti</span>
            </div>
            <LangSwitcher locale={locale} />
          </header>
          <main className="mx-auto max-w-3xl px-4 pb-4">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
