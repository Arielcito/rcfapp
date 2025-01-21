import 'package:cloud_firestore/cloud_firestore.dart';

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
  });

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
    );
  }
} 