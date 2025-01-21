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
  final String propertyId;
  final String courtId;
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
    required this.propertyId,
    required this.courtId,
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

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      propertyId: json['propertyId'] as String,
      courtId: json['courtId'] as String,
      date: (json['date'] as Timestamp).toDate(),
      startTime: (json['startTime'] as Timestamp).toDate(),
      endTime: (json['endTime'] as Timestamp).toDate(),
      duration: json['duration'] as int,
      status: BookingStatus.values.firstWhere(
        (e) => e.toString() == 'BookingStatus.${json['status']}',
      ),
      paymentStatus: PaymentStatus.values.firstWhere(
        (e) => e.toString() == 'PaymentStatus.${json['paymentStatus']}',
      ),
      paymentMethod: PaymentMethod.values.firstWhere(
        (e) => e.toString() == 'PaymentMethod.${json['paymentMethod']}',
      ),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      paidAmount: (json['paidAmount'] as num).toDouble(),
      paymentId: json['paymentId'] as String?,
      createdAt: (json['createdAt'] as Timestamp).toDate(),
      updatedAt: (json['updatedAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'propertyId': propertyId,
      'courtId': courtId,
      'date': Timestamp.fromDate(date),
      'startTime': Timestamp.fromDate(startTime),
      'endTime': Timestamp.fromDate(endTime),
      'duration': duration,
      'status': status.toString().split('.').last,
      'paymentStatus': paymentStatus.toString().split('.').last,
      'paymentMethod': paymentMethod.toString().split('.').last,
      'totalAmount': totalAmount,
      'paidAmount': paidAmount,
      'paymentId': paymentId,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  BookingModel copyWith({
    String? id,
    String? userId,
    String? propertyId,
    String? courtId,
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
      propertyId: propertyId ?? this.propertyId,
      courtId: courtId ?? this.courtId,
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