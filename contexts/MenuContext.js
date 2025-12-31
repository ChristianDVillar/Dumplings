import React, { createContext, useContext, useState } from 'react';
import { menuData as initialMenuData } from '../menuData';

const MenuContext = createContext();

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  const [menuData, setMenuData] = useState(initialMenuData);

  const addMenuItem = (item) => {
    setMenuData(prev => [...prev, item]);
  };

  const updateMenuItem = (itemId, updatedItem) => {
    setMenuData(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updatedItem } : item
    ));
  };

  const deleteMenuItem = (itemId) => {
    setMenuData(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <MenuContext.Provider
      value={{
        menuData,
        setMenuData,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

