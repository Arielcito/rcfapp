import 'package:json_annotation/json_annotation.dart';
import 'package:get/get.dart';

part './court_model.g.dart';

@JsonSerializable(
  explicitToJson: true,
  fieldRename: FieldRename.snake,
  includeIfNull: false,
)
class CourtModel {
  final String id;
  final String propertyId;
  final String name;
  final String sport;
  final double pricePerHour;
  final bool isIndoor;
  final String? description;
  final String? imageUrl;
  final bool isActive;
  final List<String> availableHours;

  CourtModel({
    required this.id,
    required this.propertyId,
    required this.name,
    required this.sport,
    required this.pricePerHour,
    required this.isIndoor,
    this.description,
    this.imageUrl,
    required this.isActive,
    required this.availableHours,
  });

  factory CourtModel.fromJson(Map<String, dynamic> json) => _$CourtModelFromJson(json);

  Map<String, dynamic> toJson() => _$CourtModelToJson(this);

  CourtModel copyWith({
    String? id,
    String? propertyId,
    String? name,
    String? sport,
    double? pricePerHour,
    bool? isIndoor,
    String? description,
    String? imageUrl,
    bool? isActive,
    List<String>? availableHours,
  }) {
    return CourtModel(
      id: id ?? this.id,
      propertyId: propertyId ?? this.propertyId,
      name: name ?? this.name,
      sport: sport ?? this.sport,
      pricePerHour: pricePerHour ?? this.pricePerHour,
      isIndoor: isIndoor ?? this.isIndoor,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      isActive: isActive ?? this.isActive,
      availableHours: availableHours ?? this.availableHours,
    );
  }

  factory CourtModel.fromMap(Map<String, dynamic> map) {
    return CourtModel(
      id: map['id'] ?? '',
      propertyId: map['propertyId'] ?? '',
      name: map['name'] ?? '',
      sport: map['sport'] ?? '',
      pricePerHour: (map['pricePerHour'] ?? 0.0).toDouble(),
      isIndoor: map['isIndoor'] ?? false,
      description: map['description'],
      imageUrl: map['imageUrl'],
      isActive: map['isActive'] ?? true,
      availableHours: List<String>.from(map['availableHours'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'propertyId': propertyId,
      'name': name,
      'sport': sport,
      'pricePerHour': pricePerHour,
      'isIndoor': isIndoor,
      'description': description,
      'imageUrl': imageUrl,
      'isActive': isActive,
      'availableHours': availableHours,
    };
  }
} 