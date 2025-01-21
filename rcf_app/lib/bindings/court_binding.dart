import 'package:get/get.dart';
import 'package:rcf_app/controllers/court/court_controller.dart';

class CourtBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CourtController>(() => CourtController());
  }
} 