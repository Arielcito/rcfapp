import 'package:get/get.dart';
import 'package:rcf_app/controllers/booking/booking_controller.dart';

class BookingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BookingController>(() => BookingController());
  }
} 