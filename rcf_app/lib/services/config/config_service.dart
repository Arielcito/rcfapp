import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';

class ConfigService {
  late PackageInfo _packageInfo;
  late Map<String, dynamic> _deviceInfo;
  bool _isInitialized = false;

  // Inicialización
  Future<void> init() async {
    if (_isInitialized) return;

    await dotenv.load(fileName: '.env');
    _packageInfo = await PackageInfo.fromPlatform();
    
    final deviceInfo = DeviceInfoPlugin();
    if (await deviceInfo.iosInfo != null) {
      final iosInfo = await deviceInfo.iosInfo;
      _deviceInfo = {
        'platform': 'iOS',
        'version': iosInfo.systemVersion,
        'device': iosInfo.model,
        'name': iosInfo.name,
      };
    } else {
      final androidInfo = await deviceInfo.androidInfo;
      _deviceInfo = {
        'platform': 'Android',
        'version': androidInfo.version.release,
        'device': androidInfo.model,
        'manufacturer': androidInfo.manufacturer,
      };
    }

    _isInitialized = true;
  }

  // Firebase
  String get firebaseApiKey => dotenv.env['FIREBASE_API_KEY'] ?? '';
  String get firebaseAppId => dotenv.env['FIREBASE_APP_ID'] ?? '';
  String get firebaseMessagingSenderId => dotenv.env['FIREBASE_MESSAGING_SENDER_ID'] ?? '';
  String get firebaseProjectId => dotenv.env['FIREBASE_PROJECT_ID'] ?? '';
  String get firebaseStorageBucket => dotenv.env['FIREBASE_STORAGE_BUCKET'] ?? '';

  // Google Maps
  String get googleMapsApiKey => dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';

  // Mercado Pago
  String get mercadoPagoPublicKey => dotenv.env['MERCADO_PAGO_PUBLIC_KEY'] ?? '';
  String get mercadoPagoAccessToken => dotenv.env['MERCADO_PAGO_ACCESS_TOKEN'] ?? '';
  String get mercadoPagoClientId => dotenv.env['MERCADO_PAGO_CLIENT_ID'] ?? '';

  // App
  String get appName => dotenv.env['APP_NAME'] ?? 'RCF App';
  String get appEnv => dotenv.env['APP_ENV'] ?? 'development';
  String get apiUrl => dotenv.env['API_URL'] ?? '';
  String get supportEmail => dotenv.env['SUPPORT_EMAIL'] ?? '';
  String get supportPhone => dotenv.env['SUPPORT_PHONE'] ?? '';

  // Analytics
  bool get analyticsEnabled => dotenv.env['ANALYTICS_ENABLED']?.toLowerCase() == 'true';
  bool get errorReportingEnabled => dotenv.env['ERROR_REPORTING_ENABLED']?.toLowerCase() == 'true';

  // Información de la aplicación
  String get appVersion => _packageInfo.version;
  String get buildNumber => _packageInfo.buildNumber;
  String get packageName => _packageInfo.packageName;

  // Información del dispositivo
  Map<String, dynamic> get deviceInfo => Map.from(_deviceInfo);
  String get platform => _deviceInfo['platform'] as String;
  String get deviceVersion => _deviceInfo['version'] as String;
  String get deviceModel => _deviceInfo['device'] as String;

  // Validación de configuración
  bool validateConfig() {
    if (!_isInitialized) return false;

    final requiredKeys = [
      'FIREBASE_API_KEY',
      'FIREBASE_APP_ID',
      'FIREBASE_PROJECT_ID',
      'GOOGLE_MAPS_API_KEY',
      'MERCADO_PAGO_PUBLIC_KEY',
      'MERCADO_PAGO_ACCESS_TOKEN',
    ];

    for (final key in requiredKeys) {
      if (dotenv.env[key]?.isEmpty ?? true) {
        print('Falta la configuración requerida: $key');
        return false;
      }
    }

    return true;
  }

  // Obtener todas las configuraciones (útil para debugging)
  Map<String, dynamic> getAllConfigs() {
    return {
      'firebase': {
        'apiKey': firebaseApiKey,
        'appId': firebaseAppId,
        'projectId': firebaseProjectId,
        'messagingSenderId': firebaseMessagingSenderId,
        'storageBucket': firebaseStorageBucket,
      },
      'googleMaps': {
        'apiKey': googleMapsApiKey,
      },
      'mercadoPago': {
        'publicKey': mercadoPagoPublicKey,
        'clientId': mercadoPagoClientId,
      },
      'app': {
        'name': appName,
        'env': appEnv,
        'version': appVersion,
        'buildNumber': buildNumber,
        'packageName': packageName,
      },
      'device': deviceInfo,
      'features': {
        'analyticsEnabled': analyticsEnabled,
        'errorReportingEnabled': errorReportingEnabled,
      },
    };
  }
} 