import 'package:get/get.dart';
import '../../models/user/user_model.dart';
import '../../services/auth/new_auth_service.dart';

class AuthController extends GetxController {
  final AuthService _authService = AuthService();
  final Rx<UserModel?> currentUser = Rx<UserModel?>(null);
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _authService.authStateChanges.listen((user) {
      currentUser.value = user;
    });
  }

  Future<void> registerWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      isLoading.value = true;
      error.value = '';
      await _authService.registerWithEmail(
        email: email,
        password: password,
        name: name,
      );
      error.value = '';
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      isLoading.value = true;
      error.value = '';
      await _authService.loginWithEmail(
        email: email,
        password: password,
      );
      error.value = '';
      Get.offAllNamed('/home');
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signInWithGoogle() async {
    try {
      isLoading.value = true;
      error.value = '';
      await _authService.signInWithGoogle();
      error.value = '';
      Get.offAllNamed('/home');
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<String> verifyPhone(String phoneNumber) async {
    try {
      isLoading.value = true;
      error.value = '';
      return await _authService.verifyPhone(phoneNumber);
    } catch (e) {
      error.value = e.toString();
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> verifySmsCode(String verificationId, String smsCode) async {
    try {
      isLoading.value = true;
      error.value = '';
      await _authService.verifySmsCode(verificationId, smsCode);
    } catch (e) {
      error.value = e.toString();
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    try {
      isLoading.value = true;
      error.value = '';
      await _authService.signOut();
    } catch (e) {
      error.value = e.toString();
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  bool get isAuthenticated => currentUser.value != null;
  bool get isEmailVerified => currentUser.value?.emailVerified ?? false;
  String get userRole => currentUser.value?.role ?? 'USER';
} 