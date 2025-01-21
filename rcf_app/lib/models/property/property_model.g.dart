// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'property_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PropertyModel _$PropertyModelFromJson(Map<String, dynamic> json) =>
    PropertyModel(
      id: json['id'] as String,
      usuarioId: json['usuario_id'] as String,
      nombre: json['nombre'] as String,
      direccion: json['direccion'] as String,
      ciudad: json['ciudad'] as String,
      provincia: json['provincia'] as String,
      codigoPostal: json['codigo_postal'] as String?,
      telefono: json['telefono'] as String?,
      email: json['email'] as String?,
      latitud: (json['latitud'] as num?)?.toDouble(),
      longitud: (json['longitud'] as num?)?.toDouble(),
      capacidadEstacionamiento:
          (json['capacidad_estacionamiento'] as num?)?.toInt(),
      tieneVestuarios: json['tiene_vestuarios'] as bool?,
      tieneCafeteria: json['tiene_cafeteria'] as bool?,
      horarioApertura: json['horario_apertura'] as String?,
      horarioCierre: json['horario_cierre'] as String?,
      diasOperacion: json['dias_operacion'] as String?,
      imagenUrl: json['imagen_url'] as String?,
      fechaRegistro: DateTime.parse(json['fecha_registro'] as String),
      phone: json['phone'] as String,
      images:
          (json['images'] as List<dynamic>).map((e) => e as String).toList(),
      isActive: json['is_active'] as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$PropertyModelToJson(PropertyModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'usuario_id': instance.usuarioId,
      'nombre': instance.nombre,
      'direccion': instance.direccion,
      'ciudad': instance.ciudad,
      'provincia': instance.provincia,
      if (instance.codigoPostal case final value?) 'codigo_postal': value,
      if (instance.telefono case final value?) 'telefono': value,
      if (instance.email case final value?) 'email': value,
      if (instance.latitud case final value?) 'latitud': value,
      if (instance.longitud case final value?) 'longitud': value,
      if (instance.capacidadEstacionamiento case final value?)
        'capacidad_estacionamiento': value,
      if (instance.tieneVestuarios case final value?) 'tiene_vestuarios': value,
      if (instance.tieneCafeteria case final value?) 'tiene_cafeteria': value,
      if (instance.horarioApertura case final value?) 'horario_apertura': value,
      if (instance.horarioCierre case final value?) 'horario_cierre': value,
      if (instance.diasOperacion case final value?) 'dias_operacion': value,
      if (instance.imagenUrl case final value?) 'imagen_url': value,
      'fecha_registro': instance.fechaRegistro.toIso8601String(),
      'phone': instance.phone,
      'images': instance.images,
      'is_active': instance.isActive,
      'created_at': instance.createdAt.toIso8601String(),
      if (instance.updatedAt?.toIso8601String() case final value?)
        'updated_at': value,
    };
