import '../globals.css'
import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import type {Metadata} from 'next'
import {defaultLocale, type Locale} from '@/i18n'
import Header from '@/components/Header'

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
          <Header locale={locale} />
          <main className="mx-auto max-w-3xl px-4 pb-4">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
