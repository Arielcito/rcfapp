import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:rcf_app/models/property/favorite_model.dart';

class FavoriteService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'favorites';

  Stream<List<FavoriteModel>> getUserFavorites(String userId) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => FavoriteModel.fromFirestore(doc))
          .toList();
    });
  }

  Future<void> addFavorite(String userId, String propertyId) async {
    final favorite = FavoriteModel(
      id: '',
      userId: userId,
      propertyId: propertyId,
      createdAt: DateTime.now(),
    );

    await _firestore.collection(_collection).add(favorite.toMap());
  }

  Future<void> removeFavorite(String userId, String propertyId) async {
    final QuerySnapshot snapshot = await _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('propertyId', isEqualTo: propertyId)
        .get();

    for (var doc in snapshot.docs) {
      await doc.reference.delete();
    }
  }

  Future<bool> isFavorite(String userId, String propertyId) async {
    final QuerySnapshot snapshot = await _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('propertyId', isEqualTo: propertyId)
        .limit(1)
        .get();

    return snapshot.docs.isNotEmpty;
  }
} 