import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuData as initialMenuData } from '../menuData';
import { storageService } from '../services/storageService';
import { DRINK_OPTIONS as initialDrinkOptions } from '../utils/constants';

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
  const [drinkOptions, setDrinkOptions] = useState(initialDrinkOptions);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar menú y tipos de refrescos guardados al iniciar
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        setIsLoading(true);
        const savedMenu = await storageService.loadMenuData();
        if (savedMenu && Array.isArray(savedMenu) && savedMenu.length > 0) {
          // Migración: actualizar "Coca" a "Coca Cola" en drinkOptions de items
          const migratedMenu = savedMenu.map(item => {
            if (item.drinkOptions && Array.isArray(item.drinkOptions)) {
              const migratedDrinkOptions = item.drinkOptions.map(option => 
                option === 'Coca' ? 'Coca Cola' : option
              );
              return { ...item, drinkOptions: migratedDrinkOptions };
            }
            return item;
          });
          // Migración: incorporar nuevos items del menú base (por id)
          const existingIds = new Set(migratedMenu.map(item => item.id));
          const newItems = initialMenuData.filter(item => !existingIds.has(item.id));
          const mergedMenu = newItems.length > 0 ? [...migratedMenu, ...newItems] : migratedMenu;
          setMenuData(mergedMenu);
          
          // Guardar menú migrado si hubo cambios
          const hasChanges = savedMenu.some((item, index) => {
            if (item.drinkOptions && Array.isArray(item.drinkOptions)) {
              return item.drinkOptions.includes('Coca');
            }
            return false;
          });
          if (hasChanges || newItems.length > 0) {
            await storageService.saveMenuData(mergedMenu);
          }
        }
        
        const savedDrinkOptions = await storageService.loadDrinkOptions();
        if (savedDrinkOptions && Array.isArray(savedDrinkOptions) && savedDrinkOptions.length > 0) {
          // Migración: actualizar "Coca" a "Coca Cola" en tipos globales
          const migratedDrinkOptions = savedDrinkOptions.map(option => 
            option === 'Coca' ? 'Coca Cola' : option
          );

          // Incorporar nuevas opciones por defecto (ej. Sprite)
          const mergedDrinkOptions = [...migratedDrinkOptions];
          initialDrinkOptions.forEach(option => {
            if (!mergedDrinkOptions.includes(option)) {
              mergedDrinkOptions.push(option);
            }
          });
          
          // Solo actualizar si hubo cambios
          const hasChanges = mergedDrinkOptions.length !== savedDrinkOptions.length ||
            mergedDrinkOptions.some((opt, idx) => opt !== savedDrinkOptions[idx]);
          if (hasChanges) {
            setDrinkOptions(mergedDrinkOptions);
            await storageService.saveDrinkOptions(mergedDrinkOptions);
          } else {
            setDrinkOptions(savedDrinkOptions);
          }
        }
      } catch (error) {
        console.error('[MenuContext] Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedData();
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

  // Guardar tipos de refrescos cuando cambien (con debounce)
  useEffect(() => {
    if (isLoading) return;
    
    const saveDrinkOptions = async () => {
      await storageService.saveDrinkOptions(drinkOptions);
    };

    const timeoutId = setTimeout(saveDrinkOptions, 1000); // Debounce de 1 segundo
    return () => clearTimeout(timeoutId);
  }, [drinkOptions, isLoading]);

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

  const addDrinkOption = (drinkOption) => {
    setDrinkOptions(prev => [...prev, drinkOption]);
  };

  const updateDrinkOption = (index, updatedOption) => {
    setDrinkOptions(prev => {
      const newOptions = [...prev];
      newOptions[index] = updatedOption;
      return newOptions;
    });
  };

  const deleteDrinkOption = (index) => {
    setDrinkOptions(prev => prev.filter((_, i) => i !== index));
  };

  const reorderDrinkOptions = (fromIndex, toIndex) => {
    setDrinkOptions(prev => {
      const newOptions = [...prev];
      const [removed] = newOptions.splice(fromIndex, 1);
      newOptions.splice(toIndex, 0, removed);
      return newOptions;
    });
  };

  return (
    <MenuContext.Provider
      value={{
        menuData,
        setMenuData,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        drinkOptions,
        setDrinkOptions,
        addDrinkOption,
        updateDrinkOption,
        deleteDrinkOption,
        reorderDrinkOptions
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

