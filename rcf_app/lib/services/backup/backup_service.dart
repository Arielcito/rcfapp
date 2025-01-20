import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:rcf_app/services/cache/cache_service.dart';
import 'package:rcf_app/services/analytics/analytics_service.dart';
import 'package:rcf_app/models/booking/booking_model.dart';

class BackupService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final CacheService _cacheService;
  final AnalyticsService _analyticsService;

  BackupService(this._cacheService, this._analyticsService);

  // Respaldar datos del usuario
  Future<void> backupUserData(String userId) async {
    try {
      _analyticsService.logInfo('Iniciando respaldo de datos de usuario: $userId');

      // Obtener datos del usuario
      final userData = await _cacheService.getCachedUserData();
      if (userData != null) {
        await _firestore
            .collection('backups')
            .doc(userId)
            .collection('user_data')
            .add({
          ...userData,
          'timestamp': FieldValue.serverTimestamp(),
        });
      }

      // Obtener reservas
      final bookings = await _cacheService.getCachedBookings();
      for (final booking in bookings) {
        await _firestore
            .collection('backups')
            .doc(userId)
            .collection('bookings')
            .doc(booking.id)
            .set({
          ...booking.toMap(),
          'timestamp': FieldValue.serverTimestamp(),
        });
      }

      _analyticsService.logInfo('Respaldo completado para usuario: $userId');
    } catch (e, stackTrace) {
      _analyticsService.logError(
        'Error al respaldar datos del usuario: $userId',
        e,
        stackTrace,
      );
      rethrow;
    }
  }

  // Restaurar datos del usuario
  Future<void> restoreUserData(String userId) async {
    try {
      _analyticsService.logInfo('Iniciando restauración de datos: $userId');

      // Restaurar datos del usuario
      final userDataSnapshot = await _firestore
          .collection('backups')
          .doc(userId)
          .collection('user_data')
          .orderBy('timestamp', descending: true)
          .limit(1)
          .get();

      if (userDataSnapshot.docs.isNotEmpty) {
        final userData = userDataSnapshot.docs.first.data();
        await _cacheService.cacheUserData(userData);
      }

      // Restaurar reservas
      final bookingsSnapshot = await _firestore
          .collection('backups')
          .doc(userId)
          .collection('bookings')
          .get();

      for (final doc in bookingsSnapshot.docs) {
        final bookingData = doc.data();
        final booking = BookingModel.fromMap(bookingData);
        await _cacheService.cacheBooking(booking);
      }

      _analyticsService.logInfo('Restauración completada para usuario: $userId');
    } catch (e, stackTrace) {
      _analyticsService.logError(
        'Error al restaurar datos del usuario: $userId',
        e,
        stackTrace,
      );
      rethrow;
    }
  }

  // Programar respaldo automático
  Future<void> scheduleBackup(String userId) async {
    try {
      // Aquí se implementaría la lógica para programar respaldos automáticos
      // Por ejemplo, usando Cloud Functions o WorkManager
      _analyticsService.logInfo('Respaldo automático programado para: $userId');
    } catch (e, stackTrace) {
      _analyticsService.logError(
        'Error al programar respaldo automático',
        e,
        stackTrace,
      );
      rethrow;
    }
  }

  // Eliminar respaldos antiguos
  Future<void> cleanOldBackups(String userId) async {
    try {
      final thirtyDaysAgo = DateTime.now().subtract(Duration(days: 30));
      
      final oldBackups = await _firestore
          .collection('backups')
          .doc(userId)
          .collection('user_data')
          .where('timestamp', isLessThan: thirtyDaysAgo)
          .get();

      for (final doc in oldBackups.docs) {
        await doc.reference.delete();
      }

      _analyticsService.logInfo('Respaldos antiguos eliminados para: $userId');
    } catch (e, stackTrace) {
      _analyticsService.logError(
        'Error al limpiar respaldos antiguos',
        e,
        stackTrace,
      );
      rethrow;
    }
  }
} 