import 'package:get/get.dart';
import 'package:rcf_app/controllers/property/property_controller.dart';

class PropertyBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PropertyController>(() => PropertyController());
  }
} 