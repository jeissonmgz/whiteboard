import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Language, detectBrowserLanguage, translations } from '../i18n/translations';

export type ThemeMode = 'system' | 'dark' | 'light';

interface SettingsStoreState {
  themeMode: ThemeMode;
  language: Language;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
}

export const SETTINGS_STORAGE_KEY = 'whiteboard_settings_storage';

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      language: typeof window !== 'undefined' ? detectBrowserLanguage() : 'es',
      setThemeMode: (mode) => set({ themeMode: mode }),
      setLanguage: (lang) => {
        if (translations[lang]) {
          set({ language: lang });
        }
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Cross-tab synchronization for theme and language settings
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === SETTINGS_STORAGE_KEY) {
      useSettingsStore.persist.rehydrate();
    }
  });
}
