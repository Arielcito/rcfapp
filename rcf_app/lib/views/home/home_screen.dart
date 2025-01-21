import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../controllers/home/home_controller.dart';
import '../../models/court/court_model.dart';

class HomeScreen extends StatelessWidget {
  final HomeController controller = Get.put(HomeController());

  HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Canchas Disponibles'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => Get.toNamed('/profile'),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilters(context),
          const SizedBox(height: 16),
          Expanded(
            child: _buildCourtsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Selector de fecha
          InkWell(
            onTap: () => _selectDate(context),
            child: Obx(() {
              final formattedDate = DateFormat('dd/MM/yyyy').format(controller.selectedDate.value);
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today),
                    const SizedBox(width: 8),
                    Text('Fecha: $formattedDate'),
                  ],
                ),
              );
            }),
          ),
          const SizedBox(height: 16),
          // Selector de horario
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => _selectTime(context, true),
                  child: Obx(() {
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.access_time),
                          const SizedBox(width: 8),
                          Text(controller.selectedStartTime.value.isEmpty
                              ? 'Desde'
                              : controller.selectedStartTime.value),
                        ],
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: InkWell(
                  onTap: () => _selectTime(context, false),
                  child: Obx(() {
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.access_time),
                          const SizedBox(width: 8),
                          Text(controller.selectedEndTime.value.isEmpty
                              ? 'Hasta'
                              : controller.selectedEndTime.value),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCourtsList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }

      if (controller.error.value.isNotEmpty) {
        return Center(
          child: Text(
            controller.error.value,
            style: const TextStyle(color: Colors.red),
          ),
        );
      }

      if (controller.courts.isEmpty) {
        return const Center(
          child: Text('No hay canchas disponibles para los filtros seleccionados'),
        );
      }

      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: controller.courts.length,
        itemBuilder: (context, index) {
          final court = controller.courts[index];
          return _buildCourtCard(court);
        },
      );
    });
  }

  Widget _buildCourtCard(CourtModel court) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (court.imageUrl != null)
            Image.network(
              court.imageUrl!,
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  court.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text('Deporte: ${court.sport}'),
                Text('Precio por hora: \$${court.pricePerHour}'),
                Text('Tipo: ${court.isIndoor ? 'Cubierta' : 'Al aire libre'}'),
                if (court.description != null) ...[
                  const SizedBox(height: 8),
                  Text(court.description!),
                ],
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => Get.toNamed('/court/${court.id}'),
                  child: const Text('Ver Disponibilidad'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: controller.selectedDate.value,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      controller.setDate(picked);
    }
  }

  Future<void> _selectTime(BuildContext context, bool isStartTime) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (picked != null) {
      final time = '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      if (isStartTime) {
        controller.setTimeRange(time, controller.selectedEndTime.value);
      } else {
        controller.setTimeRange(controller.selectedStartTime.value, time);
      }
    }
  }
} 