import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:json_annotation/json_annotation.dart';

part 'property_model.g.dart';

@JsonSerializable(
  explicitToJson: true,
  fieldRename: FieldRename.snake,
  includeIfNull: false,
)
class PropertyModel {
  final String id;
  final String usuarioId;
  final String nombre;
  final String direccion;
  final String ciudad;
  final String provincia;
  final String? codigoPostal;
  final String? telefono;
  final String? email;
  final double? latitud;
  final double? longitud;
  final int? capacidadEstacionamiento;
  final bool? tieneVestuarios;
  final bool? tieneCafeteria;
  final String? horarioApertura;
  final String? horarioCierre;
  final String? diasOperacion;
  final String? imagenUrl;
  final DateTime fechaRegistro;
  final String phone;
  final List<String> images;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  PropertyModel({
    required this.id,
    required this.usuarioId,
    required this.nombre,
    required this.direccion,
    required this.ciudad,
    required this.provincia,
    this.codigoPostal,
    this.telefono,
    this.email,
    this.latitud,
    this.longitud,
    this.capacidadEstacionamiento,
    this.tieneVestuarios,
    this.tieneCafeteria,
    this.horarioApertura,
    this.horarioCierre,
    this.diasOperacion,
    this.imagenUrl,
    required this.fechaRegistro,
    required this.phone,
    required this.images,
    required this.isActive,
    required this.createdAt,
    this.updatedAt,
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) => _$PropertyModelFromJson(json);

  Map<String, dynamic> toJson() => _$PropertyModelToJson(this);

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'usuarioId': usuarioId,
      'nombre': nombre,
      'direccion': direccion,
      'ciudad': ciudad,
      'provincia': provincia,
      'codigoPostal': codigoPostal,
      'telefono': telefono,
      'email': email,
      'latitud': latitud,
      'longitud': longitud,
      'capacidadEstacionamiento': capacidadEstacionamiento,
      'tieneVestuarios': tieneVestuarios,
      'tieneCafeteria': tieneCafeteria,
      'horarioApertura': horarioApertura,
      'horarioCierre': horarioCierre,
      'diasOperacion': diasOperacion,
      'imagenUrl': imagenUrl,
      'fechaRegistro': fechaRegistro.toIso8601String(),
      'phone': phone,
      'images': images,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  factory PropertyModel.fromMap(Map<String, dynamic> map) {
    return PropertyModel(
      id: map['id'] ?? '',
      usuarioId: map['usuarioId'] ?? '',
      nombre: map['nombre'] ?? '',
      direccion: map['direccion'] ?? '',
      ciudad: map['ciudad'] ?? '',
      provincia: map['provincia'] ?? '',
      codigoPostal: map['codigoPostal'],
      telefono: map['telefono'],
      email: map['email'],
      latitud: map['latitud']?.toDouble(),
      longitud: map['longitud']?.toDouble(),
      capacidadEstacionamiento: map['capacidadEstacionamiento'],
      tieneVestuarios: map['tieneVestuarios'],
      tieneCafeteria: map['tieneCafeteria'],
      horarioApertura: map['horarioApertura'],
      horarioCierre: map['horarioCierre'],
      diasOperacion: map['diasOperacion'],
      imagenUrl: map['imagenUrl'],
      fechaRegistro: map['fechaRegistro'] != null 
          ? DateTime.parse(map['fechaRegistro']) 
          : DateTime.now(),
      phone: map['phone'] ?? '',
      images: List<String>.from(map['images'] ?? []),
      isActive: map['isActive'] ?? true,
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: map['updatedAt'] != null ? DateTime.parse(map['updatedAt']) : null,
    );
  }

  factory PropertyModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return PropertyModel.fromMap({
      'id': doc.id,
      ...data,
    });
  }

  PropertyModel copyWith({
    String? id,
    String? usuarioId,
    String? nombre,
    String? direccion,
    String? ciudad,
    String? provincia,
    String? codigoPostal,
    String? telefono,
    String? email,
    double? latitud,
    double? longitud,
    int? capacidadEstacionamiento,
    bool? tieneVestuarios,
    bool? tieneCafeteria,
    String? horarioApertura,
    String? horarioCierre,
    String? diasOperacion,
    String? imagenUrl,
    DateTime? fechaRegistro,
    String? phone,
    List<String>? images,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PropertyModel(
      id: id ?? this.id,
      usuarioId: usuarioId ?? this.usuarioId,
      nombre: nombre ?? this.nombre,
      direccion: direccion ?? this.direccion,
      ciudad: ciudad ?? this.ciudad,
      provincia: provincia ?? this.provincia,
      codigoPostal: codigoPostal ?? this.codigoPostal,
      telefono: telefono ?? this.telefono,
      email: email ?? this.email,
      latitud: latitud ?? this.latitud,
      longitud: longitud ?? this.longitud,
      capacidadEstacionamiento: capacidadEstacionamiento ?? this.capacidadEstacionamiento,
      tieneVestuarios: tieneVestuarios ?? this.tieneVestuarios,
      tieneCafeteria: tieneCafeteria ?? this.tieneCafeteria,
      horarioApertura: horarioApertura ?? this.horarioApertura,
      horarioCierre: horarioCierre ?? this.horarioCierre,
      diasOperacion: diasOperacion ?? this.diasOperacion,
      imagenUrl: imagenUrl ?? this.imagenUrl,
      fechaRegistro: fechaRegistro ?? this.fechaRegistro,
      phone: phone ?? this.phone,
      images: images ?? this.images,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
} 