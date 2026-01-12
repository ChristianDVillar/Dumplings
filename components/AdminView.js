import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, Dimensions } from 'react-native';
import { MENU_CATEGORIES, getCategoryDisplayName } from '../utils/menuCategories';
import { useMenuContext } from '../contexts/MenuContext';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { useAppContext } from '../contexts/AppContext';
import { generateTables } from '../utils/helpers';
import StatisticsModal from './StatisticsModal';
import QRGeneratorModal from './QRGeneratorModal';
import QRTableSelectorModal from './QRTableSelectorModal';
import { menuService } from '../services/menuService';
import { statisticsService } from '../services/statisticsService';
import { useTranslations } from '../utils/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const AdminView = () => {
  const { menuData: menuItems, setMenuData: setMenuItems, drinkOptions, setDrinkOptions, addDrinkOption, updateDrinkOption, deleteDrinkOption } = useMenuContext();
  const { tableOrders, getTableOrders, isTableOccupied } = useTableOrdersContext();
  const { language } = useAppContext();
  const t = useTranslations(language);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRefrescosOnly, setShowRefrescosOnly] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRSelectorModal, setShowQRSelectorModal] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState(null);
  const [editingDrinkOptionIndex, setEditingDrinkOptionIndex] = useState(null);
  const [newDrinkOption, setNewDrinkOption] = useState('');
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.terrace, ...tables.takeaway];

  // Formulario para nuevo/editar item
  const [formData, setFormData] = useState({
    number: '',
    nameEs: '',
    nameEn: '',
    nameZh: '',
    description: '',
    price: '',
    category: '',
    extras: [],
    image: '',
    drinkOptions: null // null = usar tipos globales, array = tipos específicos
  });

  // Función para identificar si un item es un refresco
  const isRefresco = (item) => {
    if (item.category !== 'BEBIDAS') return false;
    const nameEs = (item.nameEs || '').toLowerCase();
    const nameEn = (item.nameEn || '').toLowerCase();
    const nameZh = (item.nameZh || '').toLowerCase();
    return nameEs.includes('refresco') || nameEn.includes('soft drink') || nameEn.includes('soda') || nameZh.includes('汽水') || nameZh.includes('可乐');
  };

  // Filtrar items por categoría, refrescos y búsqueda (sin filtrar por enabled)
  const filteredItems = useMemo(() => {
    // Crear una copia del array para evitar problemas de referencia
    let items = [...menuItems];

    if (showRefrescosOnly) {
      // Filtrar solo refrescos
      items = items.filter(item => isRefresco(item));
    } else if (selectedCategory) {
      // Obtener la key real de la categoría desde MENU_CATEGORIES
      const categoryKey = MENU_CATEGORIES[selectedCategory]?.key || selectedCategory;
      items = items.filter(item => item.category === categoryKey);
    }

    if (searchQuery) {
      items = menuService.searchItems(items, searchQuery, language);
    }

    return items;
  }, [menuItems, selectedCategory, showRefrescosOnly, searchQuery, language]);

  // Separar items en habilitados y deshabilitados, luego agrupar por categoría
  const { enabledItems, disabledItems } = useMemo(() => {
    const enabled = filteredItems.filter(item => item.enabled !== false);
    const disabled = filteredItems.filter(item => item.enabled === false);
    return { enabledItems: enabled, disabledItems: disabled };
  }, [filteredItems]);

  // Agrupar items habilitados por categoría
  const enabledItemsByCategory = useMemo(() => {
    const grouped = {};
    enabledItems.forEach(item => {
      const category = item.category || 'OTROS';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [enabledItems]);

  // Agrupar items deshabilitados por categoría
  const disabledItemsByCategory = useMemo(() => {
    const grouped = {};
    disabledItems.forEach(item => {
      const category = item.category || 'OTROS';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [disabledItems]);

  // Usar el servicio para obtener el siguiente número disponible
  const getNextNumberForCategory = (category) => {
    return menuService.getNextNumberForCategory(menuItems, category);
  };

  const handleAddNew = () => {
    // Si estamos en modo refrescos, no hacer nada (la gestión está integrada en la vista)
    if (showRefrescosOnly) {
      // El usuario puede agregar tipos directamente en la vista integrada
      return;
    }
    
    // Para otras categorías, crear un nuevo item normalmente
    const firstCategoryKey = Object.values(MENU_CATEGORIES)[0]?.key || 'ENTRANTES';
    const suggestedNumber = getNextNumberForCategory(firstCategoryKey);
    setFormData({
      number: suggestedNumber,
      nameEs: '',
      nameEn: '',
      nameZh: '',
      description: '',
      price: '',
      category: firstCategoryKey,
      extras: [],
      image: '',
      drinkOptions: null,
      enabled: true
    });
    setSelectedCategory(null);
    setShowRefrescosOnly(false);
    // Usar false para indicar que es un nuevo item (no null para que se muestre el formulario)
    setEditingItem(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      number: item.number?.toString() || '',
      nameEs: item.nameEs || '',
      nameEn: item.nameEn || '',
      description: item.descriptionEs || item.description || '',
      price: item.price?.toString() || '',
      category: item.category || Object.values(MENU_CATEGORIES)[0]?.key || 'ENTRANTES',
      nameZh: item.nameZh || '',
      extras: item.extras || [],
      image: item.image || '',
      drinkOptions: item.drinkOptions || null, // null = usar tipos globales, array = tipos específicos
      enabled: item.enabled !== false // Por defecto true si no está definido
    });
  };

  const handleSave = () => {
    // Validar campos requeridos
    if (!formData.nameEs || !formData.price) {
      Alert.alert('Error', 'Nombre en español y precio son obligatorios');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return;
    }

    // Obtener categoryEn basado en la categoría seleccionada
    const categoryEnMap = {
      'ENTRANTES': 'STARTERS',
      'GYOZAS A LA PLANCHA': 'GRILLED GYOZAS',
      'GYOZAS FRITAS': 'FRIED GYOZAS',
      'GYOZAS AL VAPOR': 'STEAMED GYOZAS',
      'DIMSUM': 'DIMSUM',
      'PRINCIPALES': 'MAIN DISHES',
      'BEBIDAS': 'DRINKS'
    };

    const newItem = {
      id: editingItem && editingItem !== false ? editingItem.id : Date.now(),
      number: formData.number || undefined,
      nameEs: formData.nameEs,
      nameEn: formData.nameEn || undefined,
      nameZh: formData.nameZh || undefined,
      descriptionEs: formData.description || undefined,
      descriptionEn: undefined,
      price: price,
      category: formData.category,
      categoryEn: categoryEnMap[formData.category] || formData.category,
      quantity: null,
      image: formData.image.trim() || undefined,
      drinkOptions: formData.drinkOptions && formData.drinkOptions.length > 0 ? formData.drinkOptions : undefined,
      enabled: formData.enabled !== false // Por defecto true
    };

    if (editingItem && editingItem !== false) {
      // Editar item existente
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
      Alert.alert('Éxito', 'Item actualizado correctamente');
    } else {
      // Agregar nuevo item
      setMenuItems(prev => [...prev, newItem]);
      Alert.alert('Éxito', 'Item agregado correctamente');
    }

    // Limpiar formulario
    setEditingItem(null);
    setFormData({
      number: '',
      nameEs: '',
      nameEn: '',
      description: '',
      price: '',
      category: Object.values(MENU_CATEGORIES)[0]?.key || 'ENTRANTES',
      extras: [],
      image: ''
    });
  };

  const handleToggleEnabled = (item) => {
    // Determinar el estado actual (por defecto true si no está definido)
    const currentEnabled = item.enabled !== false;
    const newEnabled = !currentEnabled;
    
    // Actualizar el estado
    setMenuItems(prev => {
      const updated = prev.map(i => {
        if (i.id === item.id) {
          // Crear un nuevo objeto con el campo enabled actualizado
          return { ...i, enabled: newEnabled };
        }
        return i;
      });
      return updated;
    });
    
    // Mostrar confirmación después de actualizar
    Alert.alert('Éxito', `Item ${newEnabled ? 'habilitado' : 'deshabilitado'} correctamente`);
  };

  // Calcular estadísticas por item individual usando el servicio
  const itemStats = useMemo(() => {
    return statisticsService.calculateDailyStatsByItem(
      tableOrders,
      getTableOrders,
      isTableOccupied,
      allTables
    );
  }, [allTables, tableOrders, isTableOccupied, getTableOrders]);

  const handleGenerateQR = (tableNumber) => {
    setSelectedTableForQR(tableNumber);
    setShowQRSelectorModal(false);
    setShowQRModal(true);
  };

  const handleGenerateAllQRs = (allTables) => {
    setShowQRSelectorModal(false);
    // Generar QRs para todas las mesas
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const qrData = allTables.map(table => {
      const url = `${baseUrl}/?table=${table}&mode=client`;
      return { table, url };
    });
    
    // Mostrar información de todas las URLs
    const urlsText = qrData.map(({ table, url }) => `Mesa ${table}: ${url}`).join('\n\n');
    Alert.alert(
      'Códigos QR Generados',
      `Se generaron ${allTables.length} códigos QR.\n\nURLs:\n\n${urlsText}`,
      [
        { text: 'OK' },
        {
          text: 'Copiar Todas',
          onPress: () => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(urlsText);
              Alert.alert('Éxito', 'Todas las URLs copiadas al portapapeles');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Botones de Acciones */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => setShowStatistics(true)}
        >
          <Text style={styles.statsButtonText}>📊 Ver Estadísticas Históricas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setShowQRSelectorModal(true)}
        >
          <Text style={styles.qrButtonText}>📱 Generar Códigos QR</Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas por item del día */}
      {Object.keys(itemStats).length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>📊 Estadísticas del Día</Text>
          <ScrollView style={styles.statsScroll} nestedScrollEnabled={true}>
            {Object.entries(itemStats).map(([category, items]) => (
              <View key={category} style={styles.categoryStatsSection}>
                <Text style={styles.categoryStatsTitle}>
                  {getCategoryDisplayName(category)} ({items.length} items)
                </Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemStatCard}>
                    <View style={styles.itemStatInfo}>
                      <Text style={styles.itemStatName}>{item.name}</Text>
                      {item.nameEn && (
                        <Text style={styles.itemStatNameEn}>{item.nameEn}</Text>
                      )}
                    </View>
                    <View style={styles.itemStatNumbers}>
                      <Text style={styles.itemStatQuantity}>{item.total}x</Text>
                      <Text style={styles.itemStatPrice}>
                        {(item.price * item.total).toFixed(2)}€
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t.common.searchPlaceholder}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtros por categoría */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && !showRefrescosOnly && styles.categoryChipActive]}
          onPress={() => {
            setSelectedCategory(null);
            setShowRefrescosOnly(false);
          }}
        >
          <Text style={[styles.categoryChipText, !selectedCategory && !showRefrescosOnly && styles.categoryChipTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryChip, styles.refrescosChip, showRefrescosOnly && styles.categoryChipActive]}
          onPress={() => {
            setSelectedCategory(null);
            setShowRefrescosOnly(true);
          }}
        >
          <Text style={[styles.categoryChipText, showRefrescosOnly && styles.categoryChipTextActive]}>
            Refrescos
          </Text>
        </TouchableOpacity>
        {Object.keys(MENU_CATEGORIES).map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryChip, selectedCategory === category && !showRefrescosOnly && styles.categoryChipActive]}
            onPress={() => {
              setSelectedCategory(category);
              setShowRefrescosOnly(false);
            }}
          >
            <Text style={[styles.categoryChipText, selectedCategory === category && !showRefrescosOnly && styles.categoryChipTextActive]}>
              {MENU_CATEGORIES[category]?.nameEs || category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Botón agregar nuevo */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Text style={styles.addButtonText}>
          {showRefrescosOnly ? '+ Agregar Nuevo Tipo de Refresco' : '+ Agregar Nuevo Item'}
        </Text>
      </TouchableOpacity>

      {/* Formulario de edición/creación */}
      {editingItem !== null && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingItem && editingItem !== false ? 'Editar Item' : 'Nuevo Item'}
          </Text>
          
          <TextInput
            style={styles.formInput}
            placeholder="Número (opcional)"
            placeholderTextColor="#999"
            value={formData.number}
            onChangeText={(text) => setFormData({...formData, number: text})}
            keyboardType="numeric"
          />
          {editingItem === false && (
            <Text style={styles.suggestedNumberText}>
              💡 Sugerencia: {formData.number || getNextNumberForCategory(formData.category)}
            </Text>
          )}
          
          <TextInput
            style={styles.formInput}
            placeholder="Nombre en español *"
            placeholderTextColor="#999"
            value={formData.nameEs}
            onChangeText={(text) => setFormData({...formData, nameEs: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Nombre en inglés (opcional)"
            placeholderTextColor="#999"
            value={formData.nameEn}
            onChangeText={(text) => setFormData({...formData, nameEn: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Nombre en chino (opcional)"
            placeholderTextColor="#999"
            value={formData.nameZh || ''}
            onChangeText={(text) => setFormData({...formData, nameZh: text})}
          />
          
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Descripción (opcional)"
            placeholderTextColor="#999"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Precio *"
            placeholderTextColor="#999"
            value={formData.price}
            onChangeText={(text) => setFormData({...formData, price: text})}
            keyboardType="decimal-pad"
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="URL de Imagen (opcional)"
            placeholderTextColor="#999"
            value={formData.image}
            onChangeText={(text) => setFormData({...formData, image: text})}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <Text style={styles.formLabel}>Categoría:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(MENU_CATEGORIES).map(category => {
              const categoryKey = MENU_CATEGORIES[category]?.key;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    formData.category === categoryKey && styles.categoryOptionActive
                  ]}
                  onPress={() => {
                    const suggestedNumber = editingItem === false 
                      ? getNextNumberForCategory(categoryKey) 
                      : formData.number;
                    setFormData({
                      ...formData, 
                      category: categoryKey,
                      number: editingItem === false ? suggestedNumber : formData.number
                    });
                  }}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    formData.category === categoryKey && styles.categoryOptionTextActive
                  ]}>
                    {MENU_CATEGORIES[category]?.nameEs || category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selector de tipos de refrescos (solo para refrescos) */}
          {formData.category === 'BEBIDAS' && (
            <View style={styles.drinkOptionsFormSection}>
              <Text style={styles.formLabel}>Tipos de Refrescos:</Text>
              <Text style={styles.formSubLabel}>
                {formData.drinkOptions && formData.drinkOptions.length > 0 
                  ? 'Usar tipos específicos para este refresco' 
                  : 'Usar tipos globales (todos los refrescos)'}
              </Text>
              <TouchableOpacity
                style={styles.toggleDrinkOptionsButton}
                onPress={() => {
                  if (formData.drinkOptions && formData.drinkOptions.length > 0) {
                    // Cambiar a tipos globales
                    setFormData({ ...formData, drinkOptions: null });
                  } else {
                    // Cambiar a tipos específicos (copiar los globales)
                    setFormData({ ...formData, drinkOptions: [...drinkOptions] });
                  }
                }}
              >
                <Text style={styles.toggleDrinkOptionsButtonText}>
                  {formData.drinkOptions && formData.drinkOptions.length > 0 
                    ? 'Usar Tipos Globales' 
                    : 'Usar Tipos Específicos'}
                </Text>
              </TouchableOpacity>
              
              {formData.drinkOptions && formData.drinkOptions.length > 0 && (
                <View style={styles.drinkOptionsCheckboxes}>
                  {drinkOptions.map((option, index) => {
                    const isSelected = formData.drinkOptions.includes(option);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.drinkOptionCheckbox}
                        onPress={() => {
                          const newOptions = isSelected
                            ? formData.drinkOptions.filter(o => o !== option)
                            : [...formData.drinkOptions, option];
                          setFormData({ ...formData, drinkOptions: newOptions });
                        }}
                      >
                        <View style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected
                        ]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.drinkOptionCheckboxText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setEditingItem(null);
                setFormData({
                  number: '',
                  nameEs: '',
                  nameEn: '',
                  description: '',
                  price: '',
                  category: Object.values(MENU_CATEGORIES)[0]?.key || 'ENTRANTES',
                  extras: [],
                  image: '',
                  enabled: true
                });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de items */}
      <ScrollView style={styles.itemsList}>
        {/* Sección de Items Habilitados */}
        {Object.keys(enabledItemsByCategory).length > 0 && (
          <View style={styles.statusSection}>
            <Text style={styles.statusSectionTitle}>✅ Items Habilitados</Text>
            {showRefrescosOnly ? (
              <>
                {/* Gestión de Tipos de Refrescos */}
                <View key="drink-options-management" style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>
                    {t.admin.drinkTypes} ({drinkOptions.length})
                  </Text>
                  
                  {/* Lista de tipos de refrescos */}
                  {drinkOptions.map((option, index) => (
                    <View key={index} style={styles.drinkOptionCard}>
                      <View style={styles.drinkOptionContent}>
                        <Text style={styles.drinkOptionName}>{option}</Text>
                        <View style={styles.drinkOptionActions}>
                          {editingDrinkOptionIndex === index ? (
                            <>
                              <TouchableOpacity
                                style={[styles.drinkOptionActionButton, styles.saveButton]}
                                onPress={() => {
                                  if (newDrinkOption.trim()) {
                                    updateDrinkOption(index, newDrinkOption.trim());
                                    setEditingDrinkOptionIndex(null);
                                    setNewDrinkOption('');
                                  }
                                }}
                              >
                                <Text style={styles.drinkOptionActionButtonText}>✓</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.drinkOptionActionButton, styles.cancelButton]}
                                onPress={() => {
                                  setEditingDrinkOptionIndex(null);
                                  setNewDrinkOption('');
                                }}
                              >
                                <Text style={styles.drinkOptionActionButtonText}>✕</Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <TouchableOpacity
                                style={[styles.drinkOptionActionButton, styles.editButton]}
                                onPress={() => {
                                  setEditingDrinkOptionIndex(index);
                                  setNewDrinkOption(option);
                                }}
                              >
                                <Text style={styles.drinkOptionActionButtonText}>✏️</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.drinkOptionActionButton, styles.deleteButton]}
                                onPress={() => {
                                  Alert.alert(
                                    t.admin.deleteDrinkType,
                                    t.admin.confirmDeleteDrinkType(option),
                                    [
                                      { text: t.common.cancel, style: 'cancel' },
                                      {
                                        text: t.common.delete,
                                        style: 'destructive',
                                        onPress: () => deleteDrinkOption(index)
                                      }
                                    ]
                                  );
                                }}
                              >
                                <Text style={styles.drinkOptionActionButtonText}>🗑️</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                      {editingDrinkOptionIndex === index && (
                        <TextInput
                          style={styles.drinkOptionEditInput}
                          value={newDrinkOption}
                          onChangeText={setNewDrinkOption}
                          placeholder={t.admin.drinkTypeName}
                          placeholderTextColor="#999"
                          autoFocus
                        />
                      )}
                    </View>
                  ))}

                  {/* Agregar nuevo tipo */}
                  <View style={styles.addDrinkOptionContainer}>
                    <TextInput
                      style={styles.addDrinkOptionInput}
                      placeholder={t.admin.newDrinkType}
                      placeholderTextColor="#999"
                      value={editingDrinkOptionIndex === null ? newDrinkOption : ''}
                      onChangeText={setNewDrinkOption}
                      editable={editingDrinkOptionIndex === null}
                    />
                    <TouchableOpacity
                      style={styles.addDrinkOptionButton}
                      onPress={() => {
                        if (newDrinkOption.trim() && editingDrinkOptionIndex === null) {
                          addDrinkOption(newDrinkOption.trim());
                          setNewDrinkOption('');
                        }
                      }}
                    >
                      <Text style={styles.addDrinkOptionButtonText}>+ {t.common.add}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Items de Refrescos */}
                <View key="enabled-refrescos" style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>
                    {t.admin.softDrinks} ({enabledItems.length})
                  </Text>
                  {enabledItems.map(item => (
                    <View key={item.id} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemInfo}>
                          {item.number && (
                            <Text style={styles.itemNumber}>#{item.number}</Text>
                          )}
                          <Text style={styles.itemName}>{item.nameEs}</Text>
                          {item.nameEn && (
                            <Text style={styles.itemNameEn}>{item.nameEn}</Text>
                          )}
                          {item.nameZh && (
                            <Text style={styles.itemNameEn}>{item.nameZh}</Text>
                          )}
                        </View>
                        <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
                      </View>
                      {(item.descriptionEs || item.description) && (
                        <Text style={styles.itemDescription}>
                          {item.descriptionEs || item.description}
                        </Text>
                      )}
                      <View style={styles.itemActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleEdit(item)}
                        >
                          <Text style={styles.actionButtonText}>{t.common.edit}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.disableButton]}
                          onPress={() => handleToggleEnabled(item)}
                        >
                          <Text style={styles.actionButtonText}>{t.admin.disable}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                {Object.entries(enabledItemsByCategory).map(([category, items]) => (
                  <View key={`enabled-${category}`} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>
                      {getCategoryDisplayName(category)} ({items.length})
                    </Text>
                    {items.map(item => (
                      <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <View style={styles.itemInfo}>
                            {item.number && (
                              <Text style={styles.itemNumber}>#{item.number}</Text>
                            )}
                            <Text style={styles.itemName}>{item.nameEs}</Text>
                            {item.nameEn && (
                              <Text style={styles.itemNameEn}>{item.nameEn}</Text>
                            )}
                          </View>
                          <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
                        </View>
                        {(item.descriptionEs || item.description) && (
                          <Text style={styles.itemDescription}>
                            {item.descriptionEs || item.description}
                          </Text>
                        )}
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => handleEdit(item)}
                          >
                            <Text style={styles.actionButtonText}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.disableButton]}
                            onPress={() => handleToggleEnabled(item)}
                          >
                            <Text style={styles.actionButtonText}>Deshabilitar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Sección de Items Deshabilitados */}
        {Object.keys(disabledItemsByCategory).length > 0 && (
          <View style={styles.statusSection}>
            <Text style={[styles.statusSectionTitle, styles.statusSectionTitleDisabled]}>
              ❌ Items Deshabilitados
            </Text>
            {Object.entries(disabledItemsByCategory).map(([category, items]) => (
              <View key={`disabled-${category}`} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>
                  {getCategoryDisplayName(category)} ({items.length})
                </Text>
                {items.map(item => (
                  <View key={item.id} style={[styles.itemCard, styles.itemCardDisabled]}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemInfo}>
                        {item.number && (
                          <Text style={styles.itemNumber}>#{item.number}</Text>
                        )}
                        <Text style={styles.itemName}>{item.nameEs}</Text>
                        {item.nameEn && (
                          <Text style={styles.itemNameEn}>{item.nameEn}</Text>
                        )}
                      </View>
                      <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
                    </View>
                    {(item.descriptionEs || item.description) && (
                      <Text style={styles.itemDescription}>
                        {item.descriptionEs || item.description}
                      </Text>
                    )}
                    <View style={styles.disabledBadge}>
                      <Text style={styles.disabledBadgeText}>DESHABILITADO</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item)}
                      >
                        <Text style={styles.actionButtonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.enableButton]}
                        onPress={() => handleToggleEnabled(item)}
                      >
                        <Text style={styles.actionButtonText}>Habilitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Mensaje si no hay items */}
        {Object.keys(enabledItemsByCategory).length === 0 && Object.keys(disabledItemsByCategory).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron items</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Estadísticas Históricas */}
      <StatisticsModal
        visible={showStatistics}
        onClose={() => setShowStatistics(false)}
      />

      {/* Modal de Selección de Mesas para QR */}
      <QRTableSelectorModal
        visible={showQRSelectorModal}
        onClose={() => setShowQRSelectorModal(false)}
        onSelectTable={handleGenerateQR}
        onGenerateAll={handleGenerateAllQRs}
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />

      {/* Modal de Generación de QR */}
      <QRGeneratorModal
        visible={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedTableForQR(null);
        }}
        tableNumber={selectedTableForQR}
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        logoUrl={null} // Puedes agregar una URL de logo aquí, ej: 'https://ejemplo.com/logo.png'
        restaurantName="Dumplings Restaurant"
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 15,
  },
  searchContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFD700',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  categoryFilter: {
    marginBottom: 15,
    maxHeight: 50,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  categoryChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  categoryChipText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  formInput: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 12,
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formLabel: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 8,
    fontWeight: '600',
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#3A3A3A',
    marginRight: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  categoryOptionActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  categoryOptionText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryOptionTextActive: {
    color: '#1A1A1A',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  itemsList: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
    paddingBottom: 5,
  },
  itemCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  itemInfo: {
    flex: 1,
  },
  itemNumber: {
    fontSize: 12,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  itemNameEn: {
    fontSize: 12,
    color: '#FFA500',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginBottom: 10,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#FFA500',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  disableButton: {
    backgroundColor: '#FF9800',
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  disabledBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  disabledBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusSection: {
    marginBottom: 30,
  },
  statusSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  statusSectionTitleDisabled: {
    color: '#F44336',
    borderBottomColor: '#F44336',
  },
  itemCardDisabled: {
    opacity: 0.7,
    borderLeftColor: '#F44336',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  suggestedNumberText: {
    fontSize: 12,
    color: '#FFA500',
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 10,
  },
  statsContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: isMobile ? 12 : 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  statsTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  statsScroll: {
    maxHeight: 400,
  },
  categoryStatsSection: {
    marginBottom: 20,
  },
  categoryStatsTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
  },
  itemStatCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: isMobile ? 10 : 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  itemStatInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemStatName: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  itemStatNameEn: {
    fontSize: isMobile ? 11 : 12,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  itemStatNumbers: {
    alignItems: 'flex-end',
  },
  itemStatQuantity: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  itemStatPrice: {
    fontSize: isMobile ? 12 : 14,
    color: '#FFA500',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  statsButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: isMobile ? 15 : 18,
    alignItems: 'center',
    marginTop: 0,
    borderWidth: 2,
    borderColor: '#45A049',
    minHeight: 50,
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  statsButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
  },
  qrButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: isMobile ? 15 : 18,
    alignItems: 'center',
    marginTop: 0,
    borderWidth: 2,
    borderColor: '#1976D2',
    minHeight: 50,
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  qrButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  drinkOptionsModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: isMobile ? 20 : 30,
    width: isMobile ? '90%' : '600px',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#FFD700',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.5)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  modalTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  drinkOptionsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  drinkOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  drinkOptionText: {
    flex: 1,
    fontSize: isMobile ? 14 : 16,
    color: '#FFF',
    fontWeight: '500',
  },
  drinkOptionInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    padding: 10,
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginRight: 10,
  },
  drinkOptionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  drinkOptionButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  addDrinkOptionContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  addDrinkOptionInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  addDrinkOptionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#45A049',
  },
  addDrinkOptionButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
  },
  drinkOptionCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
    borderColor: '#555',
  },
  drinkOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drinkOptionName: {
    flex: 1,
    fontSize: isMobile ? 14 : 16,
    color: '#FFF',
    fontWeight: '500',
  },
  drinkOptionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  drinkOptionActionButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  drinkOptionActionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drinkOptionEditInput: {
    marginTop: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    padding: 10,
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  modalCloseButton: {
    backgroundColor: '#666',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#777',
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
  },
  drinkOptionsFormSection: {
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  formSubLabel: {
    fontSize: isMobile ? 12 : 14,
    color: '#FFA500',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  toggleDrinkOptionsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#45A049',
  },
  toggleDrinkOptionsButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
  },
  drinkOptionsCheckboxes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  drinkOptionCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    minWidth: 120,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  drinkOptionCheckboxText: {
    color: '#FFF',
    fontSize: isMobile ? 12 : 14,
  },
});

export default AdminView;

