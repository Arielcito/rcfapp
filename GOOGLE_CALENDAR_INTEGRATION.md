# 📅 Plan de Implementación: Integración con Google Calendar

## Descripción
Este documento detalla el plan para implementar la integración con Google Calendar en la aplicación RCF. La funcionalidad permitirá que los dueños de predios vinculen su cuenta de Google Calendar para recibir automáticamente las reservas en su calendario.

## Fases de Implementación

### **Fase 1: Configuración y Preparación del Backend**

#### 1.1 Instalación de Dependencias
```bash
# En el directorio server/
npm install googleapis @google-cloud/local-auth
npm install --save-dev @types/googleapis
```

#### 1.2 Modificación del Esquema de Base de Datos
```typescript
// server/src/db/schema.ts - Agregar a la tabla users
export const users = pgTable('users', {
  // ... campos existentes ...
  googleCalendarEnabled: boolean('google_calendar_enabled').default(false),
  googleAccessToken: text('google_access_token'),
  googleRefreshToken: text('google_refresh_token'),
  googleTokenExpiry: timestamp('google_token_expiry'),
  googleCalendarId: text('google_calendar_id'), // ID del calendario principal del usuario
});
```

#### 1.3 Crear Migración
```sql
-- server/src/db/migrations/add_google_calendar_integration.sql
ALTER TABLE users 
ADD COLUMN google_calendar_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN google_access_token TEXT,
ADD COLUMN google_refresh_token TEXT,
ADD COLUMN google_token_expiry TIMESTAMP,
ADD COLUMN google_calendar_id TEXT;
```

### **Fase 2: Servicios de Google Calendar**

#### 2.1 Configuración de Google Calendar
```typescript
// server/src/services/googleCalendarService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generar URL de autorización
  generateAuthUrl(userId: string): string { /* ... */ }
  
  // Intercambiar código por tokens
  async exchangeCode(code: string): Promise<any> { /* ... */ }
  
  // Crear evento en calendario
  async createCalendarEvent(accessToken: string, eventData: any): Promise<any> { /* ... */ }
  
  // Actualizar evento
  async updateCalendarEvent(accessToken: string, eventId: string, eventData: any): Promise<any> { /* ... */ }
  
  // Eliminar evento
  async deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> { /* ... */ }
  
  // Renovar token
  async refreshAccessToken(refreshToken: string): Promise<any> { /* ... */ }
}
```

#### 2.2 Integración con ReservaService
```typescript
// server/src/services/reservaService.ts
async createReserva(data: CreateReservaDTO) {
  console.log('[ReservaService] Iniciando creación de reserva con integración Google Calendar');
  
  try {
    // ... código existente para crear reserva ...
    
    // Después de crear la reserva exitosamente
    const reservaCompleta = {
      // ... datos existentes ...
    };

    // Integración con Google Calendar
    await this.createGoogleCalendarEvent(reservaCompleta);

    return reservaCompleta;
  } catch (error) {
    // ... manejo de errores ...
  }
}

private async createGoogleCalendarEvent(reserva: any) {
  try {
    // Obtener datos completos del predio y owner
    const [owner] = await db.select()
      .from(users)
      .innerJoin(predios, eq(users.id, predios.usuarioId))
      .where(eq(predios.id, reserva.predio.id));

    if (owner.users.googleCalendarEnabled && owner.users.googleAccessToken) {
      const eventData = {
        summary: `Reserva - ${reserva.cancha.nombre}`,
        description: `Reserva de ${reserva.cancha.nombre} en ${reserva.predio.nombre}\nCliente: Usuario\nDuración: ${reserva.duracion} minutos\nPrecio: $${reserva.precioTotal}`,
        start: {
          dateTime: new Date(reserva.fechaHora).toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: new Date(new Date(reserva.fechaHora).getTime() + reserva.duracion * 60000).toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        location: reserva.predio.direccion,
      };

      await this.googleCalendarService.createCalendarEvent(
        owner.users.googleAccessToken,
        eventData
      );
      
      console.log('[ReservaService] Evento creado en Google Calendar exitosamente');
    }
  } catch (error) {
    console.error('[ReservaService] Error al crear evento en Google Calendar:', error);
  }
}
```

### **Fase 3: API Endpoints**

#### 3.1 Rutas de Google Calendar
```typescript
// server/src/routes/googleCalendarRoutes.ts
import { Router } from 'express';
import { GoogleCalendarController } from '../controllers/googleCalendarController';

const router = Router();
const controller = new GoogleCalendarController();

// Iniciar proceso de vinculación
router.get('/auth-url', controller.generateAuthUrl);

// Callback después de autorización
router.post('/callback', controller.handleCallback);

// Desvinculear cuenta
router.delete('/disconnect', controller.disconnectCalendar);

// Verificar estado de vinculación
router.get('/status', controller.getConnectionStatus);

export { router as googleCalendarRoutes };
```

