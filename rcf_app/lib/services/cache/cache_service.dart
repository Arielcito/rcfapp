import 'dart:convert';
import 'package:hive/hive.dart';
import 'package:rcf_app/models/property/property_model.dart';
import 'package:rcf_app/models/booking/booking_model.dart';

class CacheService {
  static const String _boxName = 'api_cache';
  late Box _box;

  Future<void> init() async {
    _box = await Hive.openBox(_boxName);
  }

  Future<dynamic> get(String key) async {
    final value = _box.get(key);
    if (value == null) return null;
    return json.decode(value);
  }

  Future<void> set(String key, dynamic value, {Duration? expiry}) async {
    final jsonString = json.encode(value);
    await _box.put(key, jsonString);

    if (expiry != null) {
      final expiryTime = DateTime.now().add(expiry);
      await _box.put('${key}_expiry', expiryTime.toIso8601String());
    }
  }

  Future<void> delete(String key) async {
    await _box.delete(key);
    await _box.delete('${key}_expiry');
  }

  Future<void> clear() async {
    await _box.clear();
  }

  bool isExpired(String key) {
    final expiryString = _box.get('${key}_expiry');
    if (expiryString == null) return false;

    final expiry = DateTime.parse(expiryString);
    return DateTime.now().isAfter(expiry);
  }

  static const String _propertyBox = 'properties';
  static const String _bookingBox = 'bookings';
  static const String _userBox = 'user';

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

  Future<void> clearCache() async {
    await Future.wait([
      Hive.box(_propertyBox).clear(),
      Hive.box(_bookingBox).clear(),
      Hive.box(_userBox).clear(),
    ]);
  }

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