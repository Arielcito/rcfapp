import 'package:cloud_firestore/cloud_firestore.dart';

class PropertyModel {
  final String id;
  final String name;
  final String description;
  final String address;
  final double pricePerHour;
  final String type;
  final double latitude;
  final double longitude;
  final String phone;
  final List<String> images;
  final String ownerId;
  final DateTime createdAt;
  final DateTime updatedAt;

  PropertyModel({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.pricePerHour,
    required this.type,
    required this.latitude,
    required this.longitude,
    required this.phone,
    required this.images,
    required this.ownerId,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'address': address,
      'pricePerHour': pricePerHour,
      'type': type,
      'latitude': latitude,
      'longitude': longitude,
      'phone': phone,
      'images': images,
      'ownerId': ownerId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory PropertyModel.fromMap(Map<String, dynamic> map) {
    return PropertyModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      address: map['address'] ?? '',
      pricePerHour: (map['pricePerHour'] ?? 0.0).toDouble(),
      type: map['type'] ?? '',
      latitude: (map['latitude'] ?? 0.0).toDouble(),
      longitude: (map['longitude'] ?? 0.0).toDouble(),
      phone: map['phone'] ?? '',
      images: List<String>.from(map['images'] ?? []),
      ownerId: map['ownerId'] ?? '',
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      updatedAt: (map['updatedAt'] as Timestamp).toDate(),
    );
  }

  factory PropertyModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return PropertyModel.fromMap({
      'id': doc.id,
      ...data,
    });
  }
} 