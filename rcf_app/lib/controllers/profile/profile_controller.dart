import 'package:get/get.dart';
import '../../models/user/user_model.dart';
import '../../services/auth/auth_service.dart';

class ProfileController extends GetxController {
  final AuthService _authService = AuthService();
  final Rx<UserModel?> user = Rx<UserModel?>(null);

  @override
  void onInit() {
    super.onInit();
    loadUserData();
  }

  Future<void> loadUserData() async {
    try {
      final userData = await _authService.getCurrentUser();
      user.value = userData;
    } catch (e) {
      Get.snackbar(
        'Error',
        'Error al cargar los datos del usuario: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> verifyPhone() async {
    try {
      if (user.value?.phoneNumber == null) {
        Get.snackbar(
          'Error',
          'No hay número de teléfono para verificar',
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }
      
      final response = await _authService.verifyPhone(user.value!.phoneNumber!);
      if (response.success) {
        await loadUserData();
        Get.snackbar(
          'Éxito',
          response.message ?? 'Código enviado correctamente',
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar(
          'Error',
          response.message ?? 'Error al verificar el teléfono',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Error al verificar el teléfono: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> signOut() async {
    try {
      await _authService.signOut();
      Get.offAllNamed('/login');
    } catch (e) {
      Get.snackbar(
        'Error',
        'Error al cerrar sesión: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
} 