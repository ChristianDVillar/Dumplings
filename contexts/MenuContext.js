import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuData as initialMenuData } from '../menuData';
import { storageService } from '../services/storageService';

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
  const [isLoading, setIsLoading] = useState(true);

  // Cargar menú guardado al iniciar
  useEffect(() => {
    const loadPersistedMenu = async () => {
      try {
        setIsLoading(true);
        const savedMenu = await storageService.loadMenuData();
        if (savedMenu && Array.isArray(savedMenu) && savedMenu.length > 0) {
          setMenuData(savedMenu);
        }
      } catch (error) {
        console.error('[MenuContext] Error cargando menú:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedMenu();
  }, []);

  // Guardar menú cuando cambie (con debounce)
  useEffect(() => {
    if (isLoading) return;
    
    const saveMenu = async () => {
      await storageService.saveMenuData(menuData);
    };

    const timeoutId = setTimeout(saveMenu, 1000); // Debounce de 1 segundo
    return () => clearTimeout(timeoutId);
  }, [menuData, isLoading]);

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

