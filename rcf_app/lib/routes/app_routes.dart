import 'package:get/get.dart';
import 'package:rcf_app/bindings/property_binding.dart';
import 'package:rcf_app/bindings/booking_binding.dart';
import 'package:rcf_app/views/property/property_detail_screen.dart';
import 'package:rcf_app/views/property/favorites_screen.dart';
import 'package:rcf_app/views/booking/booking_screen.dart';
import 'package:rcf_app/views/booking/booking_confirmation_screen.dart';

class AppRoutes {
  static final routes = [
    GetPage(
      name: '/property/detail',
      page: () => PropertyDetailScreen(),
      binding: PropertyBinding(),
      transition: Transition.rightToLeft,
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
  ];
} 