import 'package:get/get.dart';
import '../../models/user/user_model.dart';
import '../../services/auth/new_auth_service.dart';
import '../../routes/app_routes.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AuthController extends GetxController {
  final AuthService _authService = AuthService();
  final Rx<UserModel?> user = Rx<UserModel?>(null);
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;
  String? _verificationId;

  @override
  void onInit() {
    super.onInit();
    _initAuthStateListener();
  }

  void _initAuthStateListener() {
    _authService.authStateChanges.listen((UserModel? userData) {
      user.value = userData;
    });
  }

  Future<void> signIn(String email, String password) async {
    try {
      isLoading.value = true;
      await _authService.loginWithEmail(
        email: email,
        password: password,
      );
      Get.offAllNamed('/home');
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> register(String email, String password, String name) async {
    try {
      isLoading.value = true;
      await _authService.registerWithEmail(
        email: email,
        password: password,
        name: name,
      );
      Get.offAllNamed('/home');
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    try {
      isLoading.value = true;
      await _authService.signOut();
      Get.offAllNamed('/login');
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> verifyPhoneNumber() async {
    try {
      isLoading.value = true;
      Get.toNamed('/phone-verification');
    } catch (e) {
      Get.snackbar(
        'Error',
        'No se pudo iniciar la verificación del teléfono',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> verifyPhone(String phoneNumber) async {
    try {
      isLoading.value = true;
      error.value = '';
      
      _verificationId = await _authService.verifyPhone(phoneNumber);
      
      Get.snackbar(
        'Éxito',
        'Código enviado correctamente',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      error.value = 'Error de verificación: $e';
      Get.snackbar(
        'Error',
        error.value,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> verifySmsCode(String smsCode, String phoneNumber) async {
    try {
      isLoading.value = true;
      error.value = '';

      if (_verificationId == null) {
        error.value = 'Error: Inicia el proceso de verificación nuevamente';
        return;
      }

      await _authService.verifySmsCode(_verificationId!, smsCode);
      
      Get.back();
      Get.snackbar(
        'Éxito',
        'Número de teléfono verificado correctamente',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      error.value = 'Error al verificar el código: $e';
      Get.snackbar(
        'Error',
        error.value,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  bool get isAuthenticated => user.value != null;
  String get userRole => user.value?.role ?? 'USER';
} 