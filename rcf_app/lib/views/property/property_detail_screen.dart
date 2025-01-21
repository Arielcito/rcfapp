import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:rcf_app/controllers/property/favorite_controller.dart';
import 'package:rcf_app/models/property/property_model.dart';
import 'package:rcf_app/utils/whatsapp_utils.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class PropertyDetailScreen extends GetView<FavoriteController> {
  final PropertyModel property = Get.arguments;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(property.nombre),
        actions: [
          Obx(() => IconButton(
                icon: Icon(
                  controller.isLoading.value
                      ? Icons.hourglass_empty
                      : Icons.favorite,
                  color: Colors.red,
                ),
                onPressed: () => controller.toggleFavorite(property.id),
              )),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (property.imagenUrl != null) _buildImage(),
            _buildPropertyInfo(),
            _buildLocationMap(),
            _buildContactInfo(),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Get.toNamed(
          '/booking/create',
          arguments: property,
        ),
        label: Text('Reservar Ahora'),
        icon: Icon(Icons.calendar_today),
      ),
    );
  }

  Widget _buildImage() {
    return Container(
      height: 250,
      width: double.infinity,
      child: CachedNetworkImage(
        imageUrl: property.imagenUrl!,
        fit: BoxFit.cover,
        placeholder: (context, url) => Center(
          child: CircularProgressIndicator(),
        ),
        errorWidget: (context, url, error) => Icon(Icons.error),
      ),
    );
  }

  Widget _buildPropertyInfo() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            property.nombre,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          _buildInfoRow(Icons.location_on, '${property.direccion}, ${property.ciudad}, ${property.provincia}'),
          if (property.horarioApertura != null && property.horarioCierre != null)
            _buildInfoRow(Icons.access_time, 'Horario: ${property.horarioApertura} - ${property.horarioCierre}'),
          if (property.capacidadEstacionamiento != null)
            _buildInfoRow(Icons.local_parking, 'Estacionamiento: ${property.capacidadEstacionamiento} lugares'),
          if (property.tieneVestuarios == true)
            _buildInfoRow(Icons.wc, 'Vestuarios disponibles'),
          if (property.tieneCafeteria == true)
            _buildInfoRow(Icons.restaurant, 'Cafetería disponible'),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 20),
          SizedBox(width: 8),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }

  Widget _buildLocationMap() {
    if (property.latitud == null || property.longitud == null) {
      return SizedBox.shrink();
    }

    return Container(
      height: 200,
      child: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: LatLng(
            property.latitud!,
            property.longitud!,
          ),
          zoom: 15,
        ),
        markers: {
          Marker(
            markerId: MarkerId(property.id),
            position: LatLng(
              property.latitud!,
              property.longitud!,
            ),
          ),
        },
      ),
    );
  }

  Widget _buildContactInfo() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Información de Contacto',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          if (property.telefono != null)
            _buildContactButton(
              icon: Icons.phone,
              text: 'Llamar',
              onTap: () => _launchUrl('tel:${property.telefono}'),
            ),
          if (property.telefono != null)
            _buildContactButton(
              icon: FontAwesomeIcons.whatsapp,
              text: 'WhatsApp',
              onTap: () => _launchWhatsApp(property.telefono!),
            ),
          if (property.email != null)
            _buildContactButton(
              icon: Icons.email,
              text: 'Enviar Email',
              onTap: () => _launchUrl('mailto:${property.email}'),
            ),
        ],
      ),
    );
  }

  Widget _buildContactButton({
    required IconData icon,
    required String text,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(text),
      onTap: onTap,
    );
  }

  Future<void> _launchUrl(String url) async {
    if (await canLaunch(url)) {
      await launch(url);
    }
  }

  Future<void> _launchWhatsApp(String phone) async {
    try {
      await WhatsAppUtils.launchWhatsApp(
        phone: phone,
        message: WhatsAppUtils.getPropertyInquiryMessage(property.nombre),
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'No se pudo abrir WhatsApp',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
} 