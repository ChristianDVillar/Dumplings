/**
 * Servicio de persistencia de datos usando AsyncStorage
 * Maneja el guardado y carga de datos de la aplicación
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TABLE_ORDERS: '@dumplings:tableOrders',
  TABLE_HISTORY: '@dumplings:tableHistory',
  TABLE_DISCOUNTS: '@dumplings:tableDiscounts',
  TABLE_KITCHEN_TIMESTAMPS: '@dumplings:tableKitchenTimestamps',
  COMPLETED_KITCHEN_ORDERS: '@dumplings:completedKitchenOrders',
  TABLE_KITCHEN_COMMENTS: '@dumplings:tableKitchenComments',
  MENU_DATA: '@dumplings:menuData',
  APP_SETTINGS: '@dumplings:appSettings',
  DRINK_OPTIONS: '@dumplings:drinkOptions'
};

class StorageService {
  /**
   * Guarda datos en AsyncStorage
   * @param {string} key - Clave de almacenamiento
   * @param {any} data - Datos a guardar
   */
  async save(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error guardando ${key}:`, error);
      return false;
    }
  }

  /**
   * Carga datos de AsyncStorage
   * @param {string} key - Clave de almacenamiento
   * @returns {Promise<any|null>} - Datos cargados o null si hay error
   */
  async load(key) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData === null) {
        return null;
      }
      return JSON.parse(jsonData);
    } catch (error) {
      console.error(`[StorageService] Error cargando ${key}:`, error);
      return null;
    }
  }

  /**
   * Elimina datos de AsyncStorage
   * @param {string} key - Clave de almacenamiento
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error eliminando ${key}:`, error);
      return false;
    }
  }

  /**
   * Limpia todos los datos de la aplicación
   */
  async clearAll() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('[StorageService] Error limpiando datos:', error);
      return false;
    }
  }

  /**
   * Guarda los pedidos de las mesas
   */
  async saveTableOrders(tableOrders) {
    return this.save(STORAGE_KEYS.TABLE_ORDERS, tableOrders);
  }

  /**
   * Carga los pedidos de las mesas
   */
  async loadTableOrders() {
    return this.load(STORAGE_KEYS.TABLE_ORDERS);
  }

  /**
   * Guarda el historial de pagos
   */
  async saveTableHistory(tableHistory) {
    return this.save(STORAGE_KEYS.TABLE_HISTORY, tableHistory);
  }

  /**
   * Carga el historial de pagos
   */
  async loadTableHistory() {
    return this.load(STORAGE_KEYS.TABLE_HISTORY);
  }

  /**
   * Guarda los descuentos de las mesas
   */
  async saveTableDiscounts(tableDiscounts) {
    return this.save(STORAGE_KEYS.TABLE_DISCOUNTS, tableDiscounts);
  }

  /**
   * Carga los descuentos de las mesas
   */
  async loadTableDiscounts() {
    return this.load(STORAGE_KEYS.TABLE_DISCOUNTS);
  }

  /**
   * Guarda los timestamps de cocina
   */
  async saveKitchenTimestamps(timestamps) {
    return this.save(STORAGE_KEYS.TABLE_KITCHEN_TIMESTAMPS, timestamps);
  }

  /**
   * Carga los timestamps de cocina
   */
  async loadKitchenTimestamps() {
    return this.load(STORAGE_KEYS.TABLE_KITCHEN_TIMESTAMPS);
  }

  /**
   * Guarda las comandas completadas
   */
  async saveCompletedKitchenOrders(completedOrders) {
    return this.save(STORAGE_KEYS.COMPLETED_KITCHEN_ORDERS, completedOrders);
  }

  /**
   * Carga las comandas completadas
   */
  async loadCompletedKitchenOrders() {
    return this.load(STORAGE_KEYS.COMPLETED_KITCHEN_ORDERS);
  }

  /**
   * Guarda los datos del menú
   */
  async saveMenuData(menuData) {
    return this.save(STORAGE_KEYS.MENU_DATA, menuData);
  }

  /**
   * Carga los datos del menú
   */
  async loadMenuData() {
    return this.load(STORAGE_KEYS.MENU_DATA);
  }

  /**
   * Guarda la configuración de la aplicación
   */
  async saveAppSettings(settings) {
    return this.save(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  /**
   * Carga la configuración de la aplicación
   */
  async loadAppSettings() {
    return this.load(STORAGE_KEYS.APP_SETTINGS);
  }

  /**
   * Guarda los comentarios de las comandas
   */
  async saveKitchenComments(comments) {
    return this.save(STORAGE_KEYS.TABLE_KITCHEN_COMMENTS, comments);
  }

  /**
   * Carga los comentarios de las comandas
   */
  async loadKitchenComments() {
    return this.load(STORAGE_KEYS.TABLE_KITCHEN_COMMENTS);
  }

  /**
   * Guarda los tipos de refrescos
   */
  async saveDrinkOptions(drinkOptions) {
    return this.save(STORAGE_KEYS.DRINK_OPTIONS, drinkOptions);
  }

  /**
   * Carga los tipos de refrescos
   */
  async loadDrinkOptions() {
    return this.load(STORAGE_KEYS.DRINK_OPTIONS);
  }
}

export const storageService = new StorageService();
export { STORAGE_KEYS };

