import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/booking/booking_model.dart';

class BookingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<List<BookingModel>> getUserBookings() async {
    try {
      final querySnapshot = await _firestore
          .collection('bookings')
          .where('userId', isEqualTo: 'currentUserId') // TODO: Obtener del AuthService
          .orderBy('fecha', descending: true)
          .get();

      return querySnapshot.docs
          .map((doc) => BookingModel.fromJson({...doc.data(), 'id': doc.id}))
          .toList();
    } catch (e) {
      throw Exception('Error al obtener las reservas: $e');
    }
  }

  Future<void> createBooking(BookingModel booking) async {
    try {
      // Verificar disponibilidad antes de crear
      final isAvailable = await checkAvailability(booking.canchaId, booking.fecha);
      if (!isAvailable) {
        throw Exception('El horario seleccionado no está disponible');
      }

      await _firestore.collection('bookings').add(booking.toJson());
    } catch (e) {
      throw Exception('Error al crear la reserva: $e');
    }
  }

  Future<void> cancelBooking(String bookingId) async {
    try {
      await _firestore.collection('bookings').doc(bookingId).update({
        'estadoPago': 'cancelado',
      });
    } catch (e) {
      throw Exception('Error al cancelar la reserva: $e');
    }
  }

  Future<List<String>> getAvailableHours(String canchaId, DateTime date) async {
    try {
      // Horarios posibles
      final allHours = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
      ];

      // Obtener reservas existentes para la fecha
      final querySnapshot = await _firestore
          .collection('bookings')
          .where('canchaId', isEqualTo: canchaId)
          .where('fecha', isEqualTo: Timestamp.fromDate(DateTime(
            date.year,
            date.month,
            date.day,
          )))
          .get();

      // Obtener horas ocupadas
      final bookedHours = querySnapshot.docs
          .map((doc) => doc.data()['hora'] as String)
          .toList();

      // Filtrar horas disponibles
      return allHours.where((hour) => !bookedHours.contains(hour)).toList();
    } catch (e) {
      throw Exception('Error al obtener horarios disponibles: $e');
    }
  }

  Future<bool> checkAvailability(String canchaId, DateTime date) async {
    try {
      final querySnapshot = await _firestore
          .collection('bookings')
          .where('canchaId', isEqualTo: canchaId)
          .where('fecha', isEqualTo: Timestamp.fromDate(date))
          .get();

      return querySnapshot.docs.isEmpty;
    } catch (e) {
      throw Exception('Error al verificar disponibilidad: $e');
    }
  }
} 