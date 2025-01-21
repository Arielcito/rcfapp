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
  final FirebaseAuth firebaseAuth = FirebaseAuth.instance;

  // Stream de cambios en el estado de autenticación
  Stream<UserModel?> get authStateChanges {
    return _auth.authStateChanges().asyncMap((user) async {
      if (user == null) return null;
      final doc = await _firestore.collection('users').doc(user.uid).get();
      if (!doc.exists) return null;
      return UserModel.fromMap(doc.data()!..['id'] = user.uid);
    });
  }

  Future<UserModel?> getCurrentUser() async {
    final user = _auth.currentUser;
    if (user == null) return null;

    final doc = await _firestore.collection('users').doc(user.uid).get();
    if (!doc.exists) return null;

    return UserModel.fromMap({
      'id': doc.id,
      ...doc.data()!,
    });
  }

  Future<void> updatePhoneVerification(String phoneNumber) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('No hay usuario autenticado');

    await _firestore.collection('users').doc(user.uid).update({
      'phoneNumber': phoneNumber,
      'isPhoneVerified': true,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  Future<ApiResponse<AuthResponse>> signInWithEmail({
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
        prediosFavoritos: [],
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

  Future<ApiResponse<String>> verifyPhone(String phoneNumber) async {
    try {
      Completer<String> completer = Completer<String>();

      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _auth.currentUser?.updatePhoneNumber(credential);
          await updatePhoneVerification(phoneNumber);
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

  String _handleAuthError(dynamic error) {
    if (error is FirebaseAuthException) {
      switch (error.code) {
        case 'user-not-found':
          return 'No existe una cuenta con este correo';
        case 'wrong-password':
          return 'Contraseña incorrecta';
        case 'invalid-email':
          return 'Correo electrónico inválido';
        case 'user-disabled':
          return 'Esta cuenta ha sido deshabilitada';
        case 'too-many-requests':
          return 'Demasiados intentos fallidos. Intenta más tarde';
        case 'invalid-verification-code':
          return 'Código de verificación inválido';
        case 'invalid-verification-id':
          return 'ID de verificación inválido';
        default:
          return error.message ?? 'Error de autenticación';
      }
    }
    return error.toString();
  }
} 