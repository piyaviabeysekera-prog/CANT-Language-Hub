import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../data/db';

export type Theme = 'gentleman' | 'deep' | 'growth';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'gentleman',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('gentleman');

  useEffect(() => {
    async function loadTheme() {
      const saved = await db.settings.get('theme');
      if (saved && saved.value) {
        let val = saved.value as Theme;
        if ((val as string) === 'ink' || (val as string) === 'night' || (val as string) === 'day') {
          val = 'gentleman';
        }
        setThemeState(val);
        document.documentElement.setAttribute('data-theme', val);
      } else {
        document.documentElement.setAttribute('data-theme', 'gentleman');
      }
    }
    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    await db.settings.put({ key: 'theme', value: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
