import 'package:get/get.dart';
import '../../models/booking/booking_model.dart';
import '../../services/booking/booking_service.dart';

class BookingController extends GetxController {
  final BookingService _bookingService = BookingService();
  
  final RxList<BookingModel> userBookings = <BookingModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;
  
  // Variables para nueva reserva
  final RxInt currentStep = 0.obs;
  final Rx<DateTime?> selectedDate = Rx<DateTime?>(null);
  final RxString selectedHour = ''.obs;
  final RxList<String> availableHours = <String>[].obs;
  final RxString selectedPaymentMethod = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadUserBookings();
  }

  Future<void> loadUserBookings() async {
    try {
      isLoading.value = true;
      userBookings.value = await _bookingService.getUserBookings();
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> cancelBooking(String bookingId) async {
    try {
      isLoading.value = true;
      await _bookingService.cancelBooking(bookingId);
      await loadUserBookings();
      Get.snackbar(
        'Éxito',
        'Reserva cancelada correctamente',
        backgroundColor: const Color(0xFF00CC44),
        colorText: const Color(0xFFFFFFFF),
      );
    } catch (e) {
      error.value = e.toString();
      Get.snackbar(
        'Error',
        'No se pudo cancelar la reserva',
        backgroundColor: const Color(0xFFFF0000),
        colorText: const Color(0xFFFFFFFF),
      );
    } finally {
      isLoading.value = false;
    }
  }

  // Métodos para nueva reserva
  void nextStep() {
    if (currentStep < 2) {
      currentStep.value++;
    }
  }

  void previousStep() {
    if (currentStep > 0) {
      currentStep.value--;
    }
  }

  void setSelectedDate(DateTime date) {
    selectedDate.value = date;
  }

  void setSelectedHour(String hour) {
    selectedHour.value = hour;
  }

  void setPaymentMethod(String method) {
    selectedPaymentMethod.value = method;
  }

  Future<void> checkAvailability(String canchaId, DateTime date) async {
    try {
      isLoading.value = true;
      availableHours.value = await _bookingService.getAvailableHours(canchaId, date);
    } catch (e) {
      error.value = e.toString();
      Get.snackbar(
        'Error',
        'No se pudo obtener los horarios disponibles',
        backgroundColor: const Color(0xFFFF0000),
        colorText: const Color(0xFFFFFFFF),
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> createBooking() async {
    if (selectedDate.value == null || selectedHour.isEmpty) {
      Get.snackbar(
        'Error',
        'Por favor selecciona fecha y hora',
        backgroundColor: const Color(0xFFFF0000),
        colorText: const Color(0xFFFFFFFF),
      );
      return;
    }

    try {
      isLoading.value = true;
      final booking = BookingModel(
        id: '',
        userId: 'currentUserId', // TODO: Obtener del AuthService
        canchaId: 'selectedCanchaId',
        fecha: selectedDate.value!,
        hora: selectedHour.value,
        duracion: 1,
        estadoPago: 'pendiente',
        metodoPago: selectedPaymentMethod.value,
      );

      await _bookingService.createBooking(booking);
      Get.snackbar(
        'Éxito',
        'Reserva creada correctamente',
        backgroundColor: const Color(0xFF00CC44),
        colorText: const Color(0xFFFFFFFF),
      );
      Get.back();
    } catch (e) {
      error.value = e.toString();
      Get.snackbar(
        'Error',
        'No se pudo crear la reserva',
        backgroundColor: const Color(0xFFFF0000),
        colorText: const Color(0xFFFFFFFF),
      );
    } finally {
      isLoading.value = false;
    }
  }
} 