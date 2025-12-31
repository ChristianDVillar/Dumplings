import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, Dimensions } from 'react-native';
import { MENU_CATEGORIES, getCategoryDisplayName } from '../utils/menuCategories';
import { useMenuContext } from '../contexts/MenuContext';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import StatisticsModal from './StatisticsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const AdminView = () => {
  const { menuData: menuItems, setMenuData: setMenuItems } = useMenuContext();
  const { tableOrders, getTableOrders, isTableOccupied } = useTableOrdersContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.takeaway];

  // Formulario para nuevo/editar item
  const [formData, setFormData] = useState({
    number: '',
    nameEs: '',
    nameEn: '',
    description: '',
    price: '',
    category: '',
    extras: [],
    image: ''
  });

  // Filtrar items por categoría y búsqueda (sin filtrar por enabled)
  const filteredItems = useMemo(() => {
    // Crear una copia del array para evitar problemas de referencia
    let items = [...menuItems];

    if (selectedCategory) {
      // Obtener la key real de la categoría desde MENU_CATEGORIES
      const categoryKey = MENU_CATEGORIES[selectedCategory]?.key || selectedCategory;
      items = items.filter(item => item.category === categoryKey);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.nameEs.toLowerCase().includes(query) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(query)) ||
        (item.number && item.number.toString().includes(query)) ||
        ((item.descriptionEs || item.description) && (item.descriptionEs || item.description).toLowerCase().includes(query))
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

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

  // Función para obtener el siguiente número disponible según la categoría
  const getNextNumberForCategory = (category) => {
    // Mapeo de categorías a rangos de números iniciales
    const categoryNumberRanges = {
      'ENTRANTES': { start: 1, end: 10 },
      'MO XIAN': { start: 11, end: 20 },
      'GYOZAS A LA PLANCHA': { start: 21, end: 30 },
      'GYOZAS FRITAS': { start: 31, end: 40 },
      'GYOZAS AL VAPOR': { start: 41, end: 50 },
      'DIMSUM': { start: 51, end: 60 },
      'PRINCIPALES': { start: 61, end: 80 },
      'PARA IR CON TODO': { start: 61, end: 70 }, // Mapeada a PRINCIPALES
      'BEBIDAS': { start: 71, end: 99 }
    };

    const range = categoryNumberRanges[category];
    if (!range) {
      return ''; // Si no hay rango definido, retornar vacío
    }

    // Obtener todos los números usados en esta categoría (habilitados y deshabilitados)
    // También incluir "PARA IR CON TODO" si la categoría es "PRINCIPALES"
    const categoriesToCheck = category === 'PRINCIPALES' 
      ? ['PRINCIPALES', 'PARA IR CON TODO']
      : [category];
    
    const usedNumbers = menuItems
      .filter(item => categoriesToCheck.includes(item.category) && item.number)
      .map(item => {
        const num = parseInt(item.number, 10);
        return isNaN(num) ? null : num;
      })
      .filter(num => num !== null && num >= range.start && num <= range.end)
      .sort((a, b) => a - b);

    // Encontrar el primer número disponible en el rango
    for (let i = range.start; i <= range.end; i++) {
      if (!usedNumbers.includes(i)) {
        return i.toString().padStart(2, '0');
      }
    }

    // Si todos los números están ocupados, retornar el siguiente fuera del rango
    return (range.end + 1).toString().padStart(2, '0');
  };

  const handleAddNew = () => {
    const firstCategoryKey = Object.values(MENU_CATEGORIES)[0]?.key || 'ENTRANTES';
    const suggestedNumber = getNextNumberForCategory(firstCategoryKey);
    setFormData({
      number: suggestedNumber,
      nameEs: '',
      nameEn: '',
      description: '',
      price: '',
      category: firstCategoryKey,
      extras: [],
      image: '',
      enabled: true
    });
    setSelectedCategory(null);
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
      extras: item.extras || [],
      image: item.image || '',
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
      descriptionEs: formData.description || undefined,
      descriptionEn: undefined,
      price: price,
      category: formData.category,
      categoryEn: categoryEnMap[formData.category] || formData.category,
      quantity: null,
      image: formData.image.trim() || undefined,
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

  // Calcular estadísticas por item individual de todos los pedidos del día
  const itemStats = useMemo(() => {
    const stats = {};
    
    allTables.forEach(table => {
      if (!isTableOccupied(table)) return;
      
      const tableOrdersList = getTableOrders(table);
      tableOrdersList.forEach(order => {
        const itemId = order.item.id;
        const itemName = order.item.nameEs || 'Sin nombre';
        const category = order.item.category || 'OTROS';
        
        if (!stats[itemId]) {
          stats[itemId] = {
            id: itemId,
            name: itemName,
            nameEn: order.item.nameEn,
            category: category,
            total: 0,
            price: order.price || order.item.price || 0
          };
        }
        stats[itemId].total += order.quantity;
      });
    });
    
    // Convertir a array y ordenar por categoría y luego por cantidad
    const statsArray = Object.values(stats);
    
    // Agrupar por categoría para mostrar organizados
    const groupedByCategory = {};
    statsArray.forEach(stat => {
      if (!groupedByCategory[stat.category]) {
        groupedByCategory[stat.category] = [];
      }
      groupedByCategory[stat.category].push(stat);
    });
    
    // Ordenar cada categoría por cantidad (mayor a menor)
    Object.keys(groupedByCategory).forEach(category => {
      groupedByCategory[category].sort((a, b) => b.total - a.total);
    });
    
    return groupedByCategory;
  }, [allTables, tableOrders, isTableOccupied, getTableOrders]);

  return (
    <View style={styles.container}>
      {/* Botón de Estadísticas Históricas */}
      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => setShowStatistics(true)}
      >
        <Text style={styles.statsButtonText}>📊 Ver Estadísticas Históricas</Text>
      </TouchableOpacity>

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
          placeholder="Buscar items..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtros por categoría */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        {Object.keys(MENU_CATEGORIES).map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
              {MENU_CATEGORIES[category]?.nameEs || category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Botón agregar nuevo */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Text style={styles.addButtonText}>+ Agregar Nuevo Item</Text>
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
  statsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: isMobile ? 15 : 18,
    alignItems: 'center',
    marginBottom: 15,
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
});

export default AdminView;

