import 'package:url_launcher/url_launcher.dart';
import 'package:rcf_app/models/booking/booking_model.dart';
import 'package:intl/intl.dart';

class WhatsAppUtils {
  static Future<void> launchWhatsApp({
    required String phone,
    required String message,
  }) async {
    final whatsappUrl = 'whatsapp://send?phone=$phone&text=${Uri.encodeComponent(message)}';
    
    if (await canLaunch(whatsappUrl)) {
      await launch(whatsappUrl);
    } else {
      throw Exception('No se pudo abrir WhatsApp');
    }
  }

  static String getBookingMessage(BookingModel booking) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final timeFormat = DateFormat('HH:mm');
    
    return '''
Hola, tengo una reserva para el día ${dateFormat.format(booking.date)} a las ${timeFormat.format(booking.startTime)}.

Detalles de la reserva:
- ID: ${booking.id}
- Fecha: ${dateFormat.format(booking.date)}
- Hora: ${timeFormat.format(booking.startTime)}
- Estado: ${_getBookingStatusText(booking.status)}
- Pago: ${_getPaymentStatusText(booking.paymentStatus)}

Gracias!
''';
  }

  static String getPropertyInquiryMessage(String propertyName) {
    return '''
Hola, me interesa el predio "$propertyName".
¿Podrían brindarme más información sobre disponibilidad y precios?

Gracias!
''';
  }

  static String getCancellationMessage(BookingModel booking) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final timeFormat = DateFormat('HH:mm');
    
    return '''
Hola, necesito cancelar mi reserva:

- ID: ${booking.id}
- Fecha: ${dateFormat.format(booking.date)}
- Hora: ${timeFormat.format(booking.startTime)}

¿Podrían confirmarme el proceso de cancelación?

Gracias!
''';
  }

  static String _getBookingStatusText(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending:
        return 'Pendiente';
      case BookingStatus.confirmed:
        return 'Confirmada';
      case BookingStatus.partial:
        return 'Seña pagada';
      case BookingStatus.cancelled:
        return 'Cancelada';
      case BookingStatus.completed:
        return 'Completada';
      default:
        return 'Desconocido';
    }
  }

  static String _getPaymentStatusText(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.pending:
        return 'Pendiente';
      case PaymentStatus.partial:
        return 'Seña pagada';
      case PaymentStatus.completed:
        return 'Completado';
      case PaymentStatus.refunded:
        return 'Reembolsado';
      default:
        return 'Desconocido';
    }
  }
} 