import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/court/court_controller.dart';
import 'package:rcf_app/models/court/court_model.dart';

class CourtFormScreen extends GetView<CourtController> {
  final bool isEditing;
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _sportController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _imageUrlController = TextEditingController();
  final _isIndoor = false.obs;

  CourtFormScreen({this.isEditing = false});

  @override
  Widget build(BuildContext context) {
    final String? courtId = Get.parameters['id'];

    if (isEditing && courtId != null) {
      _loadCourtData(courtId);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Editar Cancha' : 'Nueva Cancha'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(labelText: 'Nombre'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor ingrese un nombre';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _sportController,
                decoration: InputDecoration(labelText: 'Tipo'),
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(labelText: 'Descripción'),
                maxLines: 3,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _priceController,
                decoration: InputDecoration(labelText: 'Precio por Hora'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor ingrese un precio';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _imageUrlController,
                decoration: InputDecoration(labelText: 'URL de la Imagen'),
              ),
              SizedBox(height: 16),
              Obx(() => CheckboxListTile(
                    title: Text('Es Interior'),
                    value: _isIndoor.value,
                    onChanged: (value) => _isIndoor.value = value ?? false,
                  )),
              SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitForm,
                  child: Text(isEditing ? 'Guardar Cambios' : 'Crear Cancha'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _loadCourtData(String courtId) async {
    final court = await controller.getCourt(courtId);
    if (court != null) {
      _nameController.text = court.name;
      _sportController.text = court.sport ?? '';
      _descriptionController.text = court.description ?? '';
      _priceController.text = court.pricePerHour.toString();
      _imageUrlController.text = court.imageUrl ?? '';
      _isIndoor.value = court.isIndoor;
    }
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    final court = CourtModel(
      id: isEditing ? Get.parameters['id']! : '',
      propertyId: Get.parameters['propertyId'] ?? '',
      name: _nameController.text,
      sport: _sportController.text,
      description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
      pricePerHour: double.tryParse(_priceController.text) ?? 0,
      imageUrl: _imageUrlController.text.isEmpty ? null : _imageUrlController.text,
      isIndoor: _isIndoor.value,
      isActive: true,
      availableHours: [],
    );

    try {
      if (isEditing) {
        await controller.updateCourt(court.id, court);
        Get.snackbar(
          'Éxito',
          'Cancha actualizada correctamente',
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        await controller.createCourt(court);
        Get.snackbar(
          'Éxito',
          'Cancha creada correctamente',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
      Get.back();
    } catch (error) {
      Get.snackbar(
        'Error',
        'No se pudo ${isEditing ? 'actualizar' : 'crear'} la cancha',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
} 