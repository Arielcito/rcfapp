import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:rcf_app/models/booking/booking_model.dart';

class BookingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'bookings';

  // Obtener reservas del usuario
  Stream<List<BookingModel>> getUserBookings(String userId) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => BookingModel.fromFirestore(doc))
          .toList();
    });
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

  // Verificar disponibilidad
  Future<bool> checkAvailability(
    String propertyId,
    String courtId,
    DateTime date,
    DateTime startTime,
    DateTime endTime,
  ) async {
    final QuerySnapshot snapshot = await _firestore
        .collection(_collection)
        .where('propertyId', isEqualTo: propertyId)
        .where('courtId', isEqualTo: courtId)
        .where('date', isEqualTo: Timestamp.fromDate(date))
        .where('status', whereIn: [
          BookingStatus.confirmed.toString(),
          BookingStatus.partial.toString(),
        ])
        .get();

    for (var doc in snapshot.docs) {
      final booking = BookingModel.fromFirestore(doc);
      if (booking.startTime.isBefore(endTime) &&
          booking.endTime.isAfter(startTime)) {
        return false;
      }
    }

    return true;
  }

  // Crear una nueva reserva
  Future<String> createBooking(BookingModel booking) async {
    final isAvailable = await checkAvailability(
      booking.propertyId,
      booking.courtId,
      booking.date,
      booking.startTime,
      booking.endTime,
    );

    if (!isAvailable) {
      throw Exception('El horario seleccionado no está disponible');
    }

    final docRef = await _firestore.collection(_collection).add(booking.toMap());
    return docRef.id;
  }

  // Actualizar una reserva
  Future<void> updateBooking(BookingModel booking) async {
    await _firestore
        .collection(_collection)
        .doc(booking.id)
        .update(booking.toMap());
  }

  // Cancelar una reserva
  Future<void> cancelBooking(String bookingId) async {
    final booking = await getBooking(bookingId);
    if (booking == null) {
      throw Exception('Reserva no encontrada');
    }

    final now = DateTime.now();
    final difference = booking.startTime.difference(now);
    if (difference.inHours < 3) {
      throw Exception('No se puede cancelar con menos de 3 horas de anticipación');
    }

    await _firestore.collection(_collection).doc(bookingId).update({
      'status': BookingStatus.cancelled.toString(),
      'updatedAt': DateTime.now(),
    });
  }

  // Obtener una reserva específica
  Future<BookingModel?> getBooking(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (!doc.exists) return null;
    return BookingModel.fromFirestore(doc);
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