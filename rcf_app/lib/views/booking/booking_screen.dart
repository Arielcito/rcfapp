import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/booking/booking_controller.dart';
import 'package:rcf_app/models/property/property_model.dart';
import 'package:rcf_app/models/court/court_model.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:rcf_app/controllers/auth/auth_controller.dart';

class BookingScreen extends StatelessWidget {
  final PropertyModel property = Get.arguments;
  final BookingController controller = Get.find<BookingController>();

  BookingScreen({Key? key}) : super(key: key) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.loadCourts(property.id);
    });
  }

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
            _buildCourtSelection(),
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
              property.nombre,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text(property.direccion),
          ],
        ),
      ),
    );
  }

  Widget _buildCourtSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Seleccionar Cancha',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        Obx(() {
          if (controller.isLoading) {
            return Center(child: CircularProgressIndicator());
          }
          
          if (controller.courts.isEmpty) {
            return Text('No hay canchas disponibles');
          }

          return ListView.builder(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: controller.courts.length,
            itemBuilder: (context, index) {
              final court = controller.courts[index];
              return Card(
                child: ListTile(
                  leading: court.imageUrl != null
                      ? CircleAvatar(
                          backgroundImage: NetworkImage(court.imageUrl!),
                        )
                      : CircleAvatar(
                          child: Icon(Icons.sports),
                        ),
                  title: Text(court.name),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Deporte: ${court.sport}'),
                      Text('Precio por hora: \$${court.pricePerHour}'),
                    ],
                  ),
                  selected: controller.selectedCourt?.id == court.id,
                  onTap: () => controller.setSelectedCourt(court),
                ),
              );
            },
          );
        }),
      ],
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
              'Total a pagar: \$${controller.selectedCourt?.pricePerHour != null ? (controller.selectedCourt!.pricePerHour * (controller.isPartialPayment.value ? 0.5 : 1.0)) : 0}',
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
            onPressed: controller.isLoading || controller.isProcessingPayment.value
                ? null
                : () => _processBooking(),
            child: controller.isLoading || controller.isProcessingPayment.value
                ? CircularProgressIndicator()
                : Text('Confirmar Reserva'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          )),
    );
  }

  Future<void> _processBooking() async {
    if (controller.selectedCourt == null) {
      Get.snackbar(
        'Error',
        'Por favor selecciona una cancha',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    try {
      // Verificar disponibilidad
      final isAvailable = await controller.checkAvailability(
        propertyId: property.id,
        courtId: controller.selectedCourt!.id,
        date: controller.selectedDate.value,
        startTime: controller.selectedTime.value,
        endTime: controller.selectedTime.value.add(Duration(hours: 1)),
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
      final authController = Get.find<AuthController>();
      final userId = authController.currentUser.value?.id;
      if (userId == null) {
        Get.snackbar(
          'Error',
          'No se pudo obtener el usuario actual',
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }

      final booking = await controller.createBooking(
        userId: userId,
        propertyId: property.id,
        courtId: controller.selectedCourt!.id,
        price: controller.selectedCourt!.pricePerHour,
      );

      // Crear preferencia de pago
      final preference = await controller.createPaymentPreference(
        booking.id,
        controller.selectedCourt!.pricePerHour * (controller.isPartialPayment.value ? 0.5 : 1.0),
        'Reserva en ${property.nombre} - ${controller.selectedCourt!.name}',
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