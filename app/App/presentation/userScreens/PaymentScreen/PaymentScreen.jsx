import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import React, { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useRoute } from "@react-navigation/native";
import MercadoPagoImage from "../../assets/images/mercado-pago.png";
import CreditCardImage from "../../assets/images/credit-card.png";
import handleIntegrationMP from "../../../infraestructure/config/MercadoPagoConfig";
import { openBrowserAsync } from "expo-web-browser";
import moment from "moment";
import Colors from "../../../infraestructure/utils/Colors";
import { useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import CashImage from "../../assets/images/cash.png";
import { api } from "../../../infraestructure/api/api";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

const showMessage = (message) => {
  if (Platform.OS === 'ios') {
    Alert.alert('Mensaje', message);
  } else {
    ToastAndroid.show(message, ToastAndroid.LONG);
  }
};

export default function PaymentScreen() {
  const { currentUser } = useCurrentUser();
  const { params } = useRoute();
  const date = params.selectedDate;
  const selectedTime = params.selectedTime;
  const cancha = params.appointmentData.cancha;
  const place = params.appointmentData.place;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("efectivo");
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const navigator = useNavigation();
  const formatDate = moment(date).format("YYYY-MM-DD");

  useEffect(() => {
    const timeMoment = moment(selectedTime, "HH:mm");
    const newTimeMoment = timeMoment.add(1, "hour");
    const newTime = newTimeMoment.format("HH:mm");
    setEndTime(newTime);
  }, [selectedTime]);

  const bookAppointment = async (paymentMethod) => {
    setLoading(true);

    try {
      if (!currentUser?.id) {
        throw new Error('No se encontró el ID del usuario');
      }

      const formattedDate = moment(date).format("YYYY-MM-DD");
      const fechaHora = moment(`${formattedDate} ${selectedTime}`, "YYYY-MM-DD HH:mm").toISOString();

      const { data: disponibilidadData } = await api.post('/reservas/check', {
        canchaId: cancha.id,
        fechaHora: fechaHora,
        duracion: 60,
      });

      if (!disponibilidadData.success || !disponibilidadData.data.disponible) {
        throw new Error('El horario seleccionado ya no está disponible');
      }

      const montoAPagar = cancha.requiereSeña ? cancha.montoSeña : cancha.precioPorHora;

      const reservaData = {
        canchaId: cancha.id,
        userId: currentUser.id,
        fechaHora: fechaHora,
        duracion: 60,
        precioTotal: montoAPagar,
        metodoPago: paymentMethod,
        estadoPago: 'PENDIENTE',
        notasAdicionales: `Reserva para ${cancha.nombre}`
      };

      const { data: createdReserva } = await api.post('/reservas', reservaData);

      if (!createdReserva) {
        throw new Error('Error al crear la reserva');
      }

      navigator.navigate("successScreen", { appointmentData: createdReserva });

    } catch (error) {
      console.error("Error en la reserva:", error);
      const errorMessage = error.response?.data?.error || error.message || "Error al procesar la reserva";
      showMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      switch (selectedPaymentMethod) {
        case "Mercado Pago": {
          const data = await handleIntegrationMP(cancha);
          if (!data) {
            throw new Error("Error al procesar pago con Mercado Pago");
          }
          const response = await openBrowserAsync(data);
          
          if (response.type === "cancel") {
            throw new Error("Pago cancelado por el usuario");
          }
          await bookAppointment("Mercado Pago");
          break;
        }
        case "efectivo": {
          await bookAppointment("Efectivo");
          break;
        }
        case "tarjeta": {
          if (!cardNumber || !cardName || !expiryDate || !cvv) {
            throw new Error("Por favor complete todos los campos de la tarjeta");
          }
          await bookAppointment("Tarjeta");
          break;
        }
        default:
          throw new Error("Método de pago no válido");
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      showMessage(error.message);
    }
  };

  const renderCreditCardForm = () => {
    if (selectedPaymentMethod !== 'tarjeta') return null;

    return (
      <View style={styles.creditCardForm}>
        <Text style={styles.formLabel}>Número de Tarjeta</Text>
        <TextInput
          style={styles.formInput}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={16}
        />

        <Text style={styles.formLabel}>Nombre en la Tarjeta</Text>
        <TextInput
          style={styles.formInput}
          placeholder="NOMBRE APELLIDO"
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="characters"
        />

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <Text style={styles.formLabel}>Fecha de Vencimiento</Text>
            <TextInput
              style={styles.formInput}
              placeholder="MM/AA"
              value={expiryDate}
              onChangeText={setExpiryDate}
              maxLength={5}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.formLabel}>CVV</Text>
            <TextInput
              style={styles.formInput}
              placeholder="123"
              value={cvv}
              onChangeText={setCvv}
              maxLength={3}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Confirma tu reserva</Text>
      <Text style={styles.subHeading}>{cancha.nombre}</Text>
      
      <View style={styles.appointmentCardContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Horario y Fecha</Text>
          <View style={styles.scheduleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={24} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.scheduleText}>
              {selectedTime}hs - {endTime}hs
            </Text>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={24} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.scheduleText}>{formatDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>Detalles de la Cancha</Text>
        <View style={styles.billDetailsContainer}>
          {cancha.tipo && (
            <View style={styles.billRow}>
              <Text style={styles.billDetailText}>Tipo:</Text>
              <Text style={styles.billDetailAmount}>{cancha.tipo}</Text>
            </View>
          )}
          {cancha.tipoSuperficie && (
            <View style={styles.billRow}>
              <Text style={styles.billDetailText}>Superficie:</Text>
              <Text style={styles.billDetailAmount}>{cancha.tipoSuperficie}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billDetailText}>Dimensiones:</Text>
            <Text style={styles.billDetailAmount}>{cancha.longitud}m x {cancha.ancho}m</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>Pago</Text>
        <View style={styles.billDetailsContainer}>
          <View style={styles.billRow}>
            <Text style={styles.billDetailText}>Costo por hora:</Text>
            <Text style={styles.billDetailAmount}>${cancha.precioPorHora}</Text>
          </View>
          {cancha.requiereSeña && (
            <View style={styles.billRow}>
              <Text style={styles.billDetailText}>Seña requerida:</Text>
              <Text style={styles.billDetailAmount}>${cancha.montoSeña}</Text>
            </View>
          )}
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total a pagar:</Text>
            <Text style={styles.totalAmount}>
              ${cancha.requiereSeña ? cancha.montoSeña : cancha.precioPorHora}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.heading}>Método de Pago</Text>
      <View style={styles.paymentMethodContainer}>
        <TouchableOpacity
          onPress={() => setSelectedPaymentMethod("efectivo")}
          style={[
            styles.paymentButton,
            selectedPaymentMethod === "efectivo" && {
              borderColor: Colors.PRIMARY,
            },
          ]}
        >
          <Ionicons name="cash-outline" size={30} color={Colors.PRIMARY} />
          <Text style={styles.paymentMethodText}>Efectivo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedPaymentMethod("tarjeta")}
          style={[
            styles.paymentButton,
            selectedPaymentMethod === "tarjeta" && {
              borderColor: Colors.PRIMARY,
            },
          ]}
        >
          <Image source={CreditCardImage} style={styles.paymentImage} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedPaymentMethod("Mercado Pago")}
          style={[
            styles.paymentButton,
            selectedPaymentMethod === "Mercado Pago" && {
              borderColor: Colors.PRIMARY,
            },
          ]}
        >
          <Image source={MercadoPagoImage} style={styles.paymentImage} />
        </TouchableOpacity>
      </View>

      {renderCreditCardForm()}

      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading}
          style={styles.reserveButton}
        >
          {!loading ? (
            <Text style={styles.reserveButtonText}>Reservar</Text>
          ) : (
            <ActivityIndicator color={Colors.WHITE} />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  heading: {
    fontSize: 24,
    fontFamily: "montserrat-medium",
    color: "#003366",
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
    marginTop: 20,
  },
  subHeading: {
    color: Colors.PRIMARY,
    fontSize: 18,
    fontFamily: "montserrat-medium",
    marginBottom: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: "montserrat-medium",
    color: "#003366",
    marginBottom: 10,
  },
  scheduleContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleText: {
    fontSize: 16,
    fontFamily: "montserrat",
    color: "#000",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  billDetailsContainer: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billDetailText: {
    fontSize: 16,
    color: Colors.GRAY,
    fontFamily: "montserrat",
  },
  billDetailAmount: {
    fontSize: 16,
    color: Colors.BLACK,
    fontFamily: "montserrat-medium",
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
    paddingTop: 8,
  },
  totalText: {
    fontSize: 18,
    color: Colors.BLACK,
    fontFamily: "montserrat-medium",
  },
  totalAmount: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontFamily: "montserrat-bold",
  },
  paymentButton: {
    borderWidth: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    width: width * 0.28,
    margin: 5,
    height: 80,
  },
  paymentMethodText: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: "montserrat-medium",
    color: Colors.BLACK,
  },
  paymentImage: {
    width: 60,
    height: 40,
    resizeMode: 'contain',
  },
  creditCardForm: {
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  formLabel: {
    fontSize: 14,
    color: Colors.GRAY,
    fontFamily: "montserrat-medium",
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "montserrat",
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  reserveButton: {
    padding: 13,
    backgroundColor: Colors.PRIMARY,
    margin: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reserveButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "montserrat-medium",
    fontSize: 17,
  },
});
