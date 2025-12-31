import { useState } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook personalizado para manejar la lógica del menú
 * Incluye selección de extras, bebidas y agregado de items
 */
export const useMenuHandlers = (selectedTable, addItemToTable, setShowOrderView) => {
  const [selectedExtras, setSelectedExtras] = useState({});
  const [selectedDrink, setSelectedDrink] = useState({});

  /**
   * Alterna un extra para un item
   */
  const toggleExtra = (itemId, extra) => {
    setSelectedExtras(prev => {
      const current = prev[itemId] || [];
      const newExtras = current.includes(extra)
        ? current.filter(e => e !== extra)
        : [...current, extra];
      
      return {
        ...prev,
        [itemId]: newExtras.length > 0 ? newExtras : undefined
      };
    });
  };

  /**
   * Selecciona una bebida para un item
   */
  const handleSelectDrink = (itemId, drink) => {
    setSelectedDrink(prev => ({
      ...prev,
      [itemId]: drink
    }));
  };

  /**
   * Agrega un item al pedido de la mesa seleccionada
   */
  const handleAddItem = (item) => {
    if (!selectedTable) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }

    const drink = selectedDrink[item.id] || null;
    logger.debug('[useMenuHandlers] handleAddItem:', {
      selectedTable,
      itemId: item.id,
      itemName: item.nameEs,
      drink,
      extras: selectedExtras[item.id]
    });
    
    addItemToTable(selectedTable, item, selectedExtras, drink);

    // Mostrar automáticamente la vista de pedido
    setShowOrderView(true);

    // Limpiar selecciones después de agregar (excepto refrescos)
    setSelectedExtras(prev => {
      const newState = { ...prev };
      delete newState[item.id];
      return newState;
    });
    
    // Limpiar selección de bebida si no es refrescos
    if (item.id !== 93) {
      setSelectedDrink(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  /**
   * Agrega una bebida al pedido
   */
  const handleAddDrink = (item, drink) => {
    if (selectedTable) {
      const extras = selectedExtras[item.id] || [];
      addItemToTable(selectedTable, item, { [item.id]: extras }, drink);
      setShowOrderView(true);
    } else {
      alert('Por favor, selecciona una mesa primero');
    }
  };

  return {
    selectedExtras,
    selectedDrink,
    toggleExtra,
    handleSelectDrink,
    handleAddItem,
    handleAddDrink
  };
};

