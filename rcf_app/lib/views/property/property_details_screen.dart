import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../controllers/property/property_controller.dart';
import '../../models/property/property_model.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class PropertyDetailsScreen extends GetView<PropertyController> {
  PropertyDetailsScreen({Key? key}) : super(key: key) {
    final String propertyId = Get.arguments;
    _loadProperty(propertyId);
  }

  final RxBool _isLoading = true.obs;
  final Rx<PropertyModel?> _property = Rx<PropertyModel?>(null);

  Future<void> _loadProperty(String id) async {
    try {
      final loadedProperty = await controller.getProperty(id);
      _property.value = loadedProperty;
    } catch (e) {
      Get.snackbar(
        'Error',
        'No se pudo cargar el predio',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      _isLoading.value = false;
    }
  }

  Future<void> _launchUrl(String? url) async {
    if (url == null) return;
    
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      Get.snackbar(
        'Error',
        'No se pudo abrir el enlace',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> _launchWhatsApp(String phone, String message) async {
    final whatsappUrl = "whatsapp://send?phone=$phone&text=${Uri.encodeComponent(message)}";
    if (await canLaunch(whatsappUrl)) {
      await launch(whatsappUrl);
    } else {
      Get.snackbar(
        'Error',
        'No se pudo abrir WhatsApp',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Obx(() {
        if (_isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final property = _property.value;
        if (property == null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('No se encontró el predio'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => Get.back(),
                  child: const Text('Volver'),
                ),
              ],
            ),
          );
        }

        return CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 300,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                title: Text(property.nombre),
                background: property.imagenUrl != null
                    ? Image.network(
                        property.imagenUrl!,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        child: const Icon(Icons.home, size: 100),
                      ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildScheduleAndParking(property),
                    const SizedBox(height: 16),
                    _buildDescription(context, property),
                    const SizedBox(height: 16),
                    _buildLocation(context, property),
                    const SizedBox(height: 16),
                    _buildFeatures(context, property),
                    const SizedBox(height: 16),
                    _buildContactInfo(context, property),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (_property.value != null) {
            Get.toNamed(
              '/booking/create',
              arguments: _property.value,
            );
          }
        },
        icon: const Icon(Icons.calendar_today),
        label: const Text('Reservar'),
      ),
    );
  }

  Widget _buildScheduleAndParking(PropertyModel property) {
    return Row(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Icon(Icons.access_time, size: 32),
                  const SizedBox(height: 8),
                  Text(
                    '${property.horarioApertura} - ${property.horarioCierre}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const Text('Horario', style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
          ),
        ),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Icon(Icons.local_parking, size: 32),
                  const SizedBox(height: 8),
                  Text(
                    '${property.capacidadEstacionamiento}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const Text('Estacionamientos', style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDescription(BuildContext context, PropertyModel property) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Descripción', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Text(property.nombre),
      ],
    );
  }

  Widget _buildLocation(BuildContext context, PropertyModel property) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Ubicación', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(
          children: [
            const Icon(Icons.location_on),
            const SizedBox(width: 8),
            Expanded(
              child: Text('${property.direccion}, ${property.ciudad}, ${property.provincia}'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (property.latitud != null && property.longitud != null)
          SizedBox(
            height: 200,
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(property.latitud!, property.longitud!),
                zoom: 15,
              ),
              markers: {
                Marker(
                  markerId: MarkerId(property.id),
                  position: LatLng(property.latitud!, property.longitud!),
                  infoWindow: InfoWindow(title: property.nombre),
                ),
              },
            ),
          ),
      ],
    );
  }

  Widget _buildFeatures(BuildContext context, PropertyModel property) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Características', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            _buildFeatureItem(
              Icons.shower,
              'Vestuarios',
              property.tieneVestuarios ?? false,
            ),
            _buildFeatureItem(
              Icons.local_cafe,
              'Cafetería',
              property.tieneCafeteria ?? false,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFeatureItem(IconData icon, String text, bool available) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: available ? Colors.green.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 20,
            color: available ? Colors.green : Colors.grey,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: available ? Colors.green : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactInfo(BuildContext context, PropertyModel property) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Contacto', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        if (property.telefono != null && property.telefono!.isNotEmpty) ...[
          ListTile(
            leading: const Icon(Icons.phone),
            title: const Text('Llamar'),
            onTap: () => _launchUrl('tel:${property.telefono}'),
          ),
          ListTile(
            leading: const Icon(FontAwesomeIcons.whatsapp),
            title: const Text('WhatsApp'),
            onTap: () => _launchWhatsApp(
              property.telefono!,
              'Hola, me interesa el predio ${property.nombre}',
            ),
          ),
        ],
        if (property.email != null && property.email!.isNotEmpty)
          ListTile(
            leading: const Icon(Icons.email),
            title: Text('Correo: ${property.email}'),
            onTap: () => _launchUrl('mailto:${property.email!}'),
          ),
      ],
    );
  }
} 