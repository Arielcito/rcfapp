import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/court/court_controller.dart';
import 'package:rcf_app/models/court/court_model.dart';

class CourtListScreen extends GetView<CourtController> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Canchas'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => Get.toNamed('/courts/create'),
          ),
        ],
      ),
      body: Obx(
        () => controller.isLoading
            ? Center(child: CircularProgressIndicator())
            : controller.error.isNotEmpty
                ? Center(child: Text(controller.error))
                : ListView.builder(
                    itemCount: controller.courts.length,
                    itemBuilder: (context, index) {
                      final court = controller.courts[index];
                      return _buildCourtCard(court);
                    },
                  ),
      ),
    );
  }

  Widget _buildCourtCard(CourtModel court) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: court.imagenUrl != null
            ? CircleAvatar(
                backgroundImage: NetworkImage(court.imagenUrl!),
                backgroundColor: Colors.grey[200],
              )
            : CircleAvatar(
                child: Icon(Icons.sports_soccer),
                backgroundColor: Colors.grey[200],
              ),
        title: Text(court.nombre),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (court.tipo != null) Text(court.tipo!),
            if (court.precioPorHora != null)
              Text('\$${court.precioPorHora!.toStringAsFixed(2)} por hora'),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: Icon(Icons.edit),
              onPressed: () => Get.toNamed('/courts/${court.id}/edit'),
            ),
            IconButton(
              icon: Icon(Icons.delete),
              onPressed: () => _showDeleteDialog(court),
            ),
          ],
        ),
        onTap: () => Get.toNamed('/courts/${court.id}'),
      ),
    );
  }

  void _showDeleteDialog(CourtModel court) {
    Get.dialog(
      AlertDialog(
        title: Text('Eliminar Cancha'),
        content: Text('¿Estás seguro de que deseas eliminar esta cancha?'),
        actions: [
          TextButton(
            child: Text('Cancelar'),
            onPressed: () => Get.back(),
          ),
          TextButton(
            child: Text('Eliminar'),
            onPressed: () async {
              Get.back();
              final success = await controller.deleteCourt(court.id, court.predioId);
              if (success) {
                Get.snackbar(
                  'Éxito',
                  'La cancha ha sido eliminada',
                  snackPosition: SnackPosition.BOTTOM,
                );
              }
            },
          ),
        ],
      ),
    );
  }
} 