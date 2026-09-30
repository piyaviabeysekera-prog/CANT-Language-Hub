import React, { useEffect, useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './app/theme';
import { AppRouter } from './app/router';
import { initializeDatabase } from './data/initDb';

import { MenuProvider } from './app/menuContext';

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0A] text-[#F2EFE6] flex items-center justify-center font-mono text-xs">
        INITIALIZING ARCHON 01 DATABASE...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <MenuProvider>
        <HashRouter>
          <AppRouter />
        </HashRouter>
      </MenuProvider>
    </ThemeProvider>
  );
}

export default App;
