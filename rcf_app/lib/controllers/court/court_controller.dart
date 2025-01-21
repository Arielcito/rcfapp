import 'package:get/get.dart';
import 'package:rcf_app/models/court/court_model.dart';
import 'package:rcf_app/services/court/court_service.dart';

class CourtController extends GetxController {
  final CourtService _courtService = CourtService();
  
  final RxList<CourtModel> _courts = <CourtModel>[].obs;
  final RxBool _isLoading = false.obs;
  final RxString _error = ''.obs;

  // Getters
  List<CourtModel> get courts => _courts;
  bool get isLoading => _isLoading.value;
  String get error => _error.value;

  // Cargar todas las canchas
  Future<void> loadCourts() async {
    try {
      _isLoading.value = true;
      final courts = await _courtService.getAllCourts();
      _courts.assignAll(courts);
      _error.value = '';
    } catch (error) {
      _error.value = 'Error al cargar las canchas: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  // Cargar canchas por predio
  Future<void> loadCourtsByProperty(String propertyId) async {
    try {
      _isLoading.value = true;
      final courts = await _courtService.getCourtsByPropertyId(propertyId);
      _courts.assignAll(courts);
      _error.value = '';
    } catch (error) {
      _error.value = 'Error al cargar las canchas del predio: $error';
    } finally {
      _isLoading.value = false;
    }
  }

  // Obtener una cancha por ID
  Future<CourtModel?> getCourt(String id) async {
    try {
      _isLoading.value = true;
      final court = await _courtService.getCourtById(id);
      _error.value = '';
      return court;
    } catch (error) {
      _error.value = 'Error al obtener la cancha: $error';
      return null;
    } finally {
      _isLoading.value = false;
    }
  }

  // Crear una nueva cancha
  Future<CourtModel?> createCourt(CourtModel court) async {
    try {
      _isLoading.value = true;
      final newCourt = await _courtService.createCourt(court);
      _courts.add(newCourt);
      _error.value = '';
      return newCourt;
    } catch (error) {
      _error.value = 'Error al crear la cancha: $error';
      return null;
    } finally {
      _isLoading.value = false;
    }
  }

  // Actualizar una cancha
  Future<CourtModel?> updateCourt(String id, CourtModel court) async {
    try {
      _isLoading.value = true;
      final updatedCourt = await _courtService.updateCourt(id, court);
      final index = _courts.indexWhere((c) => c.id == id);
      if (index != -1) {
        _courts[index] = updatedCourt;
      }
      _error.value = '';
      return updatedCourt;
    } catch (error) {
      _error.value = 'Error al actualizar la cancha: $error';
      return null;
    } finally {
      _isLoading.value = false;
    }
  }

  // Eliminar una cancha
  Future<bool> deleteCourt(String id, String propertyId) async {
    try {
      _isLoading.value = true;
      await _courtService.deleteCourt(id, propertyId);
      _courts.removeWhere((court) => court.id == id);
      _error.value = '';
      return true;
    } catch (error) {
      _error.value = 'Error al eliminar la cancha: $error';
      return false;
    } finally {
      _isLoading.value = false;
    }
  }
} 