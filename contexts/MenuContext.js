import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { menuData as initialMenuData } from '../menuData';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
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
  const [apiAvailable, setApiAvailable] = useState(false);
  const [useApi, setUseApi] = useState(true); // Flag para usar API o fallback local
  const debounceTimeoutRef = useRef(null);
  const pendingUpdatesRef = useRef(new Set());

  // Cargar menú y tipos de refrescos desde la API o fallback local
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Intentar conectar con la API primero
        const apiHealthy = await apiService.checkHealth();
        setApiAvailable(apiHealthy);
        
        if (apiHealthy && useApi) {
          try {
            // Cargar desde la API
            console.log('[MenuContext] Cargando datos desde la API...');
            const [apiProducts, apiDrinkOptions] = await Promise.all([
              apiService.getProducts(),
              apiService.getDrinkOptions()
            ]);
            
            if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
              setMenuData(apiProducts);
              // Guardar en local como backup
              await storageService.saveMenuData(apiProducts);
            }
            
            if (apiDrinkOptions && Array.isArray(apiDrinkOptions) && apiDrinkOptions.length > 0) {
              setDrinkOptions(apiDrinkOptions);
              // Guardar en local como backup
              await storageService.saveDrinkOptions(apiDrinkOptions);
            }
            
            console.log('[MenuContext] Datos cargados desde la API exitosamente');
          } catch (apiError) {
            console.warn('[MenuContext] Error cargando desde API, usando fallback local:', apiError);
            setApiAvailable(false);
            // Continuar con fallback local
            await loadFromLocalStorage();
          }
        } else {
          // Usar datos locales como fallback
          console.log('[MenuContext] Usando datos locales (API no disponible)');
          await loadFromLocalStorage();
        }
      } catch (error) {
        console.error('[MenuContext] Error cargando datos:', error);
        // En caso de error, usar datos iniciales
        setMenuData(initialMenuData);
        setDrinkOptions(initialDrinkOptions);
      } finally {
        setIsLoading(false);
      }
    };

    const loadFromLocalStorage = async () => {
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
    };

    loadData();
  }, [useApi]);

  // Sincronizar menú con API y almacenamiento local (con debounce)
  useEffect(() => {
    if (isLoading) return;
    
    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // Siempre guardar en local como backup
        await storageService.saveMenuData(menuData);
        
        // Si la API está disponible, sincronizar
        if (apiAvailable && useApi) {
          try {
            // Sincronizar cada producto que haya cambiado
            // Por simplicidad, actualizamos todos los productos
            // En producción, podrías optimizar esto para solo actualizar los que cambiaron
            for (const product of menuData) {
              if (!pendingUpdatesRef.current.has(product.id)) {
                pendingUpdatesRef.current.add(product.id);
                try {
                  await apiService.updateProduct(product.id, {
                    number: product.number,
                    category: product.category,
                    categoryEn: product.categoryEn,
                    nameEs: product.nameEs,
                    nameEn: product.nameEn,
                    descriptionEs: product.descriptionEs,
                    descriptionEn: product.descriptionEn,
                    price: product.price,
                    quantity: product.quantity,
                    customizable: product.customizable,
                    enabled: product.enabled !== undefined ? product.enabled : true,
                    optionGroups: product.optionGroups
                  });
                  pendingUpdatesRef.current.delete(product.id);
                } catch (error) {
                  console.warn(`[MenuContext] Error sincronizando producto ${product.id}:`, error);
                  pendingUpdatesRef.current.delete(product.id);
                }
              }
            }
          } catch (error) {
            console.warn('[MenuContext] Error sincronizando con API:', error);
            setApiAvailable(false);
          }
        }
      } catch (error) {
        console.error('[MenuContext] Error guardando menú:', error);
      }
    }, 2000); // Debounce de 2 segundos para API
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [menuData, isLoading, apiAvailable, useApi]);

  // Sincronizar opciones de bebidas con API y almacenamiento local (con debounce)
  useEffect(() => {
    if (isLoading) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        // Siempre guardar en local como backup
        await storageService.saveDrinkOptions(drinkOptions);
        
        // Si la API está disponible, sincronizar
        if (apiAvailable && useApi) {
          try {
            await apiService.updateDrinkOptions(drinkOptions);
          } catch (error) {
            console.warn('[MenuContext] Error sincronizando opciones de bebidas con API:', error);
            setApiAvailable(false);
          }
        }
      } catch (error) {
        console.error('[MenuContext] Error guardando opciones de bebidas:', error);
      }
    }, 2000); // Debounce de 2 segundos
    
    return () => clearTimeout(timeoutId);
  }, [drinkOptions, isLoading, apiAvailable, useApi]);

  const addMenuItem = async (item) => {
    setMenuData(prev => [...prev, item]);
    
    // Si la API está disponible, crear el producto en la base de datos
    if (apiAvailable && useApi) {
      try {
        await apiService.createProduct(item);
      } catch (error) {
        console.warn('[MenuContext] Error creando producto en API:', error);
        // El producto ya está en el estado local, así que continuamos
      }
    }
  };

  const updateMenuItem = async (itemId, updatedItem) => {
    setMenuData(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updatedItem } : item
    ));
    
    // Si la API está disponible, actualizar en la base de datos
    if (apiAvailable && useApi) {
      try {
        await apiService.updateProduct(itemId, updatedItem);
      } catch (error) {
        console.warn('[MenuContext] Error actualizando producto en API:', error);
        // El producto ya está actualizado en el estado local
      }
    }
  };

  const deleteMenuItem = async (itemId) => {
    setMenuData(prev => prev.filter(item => item.id !== itemId));
    
    // Si la API está disponible, eliminar de la base de datos
    if (apiAvailable && useApi) {
      try {
        await apiService.deleteProduct(itemId);
      } catch (error) {
        console.warn('[MenuContext] Error eliminando producto en API:', error);
        // El producto ya fue eliminado del estado local
      }
    }
  };

  const addDrinkOption = async (drinkOption) => {
    const newOptions = [...drinkOptions, drinkOption];
    setDrinkOptions(newOptions);
    
    // Si la API está disponible, actualizar en la base de datos
    if (apiAvailable && useApi) {
      try {
        await apiService.updateDrinkOptions(newOptions);
      } catch (error) {
        console.warn('[MenuContext] Error actualizando opciones de bebidas en API:', error);
      }
    }
  };

  const updateDrinkOption = async (index, updatedOption) => {
    const newOptions = [...drinkOptions];
    newOptions[index] = updatedOption;
    setDrinkOptions(newOptions);
    
    // Si la API está disponible, actualizar en la base de datos
    if (apiAvailable && useApi) {
      try {
        await apiService.updateDrinkOptions(newOptions);
      } catch (error) {
        console.warn('[MenuContext] Error actualizando opciones de bebidas en API:', error);
      }
    }
  };

  const deleteDrinkOption = async (index) => {
    const newOptions = drinkOptions.filter((_, i) => i !== index);
    setDrinkOptions(newOptions);
    
    // Si la API está disponible, actualizar en la base de datos
    if (apiAvailable && useApi) {
      try {
        await apiService.updateDrinkOptions(newOptions);
      } catch (error) {
        console.warn('[MenuContext] Error actualizando opciones de bebidas en API:', error);
      }
    }
  };

  const reorderDrinkOptions = async (fromIndex, toIndex) => {
    const newOptions = [...drinkOptions];
    const [removed] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, removed);
    setDrinkOptions(newOptions);
    
    // Si la API está disponible, actualizar en la base de datos
    if (apiAvailable && useApi) {
      try {
        await apiService.updateDrinkOptions(newOptions);
      } catch (error) {
        console.warn('[MenuContext] Error actualizando opciones de bebidas en API:', error);
      }
    }
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
        reorderDrinkOptions,
        apiAvailable,
        useApi,
        setUseApi
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

