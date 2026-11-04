import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import * as z from 'zod'
import bg from './locales/bg.json'
import en from './locales/en.json'

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'bg', label: 'БГ', name: 'Български' },
] as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, bg: { translation: bg } },
    fallbackLng: 'en',
    supportedLngs: LANGUAGES.map((language) => language.code),
    load: 'languageOnly',
    interpolation: { escapeValue: false }, // React already escapes rendered values
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'fittrack.language',
      caches: ['localStorage'],
    },
  })

// The page and Zod's built-in validation messages follow the app language.
const zodLocales = { en: z.locales.en, bg: z.locales.bg } as const

const syncLanguage = (language: string) => {
  document.documentElement.lang = language
  z.config((zodLocales[language as keyof typeof zodLocales] ?? zodLocales.en)())
}
syncLanguage(i18n.resolvedLanguage ?? 'en')
i18n.on('languageChanged', syncLanguage)

/**
 * Translates a fixed value the API sends in English, such as a muscle group or
 * difficulty. Comma-separated lists are translated item by item, and anything
 * without a translation, such as a newly added value, is shown as it is.
 */
export const tLabel = (value: string): string =>
  value
    .split(', ')
    .map((part) => i18n.t(`labels.${part}`, { defaultValue: part }))
    .join(', ')

export default i18n
