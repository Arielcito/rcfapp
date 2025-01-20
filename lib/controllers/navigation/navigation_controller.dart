import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_controller.dart';

class NavigationController extends ChangeNotifier {
  int _currentIndex = 0;
  
  int get currentIndex => _currentIndex;

  void setIndex(int index) {
    _currentIndex = index;
    notifyListeners();
  }

  List<BottomNavigationBarItem> getNavigationItems(String role) {
    if (role == 'owner') {
      return [
        const BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Inicio',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.business),
          label: 'Mis Predios',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.message),
          label: 'Mensajes',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Perfil',
        ),
      ];
    } else {
      return [
        const BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Inicio',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.search),
          label: 'Buscar',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.favorite),
          label: 'Favoritos',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Perfil',
        ),
      ];
    }
  }

  List<Widget> getScreens(String role) {
    if (role == 'owner') {
      return [
        const Center(child: Text('Pantalla de Inicio - Dueño')),
        const Center(child: Text('Mis Predios')),
        const Center(child: Text('Mensajes')),
        const Center(child: Text('Perfil')),
      ];
    } else {
      return [
        const Center(child: Text('Pantalla de Inicio - Usuario')),
        const Center(child: Text('Buscar Predios')),
        const Center(child: Text('Predios Favoritos')),
        const Center(child: Text('Perfil')),
      ];
    }
  }
} 