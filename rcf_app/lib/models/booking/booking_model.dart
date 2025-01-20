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
  final double totalAmount;
  final double paidAmount;
  final BookingStatus status;
  final PaymentMethod paymentMethod;
  final PaymentStatus paymentStatus;
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
    required this.totalAmount,
    required this.paidAmount,
    required this.status,
    required this.paymentMethod,
    required this.paymentStatus,
    this.paymentId,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'propertyId': propertyId,
      'courtId': courtId,
      'date': date,
      'startTime': startTime,
      'endTime': endTime,
      'totalAmount': totalAmount,
      'paidAmount': paidAmount,
      'status': status.toString(),
      'paymentMethod': paymentMethod.toString(),
      'paymentStatus': paymentStatus.toString(),
      'paymentId': paymentId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory BookingModel.fromMap(Map<String, dynamic> map) {
    return BookingModel(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      propertyId: map['propertyId'] ?? '',
      courtId: map['courtId'] ?? '',
      date: (map['date'] as Timestamp).toDate(),
      startTime: (map['startTime'] as Timestamp).toDate(),
      endTime: (map['endTime'] as Timestamp).toDate(),
      totalAmount: (map['totalAmount'] ?? 0.0).toDouble(),
      paidAmount: (map['paidAmount'] ?? 0.0).toDouble(),
      status: BookingStatus.values.firstWhere(
        (e) => e.toString() == map['status'],
        orElse: () => BookingStatus.pending,
      ),
      paymentMethod: PaymentMethod.values.firstWhere(
        (e) => e.toString() == map['paymentMethod'],
        orElse: () => PaymentMethod.mercadoPago,
      ),
      paymentStatus: PaymentStatus.values.firstWhere(
        (e) => e.toString() == map['paymentStatus'],
        orElse: () => PaymentStatus.pending,
      ),
      paymentId: map['paymentId'],
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      updatedAt: (map['updatedAt'] as Timestamp).toDate(),
    );
  }

  factory BookingModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return BookingModel.fromMap({
      'id': doc.id,
      ...data,
    });
  }

  BookingModel copyWith({
    String? id,
    String? userId,
    String? propertyId,
    String? courtId,
    DateTime? date,
    DateTime? startTime,
    DateTime? endTime,
    double? totalAmount,
    double? paidAmount,
    BookingStatus? status,
    PaymentMethod? paymentMethod,
    PaymentStatus? paymentStatus,
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
      totalAmount: totalAmount ?? this.totalAmount,
      paidAmount: paidAmount ?? this.paidAmount,
      status: status ?? this.status,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentId: paymentId ?? this.paymentId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
} 