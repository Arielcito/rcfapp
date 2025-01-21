Prompt para desarrollar una app de reservas de fútbol multiplataforma
Desarrollar una aplicación en Flutter para la gestión de reservas de canchas de fútbol, con las siguientes características:

Secciones principales
Dueños de canchas

Inicio:
Pantalla con analíticas principales, incluyendo:
Total de reservas del mes.
Ingresos generados.
Promedio de ocupación diaria.
Gráficos sencillos que presenten estos datos de forma visual y clara.
Vista de calendario con todas las reservas.
Opción para marcar pagos completados en el lugar.

Reservas:
Lista de todas las reservas ordenadas por fecha.
Opciones para filtrar reservas por: día, semana, o mes.
Detalles de cada reserva: nombre del usuario, horario, cancha reservada, estado de pago (seña/completo).
Sistema de notificaciones para nuevas reservas y cancelaciones.

Usuarios

Filtrar Canchas:
Lista de canchas disponibles por días específicos.
Calendario mensual con disponibilidad.
Opción de reserva rápida para próxima hora disponible.
Filtro por:
Fecha.
Hora disponible.
Tipo de cancha (fútbol 5).
Sistema de predios favoritos.
Sección específica para ver predios guardados como favoritos.

Reservas Actuales:
Sección para que los usuarios vean sus reservas activas con información como:
Nombre de la cancha.
Fecha y hora.
Estado del pago.
Acceso directo a WhatsApp del dueño con mensaje predeterminado incluyendo detalles de la reserva.
Posibilidad de tener varias reservas activas al mismo tiempo.

Hacer Reservas:
Proceso de reserva en tres pasos:
Selección de la cancha disponible (duración fija de 1 hora).
Confirmación de fecha y hora.
Pago mediante Mercado Pago (opción de seña 50% o pago completo).
Confirmación visual de la reserva exitosa.
Opción de cancelar la reserva hasta 3 horas antes.

Características adicionales
Sistema de reseñas:
Los usuarios podrán calificar y dejar comentarios sobre las canchas después de su uso.
Mostrar el promedio de calificaciones y los comentarios más recientes en el perfil de cada cancha.

Mapa interactivo:
Integración con Google Maps (Android) y Apple Maps (iOS).
Mapa para que los usuarios encuentren canchas cercanas basándose en su ubicación actual.
Vista de múltiples canchas dentro de un mismo predio.
Mostrar la disponibilidad de las canchas directamente en el mapa.
Navegación hacia las canchas seleccionadas.

Notificaciones push:
Para recordar a los usuarios sus reservas próximas.
Avisos a los dueños sobre nuevas reservas o cancelaciones.
Notificación de confirmación al completar la seña.

Autenticación:
Registro e inicio de sesión con:
- Google
- Correo electrónico
Verificación obligatoria de número telefónico por SMS.
Opción de reenvío de código SMS.
Perfiles separados para dueños y usuarios.

Estilo visual
Usar la siguiente paleta de colores:
export default {
    PRIMARY: '#00CC44',
    GRAY: '#898989',
    WHITE: '#ffffff',
    BLACK: '#000000',
    WHITE_TRANSP: '#ffffff87',
    BLUE: '#003366',
}
Diseño moderno, limpio y fácil de usar.
Tipografía legible para destacar información clave en analíticas, reservas y botones de acción.
Sin modo oscuro.

PASOS DE IMPLEMENTACIÓN

1. Configuración Inicial
- Instalar Flutter y dependencias necesarias
- Configurar proyecto en Firebase (autenticación, base de datos)
- Configurar APIs de mapas (Google Maps y Apple Maps)
- Configurar Mercado Pago SDK
- Crear estructura base del proyecto (carpetas: models, views, controllers, services)
- Realizar commit inicial
- Verificar build en Android e iOS

