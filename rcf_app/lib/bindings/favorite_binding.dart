import 'package:get/get.dart';
import 'package:rcf_app/controllers/property/favorite_controller.dart';

class FavoriteBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FavoriteController>(() => FavoriteController());
  }
} 