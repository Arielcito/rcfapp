import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/auth/auth_controller.dart';
import '../../controllers/navigation/navigation_controller.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = Provider.of<AuthController>(context);
    final navigationController = Provider.of<NavigationController>(context);
    final role = authController.currentUser?.role ?? 'user';

    return Scaffold(
      body: IndexedStack(
        index: navigationController.currentIndex,
        children: navigationController.getScreens(role),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navigationController.currentIndex,
        onTap: navigationController.setIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        items: navigationController.getNavigationItems(role),
      ),
    );
  }
} 