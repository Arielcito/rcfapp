import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/models/booking/booking_model.dart';
import 'package:rcf_app/services/booking/booking_service.dart';
import 'package:rcf_app/services/payment/payment_service.dart';

class BookingController extends GetxController {
  final BookingService _bookingService = BookingService();
  final PaymentService _paymentService = PaymentService();

  final RxList<BookingModel> _bookings = <BookingModel>[].obs;
  final RxBool _isLoading = false.obs;
  final RxString _error = ''.obs;
  final RxBool isProcessingPayment = false.obs;
  final Rx<DateTime> selectedDate = DateTime.now().obs;
  final Rx<DateTime> selectedTime = DateTime.now().obs;
  final RxDouble totalAmount = 0.0.obs;
  final RxBool isPartialPayment = false.obs;

  // Getters
  List<BookingModel> get bookings => _bookings;
  bool get isLoading => _isLoading.value;
  String get error => _error.value;

  Stream<List<BookingModel>> getUserBookings(String userId) {
    return _bookingService.getUserBookings(userId);
  }

  Stream<List<BookingModel>> getPropertyBookings(String propertyId) {
    return _bookingService.getPropertyBookings(propertyId);
  }

  Future<bool> checkAvailability(
    String propertyId,
    String courtId,
    DateTime date,
    DateTime startTime,
    DateTime endTime,
  ) async {
    try {
      _isLoading.value = true;
      final isAvailable = await _bookingService.checkAvailability(
        propertyId,
        courtId,
        date,
        startTime,
        endTime,
      );
      _error.value = '';
      return isAvailable;
    } finally {
      _isLoading.value = false;
    }
  }

