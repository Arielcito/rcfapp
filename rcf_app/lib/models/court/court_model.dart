import 'package:json_annotation/json_annotation.dart';

part 'court_model.g.dart';

@JsonSerializable()
class CourtModel {
  final String id;
  final String predioId;
  final String nombre;
  final String? tipo;
  final int? capacidadJugadores;
  final String? longitud;
  final String? ancho;
  final String? tipoSuperficie;
  final bool? tieneIluminacion;
  final bool? esTechada;
  final double? precioPorHora;
  final String? estado;
  final DateTime? ultimoMantenimiento;
  final String? equipamientoIncluido;
  final String? imagenUrl;
  final DateTime? createdAt;
  final bool requiereSeña;
  final double montoSeña;

  CourtModel({
    required this.id,
    required this.predioId,
    required this.nombre,
    this.tipo,
    this.capacidadJugadores,
    this.longitud,
    this.ancho,
    this.tipoSuperficie,
    this.tieneIluminacion,
    this.esTechada,
    this.precioPorHora,
    this.estado,
    this.ultimoMantenimiento,
    this.equipamientoIncluido,
    this.imagenUrl,
    this.createdAt,
    required this.requiereSeña,
    required this.montoSeña,
  });

  factory CourtModel.fromJson(Map<String, dynamic> json) => _$CourtModelFromJson(json);

  Map<String, dynamic> toJson() => _$CourtModelToJson(this);

  CourtModel copyWith({
    String? id,
    String? predioId,
    String? nombre,
    String? tipo,
    int? capacidadJugadores,
    String? longitud,
    String? ancho,
    String? tipoSuperficie,
    bool? tieneIluminacion,
    bool? esTechada,
    double? precioPorHora,
    String? estado,
    DateTime? ultimoMantenimiento,
    String? equipamientoIncluido,
    String? imagenUrl,
    DateTime? createdAt,
    bool? requiereSeña,
    double? montoSeña,
  }) {
    return CourtModel(
      id: id ?? this.id,
      predioId: predioId ?? this.predioId,
      nombre: nombre ?? this.nombre,
      tipo: tipo ?? this.tipo,
      capacidadJugadores: capacidadJugadores ?? this.capacidadJugadores,
      longitud: longitud ?? this.longitud,
      ancho: ancho ?? this.ancho,
      tipoSuperficie: tipoSuperficie ?? this.tipoSuperficie,
      tieneIluminacion: tieneIluminacion ?? this.tieneIluminacion,
      esTechada: esTechada ?? this.esTechada,
      precioPorHora: precioPorHora ?? this.precioPorHora,
      estado: estado ?? this.estado,
      ultimoMantenimiento: ultimoMantenimiento ?? this.ultimoMantenimiento,
      equipamientoIncluido: equipamientoIncluido ?? this.equipamientoIncluido,
      imagenUrl: imagenUrl ?? this.imagenUrl,
      createdAt: createdAt ?? this.createdAt,
      requiereSeña: requiereSeña ?? this.requiereSeña,
      montoSeña: montoSeña ?? this.montoSeña,
    );
  }
} 