import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/booking/booking_model.dart';

class BookingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'bookings';

  // Crear una nueva reserva
  Future<String> createBooking(BookingModel booking) async {
    try {
      final docRef = await _firestore.collection(_collection).add(booking.toJson());
      return docRef.id;
    } catch (e) {
      throw Exception('Error al crear la reserva: $e');
    }
  }

  // Obtener una reserva por ID
  Future<BookingModel?> getBooking(String id) async {
    try {
      final doc = await _firestore.collection(_collection).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return BookingModel.fromJson({'id': doc.id, ...doc.data()!});
    } catch (e) {
      throw Exception('Error al obtener la reserva: $e');
    }
  }

  // Obtener reservas de un usuario
  Stream<List<BookingModel>> getUserBookings(String userId) {
    try {
      return _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .orderBy('date', descending: true)
          .snapshots()
          .map((snapshot) => snapshot.docs
              .map((doc) => BookingModel.fromJson({'id': doc.id, ...doc.data()}))
              .toList());
    } catch (e) {
      throw Exception('Error al obtener las reservas del usuario: $e');
    }
  }

  // Verificar disponibilidad de una cancha
  Future<bool> checkAvailability(
    String propertyId,
    String courtId,
    DateTime date,
    DateTime startTime,
    DateTime endTime,
  ) async {
    try {
      final querySnapshot = await _firestore
          .collection(_collection)
          .where('propertyId', isEqualTo: propertyId)
          .where('courtId', isEqualTo: courtId)
          .where('date', isEqualTo: Timestamp.fromDate(date))
          .where('startTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startTime))
          .where('startTime', isLessThan: Timestamp.fromDate(endTime))
          .get();

      return querySnapshot.docs.isEmpty;
    } catch (e) {
      throw Exception('Error al verificar disponibilidad: $e');
    }
  }

  // Actualizar una reserva
  Future<void> updateBooking(BookingModel booking) async {
    try {
      await _firestore.collection(_collection).doc(booking.id).update(booking.toJson());
    } catch (e) {
      throw Exception('Error al actualizar la reserva: $e');
    }
  }

  // Reprogramar una reserva
  Future<void> rescheduleBooking(
    String bookingId, 
    DateTime newDate,
    DateTime newStartTime,
    DateTime newEndTime,
  ) async {
    try {
      await _firestore.collection(_collection).doc(bookingId).update({
        'date': Timestamp.fromDate(newDate),
        'startTime': Timestamp.fromDate(newStartTime),
        'endTime': Timestamp.fromDate(newEndTime),
        'updatedAt': Timestamp.now(),
      });
    } catch (e) {
      throw Exception('Error al reprogramar la reserva: $e');
    }
  }

  // Cancelar una reserva
  Future<void> cancelBooking(String id) async {
    try {
      await _firestore.collection(_collection).doc(id).update({
        'status': BookingStatus.cancelled.toString().split('.').last,
        'updatedAt': Timestamp.now(),
      });
    } catch (e) {
      throw Exception('Error al cancelar la reserva: $e');
    }
  }

  // Obtener reservas de un predio
  Stream<List<BookingModel>> getPropertyBookings(String propertyId) {
    return _firestore
        .collection(_collection)
        .where('propertyId', isEqualTo: propertyId)
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => BookingModel.fromJson({'id': doc.id, ...doc.data()}))
          .toList();
    });
  }

  // Marcar una reserva como completada
  Future<void> completeBooking(String bookingId) async {
    await _firestore.collection(_collection).doc(bookingId).update({
      'status': BookingStatus.completed.toString().split('.').last,
      'updatedAt': Timestamp.now(),
    });
  }

  // Actualizar el estado de pago
  Future<void> updatePaymentStatus(
    String bookingId,
    PaymentStatus status,
    double paidAmount,
    String? paymentId,
  ) async {
    await _firestore.collection(_collection).doc(bookingId).update({
      'paymentStatus': status.toString(),
      'paidAmount': paidAmount,
      'paymentId': paymentId,
      'updatedAt': DateTime.now(),
    });
  }
} 