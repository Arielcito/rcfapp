import 'package:hive_flutter/hive_flutter.dart';
import 'package:rcf_app/models/property/property_model.dart';
import 'package:rcf_app/models/booking/booking_model.dart';

class CacheService {
  static const String _propertyBox = 'properties';
  static const String _bookingBox = 'bookings';
  static const String _userBox = 'user';

  Future<void> init() async {
    await Hive.initFlutter();
    await Future.wait([
      Hive.openBox(_propertyBox),
      Hive.openBox(_bookingBox),
      Hive.openBox(_userBox),
    ]);
  }

  // Propiedades
  Future<void> cacheProperty(PropertyModel property) async {
    final box = await Hive.openBox(_propertyBox);
    await box.put(property.id, property.toMap());
  }

  Future<PropertyModel?> getCachedProperty(String id) async {
    final box = await Hive.openBox(_propertyBox);
    final data = box.get(id);
    if (data != null) {
      return PropertyModel.fromMap(Map<String, dynamic>.from(data));
    }
    return null;
  }

  Future<List<PropertyModel>> getCachedProperties() async {
    final box = await Hive.openBox(_propertyBox);
    return box.values
        .map((data) => PropertyModel.fromMap(Map<String, dynamic>.from(data)))
        .toList();
  }

  // Reservas
  Future<void> cacheBooking(BookingModel booking) async {
    final box = await Hive.openBox(_bookingBox);
    await box.put(booking.id, booking.toMap());
  }

  Future<BookingModel?> getCachedBooking(String id) async {
    final box = await Hive.openBox(_bookingBox);
    final data = box.get(id);
    if (data != null) {
      return BookingModel.fromMap(Map<String, dynamic>.from(data));
    }
    return null;
  }

  Future<List<BookingModel>> getCachedBookings() async {
    final box = await Hive.openBox(_bookingBox);
    return box.values
        .map((data) => BookingModel.fromMap(Map<String, dynamic>.from(data)))
        .toList();
  }

  // Datos de usuario
  Future<void> cacheUserData(Map<String, dynamic> userData) async {
    final box = await Hive.openBox(_userBox);
    await box.put('userData', userData);
  }

  Future<Map<String, dynamic>?> getCachedUserData() async {
    final box = await Hive.openBox(_userBox);
    final data = box.get('userData');
    if (data != null) {
      return Map<String, dynamic>.from(data);
    }
    return null;
  }

  // Limpiar caché
  Future<void> clearCache() async {
    await Future.wait([
      Hive.box(_propertyBox).clear(),
      Hive.box(_bookingBox).clear(),
      Hive.box(_userBox).clear(),
    ]);
  }

  // Limpiar caché específico
  Future<void> clearPropertyCache() async {
    await Hive.box(_propertyBox).clear();
  }

  Future<void> clearBookingCache() async {
    await Hive.box(_bookingBox).clear();
  }

  Future<void> clearUserCache() async {
    await Hive.box(_userBox).clear();
  }
} 