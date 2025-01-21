import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'firebase_options.dart';
import 'controllers/auth/auth_controller.dart';
import 'views/auth/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicializar servicios
  await Future.wait([
    dotenv.load(fileName: '.env'),
    Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform),
    GetStorage.init(),
    Hive.initFlutter(),
  ]);

  // Inicializar caché de API
  await Hive.openBox('api_cache');
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: dotenv.env['APP_NAME'] ?? 'RCF App',
      theme: ThemeData(
        primaryColor: const Color(0xFF00CC44),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00CC44),
          secondary: const Color(0xFF003366),
        ),
        fontFamily: 'Poppins',
      ),
      home: const LoginScreen(),
      initialBinding: BindingsBuilder(() {
        Get.put(AuthController());
      }),
    );
  }
}
