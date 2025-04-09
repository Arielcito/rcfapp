import { db } from './index';
import { predioMercadoPagoConfig, predios } from './schema';
import { encrypt } from '../utils/encryption';
import { eq } from 'drizzle-orm';

async function seedMercadoPagoConfig() {
  try {
    // Get all predios
    const allPredios = await db.select().from(predios);
    
    if (allPredios.length === 0) {
      console.log('⚠️ No hay predios en la base de datos. No se pueden insertar configuraciones de Mercado Pago.');
      return;
    }

    console.log(`🌱 Encontrados ${allPredios.length} predios. Insertando configuraciones de Mercado Pago...`);

    // Get Mercado Pago keys from environment variables
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;

    if (!publicKey || !accessToken || !clientId || !clientSecret) {
      console.error('❌ Faltan variables de entorno para Mercado Pago. Verifica tu archivo .env');
      return;
    }

    // Encrypt sensitive data
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedClientSecret = encrypt(clientSecret);

    // Insert configuration for each predio
    for (const predio of allPredios) {
      // Check if configuration already exists
      const existingConfig = await db.select()
        .from(predioMercadoPagoConfig)
        .where(eq(predioMercadoPagoConfig.predioId, predio.id));

      if (existingConfig.length > 0) {
        console.log(`⚠️ Ya existe una configuración para el predio ${predio.id}. Omitiendo...`);
        continue;
      }

      // Insert new configuration
      await db.insert(predioMercadoPagoConfig).values({
        predioId: predio.id,
        publicKey,
        accessToken: encryptedAccessToken,
        clientId,
        clientSecret: encryptedClientSecret,
        isTestMode: process.env.NODE_ENV !== 'production',
      });

      console.log(`✅ Configuración insertada para el predio ${predio.id}`);
    }

    console.log('✅ Proceso de seed de Mercado Pago completado');
  } catch (error) {
    console.error('❌ Error al insertar configuraciones de Mercado Pago:', error);
  }
}

async function main() {
  console.log('🌱 Iniciando proceso de seed de Mercado Pago...');
  await seedMercadoPagoConfig();
  console.log('✅ Proceso de seed completado');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error en el proceso de seed:', error);
  process.exit(1);
}); 