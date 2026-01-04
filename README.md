# Sistema de Gestión de Pedidos - Dumplings Restaurant

Sistema completo de gestión de pedidos para restaurante con múltiples vistas (Camarero, Cocina, Comandas, Cliente y Administrador).

## Características Principales

### Vistas del Sistema

#### Vista de Camarero
- Gestión completa de mesas y pedidos
- Búsqueda de items del menú por número, nombre o categoría
- Agregar items con extras y bebidas
- Gestión de pedidos por mesa
- Aplicar descuentos
- Mover pedidos entre mesas
- Pagar items seleccionados o toda la cuenta
- Envío de comandas a cocina e impresión

#### Vista de Cocina
- Visualización de todas las mesas con pedidos
- Filtrado automático: solo muestra items que van a cocina
- Comandas formateadas como tickets
- Agrupación por categorías
- Actualización en tiempo real
- Marcar comandas como completadas

#### Vista de Comandas (Camarero)
- Visualización de todas las comandas completas
- Muestra todos los items de cada mesa
- Formato de ticket profesional
- Lista de mesas con pedidos

#### Vista de Cliente
- Visualización de todas las mesas con pedidos
- Ver pedido actual o comandas pagadas
- Selección de comandas del historial
- Tickets detallados con:
  - Todos los items con extras
  - Bebidas seleccionadas
  - Descuentos aplicados
  - Total a pagar

#### Vista de Administrador
- Gestión completa del menú (agregar, editar, habilitar/deshabilitar items)
- Items habilitados y deshabilitados agrupados por categoría
- Sugerencia automática del siguiente número disponible por categoría
- Estadísticas del día: consumo por item individual con cantidades y totales
- Estadísticas históricas: totales de items, ingresos, descuentos y pagos
- Búsqueda y filtrado de items por categoría

### Búsqueda Avanzada
- Búsqueda por número de item
- Búsqueda por nombre (español o inglés)
- Búsqueda por descripción
- Búsqueda por categoría
- Búsqueda en tiempo real

### Gestión de Pedidos
- Agregar items con extras personalizados
- Seleccionar bebidas para items específicos
- Modificar cantidades
- Eliminar items
- Aplicar descuentos
- Mover pedidos entre mesas
- Pagos parciales o completos

### Sistema de Comandas
- Comandas automáticas separadas:
  - **Cocina**: Solo items que requieren cocción
  - **Impresión (Camarero)**: Ensaladas, edamame y bebidas
  - **Completa**: Referencia con todos los items
- Formato profesional de tickets
- Agrupación por categorías

### Gestión Financiera
- Cálculo automático de totales
- Aplicación de descuentos
- Historial de pagos por mesa
- Pagos parciales o completos
- Visualización de totales históricos
- Estadísticas de consumo por item y categoría

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia la aplicación:
```bash
npm start
```

3. Escanea el código QR con la app Expo Go en tu dispositivo móvil, o presiona:
   - `i` para iOS Simulator
   - `a` para Android Emulator
   - `w` para Web

## Uso

### Vista de Camarero
1. Selecciona una mesa
2. Busca items del menú
3. Agrega items con extras y bebidas si es necesario
4. Gestiona el pedido (modificar, eliminar, aplicar descuentos)
5. Envía comanda completa a cocina e impresión
6. Procesa el pago

### Vista de Cocina
1. Visualiza todas las mesas con pedidos
2. Selecciona una mesa para ver su comanda
3. Ve solo los items que requieren cocción
4. Marca las comandas como completadas cuando estén listas
5. Las comandas se actualizan automáticamente

### Vista de Comandas
1. Visualiza todas las mesas con pedidos
2. Selecciona una mesa para ver su comanda completa
3. Revisa todos los items, extras y bebidas

### Vista de Cliente
1. Visualiza todas las mesas con pedidos
2. Selecciona una mesa
3. Ve el pedido actual o cambia a "Comandas Pagadas"
4. Selecciona una comanda del historial para ver su ticket completo

### Vista de Administrador
1. Gestiona el menú: agrega, edita o habilita/deshabilita items
2. Los items deshabilitados no aparecen en el menú del camarero
3. Revisa estadísticas del día por item individual
4. Consulta estadísticas históricas de consumo e ingresos
5. El sistema sugiere automáticamente el siguiente número disponible al agregar un nuevo item

## Estructura del Proyecto

