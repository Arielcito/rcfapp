import 'package:cloud_firestore/cloud_firestore.dart';

enum BookingStatus {
  pending,    // Reserva pendiente de pago
  confirmed,  // Reserva confirmada (pago completo)
  partial,    // Reserva con seña pagada
  cancelled,  // Reserva cancelada
  completed   // Reserva finalizada
}

enum PaymentMethod {
  mercadoPago,
  cash
}

enum PaymentStatus {
  pending,    // Pago pendiente
  partial,    // Seña pagada
  completed,  // Pago completo
  refunded    // Pago reembolsado
}

class BookingModel {
  final String id;
  final String userId;
  final String canchaId;
  final DateTime fecha;
  final String hora;
  final int duracion;
  final String estadoPago;
  final String metodoPago;
  final DateTime createdAt;
  final DateTime? updatedAt;

  BookingModel({
    required this.id,
    required this.userId,
    required this.canchaId,
    required this.fecha,
    required this.hora,
    required this.duracion,
    required this.estadoPago,
    required this.metodoPago,
    required this.createdAt,
    this.updatedAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      canchaId: json['canchaId'] as String,
      fecha: (json['fecha'] as Timestamp).toDate(),
      hora: json['hora'] as String,
      duracion: json['duracion'] as int,
      estadoPago: json['estadoPago'] as String,
      metodoPago: json['metodoPago'] as String,
      createdAt: (json['createdAt'] as Timestamp).toDate(),
      updatedAt: json['updatedAt'] != null 
          ? (json['updatedAt'] as Timestamp).toDate()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'canchaId': canchaId,
      'fecha': Timestamp.fromDate(fecha),
      'hora': hora,
      'duracion': duracion,
      'estadoPago': estadoPago,
      'metodoPago': metodoPago,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
    };
  }

  BookingModel copyWith({
    String? id,
    String? userId,
    String? canchaId,
    DateTime? fecha,
    String? hora,
    int? duracion,
    String? estadoPago,
    String? metodoPago,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BookingModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      canchaId: canchaId ?? this.canchaId,
      fecha: fecha ?? this.fecha,
      hora: hora ?? this.hora,
      duracion: duracion ?? this.duracion,
      estadoPago: estadoPago ?? this.estadoPago,
      metodoPago: metodoPago ?? this.metodoPago,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
} 