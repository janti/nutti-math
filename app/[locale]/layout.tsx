import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { Metadata } from 'next'
import { defaultLocale, type Locale, locales } from '@/i18n'
import Header from '@/components/Header'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'Nutti – Math Game',
  description: 'AI-assisted multiplication game for kids',
  icons: {
    icon: '/nutti.png'
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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params
  const { locale } = resolvedParams as { locale: Locale }
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="h-[100dvh] flex flex-col gap-2 overflow-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header locale={locale} />
          <main className="w-full flex-1 flex flex-col overflow-y-auto overflow-x-hidden">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
