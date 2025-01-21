import 'package:get/get.dart';
import '../bindings/auth_binding.dart';
import '../bindings/property_binding.dart';
import '../bindings/court_binding.dart';
import '../bindings/booking_binding.dart';
import '../bindings/home_binding.dart';
import '../bindings/favorite_binding.dart';
import '../bindings/profile_binding.dart';
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
import '../views/auth/phone_verification_screen.dart';

abstract class AppRoutes {
  static const String initial = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String profile = '/profile';
  static const String favorites = '/favorites';
  static const String propertySearch = '/properties/search';
  static const String propertyDetails = '/properties/:id';
  static const String courtList = '/courts';
  static const String courtDetails = '/courts/:id';
  static const String courtCreate = '/courts/create';
  static const String courtEdit = '/courts/:id/edit';
  static const String courtDetail = '/court/:id';

  static final routes = [
    GetPage(
      name: initial,
      page: () => const LoginScreen(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: login,
      page: () => const LoginScreen(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: register,
      page: () => const RegisterScreen(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: home,
      page: () => const HomeScreen(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: profile,
      page: () => const ProfileScreen(),
      binding: ProfileBinding(),
    ),
    GetPage(
      name: favorites,
      page: () => FavoritesScreen(),
      binding: FavoriteBinding(),
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
      binding: FavoriteBinding(),
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
      name: '/phone-verification',
      page: () => const PhoneVerificationScreen(),
    ),
  ];
} 
