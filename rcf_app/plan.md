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
