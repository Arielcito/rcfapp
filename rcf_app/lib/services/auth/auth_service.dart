import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user/user_model.dart';
import '../../models/api/api_response.dart';
import 'dart:async';
import 'dart:convert';

class AuthResponse {
  final UserModel user;
  final String token;

  AuthResponse({required this.user, required this.token});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: UserModel.fromMap(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toMap(),
      'token': token,
    };
  }
}

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Stream de cambios en el estado de autenticación
  Stream<UserModel?> get authStateChanges {
    return _auth.authStateChanges().asyncMap((user) async {
      if (user == null) return null;
      final doc = await _firestore.collection('users').doc(user.uid).get();
      if (!doc.exists) return null;
      return UserModel.fromMap(doc.data()!..['id'] = user.uid);
    });
  }

  // Obtener usuario actual
  ApiResponse<UserModel?> get currentUser {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        return ApiResponse(
          success: false,
          statusCode: 401,
          message: 'No hay usuario autenticado',
        );
      }
      
      final userData = UserModel(
        id: user.uid,
        email: user.email ?? '',
        name: user.displayName ?? '',
        phoneNumber: '',
        role: 'user',
        isPhoneVerified: false,
        emailVerified: user.emailVerified,
        createdAt: DateTime.now(),
      );

      return ApiResponse(
        success: true,
        statusCode: 200,
        data: userData,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 500,
        message: _handleAuthError(e),
      );
    }
  }

  // Registro con email y contraseña
  Future<ApiResponse<AuthResponse>> registerWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await userCredential.user?.updateDisplayName(name);
      final token = await userCredential.user?.getIdToken() ?? '';

      final user = UserModel(
        id: userCredential.user!.uid,
        email: email,
        name: name,
        role: 'user',
        phoneNumber: '',
        isPhoneVerified: false,
        emailVerified: false,
        createdAt: DateTime.now(),
      );

      await _firestore
          .collection('users')
          .doc(userCredential.user!.uid)
          .set(user.toMap());

      return ApiResponse(
        success: true,
        statusCode: 201,
        data: AuthResponse(user: user, token: token),
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 400,
        message: _handleAuthError(e),
      );
    }
  }

  // Login con email y contraseña
  Future<ApiResponse<AuthResponse>> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final token = await userCredential.user?.getIdToken() ?? '';
      final doc = await _firestore.collection('users').doc(userCredential.user!.uid).get();
      final user = UserModel.fromMap(doc.data()!..['id'] = userCredential.user!.uid);

      return ApiResponse(
        success: true,
        statusCode: 200,
        data: AuthResponse(user: user, token: token),
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 401,
        message: _handleAuthError(e),
      );
    }
  }

  // Login con Google
  Future<ApiResponse<AuthResponse>> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return ApiResponse(
          success: false,
          statusCode: 400,
          message: 'Inicio de sesión cancelado',
        );
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final token = await userCredential.user?.getIdToken() ?? '';

      final userDoc = await _firestore.collection('users').doc(userCredential.user!.uid).get();

      if (!userDoc.exists) {
        final user = UserModel(
          id: userCredential.user!.uid,
          email: userCredential.user!.email!,
          name: userCredential.user!.displayName!,
          role: 'user',
          phoneNumber: '',
          isPhoneVerified: false,
          emailVerified: userCredential.user!.emailVerified,
          createdAt: DateTime.now(),
        );

        await _firestore
            .collection('users')
            .doc(userCredential.user!.uid)
            .set(user.toMap());
            
        return ApiResponse(
          success: true,
          statusCode: 201,
          data: AuthResponse(user: user, token: token),
        );
      }

      final user = UserModel.fromMap(userDoc.data()!..['id'] = userCredential.user!.uid);
      return ApiResponse(
        success: true,
        statusCode: 200,
        data: AuthResponse(user: user, token: token),
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 400,
        message: _handleAuthError(e),
      );
    }
  }

  // Verificación de número de teléfono
  Future<ApiResponse<String>> verifyPhone(String phoneNumber) async {
    try {
      Completer<String> completer = Completer<String>();

      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _auth.currentUser?.updatePhoneNumber(credential);
          await _updatePhoneVerificationStatus(true);
        },
        verificationFailed: (FirebaseAuthException e) {
          completer.completeError(_handleAuthError(e));
        },
        codeSent: (String verificationId, int? resendToken) {
          completer.complete(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          if (!completer.isCompleted) {
            completer.complete(verificationId);
          }
        },
      );

      final verificationId = await completer.future;
      return ApiResponse(
        success: true,
        statusCode: 200,
        data: verificationId,
        message: 'Código enviado correctamente',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 400,
        message: _handleAuthError(e),
      );
    }
  }

  // Verificar código SMS
  Future<ApiResponse<void>> verifySmsCode(String verificationId, String smsCode) async {
    try {
      final PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );

      await _auth.currentUser?.updatePhoneNumber(credential);
      await _updatePhoneVerificationStatus(true);

      return ApiResponse(
        success: true,
        statusCode: 200,
        message: 'Número de teléfono verificado correctamente',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 400,
        message: _handleAuthError(e),
      );
    }
  }

  // Actualizar estado de verificación del teléfono
  Future<void> _updatePhoneVerificationStatus(bool isVerified) async {
    final user = _auth.currentUser;
    if (user != null) {
      final phoneNumber = user.phoneNumber ?? '';
      await _firestore.collection('users').doc(user.uid).update({
        'isPhoneVerified': isVerified,
        'phoneNumber': phoneNumber,
      });
    }
  }

  // Cerrar sesión
  Future<ApiResponse<void>> signOut() async {
    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
      ]);

      return ApiResponse(
        success: true,
        statusCode: 200,
        message: 'Sesión cerrada correctamente',
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        statusCode: 500,
        message: _handleAuthError(e),
      );
    }
  }

  String _handleAuthError(dynamic error) {
    if (error is FirebaseAuthException) {
      switch (error.code) {
        case 'user-not-found':
          return 'No existe una cuenta con este correo';
        case 'wrong-password':
          return 'Contraseña incorrecta';
        case 'email-already-in-use':
          return 'Ya existe una cuenta con este correo';
        case 'invalid-email':
          return 'Correo electrónico inválido';
        case 'weak-password':
          return 'La contraseña debe tener al menos 6 caracteres';
        case 'invalid-verification-code':
          return 'Código de verificación inválido';
        case 'invalid-verification-id':
          return 'Código de verificación expirado';
        case 'too-many-requests':
          return 'Demasiados intentos fallidos. Intenta más tarde';
        default:
          return error.message ?? 'Error de autenticación';
      }
    }
    return error.toString();
  }
} 