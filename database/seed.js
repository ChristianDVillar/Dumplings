/**
 * Script para poblar la base de datos con los productos del menú
 */
require('dotenv').config();
const dbService = require('./dbService');
const fs = require('fs');
const path = require('path');

// Leer menuData.js y extraer el array
const menuDataPath = path.join(__dirname, '..', 'menuData.js');
const menuDataContent = fs.readFileSync(menuDataPath, 'utf8');

// Extraer el array completo usando una expresión regular más robusta
// Busca desde "export const menuData = [" hasta el "];" final
const arrayStart = menuDataContent.indexOf('export const menuData = [');
if (arrayStart === -1) {
  throw new Error('No se encontró menuData en el archivo');
}

// Encontrar el final del array (último ] antes del punto y coma)
let bracketCount = 0;
let arrayEnd = arrayStart + 'export const menuData = '.length;
let foundStart = false;

for (let i = arrayEnd; i < menuDataContent.length; i++) {
  const char = menuDataContent[i];
  if (char === '[') {
    bracketCount++;
    foundStart = true;
  } else if (char === ']') {
    bracketCount--;
    if (foundStart && bracketCount === 0) {
      arrayEnd = i + 1;
      break;
    }
  }
}

const arrayString = menuDataContent.substring(
  menuDataContent.indexOf('[', arrayStart),
  arrayEnd
);

// Evaluar el array (solo para scripts de desarrollo/seeding)
let menuData;
try {
  menuData = eval(`(${arrayString})`);
} catch (error) {
  throw new Error(`Error parseando menuData: ${error.message}`);
}

// Opciones de bebidas por defecto
const DRINK_OPTIONS = [
  'Coca Cola',
  'Coca Zero',
  'Fanta Naranja',
  'Fanta Limón',
  'Nestea Limón',
  'Nestea Maracuyá',
  'Acuarius',
  'Acuarius de Naranja',
  'Sprite'
];

async function seedDatabase() {
  try {
    // No inicializamos las tablas aquí porque ya deberían estar creadas
    // Si necesitas recrearlas, ejecuta: npm run db:init
    console.log('Verificando conexión a la base de datos...');
    await dbService.query('SELECT 1');
    console.log('✓ Conexión exitosa');
    
    console.log('Insertando productos...');
    let inserted = 0;
    let skipped = 0;

    for (const product of menuData) {
      try {
        // Verificar si el producto ya existe
        const existing = await dbService.getProductById(product.id);
        
        if (existing) {
          console.log(`Producto ${product.id} (${product.nameEs}) ya existe, actualizando...`);
          await dbService.updateProduct(product.id, {
            number: product.number,
            category: product.category,
            categoryEn: product.categoryEn,
            nameEs: product.nameEs,
            nameEn: product.nameEn,
            descriptionEs: product.descriptionEs,
            descriptionEn: product.descriptionEn,
            price: product.price,
            quantity: product.quantity,
            customizable: product.customizable,
            enabled: product.enabled !== undefined ? product.enabled : true,
            optionGroups: product.optionGroups
          });
          skipped++;
        } else {
          await dbService.createProduct({
            id: product.id,
            number: product.number,
            category: product.category,
            categoryEn: product.categoryEn,
            nameEs: product.nameEs,
            nameEn: product.nameEn,
            descriptionEs: product.descriptionEs,
            descriptionEn: product.descriptionEn,
            price: product.price,
            quantity: product.quantity,
            customizable: product.customizable,
            enabled: product.enabled !== undefined ? product.enabled : true,
            optionGroups: product.optionGroups
          });
          inserted++;
        }
      } catch (error) {
        console.error(`Error insertando producto ${product.id}:`, error.message);
      }
    }

    console.log(`\nProductos insertados: ${inserted}`);
    console.log(`Productos actualizados: ${skipped}`);
    console.log(`Total productos: ${inserted + skipped}`);

    // Insertar opciones de bebidas
    console.log('\nInsertando opciones de bebidas...');
    await dbService.saveDrinkOptions(DRINK_OPTIONS);
    console.log(`Opciones de bebidas insertadas: ${DRINK_OPTIONS.length}`);

    console.log('\n¡Base de datos poblada exitosamente!');
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
    process.exit(1);
  } finally {
    await dbService.close();
  }
}

// Ejecutar el script
seedDatabase();
