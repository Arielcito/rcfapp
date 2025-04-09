import { db } from '../db';
import { predioMercadoPagoConfig } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { MercadoPagoConfigDTO, CreatePreferenceDTO } from '../types/mercadopago';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { decrypt, encrypt } from '../utils/encryption';

export class MercadoPagoService {
  private async getConfigByPredioId(predioId: string) {
    console.log(`Buscando configuración de Mercado Pago para el predio: ${predioId}`);
    
    const config = await db.select()
      .from(predioMercadoPagoConfig)
      .where(eq(predioMercadoPagoConfig.predioId, predioId))
      .limit(1);

    console.log(`Resultado de la búsqueda:`, config);

    if (!config.length) {
      console.error(`No se encontró configuración de Mercado Pago para el predio: ${predioId}`);
      throw new Error('Configuración de Mercado Pago no encontrada para este predio');
    }

    // Decrypt the access token and client secret
    const decryptedConfig = {
      ...config[0],
      accessToken: decrypt(config[0].accessToken),
      clientSecret: config[0].clientSecret ? decrypt(config[0].clientSecret) : undefined
    };

    return decryptedConfig;
  }

  async saveConfig(data: MercadoPagoConfigDTO) {
    try {
      // Encrypt the access token and client secret before saving
      const encryptedAccessToken = encrypt(data.accessToken);
      const encryptedClientSecret = data.clientSecret ? encrypt(data.clientSecret) : undefined;
      
      const [config] = await db.insert(predioMercadoPagoConfig)
        .values({
          predioId: data.predioId,
          accessToken: encryptedAccessToken,
          publicKey: data.publicKey,
          clientId: data.clientId,
          clientSecret: encryptedClientSecret,
          isTestMode: data.isTestMode
        })
        .onConflictDoUpdate({
          target: [predioMercadoPagoConfig.predioId],
          set: {
            accessToken: encryptedAccessToken,
            publicKey: data.publicKey,
            clientId: data.clientId,
            clientSecret: encryptedClientSecret,
            isTestMode: data.isTestMode,
            updatedAt: new Date()
          }
        })
        .returning();

      return config;
    } catch (error) {
      throw new Error('Error al guardar la configuración de Mercado Pago');
    }
  }

  async createPreference(data: CreatePreferenceDTO) {
    try {
      console.log(`Creando preferencia para el predio: ${data.predioId}`);
      const config = await this.getConfigByPredioId(data.predioId);
      console.log(`Configuración encontrada:`, {
        predioId: config.predioId,
        isTestMode: config.isTestMode,
        hasAccessToken: !!config.accessToken,
        hasPublicKey: !!config.publicKey
      });
      
      const mercadopago = new MercadoPagoConfig({ 
        accessToken: config.accessToken,
        options: { timeout: 5000, idempotencyKey: 'px-' + Date.now() }
      });

      const preference = new Preference(mercadopago);
      
      const preferenceData = {
        items: data.items.map(item => ({
          ...item,
          id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(7)}`
        })),
        external_reference: data.external_reference,
        back_urls: {
          success: data.back_urls?.success || process.env.MP_SUCCESS_URL,
          failure: data.back_urls?.failure || process.env.MP_FAILURE_URL,
          pending: data.back_urls?.pending || process.env.MP_PENDING_URL
        },
        auto_return: data.auto_return || 'approved',
        notification_url: data.notification_url || process.env.MP_WEBHOOK_URL
      };

      console.log(`Datos de preferencia a enviar a Mercado Pago:`, preferenceData);
      const result = await preference.create({ body: preferenceData });
      console.log(`Preferencia creada exitosamente:`, result);
      return result;
    } catch (error: any) {
      console.error('Error al crear preferencia:', error);
      console.error('Detalles del error:', {
        message: error.message,
        stack: error.stack
      });
      throw new Error('Error al crear preferencia de pago');
    }
  }

  async getPaymentById(paymentId: string, predioId: string) {
    try {
      const config = await this.getConfigByPredioId(predioId);
      
      const mercadopago = new MercadoPagoConfig({ 
        accessToken: config.accessToken 
      });

      const payment = new Payment(mercadopago);
      return await payment.get({ id: paymentId });
    } catch (error) {
      throw new Error('Error al obtener información del pago');
    }
  }

  async getPublicKey(predioId: string) {
    try {
      const config = await this.getConfigByPredioId(predioId);
      return { publicKey: config.publicKey };
    } catch (error) {
      throw new Error('Error al obtener la clave pública');
    }
  }
} 