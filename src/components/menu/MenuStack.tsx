import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuItem } from './MenuItem';
import { useKeyboardNav } from '../../hooks/useKeyboardNav';

export interface NavItem {
  id: string;
  label: string;
  thaiGhost: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'plan', label: 'Learning Plan', thaiGhost: 'แผน', path: '/plan' },
  { id: 'practice', label: 'Practice', thaiGhost: 'ฝึก', path: '/practice' },
  { id: 'words', label: 'Words', thaiGhost: 'คำ', path: '/words' },
  { id: 'skills', label: 'Skills', thaiGhost: 'ทักษะ', path: '/skills' },
  { id: 'journal', label: 'Journal', thaiGhost: 'บันทึก', path: '/journal' },
  { id: 'quests', label: 'Quests', thaiGhost: 'ภารกิจ', path: '/quests' },
  { id: 'system', label: 'System', thaiGhost: 'ระบบ', path: '/system' },
];

export const MenuStack: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIdx = NAV_ITEMS.findIndex((item) => item.path === location.pathname);
  const [selectedIndex, setSelectedIndex] = useState(currentIdx >= 0 ? currentIdx : 0);

  useKeyboardNav({
    onUp: () => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : NAV_ITEMS.length - 1)),
    onDown: () => setSelectedIndex((prev) => (prev < NAV_ITEMS.length - 1 ? prev + 1 : 0)),
    onSelect: () => navigate(NAV_ITEMS[selectedIndex].path),
    onNumberKey: (num) => {
      if (num >= 1 && num <= NAV_ITEMS.length) {
        setSelectedIndex(num - 1);
        navigate(NAV_ITEMS[num - 1].path);
      }
    },
  });

  return (
    <nav className="flex flex-col items-end pr-8 py-6 z-20">
      <div className="w-72 flex flex-col">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/')}
          className="mb-6 pb-3 border-b border-muted/20 text-right pr-4 cursor-pointer group"
          title="Return to Home"
        >
          <div className="font-serif text-3xl font-black tracking-widest text-accent group-hover:text-accent-bright transition-colors uppercase">
            CANT
          </div>
          <div className="text-[10px] font-mono tracking-wider text-muted uppercase">
            The Thieves' Tongue // Thai Lab
          </div>
        </div>

        {NAV_ITEMS.map((item, idx) => (
          <MenuItem
            key={item.id}
            label={item.label}
            thaiGhost={item.thaiGhost}
            index={idx}
            isSelected={selectedIndex === idx}
            onMouseEnter={() => setSelectedIndex(idx)}
            onSelect={() => {
              setSelectedIndex(idx);
              navigate(item.path);
            }}
          />
        ))}
      </div>
    </nav>
  );
};
