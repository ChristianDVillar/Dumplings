import { useState } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook personalizado para manejar la lógica del menú
 * Incluye selección de extras, bebidas y agregado de items
 */
export const useMenuHandlers = (selectedTable, addItemToTable) => {
  const [selectedExtras, setSelectedExtras] = useState({});
  const [selectedDrink, setSelectedDrink] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

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
   * Selecciona una opción de un grupo para un item
   */
  const handleSelectOption = (itemId, groupId, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [groupId]: option
      }
    }));
  };

  const buildOptionExtras = (item) => {
    if (!item.optionGroups || !Array.isArray(item.optionGroups)) {
      return [];
    }
    const selections = selectedOptions[item.id] || {};
    return item.optionGroups
      .map(group => {
        const selected = selections[group.id];
        if (!selected) return null;
        const label = group.labelEs || group.labelEn || group.id;
        return `${label}: ${selected}`;
      })
      .filter(Boolean);
  };

  const getMissingRequiredOptions = (item) => {
    if (!item.optionGroups || !Array.isArray(item.optionGroups)) {
      return [];
    }
    const selections = selectedOptions[item.id] || {};
    return item.optionGroups
      .filter(group => group.required)
      .filter(group => !selections[group.id])
      .map(group => group.labelEs || group.labelEn || group.id);
  };

  const buildExtrasPayload = (item) => {
    const optionExtras = buildOptionExtras(item);
    if (optionExtras.length === 0) {
      return selectedExtras;
    }
    const currentExtras = selectedExtras[item.id] || [];
    return {
      ...selectedExtras,
      [item.id]: [...currentExtras, ...optionExtras]
    };
  };

  /**
   * Agrega un item al pedido de la mesa seleccionada
   */
  const handleAddItem = (item) => {
    if (!selectedTable) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }

    const missingOptions = getMissingRequiredOptions(item);
    if (missingOptions.length > 0) {
      alert(`Selecciona: ${missingOptions.join(', ')}`);
      return;
    }

    const drink = selectedDrink[item.id] || null;
    const extrasPayload = buildExtrasPayload(item);
    logger.debug('[useMenuHandlers] handleAddItem:', {
      selectedTable,
      itemId: item.id,
      itemName: item.nameEs,
      drink,
      extras: extrasPayload[item.id]
    });
    
    addItemToTable(selectedTable, item, extrasPayload, drink);

    // Ya no se muestra automáticamente la vista de pedido

    // Limpiar selecciones después de agregar (excepto refrescos)
    setSelectedExtras(prev => {
      const newState = { ...prev };
      delete newState[item.id];
      return newState;
    });

    setSelectedOptions(prev => {
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
      // Ya no se muestra automáticamente la vista de pedido
    } else {
      alert('Por favor, selecciona una mesa primero');
    }
  };

  return {
    selectedExtras,
    selectedDrink,
    selectedOptions,
    toggleExtra,
    handleSelectOption,
    handleSelectDrink,
    handleAddItem,
    handleAddDrink
  };
};

