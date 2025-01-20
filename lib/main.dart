import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'controllers/auth/auth_controller.dart';
import 'controllers/navigation/navigation_controller.dart';
import 'views/auth/login_screen.dart';
import 'views/auth/register_screen.dart';
import 'views/auth/phone_verification_screen.dart';
import 'views/home/user_home_screen.dart';
import 'views/home/owner_home_screen.dart';
import 'views/profile/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthController()),
        ChangeNotifierProvider(create: (context) => NavigationController(context)),
      ],
      child: MaterialApp(
        title: 'RCF App',
        theme: ThemeData(
          primaryColor: const Color(0xFF00CC44),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF00CC44),
            secondary: const Color(0xFF003366),
          ),
          fontFamily: 'Poppins',
        ),
        initialRoute: '/login',
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/phone-verification': (context) => const PhoneVerificationScreen(),
          '/user-home': (context) => const UserHomeScreen(),
          '/owner-home': (context) => const OwnerHomeScreen(),
          '/profile': (context) => const ProfileScreen(),
        },
      ),
    );
  }
} 