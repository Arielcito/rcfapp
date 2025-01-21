import 'package:rcf_app/models/property/property_model.dart';
import 'package:rcf_app/services/api/api_client.dart';
import 'package:rcf_app/services/cache/cache_service.dart';

class PropertyService {
  final ApiClient _apiClient;
  final CacheService _cacheService;
  static const String _endpoint = '/predios';

  PropertyService({
    ApiClient? apiClient,
    CacheService? cacheService,
  })  : _apiClient = apiClient ?? ApiClient(),
        _cacheService = cacheService ?? CacheService();

  // Obtener todos los predios
  Future<List<PropertyModel>> getAllProperties() async {
    try {
      // Intentar obtener del caché primero
      final cachedProperties = await _cacheService.getCachedProperties();
      if (cachedProperties.isNotEmpty) {
        return cachedProperties;
      }

      final response = await _apiClient.get(_endpoint);
      final List<PropertyModel> properties = (response.data as List)
          .map((json) => PropertyModel.fromMap(json))
          .toList();

      // Guardar en caché
      for (var property in properties) {
        await _cacheService.cacheProperty(property);
      }

      return properties;
    } catch (e) {
      throw Exception('Error al obtener los predios: $e');
    }
  }

  // Obtener un predio específico por ID
  Future<PropertyModel?> getPropertyById(String id) async {
    try {
      // Intentar obtener del caché primero
      final cachedProperty = await _cacheService.getCachedProperty(id);
      if (cachedProperty != null) {
        return cachedProperty;
      }

      final response = await _apiClient.get('$_endpoint/$id');
      if (response.data != null) {
        final property = PropertyModel.fromMap(response.data);
        // Guardar en caché
        await _cacheService.cacheProperty(property);
        return property;
      }
      return null;
    } catch (e) {
      throw Exception('Error al obtener el predio: $e');
    }
  }

  // Obtener predios por propietario
  Future<List<PropertyModel>> getPropertiesByOwner(String ownerId) async {
    try {
      final response = await _apiClient.get('$_endpoint/owner/$ownerId');
      return (response.data as List)
          .map((json) => PropertyModel.fromMap(json))
          .toList();
    } catch (e) {
      throw Exception('Error al obtener los predios del propietario: $e');
    }
  }

  // Buscar predios
  Future<List<PropertyModel>> searchProperties(String query) async {
    try {
      final response = await _apiClient.get('$_endpoint/search', queryParameters: {
        'q': query,
      });
      return (response.data as List)
          .map((json) => PropertyModel.fromMap(json))
          .toList();
    } catch (e) {
      throw Exception('Error al buscar predios: $e');
    }
  }

  // Crear un nuevo predio
  Future<String> createProperty(PropertyModel property) async {
    try {
      final response = await _apiClient.post(
        _endpoint,
        data: property.toMap(),
      );
      final newProperty = PropertyModel.fromMap(response.data);
      await _cacheService.cacheProperty(newProperty);
      return newProperty.id;
    } catch (e) {
      throw Exception('Error al crear el predio: $e');
    }
  }

  // Actualizar un predio
  Future<void> updateProperty(PropertyModel property) async {
    try {
      await _apiClient.put(
        '$_endpoint/${property.id}',
        data: property.toMap(),
      );
      // Actualizar caché
      await _cacheService.cacheProperty(property);
    } catch (e) {
      throw Exception('Error al actualizar el predio: $e');
    }
  }

  // Eliminar un predio
  Future<void> deleteProperty(String id) async {
    try {
      await _apiClient.delete('$_endpoint/$id');
      // Eliminar del caché si es necesario
      // TODO: Implementar eliminación del caché
    } catch (e) {
      throw Exception('Error al eliminar el predio: $e');
    }
  }

  // Marcar un predio como no disponible
  Future<void> markPropertyAsUnavailable(String id) async {
    try {
      await _apiClient.patch(
        '$_endpoint/$id/availability',
        data: {'isAvailable': false},
      );
      // Actualizar caché si es necesario
      final property = await getPropertyById(id);
      if (property != null) {
        await _cacheService.cacheProperty(property);
      }
    } catch (e) {
      throw Exception('Error al marcar el predio como no disponible: $e');
    }
  }
} 