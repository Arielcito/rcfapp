import 'package:get/get.dart';
import 'package:rcf_app/models/property/favorite_model.dart';
import 'package:rcf_app/services/property/favorite_service.dart';

class FavoriteController extends GetxController {
  final FavoriteService _favoriteService = FavoriteService();
  final RxBool isLoading = false.obs;

  Stream<List<FavoriteModel>> getFavorites(String userId) {
    return _favoriteService.getUserFavorites(userId);
  }

  Future<void> toggleFavorite(String userId, String propertyId) async {
    try {
      isLoading.value = true;
      final isFavorite = await _favoriteService.isFavorite(userId, propertyId);

      if (isFavorite) {
        await _favoriteService.removeFavorite(userId, propertyId);
        Get.snackbar(
          'Éxito',
          'Predio eliminado de favoritos',
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        await _favoriteService.addFavorite(userId, propertyId);
        Get.snackbar(
          'Éxito',
          'Predio agregado a favoritos',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'No se pudo actualizar los favoritos',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> checkIsFavorite(String userId, String propertyId) async {
    try {
      return await _favoriteService.isFavorite(userId, propertyId);
    } catch (e) {
      return false;
    }
  }
} 