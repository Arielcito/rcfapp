import { db } from '../db';
import { predioMercadoPagoConfig } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { MercadoPagoConfigDTO, CreatePreferenceDTO } from '../types/mercadopago';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

export class MercadoPagoService {
  private async getConfigByPredioId(predioId: string) {
    const config = await db.select()
      .from(predioMercadoPagoConfig)
      .where(eq(predioMercadoPagoConfig.predioId, predioId))
      .limit(1);

    if (!config.length) {
      throw new Error('Configuración de Mercado Pago no encontrada para este predio');
    }

    return config[0];
  }

  async saveConfig(data: MercadoPagoConfigDTO) {
    try {
      const [config] = await db.insert(predioMercadoPagoConfig)
        .values({
          predioId: data.predioId,
          accessToken: data.accessToken,
          publicKey: data.publicKey,
          isTestMode: data.isTestMode
        })
        .onConflictDoUpdate({
          target: [predioMercadoPagoConfig.predioId],
          set: {
            accessToken: data.accessToken,
            publicKey: data.publicKey,
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
      const config = await this.getConfigByPredioId(data.predioId);
      
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

      const result = await preference.create({ body: preferenceData });
      return result;
    } catch (error) {
      console.error('Error al crear preferencia:', error);
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