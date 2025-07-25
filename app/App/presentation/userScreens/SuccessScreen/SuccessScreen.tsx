import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Share,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Colors from "../../../infrastructure/utils/Colors";
import ButtonPrimary from "../../components/ButtonPrimary";
import WhatsappButton from "../../components/WhatsappButton";
import moment from "moment";
import "moment/locale/es";

// Define types for the appointment data
interface Cancha {
  nombre: string;
  tipo: string;
  tipoSuperficie: string;
  longitud: string;
  ancho: string;
}

interface Predio {
  telefono: string;
  nombre: string;
}

interface AppointmentData {
  data: {
    id?: string;
    cancha?: Partial<Cancha>;
    predio?: Partial<Predio>;
    fechaHora: Date;
    metodoPago: string;
    precioTotal: string;
    estadoPago: string;
    duracion: number;
  };
  success: boolean;
}

// Define the route params type
type SuccessScreenParams = {
  appointmentData: AppointmentData;
};

// Define the navigation type
type RootStackParamList = {
  myBookingStack: undefined;
};

type SuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'myBookingStack'>;
type SuccessScreenRouteProp = RouteProp<{ Success: SuccessScreenParams }, 'Success'>;

const SuccessScreen = () => {
  const route = useRoute<SuccessScreenRouteProp>();
  const { appointmentData } = route.params;
  const navigation = useNavigation<SuccessScreenNavigationProp>();
  moment.locale("es");
  console.log(appointmentData)
  // Datos por defecto en caso de que falten
  const defaultData = useMemo(() => ({
    data: {
      cancha: {
        nombre: "Cancha sin nombre",
        tipo: "Fútbol",
        tipoSuperficie: "Césped sintético",
        longitud: "25",
        ancho: "15",
      },
      predio: {
        telefono: "+54123456789",
        nombre: "Predio sin nombre"
      },
      fechaHora: new Date(),
      metodoPago: "Efectivo",
      precioTotal: "0",
      estadoPago: "PENDIENTE",
      duracion: 60
    },
    success: true
  }), []);

  // Combinar datos recibidos con datos por defecto
  const reserva = useMemo(() => ({
    ...defaultData.data,
    ...appointmentData.data,
    cancha: {
      ...defaultData.data.cancha,
      ...(appointmentData.data?.cancha || {})
    },
    predio: {
      ...defaultData.data.predio,
      ...(appointmentData.data?.predio || {})
    }
  }), [appointmentData, defaultData]);

  const formatDate = (date: Date | string) => {
    try {
      return moment(date).format("dddd, D [de] MMMM [de] YYYY");
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha no disponible";
    }
  };

  const formatTime = (date: Date | string) => {
    try {
      return moment(date).format("HH:mm");
    } catch (error) {
      console.error("Error formateando hora:", error);
      return "00:00";
    }
  };

  const getEndTime = (date: Date | string) => {
    try {
      return moment(date).add(reserva.duracion || 60, 'minutes').format("HH:mm");
    } catch (error) {
      console.error("Error calculando hora final:", error);
      return "00:00";
    }
  };

  const generarVoucher = async () => {
    try {
      const mensaje = `VOUCHER DE RESERVA - RCC App
---------------------------------------
Predio: ${reserva.predio.nombre || 'N/A'}
Cancha: ${reserva.cancha.nombre}
Tipo: ${reserva.cancha.tipo}
Superficie: ${reserva.cancha.tipoSuperficie}
Dimensiones: ${reserva.cancha.longitud}m x ${reserva.cancha.ancho}m
Fecha: ${formatDate(reserva.fechaHora)}
Hora: ${formatTime(reserva.fechaHora)}hs - ${getEndTime(reserva.fechaHora)}hs
Método de pago: ${reserva.metodoPago}
Monto a pagar: $${Number(reserva.precioTotal).toLocaleString()}
Estado de pago: ${reserva.estadoPago}
---------------------------------------
ID Reserva: ${appointmentData.data?.id || 'No disponible'}
Reserva realizada a través de RCC App
`;

      await Share.share({
        message: mensaje,
        title: "Voucher de Reserva - RCC App",
      });
    } catch (error) {
      console.error("Error al compartir voucher:", error);
      alert("Error al generar el voucher. Por favor intente nuevamente.");
    }
  };

  if (!appointmentData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.errorText}>Cargando datos de la reserva...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡FELICITACIONES!</Text>
        <Text style={styles.subtitle}>TU RESERVA ESTÁ PENDIENTE DE CONFIRMACIÓN</Text>
        <Text style={styles.pendingMessage}>El dueño del predio debe confirmar tu reserva. Te notificaremos cuando sea aceptada.</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>
              {reserva.cancha.nombre}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Tipo</Text>
              <Text style={styles.value}>{reserva.cancha.tipo}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Superficie</Text>
              <Text style={styles.value}>{reserva.cancha.tipoSuperficie}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Dimensiones</Text>
              <Text style={styles.value}>{reserva.cancha.longitud}m x {reserva.cancha.ancho}m</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>
                {formatDate(reserva.fechaHora)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Horario</Text>
              <Text style={styles.value}>
                {formatTime(reserva.fechaHora)}hs - {getEndTime(reserva.fechaHora)}hs
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Método de Pago</Text>
              <Text style={styles.value}>{reserva.metodoPago}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total</Text>
              <Text style={styles.value}>${Number(reserva.precioTotal).toLocaleString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#666"
              />
              <Text style={styles.infoText}>
                Estado: {reserva.estadoPago}
              </Text>
            </View>
          </View>
        </View>

        {reserva.metodoPago === "Efectivo" && (
          <TouchableOpacity style={styles.voucherButton} onPress={generarVoucher}>
            <Ionicons name="document-text-outline" size={24} color="#fff" />
            <Text style={styles.voucherButtonText}>Obtener Voucher</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonContainer}>
          <ButtonPrimary
            text="Ver agenda de reservas"
            onPress={() => navigation.navigate("myBookingStack")}
          />
        </View>
      </View>
      <View style={styles.whatsappButtonContainer}>
        <WhatsappButton 
          phoneNumber={reserva.predio.telefono} 
          message={`Hola! Acabo de reservar la cancha ${reserva.cancha.nombre} para el día ${formatDate(reserva.fechaHora)} a las ${formatTime(reserva.fechaHora)}hs. ¿Podrías confirmarme la reserva?`} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  pendingMessage: {
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: "center",
    marginTop: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
  },
  cardHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#666",
    fontSize: 16,
  },
  value: {
    color: "#333",
    fontSize: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    marginLeft: 8,
    color: "#666",
    flex: 1,
    fontSize: 16,
  },
  voucherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  voucherButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  whatsappButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 20, 
  },
});

export default SuccessScreen;
