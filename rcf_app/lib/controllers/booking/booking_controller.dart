import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/models/booking/booking_model.dart';
import 'package:rcf_app/services/booking/booking_service.dart';
import 'package:mercadopago_sdk/mercadopago_sdk.dart';

class BookingController extends GetxController {
  final BookingService _bookingService = BookingService();
  final MP _mercadoPago = MP(
    'TU_ACCESS_TOKEN',
    'TU_CLIENT_ID',
  ); // TODO: Mover a variables de entorno

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

  Future<void> createBooking({
    required String userId,
    required String canchaId,
    required DateTime fecha,
    required String hora,
  }) async {
    try {
      isLoading.value = true;
      error.value = '';

      final isAvailable = await _bookingService.checkAvailability(
        canchaId,
        fecha,
        hora,
      );

      if (!isAvailable) {
        throw Exception('El horario seleccionado no está disponible');
      }

      final booking = BookingModel(
        id: '',
        userId: userId,
        canchaId: canchaId,
        fecha: fecha,
        hora: hora,
        duracion: 1, // 1 hora por defecto
        estadoPago: 'pendiente',
        metodoPago: 'pendiente',
        createdAt: DateTime.now(),
      );

      await _bookingService.createBooking(booking);
      Get.snackbar(
        'Éxito',
        'Reserva creada correctamente',
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

  Future<Map<String, dynamic>> createPaymentPreference(
    String bookingId,
    double amount,
    String title,
  ) async {
    try {
      isProcessingPayment.value = true;

      final preference = {
        "items": [
          {
            "title": title,
            "quantity": 1,
            "currency_id": "ARS",
            "unit_price": isPartialPayment.value ? amount * 0.5 : amount,
          }
        ],
        "external_reference": bookingId,
        "back_urls": {
          "success": "rcfapp://payment/success",
          "failure": "rcfapp://payment/failure",
          "pending": "rcfapp://payment/pending",
        },
        "auto_return": "approved",
      };

      final result = await _mercadoPago.createPreference(preference);
      return result;
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

      final paymentStatus = isPartialPayment.value
          ? PaymentStatus.partial
          : PaymentStatus.completed;

      final bookingStatus = isPartialPayment.value
          ? BookingStatus.partial
          : BookingStatus.confirmed;

      await _bookingService.updatePaymentStatus(
        bookingId,
        paymentStatus,
        amount,
        paymentId,
      );

      final booking = await _bookingService.getBooking(bookingId);
      if (booking != null) {
        final updatedBooking = booking.copyWith(
          status: bookingStatus,
          paymentStatus: paymentStatus,
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
    totalAmount.value = isPartialPayment.value
        ? totalAmount.value * 0.5
        : totalAmount.value * 2;
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