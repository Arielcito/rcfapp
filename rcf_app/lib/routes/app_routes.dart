import 'package:get/get.dart';
import '../bindings/auth_binding.dart';
import '../bindings/property_binding.dart';
import '../bindings/court_binding.dart';
import '../bindings/booking_binding.dart';
import '../views/auth/login_screen.dart';
import '../views/auth/register_screen.dart';
import '../views/home/home_screen.dart';
import '../views/profile/profile_screen.dart';
import '../views/property/property_search_screen.dart';
import '../views/property/property_details_screen.dart';
import '../views/property/favorites_screen.dart';
import '../views/booking/booking_screen.dart';
import '../views/booking/booking_confirmation_screen.dart';
import '../views/court/court_list_screen.dart';
import '../views/court/court_details_screen.dart';
import '../views/court/court_form_screen.dart';

class AppRoutes {
  static const String login = '/login';
  static const String register = '/register';
  static const String propertySearch = '/properties/search';
  static const String propertyDetails = '/properties/:id';
  static const String courtList = '/courts';
  static const String courtDetails = '/courts/:id';
  static const String courtCreate = '/courts/create';
  static const String courtEdit = '/courts/:id/edit';
  static const String courtDetail = '/court/:id';
  static const String home = '/home';
  static const String profile = '/profile';
  static final routes = [
    GetPage(
      name: login,
      page: () => LoginScreen(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: register,
      page: () => RegisterScreen(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: propertySearch,
      page: () => PropertySearchScreen(),
      binding: PropertyBinding(),
    ),
    GetPage(
      name: propertyDetails,
      page: () => PropertyDetailsScreen(),
      binding: PropertyBinding(),
    ),
    GetPage(
      name: '/property/favorites',
      page: () => FavoritesScreen(),
      binding: PropertyBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: '/booking/create',
      page: () => BookingScreen(),
      binding: BookingBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: '/booking/confirmation',
      page: () => BookingConfirmationScreen(),
      binding: BookingBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: courtList,
      page: () => CourtListScreen(),
      binding: CourtBinding(),
    ),
    GetPage(
      name: courtDetails,
      page: () => CourtDetailsScreen(),
      binding: CourtBinding(),
    ),
    GetPage(
      name: courtCreate,
      page: () => CourtFormScreen(),
      binding: CourtBinding(),
    ),
    GetPage(
      name: courtEdit,
      page: () => CourtFormScreen(isEditing: true),
      binding: CourtBinding(),
    ),
    GetPage(
      name: '/home',
      page: () => HomeScreen(),
    ),
    GetPage(
      name: '/profile',
      page: () => const ProfileScreen(),
    ),
  ];
} 
