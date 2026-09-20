import React, { useState, useEffect } from 'react';
import { CircleButton } from '../CircleButton/CircleButton';
import { useI18n } from '../../i18n/I18nContext';
import styles from './ThemeToggle.module.scss';

export const ThemeToggle: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');
  const { t } = useI18n();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isDarkSystem = mediaQuery.matches;
      const effectiveTheme =
        themeMode === 'system' ? (isDarkSystem ? 'dark' : 'light') : themeMode;
      setResolvedTheme(effectiveTheme);

      if (themeMode === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', themeMode);
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div className={styles.themeToggleWrapper}>
      <CircleButton
        icon={isDark ? 'light_mode' : 'dark_mode'}
        info={isDark ? t('themeLight') : t('themeDark')}
        position="bottom-left"
        onClick={toggleTheme}
      />
    </div>
  );
};
