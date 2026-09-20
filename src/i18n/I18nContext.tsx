import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LANGUAGES, LanguageOption, translations, detectBrowserLanguage } from './translations';

interface I18nContextType {
  language: Language;
  languages: LanguageOption[];
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    } else {
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('app_language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['es']?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, languages: LANGUAGES, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