#### 3.2 Controlador
```typescript
// server/src/controllers/googleCalendarController.ts
export class GoogleCalendarController {
  async generateAuthUrl(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const authUrl = await this.googleCalendarService.generateAuthUrl(userId);
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: 'Error generando URL de autorización' });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { code } = req.body;
      const userId = req.user?.id;
      
      const tokens = await this.googleCalendarService.exchangeCode(code);
      
      // Guardar tokens en la base de datos
      await db.update(users)
        .set({
          googleCalendarEnabled: true,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: new Date(tokens.expiry_date),
        })
        .where(eq(users.id, userId));

      res.json({ success: true, message: 'Google Calendar vinculado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error vinculando Google Calendar' });
    }
  }
}
```

### **Fase 4: Frontend Mobile**

#### 4.1 Componente de Configuración
```typescript
// app/App/presentation/ownerScreens/OwnerProfileScreen/GoogleCalendarSettings.tsx
interface GoogleCalendarSettingsProps {
  user: any;
  onToggleCalendar: (enabled: boolean) => void;
}

export function GoogleCalendarSettings({ user, onToggleCalendar }: GoogleCalendarSettingsProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      // Obtener URL de autorización
      const response = await api.get('/google-calendar/auth-url');
      
      // Abrir browser para autorización
      await Linking.openURL(response.data.authUrl);
      
      // Mostrar instrucciones al usuario
      Alert.alert(
        'Vinculación con Google Calendar',
        'Se abrirá tu navegador para autorizar el acceso. Una vez completado, vuelve a la app.',
        [{ text: 'Entendido' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar la vinculación con Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Calendar</Text>
      <Text style={styles.description}>
        Vincula tu cuenta de Google para que las reservas aparezcan automáticamente en tu calendario
      </Text>
      
      {user.googleCalendarEnabled ? (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedText}>✅ Conectado</Text>
          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={() => handleDisconnectCalendar()}
          >
            <Text style={styles.disconnectText}>Desvincular</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={handleConnectCalendar}
          disabled={isConnecting}
        >
          <Text style={styles.connectText}>
            {isConnecting ? 'Conectando...' : 'Conectar con Google Calendar'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

#### 4.2 Integración en Perfil del Owner
```typescript
// app/App/presentation/ownerScreens/OwnerProfileScreen/OwnerProfileScreen.jsx
// Agregar la sección de Google Calendar
import GoogleCalendarSettings from './GoogleCalendarSettings';

// En el render del componente principal
<GoogleCalendarSettings 
  user={userProfile}
  onToggleCalendar={(enabled) => {
    // Manejar cambio de estado
  }}
/>
```

### **Fase 5: Variables de Entorno**

#### 5.1 Backend (.env)
```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google-calendar/callback
```

#### 5.2 Frontend (env.ts)
```typescript
// app/App/infrastructure/config/env.ts
const ENV = {
  dev: {
    // ... configuración existente ...
    googleCalendar: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: 'RCFApp://google-calendar/callback'
    }
  }
};
```

### **Fase 6: Flujo de Usuario Completo**

1. **Owner va a su perfil** → Ve opción "Vincular Google Calendar"
2. **Presiona "Conectar"** → Se abre browser con autorización Google
3. **Autoriza la app** → Google redirecciona con código
4. **App procesa el código** → Guarda tokens en BD
5. **Usuario hace reserva** → Sistema crea evento automáticamente en calendario del owner
6. **Owner ve la reserva** → En su Google Calendar personal

### **Consideraciones Técnicas:**

- **Manejo de tokens expirados**: Implementar renovación automática
- **Seguridad**: Encriptar tokens en BD
- **Fallback**: Si falla Google Calendar, la reserva se crea igual
- **Logging**: Registrar todas las operaciones para debug
- **Rate limiting**: Respetar límites de API de Google

## Próximos Pasos

1. Crear proyecto en Google Cloud Console
2. Configurar credenciales OAuth
3. Implementar Fase 1 (Backend)
4. Implementar Fase 2 (Servicios)
5. Implementar Fase 3 (API)
6. Implementar Fase 4 (Frontend)
7. Configurar variables de entorno
8. Pruebas end-to-end
9. Despliegue a producción

## Recursos Necesarios

- Cuenta de Google Cloud Platform
- Credenciales OAuth 2.0
- Acceso a la base de datos para migraciones
- Acceso al servidor de desarrollo y producción
- Equipo de desarrollo con experiencia en React Native y TypeScript

## Estimación de Tiempo

- **Fase 1**: 1 día
- **Fase 2**: 2 días
- **Fase 3**: 1 día
- **Fase 4**: 2 días
- **Fase 5**: 0.5 días
- **Fase 6**: 1.5 días
- **Pruebas y ajustes**: 2 días

Total estimado: 10 días hábiles 