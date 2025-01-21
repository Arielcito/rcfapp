import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/auth/auth_controller.dart';
import '../widgets/custom_button.dart';
import 'package:get/get.dart';

class ProfileScreen extends GetView<AuthController> {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black87,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await controller.signOut();
            },
          ),
        ],
      ),
      body: Obx(() {
        final user = controller.user;
        if (user.value == null) {
          return const Center(child: CircularProgressIndicator());
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.grey,
                  child: Text(
                    user.value!.name.substring(0, 1).toUpperCase(),
                    style: const TextStyle(fontSize: 32),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                user.value!.name,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              _buildInfoCard([
                _buildInfoRow('Correo electrónico', user.value!.email),
                if (user.value!.phoneNumber != null)
                  _buildInfoRow('Teléfono', user.value!.phoneNumber!),
                _buildInfoRow(
                  'Rol',
                  user.value!.role == 'owner' ? 'Propietario' : 'Usuario',
                ),
              ]),
              const SizedBox(height: 20),
              _buildInfoCard([
                _buildInfoRow(
                  'Teléfono Verificado',
                  user.value!.isPhoneVerified ? 'Sí' : 'No',
                ),
                _buildInfoRow(
                  'Predios Favoritos',
                  user.value!.prediosFavoritos.length.toString(),
                ),
              ]),
              const SizedBox(height: 40),
              if (!user.value!.isPhoneVerified)
                CustomButton(
                  text: 'Verificar teléfono',
                  onPressed: () => controller.verifyPhoneNumber(),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Padding(
        padding: const EdgeInsets.all(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children,
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 12,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
} 