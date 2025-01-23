import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/auth/auth_controller.dart';

class PhoneVerificationScreen extends StatelessWidget {
  const PhoneVerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();
    final phoneController = TextEditingController();
    final codeController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verificar teléfono'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: phoneController,
              decoration: const InputDecoration(
                labelText: 'Número de teléfono',
                hintText: '+54 9 11 1234-5678',
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => authController.verifyPhone(phoneController.text),
              child: const Text('Enviar código'),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: codeController,
              decoration: const InputDecoration(
                labelText: 'Código de verificación',
                hintText: '123456',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => authController.verifySmsCode(
                codeController.text,
                phoneController.text,
              ),
              child: const Text('Verificar código'),
            ),
            const SizedBox(height: 16),
            Obx(() {
              if (authController.error.isNotEmpty) {
                return Text(
                  authController.error.value,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                );
              }
              return const SizedBox.shrink();
            }),
            Obx(() {
              if (authController.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }
              return const SizedBox.shrink();
            }),
          ],
        ),
      ),
    );
  }
} 