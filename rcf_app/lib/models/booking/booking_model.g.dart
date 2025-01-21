// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingModel _$BookingModelFromJson(Map<String, dynamic> json) => BookingModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      courtId: json['court_id'] as String,
      propertyId: json['property_id'] as String,
      date: DateTime.parse(json['date'] as String),
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      duration: (json['duration'] as num).toInt(),
      status: $enumDecode(_$BookingStatusEnumMap, json['status']),
      paymentStatus:
          $enumDecode(_$PaymentStatusEnumMap, json['payment_status']),
      paymentMethod:
          $enumDecode(_$PaymentMethodEnumMap, json['payment_method']),
      totalAmount: (json['total_amount'] as num).toDouble(),
      paidAmount: (json['paid_amount'] as num).toDouble(),
      paymentId: json['payment_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$BookingModelToJson(BookingModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'court_id': instance.courtId,
      'property_id': instance.propertyId,
      'date': instance.date.toIso8601String(),
      'start_time': instance.startTime.toIso8601String(),
      'end_time': instance.endTime.toIso8601String(),
      'duration': instance.duration,
      'status': _$BookingStatusEnumMap[instance.status]!,
      'payment_status': _$PaymentStatusEnumMap[instance.paymentStatus]!,
      'payment_method': _$PaymentMethodEnumMap[instance.paymentMethod]!,
      'total_amount': instance.totalAmount,
      'paid_amount': instance.paidAmount,
      if (instance.paymentId case final value?) 'payment_id': value,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
    };

const _$BookingStatusEnumMap = {
  BookingStatus.pending: 'pending',
  BookingStatus.confirmed: 'confirmed',
  BookingStatus.partial: 'partial',
  BookingStatus.cancelled: 'cancelled',
  BookingStatus.completed: 'completed',
};

const _$PaymentStatusEnumMap = {
  PaymentStatus.pending: 'pending',
  PaymentStatus.partial: 'partial',
  PaymentStatus.completed: 'completed',
  PaymentStatus.refunded: 'refunded',
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.mercadoPago: 'mercadoPago',
  PaymentMethod.cash: 'cash',
};
