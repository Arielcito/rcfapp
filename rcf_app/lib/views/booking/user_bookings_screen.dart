import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../controllers/booking/booking_controller.dart';
import '../../models/booking/booking_model.dart';

class UserBookingsScreen extends StatelessWidget {
  final BookingController controller = Get.put(BookingController());

  UserBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Reservas'),
        backgroundColor: const Color(0xFF00CC44),
      ),
      body: Obx(
        () => controller.isLoading.value
            ? const Center(child: CircularProgressIndicator())
            : controller.userBookings.isEmpty
                ? const Center(
                    child: Text('No tienes reservas activas'),
                  )
                : ListView.builder(
                    itemCount: controller.userBookings.length,
                    itemBuilder: (context, index) {
                      final booking = controller.userBookings[index];
                      return BookingCard(booking: booking);
                    },
                  ),
      ),
    );
  }
}

class BookingCard extends StatelessWidget {
  final BookingModel booking;

  const BookingCard({
    super.key,
    required this.booking,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('dd/MM/yyyy').format(booking.fecha),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                _buildStatusChip(booking.estadoPago),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Hora: ${booking.hora}',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              'Duración: ${booking.duracion} hora(s)',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (booking.estadoPago != 'cancelado') ...[
                  TextButton(
                    onPressed: () => _showRescheduleDialog(context),
                    child: const Text('Reprogramar'),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: () => _showCancelDialog(context),
                    child: const Text(
                      'Cancelar',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String text;

    switch (status) {
      case 'pendiente':
        color = Colors.orange;
        text = 'Pendiente';
        break;
      case 'confirmado':
        color = Colors.green;
        text = 'Confirmado';
        break;
      case 'cancelado':
        color = Colors.red;
        text = 'Cancelado';
        break;
      default:
        color = Colors.grey;
        text = 'Desconocido';
    }

    return Chip(
      label: Text(
        text,
        style: const TextStyle(color: Colors.white),
      ),
      backgroundColor: color,
    );
  }

  void _showRescheduleDialog(BuildContext context) {
    // TODO: Implementar diálogo de reprogramación
    Get.dialog(
      AlertDialog(
        title: const Text('Reprogramar Reserva'),
        content: const Text('¿Estás seguro de que deseas reprogramar esta reserva?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              // TODO: Implementar lógica de reprogramación
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
  }

  void _showCancelDialog(BuildContext context) {
    final BookingController controller = Get.find<BookingController>();
    
    Get.dialog(
      AlertDialog(
        title: const Text('Cancelar Reserva'),
        content: const Text('¿Estás seguro de que deseas cancelar esta reserva?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              controller.cancelBooking(booking.id);
            },
            child: const Text(
              'Sí',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
} 