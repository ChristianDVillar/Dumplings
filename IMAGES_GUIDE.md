# Guía para Agregar Imágenes al Menú

## Descripción

El sistema ahora soporta imágenes en los items del menú. Al hacer clic en una imagen, el item se agrega directamente a la mesa seleccionada.

## Cómo Funciona

1. **Imágenes Clicables**: Si un item tiene una imagen, se mostrará en la parte superior del card del item
2. **Agregado Directo**: Al hacer clic en la imagen, el item se agrega automáticamente a la mesa seleccionada
3. **Indicador Visual**: Cuando hay una mesa seleccionada, aparece un overlay en la imagen indicando "Toca para agregar a Mesa X"
4. **Compatibilidad**: Funciona con items que tienen extras (se agregan sin extras por defecto) y con bebidas seleccionadas

## Formato de Imágenes

Las imágenes pueden ser:

### Opción 1: URL (Recomendado para producción)
```javascript
{
  id: 1,
  nameEs: 'Ensalada china',
  // ... otros campos
  image: 'https://ejemplo.com/imagenes/ensalada-china.jpg'
}
```

### Opción 2: Imagen Local (require)
```javascript
{
  id: 1,
  nameEs: 'Ensalada china',
  // ... otros campos
  image: require('../assets/images/ensalada-china.jpg')
}
```

## Ejemplo de Uso

### Agregar imagen a un item existente en `menuData.js`:

```javascript
{
  id: 1,
  number: '01',
  category: 'ENTRANTES',
  categoryEn: 'STARTERS',
  nameEs: 'Ensalada china',
  nameEn: 'Chinese salad',
  descriptionEs: 'Ensalada iceberg, zanahorias, maíz y salsa blanca',
  descriptionEn: 'Iceberg lettuce, carrots, chopped corn, and white dressing',
  price: 2.95,
  quantity: null,
  image: 'https://tu-servidor.com/imagenes/ensalada-china.jpg' // ← Agregar esta línea
}
```

### Agregar imagen desde AdminView:

1. Ve a la vista de Administración
2. Busca o selecciona el item que quieres editar
3. En el campo "URL de Imagen", ingresa la URL de la imagen
4. Guarda los cambios

## Comportamiento

- **Sin mesa seleccionada**: La imagen se muestra pero está deshabilitada (opacidad reducida)
- **Con mesa seleccionada**: La imagen es clicable y muestra un overlay con el texto "Toca para agregar a Mesa X"
- **Items con extras**: Se agregan sin extras por defecto al hacer clic en la imagen
- **Items con bebidas**: Si hay una bebida seleccionada previamente, se incluye; si no, se agrega sin bebida

## Estilos Responsive

- **Móvil (< 768px)**: Altura de imagen: 180px
- **Desktop (≥ 768px)**: Altura de imagen: 220px

## Notas Importantes

- Las imágenes deben tener un formato web-compatible (JPG, PNG, WebP)
- Para mejor rendimiento, optimiza las imágenes antes de subirlas
- El sistema mantiene la relación de aspecto de la imagen
- Las imágenes se muestran con `resizeMode: "cover"` para llenar el contenedor

## Próximas Mejoras

- [ ] Soporte para subir imágenes desde el dispositivo
- [ ] Galería de imágenes pre-cargadas
- [ ] Optimización automática de imágenes
- [ ] Soporte para múltiples imágenes por item

