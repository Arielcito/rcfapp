import 'package:get/get.dart';
import 'package:rcf_app/models/property/property_model.dart';
import 'package:rcf_app/services/property/property_service.dart';

class PropertyController extends GetxController {
  final PropertyService _propertyService = PropertyService();
  
  final RxList<PropertyModel> _properties = <PropertyModel>[].obs;
  final RxList<PropertyModel> _searchResults = <PropertyModel>[].obs;
  final RxBool _isLoading = false.obs;
  final RxString _error = ''.obs;

  // Getters
  List<PropertyModel> get properties => _properties;
  List<PropertyModel> get searchResults => _searchResults;
  bool get isLoading => _isLoading.value;
  String get error => _error.value;

  // Cargar todos los predios
  Future<void> loadProperties() async {
    try {
      _isLoading.value = true;
      final properties = await _propertyService.getAllProperties();
      _properties.assignAll(properties);
      _error.value = '';
    } catch (error) {
      _error.value = 'Error al cargar los predios: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  // Buscar predios
  Future<void> searchProperties(String query) async {
    if (query.isEmpty) {
      _searchResults.clear();
      return;
    }

    try {
      _isLoading.value = true;
      final properties = await _propertyService.searchProperties(query);
      _searchResults.assignAll(properties);
      _error.value = '';
    } catch (error) {
      _error.value = 'Error al buscar predios: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  // Cargar predios por propietario
  Future<void> loadPropertiesByOwner(String ownerId) async {
    try {
      _isLoading.value = true;
      final properties = await _propertyService.getPropertiesByOwner(ownerId);
      _properties.assignAll(properties);
      _error.value = '';
    } catch (error) {
      _error.value = 'Error al cargar los predios del propietario: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  // Obtener un predio específico
  Future<PropertyModel?> getProperty(String id) async {
    try {
      _isLoading.value = true;
      final property = await _propertyService.getPropertyById(id);
      _error.value = '';
      return property;
    } catch (error) {
      _error.value = 'Error al obtener el predio: $error';
      return null;
    } finally {
      _isLoading.value = false;
    }
  }

  // Crear un nuevo predio
  Future<bool> createProperty(PropertyModel property) async {
    try {
      _isLoading.value = true;
      await _propertyService.createProperty(property);
      _error.value = '';
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error.value = 'Error al crear el predio: $error';
      return false;
    } finally {
      _isLoading.value = false;
    }
  }

  // Actualizar un predio
  Future<bool> updateProperty(PropertyModel property) async {
    try {
      _isLoading.value = true;
      await _propertyService.updateProperty(property);
      _error.value = '';
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error.value = 'Error al actualizar el predio: $error';
      return false;
    } finally {
      _isLoading.value = false;
    }
  }

  // Eliminar un predio
  Future<bool> deleteProperty(String id) async {
    try {
      _isLoading.value = true;
      await _propertyService.deleteProperty(id);
      _error.value = '';
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error.value = 'Error al eliminar el predio: $error';
      return false;
    } finally {
      _isLoading.value = false;
    }
  }

  // Marcar un predio como no disponible
  Future<bool> markPropertyAsUnavailable(String id) async {
    try {
      _isLoading.value = true;
      await _propertyService.markPropertyAsUnavailable(id);
      _error.value = '';
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error.value = 'Error al marcar el predio como no disponible: $error';
      return false;
    } finally {
      _isLoading.value = false;
    }
  }
} 