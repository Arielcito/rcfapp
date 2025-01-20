import 'package:flutter/material.dart';
import '../../models/user/user_model.dart';
import '../../services/auth/auth_service.dart';

class AuthController extends ChangeNotifier {
  final _authService = AuthService();
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _error;
  String? _verificationId;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _currentUser != null;

  AuthController() {
    _authService.authStateChanges.listen((user) {
      _currentUser = user;
      notifyListeners();
    });
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String? value) {
    _error = value;
    notifyListeners();
  }

  Future<void> registerWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      _setLoading(true);
      _setError(null);
      await _authService.registerWithEmail(
        email: email,
        password: password,
        name: name,
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      _setLoading(true);
      _setError(null);
      await _authService.loginWithEmail(
        email: email,
        password: password,
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signInWithGoogle() async {
    try {
      _setLoading(true);
      _setError(null);
      await _authService.signInWithGoogle();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> verifyPhone(String phoneNumber) async {
    try {
      _setLoading(true);
      _setError(null);
      _verificationId = await _authService.verifyPhone(phoneNumber);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> verifySmsCode(String smsCode) async {
    if (_verificationId == null) {
      _setError('No hay un código de verificación pendiente');
      return;
    }

    try {
      _setLoading(true);
      _setError(null);
      await _authService.verifySmsCode(_verificationId!, smsCode);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signOut() async {
    try {
      _setLoading(true);
      _setError(null);
      await _authService.signOut();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
} 