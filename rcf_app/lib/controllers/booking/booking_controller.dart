import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/models/booking/booking_model.dart';
import 'package:rcf_app/services/booking/booking_service.dart';
import 'package:rcf_app/services/payment/payment_service.dart';

class BookingController extends GetxController {
  final BookingService _bookingService = BookingService();
  final PaymentService _paymentService = PaymentService();

  final RxList<BookingModel> userBookings = <BookingModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;
  final RxBool isProcessingPayment = false.obs;
  final Rx<DateTime> selectedDate = DateTime.now().obs;
  final Rx<DateTime> selectedTime = DateTime.now().obs;
  final RxDouble totalAmount = 0.0.obs;
  final RxBool isPartialPayment = false.obs;

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
      isLoading.value = true;
      return await _bookingService.checkAvailability(
        propertyId,
        courtId,
        date,
        startTime,
        endTime,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<String> createBooking({
    required String userId,
    required String propertyId,
    required String courtId,
    required double price,
  }) async {
    try {
      isLoading.value = true;
      error.value = '';

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
      isLoading.value = false;
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

  Future<void> cancelBooking(String bookingId) async {
    try {
      isLoading.value = true;
      error.value = '';

      await _bookingService.cancelBooking(bookingId);
      Get.snackbar(
        'Éxito',
        'Reserva cancelada correctamente',
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    } catch (e) {
      error.value = e.toString();
      Get.snackbar(
        'Error',
        error.value,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
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

  void loadUserBookings(String userId) {
    try {
      isLoading.value = true;
      error.value = '';

      _bookingService.getUserBookings(userId).listen(
        (bookings) {
          userBookings.value = bookings;
        },
        onError: (e) {
          error.value = e.toString();
          Get.snackbar(
            'Error',
            error.value,
            backgroundColor: Colors.red,
            colorText: Colors.white,
          );
        },
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> rescheduleBooking({
    required String bookingId,
    required DateTime newFecha,
    required String newHora,
    required String canchaId,
  }) async {
    try {
      isLoading.value = true;
      error.value = '';

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
      error.value = e.toString();
      Get.snackbar(
        'Error',
        error.value,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }
} 