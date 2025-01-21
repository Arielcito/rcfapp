import 'package:get/get.dart';
import '../../models/user/user_model.dart';
import '../../services/auth/auth_service.dart';
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
    loadUser();
  }

  Future<void> loadUser() async {
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

  Future<void> signIn(String email, String password) async {
    try {
      isLoading.value = true;
      final response = await _authService.signInWithEmail(
        email: email,
        password: password,
      );

      if (response.success) {
        user.value = response.data?.user;
        Get.offAllNamed('/home');
      } else {
        Get.snackbar(
          'Error',
          response.message ?? 'Error al iniciar sesión',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> register(String email, String password, String name) async {
    try {
      isLoading.value = true;
      final response = await _authService.registerWithEmail(
        email: email,
        password: password,
        name: name,
      );

      if (response.success) {
        user.value = response.data?.user;
        Get.offAllNamed('/home');
      } else {
        Get.snackbar(
          'Error',
          response.message ?? 'Error al registrar',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    try {
      isLoading.value = true;
      await _authService.signOut();
      user.value = null;
      Get.offAllNamed('/login');
    } catch (e) {
      Get.snackbar(
        'Error',
        'Error al cerrar sesión: $e',
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
      
      await _authService.firebaseAuth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (credential) async {
          await _authService.firebaseAuth.currentUser?.updatePhoneNumber(credential);
          await loadUser();
          Get.back();
        },
        verificationFailed: (e) {
          error.value = 'Error de verificación: ${e.message}';
        },
        codeSent: (verificationId, resendToken) {
          _verificationId = verificationId;
        },
        codeAutoRetrievalTimeout: (verificationId) {
          _verificationId = verificationId;
        },
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

      final credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: smsCode,
      );

      await _authService.firebaseAuth.currentUser?.updatePhoneNumber(credential);
      await loadUser();
      Get.back();
      Get.snackbar(
        'Éxito',
        'Número de teléfono verificado correctamente',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      error.value = 'Error al verificar el código: $e';
    } finally {
      isLoading.value = false;
    }
  }

  bool get isAuthenticated => user.value != null;
  String get userRole => user.value?.role ?? 'USER';
} 