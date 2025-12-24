# Menú App para Camareros - Dumplings

Aplicación móvil para camareros que permite buscar items del menú por número o por nombre del elemento.

## Características

- 🔍 Búsqueda por número de item
- 🔍 Búsqueda por nombre (español o inglés)
- 🔍 Búsqueda por descripción
- 🔍 Búsqueda por categoría
- 📱 Diseño moderno y responsive
- ⚡ Búsqueda en tiempo real
- 🎨 Interfaz intuitiva y fácil de usar

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

## Uso

- Escribe en el campo de búsqueda para filtrar items por:
  - Número (ej: "21", "51")
  - Nombre en español (ej: "gyozas", "bao")
  - Nombre en inglés (ej: "chicken", "prawn")
  - Descripción
  - Categoría

- Cada item muestra:
  - Número (si aplica)
  - Nombre en español e inglés
  - Precio
  - Descripción
  - Categoría
  - Cantidad (si aplica)
  - Indicador de personalización (si aplica)

## Tecnologías

- React Native
- Expo
- JavaScript

## Estructura del Proyecto

- `App.js` - Componente principal de la aplicación
- `menuData.js` - Datos del menú extraídos de las imágenes
- `package.json` - Dependencias del proyecto

