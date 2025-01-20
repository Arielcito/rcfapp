import 'package:flutter/material.dart';
import '../../models/property/property_model.dart';
import '../../services/property/property_service.dart';

class PropertyController extends ChangeNotifier {
  final PropertyService _propertyService = PropertyService();
  
  List<PropertyModel> _properties = [];
  List<PropertyModel> _searchResults = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<PropertyModel> get properties => _properties;
  List<PropertyModel> get searchResults => _searchResults;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Cargar todos los predios
  void loadProperties() {
    _setLoading(true);
    _propertyService.getProperties().listen(
      (properties) {
        _properties = properties;
        _error = null;
        notifyListeners();
      },
      onError: (error) {
        _error = 'Error al cargar los predios: $error';
        notifyListeners();
      },
    );
    _setLoading(false);
  }

  // Buscar predios
  void searchProperties(String query) {
    if (query.isEmpty) {
      _searchResults = [];
      notifyListeners();
      return;
    }

    _setLoading(true);
    _propertyService.searchProperties(query).listen(
      (properties) {
        _searchResults = properties;
        _error = null;
        notifyListeners();
      },
      onError: (error) {
        _error = 'Error al buscar predios: $error';
        notifyListeners();
      },
    );
    _setLoading(false);
  }

  // Cargar predios por propietario
  void loadPropertiesByOwner(String ownerId) {
    _setLoading(true);
    _propertyService.getPropertiesByOwner(ownerId).listen(
      (properties) {
        _properties = properties;
        _error = null;
        notifyListeners();
      },
      onError: (error) {
        _error = 'Error al cargar los predios del propietario: $error';
        notifyListeners();
      },
    );
    _setLoading(false);
  }

  // Obtener un predio específico
  Future<PropertyModel?> getProperty(String id) async {
    try {
      _setLoading(true);
      final property = await _propertyService.getProperty(id);
      _error = null;
      return property;
    } catch (error) {
      _error = 'Error al obtener el predio: $error';
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // Crear un nuevo predio
  Future<bool> createProperty(PropertyModel property) async {
    try {
      _setLoading(true);
      await _propertyService.createProperty(property);
      _error = null;
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error = 'Error al crear el predio: $error';
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Actualizar un predio
  Future<bool> updateProperty(PropertyModel property) async {
    try {
      _setLoading(true);
      await _propertyService.updateProperty(property);
      _error = null;
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error = 'Error al actualizar el predio: $error';
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Eliminar un predio
  Future<bool> deleteProperty(String id) async {
    try {
      _setLoading(true);
      await _propertyService.deleteProperty(id);
      _error = null;
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error = 'Error al eliminar el predio: $error';
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Marcar un predio como no disponible
  Future<bool> markPropertyAsUnavailable(String id) async {
    try {
      _setLoading(true);
      await _propertyService.markPropertyAsUnavailable(id);
      _error = null;
      loadProperties(); // Recargar la lista
      return true;
    } catch (error) {
      _error = 'Error al marcar el predio como no disponible: $error';
      return false;
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
} 