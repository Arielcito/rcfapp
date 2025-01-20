import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/booking/booking_controller.dart';
import 'package:rcf_app/models/booking/booking_model.dart';
import 'package:rcf_app/utils/whatsapp_utils.dart';
import 'package:rcf_app/services/property/property_service.dart';
import 'package:intl/intl.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class BookingConfirmationScreen extends GetView<BookingController> {
  final BookingModel booking = Get.arguments;
  final PropertyService _propertyService = PropertyService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Confirmación de Reserva'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSuccessMessage(),
            SizedBox(height: 32),
            _buildBookingDetails(),
            SizedBox(height: 32),
            _buildPaymentDetails(),
            SizedBox(height: 32),
            _buildActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessMessage() {
    return Center(
      child: Column(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green,
            size: 64,
          ),
          SizedBox(height: 16),
          Text(
            '¡Reserva Confirmada!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Tu reserva ha sido procesada exitosamente',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingDetails() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Detalles de la Reserva',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            _buildDetailRow('Fecha', DateFormat('dd/MM/yyyy').format(booking.date)),
            _buildDetailRow('Hora', DateFormat('HH:mm').format(booking.startTime)),
            _buildDetailRow('Duración', '1 hora'),
            _buildDetailRow('Estado', _getStatusText(booking.status)),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentDetails() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Detalles del Pago',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            _buildDetailRow('Método', _getPaymentMethodText(booking.paymentMethod)),
            _buildDetailRow('Estado', _getPaymentStatusText(booking.paymentStatus)),
            _buildDetailRow('Total', '\$${booking.totalAmount}'),
            _buildDetailRow('Pagado', '\$${booking.paidAmount}'),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions() {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () => _contactOwner(),
            icon: FaIcon(FontAwesomeIcons.whatsapp),
            label: Text('Contactar al Propietario'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Colors.green,
            ),
          ),
        ),
        SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => Get.offAllNamed('/home'),
            child: Text('Volver al Inicio'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
        SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => Get.toNamed('/bookings'),
            child: Text('Ver Mis Reservas'),
            style: OutlinedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _contactOwner() async {
    try {
      final property = await _propertyService.getPropertyById(booking.propertyId);
      if (property != null) {
        await WhatsAppUtils.launchWhatsApp(
          phone: property.phone,
          message: WhatsAppUtils.getBookingMessage(booking),
        );
      } else {
        Get.snackbar(
          'Error',
          'No se pudo obtener la información del predio',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'No se pudo abrir WhatsApp',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  String _getStatusText(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending:
        return 'Pendiente';
      case BookingStatus.confirmed:
        return 'Confirmada';
      case BookingStatus.partial:
        return 'Seña pagada';
      case BookingStatus.cancelled:
        return 'Cancelada';
      case BookingStatus.completed:
        return 'Completada';
      default:
        return 'Desconocido';
    }
  }

  String _getPaymentMethodText(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.mercadoPago:
        return 'Mercado Pago';
      case PaymentMethod.cash:
        return 'Efectivo';
      default:
        return 'Desconocido';
    }
  }

  String _getPaymentStatusText(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.pending:
        return 'Pendiente';
      case PaymentStatus.partial:
        return 'Seña pagada';
      case PaymentStatus.completed:
        return 'Completado';
      case PaymentStatus.refunded:
        return 'Reembolsado';
      default:
        return 'Desconocido';
    }
  }
} 