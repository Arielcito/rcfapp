import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Stream de cambios en el estado de autenticación
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Obtener usuario actual
  User? get currentUser => _auth.currentUser;

  // Registro con email y contraseña
  Future<UserModel> registerWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final UserCredential result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final User? user = result.user;
      if (user == null) throw Exception('Error al crear usuario');

      final UserModel newUser = UserModel(
        id: user.uid,
        email: email,
        name: name,
        role: 'user',
      );

      await _firestore.collection('users').doc(user.uid).set(newUser.toMap());

      return newUser;
    } catch (e) {
      throw Exception('Error en el registro: $e');
    }
  }

  // Login con email y contraseña
  Future<UserModel> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final User? user = result.user;
      if (user == null) throw Exception('Error al iniciar sesión');

      final DocumentSnapshot doc = await _firestore.collection('users').doc(user.uid).get();
      
      if (!doc.exists) throw Exception('Usuario no encontrado');
      
      return UserModel.fromMap(doc.data() as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Error en el inicio de sesión: $e');
    }
  }

  // Login con Google
  Future<UserModel> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw Exception('Selección de cuenta cancelada');

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final UserCredential result = await _auth.signInWithCredential(credential);
      final User? user = result.user;
      
      if (user == null) throw Exception('Error al iniciar sesión con Google');

      // Verificar si el usuario ya existe
      final DocumentSnapshot doc = await _firestore.collection('users').doc(user.uid).get();
      
      if (!doc.exists) {
        // Crear nuevo usuario
        final UserModel newUser = UserModel(
          id: user.uid,
          email: user.email!,
          name: user.displayName ?? 'Usuario',
          role: 'user',
        );

        await _firestore.collection('users').doc(user.uid).set(newUser.toMap());
        return newUser;
      }

      return UserModel.fromMap(doc.data() as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Error en el inicio de sesión con Google: $e');
    }
  }

  // Verificación de número de teléfono
  Future<void> verifyPhone({
    required String phoneNumber,
    required Function(String) onCodeSent,
    required Function(String) onError,
  }) async {
    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _auth.currentUser?.updatePhoneNumber(credential);
          await _updatePhoneVerificationStatus(true);
        },
        verificationFailed: (FirebaseAuthException e) {
          onError(e.message ?? 'Error en la verificación');
        },
        codeSent: (String verificationId, int? resendToken) {
          onCodeSent(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
      );
    } catch (e) {
      throw Exception('Error en la verificación del teléfono: $e');
    }
  }

  // Verificar código SMS
  Future<void> verifySmsCode({
    required String smsCode,
    required String verificationId,
  }) async {
    try {
      final PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );

      await _auth.currentUser?.updatePhoneNumber(credential);
      await _updatePhoneVerificationStatus(true);
    } catch (e) {
      throw Exception('Error en la verificación del código: $e');
    }
  }

  // Actualizar estado de verificación del teléfono
  Future<void> _updatePhoneVerificationStatus(bool isVerified) async {
    if (_auth.currentUser != null) {
      await _firestore.collection('users').doc(_auth.currentUser!.uid).update({
        'isPhoneVerified': isVerified,
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
      throw Exception('Error al cerrar sesión: $e');
    }
  }
} 