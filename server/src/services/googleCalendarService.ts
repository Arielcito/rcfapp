import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { users } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { GoogleCalendarTokens, GoogleCalendarEvent, ReservationEventData } from '../types/googleCalendar';

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private REDIRECT_URI = 'https://backoffice.xerato.io/rcf/api/google-calendar/auth/callback';

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      this.REDIRECT_URI
    );
  }

  // Generar URL de autorización
  async generateAuthUrl(userId: string): Promise<string> {
    console.log(`[GoogleCalendarService] Generando URL de autorización para usuario: ${userId}`);
    
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      state,
      prompt: 'consent' // Fuerza mostrar pantalla de consentimiento para obtener refresh token
    });
    
    console.log(`[GoogleCalendarService] URL de autorización generada exitosamente`, authUrl);
    return authUrl;
  }
  
  // Intercambiar código por tokens
  async exchangeCode(code: string): Promise<GoogleCalendarTokens> {
    console.log(`[GoogleCalendarService] Intercambiando código de autorización por tokens`);
    
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No se pudo obtener el access token');
      }
      
      console.log(`[GoogleCalendarService] Tokens obtenidos exitosamente`);
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        scope: tokens.scope || undefined,
        token_type: tokens.token_type || undefined,
        expiry_date: tokens.expiry_date || undefined,
      };
    } catch (error) {
      console.error(`[GoogleCalendarService] Error intercambiando código:`, error);
      throw new Error('Error al intercambiar código de autorización');
    }
  }
  
  // Crear evento en calendario
  async createCalendarEvent(accessToken: string, eventData: GoogleCalendarEvent): Promise<any> {
    console.log(`[GoogleCalendarService] Creando evento en calendario`);
    
    try {
      // Configurar autenticación
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: eventData.summary,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end,
          location: eventData.location,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 24 horas antes
              { method: 'popup', minutes: 30 }, // 30 minutos antes
            ],
          },
        },
      });
      
      console.log(`[GoogleCalendarService] Evento creado exitosamente con ID: ${event.data.id}`);
      return event.data;
    } catch (error) {
      console.error(`[GoogleCalendarService] Error creando evento:`, error);
      throw new Error('Error al crear evento en Google Calendar');
    }
  }
  
  // Actualizar evento
  async updateCalendarEvent(accessToken: string, eventId: string, eventData: GoogleCalendarEvent): Promise<any> {
    console.log(`[GoogleCalendarService] Actualizando evento: ${eventId}`);
    
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const event = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: {
          summary: eventData.summary,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end,
          location: eventData.location,
        },
      });
      
      console.log(`[GoogleCalendarService] Evento actualizado exitosamente`);
      return event.data;
    } catch (error) {
      console.error(`[GoogleCalendarService] Error actualizando evento:`, error);
      throw new Error('Error al actualizar evento en Google Calendar');
    }
  }
  
  // Eliminar evento
  async deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
    console.log(`[GoogleCalendarService] Eliminando evento: ${eventId}`);
    
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });
      
      console.log(`[GoogleCalendarService] Evento eliminado exitosamente`);
    } catch (error) {
      console.error(`[GoogleCalendarService] Error eliminando evento:`, error);
      throw new Error('Error al eliminar evento de Google Calendar');
    }
  }
  
  // Renovar token de acceso
  async refreshAccessToken(refreshToken: string): Promise<GoogleCalendarTokens> {
    console.log(`[GoogleCalendarService] Renovando access token`);
    
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('No se pudo renovar el access token');
      }
      
      console.log(`[GoogleCalendarService] Access token renovado exitosamente`);
      
      return {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || undefined,
        scope: credentials.scope || undefined,
        token_type: credentials.token_type || undefined,
        expiry_date: credentials.expiry_date || undefined,
      };
    } catch (error) {
      console.error(`[GoogleCalendarService] Error renovando token:`, error);
      throw new Error('Error al renovar access token');
    }
  }

  // Verificar y renovar token si es necesario
  async ensureValidToken(userId: string): Promise<string | null> {
    console.log(`[GoogleCalendarService] Verificando validez del token para usuario: ${userId}`);
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user || !user.googleCalendarEnabled || !user.googleAccessToken) {
        console.log(`[GoogleCalendarService] Usuario no tiene Google Calendar habilitado`);
        return null;
      }
      
      // Verificar si el token ha expirado
      if (user.googleTokenExpiry && new Date() >= user.googleTokenExpiry) {
        console.log(`[GoogleCalendarService] Token expirado, renovando...`);
        
        if (!user.googleRefreshToken) {
          console.error(`[GoogleCalendarService] No hay refresh token disponible`);
          return null;
        }
        
        const newTokens = await this.refreshAccessToken(user.googleRefreshToken);
        
        // Actualizar tokens en la base de datos
        await db.update(users)
          .set({
            googleAccessToken: newTokens.access_token,
            googleTokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
          })
          .where(eq(users.id, userId));
        
        return newTokens.access_token;
      }
      
      console.log(`[GoogleCalendarService] Token válido`);
      return user.googleAccessToken;
    } catch (error) {
      console.error(`[GoogleCalendarService] Error verificando token:`, error);
      return null;
    }
  }

  // Desconectar calendario
  async disconnectCalendar(userId: string): Promise<void> {
    console.log(`[GoogleCalendarService] Desconectando Google Calendar para usuario: ${userId}`);
    
    try {
      await db.update(users).set({
        googleCalendarEnabled: false,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      }).where(eq(users.id, userId));
      
      console.log(`[GoogleCalendarService] Google Calendar desconectado exitosamente`);
    } catch (error) {
      console.error(`[GoogleCalendarService] Error desconectando Google Calendar:`, error);
      throw new Error('Error al desconectar Google Calendar');
    }
  }

  // Obtener estado de conexión
  async getConnectionStatus(userId: string): Promise<boolean> {
    console.log(`[GoogleCalendarService] Obteniendo estado de conexión para usuario: ${userId}`);
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      const isConnected = user?.googleCalendarEnabled || false;
      console.log(`[GoogleCalendarService] Estado de conexión: ${isConnected}`);
      
      return isConnected;
    } catch (error) {
      console.error(`[GoogleCalendarService] Error obteniendo estado de conexión:`, error);
      return false;
    }
  }

  // Crear evento específico para reserva
  async createReservationEvent(userId: string, reservationData: {
    canchaName: string;
    predioName: string;
    fechaHora: Date;
    duracion: number;
    precioTotal: number;
    direccion: string;
    clienteName?: string;
  }): Promise<boolean> {
    console.log(`[GoogleCalendarService] Creando evento de reserva para usuario: ${userId}`);
    
    try {
      const accessToken = await this.ensureValidToken(userId);
      
      if (!accessToken) {
        console.log(`[GoogleCalendarService] No hay token válido, saltando creación de evento`);
        return false;
      }
      
      const endTime = new Date(reservationData.fechaHora.getTime() + reservationData.duracion * 60000);
      
      const eventData = {
        summary: `Reserva - ${reservationData.canchaName}`,
        description: `Reserva de ${reservationData.canchaName} en ${reservationData.predioName}\n` +
                    `${reservationData.clienteName ? `Cliente: ${reservationData.clienteName}\n` : ''}` +
                    `Duración: ${reservationData.duracion} minutos\n` +
                    `Precio: $${reservationData.precioTotal}`,
        start: {
          dateTime: reservationData.fechaHora.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        location: reservationData.direccion,
      };
      
      await this.createCalendarEvent(accessToken, eventData);
      
      console.log(`[GoogleCalendarService] Evento de reserva creado exitosamente`);
      return true;
    } catch (error) {
      console.error(`[GoogleCalendarService] Error creando evento de reserva:`, error);
      return false;
    }
  }

  async refreshTokenIfNeeded(userId: string): Promise<void> {
    console.log('[GoogleCalendarService] Verificando si se necesita refrescar el token');
    
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          googleRefreshToken: true,
          googleTokenExpiry: true
        }
      });

      if (!user?.googleRefreshToken || !user?.googleTokenExpiry) {
        throw new Error('No hay tokens disponibles para refrescar');
      }

      // Si el token expira en menos de 5 minutos, refrescarlo
      const expiryDate = new Date(user.googleTokenExpiry);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

      if (expiryDate <= fiveMinutesFromNow) {
        this.oauth2Client.setCredentials({
          refresh_token: user.googleRefreshToken
        });

        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        await db.update(users)
          .set({
            googleAccessToken: credentials.access_token,
            googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          })
          .where(eq(users.id, userId));
          
        console.log('[GoogleCalendarService] Token refrescado exitosamente');
      }
    } catch (error) {
      console.error('[GoogleCalendarService] Error refrescando token:', error);
      throw error;
    }
  }
}