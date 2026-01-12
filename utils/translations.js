/**
 * Traducciones centralizadas de la aplicación
 */

export const translations = {
  es: {
    // Login
    login: {
      title: 'Iniciar Sesión',
      subtitle: 'Sistema de Gestión de Pedidos',
      username: 'Usuario',
      password: 'Contraseña',
      usernamePlaceholder: 'Ingresa tu usuario',
      passwordPlaceholder: 'Ingresa tu contraseña',
      loginButton: 'Iniciar Sesión',
      errorEmpty: 'Por favor, ingresa usuario y contraseña',
      errorUserNotFound: 'Usuario no encontrado. Verifica el nombre de usuario.',
      errorWrongPassword: 'Contraseña incorrecta. Verifica tu contraseña.',
      selectLanguage: 'Idioma:'
    },
    // QR Generator
    qr: {
      table: 'Mesa',
      scanInstruction: 'Escanea para ver el menú',
      successMessage: (table) => `Código QR de Mesa ${table} descargado (5cm alto x 20cm ancho)`,
      copySuccess: 'URL copiada al portapapeles',
      urlLabel: 'URL:',
      tableLabel: 'Mesa:',
      instructions: 'Instrucciones:',
      instruction1: '1. Imprime este código QR o muéstralo en una pantalla',
      instruction2: '2. Los clientes escanearán el código con su teléfono',
      instruction3: (table) => `3. Se abrirá la aplicación con la mesa ${table} seleccionada`,
      instruction4: '4. Los clientes podrán agregar items a su comanda',
      copyUrl: '📋 Copiar URL',
      downloadQR: '💾 Descargar QR (5cm alto x 20cm ancho)',
      selectLanguage: 'Idioma:',
      modalTitle: (table) => `📱 Código QR - Mesa ${table}`
    },
    // Common
    common: {
      success: 'Éxito',
      error: 'Error',
      cancel: 'Cancelar',
      close: 'Cerrar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      language: 'Idioma',
      searchPlaceholder: 'Buscar por número o nombre...'
    },
    // Views
    views: {
      waiter: '👨‍💼 Camarero',
      orders: '📋 Comandas',
      kitchen: '👨‍🍳 Cocina',
      client: '👤 Cliente',
      logout: 'Salir',
      kitchenView: 'Vista de Cocina',
      logoutButton: 'Cerrar Sesión'
    },
    // Tables
    tables: {
      regular: 'Mesas Regulares',
      terrace: 'Terraza',
      takeaway: 'Para Llevar',
      change: 'Cambiar',
      tables: 'Mesas',
      noOrders: 'No hay pedidos en esta mesa',
      withOrders: (count) => `Mesas con Pedidos ${count > 0 ? `(${count})` : ''}`
    },
    // Orders
    orders: {
      subtotal: 'Subtotal:',
      discount: 'Descuento:',
      totalToPay: 'Total a Pagar:',
      historyTotal: 'Total Histórico:',
      clearTable: 'Limpiar',
      clearTableTitle: 'Limpiar Mesa',
      clearTableMessage: '¿Limpiar la mesa? Esto eliminará todos los pedidos.',
      payAll: 'Pagar Todo',
      paySelected: (count) => `Pagar Seleccionados (${count})`,
      paySelectedTitle: 'Pagar Items Seleccionados',
      paySelectedMessage: (count) => `¿Pagar ${count} item(s) seleccionado(s)?`,
      sendToKitchen: '📋 Enviar Comanda Completa',
      noItemsToSend: 'No hay items para enviar',
      addComment: '💬 Agregar Comentario',
      editComment: '💬 Editar Comentario',
      changeTable: 'Cambiar Mesa',
      applyDiscount: 'Descuento',
      extras: 'Extras:',
      characters: (current, max) => `${current}/${max} caracteres`
    },
    // Kitchen
    kitchen: {
      title: '👨‍🍳 Vista de Cocina',
      tablesWithOrders: (count) => `Mesas con Pedidos ${count > 0 ? `(${count})` : ''}`,
      noTables: 'No hay mesas con pedidos de cocina',
      noTablesSubtext: 'Agrega items a una mesa desde la vista de camarero',
      notSent: 'Sin enviar',
      completeOrder: 'Completar Comanda',
      table: 'Mesa',
      time: 'Tiempo',
      items: 'Items'
    },
    // Waiter Orders
    waiterOrders: {
      title: '📋 Comandas de Camarero',
      tablesWithOrders: (count) => `Mesas con Pedidos ${count > 0 ? `(${count})` : ''}`,
      noTables: 'No hay mesas con pedidos',
      noOrdersInTable: 'No hay pedidos en esta mesa'
    },
    // Client
    client: {
      title: '👤 Vista del Cliente',
      tablesWithOrders: (count) => `Mesas con Pedidos ${count > 0 ? `(${count})` : ''}`,
      noTables: 'No hay mesas con pedidos',
      activeOrders: 'Pedidos Activos',
      paymentHistory: 'Historial de Pagos',
      noActiveOrders: 'No hay pedidos activos en esta mesa',
      noHistory: 'No hay historial de pagos para esta mesa',
      showHistory: 'Ver Historial',
      hideHistory: 'Ocultar Historial',
      orderDate: 'Fecha',
      orderTotal: 'Total'
    },
    // Payment
    payment: {
      title: 'Método de Pago',
      selectMethod: 'Selecciona el método de pago:',
      cash: 'Efectivo',
      card: 'Tarjeta',
      cashReceived: 'Cantidad Recibida:',
      cashReceivedPlaceholder: 'Ingresa la cantidad recibida',
      change: 'Cambio:',
      total: 'Total:',
      pay: 'Pagar',
      invalidAmount: 'La cantidad recibida debe ser mayor o igual al total'
    },
    // Comments
    comments: {
      title: '💬 Comentario para Comanda',
      subtitle: (table, time) => `Mesa ${table} - ${time}`,
      placeholder: 'Escribe un comentario para esta comanda (ej: Sin cebolla, Sin gluten, Urgente, etc.)',
      characters: (current, max) => `${current}/${max} caracteres`
    },
    // Admin
    admin: {
      manageDrinkTypes: 'Gestionar Tipos de Refrescos',
      drinkTypes: 'Tipos de Refrescos',
      softDrinks: 'Refrescos',
      deleteDrinkType: 'Eliminar Tipo de Refresco',
      confirmDeleteDrinkType: (name) => `¿Eliminar "${name}"?`,
      drinkTypeName: 'Nombre del tipo de refresco',
      newDrinkType: 'Nuevo tipo de refresco',
      disable: 'Deshabilitar',
      enable: 'Habilitar'
    }
  },
  en: {
    // Login
    login: {
      title: 'Login',
      subtitle: 'Order Management System',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      errorEmpty: 'Please enter username and password',
      errorUserNotFound: 'User not found. Check your username.',
      errorWrongPassword: 'Incorrect password. Check your password.',
      selectLanguage: 'Language:'
    },
    // QR Generator
    qr: {
      table: 'Table',
      scanInstruction: 'Scan to view the menu',
      successMessage: (table) => `QR Code for Table ${table} downloaded (5cm height x 20cm width)`,
      copySuccess: 'URL copied to clipboard',
      urlLabel: 'URL:',
      tableLabel: 'Table:',
      instructions: 'Instructions:',
      instruction1: '1. Print this QR code or display it on a screen',
      instruction2: '2. Customers will scan the code with their phone',
      instruction3: (table) => `3. The app will open with table ${table} selected`,
      instruction4: '4. Customers will be able to add items to their order',
      copyUrl: '📋 Copy URL',
      downloadQR: '💾 Download QR (5cm height x 20cm width)',
      selectLanguage: 'Language:',
      modalTitle: (table) => `📱 QR Code - Table ${table}`
    },
    // Common
    common: {
      success: 'Success',
      error: 'Error',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      language: 'Language',
      searchPlaceholder: 'Search by number or name...'
    },
    // Views
    views: {
      waiter: '👨‍💼 Waiter',
      orders: '📋 Orders',
      kitchen: '👨‍🍳 Kitchen',
      client: '👤 Client',
      logout: 'Logout',
      kitchenView: 'Kitchen View',
      logoutButton: 'Logout'
    },
    // Tables
    tables: {
      regular: 'Regular Tables',
      terrace: 'Terrace',
      takeaway: 'Takeaway',
      change: 'Change',
      tables: 'Tables',
      noOrders: 'No orders at this table',
      withOrders: (count) => `Tables with Orders ${count > 0 ? `(${count})` : ''}`
    },
    // Orders
    orders: {
      subtotal: 'Subtotal:',
      discount: 'Discount:',
      totalToPay: 'Total to Pay:',
      historyTotal: 'History Total:',
      clearTable: 'Clear',
      clearTableTitle: 'Clear Table',
      clearTableMessage: 'Clear the table? This will remove all orders.',
      payAll: 'Pay All',
      paySelected: (count) => `Pay Selected (${count})`,
      paySelectedTitle: 'Pay Selected Items',
      paySelectedMessage: (count) => `Pay ${count} selected item(s)?`,
      sendToKitchen: '📋 Send Complete Order',
      noItemsToSend: 'No items to send',
      addComment: '💬 Add Comment',
      editComment: '💬 Edit Comment',
      changeTable: 'Change Table',
      applyDiscount: 'Discount',
      extras: 'Extras:',
      characters: (current, max) => `${current}/${max} characters`
    },
    // Kitchen
    kitchen: {
      title: '👨‍🍳 Kitchen View',
      tablesWithOrders: (count) => `Tables with Orders ${count > 0 ? `(${count})` : ''}`,
      noTables: 'No tables with kitchen orders',
      noTablesSubtext: 'Add items to a table from the waiter view',
      notSent: 'Not sent',
      completeOrder: 'Complete Order',
      table: 'Table',
      time: 'Time',
      items: 'Items'
    },
    // Waiter Orders
    waiterOrders: {
      title: '📋 Waiter Orders',
      tablesWithOrders: (count) => `Tables with Orders ${count > 0 ? `(${count})` : ''}`,
      noTables: 'No tables with orders',
      noOrdersInTable: 'No orders at this table'
    },
    // Client
    client: {
      title: '👤 Client View',
      tablesWithOrders: (count) => `Tables with Orders ${count > 0 ? `(${count})` : ''}`,
      noTables: 'No tables with orders',
      activeOrders: 'Active Orders',
      paymentHistory: 'Payment History',
      noActiveOrders: 'No active orders at this table',
      noHistory: 'No payment history for this table',
      showHistory: 'Show History',
      hideHistory: 'Hide History',
      orderDate: 'Date',
      orderTotal: 'Total'
    },
    // Payment
    payment: {
      title: 'Payment Method',
      selectMethod: 'Select payment method:',
      cash: 'Cash',
      card: 'Card',
      cashReceived: 'Amount Received:',
      cashReceivedPlaceholder: 'Enter the amount received',
      change: 'Change:',
      total: 'Total:',
      pay: 'Pay',
      invalidAmount: 'The amount received must be greater than or equal to the total'
    },
    // Comments
    comments: {
      title: '💬 Order Comment',
      subtitle: (table, time) => `Table ${table} - ${time}`,
      placeholder: 'Write a comment for this order (e.g., No onion, Gluten-free, Urgent, etc.)',
      characters: (current, max) => `${current}/${max} characters`
    },
    // Admin
    admin: {
      manageDrinkTypes: 'Manage Soft Drink Types',
      drinkTypes: 'Soft Drink Types',
      softDrinks: 'Soft Drinks',
      deleteDrinkType: 'Delete Soft Drink Type',
      confirmDeleteDrinkType: (name) => `Delete "${name}"?`,
      drinkTypeName: 'Soft drink type name',
      newDrinkType: 'New soft drink type',
      disable: 'Disable',
      enable: 'Enable'
    }
  },
  zh: {
    // Login
    login: {
      title: '登录',
      subtitle: '订单管理系统',
      username: '用户名',
      password: '密码',
      usernamePlaceholder: '输入您的用户名',
      passwordPlaceholder: '输入您的密码',
      loginButton: '登录',
      errorEmpty: '请输入用户名和密码',
      errorUserNotFound: '未找到用户。请检查用户名。',
      errorWrongPassword: '密码错误。请检查您的密码。',
      selectLanguage: '语言:'
    },
    // QR Generator
    qr: {
      table: '桌',
      scanInstruction: '扫描查看菜单',
      successMessage: (table) => `桌号 ${table} 的二维码已下载 (高5cm x 宽20cm)`,
      copySuccess: 'URL已复制到剪贴板',
      urlLabel: 'URL:',
      tableLabel: '桌号:',
      instructions: '说明:',
      instruction1: '1. 打印此二维码或在屏幕上显示',
      instruction2: '2. 客户将用手机扫描代码',
      instruction3: (table) => `3. 应用程序将打开，选择桌号 ${table}`,
      instruction4: '4. 客户可以将项目添加到他们的订单中',
      copyUrl: '📋 复制URL',
      downloadQR: '💾 下载二维码 (高5cm x 宽20cm)',
      selectLanguage: '语言:',
      modalTitle: (table) => `📱 二维码 - 桌号 ${table}`
    },
    // Common
    common: {
      success: '成功',
      error: '错误',
      cancel: '取消',
      close: '关闭',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      language: '语言',
      searchPlaceholder: '按编号或名称搜索...'
    },
    // Views
    views: {
      waiter: '👨‍💼 服务员',
      orders: '📋 订单',
      kitchen: '👨‍🍳 厨房',
      client: '👤 客户',
      logout: '退出',
      kitchenView: '厨房视图',
      logoutButton: '退出登录'
    },
    // Tables
    tables: {
      regular: '普通桌',
      terrace: '露台',
      takeaway: '外带',
      change: '切换',
      tables: '桌子',
      noOrders: '此桌没有订单',
      withOrders: (count) => `有订单的桌子 ${count > 0 ? `(${count})` : ''}`
    },
    // Orders
    orders: {
      subtotal: '小计:',
      discount: '折扣:',
      totalToPay: '应付总额:',
      historyTotal: '历史总额:',
      clearTable: '清空',
      clearTableTitle: '清空桌子',
      clearTableMessage: '清空桌子？这将删除所有订单。',
      payAll: '全部支付',
      paySelected: (count) => `支付已选 (${count})`,
      paySelectedTitle: '支付已选项目',
      paySelectedMessage: (count) => `支付 ${count} 个已选项目？`,
      sendToKitchen: '📋 发送完整订单',
      noItemsToSend: '没有要发送的项目',
      addComment: '💬 添加评论',
      editComment: '💬 编辑评论',
      changeTable: '更换桌子',
      applyDiscount: '折扣',
      extras: '额外:',
      characters: (current, max) => `${current}/${max} 字符`
    },
    // Kitchen
    kitchen: {
      title: '👨‍🍳 厨房视图',
      tablesWithOrders: (count) => `有订单的桌子 ${count > 0 ? `(${count})` : ''}`,
      noTables: '没有厨房订单的桌子',
      noTablesSubtext: '从服务员视图向桌子添加项目',
      notSent: '未发送',
      completeOrder: '完成订单',
      table: '桌子',
      time: '时间',
      items: '项目'
    },
    // Waiter Orders
    waiterOrders: {
      title: '📋 服务员订单',
      tablesWithOrders: (count) => `有订单的桌子 ${count > 0 ? `(${count})` : ''}`,
      noTables: '没有订单的桌子',
      noOrdersInTable: '此桌没有订单'
    },
    // Client
    client: {
      title: '👤 客户视图',
      tablesWithOrders: (count) => `有订单的桌子 ${count > 0 ? `(${count})` : ''}`,
      noTables: '没有订单的桌子',
      activeOrders: '活动订单',
      paymentHistory: '支付历史',
      noActiveOrders: '此桌没有活动订单',
      noHistory: '此桌没有支付历史',
      showHistory: '查看历史',
      hideHistory: '隐藏历史',
      orderDate: '日期',
      orderTotal: '总计'
    },
    // Payment
    payment: {
      title: '支付方式',
      selectMethod: '选择支付方式:',
      cash: '现金',
      card: '卡',
      cashReceived: '收到金额:',
      cashReceivedPlaceholder: '输入收到的金额',
      change: '找零:',
      total: '总计:',
      pay: '支付',
      invalidAmount: '收到的金额必须大于或等于总计'
    },
    // Comments
    comments: {
      title: '💬 订单评论',
      subtitle: (table, time) => `桌子 ${table} - ${time}`,
      placeholder: '为此订单写评论（例如：不要洋葱，无麸质，紧急等）',
      characters: (current, max) => `${current}/${max} 字符`
    },
    // Admin
    admin: {
      manageDrinkTypes: '管理软饮料类型',
      drinkTypes: '软饮料类型',
      softDrinks: '软饮料',
      deleteDrinkType: '删除软饮料类型',
      confirmDeleteDrinkType: (name) => `删除"${name}"？`,
      drinkTypeName: '软饮料类型名称',
      newDrinkType: '新软饮料类型',
      disable: '禁用',
      enable: '启用'
    }
  }
};

/**
 * Hook para obtener las traducciones según el idioma
 */
export const useTranslations = (language = 'es') => {
  const t = translations[language] || translations.es;
  return t;
};
