'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'pastel';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'pastel' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.classList.toggle('pastel', saved === 'pastel');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'pastel' : 'dark';
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('pastel', next === 'pastel');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
