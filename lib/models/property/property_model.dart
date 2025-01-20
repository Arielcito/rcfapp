import 'package:cloud_firestore/cloud_firestore.dart';

class PropertyModel {
  final String id;
  final String ownerId;
  final String title;
  final String description;
  final String address;
  final double price;
  final double area;
  final List<String> images;
  final GeoPoint location;
  final String propertyType;
  final bool isAvailable;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> features;

  PropertyModel({
    required this.id,
    required this.ownerId,
    required this.title,
    required this.description,
    required this.address,
    required this.price,
    required this.area,
    required this.images,
    required this.location,
    required this.propertyType,
    required this.isAvailable,
    required this.createdAt,
    required this.updatedAt,
    required this.features,
  });

  factory PropertyModel.fromMap(Map<String, dynamic> map, String id) {
    return PropertyModel(
      id: id,
      ownerId: map['ownerId'] as String,
      title: map['title'] as String,
      description: map['description'] as String,
      address: map['address'] as String,
      price: (map['price'] as num).toDouble(),
      area: (map['area'] as num).toDouble(),
      images: List<String>.from(map['images']),
      location: map['location'] as GeoPoint,
      propertyType: map['propertyType'] as String,
      isAvailable: map['isAvailable'] as bool,
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      updatedAt: (map['updatedAt'] as Timestamp).toDate(),
      features: map['features'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'ownerId': ownerId,
      'title': title,
      'description': description,
      'address': address,
      'price': price,
      'area': area,
      'images': images,
      'location': location,
      'propertyType': propertyType,
      'isAvailable': isAvailable,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'features': features,
    };
  }

  PropertyModel copyWith({
    String? id,
    String? ownerId,
    String? title,
    String? description,
    String? address,
    double? price,
    double? area,
    List<String>? images,
    GeoPoint? location,
    String? propertyType,
    bool? isAvailable,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? features,
  }) {
    return PropertyModel(
      id: id ?? this.id,
      ownerId: ownerId ?? this.ownerId,
      title: title ?? this.title,
      description: description ?? this.description,
      address: address ?? this.address,
      price: price ?? this.price,
      area: area ?? this.area,
      images: images ?? this.images,
      location: location ?? this.location,
      propertyType: propertyType ?? this.propertyType,
      isAvailable: isAvailable ?? this.isAvailable,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      features: features ?? this.features,
    );
  }
} 