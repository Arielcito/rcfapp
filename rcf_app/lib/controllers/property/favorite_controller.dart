import 'package:get/get.dart';
import 'package:rcf_app/models/property/favorite_model.dart';
import 'package:rcf_app/services/property/favorite_service.dart';
import 'package:rcf_app/services/auth/auth_service.dart';

class FavoriteController extends GetxController {
  final FavoriteService _favoriteService = FavoriteService();
  final AuthService _authService = AuthService();
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
  }

  Stream<List<FavoriteModel>> getFavorites() {
    final currentUser = _authService.currentUser;
    if (currentUser.data == null) {
      return Stream.value([]);
    }
    return _favoriteService.getUserFavorites(currentUser.data!.id);
  }

  Future<void> toggleFavorite(String propertyId) async {
    try {
      isLoading.value = true;
      final currentUser = _authService.currentUser;
      if (currentUser.data == null) {
        Get.snackbar(
          'Error',
          'Debes iniciar sesión para agregar favoritos',
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }

      final userId = currentUser.data!.id;
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

  Future<bool> checkIsFavorite(String propertyId) async {
    try {
      final currentUser = _authService.currentUser;
      if (currentUser.data == null) {
        return false;
      }
      return await _favoriteService.isFavorite(currentUser.data!.id, propertyId);
    } catch (e) {
      return false;
    }
  }
} 