import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'controllers/auth/auth_controller.dart';
import 'views/auth/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthController()),
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
        home: const LoginScreen(),
      ),
    );
  }
}
