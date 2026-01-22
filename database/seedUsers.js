/**
 * Script para poblar la base de datos con los usuarios del sistema
 */
require('dotenv').config();
const dbService = require('./dbService');
const { USERS } = require('../utils/constants');

async function seedUsers() {
  try {
    console.log('Verificando conexión a la base de datos...');
    await dbService.query('SELECT 1');
    console.log('✓ Conexión exitosa\n');

    console.log('Insertando usuarios...');
    let inserted = 0;
    let updated = 0;

    // Convertir el objeto USERS a un array
    const usersArray = Object.values(USERS);

    for (const user of usersArray) {
      try {
        // Verificar si el usuario ya existe
        const existing = await dbService.getUserByUsername(user.username);
        
        if (existing) {
          console.log(`Usuario ${user.username} ya existe, actualizando...`);
          await dbService.updateUser(existing.id, {
            password: user.password,
            role: user.role,
            enabled: true
          });
          updated++;
        } else {
          await dbService.createUser({
            username: user.username,
            password: user.password,
            role: user.role
          });
          console.log(`✓ Usuario ${user.username} creado`);
          inserted++;
        }
      } catch (error) {
        console.error(`Error procesando usuario ${user.username}:`, error.message);
      }
    }

    console.log(`\nUsuarios insertados: ${inserted}`);
    console.log(`Usuarios actualizados: ${updated}`);
    console.log(`Total usuarios: ${inserted + updated}`);

    // Verificar que los usuarios se pueden autenticar
    console.log('\nVerificando autenticación de usuarios...');
    for (const user of usersArray) {
      const verified = await dbService.verifyUser(user.username, user.password);
      if (verified) {
        console.log(`✓ Usuario ${user.username} autenticado correctamente (rol: ${verified.role})`);
      } else {
        console.error(`✗ Error autenticando usuario ${user.username}`);
      }
    }

    console.log('\n¡Usuarios poblados exitosamente!');
  } catch (error) {
    console.error('Error poblando usuarios:', error);
    process.exit(1);
  } finally {
    await dbService.close();
  }
}

// Ejecutar el script
seedUsers();
