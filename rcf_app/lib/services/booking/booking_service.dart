import 'package:rcf_app/models/booking/booking_model.dart';
import 'package:rcf_app/services/api/api_client.dart';
import 'package:rcf_app/services/cache/cache_service.dart';

class BookingService {
  final ApiClient _apiClient = ApiClient();
  final CacheService _cacheService = CacheService();
  final String _endpoint = '/reservas';
  final String _cacheKey = 'bookings';

  Future<List<BookingModel>> getAllBookings() async {
    try {
      final cachedData = await _cacheService.get(_cacheKey);
      if (cachedData != null) {
        return (cachedData as List)
            .map((item) => BookingModel.fromJson(item))
            .toList();
      }

      final response = await _apiClient.get(_endpoint);
      final bookings = (response.data as List)
          .map((item) => BookingModel.fromJson(item))
          .toList();

      await _cacheService.set(_cacheKey, bookings);
      return bookings;
    } catch (e) {
      throw Exception('Error al obtener las reservas: $e');
    }
  }

  Future<List<BookingModel>> getBookingsByUser(String userId) async {
    try {
      final cacheKey = '${_cacheKey}_user_$userId';
      final cachedData = await _cacheService.get(cacheKey);
      if (cachedData != null) {
        return (cachedData as List)
            .map((item) => BookingModel.fromJson(item))
            .toList();
      }

      final response = await _apiClient.get('$_endpoint/usuario/$userId');
      final bookings = (response.data as List)
          .map((item) => BookingModel.fromJson(item))
          .toList();

      await _cacheService.set(cacheKey, bookings);
      return bookings;
    } catch (e) {
      throw Exception('Error al obtener las reservas del usuario: $e');
    }
  }

  Future<List<BookingModel>> getBookingsByProperty(String propertyId) async {
    try {
      final cacheKey = '${_cacheKey}_property_$propertyId';
      final cachedData = await _cacheService.get(cacheKey);
      if (cachedData != null) {
        return (cachedData as List)
            .map((item) => BookingModel.fromJson(item))
            .toList();
      }

      final response = await _apiClient.get('$_endpoint/predio/$propertyId');
      final bookings = (response.data as List)
          .map((item) => BookingModel.fromJson(item))
          .toList();

      await _cacheService.set(cacheKey, bookings);
      return bookings;
    } catch (e) {
      throw Exception('Error al obtener las reservas del predio: $e');
    }
  }

  Future<BookingModel> getBookingById(String id) async {
    try {
      final cacheKey = '${_cacheKey}_$id';
      final cachedData = await _cacheService.get(cacheKey);
      if (cachedData != null) {
        return BookingModel.fromJson(cachedData);
      }

      final response = await _apiClient.get('$_endpoint/$id');
      final booking = BookingModel.fromJson(response.data);

      await _cacheService.set(cacheKey, booking);
      return booking;
    } catch (e) {
      throw Exception('Error al obtener la reserva: $e');
    }
  }

  Future<BookingModel> createBooking(BookingModel booking) async {
    try {
      final response = await _apiClient.post(_endpoint, data: booking.toJson());
      final newBooking = BookingModel.fromJson(response.data);

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_user_${booking.userId}');
      await _cacheService.delete('${_cacheKey}_property_${booking.propertyId}');

      return newBooking;
    } catch (e) {
      throw Exception('Error al crear la reserva: $e');
    }
  }

  Future<BookingModel> updateBooking(String id, BookingModel booking) async {
    try {
      final response = await _apiClient.put('$_endpoint/$id', data: booking.toJson());
      final updatedBooking = BookingModel.fromJson(response.data);

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_$id');
      await _cacheService.delete('${_cacheKey}_user_${booking.userId}');
      await _cacheService.delete('${_cacheKey}_property_${booking.propertyId}');

      return updatedBooking;
    } catch (e) {
      throw Exception('Error al actualizar la reserva: $e');
    }
  }

  Future<void> cancelBooking(String id) async {
    try {
      final booking = await getBookingById(id);
      await _apiClient.patch('$_endpoint/$id/cancelar');

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_$id');
      await _cacheService.delete('${_cacheKey}_user_${booking.userId}');
      await _cacheService.delete('${_cacheKey}_property_${booking.propertyId}');
    } catch (e) {
      throw Exception('Error al cancelar la reserva: $e');
    }
  }

  Future<void> completeBooking(String id) async {
    try {
      final booking = await getBookingById(id);
      await _apiClient.patch('$_endpoint/$id/completar');

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_$id');
      await _cacheService.delete('${_cacheKey}_user_${booking.userId}');
      await _cacheService.delete('${_cacheKey}_property_${booking.propertyId}');
    } catch (e) {
      throw Exception('Error al completar la reserva: $e');
    }
  }

  Future<bool> checkAvailability({
    required String propertyId,
    required String courtId,
    required DateTime date,
    required DateTime startTime,
    required DateTime endTime,
  }) async {
    try {
      final response = await _apiClient.post('$_endpoint/check-availability', data: {
        'propertyId': propertyId,
        'courtId': courtId,
        'date': date.toIso8601String(),
        'startTime': startTime.toIso8601String(),
        'endTime': endTime.toIso8601String(),
      });
      
      return response.data['available'] as bool;
    } catch (e) {
      throw Exception('Error al verificar la disponibilidad: $e');
    }
  }
} 