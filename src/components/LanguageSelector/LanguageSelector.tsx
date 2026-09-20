import React, { useState, useRef, useEffect } from 'react';
import { CircleButton } from '../CircleButton/CircleButton';
import { useI18n } from '../../i18n/I18nContext';
import styles from './LanguageSelector.module.scss';

export const LanguageSelector: React.FC = () => {
  const { language, languages, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <div ref={containerRef} className={styles.selectorWrapper}>
      <CircleButton
        icon="language"
        info={`${t('languageSelect')}: ${currentLangObj.name}`}
        position="bottom-left"
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`${styles.langOption} ${lang.code === language ? styles.activeOption : ''}`}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
            >
              <span className={styles.flag}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
