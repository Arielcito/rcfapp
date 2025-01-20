import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/auth/auth_controller.dart';
import '../widgets/custom_button.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = context.watch<AuthController>();
    final user = authController.currentUser;

    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }

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
              await authController.signOut();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const CircleAvatar(
              radius: 50,
              backgroundColor: Colors.grey,
              child: Icon(
                Icons.person,
                size: 50,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              user.name,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            _buildInfoCard(
              context,
              title: 'Información Personal',
              items: [
                _InfoItem(
                  icon: Icons.email,
                  title: 'Correo electrónico',
                  value: user.email,
                ),
                if (user.phoneNumber != null)
                  _InfoItem(
                    icon: Icons.phone,
                    title: 'Teléfono',
                    value: user.phoneNumber!,
                  ),
                _InfoItem(
                  icon: Icons.verified_user,
                  title: 'Rol',
                  value: user.role == 'owner' ? 'Propietario' : 'Usuario',
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildInfoCard(
              context,
              title: 'Estado de la cuenta',
              items: [
                _InfoItem(
                  icon: Icons.phone_android,
                  title: 'Teléfono verificado',
                  value: user.isPhoneVerified ? 'Sí' : 'No',
                ),
                _InfoItem(
                  icon: Icons.favorite,
                  title: 'Predios favoritos',
                  value: user.prediosFavoritos.length.toString(),
                ),
              ],
            ),
            const SizedBox(height: 40),
            if (!user.isPhoneVerified)
              CustomButton(
                text: 'Verificar teléfono',
                onPressed: () {
                  // Navegar a la pantalla de verificación
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required String title,
    required List<_InfoItem> items,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Padding(
        padding: const EdgeInsets.all(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 15),
            ...items.map((item) => _buildInfoRow(context, item)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, _InfoItem item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(
            item.icon,
            color: Theme.of(context).primaryColor,
            size: 20,
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.title,
                style: const TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
              Text(
                item.value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoItem {
  final IconData icon;
  final String title;
  final String value;

  const _InfoItem({
    required this.icon,
    required this.title,
    required this.value,
  });
} 