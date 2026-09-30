import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuStack, NAV_ITEMS } from '../menu/MenuStack';
import { HeroArt } from './HeroArt';
import { GhostWord } from './GhostWord';
import { ContextBar } from './ContextBar';
import { db } from '../../data/db';

interface ShellProps {
  children: React.ReactNode;
  ghostWord?: string;
  leftHints?: string;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  ghostWord,
  leftHints,
}) => {
  const location = useLocation();
  const [bankedTimeStr, setBankedTimeStr] = useState('0h 00m');

  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname);
  const activeGhost = ghostWord || currentNav?.thaiGhost || 'ฝึก';

  useEffect(() => {
    async function loadBankedTime() {
      const sessions = await db.sessions.toArray();
      const totalMs = sessions.reduce((sum, s) => sum + (s.activeMs || 0), 0);
      const hours = Math.floor(totalMs / 3600000);
      const minutes = Math.floor((totalMs % 3600000) / 60000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setBankedTimeStr(`${hours}h ${pad(minutes)}m`);
    }

    loadBankedTime();
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full bg-bg text-text-on-bg flex flex-col justify-between overflow-x-hidden">
      {/* Background Ambience & Ghost Word */}
      <GhostWord word={activeGhost} />
      <HeroArt />

      {/* Main Content Area with Split Layout */}
      <div className="flex-1 flex flex-row pb-12 z-10">
        {/* Left Nav Stack */}
        <aside className="w-80 flex-shrink-0 pt-8 pl-4">
          <MenuStack />
        </aside>

        {/* Dynamic Screen Slot */}
        <main className="flex-1 px-8 pt-8 max-w-5xl">
          {children}
        </main>
      </div>

      {/* Persistent Bottom Context Bar */}
      <ContextBar leftHints={leftHints} bankedTime={bankedTimeStr} />
    </div>
  );
};
