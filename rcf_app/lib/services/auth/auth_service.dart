import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user/user_model.dart';
import 'dart:async';

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
  UserModel? get currentUser {
    final user = _auth.currentUser;
    if (user == null) return null;
    return UserModel(
      id: user.uid,
      email: user.email ?? '',
      name: user.displayName ?? '',
      phoneNumber: user.phoneNumber,
      role: 'user',
      isPhoneVerified: user.phoneNumber != null,
    );
  }

  // Registro con email y contraseña
  Future<void> registerWithEmail({
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

      final user = UserModel(
        id: userCredential.user!.uid,
        email: email,
        name: name,
        role: 'user',
      );

      await _firestore
          .collection('users')
          .doc(userCredential.user!.uid)
          .set(user.toMap());
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
      await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Login con Google
  Future<void> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw 'Inicio de sesión cancelado';

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);

      final userDoc =
          await _firestore.collection('users').doc(userCredential.user!.uid).get();

      if (!userDoc.exists) {
        final user = UserModel(
          id: userCredential.user!.uid,
          email: userCredential.user!.email!,
          name: userCredential.user!.displayName!,
          role: 'user',
        );

        await _firestore
            .collection('users')
            .doc(userCredential.user!.uid)
            .set(user.toMap());
      }
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Verificación de número de teléfono
  Future<String> verifyPhone(String phoneNumber) async {
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

      return await completer.future;
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Verificar código SMS
  Future<void> verifySmsCode(String verificationId, String smsCode) async {
    try {
      final PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );

      await _auth.currentUser?.updatePhoneNumber(credential);
      await _updatePhoneVerificationStatus(true);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Actualizar estado de verificación del teléfono
  Future<void> _updatePhoneVerificationStatus(bool isVerified) async {
    final user = _auth.currentUser;
    if (user != null) {
      await _firestore.collection('users').doc(user.uid).update({
        'isPhoneVerified': isVerified,
        'phoneNumber': user.phoneNumber,
      });
    }
  }

  // Cerrar sesión
  Future<void> signOut() async {
    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
      ]);
    } catch (e) {
      throw _handleAuthError(e);
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