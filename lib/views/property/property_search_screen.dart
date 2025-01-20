import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/property/property_controller.dart';
import '../../models/property/property_model.dart';

class PropertySearchScreen extends StatefulWidget {
  const PropertySearchScreen({Key? key}) : super(key: key);

  @override
  State<PropertySearchScreen> createState() => _PropertySearchScreenState();
}

class _PropertySearchScreenState extends State<PropertySearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    // Cargar todos los predios al inicio
    Provider.of<PropertyController>(context, listen: false).loadProperties();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

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
                hintText: 'Buscar por título o dirección',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _searchFocus.unfocus();
                          Provider.of<PropertyController>(context, listen: false)
                              .searchProperties('');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onChanged: (value) {
                Provider.of<PropertyController>(context, listen: false)
                    .searchProperties(value);
              },
            ),
          ),
          Expanded(
            child: Consumer<PropertyController>(
              builder: (context, controller, child) {
                if (controller.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (controller.error != null) {
                  return Center(
                    child: Text(
                      controller.error!,
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
                    return _buildPropertyCard(properties[index]);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPropertyCard(PropertyModel property) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            '/property-details',
            arguments: property.id,
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (property.images.isNotEmpty)
              Image.network(
                property.images.first,
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
                    property.title,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    property.address,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.square_foot,
                        size: 20,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                      const SizedBox(width: 4),
                      Text('${property.area} m²'),
                      const SizedBox(width: 16),
                      Icon(
                        Icons.attach_money,
                        size: 20,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                      const SizedBox(width: 4),
                      Text('\$${property.price.toStringAsFixed(2)}'),
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