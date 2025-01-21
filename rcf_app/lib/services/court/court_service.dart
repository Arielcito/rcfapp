import 'package:get/get.dart';
import '../../models/court/court_model.dart';
import '../api/api_client.dart';
import 'package:rcf_app/services/cache/cache_service.dart';

class CourtService extends GetxService {
  final ApiClient _api;
  final CacheService _cacheService = CacheService();
  final String _endpoint = '/canchas';
  final String _cacheKey = 'courts';
  
  CourtService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<List<CourtModel>> getAllCourts() async {
    try {
      final cachedData = await _cacheService.get(_cacheKey);
      if (cachedData != null) {
        return (cachedData as List)
            .map((item) => CourtModel.fromJson(item))
            .toList();
      }

      final response = await _api.get<List<dynamic>>(_endpoint);
      final courts = (response.data as List)
          .map((item) => CourtModel.fromJson(item))
          .toList();

      await _cacheService.set(_cacheKey, courts);
      return courts;
    } catch (e) {
      throw Exception('Error al obtener las canchas: $e');
    }
  }

  Future<CourtModel> getCourtById(String id) async {
    try {
      final cacheKey = '${_cacheKey}_$id';
      final cachedData = await _cacheService.get(cacheKey);
      if (cachedData != null) {
        return CourtModel.fromJson(cachedData);
      }

      final response = await _api.get<dynamic>('$_endpoint/$id');
      final court = CourtModel.fromJson(response.data);

      await _cacheService.set(cacheKey, court);
      return court;
    } catch (e) {
      throw Exception('Error al obtener la cancha: $e');
    }
  }

  Future<List<CourtModel>> getCourtsByPropertyId(String propertyId) async {
    try {
      final cacheKey = '${_cacheKey}_property_$propertyId';
      final cachedData = await _cacheService.get(cacheKey);
      if (cachedData != null) {
        return (cachedData as List)
            .map((item) => CourtModel.fromJson(item))
            .toList();
      }

      final response = await _api.get<List<dynamic>>('$_endpoint/predio/$propertyId');
      final courts = (response.data as List)
          .map((item) => CourtModel.fromJson(item))
          .toList();

      await _cacheService.set(cacheKey, courts);
      return courts;
    } catch (e) {
      throw Exception('Error al obtener las canchas del predio: $e');
    }
  }

  Future<CourtModel> createCourt(CourtModel court) async {
    try {
      final response = await _api.post(_endpoint, data: court.toJson());
      final newCourt = CourtModel.fromJson(response.data);

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_property_${court.propertyId}');

      return newCourt;
    } catch (e) {
      throw Exception('Error al crear la cancha: $e');
    }
  }

  Future<CourtModel> updateCourt(String id, CourtModel court) async {
    try {
      final response = await _api.put('$_endpoint/$id', data: court.toJson());
      final updatedCourt = CourtModel.fromJson(response.data);

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_$id');
      await _cacheService.delete('${_cacheKey}_property_${court.propertyId}');

      return updatedCourt;
    } catch (e) {
      throw Exception('Error al actualizar la cancha: $e');
    }
  }

  Future<void> deleteCourt(String id, String propertyId) async {
    try {
      await _api.delete('$_endpoint/$id');

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_$id');
      await _cacheService.delete('${_cacheKey}_property_$propertyId');
    } catch (e) {
      throw Exception('Error al eliminar la cancha: $e');
    }
  }

  Future<List<CourtModel>> getCourts({
    required DateTime date,
    String? startTime,
    String? endTime,
  }) async {
    try {
      final queryParams = {
        'date': date.toIso8601String(),
        if (startTime != null) 'startTime': startTime,
        if (endTime != null) 'endTime': endTime,
      };

      final response = await _api.get<List<dynamic>>('/courts/available', queryParameters: queryParams);
      
      return response.data!.map((court) => CourtModel.fromMap(court as Map<String, dynamic>)).toList();
    } catch (e) {
      throw 'Error al obtener las canchas disponibles: $e';
    }
  }

  Future<List<String>> getAvailableHours({
    required String courtId,
    required DateTime date,
  }) async {
    try {
      final response = await _api.get<List<dynamic>>(
        '/courts/$courtId/available-hours',
        queryParameters: {'date': date.toIso8601String()},
      );
      
      return response.data!.map((hour) => hour.toString()).toList();
    } catch (e) {
      throw 'Error al obtener los horarios disponibles: $e';
    }
  }
} 