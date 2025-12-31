import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { MENU_CATEGORIES, getCategoryDisplayName } from '../utils/menuCategories';
import { useMenuContext } from '../contexts/MenuContext';

const AdminView = () => {
  const { menuData: menuItems, setMenuData: setMenuItems } = useMenuContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Formulario para nuevo/editar item
  const [formData, setFormData] = useState({
    number: '',
    nameEs: '',
    nameEn: '',
    description: '',
    price: '',
    category: '',
    extras: []
  });

  // Filtrar items por categoría y búsqueda
  const filteredItems = useMemo(() => {
    let items = menuItems;

    if (selectedCategory) {
      // Obtener la key real de la categoría desde MENU_CATEGORIES
      const categoryKey = MENU_CATEGORIES[selectedCategory]?.key || selectedCategory;
      items = items.filter(item => item.category === categoryKey);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.nameEs.toLowerCase().includes(query) ||
        item.nameEn.toLowerCase().includes(query) ||
        (item.number && item.number.toString().includes(query)) ||
        ((item.descriptionEs || item.description) && (item.descriptionEs || item.description).toLowerCase().includes(query))
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  // Agrupar items por categoría
  const itemsByCategory = useMemo(() => {
    const grouped = {};
    filteredItems.forEach(item => {
      const category = item.category || 'OTROS';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const handleAddNew = () => {
    setEditingItem(null);
    const firstCategoryKey = Object.values(MENU_CATEGORIES)[0]?.key || 'ENTRANTES';
    setFormData({
      number: '',
      nameEs: '',
      nameEn: '',
      description: '',
      price: '',
      category: firstCategoryKey,
      extras: []
    });
    setSelectedCategory(null);
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
      extras: item.extras || []
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
      id: editingItem ? editingItem.id : Date.now(),
      number: formData.number || undefined,
      nameEs: formData.nameEs,
      nameEn: formData.nameEn || undefined,
      descriptionEs: formData.description || undefined,
      descriptionEn: undefined,
      price: price,
      category: formData.category,
      categoryEn: categoryEnMap[formData.category] || formData.category,
      quantity: null
    };

    if (editingItem) {
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
      extras: []
    });
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar "${item.nameEs}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setMenuItems(prev => prev.filter(i => i.id !== item.id));
            Alert.alert('Éxito', 'Item eliminado correctamente');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Panel de Administración</Text>

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
            {editingItem ? 'Editar Item' : 'Nuevo Item'}
          </Text>
          
          <TextInput
            style={styles.formInput}
            placeholder="Número (opcional)"
            placeholderTextColor="#999"
            value={formData.number}
            onChangeText={(text) => setFormData({...formData, number: text})}
            keyboardType="numeric"
          />
          
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
          
          <Text style={styles.formLabel}>Categoría:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(MENU_CATEGORIES).map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryOption,
                  formData.category === MENU_CATEGORIES[category]?.key && styles.categoryOptionActive
                ]}
                onPress={() => setFormData({...formData, category: MENU_CATEGORIES[category]?.key})}
              >
                <Text style={[
                  styles.categoryOptionText,
                  formData.category === MENU_CATEGORIES[category]?.key && styles.categoryOptionTextActive
                ]}>
                  {MENU_CATEGORIES[category]?.nameEs || category}
                </Text>
              </TouchableOpacity>
            ))}
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
                  extras: []
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
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
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
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={styles.actionButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
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
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AdminView;

