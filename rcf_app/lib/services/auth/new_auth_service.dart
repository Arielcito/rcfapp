import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../models/user/user_model.dart';
import '../../models/api/api_response.dart';
import '../api/api_client.dart';

class AuthService extends GetxService {
  final ApiClient _api;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final _storage = GetStorage();
  
  AuthService({ApiClient? api}) : _api = api ?? ApiClient();

  // Stream de cambios en el estado de autenticación
  Stream<UserModel?> get authStateChanges {
    return Stream.value(_storage.read<String>('token')).asyncMap((token) async {
      if (token == null) return null;
      try {
        final response = await _api.get<Map<String, dynamic>>('/users/me');
        return UserModel.fromMap(response.data!);
      } catch (e) {
        _storage.remove('token');
        return null;
      }
    });
  }

  // Obtener usuario actual
  UserModel? get currentUser {
    final userData = _storage.read<Map<String, dynamic>>('user');
    if (userData == null) return null;
    return UserModel.fromMap(userData);
  }

  // Registro con email y contraseña
  Future<void> registerWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final response = await _api.post<Map<String, dynamic>>('/users/register', data: {
        'email': email,
        'password': password,
        'name': name,
      });

      final apiResponse = ApiResponse.fromJson(
        response.data!,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success) {
        throw apiResponse.message ?? 'Error en el registro';
      }

      _storage.write('token', apiResponse.data!['token']);
      _storage.write('user', apiResponse.data!['user']);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Login con email y contraseña
  Future<void> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _api.post<Map<String, dynamic>>('/users/login', data: {
        'email': email,
        'password': password,
      });

      final apiResponse = ApiResponse.fromJson(
        response.data!,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success) {
        throw apiResponse.message ?? 'Error en el inicio de sesión';
      }

      _storage.write('token', apiResponse.data!['token']);
      _storage.write('user', apiResponse.data!['user']);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Login con Google
  Future<void> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw 'Inicio de sesión cancelado';

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      final response = await _api.post<Map<String, dynamic>>('/users/google', data: {
        'token': googleAuth.idToken,
      });

      final apiResponse = ApiResponse.fromJson(
        response.data!,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success) {
        throw apiResponse.message ?? 'Error en el inicio de sesión con Google';
      }

      _storage.write('token', apiResponse.data!['token']);
      _storage.write('user', apiResponse.data!['user']);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Verificación de número de teléfono
  Future<String> verifyPhone(String phoneNumber) async {
    try {
      final response = await _api.post<Map<String, dynamic>>('/users/verify-phone', data: {
        'phoneNumber': phoneNumber,
      });

      final apiResponse = ApiResponse.fromJson(
        response.data!,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success) {
        throw apiResponse.message ?? 'Error al verificar el teléfono';
      }

      return apiResponse.data!['verificationId'];
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Verificar código SMS
  Future<void> verifySmsCode(String verificationId, String smsCode) async {
    try {
      final response = await _api.post<Map<String, dynamic>>('/users/verify-code', data: {
        'verificationId': verificationId,
        'code': smsCode,
      });

      final apiResponse = ApiResponse.fromJson(
        response.data!,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success) {
        throw apiResponse.message ?? 'Error al verificar el código';
      }

      // Actualizar datos del usuario en storage
      _storage.write('user', apiResponse.data!['user']);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Cerrar sesión
  Future<void> signOut() async {
    try {
      await _api.post('/users/logout');
      await _googleSignIn.signOut();
      _storage.remove('token');
      _storage.remove('user');
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  String _handleAuthError(dynamic error) {
    if (error is ApiResponse) {
      return error.message ?? 'Error de autenticación';
    }
    
    if (error is String) {
      return error;
    }

    return 'Error de autenticación';
  }
} 