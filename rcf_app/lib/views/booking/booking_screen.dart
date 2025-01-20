import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/booking/booking_controller.dart';
import 'package:rcf_app/models/property/property_model.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

class BookingScreen extends GetView<BookingController> {
  final PropertyModel property = Get.arguments;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Reservar Cancha'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildPropertyInfo(),
            SizedBox(height: 24),
            _buildDateSelection(),
            SizedBox(height: 24),
            _buildTimeSelection(),
            SizedBox(height: 24),
            _buildPaymentOptions(),
            SizedBox(height: 32),
            _buildBookingButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildPropertyInfo() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              property.name,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text(property.address),
            SizedBox(height: 8),
            Text(
              'Precio por hora: \$${property.pricePerHour}',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Fecha',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        InkWell(
          onTap: () async {
            final date = await showDatePicker(
              context: Get.context!,
              initialDate: controller.selectedDate.value,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(Duration(days: 30)),
            );
            if (date != null) {
              controller.setSelectedDate(date);
            }
          },
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Obx(() => Text(
                      DateFormat('dd/MM/yyyy').format(controller.selectedDate.value),
                      style: TextStyle(fontSize: 16),
                    )),
                Icon(Icons.calendar_today),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimeSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Hora',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        InkWell(
          onTap: () async {
            final time = await showTimePicker(
              context: Get.context!,
              initialTime: TimeOfDay.fromDateTime(controller.selectedTime.value),
            );
            if (time != null) {
              final now = DateTime.now();
              controller.setSelectedTime(DateTime(
                now.year,
                now.month,
                now.day,
                time.hour,
                time.minute,
              ));
            }
          },
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Obx(() => Text(
                      DateFormat('HH:mm').format(controller.selectedTime.value),
                      style: TextStyle(fontSize: 16),
                    )),
                Icon(Icons.access_time),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentOptions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Opciones de Pago',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        Obx(() => SwitchListTile(
              title: Text('Pagar seña (50%)'),
              value: controller.isPartialPayment.value,
              onChanged: (value) => controller.togglePartialPayment(),
            )),
        Obx(() => Text(
              'Total a pagar: \$${controller.isPartialPayment.value ? property.pricePerHour * 0.5 : property.pricePerHour}',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            )),
      ],
    );
  }

  Widget _buildBookingButton() {
    return SizedBox(
      width: double.infinity,
      child: Obx(() => ElevatedButton(
            onPressed: controller.isLoading.value
                ? null
                : () => _processBooking(),
            child: controller.isLoading.value
                ? CircularProgressIndicator()
                : Text('Confirmar Reserva'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          )),
    );
  }

  Future<void> _processBooking() async {
    try {
      // Verificar disponibilidad
      final isAvailable = await controller.checkAvailability(
        property.id,
        'default', // TODO: Implementar selección de cancha
        controller.selectedDate.value,
        controller.selectedTime.value,
        controller.selectedTime.value.add(Duration(hours: 1)),
      );

      if (!isAvailable) {
        Get.snackbar(
          'Error',
          'El horario seleccionado no está disponible',
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }

      // Crear la reserva
      final bookingId = await controller.createBooking(
        userId: Get.find<String>('userId'),
        propertyId: property.id,
        courtId: 'default', // TODO: Implementar selección de cancha
        price: property.pricePerHour,
      );

      // Crear preferencia de pago
      final preference = await controller.createPaymentPreference(
        bookingId,
        property.pricePerHour,
        'Reserva en ${property.name}',
      );

      // Abrir URL de pago
      final url = preference['init_point'] as String;
      if (await canLaunch(url)) {
        await launch(url);
      } else {
        throw 'No se pudo abrir la página de pago';
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'No se pudo procesar la reserva',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
} 