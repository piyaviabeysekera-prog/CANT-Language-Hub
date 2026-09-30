import React, { useEffect, useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './app/theme';
import { AppRouter } from './app/router';
import { initializeDatabase } from './data/initDb';

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen w-full bg-[#1F3A3D] text-[#EDE6D6] flex items-center justify-center font-mono text-xs">
        INITIALIZING ARCHON 01 DATABASE...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <HashRouter>
        <AppRouter />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
