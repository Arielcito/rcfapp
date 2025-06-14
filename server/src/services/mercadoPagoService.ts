import { db } from '../db';
import { predioMercadoPagoConfig, reservas } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { MercadoPagoConfigDTO, CreatePreferenceDTO } from '../types/mercadopago';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { decrypt, encrypt } from '../utils/encryption';

export class MercadoPagoService {
  /*
  private async getConfigByPredioId(predioId: string) {
    console.log(`[MercadoPagoService] Buscando configuración de Mercado Pago para el predio: ${predioId}`);
    
    const config = await db.select()
      .from(predioMercadoPagoConfig)
      .where(eq(predioMercadoPagoConfig.predioId, predioId))
      .limit(1);

    if (!config.length) {
      console.error(`[MercadoPagoService] No se encontró configuración de Mercado Pago para el predio: ${predioId}`);
      throw new Error('Configuración de Mercado Pago no encontrada para este predio');
    }

    console.log(`[MercadoPagoService] Intentando desencriptar tokens...`);
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
      console.log(`[MercadoPagoService] Encriptando tokens...`);
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
      console.error('[MercadoPagoService] Error al guardar la configuración de Mercado Pago:', error);
      throw new Error('Error al guardar la configuración de Mercado Pago');
    }
  }
*/
  async createPreference(data: CreatePreferenceDTO) {
    try {
      console.log(`[MercadoPagoService] Iniciando creación de preferencia para el predio: ${data.predioId}`);
      const mercadopago = new MercadoPagoConfig({ 
        accessToken: "TEST-5294995935306734-082313-97c4286e2cbbe8124db0c1afd5976eda-225978862",
        options: { timeout: 5000, idempotencyKey: 'px-' + Date.now() }
      });

      const preference = new Preference(mercadopago);
      
      const preferenceData = {
        items: data.items.map(item => ({
          ...item,
          id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(7)}`
        })),
        external_reference: data.external_reference,
        notification_url: data.notification_url || process.env.MP_WEBHOOK_URL
      };

      console.log(`[MercadoPagoService] Datos de preferencia a enviar a Mercado Pago:`, {
        items: preferenceData.items,
        external_reference: preferenceData.external_reference,
        notification_url: preferenceData.notification_url
      });

      console.log(`[MercadoPagoService] Intentando crear preferencia en Mercado Pago...`);
      const result = await preference.create({ body: preferenceData });
      console.log(`[MercadoPagoService] Preferencia creada exitosamente:`, {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      });
      return result;
    } catch (error: any) {
      console.error('[MercadoPagoService] Error al crear preferencia:', error);
      console.error('[MercadoPagoService] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw new Error('Error al crear preferencia de pago');
    }
  }

  async getPaymentById(paymentId: string, predioId: string) {
    try {

      const mercadopago = new MercadoPagoConfig({ 
        accessToken: "TEST-5294995935306734-082313-97c4286e2cbbe8124db0c1afd5976eda-225978862"
      });

      const payment = new Payment(mercadopago);
      return await payment.get({ id: paymentId });
    } catch (error) {
      throw new Error('Error al obtener información del pago');
    }
  }

  async getPublicKey(predioId: string) {
    try {
      return { publicKey: "TEST-9a7e1962-ad0c-4606-aeb1-015c0e59d70d" };
    } catch (error) {
      throw new Error('Error al obtener la clave pública');
    }
  }

  async handleWebhook(paymentId: string, predioId: string) {
    try {
      console.log(`[MercadoPagoService] Procesando webhook para pago ${paymentId} del predio ${predioId}`);
      
      // Obtener la configuración del predio
      const config = {
        accessToken: "TEST-5294995935306734-082313-97c4286e2cbbe8124db0c1afd5976eda-225978862"
      };
      
      // Inicializar cliente de Mercado Pago
      const mercadopago = new MercadoPagoConfig({ 
        accessToken: config.accessToken 
      });

      // Obtener información del pago
      const payment = new Payment(mercadopago);
      const paymentInfo = await payment.get({ id: paymentId });
      
      console.log(`[MercadoPagoService] Información del pago:`, {
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference
      });

      // Actualizar el estado de la reserva
      if (paymentInfo.external_reference) {
        const estadoPago = this.mapPaymentStatus(paymentInfo.status || '');
        
        await db.update(reservas)
          .set({ 
            estadoPago,
            metodoPago: 'MERCADO_PAGO'
          })
          .where(eq(reservas.id, paymentInfo.external_reference));

        console.log(`[MercadoPagoService] Reserva actualizada:`, {
          reservaId: paymentInfo.external_reference,
          estadoPago
        });
      }

      return paymentInfo;
    } catch (error) {
      console.error('[MercadoPagoService] Error al procesar webhook:', error);
      throw new Error('Error al procesar la notificación de pago');
    }
  }

  private mapPaymentStatus(mpStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'approved': 'PAGADO',
      'pending': 'PENDIENTE',
      'in_process': 'EN_PROCESO',
      'rejected': 'RECHAZADO',
      'refunded': 'REEMBOLSADO',
      'cancelled': 'CANCELADO'
    };

    return statusMap[mpStatus] || 'PENDIENTE';
  }
} 