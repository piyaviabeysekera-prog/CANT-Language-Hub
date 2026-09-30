import React, { createContext, useContext, useState } from 'react';

interface MenuContextType {
  hoveredPath: string | null;
  setHoveredPath: (path: string | null) => void;
}

const MenuContext = createContext<MenuContextType>({
  hoveredPath: null,
  setHoveredPath: () => {},
});

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <MenuContext.Provider value={{ hoveredPath, setHoveredPath }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
