// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'court_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CourtModel _$CourtModelFromJson(Map<String, dynamic> json) => CourtModel(
      id: json['id'] as String,
      propertyId: json['property_id'] as String,
      name: json['name'] as String,
      sport: json['sport'] as String,
      pricePerHour: (json['price_per_hour'] as num).toDouble(),
      isIndoor: json['is_indoor'] as bool,
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String?,
      isActive: json['is_active'] as bool,
      availableHours: (json['available_hours'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      hasLighting: json['has_lighting'] as bool? ?? false,
      isRoofed: json['is_roofed'] as bool? ?? false,
      includedEquipment: json['included_equipment'] as String?,
      requiresDeposit: json['requires_deposit'] as bool? ?? false,
      depositAmount: (json['deposit_amount'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$CourtModelToJson(CourtModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'property_id': instance.propertyId,
      'name': instance.name,
      'sport': instance.sport,
      'price_per_hour': instance.pricePerHour,
      'is_indoor': instance.isIndoor,
      if (instance.description case final value?) 'description': value,
      if (instance.imageUrl case final value?) 'image_url': value,
      'is_active': instance.isActive,
      'available_hours': instance.availableHours,
      'has_lighting': instance.hasLighting,
      'is_roofed': instance.isRoofed,
      if (instance.includedEquipment case final value?)
        'included_equipment': value,
      'requires_deposit': instance.requiresDeposit,
      if (instance.depositAmount case final value?) 'deposit_amount': value,
    };
