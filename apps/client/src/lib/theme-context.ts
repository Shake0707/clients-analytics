import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);
