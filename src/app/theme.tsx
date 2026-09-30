import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../data/db';

export type Theme = 'ink' | 'night' | 'day';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'ink',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('ink');

  useEffect(() => {
    async function loadTheme() {
      const saved = await db.settings.get('theme');
      if (saved && saved.value) {
        setThemeState(saved.value as Theme);
        document.documentElement.setAttribute('data-theme', saved.value);
      } else {
        document.documentElement.setAttribute('data-theme', 'ink');
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
