# Sistema de Gestión de Pedidos - Dumplings Restaurant

Sistema completo de gestión de pedidos para restaurante con múltiples vistas (Camarero, Cocina, Comandas y Cliente).

## Características Principales

### 🎯 Vistas del Sistema

#### 👨‍💼 Vista de Camarero
- Gestión completa de mesas y pedidos
- Búsqueda de items del menú por número, nombre o categoría
- Agregar items con extras y bebidas
- Gestión de pedidos por mesa
- Aplicar descuentos
- Mover pedidos entre mesas
- Pagar items seleccionados o toda la cuenta
- Envío de comandas a cocina e impresión

#### 👨‍🍳 Vista de Cocina
- Visualización de todas las mesas con pedidos
- Filtrado automático: solo muestra items que van a cocina
- Comandas formateadas como tickets
- Agrupación por categorías
- Actualización en tiempo real

#### 📋 Vista de Comandas (Camarero)
- Visualización de todas las comandas completas
- Muestra todos los items de cada mesa
- Formato de ticket profesional
- Lista de mesas con pedidos

#### 👤 Vista de Cliente
- Visualización de todas las mesas con pedidos
- Ver pedido actual o comandas pagadas
- Selección de comandas del historial
- Tickets detallados con:
  - Todos los items con extras
  - Bebidas seleccionadas
  - Descuentos aplicados
  - Total a pagar

### 🔍 Búsqueda Avanzada
- Búsqueda por número de item
- Búsqueda por nombre (español o inglés)
- Búsqueda por descripción
- Búsqueda por categoría
- Búsqueda en tiempo real

### 📦 Gestión de Pedidos
- Agregar items con extras personalizados
- Seleccionar bebidas para items específicos
- Modificar cantidades
- Eliminar items
- Aplicar descuentos
- Mover pedidos entre mesas
- Pagos parciales o completos

### 🖨️ Sistema de Comandas
- Comandas automáticas separadas:
  - **Cocina**: Solo items que requieren cocción
  - **Impresión (Camarero)**: Ensaladas, edamame y bebidas
  - **Completa**: Referencia con todos los items
- Formato profesional de tickets
- Agrupación por categorías

### 💰 Gestión Financiera
- Cálculo automático de totales
- Aplicación de descuentos
- Historial de pagos por mesa
- Pagos parciales o completos
- Visualización de totales históricos

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

## Compartir localhost con Cloudflare Tunnel

Para compartir tu aplicación que corre en `http://localhost:19006/` con otros dispositivos:

### Instalación de cloudflared

**Windows (Recomendado - Instalación automática):**
```powershell
.\install-cloudflared.ps1
```

**Windows (Manual):**
- Descarga desde: https://github.com/cloudflare/cloudflared/releases/latest
- Busca `cloudflared-windows-amd64.exe` y renómbralo a `cloudflared.exe`
- Colócalo en una carpeta del PATH

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
- Descarga desde: https://github.com/cloudflare/cloudflared/releases/latest

### Uso rápido

Una vez instalado, ejecuta:

```bash
cloudflared tunnel --url http://localhost:19006
```

O usa el script automatizado:
- **Windows:** `.\share-localhost.ps1` (PowerShell) - Detecta cloudflared automáticamente
- **macOS/Linux:** `./share-localhost.sh`

Esto generará una URL temporal (ej: `https://random-words-1234.trycloudflare.com`) que podrás compartir.

> **Nota:** La URL es temporal y cambiará cada vez que reinicies el tunnel. Ver `SHARE_LOCALHOST.md` para más detalles.

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
4. Las comandas se actualizan automáticamente

### Vista de Comandas
1. Visualiza todas las mesas con pedidos
2. Selecciona una mesa para ver su comanda completa
3. Revisa todos los items, extras y bebidas

### Vista de Cliente
1. Visualiza todas las mesas con pedidos
2. Selecciona una mesa
3. Ve el pedido actual o cambia a "Comandas Pagadas"
4. Selecciona una comanda del historial para ver su ticket completo

## Estructura del Proyecto

```
Dumplings/
├── components/          # Componentes React Native
│   ├── ClientTicket.js      # Ticket del cliente
│   ├── ClientView.js        # Vista del cliente
│   ├── ComandaTicket.js     # Componente de ticket de comanda
│   ├── KitchenView.js       # Vista de cocina
│   ├── MenuByCategory.js    # Menú agrupado por categorías
│   ├── OrderView.js         # Vista de pedidos
│   ├── WaiterOrdersView.js  # Vista de comandas de camarero
│   └── ...
├── contexts/           # Contextos de React
│   ├── AppContext.js         # Contexto de la aplicación
│   └── TableOrdersContext.js # Contexto compartido de pedidos
├── hooks/              # Hooks personalizados
│   └── useTableOrders.js    # Hook de gestión de pedidos
├── utils/               # Utilidades
│   ├── helpers.js           # Funciones auxiliares
│   ├── menuCategories.js   # Categorías del menú
│   └── printHelpers.js     # Funciones de impresión
├── App.js              # Componente principal
├── menuData.js         # Datos del menú
└── package.json        # Dependencias
```

## Tecnologías

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **JavaScript** - Lenguaje de programación
- **Context API** - Gestión de estado global

## Características Técnicas

- ✅ Estado compartido entre vistas mediante Context API
- ✅ Actualización en tiempo real de pedidos
- ✅ Filtrado inteligente de items (cocina vs. impresión)
- ✅ Formato profesional de tickets
- ✅ Gestión de historial de pagos
- ✅ Diseño responsive y moderno

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

## Autor

Christian D. Villar

## Licencia

Este proyecto es privado y de uso interno.
