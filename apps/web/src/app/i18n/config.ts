import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEn from './resources/en/common.json'
import jobsEn from './resources/en/jobs.json'
import commonTa from './resources/ta/common.json'
import jobsTa from './resources/ta/jobs.json'
import { DEFAULT_LOCALE } from './locales.js'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ['en', 'ta'],
    defaultNS: 'common',
    ns: ['common', 'jobs'],
    resources: {
      en: {
        common: commonEn,
        jobs: jobsEn
      },
      ta: {
        common: commonTa,
        jobs: jobsTa
      }
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
