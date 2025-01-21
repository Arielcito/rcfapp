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
                if (court.imagenUrl != null)
                  Container(
                    height: 200,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      image: DecorationImage(
                        image: NetworkImage(court.imagenUrl!),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                SizedBox(height: 16),
                Text(
                  court.nombre,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                SizedBox(height: 8),
                if (court.tipo != null) ...[
                  Text(
                    'Tipo',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(court.tipo!),
                  SizedBox(height: 8),
                ],
                if (court.capacidadJugadores != null) ...[
                  Text(
                    'Capacidad',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text('${court.capacidadJugadores} jugadores'),
                  SizedBox(height: 8),
                ],
                if (court.precioPorHora != null) ...[
                  Text(
                    'Precio por Hora',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text('\$${court.precioPorHora!.toStringAsFixed(2)}'),
                  SizedBox(height: 8),
                ],
                if (court.tipoSuperficie != null) ...[
                  Text(
                    'Superficie',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(court.tipoSuperficie!),
                  SizedBox(height: 8),
                ],
                Text(
                  'Características',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (court.tieneIluminacion == true)
                      Chip(
                        label: Text('Iluminación'),
                        avatar: Icon(Icons.lightbulb),
                      ),
                    if (court.esTechada == true)
                      Chip(
                        label: Text('Techada'),
                        avatar: Icon(Icons.house),
                      ),
                  ],
                ),
                SizedBox(height: 16),
                if (court.equipamientoIncluido != null) ...[
                  Text(
                    'Equipamiento Incluido',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(court.equipamientoIncluido!),
                  SizedBox(height: 8),
                ],
                if (court.requiereSeña) ...[
                  Text(
                    'Seña Requerida',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text('\$${court.montoSeña.toStringAsFixed(2)}'),
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