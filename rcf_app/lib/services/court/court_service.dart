import 'package:rcf_app/models/court/court_model.dart';
import 'package:rcf_app/services/api/api_client.dart';
import 'package:rcf_app/services/cache/cache_service.dart';

class CourtService {
  final ApiClient _apiClient = ApiClient();
  final CacheService _cacheService = CacheService();
  final String _endpoint = '/canchas';
  final String _cacheKey = 'courts';

  Future<List<CourtModel>> getAllCourts() async {
    try {
      final cachedData = await _cacheService.get(_cacheKey);
      if (cachedData != null) {
        return (cachedData as List)
            .map((item) => CourtModel.fromJson(item))
            .toList();
      }

      final response = await _apiClient.get(_endpoint);
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

      final response = await _apiClient.get('$_endpoint/$id');
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

      final response = await _apiClient.get('$_endpoint/predio/$propertyId');
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
      final response = await _apiClient.post(_endpoint, data: court.toJson());
      final newCourt = CourtModel.fromJson(response.data);

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_property_${court.predioId}');

      return newCourt;
    } catch (e) {
      throw Exception('Error al crear la cancha: $e');
    }
  }

  Future<CourtModel> updateCourt(String id, CourtModel court) async {
    try {
      final response = await _apiClient.put('$_endpoint/$id', data: court.toJson());
      final updatedCourt = CourtModel.fromJson(response.data);

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_$id');
      await _cacheService.delete('${_cacheKey}_property_${court.predioId}');

      return updatedCourt;
    } catch (e) {
      throw Exception('Error al actualizar la cancha: $e');
    }
  }

  Future<void> deleteCourt(String id, String propertyId) async {
    try {
      await _apiClient.delete('$_endpoint/$id');

      await _cacheService.delete(_cacheKey);
      await _cacheService.delete('${_cacheKey}_$id');
      await _cacheService.delete('${_cacheKey}_property_$propertyId');
    } catch (e) {
      throw Exception('Error al eliminar la cancha: $e');
    }
  }
} 