import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/property/property_controller.dart';
import '../../models/property/property_model.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class PropertyDetailsScreen extends StatefulWidget {
  const PropertyDetailsScreen({Key? key}) : super(key: key);

  @override
  State<PropertyDetailsScreen> createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends State<PropertyDetailsScreen> {
  late String propertyId;
  PropertyModel? property;
  bool isLoading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    propertyId = ModalRoute.of(context)!.settings.arguments as String;
    _loadProperty();
  }

  Future<void> _loadProperty() async {
    final propertyController = Provider.of<PropertyController>(context, listen: false);
    final loadedProperty = await propertyController.getProperty(propertyId);
    
    if (mounted) {
      setState(() {
        property = loadedProperty;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (property == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(
          child: Text('No se encontró el predio'),
        ),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(property!.title),
              background: property!.images.isNotEmpty
                  ? PageView.builder(
                      itemCount: property!.images.length,
                      itemBuilder: (context, index) {
                        return Image.network(
                          property!.images[index],
                          fit: BoxFit.cover,
                        );
                      },
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
                  _buildPriceAndArea(),
                  const SizedBox(height: 16),
                  _buildDescription(),
                  const SizedBox(height: 16),
                  _buildLocation(),
                  const SizedBox(height: 16),
                  _buildFeatures(),
                  const SizedBox(height: 16),
                  _buildMap(),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: Implementar lógica de reserva
        },
        icon: const Icon(Icons.calendar_today),
        label: const Text('Reservar'),
      ),
    );
  }

  Widget _buildPriceAndArea() {
    return Row(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Icon(Icons.attach_money, size: 32),
                  const SizedBox(height: 8),
                  Text(
                    '\$${property!.price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text('Precio por hora', style: Theme.of(context).textTheme.bodySmall),
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
                  const Icon(Icons.square_foot, size: 32),
                  const SizedBox(height: 8),
                  Text(
                    '${property!.area} m²',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text('Área', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDescription() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Descripción', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Text(property!.description),
      ],
    );
  }

  Widget _buildLocation() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Ubicación', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Row(
          children: [
            const Icon(Icons.location_on),
            const SizedBox(width: 8),
            Expanded(child: Text(property!.address)),
          ],
        ),
      ],
    );
  }

  Widget _buildFeatures() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Características', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: property!.features.entries.map((feature) {
            return Chip(
              label: Text('${feature.key}: ${feature.value}'),
              backgroundColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildMap() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Mapa', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        SizedBox(
          height: 200,
          child: GoogleMap(
            initialCameraPosition: CameraPosition(
              target: LatLng(
                property!.location.latitude,
                property!.location.longitude,
              ),
              zoom: 15,
            ),
            markers: {
              Marker(
                markerId: MarkerId(property!.id),
                position: LatLng(
                  property!.location.latitude,
                  property!.location.longitude,
                ),
                infoWindow: InfoWindow(title: property!.title),
              ),
            },
          ),
        ),
      ],
    );
  }
} 