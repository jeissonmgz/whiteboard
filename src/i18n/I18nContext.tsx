import React, { createContext, useContext } from 'react';
import { Language, LANGUAGES, LanguageOption, translations } from './translations';
import { useSettingsStore } from '../store/useSettingsStore';

interface I18nContextType {
  language: Language;
  languages: LanguageOption[];
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

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
