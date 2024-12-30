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
import { CurrentUserContext } from "../../../application/context/CurrentUserContext";

const { width } = Dimensions.get("window");

const API_BASE_URL = 'http://tu-api-url/api';

const showMessage = (message) => {
  if (Platform.OS === 'ios') {
    Alert.alert('Mensaje', message);
  } else {
    ToastAndroid.show(message, ToastAndroid.LONG);
  }
};

export default function PaymentScreen() {
  const { user } = useContext(CurrentUserContext);
  const { params } = useRoute();
  const date = params.selectedDate.selectedDate;
  const selectedTime = params.selectedTime.selectedTime;
  const place = params.appointmentData;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("efectivo");
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [montoSeña, setMontoSeña] = useState(0);
  console.log(params)
  console.log(date)
  console.log(selectedTime)
  const navigator = useNavigation();
  const formatDate = moment(date).format("YYYY-MM-DD");
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const getUserToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    };
    getUserToken();
  }, []);

  useEffect(() => {
    console.log('PaymentScreen montado - Usuario actual:', user);
  }, [user]);

  useEffect(() => {
    if (place?.place?.precio) {
      setTotalAmount(place.place.precio);
      if (place.place.requiereSeña) {
        setMontoSeña(place.place.montoSeña);
      }
    }
  }, [place]);

  const bookAppointment = async (paymentMethod) => {
    setLoading(true);

    try {
      console.log('Usuario actual:', user);
      console.log('ID del usuario:', user?.id);

      const formattedDate = moment(date).format("YYYY-MM-DD");
      const fechaHora = moment(`${formattedDate} ${selectedTime}`, "YYYY-MM-DD HH:mm").toISOString();

      // Verificamos disponibilidad
      const { data: disponibilidadData } = await api.post('/reservas/check', {
        canchaId: place.place.id,
        fechaHora: fechaHora,
        duracion: 60,
      });

      if (!disponibilidadData.success || !disponibilidadData.data.disponible) {
        throw new Error('El horario seleccionado ya no está disponible');
      }

      if (!user?.id) {
        console.error('Error: Usuario no encontrado en el contexto:', user);
        throw new Error('No se encontró el ID del usuario');
      }

      // Creamos la reserva
      const reservaData = {
        canchaId: place.place.id,
        userId: user.id,
        fechaHora: fechaHora,
        duracion: 60,
        precioTotal: place?.place?.requiereSeña ? montoSeña : totalAmount,
        metodoPago: paymentMethod,
        estadoPago: 'PENDIENTE',
        notasAdicionales: `Reserva para ${place.place.name}`
      };

      console.log('Datos de la reserva a crear:', reservaData);

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

  const handlePayment = async (place) => {
    try {
      switch (selectedPaymentMethod) {
        case "Mercado Pago": {
          const data = await handleIntegrationMP(place);
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

  useEffect(() => {
    const timeMoment = moment(selectedTime, "HH:mm");

    // Añade una hora
    const newTimeMoment = timeMoment.add(1, "hour");

    // Formatea el nuevo tiempo
    const newTime = newTimeMoment.format("HH:mm");
    setEndTime(newTime);
  }, [selectedTime]);

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
      <Text
        style={{
          color: Colors.PRIMARY,
          fontSize: 18,
          fontFamily: "montserrat-medium",
        }}
      >
        {place.place.name}
      </Text>
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
              <Ionicons
                name="calendar-outline"
                size={24}
                color={Colors.PRIMARY}
              />
            </View>
            <Text style={styles.scheduleText}>{formatDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeading}>Pago</Text>
        <View style={styles.billDetailsContainer}>
          <View style={styles.billRow}>
            <Text style={styles.billDetailText}>Costo de la cancha:</Text>
            <Text style={styles.billDetailAmount}>20000</Text>
          </View>
          {place?.place?.requiereSeña && (
            <View style={styles.billRow}>
              <Text style={styles.billDetailText}>Seña requerida:</Text>
              <Text style={styles.billDetailAmount}>$10000</Text>
            </View>
          )}
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total a pagar:</Text>
            <Text style={styles.totalAmount}>
              ${place?.place?.requiereSeña ? montoSeña : totalAmount}
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
          onPress={() => handlePayment(place)}
          disabled={loading}
          style={styles.reserveButton}
        >
          {!loading ? (
            <Text style={styles.reserveButtonText}>Reservar</Text>
          ) : (
            <ActivityIndicator />
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
  paymentForm: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  expirySecurityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expiryInput: {
    flex: 1,
    marginRight: 10,
  },
  securityInput: {
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
});
