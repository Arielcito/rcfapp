# RCF App - Reserva de Canchas de Fútbol

Una aplicación móvil multiplataforma para la gestión y reserva de canchas de fútbol, desarrollada con Flutter.

## 📱 Características Principales

### Para Usuarios
- Búsqueda y reserva de canchas
- Sistema de favoritos
- Pagos con Mercado Pago
- Integración con WhatsApp
- Historial de reservas
- Notificaciones push
- Mapa interactivo

### Para Dueños de Canchas
- Dashboard con analíticas
- Gestión de reservas
- Control de pagos
- Calendario de disponibilidad
- Notificaciones de nuevas reservas

## 🛠 Requisitos del Sistema

- Flutter SDK: ^3.6.1
- Dart SDK: ^3.6.1
- iOS 12.0 o superior
- Android 5.0 (API 21) o superior
- Xcode 14.0 o superior (para desarrollo iOS)
- Android Studio (para desarrollo Android)

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/rcf-app.git
cd rcf_app
```

2. Instalar dependencias:
```bash
flutter pub get
```

3. Configurar variables de entorno:
- Copiar `.env.example` a `.env`
- Completar las variables requeridas

4. Ejecutar la aplicación:
```bash
flutter run
```

## ⚙️ Configuración

### Firebase
1. Crear proyecto en Firebase Console
2. Agregar aplicaciones iOS y Android
3. Descargar archivos de configuración:
   - iOS: `GoogleService-Info.plist`
   - Android: `google-services.json`
4. Configurar variables en `.env`

### Google Maps
1. Obtener API Key en Google Cloud Console
2. Habilitar Maps SDK para iOS y Android
3. Configurar la key en `.env`

### Mercado Pago
1. Crear cuenta de desarrollador
2. Obtener credenciales de prueba
3. Configurar variables en `.env`

## 📦 Estructura del Proyecto

```
lib/
├── models/          # Modelos de datos
├── views/           # Interfaces de usuario
├── controllers/     # Lógica de negocio
├── services/        # Servicios externos
├── utils/           # Utilidades
└── bindings/        # Inyección de dependencias
```

## 🔧 Desarrollo

### Comandos Útiles

```bash
# Ejecutar tests
flutter test

# Generar código
flutter pub run build_runner build

# Construir para producción
flutter build ios
flutter build apk --release
```

### Convenciones de Código

- Seguir las guías de estilo de Flutter/Dart
- Usar GetX para gestión de estado
- Implementar Clean Architecture
- Documentar clases y métodos principales

## 📱 Builds de Producción

### iOS
1. Configurar certificados en Apple Developer Portal
2. Actualizar `ios/Runner.xcodeproj`
3. Ejecutar:
```bash
flutter build ipa
```

### Android
1. Configurar key.properties
2. Generar key store:
```bash
keytool -genkey -v -keystore key.jks -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```
3. Ejecutar:
```bash
flutter build appbundle
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

- Email: soporte@rcfapp.com
- WhatsApp: +541112345678
- Documentación: [docs.rcfapp.com](https://docs.rcfapp.com)
