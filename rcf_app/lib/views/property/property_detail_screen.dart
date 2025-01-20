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
        title: Text(property.name),
        actions: [
          Obx(() => IconButton(
                icon: Icon(
                  controller.isLoading.value
                      ? Icons.hourglass_empty
                      : Icons.favorite,
                  color: Colors.red,
                ),
                onPressed: () => controller.toggleFavorite(
                  Get.find<String>('userId'),
                  property.id,
                ),
              )),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildImageGallery(),
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

  Widget _buildImageGallery() {
    return Container(
      height: 250,
      child: PageView.builder(
        itemCount: property.images.length,
        itemBuilder: (context, index) {
          return CachedNetworkImage(
            imageUrl: property.images[index],
            fit: BoxFit.cover,
            placeholder: (context, url) => Center(
              child: CircularProgressIndicator(),
            ),
            errorWidget: (context, url, error) => Icon(Icons.error),
          );
        },
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
            property.name,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Text(
            property.description,
            style: TextStyle(fontSize: 16),
          ),
          SizedBox(height: 16),
          _buildInfoRow(Icons.location_on, property.address),
          _buildInfoRow(Icons.attach_money, 'Precio por hora: \$${property.pricePerHour}'),
          _buildInfoRow(Icons.sports_soccer, 'Tipo: ${property.type}'),
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
    return Container(
      height: 200,
      child: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: LatLng(
            property.latitude,
            property.longitude,
          ),
          zoom: 15,
        ),
        markers: {
          Marker(
            markerId: MarkerId(property.id),
            position: LatLng(
              property.latitude,
              property.longitude,
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
          _buildContactButton(
            icon: Icons.phone,
            text: 'Llamar',
            onTap: () => _launchUrl('tel:${property.phone}'),
          ),
          _buildContactButton(
            icon: FontAwesomeIcons.whatsapp,
            text: 'WhatsApp',
            onTap: () => _launchWhatsApp(property.phone),
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
        message: WhatsAppUtils.getPropertyInquiryMessage(property.name),
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