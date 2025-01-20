import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:rcf_app/models/property/property_model.dart';

class PropertyService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'properties';

  // Obtener todos los predios
  Stream<List<PropertyModel>> getAllProperties() {
    return _firestore
        .collection(_collection)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => PropertyModel.fromFirestore(doc))
          .toList();
    });
  }

  // Obtener predios disponibles
  Stream<List<PropertyModel>> getAvailableProperties() {
    return _firestore
        .collection(_collection)
        .where('isAvailable', isEqualTo: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => PropertyModel.fromFirestore(doc))
          .toList();
    });
  }

  // Buscar predios por título o dirección
  Future<List<PropertyModel>> searchProperties(String query) async {
    query = query.toLowerCase();
    final snapshot = await _firestore.collection(_collection).get();
    
    return snapshot.docs
        .map((doc) => PropertyModel.fromFirestore(doc))
        .where((property) =>
            property.name.toLowerCase().contains(query) ||
            property.address.toLowerCase().contains(query))
        .toList();
  }

  // Obtener predios por propietario
  Stream<List<PropertyModel>> getPropertiesByOwner(String ownerId) {
    return _firestore
        .collection(_collection)
        .where('ownerId', isEqualTo: ownerId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => PropertyModel.fromFirestore(doc))
          .toList();
    });
  }

  // Obtener un predio específico por ID
  Future<PropertyModel?> getPropertyById(String id) async {
    try {
      final doc = await _firestore.collection(_collection).doc(id).get();
      if (doc.exists) {
        return PropertyModel.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      print('Error al obtener el predio: $e');
      return null;
    }
  }

  // Crear un nuevo predio
  Future<String> createProperty(PropertyModel property) async {
    final docRef = await _firestore.collection(_collection).add(property.toMap());
    return docRef.id;
  }

  // Actualizar un predio
  Future<void> updateProperty(PropertyModel property) async {
    await _firestore
        .collection(_collection)
        .doc(property.id)
        .update(property.toMap());
  }

  // Eliminar un predio
  Future<void> deleteProperty(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }

  // Marcar un predio como no disponible
  Future<void> markPropertyAsUnavailable(String id) async {
    await _firestore
        .collection(_collection)
        .doc(id)
        .update({'isAvailable': false});
  }
} 