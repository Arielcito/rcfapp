import 'package:get/get.dart';
import '../auth/auth_controller.dart';

class NavigationController extends GetxController {
  final AuthController _authController = Get.find<AuthController>();
  
  @override
  void onInit() {
    super.onInit();
    _initializeNavigation();
  }

  void _initializeNavigation() {
    ever(_authController.user, _handleAuthStateChange);
  }

  void _handleAuthStateChange(dynamic user) {
    if (user == null) {
      _navigateToLogin();
      return;
    }

    if (!user.emailVerified) {
      _navigateToEmailVerification();
      return;
    }

    if (user.role == 'owner') {
      _navigateToOwnerHome();
    } else {
      _navigateToUserHome();
    }
  }

  void _navigateToLogin() {
    Get.offAllNamed('/login');
  }

  void _navigateToEmailVerification() {
    Get.offAllNamed('/email-verification');
  }

  void _navigateToUserHome() {
    Get.offAllNamed('/user-home');
  }

  void _navigateToOwnerHome() {
    Get.offAllNamed('/owner-home');
  }
} 