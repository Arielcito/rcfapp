import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/property/property_controller.dart';
import '../../models/property/property_model.dart';

class PropertySearchScreen extends GetView<PropertyController> {
  PropertySearchScreen({Key? key}) : super(key: key) {
    controller.loadProperties();
  }

  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Buscar Predios'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              focusNode: _searchFocus,
              decoration: InputDecoration(
                hintText: 'Buscar por nombre o dirección',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: Obx(() => _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _searchFocus.unfocus();
                          controller.searchProperties('');
                        },
                      )
                    : const SizedBox.shrink()),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onChanged: (value) => controller.searchProperties(value),
            ),
          ),
          Expanded(
            child: Obx(() {
              if (controller.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              if (controller.error.isNotEmpty) {
                return Center(
                  child: Text(
                    controller.error,
                    style: const TextStyle(color: Colors.red),
                  ),
                );
              }

              final properties = _searchController.text.isEmpty
                  ? controller.properties
                  : controller.searchResults;

              if (properties.isEmpty) {
                return const Center(
                  child: Text('No se encontraron predios'),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16.0),
                itemCount: properties.length,
                itemBuilder: (context, index) {
                  return _buildPropertyCard(context, properties[index]);
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildPropertyCard(BuildContext context, PropertyModel property) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      child: InkWell(
        onTap: () {
          Get.toNamed(
            '/property-details',
            arguments: property.id,
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (property.imagenUrl != null)
              Image.network(
                property.imagenUrl!,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    property.nombre,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    property.direccion,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.local_parking,
                        size: 20,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                      const SizedBox(width: 4),
                      Text('${property.capacidadEstacionamiento} lugares'),
                      const SizedBox(width: 16),
                      Icon(
                        Icons.access_time,
                        size: 20,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                      const SizedBox(width: 4),
                      Text('${property.horarioApertura} - ${property.horarioCierre}'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
} 