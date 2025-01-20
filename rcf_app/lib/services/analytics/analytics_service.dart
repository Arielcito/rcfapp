import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:logger/logger.dart';

class AnalyticsService {
  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;
  final FirebaseCrashlytics _crashlytics = FirebaseCrashlytics.instance;
  final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 2,
      errorMethodCount: 8,
      lineLength: 120,
      colors: true,
      printEmojis: true,
      printTime: true,
    ),
  );

  // Inicialización
  Future<void> init() async {
    await _crashlytics.setCrashlyticsCollectionEnabled(true);
    await _analytics.setAnalyticsCollectionEnabled(true);
  }

  // Analytics de usuario
  Future<void> setUserProperties({
    required String userId,
    required String userRole,
  }) async {
    await _analytics.setUserId(id: userId);
    await _analytics.setUserProperty(name: 'user_role', value: userRole);
  }

  // Analytics de pantalla
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    await _analytics.logScreenView(
      screenName: screenName,
      screenClass: screenClass,
    );
  }

  // Analytics de eventos
  Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  }) async {
    await _analytics.logEvent(
      name: name,
      parameters: parameters,
    );
  }

  // Analytics de reservas
  Future<void> logBookingEvent({
    required String eventName,
    required String propertyId,
    required String userId,
    required double amount,
  }) async {
    await _analytics.logEvent(
      name: eventName,
      parameters: {
        'property_id': propertyId,
        'user_id': userId,
        'amount': amount,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  // Logging de información
  void logInfo(String message) {
    _logger.i(message);
  }

  // Logging de debug
  void logDebug(String message) {
    _logger.d(message);
  }

  // Logging de warning
  void logWarning(String message) {
    _logger.w(message);
  }

  // Logging de error
  void logError(String message, dynamic error, StackTrace stackTrace) {
    _logger.e(message, error: error, stackTrace: stackTrace);
    _crashlytics.recordError(error, stackTrace, reason: message);
  }

  // Eventos predefinidos
  Future<void> logPropertyView(String propertyId) async {
    await logEvent(
      name: 'property_view',
      parameters: {'property_id': propertyId},
    );
  }

  Future<void> logBookingCreated(String bookingId, double amount) async {
    await logEvent(
      name: 'booking_created',
      parameters: {
        'booking_id': bookingId,
        'amount': amount,
      },
    );
  }

  Future<void> logBookingCancelled(String bookingId, String reason) async {
    await logEvent(
      name: 'booking_cancelled',
      parameters: {
        'booking_id': bookingId,
        'reason': reason,
      },
    );
  }

  Future<void> logPaymentCompleted(String bookingId, double amount) async {
    await logEvent(
      name: 'payment_completed',
      parameters: {
        'booking_id': bookingId,
        'amount': amount,
      },
    );
  }

  Future<void> logUserAction(String action, Map<String, dynamic> details) async {
    await logEvent(
      name: 'user_action',
      parameters: {
        'action': action,
        'details': details,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }
} 