2. Autenticación
- Implementar login con Google
- Implementar registro/login con email
- Crear sistema de verificación SMS
- Implementar manejo de sesiones
- Crear sistema de roles (dueño/usuario)
- Commit de cambios
- Verificar build en ambas plataformas

3. Modelos de Datos
Predio {
  id, nombre, direccion, telefono, userId
  coordenadas (latitud, longitud)
}

Cancha {
  id, nombre, predioId, precio
  tipo: "futbol5"
}

Reserva {
  id, userId, canchaId
  fecha, hora, duracion: 1
  estadoPago: ["seña", "completo", "pendiente"]
  metodoPago: ["mercadoPago", "efectivo"]
}

Usuario {
  id, email, nombre, telefono
  rol: ["dueño", "usuario"]
  prediosFavoritos: [predioId]
}

4. Interfaz de Usuario - Sección Usuario
- Crear navegación principal (bottom tabs)
- Implementar vista de mapa
- Crear vista de lista de canchas
- Implementar calendario de disponibilidad
- Crear flujo de reserva (3 pasos)
- Implementar vista de reservas activas
- Crear sistema de favoritos
- Implementar sistema de reseñas
- Commit de cambios
- Verificar build en ambas plataformas

5. Interfaz de Usuario - Sección Dueño
- Crear dashboard con gráficos
- Implementar calendario de reservas
- Crear vista de gestión de pagos
- Implementar lista de reservas con filtros
- Crear sistema de notificaciones
- Commit de cambios
- Verificar build en ambas plataformas

6. Integración de Pagos
- Implementar SDK de Mercado Pago
- Crear flujo de pago de seña (50%)
- Implementar sistema de pago completo
- Crear sistema de cancelaciones
- Commit de cambios
- Verificar build en ambas plataformas

7. Sistema de Mapas
- Implementar vista de mapa multiplataforma
- Crear marcadores personalizados para predios
- Implementar vista de canchas dentro del predio
- Crear sistema de navegación hacia la cancha
- Commit de cambios
- Verificar build en ambas plataformas

8. Sistema de Notificaciones
- Configurar Firebase Cloud Messaging
- Implementar notificaciones para:
  - Recordatorios de reserva
  - Confirmación de pago
  - Nuevas reservas (dueños)
  - Cancelaciones
- Commit de cambios
- Verificar build en ambas plataformas

9. Integración de WhatsApp
- Implementar deep linking con WhatsApp
- Crear sistema de mensajes predeterminados
- Integrar datos de reserva en mensaje
- Commit de cambios
- Verificar build en ambas plataformas

10. Testing y Optimización
- Crear tests unitarios básicos
- Implementar manejo de errores
- Optimizar rendimiento de consultas
- Pruebas de integración
- Commit de cambios
- Verificar build en ambas plataformas

11. Características Adicionales
- Implementar sistema de caché para datos frecuentes
- Crear sistema de respaldo de datos
- Implementar analytics
- Crear sistema de logs
- Commit de cambios
- Verificar build en ambas plataformas

12. Preparación para Producción
- Configurar variables de entorno
- Preparar builds para ambas plataformas
- Crear documentación básica
- Implementar sistema de reportes de errores
- Commit de cambios
- Verificar build en ambas plataformas

13. Migración a Backend Propio
- Diseñar arquitectura del backend (Node.js/Express)
- Crear estructura de base de datos PostgreSQL
- Implementar endpoints REST:
  - Autenticación y autorización
  - Gestión de usuarios
  - Gestión de predios y canchas
  - Sistema de reservas
  - Gestión de pagos
  - Sistema de notificaciones

### Estructura de Respuesta API
Implementar formato estándar de respuesta:
```dart
{
  success: boolean,
  data: any,
  error?: string,
  statusCode: number,
  message?: string
}
```

### Configuración Base App
1. Crear ApiClient base:
   - Implementar Dio con interceptores
   - Configurar baseUrl desde variables de ambiente
   - Implementar manejo de timeout
   - Configurar retry automático

