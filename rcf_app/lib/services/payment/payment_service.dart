import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class PaymentService {
  static const String _baseUrl = 'https://api.mercadopago.com';
  final String _accessToken = dotenv.env['MERCADO_PAGO_ACCESS_TOKEN'] ?? '';

  Future<Map<String, dynamic>> createPaymentPreference({
    required String title,
    required String description,
    required double amount,
    required String bookingId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/checkout/preferences'),
        headers: {
          'Authorization': 'Bearer $_accessToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'items': [
            {
              'title': title,
              'description': description,
              'picture_url': 'https://www.megafutbol.com.ar/fotos/foto119.jpg',
              'category_id': 'sports',
              'quantity': 1,
              'currency_id': 'ARS',
              'unit_price': amount,
            }
          ],
          'external_reference': bookingId,
          'back_urls': {
            'success': 'rcfapp://payment/success',
            'failure': 'rcfapp://payment/failure',
            'pending': 'rcfapp://payment/pending',
          },
          'notification_url': dotenv.env['MERCADO_PAGO_WEBHOOK_URL'],
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al crear preferencia de pago: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error al crear preferencia de pago: $e');
    }
  }

  Future<Map<String, dynamic>> getPaymentStatus(String paymentId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/v1/payments/$paymentId'),
        headers: {
          'Authorization': 'Bearer $_accessToken',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Error al obtener estado del pago: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error al obtener estado del pago: $e');
    }
  }
} 