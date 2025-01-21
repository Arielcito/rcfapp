import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../controllers/booking/booking_controller.dart';
import '../../models/booking/booking_model.dart';

class NewBookingScreen extends StatelessWidget {
  final BookingController controller = Get.find<BookingController>();
  final String canchaId;

  NewBookingScreen({super.key, required this.canchaId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva Reserva'),
        backgroundColor: const Color(0xFF00CC44),
      ),
      body: Obx(
        () => Stepper(
          currentStep: controller.currentStep.value,
          onStepContinue: () => controller.nextStep(),
          onStepCancel: () => controller.previousStep(),
          steps: [
            Step(
              title: const Text('Fecha y Hora'),
              content: _DateTimeStep(canchaId: canchaId),
              isActive: controller.currentStep.value >= 0,
            ),
            Step(
              title: const Text('Confirmación'),
              content: _ConfirmationStep(),
              isActive: controller.currentStep.value >= 1,
            ),
            Step(
              title: const Text('Pago'),
              content: _PaymentStep(),
              isActive: controller.currentStep.value >= 2,
            ),
          ],
        ),
      ),
    );
  }
}

class _DateTimeStep extends StatelessWidget {
  final String canchaId;

  const _DateTimeStep({required this.canchaId});

  @override
  Widget build(BuildContext context) {
    final BookingController controller = Get.find<BookingController>();

    return Column(
      children: [
        ListTile(
          title: const Text('Seleccionar Fecha'),
          subtitle: Obx(() => Text(
                controller.selectedDate.value != null
                    ? DateFormat('dd/MM/yyyy').format(controller.selectedDate.value!)
                    : 'No seleccionada',
              )),
          trailing: const Icon(Icons.calendar_today),
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: DateTime.now(),
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 30)),
            );
            if (date != null) {
              controller.setSelectedDate(date);
              controller.checkAvailability(canchaId, date);
            }
          },
        ),
        const SizedBox(height: 16),
        Obx(() => controller.availableHours.isEmpty
            ? const Text('Selecciona una fecha para ver horarios disponibles')
            : ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: controller.availableHours.length,
                itemBuilder: (context, index) {
                  final hour = controller.availableHours[index];
                  return RadioListTile<String>(
                    title: Text(hour),
                    value: hour,
                    groupValue: controller.selectedHour.value,
                    onChanged: (value) => controller.setSelectedHour(value!),
                  );
                },
              )),
      ],
    );
  }
}

class _ConfirmationStep extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final BookingController controller = Get.find<BookingController>();

    return Obx(() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Fecha: ${DateFormat('dd/MM/yyyy').format(controller.selectedDate.value!)}',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              'Hora: ${controller.selectedHour.value}',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            const Text(
              'Duración: 1 hora',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              'Precio: \$1000',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ));
  }
}

class _PaymentStep extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final BookingController controller = Get.find<BookingController>();

    return Column(
      children: [
        const Text(
          'Selecciona el método de pago:',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ListTile(
          leading: Image.asset(
            'assets/mercadopago_logo.png',
            width: 40,
            height: 40,
          ),
          title: const Text('Mercado Pago'),
          subtitle: const Text('Paga con tarjeta o dinero en cuenta'),
          trailing: Radio<String>(
            value: 'mercadoPago',
            groupValue: controller.selectedPaymentMethod.value,
            onChanged: (value) => controller.setPaymentMethod(value!),
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () => controller.createBooking(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00CC44),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'Confirmar Reserva',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
} 