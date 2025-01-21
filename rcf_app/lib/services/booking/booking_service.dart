import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/booking/booking_model.dart';

class BookingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'bookings';

  // Crear una nueva reserva
  Future<BookingModel> createBooking(BookingModel booking) async {
    try {
      final docRef = await _firestore.collection(_collection).add(booking.toJson());
      return booking.copyWith(id: docRef.id);
    } catch (e) {
      throw Exception('Error al crear la reserva: $e');
    }
  }

  // Obtener una reserva por ID
  Future<BookingModel> getBookingById(String id) async {
    try {
      final doc = await _firestore.collection(_collection).doc(id).get();
      if (!doc.exists) {
        throw Exception('Reserva no encontrada');
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
          .orderBy('fecha', descending: true)
          .snapshots()
          .map((snapshot) => snapshot.docs
              .map((doc) => BookingModel.fromJson({'id': doc.id, ...doc.data()}))
              .toList());
    } catch (e) {
      throw Exception('Error al obtener las reservas del usuario: $e');
    }
  }

  // Verificar disponibilidad de una cancha
  Future<bool> checkAvailability(String canchaId, DateTime fecha, String hora) async {
    try {
      final querySnapshot = await _firestore
          .collection(_collection)
          .where('canchaId', isEqualTo: canchaId)
          .where('fecha', isEqualTo: Timestamp.fromDate(fecha))
          .where('hora', isEqualTo: hora)
          .get();

      return querySnapshot.docs.isEmpty;
    } catch (e) {
      throw Exception('Error al verificar disponibilidad: $e');
    }
  }

  // Actualizar una reserva
  Future<void> updateBooking(String id, Map<String, dynamic> changes) async {
    try {
      await _firestore.collection(_collection).doc(id).update({
        ...changes,
        'updatedAt': Timestamp.now(),
      });
    } catch (e) {
      throw Exception('Error al actualizar la reserva: $e');
    }
  }

  // Reprogramar una reserva
  Future<void> rescheduleBooking(
    String bookingId, 
    DateTime newFecha, 
    String newHora
  ) async {
    try {
      await _firestore.collection(_collection).doc(bookingId).update({
        'fecha': Timestamp.fromDate(newFecha),
        'hora': newHora,
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
        'estadoPago': 'cancelado',
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
          .map((doc) => BookingModel.fromFirestore(doc))
          .toList();
    });
  }

  // Marcar una reserva como completada
  Future<void> completeBooking(String bookingId) async {
    await _firestore.collection(_collection).doc(bookingId).update({
      'status': BookingStatus.completed.toString(),
      'updatedAt': DateTime.now(),
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