2. Implementar interceptores:
   - Auth Interceptor (Bearer token)
   - Error Interceptor (manejo global)
   - Retry Interceptor (reintentos automáticos)
   - Cache Interceptor (optimización)

3. Sistema de renovación de token:
   - Almacenamiento seguro de refresh token
   - Renovación automática
   - Cola de requests durante renovación
   - Manejo de sesión expirada

### Migración de Servicios (orden)
1. AuthService:
   - Login/Registro
   - Verificación SMS
   - Manejo de roles
   - Refresh token

2. PropertyService:
   - CRUD predios
   - Búsqueda y filtros
   - Gestión de imágenes

3. BookingService:
   - Gestión de reservas
   - Verificación disponibilidad
   - Cancelaciones

4. FavoriteService:
   - Gestión de favoritos
   - Sincronización

5. UserService:
   - Perfil
   - Preferencias
   - Historial

6. ReviewService:
   - Gestión de reseñas
   - Calificaciones

### Sistema de Caché con Hive
1. Datos a cachear:
   - Información de usuario
   - Predios frecuentes
   - Reservas activas
   - Configuraciones
   - Token y refresh token

2. Estrategias de caché:
   - Cache-first: datos no críticos
   - Network-first: datos críticos
   - Tiempo de expiración configurable
   - Invalidación automática

### Manejo de Errores
1. Tipos de errores:
   - Red (sin conexión, timeout)
   - Servidor (500, 503)
   - Autenticación (401, 403)
   - Validación (400)
   - Negocio (422)

2. Estrategias de recuperación:
   - Retry automático
   - Fallback a caché
   - Modo offline
   - Sincronización posterior

- Migrar datos desde Firestore
- Actualizar servicios en la app:
  - Crear nuevos servicios para API REST
  - Remover dependencias de Firestore
  - Implementar manejo de tokens JWT
  - Actualizar manejo de caché
- Implementar sistema de logs y monitoreo
- Configurar CI/CD para backend
- Commit de cambios
- Verificar build en ambas plataformas

14. Implementación de Variables de Entorno Remotas
- Crear servicio de configuración remota
- Implementar sistema de fetch de variables:
  - Al inicio de la app
  - Actualización periódica
  - Caché local
- Migrar variables locales a remotas:
  - URLs de API
  - Configuraciones de servicios
  - Feature flags
  - Textos dinámicos
- Implementar sistema de rollback
- Crear panel de administración
- Commit de cambios
- Verificar build en ambas plataformas

- Implementar sistema de reportes de errores
- Commit de cambios
- Verificar build en ambas plataformas

15. Implementación del Servicio de Mercado Pago en Backend

### Estructura del Servicio
```typescript
interface PaymentService {
  createPreference(booking: Booking): Promise<PreferenceResponse>
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>
  processWebhook(data: WebhookData): Promise<void>
}
```

### Pasos de Implementación
1. Configuración Inicial:
   - Instalar SDK de Mercado Pago
   - Configurar credenciales (ACCESS_TOKEN, PUBLIC_KEY)
   - Crear estructura base del servicio

2. Endpoints a Implementar:
   - POST /api/payments/create-preference
   - GET /api/payments/status/:paymentId
   - POST /api/payments/webhook

3. Funcionalidades:
   - Crear preferencia de pago
   - Procesar pagos (completos y señas)
   - Manejar webhooks de Mercado Pago
   - Actualizar estado de reservas
   - Notificar a usuarios sobre pagos

4. Manejo de Estados de Pago:
   ```typescript
   enum PaymentStatus {
     PENDING = 'pending',
     APPROVED = 'approved',
     REJECTED = 'rejected',
     REFUNDED = 'refunded'
   }
   ```

5. Sistema de Notificaciones:
   - Notificar pagos exitosos
   - Alertar sobre pagos rechazados
   - Confirmar reembolsos
   - Enviar recordatorios de pago pendiente

