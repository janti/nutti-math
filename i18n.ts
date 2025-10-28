export const locales = ['fi','en','sv'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'fi';
