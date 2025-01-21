import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/court/court_controller.dart';
import 'package:rcf_app/models/court/court_model.dart';

class CourtDetailsScreen extends GetView<CourtController> {
  @override
  Widget build(BuildContext context) {
    final String courtId = Get.parameters['id'] ?? '';

    return Scaffold(
      appBar: AppBar(
        title: Text('Detalles de la Cancha'),
        actions: [
          IconButton(
            icon: Icon(Icons.edit),
            onPressed: () => Get.toNamed('/courts/$courtId/edit'),
          ),
        ],
      ),
      body: FutureBuilder<CourtModel?>(
        future: controller.getCourt(courtId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error al cargar los detalles'));
          }

          final court = snapshot.data;
          if (court == null) {
            return Center(child: Text('No se encontró la cancha'));
          }

          return SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (court.imageUrl != null)
                  Container(
                    height: 200,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      image: DecorationImage(
                        image: NetworkImage(court.imageUrl!),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                SizedBox(height: 16),
                Text(
                  court.name,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                SizedBox(height: 8),
                if (court.sport != null) ...[
                  Text(
                    'Tipo',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(court.sport!),
                  SizedBox(height: 8),
                ],
                if (court.description != null) ...[
                  Text(
                    'Descripción',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(court.description!),
                  SizedBox(height: 8),
                ],
                if (court.pricePerHour != null) ...[
                  Text(
                    'Precio por Hora',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text('\$${court.pricePerHour!.toStringAsFixed(2)}'),
                  SizedBox(height: 8),
                ],
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (court.isIndoor)
                        ListTile(
                          leading: Icon(Icons.home),
                          title: Text('Cancha Techada'),
                        ),
                      if (!court.isIndoor)
                        ListTile(
                          leading: Icon(Icons.wb_sunny),
                          title: Text('Cancha al Aire Libre'),
                        ),
                    ],
                  ),
                ),
                Text(
                  'Características',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (court.hasLighting)
                      Chip(
                        label: Text('Iluminación'),
                        avatar: Icon(Icons.lightbulb),
                      ),
                    if (court.isRoofed)
                      Chip(
                        label: Text('Techada'),
                        avatar: Icon(Icons.house),
                      ),
                  ],
                ),
                SizedBox(height: 16),
                if (court.includedEquipment != null) ...[
                  Text(
                    'Equipamiento Incluido',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(court.includedEquipment!),
                  SizedBox(height: 8),
                ],
                if (court.requiresDeposit && court.depositAmount != null) ...[
                  Text(
                    'Seña Requerida',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text('\$${court.depositAmount!.toStringAsFixed(2)}'),
                  SizedBox(height: 8),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
} 