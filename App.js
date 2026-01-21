import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import TablesScreen from './components/TablesScreen';
import MenuByCategory from './components/MenuByCategory';
import OrderView from './components/OrderView';
import ChangeTableModal from './components/ChangeTableModal';
import DiscountCalculator from './components/DiscountCalculator';
import ViewSelector from './components/ViewSelector';
import KitchenView from './components/KitchenView';
import KitchenOrdersView from './components/KitchenOrdersView';
import WaiterOrdersView from './components/WaiterOrdersView';
import ClientView from './components/ClientView';
import AdminView from './components/AdminView';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import QRScannerView from './components/QRScannerView';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { TableOrdersProvider, useTableOrdersContext } from './contexts/TableOrdersContext';
import { MenuProvider, useMenuContext } from './contexts/MenuContext';
import { useMenuHandlers } from './hooks/useMenuHandlers';
import { useOrderHandlers } from './hooks/useOrderHandlers';
import { useTranslations } from './utils/translations';

// Componente principal de la aplicación
function AppContent() {
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('tables'); // 'tables' o 'menu'
  const [showOrderView, setShowOrderView] = useState(false);
  const [clientMode, setClientMode] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Detectar parámetros de URL al cargar (modo cliente desde QR)
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      const modeParam = urlParams.get('mode');
      
      if (modeParam === 'client' && tableParam) {
        const tableNumber = parseInt(tableParam, 10);
        if (!isNaN(tableNumber)) {
          setSelectedTable(tableNumber);
          setClientMode(true);
          setCurrentScreen('menu');
        }
      }
    }
  }, []);

  // Contexto de la aplicación
  const { isAuthenticated, userRole, login, logout, currentView, setLastUpdate, language } = useAppContext();
  const { menuData } = useMenuContext();
  const t = useTranslations(language);
  
  // Hook personalizado para manejar pedidos (desde contexto compartido)
  // IMPORTANTE: Todos los hooks deben llamarse antes de cualquier return condicional
  const {
    tableOrders,
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    getTableTotal,
    isTableOccupied,
    clearTable,
    getTableOrders,
    moveTableOrders,
    setTableDiscount,
    getTableDiscount,
    getTableTotalWithDiscount,
    payTableItems,
    getTableHistory,
    getTableHistoryTotal,
    setKitchenTimestamp,
    getKitchenTimestamp,
    getKitchenComment,
    setKitchenComment
  } = useTableOrdersContext();

  // Estados para modales
  const [showChangeTableModal, setShowChangeTableModal] = useState(false);
  const [showDiscountCalculator, setShowDiscountCalculator] = useState(false);

  // Hooks personalizados para manejar menú y pedidos
  // IMPORTANTE: Todos los hooks deben estar antes de los returns condicionales
  const {
    selectedExtras,
    selectedDrink,
    selectedOptions,
    toggleExtra,
    handleSelectOption,
    handleSelectDrink,
    handleAddItem: originalHandleAddItem,
    handleAddDrink: originalHandleAddDrink
  } = useMenuHandlers(selectedTable, addItemToTable);

  // Wrapper para handleAddItem que limpia la búsqueda después de agregar
  const handleAddItem = (item) => {
    originalHandleAddItem(item);
    setSearchQuery(''); // Limpiar búsqueda después de agregar item
  };

  // Wrapper para handleAddDrink que limpia la búsqueda después de agregar
  const handleAddDrink = (item, drink) => {
    originalHandleAddDrink(item, drink);
    setSearchQuery(''); // Limpiar búsqueda después de agregar bebida
  };
  
  const {
    currentOrders,
    currentTotal,
    currentDiscount,
    currentTotalWithDiscount,
    currentOccupied,
    historyTotal
  } = useOrderHandlers(
    selectedTable,
    tableOrders,
    getTableOrders,
    getTableTotal,
    getTableDiscount,
    getTableTotalWithDiscount,
    isTableOccupied,
    getTableHistoryTotal
  );

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Login onLogin={login} />
      </SafeAreaView>
    );
  }

  // Si es administrador, mostrar vista de administración
  if (userRole === 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header />
        <View style={styles.adminHeader}>
          <Text style={styles.adminTitle}>Panel de Administración</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
        <AdminView />
        <Footer />
      </SafeAreaView>
    );
  }

  // Función wrapper para mover mesas que actualiza el estado
  const handleMoveTable = (fromTable, toTable) => {
    const success = moveTableOrders(fromTable, toTable);
    if (success) {
      setSelectedTable(toTable);
    }
    return success;
  };


  // Manejar selección de mesa
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setCurrentScreen('menu');
  };

  // Si estamos en vista de cocina (para rol general), mostrar KitchenView
  if (currentView === 'kitchen' && userRole !== 'kitchen') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header />
        <ViewSelector />
        <KitchenView />
        <Footer />
      </SafeAreaView>
    );
  }

  // Si el usuario es de cocina, mostrar KitchenOrdersView (vista especial)
  if (userRole === 'kitchen' && currentView === 'kitchen-orders') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header />
        <View style={styles.kitchenHeader}>
          <Text style={styles.kitchenTitle}>{t.views.kitchenView}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>{t.views.logoutButton}</Text>
          </TouchableOpacity>
        </View>
        <KitchenOrdersView />
        <Footer />
      </SafeAreaView>
    );
  }

  // Si estamos en vista de comandas de camarero
  if (currentView === 'waiter-orders') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header />
        <ViewSelector />
        <WaiterOrdersView />
        <Footer />
      </SafeAreaView>
    );
  }

  // Si estamos en vista de cliente
  if (currentView === 'client') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header />
        <ViewSelector />
        <ClientView />
        <Footer />
      </SafeAreaView>
    );
  }

  // Modo cliente desde QR (sin autenticación)
  if (clientMode && selectedTable) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.clientModeHeader}>
          <Text style={styles.clientModeTitle}>🍜 Mesa {selectedTable}</Text>
          <Text style={styles.clientModeSubtitle}>Agrega items a tu comanda</Text>
        </View>

        {/* Vista de Pedido del Cliente */}
        {currentOccupied && (
          <OrderView
            selectedTable={selectedTable}
            orders={currentOrders}
            total={currentTotal}
            totalWithDiscount={currentTotalWithDiscount}
            discount={currentDiscount}
            occupied={currentOccupied}
            historyTotal={historyTotal}
            onRemoveItem={removeItemFromTable}
            onUpdateQuantity={updateItemQuantity}
            onClearTable={() => {}}
            onShowChangeTable={() => {}}
            onShowDiscount={() => {}}
            onPayItems={() => {}}
            onPayAll={() => {}}
            setKitchenTimestamp={() => {}}
            getKitchenComment={() => null}
            setKitchenComment={() => {}}
            isClientMode={true}
          />
        )}

        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t.common.searchPlaceholder}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menú agrupado por categorías */}
        <MenuByCategory
          menuData={menuData}
          searchQuery={searchQuery}
          selectedTable={selectedTable}
          selectedExtras={selectedExtras}
          selectedDrink={selectedDrink}
          selectedOptions={selectedOptions}
          onToggleExtra={toggleExtra}
          onSelectOption={handleSelectOption}
          onSelectDrink={handleSelectDrink}
          onAddDrink={handleAddDrink}
          onAddItem={handleAddItem}
        />
      </SafeAreaView>
    );
  }

  // Renderizar pantalla de mesas
  if (currentScreen === 'tables') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header />
        <ViewSelector />
        <TablesScreen
          onSelectTable={handleSelectTable}
          isTableOccupied={isTableOccupied}
          selectedTable={selectedTable}
        />
        <Footer />
      </SafeAreaView>
    );
  }

  // Renderizar pantalla de menú (vista de camarero)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <ViewSelector />
      
      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('tables')}
        >
          <Text style={styles.backButtonText}>← Mesas</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Menú para Camareros</Text>
        {selectedTable && (
          <Text style={styles.subtitle}>Mesa {selectedTable}</Text>
        )}
      </View>

      {/* Toggle de Vista de Pedido */}
      {selectedTable && (
        <View style={styles.orderToggleContainer}>
          <TouchableOpacity
            style={styles.orderToggleButton}
            onPress={() => setShowOrderView(!showOrderView)}
          >
            <Text style={styles.orderToggleText}>
              {showOrderView ? 'Ocultar Pedido' : 'Ver Pedido'}
              {currentOccupied && ` (${currentOrders.length} items)`}
            </Text>
            <Text style={styles.orderToggleArrow}>{showOrderView ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vista de Pedido */}
      {showOrderView && selectedTable && (
        <OrderView
          selectedTable={selectedTable}
          orders={currentOrders}
          total={currentTotal}
          totalWithDiscount={currentTotalWithDiscount}
          discount={currentDiscount}
          occupied={currentOccupied}
          historyTotal={historyTotal}
          onRemoveItem={removeItemFromTable}
          onUpdateQuantity={updateItemQuantity}
          onClearTable={clearTable}
          onShowChangeTable={() => setShowChangeTableModal(true)}
          onShowDiscount={() => setShowDiscountCalculator(true)}
          onPayItems={(orderIds) => payTableItems(selectedTable, orderIds)}
          onPayAll={() => payTableItems(selectedTable, null)}
          setKitchenTimestamp={setKitchenTimestamp}
          getKitchenComment={getKitchenComment}
          setKitchenComment={setKitchenComment}
        />
      )}

      {/* Modal de Cambiar Mesa */}
      <ChangeTableModal
        visible={showChangeTableModal}
        onClose={() => setShowChangeTableModal(false)}
        currentTable={selectedTable}
        onMoveTable={handleMoveTable}
        isTableOccupied={isTableOccupied}
      />

      {/* Calculadora de Descuentos */}
      <DiscountCalculator
        visible={showDiscountCalculator}
        onClose={() => setShowDiscountCalculator(false)}
        onApply={(discount) => setTableDiscount(selectedTable, discount)}
        currentTotal={currentTotal}
      />

      {/* Barra de Búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t.common.searchPlaceholder}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menú agrupado por categorías */}
      <MenuByCategory
        menuData={menuData}
        searchQuery={searchQuery}
        selectedTable={selectedTable}
        selectedExtras={selectedExtras}
        selectedDrink={selectedDrink}
        selectedOptions={selectedOptions}
        onToggleExtra={toggleExtra}
        onSelectOption={handleSelectOption}
        onSelectDrink={handleSelectDrink}
        onAddDrink={handleAddDrink}
        onAddItem={handleAddItem}
      />
      <Footer />
    </SafeAreaView>
  );
}

// Componente raíz con Provider
export default function App() {
  return (
    <AppProvider>
      <MenuProvider>
        <TableOrdersProvider>
          <AppContent />
        </TableOrdersProvider>
      </MenuProvider>
    </AppProvider>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    backgroundColor: '#FFD700',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#FFA500',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 15,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFD700',
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  orderToggleContainer: {
    margin: 15,
    marginTop: 0,
    marginBottom: 10,
  },
  orderToggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  orderToggleText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  orderToggleArrow: {
    color: '#1A1A1A',
    fontSize: 12,
  },
  clientModeHeader: {
    backgroundColor: '#FFD700',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#FFA500',
    alignItems: 'center',
  },
  clientModeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 5,
  },
  clientModeSubtitle: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    opacity: 0.8,
  },
  kitchenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: isMobile ? 15 : 20,
    paddingTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#FFA500',
  },
  kitchenTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: isMobile ? 15 : 20,
    paddingTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#FFA500',
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
  adminTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: isMobile ? 15 : 20,
    paddingVertical: isMobile ? 10 : 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D32F2F',
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
  logoutButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
  },
});
