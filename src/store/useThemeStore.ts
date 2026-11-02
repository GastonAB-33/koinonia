import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeId, THEME_OPTIONS, ThemeOption } from '../types/theme';

interface ThemeState {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  getThemeInfo: () => ThemeOption;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'aesthetic-pastel', // Por defecto la nueva paleta solicitada (#B7D6D9, #C4BC7B, #88804B)

      setTheme: (theme: ThemeId) => {
        set({ currentTheme: theme });
      },

      getThemeInfo: () => {
        const active = get().currentTheme;
        return THEME_OPTIONS.find((t) => t.id === active) || THEME_OPTIONS[0];
      }
    }),
    {
      name: 'koinonia-theme-preference'
    }
  )
);
