import { Request, Response } from 'express';
import { GoogleCalendarService } from '../services/googleCalendarService';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { GoogleCalendarCallbackRequest } from '../types/googleCalendar';

export class GoogleCalendarController {
  private googleCalendarService: GoogleCalendarService;

  constructor() {
    this.googleCalendarService = new GoogleCalendarService();
  }

  async generateAuthUrl(req: Request, res: Response) {
    console.log('[GoogleCalendarController] Generando URL de autorización');
    
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        console.error('[GoogleCalendarController] Usuario no autenticado');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      const authUrl = await this.googleCalendarService.generateAuthUrl(userId);
      console.log('[GoogleCalendarController] URL de autorización generada exitosamente');
      
      res.json({ authUrl });
    } catch (error) {
      console.error('[GoogleCalendarController] Error generando URL de autorización:', error);
      res.status(500).json({ error: 'Error generando URL de autorización' });
    }
  }

  async handleCallback(req: Request<{}, {}, GoogleCalendarCallbackRequest>, res: Response) {
    console.log('[GoogleCalendarController] Procesando callback de Google Calendar');
    
    try {
      const { code } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        console.error('[GoogleCalendarController] Usuario no autenticado');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      if (!code) {
        console.error('[GoogleCalendarController] Código de autorización no proporcionado');
        return res.status(400).json({ error: 'Código de autorización requerido' });
      }
      
      const tokens = await this.googleCalendarService.exchangeCode(code);
      
      // Guardar tokens en la base de datos
      await db.update(users)
        .set({
          googleCalendarEnabled: true,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        })
        .where(eq(users.id, userId));

      console.log(`[GoogleCalendarController] Google Calendar vinculado exitosamente para usuario: ${userId}`);
      res.json({ success: true, message: 'Google Calendar vinculado exitosamente' });
    } catch (error) {
      console.error('[GoogleCalendarController] Error vinculando Google Calendar:', error);
      res.status(500).json({ error: 'Error vinculando Google Calendar' });
    }
  }

  async disconnectCalendar(req: Request, res: Response) {
    console.log('[GoogleCalendarController] Desvinculando Google Calendar');
    
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        console.error('[GoogleCalendarController] Usuario no autenticado');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      await this.googleCalendarService.disconnectCalendar(userId);
      console.log(`[GoogleCalendarController] Google Calendar desvinculado exitosamente para usuario: ${userId}`);
      
      res.json({ success: true, message: 'Google Calendar desvinculado exitosamente' });
    } catch (error) {
      console.error('[GoogleCalendarController] Error desvinculando Google Calendar:', error);
      res.status(500).json({ error: 'Error desvinculando Google Calendar' });
    }
  }

  async getConnectionStatus(req: Request, res: Response) {
    console.log('[GoogleCalendarController] Obteniendo estado de conexión');
    
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        console.error('[GoogleCalendarController] Usuario no autenticado');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      const status = await this.googleCalendarService.getConnectionStatus(userId);
      console.log(`[GoogleCalendarController] Estado de conexión obtenido: ${status} para usuario: ${userId}`);
      
      res.json({ 
        status,
        isConnected: status,
        message: status ? 'Google Calendar conectado' : 'Google Calendar no conectado'
      });
    } catch (error) {
      console.error('[GoogleCalendarController] Error obteniendo estado de conexión:', error);
      res.status(500).json({ error: 'Error obteniendo estado de conexión' });
    }
  }
}