import { useEffect, useState, type ReactNode } from 'react';
import { telegramColorScheme } from './telegram';
import { ThemeContext, type Theme, type ThemeCtx } from './theme-context';

function initial(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return telegramColorScheme() ?? 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // React Compiler мемоизирует автоматически — ручной useMemo не нужен.
  const value: ThemeCtx = {
    theme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