6. Seguridad:
   - Validación de webhooks
   - Encriptación de datos sensibles
   - Rate limiting
   - Logs de transacciones

7. Testing:
   - Pruebas unitarias
   - Pruebas de integración
   - Simulación de webhooks
   - Pruebas de carga

8. Documentación:
   - API endpoints
   - Flujos de pago
   - Manejo de errores
   - Guía de integración

### Estructura de Respuesta API
Implementar formato estándar de respuesta:
```dart
{
  success: boolean,
  data: any,
  error?: string,
  statusCode: number,
  message?: string
}
```

### Configuración Base App
1. Crear ApiClient base:
   - Implementar Dio con interceptores
   - Configurar baseUrl desde variables de ambiente
   - Implementar manejo de timeout
   - Configurar retry automático

2. Implementar interceptores:
   - Auth Interceptor (Bearer token)
   - Error Interceptor (manejo global)
   - Retry Interceptor (reintentos automáticos)
   - Cache Interceptor (optimización)

3. Sistema de renovación de token:
   - Almacenamiento seguro de refresh token
   - Renovación automática
   - Cola de requests durante renovación
   - Manejo de sesión expirada

### Migración de Servicios (orden)
1. AuthService:
   - Login/Registro
   - Verificación SMS
   - Manejo de roles
   - Refresh token

2. PropertyService:
   - CRUD predios
   - Búsqueda y filtros
   - Gestión de imágenes

3. BookingService:
   - Gestión de reservas
   - Verificación disponibilidad
   - Cancelaciones

4. FavoriteService:
   - Gestión de favoritos
   - Sincronización

5. UserService:
   - Perfil
   - Preferencias
   - Historial

6. ReviewService:
   - Gestión de reseñas
   - Calificaciones

### Sistema de Caché con Hive
1. Datos a cachear:
   - Información de usuario
   - Predios frecuentes
   - Reservas activas
   - Configuraciones
   - Token y refresh token

2. Estrategias de caché:
   - Cache-first: datos no críticos
   - Network-first: datos críticos
   - Tiempo de expiración configurable
   - Invalidación automática

### Manejo de Errores
1. Tipos de errores:
   - Red (sin conexión, timeout)
   - Servidor (500, 503)
   - Autenticación (401, 403)
   - Validación (400)
   - Negocio (422)

2. Estrategias de recuperación:
   - Retry automático
   - Fallback a caché
   - Modo offline
   - Sincronización posterior

- Migrar datos desde Firestore
- Actualizar servicios en la app:
  - Crear nuevos servicios para API REST
  - Remover dependencias de Firestore
  - Implementar manejo de tokens JWT
  - Actualizar manejo de caché
- Implementar sistema de logs y monitoreo
- Configurar CI/CD para backend
- Commit de cambios
- Verificar build en ambas plataformas

16. Implementación de Variables de Entorno Remotas
- Crear servicio de configuración remota
- Implementar sistema de fetch de variables:
  - Al inicio de la app
  - Actualización periódica
  - Caché local
- Migrar variables locales a remotas:
  - URLs de API
  - Configuraciones de servicios
  - Feature flags
  - Textos dinámicos
- Implementar sistema de rollback
- Crear panel de administración
- Commit de cambios
- Verificar build en ambas plataformas

- Implementar sistema de reportes de errores
- Commit de cambios
- Verificar build en ambas plataformas

### Migración de Firestore a Backend Propio

1. Crear ApiClient Base
```dart
class ApiClient {
  final Dio _dio;
  final String baseUrl;
  
  ApiClient({required this.baseUrl}) : _dio = Dio() {
    _dio.options.baseUrl = baseUrl;
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(ErrorInterceptor());
    _dio.interceptors.add(RetryInterceptor());
    _dio.interceptors.add(CacheInterceptor());
  }
}
```

