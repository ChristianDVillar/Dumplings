import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import { groupMenuByCategory, MENU_CATEGORIES, getCategoryDisplayName } from '../utils/menuCategories';
import MenuItem from './MenuItem';
import { menuItemStyles } from '../styles/menuItemStyles';
import { menuService } from '../services/menuService';
import { useAppContext } from '../contexts/AppContext';

const MenuByCategory = ({
  menuData,
  searchQuery,
  selectedTable,
  selectedExtras,
  selectedDrink,
  selectedOptions,
  onToggleExtra,
  onSelectOption,
  onSelectDrink,
  onAddDrink,
  onAddItem
}) => {
  const { language } = useAppContext();
  // Estado para rastrear qué categorías están expandidas
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Filtrar menú según búsqueda y estado habilitado usando servicios
  const filteredMenu = useMemo(() => {
    // Primero filtrar solo items habilitados
    let items = menuService.filterEnabledItems(menuData);
    
    // Luego filtrar por búsqueda si hay query
    if (!searchQuery.trim()) {
      return items;
    }
    return menuService.searchItems(items, searchQuery, language);
  }, [menuData, searchQuery, language]);

  // Agrupar por categoría
  const { grouped, sortedCategories } = useMemo(() => {
    return groupMenuByCategory(filteredMenu);
  }, [filteredMenu]);

  // Preparar datos para SectionList (filtrar datos según categorías expandidas)
  const sections = useMemo(() => {
    return sortedCategories
      .filter(catKey => grouped[catKey] && grouped[catKey].length > 0)
      .map(catKey => ({
        title: getCategoryDisplayName(catKey),
        data: expandedCategories.has(catKey) ? grouped[catKey] : [],
        categoryKey: catKey
      }));
  }, [sortedCategories, grouped, expandedCategories]);

  // Si hay búsqueda activa, expandir todas las categorías automáticamente
  useEffect(() => {
    if (searchQuery.trim()) {
      const allCategories = new Set(sortedCategories);
      setExpandedCategories(allCategories);
    }
  }, [searchQuery, sortedCategories]);

  // Función para toggle de categoría
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  const renderItem = ({ item }) => {
    return (
      <MenuItem
        item={item}
        selectedTable={selectedTable}
        selectedExtras={selectedExtras}
        selectedDrink={selectedDrink}
        selectedOptions={selectedOptions}
        onToggleExtra={onToggleExtra}
        onSelectOption={onSelectOption}
        onSelectDrink={onSelectDrink}
        onAddDrink={onAddDrink}
        onAddItem={onAddItem}
        styles={menuItemStyles}
      />
    );
  };

  const renderSectionHeader = ({ section }) => {
    const isExpanded = expandedCategories.has(section.categoryKey);
    // Obtener el conteo real de items de la categoría original (no filtrado por expandido)
    const itemCount = grouped[section.categoryKey]?.length || 0;
    
    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleCategory(section.categoryKey)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionHeaderText}>
            {section.title} ({itemCount})
          </Text>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontraron resultados</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  sectionHeader: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    color: '#FFD700',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
  },
});

export default MenuByCategory;

