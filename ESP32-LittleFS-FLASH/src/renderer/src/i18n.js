import i18next from 'i18next'
import I18NextVue from 'i18next-vue'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';

i18next
  .use(LanguageDetector)
  .init({
    // 初始化i18next
    debug: true,
    fallbackLng: 'en',
    resources: {
       en: { translation: enTranslations },
       zh: { translation: zhTranslations }
    }
  });

export default function (app) {

  app.use(I18NextVue, {
    i18next })
  return app
}
