/**
 * Constantes centralizadas de la aplicación
 */

// Configuración de usuarios del sistema
export const USERS = {
  ADMIN: {
    username: 'administrador',
    password: 'admintest',
    role: 'admin'
  },
  GENERAL: {
    username: 'general',
    password: 'graltest',
    role: 'general'
  },
  KITCHEN: {
    username: 'cocina',
    password: 'cocinatest',
    role: 'kitchen'
  }
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  GENERAL: 'general',
  KITCHEN: 'kitchen'
};

// Vistas de la aplicación
export const VIEWS = {
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
  WAITER_ORDERS: 'waiter-orders',
  CLIENT: 'client',
  ADMIN: 'admin'
};

// Pantallas del camarero
export const SCREENS = {
  TABLES: 'tables',
  MENU: 'menu'
};

// Tipos de comanda
export const ORDER_TYPES = {
  ALL: 'all',
  KITCHEN: 'kitchen',
  SALADS_DRINKS: 'salads_drinks'
};

// Configuración de mesas
export const TABLE_CONFIG = {
  REGULAR: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15],
  TERRACE_START: 100,
  TERRACE_END: 108,
  TAKEAWAY_START: 200,
  TAKEAWAY_END: 240,
  ITEMS_PER_ROW: 10
};

// IDs especiales de items
export const ITEM_IDS = {
  REFRESCOS: 93
};

// Opciones de extras
export const EXTRA_OPTIONS = ['gambas', 'pollo', 'ternera', 'verduras'];

// Opciones de bebidas
export const DRINK_OPTIONS = [
  'Coca Cola',
  'Coca Zero',
  'Fanta Naranja',
  'Fanta Limón',
  'Nestea Limón',
  'Nestea Maracuyá',
  'Acuarius',
  'Acuarius de Naranja'
];

// Precio de extras
export const EXTRA_PRICE = 1.0;

// Colores de la aplicación
export const COLORS = {
  PRIMARY: '#FFD700',
  SECONDARY: '#FFA500',
  BACKGROUND: '#1A1A1A',
  CARD_BACKGROUND: '#2A2A2A',
  TEXT_PRIMARY: '#FFD700',
  TEXT_SECONDARY: '#FFA500',
  TEXT_MUTED: '#999',
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FFA500'
};

