import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { hu } from './locales/hu';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      hu: {
        translation: hu
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    keySeparator: '.',
    nsSeparator: ':',
    returnNull: false,
    returnEmptyString: false,
    returnObjects: true,
    nestingPrefix: '$t(',
    nestingSuffix: ')',
    defaultNS: 'translation',
    parseMissingKeyHandler: (key) => {
      console.warn(`Missing translation key: ${key}`);
      return key.split('.').pop() || key;
    }
  });

export default i18n;