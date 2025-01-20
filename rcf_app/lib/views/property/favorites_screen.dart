import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/property/favorite_controller.dart';
import 'package:rcf_app/models/property/favorite_model.dart';
import 'package:rcf_app/models/property/property_model.dart';
import 'package:rcf_app/services/property/property_service.dart';
import 'package:cached_network_image/cached_network_image.dart';

class FavoritesScreen extends GetView<FavoriteController> {
  final PropertyService _propertyService = PropertyService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Mis Favoritos'),
      ),
      body: StreamBuilder<List<FavoriteModel>>(
        stream: controller.getFavorites(Get.find<String>('userId')),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text('Error al cargar los favoritos'),
            );
          }

          final favorites = snapshot.data ?? [];

          if (favorites.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.favorite_border,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No tienes predios favoritos',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: favorites.length,
            itemBuilder: (context, index) {
              final favorite = favorites[index];
              return _buildFavoriteItem(favorite);
            },
          );
        },
      ),
    );
  }

  Widget _buildFavoriteItem(FavoriteModel favorite) {
    return FutureBuilder<PropertyModel?>(
      future: _propertyService.getPropertyById(favorite.propertyId),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data == null) {
          return SizedBox.shrink();
        }

        final property = snapshot.data!;

        return Card(
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: property.images.first,
                width: 60,
                height: 60,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.grey[300],
                  child: Icon(Icons.image),
                ),
                errorWidget: (context, url, error) => Icon(Icons.error),
              ),
            ),
            title: Text(property.name),
            subtitle: Text(property.address),
            trailing: IconButton(
              icon: Icon(Icons.favorite, color: Colors.red),
              onPressed: () => controller.toggleFavorite(
                Get.find<String>('userId'),
                property.id,
              ),
            ),
            onTap: () => Get.toNamed(
              '/property/detail',
              arguments: property,
            ),
          ),
        );
      },
    );
  }
} 