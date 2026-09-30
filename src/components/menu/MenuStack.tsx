import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuItem } from './MenuItem';
import { LightningDivider } from './LightningDivider';
import { useKeyboardNav } from '../../hooks/useKeyboardNav';

import { useMenu } from '../../app/menuContext';

export interface NavItem {
  id: string;
  label: string;
  thaiGhost: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'plan', label: 'Plan', thaiGhost: 'แผน', path: '/plan' },
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
  const { setHoveredPath } = useMenu();

  const currentIdx = NAV_ITEMS.findIndex((item) => item.path === location.pathname);
  const [selectedIndex, setSelectedIndex] = useState(currentIdx >= 0 ? currentIdx : 0);

  const handleIndexChange = (idx: number) => {
    setSelectedIndex(idx);
    if (location.pathname === '/') {
      setHoveredPath(NAV_ITEMS[idx].path);
    }
  };

  useKeyboardNav({
    onUp: () => {
      const next = selectedIndex > 0 ? selectedIndex - 1 : NAV_ITEMS.length - 1;
      handleIndexChange(next);
    },
    onDown: () => {
      const next = selectedIndex < NAV_ITEMS.length - 1 ? selectedIndex + 1 : 0;
      handleIndexChange(next);
    },
    onSelect: () => navigate(NAV_ITEMS[selectedIndex].path),
    onNumberKey: (num) => {
      if (num >= 1 && num <= NAV_ITEMS.length) {
        handleIndexChange(num - 1);
        navigate(NAV_ITEMS[num - 1].path);
      }
    },
  });

  return (
    <nav className="flex flex-col items-end pr-6 py-6 z-20">
      <div className="w-80 flex flex-col">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/')}
          className="mb-4 pb-2 border-b border-gunmetal text-right pr-3 cursor-pointer group"
          title="Return to Home"
        >
          <div className="font-giant text-4xl font-black tracking-widest text-gold group-hover:text-ivory transition-colors uppercase transform -skew-x-6">
            CANT
          </div>
          <div className="text-[10px] font-mono tracking-widest text-silver uppercase mt-0.5">
            THE THIEVES' TONGUE // v1.1
          </div>
        </div>

        {/* Stacked Slabs with Lightning Dividers */}
        {NAV_ITEMS.map((item, idx) => (
          <React.Fragment key={item.id}>
            <MenuItem
              label={item.label}
              thaiGhost={item.thaiGhost}
              index={idx}
              isSelected={selectedIndex === idx}
              onMouseEnter={() => handleIndexChange(idx)}
              onSelect={() => {
                handleIndexChange(idx);
                navigate(item.path);
              }}
            />
            {idx < NAV_ITEMS.length - 1 && (
              <LightningDivider variant={idx % 2 === 0 ? 0 : 1} />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};
