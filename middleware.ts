
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fi', 'sv'],
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - nutti.png, apple-touch-icon.png (static images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|nutti.png|apple-touch-icon.png).*)',
  ],
};