  Future<String> createBooking({
    required String userId,
    required String propertyId,
    required String courtId,
    required double price,
  }) async {
    try {
      _isLoading.value = true;
      _error.value = '';

      final isAvailable = await checkAvailability(
        propertyId,
        courtId,
        selectedDate.value,
        selectedTime.value,
        selectedTime.value.add(Duration(hours: 1)),
      );

      if (!isAvailable) {
        throw Exception('El horario seleccionado no está disponible');
      }

      final booking = BookingModel(
        id: '',
        userId: userId,
        propertyId: propertyId,
        courtId: courtId,
        date: selectedDate.value,
        startTime: selectedTime.value,
        endTime: selectedTime.value.add(Duration(hours: 1)),
        duration: 1,
        status: BookingStatus.pending,
        paymentStatus: PaymentStatus.pending,
        paymentMethod: PaymentMethod.mercadoPago,
        totalAmount: price,
        paidAmount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final bookingId = await _bookingService.createBooking(booking);
      return bookingId;
    } finally {
      _isLoading.value = false;
    }
  }

  Future<Map<String, dynamic>> createPaymentPreference(
    String bookingId,
    double amount,
    String title,
  ) async {
    try {
      isProcessingPayment.value = true;
      final finalAmount = isPartialPayment.value ? amount * 0.5 : amount;

      return await _paymentService.createPaymentPreference(
        title: title,
        description: 'Reserva de cancha - ${isPartialPayment.value ? 'Seña' : 'Pago completo'}',
        amount: finalAmount,
        bookingId: bookingId,
      );
    } finally {
      isProcessingPayment.value = false;
    }
  }

  Future<void> processPayment(
    String bookingId,
    String paymentId,
    double amount,
  ) async {
    try {
      isProcessingPayment.value = true;

      final paymentStatus = await _paymentService.getPaymentStatus(paymentId);
      
      if (paymentStatus['status'] == 'approved') {
        final bookingStatus = isPartialPayment.value
            ? BookingStatus.partial
            : BookingStatus.confirmed;

        final booking = await _bookingService.getBooking(bookingId);
        if (booking != null) {
          final updatedBooking = booking.copyWith(
            status: bookingStatus,
            paymentStatus: isPartialPayment.value ? PaymentStatus.partial : PaymentStatus.completed,
            paidAmount: amount,
            paymentId: paymentId,
            updatedAt: DateTime.now(),
          );
          await _bookingService.updateBooking(updatedBooking);
        }

        Get.snackbar(
          'Éxito',
          'Pago procesado correctamente',
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        throw Exception('El pago no fue aprobado');
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Error al procesar el pago',
        snackPosition: SnackPosition.BOTTOM,
      );
      rethrow;
    } finally {
      isProcessingPayment.value = false;
    }
  }

  Future<bool> cancelBooking(String bookingId) async {
    try {
      _isLoading.value = true;
      await _bookingService.cancelBooking(bookingId);
      final index = _bookings.indexWhere((b) => b.id == bookingId);
      if (index != -1) {
        _bookings.removeAt(index);
      }
      _error.value = '';
      return true;
    } catch (e) {
      _error.value = e.toString();
      Get.snackbar(
        'Error',
        _error.value,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return false;
    } finally {
      _isLoading.value = false;
    }
  }

  void setSelectedDate(DateTime date) {
    selectedDate.value = date;
  }

  void setSelectedTime(DateTime time) {
    selectedTime.value = time;
  }

  void togglePartialPayment() {
    isPartialPayment.value = !isPartialPayment.value;
  }

  Future<void> loadUserBookings(String userId) async {
    try {
      _isLoading.value = true;
      _error.value = '';

      final bookings = await _bookingService.getBookingsByUser(userId);
      _bookings.assignAll(bookings);
    } catch (error) {
      _error.value = 'Error al cargar las reservas del usuario: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  Future<void> rescheduleBooking({
    required String bookingId,
    required DateTime newFecha,
    required String newHora,
    required String canchaId,
  }) async {
    try {
      _isLoading.value = true;
      _error.value = '';

      final isAvailable = await _bookingService.checkAvailability(
        canchaId,
        newFecha,
        newHora,
      );

      if (!isAvailable) {
        throw Exception('El nuevo horario seleccionado no está disponible');
      }

      await _bookingService.rescheduleBooking(bookingId, newFecha, newHora);
      Get.snackbar(
        'Éxito',
        'Reserva reprogramada correctamente',
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    } catch (e) {
      _error.value = e.toString();
      Get.snackbar(
        'Error',
        _error.value,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      _isLoading.value = false;
    }
  }

  Future<void> loadBookings() async {
    try {
      _isLoading.value = true;
      final bookings = await _bookingService.getAllBookings();
      _bookings.assignAll(bookings);
      _error.value = '';
    } catch (error) {
      _error.value = 'Error al cargar las reservas: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  Future<void> loadPropertyBookings(String propertyId) async {
    try {
      _isLoading.value = true;
      final bookings = await _bookingService.getBookingsByProperty(propertyId);
      _bookings.assignAll(bookings);
      _error.value = '';
    } catch (error) {
      _error.value = 'Error al cargar las reservas del predio: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  Future<BookingModel?> getBooking(String id) async {
    try {
      _isLoading.value = true;
      final booking = await _bookingService.getBookingById(id);
      _error.value = '';
      return booking;
    } catch (error) {
      _error.value = 'Error al obtener la reserva: $error';
      return null;
    } finally {
      _isLoading.value = false;
    }
  }

  Future<BookingModel?> createBooking(BookingModel booking) async {
    try {
      _isLoading.value = true;
      final newBooking = await _bookingService.createBooking(booking);
      _bookings.add(newBooking);
      _error.value = '';
      return newBooking;
    } catch (error) {
      _error.value = 'Error al crear la reserva: $error';
      return null;
    } finally {
      _isLoading.value = false;
    }
  }

  Future<BookingModel?> updateBooking(String id, BookingModel booking) async {
    try {
      _isLoading.value = true;
      final updatedBooking = await _bookingService.updateBooking(id, booking);
      final index = _bookings.indexWhere((b) => b.id == id);
      if (index != -1) {
        _bookings[index] = updatedBooking;
      }
      _error.value = '';
      return updatedBooking;
    } catch (error) {
      _error.value = 'Error al actualizar la reserva: $error';
      return null;
    } finally {
      _isLoading.value = false;
    }
  }

  Future<bool> completeBooking(String id) async {
    try {
      _isLoading.value = true;
      await _bookingService.completeBooking(id);
      final index = _bookings.indexWhere((b) => b.id == id);
      if (index != -1) {
        final booking = _bookings[index];
        _bookings[index] = booking.copyWith(
          status: BookingStatus.completed,
          updatedAt: DateTime.now(),
        );
      }
      _error.value = '';
      return true;
    } catch (error) {
      _error.value = 'Error al completar la reserva: $error';
      return false;
    } finally {
      _isLoading.value = false;
    }
  }
} 