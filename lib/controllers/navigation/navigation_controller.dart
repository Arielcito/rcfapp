import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_controller.dart';

class NavigationController extends ChangeNotifier {
  final BuildContext context;
  
  NavigationController(this.context) {
    _initializeNavigation();
  }

  void _initializeNavigation() {
    final authController = Provider.of<AuthController>(context, listen: false);
    authController.addListener(_handleAuthStateChange);
  }

  void _handleAuthStateChange() {
    final authController = Provider.of<AuthController>(context, listen: false);
    final user = authController.currentUser;

    if (user == null) {
      _navigateToLogin();
      return;
    }

    if (!user.isPhoneVerified) {
      _navigateToPhoneVerification();
      return;
    }

    if (user.role == 'owner') {
      _navigateToOwnerHome();
    } else {
      _navigateToUserHome();
    }
  }

  void _navigateToLogin() {
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
  }

  void _navigateToPhoneVerification() {
    Navigator.pushNamedAndRemoveUntil(context, '/phone-verification', (route) => false);
  }

  void _navigateToUserHome() {
    Navigator.pushNamedAndRemoveUntil(context, '/user-home', (route) => false);
  }

  void _navigateToOwnerHome() {
    Navigator.pushNamedAndRemoveUntil(context, '/owner-home', (route) => false);
  }

  @override
  void dispose() {
    final authController = Provider.of<AuthController>(context, listen: false);
    authController.removeListener(_handleAuthStateChange);
    super.dispose();
  }
} 