```
Dumplings/
├── components/          # Componentes React Native
│   ├── AdminView.js          # Vista de administrador
│   ├── ChangeTableModal.js   # Modal para cambiar mesa
│   ├── ClientTicket.js       # Ticket del cliente
│   ├── ClientView.js         # Vista del cliente
│   ├── ComandaTicket.js      # Componente de ticket de comanda
│   ├── DiscountCalculator.js # Calculadora de descuentos
│   ├── Footer.js             # Pie de página
│   ├── Header.js             # Encabezado
│   ├── KitchenOrdersView.js  # Vista de órdenes de cocina
│   ├── KitchenView.js        # Vista de cocina
│   ├── Login.js              # Pantalla de login
│   ├── MenuByCategory.js     # Menú agrupado por categorías
│   ├── MenuItem.js           # Componente de item del menú
│   ├── OrderView.js           # Vista de pedidos
│   ├── StatisticsModal.js    # Modal de estadísticas históricas
│   ├── TablesScreen.js       # Pantalla de selección de mesas
│   ├── ViewSelector.js       # Selector de vistas
│   └── WaiterOrdersView.js   # Vista de comandas de camarero
├── contexts/           # Contextos de React
│   ├── AppContext.js         # Contexto de la aplicación
│   ├── MenuContext.js        # Contexto del menú
│   └── TableOrdersContext.js # Contexto compartido de pedidos
├── hooks/              # Hooks personalizados
│   ├── useMenuHandlers.js    # Handlers para el menú
│   └── useOrderHandlers.js   # Handlers para pedidos
├── services/           # Capa de servicios (lógica de negocio)
│   ├── menuService.js        # Servicios del menú
│   ├── orderService.js       # Servicios de pedidos
│   ├── statisticsService.js  # Servicios de estadísticas
│   └── storageService.js     # Servicios de persistencia
├── styles/             # Estilos
│   └── menuItemStyles.js     # Estilos de items del menú
├── utils/              # Utilidades
│   ├── constants.js          # Constantes
│   ├── helpers.js            # Funciones auxiliares
│   ├── logger.js             # Utilidades de logging
│   ├── menuCategories.js     # Categorías del menú
│   ├── printHelpers.js       # Funciones de impresión
│   └── timeHelpers.js        # Utilidades de tiempo
├── App.js              # Componente principal
├── menuData.js         # Datos del menú
├── netlify.toml        # Configuración de Netlify
├── netlify-build.sh    # Script de build para Netlify
└── package.json        # Dependencias
```

## Despliegue

Este proyecto está configurado para desplegarse gratuitamente en **Netlify**.

### Despliegue rápido

1. Ve a [netlify.com](https://netlify.com)
2. Inicia sesión con GitHub
3. Haz clic en "New site from Git"
4. Selecciona tu repositorio `Dumplings`
5. **NO cambies ninguna configuración** (ya está todo configurado en `netlify.toml`)
6. Haz clic en "Deploy site"

Ver [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) para más detalles.

### Verificar build localmente

Antes de desplegar, puedes probar el build localmente:

```bash
npm run build:web
npm run preview
```

Esto iniciará un servidor local para probar el build.

## Tecnologías

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **JavaScript** - Lenguaje de programación
- **Context API** - Gestión de estado global
- **AsyncStorage** - Persistencia de datos local

## Características Técnicas

- Estado compartido entre vistas mediante Context API
- Actualización en tiempo real de pedidos
- Filtrado inteligente de items (cocina vs. impresión)
- Formato profesional de tickets
- Gestión de historial de pagos
- Diseño responsive y moderno
- Separación de lógica de negocio en capa de servicios
- Persistencia local de datos con AsyncStorage
- Estadísticas en tiempo real y históricas

## Categorías del Menú

- **ENTRANTES** - Platos de entrada
- **GYOZAS PLANCHA** - Gyozas a la plancha
- **GYOZAS FRITA** - Gyozas fritas
- **GYOZAS VAPOR** - Gyozas al vapor
- **DIM SUMS** - Dim sums
- **BEBIDAS** - Bebidas
- **PLATOS PRINCIPALES** - Platos principales

## Notas

- Las comandas se imprimen automáticamente según el tipo de item
- Los items de cocina se envían a la vista de cocina
- Las ensaladas, edamame y bebidas se envían a impresión para el camarero
- El historial de pagos se mantiene por mesa
- Los descuentos se aplican proporcionalmente en pagos parciales
- Los items deshabilitados no aparecen en el menú del camarero pero permanecen en el sistema
- El sistema sugiere automáticamente el siguiente número disponible al agregar un nuevo item según su categoría

## Autor

Christian D. Villar

## Licencia

Este proyecto es privado y de uso interno.
