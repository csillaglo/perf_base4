import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../stores/languageStore';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hu' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Languages className="h-4 w-4 mr-2" />
      {language === 'en' ? 'Magyar' : 'English'}
    </button>
  );
}