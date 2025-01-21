import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:json_annotation/json_annotation.dart';

part 'booking_model.g.dart';

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

@JsonSerializable(
  explicitToJson: true,
  fieldRename: FieldRename.snake,
  includeIfNull: false,
)
class BookingModel {
  final String id;
  final String userId;
  final String courtId;
  final String propertyId;
  final DateTime date;
  final DateTime startTime;
  final DateTime endTime;
  final int duration;
  final BookingStatus status;
  final PaymentStatus paymentStatus;
  final PaymentMethod paymentMethod;
  final double totalAmount;
  final double paidAmount;
  final String? paymentId;
  final DateTime createdAt;
  final DateTime updatedAt;

  BookingModel({
    required this.id,
    required this.userId,
    required this.courtId,
    required this.propertyId,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.duration,
    required this.status,
    required this.paymentStatus,
    required this.paymentMethod,
    required this.totalAmount,
    required this.paidAmount,
    this.paymentId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) => _$BookingModelFromJson(json);

  Map<String, dynamic> toJson() => _$BookingModelToJson(this);

  factory BookingModel.fromMap(Map<String, dynamic> map) {
    return BookingModel(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      courtId: map['courtId'] ?? '',
      propertyId: map['propertyId'] ?? '',
      date: DateTime.parse(map['date']),
      startTime: DateTime.parse(map['startTime']),
      endTime: DateTime.parse(map['endTime']),
      duration: map['duration'] ?? 0,
      status: BookingStatus.values.firstWhere(
        (e) => e.toString() == 'BookingStatus.${map['status']}',
        orElse: () => BookingStatus.pending,
      ),
      paymentStatus: PaymentStatus.values.firstWhere(
        (e) => e.toString() == 'PaymentStatus.${map['paymentStatus']}',
        orElse: () => PaymentStatus.pending,
      ),
      paymentMethod: PaymentMethod.values.firstWhere(
        (e) => e.toString() == 'PaymentMethod.${map['paymentMethod']}',
        orElse: () => PaymentMethod.mercadoPago,
      ),
      totalAmount: (map['totalAmount'] ?? 0.0).toDouble(),
      paidAmount: (map['paidAmount'] ?? 0.0).toDouble(),
      paymentId: map['paymentId'],
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'courtId': courtId,
      'propertyId': propertyId,
      'date': date.toIso8601String(),
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'duration': duration,
      'status': status.toString().split('.').last,
      'paymentStatus': paymentStatus.toString().split('.').last,
      'paymentMethod': paymentMethod.toString().split('.').last,
      'totalAmount': totalAmount,
      'paidAmount': paidAmount,
      'paymentId': paymentId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  BookingModel copyWith({
    String? id,
    String? userId,
    String? courtId,
    String? propertyId,
    DateTime? date,
    DateTime? startTime,
    DateTime? endTime,
    int? duration,
    BookingStatus? status,
    PaymentStatus? paymentStatus,
    PaymentMethod? paymentMethod,
    double? totalAmount,
    double? paidAmount,
    String? paymentId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BookingModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      courtId: courtId ?? this.courtId,
      propertyId: propertyId ?? this.propertyId,
      date: date ?? this.date,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      duration: duration ?? this.duration,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      totalAmount: totalAmount ?? this.totalAmount,
      paidAmount: paidAmount ?? this.paidAmount,
      paymentId: paymentId ?? this.paymentId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
} 