2. Migración de AuthService
- Implementar endpoints:
  - POST /api/users/register
  - POST /api/users/login
  - POST /api/users/logout
  - GET /api/users/me
  - POST /api/users/check-email
- Actualizar AuthController para usar nuevos endpoints
- Implementar manejo de JWT
- Migrar datos de usuarios

3. Migración de PropertyService
- Implementar endpoints:
  - GET /api/predios
  - POST /api/predios
  - GET /api/predios/:id
  - PUT /api/predios/:id
  - DELETE /api/predios/:id
  - GET /api/predios/usuario/:id
- Actualizar PropertyController
- Migrar datos de predios
- Implementar caché local con Hive

4. Migración de BookingService
- Implementar endpoints:
  - GET /api/reservas
  - POST /api/reservas
  - GET /api/reservas/:id
  - PUT /api/reservas/:id
  - POST /api/reservas/check
  - GET /api/reservas/user/bookings
  - GET /api/reservas/owner/:id
  - GET /api/reservas/owner/:date/:ownerId
- Actualizar BookingController
- Migrar datos de reservas
- Implementar sincronización offline

5. Migración de CourtService
- Implementar endpoints:
  - GET /api/canchas
  - POST /api/canchas
  - GET /api/canchas/:id
  - PUT /api/canchas/:id
  - DELETE /api/canchas/:id
  - GET /api/canchas/predio/:predioId
- Actualizar CourtController
- Migrar datos de canchas

6. Implementación de Interceptores
```dart
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = GetStorage().read('token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioError err, ErrorInterceptorHandler handler) {
    switch (err.response?.statusCode) {
      case 401:
        // Manejar error de autenticación
        break;
      case 403:
        // Manejar error de autorización
        break;
      case 404:
        // Manejar error de recurso no encontrado
        break;
      case 422:
        // Manejar error de validación
        break;
      case 500:
        // Manejar error de servidor
        break;
    }
    handler.next(err);
  }
}

class RetryInterceptor extends Interceptor {
  @override
  Future onError(DioError err, ErrorInterceptorHandler handler) async {
    if (_shouldRetry(err)) {
      try {
        return await _retry(err.requestOptions);
      } catch (e) {
        return handler.next(err);
      }
    }
    return handler.next(err);
  }
}

class CacheInterceptor extends Interceptor {
  final Box<dynamic> cache = Hive.box('api_cache');
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.method == 'GET') {
      final cachedResponse = cache.get(options.path);
      if (cachedResponse != null) {
        return handler.resolve(cachedResponse);
      }
    }
    handler.next(options);
  }
}
```

7. Implementación de Modelos
```dart
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final int statusCode;
  final String? message;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    required this.statusCode,
    this.message,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    return ApiResponse(
      success: json['success'] as bool,
      data: json['data'] as T?,
      error: json['error'] as String?,
      statusCode: json['statusCode'] as int,
      message: json['message'] as String?,
    );
  }
}
```

8. Estrategia de Migración de Datos
- Crear script de migración para cada colección
- Validar integridad de datos
- Realizar migración por fases:
  1. Usuarios y autenticación
  2. Predios y canchas
  3. Reservas y pagos
  4. Datos auxiliares (favoritos, reseñas, etc.)
- Implementar rollback en caso de error

9. Manejo de Estado Offline
- Implementar cola de operaciones pendientes
- Sincronización automática al recuperar conexión
- Resolución de conflictos
- Caché de datos frecuentes

10. Testing de Migración
- Pruebas unitarias para nuevos servicios
- Pruebas de integración con backend
- Pruebas de migración de datos
- Pruebas de sincronización offline
- Pruebas de rendimiento

11. Monitoreo y Logging
- Implementar sistema de logs
- Monitorear errores de migración
- Tracking de métricas de rendimiento
- Alertas automáticas

12. Documentación
- Actualizar documentación de servicios
- Documentar proceso de migración
- Guías de troubleshooting
- Manual de mantenimiento 