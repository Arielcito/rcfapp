import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rcf_app/controllers/court/court_controller.dart';
import 'package:rcf_app/models/court/court_model.dart';

class CourtFormScreen extends GetView<CourtController> {
  final bool isEditing;
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _tipoController = TextEditingController();
  final _capacidadController = TextEditingController();
  final _longitudController = TextEditingController();
  final _anchoController = TextEditingController();
  final _superficieController = TextEditingController();
  final _precioController = TextEditingController();
  final _equipamientoController = TextEditingController();
  final _imagenUrlController = TextEditingController();
  final _montosenaController = TextEditingController();
  final _tieneIluminacion = false.obs;
  final _esTechada = false.obs;
  final _requiereSeña = false.obs;

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
                controller: _nombreController,
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
                controller: _tipoController,
                decoration: InputDecoration(labelText: 'Tipo'),
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _capacidadController,
                decoration: InputDecoration(labelText: 'Capacidad de Jugadores'),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _longitudController,
                      decoration: InputDecoration(labelText: 'Longitud'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _anchoController,
                      decoration: InputDecoration(labelText: 'Ancho'),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _superficieController,
                decoration: InputDecoration(labelText: 'Tipo de Superficie'),
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _precioController,
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
                controller: _equipamientoController,
                decoration: InputDecoration(labelText: 'Equipamiento Incluido'),
                maxLines: 3,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _imagenUrlController,
                decoration: InputDecoration(labelText: 'URL de la Imagen'),
              ),
              SizedBox(height: 16),
              Obx(() => CheckboxListTile(
                    title: Text('Tiene Iluminación'),
                    value: _tieneIluminacion.value,
                    onChanged: (value) => _tieneIluminacion.value = value ?? false,
                  )),
              Obx(() => CheckboxListTile(
                    title: Text('Es Techada'),
                    value: _esTechada.value,
                    onChanged: (value) => _esTechada.value = value ?? false,
                  )),
              Obx(() => CheckboxListTile(
                    title: Text('Requiere Seña'),
                    value: _requiereSeña.value,
                    onChanged: (value) => _requiereSeña.value = value ?? false,
                  )),
              if (_requiereSeña.value) ...[
                SizedBox(height: 16),
                TextFormField(
                  controller: _montosenaController,
                  decoration: InputDecoration(labelText: 'Monto de Seña'),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (_requiereSeña.value && (value == null || value.isEmpty)) {
                      return 'Por favor ingrese el monto de la seña';
                    }
                    return null;
                  },
                ),
              ],
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
      _nombreController.text = court.nombre;
      _tipoController.text = court.tipo ?? '';
      _capacidadController.text = court.capacidadJugadores?.toString() ?? '';
      _longitudController.text = court.longitud ?? '';
      _anchoController.text = court.ancho ?? '';
      _superficieController.text = court.tipoSuperficie ?? '';
      _precioController.text = court.precioPorHora?.toString() ?? '';
      _equipamientoController.text = court.equipamientoIncluido ?? '';
      _imagenUrlController.text = court.imagenUrl ?? '';
      _tieneIluminacion.value = court.tieneIluminacion ?? false;
      _esTechada.value = court.esTechada ?? false;
      _requiereSeña.value = court.requiereSeña;
      _montosenaController.text = court.montoSeña.toString();
    }
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    final court = CourtModel(
      id: isEditing ? Get.parameters['id']! : '',
      predioId: Get.parameters['predioId'] ?? '',
      nombre: _nombreController.text,
      tipo: _tipoController.text.isEmpty ? null : _tipoController.text,
      capacidadJugadores: int.tryParse(_capacidadController.text),
      longitud: _longitudController.text.isEmpty ? null : _longitudController.text,
      ancho: _anchoController.text.isEmpty ? null : _anchoController.text,
      tipoSuperficie: _superficieController.text.isEmpty ? null : _superficieController.text,
      tieneIluminacion: _tieneIluminacion.value,
      esTechada: _esTechada.value,
      precioPorHora: double.tryParse(_precioController.text),
      estado: 'Disponible',
      equipamientoIncluido: _equipamientoController.text.isEmpty ? null : _equipamientoController.text,
      imagenUrl: _imagenUrlController.text.isEmpty ? null : _imagenUrlController.text,
      requiereSeña: _requiereSeña.value,
      montoSeña: double.tryParse(_montosenaController.text) ?? 0,
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