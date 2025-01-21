import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/booking/booking_controller.dart';
import 'package:rcf_app/models/booking/booking_model.dart';
import 'package:rcf_app/utils/whatsapp_utils.dart';
import 'package:rcf_app/services/property/property_service.dart';
import 'package:intl/intl.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class BookingConfirmationScreen extends StatelessWidget {
  final BookingController controller = Get.find();

  BookingConfirmationScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final booking = Get.arguments as BookingModel;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirmación de Reserva'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildSuccessMessage(context),
            const SizedBox(height: 32),
            _buildBookingDetails(context, booking),
            const SizedBox(height: 32),
            _buildActions(context, booking),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessMessage(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Icon(
            Icons.check_circle,
            color: Theme.of(context).primaryColor,
            size: 64,
          ),
          const SizedBox(height: 16),
          Text(
            '¡Reserva Realizada!',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 8),
          const Text(
            'Tu reserva ha sido registrada exitosamente.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildBookingDetails(BuildContext context, BookingModel booking) {
    return Card(
      margin: const EdgeInsets.all(16.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Detalles de la Reserva',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            _buildDetailRow('Fecha', DateFormat('dd/MM/yyyy').format(booking.date)),
            _buildDetailRow('Hora', DateFormat('HH:mm').format(booking.startTime)),
            _buildDetailRow('Duración', '${booking.duration} hora(s)'),
            _buildDetailRow('Estado', _getStatusText(booking.status)),
            const Divider(),
            Text(
              'Detalles del Pago',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
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
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value),
        ],
      ),
    );
  }

  Widget _buildActions(BuildContext context, BookingModel booking) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          ElevatedButton.icon(
            onPressed: () => _shareBooking(context, booking),
            icon: const Icon(Icons.share),
            label: const Text('Compartir Reserva'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () => Get.offAllNamed('/home'),
            icon: const Icon(Icons.home),
            label: const Text('Volver al Inicio'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
        ],
      ),
    );
  }

  void _shareBooking(BuildContext context, BookingModel booking) {
    // Implementar la lógica para compartir la reserva
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
    }
  }

  String _getPaymentMethodText(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.mercadoPago:
        return 'MercadoPago';
      case PaymentMethod.cash:
        return 'Efectivo';
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
    }
  }
} 