import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RCF App',
      theme: ThemeData(
        primaryColor: const Color(0xFF00CC44),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00CC44),
          secondary: const Color(0xFF003366),
        ),
        fontFamily: 'Poppins',
      ),
      home: const Scaffold(
        body: Center(
          child: Text('RCF App - Inicio'),
        ),
      ),
    );
  }
}
